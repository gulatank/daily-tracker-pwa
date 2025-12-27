import { loggerService } from './loggerService';

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
      loggerService.info('Microphone permission granted', 'RecordingService');
      return true;
    } catch (error: any) {
      loggerService.error('Microphone permission denied', 'RecordingService', error as Error, {
        errorName: error.name,
        errorMessage: error.message
      });
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
      const error = new Error('Already recording');
      loggerService.warn('Attempted to start recording while already recording', 'RecordingService', error);
      throw error;
    }

    if (!this.hasPermissionState) {
      const granted = await this.requestPermission();
      if (!granted) {
        const error = new Error('Microphone permission denied');
        loggerService.error('Cannot start recording: permission denied', 'RecordingService', error);
        throw error;
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

      loggerService.debug('Starting recording', 'RecordingService', {
        mimeType,
        supportedTypes: {
          webm: MediaRecorder.isTypeSupported('audio/webm'),
          mp4: MediaRecorder.isTypeSupported('audio/mp4'),
          ogg: MediaRecorder.isTypeSupported('audio/ogg')
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mimeType
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          loggerService.debug('Audio chunk received', 'RecordingService', {
            chunkSize: event.data.size,
            totalChunks: this.audioChunks.length
          });
        }
      };

      this.mediaRecorder.onerror = (event: any) => {
        loggerService.error('MediaRecorder error', 'RecordingService', new Error(event.error || 'Unknown error'), {
          error: event.error
        });
      };

      this.mediaRecorder.start();
      this.isRecordingState = true;
      loggerService.info('Recording started successfully', 'RecordingService', {
        mimeType
      });
    } catch (error: any) {
      this.isRecordingState = false;
      loggerService.error('Failed to start recording', 'RecordingService', error as Error, {
        errorName: error.name,
        errorMessage: error.message,
        hasPermission: this.hasPermissionState
      });
      throw error;
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecordingState) {
        const error = new Error('Not recording');
        loggerService.warn('Attempted to stop recording when not recording', 'RecordingService', error);
        reject(error);
        return;
      }

      const mimeType = this.mediaRecorder.mimeType || 'audio/webm';

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        loggerService.info('Recording stopped', 'RecordingService', {
          blobSize: audioBlob.size,
          mimeType,
          chunksCount: this.audioChunks.length
        });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (event: any) => {
        const error = new Error('Recording error');
        loggerService.error('Recording error occurred', 'RecordingService', error, {
          error: event.error || 'Unknown error'
        });
        this.cleanup();
        reject(error);
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

