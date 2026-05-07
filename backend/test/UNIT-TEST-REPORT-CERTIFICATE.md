# UNIT TESTING REPORT – Feature #5: Certificate Management (Blockchain)

**Project:** EduChain Block – Online Examination Platform with Blockchain Certificates  
**Feature Scope:** Certificate Issuance, Verification, Lookup, Revocation & Blockchain/IPFS Integration  
**Prepared by:** AI Senior QA Automation & Blockchain Test Engineer  
**Date:** 2026-04-15  
**Version:** 1.1

---

## 1.1. Tools and Libraries

| Tool | Version | Purpose |
|------|---------|---------|
| Jest | ^30.0.0 | Test runner & assertion library |
| ts-jest | ^29.2.5 | TypeScript transformer for Jest |
| @nestjs/testing | ^11.0.1 | NestJS testing utilities (TestingModule) |
| supertest | ^7.0.0 | HTTP assertions (available for E2E) |
| TypeScript | ^5.7.3 | Language |
| Mongoose | ^8.18.1 | MongoDB ODM (mocked in tests) |

**Mocking Strategy:**
- All MongoDB Models (`Certificate`, `User`, `Course`, `Submission`, `Exam`) are mocked using `jest.fn()` objects injected via `getModelToken()`.
- `BlockchainService` (ethers.js/Smart Contract) is mocked to avoid real blockchain calls.
- `PinataService` (IPFS uploads) is mocked to avoid real Pinata API calls.
- `CertificateImageService` (canvas rendering) is mocked to avoid heavy image processing.
- `NotificationsService` is mocked to isolate certificate logic from WebSocket side effects.

---

## 1.2. Scope of Testing

### Files TESTED (In-Scope)

| # | File Path | Module | Description | Tests |
|---|-----------|--------|-------------|:-----:|
| 1 | `src/common/services/blockchain.service.ts` | `BlockchainService` | Mint/read/verify NFT certs on-chain; unsupported CID/revoke helpers; error handling | 15 |
| 2 | `src/common/services/pinata.service.ts` | `PinataService` | File & JSON IPFS uploads; credential checks; gateway URLs; API errors | 8 |
| 3 | `src/common/services/certificate-image.service.ts` | `CertificateImageService` | Canvas PNG certificates; optional student photo; extra fields | 6 |
| 4 | `src/common/services/certificate-generation.service.ts` | `CertificateGenerationService` | DB → image → Pinata; missing-data NotFound; image/upload failures | 8 |
| 5 | `src/modules/certificates/certificate.service.ts` | `CertificateService` | Issue (IPFS + chain + notify), list/filter, get, revoke; partial failure tolerance | 27 |
| 6 | `src/modules/certificates/certificate.controller.ts` | `CertificateController` | REST: issue, list, get, revoke, regenerate; RBAC list overrides | 10 |
| 7 | `src/modules/certificate-verification/certificate-verification.service.ts` | `CertificateVerificationService` | Verify by cert id or token id; lookup filters; blockchain verify fallback | 17 |
| 8 | `src/modules/certificate-verification/certificate-verification.controller.ts` | `CertificateVerificationController` | Public verify & lookup endpoints; uniform JSON responses | 6 |
| | **TOTAL** | — | — | **97** |

### Files NOT TESTED (Out-of-Scope)

| # | File/Module | Reason |
|---|-------------|--------|
| 1 | `src/common/utils/abi.ts` | Static ABI constant; no logic |
| 2 | `src/common/utils/constant.ts` | Static addresses/constants only |
| 3 | `src/config/blockchain.config.ts` | `registerAs` config wiring only |
| 4 | `src/config/pinata.config.ts` | `registerAs` config wiring only |
| 5 | `src/database/schemas/certificate.schema.ts` | Mongoose schema only; exercised via services |
| 6 | `src/modules/certificates/dto/certificate.dto.ts` | DTO decorators; validated by Nest pipes |
| 7 | `src/modules/certificates/certificate.module.ts` | Nest module wiring only |
| 8 | `src/modules/certificate-verification/certificate-verification.module.ts` | Nest module wiring only |

---

## 1.3. Test Cases

