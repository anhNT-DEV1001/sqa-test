import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { User } from '../../database/schemas/user.schema';
import { PasswordResetToken } from '../../database/schemas/password-reset-token.schema';
import { ConflictException, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { of, throwError } from 'rxjs';

// Mock argon2
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  verify: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;
  let passwordResetTokenModel: any;
  let jwtService: any;
  let mailService: any;
  let httpService: any;

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  class MockUserModel {
    constructor(private data: any) {
      Object.assign(this, data);
    }
    save = mockUserModel.save.mockResolvedValue(this);
    static findOne = mockUserModel.findOne;
    static findById = mockUserModel.findById;
    static findByIdAndUpdate = mockUserModel.findByIdAndUpdate;
  }

  const mockPasswordResetTokenModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn().mockResolvedValue(0),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
    verifyAsync: jest.fn(),
  };

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'GEMINI_API_KEY') return 'mock-api-key';
      if (key === 'app.passwordReset') return undefined; // use defaults
      return null;
    }),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
        {
          provide: getModelToken(PasswordResetToken.name),
          useValue: mockPasswordResetTokenModel,
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User.name));
    passwordResetTokenModel = module.get(getModelToken(PasswordResetToken.name));
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    // Test Case ID: TC_USER_01
    it('TC_USER_01: should register a new user successfully yielding tokens and saving to DB', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null); // username check
      mockUserModel.findOne.mockResolvedValueOnce(null); // email check

      const registerDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        role: 'student' as const,
      };

      const result = await service.register(registerDto);

      // CheckDB Requirement
      expect(mockUserModel.save).toHaveBeenCalled();
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalled(); // updateRefreshToken

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.user.username).toBe('testuser');
    });

    // Test Case ID: TC_USER_02
    it('TC_USER_02: should throw ConflictException if username already exists', async () => {
      mockUserModel.findOne.mockResolvedValueOnce({ username: 'testuser' });

      await expect(service.register({ username: 'testuser', password: 'pw', email: 'test@test.com', role: 'student', fullName: 'Test' }))
        .rejects.toThrow(ConflictException);
    });

    // Test Case ID: TC_USER_03
    it('TC_USER_03: should throw ConflictException if email exists', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null); // username ok
      mockUserModel.findOne.mockResolvedValueOnce({ email: 'test@test.com' }); // email taken

      await expect(service.register({ username: 'testuser2', password: 'pw', email: 'test@test.com', role: 'student', fullName: 'Test' }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    // Test Case ID: TC_USER_04
    it('TC_USER_04: should successfully login user with correct credentials', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
        role: 'student',
      };
      mockUserModel.findOne.mockResolvedValueOnce(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login({ identifier: 'testuser', password: 'password123' });

      // CheckDB Requirement
      expect(mockUserModel.findOne).toHaveBeenCalled();
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user-id', { refreshTokenHash: 'hashed-password' });

      expect(result.accessToken).toBe('mock-token');
    });

    // Test Case ID: TC_USER_05
    it('TC_USER_05: should throw UnauthorizedException on wrong user', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);

      await expect(service.login({ identifier: 'wronguser', password: 'password123' }))
        .rejects.toThrow(UnauthorizedException);
    });

    // Test Case ID: TC_USER_06
    it('TC_USER_06: should throw UnauthorizedException on wrong password', async () => {
      const mockUser = { _id: 'user-id', passwordHash: 'hashed' };
      mockUserModel.findOne.mockResolvedValueOnce(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false); // password mismatch

      await expect(service.login({ identifier: 'testuser', password: 'wrongpassword' }))
        .rejects.toThrow(UnauthorizedException);

      // Verification that argon was called to check password hash
      expect(argon2.verify).toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully if valid', async () => {
      const mockUser = {
        _id: 'user-id',
        refreshTokenHash: 'hashed-refresh-token',
        email: 't@t.com',
        role: 'student'
      };
      // JWT mock payload
      mockJwtService.verifyAsync.mockResolvedValueOnce({ sub: 'user-id' });
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.refreshTokens({ refreshToken: 'valid-token' });

      expect(mockJwtService.verifyAsync).toHaveBeenCalled();
      expect(mockUserModel.findById).toHaveBeenCalled();
      expect(argon2.verify).toHaveBeenCalledWith('hashed-refresh-token', 'valid-token');
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-token');
    });

    it('should throw UnauthorizedException if jwt verification fails', async () => {
      mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('verify error'));
      await expect(service.refreshTokens({ refreshToken: 'invalid' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found or no refresh token hash', async () => {
      mockJwtService.verifyAsync.mockResolvedValueOnce({ sub: 'user-id' });
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });
      await expect(service.refreshTokens({ refreshToken: 'token' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token mismatched', async () => {
      mockJwtService.verifyAsync.mockResolvedValueOnce({ sub: 'user-id' });
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user-id', refreshTokenHash: 'hash' }),
      });
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);
      await expect(service.refreshTokens({ refreshToken: 'token' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    // Test Case ID: TC_USER_07
    it('TC_USER_07: should change password successfully for valid credentials', async () => {
      const mockUser = { _id: 'user-id', passwordHash: 'old-hashed-password' };
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true); // current pass OK
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false); // new pass different

      const result = await service.changePassword('user-id', {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      });

      // CheckDB Requirement
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user-id', {
        passwordHash: 'hashed-password',
        refreshTokenHash: undefined,
      });
      expect(result.message).toBe('Password changed successfully');
    });

    // Test Case ID: TC_USER_08
    it('TC_USER_08: should throw ConflictException if new password matches old', async () => {
      const mockUser = { _id: 'user-id', passwordHash: 'old-hashed-password' };
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true); // current pass OK
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true); // new pass SAME

      await expect(service.changePassword('user-id', {
        currentPassword: 'password123',
        newPassword: 'password123',
      })).rejects.toThrow(ConflictException);
    });
  });

  describe('updateProfile', () => {
    // Test Case ID: TC_USER_09
    it('TC_USER_09: should update profile successfully', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null); // email not taken
      const mockUpdatedUser = { _id: 'user-id', email: 'new@test.com', fullName: 'New Name' };
      mockUserModel.findByIdAndUpdate.mockResolvedValueOnce(mockUpdatedUser);

      const result = await service.updateProfile('user-id', {
        email: 'new@test.com',
        fullName: 'New Name',
      });

      // CheckDB Requirement
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user-id', {
        email: 'new@test.com',
        fullName: 'New Name',
      }, { new: true, runValidators: true });
      expect(result.message).toBe('Profile updated successfully');
    });

    it('should throw ConflictException if new email is taken by another user', async () => {
      mockUserModel.findOne.mockResolvedValueOnce({ _id: 'other-id' });
      await expect(service.updateProfile('user-id', { email: 'taken@test.com' })).rejects.toThrow(ConflictException);
    });

    it('should throw UnauthorizedException if user not found after update', async () => {
      mockUserModel.findByIdAndUpdate.mockResolvedValueOnce(null);
      await expect(service.updateProfile('user-id', { fullName: 'A' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile / validateUser', () => {
    it('should return mapped profile data', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'usr',
        email: 'e@e.com',
        role: 'student',
        fullName: 'Name',
      };
      mockUserModel.findById.mockResolvedValueOnce(mockUser);

      const result = await service.getProfile('user-id');
      expect(result.user.username).toBe('usr');
    });

    it('should throw UnauthorizedException if getting non-existent profile', async () => {
      mockUserModel.findById.mockResolvedValueOnce(null);
      await expect(service.getProfile('123')).rejects.toThrow(UnauthorizedException);
    });

    it('validateUser should return sanitized profile', async () => {
      const mockUser = { _id: 'id', email: 'e' };
      mockUserModel.findById.mockResolvedValueOnce(mockUser);

      const result = await service.validateUser({ sub: 'id', email: 'e', role: 'student' } as any);
      expect(result.id).toBe('id');
    });

    it('validateUser should throw if user missing', async () => {
      mockUserModel.findById.mockResolvedValueOnce(null);
      await expect(service.validateUser({ sub: 'id', email: 'e', role: 'student' } as any)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('requestPasswordReset', () => {
    // Test Case ID: TC_USER_10
    it('TC_USER_10: should create reset token and send email', async () => {
      const mockUser = { _id: 'user-id', email: 'test@test.com', fullName: 'Test' };
      mockPasswordResetTokenModel.countDocuments.mockResolvedValue(0);
      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockPasswordResetTokenModel.create.mockResolvedValueOnce({});

      const result = await service.requestPasswordReset(
        { email: 'test@test.com' },
        { ip: '127.0.0.1', userAgent: 'userAgent' }
      );

      // CheckDB Requirement
      expect(mockPasswordResetTokenModel.create).toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(result.expiresInMinutes).toBe(15);
    });
  });

  describe('resetPassword', () => {
    // Test Case ID: TC_USER_11
    it('TC_USER_11: should reset password when valid token is provided', async () => {
      const mockToken = { _id: 'token-id', email: 'test@test.com', userId: 'user-id' };
      const mockUser = { _id: 'user-id' };

      mockPasswordResetTokenModel.findOne.mockResolvedValueOnce(mockToken);
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await service.resetPassword({
        token: 'valid-token',
        password: 'newpassword',
        confirmPassword: 'newpassword',
      });

      // CheckDB Requirement
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUser._id, {
        passwordHash: 'hashed-password',
        refreshTokenHash: undefined,
      });
      expect(mockPasswordResetTokenModel.updateOne).toHaveBeenCalledWith(
        { _id: mockToken._id },
        expect.any(Object),
      );
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      await expect(service.resetPassword({ token: 't', password: 'p1', confirmPassword: 'p2' }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if token is invalid or expired', async () => {
      mockPasswordResetTokenModel.findOne.mockResolvedValueOnce(null);
      await expect(service.resetPassword({ token: 't', password: 'p', confirmPassword: 'p' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateProfileImage (AI)', () => {
    // Test Case ID: TC_USER_12
    it('TC_USER_12: should return success if image passes AI validation', async () => {
      const mockImageBase64 = 'data:image/jpeg;base64,mockdata';

      const mockGeminiResponse = {
        data: {
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({ isValid: true, reason: 'Looks good' })
              }]
            }
          }]
        }
      };

      mockHttpService.post.mockReturnValue(of(mockGeminiResponse));

      const result = await service.validateProfileImage(mockImageBase64);

      expect(mockHttpService.post).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    // Test Case ID: TC_USER_13
    it('TC_USER_13: should throw BadRequestException if image fails AI validation', async () => {
      const mockImageBase64 = 'data:image/jpeg;base64,mockdata';

      const mockGeminiResponse = {
        data: {
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({ isValid: false, reason: 'No face detected' })
              }]
            }
          }]
        }
      };

      mockHttpService.post.mockReturnValue(of(mockGeminiResponse));

      await expect(service.validateProfileImage(mockImageBase64)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid parts format', async () => {
      await expect(service.validateProfileImage('not-base64-string')).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException on unknown Gemini API error', async () => {
      mockHttpService.post.mockReturnValue(throwError(() => new Error('API down')));
      await expect(service.validateProfileImage('data:image/jpeg;base64,data')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('verifyFace (AI)', () => {
    // Test Case ID: TC_USER_14
    it('TC_USER_14: should verify face successfully if AI returns true', async () => {
      const mockUser = { username: 'testuser', imageUrl: 'https://example.com/profile.jpg' } as any;
      const mockVerifyFaceDto = { webcamImage: 'data:image/jpeg;base64,webcamdata' };

      // Mock Http GET for profile image
      mockHttpService.get.mockReturnValue(of({
        headers: { 'content-type': 'image/jpeg' },
        data: new ArrayBuffer(8)
      }));

      // Mock Http POST for Gemini text response
      const mockGeminiResponse = {
        data: {
          candidates: [{
            content: { parts: [{ text: ' true \n' }] }
          }]
        }
      };
      mockHttpService.post.mockReturnValue(of(mockGeminiResponse));

      const result = await service.verifyFace(mockUser, mockVerifyFaceDto);

      expect(mockHttpService.get).toHaveBeenCalledWith('https://example.com/profile.jpg', expect.any(Object));
      expect(mockHttpService.post).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    // Test Case ID: TC_USER_15
    it('TC_USER_15: should fail verification if AI returns false', async () => {
      const mockUser = { username: 'testuser', imageUrl: 'https://example.com/profile.jpg' } as any;
      const mockVerifyFaceDto = { webcamImage: 'data:image/jpeg;base64,webcamdata' };

      // Mock Http GET for profile image
      mockHttpService.get.mockReturnValue(of({
        headers: { 'content-type': 'image/jpeg' },
        data: new ArrayBuffer(8)
      }));

      // Mock Http POST for Gemini text response
      const mockGeminiResponse = {
        data: {
          candidates: [{
            content: { parts: [{ text: ' false \n' }] }
          }]
        }
      };
      mockHttpService.post.mockReturnValue(of(mockGeminiResponse));

      const result = await service.verifyFace(mockUser, mockVerifyFaceDto);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Face does not match');
    });

    it('should throw BadRequestException if user has no profile picture', async () => {
      const mockUser = { username: 'testuser', imageUrl: undefined } as any;
      await expect(service.verifyFace(mockUser, { webcamImage: 'data' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if webcam image is invalid format or empty', async () => {
      const mockUser = { username: 'usr', imageUrl: 'url' } as any;
      await expect(service.verifyFace(mockUser, { webcamImage: '' })).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerError if fetching profile image fails', async () => {
      const mockUser = { username: 'usr', imageUrl: 'url' } as any;
      mockHttpService.get.mockReturnValue(throwError(() => new Error('fetch error')));
      await expect(service.verifyFace(mockUser, { webcamImage: 'data:image/jpeg;base64,123' })).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerError if Gemini API throws 403', async () => {
      const mockUser = { username: 'usr', imageUrl: 'url' } as any;
      mockHttpService.get.mockReturnValue(of({ headers: {}, data: new ArrayBuffer(8) }));
      const error = Object.assign(new Error(), { response: { status: 403 } });
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(service.verifyFace(mockUser, { webcamImage: 'data:image/jpeg;base64,123' })).rejects.toThrow(InternalServerErrorException);
    });
  });
});
