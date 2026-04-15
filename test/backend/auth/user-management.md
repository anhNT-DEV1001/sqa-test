# Unit Testing Plan: User Management Module (Part 1)

This document serves as the **Deliverable 1: Unit Testing Report** for the User Management functionality within the `auth` module of the Academix backend, following the constraints and requirements specified in `.github/prompts/unit-test.prompt.md`.

## 1.1 Tools and Libraries
Based on the backend environment (NestJS), the following stack is proposed for testing:
- **Test Runner & Assertion**: `Jest`
- **Mocking**: `jest.fn()`, `jest.spyOn()` built into Jest. 
- **Database Testing**: We will use a Mock Repository pattern to simulate MongoDB operations (`userModel`, `passwordResetTokenModel`) to keep the unit tests fast, deterministic, and isolated.
- **External Services**: We will mock `HttpService` (Axios) for Gemini AI calls and `MailService` for email sending.

## 1.2 Scope of Testing
**In-Scope:**
- `src/modules/auth/auth.service.ts`: Core business logic for registration, login, token refresh, password resets, profile updates, and facial verification using AI.
- `src/modules/auth/auth.controller.ts`: API endpoint definitions and HTTP status/response formatting.

**Out-of-Scope:**
- Real MongoDB connections: *Reason: We are doing Unit Testing; interacting with a real DB makes it an Integration Test. We will mock the DB interactions or use an in-memory mock repository.*
- Real Gemini API calls in `validateProfileImage` and `verifyFace`: *Reason: Tested by Google. Calling live APIs costs credits and reduces test speed/determinism.*
- Original `Face-api.js` library: *Reason: Mentioned in the prompt as out-of-scope.*
- Internal implementations of `MailService`, `JwtService`: *Reason: We assume they work and mock them in the context of testing `AuthService`.*

## 1.3 Test Cases (Table Format)

### File: `auth.service.ts` (AuthService)

| Test Case ID | Test Objective | Input | Expected Output | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `TC_USER_01` | Success Registration | valid `RegisterDto` | Returns user info + tokens, DB `save()` called. | CheckDB: Verify `userModel.save` is invoked. |
| `TC_USER_02` | Error Registration (Username Taken) | `RegisterDto` with existing username | Throws `ConflictException` | |
| `TC_USER_03` | Error Registration (Email Taken) | `RegisterDto` with existing email | Throws `ConflictException` | |
| `TC_USER_04` | Success Login | valid `LoginDto` (identifier, password) | Returns user info + tokens | CheckDB: Verify `userModel.findOne` called. |
| `TC_USER_05` | Error Login (Wrong User) | `LoginDto` with non-existing user | Throws `UnauthorizedException` | |
| `TC_USER_06` | Error Login (Wrong Pass) | `LoginDto` with invalid password | Throws `UnauthorizedException` | CheckDB: Assert password hash checked. |
| `TC_USER_07` | Change Pwd Success | `userId`, valid `ChangePasswordDto` | Returns `message: 'Password changed...'` | CheckDB: Verify `userModel.findByIdAndUpdate` |
| `TC_USER_08` | Change Pwd Error (Same Pwd) | `newPassword` matches `currentPassword` | Throws `ConflictException` | |
| `TC_USER_09` | Update Profile Success | `userId`, valid `UpdateProfileDto` | Returns updated profile | CheckDB: `userModel.findByIdAndUpdate` correctly modified state |
| `TC_USER_10` | Forgot Pwd Success | valid `ForgotPasswordDto` | Returns `expiresInMinutes` | CheckDB: Verify `passwordResetTokenModel.create` is called and `MailService.sendPasswordResetEmail` is triggered. |
| `TC_USER_11` | Reset Pwd Success | valid `ResetPasswordDto` with correct token | State updated, no errors | CheckDB: Verify tokens used (updated), pwd changed. |
| `TC_USER_12` | Validation Image Success | Base64 Image matching human face | Returns `success: true` | Mock Gemini API to return `isValid: true` |
| `TC_USER_13` | Validation Image Failed | Blurry Base64 Image | Throws `BadRequestException` | Mock Gemini API to return `isValid: false` |
| `TC_USER_14` | Verify Face Success | valid `VerifyFaceDto`, user has valid profile | Returns `success: true` | Mock Gemini API to return decision `true` |
| `TC_USER_15` | Verify Face Failed | Face mismatch | Returns `success: false` | Mock Gemini API to return decision `false` |

*(Note: We will extract similar tests for `auth.controller.spec.ts` to ensure routing, parameter parsing, and response structures map correctly without deeply re-testing all logic).*

## 1.4 Project Link
[https://github.com/CwtchMH/Academix.git]

## 1.5 Execution Report
*To be filled after test execution via `npm run test`.*
- **Total Tests:** 24
- **Pass:** 24
- **Fail:** 0

## 1.6 Code Coverage Report
*To be filled after test execution via `npm run test:cov`.*
- **Statements:** 66.24%
- **Branches:** 53.52%
- **Functions:** 68.42%
- **Lines:** 66.33%

## 1.7 References
- `.github/prompts/unit-test.prompt.md`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/auth.controller.ts`

---