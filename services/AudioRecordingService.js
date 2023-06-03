// import RecordRTC from 'recordrtc';
import QLogger from '~/services/QLogger';
import { isClient } from '~/utils/EnvUtils';

let RecordRTC = null;

export async function setup() {
  if (isClient()) {
    const RecordRTCImport = await import('recordrtc');
    RecordRTC = RecordRTCImport.default;
  }
}

function NewAudioRecordingService() {
  this.recorder = null;
  this.stream = null;

  this.startRecording = async () => {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    if (RecordRTC !== null) {
      this.recorder = new RecordRTC(this.stream, {
        type: 'audio',
        mimeType: 'audio/webm',
        recorderType: RecordRTC.StereoAudioRecorder,
        audioBitsPerSecond: 32000,
        numberOfAudioChannels: 1,
        sampleRate: 48000,
      });
      await this.recorder.startRecording();
    } else {
      QLogger.log('Recordrtc instance not available');
    }
  };

  this.stopRecording = (cb) => {
    if (typeof this.stream.stop === 'function') {
      this.stream.stop();
    }
    this.recorder.stopRecording(() => {
      const blob = this.recorder.getBlob();
      if (cb) {
        cb(blob);
      }
      this.recorder = null;
      this.stream = null;
    });
  };

  this.tryToDetectMicrophone = async () => {
    await this.startRecording();
    this.stopRecording();
  };
}

export default NewAudioRecordingService;
