# Security Rules Specification

This document defines the security boundaries, data invariants, and access control policies for the Free QR Generator application's Firestore instance.

## 1. Data Invariants

- **Users:**
  - A user profile must be authenticated. Users can only read and write their own profile document (`/users/{userId}`).
  - Users are forbidden from modifying their `email` after registration to prevent account takeover attempts.
  
- **QR Projects:**
  - A QR project must be owned by the user who created it (`userId == request.auth.uid`).
  - The `projectId` and `userId` field values are immutable.
  - The `trackingId` must be a valid system alphanumeric short ID.
  
- **Scan Logs:**
  - Anyone can create a scan log when scanning a QR code (to support public analytics logs), but they cannot read, update, or delete scan logs.
  - Only the project's owner (`userId == request.auth.uid`) can query/list scan logs associated with their own projects.

---

## 2. The "Dirty Dozen" Vulnerabilities & Payloads

The following payloads represent illegal write or read attempts that the Firestore rules are explicitly designed to block:

1. **Identity Spoofing on User Profile:** A user authenticated as `user_A` attempts to create / modify `/users/user_B`.
2. **PII Reading by Coworker / Stranger:** A user tries to perform a direct `get()` read on `/users/user_B`'s private profile.
3. **Privilege Escalation:** An authenticated user attempts to set an `isAdmin` or `role` property in their profile.
4. **Project Stealing (Hijack Project ID):** A user attempts to create a QR Project pointing to another user's `userId`.
5. **Project Content Poisoning:** An attacker attempts to write an extremely large payload (e.g., >100KB) into the `content` field.
6. **Immutable Field Modification:** An authenticated user tries to update the `userId` or `createdAt` of an existing project and assign it to someone else.
7. **Tracking ID Hijacking:** A user tries to steal or update someone else's project tracking ID to hijack traffic.
8. **Scan Log Tampering:** A malicious crawler attempts to delete scan logs to mess up analytical dashboards.
9. **Unauthenticated Project Creation:** An unauthenticated guest client attempts to create or save a QR Project.
10. **Query Scraper (Unsecured List):** An authenticated client queries all projects (`/projects`) without filter limits, expecting to scrape other users' designs.
11. **Scan Log Mass Read:** A user attempts to read scan logs that do not belong to their specific projects.
12. **Malicious Protocol Redirections:** Setting a URL content with `javascript:` protocol instead of `http/https` to execute client-side scripting during redirect.

---

