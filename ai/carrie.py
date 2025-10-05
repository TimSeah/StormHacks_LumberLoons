"""
Carrie - Emotion-Aware Therapy Agent
Main application integrating all components
"""

import asyncio
import socketio
import requests
from datetime import datetime
from llm_therapist import TherapyLLM
from tts_client import TextToSpeech

sio = socketio.AsyncClient()

llm = TherapyLLM()
tts = TextToSpeech()

latest_emotion = {
    "emotion": "Neutral",
    "confidence": 0.0,
    "timestamp": 0,
    "face_detected": False,
}


@sio.on("emotion_update")
async def on_emotion_update(data):
    global latest_emotion
    latest_emotion = data


@sio.on("connect")
async def on_connect():
    pass


@sio.on("disconnect")
async def on_disconnect():
    pass


def check_emotion_api():
    """Check if emotion detection API is running"""
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=2)
        return response.status_code == 200
    except:
        return False


async def conversation_loop(use_tts: bool = False):
    print("\nDR. CARRIE - THERAPY SESSION")
    print("Commands: 'summary' | 'quit' | 'exit'\n")

    greeting = "Hi, I'm Dr. Carrie. How are you feeling today?"
    print(f"Carrie: {greeting}\n")

    if use_tts and tts.client:
        tts.speak(greeting)

    conversation_active = True

    while conversation_active:
        try:
            # Get user input
            user_input = input("You: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ["quit", "exit", "bye", "goodbye"]:
                farewell = "Take care of yourself. Remember, I'm here whenever you need to talk."
                print(f"\nCarrie: {farewell}\n")

                if use_tts and tts.client:
                    tts.speak(farewell)

                summary = llm.get_emotion_summary()
                if summary.get("total_readings", 0) > 0:
                    print("\nSession Summary:")
                    print(f"  Duration: {summary['total_readings'] * 0.5:.1f} seconds")
                    print(f"  Most common: {summary.get('most_common_emotion', 'N/A')}")
                    print(
                        f"  Avg confidence: {summary.get('average_confidence', 0):.0%}\n"
                    )

                conversation_active = False
                break

            elif user_input.lower() == "summary":
                summary = llm.get_emotion_summary()
                print("\nEmotion Analysis:")
                print(f"  Total readings: {summary.get('total_readings', 0)}")
                print(f"  Most common: {summary.get('most_common_emotion', 'N/A')}")
                print(f"  Avg confidence: {summary.get('average_confidence', 0):.0%}\n")
                continue

            response = llm.generate_response(user_input, latest_emotion)
            print(f"\nCarrie: {response}\n")

            await asyncio.sleep(0.1)

        except KeyboardInterrupt:
            conversation_active = False
            break
        except Exception as e:
            continue

    llm.clear_history()


async def main():
    emotion_api_running = check_emotion_api()

    if not emotion_api_running:
        print("⚠ Emotion detection API not running")
        print("Start it: python emotion_detector.py\n")
        response = input("Continue without emotion detection? (y/n): ")
        if response.lower() != "y":
            return
    else:
        try:
            await sio.connect("http://localhost:5000")
        except Exception as e:
            pass

    use_tts = False
    if tts.client:
        tts_response = input("Enable voice output? (y/n): ")
        use_tts = tts_response.lower() == "y"

    try:
        await conversation_loop(use_tts=use_tts)
    finally:
        if sio.connected:
            await sio.disconnect()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(f"Error: {e}")
