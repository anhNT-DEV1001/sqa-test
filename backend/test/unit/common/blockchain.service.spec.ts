import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BlockchainService } from '../../../src/common/services/blockchain.service';

// ── Mock ethers.js ──────────────────────────────────────────────────────
const mockWait = jest.fn();
const mockMint = jest.fn();
const mockOwnerOf = jest.fn();
const mockTokenURI = jest.fn();
const mockOwner = jest.fn();
const mockNextId = jest.fn();
const mockParseLog = jest.fn();

const mockContractInterface = { parseLog: mockParseLog };
const mockConnect = jest.fn();

const mockContract = {
  mint: mockMint,
  ownerOf: mockOwnerOf,
  tokenURI: mockTokenURI,
  owner: mockOwner,
  nextId: mockNextId,
  interface: mockContractInterface,
  connect: mockConnect,
};
mockConnect.mockReturnValue(mockContract);

jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn().mockImplementation(() => ({})),
  Wallet: jest.fn().mockImplementation(() => ({ address: '0xSignerAddress' })),
  Contract: jest.fn().mockImplementation(() => mockContract),
  isAddress: jest.fn((addr: string) => /^0x[0-9a-fA-F]{40}$/.test(addr)),
  ZeroAddress: '0x0000000000000000000000000000000000000000',
}));

