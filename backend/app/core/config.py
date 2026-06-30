from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Setting (BaseSettings):
       """Application settings, loaded from environment / .env. """
       
       
model_config = SettingsConfigDict (
        env_file=".env", 
        env_file_encoding="utf-8"
        case_sensitive=False,
        extra="ignore",
        )
    
    
    # n8n webhook
    
    n8n_webhook_base_url: str = Field(
        
        
        
        
        
    )
    
    
    
    
    
        
    
    
    