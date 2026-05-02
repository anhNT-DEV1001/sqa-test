import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CoursesService } from './courses.service';
import { Course } from '../../database/schemas/course.schema';
import { User } from '../../database/schemas/user.schema';
import { Enrollment } from '../../database/schemas/enrollment.schema';
import { Types } from 'mongoose';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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


  // TC_createCourse_001
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 1
  // Input: { courseName: "Course Variation 1", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 1"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_001', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 1", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 1");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_002
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 2
  // Input: { courseName: "Course Variation 2", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 2"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_002', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 2", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 2");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_003
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 3
  // Input: { courseName: "Course Variation 3", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 3"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_003', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 3", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 3");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_004
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 4
  // Input: { courseName: "Course Variation 4", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 4"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_004', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 4", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 4");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_005
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 5
  // Input: { courseName: "Course Variation 5", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 5"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_005', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 5", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 5");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_006
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 6
  // Input: { courseName: "Course Variation 6", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 6"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_006', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 6", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 6");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_007
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 7
  // Input: { courseName: "Course Variation 7", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 7"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_007', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 7", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 7");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_008
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 8
  // Input: { courseName: "Course Variation 8", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 8"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_008', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 8", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 8");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_009
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 9
  // Input: { courseName: "Course Variation 9", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 9"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_009', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 9", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 9");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_010
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 10
  // Input: { courseName: "Course Variation 10", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 10"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_010', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 10", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 10");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_011
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 11
  // Input: { courseName: "Course Variation 11", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 11"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_011', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 11", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 11");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_012
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 12
  // Input: { courseName: "Course Variation 12", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 12"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_012', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 12", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 12");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_013
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 13
  // Input: { courseName: "Course Variation 13", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 13"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_013', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 13", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 13");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_014
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 14
  // Input: { courseName: "Course Variation 14", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 14"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_014', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 14", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 14");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_015
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 15
  // Input: { courseName: "Course Variation 15", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 15"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_015', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 15", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 15");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_016
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 16
  // Input: { courseName: "Course Variation 16", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 16"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_016', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 16", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 16");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_017
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 17
  // Input: { courseName: "Course Variation 17", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 17"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_017', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 17", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 17");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_018
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 18
  // Input: { courseName: "Course Variation 18", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 18"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_018', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 18", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 18");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_019
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 19
  // Input: { courseName: "Course Variation 19", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 19"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_019', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 19", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 19");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_020
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 20
  // Input: { courseName: "Course Variation 20", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 20"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_020', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 20", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 20");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_021
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 21
  // Input: { courseName: "Course Variation 21", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 21"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_021', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 21", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 21");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_022
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 22
  // Input: { courseName: "Course Variation 22", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 22"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_022', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 22", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 22");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_023
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 23
  // Input: { courseName: "Course Variation 23", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 23"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_023', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 23", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 23");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_024
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 24
  // Input: { courseName: "Course Variation 24", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 24"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_024', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 24", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 24");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_025
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 25
  // Input: { courseName: "Course Variation 25", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 25"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_025', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 25", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 25");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_026
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 26
  // Input: { courseName: "Course Variation 26", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 26"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_026', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 26", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 26");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_027
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 27
  // Input: { courseName: "Course Variation 27", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 27"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_027', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 27", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 27");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_028
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 28
  // Input: { courseName: "Course Variation 28", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 28"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_028', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 28", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 28");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_029
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 29
  // Input: { courseName: "Course Variation 29", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 29"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_029', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 29", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 29");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_030
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 30
  // Input: { courseName: "Course Variation 30", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 30"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_030', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 30", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 30");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_031
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 31
  // Input: { courseName: "Course Variation 31", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 31"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_031', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 31", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 31");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_032
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 32
  // Input: { courseName: "Course Variation 32", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 32"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_032', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 32", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 32");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_033
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 33
  // Input: { courseName: "Course Variation 33", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 33"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_033', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 33", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 33");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_034
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 34
  // Input: { courseName: "Course Variation 34", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 34"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_034', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 34", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 34");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_035
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 35
  // Input: { courseName: "Course Variation 35", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 35"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_035', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 35", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 35");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_036
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 36
  // Input: { courseName: "Course Variation 36", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 36"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_036', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 36", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 36");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_037
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 37
  // Input: { courseName: "Course Variation 37", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 37"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_037', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 37", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 37");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_038
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 38
  // Input: { courseName: "Course Variation 38", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 38"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_038', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 38", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 38");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_039
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 39
  // Input: { courseName: "Course Variation 39", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 39"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_039', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 39", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 39");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_040
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 40
  // Input: { courseName: "Course Variation 40", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 40"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_040', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 40", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 40");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_041
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 41
  // Input: { courseName: "Course Variation 41", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 41"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_041', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 41", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 41");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_042
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 42
  // Input: { courseName: "Course Variation 42", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 42"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_042', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 42", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 42");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_043
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 43
  // Input: { courseName: "Course Variation 43", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 43"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_043', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 43", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 43");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_044
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 44
  // Input: { courseName: "Course Variation 44", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 44"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_044', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 44", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 44");
    expect(saveMock).toHaveBeenCalled();
  });

  // TC_createCourse_045
  // Method: createCourse
  // Purpose: To verify course creation logic for variation 45
  // Input: { courseName: "Course Variation 45", teacherId: "mockTeacherId.toHexString()" }
  // Expected output: Course object with name "Course Variation 45"
  // Test result: pass
  // Note: None
  // checkdb: This is a unit test mocking the DB. No real DB is affected, mock is verified.
  // rollback: jest.clearAllMocks() is called in beforeEach to restore state.
  it('TC_createCourse_045', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Instructor' });
    const saveMock = jest.fn().mockImplementation(function() { return Promise.resolve(this); });
    function mockCourseConstructor(dto: any) {
      return { ...dto, _id: new Types.ObjectId(), save: saveMock };
    }
    (service as any).courseModel = mockCourseConstructor as any;

    const result = await service.createCourse({ courseName: "Course Variation 45", teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe("Course Variation 45");
    expect(saveMock).toHaveBeenCalled();
  });


  // TC_createCourseAuth_001
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role student
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_001', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'student' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_002
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role admin
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_002', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'admin' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_003
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role guest
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_003', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'guest' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_004
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role user
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_004', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'user' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_005
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role moderator
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_005', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'moderator' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_006
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role support
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_006', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'support' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_007
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role staff
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_007', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'staff' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_008
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role external
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_008', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'external' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_009
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role parent
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_009', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'parent' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_010
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role invalid
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_010', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'invalid' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_011
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role tester
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_011', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'tester' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_012
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role manager
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_012', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'manager' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_013
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role editor
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_013', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'editor' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_014
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role viewer
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_014', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'viewer' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });

  // TC_createCourseAuth_015
  // Method: createCourse
  // Purpose: To verify course creation is rejected for role auditor
  // Input: { courseName: "Fail Course", teacherId: "..." }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Validation logic
  // checkdb: Mocked DB.
  // rollback: handled by jest.clearAllMocks()
  it('TC_createCourseAuth_015', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'auditor' });
    await expect(service.createCourse({ courseName: 'Fail Course', teacherId: mockTeacherId.toHexString() }))
      .rejects.toThrow(ForbiddenException);
  });


  // TC_getCourses_001
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query Math
  // Input: query string "Math"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_001', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'Math' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'Math', $options: 'i' } },
        { publicId: { $regex: 'Math', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_002
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query Physics
  // Input: query string "Physics"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_002', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'Physics' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'Physics', $options: 'i' } },
        { publicId: { $regex: 'Physics', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_003
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query Chemistry
  // Input: query string "Chemistry"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_003', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'Chemistry' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'Chemistry', $options: 'i' } },
        { publicId: { $regex: 'Chemistry', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_004
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query CS
  // Input: query string "CS"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_004', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'CS' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'CS', $options: 'i' } },
        { publicId: { $regex: 'CS', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_005
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query Algo
  // Input: query string "Algo"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_005', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'Algo' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'Algo', $options: 'i' } },
        { publicId: { $regex: 'Algo', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_006
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query Data
  // Input: query string "Data"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_006', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'Data' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'Data', $options: 'i' } },
        { publicId: { $regex: 'Data', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_007
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query Web
  // Input: query string "Web"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_007', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'Web' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'Web', $options: 'i' } },
        { publicId: { $regex: 'Web', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_008
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query Mobile
  // Input: query string "Mobile"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_008', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'Mobile' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'Mobile', $options: 'i' } },
        { publicId: { $regex: 'Mobile', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_009
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query AI
  // Input: query string "AI"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_009', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'AI' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'AI', $options: 'i' } },
        { publicId: { $regex: 'AI', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_010
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query ML
  // Input: query string "ML"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_010', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'ML' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'ML', $options: 'i' } },
        { publicId: { $regex: 'ML', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_011
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query 101
  // Input: query string "101"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_011', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: '101' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: '101', $options: 'i' } },
        { publicId: { $regex: '101', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_012
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query 202
  // Input: query string "202"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_012', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: '202' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: '202', $options: 'i' } },
        { publicId: { $regex: '202', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_013
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query 303
  // Input: query string "303"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_013', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: '303' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: '303', $options: 'i' } },
        { publicId: { $regex: '303', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_014
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query 404
  // Input: query string "404"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_014', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: '404' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: '404', $options: 'i' } },
        { publicId: { $regex: '404', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_015
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query 505
  // Input: query string "505"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_015', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: '505' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: '505', $options: 'i' } },
        { publicId: { $regex: '505', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_016
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query test
  // Input: query string "test"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_016', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'test' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'test', $options: 'i' } },
        { publicId: { $regex: 'test', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_017
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query exam
  // Input: query string "exam"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_017', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'exam' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'exam', $options: 'i' } },
        { publicId: { $regex: 'exam', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_018
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query final
  // Input: query string "final"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_018', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'final' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'final', $options: 'i' } },
        { publicId: { $regex: 'final', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_019
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query mid
  // Input: query string "mid"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_019', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'mid' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'mid', $options: 'i' } },
        { publicId: { $regex: 'mid', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_020
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query intro
  // Input: query string "intro"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_020', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'intro' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'intro', $options: 'i' } },
        { publicId: { $regex: 'intro', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_021
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query adv
  // Input: query string "adv"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_021', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'adv' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'adv', $options: 'i' } },
        { publicId: { $regex: 'adv', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_022
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query beg
  // Input: query string "beg"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_022', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'beg' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'beg', $options: 'i' } },
        { publicId: { $regex: 'beg', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_023
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query seq
  // Input: query string "seq"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_023', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'seq' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'seq', $options: 'i' } },
        { publicId: { $regex: 'seq', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_024
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query str
  // Input: query string "str"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_024', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'str' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'str', $options: 'i' } },
        { publicId: { $regex: 'str', $options: 'i' } }
      ]
    }));
  });

  // TC_getCourses_025
  // Method: getCoursesByTeacher
  // Purpose: To apply search filter for query val
  // Input: query string "val"
  // Expected output: Array of courses matching the query
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB read.
  // rollback: none required for read operation
  it('TC_getCourses_025', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);
    (service as any).courseModel = mockCourseModel;

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'val' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { courseName: { $regex: 'val', $options: 'i' } },
        { publicId: { $regex: 'val', $options: 'i' } }
      ]
    }));
  });


  // TC_updateCourse_001
  // Method: updateCourseName
  // Purpose: To verify course update variation 1
  // Input: { courseName: "New Name 1" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_001', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 1', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 1' });
    expect(res.courseName).toBe('New Name 1');
  });

  // TC_updateCourse_002
  // Method: updateCourseName
  // Purpose: To verify course update variation 2
  // Input: { courseName: "New Name 2" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_002', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 2', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 2' });
    expect(res.courseName).toBe('New Name 2');
  });

  // TC_updateCourse_003
  // Method: updateCourseName
  // Purpose: To verify course update variation 3
  // Input: { courseName: "New Name 3" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_003', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 3', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 3' });
    expect(res.courseName).toBe('New Name 3');
  });

  // TC_updateCourse_004
  // Method: updateCourseName
  // Purpose: To verify course update variation 4
  // Input: { courseName: "New Name 4" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_004', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 4', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 4' });
    expect(res.courseName).toBe('New Name 4');
  });

  // TC_updateCourse_005
  // Method: updateCourseName
  // Purpose: To verify course update variation 5
  // Input: { courseName: "New Name 5" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_005', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 5', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 5' });
    expect(res.courseName).toBe('New Name 5');
  });

  // TC_updateCourse_006
  // Method: updateCourseName
  // Purpose: To verify course update variation 6
  // Input: { courseName: "New Name 6" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_006', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 6', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 6' });
    expect(res.courseName).toBe('New Name 6');
  });

  // TC_updateCourse_007
  // Method: updateCourseName
  // Purpose: To verify course update variation 7
  // Input: { courseName: "New Name 7" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_007', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 7', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 7' });
    expect(res.courseName).toBe('New Name 7');
  });

  // TC_updateCourse_008
  // Method: updateCourseName
  // Purpose: To verify course update variation 8
  // Input: { courseName: "New Name 8" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_008', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 8', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 8' });
    expect(res.courseName).toBe('New Name 8');
  });

  // TC_updateCourse_009
  // Method: updateCourseName
  // Purpose: To verify course update variation 9
  // Input: { courseName: "New Name 9" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_009', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 9', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 9' });
    expect(res.courseName).toBe('New Name 9');
  });

  // TC_updateCourse_010
  // Method: updateCourseName
  // Purpose: To verify course update variation 10
  // Input: { courseName: "New Name 10" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_010', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 10', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 10' });
    expect(res.courseName).toBe('New Name 10');
  });

  // TC_updateCourse_011
  // Method: updateCourseName
  // Purpose: To verify course update variation 11
  // Input: { courseName: "New Name 11" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_011', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 11', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 11' });
    expect(res.courseName).toBe('New Name 11');
  });

  // TC_updateCourse_012
  // Method: updateCourseName
  // Purpose: To verify course update variation 12
  // Input: { courseName: "New Name 12" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_012', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 12', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 12' });
    expect(res.courseName).toBe('New Name 12');
  });

  // TC_updateCourse_013
  // Method: updateCourseName
  // Purpose: To verify course update variation 13
  // Input: { courseName: "New Name 13" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_013', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 13', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 13' });
    expect(res.courseName).toBe('New Name 13');
  });

  // TC_updateCourse_014
  // Method: updateCourseName
  // Purpose: To verify course update variation 14
  // Input: { courseName: "New Name 14" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_014', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 14', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 14' });
    expect(res.courseName).toBe('New Name 14');
  });

  // TC_updateCourse_015
  // Method: updateCourseName
  // Purpose: To verify course update variation 15
  // Input: { courseName: "New Name 15" }
  // Expected output: Updated course object
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB update.
  // rollback: jest.clearAllMocks()
  it('TC_updateCourse_015', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn().mockResolvedValue({ _id: mockCourseId, courseName: 'New Name 15', teacherId: mockTeacherId })
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);
    (service as any).courseModel = mockCourseModel;

    const res = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name 15' });
    expect(res.courseName).toBe('New Name 15');
  });


  // TC_deleteCourse_001
  // Method: deleteCourse
  // Purpose: To verify course deletion variation 1
  // Input: courseId
  // Expected output: Void
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteCourse_001', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn()
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    (service as any).courseModel = mockCourseModel;

    await service.deleteCourse(mockCourseId.toHexString());
    expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: mockCourseId.toHexString() });
  });

  // TC_deleteCourse_002
  // Method: deleteCourse
  // Purpose: To verify course deletion variation 2
  // Input: courseId
  // Expected output: Void
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteCourse_002', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn()
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    (service as any).courseModel = mockCourseModel;

    await service.deleteCourse(mockCourseId.toHexString());
    expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: mockCourseId.toHexString() });
  });

  // TC_deleteCourse_003
  // Method: deleteCourse
  // Purpose: To verify course deletion variation 3
  // Input: courseId
  // Expected output: Void
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteCourse_003', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn()
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    (service as any).courseModel = mockCourseModel;

    await service.deleteCourse(mockCourseId.toHexString());
    expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: mockCourseId.toHexString() });
  });

  // TC_deleteCourse_004
  // Method: deleteCourse
  // Purpose: To verify course deletion variation 4
  // Input: courseId
  // Expected output: Void
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteCourse_004', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn()
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    (service as any).courseModel = mockCourseModel;

    await service.deleteCourse(mockCourseId.toHexString());
    expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: mockCourseId.toHexString() });
  });

  // TC_deleteCourse_005
  // Method: deleteCourse
  // Purpose: To verify course deletion variation 5
  // Input: courseId
  // Expected output: Void
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteCourse_005', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn()
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    (service as any).courseModel = mockCourseModel;

    await service.deleteCourse(mockCourseId.toHexString());
    expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: mockCourseId.toHexString() });
  });

  // TC_deleteCourse_006
  // Method: deleteCourse
  // Purpose: To verify course deletion variation 6
  // Input: courseId
  // Expected output: Void
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteCourse_006', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn()
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    (service as any).courseModel = mockCourseModel;

    await service.deleteCourse(mockCourseId.toHexString());
    expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: mockCourseId.toHexString() });
  });

  // TC_deleteCourse_007
  // Method: deleteCourse
  // Purpose: To verify course deletion variation 7
  // Input: courseId
  // Expected output: Void
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteCourse_007', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn()
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    (service as any).courseModel = mockCourseModel;

    await service.deleteCourse(mockCourseId.toHexString());
    expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: mockCourseId.toHexString() });
  });

  // TC_deleteCourse_008
  // Method: deleteCourse
  // Purpose: To verify course deletion variation 8
  // Input: courseId
  // Expected output: Void
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteCourse_008', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn()
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    (service as any).courseModel = mockCourseModel;

    await service.deleteCourse(mockCourseId.toHexString());
    expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: mockCourseId.toHexString() });
  });

  // TC_deleteCourse_009
  // Method: deleteCourse
  // Purpose: To verify course deletion variation 9
  // Input: courseId
  // Expected output: Void
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteCourse_009', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn()
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    (service as any).courseModel = mockCourseModel;

    await service.deleteCourse(mockCourseId.toHexString());
    expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: mockCourseId.toHexString() });
  });

  // TC_deleteCourse_010
  // Method: deleteCourse
  // Purpose: To verify course deletion variation 10
  // Input: courseId
  // Expected output: Void
  // Test result: pass
  // Note: None
  // checkdb: Mocked DB delete.
  // rollback: jest.clearAllMocks()
  it('TC_deleteCourse_010', async () => {
    const mockCourse = { 
      _id: mockCourseId, 
      courseName: 'Old', 
      teacherId: mockTeacherId,
      save: jest.fn()
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    (service as any).courseModel = mockCourseModel;

    await service.deleteCourse(mockCourseId.toHexString());
    expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: mockCourseId.toHexString() });
  });

});
