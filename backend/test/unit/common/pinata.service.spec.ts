import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PinataService } from '../../../src/common/services/pinata.service';

// ── Mock axios ──────────────────────────────────────────────────────────
const mockPost = jest.fn();
jest.mock('axios', () => ({
  create: jest.fn(() => ({ post: mockPost })),
  default: { create: jest.fn(() => ({ post: mockPost })) },
}));

describe('PinataService', () => {
  let service: PinataService;

  const configuredValues: Record<string, string> = {
    'pinata.apiKey': 'test-api-key',
    'pinata.apiSecret': 'test-api-secret',
    'pinata.gatewayUrl': 'https://gateway.test.pinata.cloud',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PinataService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => configuredValues[key]),
          },
        },
      ],
    }).compile();

    service = module.get<PinataService>(PinataService);
  });

  // ────────────────────────────────────────────────────────────────────────
  // uploadFile
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_PINATA_01
  it('should_UploadFile_When_ValidBuffer', async () => {
    const expectedHash = 'QmTestFileHash123';
    mockPost.mockResolvedValue({
      data: { IpfsHash: expectedHash, PinSize: 1024, Timestamp: '2025-01-01' },
    });

    const buffer = Buffer.from('test-image-data');
    const result = await service.uploadFile(buffer, 'test-cert.png', {
      name: 'Test Certificate',
    });

    expect(result).toBe(expectedHash);
    expect(mockPost).toHaveBeenCalledWith(
      '/pinning/pinFileToIPFS',
      expect.anything(),
      expect.objectContaining({ maxContentLength: Infinity }),
    );
  });

  // Test Case ID: TC_PINATA_02
  it('should_ThrowError_When_UploadFileWithNoCredentials', async () => {
    const moduleNoCreds: TestingModule = await Test.createTestingModule({
      providers: [
        PinataService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => undefined) },
        },
      ],
    }).compile();

    const serviceNoCreds = moduleNoCreds.get<PinataService>(PinataService);
    const buffer = Buffer.from('data');

    await expect(
      serviceNoCreds.uploadFile(buffer, 'file.png'),
    ).rejects.toThrow('Pinata API credentials not configured');
  });

  // Test Case ID: TC_PINATA_03
  it('should_ThrowError_When_UploadFileApiFails', async () => {
    mockPost.mockRejectedValue(new Error('Network error'));

    const buffer = Buffer.from('data');
    await expect(service.uploadFile(buffer, 'file.png')).rejects.toThrow(
      'Failed to upload file to Pinata',
    );
  });

  // ────────────────────────────────────────────────────────────────────────
  // uploadJSON
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_PINATA_04
  it('should_UploadJSON_When_ValidMetadata', async () => {
    const expectedHash = 'QmTestJsonHash456';
    mockPost.mockResolvedValue({
      data: { IpfsHash: expectedHash, PinSize: 512, Timestamp: '2025-01-01' },
    });

    const metadata = { name: 'Certificate', description: 'Test' };
    const result = await service.uploadJSON(metadata, 'cert-metadata');

    expect(result).toBe(expectedHash);
    expect(mockPost).toHaveBeenCalledWith(
      '/pinning/pinJSONToIPFS',
      expect.objectContaining({
        pinataContent: metadata,
        pinataMetadata: { name: 'cert-metadata' },
      }),
    );
  });

  // Test Case ID: TC_PINATA_05
  it('should_ThrowError_When_UploadJSONWithNoCredentials', async () => {
    const moduleNoCreds: TestingModule = await Test.createTestingModule({
      providers: [
        PinataService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => undefined) },
        },
      ],
    }).compile();

    const serviceNoCreds = moduleNoCreds.get<PinataService>(PinataService);

    await expect(
      serviceNoCreds.uploadJSON({ test: true }, 'test'),
    ).rejects.toThrow('Pinata API credentials not configured');
  });

  // Test Case ID: TC_PINATA_06
  it('should_ThrowError_When_UploadJSONApiFails', async () => {
    mockPost.mockRejectedValue(new Error('Server error'));

    await expect(service.uploadJSON({ test: true })).rejects.toThrow(
      'Failed to upload JSON to Pinata',
    );
  });

  // Test Case ID: TC_PINATA_07
  it('should_UseDefaultName_When_UploadJSONWithoutName', async () => {
    mockPost.mockResolvedValue({
      data: { IpfsHash: 'QmDefault', PinSize: 128, Timestamp: '2025-01-01' },
    });

    await service.uploadJSON({ key: 'value' });

    expect(mockPost).toHaveBeenCalledWith(
      '/pinning/pinJSONToIPFS',
      expect.objectContaining({
        pinataMetadata: { name: 'certificate-metadata' },
      }),
    );
  });

  // ────────────────────────────────────────────────────────────────────────
  // getGatewayUrl
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_PINATA_08
  it('should_ReturnGatewayUrl_When_ValidIpfsHash', () => {
    const url = service.getGatewayUrl('QmTestHash');
    expect(url).toBe('https://gateway.test.pinata.cloud/ipfs/QmTestHash');
  });
});
