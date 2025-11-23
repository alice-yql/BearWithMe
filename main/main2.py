"""
Bear With Me - Azure + ElevenLabs Phoneme Feedback
Captures audio from microphone, gets phoneme scores, and speaks feedback for low-scoring phonemes only.
Gives positive feedback if all phonemes are correct.
"""

import azure.cognitiveservices.speech as speechsdk
from elevenlabs import ElevenLabs
import tempfile
import os
import sys
import time
import socket
import threading
import http.server
import socketserver
from dotenv import load_dotenv
import pygame
try:
    import pychromecast
    from pychromecast.controllers.media import MediaController
    CHROMECAST_AVAILABLE = True
except ImportError:
    CHROMECAST_AVAILABLE = False

# Load environment variables from .env file
load_dotenv()

# --- CONFIG --- #
# Azure
AZURE_KEY = os.getenv('AZURE_KEY')
AZURE_REGION = os.getenv('AZURE_REGION', 'eastus')

# ElevenLabs
ELEVEN_API_KEY = os.getenv('ELEVEN_API_KEY')
VOICE_ID = os.getenv('VOICE_ID', 'EXAVITQu4vr4xnSDxMaL')
THRESHOLD = int(os.getenv('THRESHOLD', '80'))  # phoneme score threshold

# Google Home Mini
GOOGLE_HOME_NAME = os.getenv('GOOGLE_HOME_NAME', '')  # e.g., "Living Room Speaker" or leave empty to auto-discover
GOOGLE_HOME_IP = os.getenv('GOOGLE_HOME_IP', '')  # Optional: specify IP address directly

# Feedback prompts
PROMPTS = {
    "intro": "Let's practice the word {}.",
    "phoneme_practice": "Let's practice the sound {}.",
    "repeat_phoneme": "Can you say {}?",
    "success_phoneme": "Nice! Much better!",
    "all_correct": "Great job! You pronounced all the sounds correctly."
}

# --- SETUP --- #
eleven_client = ElevenLabs(api_key=ELEVEN_API_KEY)

# Global cast object to reuse connection
_cast = None


def get_google_home_cast():
    """Get or create a connection to the Google Home Mini."""
    global _cast
    
    if not CHROMECAST_AVAILABLE:
        return None
    
    if _cast is not None:
        try:
            # Check if still connected
            _cast.wait()
            return _cast
        except:
            # Connection lost, reset
            _cast = None
    
    try:
        if GOOGLE_HOME_IP:
            # Connect directly via IP
            print(f"🔗 Connecting to Google Home at {GOOGLE_HOME_IP}...")
            _cast = pychromecast.Chromecast(GOOGLE_HOME_IP)
        elif GOOGLE_HOME_NAME:
            # Find by name
            print(f"🔍 Searching for Google Home: {GOOGLE_HOME_NAME}...")
            chromecasts, browser = pychromecast.get_listed_chromecasts(friendly_names=[GOOGLE_HOME_NAME])
            if not chromecasts:
                raise Exception(f"Could not find Google Home named '{GOOGLE_HOME_NAME}'")
            _cast = chromecasts[0]
            browser.stop_discovery()
        else:
            # Auto-discover first available device
            print("🔍 Auto-discovering Google Home devices...")
            chromecasts, browser = pychromecast.get_listed_chromecasts()
            if not chromecasts:
                raise Exception("No Google Home devices found on network")
            _cast = chromecasts[0]
            browser.stop_discovery()
            print(f"✅ Found: {_cast.device.friendly_name}")
        
        # Wait for connection
        _cast.wait()
        print(f"✅ Connected to {_cast.device.friendly_name}")
        return _cast
    except Exception as e:
        print(f"❌ Error connecting to Google Home: {e}")
        return None


