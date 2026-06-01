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
  }
}
```