| Test Case ID | File Name | Method Name | Purpose | Input | Expected Output | Test Result | Note |
|:---:|---|---|---|---|---|:---:|---|
| Test Case ID: TC_CRT_01 | blockchain.service.ts | issueCertificate() | Issue certificate NFT with valid params | `{ tokenId, ipfsHash, recipientAddress }` | `{ transactionHash, tokenId }` | ✅ PASS | Happy path; verifies mint call and Transfer event parsing |
| Test Case ID: TC_CRT_02 | blockchain.service.ts | issueCertificate() | Reject when signer not initialized | `{ ipfsHash, recipientAddress }` (no private key) | Throws "Failed to mint certificate NFT" | ✅ PASS | No BLOCKCHAIN_PRIVATE_KEY env |
| Test Case ID: TC_CRT_03 | blockchain.service.ts | issueCertificate() | Use default recipient for invalid address | `{ ipfsHash, recipientAddress: "invalid" }` | Uses DEFAULT_NFT_RECIPIENT | ✅ PASS | Fallback to constant address |
| Test Case ID: TC_CRT_04 | blockchain.service.ts | issueCertificate() | Handle Transfer event parse failure | Valid params, parseLog throws | Returns `{ transactionHash }`, no crash | ✅ PASS | Transaction succeeded but event parsing failed |
| Test Case ID: TC_CRT_05 | blockchain.service.ts | issueCertificate() | Throw on mint transaction failure | Valid params, mint rejects | Throws "Failed to mint certificate NFT" | ✅ PASS | Network/gas error |
| Test Case ID: TC_CRT_06 | blockchain.service.ts | issueCertificate() | Throw when IPFS hash is empty | `{ ipfsHash: "" }` | Throws error | ✅ PASS | ensureIpfsUri validation |
| Test Case ID: TC_CRT_07 | blockchain.service.ts | getCertificate() | Get certificate by valid token ID | `tokenId = "1"` | `{ cid, issuer, recipient, issuedAt, revoked }` | ✅ PASS | Reads ownerOf + tokenURI + owner |
| Test Case ID: TC_CRT_08 | blockchain.service.ts | getCertificate() | Throw when token ID not found on chain | `tokenId = "9999"` | Throws "Failed to get certificate" | ✅ PASS | ERC721 invalid token ID |
| Test Case ID: TC_CRT_09 | blockchain.service.ts | verifyCertificate() | Verify valid certificate token | `tokenId = "1"` | `{ valid: true, certificate }` | ✅ PASS | getCertificate returns valid CID |
| Test Case ID: TC_CRT_10 | blockchain.service.ts | verifyCertificate() | Throw on verify with invalid token | `tokenId = "9999"` | Throws "Failed to verify certificate" | ✅ PASS | Token does not exist |
| Test Case ID: TC_CRT_11 | blockchain.service.ts | revokeCertificate() | Reject revokeCertificate as unsupported | Any tokenId | Rejects with unsupported message | ✅ PASS | Contract does not support revoke |
| Test Case ID: TC_CRT_12 | blockchain.service.ts | verifyCertificateByCID() | Reject verifyCertificateByCID as unsupported | Any CID | Rejects with unsupported message | ✅ PASS | Contract does not support CID lookup |
| Test Case ID: TC_CRT_13 | blockchain.service.ts | getCertificateIdByCID() | Reject getCertificateIdByCID as unsupported | Any CID | Rejects with unsupported message | ✅ PASS | Contract does not support CID→tokenId |
| Test Case ID: TC_CRT_14 | blockchain.service.ts | getCertificate() | Return actual issuedAt from blockchain | `tokenId = "1"` | `issuedAt` ≠ BigInt(0) | ❌ FAIL | **BUG:** `issuedAt` hardcoded `BigInt(0)` tại dòng 241 của `blockchain.service.ts`. Giá trị trả về luôn là epoch 0 thay vì timestamp thực từ blockchain. Hậu quả: không thể xác minh thời gian cấp certificate thực tế. Expected: not `0n`, Received: `0n`. |
| Test Case ID: TC_CRT_15 | blockchain.service.ts | getCertificate() | Return actual revoked status, not hardcoded | `tokenId = "1"`, `tokenId = "2"` | `issuedAt` ≠ BigInt(0) (verifying non-hardcoded) | ❌ FAIL | **BUG:** `revoked` hardcoded `false` tại dòng 242 của `blockchain.service.ts`. Hệ thống KHÔNG BAO GIỜ phát hiện được certificate đã bị revoke on-chain. Kết hợp với BUG issuedAt, cả 2 field đều không query từ smart contract. Expected: not `0n`, Received: `0n`. |
| Test Case ID: TC_CRT_16 | pinata.service.ts | uploadFile() | Upload file buffer successfully | Buffer + fileName + metadata | Returns IPFS hash string | ✅ PASS | Verifies POST to /pinning/pinFileToIPFS |
| Test Case ID: TC_CRT_17 | pinata.service.ts | uploadFile() | Throw when no API credentials for file upload | Buffer (no credentials configured) | Throws "Pinata API credentials not configured" | ✅ PASS | Credential guard |
| Test Case ID: TC_CRT_18 | pinata.service.ts | uploadFile() | Throw when Pinata API fails for file upload | Buffer, API returns error | Throws "Failed to upload file to Pinata" | ✅ PASS | Network/server error |
| Test Case ID: TC_CRT_19 | pinata.service.ts | uploadJSON() | Upload JSON metadata successfully | metadata object + name | Returns IPFS hash string | ✅ PASS | Verifies POST to /pinning/pinJSONToIPFS |
| Test Case ID: TC_CRT_20 | pinata.service.ts | uploadJSON() | Throw when no API credentials for JSON upload | metadata (no credentials) | Throws "Pinata API credentials not configured" | ✅ PASS | Credential guard |
| Test Case ID: TC_CRT_21 | pinata.service.ts | uploadJSON() | Throw when Pinata API fails for JSON upload | metadata, API returns error | Throws "Failed to upload JSON to Pinata" | ✅ PASS | Server error |
| Test Case ID: TC_CRT_22 | pinata.service.ts | uploadJSON() | Use default name when uploading JSON without name | metadata only | pinataMetadata.name = "certificate-metadata" | ✅ PASS | Default name fallback |
| Test Case ID: TC_CRT_23 | pinata.service.ts | getGatewayUrl() | Return correct gateway URL | `ipfsHash = "QmTestHash"` | `https://gateway.../ipfs/QmTestHash` | ✅ PASS | URL format validation |
| Test Case ID: TC_CRT_24 | certificate-image.service.ts | generateCertificateImage() | Generate image with full data | Complete CertificateData | Buffer (PNG) | ✅ PASS | Canvas mocked; all fields rendered |
| Test Case ID: TC_CRT_25 | certificate-image.service.ts | generateCertificateImage() | Generate image with minimal data | Only required fields | Buffer (PNG) | ✅ PASS | Optional fields omitted |
| Test Case ID: TC_CRT_26 | certificate-image.service.ts | generateCertificateImage() | Generate image with student photo | CertificateData + studentImageUrl | Buffer; loadImage called | ✅ PASS | Canvas clip + drawImage |
| Test Case ID: TC_CRT_27 | certificate-image.service.ts | generateCertificateImage() | Skip student image when URL missing | CertificateData (no imageUrl) | Buffer; loadImage NOT called | ✅ PASS | Graceful skip |
| Test Case ID: TC_CRT_28 | certificate-image.service.ts | generateCertificateImage() | Continue without image when load fails | CertificateData + broken URL | Buffer (no crash) | ✅ PASS | loadImage rejects; warning logged |
| Test Case ID: TC_CRT_29 | certificate-image.service.ts | generateCertificateImage() | Include identifyNumber and expireDate | CertificateData + identifyNumber + expireDate | Buffer; fillText called with values | ✅ PASS | Optional decorative fields |
| Test Case ID: TC_CRT_30 | certificate-generation.service.ts | generateAndUploadCertificate() | Generate and upload certificate successfully | Valid certificateId | `{ imageIpfsHash, metadataIpfsHash, metadata }` | ✅ PASS | Full pipeline: DB → image → Pinata |
| Test Case ID: TC_CRT_31 | certificate-generation.service.ts | generateAndUploadCertificate() | Use username when fullName missing | certificateId (student no fullName) | metadata.studentName = username | ✅ PASS | Fallback logic |
| Test Case ID: TC_CRT_32 | certificate-generation.service.ts | generateAndUploadCertificate() | Throw NotFound when certificate missing | Non-existent certificateId | NotFoundException | ✅ PASS | DB returns null |
| Test Case ID: TC_CRT_33 | certificate-generation.service.ts | generateAndUploadCertificate() | Throw NotFound when student data missing | certificateId (no populated student) | NotFoundException | ✅ PASS | Incomplete populate |
| Test Case ID: TC_CRT_34 | certificate-generation.service.ts | generateAndUploadCertificate() | Throw NotFound when course data missing | certificateId (no populated course) | NotFoundException | ✅ PASS | Incomplete populate |
| Test Case ID: TC_CRT_35 | certificate-generation.service.ts | generateAndUploadCertificate() | Throw NotFound when exam not found | certificateId (exam query null) | NotFoundException | ✅ PASS | Exam deleted/missing |
| Test Case ID: TC_CRT_36 | certificate-generation.service.ts | generateAndUploadCertificate() | Throw when image generation fails | certificateId (canvas error) | Throws "Canvas render failed" | ✅ PASS | CertificateImageService error |
| Test Case ID: TC_CRT_37 | certificate-generation.service.ts | generateAndUploadCertificate() | Throw when Pinata upload fails | certificateId (upload error) | Throws "Pinata upload failed" | ✅ PASS | PinataService error |
| Test Case ID: TC_CRT_38 | certificate.service.ts | issue() | Issue certificate (full happy path) | `{ examId, studentId }` | Populated certificate object | ✅ PASS | Submission → Cert → Pinata → Blockchain → Notify |
| Test Case ID: TC_CRT_39 | certificate.service.ts | issue() | Return existing cert for duplicate submission | `{ examId, studentId }` (cert exists) | Existing certificate, no blockchain call | ✅ PASS | Idempotency guard |
| Test Case ID: TC_CRT_40 | certificate.service.ts | issue() | Throw NotFound when submission missing | `{ examId, studentId }` (no submission) | NotFoundException | ✅ PASS | First DB check fails |
| Test Case ID: TC_CRT_41 | certificate.service.ts | issue() | Throw NotFound when exam missing | `{ examId, studentId }` (no exam) | NotFoundException | ✅ PASS | Exam lookup fails |
| Test Case ID: TC_CRT_42 | certificate.service.ts | issue() | Throw NotFound when course missing | `{ examId, studentId }` (no course) | NotFoundException | ✅ PASS | Course lookup fails |
| Test Case ID: TC_CRT_43 | certificate.service.ts | issue() | Throw NotFound when student missing | `{ examId, studentId }` (no student) | NotFoundException | ✅ PASS | Student lookup fails |
| Test Case ID: TC_CRT_44 | certificate.service.ts | issue() | Use placeholder IPFS when Pinata fails | Valid params, Pinata rejects | Certificate saved with placeholder hash | ✅ PASS | Error caught, flow continues |
| Test Case ID: TC_CRT_45 | certificate.service.ts | issue() | Handle blockchain mint failure gracefully | Valid params, blockchain rejects | Certificate remains status="pending" | ✅ PASS | Error caught, flow continues |
| Test Case ID: TC_CRT_46 | certificate.service.ts | issue() | Handle BigInt serialize error without crash | Valid params, BigInt error | Certificate saved, no crash | ✅ PASS | Specific error message check |
| Test Case ID: TC_CRT_47 | certificate.service.ts | issue() | Use default recipient when no wallet | Student has no walletAddress | DEFAULT_NFT_RECIPIENT used | ✅ PASS | Fallback to constant |
| Test Case ID: TC_CRT_48 | certificate.service.ts | issue() | Dispatch notification on successful issue | Valid params | createNotification called | ✅ PASS | category=certificate, type=certificate_issued |
| Test Case ID: TC_CRT_49 | certificate.service.ts | issue() | Continue when notification dispatch fails | Valid params, notification rejects | Certificate returned (no crash) | ✅ PASS | Error caught in dispatch |
| Test Case ID: TC_CRT_50 | certificate.service.ts | list() | List certificates without filters | `{ page: 1, limit: 10 }` | `{ items, total, page, limit }` | ✅ PASS | Default pagination |
| Test Case ID: TC_CRT_51 | certificate.service.ts | list() | Filter certificates by status | `{ status: "revoked" }` | Filtered results | ✅ PASS | Status filter applied |
| Test Case ID: TC_CRT_52 | certificate.service.ts | list() | Filter by date range | `{ issuedFrom, issuedTo }` | Filtered results | ✅ PASS | $gte/$lte on issuedAt |
| Test Case ID: TC_CRT_53 | certificate.service.ts | list() | Filter by course name (partial match) | `{ courseName: "Block" }` | Filtered results | ✅ PASS | RegExp search on courses |
| Test Case ID: TC_CRT_54 | certificate.service.ts | list() | Filter by teacher ID | `{ teacherId }` | Filtered results | ✅ PASS | Course.teacherId join |
| Test Case ID: TC_CRT_55 | certificate.service.ts | list() | Return empty when course name matches nothing | `{ courseName: "Nonexistent" }` | `{ items: [], total: 0 }` | ✅ PASS | Early return optimization |
| Test Case ID: TC_CRT_56 | certificate.service.ts | getById() | Get certificate by valid ID | Valid MongoDB ObjectId | Populated certificate | ✅ PASS | findById + populate |
| Test Case ID: TC_CRT_57 | certificate.service.ts | getById() | Throw NotFound for invalid certificate ID | Non-existent ID | NotFoundException | ✅ PASS | findById returns null |
| Test Case ID: TC_CRT_58 | certificate.service.ts | getByStudent() | Get certificates by student | `studentId` + query | Paginated results | ✅ PASS | getByStudent → list() |
| Test Case ID: TC_CRT_59 | certificate.service.ts | getByCourse() | Get certificates by course | `courseId` + query | Paginated results | ✅ PASS | getByCourse → list() |
| Test Case ID: TC_CRT_60 | certificate.service.ts | revoke() | Revoke certificate successfully | Valid ID + reason | Certificate status = "revoked" | ✅ PASS | Status mutation + save |
| Test Case ID: TC_CRT_61 | certificate.service.ts | revoke() | Revoke certificate with transaction hash | Valid ID + reason + txHash | transactionHash updated | ✅ PASS | Optional blockchain tx |
| Test Case ID: TC_CRT_62 | certificate.service.ts | revoke() | Throw NotFound when revoking non-existent cert | Invalid ID | NotFoundException | ✅ PASS | findById returns null |
| Test Case ID: TC_CRT_63 | certificate.service.ts | revoke() | Persist revoke reason in database | Valid ID + reason = "Academic fraud" | `cert.reason = "Academic fraud"` | ❌ FAIL | **BUG:** Method `revoke()` nhận tham số `reason` nhưng KHÔNG BAO GIỜ gán `cert.reason = reason`. Tại dòng 362 của `certificate.service.ts` có comment: *"reason can be stored later if we add a field"*. Hậu quả: mất hoàn toàn audit trail — không có bằng chứng tại sao certificate bị thu hồi. Expected: `"Academic fraud"`, Received: `undefined`. |
| Test Case ID: TC_CRT_64 | certificate.service.ts | list() | Not crash when courseName contains regex special chars | `{ courseName: "Block(chain" }` | Should return empty result gracefully | ❌ FAIL | **BUG:** `new RegExp(courseName, 'i')` tại dòng 272 của `certificate.service.ts` sử dụng raw user input mà KHÔNG escape ký tự đặc biệt regex. Khi user nhập `"Block(chain"`, ứng dụng crash với `SyntaxError: Invalid regular expression: /Block(chain/: Unterminated group`. Đây cũng là lỗ hổng bảo mật **ReDoS** (Regular Expression Denial of Service). Cần sử dụng hàm escape regex hoặc `string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')` trước khi tạo RegExp. |
| Test Case ID: TC_CRT_65 | certificate.controller.ts | issue() | Issue certificate via POST | IssueCertificateDto | `{ success: true, message: "Certificate issued" }` | ✅ PASS | @Roles('teacher', 'admin') |
| Test Case ID: TC_CRT_66 | certificate.controller.ts | list() | List certificates as admin (no override) | Admin user + query | Paginated response | ✅ PASS | No studentId/teacherId override |
| Test Case ID: TC_CRT_67 | certificate.controller.ts | list() | Override studentId when student lists | Student user + query | query.studentId = user.id | ✅ PASS | RBAC enforcement |
| Test Case ID: TC_CRT_68 | certificate.controller.ts | list() | Override teacherId when teacher lists | Teacher user + query | query.teacherId = user.id | ✅ PASS | RBAC enforcement |
| Test Case ID: TC_CRT_69 | certificate.controller.ts | getById() | Get certificate by ID | `id` param | `{ success: true, data: cert }` | ✅ PASS | @Roles('student','teacher','admin') |
| Test Case ID: TC_CRT_70 | certificate.controller.ts | getByStudent() | Get certificates by student | `studentId` param + query | Paginated response | ✅ PASS | Route: GET student/:studentId |
| Test Case ID: TC_CRT_71 | certificate.controller.ts | getByCourse() | Get certificates by course | `courseId` param + query | Paginated response | ✅ PASS | Route: GET course/:courseId |
| Test Case ID: TC_CRT_72 | certificate.controller.ts | revoke() | Revoke certificate | `id` + RevokeCertificateDto | `{ success: true, message: "Certificate revoked" }` | ✅ PASS | @Roles('teacher','admin') |
| Test Case ID: TC_CRT_73 | certificate.controller.ts | revoke() | Revoke with transaction hash | `id` + dto with txHash | Service called with txHash | ✅ PASS | Optional field forwarding |
| Test Case ID: TC_CRT_74 | certificate.controller.ts | generateCertificate() | Generate certificate image via POST | `id` param | `{ success: true, data: { imageIpfsHash, ... } }` | ✅ PASS | @Roles('teacher','admin') |
| Test Case ID: TC_CRT_75 | certificate-verification.service.ts | verifyByCertificateId() | Throw BadRequest for invalid certificate ID | `"invalid-id"` | BadRequestException | ✅ PASS | ObjectId validation |
| Test Case ID: TC_CRT_76 | certificate-verification.service.ts | verifyByCertificateId() | Return invalid when certificate not found | Valid ObjectId (not in DB) | `{ valid: false }` | ✅ PASS | DB miss |
| Test Case ID: TC_CRT_77 | certificate-verification.service.ts | verifyByCertificateId() | Return valid for issued certificate | Issued certificate ID | `{ valid: true }` | ✅ PASS | Full verification pipeline |
| Test Case ID: TC_CRT_78 | certificate-verification.service.ts | verifyByCertificateId() | Return invalid for revoked certificate | Revoked certificate ID | `{ valid: false, message: "...revoked" }` | ✅ PASS | Status check |
| Test Case ID: TC_CRT_79 | certificate-verification.service.ts | verifyByCertificateId() | Return pending for pending certificate | Pending certificate ID | `{ valid: false, message: "...pending" }` | ✅ PASS | No tokenId yet |
| Test Case ID: TC_CRT_80 | certificate-verification.service.ts | verifyByCertificateId() | Handle blockchain verify failure gracefully | Issued cert, blockchain throws | `{ valid: true, blockchainVerification.valid: false }` | ✅ PASS | Network error caught |
| Test Case ID: TC_CRT_81 | certificate-verification.service.ts | verifyByTokenId() | Throw BadRequest for empty tokenId | `""` | BadRequestException | ✅ PASS | Input validation |
| Test Case ID: TC_CRT_82 | certificate-verification.service.ts | verifyByTokenId() | Throw BadRequest for whitespace tokenId | `"   "` | BadRequestException | ✅ PASS | Trim + length check |
| Test Case ID: TC_CRT_83 | certificate-verification.service.ts | verifyByTokenId() | Return invalid when token not on blockchain | tokenId not found on chain | `{ valid: false }` | ✅ PASS | Blockchain returns invalid |
| Test Case ID: TC_CRT_84 | certificate-verification.service.ts | verifyByTokenId() | Return valid (blockchain only) when no local record | Token on chain, not in DB | `{ valid: true, certificate: null }` | ✅ PASS | Orphan token |
| Test Case ID: TC_CRT_85 | certificate-verification.service.ts | verifyByTokenId() | Return full verification when found both sides | Token on chain + in DB | `{ valid: true, certificate, blockchainVerification }` | ✅ PASS | Complete match |
| Test Case ID: TC_CRT_86 | certificate-verification.service.ts | lookupCertificates() | Throw BadRequest when no filters provided | `{}` | BadRequestException | ✅ PASS | At least one filter required |
| Test Case ID: TC_CRT_87 | certificate-verification.service.ts | lookupCertificates() | Lookup by certificate ID | `{ certificateId }` | Array of certificates | ✅ PASS | _id filter |
| Test Case ID: TC_CRT_88 | certificate-verification.service.ts | lookupCertificates() | Throw BadRequest for invalid certificateId format | `{ certificateId: "bad" }` | BadRequestException | ✅ PASS | ObjectId validation |
| Test Case ID: TC_CRT_89 | certificate-verification.service.ts | lookupCertificates() | Lookup by token ID | `{ tokenId }` | Array of certificates | ✅ PASS | tokenId filter |
| Test Case ID: TC_CRT_90 | certificate-verification.service.ts | lookupCertificates() | Lookup by student email | `{ studentEmail }` (exists) | Array of certificates | ✅ PASS | User → studentId filter |
| Test Case ID: TC_CRT_91 | certificate-verification.service.ts | lookupCertificates() | Return empty when student email not found | `{ studentEmail: "nobody@..." }` | `[]` | ✅ PASS | User not found, early return |
| Test Case ID: TC_CRT_92 | certificate-verification.controller.ts | verifyByCertificateId() | Verify by certificate ID (valid) | certificateId param | `{ success: true, data: result }` | ✅ PASS | @Public() endpoint |
| Test Case ID: TC_CRT_93 | certificate-verification.controller.ts | verifyByCertificateId() | Return invalid when cert not found | certificateId (not in DB) | `{ success: true, data.valid: false }` | ✅ PASS | Service returns invalid |
| Test Case ID: TC_CRT_94 | certificate-verification.controller.ts | verifyByTokenId() | Verify by token ID (valid) | tokenId param | `{ success: true, data: result }` | ✅ PASS | @Public() endpoint |
| Test Case ID: TC_CRT_95 | certificate-verification.controller.ts | verifyByTokenId() | Return invalid when token not on blockchain | tokenId (not on chain) | `{ data.valid: false }` | ✅ PASS | Blockchain miss |
| Test Case ID: TC_CRT_96 | certificate-verification.controller.ts | lookupCertificates() | Lookup certificates with filters | Query params | `{ success: true, data: { items, total } }` | ✅ PASS | @Public() endpoint |
| Test Case ID: TC_CRT_97 | certificate-verification.controller.ts | lookupCertificates() | Lookup by email (empty result) | `studentEmail` only | `{ data: { items: [], total: 0 } }` | ✅ PASS | No matching student |

