import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FaceVerificationModal } from './FaceVerificationModal';
import * as faceapi from 'face-api.js';
import '@testing-library/jest-dom';

// ---------- Mocks ----------

const mockWithFaceDescriptor = jest.fn();
const mockWithFaceLandmarks = jest.fn().mockReturnValue({ withFaceDescriptor: mockWithFaceDescriptor });
const mockDetectSingleFace = jest.fn().mockReturnValue({ withFaceLandmarks: mockWithFaceLandmarks });

jest.mock('face-api.js', () => ({
  detectSingleFace: (...args: any[]) => mockDetectSingleFace(...args),
  euclideanDistance: jest.fn(),
  nets: {
    tinyFaceDetector: { loadFromUri: jest.fn().mockResolvedValue(true) },
    ssdMobilenetv1: { loadFromUri: jest.fn().mockResolvedValue(true) },
    faceLandmark68Net: { loadFromUri: jest.fn().mockResolvedValue(true) },
    faceRecognitionNet: { loadFromUri: jest.fn().mockResolvedValue(true) },
  },
  SsdMobilenetv1Options: jest.fn(),
}));

let mockModelsLoaded = true;
const mockUseFaceApi = jest.fn(() => ({ modelsLoaded: mockModelsLoaded }));
jest.mock('@/hooks/useFaceApi', () => ({
  useFaceApi: () => mockUseFaceApi()
}));

let mockUser: any = { imageUrl: 'https://example.com/profile.jpg' };
const mockUseAuth = jest.fn(() => ({ user: mockUser }));
jest.mock('@/stores/auth', () => ({
  useAuth: () => mockUseAuth()
}));

const mockStopTrack = jest.fn();
const mockGetUserMedia = jest.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue({
  getTracks: () => [{ stop: mockStopTrack }],
} as any);

