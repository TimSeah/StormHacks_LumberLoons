"""
ElevenLabs Text-to-Speech Client
Converts therapeutic text responses to speech audio
"""

import os
from dotenv import load_dotenv
from elevenlabs import stream
from elevenlabs.client import ElevenLabs


class TextToSpeech:
    """ElevenLabs TTS wrapper for therapeutic responses"""

    def __init__(self, api_key: str = None, voice_id: str = None):
        """
        Initialize TTS client

        Args:
            api_key: ElevenLabs API key (optional, reads from .env)
            voice_id: Voice ID to use (optional, defaults to warm female voice)
        """
        load_dotenv()

        self.api_key = api_key or os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = voice_id or "WAhoMTNdLdMoq1j3wf3I"
        self.model_id = "eleven_multilingual_v2"

        if not self.api_key:
            self.client = None
        else:
            try:
                self.client = ElevenLabs(api_key=self.api_key)
            except Exception as e:
                self.client = None

    def speak(self, text: str, stream_audio: bool = True) -> bool:
        """
        Convert text to speech and play it

        Args:
            text: Text to convert to speech
            stream_audio: Whether to stream audio (True) or return bytes (False)

        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            return False

        try:
            audio_stream = self.client.text_to_speech.stream(
                text=text,
                voice_id=self.voice_id,
                model_id=self.model_id,
            )

            if stream_audio:
                stream(audio_stream)
            else:
                audio_bytes = b"".join(
                    chunk for chunk in audio_stream if isinstance(chunk, bytes)
                )
                return audio_bytes

            return True

        except Exception as e:
            return False

    def set_voice(self, voice_id: str):
        """Change the voice ID"""
        self.voice_id = voice_id

    def list_voices(self):
        """List available voices"""
        if not self.client:
            return []
        try:
            voices = self.client.voices.get_all()
            return voices.voices
        except Exception as e:
            return []


if __name__ == "__main__":
    pass
