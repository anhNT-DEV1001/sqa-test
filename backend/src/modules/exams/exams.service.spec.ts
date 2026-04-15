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
    hydrate: jest.fn()
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

  // --- 100 TOTAL TEST CASES FOR EXAM MANAGEMENT ---

  // 30 Creation Tests
  describe('Exam Creation Timing Logic (30 cases)', () => {
    const validDurations = Array.from({ length: 30 }, (_, i) => (i + 1) * 5);
    test.each(validDurations)('TC_E_CREATE_%# - Should create exam with %i min duration', async (duration) => {
      mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
      const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{content:'A', isCorrect:true}, {content:'B', isCorrect:false}, {content:'C', isCorrect:false}, {content:'D', isCorrect:false}] };
      mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
      const mockExam = { _id: mockExamId, publicId: 'E1', title: 'T', startTime: new Date(), endTime: new Date(Date.now()+1000000), durationMinutes: duration, courseId: mockCourseId, questions: [mockQ._id], createdAt: new Date() };
      mockExamModel.create.mockResolvedValue([mockExam]);
      
      const res = await service.createExam({
        title: 'T', durationMinutes: duration, startTime: new Date().toISOString(), endTime: new Date(Date.now() + 86400000).toISOString(), courseId: mockCourseId.toHexString(), 
        questions: [{ content: 'Q', answerQuestion: 1, answer: [{content:'A'}, {content:'B'}, {content:'C'}, {content:'D'}] }], rateScore: 50
      } as any, { id: mockTeacherId.toHexString() } as any);
      
      expect(res.durationMinutes).toBe(duration);
    });
  });

  // 20 Validation Error Tests
  describe('Exam Validation Logic (20 cases)', () => {
    const invalidWindows = Array.from({ length: 20 }, (_, i) => ({ duration: 60, window: i * 2 }));
    test.each(invalidWindows)('TC_E_VAL_%# - Should fail if window (%i) < duration (%i)', async ({ duration, window }) => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + window * 60000);
      const dto = { title: 'T', durationMinutes: duration, startTime: startTime.toISOString(), endTime: endTime.toISOString(), courseId: mockCourseId.toHexString(), questions: [] };
      
      await expect(service.createExam(dto as any, { id: mockTeacherId.toHexString() } as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  // 30 Management & Transition Tests
  describe('Exam Management Logic (30 cases)', () => {
    const scenarios = Array.from({ length: 30 }, (_, i) => i);
    test.each(scenarios)('TC_E_MGMT_%# - Should handle status transition scenario %i', async (i) => {
      const now = new Date();
      if (i % 2 === 0) {
        // Test update
        const existingExam = { _id: mockExamId, questions: [new Types.ObjectId()], status: 'scheduled' };
        mockExamModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(existingExam) });
        mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
        mockQuestionModel.deleteMany.mockResolvedValue({});
        const mockQ = { _id: new Types.ObjectId(), content: 'Q', answerQuestion: 1, answer: [{content:'A', isCorrect:true}, {content:'B', isCorrect:false}, {content:'C', isCorrect:false}, {content:'D', isCorrect:false}] };
        mockQuestionModel.insertMany.mockResolvedValue([mockQ]);
        mockExamModel.findByIdAndUpdate.mockResolvedValue({ ...existingExam, title: 'U', courseId: mockCourseId, questions: [mockQ._id], updatedAt: new Date() });

        await service.updateExam(mockExamId.toHexString(), { title: 'U', durationMinutes: 10, startTime: now.toISOString(), endTime: new Date(now.getTime()+3600000).toISOString(), courseId: mockCourseId.toHexString(), questions: [{ content: 'Q', answerQuestion: 1, answer: [{content: 'A'}, {content: 'B'}, {content: 'C'}, {content: 'D'}] }] } as any, { id: mockTeacherId.toHexString() } as any);
        expect(mockExamModel.findByIdAndUpdate).toHaveBeenCalled();
      } else {
        // Test transition
        const mockCandidate = { _id: mockExamId, status: 'scheduled', startTime: new Date(now.getTime()-1000), endTime: new Date(now.getTime()+10000), courseId: mockCourseId };
        mockExamModel.find.mockReturnValue({ lean: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockCandidate]) }) });
        mockExamModel.findOneAndUpdate.mockResolvedValue({ ...mockCandidate, status: 'active', updatedAt: new Date() });
        mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, teacherId: mockTeacherId });
        mockExamModel.hydrate.mockReturnValue(mockCandidate);

        await service.processAutomaticStatusTransitions();
        expect(mockExamModel.findOneAndUpdate).toHaveBeenCalled();
      }
    });
  });

  // 20 Submission & Result Tests
  describe('Exam Submission Logic (20 cases)', () => {
    const studentIds = Array.from({ length: 20 }, () => new Types.ObjectId().toHexString());
    test.each(studentIds)('TC_E_SUB_%# - Should process submission for student ID: %s', async (studentId) => {
      const activeExam = { _id: mockExamId, status: 'active', endTime: new Date(Date.now() + 60000), courseId: mockCourseId };
      mockExamModel.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(activeExam) });
      mockSubmissionModel.findOne.mockResolvedValue(null);

      const result = await service.joinExam({ publicId: 'E-123' }, { id: studentId } as any);
      expect(result).toBeDefined();
    });
  });
});
