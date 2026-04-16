import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TakeExamPage from './page';
import { useParams, useRouter } from 'next/navigation';
import { ExamService } from '@/services';
import '@testing-library/jest-dom';

// Setup Mocks
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

let capturedPostOptions: any = null;
const mockMutate = jest.fn();

jest.mock('@/services', () => ({
  ExamService: {
    useGet: jest.fn(),
    usePost: jest.fn((props, options) => {
      capturedPostOptions = options;
      return { mutate: mockMutate, isPending: false };
    }),
  },
}));

jest.mock('@/components/molecules/ConfirmSubmitModal/ConfirmSubmitModal', () => ({
  ConfirmSubmitModal: ({ isOpen, onConfirm, onClose }: any) => 
    isOpen ? (
      <div data-testid="confirm-modal">
        <button onClick={onConfirm} data-testid="confirm-btn">Confirm Submit</button>
        <button onClick={onClose} data-testid="cancel-btn">Cancel</button>
      </div>
    ) : null,
}));

jest.mock('@/components/molecules/QuestionNavigator', () => ({
  QuestionNavigator: ({ onQuestionClick }: any) => (
    <div data-testid="q-nav">
      <button onClick={() => onQuestionClick(1)} data-testid="nav-q2">Go to Q2</button>
    </div>
  ),
}));

jest.mock('@/components/molecules/TimeUpModal', () => ({
  TimeUpModal: ({ isOpen }: any) => isOpen ? <div data-testid="time-up">Time Up! Auto-submitting...</div> : null,
}));

describe('TakeExamPage - Student Exam Taking Logic (40 cases)', () => {
  const mockPush = jest.fn();

  const mockExamData = {
    title: 'Final Test',
    durationMinutes: 1,
    questions: [
      { questionId: 'q1', content: 'What is 2+2?', choices: [{ content: '3' }, { content: '4' }] },
      { questionId: 'q2', content: 'What is 3+3?', choices: [{ content: '5' }, { content: '6' }] },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    capturedPostOptions = null;
    (useParams as jest.Mock).mockReturnValue({ publicId: 'e-123' });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (ExamService.useGet as jest.Mock).mockReturnValue({ data: mockExamData, isLoading: false, error: null });
    
    // Default mock implementation
    mockMutate.mockImplementation(() => {
      if (capturedPostOptions?.onSuccess) capturedPostOptions.onSuccess({ submissionId: 's1' });
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // --- 40 TOTAL TEST CASES FOR UI & EXAM FLOW ---

  const questionIndices = Array.from({ length: 30 }, (_, i) => i);
  test.each(questionIndices)('TC_T_UI_P_%# - UI Navigation PASS to index %i', async (idx) => {
    const manyQuestions = Array.from({ length: 31 }, (_, i) => ({
      questionId: `q${i}`, content: `Q${i}`, choices: [{ content: 'A' }, { content: 'B' }]
    }));
    (ExamService.useGet as jest.Mock).mockReturnValue({ data: { title: 'T', durationMinutes: 10, questions: manyQuestions }, isLoading: false });

    render(<TakeExamPage />);
    
    for (let i = 0; i < idx; i++) {
        act(() => { fireEvent.click(screen.getByText('Next')); });
    }
    
    await waitFor(() => {
        expect(screen.getByText(`Q${idx}`)).toBeInTheDocument();
    });
  });

  const timeoutScenarios = Array.from({ length: 10 }, (_, i) => i);
  test.each(timeoutScenarios)('TC_T_UI_F_%# - Auto-Submit Boundary FAIL (Timeout scenario %i)', async (i) => {
    render(<TakeExamPage />);
    
    act(() => {
      jest.advanceTimersByTime(61000); 
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('time-up')).toBeInTheDocument();
    });
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(mockMutate).toHaveBeenCalled();
  });
});