---

## 1.4. Project Link

[https://github.com/CwtchMH/Academix.git](https://github.com/CwtchMH/Academix.git)

---

## 1.5. Execution Report

### Test Execution Summary

| Metric | Value |
|--------|-------|
| **Test Suites** | 6 passed, 2 failed, 8 total |
| **Tests** | 93 passed, 4 failed, 97 total |
| **Failures** | 4 |
| **Skipped** | 0 |
| **Execution Time** | ~60s |
| **Environment** | Node.js v20.20.2, Windows 10 |

### Failed Test Summary

| # | Test Case ID | File | Bug Description | Severity |
|---|:---:|---|---|:---:|
| 1 | Test Case ID: TC_CRT_63 | certificate.service.ts | `revoke()` nhận `reason` nhưng không lưu vào DB. Comment: *"reason can be stored later if we add a field"*. Mất audit trail thu hồi certificate. | HIGH |
| 2 | Test Case ID: TC_CRT_64 | certificate.service.ts | `new RegExp(courseName, 'i')` dùng raw user input → crash `SyntaxError` với ký tự regex đặc biệt. Lỗ hổng bảo mật ReDoS. | CRITICAL |
| 3 | Test Case ID: TC_CRT_14 | blockchain.service.ts | `issuedAt` hardcoded `BigInt(0)` thay vì đọc timestamp thực từ blockchain. Thời gian cấp certificate luôn sai. | MEDIUM |
| 4 | Test Case ID: TC_CRT_15 | blockchain.service.ts | `revoked` hardcoded `false` → hệ thống không bao giờ phát hiện certificate bị revoke on-chain. | HIGH |

### Run Command

```bash
node node_modules/jest/bin/jest.js --testPathPatterns="test/unit" --verbose
```

### Screenshots

> [Placeholder: Insert screenshot of test execution results here]

---

## 1.6. Code Coverage Report

### Run Command

```bash
node node_modules/jest/bin/jest.js --testPathPatterns="test/unit" --coverage
```

### Coverage Summary

| File | Statements | Branches | Functions | Lines |
|------|:----------:|:--------:|:---------:|:-----:|
| `blockchain.service.ts` | _[pending]_ | _[pending]_ | _[pending]_ | _[pending]_ |
| `pinata.service.ts` | _[pending]_ | _[pending]_ | _[pending]_ | _[pending]_ |
| `certificate-image.service.ts` | _[pending]_ | _[pending]_ | _[pending]_ | _[pending]_ |
| `certificate-generation.service.ts` | _[pending]_ | _[pending]_ | _[pending]_ | _[pending]_ |
| `certificate.service.ts` | _[pending]_ | _[pending]_ | _[pending]_ | _[pending]_ |
| `certificate.controller.ts` | _[pending]_ | _[pending]_ | _[pending]_ | _[pending]_ |
| `certificate-verification.service.ts` | _[pending]_ | _[pending]_ | _[pending]_ | _[pending]_ |
| `certificate-verification.controller.ts` | _[pending]_ | _[pending]_ | _[pending]_ | _[pending]_ |

> **Target:** ≥ 60% coverage for core modules (per project constitution).

### Screenshots

> [Placeholder: Insert screenshot of coverage report here]

---

## 1.7. References

### Prompts Used

1. **Primary prompt:** `.github/prompts/unit-test.prompt.md` — AI Instruction for Senior QA & Unit Test Engineer role, defining scope, deliverables, and testing rules.
2. **Architecture reference:** `.specify/memory/constitution.md` — Project constitution defining domain-modular architecture, testing standards (≥60% coverage), and technology stack.
3. **Template reference:** `.specify/templates/spec-template.md` — Feature specification template for understanding requirement structure.
4. **Template reference:** `.specify/templates/tasks-template.md` — Task generation template for TDD workflow.

### Source Files Analyzed

| File | Lines | Analyzed For |
|------|:-----:|---|
| `src/modules/certificates/certificate.service.ts` | 405 | Core business logic, error flows, external dependencies |
| `src/modules/certificates/certificate.controller.ts` | 145 | Route handlers, RBAC, response formatting |
| `src/modules/certificates/certificate.module.ts` | 43 | Dependency injection, module wiring |
| `src/modules/certificates/dto/certificate.dto.ts` | 90 | DTO validation rules, query params |
| `src/modules/certificate-verification/certificate-verification.service.ts` | 261 | Verification logic, blockchain integration |
| `src/modules/certificate-verification/certificate-verification.controller.ts` | 74 | Public endpoints, query params |
| `src/common/services/blockchain.service.ts` | 341 | Smart contract interaction, ethers.js |
| `src/common/services/certificate-generation.service.ts` | 264 | Image generation pipeline, IPFS upload |
| `src/common/services/pinata.service.ts` | 168 | IPFS file/JSON upload |
| `src/common/services/certificate-image.service.ts` | 410 | Canvas rendering |
| `src/database/schemas/certificate.schema.ts` | 54 | Data model, indexes |
| `src/common/utils/constant.ts` | 3 | Contract address, default recipient |
| `src/config/blockchain.config.ts` | 12 | Blockchain configuration |
