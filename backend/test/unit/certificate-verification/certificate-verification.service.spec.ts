import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CertificateVerificationService } from '../../../src/modules/certificate-verification/certificate-verification.service';
import { BlockchainService } from '../../../src/common/services/blockchain.service';

describe('CertificateVerificationService', () => {
  let service: CertificateVerificationService;

  // ── Shared IDs ────────────────────────────────────────────────────────
  const validCertId = new Types.ObjectId();
  const studentId = new Types.ObjectId();
  const courseId = new Types.ObjectId();
  const submissionId = new Types.ObjectId();

  const populatedCert = {
    _id: validCertId,
    studentId: { username: 'student1', email: 's@test.com', fullName: 'Student One', role: 'student' },
    courseId: { courseName: 'Blockchain 101' },
    submissionId: { score: 88, submittedAt: new Date() },
    status: 'issued',
    tokenId: 'token-1',
    ipfsHash: 'QmMeta',
    ipfsImage: 'QmImage',
    transactionHash: '0xtx',
    issuedAt: new Date(),
    outdateTime: new Date('2027-06-01'),
  };

  // ── Mock models ───────────────────────────────────────────────────────
  const mockCertificateModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const mockUserModel = { findOne: jest.fn() };
  const mockCourseModel = {};
  const mockSubmissionModel = {};

  const mockBlockchainService = {
    verifyCertificate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificateVerificationService,
        { provide: getModelToken('Certificate'), useValue: mockCertificateModel },
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('Course'), useValue: mockCourseModel },
        { provide: getModelToken('Submission'), useValue: mockSubmissionModel },
        { provide: BlockchainService, useValue: mockBlockchainService },
      ],
    }).compile();

    service = module.get<CertificateVerificationService>(CertificateVerificationService);
  });

  // ── Helper ────────────────────────────────────────────────────────────
  function setupFindById(result: any) {
    mockCertificateModel.findById.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(result),
    });
  }

  function setupFindOne(result: any) {
    mockCertificateModel.findOne.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(result),
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // verifyByCertificateId()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_VERIFY_01
  it('should_ThrowBadRequest_When_InvalidCertificateId', async () => {
    await expect(
      service.verifyByCertificateId('invalid-id'),
    ).rejects.toThrow(BadRequestException);
  });

  // Test Case ID: TC_VERIFY_02
  it('should_ReturnInvalid_When_CertificateNotFound', async () => {
    setupFindById(null);

    const result = await service.verifyByCertificateId(validCertId.toHexString());

    expect(result.valid).toBe(false);
    expect(result.message).toBe('Certificate not found');
    expect(result.certificate).toBeNull();
  });

  // Test Case ID: TC_VERIFY_03
  it('should_ReturnValid_When_IssuedCertificateFound', async () => {
    setupFindById(populatedCert);
    mockBlockchainService.verifyCertificate.mockResolvedValue({
      valid: true,
      certificate: { cid: 'ipfs://QmMeta', issuer: '0xIssuer', recipient: '0xRecipient' },
    });

    const result = await service.verifyByCertificateId(validCertId.toHexString());

    expect(result.valid).toBe(true);
    expect(result.message).toBe('Certificate is valid');
    expect(result.certificate).toBeDefined();
    expect(result.blockchainVerification).toBeDefined();
  });

  // Test Case ID: TC_VERIFY_04
  it('should_ReturnInvalid_When_CertificateIsRevoked', async () => {
    const revokedCert = { ...populatedCert, status: 'revoked' };
    setupFindById(revokedCert);
    mockBlockchainService.verifyCertificate.mockResolvedValue({
      valid: true,
      certificate: { cid: 'ipfs://QmMeta', issuer: '0xI', recipient: '0xR' },
    });

    const result = await service.verifyByCertificateId(validCertId.toHexString());

    expect(result.valid).toBe(false);
    expect(result.message).toBe('Certificate has been revoked');
  });

  // Test Case ID: TC_VERIFY_05
  it('should_ReturnPending_When_CertificateIsPending', async () => {
    const pendingCert = { ...populatedCert, status: 'pending', tokenId: undefined };
    setupFindById(pendingCert);

    const result = await service.verifyByCertificateId(validCertId.toHexString());

    expect(result.valid).toBe(false);
    expect(result.message).toBe('Certificate is pending issuance');
  });

  // Test Case ID: TC_VERIFY_06
  it('should_HandleBlockchainVerifyFailure_Gracefully', async () => {
    setupFindById(populatedCert);
    mockBlockchainService.verifyCertificate.mockRejectedValue(
      new Error('Network error'),
    );

    const result = await service.verifyByCertificateId(validCertId.toHexString());

    expect(result.valid).toBe(true);
    expect(result.blockchainVerification?.valid).toBe(false);
    expect(result.blockchainVerification?.error).toBe('Network error');
  });

  // ────────────────────────────────────────────────────────────────────────
  // verifyByTokenId()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_VERIFY_07
  it('should_ThrowBadRequest_When_EmptyTokenId', async () => {
    await expect(service.verifyByTokenId('')).rejects.toThrow(BadRequestException);
  });

  // Test Case ID: TC_VERIFY_08
  it('should_ThrowBadRequest_When_WhitespaceTokenId', async () => {
    await expect(service.verifyByTokenId('   ')).rejects.toThrow(BadRequestException);
  });

  // Test Case ID: TC_VERIFY_09
  it('should_ReturnInvalid_When_TokenNotOnBlockchain', async () => {
    mockBlockchainService.verifyCertificate.mockResolvedValue({
      valid: false,
      certificate: {},
    });

    const result = await service.verifyByTokenId('nonexistent-token');

    expect(result.valid).toBe(false);
    expect(result.message).toBe('Certificate not found on blockchain');
  });

  // Test Case ID: TC_VERIFY_10
  it('should_ReturnValidWithBlockchainOnly_When_NoLocalRecord', async () => {
    mockBlockchainService.verifyCertificate.mockResolvedValue({
      valid: true,
      certificate: { cid: 'ipfs://QmMeta', issuer: '0xI', recipient: '0xR' },
    });
    setupFindOne(null);

    const result = await service.verifyByTokenId('token-orphan');

    expect(result.valid).toBe(true);
    expect(result.message).toContain('no local record');
    expect(result.certificate).toBeNull();
    expect(result.blockchainVerification?.valid).toBe(true);
  });

  // Test Case ID: TC_VERIFY_11
  it('should_ReturnFullVerification_When_TokenFoundOnBothSides', async () => {
    mockBlockchainService.verifyCertificate.mockResolvedValue({
      valid: true,
      certificate: { cid: 'ipfs://QmMeta', issuer: '0xI', recipient: '0xR' },
    });
    setupFindOne(populatedCert);

    const result = await service.verifyByTokenId('token-1');

    expect(result.valid).toBe(true);
    expect(result.certificate).toBeDefined();
    expect(result.blockchainVerification?.valid).toBe(true);
  });

  // ────────────────────────────────────────────────────────────────────────
  // lookupCertificates()
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_VERIFY_12
  it('should_ThrowBadRequest_When_NoFiltersProvided', async () => {
    await expect(service.lookupCertificates({})).rejects.toThrow(BadRequestException);
  });

  // Test Case ID: TC_VERIFY_13
  it('should_LookupByCertificateId_When_ValidId', async () => {
    mockCertificateModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([populatedCert]),
    });

    const results = await service.lookupCertificates({
      certificateId: validCertId.toHexString(),
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(String(validCertId));
  });

  // Test Case ID: TC_VERIFY_14
  it('should_ThrowBadRequest_When_InvalidCertificateIdFormat', async () => {
    await expect(
      service.lookupCertificates({ certificateId: 'bad-format' }),
    ).rejects.toThrow(BadRequestException);
  });

  // Test Case ID: TC_VERIFY_15
  it('should_LookupByTokenId_When_Provided', async () => {
    mockCertificateModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([populatedCert]),
    });

    const results = await service.lookupCertificates({ tokenId: 'token-1' });

    expect(results).toHaveLength(1);
  });

  // Test Case ID: TC_VERIFY_16
  it('should_LookupByStudentEmail_When_StudentExists', async () => {
    mockUserModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ _id: studentId }),
    });
    mockCertificateModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([populatedCert]),
    });

    const results = await service.lookupCertificates({ studentEmail: 's@test.com' });

    expect(results).toHaveLength(1);
  });

  // Test Case ID: TC_VERIFY_17
  it('should_ReturnEmpty_When_StudentEmailNotFound', async () => {
    mockUserModel.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(null),
    });

    const results = await service.lookupCertificates({
      studentEmail: 'nobody@test.com',
    });

    expect(results).toHaveLength(0);
  });
});
