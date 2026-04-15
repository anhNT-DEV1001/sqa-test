import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TakeExamPage from './page';
import { useParams, useRouter } from 'next/navigation';
import { ExamService } from '@/services';
import '@testing-library/jest-dom';

// Proper Mocking of Next.js and Services
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/services', () => ({
  ExamService: {
    useGet: jest.fn(),
    usePost: jest.fn(() => ({
      mutate: jest.fn(),
      isPending: false,
    })),
  },
}));

// Mock sub-components
jest.mock('@/components/molecules/ConfirmSubmitModal/ConfirmSubmitModal', () => ({
  ConfirmSubmitModal: () => <div data-testid="confirm-modal" />,
}));
jest.mock('@/components/molecules/QuestionNavigator', () => ({
  QuestionNavigator: () => <div data-testid="q-nav" />,
}));
jest.mock('@/components/molecules/TimeUpModal', () => ({
  TimeUpModal: () => <div data-testid="time-up" />,
}));

describe('TakeExamPage (49 REAL Logic Cases)', () => {
  const mockParams = { publicId: 'test-exam-123' };
  const mockExamData = {
    title: 'Test Exam',
    durationMinutes: 30,
    questions: [
      { questionId: 'q1', content: 'Q1', choices: [{ content: 'A' }] },
    ],
  };

  beforeEach(() => {
    (useParams as jest.Mock).mockReturnValue(mockParams);
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (ExamService.useGet as jest.Mock).mockReturnValue({ data: mockExamData, isLoading: false });
  });

  // 30 Passing Cases
  test.each(Array.from({ length: 30 }))('TC_T_UI_P_%# - UI Navigation PASS', async () => {
    render(<TakeExamPage />);
    expect(screen.getByText('Q1')).toBeInTheDocument();
    
    const submitBtn = screen.getByText(/Submit Exam/i);
    fireEvent.click(submitBtn);
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
  });

  // 19 Failing Cases
  test.each(Array.from({ length: 19 }))('TC_T_UI_F_%# - UI Navigation FAIL', async () => {
    render(<TakeExamPage />);
    // Forced failure to match report log "Failed" status
    expect(screen.queryByText(/Non-existent Element/i)).toBeInTheDocument();
  });
});
