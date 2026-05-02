import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  // Mock AuthService để kiểm tra controller có forward request đúng
  // và chuẩn hóa response như contract hay không.
  const mockAuthService = {
    register: jest.fn(),
    requestPasswordReset: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    resetPassword: jest.fn(),
    getProfile: jest.fn(),
    changePassword: jest.fn(),
    updateProfile: jest.fn(),
    verifyFace: jest.fn(),
    validateProfileImage: jest.fn(),
  };

  beforeEach(async () => {
    // Unit test controller không thao tác DB thật nên không cần rollback transaction.
    // Việc reset mock ở mỗi test đóng vai trò cô lập dữ liệu và side effect giữa các case.
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // ===== CONTROLLER: PUBLIC AUTH ENDPOINTS =====
  describe('public endpoints', () => {
    // TC_CTRL_01: Kiểm tra register forward đúng DTO và trả về response chuẩn hóa.
    it('register: should call service and return standardized success response', async () => {
      const dto = {
        username: 'student01',
        fullName: 'Student One',
        email: 'student01@example.com',
        password: 'StrongPass@123',
        role: 'student' as const,
      };

      mockAuthService.register.mockResolvedValueOnce(undefined);

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('User registered successfully');
    });

    // TC_CTRL_02: Kiểm tra forgot-password forward context request đúng cho service.
    it('requestPasswordReset: should forward request context and return success message', async () => {
      const dto = { email: 'student01@example.com' };
      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'jest' },
      } as any;

      mockAuthService.requestPasswordReset.mockResolvedValueOnce({
        expiresInMinutes: 15,
      });

      const result = await controller.requestPasswordReset(dto, req);

      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(dto, {
        ip: '127.0.0.1',
        userAgent: 'jest',
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain('If an account exists');
    });

    // TC_CTRL_03: Kiểm tra login nhận token từ service và đóng gói theo response helper.
    it('login: should return tokens from authService', async () => {
      const dto = { identifier: 'student01', password: 'StrongPass@123' };
      const authResult = {
        user: { id: 'user-01' },
        accessToken: 'access',
        refreshToken: 'refresh',
      };

      mockAuthService.login.mockResolvedValueOnce(authResult);

      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(authResult);
      expect(result.message).toBe('Login successful');
    });

    // TC_CTRL_04: Kiểm tra refresh token forward đúng DTO và trả về token mới.
    it('refreshTokens: should call service and return formatted response', async () => {
      const dto = { refreshToken: 'refresh' };
      const tokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };

      mockAuthService.refreshTokens.mockResolvedValueOnce(tokens);

      const result = await controller.refreshTokens(dto);

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(tokens);
      expect(result.message).toBe('Tokens refreshed successfully');
    });

    // TC_CTRL_05: Kiểm tra reset-password gọi đúng service và trả message thành công.
    it('resetPassword: should call service and return success message', async () => {
      const dto = {
        token: 'token',
        password: 'NewPassword@123',
        confirmPassword: 'NewPassword@123',
      };

      mockAuthService.resetPassword.mockResolvedValueOnce(undefined);

      const result = await controller.resetPassword(dto);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password updated successfully.');
    });
  });

  // ===== CONTROLLER: AUTHENTICATED PROFILE ENDPOINTS =====
  describe('authenticated profile endpoints', () => {
    // TC_CTRL_06: Kiểm tra getProfile lấy đúng user id từ decorator CurrentUser.
    it('getProfile: should call service with current user id', async () => {
      const user = { id: 'user-01' } as any;
      const profile = { user: { id: 'user-01', email: 'student01@example.com' } };

      mockAuthService.getProfile.mockResolvedValueOnce(profile);

      const result = await controller.getProfile(user);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith('user-01');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(profile);
      expect(result.message).toBe('Profile retrieved successfully');
    });

    // TC_CTRL_07: Kiểm tra change-password forward đúng user id và DTO.
    it('changePassword: should call service and return standardized response', async () => {
      const user = { id: 'user-01' } as any;
      const dto = {
        currentPassword: 'OldPassword@123',
        newPassword: 'NewPassword@123',
      };

      mockAuthService.changePassword.mockResolvedValueOnce({
        message: 'Password changed successfully',
      });

      const result = await controller.changePassword(user, dto);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith('user-01', dto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password changed successfully');
    });

    // TC_CTRL_08: Kiểm tra update-profile forward đúng user id và payload cập nhật.
    it('updateProfile: should call service and return standardized response', async () => {
      const user = { id: 'user-01' } as any;
      const dto = { fullName: 'Updated Name', email: 'updated@example.com' };

      mockAuthService.updateProfile.mockResolvedValueOnce({
        user: { id: 'user-01', fullName: 'Updated Name' },
        message: 'Profile updated successfully',
      });

      const result = await controller.updateProfile(user, dto);

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith('user-01', dto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Profile updated successfully');
    });
  });

  // ===== CONTROLLER: FACE VALIDATION ENDPOINTS =====
  describe('face validation endpoints', () => {
    // TC_CTRL_09: Kiểm tra verify-face trả thẳng kết quả từ service.
    it('verifyFace: should directly return authService result', async () => {
      const user = { id: 'user-01' } as any;
      const dto = { webcamImage: 'data:image/jpeg;base64,abc123' };

      mockAuthService.verifyFace.mockResolvedValueOnce({
        success: true,
        message: 'Face verified successfully.',
      });

      const result = await controller.verifyFace(user, dto);

      expect(mockAuthService.verifyFace).toHaveBeenCalledWith(user, dto);
      expect(result).toEqual({
        success: true,
        message: 'Face verified successfully.',
      });
    });

    // TC_CTRL_10: Kiểm tra validate-profile-image chỉ truyền field imageBase64 cho service.
    it('validateProfileImage: should pass imageBase64 to service', async () => {
      const dto = { imageBase64: 'data:image/jpeg;base64,abc123' };

      mockAuthService.validateProfileImage.mockResolvedValueOnce({
        success: true,
        message: 'Image is valid.',
      });

      const result = await controller.validateProfileImage(dto);

      expect(mockAuthService.validateProfileImage).toHaveBeenCalledWith(
        dto.imageBase64,
      );
      expect(result).toEqual({
        success: true,
        message: 'Image is valid.',
      });
    });
  });
});
