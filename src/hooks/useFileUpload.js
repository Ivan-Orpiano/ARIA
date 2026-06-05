import { useCallback, useRef } from "react";
import { useChatContext } from "../context/ChatContext";
import { validateFiles } from "../utils/fileUtils";



export function useFileUpload() {
    const { files, addFiles, removeFile, clearFiles, setError} = useChatContext();

    const fileInputRef=useRef(null);

    const handleAddFiles = useCallback((fileList) => {
        if(!fileList || fileList.length === 0) return;

        const {valid, error} = validateFiles (fileList, files);

        if(errors.length > 0) {
            setError(errors.join(' · '));
        }

        if(valid.length > 0) {
            addFiles(valid);
        }
    }, [files, addFiles, setError]);

    const openPicker = useCallback(() => {
        fileInputRef.current?.click();
    }, []);


    return {
        files, 
        fileInputRef,
        addFiles: handleAddFiles,
        removeFile,
        clearFiles,
        openPicker,
    };
}