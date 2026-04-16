import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JoinExamModal } from './JoinExamModal';
import { ExamService } from '@/services/index';
import '@testing-library/jest-dom';

// Capture mutation points
let capturedOptions: any = null;
const mockMutate = jest.fn();

jest.mock('@/services/index', () => ({
  ExamService: {
    usePost: jest.fn((props, options) => {
      capturedOptions = options;
      return { mutate: mockMutate, isPending: false };
    }),
  },
}));

describe('JoinExamModal - Exam Room Join Logic (10 cases)', () => {
  const mockOnClose = jest.fn();
  const mockOnJoinSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    capturedOptions = null;
    
    // Default implementation to simulate calling mutate triggers onSuccess
    mockMutate.mockImplementation(() => {
      if (capturedOptions?.onSuccess) {
        capturedOptions.onSuccess({ publicId: 'EXAM-CODE', title: 'Math Test' });
      }
    });
  });

  it('should render the join exam form correctly', () => {
    render(<JoinExamModal isOpen={true} onClose={mockOnClose} onJoinSuccess={mockOnJoinSuccess} />);
    expect(screen.getByPlaceholderText(/Enter the exam code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Join Exam/i })).toBeInTheDocument();
  });

  // --- 10 TOTAL TEST CASES FOR JOIN EXAM LOGIC ---
  const codes = ['MATH101', 'PHYS202', 'CHEM303', 'BIO404', 'ALGO505', 'WEB606', 'DB707', 'AI808', 'ML909', 'SQA1000'];
  test.each(codes)('TC_J_UI_%# - Should join exam with code: %s', async (code) => {
    mockMutate.mockImplementationOnce(() => {
      if (capturedOptions?.onSuccess) capturedOptions.onSuccess({ publicId: code, title: 'Exam' });
    });

    render(<JoinExamModal isOpen={true} onClose={mockOnClose} onJoinSuccess={mockOnJoinSuccess} />);
    
    const input = screen.getByPlaceholderText(/Enter the exam code/i);
    fireEvent.change(input, { target: { value: code } });
    fireEvent.click(screen.getByRole('button', { name: /Join/i }));

    await waitFor(() => {
      expect(mockOnJoinSuccess).toHaveBeenCalledWith(expect.objectContaining({ publicId: code }));
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should not close modal if join fails', async () => {
    mockMutate.mockImplementationOnce(() => {
      if (capturedOptions?.onError) capturedOptions.onError(new Error('Fail'));
    });

    render(<JoinExamModal isOpen={true} onClose={mockOnClose} onJoinSuccess={mockOnJoinSuccess} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Enter the exam code/i), { target: { value: 'BAD' } });
    fireEvent.click(screen.getByRole('button', { name: /Join/i }));

    await waitFor(() => {
      expect(mockOnJoinSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
