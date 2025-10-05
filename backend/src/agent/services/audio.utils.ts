/**
 * Audio Utilities
 * Handles audio format conversion and processing
 */

import { Readable } from 'stream';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

/**
 * Convert MP3/WAV stream to PCM (raw audio)
 * LiveKit expects 16-bit PCM audio
 */
export class AudioConverter {
  /**
   * Convert audio stream (MP3/WAV) to PCM using ffmpeg
   * @param inputStream - Input audio stream
   * @param sampleRate - Desired sample rate (default 48000 for LiveKit)
   * @param channels - Number of channels (1 = mono, 2 = stereo)
   * @returns PCM audio stream
   */
  static convertToPCM(
    inputStream: Readable,
    sampleRate: number = 48000,
    channels: number = 1
  ): Readable {
    // Use ffmpeg to convert audio to PCM
    const ffmpeg: ChildProcessWithoutNullStreams = spawn('ffmpeg', [
      '-i', 'pipe:0',           // Input from stdin
      '-f', 's16le',            // Output format: signed 16-bit little-endian
      '-ar', String(sampleRate), // Sample rate
      '-ac', String(channels),   // Number of channels
      'pipe:1',                 // Output to stdout
    ]);

    // Pipe input stream to ffmpeg stdin
    inputStream.pipe(ffmpeg.stdin);

    // Handle errors
    ffmpeg.stderr.on('data', (data) => {
      console.error('FFmpeg error:', data.toString());
    });

    ffmpeg.on('error', (error) => {
      console.error('FFmpeg process error:', error);
    });

    // Return stdout as readable stream
    return ffmpeg.stdout;
  }

  /**
   * Convert buffer to PCM
   * @param buffer - Audio buffer (MP3/WAV)
   * @param sampleRate - Desired sample rate
   * @param channels - Number of channels
   * @returns Promise<Buffer> PCM buffer
   */
  static async convertBufferToPCM(
    buffer: Buffer,
    sampleRate: number = 48000,
    channels: number = 1
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      const ffmpeg = spawn('ffmpeg', [
        '-i', 'pipe:0',
        '-f', 's16le',
        '-ar', String(sampleRate),
        '-ac', String(channels),
        'pipe:1',
      ]);

      ffmpeg.stdout.on('data', (chunk) => {
        chunks.push(chunk);
      });

      ffmpeg.stdout.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      ffmpeg.on('error', (error) => {
        reject(error);
      });

      ffmpeg.stderr.on('data', (data) => {
        // Suppress ffmpeg logs unless there's an error
        const msg = data.toString();
        if (msg.includes('error') || msg.includes('Error')) {
          console.error('FFmpeg:', msg);
        }
      });

      // Write buffer to ffmpeg stdin
      ffmpeg.stdin.write(buffer);
      ffmpeg.stdin.end();
    });
  }

  /**
   * Create audio frames from PCM buffer
   * @param pcmBuffer - PCM audio buffer
   * @param sampleRate - Sample rate
   * @param frameSize - Frame size in samples (typically 960 for 20ms at 48kHz)
   * @returns Array of audio frame buffers
   */
  static createFrames(
    pcmBuffer: Buffer,
    sampleRate: number = 48000,
    frameSize: number = 960
  ): Buffer[] {
    const frames: Buffer[] = [];
    const bytesPerSample = 2; // 16-bit = 2 bytes
    const bytesPerFrame = frameSize * bytesPerSample;

    for (let i = 0; i < pcmBuffer.length; i += bytesPerFrame) {
      const frame = pcmBuffer.slice(i, i + bytesPerFrame);
      if (frame.length === bytesPerFrame) {
        frames.push(frame);
      }
    }

    return frames;
  }

  /**
   * Resample audio to target sample rate
   * @param pcmBuffer - Input PCM buffer
   * @param fromRate - Source sample rate
   * @param toRate - Target sample rate
   * @returns Promise<Buffer> Resampled PCM buffer
   */
  static async resample(
    pcmBuffer: Buffer,
    fromRate: number,
    toRate: number
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      const ffmpeg = spawn('ffmpeg', [
        '-f', 's16le',
        '-ar', String(fromRate),
        '-ac', '1',
        '-i', 'pipe:0',
        '-f', 's16le',
        '-ar', String(toRate),
        '-ac', '1',
        'pipe:1',
      ]);

      ffmpeg.stdout.on('data', (chunk) => {
        chunks.push(chunk);
      });

      ffmpeg.stdout.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      ffmpeg.on('error', reject);

      ffmpeg.stdin.write(pcmBuffer);
      ffmpeg.stdin.end();
    });
  }
}

/**
 * Audio stream buffer
 * Helps manage streaming audio data
 */
export class AudioBuffer {
  private chunks: Buffer[] = [];
  private maxChunks: number;

  constructor(maxChunks: number = 100) {
    this.maxChunks = maxChunks;
  }

  /**
   * Add audio chunk to buffer
   */
  push(chunk: Buffer): void {
    this.chunks.push(chunk);
    if (this.chunks.length > this.maxChunks) {
      this.chunks.shift(); // Remove oldest chunk
    }
  }

  /**
   * Get all buffered audio as single buffer
   */
  getBuffer(): Buffer {
    return Buffer.concat(this.chunks);
  }

  /**
   * Clear buffer
   */
  clear(): void {
    this.chunks = [];
  }

  /**
   * Get buffer size in bytes
   */
  size(): number {
    return this.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  }
}
