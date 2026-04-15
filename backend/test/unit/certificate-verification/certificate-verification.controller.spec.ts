import { Test, TestingModule } from '@nestjs/testing';
import { CertificateVerificationController } from '../../../src/modules/certificate-verification/certificate-verification.controller';
import { CertificateVerificationService } from '../../../src/modules/certificate-verification/certificate-verification.service';

describe('CertificateVerificationController', () => {
  let controller: CertificateVerificationController;

  const mockVerificationService = {
    verifyByCertificateId: jest.fn(),
    verifyByTokenId: jest.fn(),
    lookupCertificates: jest.fn(),
  };

  const mockVerificationResult = {
    valid: true,
    message: 'Certificate is valid',
    certificate: {
      id: '507f1f77bcf86cd799439011',
      student: { fullName: 'Student One' },
      course: { courseName: 'Blockchain 101' },
      submission: { score: 88 },
      status: 'issued',
      tokenId: 'token-1',
    },
    blockchainVerification: {
      valid: true,
      tokenId: 'token-1',
      cid: 'ipfs://QmMeta',
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificateVerificationController],
      providers: [
        {
          provide: CertificateVerificationService,
          useValue: mockVerificationService,
        },
      ],
    }).compile();

    controller = module.get<CertificateVerificationController>(
      CertificateVerificationController,
    );
  });

  // ────────────────────────────────────────────────────────────────────────
  // verifyByCertificateId()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_VERIFYCTRL_01
  it('should_VerifyByCertificateId_When_ValidId', async () => {
    mockVerificationService.verifyByCertificateId.mockResolvedValue(
      mockVerificationResult,
    );

    const result = await controller.verifyByCertificateId(
      '507f1f77bcf86cd799439011',
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe('Certificate verification completed');
    expect(result.data).toEqual(mockVerificationResult);
    expect(mockVerificationService.verifyByCertificateId).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
    );
  });

  // Test Case ID: TC_VERIFYCTRL_02
  it('should_ReturnInvalidResult_When_CertificateNotFound', async () => {
    const notFoundResult = {
      valid: false,
      message: 'Certificate not found',
      certificate: null,
      blockchainVerification: null,
    };
    mockVerificationService.verifyByCertificateId.mockResolvedValue(notFoundResult);

    const result = await controller.verifyByCertificateId('507f1f77bcf86cd799439099');

    expect(result.success).toBe(true);
    expect(result.data.valid).toBe(false);
  });

  // ────────────────────────────────────────────────────────────────────────
  // verifyByTokenId()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_VERIFYCTRL_03
  it('should_VerifyByTokenId_When_ValidToken', async () => {
    mockVerificationService.verifyByTokenId.mockResolvedValue(
      mockVerificationResult,
    );

    const result = await controller.verifyByTokenId('token-1');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockVerificationResult);
    expect(mockVerificationService.verifyByTokenId).toHaveBeenCalledWith('token-1');
  });

  // Test Case ID: TC_VERIFYCTRL_04
  it('should_ReturnInvalid_When_TokenNotOnBlockchain', async () => {
    const invalidResult = {
      valid: false,
      message: 'Certificate not found on blockchain',
      certificate: null,
      blockchainVerification: { valid: false, tokenId: 'bad-token', error: 'Not found' },
    };
    mockVerificationService.verifyByTokenId.mockResolvedValue(invalidResult);

    const result = await controller.verifyByTokenId('bad-token');

    expect(result.data.valid).toBe(false);
  });

  // ────────────────────────────────────────────────────────────────────────
  // lookupCertificates()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_VERIFYCTRL_05
  it('should_LookupCertificates_When_FiltersProvided', async () => {
    const lookupItems = [
      { id: '507f1f77bcf86cd799439011', status: 'issued', tokenId: 'token-1' },
    ];
    mockVerificationService.lookupCertificates.mockResolvedValue(lookupItems);

    const result = await controller.lookupCertificates(
      '507f1f77bcf86cd799439011',
      undefined,
      undefined,
    );

    expect(result.success).toBe(true);
    expect(result.data.items).toHaveLength(1);
    expect(result.data.total).toBe(1);
    expect(mockVerificationService.lookupCertificates).toHaveBeenCalledWith({
      certificateId: '507f1f77bcf86cd799439011',
      tokenId: undefined,
      studentEmail: undefined,
    });
  });

  // Test Case ID: TC_VERIFYCTRL_06
  it('should_LookupByEmail_When_EmailProvided', async () => {
    mockVerificationService.lookupCertificates.mockResolvedValue([]);

    const result = await controller.lookupCertificates(
      undefined,
      undefined,
      'student@test.com',
    );

    expect(result.success).toBe(true);
    expect(result.data.items).toHaveLength(0);
    expect(result.data.total).toBe(0);
    expect(mockVerificationService.lookupCertificates).toHaveBeenCalledWith({
      certificateId: undefined,
      tokenId: undefined,
      studentEmail: 'student@test.com',
    });
  });
});
