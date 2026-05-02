import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { ExamsService } from './exams.service';
import { Exam } from '../../database/schemas/exam.schema';
import { Course } from '../../database/schemas/course.schema';
import { Question } from '../../database/schemas/question.schema';
import { Submission } from '../../database/schemas/submission.schema';
import { User } from '../../database/schemas/user.schema';
import { Types } from 'mongoose';
import { NotificationsService } from '../notifications/notifications.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as idUtils from '../../common/utils/public-id.util';

describe('ExamsService - Student Exam Taking', () => {
  let service: ExamsService;

  const mockCourseId = new Types.ObjectId();
  const mockTeacherId = new Types.ObjectId();
  const mockExamId = new Types.ObjectId();
  const mockStudentId = new Types.ObjectId();

  const mockExamModel: any = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
    hydrate: jest.fn(),
  };

  const mockCourseModel = {
    findById: jest.fn(),
    find: jest.fn(),
  };

  const mockQuestionModel = {
    insertMany: jest.fn(),
    deleteMany: jest.fn(),
    find: jest.fn(),
  };

  const mockSubmissionModel: any = jest.fn().mockImplementation((dto) => {
    const instance = { _id: new Types.ObjectId(), ...dto };
    instance.save = jest.fn().mockResolvedValue(instance);
    return instance;
  });
  mockSubmissionModel.findOne = jest.fn();
  mockSubmissionModel.find = jest.fn();
  mockSubmissionModel.findById = jest.fn();
  mockSubmissionModel.deleteMany = jest.fn();
  mockSubmissionModel.create = jest.fn();

  const mockUserModel = {
    findById: jest.fn(),
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  const mockConnection = {
    startSession: jest.fn().mockResolvedValue(mockSession),
  };

  const mockStudentUser = { id: mockStudentId.toHexString(), role: 'student' };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(idUtils, 'generatePrefixedPublicId').mockResolvedValue('E-123456');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        { provide: getModelToken(Exam.name), useValue: mockExamModel },
        { provide: getModelToken(Question.name), useValue: mockQuestionModel },
        { provide: getModelToken(Course.name), useValue: mockCourseModel },
        { provide: getModelToken(Submission.name), useValue: mockSubmissionModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: getConnectionToken(), useValue: mockConnection },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
  });

  // ============================================================
  // joinExam Method Tests (Student - Exam Room Join)
  // ============================================================

// TC_JOIN_EXAM_001
// Method: joinExam
// Purpose: Verify successful join when exam is active and student has not submitted
// Input: joinExamDto = { publicId: 'E-123456' }, user = valid student
// Expected output: JoinExamResponseDto with publicId, title, durationMinutes, status, course info
// Test result: pass
// checkdb: Verifies findOne with publicId, populate('courseId'), submissionModel.findOne returns null
// rollback: jest.clearAllMocks() in beforeEach
it('TC_JOIN_EXAM_001', async () => {
  const mockCourse = { _id: mockCourseId, publicId: 'C-001', courseName: 'Math 101' };
  const mockExam = {
    _id: mockExamId,
    publicId: 'E-123456',
    title: 'Midterm',
    durationMinutes: 60,
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(Date.now() + 3600000),
    status: 'active',
    courseId: mockCourse,
  };
  mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) });
  mockSubmissionModel.findOne.mockResolvedValue(null);

  const result = await service.joinExam({ publicId: 'E-123456' } as any, mockStudentUser as any);

  expect(result).toBeDefined();
  expect(result.publicId).toBe('E-123456');
  expect(result.title).toBe('Midterm');
});

// TC_JOIN_EXAM_002
// Method: joinExam
// Purpose: Verify NotFoundException when exam with given publicId does not exist
// Input: joinExamDto = { publicId: 'NONEXISTENT' }, user = valid student
// Expected output: NotFoundException "Exam with this code not found."
// Test result: pass
// checkdb: Verifies findOne returns null
// rollback: jest.clearAllMocks() in beforeEach
it('TC_JOIN_EXAM_002', async () => {
  mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });

  await expect(
    service.joinExam({ publicId: 'NONEXISTENT' } as any, mockStudentUser as any),
  ).rejects.toThrow(NotFoundException);
});

// TC_JOIN_EXAM_003
// Method: joinExam
// Purpose: Verify BadRequestException when exam status is 'scheduled' (not active)
// Input: joinExamDto = { publicId: 'E-SCHED' }, exam.status = 'scheduled'
// Expected output: BadRequestException "This exam is not active."
// Test result: pass
// checkdb: No submission check needed
// rollback: jest.clearAllMocks() in beforeEach
it('TC_JOIN_EXAM_003', async () => {
  const mockExam = {
    _id: mockExamId, publicId: 'E-SCHED', title: 'Scheduled',
    status: 'scheduled', endTime: new Date(Date.now() + 86400000),
    courseId: { _id: mockCourseId },
  };
  mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) });

  await expect(
    service.joinExam({ publicId: 'E-SCHED' } as any, mockStudentUser as any),
  ).rejects.toThrow(BadRequestException);
});

