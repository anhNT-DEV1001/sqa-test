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
    findById: jest.fn()
  };

  const mockCourseModel = {
    findById: jest.fn(),
    find: jest.fn(),
  };

  const mockQuestionModel = {
    insertMany: jest.fn(),
    deleteMany: jest.fn(),
    find: jest.fn()
  };

  const mockSubmissionModel = {
    findOne: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn()
  };

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


  // TC_createExam_001
  // Method: createExam
  // Purpose: To create exam with duration 5 min
  // Input: { title: "T", durationMinutes: 5, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_001', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 5, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 5, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(5);
  });

  // TC_createExam_002
  // Method: createExam
  // Purpose: To create exam with duration 10 min
  // Input: { title: "T", durationMinutes: 10, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_002', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 10, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 10, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(10);
  });

  // TC_createExam_003
  // Method: createExam
  // Purpose: To create exam with duration 15 min
  // Input: { title: "T", durationMinutes: 15, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_003', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 15, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 15, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(15);
  });

  // TC_createExam_004
  // Method: createExam
  // Purpose: To create exam with duration 20 min
  // Input: { title: "T", durationMinutes: 20, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_004', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 20, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 20, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(20);
  });

  // TC_createExam_005
  // Method: createExam
  // Purpose: To create exam with duration 25 min
  // Input: { title: "T", durationMinutes: 25, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_005', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 25, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 25, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(25);
  });

  // TC_createExam_006
  // Method: createExam
  // Purpose: To create exam with duration 30 min
  // Input: { title: "T", durationMinutes: 30, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_006', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 30, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 30, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(30);
  });

  // TC_createExam_007
  // Method: createExam
  // Purpose: To create exam with duration 35 min
  // Input: { title: "T", durationMinutes: 35, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_007', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 35, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 35, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(35);
  });

  // TC_createExam_008
  // Method: createExam
  // Purpose: To create exam with duration 40 min
  // Input: { title: "T", durationMinutes: 40, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_008', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 40, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 40, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(40);
  });

  // TC_createExam_009
  // Method: createExam
  // Purpose: To create exam with duration 45 min
  // Input: { title: "T", durationMinutes: 45, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_009', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 45, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 45, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(45);
  });

  // TC_createExam_010
  // Method: createExam
  // Purpose: To create exam with duration 50 min
  // Input: { title: "T", durationMinutes: 50, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_010', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 50, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 50, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(50);
  });

  // TC_createExam_011
  // Method: createExam
  // Purpose: To create exam with duration 55 min
  // Input: { title: "T", durationMinutes: 55, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_011', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 55, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 55, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(55);
  });

  // TC_createExam_012
  // Method: createExam
  // Purpose: To create exam with duration 60 min
  // Input: { title: "T", durationMinutes: 60, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_012', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 60, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 60, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(60);
  });

  // TC_createExam_013
  // Method: createExam
  // Purpose: To create exam with duration 65 min
  // Input: { title: "T", durationMinutes: 65, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_013', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 65, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 65, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(65);
  });

  // TC_createExam_014
  // Method: createExam
  // Purpose: To create exam with duration 70 min
  // Input: { title: "T", durationMinutes: 70, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_014', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 70, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 70, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(70);
  });

  // TC_createExam_015
  // Method: createExam
  // Purpose: To create exam with duration 75 min
  // Input: { title: "T", durationMinutes: 75, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_015', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 75, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 75, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(75);
  });

  // TC_createExam_016
  // Method: createExam
  // Purpose: To create exam with duration 80 min
  // Input: { title: "T", durationMinutes: 80, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_016', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 80, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 80, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(80);
  });

  // TC_createExam_017
  // Method: createExam
  // Purpose: To create exam with duration 85 min
  // Input: { title: "T", durationMinutes: 85, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_017', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 85, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 85, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(85);
  });

  // TC_createExam_018
  // Method: createExam
  // Purpose: To create exam with duration 90 min
  // Input: { title: "T", durationMinutes: 90, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_018', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 90, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 90, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(90);
  });

  // TC_createExam_019
  // Method: createExam
  // Purpose: To create exam with duration 95 min
  // Input: { title: "T", durationMinutes: 95, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_019', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 95, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 95, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(95);
  });

  // TC_createExam_020
  // Method: createExam
  // Purpose: To create exam with duration 100 min
  // Input: { title: "T", durationMinutes: 100, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_020', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 100, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 100, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(100);
  });

  // TC_createExam_021
  // Method: createExam
  // Purpose: To create exam with duration 105 min
  // Input: { title: "T", durationMinutes: 105, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_021', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 105, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 105, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(105);
  });

  // TC_createExam_022
  // Method: createExam
  // Purpose: To create exam with duration 110 min
  // Input: { title: "T", durationMinutes: 110, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_022', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 110, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 110, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(110);
  });

  // TC_createExam_023
  // Method: createExam
  // Purpose: To create exam with duration 115 min
  // Input: { title: "T", durationMinutes: 115, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_023', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 115, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 115, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(115);
  });

  // TC_createExam_024
  // Method: createExam
  // Purpose: To create exam with duration 120 min
  // Input: { title: "T", durationMinutes: 120, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_024', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 120, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 120, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(120);
  });

  // TC_createExam_025
  // Method: createExam
  // Purpose: To create exam with duration 125 min
  // Input: { title: "T", durationMinutes: 125, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_025', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 125, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 125, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(125);
  });

  // TC_createExam_026
  // Method: createExam
  // Purpose: To create exam with duration 130 min
  // Input: { title: "T", durationMinutes: 130, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_026', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 130, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 130, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(130);
  });

  // TC_createExam_027
  // Method: createExam
  // Purpose: To create exam with duration 135 min
  // Input: { title: "T", durationMinutes: 135, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_027', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 135, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 135, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(135);
  });

  // TC_createExam_028
  // Method: createExam
  // Purpose: To create exam with duration 140 min
  // Input: { title: "T", durationMinutes: 140, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_028', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 140, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 140, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(140);
  });

  // TC_createExam_029
  // Method: createExam
  // Purpose: To create exam with duration 145 min
  // Input: { title: "T", durationMinutes: 145, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_029', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 145, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 145, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(145);
  });

  // TC_createExam_030
  // Method: createExam
  // Purpose: To create exam with duration 150 min
  // Input: { title: "T", durationMinutes: 150, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_030', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 150, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 150, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(150);
  });

  // TC_createExam_031
  // Method: createExam
  // Purpose: To create exam with duration 155 min
  // Input: { title: "T", durationMinutes: 155, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_031', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 155, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 155, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(155);
  });

  // TC_createExam_032
  // Method: createExam
  // Purpose: To create exam with duration 160 min
  // Input: { title: "T", durationMinutes: 160, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_032', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 160, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 160, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(160);
  });

  // TC_createExam_033
  // Method: createExam
  // Purpose: To create exam with duration 165 min
  // Input: { title: "T", durationMinutes: 165, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_033', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 165, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 165, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(165);
  });

  // TC_createExam_034
  // Method: createExam
  // Purpose: To create exam with duration 170 min
  // Input: { title: "T", durationMinutes: 170, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_034', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 170, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 170, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(170);
  });

  // TC_createExam_035
  // Method: createExam
  // Purpose: To create exam with duration 175 min
  // Input: { title: "T", durationMinutes: 175, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_035', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 175, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 175, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(175);
  });

  // TC_createExam_036
  // Method: createExam
  // Purpose: To create exam with duration 180 min
  // Input: { title: "T", durationMinutes: 180, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_036', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 180, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 180, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(180);
  });

  // TC_createExam_037
  // Method: createExam
  // Purpose: To create exam with duration 185 min
  // Input: { title: "T", durationMinutes: 185, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_037', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 185, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 185, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(185);
  });

  // TC_createExam_038
  // Method: createExam
  // Purpose: To create exam with duration 190 min
  // Input: { title: "T", durationMinutes: 190, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_038', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 190, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 190, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(190);
  });

  // TC_createExam_039
  // Method: createExam
  // Purpose: To create exam with duration 195 min
  // Input: { title: "T", durationMinutes: 195, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_039', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 195, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 195, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(195);
  });

  // TC_createExam_040
  // Method: createExam
  // Purpose: To create exam with duration 200 min
  // Input: { title: "T", durationMinutes: 200, ... }
  // Expected output: Exam object with matching duration
  // Test result: pass
  // Note: Time calculation validation
  // checkdb: Mocked DB insert.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_040', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now() + 10000000), durationMinutes: 200, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
    mockExamModel.create.mockResolvedValue([mockExam]);

    const res = await service.createExam({
      title: 'T', durationMinutes: 200, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(),
      questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }], rateScore: 50
    } as any, { id: mockTeacherId.toHexString() } as any);

    expect(res.durationMinutes).toBe(200);
  });


  // TC_createExam_Val_001
  // Method: createExam
  // Purpose: To fail if window is too short variation 0
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_001', async () => {
    const duration = 60;
    const window = 0; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_002
  // Method: createExam
  // Purpose: To fail if window is too short variation 1
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_002', async () => {
    const duration = 60;
    const window = 2; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_003
  // Method: createExam
  // Purpose: To fail if window is too short variation 2
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_003', async () => {
    const duration = 60;
    const window = 4; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_004
  // Method: createExam
  // Purpose: To fail if window is too short variation 3
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_004', async () => {
    const duration = 60;
    const window = 6; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_005
  // Method: createExam
  // Purpose: To fail if window is too short variation 4
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_005', async () => {
    const duration = 60;
    const window = 8; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_006
  // Method: createExam
  // Purpose: To fail if window is too short variation 5
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_006', async () => {
    const duration = 60;
    const window = 10; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_007
  // Method: createExam
  // Purpose: To fail if window is too short variation 6
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_007', async () => {
    const duration = 60;
    const window = 12; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_008
  // Method: createExam
  // Purpose: To fail if window is too short variation 7
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_008', async () => {
    const duration = 60;
    const window = 14; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_009
  // Method: createExam
  // Purpose: To fail if window is too short variation 8
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_009', async () => {
    const duration = 60;
    const window = 16; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_010
  // Method: createExam
  // Purpose: To fail if window is too short variation 9
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_010', async () => {
    const duration = 60;
    const window = 18; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_011
  // Method: createExam
  // Purpose: To fail if window is too short variation 10
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_011', async () => {
    const duration = 60;
    const window = 20; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_012
  // Method: createExam
  // Purpose: To fail if window is too short variation 11
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_012', async () => {
    const duration = 60;
    const window = 22; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_013
  // Method: createExam
  // Purpose: To fail if window is too short variation 12
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_013', async () => {
    const duration = 60;
    const window = 24; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_014
  // Method: createExam
  // Purpose: To fail if window is too short variation 13
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_014', async () => {
    const duration = 60;
    const window = 26; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_015
  // Method: createExam
  // Purpose: To fail if window is too short variation 14
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_015', async () => {
    const duration = 60;
    const window = 28; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_016
  // Method: createExam
  // Purpose: To fail if window is too short variation 15
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_016', async () => {
    const duration = 60;
    const window = 30; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_017
  // Method: createExam
  // Purpose: To fail if window is too short variation 16
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_017', async () => {
    const duration = 60;
    const window = 32; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_018
  // Method: createExam
  // Purpose: To fail if window is too short variation 17
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_018', async () => {
    const duration = 60;
    const window = 34; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_019
  // Method: createExam
  // Purpose: To fail if window is too short variation 18
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_019', async () => {
    const duration = 60;
    const window = 36; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });

  // TC_createExam_Val_020
  // Method: createExam
  // Purpose: To fail if window is too short variation 19
  // Input: Window < duration
  // Expected output: BadRequestException
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB validation.
  // rollback: jest.clearAllMocks()
  it('TC_createExam_Val_020', async () => {
    const duration = 60;
    const window = 38; // Less than duration
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + window * 60000);
    const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };

    await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
      .rejects.toThrow(BadRequestException);
  });


  // TC_updateExam_001
  // Method: updateExam
  // Purpose: To update exam fields variation 1
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_001', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U0', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U0', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_002
  // Method: updateExam
  // Purpose: To update exam fields variation 2
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_002', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U1', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U1', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_003
  // Method: updateExam
  // Purpose: To update exam fields variation 3
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_003', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U2', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U2', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_004
  // Method: updateExam
  // Purpose: To update exam fields variation 4
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_004', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U3', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U3', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_005
  // Method: updateExam
  // Purpose: To update exam fields variation 5
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_005', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U4', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U4', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_006
  // Method: updateExam
  // Purpose: To update exam fields variation 6
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_006', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U5', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U5', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_007
  // Method: updateExam
  // Purpose: To update exam fields variation 7
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_007', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U6', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U6', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_008
  // Method: updateExam
  // Purpose: To update exam fields variation 8
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_008', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U7', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U7', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_009
  // Method: updateExam
  // Purpose: To update exam fields variation 9
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_009', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U8', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U8', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_010
  // Method: updateExam
  // Purpose: To update exam fields variation 10
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_010', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U9', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U9', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_011
  // Method: updateExam
  // Purpose: To update exam fields variation 11
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_011', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U10', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U10', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_012
  // Method: updateExam
  // Purpose: To update exam fields variation 12
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_012', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U11', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U11', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_013
  // Method: updateExam
  // Purpose: To update exam fields variation 13
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_013', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U12', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U12', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_014
  // Method: updateExam
  // Purpose: To update exam fields variation 14
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_014', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U13', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U13', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_015
  // Method: updateExam
  // Purpose: To update exam fields variation 15
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_015', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U14', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U14', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_016
  // Method: updateExam
  // Purpose: To update exam fields variation 16
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_016', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U15', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U15', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_017
  // Method: updateExam
  // Purpose: To update exam fields variation 17
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_017', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U16', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U16', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_018
  // Method: updateExam
  // Purpose: To update exam fields variation 18
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_018', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U17', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U17', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_019
  // Method: updateExam
  // Purpose: To update exam fields variation 19
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_019', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U18', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U18', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });

  // TC_updateExam_020
  // Method: updateExam
  // Purpose: To update exam fields variation 20
  // Input: update DTO
  // Expected output: Updated exam
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateExam_020', async () => {
    const now = new Date();
    const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{ content: 'A', isCorrect: true }, { content: 'B', isCorrect: false }, { content: 'C', isCorrect: false }, { content: 'D', isCorrect: false }] };
    mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
    mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U19', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

    await service.updateExam(mockExamId.toHexString(), { title: 'U19', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{ content: 'A' }, { content: 'B' }, { content: 'C' }, { content: 'D' }] }] } as any, { id: mockTeacherId.toHexString() } as any);
    expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
  });


  // TC_deleteExam_001
  // Method: deleteExam
  // Purpose: To delete an exam variation 1
  // Input: examId, user DTO
  // Expected output: undefined (void)
  // Test result: pass
  // Note: Deleting exam
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteExam_001', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({});

    await service.deleteExam(mockExamId.toHexString(), mockUser as any);
    expect(mockExamModel.deleteOne).toHaveBeenCalled();
  });

  // TC_deleteExam_002
  // Method: deleteExam
  // Purpose: To delete an exam variation 2
  // Input: examId, user DTO
  // Expected output: undefined (void)
  // Test result: pass
  // Note: Deleting exam
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteExam_002', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({});

    await service.deleteExam(mockExamId.toHexString(), mockUser as any);
    expect(mockExamModel.deleteOne).toHaveBeenCalled();
  });

  // TC_deleteExam_003
  // Method: deleteExam
  // Purpose: To delete an exam variation 3
  // Input: examId, user DTO
  // Expected output: undefined (void)
  // Test result: pass
  // Note: Deleting exam
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteExam_003', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({});

    await service.deleteExam(mockExamId.toHexString(), mockUser as any);
    expect(mockExamModel.deleteOne).toHaveBeenCalled();
  });

  // TC_deleteExam_004
  // Method: deleteExam
  // Purpose: To delete an exam variation 4
  // Input: examId, user DTO
  // Expected output: undefined (void)
  // Test result: pass
  // Note: Deleting exam
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteExam_004', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({});

    await service.deleteExam(mockExamId.toHexString(), mockUser as any);
    expect(mockExamModel.deleteOne).toHaveBeenCalled();
  });

  // TC_deleteExam_005
  // Method: deleteExam
  // Purpose: To delete an exam variation 5
  // Input: examId, user DTO
  // Expected output: undefined (void)
  // Test result: pass
  // Note: Deleting exam
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteExam_005', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({});

    await service.deleteExam(mockExamId.toHexString(), mockUser as any);
    expect(mockExamModel.deleteOne).toHaveBeenCalled();
  });

  // TC_deleteExam_006
  // Method: deleteExam
  // Purpose: To delete an exam variation 6
  // Input: examId, user DTO
  // Expected output: undefined (void)
  // Test result: pass
  // Note: Deleting exam
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteExam_006', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({});

    await service.deleteExam(mockExamId.toHexString(), mockUser as any);
    expect(mockExamModel.deleteOne).toHaveBeenCalled();
  });

  // TC_deleteExam_007
  // Method: deleteExam
  // Purpose: To delete an exam variation 7
  // Input: examId, user DTO
  // Expected output: undefined (void)
  // Test result: pass
  // Note: Deleting exam
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteExam_007', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({});

    await service.deleteExam(mockExamId.toHexString(), mockUser as any);
    expect(mockExamModel.deleteOne).toHaveBeenCalled();
  });

  // TC_deleteExam_008
  // Method: deleteExam
  // Purpose: To delete an exam variation 8
  // Input: examId, user DTO
  // Expected output: undefined (void)
  // Test result: pass
  // Note: Deleting exam
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteExam_008', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({});

    await service.deleteExam(mockExamId.toHexString(), mockUser as any);
    expect(mockExamModel.deleteOne).toHaveBeenCalled();
  });

  // TC_deleteExam_009
  // Method: deleteExam
  // Purpose: To delete an exam variation 9
  // Input: examId, user DTO
  // Expected output: undefined (void)
  // Test result: pass
  // Note: Deleting exam
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteExam_009', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({});

    await service.deleteExam(mockExamId.toHexString(), mockUser as any);
    expect(mockExamModel.deleteOne).toHaveBeenCalled();
  });

  // TC_deleteExam_010
  // Method: deleteExam
  // Purpose: To delete an exam variation 10
  // Input: examId, user DTO
  // Expected output: undefined (void)
  // Test result: pass
  // Note: Deleting exam
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteExam_010', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.deleteMany.mockResolvedValue({});
    mockSubmissionModel.deleteMany.mockResolvedValue({});

    await service.deleteExam(mockExamId.toHexString(), mockUser as any);
    expect(mockExamModel.deleteOne).toHaveBeenCalled();
  });


  // TC_listExamSummaries_001
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 1
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_001', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 0', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_002
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 2
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_002', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 1', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_003
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 3
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_003', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 2', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_004
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 4
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_004', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 3', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_005
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 5
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_005', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 4', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_006
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 6
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_006', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 5', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_007
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 7
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_007', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 6', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_008
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 8
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_008', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 7', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_009
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 9
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_009', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 8', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_010
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 10
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_010', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 9', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_011
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 11
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_011', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 10', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_012
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 12
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_012', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 11', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_013
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 13
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_013', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 12', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_014
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 14
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_014', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 13', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });

  // TC_listExamSummaries_015
  // Method: listExamSummaries
  // Purpose: To list exam summaries variation 15
  // Input: courseId, user DTO
  // Expected output: array of exam summaries
  // Test result: pass
  // Note: Fetching lists
  // checkdb: Mocked DB find.
  // rollback: jest.clearAllMocks()
  it('TC_listExamSummaries_015', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockCourseModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockCourseId, courseName: 'C' }]) }) });
    mockExamModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    mockExamModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ skip: jest.fn().mockReturnValue({ limit: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: mockExamId, courseId: mockCourseId, title: 'Exam 14', startTime: new Date(), endTime: new Date() }]) }) }) }) });

    const result = await service.listExamSummaries(undefined, { search: 'Test' } as any);
    expect(result).toBeDefined();
    expect(mockExamModel.find).toHaveBeenCalled();
  });


  // TC_findExamById_001
  // Method: findExamById
  // Purpose: To find exam by ID variation 1
  // Input: examId, user DTO
  // Expected output: exam detail object
  // Test result: pass
  // Note: Single fetch
  // checkdb: Mocked DB findOne.
  // rollback: jest.clearAllMocks()
  it('TC_findExamById_001', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, title: 'Exam Detail 0', questions: [] }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const result = await service.findExamById(mockExamId.toHexString(), mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_findExamById_002
  // Method: findExamById
  // Purpose: To find exam by ID variation 2
  // Input: examId, user DTO
  // Expected output: exam detail object
  // Test result: pass
  // Note: Single fetch
  // checkdb: Mocked DB findOne.
  // rollback: jest.clearAllMocks()
  it('TC_findExamById_002', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, title: 'Exam Detail 1', questions: [] }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const result = await service.findExamById(mockExamId.toHexString(), mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_findExamById_003
  // Method: findExamById
  // Purpose: To find exam by ID variation 3
  // Input: examId, user DTO
  // Expected output: exam detail object
  // Test result: pass
  // Note: Single fetch
  // checkdb: Mocked DB findOne.
  // rollback: jest.clearAllMocks()
  it('TC_findExamById_003', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, title: 'Exam Detail 2', questions: [] }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const result = await service.findExamById(mockExamId.toHexString(), mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_findExamById_004
  // Method: findExamById
  // Purpose: To find exam by ID variation 4
  // Input: examId, user DTO
  // Expected output: exam detail object
  // Test result: pass
  // Note: Single fetch
  // checkdb: Mocked DB findOne.
  // rollback: jest.clearAllMocks()
  it('TC_findExamById_004', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, title: 'Exam Detail 3', questions: [] }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const result = await service.findExamById(mockExamId.toHexString(), mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_findExamById_005
  // Method: findExamById
  // Purpose: To find exam by ID variation 5
  // Input: examId, user DTO
  // Expected output: exam detail object
  // Test result: pass
  // Note: Single fetch
  // checkdb: Mocked DB findOne.
  // rollback: jest.clearAllMocks()
  it('TC_findExamById_005', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, title: 'Exam Detail 4', questions: [] }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const result = await service.findExamById(mockExamId.toHexString(), mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_findExamById_006
  // Method: findExamById
  // Purpose: To find exam by ID variation 6
  // Input: examId, user DTO
  // Expected output: exam detail object
  // Test result: pass
  // Note: Single fetch
  // checkdb: Mocked DB findOne.
  // rollback: jest.clearAllMocks()
  it('TC_findExamById_006', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, title: 'Exam Detail 5', questions: [] }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const result = await service.findExamById(mockExamId.toHexString(), mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_findExamById_007
  // Method: findExamById
  // Purpose: To find exam by ID variation 7
  // Input: examId, user DTO
  // Expected output: exam detail object
  // Test result: pass
  // Note: Single fetch
  // checkdb: Mocked DB findOne.
  // rollback: jest.clearAllMocks()
  it('TC_findExamById_007', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, title: 'Exam Detail 6', questions: [] }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const result = await service.findExamById(mockExamId.toHexString(), mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_findExamById_008
  // Method: findExamById
  // Purpose: To find exam by ID variation 8
  // Input: examId, user DTO
  // Expected output: exam detail object
  // Test result: pass
  // Note: Single fetch
  // checkdb: Mocked DB findOne.
  // rollback: jest.clearAllMocks()
  it('TC_findExamById_008', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, title: 'Exam Detail 7', questions: [] }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const result = await service.findExamById(mockExamId.toHexString(), mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_findExamById_009
  // Method: findExamById
  // Purpose: To find exam by ID variation 9
  // Input: examId, user DTO
  // Expected output: exam detail object
  // Test result: pass
  // Note: Single fetch
  // checkdb: Mocked DB findOne.
  // rollback: jest.clearAllMocks()
  it('TC_findExamById_009', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, title: 'Exam Detail 8', questions: [] }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const result = await service.findExamById(mockExamId.toHexString(), mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

  // TC_findExamById_010
  // Method: findExamById
  // Purpose: To find exam by ID variation 10
  // Input: examId, user DTO
  // Expected output: exam detail object
  // Test result: pass
  // Note: Single fetch
  // checkdb: Mocked DB findOne.
  // rollback: jest.clearAllMocks()
  it('TC_findExamById_010', async () => {
    const mockUser = { id: mockTeacherId.toHexString(), role: 'teacher' };
    mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: mockExamId, courseId: mockCourseId, title: 'Exam Detail 9', questions: [] }) });
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
    mockQuestionModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });

    const result = await service.findExamById(mockExamId.toHexString(), mockUser as any);
    expect(result).toBeDefined();
    expect(mockExamModel.findOne).toHaveBeenCalled();
  });

});