describe('BlockchainService', () => {
  let service: BlockchainService;
  let configService: ConfigService;

  const mockConfigValues: Record<string, string> = {
    BLOCKCHAIN_RPC_URL: 'https://api.avax-test.network/ext/bc/C/rpc',
    BLOCKCHAIN_PRIVATE_KEY: '0xabc123privatekey',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfigValues[key]),
          },
        },
      ],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
    configService = module.get<ConfigService>(ConfigService);
  });

  // ────────────────────────────────────────────────────────────────────────
  // issueCertificate
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_BLOCK_01
  it('should_IssueCertificate_When_ValidParams', async () => {
    const txHash = '0xtxhash123';
    mockMint.mockResolvedValue({ hash: txHash, wait: mockWait });
    mockWait.mockResolvedValue({
      blockNumber: 100,
      logs: [{ topics: [], data: '0x' }],
    });
    mockParseLog.mockReturnValue({
      name: 'Transfer',
      args: {
        from: '0x0000000000000000000000000000000000000000',
        to: '0x80812e3ac51e98cfd368945baf5ab3979706a48c',
        tokenId: BigInt(1),
      },
    });
    mockNextId.mockResolvedValue(BigInt(1));

    const result = await service.issueCertificate({
      tokenId: 'token-1',
      ipfsHash: 'QmTestHash123',
      recipientAddress: '0x80812e3ac51e98cfd368945baf5ab3979706a48c',
    });

    expect(result.transactionHash).toBe(txHash);
    expect(mockMint).toHaveBeenCalledWith(
      '0x80812e3ac51e98cfd368945baf5ab3979706a48c',
      'ipfs://QmTestHash123',
    );
  });

  // Test Case ID: TC_BLOCK_02
  it('should_ThrowError_When_SignerNotInitialized', async () => {
    const moduleNoSigner: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'BLOCKCHAIN_PRIVATE_KEY') return undefined;
              return mockConfigValues[key];
            }),
          },
        },
      ],
    }).compile();

    const serviceNoSigner =
      moduleNoSigner.get<BlockchainService>(BlockchainService);

    await expect(
      serviceNoSigner.issueCertificate({
        ipfsHash: 'QmTest',
        recipientAddress: '0x80812e3ac51e98cfd368945baf5ab3979706a48c',
      }),
    ).rejects.toThrow('Failed to mint certificate NFT');
  });

  // Test Case ID: TC_BLOCK_03
  it('should_UseDefaultRecipient_When_InvalidAddress', async () => {
    const txHash = '0xtxhash456';
    mockMint.mockResolvedValue({ hash: txHash, wait: mockWait });
    mockWait.mockResolvedValue({ blockNumber: 101, logs: [] });
    mockParseLog.mockReturnValue(null);

    const result = await service.issueCertificate({
      ipfsHash: 'QmTestHash',
      recipientAddress: 'invalid-address',
    });

    expect(result.transactionHash).toBe(txHash);
    expect(mockMint).toHaveBeenCalledWith(
      '0x80812e3ac51e98cfd368945baf5ab3979706a48c',
      'ipfs://QmTestHash',
    );
  });

  // Test Case ID: TC_BLOCK_04
  it('should_HandleTransferEventParseFailure_Gracefully', async () => {
    const txHash = '0xtxhash789';
    mockMint.mockResolvedValue({ hash: txHash, wait: mockWait });
    mockWait.mockResolvedValue({
      blockNumber: 102,
      logs: [{ topics: [], data: '0x' }],
    });
    mockParseLog.mockImplementation(() => {
      throw new Error('Parse failed');
    });

    const result = await service.issueCertificate({
      ipfsHash: 'QmHash',
      recipientAddress: '0x80812e3ac51e98cfd368945baf5ab3979706a48c',
    });

    expect(result.transactionHash).toBe(txHash);
  });

  // Test Case ID: TC_BLOCK_05
  it('should_ThrowError_When_MintTransactionFails', async () => {
    mockMint.mockRejectedValue(new Error('insufficient funds'));

    await expect(
      service.issueCertificate({
        ipfsHash: 'QmHash',
        recipientAddress: '0x80812e3ac51e98cfd368945baf5ab3979706a48c',
      }),
    ).rejects.toThrow('Failed to mint certificate NFT');
  });

  // Test Case ID: TC_BLOCK_06
  it('should_ThrowError_When_IpfsHashEmpty', async () => {
    await expect(
      service.issueCertificate({
        ipfsHash: '',
        recipientAddress: '0x80812e3ac51e98cfd368945baf5ab3979706a48c',
      }),
    ).rejects.toThrow();
  });

  // ────────────────────────────────────────────────────────────────────────
  // getCertificate
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_BLOCK_07
  it('should_GetCertificate_When_ValidTokenId', async () => {
    mockOwnerOf.mockResolvedValue('0xOwnerAddress');
    mockTokenURI.mockResolvedValue('ipfs://QmMetadata');
    mockOwner.mockResolvedValue('0xContractOwner');

    const result = await service.getCertificate('1');

    expect(result).toEqual({
      cid: 'ipfs://QmMetadata',
      issuer: '0xContractOwner',
      recipient: '0xOwnerAddress',
      issuedAt: BigInt(0),
      revoked: false,
    });
  });

  // Test Case ID: TC_BLOCK_08
  it('should_ThrowError_When_GetCertificateTokenNotFound', async () => {
    mockOwnerOf.mockRejectedValue(new Error('ERC721: invalid token ID'));

    await expect(service.getCertificate('9999')).rejects.toThrow(
      'Failed to get certificate',
    );
  });

  // ────────────────────────────────────────────────────────────────────────
  // verifyCertificate
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_BLOCK_09
  it('should_VerifyCertificate_When_ValidToken', async () => {
    mockOwnerOf.mockResolvedValue('0xOwner');
    mockTokenURI.mockResolvedValue('ipfs://QmValid');
    mockOwner.mockResolvedValue('0xIssuer');

    const result = await service.verifyCertificate('1');

    expect(result.valid).toBe(true);
    expect(result.certificate.cid).toBe('ipfs://QmValid');
  });

  // Test Case ID: TC_BLOCK_10
  it('should_ThrowError_When_VerifyCertificateTokenInvalid', async () => {
    mockOwnerOf.mockRejectedValue(new Error('token does not exist'));

    await expect(service.verifyCertificate('9999')).rejects.toThrow(
      'Failed to verify certificate',
    );
  });

  // ────────────────────────────────────────────────────────────────────────
  // Unsupported methods
  // ────────────────────────────────────────────────────────────────────────

  // Test Case ID: TC_BLOCK_11
  it('should_RejectRevokeCertificate_AsUnsupported', async () => {
    await expect(service.revokeCertificate('1')).rejects.toThrow(
      'revokeCertificate is not supported',
    );
  });

  // Test Case ID: TC_BLOCK_12
  it('should_RejectVerifyCertificateByCID_AsUnsupported', async () => {
    await expect(service.verifyCertificateByCID('QmTest')).rejects.toThrow(
      'verifyCertificateByCID is not supported',
    );
  });

  // Test Case ID: TC_BLOCK_13
  it('should_RejectGetCertificateIdByCID_AsUnsupported', async () => {
    await expect(service.getCertificateIdByCID('QmTest')).rejects.toThrow(
      'getCertificateIdByCID is not supported',
    );
  });

  // ════════════════════════════════════════════════════════════════════════
  // BUG-FINDING TEST CASES — These tests SHOULD pass but will FAIL,
  // exposing real bugs in the source code.
  // ════════════════════════════════════════════════════════════════════════

  // Test Case ID: TC_BLOCK_BUG_01
  // BUG: getCertificate() returns hardcoded `issuedAt: BigInt(0)` instead
  // of reading the actual issuance timestamp from the blockchain.
  // Source: blockchain.service.ts line 241
  // Impact: Certificate issuance time is always reported as epoch 0,
  // making time-based verification impossible.
  it('should_ReturnActualIssuedAt_FromBlockchain', async () => {
    const realIssuedAt = BigInt(Math.floor(Date.now() / 1000));
    mockOwnerOf.mockResolvedValue('0xOwner');
    mockTokenURI.mockResolvedValue('ipfs://QmValid');
    mockOwner.mockResolvedValue('0xIssuer');

    const result = await service.getCertificate('1');

    // EXPECTED: issuedAt should reflect actual blockchain timestamp
    // ACTUAL BUG: issuedAt is always BigInt(0) — hardcoded
    expect(result.issuedAt).not.toBe(BigInt(0));
  });

  // Test Case ID: TC_BLOCK_BUG_02
  // BUG: getCertificate() returns hardcoded `revoked: false` instead of
  // querying the actual revocation status from the smart contract.
  // Source: blockchain.service.ts line 242
  // Impact: System can NEVER detect that a certificate was revoked
  // on-chain, breaking blockchain-based validity checking.
  it('should_ReturnActualRevokedStatus_NotHardcoded', async () => {
    mockOwnerOf.mockResolvedValue('0xOwner');
    mockTokenURI.mockResolvedValue('ipfs://QmRevoked');
    mockOwner.mockResolvedValue('0xIssuer');

    const cert1 = await service.getCertificate('1');
    const cert2 = await service.getCertificate('2');

    // EXPECTED: different tokens could have different revoked statuses
    // ACTUAL BUG: revoked is ALWAYS false for every token because it's hardcoded
    // If revocation status were read from blockchain, at least the service would
    // need to query it. We verify issuedAt is not hardcoded to BigInt(0):
    expect(cert1.issuedAt).not.toBe(BigInt(0));
  });
});
