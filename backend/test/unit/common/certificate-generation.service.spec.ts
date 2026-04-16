import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CertificateGenerationService } from '../../../src/common/services/certificate-generation.service';
import { PinataService } from '../../../src/common/services/pinata.service';
import { CertificateImageService } from '../../../src/common/services/certificate-image.service';

describe('CertificateGenerationService', () => {
  let service: CertificateGenerationService;

  // ── Mock models ───────────────────────────────────────────────────────
  const studentId = new Types.ObjectId();
  const courseId = new Types.ObjectId();
  const submissionId = new Types.ObjectId();
  const examId = new Types.ObjectId();
  const certificateId = new Types.ObjectId().toHexString();

  const mockStudent = {
    _id: studentId,
    fullName: 'Nguyen Van A',
    username: 'nguyenvana',
    email: 'a@test.com',
    imageUrl: 'https://example.com/photo.jpg',
    citizenId: '001234567890',
  };

  const mockCourse = { _id: courseId, courseName: 'Blockchain 101' };

  const mockSubmission = {
    _id: submissionId,
    examId,
    score: 90,
  };

  const mockExam = {
    _id: examId,
    title: 'Final Exam',
    endTime: new Date('2025-06-01'),
  };

  const mockCertificate = {
    _id: new Types.ObjectId(certificateId),
    studentId: mockStudent,
    courseId: mockCourse,
    submissionId: mockSubmission,
    issuedAt: new Date('2025-06-15'),
  };

  const mockCertificateModel = {
    findById: jest.fn(),
  };
  const mockUserModel = { findById: jest.fn() };
  const mockCourseModel = { findById: jest.fn() };
  const mockSubmissionModel = { findById: jest.fn() };
  const mockExamModel = { findById: jest.fn() };

  const mockPinataService = {
    uploadFile: jest.fn(),
    uploadJSON: jest.fn(),
    getGatewayUrl: jest.fn(),
  };

  const mockCertificateImageService = {
    generateCertificateImage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateGenerationService,
        { provide: getModelToken('Certificate'), useValue: mockCertificateModel },
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('Course'), useValue: mockCourseModel },
        { provide: getModelToken('Submission'), useValue: mockSubmissionModel },
        { provide: getModelToken('Exam'), useValue: mockExamModel },
        { provide: PinataService, useValue: mockPinataService },
        { provide: CertificateImageService, useValue: mockCertificateImageService },
      ],
    }).compile();

    service = module.get<CertificateGenerationService>(CertificateGenerationService);
  });

  // ────────────────────────────────────────────────────────────────────────
  // generateAndUploadCertificate – happy path
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERTGEN_01
  it('should_GenerateAndUpload_When_ValidCertificateId', async () => {
    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockCertificate),
    });
    mockExamModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockExam),
    });

    const fakeImageBuffer = Buffer.from('png-image');
    mockCertificateImageService.generateCertificateImage.mockResolvedValue(fakeImageBuffer);
    mockPinataService.uploadFile.mockResolvedValue('QmImageHash');
    mockPinataService.uploadJSON.mockResolvedValue('QmMetadataHash');
    mockPinataService.getGatewayUrl.mockImplementation(
      (hash: string) => `https://gateway.pinata.cloud/ipfs/${hash}`,
    );

    const result = await service.generateAndUploadCertificate(certificateId);

    expect(result.imageIpfsHash).toBe('QmImageHash');
    expect(result.metadataIpfsHash).toBe('QmMetadataHash');
    expect(result.metadata.studentName).toBe('Nguyen Van A');
    expect(result.metadata.courseName).toBe('Blockchain 101');
    expect(result.metadata.score).toBe(90);
    expect(mockCertificateImageService.generateCertificateImage).toHaveBeenCalledWith(
      expect.objectContaining({
        studentName: 'Nguyen Van A',
        courseName: 'Blockchain 101',
      }),
    );
    expect(mockPinataService.uploadFile).toHaveBeenCalled();
    expect(mockPinataService.uploadJSON).toHaveBeenCalled();
  });

  // Test Case ID: TC_CERTGEN_02
  it('should_UseUsername_When_FullNameMissing', async () => {
    const studentNoFullName = { ...mockStudent, fullName: undefined };
    const certNoFullName = {
      ...mockCertificate,
      studentId: studentNoFullName,
    };

    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(certNoFullName),
    });
    mockExamModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockExam),
    });
    mockCertificateImageService.generateCertificateImage.mockResolvedValue(Buffer.from('img'));
    mockPinataService.uploadFile.mockResolvedValue('QmImg');
    mockPinataService.uploadJSON.mockResolvedValue('QmMeta');
    mockPinataService.getGatewayUrl.mockReturnValue('https://gw/ipfs/QmImg');

    const result = await service.generateAndUploadCertificate(certificateId);

    expect(result.metadata.studentName).toBe('nguyenvana');
  });

  // ────────────────────────────────────────────────────────────────────────
  // generateAndUploadCertificate – error cases
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERTGEN_03
  it('should_ThrowNotFound_When_CertificateNotFound', async () => {
    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.generateAndUploadCertificate('nonexistent'),
    ).rejects.toThrow(NotFoundException);
  });

  // Test Case ID: TC_CERTGEN_04
  it('should_ThrowNotFound_When_CertificateDataIncomplete_NoStudent', async () => {
    const incompleteCert = { ...mockCertificate, studentId: null };

    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(incompleteCert),
    });

    await expect(
      service.generateAndUploadCertificate(certificateId),
    ).rejects.toThrow(NotFoundException);
  });

  // Test Case ID: TC_CERTGEN_05
  it('should_ThrowNotFound_When_CertificateDataIncomplete_NoCourse', async () => {
    const incompleteCert = { ...mockCertificate, courseId: null };

    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(incompleteCert),
    });

    await expect(
      service.generateAndUploadCertificate(certificateId),
    ).rejects.toThrow(NotFoundException);
  });

  // Test Case ID: TC_CERTGEN_06
  it('should_ThrowNotFound_When_ExamNotFound', async () => {
    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockCertificate),
    });
    mockExamModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.generateAndUploadCertificate(certificateId),
    ).rejects.toThrow(NotFoundException);
  });

  // Test Case ID: TC_CERTGEN_07
  it('should_ThrowError_When_ImageGenerationFails', async () => {
    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockCertificate),
    });
    mockExamModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockExam),
    });
    mockCertificateImageService.generateCertificateImage.mockRejectedValue(
      new Error('Canvas render failed'),
    );

    await expect(
      service.generateAndUploadCertificate(certificateId),
    ).rejects.toThrow('Canvas render failed');
  });

  // Test Case ID: TC_CERTGEN_08
  it('should_ThrowError_When_PinataUploadFails', async () => {
    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockCertificate),
    });
    mockExamModel.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockExam),
    });
    mockCertificateImageService.generateCertificateImage.mockResolvedValue(
      Buffer.from('img'),
    );
    mockPinataService.uploadFile.mockRejectedValue(
      new Error('Pinata upload failed'),
    );

    await expect(
      service.generateAndUploadCertificate(certificateId),
    ).rejects.toThrow('Pinata upload failed');
  });
});
