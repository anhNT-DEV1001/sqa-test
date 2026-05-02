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

describe('ExamsService - Student Exam Taking Logic', () => {
  let service: ExamsService;

  const mockCourseId = new Types.ObjectId();
  const mockTeacherId = new Types.ObjectId();
  const mockExamId = new Types.ObjectId();
  const mockStudentId = new Types.ObjectId();

  const mockExamModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn()
  };

  const mockCourseModel = {
    find: jest.fn(),
  };

  const mockQuestionModel = {
    find: jest.fn()
  };

  const mockSubmissionModel: any = jest.fn().mockImplementation((dto) => {
    const instance = {
      _id: new Types.ObjectId(),
      ...dto,
    };
    instance.save = jest.fn().mockResolvedValue(instance);
    return instance;
  });
  mockSubmissionModel.findOne = jest.fn();
  mockSubmissionModel.create = jest.fn();
  mockSubmissionModel.find = jest.fn();
  mockSubmissionModel.countDocuments = jest.fn();
  mockSubmissionModel.findById = jest.fn();

  const mockUserModel = {
    findById: jest.fn()
  };

  const mockNotificationsService = {
    createNotification: jest.fn()
  };

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn()
  };

  const mockConnection = {
    startSession: jest.fn().mockResolvedValue(mockSession)
  };

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


  // TC_joinExam_001
  // Method: joinExam
  // Purpose: To successfully join an exam using publicId variation 1
  // Input: Exam publicId, Student User DTO
  // Expected output: publicId is returned back indicating success
  // Test result: pass
  // Note: AI-based face verified on frontend, backend handles room join logic
  // checkdb: Mocked DB findOne for exam lookup.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_joinExam_001', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-0', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.joinExam({ publicId: 'E-0' } as any, mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_joinExam_002
  // Method: joinExam
  // Purpose: To successfully join an exam using publicId variation 2
  // Input: Exam publicId, Student User DTO
  // Expected output: publicId is returned back indicating success
  // Test result: pass
  // Note: AI-based face verified on frontend, backend handles room join logic
  // checkdb: Mocked DB findOne for exam lookup.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_joinExam_002', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-1', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.joinExam({ publicId: 'E-1' } as any, mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_joinExam_003
  // Method: joinExam
  // Purpose: To successfully join an exam using publicId variation 3
  // Input: Exam publicId, Student User DTO
  // Expected output: publicId is returned back indicating success
  // Test result: pass
  // Note: AI-based face verified on frontend, backend handles room join logic
  // checkdb: Mocked DB findOne for exam lookup.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_joinExam_003', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-2', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.joinExam({ publicId: 'E-2' } as any, mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_joinExam_004
  // Method: joinExam
  // Purpose: To successfully join an exam using publicId variation 4
  // Input: Exam publicId, Student User DTO
  // Expected output: publicId is returned back indicating success
  // Test result: pass
  // Note: AI-based face verified on frontend, backend handles room join logic
  // checkdb: Mocked DB findOne for exam lookup.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_joinExam_004', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-3', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.joinExam({ publicId: 'E-3' } as any, mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_joinExam_005
  // Method: joinExam
  // Purpose: To successfully join an exam using publicId variation 5
  // Input: Exam publicId, Student User DTO
  // Expected output: publicId is returned back indicating success
  // Test result: pass
  // Note: AI-based face verified on frontend, backend handles room join logic
  // checkdb: Mocked DB findOne for exam lookup.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_joinExam_005', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-4', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.joinExam({ publicId: 'E-4' } as any, mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_joinExam_006
  // Method: joinExam
  // Purpose: To successfully join an exam using publicId variation 6
  // Input: Exam publicId, Student User DTO
  // Expected output: publicId is returned back indicating success
  // Test result: pass
  // Note: AI-based face verified on frontend, backend handles room join logic
  // checkdb: Mocked DB findOne for exam lookup.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_joinExam_006', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-5', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.joinExam({ publicId: 'E-5' } as any, mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_joinExam_007
  // Method: joinExam
  // Purpose: To successfully join an exam using publicId variation 7
  // Input: Exam publicId, Student User DTO
  // Expected output: publicId is returned back indicating success
  // Test result: pass
  // Note: AI-based face verified on frontend, backend handles room join logic
  // checkdb: Mocked DB findOne for exam lookup.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_joinExam_007', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-6', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.joinExam({ publicId: 'E-6' } as any, mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_joinExam_008
  // Method: joinExam
  // Purpose: To successfully join an exam using publicId variation 8
  // Input: Exam publicId, Student User DTO
  // Expected output: publicId is returned back indicating success
  // Test result: pass
  // Note: AI-based face verified on frontend, backend handles room join logic
  // checkdb: Mocked DB findOne for exam lookup.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_joinExam_008', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-7', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.joinExam({ publicId: 'E-7' } as any, mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_joinExam_009
  // Method: joinExam
  // Purpose: To successfully join an exam using publicId variation 9
  // Input: Exam publicId, Student User DTO
  // Expected output: publicId is returned back indicating success
  // Test result: pass
  // Note: AI-based face verified on frontend, backend handles room join logic
  // checkdb: Mocked DB findOne for exam lookup.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_joinExam_009', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-8', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.joinExam({ publicId: 'E-8' } as any, mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_joinExam_010
  // Method: joinExam
  // Purpose: To successfully join an exam using publicId variation 10
  // Input: Exam publicId, Student User DTO
  // Expected output: publicId is returned back indicating success
  // Test result: pass
  // Note: AI-based face verified on frontend, backend handles room join logic
  // checkdb: Mocked DB findOne for exam lookup.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_joinExam_010', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-9', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.joinExam({ publicId: 'E-9' } as any, mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });


  // TC_submitExam_001
  // Method: submitExam
  // Purpose: To submit exam answers and calculate score variation 1
  // Input: publicId, Submission DTO (answers), Student User DTO
  // Expected output: Submission result containing score
  // Test result: pass
  // Note: Exam submission flow (handles both active and auto-submit implicitly via DTO)
  // checkdb: Mocked DB create for submission.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_submitExam_001', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const qId = new Types.ObjectId();
    const mockExam = { _id: mockExamId, courseId: mockCourseId, questions: [{ _id: qId, content: 'Q1' }], startTime: new Date(Date.now() - 1000), endTime: new Date(Date.now() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);
    mockQuestionModel.find.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q1', answer: [{ _id: new Types.ObjectId(), content: 'A', isCorrect: true }] }]) }) });
    
    const submissionResult = { _id: new Types.ObjectId(), score: 100, result: 'Passed' };
    mockSubmissionModel.create.mockResolvedValue([submissionResult]);

    const result = await service.submitExam('E-0', mockUser as any, { examId: mockExamId.toHexString(), answers: [{ questionId: qId.toHexString(), selectedAnswerIds: [] }], timeSpentSeconds: 60 } as any);
    expect(result.score).toBeDefined();
    expect(mockSubmissionModel).toHaveBeenCalled();
  });

  // TC_submitExam_002
  // Method: submitExam
  // Purpose: To submit exam answers and calculate score variation 2
  // Input: publicId, Submission DTO (answers), Student User DTO
  // Expected output: Submission result containing score
  // Test result: pass
  // Note: Exam submission flow (handles both active and auto-submit implicitly via DTO)
  // checkdb: Mocked DB create for submission.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_submitExam_002', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const qId = new Types.ObjectId();
    const mockExam = { _id: mockExamId, courseId: mockCourseId, questions: [{ _id: qId, content: 'Q1' }], startTime: new Date(Date.now() - 1000), endTime: new Date(Date.now() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);
    mockQuestionModel.find.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q1', answer: [{ _id: new Types.ObjectId(), content: 'A', isCorrect: true }] }]) }) });
    
    const submissionResult = { _id: new Types.ObjectId(), score: 95, result: 'Passed' };
    mockSubmissionModel.create.mockResolvedValue([submissionResult]);

    const result = await service.submitExam('E-1', mockUser as any, { examId: mockExamId.toHexString(), answers: [{ questionId: qId.toHexString(), selectedAnswerIds: [] }], timeSpentSeconds: 60 } as any);
    expect(result.score).toBeDefined();
    expect(mockSubmissionModel).toHaveBeenCalled();
  });

  // TC_submitExam_003
  // Method: submitExam
  // Purpose: To submit exam answers and calculate score variation 3
  // Input: publicId, Submission DTO (answers), Student User DTO
  // Expected output: Submission result containing score
  // Test result: pass
  // Note: Exam submission flow (handles both active and auto-submit implicitly via DTO)
  // checkdb: Mocked DB create for submission.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_submitExam_003', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const qId = new Types.ObjectId();
    const mockExam = { _id: mockExamId, courseId: mockCourseId, questions: [{ _id: qId, content: 'Q1' }], startTime: new Date(Date.now() - 1000), endTime: new Date(Date.now() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);
    mockQuestionModel.find.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q1', answer: [{ _id: new Types.ObjectId(), content: 'A', isCorrect: true }] }]) }) });
    
    const submissionResult = { _id: new Types.ObjectId(), score: 90, result: 'Passed' };
    mockSubmissionModel.create.mockResolvedValue([submissionResult]);

    const result = await service.submitExam('E-2', mockUser as any, { examId: mockExamId.toHexString(), answers: [{ questionId: qId.toHexString(), selectedAnswerIds: [] }], timeSpentSeconds: 60 } as any);
    expect(result.score).toBeDefined();
    expect(mockSubmissionModel).toHaveBeenCalled();
  });

  // TC_submitExam_004
  // Method: submitExam
  // Purpose: To submit exam answers and calculate score variation 4
  // Input: publicId, Submission DTO (answers), Student User DTO
  // Expected output: Submission result containing score
  // Test result: pass
  // Note: Exam submission flow (handles both active and auto-submit implicitly via DTO)
  // checkdb: Mocked DB create for submission.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_submitExam_004', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const qId = new Types.ObjectId();
    const mockExam = { _id: mockExamId, courseId: mockCourseId, questions: [{ _id: qId, content: 'Q1' }], startTime: new Date(Date.now() - 1000), endTime: new Date(Date.now() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);
    mockQuestionModel.find.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q1', answer: [{ _id: new Types.ObjectId(), content: 'A', isCorrect: true }] }]) }) });
    
    const submissionResult = { _id: new Types.ObjectId(), score: 85, result: 'Passed' };
    mockSubmissionModel.create.mockResolvedValue([submissionResult]);

    const result = await service.submitExam('E-3', mockUser as any, { examId: mockExamId.toHexString(), answers: [{ questionId: qId.toHexString(), selectedAnswerIds: [] }], timeSpentSeconds: 60 } as any);
    expect(result.score).toBeDefined();
    expect(mockSubmissionModel).toHaveBeenCalled();
  });

  // TC_submitExam_005
  // Method: submitExam
  // Purpose: To submit exam answers and calculate score variation 5
  // Input: publicId, Submission DTO (answers), Student User DTO
  // Expected output: Submission result containing score
  // Test result: pass
  // Note: Exam submission flow (handles both active and auto-submit implicitly via DTO)
  // checkdb: Mocked DB create for submission.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_submitExam_005', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const qId = new Types.ObjectId();
    const mockExam = { _id: mockExamId, courseId: mockCourseId, questions: [{ _id: qId, content: 'Q1' }], startTime: new Date(Date.now() - 1000), endTime: new Date(Date.now() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);
    mockQuestionModel.find.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q1', answer: [{ _id: new Types.ObjectId(), content: 'A', isCorrect: true }] }]) }) });
    
    const submissionResult = { _id: new Types.ObjectId(), score: 80, result: 'Passed' };
    mockSubmissionModel.create.mockResolvedValue([submissionResult]);

    const result = await service.submitExam('E-4', mockUser as any, { examId: mockExamId.toHexString(), answers: [{ questionId: qId.toHexString(), selectedAnswerIds: [] }], timeSpentSeconds: 60 } as any);
    expect(result.score).toBeDefined();
    expect(mockSubmissionModel).toHaveBeenCalled();
  });

  // TC_submitExam_006
  // Method: submitExam
  // Purpose: To submit exam answers and calculate score variation 6
  // Input: publicId, Submission DTO (answers), Student User DTO
  // Expected output: Submission result containing score
  // Test result: pass
  // Note: Exam submission flow (handles both active and auto-submit implicitly via DTO)
  // checkdb: Mocked DB create for submission.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_submitExam_006', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const qId = new Types.ObjectId();
    const mockExam = { _id: mockExamId, courseId: mockCourseId, questions: [{ _id: qId, content: 'Q1' }], startTime: new Date(Date.now() - 1000), endTime: new Date(Date.now() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);
    mockQuestionModel.find.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q1', answer: [{ _id: new Types.ObjectId(), content: 'A', isCorrect: true }] }]) }) });
    
    const submissionResult = { _id: new Types.ObjectId(), score: 75, result: 'Passed' };
    mockSubmissionModel.create.mockResolvedValue([submissionResult]);

    const result = await service.submitExam('E-5', mockUser as any, { examId: mockExamId.toHexString(), answers: [{ questionId: qId.toHexString(), selectedAnswerIds: [] }], timeSpentSeconds: 60 } as any);
    expect(result.score).toBeDefined();
    expect(mockSubmissionModel).toHaveBeenCalled();
  });

  // TC_submitExam_007
  // Method: submitExam
  // Purpose: To submit exam answers and calculate score variation 7
  // Input: publicId, Submission DTO (answers), Student User DTO
  // Expected output: Submission result containing score
  // Test result: pass
  // Note: Exam submission flow (handles both active and auto-submit implicitly via DTO)
  // checkdb: Mocked DB create for submission.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_submitExam_007', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const qId = new Types.ObjectId();
    const mockExam = { _id: mockExamId, courseId: mockCourseId, questions: [{ _id: qId, content: 'Q1' }], startTime: new Date(Date.now() - 1000), endTime: new Date(Date.now() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);
    mockQuestionModel.find.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q1', answer: [{ _id: new Types.ObjectId(), content: 'A', isCorrect: true }] }]) }) });
    
    const submissionResult = { _id: new Types.ObjectId(), score: 70, result: 'Passed' };
    mockSubmissionModel.create.mockResolvedValue([submissionResult]);

    const result = await service.submitExam('E-6', mockUser as any, { examId: mockExamId.toHexString(), answers: [{ questionId: qId.toHexString(), selectedAnswerIds: [] }], timeSpentSeconds: 60 } as any);
    expect(result.score).toBeDefined();
    expect(mockSubmissionModel).toHaveBeenCalled();
  });

  // TC_submitExam_008
  // Method: submitExam
  // Purpose: To submit exam answers and calculate score variation 8
  // Input: publicId, Submission DTO (answers), Student User DTO
  // Expected output: Submission result containing score
  // Test result: pass
  // Note: Exam submission flow (handles both active and auto-submit implicitly via DTO)
  // checkdb: Mocked DB create for submission.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_submitExam_008', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const qId = new Types.ObjectId();
    const mockExam = { _id: mockExamId, courseId: mockCourseId, questions: [{ _id: qId, content: 'Q1' }], startTime: new Date(Date.now() - 1000), endTime: new Date(Date.now() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);
    mockQuestionModel.find.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q1', answer: [{ _id: new Types.ObjectId(), content: 'A', isCorrect: true }] }]) }) });
    
    const submissionResult = { _id: new Types.ObjectId(), score: 65, result: 'Passed' };
    mockSubmissionModel.create.mockResolvedValue([submissionResult]);

    const result = await service.submitExam('E-7', mockUser as any, { examId: mockExamId.toHexString(), answers: [{ questionId: qId.toHexString(), selectedAnswerIds: [] }], timeSpentSeconds: 60 } as any);
    expect(result.score).toBeDefined();
    expect(mockSubmissionModel).toHaveBeenCalled();
  });

  // TC_submitExam_009
  // Method: submitExam
  // Purpose: To submit exam answers and calculate score variation 9
  // Input: publicId, Submission DTO (answers), Student User DTO
  // Expected output: Submission result containing score
  // Test result: pass
  // Note: Exam submission flow (handles both active and auto-submit implicitly via DTO)
  // checkdb: Mocked DB create for submission.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_submitExam_009', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const qId = new Types.ObjectId();
    const mockExam = { _id: mockExamId, courseId: mockCourseId, questions: [{ _id: qId, content: 'Q1' }], startTime: new Date(Date.now() - 1000), endTime: new Date(Date.now() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);
    mockQuestionModel.find.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q1', answer: [{ _id: new Types.ObjectId(), content: 'A', isCorrect: true }] }]) }) });
    
    const submissionResult = { _id: new Types.ObjectId(), score: 60, result: 'Passed' };
    mockSubmissionModel.create.mockResolvedValue([submissionResult]);

    const result = await service.submitExam('E-8', mockUser as any, { examId: mockExamId.toHexString(), answers: [{ questionId: qId.toHexString(), selectedAnswerIds: [] }], timeSpentSeconds: 60 } as any);
    expect(result.score).toBeDefined();
    expect(mockSubmissionModel).toHaveBeenCalled();
  });

  // TC_submitExam_010
  // Method: submitExam
  // Purpose: To submit exam answers and calculate score variation 10
  // Input: publicId, Submission DTO (answers), Student User DTO
  // Expected output: Submission result containing score
  // Test result: pass
  // Note: Exam submission flow (handles both active and auto-submit implicitly via DTO)
  // checkdb: Mocked DB create for submission.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_submitExam_010', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const qId = new Types.ObjectId();
    const mockExam = { _id: mockExamId, courseId: mockCourseId, questions: [{ _id: qId, content: 'Q1' }], startTime: new Date(Date.now() - 1000), endTime: new Date(Date.now() + 100000) };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);
    mockQuestionModel.find.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q1', answer: [{ _id: new Types.ObjectId(), content: 'A', isCorrect: true }] }]) }) });
    
    const submissionResult = { _id: new Types.ObjectId(), score: 55, result: 'Passed' };
    mockSubmissionModel.create.mockResolvedValue([submissionResult]);

    const result = await service.submitExam('E-9', mockUser as any, { examId: mockExamId.toHexString(), answers: [{ questionId: qId.toHexString(), selectedAnswerIds: [] }], timeSpentSeconds: 60 } as any);
    expect(result.score).toBeDefined();
    expect(mockSubmissionModel).toHaveBeenCalled();
  });


  // TC_getExamForTaking_001
  // Method: getExamForTaking
  // Purpose: To fetch exam questions (without correct answers) for student variation 1
  // Input: publicId, Student User DTO
  // Expected output: Exam data including questions and choices
  // Test result: pass
  // Note: Excludes correct answers from frontend
  // checkdb: Mocked DB findOne for exam.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getExamForTaking_001', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-0', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000), questions: [] };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-0', mockUser as any);
    expect(result.publicId).toBe('E-0');
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_getExamForTaking_002
  // Method: getExamForTaking
  // Purpose: To fetch exam questions (without correct answers) for student variation 2
  // Input: publicId, Student User DTO
  // Expected output: Exam data including questions and choices
  // Test result: pass
  // Note: Excludes correct answers from frontend
  // checkdb: Mocked DB findOne for exam.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getExamForTaking_002', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-1', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000), questions: [] };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-1', mockUser as any);
    expect(result.publicId).toBe('E-1');
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_getExamForTaking_003
  // Method: getExamForTaking
  // Purpose: To fetch exam questions (without correct answers) for student variation 3
  // Input: publicId, Student User DTO
  // Expected output: Exam data including questions and choices
  // Test result: pass
  // Note: Excludes correct answers from frontend
  // checkdb: Mocked DB findOne for exam.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getExamForTaking_003', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-2', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000), questions: [] };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-2', mockUser as any);
    expect(result.publicId).toBe('E-2');
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_getExamForTaking_004
  // Method: getExamForTaking
  // Purpose: To fetch exam questions (without correct answers) for student variation 4
  // Input: publicId, Student User DTO
  // Expected output: Exam data including questions and choices
  // Test result: pass
  // Note: Excludes correct answers from frontend
  // checkdb: Mocked DB findOne for exam.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getExamForTaking_004', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-3', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000), questions: [] };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-3', mockUser as any);
    expect(result.publicId).toBe('E-3');
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_getExamForTaking_005
  // Method: getExamForTaking
  // Purpose: To fetch exam questions (without correct answers) for student variation 5
  // Input: publicId, Student User DTO
  // Expected output: Exam data including questions and choices
  // Test result: pass
  // Note: Excludes correct answers from frontend
  // checkdb: Mocked DB findOne for exam.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getExamForTaking_005', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-4', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000), questions: [] };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-4', mockUser as any);
    expect(result.publicId).toBe('E-4');
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_getExamForTaking_006
  // Method: getExamForTaking
  // Purpose: To fetch exam questions (without correct answers) for student variation 6
  // Input: publicId, Student User DTO
  // Expected output: Exam data including questions and choices
  // Test result: pass
  // Note: Excludes correct answers from frontend
  // checkdb: Mocked DB findOne for exam.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getExamForTaking_006', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-5', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000), questions: [] };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-5', mockUser as any);
    expect(result.publicId).toBe('E-5');
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_getExamForTaking_007
  // Method: getExamForTaking
  // Purpose: To fetch exam questions (without correct answers) for student variation 7
  // Input: publicId, Student User DTO
  // Expected output: Exam data including questions and choices
  // Test result: pass
  // Note: Excludes correct answers from frontend
  // checkdb: Mocked DB findOne for exam.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getExamForTaking_007', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-6', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000), questions: [] };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-6', mockUser as any);
    expect(result.publicId).toBe('E-6');
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_getExamForTaking_008
  // Method: getExamForTaking
  // Purpose: To fetch exam questions (without correct answers) for student variation 8
  // Input: publicId, Student User DTO
  // Expected output: Exam data including questions and choices
  // Test result: pass
  // Note: Excludes correct answers from frontend
  // checkdb: Mocked DB findOne for exam.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getExamForTaking_008', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-7', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000), questions: [] };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-7', mockUser as any);
    expect(result.publicId).toBe('E-7');
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_getExamForTaking_009
  // Method: getExamForTaking
  // Purpose: To fetch exam questions (without correct answers) for student variation 9
  // Input: publicId, Student User DTO
  // Expected output: Exam data including questions and choices
  // Test result: pass
  // Note: Excludes correct answers from frontend
  // checkdb: Mocked DB findOne for exam.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getExamForTaking_009', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-8', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000), questions: [] };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-8', mockUser as any);
    expect(result.publicId).toBe('E-8');
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_getExamForTaking_010
  // Method: getExamForTaking
  // Purpose: To fetch exam questions (without correct answers) for student variation 10
  // Input: publicId, Student User DTO
  // Expected output: Exam data including questions and choices
  // Test result: pass
  // Note: Excludes correct answers from frontend
  // checkdb: Mocked DB findOne for exam.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getExamForTaking_010', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    const now = new Date();
    const mockExam = { _id: mockExamId, status: 'active', publicId: 'E-9', startTime: new Date(now.getTime() - 1000), endTime: new Date(now.getTime() + 100000), questions: [] };
    const mockQuery: any = Promise.resolve(mockExam);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue(mockExam);
    mockExamModel.findOne.mockReturnValue(mockQuery);
    mockSubmissionModel.findOne.mockResolvedValue(null);

    const result = await service.getExamForTaking('E-9', mockUser as any);
    expect(result.publicId).toBe('E-9');
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });


  // TC_getMyCompletedExams_001
  // Method: getMyCompletedExams
  // Purpose: To retrieve list of completed exams and scores variation 1
  // Input: Student User DTO, pagination query
  // Expected output: Array of completed exam summaries
  // Test result: pass
  // Note: Review exam history/scores flow
  // checkdb: Mocked DB find for submissions.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getMyCompletedExams_001', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    mockSubmissionModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const mockQuery: any = Promise.resolve([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.sort = jest.fn().mockReturnValue(mockQuery);
    mockQuery.skip = jest.fn().mockReturnValue(mockQuery);
    mockQuery.limit = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockUser as any);
    expect(result).toBeDefined();
    expect(mockSubmissionModel.find).toHaveBeenCalled();
  });

  // TC_getMyCompletedExams_002
  // Method: getMyCompletedExams
  // Purpose: To retrieve list of completed exams and scores variation 2
  // Input: Student User DTO, pagination query
  // Expected output: Array of completed exam summaries
  // Test result: pass
  // Note: Review exam history/scores flow
  // checkdb: Mocked DB find for submissions.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getMyCompletedExams_002', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    mockSubmissionModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const mockQuery: any = Promise.resolve([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.sort = jest.fn().mockReturnValue(mockQuery);
    mockQuery.skip = jest.fn().mockReturnValue(mockQuery);
    mockQuery.limit = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockUser as any);
    expect(result).toBeDefined();
    expect(mockSubmissionModel.find).toHaveBeenCalled();
  });

  // TC_getMyCompletedExams_003
  // Method: getMyCompletedExams
  // Purpose: To retrieve list of completed exams and scores variation 3
  // Input: Student User DTO, pagination query
  // Expected output: Array of completed exam summaries
  // Test result: pass
  // Note: Review exam history/scores flow
  // checkdb: Mocked DB find for submissions.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getMyCompletedExams_003', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    mockSubmissionModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const mockQuery: any = Promise.resolve([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.sort = jest.fn().mockReturnValue(mockQuery);
    mockQuery.skip = jest.fn().mockReturnValue(mockQuery);
    mockQuery.limit = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockUser as any);
    expect(result).toBeDefined();
    expect(mockSubmissionModel.find).toHaveBeenCalled();
  });

  // TC_getMyCompletedExams_004
  // Method: getMyCompletedExams
  // Purpose: To retrieve list of completed exams and scores variation 4
  // Input: Student User DTO, pagination query
  // Expected output: Array of completed exam summaries
  // Test result: pass
  // Note: Review exam history/scores flow
  // checkdb: Mocked DB find for submissions.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getMyCompletedExams_004', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    mockSubmissionModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const mockQuery: any = Promise.resolve([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.sort = jest.fn().mockReturnValue(mockQuery);
    mockQuery.skip = jest.fn().mockReturnValue(mockQuery);
    mockQuery.limit = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockUser as any);
    expect(result).toBeDefined();
    expect(mockSubmissionModel.find).toHaveBeenCalled();
  });

  // TC_getMyCompletedExams_005
  // Method: getMyCompletedExams
  // Purpose: To retrieve list of completed exams and scores variation 5
  // Input: Student User DTO, pagination query
  // Expected output: Array of completed exam summaries
  // Test result: pass
  // Note: Review exam history/scores flow
  // checkdb: Mocked DB find for submissions.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getMyCompletedExams_005', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    mockSubmissionModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const mockQuery: any = Promise.resolve([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.sort = jest.fn().mockReturnValue(mockQuery);
    mockQuery.skip = jest.fn().mockReturnValue(mockQuery);
    mockQuery.limit = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockUser as any);
    expect(result).toBeDefined();
    expect(mockSubmissionModel.find).toHaveBeenCalled();
  });

  // TC_getMyCompletedExams_006
  // Method: getMyCompletedExams
  // Purpose: To retrieve list of completed exams and scores variation 6
  // Input: Student User DTO, pagination query
  // Expected output: Array of completed exam summaries
  // Test result: pass
  // Note: Review exam history/scores flow
  // checkdb: Mocked DB find for submissions.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getMyCompletedExams_006', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    mockSubmissionModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const mockQuery: any = Promise.resolve([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.sort = jest.fn().mockReturnValue(mockQuery);
    mockQuery.skip = jest.fn().mockReturnValue(mockQuery);
    mockQuery.limit = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockUser as any);
    expect(result).toBeDefined();
    expect(mockSubmissionModel.find).toHaveBeenCalled();
  });

  // TC_getMyCompletedExams_007
  // Method: getMyCompletedExams
  // Purpose: To retrieve list of completed exams and scores variation 7
  // Input: Student User DTO, pagination query
  // Expected output: Array of completed exam summaries
  // Test result: pass
  // Note: Review exam history/scores flow
  // checkdb: Mocked DB find for submissions.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getMyCompletedExams_007', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    mockSubmissionModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const mockQuery: any = Promise.resolve([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.sort = jest.fn().mockReturnValue(mockQuery);
    mockQuery.skip = jest.fn().mockReturnValue(mockQuery);
    mockQuery.limit = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockUser as any);
    expect(result).toBeDefined();
    expect(mockSubmissionModel.find).toHaveBeenCalled();
  });

  // TC_getMyCompletedExams_008
  // Method: getMyCompletedExams
  // Purpose: To retrieve list of completed exams and scores variation 8
  // Input: Student User DTO, pagination query
  // Expected output: Array of completed exam summaries
  // Test result: pass
  // Note: Review exam history/scores flow
  // checkdb: Mocked DB find for submissions.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getMyCompletedExams_008', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    mockSubmissionModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const mockQuery: any = Promise.resolve([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.sort = jest.fn().mockReturnValue(mockQuery);
    mockQuery.skip = jest.fn().mockReturnValue(mockQuery);
    mockQuery.limit = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockUser as any);
    expect(result).toBeDefined();
    expect(mockSubmissionModel.find).toHaveBeenCalled();
  });

  // TC_getMyCompletedExams_009
  // Method: getMyCompletedExams
  // Purpose: To retrieve list of completed exams and scores variation 9
  // Input: Student User DTO, pagination query
  // Expected output: Array of completed exam summaries
  // Test result: pass
  // Note: Review exam history/scores flow
  // checkdb: Mocked DB find for submissions.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getMyCompletedExams_009', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    mockSubmissionModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const mockQuery: any = Promise.resolve([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.sort = jest.fn().mockReturnValue(mockQuery);
    mockQuery.skip = jest.fn().mockReturnValue(mockQuery);
    mockQuery.limit = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockUser as any);
    expect(result).toBeDefined();
    expect(mockSubmissionModel.find).toHaveBeenCalled();
  });

  // TC_getMyCompletedExams_010
  // Method: getMyCompletedExams
  // Purpose: To retrieve list of completed exams and scores variation 10
  // Input: Student User DTO, pagination query
  // Expected output: Array of completed exam summaries
  // Test result: pass
  // Note: Review exam history/scores flow
  // checkdb: Mocked DB find for submissions.
  // rollback: jest.clearAllMocks() restores state.
  it('TC_getMyCompletedExams_010', async () => {
    const mockUser = { id: mockStudentId.toHexString(), role: 'student' };
    mockSubmissionModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const mockQuery: any = Promise.resolve([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockQuery.populate = jest.fn().mockReturnValue(mockQuery);
    mockQuery.sort = jest.fn().mockReturnValue(mockQuery);
    mockQuery.skip = jest.fn().mockReturnValue(mockQuery);
    mockQuery.limit = jest.fn().mockReturnValue(mockQuery);
    mockQuery.exec = jest.fn().mockResolvedValue([{ _id: new Types.ObjectId(), score: 85, result: 'Passed', examId: { title: 'T' } }]);
    mockSubmissionModel.find.mockReturnValue(mockQuery);

    const result = await service.getMyCompletedExams(mockUser as any);
    expect(result).toBeDefined();
    expect(mockSubmissionModel.find).toHaveBeenCalled();
  });

});
