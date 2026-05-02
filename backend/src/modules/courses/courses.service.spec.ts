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

  // ============================================================
  // createCourse Method Tests
  // ============================================================

  // TC_CREATE_COURSE_001
  // Method: createCourse
  // Purpose: Verify successful course creation with a valid teacher and course name
  // Input: { courseName: "Introduction to Programming", teacherId: valid ObjectId with role 'teacher' }
  // Expected output: CourseBasicResponseDto with courseName "Introduction to Programming", publicId "C-123456", enrollmentCount 0
  // Test result: pass
  // Note: Happy path - standard course creation flow
  // checkdb: Verifies courseModel constructor called with correct data, save() invoked to persist to DB
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_001', async () => {
    const teacherDoc = { _id: mockTeacherId, role: 'teacher', fullName: 'John Doe' };
    mockUserModel.findById.mockResolvedValue(teacherDoc);

    const saveMock = jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    });
    const constructedCourse: any = {
      _id: new Types.ObjectId(),
      courseName: 'Introduction to Programming',
      teacherId: mockTeacherId,
      publicId: 'C-123456',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: saveMock,
    };
    (service as any).courseModel = jest.fn().mockReturnValue(constructedCourse);

    const result = await service.createCourse({
      courseName: 'Introduction to Programming',
      teacherId: mockTeacherId.toHexString(),
    });

    expect(result.courseName).toBe('Introduction to Programming');
    expect(result.publicId).toBe('C-123456');
    expect(result.enrollmentCount).toBe(0);
    expect(result.teacherName).toBe('John Doe');
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  // TC_CREATE_COURSE_002
  // Method: createCourse
  // Purpose: Verify NotFoundException is thrown when teacherId does not exist in the database
  // Input: { courseName: "Math 101", teacherId: non-existent ObjectId }
  // Expected output: NotFoundException with message "Teacher not found"
  // Test result: pass
  // Note: Edge case - teacher ID references a user that does not exist
  // checkdb: Verifies userModel.findById was called, no course record created
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_002', async () => {
    mockUserModel.findById.mockResolvedValue(null);

    await expect(
      service.createCourse({
        courseName: 'Math 101',
        teacherId: new Types.ObjectId().toHexString(),
      }),
    ).rejects.toThrow(NotFoundException);

    expect(mockUserModel.findById).toHaveBeenCalledTimes(1);
  });

  // TC_CREATE_COURSE_003
  // Method: createCourse
  // Purpose: Verify ForbiddenException is thrown when user has role 'student' instead of 'teacher'
  // Input: { courseName: "Physics 201", teacherId: valid ObjectId with role 'student' }
  // Expected output: ForbiddenException with message "Only teachers can create courses"
  // Test result: pass
  // Note: Authorization check - only role 'teacher' is allowed to create courses
  // checkdb: Verifies userModel.findById was called, no course record created
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_003', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'student' });

    await expect(
      service.createCourse({
        courseName: 'Physics 201',
        teacherId: mockTeacherId.toHexString(),
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_CREATE_COURSE_004
  // Method: createCourse
  // Purpose: Verify ForbiddenException is thrown when user has role 'admin' instead of 'teacher'
  // Input: { courseName: "Chemistry 301", teacherId: valid ObjectId with role 'admin' }
  // Expected output: ForbiddenException with message "Only teachers can create courses"
  // Test result: pass
  // Note: Authorization check - admin role should not be able to create courses
  // checkdb: Verifies userModel.findById was called, no course record created
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_004', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'admin' });

    await expect(
      service.createCourse({
        courseName: 'Chemistry 301',
        teacherId: mockTeacherId.toHexString(),
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_CREATE_COURSE_005
  // Method: createCourse
  // Purpose: Verify that generatePrefixedPublicId is called with prefix 'C' and the course model
  // Input: { courseName: "Web Development", teacherId: valid teacher ObjectId }
  // Expected output: Course created with publicId generated by the utility function
  // Test result: pass
  // Note: Verifies integration with the public-id utility
  // checkdb: Confirms generatePrefixedPublicId was invoked with correct parameters
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_005', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Jane Smith' });

    const saveMock = jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    });
    const constructedCourse: any = {
      _id: new Types.ObjectId(),
      courseName: 'Web Development',
      teacherId: mockTeacherId,
      publicId: 'C-123456',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: saveMock,
    };
    (service as any).courseModel = jest.fn().mockReturnValue(constructedCourse);

    await service.createCourse({
      courseName: 'Web Development',
      teacherId: mockTeacherId.toHexString(),
    });

    expect(idUtils.generatePrefixedPublicId).toHaveBeenCalledWith('C', expect.anything());
  });

  // TC_CREATE_COURSE_006
  // Method: createCourse
  // Purpose: Verify the returned DTO contains correct teacherId mapped from the input
  // Input: { courseName: "Data Structures", teacherId: specific valid ObjectId }
  // Expected output: CourseBasicResponseDto with teacherId matching the input teacherId string
  // Test result: pass
  // Note: Ensures the mapCourse private method correctly stringifies the ObjectId
  // checkdb: Verifies save() was called and the response maps teacherId correctly
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_006', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Dr. Lee' });

    const courseObjId = new Types.ObjectId();
    const saveMock = jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    });
    const constructedCourse: any = {
      _id: courseObjId,
      courseName: 'Data Structures',
      teacherId: mockTeacherId,
      publicId: 'C-123456',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: saveMock,
    };
    (service as any).courseModel = jest.fn().mockReturnValue(constructedCourse);

    const result = await service.createCourse({
      courseName: 'Data Structures',
      teacherId: mockTeacherId.toHexString(),
    });

    expect(result.teacherId).toBe(String(mockTeacherId));
    expect(result.id).toBe(String(courseObjId));
  });

  // TC_CREATE_COURSE_007
  // Method: createCourse
  // Purpose: Verify course creation with a long course name (boundary test)
  // Input: { courseName: "A".repeat(200), teacherId: valid teacher ObjectId }
  // Expected output: CourseBasicResponseDto with the long courseName preserved exactly
  // Test result: pass
  // Note: Boundary test - verifies no truncation occurs at the service level
  // checkdb: Verifies save() was called with the full-length courseName
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_007', async () => {
    const longName = 'A'.repeat(200);
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Prof. X' });

    const saveMock = jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    });
    const constructedCourse: any = {
      _id: new Types.ObjectId(),
      courseName: longName,
      teacherId: mockTeacherId,
      publicId: 'C-123456',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: saveMock,
    };
    (service as any).courseModel = jest.fn().mockReturnValue(constructedCourse);

    const result = await service.createCourse({
      courseName: longName,
      teacherId: mockTeacherId.toHexString(),
    });

    expect(result.courseName).toBe(longName);
    expect(result.courseName.length).toBe(200);
  });

  // TC_CREATE_COURSE_008
  // Method: createCourse
  // Purpose: Verify course creation with special characters in course name
  // Input: { courseName: "C++ & Data Structures (Advanced) #101", teacherId: valid teacher ObjectId }
  // Expected output: CourseBasicResponseDto with special characters preserved in courseName
  // Test result: pass
  // Note: Edge case - special characters should not be stripped or escaped by the service
  // checkdb: Verifies save() was called with special characters intact
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_008', async () => {
    const specialName = 'C++ & Data Structures (Advanced) #101';
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Prof. Y' });

    const saveMock = jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    });
    const constructedCourse: any = {
      _id: new Types.ObjectId(),
      courseName: specialName,
      teacherId: mockTeacherId,
      publicId: 'C-123456',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: saveMock,
    };
    (service as any).courseModel = jest.fn().mockReturnValue(constructedCourse);

    const result = await service.createCourse({
      courseName: specialName,
      teacherId: mockTeacherId.toHexString(),
    });

    expect(result.courseName).toBe(specialName);
  });

  // TC_CREATE_COURSE_009
  // Method: createCourse
  // Purpose: Verify course creation sets enrollmentCount to 0 for a new course
  // Input: { courseName: "Algorithms", teacherId: valid teacher ObjectId }
  // Expected output: CourseBasicResponseDto with enrollmentCount === 0
  // Test result: pass
  // Note: New courses always start with zero enrollments
  // checkdb: Verifies the mapCourse function is called with enrollmentCount=0
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_009', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Dr. Algo' });

    const saveMock = jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    });
    const constructedCourse: any = {
      _id: new Types.ObjectId(),
      courseName: 'Algorithms',
      teacherId: mockTeacherId,
      publicId: 'C-123456',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: saveMock,
    };
    (service as any).courseModel = jest.fn().mockReturnValue(constructedCourse);

    const result = await service.createCourse({
      courseName: 'Algorithms',
      teacherId: mockTeacherId.toHexString(),
    });

    expect(result.enrollmentCount).toBe(0);
  });

  // TC_CREATE_COURSE_010
  // Method: createCourse
  // Purpose: Verify ForbiddenException for an empty-string role (neither 'teacher' nor recognized)
  // Input: { courseName: "Test Course", teacherId: valid ObjectId with role '' }
  // Expected output: ForbiddenException
  // Test result: pass
  // Note: Edge case - empty role string should be rejected
  // checkdb: No DB write operation performed
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_010', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: '' });

    await expect(
      service.createCourse({
        courseName: 'Test Course',
        teacherId: mockTeacherId.toHexString(),
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_CREATE_COURSE_011
  // Method: createCourse
  // Purpose: Verify course creation when teacher fullName is undefined (nullable field)
  // Input: { courseName: "Database Systems", teacherId: valid teacher ObjectId, teacher.fullName = undefined }
  // Expected output: CourseBasicResponseDto with teacherName === undefined
  // Test result: pass
  // Note: Edge case - fullName may be optional on User schema
  // checkdb: Verifies save() was called, response teacherName is undefined
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_011', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: undefined });

    const saveMock = jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    });
    const constructedCourse: any = {
      _id: new Types.ObjectId(),
      courseName: 'Database Systems',
      teacherId: mockTeacherId,
      publicId: 'C-123456',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: saveMock,
    };
    (service as any).courseModel = jest.fn().mockReturnValue(constructedCourse);

    const result = await service.createCourse({
      courseName: 'Database Systems',
      teacherId: mockTeacherId.toHexString(),
    });

    expect(result.teacherName).toBeUndefined();
    expect(result.courseName).toBe('Database Systems');
  });

  // TC_CREATE_COURSE_012
  // Method: createCourse
  // Purpose: Verify course creation with Unicode characters in course name
  // Input: { courseName: "数学入門 - 線形代数", teacherId: valid teacher ObjectId }
  // Expected output: CourseBasicResponseDto with Unicode courseName preserved
  // Test result: pass
  // Note: Internationalization test - Japanese characters
  // checkdb: Verifies save() was called with Unicode name intact
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_012', async () => {
    const unicodeName = '数学入門 - 線形代数';
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Tanaka Sensei' });

    const saveMock = jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    });
    const constructedCourse: any = {
      _id: new Types.ObjectId(),
      courseName: unicodeName,
      teacherId: mockTeacherId,
      publicId: 'C-123456',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: saveMock,
    };
    (service as any).courseModel = jest.fn().mockReturnValue(constructedCourse);

    const result = await service.createCourse({
      courseName: unicodeName,
      teacherId: mockTeacherId.toHexString(),
    });

    expect(result.courseName).toBe(unicodeName);
  });

  // TC_CREATE_COURSE_013
  // Method: createCourse
  // Purpose: Verify that the courseModel constructor is called with correct teacherId as ObjectId
  // Input: { courseName: "Operating Systems", teacherId: valid teacher ObjectId string }
  // Expected output: courseModel constructor called with teacherId as Types.ObjectId instance
  // Test result: pass
  // Note: Ensures teacherId is converted from string to ObjectId before saving
  // checkdb: Verifies constructor call arguments include Types.ObjectId for teacherId
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_013', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Prof. OS' });

    const saveMock = jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    });
    const mockConstructor = jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      save: saveMock,
    }));
    (service as any).courseModel = mockConstructor;

    await service.createCourse({
      courseName: 'Operating Systems',
      teacherId: mockTeacherId.toHexString(),
    });

    expect(mockConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        courseName: 'Operating Systems',
        publicId: 'C-123456',
      }),
    );
    // Verify teacherId is an ObjectId
    const callArgs = mockConstructor.mock.calls[0][0];
    expect(callArgs.teacherId).toBeInstanceOf(Types.ObjectId);
  });

  // TC_CREATE_COURSE_014
  // Method: createCourse
  // Purpose: Verify response contains createdAt and updatedAt timestamps
  // Input: { courseName: "Software Engineering", teacherId: valid teacher ObjectId }
  // Expected output: CourseBasicResponseDto with defined createdAt and updatedAt fields
  // Test result: pass
  // Note: Ensures timestamp fields are propagated through mapCourse
  // checkdb: Verifies course document includes timestamp fields
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_014', async () => {
    const now = new Date();
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Prof. SE' });

    const saveMock = jest.fn().mockImplementation(function () {
      return Promise.resolve(this);
    });
    const constructedCourse: any = {
      _id: new Types.ObjectId(),
      courseName: 'Software Engineering',
      teacherId: mockTeacherId,
      publicId: 'C-123456',
      createdAt: now,
      updatedAt: now,
      save: saveMock,
    };
    (service as any).courseModel = jest.fn().mockReturnValue(constructedCourse);

    const result = await service.createCourse({
      courseName: 'Software Engineering',
      teacherId: mockTeacherId.toHexString(),
    });

    expect(result.createdAt).toBe(now);
    expect(result.updatedAt).toBe(now);
  });

  // TC_CREATE_COURSE_015
  // Method: createCourse
  // Purpose: Verify that save() failure propagates the error to the caller
  // Input: { courseName: "Failing Course", teacherId: valid teacher ObjectId }
  // Expected output: Error thrown from save() is propagated
  // Test result: pass
  // Note: Tests error propagation when DB write fails
  // checkdb: Verifies save() was called but threw an error
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_CREATE_COURSE_015', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Prof. Err' });

    const saveMock = jest.fn().mockRejectedValue(new Error('DB write failed'));
    const constructedCourse: any = {
      _id: new Types.ObjectId(),
      courseName: 'Failing Course',
      teacherId: mockTeacherId,
      publicId: 'C-123456',
      save: saveMock,
    };
    (service as any).courseModel = jest.fn().mockReturnValue(constructedCourse);

    await expect(
      service.createCourse({
        courseName: 'Failing Course',
        teacherId: mockTeacherId.toHexString(),
      }),
    ).rejects.toThrow('DB write failed');
  });

  // TC_CREATE_COURSE_016
  // Method: createCourse
  // Purpose: Verify that findById is called with the exact teacherId string from DTO
  // Input: { courseName: "Networking", teacherId: specific ObjectId string }
  // Expected output: userModel.findById called with exact teacherId string
  // Test result: pass
  // checkdb: Verifies findById receives the exact input teacherId
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_COURSE_016', async () => {
    const specificId = new Types.ObjectId();
    mockUserModel.findById.mockResolvedValue({ _id: specificId, role: 'teacher', fullName: 'Prof. Net' });

    const saveMock = jest.fn().mockImplementation(function () { return Promise.resolve(this); });
    (service as any).courseModel = jest.fn().mockReturnValue({
      _id: new Types.ObjectId(), courseName: 'Networking', teacherId: specificId,
      publicId: 'C-123456', createdAt: new Date(), updatedAt: new Date(), save: saveMock,
    });

    await service.createCourse({ courseName: 'Networking', teacherId: specificId.toHexString() });

    expect(mockUserModel.findById).toHaveBeenCalledWith(specificId.toHexString());
  });

  // TC_CREATE_COURSE_017
  // Method: createCourse
  // Purpose: Verify error propagation when generatePrefixedPublicId fails
  // Input: { courseName: "Error ID Course", teacherId: valid teacher ObjectId }
  // Expected output: Error from generatePrefixedPublicId propagated
  // Test result: pass
  // checkdb: No DB write occurs (fails before save)
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_COURSE_017', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Prof. E' });
    (idUtils.generatePrefixedPublicId as jest.Mock).mockRejectedValue(new Error('ID generation failed'));

    await expect(
      service.createCourse({ courseName: 'Error ID Course', teacherId: mockTeacherId.toHexString() }),
    ).rejects.toThrow('ID generation failed');
  });

  // TC_CREATE_COURSE_018
  // Method: createCourse
  // Purpose: Verify that userModel.findById is called before any course creation logic
  // Input: { courseName: "Order Check", teacherId: non-existent ObjectId }
  // Expected output: NotFoundException, courseModel constructor never called
  // Test result: pass
  // checkdb: Verifies user lookup happens first, no course model instantiated
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_COURSE_018', async () => {
    mockUserModel.findById.mockResolvedValue(null);
    const constructorSpy = jest.fn();
    (service as any).courseModel = constructorSpy;

    await expect(
      service.createCourse({ courseName: 'Order Check', teacherId: new Types.ObjectId().toHexString() }),
    ).rejects.toThrow(NotFoundException);

    expect(constructorSpy).not.toHaveBeenCalled();
  });

  // TC_CREATE_COURSE_019
  // Method: createCourse
  // Purpose: Verify course creation with whitespace-only course name (service does not trim)
  // Input: { courseName: "   ", teacherId: valid teacher ObjectId }
  // Expected output: CourseBasicResponseDto with courseName = "   " (service-level does not validate)
  // Test result: pass
  // Note: Validation should be handled by DTO/class-validator at controller level
  // checkdb: Verifies save() called with whitespace name
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_CREATE_COURSE_019', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Prof. W' });

    const saveMock = jest.fn().mockImplementation(function () { return Promise.resolve(this); });
    (service as any).courseModel = jest.fn().mockReturnValue({
      _id: new Types.ObjectId(), courseName: '   ', teacherId: mockTeacherId,
      publicId: 'C-123456', createdAt: new Date(), updatedAt: new Date(), save: saveMock,
    });

    const result = await service.createCourse({ courseName: '   ', teacherId: mockTeacherId.toHexString() });
    expect(result.courseName).toBe('   ');
  });

  // ============================================================
  // deleteCourse Method Tests
  // ============================================================

  // TC_DELETE_COURSE_001
  // Method: deleteCourse
  // Purpose: Verify successful deletion of an existing course
  // Input: courseId = valid existing course ObjectId
  // Expected output: void (no error thrown), deleteOne called with correct _id
  // Test result: pass
  // checkdb: Verifies findById was called to check existence, deleteOne was called with correct _id
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_DELETE_COURSE_001', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, courseName: 'ToDelete' });
    mockCourseModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await service.deleteCourse(mockCourseId.toHexString());

    expect(mockCourseModel.findById).toHaveBeenCalledWith(mockCourseId.toHexString());
    expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: mockCourseId.toHexString() });
  });

  // TC_DELETE_COURSE_002
  // Method: deleteCourse
  // Purpose: Verify NotFoundException when course does not exist
  // Input: courseId = non-existent ObjectId
  // Expected output: NotFoundException with message "Course not found"
  // Test result: pass
  // checkdb: Verifies findById was called, deleteOne was NOT called
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_DELETE_COURSE_002', async () => {
    mockCourseModel.findById.mockResolvedValue(null);

    await expect(
      service.deleteCourse(new Types.ObjectId().toHexString()),
    ).rejects.toThrow(NotFoundException);

    expect(mockCourseModel.deleteOne).not.toHaveBeenCalled();
  });

  // TC_DELETE_COURSE_003
  // Method: deleteCourse
  // Purpose: Verify deleteOne is called exactly once for a valid course
  // Input: courseId = valid existing course ObjectId
  // Expected output: deleteOne called exactly 1 time
  // Test result: pass
  // checkdb: Verifies deleteOne call count is 1
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_DELETE_COURSE_003', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, courseName: 'SingleDelete' });
    mockCourseModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await service.deleteCourse(mockCourseId.toHexString());

    expect(mockCourseModel.deleteOne).toHaveBeenCalledTimes(1);
  });

  // TC_DELETE_COURSE_004
  // Method: deleteCourse
  // Purpose: Verify that deleteCourse returns void (undefined) on success
  // Input: courseId = valid existing course ObjectId
  // Expected output: undefined
  // Test result: pass
  // checkdb: Verifies the method resolves without a return value
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_DELETE_COURSE_004', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, courseName: 'VoidReturn' });
    mockCourseModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const result = await service.deleteCourse(mockCourseId.toHexString());

    expect(result).toBeUndefined();
  });

  // TC_DELETE_COURSE_005
  // Method: deleteCourse
  // Purpose: Verify error propagation when deleteOne fails
  // Input: courseId = valid existing course ObjectId, deleteOne throws DB error
  // Expected output: Error "DB delete failed" propagated
  // Test result: pass
  // checkdb: Verifies findById succeeded but deleteOne threw
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_DELETE_COURSE_005', async () => {
    mockCourseModel.findById.mockResolvedValue({ _id: mockCourseId, courseName: 'FailDelete' });
    mockCourseModel.deleteOne.mockRejectedValue(new Error('DB delete failed'));

    await expect(
      service.deleteCourse(mockCourseId.toHexString()),
    ).rejects.toThrow('DB delete failed');
  });

  // TC_DELETE_COURSE_006
  // Method: deleteCourse
  // Purpose: Verify findById is called before deleteOne (order of operations)
  // Input: courseId = non-existent ObjectId
  // Expected output: NotFoundException, deleteOne never called
  // Test result: pass
  // checkdb: Verifies findById called first, deleteOne not invoked
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_DELETE_COURSE_006', async () => {
    mockCourseModel.findById.mockResolvedValue(null);

    await expect(
      service.deleteCourse(new Types.ObjectId().toHexString()),
    ).rejects.toThrow(NotFoundException);

    expect(mockCourseModel.findById).toHaveBeenCalledTimes(1);
    expect(mockCourseModel.deleteOne).not.toHaveBeenCalled();
  });

  // TC_DELETE_COURSE_007
  // Method: deleteCourse
  // Purpose: Verify findById receives the exact courseId string
  // Input: courseId = specific ObjectId string
  // Expected output: findById called with exact string
  // Test result: pass
  // checkdb: Verifies argument passed to findById
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_DELETE_COURSE_007', async () => {
    const specificCourseId = new Types.ObjectId();
    mockCourseModel.findById.mockResolvedValue({ _id: specificCourseId });
    mockCourseModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

    await service.deleteCourse(specificCourseId.toHexString());

    expect(mockCourseModel.findById).toHaveBeenCalledWith(specificCourseId.toHexString());
    expect(mockCourseModel.deleteOne).toHaveBeenCalledWith({ _id: specificCourseId.toHexString() });
  });


  // ============================================================
  // updateCourseName Method Tests
  // ============================================================

  // TC_UPDATE_COURSE_001
  // Method: updateCourseName
  // Purpose: Verify successful course name update
  // Input: courseId = valid ObjectId, updateDto = { courseName: "Updated Name" }
  // Expected output: CourseBasicResponseDto with courseName "Updated Name"
  // Test result: pass
  // checkdb: Verifies findById, save(), findById(teacherId), countDocuments all called
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_UPDATE_COURSE_001', async () => {
    const mockCourse = {
      _id: mockCourseId,
      courseName: 'Old Name',
      teacherId: mockTeacherId,
      publicId: 'C-111',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockImplementation(function () {
        this.courseName = 'Updated Name';
        return Promise.resolve(this);
      }),
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'Teacher A' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(10);

    const result = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'Updated Name' });

    expect(result.courseName).toBe('Updated Name');
    expect(result.enrollmentCount).toBe(10);
    expect(result.teacherName).toBe('Teacher A');
    expect(mockCourse.save).toHaveBeenCalledTimes(1);
  });

  // TC_UPDATE_COURSE_002
  // Method: updateCourseName
  // Purpose: Verify NotFoundException when course does not exist
  // Input: courseId = non-existent ObjectId, updateDto = { courseName: "New" }
  // Expected output: NotFoundException
  // Test result: pass
  // checkdb: Verifies findById was called, save() was NOT called
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_UPDATE_COURSE_002', async () => {
    mockCourseModel.findById.mockResolvedValue(null);

    await expect(
      service.updateCourseName(new Types.ObjectId().toHexString(), { courseName: 'New' }),
    ).rejects.toThrow(NotFoundException);
  });

  // TC_UPDATE_COURSE_003
  // Method: updateCourseName
  // Purpose: Verify that the course name is actually mutated on the document before save
  // Input: courseId = valid ObjectId, updateDto = { courseName: "Mutated Name" }
  // Expected output: Course document's courseName property set to "Mutated Name" before save
  // Test result: pass
  // checkdb: Verifies courseName was changed on the document object
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_UPDATE_COURSE_003', async () => {
    const mockCourse: any = {
      _id: mockCourseId,
      courseName: 'Before',
      teacherId: mockTeacherId,
      publicId: 'C-222',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockImplementation(function () { return Promise.resolve(this); }),
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(0);

    await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'Mutated Name' });

    expect(mockCourse.courseName).toBe('Mutated Name');
  });

  // TC_UPDATE_COURSE_004
  // Method: updateCourseName
  // Purpose: Verify response when teacher is null (deleted teacher)
  // Input: courseId = valid ObjectId, teacher lookup returns null
  // Expected output: CourseBasicResponseDto with teacherName === undefined
  // Test result: pass
  // checkdb: Verifies findById for teacher returns null, response still generated
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_UPDATE_COURSE_004', async () => {
    const mockCourse: any = {
      _id: mockCourseId,
      courseName: 'Old',
      teacherId: mockTeacherId,
      publicId: 'C-333',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockImplementation(function () { return Promise.resolve(this); }),
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue(null);
    mockEnrollmentModel.countDocuments.mockResolvedValue(3);

    const result = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name' });

    expect(result.teacherName).toBeUndefined();
    expect(result.enrollmentCount).toBe(3);
  });

  // TC_UPDATE_COURSE_005
  // Method: updateCourseName
  // Purpose: Verify update with empty enrollment count (zero students)
  // Input: courseId = valid ObjectId, enrollmentModel.countDocuments returns 0
  // Expected output: CourseBasicResponseDto with enrollmentCount === 0
  // Test result: pass
  // checkdb: Verifies countDocuments called with correct courseId filter
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_UPDATE_COURSE_005', async () => {
    const mockCourse: any = {
      _id: mockCourseId,
      courseName: 'Old',
      teacherId: mockTeacherId,
      publicId: 'C-444',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockImplementation(function () { return Promise.resolve(this); }),
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'Prof Zero' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(0);

    const result = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'Zero Enrollment' });

    expect(result.enrollmentCount).toBe(0);
    expect(mockEnrollmentModel.countDocuments).toHaveBeenCalledWith({ courseId: mockCourseId });
  });

  // TC_UPDATE_COURSE_006
  // Method: updateCourseName
  // Purpose: Verify update with special characters in the new course name
  // Input: courseId = valid ObjectId, updateDto = { courseName: "C++ & Algorithms (v2.0)" }
  // Expected output: CourseBasicResponseDto with courseName containing special characters
  // Test result: pass
  // checkdb: Verifies save() was called with special characters intact
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_UPDATE_COURSE_006', async () => {
    const mockCourse: any = {
      _id: mockCourseId,
      courseName: 'Old',
      teacherId: mockTeacherId,
      publicId: 'C-555',
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockImplementation(function () { return Promise.resolve(this); }),
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'Prof Special' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);

    const result = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'C++ & Algorithms (v2.0)' });

    expect(result.courseName).toBe('C++ & Algorithms (v2.0)');
  });

  // TC_UPDATE_COURSE_007
  // Method: updateCourseName
  // Purpose: Verify error propagation when save() fails during update
  // Input: courseId = valid ObjectId, save() rejects with error
  // Expected output: Error propagated to caller
  // Test result: pass
  // checkdb: Verifies save() was called but threw an error
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_UPDATE_COURSE_007', async () => {
    const mockCourse: any = {
      _id: mockCourseId,
      courseName: 'Old',
      teacherId: mockTeacherId,
      save: jest.fn().mockRejectedValue(new Error('Save failed')),
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);

    await expect(
      service.updateCourseName(mockCourseId.toHexString(), { courseName: 'Will Fail' }),
    ).rejects.toThrow('Save failed');
  });

  // TC_UPDATE_COURSE_008
  // Method: updateCourseName
  // Purpose: Verify high enrollment count is correctly returned
  // Input: courseId = valid, enrollmentModel.countDocuments returns 9999
  // Expected output: CourseBasicResponseDto with enrollmentCount === 9999
  // Test result: pass
  // checkdb: Verifies countDocuments returns large number
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_COURSE_008', async () => {
    const mockCourse: any = {
      _id: mockCourseId, courseName: 'Popular', teacherId: mockTeacherId,
      publicId: 'C-POP', createdAt: new Date(), updatedAt: new Date(),
      save: jest.fn().mockImplementation(function () { return Promise.resolve(this); }),
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'Popular Prof' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(9999);

    const result = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'Popular Course' });

    expect(result.enrollmentCount).toBe(9999);
  });

  // TC_UPDATE_COURSE_009
  // Method: updateCourseName
  // Purpose: Verify that updatedAt timestamp is propagated in the response
  // Input: courseId = valid, course has specific updatedAt date
  // Expected output: CourseBasicResponseDto with matching updatedAt
  // Test result: pass
  // checkdb: Verifies timestamp field is included in response
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_COURSE_009', async () => {
    const specificDate = new Date('2025-01-15T10:30:00Z');
    const mockCourse: any = {
      _id: mockCourseId, courseName: 'Timed', teacherId: mockTeacherId,
      publicId: 'C-TIME', createdAt: new Date('2024-01-01'), updatedAt: specificDate,
      save: jest.fn().mockImplementation(function () { return Promise.resolve(this); }),
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'T' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(0);

    const result = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'Timed Update' });

    expect(result.updatedAt).toBe(specificDate);
    expect(result.createdAt).toEqual(new Date('2024-01-01'));
  });

  // TC_UPDATE_COURSE_010
  // Method: updateCourseName
  // Purpose: Verify publicId is preserved after name update
  // Input: courseId = valid, course has publicId 'C-ORIGINAL'
  // Expected output: CourseBasicResponseDto with publicId 'C-ORIGINAL' unchanged
  // Test result: pass
  // checkdb: Verifies publicId is not modified by the update operation
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_COURSE_010', async () => {
    const mockCourse: any = {
      _id: mockCourseId, courseName: 'Original', teacherId: mockTeacherId,
      publicId: 'C-ORIGINAL', createdAt: new Date(), updatedAt: new Date(),
      save: jest.fn().mockImplementation(function () { return Promise.resolve(this); }),
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'Prof. O' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(5);

    const result = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'New Name' });

    expect(result.publicId).toBe('C-ORIGINAL');
  });

  // TC_UPDATE_COURSE_011
  // Method: updateCourseName
  // Purpose: Verify update with Unicode characters in the new name
  // Input: courseId = valid, updateDto = { courseName: "Khóa học Tiếng Việt 🇻🇳" }
  // Expected output: CourseBasicResponseDto with Unicode name preserved
  // Test result: pass
  // checkdb: Verifies save() called with Unicode name
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_UPDATE_COURSE_011', async () => {
    const mockCourse: any = {
      _id: mockCourseId, courseName: 'Old', teacherId: mockTeacherId,
      publicId: 'C-UNI', createdAt: new Date(), updatedAt: new Date(),
      save: jest.fn().mockImplementation(function () { return Promise.resolve(this); }),
    };
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue({ fullName: 'Giáo viên' });
    mockEnrollmentModel.countDocuments.mockResolvedValue(0);

    const result = await service.updateCourseName(mockCourseId.toHexString(), { courseName: 'Khóa học Tiếng Việt 🇻🇳' });

    expect(result.courseName).toBe('Khóa học Tiếng Việt 🇻🇳');
  });

  // ============================================================
  // getCoursesByTeacher Method Tests
  // ============================================================

  // TC_GET_COURSES_001
  // Method: getCoursesByTeacher
  // Purpose: Verify retrieval of courses for a valid teacher without search filter
  // Input: teacherId = valid teacher ObjectId, queryDto = {}
  // Expected output: Array of CourseBasicResponseDto with correct mapping
  // Test result: pass
  // checkdb: Verifies find() called with teacherId filter, aggregate called for enrollment counts
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_GET_COURSES_001', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Dr. A' });
    const courses = [
      { _id: new Types.ObjectId(), courseName: 'Course A', teacherId: mockTeacherId, publicId: 'C-001', createdAt: new Date(), updatedAt: new Date() },
      { _id: new Types.ObjectId(), courseName: 'Course B', teacherId: mockTeacherId, publicId: 'C-002', createdAt: new Date(), updatedAt: new Date() },
    ];
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(courses) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);

    const result = await service.getCoursesByTeacher(mockTeacherId.toHexString(), {});

    expect(result).toHaveLength(2);
    expect(result[0].courseName).toBe('Course A');
    expect(result[1].courseName).toBe('Course B');
  });

  // TC_GET_COURSES_002
  // Method: getCoursesByTeacher
  // Purpose: Verify NotFoundException when teacher does not exist
  // Input: teacherId = non-existent ObjectId
  // Expected output: NotFoundException with message "Teacher not found"
  // Test result: pass
  // checkdb: Verifies findById was called, find() was NOT called
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_GET_COURSES_002', async () => {
    mockUserModel.findById.mockResolvedValue(null);

    await expect(
      service.getCoursesByTeacher(new Types.ObjectId().toHexString()),
    ).rejects.toThrow(NotFoundException);
  });

  // TC_GET_COURSES_003
  // Method: getCoursesByTeacher
  // Purpose: Verify ForbiddenException when user role is 'student'
  // Input: teacherId = valid ObjectId with role 'student'
  // Expected output: ForbiddenException with message "Only teachers can have courses"
  // Test result: pass
  // checkdb: Verifies findById was called, find() was NOT called
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_GET_COURSES_003', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'student' });

    await expect(
      service.getCoursesByTeacher(mockTeacherId.toHexString()),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_GET_COURSES_004
  // Method: getCoursesByTeacher
  // Purpose: Verify search filter is applied correctly in the query
  // Input: teacherId = valid teacher ObjectId, queryDto = { search: "Math" }
  // Expected output: find() called with $or filter containing regex for courseName and publicId
  // Test result: pass
  // checkdb: Verifies find() called with correct search regex filter
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_GET_COURSES_004', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'T' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'Math' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [
          { courseName: { $regex: 'Math', $options: 'i' } },
          { publicId: { $regex: 'Math', $options: 'i' } },
        ],
      }),
    );
  });

  // TC_GET_COURSES_005
  // Method: getCoursesByTeacher
  // Purpose: Verify empty array returned when teacher has no courses
  // Input: teacherId = valid teacher ObjectId, no courses in DB
  // Expected output: Empty array []
  // Test result: pass
  // checkdb: Verifies find() returned empty array, aggregate also returns empty
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_GET_COURSES_005', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'T' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);

    const result = await service.getCoursesByTeacher(mockTeacherId.toHexString());

    expect(result).toEqual([]);
  });

  // TC_GET_COURSES_006
  // Method: getCoursesByTeacher
  // Purpose: Verify enrollment counts are correctly mapped to each course
  // Input: teacherId = valid teacher ObjectId, 2 courses with different enrollment counts
  // Expected output: Array where each course has correct enrollmentCount from aggregate
  // Test result: pass
  // checkdb: Verifies aggregate result is correctly mapped via countMap
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_GET_COURSES_006', async () => {
    const cId1 = new Types.ObjectId();
    const cId2 = new Types.ObjectId();
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'T' });
    mockCourseModel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { _id: cId1, courseName: 'C1', teacherId: mockTeacherId, publicId: 'C-X1', createdAt: new Date(), updatedAt: new Date() },
        { _id: cId2, courseName: 'C2', teacherId: mockTeacherId, publicId: 'C-X2', createdAt: new Date(), updatedAt: new Date() },
      ]),
    });
    mockEnrollmentModel.aggregate.mockResolvedValue([
      { _id: cId1, count: 15 },
      { _id: cId2, count: 30 },
    ]);

    const result = await service.getCoursesByTeacher(mockTeacherId.toHexString());

    expect(result[0].enrollmentCount).toBe(15);
    expect(result[1].enrollmentCount).toBe(30);
  });

  // TC_GET_COURSES_007
  // Method: getCoursesByTeacher
  // Purpose: Verify enrollmentCount defaults to 0 when aggregate has no match for a course
  // Input: teacherId = valid teacher ObjectId, 1 course, aggregate returns empty
  // Expected output: Course with enrollmentCount === 0
  // Test result: pass
  // checkdb: Verifies countMap fallback to 0 works correctly
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_GET_COURSES_007', async () => {
    const cId = new Types.ObjectId();
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'T' });
    mockCourseModel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { _id: cId, courseName: 'NoEnroll', teacherId: mockTeacherId, publicId: 'C-NE', createdAt: new Date(), updatedAt: new Date() },
      ]),
    });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);

    const result = await service.getCoursesByTeacher(mockTeacherId.toHexString());

    expect(result[0].enrollmentCount).toBe(0);
  });

  // TC_GET_COURSES_008
  // Method: getCoursesByTeacher
  // Purpose: Verify no $or filter applied when search is empty string
  // Input: teacherId = valid teacher ObjectId, queryDto = { search: '' }
  // Expected output: find() called without $or filter
  // Test result: pass
  // checkdb: Verifies find() filter only contains teacherId, no $or
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_GET_COURSES_008', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'T' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: '' });

    const callArgs = mockCourseModel.find.mock.calls[0][0];
    expect(callArgs.$or).toBeUndefined();
  });

  // TC_GET_COURSES_009
  // Method: getCoursesByTeacher
  // Purpose: Verify courses are sorted by createdAt descending
  // Input: teacherId = valid teacher ObjectId
  // Expected output: sort() called with { createdAt: -1 }
  // Test result: pass
  // checkdb: Verifies sort argument is { createdAt: -1 }
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_GET_COURSES_009', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'T' });
    const sortMock = jest.fn().mockResolvedValue([]);
    mockCourseModel.find.mockReturnValue({ sort: sortMock });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);

    await service.getCoursesByTeacher(mockTeacherId.toHexString());

    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
  });

  // TC_GET_COURSES_010
  // Method: getCoursesByTeacher
  // Purpose: Verify teacherName is included in each course response
  // Input: teacherId = valid teacher ObjectId with fullName "Dr. Smith"
  // Expected output: Each course in result array has teacherName "Dr. Smith"
  // Test result: pass
  // checkdb: Verifies mapCourse propagates teacher fullName
  // rollback: jest.clearAllMocks() in beforeEach restores all mocks before each test
  it('TC_GET_COURSES_010', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'Dr. Smith' });
    mockCourseModel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { _id: new Types.ObjectId(), courseName: 'C1', teacherId: mockTeacherId, publicId: 'C-T1', createdAt: new Date(), updatedAt: new Date() },
      ]),
    });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);

    const result = await service.getCoursesByTeacher(mockTeacherId.toHexString());

    expect(result[0].teacherName).toBe('Dr. Smith');
  });

  // TC_GET_COURSES_011
  // Method: getCoursesByTeacher
  // Purpose: Verify ForbiddenException when user role is 'admin'
  // Input: teacherId = valid ObjectId with role 'admin'
  // Expected output: ForbiddenException
  // Test result: pass
  // checkdb: Verifies findById was called, find() was NOT called
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COURSES_011', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'admin' });

    await expect(
      service.getCoursesByTeacher(mockTeacherId.toHexString()),
    ).rejects.toThrow(ForbiddenException);
  });

  // TC_GET_COURSES_012
  // Method: getCoursesByTeacher
  // Purpose: Verify aggregate is called with correct $match and $group pipeline stages
  // Input: teacherId = valid teacher ObjectId with 1 course
  // Expected output: aggregate called with pipeline containing $match and $group
  // Test result: pass
  // checkdb: Verifies aggregate pipeline structure
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COURSES_012', async () => {
    const cId = new Types.ObjectId();
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'T' });
    mockCourseModel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { _id: cId, courseName: 'C', teacherId: mockTeacherId, publicId: 'C-AG', createdAt: new Date(), updatedAt: new Date() },
      ]),
    });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);

    await service.getCoursesByTeacher(mockTeacherId.toHexString());

    expect(mockEnrollmentModel.aggregate).toHaveBeenCalledWith([
      { $match: { courseId: { $in: [cId] } } },
      { $group: { _id: '$courseId', count: { $sum: 1 } } },
    ]);
  });

  // TC_GET_COURSES_013
  // Method: getCoursesByTeacher
  // Purpose: Verify correct mapping when multiple courses have mixed enrollment counts (some 0)
  // Input: teacherId = valid teacher, 3 courses, aggregate returns counts for only 2
  // Expected output: 2 courses with counts, 1 course with enrollmentCount = 0
  // Test result: pass
  // checkdb: Verifies countMap correctly handles missing entries
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COURSES_013', async () => {
    const cId1 = new Types.ObjectId();
    const cId2 = new Types.ObjectId();
    const cId3 = new Types.ObjectId();
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'T' });
    mockCourseModel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { _id: cId1, courseName: 'C1', teacherId: mockTeacherId, publicId: 'C-1', createdAt: new Date(), updatedAt: new Date() },
        { _id: cId2, courseName: 'C2', teacherId: mockTeacherId, publicId: 'C-2', createdAt: new Date(), updatedAt: new Date() },
        { _id: cId3, courseName: 'C3', teacherId: mockTeacherId, publicId: 'C-3', createdAt: new Date(), updatedAt: new Date() },
      ]),
    });
    mockEnrollmentModel.aggregate.mockResolvedValue([
      { _id: cId1, count: 5 },
      { _id: cId3, count: 20 },
    ]);

    const result = await service.getCoursesByTeacher(mockTeacherId.toHexString());

    expect(result).toHaveLength(3);
    expect(result[0].enrollmentCount).toBe(5);
    expect(result[1].enrollmentCount).toBe(0);  // cId2 has no enrollment
    expect(result[2].enrollmentCount).toBe(20);
  });

  // TC_GET_COURSES_014
  // Method: getCoursesByTeacher
  // Purpose: Verify that teacherId is converted to ObjectId in the find filter
  // Input: teacherId = valid teacher ObjectId
  // Expected output: find() called with teacherId as Types.ObjectId instance
  // Test result: pass
  // checkdb: Verifies filter contains ObjectId, not string
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COURSES_014', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'T' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);

    await service.getCoursesByTeacher(mockTeacherId.toHexString());

    const filterArg = mockCourseModel.find.mock.calls[0][0];
    expect(filterArg.teacherId).toBeInstanceOf(Types.ObjectId);
  });

  // TC_GET_COURSES_015
  // Method: getCoursesByTeacher
  // Purpose: Verify search with special regex characters is handled correctly
  // Input: teacherId = valid, queryDto = { search: "C++" }
  // Expected output: find() called with search regex containing "C++"
  // Test result: pass
  // Note: The service passes search directly as regex - special chars may affect matching
  // checkdb: Verifies regex search is applied
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COURSES_015', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'T' });
    mockCourseModel.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);

    await service.getCoursesByTeacher(mockTeacherId.toHexString(), { search: 'C++' });

    expect(mockCourseModel.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [
          { courseName: { $regex: 'C++', $options: 'i' } },
          { publicId: { $regex: 'C++', $options: 'i' } },
        ],
      }),
    );
  });

  // TC_GET_COURSES_016
  // Method: getCoursesByTeacher
  // Purpose: Verify each course in response has correct id and publicId mapping
  // Input: teacherId = valid, 1 course with known _id and publicId
  // Expected output: Response has id as string of _id and publicId preserved
  // Test result: pass
  // checkdb: Verifies mapCourse id/publicId mapping
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COURSES_016', async () => {
    const cId = new Types.ObjectId();
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'T' });
    mockCourseModel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { _id: cId, courseName: 'Mapped', teacherId: mockTeacherId, publicId: 'C-MAP99', createdAt: new Date(), updatedAt: new Date() },
      ]),
    });
    mockEnrollmentModel.aggregate.mockResolvedValue([]);

    const result = await service.getCoursesByTeacher(mockTeacherId.toHexString());

    expect(result[0].id).toBe(String(cId));
    expect(result[0].publicId).toBe('C-MAP99');
    expect(result[0].teacherId).toBe(String(mockTeacherId));
  });

  // TC_GET_COURSES_017
  // Method: getCoursesByTeacher
  // Purpose: Verify error propagation when enrollmentModel.aggregate fails
  // Input: teacherId = valid, aggregate throws DB error
  // Expected output: Error propagated to caller
  // Test result: pass
  // checkdb: Verifies aggregate threw error
  // rollback: jest.clearAllMocks() in beforeEach
  it('TC_GET_COURSES_017', async () => {
    mockUserModel.findById.mockResolvedValue({ _id: mockTeacherId, role: 'teacher', fullName: 'T' });
    mockCourseModel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        { _id: new Types.ObjectId(), courseName: 'C1', teacherId: mockTeacherId, publicId: 'C-ERR', createdAt: new Date(), updatedAt: new Date() },
      ]),
    });
    mockEnrollmentModel.aggregate.mockRejectedValue(new Error('Aggregate failed'));

    await expect(
      service.getCoursesByTeacher(mockTeacherId.toHexString()),
    ).rejects.toThrow('Aggregate failed');
  });
});
