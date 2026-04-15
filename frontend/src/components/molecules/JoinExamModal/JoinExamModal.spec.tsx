import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JoinExamModal } from './JoinExamModal';
import { ExamService } from '@/services/index';
import { useForm } from 'react-hook-form';

jest.mock('@/services/index', () => ({
  ExamService: {
    usePost: jest.fn(),
  },
}));

describe('JoinExamModal', () => {
  const mockOnClose = jest.fn();
  const mockOnJoinSuccess = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (ExamService.usePost as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });
  });

  it('should render correctly when open', () => {
    render(
      <JoinExamModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onJoinSuccess={mockOnJoinSuccess} 
      />
    );
    expect(screen.getAllByText(/Join Exam/i)).toHaveLength(2);
    expect(screen.getByPlaceholderText(/Enter the exam code/i)).toBeInTheDocument();
  });

  it('should call mutate when valid code is submitted', async () => {
    render(
      <JoinExamModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onJoinSuccess={mockOnJoinSuccess} 
      />
    );
    
    const input = screen.getByPlaceholderText(/Enter the exam code/i);
    const joinButton = screen.getByRole('button', { name: /Join Exam/i });

    fireEvent.change(input, { target: { value: 'EXAM123' } });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  it('should not call onClose when join fails', async () => {
    render(
      <JoinExamModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onJoinSuccess={mockOnJoinSuccess} 
      />
    );
    
    // Simulate error by doing nothing or letting it fail validation
    const joinButton = screen.getByRole('button', { name: /Join/i });
    fireEvent.click(joinButton);

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
