# Unit Test Report - Auth Module

| Test case ID | File name | Method name | Purpose | Input | Expected output | Test Result | Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TC_USER_01 | auth.service.spec.ts | register | Success registration | Valid `RegisterDto` | Return user + access/refresh tokens, save user | PASS | Core happy path |
| TC_USER_02 | auth.service.spec.ts | register | Reject duplicate username | Existing username in `RegisterDto` | Throw `ConflictException` | PASS | Error path |
| TC_USER_03 | auth.service.spec.ts | register | Reject duplicate email | Existing email in `RegisterDto` | Throw `ConflictException` | PASS | Error path |
| TC_USER_04 | auth.service.spec.ts | login | Success login | Valid `LoginDto` | Return user + tokens | PASS | Core happy path |
| TC_USER_05 | auth.service.spec.ts | login | Reject unknown user | Non-existing identifier | Throw `UnauthorizedException` | PASS | Error path |
| TC_USER_06 | auth.service.spec.ts | login | Reject wrong password | Valid identifier + wrong password | Throw `UnauthorizedException` | PASS | Error path |
| TC_USER_07 | auth.service.spec.ts | changePassword | Change password success | Valid `userId`, `currentPassword`, `newPassword` | Update hash + clear refresh token | PASS | Security flow |
| TC_USER_08 | auth.service.spec.ts | changePassword | Reject same new password | `newPassword` equals current one | Throw `ConflictException` | PASS | Error path |
| TC_USER_09 | auth.service.spec.ts | updateProfile | Update profile success | Valid `UpdateProfileDto` | Return updated profile + message | PASS | Core happy path |
| TC_USER_10 | auth.service.spec.ts | requestPasswordReset | Forgot password success | Valid email + request context | Create reset token + send email | PASS | Core happy path |
| TC_USER_11 | auth.service.spec.ts | resetPassword | Reset password success | Valid token + matching passwords | Password updated, token marked used | PASS | Security flow |
| TC_USER_12 | auth.service.spec.ts | validateProfileImage | Validate profile image success | Valid base64 image | Return `{ success: true }` | PASS | AI validation path |
| TC_USER_13 | auth.service.spec.ts | validateProfileImage | Reject invalid profile image | Base64 image judged invalid | Throw `BadRequestException` | PASS | AI validation fail |
| TC_USER_14 | auth.service.spec.ts | verifyFace | Face verification success | Valid profile image + webcam image | Return `{ success: true }` | PASS | AI verification path |
| TC_USER_15 | auth.service.spec.ts | verifyFace | Face verification mismatch | Valid images but not same person | Return `{ success: false }` | PASS | Business fail response |
| TC_USER_16 | auth.service.spec.ts | refreshTokens | Reject invalid refresh JWT | Invalid refresh token | Throw `UnauthorizedException` | PASS | Error path |
| TC_USER_17 | auth.service.spec.ts | refreshTokens | Reject missing user/hash | Valid JWT payload but user/hash missing | Throw `UnauthorizedException` | PASS | Error path |
| TC_USER_18 | auth.service.spec.ts | refreshTokens | Reject refresh hash mismatch | Stored hash not matching token | Throw `UnauthorizedException` | PASS | Error path |
| TC_USER_19 | auth.service.spec.ts | requestPasswordReset | Rate limit forgot password | Exceeded requests/hour | Throw HTTP `429` | PASS | Abuse protection |
| TC_USER_20 | auth.service.spec.ts | resetPassword | Reject confirm mismatch | `password` != `confirmPassword` | Throw `BadRequestException` | PASS | Validation error |
| TC_USER_21 | auth.service.spec.ts | resetPassword | Reject invalid/expired token | Expired or unknown token | Throw `UnauthorizedException` | PASS | Error path |
| TC_USER_22 | auth.service.spec.ts | resetPassword | Reject missing linked user | Token found but user deleted | Throw `NotFoundException` | PASS | Data integrity error |
| TC_USER_23 | auth.service.spec.ts | changePassword | Reject wrong current password | Incorrect `currentPassword` | Throw `UnauthorizedException` | PASS | Security check |
| TC_USER_24 | auth.service.spec.ts | updateProfile | Reject duplicate email update | Email belongs to another user | Throw `ConflictException` | PASS | Error path |
| TC_USER_25 | auth.service.spec.ts | updateProfile | Reject update when user missing | `findByIdAndUpdate` returns null | Throw `UnauthorizedException` | PASS | Error path |
| TC_USER_26 | auth.service.spec.ts | verifyFace | Reject when profile image missing | User has no `imageUrl` | Throw `BadRequestException` | PASS | Validation error |
| TC_USER_27 | auth.service.spec.ts | verifyFace | Reject invalid webcam format | Empty/invalid webcam image string | Throw `BadRequestException` | PASS | Validation error |
| TC_USER_28 | auth.service.spec.ts | verifyFace | Handle profile image fetch failure | HTTP GET profile image fails | Throw `InternalServerErrorException` | PASS | Integration boundary error |
| TC_USER_29 | auth.service.spec.ts | verifyFace | Handle Gemini forbidden | Gemini returns status 403 | Throw `InternalServerErrorException` | PASS | API error handling |
| TC_USER_30 | auth.service.spec.ts | validateProfileImage | Reject non-data-url image | Invalid image string format | Throw `BadRequestException` | PASS | Validation error |
| TC_USER_31 | auth.service.spec.ts | validateProfileImage | Handle missing Gemini config | `GEMINI_API_KEY` missing | Throw `InternalServerErrorException` | PASS | Config error handling |
| TC_USER_32 | auth.service.spec.ts | verifyFace | Reject malformed webcam payload (non-data-url) | `webcamImage='plain-text-not-data-url'` | Throw `BadRequestException` | FAILED | Actual result is `InternalServerErrorException` because flow continues to profile image fetch |
| TC_CTRL_01 | auth.controller.spec.ts | register | Controller maps register request | Valid `RegisterDto` | Call service + success response message | PASS | Controller contract |
| TC_CTRL_02 | auth.controller.spec.ts | requestPasswordReset | Controller forwards request context | `ForgotPasswordDto` + request metadata | Call service with `{ip,userAgent}` + success response | PASS | Controller contract |
| TC_CTRL_03 | auth.controller.spec.ts | login | Controller maps login | Valid `LoginDto` | Return standardized success response with token data | PASS | Controller contract |
| TC_CTRL_04 | auth.controller.spec.ts | refreshTokens | Controller maps refresh token | Valid `RefreshTokenDto` | Return standardized success response | PASS | Controller contract |
| TC_CTRL_05 | auth.controller.spec.ts | resetPassword | Controller maps reset password | Valid `ResetPasswordDto` | Call service + success message | PASS | Controller contract |
| TC_CTRL_06 | auth.controller.spec.ts | getProfile | Controller gets profile by current user | `CurrentUser.id` | Call service with user id + success response | PASS | Controller contract |
| TC_CTRL_07 | auth.controller.spec.ts | changePassword | Controller maps change password | `CurrentUser.id` + `ChangePasswordDto` | Call service + success response | PASS | Controller contract |
| TC_CTRL_08 | auth.controller.spec.ts | updateProfile | Controller maps profile update | `CurrentUser.id` + `UpdateProfileDto` | Call service + success response | PASS | Controller contract |
| TC_CTRL_09 | auth.controller.spec.ts | verifyFace | Controller forwards face verify request | `CurrentUser` + `VerifyFaceDto` | Return direct service result | PASS | Controller contract |
| TC_CTRL_10 | auth.controller.spec.ts | validateProfileImage | Controller forwards validate image request | `ValidateImageDto.imageBase64` | Return direct service result | PASS | Controller contract |

