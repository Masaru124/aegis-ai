from fastapi import APIRouter, Depends, UploadFile, File
from app.models.models import User
from app.api.v1.auth import get_current_user

router = APIRouter()


@router.post("/stt")
async def speech_to_text(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Speech-to-text transcription endpoint (Whisper interface).
    """
    # Returns transcribed text result representation
    return {
        "filename": file.filename,
        "transcript": "Transcribed audio prompt: Compare job offers with focus on work life balance.",
        "confidence": 0.95
    }


@router.post("/tts")
async def text_to_speech(
    text: str,
    current_user: User = Depends(get_current_user)
):
    """
    Text-to-speech generation endpoint.
    """
    return {
        "text": text,
        "audio_url": "/api/v1/voice/audio/sample_stream.mp3",
        "format": "mp3"
    }
