"""
Bear With Me - Interactive Phoneme Practice
Captures audio, gives phoneme feedback, practices low-scoring syllables,
prompts user to repeat word, and loops until the word is correct.
"""

import azure.cognitiveservices.speech as speechsdk
from elevenlabs import ElevenLabs
import tempfile
import os
import time
import sys
from dotenv import load_dotenv
import pygame

THRESHOLD = 80  # Phoneme accuracy threshold
# Load .env file
load_dotenv()

# Azure
AZURE_KEY = os.getenv("AZURE_KEY")
AZURE_REGION = os.getenv("AZURE_REGION")

# ElevenLabs
ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")
VOICE_ID = os.getenv("VOICE_ID")

print("Azure key:", AZURE_KEY)

# Feedback prompts
PROMPTS = {
    "intro": "Let's practice the word {}.",
    "phoneme_practice": "Let's practice the sound {}.",
    "repeat_phoneme": "Your turn: {}",
    "whole_word": "Now try saying the whole word: {}",
    "success_phoneme": "Nice! Much better!",
    "all_correct": "Great job! You pronounced the word correctly!"
}

# Setup ElevenLabs client
eleven_client = ElevenLabs(api_key=ELEVEN_API_KEY)


def speak(text):
    """Speaks text using ElevenLabs TTS."""
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
        "f": "fuh", "g": "guh", "h": "huh", "i": "eye", "j": "juh",
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
    """Use Azure to get phoneme scores."""
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

    result = recognizer.recognize_once_async().get()
    if result.reason != speechsdk.ResultReason.RecognizedSpeech:
        print("❌ No speech recognized.")
        return None

    pron_result = speechsdk.PronunciationAssessmentResult(result)
    phoneme_scores = {}
    if hasattr(pron_result, 'words') and pron_result.words:
        for word in pron_result.words:
            if hasattr(word, 'phonemes') and word.phonemes:
                for phoneme in word.phonemes:
                    phoneme_scores[phoneme.phoneme] = phoneme.accuracy_score
    return phoneme_scores

def practice_word(target_word):
    """Main loop: practice low-scoring syllables, then whole word, repeat until correct."""
    while True:
        phoneme_scores = assess_pronunciation_phonemes(target_word)
        if not phoneme_scores:
            print("❌ Could not assess pronunciation.")
            continue

        print("\n📊 Phoneme-level scores:")
        for ph, sc in phoneme_scores.items():
            print(f"{ph}: {sc:.1f}%")

        # Identify low-scoring phonemes
        low_scores = {ph: sc for ph, sc in phoneme_scores.items() if sc < THRESHOLD}

        if not low_scores:
            speak(PROMPTS["all_correct"])
            break  # Word pronounced correctly

        # Practice low-scoring phonemes
        for ph in low_scores:
            readable = azure_phoneme_to_text(ph)
            speak(PROMPTS["phoneme_practice"].format(readable))
            speak(PROMPTS["repeat_phoneme"].format(readable))
            time.sleep(0.5)  # Give user time to repeat
            speak(PROMPTS["success_phoneme"])

        # Practice whole word
        speak(PROMPTS["whole_word"].format(target_word))
        time.sleep(1)  # Give user time to say the word

# --- RUN ---
if __name__ == "__main__":
    load_dotenv()
    target_word = "hello"
    speak(PROMPTS["intro"].format(target_word))
    practice_word(target_word)