## Summary
- Total test cases in report: **42**
- Service cases: **32**
- Controller cases: **10**
- Latest execution result: **FAILED 41/42 tests**

## Nhưng file đã test

| # | File | Module | Description |
| :--- | :--- | :--- | :--- |
| 1 | `backend/src/modules/auth/auth.service.ts` | `auth` | Đã test business logic qua `auth.service.spec.ts` (register/login/refresh/reset/change/update/verify image-face). |
| 2 | `backend/src/modules/auth/auth.controller.ts` | `auth` | Đã test mapping endpoint -> service và response contract qua `auth.controller.spec.ts`. |

## Nhưng file không test

| # | File | Module | Description |
| :--- | :--- | :--- | :--- |
| 1 | `backend/src/modules/auth/auth.module.ts` | `auth` | Chưa có test cho wiring module/providers/imports. |
| 2 | `backend/src/modules/auth/dto/auth.dto.ts` | `auth` | Chưa có test DTO validation với `class-validator` theo từng input invalid. |
| 3 | `backend/src/modules/auth/strategies/jwt.strategy.ts` | `auth` | Chưa có test strategy validate payload và config secret. |
| 4 | `backend/src/modules/auth/mail.service.ts` | `auth` | Chưa có test gửi mail/template/error handling (đang chỉ mock trong service test). |