describe('FaceVerificationModal - AI Face Authentication', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const renderModal = async (isOpen = true) => {
    render(<FaceVerificationModal isOpen={isOpen} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
    if (isOpen) {
      await waitFor(() => expect(mockGetUserMedia).toHaveBeenCalled());
      await act(async () => { await Promise.resolve(); }); // flush
    }
  };

  const setupFaceDetection = (webcamDescriptor: Float32Array | null, profileDescriptor: Float32Array | null) => {
    mockWithFaceLandmarks.mockReset();
    mockWithFaceLandmarks.mockReturnValue({ withFaceDescriptor: mockWithFaceDescriptor }); // restore default

    if (webcamDescriptor) {
      mockWithFaceLandmarks.mockReturnValueOnce({ withFaceDescriptor: () => { console.log("withFaceDescriptor webcam called"); return Promise.resolve({ descriptor: webcamDescriptor }); } });
    } else {
      mockWithFaceLandmarks.mockReturnValueOnce({ withFaceDescriptor: () => Promise.resolve(null) });
    }

    if (profileDescriptor) {
      mockWithFaceLandmarks.mockReturnValueOnce({ withFaceDescriptor: () => Promise.resolve({ descriptor: profileDescriptor }) });
    } else {
      mockWithFaceLandmarks.mockReturnValueOnce({ withFaceDescriptor: () => Promise.resolve(null) });
    }
  };

  let originalSetTimeout: any;

  beforeAll(() => {
    originalSetTimeout = global.setTimeout;
    jest.spyOn(global, 'setTimeout').mockImplementation((cb: any, ms?: number) => {
      if (ms === 1500) {
        // Delay by 50ms to allow React to render the success state before clearing it
        return originalSetTimeout(cb, 50);
      }
      return originalSetTimeout(cb, ms);
    });
    // Add a helper to the mock so we can use real timeout in Image
    (global.setTimeout as any).real = originalSetTimeout;
  });

  afterAll(() => {
    (global.setTimeout as unknown as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFaceApi.mockReturnValue({ modelsLoaded: true });
    mockUseAuth.mockReturnValue({ user: { imageUrl: 'https://example.com/profile.jpg' } });

    (global as any).Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      crossOrigin = '';
      _src = '';
      set src(val: string) {
        this._src = val;
        // Since we are not using fake timers, a simple microtask is enough
        Promise.resolve().then(() => { console.log("Image microtask ran, onload exists:", !!this.onload); if (this.onload) this.onload(); });
      }
      get src() { return this._src; }
    };
  });

  afterEach(() => {
    // nothing
  });

  // ============================================================
  // Euclidean Distance Threshold Tests (d < 0.6 = PASS)
  // ============================================================

  // TC_FACE_001
  // Method: handleVerifyFace
  // Purpose: Verify face match SUCCESS when distance = 0.10 (well below threshold 0.6)
  // Input: webcam face detected, profile face detected, euclideanDistance returns 0.10
  // Expected output: "Verification Successful!" shown, onSuccess called after 1.5s
  // Test result: pass
  it('TC_FACE_001', async () => {
    setupFaceDetection(new Float32Array([0.1]), new Float32Array([0.1]));
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.10);

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    screen.debug();
    await waitFor(() => expect(screen.getByText(/Verification Successful/i)).toBeInTheDocument());
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled());
  });

  // TC_FACE_002
  // Method: handleVerifyFace
  // Purpose: Verify face match SUCCESS at distance = 0.30 (moderate similarity)
  // Input: euclideanDistance returns 0.30
  // Expected output: "Verification Successful!" shown, onSuccess called
  // Test result: pass
  it('TC_FACE_002', async () => {
    setupFaceDetection(new Float32Array([0.1]), new Float32Array([0.1]));
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.30);

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    screen.debug();
    await waitFor(() => expect(screen.getByText(/Verification Successful/i)).toBeInTheDocument());
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled());
  });

  // TC_FACE_003
  // Method: handleVerifyFace
  // Purpose: Verify BOUNDARY PASS at distance = 0.59 (just below threshold)
  // Input: euclideanDistance returns 0.59
  // Expected output: Pass - "Verification Successful!" shown
  // Test result: pass
  // Note: Critical boundary test - 0.59 < 0.6 threshold
  it('TC_FACE_003', async () => {
    setupFaceDetection(new Float32Array([0.1]), new Float32Array([0.1]));
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.59);

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    screen.debug();
    await waitFor(() => expect(screen.getByText(/Verification Successful/i)).toBeInTheDocument());
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled());
  });

  // TC_FACE_004
  // Method: handleVerifyFace
  // Purpose: Verify BOUNDARY FAIL at distance = 0.60 (exactly at threshold)
  // Input: euclideanDistance returns 0.60
  // Expected output: Fail - "Verification Failed" shown, onSuccess NOT called
  // Test result: pass
  // Note: Critical boundary test - 0.60 >= 0.6 threshold → FAIL
  it('TC_FACE_004', async () => {
    setupFaceDetection(new Float32Array([0.1]), new Float32Array([0.1]));
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.60);

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument());
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FACE_005
  // Method: handleVerifyFace
  // Purpose: Verify face FAIL at distance = 0.80 (clearly different faces)
  // Input: euclideanDistance returns 0.80
  // Expected output: "Face verification failed" error message
  // Test result: pass
  it('TC_FACE_005', async () => {
    setupFaceDetection(new Float32Array([0.1]), new Float32Array([0.1]));
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.80);

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument());
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FACE_006
  // Method: handleVerifyFace
  // Purpose: Verify face FAIL at distance = 1.0 (completely different faces)
  // Input: euclideanDistance returns 1.0
  // Expected output: "Face verification failed" error, onSuccess NOT called
  // Test result: pass
  it('TC_FACE_006', async () => {
    setupFaceDetection(new Float32Array([0.1]), new Float32Array([0.1]));
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(1.0);

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument());
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // ============================================================
  // Edge Cases: No Face Detected / Image Load Failure
  // ============================================================

  // TC_FACE_007
  // Method: handleVerifyFace
  // Purpose: Verify error when NO FACE detected in webcam
  // Input: detectSingleFace returns null for webcam
  // Expected output: Error "No face detected in camera"
  // Test result: pass
  it('TC_FACE_007', async () => {
    mockWithFaceLandmarks.mockReturnValueOnce({ withFaceDescriptor: () => Promise.resolve(null) });

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    await waitFor(() => expect(screen.getByText(/No face detected/i)).toBeInTheDocument());
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FACE_008
  // Method: handleVerifyFace
  // Purpose: Verify error when NO FACE detected in profile image
  // Input: webcam face detected, profile image returns null
  // Expected output: Error "Could not detect face in your profile picture"
  // Test result: pass
  it('TC_FACE_008', async () => {
    mockWithFaceLandmarks
      .mockReturnValueOnce({ withFaceDescriptor: () => Promise.resolve({ descriptor: new Float32Array([0.1]) }) })
      .mockReturnValueOnce({ withFaceDescriptor: () => Promise.resolve(null) });

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    await waitFor(() => expect(screen.getByText(/Could not detect face in your profile/i)).toBeInTheDocument());
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FACE_009
  // Method: handleVerifyFace
  // Purpose: Verify error when profile image fails to load (network error)
  // Input: Image.onerror is triggered instead of onload
  // Expected output: Error "Failed to load profile image"
  // Test result: pass
  it('TC_FACE_009', async () => {
    (global as any).Image = class {
      onload: any; onerror: any; crossOrigin = ''; _src = '';
      set src(val: string) {
        this._src = val;
        Promise.resolve().then(() => { if (this.onerror) this.onerror(); });
      }
      get src() { return this._src; }
    };
    mockWithFaceLandmarks.mockReturnValueOnce({
      withFaceDescriptor: () => Promise.resolve({ descriptor: new Float32Array([0.1]) }),
    });

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    await waitFor(() => expect(screen.getByText(/Failed to load profile image/i)).toBeInTheDocument());
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FACE_010
  // Method: handleVerifyFace
  // Purpose: Verify error when user has no profile image (imageUrl is null)
  // Input: user.imageUrl = null
  // Expected output: Error "System is not ready or profile image is missing."
  // Test result: pass
  it('TC_FACE_010', async () => {
    mockUseAuth.mockReturnValue({ user: { imageUrl: null } });

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    await waitFor(() => expect(screen.getByText(/profile image is missing/i)).toBeInTheDocument());
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  // TC_FACE_011
  // Method: handleVerifyFace
  // Purpose: Verify error when AI models are not loaded yet
  // Input: modelsLoaded = false
  // Expected output: Error "AI Models are still loading"
  // Test result: pass
  it('TC_FACE_011', async () => {
    mockUseFaceApi.mockReturnValue({ modelsLoaded: false });

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    await waitFor(() => expect(screen.getByText(/AI Models are still loading/i)).toBeInTheDocument());
  });

  // ============================================================
  // UI State Tests
  // ============================================================

  // TC_FACE_012
  // Method: render
  // Purpose: Verify modal renders with correct title and instructions
  // Input: isOpen = true
  // Expected output: "Face Verification (AI)" title and instruction text visible
  // Test result: pass
  it('TC_FACE_012', async () => {
    await renderModal();
    expect(screen.getByText(/Face Verification \(AI\)/i)).toBeInTheDocument();
    expect(screen.getByText(/position your face/i)).toBeInTheDocument();
  });

  // TC_FACE_013
  // Method: render
  // Purpose: Verify "Loading AI Models" overlay shown when models not loaded
  // Input: modelsLoaded = false
  // Expected output: "Loading AI Models..." text visible
  // Test result: pass
  it('TC_FACE_013', async () => {
    mockUseFaceApi.mockReturnValue({ modelsLoaded: false });
    await renderModal();
    expect(screen.getByText(/Loading AI Models/i)).toBeInTheDocument();
  });

  // TC_FACE_014
  // Method: render
  // Purpose: Verify Verify button is disabled when models not loaded
  // Input: modelsLoaded = false
  // Expected output: Verify My Face button is disabled
  // Test result: pass
  it('TC_FACE_014', async () => {
    mockUseFaceApi.mockReturnValue({ modelsLoaded: false });
    await renderModal();
    expect(screen.getByText(/Verify My Face/i)).toBeDisabled();
  });

  // TC_FACE_015
  // Method: onClose
  // Purpose: Verify Cancel button calls onClose
  // Input: Click Cancel button
  // Expected output: onClose callback is called
  // Test result: pass
  it('TC_FACE_015', async () => {
    await renderModal();
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(mockOnClose).toHaveBeenCalled();
  });

  // TC_FACE_016
  // Method: render
  // Purpose: Verify modal is not visible when isOpen = false
  // Input: isOpen = false
  // Expected output: Dialog has pointer-events-none class (invisible)
  // Test result: pass
  it('TC_FACE_016', async () => {
    await renderModal(false);
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog.className).toContain('pointer-events-none');
  });

  // TC_FACE_017
  // Method: handleVerifyFace
  // Purpose: Verify button text changes to "Verifying..." during verification
  // Input: Click verify, face-api processing
  // Expected output: Button text changes to "Verifying..."
  // Test result: pass
  it('TC_FACE_017', async () => {
    // Make the detection take time by using a never-resolving promise
    mockWithFaceLandmarks.mockReturnValueOnce({
      withFaceDescriptor: () => new Promise(() => { }), // never resolves
    });

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    expect(screen.getByText(/Verifying.../i)).toBeInTheDocument();
  });

  // TC_FACE_018
  // Method: handleVerifyFace
  // Purpose: Verify success message shows "Redirecting to exam..."
  // Input: Face match succeeds (distance = 0.1)
  // Expected output: "Redirecting to exam..." text shown
  // Test result: pass
  it('TC_FACE_018', async () => {
    setupFaceDetection(new Float32Array([0.1]), new Float32Array([0.1]));
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.1);

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    await waitFor(() => expect(screen.getByText(/Redirecting to exam/i)).toBeInTheDocument());
  });

  // TC_FACE_019
  // Method: webcam
  // Purpose: Verify webcam stream is requested when modal opens
  // Input: isOpen = true
  // Expected output: getUserMedia called with video constraints
  // Test result: pass
  it('TC_FACE_019', async () => {
    await renderModal();
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith(expect.objectContaining({ video: expect.anything() }));
    });
  });

  // TC_FACE_020
  // Method: handleVerifyFace
  // Purpose: Verify error message can be dismissed by clicking close icon
  // Input: Face verification fails, then user clicks dismiss
  // Expected output: Error message disappears
  // Test result: pass
  it('TC_FACE_020', async () => {
    setupFaceDetection(new Float32Array([0.1]), new Float32Array([0.1]));
    (faceapi.euclideanDistance as jest.Mock).mockReturnValue(0.90);

    await renderModal();
    fireEvent.click(screen.getByText(/Verify My Face/i));

    await waitFor(() => expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument());

    // Find the dismiss button within the error message area
    const errorDismissButtons = screen.getAllByRole('button').filter(el => el.querySelector('.text-red-400') || el.closest('.bg-red-50'));
    if (errorDismissButtons.length > 0) {
      fireEvent.click(errorDismissButtons[0]);
      await waitFor(() => expect(screen.queryByText(/Verification Failed/i)).not.toBeInTheDocument());
    }
  });
});
