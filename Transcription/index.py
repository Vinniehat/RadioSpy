import socketio
from faster_whisper import WhisperModel
from colorama import Fore, Style

# Connect to Node server
sio = socketio.Client()

# Instantiate WhisperModel once
model = WhisperModel("small.en", device="cpu", compute_type="int8")

def transcribe_file(file_path):
    """Transcribe a single audio file and return the transcription as a string."""
    try:
        segments, _ = model.transcribe(file_path)
        transcription = "\n".join(
            f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text.strip()}"
            for segment in segments
        )
        return transcription
    except Exception as e:
        print(Fore.RED + f"Error transcribing {file_path}: {e}" + Style.RESET_ALL)
        return None

@sio.event
def connect():
    print("Connected to Node server")

@sio.on("request-transcription")
def handle_transcription(data):
    print(Fore.GREEN + f"Received transcription request for {data['filename']}" + Style.RESET_ALL)
    file_path = f"{data['folderPath']}\\{data['filename']}"
    transcription_text = transcribe_file(file_path)
    if transcription_text:
        sio.emit("transcription-complete", {
            "recording_id": data["recording_id"],
            "transcription": transcription_text
        })
        print(Fore.BLUE + f"Transcription sent for {data['filename']}" + Style.RESET_ALL)

# Connect to Node server
sio.connect("http://localhost:3000")
sio.wait()
