import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail.service';
import { User } from '../../../database/schemas/user.schema';
import { PasswordResetToken } from '../../../database/schemas/password-reset-token.schema';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { of } from 'rxjs';
import { createHash } from 'crypto';

jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed-value'),
  verify: jest.fn().mockResolvedValue(true),
}));

describe('AuthService - User Management Unit Tests', () => {
  let service: AuthService;

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    save: jest.fn(),
  };

  class MockUserModel {
    constructor(private readonly data: any) {
      Object.assign(this, data);
    }

    save = mockUserModel.save.mockImplementation(async () => this);

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
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    verifyAsync: jest.fn(),
  };

  const mockHttpService = {
    get: jest.fn(),
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'GEMINI_API_KEY') return 'mock-gemini-key';
      if (key === 'app.passwordReset') return undefined;
      return null;
    }),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    (argon2.hash as jest.Mock).mockResolvedValue('hashed-value');
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');
    mockPasswordResetTokenModel.countDocuments.mockResolvedValue(0);
    mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);
    mockConfigService.get.mockImplementation((key: string) => {
      if (key === 'GEMINI_API_KEY') return 'mock-gemini-key';
      if (key === 'app.passwordReset') return undefined;
      return null;
    });

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
  });

  describe('register', () => {
    it('TC_USER_01: Success Registration', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);
      mockUserModel.findOne.mockResolvedValueOnce(null);

      const result = await service.register({
        username: 'student01',
        fullName: 'Student One',
        email: 'student01@example.com',
        password: 'StrongPass@123',
        role: 'student',
      });

      expect(mockUserModel.save).toHaveBeenCalledTimes(1);
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(result.user.username).toBe('student01');
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });

    it('TC_USER_02: Error Registration (Username Taken)', async () => {
      mockUserModel.findOne.mockResolvedValueOnce({ _id: 'u1', username: 'taken' });

      await expect(
        service.register({
          username: 'taken',
          fullName: 'Taken User',
          email: 'new@example.com',
          password: 'StrongPass@123',
          role: 'student',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('TC_USER_03: Error Registration (Email Taken)', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);
      mockUserModel.findOne.mockResolvedValueOnce({ _id: 'u2', email: 'taken@example.com' });

      await expect(
        service.register({
          username: 'new-user',
          fullName: 'New User',
          email: 'taken@example.com',
          password: 'StrongPass@123',
          role: 'student',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('TC_USER_04: Success Login', async () => {
      mockUserModel.findOne.mockResolvedValueOnce({
        _id: 'user-01',
        username: 'student01',
        email: 'student01@example.com',
        passwordHash: 'stored-hash',
        role: 'student',
      });
      (argon2.verify as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login({
        identifier: 'student01',
        password: 'StrongPass@123',
      });

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        $or: [{ email: 'student01' }, { username: 'student01' }],
      });
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
    });

    it('TC_USER_05: Error Login (Wrong User)', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);

      await expect(
        service.login({ identifier: 'not-exists', password: 'StrongPass@123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('TC_USER_06: Error Login (Wrong Pass)', async () => {
      mockUserModel.findOne.mockResolvedValueOnce({
        _id: 'user-01',
        username: 'student01',
        email: 'student01@example.com',
        passwordHash: 'stored-hash',
        role: 'student',
      });
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.login({ identifier: 'student01', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(argon2.verify).toHaveBeenCalledWith('stored-hash', 'WrongPassword');
    });
  });

  describe('refreshTokens', () => {
    it('TC_USER_16: Refresh Token Error (Invalid JWT)', async () => {
      mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('invalid token'));

      await expect(
        service.refreshTokens({ refreshToken: 'bad-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('TC_USER_17: Refresh Token Error (User Not Found / Missing Hash)', async () => {
      mockJwtService.verifyAsync.mockResolvedValueOnce({ sub: 'user-01' });
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.refreshTokens({ refreshToken: 'valid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('TC_USER_18: Refresh Token Error (Hash Mismatch)', async () => {
      mockJwtService.verifyAsync.mockResolvedValueOnce({ sub: 'user-01' });
      mockUserModel.findById.mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue({ _id: 'user-01', refreshTokenHash: 'stored-hash' }),
      });
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.refreshTokens({ refreshToken: 'wrong-refresh-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('TC_USER_07: Change Pwd Success', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user-01', passwordHash: 'old-hash' }),
      });
      (argon2.verify as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const result = await service.changePassword('user-01', {
        currentPassword: 'OldPassword@123',
        newPassword: 'NewPassword@123',
      });

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user-01', {
        passwordHash: 'hashed-value',
        refreshTokenHash: undefined,
      });
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('TC_USER_08: Change Pwd Error (Same Pwd)', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user-01', passwordHash: 'old-hash' }),
      });
      (argon2.verify as jest.Mock)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await expect(
        service.changePassword('user-01', {
          currentPassword: 'SamePassword@123',
          newPassword: 'SamePassword@123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('TC_USER_23: Change Pwd Error (Current Password Incorrect)', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user-01', passwordHash: 'old-hash' }),
      });
      (argon2.verify as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        service.changePassword('user-01', {
          currentPassword: 'WrongCurrent@123',
          newPassword: 'NewPassword@123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateProfile', () => {
    it('TC_USER_09: Update Profile Success', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);
      mockUserModel.findByIdAndUpdate.mockResolvedValueOnce({
        _id: 'user-01',
        username: 'student01',
        email: 'updated@example.com',
        role: 'student',
        fullName: 'Updated Name',
      });

      const result = await service.updateProfile('user-01', {
        email: 'updated@example.com',
        fullName: 'Updated Name',
      });

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-01',
        {
          email: 'updated@example.com',
          fullName: 'Updated Name',
        },
        { new: true, runValidators: true },
      );
      expect(result.message).toBe('Profile updated successfully');
    });

    it('TC_USER_24: Update Profile Error (Email Already Exists)', async () => {
      mockUserModel.findOne.mockResolvedValueOnce({ _id: 'other-user' });

      await expect(
        service.updateProfile('user-01', {
          email: 'taken@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('TC_USER_25: Update Profile Error (User Not Found)', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);
      mockUserModel.findByIdAndUpdate.mockResolvedValueOnce(null);

      await expect(
        service.updateProfile('user-01', {
          fullName: 'Updated Name',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('requestPasswordReset', () => {
    it('TC_USER_10: Forgot Pwd Success', async () => {
      mockPasswordResetTokenModel.countDocuments.mockResolvedValue(0);
      mockUserModel.findOne.mockResolvedValueOnce({
        _id: 'user-01',
        email: 'student01@example.com',
        fullName: 'Student One',
      });

      const result = await service.requestPasswordReset(
        { email: 'student01@example.com' },
        { ip: '127.0.0.1', userAgent: 'jest-agent' },
      );

      expect(mockPasswordResetTokenModel.create).toHaveBeenCalledTimes(1);
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'student01@example.com',
          fullName: 'Student One',
          expiresInMinutes: 15,
          resetUrl: expect.stringContaining('http://localhost:3000/reset-password?token='),
        }),
      );
      expect(result).toEqual({ expiresInMinutes: 15 });
    });

    it('TC_USER_19: Forgot Pwd Error (Rate Limit Exceeded)', async () => {
      mockPasswordResetTokenModel.countDocuments
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0);

      await expect(
        service.requestPasswordReset(
          { email: 'student01@example.com' },
          { ip: '127.0.0.1', userAgent: 'jest-agent' },
        ),
      ).rejects.toMatchObject({ status: 429 });
      expect(mockPasswordResetTokenModel.create).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('TC_USER_11: Reset Pwd Success', async () => {
      const rawToken = 'valid-token';
      const hashedToken = createHash('sha256').update(rawToken).digest('hex');

      mockPasswordResetTokenModel.findOne.mockResolvedValueOnce({
        _id: 'reset-token-01',
        userId: 'user-01',
        email: 'student01@example.com',
      });
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user-01', passwordHash: 'old-hash' }),
      });

      await service.resetPassword({
        token: rawToken,
        password: 'NewPassword@123',
        confirmPassword: 'NewPassword@123',
      });

      expect(mockPasswordResetTokenModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenHash: hashedToken,
        }),
      );
      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user-01', {
        passwordHash: 'hashed-value',
        refreshTokenHash: undefined,
      });
      expect(mockPasswordResetTokenModel.updateOne).toHaveBeenCalledWith(
        { _id: 'reset-token-01' },
        expect.objectContaining({ usedAt: expect.any(Date) }),
      );
    });

    it('TC_USER_20: Reset Pwd Error (Password Confirmation Mismatch)', async () => {
      await expect(
        service.resetPassword({
          token: 'valid-token',
          password: 'NewPassword@123',
          confirmPassword: 'NotMatch@123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('TC_USER_21: Reset Pwd Error (Token Invalid/Expired)', async () => {
      mockPasswordResetTokenModel.findOne.mockResolvedValueOnce(null);

      await expect(
        service.resetPassword({
          token: 'expired-token',
          password: 'NewPassword@123',
          confirmPassword: 'NewPassword@123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('TC_USER_22: Reset Pwd Error (Linked User Not Found)', async () => {
      mockPasswordResetTokenModel.findOne.mockResolvedValueOnce({
        _id: 'reset-token-02',
        userId: 'missing-user',
        email: 'student01@example.com',
      });
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.resetPassword({
          token: 'valid-token',
          password: 'NewPassword@123',
          confirmPassword: 'NewPassword@123',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateProfileImage', () => {
    it('TC_USER_12: Validation Image Success', async () => {
      mockHttpService.post.mockReturnValue(
        of({
          data: {
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({ isValid: true, reason: 'Good image' }),
                    },
                  ],
                },
              },
            ],
          },
        }),
      );

      const result = await service.validateProfileImage('data:image/jpeg;base64,abc123');

      expect(result).toEqual({
        success: true,
        message: 'Image is valid.',
      });
      expect(mockHttpService.post).toHaveBeenCalledTimes(1);
    });

    it('TC_USER_13: Validation Image Failed', async () => {
      mockHttpService.post.mockReturnValue(
        of({
          data: {
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({ isValid: false, reason: 'No face detected' }),
                    },
                  ],
                },
              },
            ],
          },
        }),
      );

      await expect(
        service.validateProfileImage('data:image/jpeg;base64,abc123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('TC_USER_30: Validation Image Error (Invalid Base64 Data URL)', async () => {
      await expect(service.validateProfileImage('invalid-image')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('TC_USER_31: Validation Image Error (Missing Gemini API Key)', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEY') return undefined;
        if (key === 'app.passwordReset') return undefined;
        return null;
      });

      await expect(
        service.validateProfileImage('data:image/jpeg;base64,abc123'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('verifyFace', () => {
    it('TC_USER_14: Verify Face Success', async () => {
      mockHttpService.get.mockReturnValue(
        of({
          headers: { 'content-type': 'image/jpeg' },
          data: new ArrayBuffer(8),
        }),
      );
      mockHttpService.post.mockReturnValue(
        of({
          data: {
            candidates: [{ content: { parts: [{ text: 'true' }] } }],
          },
        }),
      );

      const result = await service.verifyFace(
        {
          id: 'user-01',
          username: 'student01',
          email: 'student01@example.com',
          role: 'student',
          imageUrl: 'https://example.com/profile.jpg',
        },
        { webcamImage: 'data:image/jpeg;base64,live-image' },
      );

      expect(result).toEqual({
        success: true,
        message: 'Face verified successfully.',
      });
      expect(mockHttpService.get).toHaveBeenCalledTimes(1);
      expect(mockHttpService.post).toHaveBeenCalledTimes(1);
    });

    it('TC_USER_15: Verify Face Failed', async () => {
      mockHttpService.get.mockReturnValue(
        of({
          headers: { 'content-type': 'image/jpeg' },
          data: new ArrayBuffer(8),
        }),
      );
      mockHttpService.post.mockReturnValue(
        of({
          data: {
            candidates: [{ content: { parts: [{ text: 'false' }] } }],
          },
        }),
      );

      const result = await service.verifyFace(
        {
          id: 'user-01',
          username: 'student01',
          email: 'student01@example.com',
          role: 'student',
          imageUrl: 'https://example.com/profile.jpg',
        },
        { webcamImage: 'data:image/jpeg;base64,live-image' },
      );

      expect(result).toEqual({
        success: false,
        message: 'Face does not match profile. Verification failed.',
      });
    });

    it('TC_USER_26: Verify Face Error (Profile Image Missing)', async () => {
      await expect(
        service.verifyFace(
          {
            id: 'user-01',
            username: 'student01',
            email: 'student01@example.com',
            role: 'student',
          },
          { webcamImage: 'data:image/jpeg;base64,live-image' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('TC_USER_27: Verify Face Error (Webcam Image Format Invalid)', async () => {
      await expect(
        service.verifyFace(
          {
            id: 'user-01',
            username: 'student01',
            email: 'student01@example.com',
            role: 'student',
            imageUrl: 'https://example.com/profile.jpg',
          },
          { webcamImage: '' },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('TC_USER_28: Verify Face Error (Cannot Fetch Profile Image)', async () => {
      mockHttpService.get.mockImplementation(() => {
        throw new Error('fetch failed');
      });

      await expect(
        service.verifyFace(
          {
            id: 'user-01',
            username: 'student01',
            email: 'student01@example.com',
            role: 'student',
            imageUrl: 'https://example.com/profile.jpg',
          },
          { webcamImage: 'data:image/jpeg;base64,live-image' },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('TC_USER_29: Verify Face Error (Gemini API Forbidden 403)', async () => {
      mockHttpService.get.mockReturnValue(
        of({
          headers: { 'content-type': 'image/jpeg' },
          data: new ArrayBuffer(8),
        }),
      );
      mockHttpService.post.mockImplementation(() => {
        const err = Object.assign(new Error('forbidden'), {
          response: { status: 403 },
        });
        throw err;
      });

      await expect(
        service.verifyFace(
          {
            id: 'user-01',
            username: 'student01',
            email: 'student01@example.com',
            role: 'student',
            imageUrl: 'https://example.com/profile.jpg',
          },
          { webcamImage: 'data:image/jpeg;base64,live-image' },
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('TC_USER_32: Verify Face Error (Malformed Non-Base64 Webcam Payload)', async () => {
      await expect(
        service.verifyFace(
          {
            id: 'user-01',
            username: 'student01',
            email: 'student01@example.com',
            role: 'student',
            imageUrl: 'https://example.com/profile.jpg',
          },
          { webcamImage: 'plain-text-not-data-url' },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

});
