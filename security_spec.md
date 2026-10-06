# MomCare Firestore Security Specification

## 1. Data Invariants
1. Private health information (`/users/{userId}/**`) can ONLY be accessed (read/written) by the authenticated user whose `request.auth.uid == userId`.
2. No user can read or modify another user's symptoms, check-ins, medical reports, medications, or AI conversations.
3. Community posts (`/community_posts/{postId}`) are publicly readable by authenticated users, but can only be authored and deleted by the post author (`request.auth.uid == authorId`).
4. Likes count on community posts can only be modified by authenticated users in incremental steps.
5. Community comments (`/community_posts/{postId}/comments/{commentId}`) can only be created with `authorId == request.auth.uid` and read by authenticated users.
6. Reports (`/community_reports/{reportId}`) can only be created by signed-in users with `reportedBy == request.auth.uid`.

## 2. The Dirty Dozen Payloads (Targeting Rejection)
1. **Unauthenticated Read of User Data**: Attempting to read `/users/alice123/symptoms/s1` without auth -> PERMISSION_DENIED.
2. **Cross-User Data Scraping**: User Bob (`uid: bob`) querying `/users/alice/checkins` -> PERMISSION_DENIED.
3. **Ghost Field Poisoning**: Inserting `{ ...validCheckin, isAdmin: true, bypass: true }` -> REJECTED by schema validation.
4. **Id Injection**: Writing to `/users/alice/symptoms/` with ID > 128 chars or illegal characters -> REJECTED.
5. **Community Post Impersonation**: Alice creating a post with `authorId: 'bob'` -> PERMISSION_DENIED.
6. **Community Comment Spoofing**: Bob modifying Alice's post content -> PERMISSION_DENIED.
7. **Cross-User Medical Report Tampering**: Charlie attempting to delete Alice's ultrasound report -> PERMISSION_DENIED.
8. **Malicious Report Denial-of-Wallet**: Writing 5MB string inside `symptomName` -> REJECTED (max 256 chars).
9. **Direct Private User Info Read by Another User**: Bob attempting `get(/users/alice)` -> PERMISSION_DENIED.
10. **Bypassing AI Conversation Ownership**: Bob reading `/users/alice/ai_conversations/conv1` -> PERMISSION_DENIED.
11. **Negative or Arbitrary Likes Manipulation**: Setting `likesCount: -9999` or non-numeric -> REJECTED.
12. **Unauthenticated Report Flagging**: Attempting to submit a community moderation report anonymously -> PERMISSION_DENIED.