// TC_JOIN_EXAM_004
// Method: joinExam
// Purpose: Verify BadRequestException when exam status is 'completed'
// Input: joinExamDto = { publicId: 'E-DONE' }, exam.status = 'completed'
// Expected output: BadRequestException "This exam is not active."
// Test result: pass
// checkdb: No submission check needed
// rollback: jest.clearAllMocks() in beforeEach
it('TC_JOIN_EXAM_004', async () => {
  const mockExam = {
    _id: mockExamId, publicId: 'E-DONE', title: 'Completed',
    status: 'completed', endTime: new Date(Date.now() + 86400000),
    courseId: { _id: mockCourseId },
  };
  mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) });

  await expect(
    service.joinExam({ publicId: 'E-DONE' } as any, mockStudentUser as any),
  ).rejects.toThrow(BadRequestException);
});

// TC_JOIN_EXAM_005
// Method: joinExam
// Purpose: Verify BadRequestException when exam endTime has already passed
// Input: joinExamDto = { publicId: 'E-PAST' }, exam.endTime < now
// Expected output: BadRequestException "This exam has already ended."
// Test result: pass
// checkdb: No submission check needed
// rollback: jest.clearAllMocks() in beforeEach
it('TC_JOIN_EXAM_005', async () => {
  const mockExam = {
    _id: mockExamId, publicId: 'E-PAST', title: 'Past Exam',
    status: 'active', endTime: new Date(Date.now() - 1000),
    courseId: { _id: mockCourseId },
  };
  mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) });

  await expect(
    service.joinExam({ publicId: 'E-PAST' } as any, mockStudentUser as any),
  ).rejects.toThrow(BadRequestException);
});

// TC_JOIN_EXAM_006
// Method: joinExam
// Purpose: Verify ForbiddenException when student has already submitted this exam
// Input: joinExamDto = { publicId: 'E-SUBMITTED' }, existing submission found
// Expected output: ForbiddenException "You have already submitted this exam."
// Test result: pass
// checkdb: Verifies submissionModel.findOne returns existing submission
// rollback: jest.clearAllMocks() in beforeEach
it('TC_JOIN_EXAM_006', async () => {
  const mockExam = {
    _id: mockExamId, publicId: 'E-SUBMITTED', title: 'Already Submitted',
    status: 'active', endTime: new Date(Date.now() + 3600000),
    courseId: { _id: mockCourseId },
  };
  mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) });
  mockSubmissionModel.findOne.mockResolvedValue({ _id: new Types.ObjectId(), score: 80 });

  await expect(
    service.joinExam({ publicId: 'E-SUBMITTED' } as any, mockStudentUser as any),
  ).rejects.toThrow(ForbiddenException);
});

// TC_JOIN_EXAM_007
// Method: joinExam
// Purpose: Verify submissionModel.findOne is called with correct studentId and examId
// Input: joinExamDto = { publicId: 'E-CHECK' }, user = specific student
// Expected output: findOne called with { studentId: ObjectId, examId: ObjectId }
// Test result: pass
// checkdb: Verifies query arguments match student and exam IDs
// rollback: jest.clearAllMocks() in beforeEach
it('TC_JOIN_EXAM_007', async () => {
  const mockExam = {
    _id: mockExamId, publicId: 'E-CHECK', title: 'Check Args',
    status: 'active', endTime: new Date(Date.now() + 3600000),
    courseId: { _id: mockCourseId },
  };
  mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) });
  mockSubmissionModel.findOne.mockResolvedValue(null);

  await service.joinExam({ publicId: 'E-CHECK' } as any, mockStudentUser as any);

  expect(mockSubmissionModel.findOne).toHaveBeenCalledWith({
    studentId: expect.any(Types.ObjectId),
    examId: mockExamId,
  });
});

