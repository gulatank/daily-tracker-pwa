export class RecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecordingState = false;
  private hasPermissionState = false;

  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, we'll get a new stream when recording
      this.hasPermissionState = true;
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      this.hasPermissionState = false;
      return false;
    }
  }

  get isRecording(): boolean {
    return this.isRecordingState;
  }

  get hasPermission(): boolean {
    return this.hasPermissionState;
  }

  async startRecording(): Promise<void> {
    if (this.isRecordingState) {
      throw new Error('Already recording');
    }

    if (!this.hasPermissionState) {
      const granted = await this.requestPermission();
      if (!granted) {
        throw new Error('Microphone permission denied');
      }
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];

      // Determine MIME type based on browser support
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/ogg';
        }
      }

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mimeType
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecordingState = true;
    } catch (error) {
      this.isRecordingState = false;
      throw error;
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecordingState) {
        reject(new Error('Not recording'));
        return;
      }

      const mimeType = this.mediaRecorder.mimeType || 'audio/webm';

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = () => {
        this.cleanup();
        reject(new Error('Recording error'));
      };

      this.mediaRecorder.stop();
      this.isRecordingState = false;
    });
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}

export const recordingService = new RecordingService();

