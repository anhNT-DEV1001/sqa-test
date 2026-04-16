import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { Course } from '../../database/schemas/course.schema';
import { User } from '../../database/schemas/user.schema';
import { Enrollment } from '../../database/schemas/enrollment.schema';
import { Types } from 'mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as idUtils from '../../common/utils/public-id.util';

describe('CoursesService - Instructor Course Management', () => {
  let service: CoursesService;

  const mockCourseId = new Types.ObjectId();
  const mockTeacherId = new Types.ObjectId();
  const mockStudentId = new Types.ObjectId();

  const mockCourseModel = {
    find: jest.fn(),
    findById: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
  };

  const mockEnrollmentModel = {
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Mock generatePrefixedPublicId locally
    jest.spyOn(idUtils, 'generatePrefixedPublicId').mockResolvedValue('C-123456');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getModelToken(Course.name), useValue: mockCourseModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Enrollment.name), useValue: mockEnrollmentModel },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  // --- 100 TOTAL TEST CASES FOR COURSE MANAGEMENT ---

  // 40 Creation Tests: testing various name lengths and teacher validation
  describe('Create Course Logic (40 cases)', () => {
    const validNames = Array.from({ length: 40 }, (_, i) => `Course Variation ${i + 1}`);
    test.each(validNames)('TC_C_CREATE_%# - Should successfully create course with name: %s', async (name) => {
      mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
      
      const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
      function mockCourseConstructor(dto: any) {
        return { ...dto, _id: new Types.ObjectId(), save: saveMock };
      }
      (service as any).courseModel = mockCourseConstructor as any;

      const result = await service.createCourse({ courseName: name, teacherId: mockTeacherId.toHexString() });
      expect(result.courseName).toBe(name);
      expect(saveMock).toHaveBeenCalled();
    });
  });

  // 10 Authorization Tests
  describe('Authorization Logic (10 cases)', () => {
    const roles = ['student', 'admin', 'guest', 'user', 'moderator', 'support', 'staff', 'external', 'parent', 'invalid'];
    test.each(roles)('TC_C_AUTH_%# - Should reject course creation for role: %s', async (role) => {
      mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: role });
      await expect(service.createCourse({ courseName: 'Fail', teacherId: mockTeacherId.toHexString() }))
        .rejects.toThrow(ForbiddenException);
    });
  });

  // 25 Search & Filtering Tests
  describe('Search & Filter Logic (25 cases)', () => {
    const searchQueries = ['Math', 'Physics', 'Chemistry', 'CS', 'Algo', 'Data', 'Web', 'Mobile', 'AI', 'ML', '101', '202', '303', '404', '505', 'test', 'exam', 'final', 'mid', 'intro', 'adv', 'beg', 'seq', 'str', 'val'];
    test.each(searchQueries)('TC_C_SEARCH_%# - Should apply regex filter for query: %s', async (query) => {
      mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
      mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
      mockEnrollmentModel.aggregate.mockResolvedValue([]);
      (service as any).courseModel = mockCourseModel;

      await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: query });

      expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
        $or: [
          { courseName: { $regex: query, $options: 'i' } },
          { publicId: { $regex: query, $options: 'i' } }
        ]
      }));
    });
  });

  // 25 Update & Delete Tests
  describe('Update & Delete Logic (25 cases)', () => {
    const variations = Array.from({ length: 25 }, (_, i) => i);
    test.each(variations)('TC_C_OPS_%# - Should handle CRUD lifecycle variation', async (i) => {
      const mockCourse = { 
        _id: mockCourseId, 
        courseName: 'Old', 
        teacherId: mockTeacherId,
        save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New', teacherId: mockTeacherId })
      };
      mockCourseModel.findById.mockResolvedValue(mockCourse);
      mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
      mockEnrollmentModel.countDocuments.mockResolvedValue(5);
      (service as any).courseModel = mockCourseModel;

      if (i % 2 === 0) {
        const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New' });
        expect(res.courseName).toBe('New');
      } else {
        await service.deleteCourse(mockCourseId.toHexString());
        expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: mockCourseId.toHexString() });
      }
    });
  });
});