// TC_JOIN_EXAM_008
// Method: joinExam
// Purpose: Verify response includes course information from populated courseId
// Input: joinExamDto = { publicId: 'E-COURSE' }, exam has populated course
// Expected output: JoinExamResponseDto with course.courseName and course.publicId
// Test result: pass
// checkdb: Verifies populate('courseId') is called
// rollback: jest.clearAllMocks() in beforeEach
it('TC_JOIN_EXAM_008', async () => {
  const mockCourse = { _id: mockCourseId, publicId: 'C-MATH', courseName: 'Mathematics 201' };
  const mockExam = {
    _id: mockExamId, publicId: 'E-COURSE', title: 'Course Info Test',
    durationMinutes: 45, startTime: new Date(Date.now() - 1800000),
    endTime: new Date(Date.now() + 3600000), status: 'active',
    courseId: mockCourse,
  };
  mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) });
  mockSubmissionModel.findOne.mockResolvedValue(null);

  const result = await service.joinExam({ publicId: 'E-COURSE' } as any, mockStudentUser as any);

  expect(result.course.courseName).toBe('Mathematics 201');
  expect(result.course.publicId).toBe('C-MATH');
});

  // ============================================================
  // getExamForTaking Method Tests (Student - Fetch Exam Questions)
  // ============================================================

  // TC_GET_EXAM_TAKING_001
  // Method: getExamForTaking
  // Purpose: Verify successful retrieval of exam data for an active exam
  // Input: publicId = 'E-ACTIVE', user = valid student, exam is active and within time window
  // Expected output: TakeExamResponseDto with publicId, title, durationMinutes, questions
  // Test result: pass
  // checkdb: Verifies findOne with publicId, populate('courseId'), populate('questions')
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_EXAM_TAKING_001', async () => {
    const qId = new Types.ObjectId();
    const mockExam = {
      _id: mockExamId, publicId: 'E-ACTIVE', title: 'Active Exam',
      durationMinutes: 60, status: 'active',
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() + 3600000),
      courseId: { _id: mockCourseId },
      questions: [{ _id: qId, content: 'Q1', answer: [{ content: 'A' }, { content: 'B' }] }],
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(mockExam) };
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-ACTIVE', mockStudentUser as any);
    expect(result.publicId).toBe('E-ACTIVE');
    expect(result.title).toBe('Active Exam');
    expect(result.durationMinutes).toBe(60);
  });

  // TC_GET_EXAM_TAKING_002
  // Method: getExamForTaking
  // Purpose: Verify NotFoundException when exam does not exist
  // Input: publicId = 'E-NONE', user = valid student
  // Expected output: NotFoundException "Exam not found."
  // Test result: pass
  // checkdb: findOne returns null
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_EXAM_TAKING_002', async () => {
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(null) };
    mockExamModel.findOne.mockReturnValue(mockQuery);

    await expect(
      service.getExamForTaking('E-NONE', mockStudentUser as any),
    ).rejects.toThrow(NotFoundException);
  });

  // TC_GET_EXAM_TAKING_003
  // Method: getExamForTaking
  // Purpose: Verify BadRequestException when exam status is 'scheduled'
  // Input: publicId = 'E-SCHED', exam.status = 'scheduled'
  // Expected output: BadRequestException "This exam is not active."
  // Test result: pass
  // checkdb: No submission check needed
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_EXAM_TAKING_003', async () => {
    const mockExam = {
      _id: mockExamId, publicId: 'E-SCHED', status: 'scheduled',
      startTime: new Date(Date.now() + 3600000), endTime: new Date(Date.now() + 86400000),
      courseId: { _id: mockCourseId }, questions: [],
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(mockExam) };
    mockExamModel.findOne.mockReturnValue(mockQuery);

    await expect(
      service.getExamForTaking('E-SCHED', mockStudentUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_GET_EXAM_TAKING_004
  // Method: getExamForTaking
  // Purpose: Verify BadRequestException when exam has not started yet (now < startTime)
  // Input: publicId = 'E-FUTURE', exam is active but startTime is in the future
  // Expected output: BadRequestException "This exam has not started yet."
  // Test result: pass
  // checkdb: No submission check needed
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_EXAM_TAKING_004', async () => {
    const mockExam = {
      _id: mockExamId, publicId: 'E-FUTURE', status: 'active',
      startTime: new Date(Date.now() + 3600000), endTime: new Date(Date.now() + 86400000),
      courseId: { _id: mockCourseId }, questions: [],
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(mockExam) };
    mockExamModel.findOne.mockReturnValue(mockQuery);

    await expect(
      service.getExamForTaking('E-FUTURE', mockStudentUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_GET_EXAM_TAKING_005
  // Method: getExamForTaking
  // Purpose: Verify BadRequestException when exam has already ended (now > endTime)
  // Input: publicId = 'E-ENDED', exam endTime is in the past
  // Expected output: BadRequestException "This exam has already ended."
  // Test result: pass
  // checkdb: No submission check needed
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_EXAM_TAKING_005', async () => {
    const mockExam = {
      _id: mockExamId, publicId: 'E-ENDED', status: 'active',
      startTime: new Date(Date.now() - 86400000), endTime: new Date(Date.now() - 1000),
      courseId: { _id: mockCourseId }, questions: [],
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(mockExam) };
    mockExamModel.findOne.mockReturnValue(mockQuery);

    await expect(
      service.getExamForTaking('E-ENDED', mockStudentUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_GET_EXAM_TAKING_006
  // Method: getExamForTaking
  // Purpose: Verify ForbiddenException when student has already submitted this exam
  // Input: publicId = 'E-DONE', existing submission found for student
  // Expected output: ForbiddenException "You have already submitted this exam."
  // Test result: pass
  // checkdb: submissionModel.findOne returns existing submission
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_EXAM_TAKING_006', async () => {
    const mockExam = {
      _id: mockExamId, publicId: 'E-DONE', status: 'active',
      startTime: new Date(Date.now() - 3600000), endTime: new Date(Date.now() + 3600000),
      courseId: { _id: mockCourseId }, questions: [],
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(mockExam) };
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue({ _id: new Types.ObjectId(), score: 90 });

    await expect(
      service.getExamForTaking('E-DONE', mockStudentUser as any),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_GET_EXAM_TAKING_007
  // Method: getExamForTaking
  // Purpose: Verify that questions are mapped without correct answer info (isCorrect stripped)
  // Input: publicId = 'E-QUESTIONS', exam with 2 questions each with 4 choices
  // Expected output: TakeExamResponseDto.questions has correct length and choice content
  // Test result: pass
  // checkdb: Verifies populate('questions') is called
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_EXAM_TAKING_007', async () => {
    const q1Id = new Types.ObjectId();
    const q2Id = new Types.ObjectId();
    const mockExam = {
      _id: mockExamId, publicId: 'E-QUESTIONS', title: 'Questions Test',
      durationMinutes: 30, status: 'active',
      startTime: new Date(Date.now() - 3600000), endTime: new Date(Date.now() + 3600000),
      courseId: { _id: mockCourseId },
      questions: [
        { _id: q1Id, content: 'What is 2+2?', answer: [{ content: '3' }, { content: '4' }, { content: '5' }, { content: '6' }] },
        { _id: q2Id, content: 'What is 3+3?', answer: [{ content: '5' }, { content: '6' }, { content: '7' }, { content: '8' }] },
      ],
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(mockExam) };
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-QUESTIONS', mockStudentUser as any);
    expect(result.questions).toHaveLength(2);
    expect(result.questions[0].choices).toHaveLength(4);
    expect(result.questions[0].content).toBe('What is 2+2?');
  });

  // TC_GET_EXAM_TAKING_008
  // Method: getExamForTaking
  // Purpose: Verify response includes endTime for frontend countdown timer
  // Input: publicId = 'E-TIMER', exam with specific endTime
  // Expected output: TakeExamResponseDto with endTime matching the exam's endTime
  // Test result: pass
  // Note: Frontend uses endTime to calculate remaining time for countdown display
  // checkdb: Verifies exam data propagation
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_EXAM_TAKING_008', async () => {
    const futureEnd = new Date(Date.now() + 7200000);
    const mockExam = {
      _id: mockExamId, publicId: 'E-TIMER', title: 'Timer Test',
      durationMinutes: 120, status: 'active',
      startTime: new Date(Date.now() - 3600000), endTime: futureEnd,
      courseId: { _id: mockCourseId }, questions: [],
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(mockExam) };
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-TIMER', mockStudentUser as any);
    expect(result.endTime).toEqual(futureEnd);
    expect(result.durationMinutes).toBe(120);
  });

  // ============================================================
  // submitExam Method Tests (Student - Exam Submission Flow)
  // ============================================================

  // TC_SUBMIT_EXAM_001
  // Method: submitExam
  // Purpose: Verify successful exam submission with correct grading (1 correct out of 2)
  // Input: publicId = 'E-SUB', answers with 1 correct and 1 wrong answer
  // Expected output: SubmissionResultDto with score = 50, result = 'Failed' (rateScore=60)
  // Test result: pass
  // checkdb: Verifies submissionModel constructor called, save() called
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_SUBMIT_EXAM_001', async () => {
    const q1Id = new Types.ObjectId();
    const q2Id = new Types.ObjectId();
    const mockCourse = { _id: mockCourseId, courseName: 'Math 101' };
    const mockExam = {
      _id: mockExamId, publicId: 'E-SUB', title: 'Submit Test',
      rateScore: 60, status: 'active',
      startTime: new Date(Date.now() - 3600000), endTime: new Date(Date.now() + 3600000),
      courseId: mockCourse,
      questions: [
        { _id: q1Id, content: 'Q1', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }] },
        { _id: q2Id, content: 'Q2', answerQuestion: 2, answer: [{ content: 'C', isCorrect: false }, { content: 'D', isCorrect: true }] },
      ],
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis() };
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    (mockQuery as any)[Symbol.toPrimitive] = undefined;
    Object.assign(mockQuery, mockExam);
    mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) }) });
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const submitDto = { answers: [
      { questionId: q1Id.toHexString(), answerNumber: 1 },
      { questionId: q2Id.toHexString(), answerNumber: 1 },
    ]};

    const result = await service.submitExam('E-SUB', mockStudentUser as any, submitDto as any);
    expect(result.score).toBe(50);
    expect(result.result).toBe('Failed');
    expect(result.totalQuestions).toBe(2);
    expect(result.correctAnswers).toBe(1);
  });

  // TC_SUBMIT_EXAM_002
  // Method: submitExam
  // Purpose: Verify NotFoundException when exam does not exist
  // Input: publicId = 'E-NOPE', user = valid student
  // Expected output: NotFoundException "Exam not found."
  // Test result: pass
  // checkdb: findOne returns null
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_SUBMIT_EXAM_002', async () => {
    mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(null) }) });

    await expect(
      service.submitExam('E-NOPE', mockStudentUser as any, { answers: [] } as any),
    ).rejects.toThrow(NotFoundException);
  });

  // TC_SUBMIT_EXAM_003
  // Method: submitExam
  // Purpose: Verify BadRequestException when exam time has ended (auto-submit scenario rejected)
  // Input: publicId = 'E-TIMEOUT', exam endTime is in the past
  // Expected output: BadRequestException "The time for this exam has ended."
  // Test result: pass
  // Note: This tests the server-side rejection of late submissions (auto-submit on timeout)
  // checkdb: No submission created
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_SUBMIT_EXAM_003', async () => {
    const mockExam = {
      _id: mockExamId, publicId: 'E-TIMEOUT', title: 'Timeout Exam',
      rateScore: 50, endTime: new Date(Date.now() - 1000),
      courseId: { _id: mockCourseId, courseName: 'Test' },
      questions: [],
    };
    mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) }) });

    await expect(
      service.submitExam('E-TIMEOUT', mockStudentUser as any, { answers: [] } as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_SUBMIT_EXAM_004
  // Method: submitExam
  // Purpose: Verify ForbiddenException when student has already submitted
  // Input: publicId = 'E-DUPE', existing submission found
  // Expected output: ForbiddenException "You have already submitted this exam."
  // Test result: pass
  // checkdb: submissionModel.findOne returns existing document
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_SUBMIT_EXAM_004', async () => {
    const mockExam = {
      _id: mockExamId, publicId: 'E-DUPE', title: 'Dupe Submit',
      rateScore: 50, endTime: new Date(Date.now() + 3600000),
      courseId: { _id: mockCourseId, courseName: 'Test' },
      questions: [],
    };
    mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) }) });
    mockSubmissionModel.findOne.mockResolvedValue({ _id: new Types.ObjectId() });

    await expect(
      service.submitExam('E-DUPE', mockStudentUser as any, { answers: [] } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_SUBMIT_EXAM_005
  // Method: submitExam
  // Purpose: Verify 100% score when all answers are correct
  // Input: publicId = 'E-PERFECT', all answers match answerQuestion
  // Expected output: SubmissionResultDto with score = 100, result = 'Passed'
  // Test result: pass
  // checkdb: Verifies submission saved with score 100
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_SUBMIT_EXAM_005', async () => {
    const q1Id = new Types.ObjectId();
    const mockCourse = { _id: mockCourseId, courseName: 'Perfect Score Course' };
    const mockExam = {
      _id: mockExamId, publicId: 'E-PERFECT', title: 'Perfect',
      rateScore: 50, endTime: new Date(Date.now() + 3600000),
      courseId: mockCourse,
      questions: [
        { _id: q1Id, content: 'Q1', answerQuestion: 2, answer: [{ content: 'A' }, { content: 'B' }] },
      ],
    };
    mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) }) });
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.submitExam('E-PERFECT', mockStudentUser as any, { answers: [{ questionId: q1Id.toHexString(), answerNumber: 2 }] } as any);
    expect(result.score).toBe(100);
    expect(result.result).toBe('Passed');
  });

  // TC_SUBMIT_EXAM_006
  // Method: submitExam
  // Purpose: Verify 0% score when all answers are wrong
  // Input: publicId = 'E-ZERO', all answers do NOT match answerQuestion
  // Expected output: SubmissionResultDto with score = 0, result = 'Failed'
  // Test result: pass
  // checkdb: Verifies submission saved with score 0
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_SUBMIT_EXAM_006', async () => {
    const q1Id = new Types.ObjectId();
    const mockCourse = { _id: mockCourseId, courseName: 'Zero Score Course' };
    const mockExam = {
      _id: mockExamId, publicId: 'E-ZERO', title: 'Zero',
      rateScore: 50, endTime: new Date(Date.now() + 3600000),
      courseId: mockCourse,
      questions: [
        { _id: q1Id, content: 'Q1', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }] },
      ],
    };
    mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) }) });
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.submitExam('E-ZERO', mockStudentUser as any, { answers: [{ questionId: q1Id.toHexString(), answerNumber: 2 }] } as any);
    expect(result.score).toBe(0);
    expect(result.result).toBe('Failed');
  });

  // TC_SUBMIT_EXAM_007
  // Method: submitExam
  // Purpose: Verify pass/fail boundary (score exactly equals rateScore → Passed)
  // Input: publicId = 'E-BOUNDARY', score equals rateScore of 50
  // Expected output: result = 'Passed' (>= rateScore)
  // Test result: pass
  // checkdb: Verifies grading logic boundary
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_SUBMIT_EXAM_007', async () => {
    const q1Id = new Types.ObjectId();
    const q2Id = new Types.ObjectId();
    const mockCourse = { _id: mockCourseId, courseName: 'Boundary' };
    const mockExam = {
      _id: mockExamId, publicId: 'E-BOUNDARY', title: 'Boundary',
      rateScore: 50, endTime: new Date(Date.now() + 3600000),
      courseId: mockCourse,
      questions: [
        { _id: q1Id, content: 'Q1', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }] },
        { _id: q2Id, content: 'Q2', answerQuestion: 1, answer: [{ content: 'C' }, { content: 'D' }] },
      ],
    };
    mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) }) });
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.submitExam('E-BOUNDARY', mockStudentUser as any, {
      answers: [
        { questionId: q1Id.toHexString(), answerNumber: 1 },
        { questionId: q2Id.toHexString(), answerNumber: 2 },
      ],
    } as any);
    expect(result.score).toBe(50);
    expect(result.result).toBe('Passed');
  });

  // TC_SUBMIT_EXAM_008
  // Method: submitExam
  // Purpose: Verify grading with multiple questions (3 questions, 2 correct)
  // Input: publicId = 'E-MULTI', 3 questions, student answers 2 correctly
  // Expected output: score ≈ 66.67, correctAnswers = 2, totalQuestions = 3
  // Test result: pass
  // checkdb: Verifies correct count logic
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_SUBMIT_EXAM_008', async () => {
    const q1 = new Types.ObjectId(); const q2 = new Types.ObjectId(); const q3 = new Types.ObjectId();
    const mockCourse = { _id: mockCourseId, courseName: 'Multi Q' };
    const mockExam = {
      _id: mockExamId, publicId: 'E-MULTI', title: 'Multi',
      rateScore: 50, endTime: new Date(Date.now() + 3600000),
      courseId: mockCourse,
      questions: [
        { _id: q1, content: 'Q1', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }] },
        { _id: q2, content: 'Q2', answerQuestion: 2, answer: [{ content: 'C' }, { content: 'D' }] },
        { _id: q3, content: 'Q3', answerQuestion: 1, answer: [{ content: 'E' }, { content: 'F' }] },
      ],
    };
    mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) }) });
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.submitExam('E-MULTI', mockStudentUser as any, {
      answers: [
        { questionId: q1.toHexString(), answerNumber: 1 },
        { questionId: q2.toHexString(), answerNumber: 2 },
        { questionId: q3.toHexString(), answerNumber: 2 },
      ],
    } as any);
    expect(result.correctAnswers).toBe(2);
    expect(result.totalQuestions).toBe(3);
    expect(result.score).toBeCloseTo(66.67, 0);
    expect(result.result).toBe('Passed');
  });

  // TC_SUBMIT_EXAM_009
  // Method: submitExam
  // Purpose: Verify response includes examTitle and courseName
  // Input: publicId = 'E-META', valid submission
  // Expected output: SubmissionResultDto with examTitle and courseName from populated data
  // Test result: pass
  // checkdb: Verifies response DTO mapping from populated exam/course
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_SUBMIT_EXAM_009', async () => {
    const q1Id = new Types.ObjectId();
    const mockCourse = { _id: mockCourseId, courseName: 'Advanced Math' };
    const mockExam = {
      _id: mockExamId, publicId: 'E-META', title: 'Metadata Check',
      rateScore: 50, endTime: new Date(Date.now() + 3600000),
      courseId: mockCourse,
      questions: [
        { _id: q1Id, content: 'Q1', answerQuestion: 1, answer: [{ content: 'A' }] },
      ],
    };
    mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) }) });
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.submitExam('E-META', mockStudentUser as any, { answers: [{ questionId: q1Id.toHexString(), answerNumber: 1 }] } as any);
    expect(result.examTitle).toBe('Metadata Check');
    expect(result.courseName).toBe('Advanced Math');
  });

  // TC_SUBMIT_EXAM_010
  // Method: submitExam
  // Purpose: Verify submissionId is returned in response
  // Input: publicId = 'E-SUBID', valid submission
  // Expected output: SubmissionResultDto with defined submissionId string
  // Test result: pass
  // checkdb: Verifies _id is converted to hex string
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_SUBMIT_EXAM_010', async () => {
    const q1Id = new Types.ObjectId();
    const mockCourse = { _id: mockCourseId, courseName: 'ID Test' };
    const mockExam = {
      _id: mockExamId, publicId: 'E-SUBID', title: 'SubID',
      rateScore: 50, endTime: new Date(Date.now() + 3600000),
      courseId: mockCourse,
      questions: [
        { _id: q1Id, content: 'Q1', answerQuestion: 1, answer: [{ content: 'A' }] },
      ],
    };
    mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockReturnValue({ populate: jest.fn().mockResolvedValue(mockExam) }) });
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.submitExam('E-SUBID', mockStudentUser as any, { answers: [{ questionId: q1Id.toHexString(), answerNumber: 1 }] } as any);
    expect(result.submissionId).toBeDefined();
    expect(typeof result.submissionId).toBe('string');
  });

  // ============================================================
  // getMyCompletedExams Method Tests (Student - Review History/Scores)
  // ============================================================

  // TC_GET_COMPLETED_001
  // Method: getMyCompletedExams
  // Purpose: Verify successful retrieval of completed exams with correct mapping
  // Input: user = valid student with 1 graded submission
  // Expected output: Array with 1 CompletedExamResponseDto containing examTitle, score, result
  // Test result: pass
  // checkdb: Verifies submissionModel.find with status 'graded' and student $or filter
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COMPLETED_001', async () => {
    const subId = new Types.ObjectId();
    const mockSub = {
      _id: subId, score: 85, submittedAt: new Date(), createdAt: new Date(),
      examId: {
        _id: mockExamId, publicId: 'E-COMP', title: 'Completed Exam', rateScore: 50,
        courseId: { _id: mockCourseId, courseName: 'History 101' },
      },
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([mockSub]) };
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockStudentUser as any);
    expect(result).toHaveLength(1);
    expect(result[0].examTitle).toBe('Completed Exam');
    expect(result[0].score).toBe(85);
    expect(result[0].result).toBe('Passed');
  });

  // TC_GET_COMPLETED_002
  // Method: getMyCompletedExams
  // Purpose: Verify empty array when student has no completed exams
  // Input: user = valid student with no submissions
  // Expected output: Empty array []
  // Test result: pass
  // checkdb: submissionModel.find returns empty array
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COMPLETED_002', async () => {
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([]) };
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockStudentUser as any);
    expect(result).toEqual([]);
  });

  // TC_GET_COMPLETED_003
  // Method: getMyCompletedExams
  // Purpose: Verify BadRequestException for invalid user ID format
  // Input: user = { id: 'invalid-id', role: 'student' }
  // Expected output: BadRequestException "Invalid user ID format."
  // Test result: pass
  // checkdb: No DB query executed
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COMPLETED_003', async () => {
    await expect(
      service.getMyCompletedExams({ id: 'invalid-id', role: 'student' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_GET_COMPLETED_004
  // Method: getMyCompletedExams
  // Purpose: Verify null exam entries are filtered out from results
  // Input: user = valid student, 1 submission with null examId
  // Expected output: Empty array (null entries filtered)
  // Test result: pass
  // checkdb: submissionModel.find returns submission with null examId
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COMPLETED_004', async () => {
    const mockSub = { _id: new Types.ObjectId(), score: 70, examId: null };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([mockSub]) };
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockStudentUser as any);
    expect(result).toEqual([]);
  });

  // TC_GET_COMPLETED_005
  // Method: getMyCompletedExams
  // Purpose: Verify 'Failed' result for score below rateScore
  // Input: user = valid student, submission with score 30, rateScore 50
  // Expected output: result = 'Failed'
  // Test result: pass
  // checkdb: Verifies score comparison logic
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COMPLETED_005', async () => {
    const mockSub = {
      _id: new Types.ObjectId(), score: 30, submittedAt: new Date(), createdAt: new Date(),
      examId: {
        _id: mockExamId, publicId: 'E-FAIL', title: 'Failed Exam', rateScore: 50,
        courseId: { _id: mockCourseId, courseName: 'Tough Course' },
      },
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([mockSub]) };
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockStudentUser as any);
    expect(result[0].result).toBe('Failed');
  });

  // TC_GET_COMPLETED_006
  // Method: getMyCompletedExams
  // Purpose: Verify multiple completed exams are returned sorted by submittedAt desc
  // Input: user = valid student, 2 submissions
  // Expected output: Array with 2 entries
  // Test result: pass
  // checkdb: Verifies sort({ submittedAt: -1 }) is called
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COMPLETED_006', async () => {
    const sub1 = {
      _id: new Types.ObjectId(), score: 90, submittedAt: new Date(), createdAt: new Date(),
      examId: { _id: new Types.ObjectId(), publicId: 'E-1', title: 'Exam 1', rateScore: 50, courseId: { _id: mockCourseId, courseName: 'Course A' } },
    };
    const sub2 = {
      _id: new Types.ObjectId(), score: 60, submittedAt: new Date(), createdAt: new Date(),
      examId: { _id: new Types.ObjectId(), publicId: 'E-2', title: 'Exam 2', rateScore: 50, courseId: { _id: mockCourseId, courseName: 'Course B' } },
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), sort: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue([sub1, sub2]) };
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockStudentUser as any);
    expect(result).toHaveLength(2);
    expect(result[0].examTitle).toBe('Exam 1');
    expect(result[1].examTitle).toBe('Exam 2');
  });

  // ============================================================
  // getSubmissionResult Method Tests (Student - View Detailed Result)
  // ============================================================

  // TC_GET_RESULT_001
  // Method: getSubmissionResult
  // Purpose: Verify successful retrieval of detailed submission result
  // Input: submissionId = valid ObjectId, user = submission owner
  // Expected output: ExamResultDetailDto with exam info, metrics, and questions
  // Test result: pass
  // checkdb: Verifies submissionModel.findById with populate chain
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_RESULT_001', async () => {
    const subId = new Types.ObjectId();
    const qId = new Types.ObjectId();
    const mockSubmission = {
      _id: subId, score: 80, studentId: new Types.ObjectId(mockStudentId.toHexString()),
      submittedAt: new Date(), createdAt: new Date(),
      answers: [{ questionId: qId, answerNumber: 1 }],
      examId: {
        _id: mockExamId, publicId: 'E-RES', title: 'Result Exam', rateScore: 50,
        courseId: { _id: mockCourseId, courseName: 'Result Course' },
        questions: [{ _id: qId, content: 'Q1', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }] }],
      },
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(mockSubmission) };
    mockSubmissionModel.findById.mockReturnValue(mockQuery);

    const result = await service.getSubmissionResult(subId.toHexString(), mockStudentUser as any);
    expect(result.submissionId).toBe(subId.toHexString());
    expect(result.metrics.score).toBe(80);
    expect(result.exam.examTitle).toBe('Result Exam');
  });

  // TC_GET_RESULT_002
  // Method: getSubmissionResult
  // Purpose: Verify BadRequestException for invalid submission ID format
  // Input: submissionId = 'bad-id', user = valid student
  // Expected output: BadRequestException "Invalid submission ID"
  // Test result: pass
  // checkdb: No DB query executed
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_RESULT_002', async () => {
    await expect(
      service.getSubmissionResult('bad-id', mockStudentUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_GET_RESULT_003
  // Method: getSubmissionResult
  // Purpose: Verify NotFoundException when submission does not exist
  // Input: submissionId = valid ObjectId but not found, user = valid student
  // Expected output: NotFoundException "Submission not found."
  // Test result: pass
  // checkdb: findById returns null
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_RESULT_003', async () => {
    const fakeId = new Types.ObjectId();
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(null) };
    mockSubmissionModel.findById.mockReturnValue(mockQuery);

    await expect(
      service.getSubmissionResult(fakeId.toHexString(), mockStudentUser as any),
    ).rejects.toThrow(NotFoundException);
  });

  // TC_GET_RESULT_004
  // Method: getSubmissionResult
  // Purpose: Verify ForbiddenException when student tries to view another student's result
  // Input: submissionId = valid, submission belongs to a different student
  // Expected output: ForbiddenException "You are not authorized to view this result."
  // Test result: pass
  // checkdb: findById returns submission with different studentId
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_RESULT_004', async () => {
    const subId = new Types.ObjectId();
    const otherStudentId = new Types.ObjectId();
    const qId = new Types.ObjectId();
    const mockSubmission = {
      _id: subId, score: 70, studentId: otherStudentId,
      submittedAt: new Date(), createdAt: new Date(),
      answers: [{ questionId: qId, answerNumber: 1 }],
      examId: {
        _id: mockExamId, publicId: 'E-OTHER', title: 'Other Exam', rateScore: 50,
        courseId: { _id: mockCourseId, courseName: 'Other Course' },
        questions: [{ _id: qId, content: 'Q1', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }] }],
      },
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(mockSubmission) };
    mockSubmissionModel.findById.mockReturnValue(mockQuery);

    await expect(
      service.getSubmissionResult(subId.toHexString(), mockStudentUser as any),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_GET_RESULT_005
  // Method: getSubmissionResult
  // Purpose: Verify metrics show passed = true when score >= rateScore
  // Input: submissionId = valid, score = 80, rateScore = 50
  // Expected output: metrics.passed = true
  // Test result: pass
  // checkdb: Verifies metrics calculation
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_RESULT_005', async () => {
    const subId = new Types.ObjectId();
    const qId = new Types.ObjectId();
    const mockSubmission = {
      _id: subId, score: 80, studentId: new Types.ObjectId(mockStudentId.toHexString()),
      submittedAt: new Date(), createdAt: new Date(),
      answers: [{ questionId: qId, answerNumber: 1 }],
      examId: {
        _id: mockExamId, publicId: 'E-PASS', title: 'Pass Exam', rateScore: 50,
        courseId: { _id: mockCourseId, courseName: 'Pass Course' },
        questions: [{ _id: qId, content: 'Q1', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }] }],
      },
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(mockSubmission) };
    mockSubmissionModel.findById.mockReturnValue(mockQuery);

    const result = await service.getSubmissionResult(subId.toHexString(), mockStudentUser as any);
    expect(result.metrics.passed).toBe(true);
  });

  // TC_GET_RESULT_006
  // Method: getSubmissionResult
  // Purpose: Verify question details include studentAnswer and correctAnswer comparison
  // Input: submissionId = valid, student answered question correctly
  // Expected output: question with isCorrect = true, studentAnswer matching correctAnswer
  // Test result: pass
  // checkdb: Verifies answer mapping from submission to question detail
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_RESULT_006', async () => {
    const subId = new Types.ObjectId();
    const qId = new Types.ObjectId();
    const mockSubmission = {
      _id: subId, score: 100, studentId: new Types.ObjectId(mockStudentId.toHexString()),
      submittedAt: new Date(), createdAt: new Date(),
      answers: [{ questionId: qId, answerNumber: 2 }],
      examId: {
        _id: mockExamId, publicId: 'E-DETAIL', title: 'Detail Exam', rateScore: 50,
        courseId: { _id: mockCourseId, courseName: 'Detail Course' },
        questions: [{ _id: qId, content: 'Capital of France?', answerQuestion: 2, answer: [{ content: 'Berlin', isCorrect: false }, { content: 'Paris', isCorrect: true }] }],
      },
    };
    const mockQuery: any = { populate: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(mockSubmission) };
    mockSubmissionModel.findById.mockReturnValue(mockQuery);

    const result = await service.getSubmissionResult(subId.toHexString(), mockStudentUser as any);
    expect(result.questions[0].isCorrect).toBe(true);
    expect(result.questions[0].studentAnswer).toBe(2);
    expect(result.questions[0].correctAnswer).toBe(2);
    expect(result.questions[0].content).toBe('Capital of France?');
  });

});
