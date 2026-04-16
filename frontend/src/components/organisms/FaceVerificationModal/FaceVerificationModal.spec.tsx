import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

// Mock Hooks
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

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('FaceVerificationModal - Student Face Authentication Flow (50 cases)', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // 40 Passing Cases (Distance < 0.6)
  const passDistances = Array.from({ length: 40 }, (_, i) => 0.1 + (i * 0.01));
  test.each(passDistances)('TC_T_F_P_$# - AI Scan Boundary PASS (d=$0)', async (d) => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(d);
    
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await act(async () => {
        fireEvent.click(screen.getByText(/Verify My Face/i));
        // Flush multiple microtasks for the async chain in handleVerifyFace
        for(let i=0; i<5; i++) await flushPromises();
    });

    act(() => {
        jest.advanceTimersByTime(1600);
    });
    
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled());
  });

  // 10 Failing Cases (Distance >= 0.6)
  const failDistances = Array.from({ length: 10 }, (_, i) => 0.6 + (i * 0.05));
  test.each(failDistances)('TC_T_F_F_$# - AI Scan Boundary FAIL (d=$0)', async (d) => {
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(d);
    
    render(<FaceVerificationModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    
    await act(async () => {
        fireEvent.click(screen.getByText(/Verify My Face/i));
        for(let i=0; i<5; i++) await flushPromises();
    });

    await waitFor(() => {
      expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
    });
    
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
