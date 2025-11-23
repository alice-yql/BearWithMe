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
from dotenv import load_dotenv
import pygame

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

# Feedback prompts
PROMPTS = {
    "intro": "Let's practice the word {}.",
    "phoneme_practice": "Let's practice the sound {}.",
    "repeat_phoneme": "That's not quite right, can you say ",
    "success_phoneme": "Nice! Much better!",
    "all_correct": "Great job! You pronounced all the sounds correctly."
}

# --- SETUP --- #
eleven_client = ElevenLabs(api_key=ELEVEN_API_KEY)


def speak(text):
    """Plays text via ElevenLabs TTS."""
    audio_stream = eleven_client.text_to_speech.convert(
        voice_id=VOICE_ID,
        model_id="eleven_multilingual_v2",
        text=text
    )
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as f:
        for chunk in audio_stream:
            f.write(chunk)
        temp_path = f.name
    
    # Play audio directly without opening a window
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
    Convert Azure phonemes to TTS-friendly text.
    Handles vowels, consonants, and extended single letters (a-z).
    Strips stress numbers.
    """
    # Remove stress numbers (AH0 -> AH)
    base = ''.join([c for c in phoneme if not c.isdigit()]).lower()

    # Standard phoneme mapping
    mapping = {
        "aa": "ah","ae": "uh","ah": "uh","ax": "uh","ao": "aw",
        "aw": "ow","ay": "eye","b": "b","ch": "ch","d": "d",
        "dh": "th","eh": "eh","er": "er","ey": "ay","f": "f",
        "g": "g","hh": "h","ih": "ih","iy": "ee","jh": "j",
        "k": "k","l": "l","m": "m","n": "n","ng": "ng",
        "ow": "oh","oy": "oy","p": "p","r": "r","s": "s",
        "sh": "sh","t": "t","th": "th","uh": "oo","uw": "oo",
        "v": "v","w": "w","y": "y","z": "z","zh": "zh","axr": "er"
    }

    # Extended single-letter mapping (for TTS)
    single_letter_mapping = {
        "a": "ay", "b": "buh", "c": "cuh", "d": "duh", "e": "ee",
        "f": "fuh", "g": "guh", "h": "heh", "i": "eye", "j": "juh",
        "k": "kuh", "l": "luh", "m": "muh", "n": "nuh", "o": "oh",
        "p": "puh", "q": "koo", "r": "ruh", "s": "suh", "t": "tuh",
        "u": "oo", "v": "vuh", "w": "wuh", "x": "ex", "y": "yuh", "z": "zuh"
    }

    # First try standard mapping
    text = mapping.get(base, base)

    # If the result is a single letter, use extended TTS mapping
    if len(text) == 1 and text in single_letter_mapping:
        text = single_letter_mapping[text]

    return text


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
    global i
    recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
    pronunciation_config.apply_to(recognizer)

    speak(f"Please say the word {target_word} now.")

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
            speak(PROMPTS["repeat_phoneme"])
            time.sleep(0.2)
            speak(readable)
            time.sleep(0.5)
            speak(PROMPTS["success_phoneme"])

    if low_scores == 0:
        # All phonemes are above threshold
        speak(PROMPTS["all_correct"])


def main():

    target_word = "apple"

    while True:
        phoneme_scores = assess_pronunciation_phonemes(target_word)

        if not phoneme_scores:

            print("❌ Incorrect pronunciation, let's try again.")
            continue

        print("\n📊 Phoneme-level scores:")
        for ph, sc in phoneme_scores.items():
            print(f"{ph}: {sc:.1f}%")

        give_phoneme_feedback(target_word, phoneme_scores)

        # If everything was correct, break the loop
        if all(score >= THRESHOLD for score in phoneme_scores.values()):
            break



if __name__ == "__main__":
    main()