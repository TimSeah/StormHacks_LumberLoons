"""
Mental Health Chatbot LLM
Uses thrishala/mental_health_chatbot for therapeutic responses
Emotion-aware text generation
"""

import time
import warnings
from typing import Dict, List, Optional
from transformers import pipeline
import torch
import logging

# Suppress transformers warnings
warnings.filterwarnings("ignore", category=UserWarning)
logging.getLogger("transformers").setLevel(logging.ERROR)


class TherapyLLM:
    """Mental health chatbot with emotion awareness"""

    def __init__(self):
        self.emotion_history: List[Dict] = []

        try:
            device = 0 if torch.cuda.is_available() else -1

            if device == 0:
                self.llm_pipe = pipeline(
                    "text-generation",
                    model="thrishala/mental_health_chatbot",
                    device=device,
                    torch_dtype=torch.float16,
                )
            else:
                self.llm_pipe = pipeline(
                    "text-generation",
                    model="thrishala/mental_health_chatbot",
                    device=device,
                )
        except Exception as e:
            self.llm_pipe = None

    def add_emotion_context(self, emotion_data: Dict) -> str:
        """Build emotion context string for LLM prompt"""
        if not emotion_data.get("face_detected", False):
            return ""

        emotion = emotion_data.get("emotion", "Neutral")
        confidence = emotion_data.get("confidence", 0.0)

        # Track emotion history
        self.emotion_history.append(emotion_data)
        if len(self.emotion_history) > 10:
            self.emotion_history.pop(0)

        # Generate context for high-confidence emotions
        if confidence > 0.7:
            return f"The patient appears to be feeling {emotion.lower()}. "

        return ""

    def generate_response(self, user_message: str, emotion_data: Dict) -> str:
        """Generate therapeutic response using LLM with emotion awareness"""

        if self.llm_pipe is None:
            return "LLM Unavailable"

        try:
            emotion_context = self.add_emotion_context(emotion_data)
            prompt = f"{emotion_context}Patient: {user_message}\nTherapist:"

            # Generate response with minimal parameters
            response = self.llm_pipe(
                prompt,
                max_new_tokens=50,
                do_sample=False,
                pad_token_id=self.llm_pipe.tokenizer.eos_token_id,
            )[0]["generated_text"]

            # Extract and clean therapist's response
            if "Therapist:" not in response:
                return "LLM Unavailable"

            # Get text after "Therapist:"
            therapist_response = response.split("Therapist:")[-1].strip()

            # Remove unwanted continuations and tokens
            stop_markers = ["Patient:", "\n\n", "[/INST]", "[INST]", "</s>", "<s>"]
            for marker in stop_markers:
                if marker in therapist_response:
                    therapist_response = therapist_response.split(marker)[0].strip()

            # Take first line only
            therapist_response = therapist_response.split("\n")[0].strip()

            # Take first 2 sentences
            sentences = [s.strip() for s in therapist_response.split(".") if s.strip()]
            clean_response = ". ".join(sentences[:2])

            if clean_response and not clean_response.endswith("."):
                clean_response += "."

            return clean_response if len(clean_response) > 10 else "LLM Unavailable"

        except Exception as e:
            return "LLM Unavailable"

    def get_emotion_summary(self) -> Dict:
        """Get session emotion statistics"""
        if not self.emotion_history:
            return {"total_readings": 0}

        emotion_counts = {}
        total_confidence = 0.0

        for entry in self.emotion_history:
            emotion = entry.get("emotion", "Unknown")
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
            total_confidence += entry.get("confidence", 0.0)

        most_common = max(emotion_counts, key=emotion_counts.get)
        avg_confidence = total_confidence / len(self.emotion_history)

        return {
            "total_readings": len(self.emotion_history),
            "emotion_distribution": emotion_counts,
            "most_common_emotion": most_common,
            "average_confidence": avg_confidence,
        }

    def clear_history(self):
        """Clear emotion history"""
        self.emotion_history.clear()


if __name__ == "__main__":
    pass
