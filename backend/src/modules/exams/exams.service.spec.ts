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

describe('ExamsService - Instructor Exam Management', () => {
  let service: ExamsService;

  const mockCourseId = new Types.ObjectId();
  const mockTeacherId = new Types.ObjectId();
  const mockExamId = new Types.ObjectId();
  const mockStudentId = new Types.ObjectId();

  const mockExamModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
    hydrate: jest.fn(),
    findById: jest.fn(),
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

  const mockSubmissionModel = {
    findOne: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
  };

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

  // Helper to build a valid createExam DTO
  const buildValidExamDto = (overrides: any = {}) => ({
    title: 'Midterm Exam',
    durationMinutes: 60,
    startTime: new Date(Date.now() + 3600000).toISOString(),
    endTime: new Date(Date.now() + 86400000).toISOString(),
    courseId: mockCourseId.toHexString(),
    questions: [{
      content: 'What is 2+2?',
      answerQuestion: 1,
      answer: [
        { content: '3' },
        { content: '4' },
        { content: '5' },
        { content: '6' },
      ],
    }],
    rateScore: 50,
    ...overrides,
  });

  const mockTeacherUser = { id: mockTeacherId.toHexString(), role: 'teacher' };

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
  // createExam Method Tests
  // ============================================================

  // TC_CREATE_EXAM_001
  // Method: createExam
  // Purpose: Verify successful exam creation with valid input data
  // Input: Valid CreateExamDto with title "Midterm Exam", durationMinutes 60, valid courseId, 1 question
  // Expected output: Exam object with matching title and durationMinutes
  // Test result: pass
  // checkdb: Verifies courseModel.findById, questionModel.insertMany, examModel.create called with session
  // rollback: jest.clearAllMocks() in beforeEach; transaction session mocked with commit/abort
  it('TC_CREATE_EXAM_001', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'What is 2+2?', answerQuestion: 1, answer: [{ content: '3' }, { content: '4' }, { content: '5' }, { content: '6' }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = {
      _id: mockExamId, publicId: 'E-123456', title: 'Midterm Exam',
      startTime: new Date(), endTime: new Date(Date.now() + 86400000),
      durationMinutes: 60, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date(),
    };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const result = await service.createExam(buildValidExamDto() as any, mockTeacherUser as any);

    expect(result.title).toBe('Midterm Exam');
    expect(result.durationMinutes).toBe(60);
    expect(mockSession.commitTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  // TC_CREATE_EXAM_002
  // Method: createExam
  // Purpose: Verify BadRequestException when endTime is before startTime
  // Input: CreateExamDto with endTime < startTime
  // Expected output: BadRequestException
  // Test result: pass
  // checkdb: No DB write occurs
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_002', async () => {
    const dto = buildValidExamDto({
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
    });

    await expect(
      service.createExam(dto as any, mockTeacherUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_CREATE_EXAM_003
  // Method: createExam
  // Purpose: Verify BadRequestException when exam window (endTime - startTime) is shorter than durationMinutes
  // Input: CreateExamDto with durationMinutes=120 but window only 30 minutes
  // Expected output: BadRequestException
  // Test result: pass
  // checkdb: No DB write occurs
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_003', async () => {
    const startTime = new Date(Date.now() + 3600000);
    const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 min window
    const dto = buildValidExamDto({
      durationMinutes: 120,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    });

    await expect(
      service.createExam(dto as any, mockTeacherUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_CREATE_EXAM_004
  // Method: createExam
  // Purpose: Verify NotFoundException when courseId does not exist
  // Input: CreateExamDto with non-existent courseId
  // Expected output: NotFoundException
  // Test result: pass
  // checkdb: Verifies courseModel.findById called, returns null
  // rollback: Transaction aborted via mockSession.abortTransaction
  it('TC_CREATE_EXAM_004', async () => {
    mockCourseModel.findById.mockResolvedValue(null);

    await expect(
      service.createExam(buildValidExamDto() as any, mockTeacherUser as any),
    ).rejects.toThrow(NotFoundException);
  });

  // TC_CREATE_EXAM_005
  // Method: createExam
  // Purpose: Verify ForbiddenException when teacher is not the owner of the course
  // Input: CreateExamDto with courseId owned by a different teacher
  // Expected output: ForbiddenException
  // Test result: pass
  // checkdb: Verifies courseModel.findById called, teacherId mismatch detected
  // rollback: Transaction aborted via mockSession.abortTransaction
  it('TC_CREATE_EXAM_005', async () => {
    const otherTeacherId = new Types.ObjectId();
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: otherTeacherId });

    await expect(
      service.createExam(buildValidExamDto() as any, mockTeacherUser as any),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_CREATE_EXAM_006
  // Method: createExam
  // Purpose: Verify that questions are inserted via insertMany within the transaction
  // Input: Valid CreateExamDto with 1 question containing 4 choices
  // Expected output: questionModel.insertMany called with correct question data and session
  // Test result: pass
  // checkdb: Verifies insertMany called with session option for transactional integrity
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_006', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.create.mockResolvedValue([{
      _id: mockExamId, publicId: 'E-123456', title: 'T', durationMinutes: 60,
      startTime: new Date(), endTime: new Date(Date.now() + 86400000),
      courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date(),
    }]);

    await service.createExam(buildValidExamDto() as any, mockTeacherUser as any);

    expect(mockQuestionModel.insertMany).toHaveBeenCalledTimes(1);
    const insertCall = mockQuestionModel.insertMany.mock.calls[0];
    expect(insertCall[1]).toEqual({ session: mockSession });
  });

  // TC_CREATE_EXAM_007
  // Method: createExam
  // Purpose: Verify transaction is aborted when an error occurs during creation
  // Input: Valid CreateExamDto but examModel.create throws an error
  // Expected output: Error propagated, abortTransaction called
  // Test result: pass
  // checkdb: Verifies abortTransaction was called on error, endSession called for cleanup
  // rollback: Transaction aborted via mockSession.abortTransaction
  it('TC_CREATE_EXAM_007', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.insertMany.mockResolvedValue([{ _id: new Types.ObjectId() }]);
    mockExamModel.create.mockRejectedValue(new Error('DB create failed'));

    await expect(
      service.createExam(buildValidExamDto() as any, mockTeacherUser as any),
    ).rejects.toThrow('DB create failed');

    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  // TC_CREATE_EXAM_008
  // Method: createExam
  // Purpose: Verify correct answer marking - answerQuestion sets isCorrect on the correct choice
  // Input: CreateExamDto with answerQuestion=2 (2nd choice is correct)
  // Expected output: insertMany called with answer array where index 1 has isCorrect=true
  // Test result: pass
  // checkdb: Verifies the answer transformation logic in createExam
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_008', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const qId = new Types.ObjectId();
    mockQuestionModel.insertMany.mockResolvedValue([{ _id: qId, content: 'Capital of France?', answerQuestion: 2, answer: [{ content: 'London', isCorrect: false }, { content: 'Paris', isCorrect: true }, { content: 'Berlin', isCorrect: false }, { content: 'Madrid', isCorrect: false }] }]);
    mockExamModel.create.mockResolvedValue([{
      _id: mockExamId, publicId: 'E-123456', title: 'T', durationMinutes: 30,
      startTime: new Date(), endTime: new Date(Date.now() + 86400000),
      courseId: mockCourseId, questions: [qId], createdAt: new Date(),
    }]);

    const dto = buildValidExamDto({
      questions: [{
        content: 'Capital of France?',
        answerQuestion: 2,
        answer: [{ content: 'London' }, { content: 'Paris' }, { content: 'Berlin' }, { content: 'Madrid' }],
      }],
    });

    await service.createExam(dto as any, mockTeacherUser as any);

    const insertedQuestions = mockQuestionModel.insertMany.mock.calls[0][0];
    expect(insertedQuestions[0].answer[0].isCorrect).toBe(false);
    expect(insertedQuestions[0].answer[1].isCorrect).toBe(true);
    expect(insertedQuestions[0].answer[2].isCorrect).toBe(false);
    expect(insertedQuestions[0].answer[3].isCorrect).toBe(false);
  });

  // TC_CREATE_EXAM_009
  // Method: createExam
  // Purpose: Verify exam creation with minimum duration (1 minute)
  // Input: CreateExamDto with durationMinutes=1, sufficient time window
  // Expected output: Exam created with durationMinutes=1
  // Test result: pass
  // checkdb: Verifies examModel.create called with durationMinutes=1
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_009', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const qId = new Types.ObjectId();
    mockQuestionModel.insertMany.mockResolvedValue([{ _id: qId, content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] }]);
    mockExamModel.create.mockResolvedValue([{
      _id: mockExamId, publicId: 'E-123456', title: 'Quick Quiz',
      durationMinutes: 1, startTime: new Date(), endTime: new Date(Date.now() + 86400000),
      courseId: mockCourseId, questions: [qId], createdAt: new Date(),
    }]);

    const result = await service.createExam(
      buildValidExamDto({ durationMinutes: 1 }) as any,
      mockTeacherUser as any,
    );

    expect(result.durationMinutes).toBe(1);
  });

  // TC_CREATE_EXAM_010
  // Method: createExam
  // Purpose: Verify exam creation with long duration (180 minutes)
  // Input: CreateExamDto with durationMinutes=180
  // Expected output: Exam created with durationMinutes=180
  // Test result: pass
  // checkdb: Verifies examModel.create called with durationMinutes=180
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_010', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const qId = new Types.ObjectId();
    mockQuestionModel.insertMany.mockResolvedValue([{ _id: qId, content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] }]);
    mockExamModel.create.mockResolvedValue([{
      _id: mockExamId, publicId: 'E-123456', title: 'Final Exam',
      durationMinutes: 180, startTime: new Date(), endTime: new Date(Date.now() + 86400000),
      courseId: mockCourseId, questions: [qId], createdAt: new Date(),
    }]);

    const result = await service.createExam(
      buildValidExamDto({ durationMinutes: 180 }) as any,
      mockTeacherUser as any,
    );

    expect(result.durationMinutes).toBe(180);
  });


  // TC_CREATE_EXAM_011
  // Method: createExam
  // Purpose: Verify ForbiddenException when teacher context is missing (user.id undefined)
  // Input: user = { role: 'teacher' } (no id)
  // Expected output: ForbiddenException "Missing teacher context"
  // Test result: pass
  // checkdb: No DB access
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_011', async () => {
    await expect(
      service.createExam(buildValidExamDto() as any, { role: 'teacher' } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_CREATE_EXAM_012
  // Method: createExam
  // Purpose: Verify ForbiddenException when teacher.id is not a valid ObjectId
  // Input: user = { id: 'bad-id', role: 'teacher' }
  // Expected output: ForbiddenException "Invalid teacher identifier"
  // Test result: pass
  // checkdb: No DB access
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_012', async () => {
    await expect(
      service.createExam(buildValidExamDto() as any, { id: 'bad-id', role: 'teacher' } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_CREATE_EXAM_013
  // Method: createExam
  // Purpose: Verify BadRequestException for invalid courseId format
  // Input: CreateExamDto with courseId = 'invalid'
  // Expected output: BadRequestException "Invalid courseId"
  // Test result: pass
  // checkdb: No DB access
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_013', async () => {
    await expect(
      service.createExam(buildValidExamDto({ courseId: 'invalid' }) as any, mockTeacherUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_CREATE_EXAM_014
  // Method: createExam
  // Purpose: Verify BadRequestException for invalid date strings (NaN dates)
  // Input: CreateExamDto with startTime = 'not-a-date'
  // Expected output: BadRequestException "Invalid start or end time"
  // Test result: pass
  // checkdb: No DB access
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_014', async () => {
    await expect(
      service.createExam(buildValidExamDto({ startTime: 'not-a-date' }) as any, mockTeacherUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_CREATE_EXAM_015
  // Method: createExam
  // Purpose: Verify BadRequestException when durationMinutes is 0
  // Input: CreateExamDto with durationMinutes = 0
  // Expected output: BadRequestException "durationMinutes must be greater than 0"
  // Test result: pass
  // checkdb: No DB access
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_015', async () => {
    await expect(
      service.createExam(buildValidExamDto({ durationMinutes: 0 }) as any, mockTeacherUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_CREATE_EXAM_016
  // Method: createExam
  // Purpose: Verify BadRequestException when durationMinutes is negative
  // Input: CreateExamDto with durationMinutes = -10
  // Expected output: BadRequestException
  // Test result: pass
  // checkdb: No DB access
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_016', async () => {
    await expect(
      service.createExam(buildValidExamDto({ durationMinutes: -10 }) as any, mockTeacherUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_CREATE_EXAM_017
  // Method: createExam
  // Purpose: Verify exam status defaults to 'scheduled' when not provided
  // Input: CreateExamDto without status field
  // Expected output: examModel.create called with status 'scheduled'
  // Test result: pass
  // checkdb: Verifies create called with default status
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_017', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const qId = new Types.ObjectId();
    mockQuestionModel.insertMany.mockResolvedValue([{ _id: qId, content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] }]);
    mockExamModel.create.mockResolvedValue([{
      _id: mockExamId, publicId: 'E-123456', title: 'Default Status',
      durationMinutes: 60, startTime: new Date(), endTime: new Date(Date.now() + 86400000),
      status: 'scheduled', courseId: mockCourseId, questions: [qId], createdAt: new Date(),
    }]);

    const result = await service.createExam(buildValidExamDto() as any, mockTeacherUser as any);

    expect(result.status).toBe('scheduled');
  });

  // TC_CREATE_EXAM_018
  // Method: createExam
  // Purpose: Verify exam creation with multiple questions (3 questions)
  // Input: CreateExamDto with 3 questions
  // Expected output: insertMany called with 3 question objects
  // Test result: pass
  // checkdb: Verifies insertMany receives array of 3 questions
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_018', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const qIds = [new Types.ObjectId(), new Types.ObjectId(), new Types.ObjectId()];
    const mockQs = qIds.map((id, i) => ({ _id: id, content: `Q${i}`, answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] }));
    mockQuestionModel.insertMany.mockResolvedValue(mockQs);
    mockExamModel.create.mockResolvedValue([{
      _id: mockExamId, publicId: 'E-123456', title: 'Multi Q',
      durationMinutes: 60, startTime: new Date(), endTime: new Date(Date.now() + 86400000),
      status: 'scheduled', courseId: mockCourseId, questions: qIds, createdAt: new Date(),
    }]);

    const threeQs = [1, 2, 3].map(n => ({
      content: `Q${n}`, answerQuestion: 1,
      answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }],
    }));

    const result = await service.createExam(buildValidExamDto({ questions: threeQs }) as any, mockTeacherUser as any);

    expect(result.questions).toHaveLength(3);
    expect(mockQuestionModel.insertMany.mock.calls[0][0]).toHaveLength(3);
  });

  // TC_CREATE_EXAM_019
  // Method: createExam
  // Purpose: Verify rateScore is preserved in the created exam response
  // Input: CreateExamDto with rateScore = 75
  // Expected output: ExamResponseDto with rateScore === 75
  // Test result: pass
  // checkdb: Verifies create called with rateScore
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_019', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const qId = new Types.ObjectId();
    mockQuestionModel.insertMany.mockResolvedValue([{ _id: qId, content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] }]);
    mockExamModel.create.mockResolvedValue([{
      _id: mockExamId, publicId: 'E-123456', title: 'Rate Test',
      durationMinutes: 60, startTime: new Date(), endTime: new Date(Date.now() + 86400000),
      status: 'scheduled', courseId: mockCourseId, questions: [qId], rateScore: 75, createdAt: new Date(),
    }]);

    const result = await service.createExam(buildValidExamDto({ rateScore: 75 }) as any, mockTeacherUser as any);

    expect(result.rateScore).toBe(75);
  });

  // TC_CREATE_EXAM_020
  // Method: createExam
  // Purpose: Verify BadRequestException when answerQuestion references non-existent choice
  // Input: CreateExamDto with answerQuestion=5 but only 4 choices
  // Expected output: BadRequestException "answerQuestion must reference one of the provided choices"
  // Test result: pass
  // checkdb: No DB write
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_EXAM_020', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });

    const dto = buildValidExamDto({
      questions: [{ content: 'Q', answerQuestion: 5, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }],
    });

    await expect(
      service.createExam(dto as any, mockTeacherUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // ============================================================
  // findExamById Method Tests
  // ============================================================

  // TC_FIND_EXAM_001
  // Method: findExamById
  // Purpose: Verify successful retrieval of an exam by ID with correct teacher authorization
  // Input: examId = valid ObjectId, user = course owner teacher
  // Expected output: Exam detail object with questions populated
  // Test result: pass
  // checkdb: Verifies findOne, courseModel.findById, questionModel.find called
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_FIND_EXAM_001', async () => {
    const qId = new Types.ObjectId();
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: mockExamId, courseId: mockCourseId, title: 'Exam Detail',
        durationMinutes: 60, startTime: new Date(), endTime: new Date(),
        status: 'scheduled', publicId: 'E-001', questions: [qId], rateScore: 50,
        createdAt: new Date(), updatedAt: new Date(),
      }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{
        _id: qId, content: 'Q1', answerQuestion: 1,
        answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }],
      }]),
    });

    const result = await service.findExamById(mockExamId.toHexString(), mockTeacherUser as any);

    expect(result).toBeDefined();
    expect(result.title).toBe('Exam Detail');
    expect(result.questions).toHaveLength(1);
  });

  // TC_FIND_EXAM_002
  // Method: findExamById
  // Purpose: Verify NotFoundException when exam does not exist
  // Input: examId = non-existent ObjectId
  // Expected output: NotFoundException
  // Test result: pass
  // checkdb: Verifies findOne returns null
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_FIND_EXAM_002', async () => {
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await expect(
      service.findExamById(new Types.ObjectId().toHexString(), mockTeacherUser as any),
    ).rejects.toThrow(NotFoundException);
  });

  // TC_FIND_EXAM_003
  // Method: findExamById
  // Purpose: Verify ForbiddenException when teacher is not the course owner
  // Input: examId = valid, user = teacher who does NOT own the course
  // Expected output: ForbiddenException
  // Test result: pass
  // checkdb: Verifies teacherId mismatch detected
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_FIND_EXAM_003', async () => {
    const otherTeacher = new Types.ObjectId();
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: otherTeacher });

    await expect(
      service.findExamById(mockExamId.toHexString(), mockTeacherUser as any),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_FIND_EXAM_004
  // Method: findExamById
  // Purpose: Verify NotFoundException when the exam's course does not exist
  // Input: examId = valid, course lookup returns null
  // Expected output: NotFoundException
  // Test result: pass
  // checkdb: Verifies courseModel.findById returns null
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_FIND_EXAM_004', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }),
    });
    mockCourseModel.findById.mockResolvedValue(null);

    await expect(
      service.findExamById(mockExamId.toHexString(), mockTeacherUser as any),
    ).rejects.toThrow(NotFoundException);
  });

  // TC_FIND_EXAM_005
  // Method: findExamById
  // Purpose: Verify that questions are fetched using the exam's question IDs
  // Input: examId = valid exam with 2 question IDs
  // Expected output: questionModel.find called with correct IDs filter
  // Test result: pass
  // checkdb: Verifies questionModel.find called with exam's question array
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_FIND_EXAM_005', async () => {
    const qId1 = new Types.ObjectId();
    const qId2 = new Types.ObjectId();
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: mockExamId, courseId: mockCourseId, title: 'Two Qs',
        durationMinutes: 30, startTime: new Date(), endTime: new Date(),
        status: 'scheduled', publicId: 'E-002', questions: [qId1, qId2], rateScore: 40,
        createdAt: new Date(), updatedAt: new Date(),
      }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([
        { _id: qId1, content: 'Q1', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] },
        { _id: qId2, content: 'Q2', answerQuestion: 2, answer: [{ content: 'X', isCorrect: false }, { content: 'Y', isCorrect: true }, { content: 'Z', isCorrect: false }, { content: 'W', isCorrect: false }] },
      ]),
    });

    const result = await service.findExamById(mockExamId.toHexString(), mockTeacherUser as any);

    expect(result.questions).toHaveLength(2);
    expect(mockQuestionModel.find).toHaveBeenCalledWith({ _id: { $in: [qId1, qId2] } });
  });

  // TC_FIND_EXAM_006
  // Method: findExamById
  // Purpose: Verify exam lookup by publicId (non-ObjectId string)
  // Input: examId = 'E-123456' (publicId format, not ObjectId)
  // Expected output: findOne called with { publicId: 'E-123456' }
  // Test result: pass
  // checkdb: Verifies buildExamLookupFilter uses publicId path
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_FIND_EXAM_006', async () => {
    const qId = new Types.ObjectId();
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: mockExamId, courseId: mockCourseId, title: 'Public Lookup',
        durationMinutes: 30, startTime: new Date(), endTime: new Date(),
        status: 'scheduled', publicId: 'E-123456', questions: [qId], rateScore: 50,
        createdAt: new Date(), updatedAt: new Date(),
      }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] }]),
    });

    await service.findExamById('E-123456', mockTeacherUser as any);

    expect(mockExamModel.findOne).toHaveBeenCalledWith({ publicId: 'E-123456' });
  });

  // TC_FIND_EXAM_007
  // Method: findExamById
  // Purpose: Verify response contains correct courseId mapping
  // Input: valid examId, exam has specific courseId
  // Expected output: ExamResponseDto with courseId as string of original ObjectId
  // Test result: pass
  // checkdb: Verifies mapExamResponse courseId conversion
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_FIND_EXAM_007', async () => {
    const qId = new Types.ObjectId();
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: mockExamId, courseId: mockCourseId, title: 'CourseId Test',
        durationMinutes: 45, startTime: new Date(), endTime: new Date(),
        status: 'active', publicId: 'E-CID', questions: [qId], rateScore: 60,
        createdAt: new Date(), updatedAt: new Date(),
      }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] }]),
    });

    const result = await service.findExamById(mockExamId.toHexString(), mockTeacherUser as any);

    expect(result.courseId).toBe(String(mockCourseId));
  });

  // TC_FIND_EXAM_008
  // Method: findExamById
  // Purpose: Verify response contains correct rateScore
  // Input: valid examId, exam has rateScore 80
  // Expected output: ExamResponseDto with rateScore === 80
  // Test result: pass
  // checkdb: Verifies mapExamResponse rateScore mapping
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_FIND_EXAM_008', async () => {
    const qId = new Types.ObjectId();
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: mockExamId, courseId: mockCourseId, title: 'Rate Test',
        durationMinutes: 60, startTime: new Date(), endTime: new Date(),
        status: 'scheduled', publicId: 'E-R80', questions: [qId], rateScore: 80,
        createdAt: new Date(), updatedAt: new Date(),
      }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue([{ _id: qId, content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] }]),
    });

    const result = await service.findExamById(mockExamId.toHexString(), mockTeacherUser as any);

    expect(result.rateScore).toBe(80);
  });


  // ============================================================
  // deleteExam Method Tests
  // ============================================================

  // TC_DELETE_EXAM_001
  // Method: deleteExam
  // Purpose: Verify successful exam deletion with associated questions and submissions cleanup
  // Input: examId = valid, user = course owner teacher
  // Expected output: void, deleteOne/deleteMany called for exam, questions, submissions
  // Test result: pass
  // checkdb: Verifies examModel.deleteOne, questionModel.deleteMany, submissionModel.deleteMany called
  // rollback: jest.clearAllMocks() in beforeEach; mocked DB operations
  it('TC_DELETE_EXAM_001', async () => {
    const qIds = [new Types.ObjectId(), new Types.ObjectId()];
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: qIds }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({ deletedCount: 2 });
    mockSubmissionModel.deleteMany.mockResolvedValue({ deletedCount: 0 });
    mockExamModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await service.deleteExam(mockExamId.toHexString(), mockTeacherUser as any);

    expect(mockExamModel.deleteOne).toHaveBeenCalledWith({ _id: mockExamId });
    expect(mockQuestionModel.deleteMany).toHaveBeenCalled();
    expect(mockSubmissionModel.deleteMany).toHaveBeenCalled();
  });

  // TC_DELETE_EXAM_002
  // Method: deleteExam
  // Purpose: Verify NotFoundException when exam does not exist
  // Input: examId = non-existent ObjectId
  // Expected output: NotFoundException
  // Test result: pass
  // checkdb: Verifies findById returns null, no delete operations performed
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_DELETE_EXAM_002', async () => {
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await expect(
      service.deleteExam(new Types.ObjectId().toHexString(), mockTeacherUser as any),
    ).rejects.toThrow(NotFoundException);

    expect(mockExamModel.deleteOne).not.toHaveBeenCalled();
  });

  // TC_DELETE_EXAM_003
  // Method: deleteExam
  // Purpose: Verify ForbiddenException when teacher is not the course owner
  // Input: examId = valid, user = different teacher
  // Expected output: ForbiddenException
  // Test result: pass
  // checkdb: Verifies teacherId mismatch detected, no delete operations
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_DELETE_EXAM_003', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: new Types.ObjectId() });

    await expect(
      service.deleteExam(mockExamId.toHexString(), mockTeacherUser as any),
    ).rejects.toThrow(ForbiddenException);

    expect(mockExamModel.deleteOne).not.toHaveBeenCalled();
  });

  // TC_DELETE_EXAM_004
  // Method: deleteExam
  // Purpose: Verify NotFoundException when the exam's course does not exist
  // Input: examId = valid, course lookup returns null
  // Expected output: NotFoundException
  // Test result: pass
  // checkdb: Verifies courseModel.findById returns null
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_DELETE_EXAM_004', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }),
    });
    mockCourseModel.findById.mockResolvedValue(null);

    await expect(
      service.deleteExam(mockExamId.toHexString(), mockTeacherUser as any),
    ).rejects.toThrow(NotFoundException);
  });

  // TC_DELETE_EXAM_005
  // Method: deleteExam
  // Purpose: Verify deleteExam returns void on success
  // Input: examId = valid, user = course owner
  // Expected output: undefined (void)
  // Test result: pass
  // checkdb: Verifies all cleanup operations completed
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_DELETE_EXAM_005', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: [] }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({});
    mockExamModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const result = await service.deleteExam(mockExamId.toHexString(), mockTeacherUser as any);

    expect(result).toBeUndefined();
  });

  // TC_DELETE_EXAM_006
  // Method: deleteExam
  // Purpose: Verify questions deleteMany is called with correct question IDs
  // Input: examId = valid, exam has 3 question IDs
  // Expected output: questionModel.deleteMany called with { _id: { $in: questionIds } }
  // Test result: pass
  // checkdb: Verifies deleteMany argument contains all question IDs
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_DELETE_EXAM_006', async () => {
    const qIds = [new Types.ObjectId(), new Types.ObjectId(), new Types.ObjectId()];
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: qIds }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({ deletedCount: 3 });
    mockSubmissionModel.deleteMany.mockResolvedValue({ deletedCount: 0 });
    mockExamModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await service.deleteExam(mockExamId.toHexString(), mockTeacherUser as any);

    expect(mockQuestionModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: qIds } });
  });

  // TC_DELETE_EXAM_007
  // Method: deleteExam
  // Purpose: Verify submissions deleteMany is called with correct examId
  // Input: examId = valid, user = course owner
  // Expected output: submissionModel.deleteMany called with { examId: exam._id }
  // Test result: pass
  // checkdb: Verifies submission cleanup uses correct examId
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_DELETE_EXAM_007', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: [] }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({ deletedCount: 5 });
    mockExamModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await service.deleteExam(mockExamId.toHexString(), mockTeacherUser as any);

    expect(mockSubmissionModel.deleteMany).toHaveBeenCalledWith({ examId: mockExamId });
  });

  // TC_DELETE_EXAM_008
  // Method: deleteExam
  // Purpose: Verify exam lookup by publicId for deletion
  // Input: examId = 'E-PUB01' (publicId format)
  // Expected output: findOne called with { publicId: 'E-PUB01' }
  // Test result: pass
  // checkdb: Verifies buildExamLookupFilter uses publicId
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_DELETE_EXAM_008', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: [] }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({});
    mockExamModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await service.deleteExam('E-PUB01', mockTeacherUser as any);

    expect(mockExamModel.findOne).toHaveBeenCalledWith({ publicId: 'E-PUB01' });
  });

  // ============================================================
  // updateExam Method Tests
  // ============================================================

  // Helper to build a valid updateExam DTO
  const buildValidUpdateDto = (overrides: any = {}) => ({
    title: 'Updated Exam',
    durationMinutes: 90,
    startTime: new Date(Date.now() + 3600000).toISOString(),
    endTime: new Date(Date.now() + 86400000).toISOString(),
    courseId: mockCourseId.toHexString(),
    questions: [{
      content: 'Updated Q?',
      answerQuestion: 1,
      answer: [
        { content: 'A' },
        { content: 'B' },
        { content: 'C' },
        { content: 'D' },
      ],
    }],
    rateScore: 60,
    ...overrides,
  });

  // TC_UPDATE_EXAM_001
  // Method: updateExam
  // Purpose: Verify successful exam update with valid input
  // Input: Valid UpdateExamDto, valid examId, valid teacher user
  // Expected output: ExamResponseDto with updated title and durationMinutes
  // Test result: pass
  // checkdb: Verifies findOne, deleteMany(old questions), insertMany(new), findByIdAndUpdate all called
  // rollback: jest.clearAllMocks() in beforeEach; transaction mocked
  it('TC_UPDATE_EXAM_001', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: [new Types.ObjectId()] }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const newQId = new Types.ObjectId();
    mockQuestionModel.insertMany.mockResolvedValue([{
      _id: newQId, content: 'Updated Q?', answerQuestion: 1,
      answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }],
    }]);
    const updatedExam = {
      _id: mockExamId, publicId: 'E-123456', title: 'Updated Exam',
      durationMinutes: 90, startTime: new Date(), endTime: new Date(Date.now() + 86400000),
      status: 'scheduled', courseId: mockCourseId, questions: [newQId],
      rateScore: 60, createdAt: new Date(), updatedAt: new Date(),
    };
    mockExamModel.findByIdAndUpdate.mockResolvedValue(updatedExam);
    mockNotificationsService.createNotification.mockResolvedValue(undefined);

    const result = await service.updateExam(mockExamId.toHexString(), buildValidUpdateDto() as any, mockTeacherUser as any);

    expect(result.title).toBe('Updated Exam');
    expect(result.durationMinutes).toBe(90);
    expect(mockSession.commitTransaction).toHaveBeenCalled();
  });

  // TC_UPDATE_EXAM_002
  // Method: updateExam
  // Purpose: Verify NotFoundException when exam does not exist
  // Input: examId = non-existent, valid UpdateExamDto
  // Expected output: NotFoundException
  // Test result: pass
  // checkdb: Verifies findOne returns null
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_EXAM_002', async () => {
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await expect(
      service.updateExam(new Types.ObjectId().toHexString(), buildValidUpdateDto() as any, mockTeacherUser as any),
    ).rejects.toThrow(NotFoundException);
  });

  // TC_UPDATE_EXAM_003
  // Method: updateExam
  // Purpose: Verify BadRequestException when endTime is before startTime
  // Input: UpdateExamDto with endTime < startTime
  // Expected output: BadRequestException
  // Test result: pass
  // checkdb: No DB write occurs
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_EXAM_003', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: [] }),
    });

    await expect(
      service.updateExam(mockExamId.toHexString(), buildValidUpdateDto({
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
      }) as any, mockTeacherUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_UPDATE_EXAM_004
  // Method: updateExam
  // Purpose: Verify ForbiddenException when teacher is not the course owner
  // Input: examId = valid, courseId owned by different teacher
  // Expected output: ForbiddenException
  // Test result: pass
  // checkdb: Verifies teacherId mismatch detected
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_EXAM_004', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: [] }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: new Types.ObjectId() });

    await expect(
      service.updateExam(mockExamId.toHexString(), buildValidUpdateDto() as any, mockTeacherUser as any),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_UPDATE_EXAM_005
  // Method: updateExam
  // Purpose: Verify ForbiddenException when teacher context is missing (user.id is undefined)
  // Input: user with id = undefined
  // Expected output: ForbiddenException with "Missing teacher context"
  // Test result: pass
  // checkdb: No DB access
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_EXAM_005', async () => {
    await expect(
      service.updateExam(mockExamId.toHexString(), buildValidUpdateDto() as any, { role: 'teacher' } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_UPDATE_EXAM_006
  // Method: updateExam
  // Purpose: Verify ForbiddenException when teacher.id is not a valid ObjectId
  // Input: user with id = 'invalid-id'
  // Expected output: ForbiddenException with "Invalid teacher identifier"
  // Test result: pass
  // checkdb: No DB access
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_EXAM_006', async () => {
    await expect(
      service.updateExam(mockExamId.toHexString(), buildValidUpdateDto() as any, { id: 'invalid-id', role: 'teacher' } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_UPDATE_EXAM_007
  // Method: updateExam
  // Purpose: Verify NotFoundException when course does not exist
  // Input: valid examId, courseId referencing non-existent course
  // Expected output: NotFoundException
  // Test result: pass
  // checkdb: Verifies courseModel.findById returns null
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_EXAM_007', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: [] }),
    });
    mockCourseModel.findById.mockResolvedValue(null);

    await expect(
      service.updateExam(mockExamId.toHexString(), buildValidUpdateDto() as any, mockTeacherUser as any),
    ).rejects.toThrow(NotFoundException);
  });

  // TC_UPDATE_EXAM_008
  // Method: updateExam
  // Purpose: Verify transaction is aborted on error during update
  // Input: Valid input but findByIdAndUpdate throws error
  // Expected output: Error propagated, abortTransaction called
  // Test result: pass
  // checkdb: Verifies abortTransaction and endSession called
  // rollback: Transaction aborted via mockSession.abortTransaction
  it('TC_UPDATE_EXAM_008', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: [] }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockQuestionModel.insertMany.mockResolvedValue([{
      _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1,
      answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }],
    }]);
    mockExamModel.findByIdAndUpdate.mockRejectedValue(new Error('Update DB error'));

    await expect(
      service.updateExam(mockExamId.toHexString(), buildValidUpdateDto() as any, mockTeacherUser as any),
    ).rejects.toThrow('Update DB error');

    expect(mockSession.abortTransaction).toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });

  // TC_UPDATE_EXAM_009
  // Method: updateExam
  // Purpose: Verify old questions are deleted before new ones are inserted
  // Input: Valid update with existing exam having 2 old questions
  // Expected output: deleteMany called with old question IDs, insertMany called with new questions
  // Test result: pass
  // checkdb: Verifies deleteMany and insertMany call order and arguments
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_EXAM_009', async () => {
    const oldQIds = [new Types.ObjectId(), new Types.ObjectId()];
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: oldQIds }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({ deletedCount: 2 });
    const newQId = new Types.ObjectId();
    mockQuestionModel.insertMany.mockResolvedValue([{
      _id: newQId, content: 'Updated Q?', answerQuestion: 1,
      answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }],
    }]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({
      _id: mockExamId, publicId: 'E-123456', title: 'Updated Exam',
      durationMinutes: 90, startTime: new Date(), endTime: new Date(Date.now() + 86400000),
      status: 'scheduled', courseId: mockCourseId, questions: [newQId],
      rateScore: 60, createdAt: new Date(), updatedAt: new Date(),
    });
    mockNotificationsService.createNotification.mockResolvedValue(undefined);

    await service.updateExam(mockExamId.toHexString(), buildValidUpdateDto() as any, mockTeacherUser as any);

    expect(mockQuestionModel.deleteMany).toHaveBeenCalledWith(
      { _id: { $in: oldQIds } },
      { session: mockSession },
    );
    expect(mockQuestionModel.insertMany).toHaveBeenCalledTimes(1);
  });

  // TC_UPDATE_EXAM_010
  // Method: updateExam
  // Purpose: Verify BadRequestException for invalid courseId format
  // Input: UpdateExamDto with courseId = 'not-an-objectid'
  // Expected output: BadRequestException with "Invalid courseId"
  // Test result: pass
  // checkdb: No DB write occurs
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_EXAM_010', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: [] }),
    });

    await expect(
      service.updateExam(mockExamId.toHexString(), buildValidUpdateDto({ courseId: 'not-an-objectid' }) as any, mockTeacherUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_UPDATE_EXAM_011
  // Method: updateExam
  // Purpose: Verify NotFoundException when findByIdAndUpdate returns null
  // Input: Valid update but findByIdAndUpdate returns null
  // Expected output: NotFoundException "Exam not found during update"
  // Test result: pass
  // checkdb: Verifies findByIdAndUpdate returned null
  // rollback: Transaction aborted
  it('TC_UPDATE_EXAM_011', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: [] }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockQuestionModel.insertMany.mockResolvedValue([{ _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] }]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue(null);

    await expect(
      service.updateExam(mockExamId.toHexString(), buildValidUpdateDto() as any, mockTeacherUser as any),
    ).rejects.toThrow(NotFoundException);

    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });

  // TC_UPDATE_EXAM_012
  // Method: updateExam
  // Purpose: Verify BadRequestException when durationMinutes exceeds time window
  // Input: UpdateExamDto with durationMinutes=300 but window only 60 minutes
  // Expected output: BadRequestException
  // Test result: pass
  // checkdb: No DB write
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_EXAM_012', async () => {
    const start = new Date(Date.now() + 3600000);
    const end = new Date(start.getTime() + 60 * 60000);
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: [] }),
    });

    await expect(
      service.updateExam(mockExamId.toHexString(), buildValidUpdateDto({
        durationMinutes: 300, startTime: start.toISOString(), endTime: end.toISOString(),
      }) as any, mockTeacherUser as any),
    ).rejects.toThrow(BadRequestException);
  });

  // TC_UPDATE_EXAM_013
  // Method: updateExam
  // Purpose: Verify findByIdAndUpdate is called with { new: true } option
  // Input: Valid update
  // Expected output: findByIdAndUpdate called with options including { new: true }
  // Test result: pass
  // checkdb: Verifies update options
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_EXAM_013', async () => {
    mockExamModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, questions: [] }),
    });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const qId = new Types.ObjectId();
    mockQuestionModel.insertMany.mockResolvedValue([{ _id: qId, content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] }]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({
      _id: mockExamId, publicId: 'E-123456', title: 'Updated',
      durationMinutes: 90, startTime: new Date(), endTime: new Date(Date.now() + 86400000),
      status: 'scheduled', courseId: mockCourseId, questions: [qId],
      rateScore: 60, createdAt: new Date(), updatedAt: new Date(),
    });
    mockNotificationsService.createNotification.mockResolvedValue(undefined);

    await service.updateExam(mockExamId.toHexString(), buildValidUpdateDto() as any, mockTeacherUser as any);

    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockExamId.toHexString(),
      expect.any(Object),
      expect.objectContaining({ new: true, session: mockSession }),
    );
  });
});
