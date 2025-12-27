import { loggerService } from './loggerService';

export class SpeechService {
  private recognition: any = null;
  private isSupported = false;

  constructor() {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      this.isSupported = true;
      loggerService.info('Speech recognition initialized', 'SpeechService', {
        lang: this.recognition.lang,
        continuous: this.recognition.continuous
      });
    } else {
      loggerService.warn('Speech recognition not supported in this browser', 'SpeechService');
    }
  }

  get isAvailable(): boolean {
    return this.isSupported;
  }

  async transcribeAudioBlob(_audioBlob: Blob): Promise<string> {
    if (!this.isSupported) {
      const error = new Error('Speech recognition not supported in this browser');
      loggerService.error('Speech recognition not supported', 'SpeechService', error);
      throw error;
    }

    // Convert blob to audio URL and play it, then use live recognition
    // Note: Web Speech API doesn't directly support file transcription
    // We'll need to use a workaround or alternative approach
    // For now, we'll use live recognition as a workaround
    
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        const error = new Error('Speech recognition not initialized');
        loggerService.error('Speech recognition not initialized', 'SpeechService', error);
        reject(error);
        return;
      }

      let finalTranscript = '';

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            loggerService.debug('Speech recognition result', 'SpeechService', {
              transcript,
              isFinal: event.results[i].isFinal
            });
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        const error = new Error(`Speech recognition error: ${event.error}`);
        loggerService.error('Speech recognition error', 'SpeechService', error, {
          errorType: event.error,
          errorMessage: event.message
        });
        reject(error);
      };

      this.recognition.onend = () => {
        loggerService.info('Speech recognition ended', 'SpeechService', {
          finalTranscript: finalTranscript.trim(),
          transcriptLength: finalTranscript.trim().length
        });
        resolve(finalTranscript.trim());
      };

      loggerService.info('Starting speech recognition (transcribeAudioBlob)', 'SpeechService', {
        lang: this.recognition.lang,
        continuous: this.recognition.continuous
      });
      // Start recognition
      this.recognition.start();
    });
  }

  // Alternative: Use live recognition (user speaks directly)
  async startLiveRecognition(): Promise<string> {
    if (!this.isSupported) {
      const error = new Error('Speech recognition not supported in this browser');
      loggerService.error('Speech recognition not supported', 'SpeechService', error);
      throw error;
    }

    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        const error = new Error('Speech recognition not initialized');
        loggerService.error('Speech recognition not initialized', 'SpeechService', error);
        reject(error);
        return;
      }

      let finalTranscript = '';

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            loggerService.debug('Speech recognition result', 'SpeechService', {
              transcript,
              isFinal: event.results[i].isFinal
            });
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        const error = new Error(`Speech recognition error: ${event.error}`);
        loggerService.error('Speech recognition error', 'SpeechService', error, {
          errorType: event.error,
          errorMessage: event.message
        });
        reject(error);
      };

      this.recognition.onend = () => {
        loggerService.info('Speech recognition ended', 'SpeechService', {
          finalTranscript: finalTranscript.trim(),
          transcriptLength: finalTranscript.trim().length
        });
        resolve(finalTranscript.trim());
      };

      loggerService.info('Starting speech recognition', 'SpeechService', {
        lang: this.recognition.lang,
        continuous: this.recognition.continuous
      });
      this.recognition.start();
    });
  }

  stopRecognition() {
    if (this.recognition) {
      loggerService.info('Stopping speech recognition', 'SpeechService');
      this.recognition.stop();
    }
  }
}

export const speechService = new SpeechService();

