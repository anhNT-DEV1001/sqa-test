import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CertificateService } from '../../../src/modules/certificates/certificate.service';
import { BlockchainService } from '../../../src/common/services/blockchain.service';
import { CertificateGenerationService } from '../../../src/common/services/certificate-generation.service';
import { NotificationsService } from '../../../src/modules/notifications/notifications.service';

describe('CertificateService', () => {
  let service: CertificateService;

  // ── Shared IDs ────────────────────────────────────────────────────────
  const studentId = new Types.ObjectId();
  const courseId = new Types.ObjectId();
  const examId = new Types.ObjectId();
  const submissionId = new Types.ObjectId();
  const certificateId = new Types.ObjectId();

  // ── Mock data ─────────────────────────────────────────────────────────
  const mockSubmission = { _id: submissionId, examId, studentId, score: 88 };
  const mockExam = {
    _id: examId,
    courseId,
    title: 'Final Exam',
    endTime: new Date('2025-06-01'),
  };
  const mockCourse = { _id: courseId, courseName: 'Blockchain 101', teacherId: new Types.ObjectId() };
  const mockStudent = {
    _id: studentId,
    username: 'student1',
    email: 'student@test.com',
    fullName: 'Nguyen Van A',
    walletAddress: '0x80812e3ac51e98cfd368945baf5ab3979706a48c',
  };

  const mockSavedCertificate = {
    _id: certificateId,
    studentId,
    courseId,
    submissionId,
    status: 'pending',
    tokenId: undefined,
    ipfsHash: undefined,
    transactionHash: undefined,
    issuedAt: new Date(),
    outdateTime: new Date('2027-06-01'),
    save: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
  };
  mockSavedCertificate.save.mockResolvedValue(mockSavedCertificate);

  const mockPopulatedCert = {
    _id: certificateId,
    studentId: { username: 'student1', email: 'student@test.com', fullName: 'Nguyen Van A', role: 'student' },
    courseId: { courseName: 'Blockchain 101' },
    submissionId: { score: 88, submittedAt: new Date() },
    status: 'issued',
    tokenId: 'token-1',
    ipfsHash: 'QmMeta',
    transactionHash: '0xtx',
    issuedAt: new Date(),
    outdateTime: new Date('2027-06-01'),
    createdAt: new Date(),
  };

  // ── Mock models ───────────────────────────────────────────────────────
  const mockCertificateModel: any = jest.fn().mockImplementation(() => mockSavedCertificate);
  mockCertificateModel.findOne = jest.fn();
  mockCertificateModel.findById = jest.fn();
  mockCertificateModel.find = jest.fn();
  mockCertificateModel.countDocuments = jest.fn();

  const mockSubmissionModel = { findOne: jest.fn() };
  const mockExamModel = { findById: jest.fn() };
  const mockCourseModel = { findById: jest.fn(), find: jest.fn() };
  const mockUserModel = { findById: jest.fn() };

  const mockBlockchainService = { issueCertificate: jest.fn() };
  const mockCertGenService = { generateAndUploadCertificate: jest.fn() };
  const mockNotificationsService = { createNotification: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockSavedCertificate.save.mockResolvedValue(mockSavedCertificate);
    mockSavedCertificate.get.mockReturnValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateService,
        { provide: getModelToken('Certificate'), useValue: mockCertificateModel },
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('Course'), useValue: mockCourseModel },
        { provide: getModelToken('Submission'), useValue: mockSubmissionModel },
        { provide: getModelToken('Exam'), useValue: mockExamModel },
        { provide: BlockchainService, useValue: mockBlockchainService },
        { provide: CertificateGenerationService, useValue: mockCertGenService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<CertificateService>(CertificateService);
  });

  // ── Helper: setup happy-path mocks for issue() ────────────────────────
  function setupIssueHappyPath() {
    mockSubmissionModel.findOne.mockResolvedValue(mockSubmission);
    mockCertificateModel.findOne.mockResolvedValue(null);
    mockExamModel.findById.mockResolvedValue(mockExam);
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue(mockStudent);
    mockCertGenService.generateAndUploadCertificate.mockResolvedValue({
      imageIpfsHash: 'QmImage',
      metadataIpfsHash: 'QmMeta',
    });
    mockBlockchainService.issueCertificate.mockResolvedValue({
      transactionHash: '0xtx123',
      tokenId: 'token-1',
    });
    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockPopulatedCert),
    });
    mockNotificationsService.createNotification.mockResolvedValue({});
  }

  // ────────────────────────────────────────────────────────────────────────
  // issue()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERT_01
  it('should_IssueCertificate_When_ValidSubmission', async () => {
    setupIssueHappyPath();

    const result = await service.issue({
      examId: examId.toHexString(),
      studentId: studentId.toHexString(),
    });

    expect(result).toBeDefined();
    expect(mockCertGenService.generateAndUploadCertificate).toHaveBeenCalled();
    expect(mockBlockchainService.issueCertificate).toHaveBeenCalledWith(
      expect.objectContaining({
        ipfsHash: 'QmMeta',
        recipientAddress: '0x80812e3ac51e98cfd368945baf5ab3979706a48c',
      }),
    );
    expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'certificate',
        type: 'certificate_issued',
      }),
    );
  });

  // Test Case ID: TC_CERT_02
  it('should_ReturnExistingCertificate_When_DuplicateSubmission', async () => {
    mockSubmissionModel.findOne.mockResolvedValue(mockSubmission);
    mockCertificateModel.findOne.mockResolvedValue({ _id: certificateId });
    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockPopulatedCert),
    });

    const result = await service.issue({
      examId: examId.toHexString(),
      studentId: studentId.toHexString(),
    });

    expect(result).toBeDefined();
    expect(mockBlockchainService.issueCertificate).not.toHaveBeenCalled();
  });

  // Test Case ID: TC_CERT_03
  it('should_ThrowNotFound_When_SubmissionNotFound', async () => {
    mockSubmissionModel.findOne.mockResolvedValue(null);

    await expect(
      service.issue({ examId: examId.toHexString(), studentId: studentId.toHexString() }),
    ).rejects.toThrow(NotFoundException);
  });

  // Test Case ID: TC_CERT_04
  it('should_ThrowNotFound_When_ExamNotFound', async () => {
    mockSubmissionModel.findOne.mockResolvedValue(mockSubmission);
    mockCertificateModel.findOne.mockResolvedValue(null);
    mockExamModel.findById.mockResolvedValue(null);

    await expect(
      service.issue({ examId: examId.toHexString(), studentId: studentId.toHexString() }),
    ).rejects.toThrow(NotFoundException);
  });

  // Test Case ID: TC_CERT_05
  it('should_ThrowNotFound_When_CourseNotFound', async () => {
    mockSubmissionModel.findOne.mockResolvedValue(mockSubmission);
    mockCertificateModel.findOne.mockResolvedValue(null);
    mockExamModel.findById.mockResolvedValue(mockExam);
    mockCourseModel.findById.mockResolvedValue(null);

    await expect(
      service.issue({ examId: examId.toHexString(), studentId: studentId.toHexString() }),
    ).rejects.toThrow(NotFoundException);
  });

  // Test Case ID: TC_CERT_06
  it('should_ThrowNotFound_When_StudentNotFound', async () => {
    mockSubmissionModel.findOne.mockResolvedValue(mockSubmission);
    mockCertificateModel.findOne.mockResolvedValue(null);
    mockExamModel.findById.mockResolvedValue(mockExam);
    mockCourseModel.findById.mockResolvedValue(mockCourse);
    mockUserModel.findById.mockResolvedValue(null);

    await expect(
      service.issue({ examId: examId.toHexString(), studentId: studentId.toHexString() }),
    ).rejects.toThrow(NotFoundException);
  });

  // Test Case ID: TC_CERT_07
  it('should_UsePlaceholderIpfs_When_PinataUploadFails', async () => {
    setupIssueHappyPath();
    mockCertGenService.generateAndUploadCertificate.mockRejectedValue(
      new Error('Pinata failed'),
    );

    const result = await service.issue({
      examId: examId.toHexString(),
      studentId: studentId.toHexString(),
    });

    expect(result).toBeDefined();
    expect(mockSavedCertificate.save).toHaveBeenCalled();
  });

  // Test Case ID: TC_CERT_08
  it('should_HandleBlockchainMintFailure_Gracefully', async () => {
    setupIssueHappyPath();
    mockBlockchainService.issueCertificate.mockRejectedValue(
      new Error('Transaction reverted'),
    );

    const result = await service.issue({
      examId: examId.toHexString(),
      studentId: studentId.toHexString(),
    });

    expect(result).toBeDefined();
  });

  // Test Case ID: TC_CERT_09
  it('should_HandleBigIntSerializeError_WithoutCrashing', async () => {
    setupIssueHappyPath();
    mockBlockchainService.issueCertificate.mockRejectedValue(
      new Error('Do not know how to serialize a BigInt'),
    );

    const result = await service.issue({
      examId: examId.toHexString(),
      studentId: studentId.toHexString(),
    });

    expect(result).toBeDefined();
  });

  // Test Case ID: TC_CERT_10
  it('should_UseDefaultRecipient_When_StudentHasNoWallet', async () => {
    setupIssueHappyPath();
    const studentNoWallet = { ...mockStudent, walletAddress: undefined };
    mockUserModel.findById.mockResolvedValue(studentNoWallet);

    await service.issue({
      examId: examId.toHexString(),
      studentId: studentId.toHexString(),
    });

    expect(mockBlockchainService.issueCertificate).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientAddress: '0x80812e3ac51e98cfd368945baf5ab3979706a48c',
      }),
    );
  });

  // Test Case ID: TC_CERT_11
  it('should_DispatchNotification_When_IssuingSucceeds', async () => {
    setupIssueHappyPath();

    await service.issue({
      examId: examId.toHexString(),
      studentId: studentId.toHexString(),
    });

    expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: studentId.toHexString(),
        title: expect.stringContaining('Blockchain 101'),
      }),
    );
  });

  // Test Case ID: TC_CERT_12
  it('should_NotCrash_When_NotificationFails', async () => {
    setupIssueHappyPath();
    mockNotificationsService.createNotification.mockRejectedValue(
      new Error('Notification error'),
    );

    const result = await service.issue({
      examId: examId.toHexString(),
      studentId: studentId.toHexString(),
    });

    expect(result).toBeDefined();
  });

  // ────────────────────────────────────────────────────────────────────────
  // list()
  // ────────────────────────────────────────────────────────────────────────

  function setupListMock(items: any[] = [], total = 0) {
    mockCertificateModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(items),
    });
    mockCertificateModel.countDocuments.mockResolvedValue(total);
  }

  // Test Case ID: TC_CERT_13
  it('should_ListCertificates_When_NoFilters', async () => {
    setupListMock([mockPopulatedCert], 1);

    const result = await service.list({ page: 1, limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
  });

  // Test Case ID: TC_CERT_14
  it('should_FilterByStatus_When_StatusProvided', async () => {
    setupListMock([], 0);

    const result = await service.list({ status: 'revoked', page: 1, limit: 10 });

    expect(result.items).toHaveLength(0);
    expect(mockCertificateModel.find).toHaveBeenCalled();
  });

  // Test Case ID: TC_CERT_15
  it('should_FilterByDateRange_When_IssuedFromAndToProvided', async () => {
    setupListMock([], 0);

    await service.list({
      issuedFrom: '2025-01-01',
      issuedTo: '2025-12-31',
      page: 1,
      limit: 10,
    });

    expect(mockCertificateModel.find).toHaveBeenCalled();
  });

  // Test Case ID: TC_CERT_16
  it('should_FilterByCourseName_When_CourseNameProvided', async () => {
    mockCourseModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ _id: courseId }]),
    });
    setupListMock([mockPopulatedCert], 1);

    const result = await service.list({ courseName: 'Block', page: 1, limit: 10 });

    expect(mockCourseModel.find).toHaveBeenCalledWith(
      expect.objectContaining({ courseName: expect.any(RegExp) }),
    );
    expect(result).toBeDefined();
  });

  // Test Case ID: TC_CERT_17
  it('should_FilterByTeacherId_When_TeacherIdProvided', async () => {
    const teacherId = new Types.ObjectId();
    mockCourseModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ _id: courseId }]),
    });
    setupListMock([mockPopulatedCert], 1);

    const result = await service.list({
      teacherId: teacherId.toHexString(),
      page: 1,
      limit: 10,
    });

    expect(result).toBeDefined();
  });

  // Test Case ID: TC_CERT_18
  it('should_ReturnEmpty_When_CourseNameMatchesNothing', async () => {
    mockCourseModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    });

    const result = await service.list({
      courseName: 'Nonexistent',
      page: 1,
      limit: 10,
    });

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  // ────────────────────────────────────────────────────────────────────────
  // getById()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERT_19
  it('should_GetCertificate_When_ValidId', async () => {
    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockPopulatedCert),
    });

    const result = await service.getById(certificateId.toHexString());

    expect(result).toBeDefined();
    expect(result._id).toEqual(certificateId);
  });

  // Test Case ID: TC_CERT_20
  it('should_ThrowNotFound_When_CertificateIdInvalid', async () => {
    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(service.getById('nonexistent')).rejects.toThrow(NotFoundException);
  });

  // ────────────────────────────────────────────────────────────────────────
  // getByStudent() / getByCourse()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERT_21
  it('should_GetByStudent_DelegatingToList', async () => {
    setupListMock([mockPopulatedCert], 1);

    const result = await service.getByStudent(studentId.toHexString(), { page: 1, limit: 10 });

    expect(result.items).toHaveLength(1);
  });

  // Test Case ID: TC_CERT_22
  it('should_GetByCourse_DelegatingToList', async () => {
    setupListMock([mockPopulatedCert], 1);

    const result = await service.getByCourse(courseId.toHexString(), { page: 1, limit: 10 });

    expect(result.items).toHaveLength(1);
  });

  // ────────────────────────────────────────────────────────────────────────
  // revoke()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERT_23
  it('should_RevokeCertificate_When_ValidId', async () => {
    const mockCert = { _id: certificateId, status: 'issued', save: jest.fn() };
    mockCert.save.mockResolvedValue(mockCert);
    mockCertificateModel.findById
      .mockResolvedValueOnce(mockCert)
      .mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ ...mockPopulatedCert, status: 'revoked' }),
      });

    const result = await service.revoke(certificateId.toHexString(), 'Policy violation');

    expect(mockCert.status).toBe('revoked');
    expect(mockCert.save).toHaveBeenCalled();
  });

  // Test Case ID: TC_CERT_24
  it('should_RevokeCertificate_WithTransactionHash', async () => {
    const mockCert = {
      _id: certificateId,
      status: 'issued',
      transactionHash: undefined as string | undefined,
      save: jest.fn(),
    };
    mockCert.save.mockResolvedValue(mockCert);
    mockCertificateModel.findById
      .mockResolvedValueOnce(mockCert)
      .mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ ...mockPopulatedCert, status: 'revoked' }),
      });

    await service.revoke(certificateId.toHexString(), 'Fraud', '0xrevoke_tx');

    expect(mockCert.transactionHash).toBe('0xrevoke_tx');
  });

  // Test Case ID: TC_CERT_25
  it('should_ThrowNotFound_When_RevokeNonexistentCert', async () => {
    mockCertificateModel.findById.mockResolvedValue(null);

    await expect(
      service.revoke('nonexistent'),
    ).rejects.toThrow(NotFoundException);
  });

  // ════════════════════════════════════════════════════════════════════════
  // BUG-FINDING TEST CASES — These tests SHOULD pass but will FAIL,
  // exposing real bugs in the source code.
  // ════════════════════════════════════════════════════════════════════════

  // Test Case ID: TC_CERT_BUG_01
  // BUG: revoke() receives `reason` parameter but NEVER persists it.
  // Source: certificate.service.ts line 362 — comment says
  // "reason can be stored later if we add a field"
  // Impact: Revocation audit trail is lost; no record of WHY a cert was revoked.
  it('should_PersistRevokeReason_InDatabase', async () => {
    const mockCert: Record<string, any> = {
      _id: certificateId,
      status: 'issued',
      reason: undefined,
      save: jest.fn(),
    };
    mockCert.save.mockResolvedValue(mockCert);
    mockCertificateModel.findById
      .mockResolvedValueOnce(mockCert)
      .mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ ...mockPopulatedCert, status: 'revoked' }),
      });

    await service.revoke(certificateId.toHexString(), 'Academic fraud');

    // EXPECTED: reason should be saved to the certificate document
    // ACTUAL BUG: reason is never assigned → cert.reason remains undefined
    expect(mockCert.reason).toBe('Academic fraud');
  });

  // Test Case ID: TC_CERT_BUG_02
  // BUG: list() uses `new RegExp(courseName, 'i')` with raw user input.
  // Source: certificate.service.ts line 272
  // Impact: Special regex characters like ( [ * + crash the app with
  // SyntaxError. Also enables ReDoS attacks with crafted patterns.
  it('should_NotCrash_When_CourseNameContainsRegexSpecialChars', async () => {
    mockCourseModel.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    });
    setupListMock([], 0);

    // courseName with unescaped parenthesis → new RegExp("Block(chain") throws SyntaxError
    // EXPECTED: service should handle this gracefully (escape input or catch error)
    // ACTUAL BUG: SyntaxError: Invalid regular expression: /Block(chain/: Unterminated group
    const result = await service.list({
      courseName: 'Block(chain',
      page: 1,
      limit: 10,
    });

    expect(result.items).toHaveLength(0);
  });
});
