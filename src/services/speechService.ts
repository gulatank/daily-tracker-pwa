import { loggerService } from './loggerService';

export class SpeechService {
  private recognition: any = null;
  private isSupported = false;
  private currentRecognition: any = null;

  constructor() {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.isSupported = true;
      loggerService.info('Speech recognition supported', 'SpeechService');
    } else {
      loggerService.warn('Speech recognition not supported in this browser', 'SpeechService');
    }
  }

  get isAvailable(): boolean {
    return this.isSupported;
  }

  private createRecognitionInstance() {
    const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;  // Keep listening until manually stopped
    recognition.interimResults = true;  // Enable real-time partial results
    recognition.lang = 'en-US';
    
    return recognition;
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
  async startLiveRecognition(onInterimResult?: (text: string) => void): Promise<string> {
    if (!this.isSupported) {
      const error = new Error('Speech recognition not supported in this browser');
      loggerService.error('Speech recognition not supported', 'SpeechService', error);
      throw error;
    }

    // Stop any existing recognition
    if (this.currentRecognition) {
      try {
        this.currentRecognition.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
    }

    // Create new recognition instance for this session
    const recognition = this.createRecognitionInstance();
    if (!recognition) {
      const error = new Error('Speech recognition not initialized');
      loggerService.error('Speech recognition not initialized', 'SpeechService', error);
      throw error;
    }

    this.currentRecognition = recognition;

    return new Promise((resolve, reject) => {
      let finalTranscript = '';
      let hasReceivedResults = false;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let newFinalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinalTranscript += transcript + ' ';
            finalTranscript += transcript + ' ';
            hasReceivedResults = true;
            loggerService.debug('Speech recognition final result', 'SpeechService', {
              transcript,
              isFinal: true
            });
          } else {
            interimTranscript += transcript;
            hasReceivedResults = true;
            loggerService.debug('Speech recognition interim result', 'SpeechService', {
              transcript,
              isFinal: false
            });
          }
        }

        // Combine final and interim for real-time display
        const combinedText = (finalTranscript + interimTranscript).trim();
        
        // Call callback immediately with real-time text
        if (onInterimResult) {
          onInterimResult(combinedText);
        }
      };

      recognition.onerror = (event: any) => {
        const errorType = event.error;
        
        // Handle "aborted" and "no-speech" errors gracefully
        if (errorType === 'aborted') {
          if (hasReceivedResults && finalTranscript.trim()) {
            // We have results, resolve with them
            loggerService.info('Speech recognition aborted but has results', 'SpeechService', {
              finalTranscript: finalTranscript.trim()
            });
            resolve(finalTranscript.trim());
          } else {
            // No speech detected, resolve with empty string (not an error)
            loggerService.warn('Speech recognition aborted - no speech detected', 'SpeechService');
            resolve('');
          }
        } else if (errorType === 'no-speech') {
          // No speech detected, resolve with empty string
          loggerService.warn('No speech detected', 'SpeechService');
          resolve('');
        } else if (errorType === 'audio-capture' || errorType === 'network') {
          // Real errors
          const error = new Error(`Speech recognition error: ${errorType}`);
          loggerService.error('Speech recognition error', 'SpeechService', error, {
            errorType: errorType,
            errorMessage: event.message
          });
          reject(error);
        } else {
          // Other errors - log but try to resolve with what we have
          loggerService.warn('Speech recognition error (non-fatal)', 'SpeechService', undefined, {
            errorType: errorType,
            hasResults: hasReceivedResults,
            finalTranscript: finalTranscript.trim()
          });
          if (hasReceivedResults && finalTranscript.trim()) {
            resolve(finalTranscript.trim());
          } else {
            resolve('');
          }
        }
      };

      recognition.onend = () => {
        loggerService.info('Speech recognition ended', 'SpeechService', {
          finalTranscript: finalTranscript.trim(),
          transcriptLength: finalTranscript.trim().length,
          hasReceivedResults
        });
        
        // Clear current recognition instance
        if (this.currentRecognition === recognition) {
          this.currentRecognition = null;
        }
        
        resolve(finalTranscript.trim());
      };

      loggerService.info('Starting speech recognition', 'SpeechService', {
        lang: recognition.lang,
        continuous: recognition.continuous,
        interimResults: recognition.interimResults
      });
      
      try {
        recognition.start();
      } catch (error: any) {
        loggerService.error('Failed to start recognition', 'SpeechService', error as Error);
        this.currentRecognition = null;
        reject(error);
      }
    });
  }

  stopRecognition() {
    if (this.currentRecognition) {
      loggerService.info('Stopping speech recognition', 'SpeechService');
      try {
        this.currentRecognition.stop();
      } catch (e) {
        // Ignore errors when stopping
        loggerService.debug('Error stopping recognition (ignored)', 'SpeechService');
      }
      this.currentRecognition = null;
    }
  }
}

export const speechService = new SpeechService();

