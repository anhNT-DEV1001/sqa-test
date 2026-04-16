import { render, screen, fireEvent } from '@testing-library/react';
import { CompletedExamCard } from './CompletedExamCard';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('CompletedExamCard - History & Scores Logic (10 cases)', () => {
  const mockPush = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

  const baseExam = {
    submissionId: 'sub123',
    examPublicId: 'E101',
    examTitle: 'Math Final',
    courseName: 'Mathematics',
    score: 85,
    result: 'Passed',
    submittedAt: '2026-04-15T10:00:00Z',
  };

  const scenarios = [
    { score: 95, result: 'Passed' },
    { score: 85, result: 'Passed' },
    { score: 75, result: 'Passed' },
    { score: 65, result: 'Passed' },
    { score: 55, result: 'Passed' },
    { score: 45, result: 'Failed' },
    { score: 35, result: 'Failed' },
    { score: 25, result: 'Failed' },
    { score: 15, result: 'Failed' },
    { score: 5,  result: 'Failed' },
  ];

  test.each(scenarios)('TC_H_RES_$# - Should display score $score% and status $result', ({ score, result }) => {
    const exam = { ...baseExam, score, result };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: ${score}%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText(result)).toBeInTheDocument();
    
    if (result === 'Passed') {
      expect(screen.getByText(result)).toHaveClass('bg-green-100');
    } else {
      expect(screen.getByText(result)).toHaveClass('bg-red-100');
    }
  });

  it('should navigate to result detail when "View Result" is clicked', () => {
    render(<CompletedExamCard exam={baseExam as any} />);
    fireEvent.click(screen.getByText(/View Result/i));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('sub123'));
  });
});
