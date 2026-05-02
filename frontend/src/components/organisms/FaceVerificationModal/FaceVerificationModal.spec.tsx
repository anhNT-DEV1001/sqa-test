import React from 'react';
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

  // TC_FaceAuth_Pass_001
  it('TC_FaceAuth_Pass_001', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.10);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_002
  it('TC_FaceAuth_Pass_002', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.12);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_003
  it('TC_FaceAuth_Pass_003', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.14);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_004
  it('TC_FaceAuth_Pass_004', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.16);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_005
  it('TC_FaceAuth_Pass_005', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.18);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_006
  it('TC_FaceAuth_Pass_006', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.20);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_007
  it('TC_FaceAuth_Pass_007', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.22);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_008
  it('TC_FaceAuth_Pass_008', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.24);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_009
  it('TC_FaceAuth_Pass_009', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.26);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_010
  it('TC_FaceAuth_Pass_010', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.28);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_011
  it('TC_FaceAuth_Pass_011', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.30);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_012
  it('TC_FaceAuth_Pass_012', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.32);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_013
  it('TC_FaceAuth_Pass_013', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.34);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_014
  it('TC_FaceAuth_Pass_014', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.36);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_015
  it('TC_FaceAuth_Pass_015', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.38);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_016
  it('TC_FaceAuth_Pass_016', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.40);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_017
  it('TC_FaceAuth_Pass_017', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.42);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_018
  it('TC_FaceAuth_Pass_018', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.44);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_019
  it('TC_FaceAuth_Pass_019', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.46);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Pass_020
  it('TC_FaceAuth_Pass_020', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.48);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled(), { timeout: 3000 });
  });

  // TC_FaceAuth_Fail_001
  it('TC_FaceAuth_Fail_001', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.60);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument(), { timeout: 3000 });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FaceAuth_Fail_002
  it('TC_FaceAuth_Fail_002', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.65);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument(), { timeout: 3000 });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FaceAuth_Fail_003
  it('TC_FaceAuth_Fail_003', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.70);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument(), { timeout: 3000 });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FaceAuth_Fail_004
  it('TC_FaceAuth_Fail_004', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.75);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument(), { timeout: 3000 });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FaceAuth_Fail_005
  it('TC_FaceAuth_Fail_005', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.80);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument(), { timeout: 3000 });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FaceAuth_Fail_006
  it('TC_FaceAuth_Fail_006', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.85);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument(), { timeout: 3000 });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FaceAuth_Fail_007
  it('TC_FaceAuth_Fail_007', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.90);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument(), { timeout: 3000 });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FaceAuth_Fail_008
  it('TC_FaceAuth_Fail_008', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.95);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument(), { timeout: 3000 });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FaceAuth_Fail_009
  it('TC_FaceAuth_Fail_009', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(1.00);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument(), { timeout: 3000 });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FaceAuth_Fail_010
  it('TC_FaceAuth_Fail_010', async () => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(1.05);
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await waitFor(() => expect(screen.getByText(/Verify My Face/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Verify My Face/i));
    
    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument(), { timeout: 3000 });
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

});