def speak(text):
    """Plays text via ElevenLabs TTS and casts to Google Home Mini if available."""
    audio_stream = eleven_client.text_to_speech.convert(
        voice_id=VOICE_ID,
        model_id="eleven_multilingual_v2",
        text=text
    )
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f:
        for chunk in audio_stream:
            f.write(chunk)
        temp_path = f.name
    
    # Try to cast to Google Home Mini first
    cast = get_google_home_cast()
    if cast:
        try:
            # Set up HTTP server to serve the audio file
            port = 8000
            for attempt in range(10):
                try:
                    test_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    test_socket.bind(('', port))
                    test_socket.close()
                    break
                except OSError:
                    port += 1
            else:
                raise Exception("Could not find an available port for HTTP server")
            
            # Get local IP address
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            try:
                s.connect(("8.8.8.8", 80))
                local_ip = s.getsockname()[0]
            except Exception:
                hostname = socket.gethostname()
                local_ip = socket.gethostbyname(hostname)
            finally:
                s.close()
            
            # Start HTTP server in a separate thread
            original_dir = os.getcwd()
            temp_dir = os.path.dirname(temp_path)
            filename = os.path.basename(temp_path)
            
            os.chdir(temp_dir)
            handler = http.server.SimpleHTTPRequestHandler
            httpd = socketserver.TCPServer(("", port), handler)
            server_thread = threading.Thread(target=httpd.serve_forever)
            server_thread.daemon = True
            server_thread.start()
            
            try:
                # Construct URL and cast
                file_url = f"http://{local_ip}:{port}/{filename}"
                print(f"🔊 Casting audio to Google Home...")
                
                media_controller = MediaController()
                cast.register_handler(media_controller)
                media_controller.play_media(file_url, "audio/mpeg")
                media_controller.block_until_active()
                
                # Wait for playback to complete
                while media_controller.is_playing:
                    time.sleep(0.1)
            finally:
                httpd.shutdown()
                os.chdir(original_dir)
                # Clean up temp file
                try:
                    os.unlink(temp_path)
                except:
                    pass
            return
        except Exception as e:
            print(f"⚠️  Error casting to Google Home: {e}")
            print("   Falling back to local playback...")
    
    # Fallback to local playback
    try:
        pygame.mixer.init()
        pygame.mixer.music.load(temp_path)
        pygame.mixer.music.play()
        # Wait for playback to finish
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)
    finally:
        # Clean up temp file
        try:
            os.unlink(temp_path)
        except:
            pass


def azure_phoneme_to_text(phoneme):
    """
    Convert Azure phonemes to lowercase, readable text for TTS.
    Handles most English phonemes and strips stress numbers.
    """
    # Remove stress numbers (e.g., AH0 -> ah)
    base_phoneme = ''.join([c for c in phoneme if not c.isdigit()]).lower()

    mapping = {
        # vowels and other consonants
        "aa": "ah", "ae": "a", "ah": "uh", "ax": "uh", "ao": "aw",
        "aw": "ow", "ay": "eye", "ch": "ch", "dh": "th",
        "eh": "eh", "er": "er", "ey": "ay", "f": "f",
        "g": "g", "hh": "h", "ih": "ih", "iy": "ee", "jh": "j",
        "k": "k", "l": "l", "m": "m", "n": "n", "ng": "ng",
        "ow": "oh", "oy": "oy", "p": "p", "r": "r", "s": "s",
        "sh": "sh", "t": "t", "th": "th", "uh": "oo", "uw": "oo",
        "v": "v", "w": "w", "y": "y", "z": "z", "zh": "zh", "axr": "er"
    }

    return mapping.get(base_phoneme, base_phoneme)


def assess_pronunciation_phonemes(target_word):
    """Uses Azure to assess phonemes and return a phoneme→score dictionary."""
    speech_config = speechsdk.SpeechConfig(subscription=AZURE_KEY, region=AZURE_REGION)
    speech_config.speech_recognition_language = "en-US"
    audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)

    pronunciation_config = speechsdk.PronunciationAssessmentConfig(
        reference_text=target_word,
        grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
        granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme,
        enable_miscue=True
    )

    recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    pronunciation_config.apply_to(recognizer)

    print(f"\n🎤 Say the word '{target_word}' now...")
    result = recognizer.recognize_once_async().get()

    if result.reason != speechsdk.ResultReason.RecognizedSpeech:
        print("❌ No speech recognized or recognition canceled.")
        return None

    pron_result = speechsdk.PronunciationAssessmentResult(result)
    phoneme_scores = {}
    if hasattr(pron_result, 'words') and pron_result.words:
        for word in pron_result.words:
            if hasattr(word, 'phonemes') and word.phonemes:
                for phoneme in word.phonemes:
                    phoneme_scores[phoneme.phoneme] = phoneme.accuracy_score
    return phoneme_scores


def give_phoneme_feedback(word, phoneme_scores):
    """Speaks feedback for low-scoring phonemes only.
    Gives positive feedback if all phonemes are above threshold.
    """


    low_scores = 0

    for phoneme, score in phoneme_scores.items():
        if score < THRESHOLD:
            low_scores += 1
            readable = azure_phoneme_to_text(phoneme)
            speak(PROMPTS["phoneme_practice"].format(readable))
            speak(readable)
            speak(PROMPTS["repeat_phoneme"].format(readable))
            speak(PROMPTS["success_phoneme"])

    if low_scores == 0:
        # All phonemes are above threshold
        speak(PROMPTS["all_correct"])


def main():
    target_word = "banana"
    phoneme_scores = assess_pronunciation_phonemes(target_word)

    if phoneme_scores:
        print("\n📊 Phoneme-level scores:")
        for ph, sc in phoneme_scores.items():
            print(f"{ph}: {sc:.1f}%")
        give_phoneme_feedback(target_word, phoneme_scores)
    else:
        print("❌ Could not assess pronunciation.")


if __name__ == "__main__":
    main()
