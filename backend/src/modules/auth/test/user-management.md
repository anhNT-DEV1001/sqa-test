# Unit Testing Plan: User Management Module (Updated)

Tài liệu này tổng hợp các unit test hiện có cho User Management trong `auth` module, bao gồm cả các **happy paths** và **failed/error paths**.

## 1.1 Tools and Libraries
- **Test Runner**: `Jest`
- **Mocking**: `jest.fn()`, `jest.spyOn()`
- **DB isolation**: Mock Model (`userModel`, `passwordResetTokenModel`)
- **External services**: Mock `HttpService`, `MailService`, `JwtService`

## 1.2 Scope
**In-Scope**
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/auth.controller.ts`

**Out-of-Scope**
- Real MongoDB, real Gemini API calls, internal implementation của Mail/JWT service.

## 1.3 User Cases Đang Test

### A. AuthService (`auth.service.spec.ts`)

| Test Case ID | User Case | Type | Expected |
| :--- | :--- | :--- | :--- |
| `TC_USER_01` | Đăng ký thành công | Success | Trả user + tokens, lưu DB |
| `TC_USER_02` | Đăng ký trùng username | Failed | `ConflictException` |
| `TC_USER_03` | Đăng ký trùng email | Failed | `ConflictException` |
| `TC_USER_04` | Đăng nhập thành công | Success | Trả user + tokens |
| `TC_USER_05` | Đăng nhập sai user | Failed | `UnauthorizedException` |
| `TC_USER_06` | Đăng nhập sai mật khẩu | Failed | `UnauthorizedException` |
| `TC_USER_07` | Đổi mật khẩu thành công | Success | Cập nhật hash + clear refresh token |
| `TC_USER_08` | Đổi mật khẩu mới trùng cũ | Failed | `ConflictException` |
| `TC_USER_09` | Cập nhật profile thành công | Success | Trả profile đã update |
| `TC_USER_10` | Quên mật khẩu thành công | Success | Tạo reset token + gửi mail |
| `TC_USER_11` | Reset mật khẩu thành công | Success | Đổi password + mark token used |
| `TC_USER_12` | Validate ảnh profile hợp lệ | Success | `success: true` |
| `TC_USER_13` | Validate ảnh profile không hợp lệ | Failed | `BadRequestException` |
| `TC_USER_14` | Verify face thành công | Success | `success: true` |
| `TC_USER_15` | Verify face thất bại (không khớp) | Failed | `success: false` |
| `TC_USER_16` | Refresh token: JWT không hợp lệ | Failed | `UnauthorizedException` |
| `TC_USER_17` | Refresh token: user/hash không tồn tại | Failed | `UnauthorizedException` |
| `TC_USER_18` | Refresh token: hash không match | Failed | `UnauthorizedException` |
| `TC_USER_19` | Quên mật khẩu vượt rate limit | Failed | HTTP `429` |
| `TC_USER_20` | Reset mật khẩu: confirm không khớp | Failed | `BadRequestException` |
| `TC_USER_21` | Reset mật khẩu: token hết hạn/sai | Failed | `UnauthorizedException` |
| `TC_USER_22` | Reset mật khẩu: user liên kết không tồn tại | Failed | `NotFoundException` |
| `TC_USER_23` | Đổi mật khẩu: current password sai | Failed | `UnauthorizedException` |
| `TC_USER_24` | Update profile: email đã tồn tại | Failed | `ConflictException` |
| `TC_USER_25` | Update profile: user không tồn tại | Failed | `UnauthorizedException` |
| `TC_USER_26` | Verify face: chưa có ảnh profile | Failed | `BadRequestException` |
| `TC_USER_27` | Verify face: webcam image sai format | Failed | `BadRequestException` |
| `TC_USER_28` | Verify face: lỗi tải ảnh profile | Failed | `InternalServerErrorException` |
| `TC_USER_29` | Verify face: Gemini trả 403 | Failed | `InternalServerErrorException` |
| `TC_USER_30` | Validate ảnh: input không phải data URL | Failed | `BadRequestException` |
| `TC_USER_31` | Validate ảnh: thiếu `GEMINI_API_KEY` | Failed | `InternalServerErrorException` |
| `TC_USER_32` | Verify face: webcam payload sai chuẩn (không phải data URL) | Failed | **Kỳ vọng:** `BadRequestException`; **Thực tế:** `InternalServerErrorException` |

### B. AuthController (`auth.controller.spec.ts`)
Các user cases đang test ở mức controller mapping/response contract:
- Register
- Forgot password
- Login
- Refresh token
- Reset password
- Get profile
- Change password
- Update profile
- Verify face
- Validate profile image

## 1.4 Failed/Error Cases Đã Quét Và Bổ Sung
Các nhánh lỗi mới đã thêm để tăng độ phủ rủi ro:
- Refresh token lỗi (`TC_USER_16` → `TC_USER_18`)
- Forgot password rate limit (`TC_USER_19`)
- Reset password lỗi (`TC_USER_20` → `TC_USER_22`)
- Change password/update profile lỗi (`TC_USER_23` → `TC_USER_25`)
- Face verification lỗi (`TC_USER_26` → `TC_USER_29`)
- Profile image validation lỗi (`TC_USER_30`, `TC_USER_31`)

## 1.5 Execution Report (Latest)
Lệnh chạy:
```bash
npm test -- src/modules/auth/test/auth.service.spec.ts src/modules/auth/test/auth.controller.spec.ts
```

Kết quả:
- **Total Test Suites:** 2
- **Passed Suites:** 1
- **Failed Suites:** 1
- **Total Tests:** 42
- **Passed Tests:** 41
- **Failed Tests:** 1
- **Known failed case:** `TC_USER_32`

## 1.6 References
- `.github/prompts/unit-test.prompt.md`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/test/auth.service.spec.ts`
- `src/modules/auth/test/auth.controller.spec.ts`