## 3. Fortress Security Rules Draft (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Global Safety Net (Default Deny)
    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isProjectOwner(projectData) {
      return isSignedIn() && projectData.userId == request.auth.uid;
    }

    function isValidId(id) {
       return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$');
    }

    // --- USERS COLLECTION ---
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // --- PROJECTS COLLECTION ---
    match /projects/{projectId} {
      allow create: if isSignedIn() 
        && isValidId(projectId)
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.name is string && request.resource.data.name.size() <= 100
        && request.resource.data.type is string && request.resource.data.type.size() <= 20
        && request.resource.data.content is string && request.resource.data.content.size() <= 4096;
        
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      
      allow update: if isSignedIn()
        && resource.data.userId == request.auth.uid
        && request.resource.data.userId == resource.data.userId
        && request.resource.data.createdAt == resource.data.createdAt
        && request.resource.data.name is string && request.resource.data.name.size() <= 100
        && request.resource.data.content is string && request.resource.data.content.size() <= 4096;

      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }

    // --- SCANS COLLECTION ---
    match /scans/{scanId} {
      // Allow any public client to record a scan event
      allow create: if true 
        && isValidId(scanId)
        && request.resource.data.projectId is string 
        && request.resource.data.trackingId is string;

      // Only the owner of the scan's associated user ID can read or query scans
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;

      // Prevent anyone from updating or deleting historical logs
      allow update, delete: if false;
    }

    // --- PDF SHARES COLLECTION ---
    match /pdf_shares/{shareId} {
      // Owner-only read access for personal dashboard/management
      allow list, get: if isSignedIn() && resource.data.userId == request.auth.uid;
      // All writes (create, update, delete) and public visitor metadata requests are mediated exclusively via the secure server API
      allow create, update, delete: if false;
    }
  }
}
```

---

## 4. PDF Sharing Data Protection, Access Control, and Retention

### 4.1 Storage & Architecture Separation
- **Binary PDF Storage**: PDF files are stored as private binary objects in Google Cloud Storage for Firebase at `pdf_shares/{ownerUid}/{shareId}.pdf` via the Firebase Admin SDK. File binaries are NEVER stored in Firestore document fields or Base64 string properties, and container-local ephemeral disks are strictly rejected for persistent storage. No public download token or client-readable URL is generated.
- **Firestore Metadata**: The Firestore `pdf_shares` collection stores metadata only:
  - `id`: Cryptographically strong random identifier (`pdf-` + 32-character hex from `crypto.randomBytes(16)`).
  - `userId`: Verified owner identifier (extracted from authenticated Firebase ID token).
  - `title`, `description`, `fileName`, `fileSize`, `fileSizeBytes`.
  - `createdAt`, `expiresAt`, `maxDownloads`.
  - `isProtected`: Boolean flag.
  - `passwordSalt`: 16-byte random hex salt (server-only, never exposed to browser clients).
  - `passwordHash`: Derived 64-byte key using asynchronous `crypto.scrypt` (server-only, never exposed to browser clients).
  - `hashVersion`: Versioned hash identifier (`scrypt_v1` with N=16384, r=8, p=1, maxmem=32MB).
  - `storageBucket`: Cloud Storage bucket identifier.
  - `storageObjectPath`: Private object path in Cloud Storage (`pdf_shares/{ownerUid}/{shareId}.pdf`).
  - `viewCount`, `downloadCount`.
  - `status`: Lifecycle state (`active`, `deleting`, `delete_failed`).

### 4.2 Server-Enforced Access Control
- **Direct Client Access Denied**: Firestore security rules deny all direct browser reads and writes to `/pdf_shares/{shareId}` (`allow read, write: if false;`) and `/pdf_share_rate_limits/{limitId}`. Cloud Storage rules similarly deny all direct client reads and writes (`match /pdf_shares/{allPaths=**} { allow read, write: if false; }`). All operations are strictly mediated server-side via the Firebase Admin SDK.
- **Public Metadata Gateway**: `GET /api/pdf-shares/:shareId` filters out all sensitive fields. It validates expiration and download limits, returning only safe display metadata (`id, title, description, fileName, fileSize, isProtected, expiresAt, maxDownloads, downloadCount, viewCount`). It NEVER returns password hashes, salts, storage object paths, or owner identifiers.
- **Asynchronous Password Verification**: For protected documents, the server verifies passwords using non-blocking asynchronous `crypto.scrypt` (N=16384, r=8, p=1, maxmem=32MB) and `crypto.timingSafeEqual`, preventing CPU event-loop starvation.
- **Distributed Multi-Instance Rate Limiting**: `POST /api/pdf-shares/:shareId/download` resolves client identity using authoritative trusted-IP extraction (audited for Cloud Run 1-hop reverse proxy topology, rejecting client-spoofed `X-Forwarded-For` prefixes). Failed attempts are tracked in an atomic, shared Firestore transaction (`pdf_share_rate_limits`) keyed by HMAC-SHA256 (`shareId` + keyed HMAC of client IP with a server-only secret). No raw IPs or password data are stored. 5 consecutive failed attempts trigger a distributed 15-minute lockout with HTTP 429 and `Retry-After`, shared across all Cloud Run instances and surviving process restarts. Successful authentication immediately deletes the rate-limit record.
- **Safe Delivery Headers**:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="..."`
  - `X-Content-Type-Options: nosniff`
  - `Cache-Control: no-store, private, max-age=0`
  - `Pragma: no-cache`
  - `Expires: 0`
  - `X-Robots-Tag: noindex, nofollow, noarchive`

### 4.3 Validation & Limits
- **Maximum Size Limit**: 10 MB maximum (10,485,760 bytes), enforced on the client for immediate feedback, on the streaming upload transport parser (`busboy`), and on the authoritative server check.
- **Format Verification**: File header must match the `%PDF-` signature.
- **Filename Sanitization**: Path traversal characters, null bytes, quotes, and CRLF injection characters are stripped.
- **No Antivirus Claim**: File format and signature validation verify format boundaries but do not constitute malware scanning or antivirus inspection.

### 4.4 Retention and Deletion
- **Authoritative Expiration**: Expiration timestamps (`expiresAt`) are strictly checked on every request. Expired documents immediately return HTTP 410 Gone.
- **Immediate Logical Denial vs. Physical Erasure**: Logical access is immediately blocked upon expiration. Automatic physical cleanup from cloud storage requires an external lifecycle rule or scheduler; physical cleanup is tracked as an operational prerequisite and is not claimed as instant automatic deletion.
- **Staged Creation and Deletion Compensation**: Cross-service Firestore and Cloud Storage operations are non-atomic. Creation uses compensation (deleting the uploaded cloud storage object if metadata creation fails). Deletion marks status as deleting, deletes the cloud storage object, and deletes the Firestore document, recording a safe retry state upon partial failure.

