import { Test, TestingModule } from '@nestjs/testing';
import {
  CertificateImageService,
  CertificateData,
} from '../../../src/common/services/certificate-image.service';

// ── Mock canvas library ─────────────────────────────────────────────────
const mockFillText = jest.fn();
const mockFillRect = jest.fn();
const mockStrokeRect = jest.fn();
const mockBeginPath = jest.fn();
const mockArc = jest.fn();
const mockFill = jest.fn();
const mockStroke = jest.fn();
const mockMoveTo = jest.fn();
const mockLineTo = jest.fn();
const mockClip = jest.fn();
const mockSave = jest.fn();
const mockRestore = jest.fn();
const mockDrawImage = jest.fn();
const mockSetLineDash = jest.fn();
const mockToBuffer = jest.fn();

const mockCtx = {
  fillText: mockFillText,
  fillRect: mockFillRect,
  strokeRect: mockStrokeRect,
  beginPath: mockBeginPath,
  arc: mockArc,
  fill: mockFill,
  stroke: mockStroke,
  moveTo: mockMoveTo,
  lineTo: mockLineTo,
  clip: mockClip,
  save: mockSave,
  restore: mockRestore,
  drawImage: mockDrawImage,
  setLineDash: mockSetLineDash,
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
  textBaseline: '',
  shadowColor: '',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
};

const fakeBuffer = Buffer.from('fake-png-data');

jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => mockCtx),
    toBuffer: jest.fn(
      (cb: (err: Error | null, buf: Buffer | null) => void) => {
        cb(null, fakeBuffer);
      },
    ),
  })),
  loadImage: jest.fn(() =>
    Promise.resolve({ width: 200, height: 200 }),
  ),
}));

describe('CertificateImageService', () => {
  let service: CertificateImageService;

  const baseCertData: CertificateData = {
    studentName: 'Nguyen Van A',
    courseName: 'Blockchain Fundamentals',
    examTitle: 'Final Exam Q4',
    score: 85.5,
    issuedDate: 'January 15, 2025',
    certificateId: '507f1f77bcf86cd799439011',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CertificateImageService],
    }).compile();

    service = module.get<CertificateImageService>(CertificateImageService);
  });

  // Test Case ID: TC_IMG_01
  it('should_GenerateImage_When_FullDataProvided', async () => {
    const result = await service.generateCertificateImage(baseCertData);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
    expect(mockFillText).toHaveBeenCalled();
  });

  // Test Case ID: TC_IMG_02
  it('should_GenerateImage_When_OptionalFieldsMissing', async () => {
    const minimalData: CertificateData = {
      studentName: 'Tran B',
      courseName: 'Web Development',
      examTitle: 'Midterm',
      score: 70,
      issuedDate: 'March 1, 2025',
    };

    const result = await service.generateCertificateImage(minimalData);

    expect(result).toBeInstanceOf(Buffer);
  });

  // Test Case ID: TC_IMG_03
  it('should_GenerateImage_WithStudentImage_When_UrlProvided', async () => {
    const dataWithImage: CertificateData = {
      ...baseCertData,
      studentImageUrl: 'https://example.com/photo.jpg',
    };

    const result = await service.generateCertificateImage(dataWithImage);

    expect(result).toBeInstanceOf(Buffer);
    const { loadImage } = require('canvas');
    expect(loadImage).toHaveBeenCalledWith('https://example.com/photo.jpg');
  });

  // Test Case ID: TC_IMG_04
  it('should_SkipStudentImage_When_UrlNotProvided', async () => {
    await service.generateCertificateImage(baseCertData);

    const { loadImage } = require('canvas');
    expect(loadImage).not.toHaveBeenCalled();
  });

  // Test Case ID: TC_IMG_05
  it('should_ContinueWithoutImage_When_ImageLoadFails', async () => {
    const { loadImage } = require('canvas');
    loadImage.mockRejectedValueOnce(new Error('Image load failed'));

    const dataWithBrokenImage: CertificateData = {
      ...baseCertData,
      studentImageUrl: 'https://example.com/broken.jpg',
    };

    const result =
      await service.generateCertificateImage(dataWithBrokenImage);

    expect(result).toBeInstanceOf(Buffer);
  });

  // Test Case ID: TC_IMG_06
  it('should_IncludeIdentifyNumberAndExpireDate_When_Provided', async () => {
    const dataWithExtras: CertificateData = {
      ...baseCertData,
      identifyNumber: '001234567890',
      expireDate: 'January 15, 2027',
    };

    const result = await service.generateCertificateImage(dataWithExtras);

    expect(result).toBeInstanceOf(Buffer);
    expect(mockFillText).toHaveBeenCalledWith(
      expect.stringContaining('001234567890'),
      expect.any(Number),
      expect.any(Number),
    );
  });
});
