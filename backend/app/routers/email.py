import logging 

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.model.schemas import EmailTriggerRequest, EmailTriggerResponse
from app.services.n8n_client import N8nClient, N8nError

logger = logging.getLogger("ai_secretary.email")

router = APIRouter(prefix="/api/email", tags=["Email"])

def get_n8n_client(request: Request) -> N8nClient:
    return request.app.state.n8n_client

@router.post("/trigger", 
    response_model=EmailTriggerResponse, status_code = status.HTTP_202_ACCEPTED,
    summary = "Trigger an n8n email workflow for the given recipient.",
    )

async def trigger_email(
    body: EmailTriggerRequest,
    n8n: N8nClient = Depends(get_n8n_client),
) -> EmailTriggerResponse:
    payload = body.to_n8n_payload()
    
    
   
    try:
        n8n_response = await n8n.trigger(body.workflow, payload)
    except N8nError as exc:
            # Map upstream failures to a 502 — the request was valid, but the
            # downstream automation failed. Detail is safe, body is structured.
            logger.error("Email trigger failed: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail={
                    "message": str(exc),
                    "upstream_status": exc.status_code,
                    "upstream_body": exc.body,
                },
            ) from exc
    
    return EmailTriggerResponse(
            status="accepted",
            workflow=body.workflow,
            detail=f"Email workflow triggered for {body.recipient}.",
            n8n_response=n8n_response,
        )