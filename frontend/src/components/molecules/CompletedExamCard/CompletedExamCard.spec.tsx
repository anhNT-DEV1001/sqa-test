import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompletedExamCard } from './CompletedExamCard';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('CompletedExamCard - History & Scores Logic', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  const baseExam = {
    submissionId: 'sub123',
    examPublicId: 'E101',
    examTitle: 'Math Final',
    courseName: 'Mathematics',
    submittedAt: '2026-04-15T10:00:00Z',
  };


  // TC_Exam_History_Score_001
  // Method: render
  // Purpose: To display score 100% and status Passed correctly
  // Input: exam object with score 100
  // Expected output: Component renders correct score and Passed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_001', () => {
    const exam = { ...baseExam, score: 100, result: 'Passed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 100%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    
    expect(screen.getByText('Passed')).toHaveClass('bg-green-100');
  });

  // TC_Exam_History_Score_002
  // Method: render
  // Purpose: To display score 95% and status Passed correctly
  // Input: exam object with score 95
  // Expected output: Component renders correct score and Passed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_002', () => {
    const exam = { ...baseExam, score: 95, result: 'Passed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 95%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    
    expect(screen.getByText('Passed')).toHaveClass('bg-green-100');
  });

  // TC_Exam_History_Score_003
  // Method: render
  // Purpose: To display score 90% and status Passed correctly
  // Input: exam object with score 90
  // Expected output: Component renders correct score and Passed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_003', () => {
    const exam = { ...baseExam, score: 90, result: 'Passed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 90%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    
    expect(screen.getByText('Passed')).toHaveClass('bg-green-100');
  });

  // TC_Exam_History_Score_004
  // Method: render
  // Purpose: To display score 85% and status Passed correctly
  // Input: exam object with score 85
  // Expected output: Component renders correct score and Passed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_004', () => {
    const exam = { ...baseExam, score: 85, result: 'Passed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 85%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    
    expect(screen.getByText('Passed')).toHaveClass('bg-green-100');
  });

  // TC_Exam_History_Score_005
  // Method: render
  // Purpose: To display score 80% and status Passed correctly
  // Input: exam object with score 80
  // Expected output: Component renders correct score and Passed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_005', () => {
    const exam = { ...baseExam, score: 80, result: 'Passed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 80%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    
    expect(screen.getByText('Passed')).toHaveClass('bg-green-100');
  });

  // TC_Exam_History_Score_006
  // Method: render
  // Purpose: To display score 75% and status Passed correctly
  // Input: exam object with score 75
  // Expected output: Component renders correct score and Passed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_006', () => {
    const exam = { ...baseExam, score: 75, result: 'Passed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 75%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    
    expect(screen.getByText('Passed')).toHaveClass('bg-green-100');
  });

  // TC_Exam_History_Score_007
  // Method: render
  // Purpose: To display score 70% and status Passed correctly
  // Input: exam object with score 70
  // Expected output: Component renders correct score and Passed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_007', () => {
    const exam = { ...baseExam, score: 70, result: 'Passed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 70%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    
    expect(screen.getByText('Passed')).toHaveClass('bg-green-100');
  });

  // TC_Exam_History_Score_008
  // Method: render
  // Purpose: To display score 65% and status Passed correctly
  // Input: exam object with score 65
  // Expected output: Component renders correct score and Passed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_008', () => {
    const exam = { ...baseExam, score: 65, result: 'Passed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 65%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    
    expect(screen.getByText('Passed')).toHaveClass('bg-green-100');
  });

  // TC_Exam_History_Score_009
  // Method: render
  // Purpose: To display score 60% and status Passed correctly
  // Input: exam object with score 60
  // Expected output: Component renders correct score and Passed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_009', () => {
    const exam = { ...baseExam, score: 60, result: 'Passed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 60%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    
    expect(screen.getByText('Passed')).toHaveClass('bg-green-100');
  });

  // TC_Exam_History_Score_010
  // Method: render
  // Purpose: To display score 55% and status Passed correctly
  // Input: exam object with score 55
  // Expected output: Component renders correct score and Passed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_010', () => {
    const exam = { ...baseExam, score: 55, result: 'Passed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 55%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    
    expect(screen.getByText('Passed')).toHaveClass('bg-green-100');
  });

  // TC_Exam_History_Score_011
  // Method: render
  // Purpose: To display score 50% and status Passed correctly
  // Input: exam object with score 50
  // Expected output: Component renders correct score and Passed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_011', () => {
    const exam = { ...baseExam, score: 50, result: 'Passed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 50%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    
    expect(screen.getByText('Passed')).toHaveClass('bg-green-100');
  });

  // TC_Exam_History_Score_012
  // Method: render
  // Purpose: To display score 45% and status Failed correctly
  // Input: exam object with score 45
  // Expected output: Component renders correct score and Failed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_012', () => {
    const exam = { ...baseExam, score: 45, result: 'Failed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 45%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    
    expect(screen.getByText('Failed')).toHaveClass('bg-red-100');
  });

  // TC_Exam_History_Score_013
  // Method: render
  // Purpose: To display score 40% and status Failed correctly
  // Input: exam object with score 40
  // Expected output: Component renders correct score and Failed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_013', () => {
    const exam = { ...baseExam, score: 40, result: 'Failed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 40%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    
    expect(screen.getByText('Failed')).toHaveClass('bg-red-100');
  });

  // TC_Exam_History_Score_014
  // Method: render
  // Purpose: To display score 35% and status Failed correctly
  // Input: exam object with score 35
  // Expected output: Component renders correct score and Failed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_014', () => {
    const exam = { ...baseExam, score: 35, result: 'Failed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 35%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    
    expect(screen.getByText('Failed')).toHaveClass('bg-red-100');
  });

  // TC_Exam_History_Score_015
  // Method: render
  // Purpose: To display score 30% and status Failed correctly
  // Input: exam object with score 30
  // Expected output: Component renders correct score and Failed badge class
  // Test result: pass
  // Note: Review exam history/scores
  // checkdb: UI test, no DB interaction.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_Exam_History_Score_015', () => {
    const exam = { ...baseExam, score: 30, result: 'Failed' };
    render(<CompletedExamCard exam={exam as any} />);
    
    expect(screen.getByText(new RegExp(`Score: 30%`, 'i'))).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    
    expect(screen.getByText('Failed')).toHaveClass('bg-red-100');
  });

  // TC_Exam_History_Navigate_001
  // Method: onViewResult
  // Purpose: To navigate to result detail when View Result is clicked
  // Input: Click "View Result" button
  // Expected output: Router push called with submissionId
  // Test result: pass
  // Note: None
  // checkdb: UI test, no DB.
  // rollback: jest.clearAllMocks()
  it('TC_Exam_History_Navigate_001', () => {
    render(<CompletedExamCard exam={{ ...baseExam, score: 90, result: 'Passed' } as any} />);
    fireEvent.click(screen.getByText(/View Result/i));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('sub123'));
  });

});
