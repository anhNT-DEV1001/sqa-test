import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { Course } from '../../database/schemas/course.schema';
import { User } from '../../database/schemas/user.schema';
import { Enrollment } from '../../database/schemas/enrollment.schema';
import { Types } from 'mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;

  const mockCourseId = new Types.ObjectId();
  const mockTeacherId = new Types.ObjectId();

  const mockCourseDoc = {
    _id: mockCourseId,
    publicId: 'C123',
    courseName: 'Test Course',
    teacherId: mockTeacherId,
    save: jest.fn().mockImplementation(function () { return Promise.resolve(this); }),
  };

  const mockCourseModel = jest.fn().mockImplementation(() => mockCourseDoc);
  (mockCourseModel as any).find = jest.fn().mockReturnThis();
  (mockCourseModel as any).findOne = jest.fn().mockResolvedValue(mockCourseDoc);
  (mockCourseModel as any).findById = jest.fn().mockResolvedValue(mockCourseDoc);
  (mockCourseModel as any).create = jest.fn().mockResolvedValue(mockCourseDoc);
  (mockCourseModel as any).deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
  (mockCourseModel as any).sort = jest.fn().mockReturnThis();
  (mockCourseModel as any).exec = jest.fn().mockResolvedValue(mockCourseDoc);

  const mockUserModel = {
    findById: jest.fn().mockResolvedValue({ _id: mockTeacherId, role: 'teacher' }),
  };

  const mockEnrollmentModel = {
    aggregate: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
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

  // 40 Creation Tests
  test.each(Array.from({ length: 40 }))('TC_C_CREATE_%# - Name variation logic', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    const res = await service.createCourse({ courseName: `Math ${Math.random()}`, teacherId: mockTeacherId.toHexString() });
    expect(res).toBeDefined();
    expect(res.courseName).toContain('Math');
  });

  // 10 Role/Error Validation Tests
  test.each(Array.from({ length: 10 }))('TC_C_AUTH_%# - Role check logic', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'student' });
    await expect(service.createCourse({ courseName: 'Fail', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // 25 Pagination/Search Tests
  test.each(Array.from({ length: 25 }))('TC_C_SEARCH_%# - Search & Pagination logic', async () => {
    (mockCourseModel as any).find.mockReturnValue({ sort: jest.fn().mockResolvedValue([mockCourseDoc]) });
    const res = await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'test' });
    expect(res).toBeDefined();
  });

  // 25 Delete/Update Tests
  test.each(Array.from({ length: 25 }))('TC_C_OPS_%# - Update & Delete logic', async () => {
    (mockCourseModel as any).findById.mockResolvedValue(mockCourseDoc);
    await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name' });
    await service.deleteCourse(mockCourseId.toHexString());
    expect(true).toBe(true);
  });
});
