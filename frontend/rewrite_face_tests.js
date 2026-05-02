const fs = require('fs');

const header = `import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FaceVerificationModal } from './FaceVerificationModal';
import * as faceapi from 'face-api.js';
import '@testing-library/jest-dom';

// Proper Mocking of face-api.js
jest.mock('face-api.js', () => ({
  detectSingleFace: jest.fn().mockReturnThis(),
  withFaceLandmarks: jest.fn().mockReturnThis(),
  withFaceDescriptor: jest.fn().mockResolvedValue({ descriptor: new Float32Array([0.1]) }),
  euclideanDistance: jest.fn(),
  nets: {
    tinyFaceDetector: { loadFromUri: jest.fn().mockResolvedValue(true) },
    ssdMobilenetv1: { loadFromUri: jest.fn().mockResolvedValue(true) },
    faceLandmark68Net: { loadFromUri: jest.fn().mockResolvedValue(true) },
    faceRecognitionNet: { loadFromUri: jest.fn().mockResolvedValue(true) },
  },
  SsdMobilenetv1Options: jest.fn(),
}));

jest.mock('@/stores/auth', () => ({
  useAuth: () => ({
    user: { imageUrl: 'https://example.com/profile.jpg' }
  }),
}));

jest.mock('@/hooks/useFaceApi', () => ({
  useFaceApi: () => ({
    modelsLoaded: true
  }),
}));

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
    }),
  },
  writable: true,
});

describe('FaceVerificationModal - Student Face Authentication Flow', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  
  let originalImage: any;

  beforeAll(() => {
    originalImage = global.Image;
    global.Image = class {
      onload: any;
      onerror: any;
      crossOrigin: string = '';
      src: string = '';
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 10);
      }
    } as any;
    window.Image = global.Image;
  });

  afterAll(() => {
    global.Image = originalImage;
    window.Image = originalImage;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

`;

let content = header;

// Generate 20 pass tests
for (let i = 1; i <= 20; i++) {
  const numStr = i.toString().padStart(3, '0');
  const dist = (0.10 + (i - 1) * 0.02).toFixed(2);
  content += `  // TC_FaceAuth_Pass_${numStr}
  it('TC_FaceAuth_Pass_${numStr}', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(${dist});
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

`;
}

// Generate 10 fail tests
for (let i = 1; i <= 10; i++) {
  const numStr = i.toString().padStart(3, '0');
  const dist = (0.60 + (i - 1) * 0.05).toFixed(2);
  content += `  // TC_FaceAuth_Fail_${numStr}
  it('TC_FaceAuth_Fail_${numStr}', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(${dist});
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument(), { timeout: 3000 });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

`;
}

content += `});\n`;

fs.writeFileSync('/home/hoanganh12/Downloads/SQA/sqa-test/frontend/src/components/organisms/FaceVerificationModal/FaceVerificationModal.spec.tsx', content);
