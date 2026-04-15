import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    getProfile: jest.fn(),
    changePassword: jest.fn(),
    updateProfile: jest.fn(),
    verifyFace: jest.fn(),
    validateProfileImage: jest.fn(),
  };

  beforeEach(async () => {
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
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return success', async () => {
      mockAuthService.register.mockResolvedValueOnce({ user: { id: '1' } });
      const dto = { username: 'test', password: 'pw', email: 't@t.com', fullName: 'name', role: 'student' as const };
      
      const result = await controller.register(dto);
      
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
      expect(result.message).toBe('User registered successfully');
    });
  });

  describe('login', () => {
    it('should call authService.login and return data', async () => {
      const mockResult = { user: { id: '1' }, accessToken: 'token' };
      mockAuthService.login.mockResolvedValueOnce(mockResult);
      const dto = { identifier: 'test', password: 'pw' };
      
      const result = await controller.login(dto);
      
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });
  });

  describe('requestPasswordReset', () => {
    it('should call authService.requestPasswordReset with context', async () => {
      mockAuthService.requestPasswordReset.mockResolvedValueOnce({ expiresInMinutes: 15 });
      const dto = { email: 't@t.com' };
      const req = { ip: '127.0.0.1', headers: { 'user-agent': 'jest' } } as any;
      
      const result = await controller.requestPasswordReset(dto, req);
      
      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith(dto, {
        ip: '127.0.0.1',
        userAgent: 'jest'
      });
      expect(result.data).toEqual({ expiresInMinutes: 15 });
    });
  });

  describe('getProfile', () => {
    it('should return profile for current user', async () => {
      const mockUser = { id: 'uid', email: 't@t.com' };
      mockAuthService.getProfile.mockResolvedValueOnce({ user: mockUser });
      
      const result = await controller.getProfile(mockUser as any);
      
      expect(mockAuthService.getProfile).toHaveBeenCalledWith('uid');
      expect(result.data).toEqual({ user: mockUser });
    });
  });
  
  describe('verifyFace', () => {
    it('should call authService.verifyFace', async () => {
      const mockUser = { id: 'uid' };
      const dto = { webcamImage: 'data' };
      mockAuthService.verifyFace.mockResolvedValueOnce({ success: true });
      
      const result = await controller.verifyFace(mockUser as any, dto);
      
      expect(mockAuthService.verifyFace).toHaveBeenCalledWith(mockUser, dto);
      expect(result).toEqual({ success: true });
    });
  });

  describe('validateProfileImage', () => {
    it('should call authService.validateProfileImage', async () => {
      const dto = { imageBase64: 'data:image/jpeg;base64,data' };
      mockAuthService.validateProfileImage.mockResolvedValueOnce({ success: true });
      
      const result = await controller.validateProfileImage(dto);
      
      expect(mockAuthService.validateProfileImage).toHaveBeenCalledWith(dto.imageBase64);
      expect(result.success).toBe(true);
    });
  });

  describe('refreshTokens', () => {
    it('should call authService.refreshTokens and return tokens', async () => {
      const mockResult = { accessToken: 'new-token', refreshToken: 'new-refresh' };
      mockAuthService.refreshTokens.mockResolvedValueOnce(mockResult);
      const dto = { refreshToken: 'old-refresh' };
      
      const result = await controller.refreshTokens(dto);
      
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword and return success', async () => {
      mockAuthService.resetPassword.mockResolvedValueOnce(undefined);
      const dto = { token: 't', password: 'pw', confirmPassword: 'pw' };
      
      const result = await controller.resetPassword(dto);
      
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
      expect(result.success).toBe(true);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword and return success', async () => {
      const mockResult = { message: 'changed' };
      mockAuthService.changePassword.mockResolvedValueOnce(mockResult);
      const dto = { currentPassword: 'old', newPassword: 'new' };
      const user = { id: 'user-id' } as any;
      
      const result = await controller.changePassword(user, dto);
      
      expect(mockAuthService.changePassword).toHaveBeenCalledWith('user-id', dto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });
  });

  describe('updateProfile', () => {
    it('should call authService.updateProfile and return updated profile', async () => {
      const mockResult = { user: { id: 'user-id' }, message: 'updated' };
      mockAuthService.updateProfile.mockResolvedValueOnce(mockResult);
      const dto = { fullName: 'new name' };
      const user = { id: 'user-id' } as any;
      
      const result = await controller.updateProfile(user, dto);
      
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith('user-id', dto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });
  });
});

