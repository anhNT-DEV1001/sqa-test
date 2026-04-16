import { Test, TestingModule } from '@nestjs/testing';
import { CertificateController } from '../../../src/modules/certificates/certificate.controller';
import { CertificateService } from '../../../src/modules/certificates/certificate.service';
import { CertificateGenerationService } from '../../../src/common/services/certificate-generation.service';
import type { IUser } from '../../../src/common/interfaces';

describe('CertificateController', () => {
  let controller: CertificateController;

  const mockCertificateService = {
    issue: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    getByStudent: jest.fn(),
    getByCourse: jest.fn(),
    revoke: jest.fn(),
  };

  const mockCertGenService = {
    generateAndUploadCertificate: jest.fn(),
  };

  const mockCertData = {
    _id: '507f1f77bcf86cd799439011',
    status: 'issued',
    tokenId: 'token-1',
  };

  const mockListResult = {
    items: [mockCertData],
    total: 1,
    page: 1,
    limit: 10,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificateController],
      providers: [
        { provide: CertificateService, useValue: mockCertificateService },
        { provide: CertificateGenerationService, useValue: mockCertGenService },
      ],
    }).compile();

    controller = module.get<CertificateController>(CertificateController);
  });

  // ────────────────────────────────────────────────────────────────────────
  // issue()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERTCTRL_01
  it('should_IssueCertificate_When_ValidDto', async () => {
    mockCertificateService.issue.mockResolvedValue(mockCertData);

    const result = await controller.issue({
      examId: '507f1f77bcf86cd799439012',
      studentId: '507f1f77bcf86cd799439013',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Certificate issued');
    expect(result.data).toEqual(mockCertData);
  });

  // ────────────────────────────────────────────────────────────────────────
  // list()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERTCTRL_02
  it('should_ListCertificates_When_AdminUser', async () => {
    mockCertificateService.list.mockResolvedValue(mockListResult);
    const adminUser = { id: 'admin1', role: 'admin' } as IUser;

    const result = await controller.list({ page: 1, limit: 10 }, adminUser);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(mockCertificateService.list).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  // Test Case ID: TC_CERTCTRL_03
  it('should_OverrideStudentId_When_StudentUser', async () => {
    mockCertificateService.list.mockResolvedValue(mockListResult);
    const studentUser = { id: 'student1', role: 'student' } as IUser;

    await controller.list({ page: 1, limit: 10 }, studentUser);

    expect(mockCertificateService.list).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 'student1' }),
    );
  });

  // Test Case ID: TC_CERTCTRL_04
  it('should_OverrideTeacherId_When_TeacherUser', async () => {
    mockCertificateService.list.mockResolvedValue(mockListResult);
    const teacherUser = { id: 'teacher1', role: 'teacher' } as IUser;

    await controller.list({ page: 1, limit: 10 }, teacherUser);

    expect(mockCertificateService.list).toHaveBeenCalledWith(
      expect.objectContaining({ teacherId: 'teacher1' }),
    );
  });

  // ────────────────────────────────────────────────────────────────────────
  // getById()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERTCTRL_05
  it('should_GetById_When_ValidId', async () => {
    mockCertificateService.getById.mockResolvedValue(mockCertData);

    const result = await controller.getById('507f1f77bcf86cd799439011');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockCertData);
    expect(result.message).toBe('Certificate fetched');
  });

  // ────────────────────────────────────────────────────────────────────────
  // getByStudent()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERTCTRL_06
  it('should_GetByStudent_When_ValidStudentId', async () => {
    mockCertificateService.getByStudent.mockResolvedValue(mockListResult);

    const result = await controller.getByStudent('507f1f77bcf86cd799439013', {
      page: 1,
      limit: 10,
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  // ────────────────────────────────────────────────────────────────────────
  // getByCourse()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERTCTRL_07
  it('should_GetByCourse_When_ValidCourseId', async () => {
    mockCertificateService.getByCourse.mockResolvedValue(mockListResult);

    const result = await controller.getByCourse('507f1f77bcf86cd799439014', {
      page: 1,
      limit: 10,
    });

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  // ────────────────────────────────────────────────────────────────────────
  // revoke()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERTCTRL_08
  it('should_RevokeCertificate_When_ValidId', async () => {
    const revokedCert = { ...mockCertData, status: 'revoked' };
    mockCertificateService.revoke.mockResolvedValue(revokedCert);

    const result = await controller.revoke('507f1f77bcf86cd799439011', {
      reason: 'Policy violation',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Certificate revoked');
    expect(mockCertificateService.revoke).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      'Policy violation',
      undefined,
    );
  });

  // Test Case ID: TC_CERTCTRL_09
  it('should_RevokeCertificate_WithTransactionHash', async () => {
    const revokedCert = { ...mockCertData, status: 'revoked' };
    mockCertificateService.revoke.mockResolvedValue(revokedCert);

    await controller.revoke('507f1f77bcf86cd799439011', {
      reason: 'Fraud',
      transactionHash: '0xrevoke_tx',
    });

    expect(mockCertificateService.revoke).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      'Fraud',
      '0xrevoke_tx',
    );
  });

  // ────────────────────────────────────────────────────────────────────────
  // generateCertificate()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_CERTCTRL_10
  it('should_GenerateCertificate_When_ValidId', async () => {
    const genResult = {
      imageIpfsHash: 'QmImage',
      metadataIpfsHash: 'QmMeta',
      gatewayUrl: 'https://gw/ipfs/QmImage',
      metadataGatewayUrl: 'https://gw/ipfs/QmMeta',
      metadata: { studentName: 'Test' },
    };
    mockCertGenService.generateAndUploadCertificate.mockResolvedValue(genResult);

    const result = await controller.generateCertificate('507f1f77bcf86cd799439011');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(
      expect.objectContaining({
        imageIpfsHash: 'QmImage',
        metadataIpfsHash: 'QmMeta',
      }),
    );
  });
});
