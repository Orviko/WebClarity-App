# Security Audit: Style Guide Share API

## Overview

This document outlines the security measures implemented for the public Style Guide Share API to prevent misuse, abuse, and attacks.

## API Endpoints

### 1. `POST /api/rpc/style-guide/create-share`

Creates a public share for style guide data (typography and colors).

### 2. `GET /api/rpc/style-guide/get-share`

Retrieves shared style guide data by share ID.

---

## Security Measures Implemented

### 1. Rate Limiting ✅

**Location**: `web-app/packages/api/orpc/middleware/rate-limit.ts`

- **Limit**: 10 requests per hour per IP address
- **Window**: 1 hour (60 minutes)
- **Storage**: In-memory Map (consider Redis for production scaling)
- **Unknown IP Handling**:
  - Development: 5 requests/hour limit
  - Production: Rejects requests with unknown IPs
- **Memory Management**: Automatic cleanup when store exceeds 1000 entries

**Protection Against**:

- API abuse and DoS attacks
- Automated scraping/bot attacks
- Resource exhaustion

---

### 2. Input Validation & Sanitization ✅

**Location**: `web-app/packages/api/modules/style-guide/utils/validate-share-data.ts`

#### Payload Size Limits

- **Maximum payload size**: 5MB
- Prevents large data uploads that could exhaust server resources

#### JSON Structure Validation

- **Maximum nesting depth**: 20 levels
- **Maximum array length**: 10,000 items
- **Maximum string length**: 100,000 characters
- **Maximum object keys**: 1,000 keys per object

**Protection Against**:

- Deeply nested JSON attacks (billion laughs attack)
- Memory exhaustion via large arrays/strings
- CPU exhaustion via complex object structures

#### Website URL Validation

- **Domain extraction**: Strips protocol, paths, queries, fragments
- **Domain format validation**: Strict regex for valid domain names
- **Length limit**: Maximum 255 characters
- **Injection prevention**: Blocks:
  - Control characters (`\x00-\x1F\x7F`)
  - HTML/script injection chars (`<`, `>`, `"`, `'`)
  - JavaScript protocol (`javascript:`)
  - Data URIs (`data:`)

**Protection Against**:

- XSS attacks via malicious URLs
- SQL injection (though Prisma prevents this)
- Path traversal attacks
- Protocol handler attacks

---

### 3. Database Security ✅

#### Prisma ORM Protection

- **Parameterized queries**: All database operations use Prisma's parameterized queries
- **Type safety**: Prisma's type system prevents SQL injection
- **JSON type**: Uses Prisma's `Json` type for safe JSON storage

#### Share ID Generation

**Location**: `web-app/packages/api/modules/style-guide/utils/generate-share-id.ts`

- **Algorithm**: `nanoid` with custom alphanumeric alphabet
- **Length**: 12 characters
- **Uniqueness**: Database-checked with retry logic (max 10 attempts)
- **Collision resistance**: Cryptographically secure random generation

**Protection Against**:

- Share ID enumeration/guessing
- Collision attacks
- Predictable ID generation

#### Data Expiration

- **Automatic expiration**: 24 hours from creation
- **Automatic cleanup**: Expired shares are deleted when accessed
- **Cascade deletion**: Related `StyleGuideData` is automatically deleted

**Protection Against**:

- Database bloat
- Long-term data storage abuse
- Privacy concerns from permanent storage

---

### 4. CORS Configuration ✅

**Location**: `web-app/packages/api/index.ts`

- **Allowed origins**:
  - Extension origins (`chrome-extension://`, `moz-extension://`, `safari-extension://`)
  - Localhost for development
  - Web app domain
- **Credentials**: Enabled for authenticated requests
- **Methods**: POST, GET, OPTIONS
- **Headers**: Content-Type, Authorization

**Note**: Public API endpoints allow any origin (rate limiting provides security)

---

### 5. Error Handling ✅

#### Consistent Error Responses

- **Error codes**: Standardized ORPC error codes
- **No information leakage**: Generic error messages prevent information disclosure
- **Validation errors**: Detailed Zod validation errors for debugging (development only)

**Protection Against**:

- Information disclosure attacks
- Error-based SQL injection (mitigated by Prisma)

---

### 6. Extension-Side Security ✅

#### Data Source Validation

**Location**: `extensions/src/shared/components/screens/StyleGuideScreen.ts`

- **Website URL**: Extracted from browser tab (trusted source)
- **Fallback**: Safe default if URL extraction fails
- **No user input**: Website URL is not user-editable

#### API Client

**Location**: `extensions/src/shared/utils/share-api.ts`

- **Error handling**: Comprehensive error catching and user-friendly messages
- **No sensitive data**: Only style guide data is sent (no user credentials)

---

## Potential Security Concerns & Mitigations

### 1. Rate Limiting Storage ⚠️

**Current**: In-memory Map
**Risk**: Lost on server restart, not shared across instances
**Mitigation**:

- ✅ Works for single-instance deployments
- ⚠️ Consider Redis for multi-instance production deployments

### 2. IP Address Spoofing ⚠️

**Risk**: Attackers could spoof IP addresses via proxy headers
**Current Mitigation**:

- ✅ Uses first IP from `x-forwarded-for` (standard proxy behavior)
- ✅ Stricter limits for unknown IPs
- ✅ Production rejects unknown IPs

**Recommendation**: Consider using a reverse proxy (e.g., Cloudflare, AWS ALB) that validates and sets trusted headers.

### 3. JSON Bombs 💣

**Risk**: Malicious JSON structures designed to exhaust resources
**Mitigation**:

- ✅ Depth limits (20 levels)
- ✅ Array length limits (10,000)
- ✅ String length limits (100,000)
- ✅ Object key limits (1,000)
- ✅ Payload size limits (5MB)

### 4. Database Storage Limits 📊

**Risk**: Large number of shares consuming database storage
**Mitigation**:

- ✅ Automatic expiration (24 hours)
- ✅ Cascade deletion
- ✅ Indexed expiration column for efficient cleanup queries

**Recommendation**: Consider implementing a cleanup cron job to periodically delete expired shares.

### 5. Share ID Enumeration 🔍

**Risk**: Attackers could enumerate share IDs
**Mitigation**:

- ✅ 12-character alphanumeric (62^12 ≈ 3.2×10^21 possible IDs)
- ✅ Cryptographically secure random generation
- ✅ No sequential IDs

**Note**: Share IDs are public by design (they're in URLs). This is acceptable as:

- Shares expire after 24 hours
- No sensitive data is exposed (only style guide data)
- Rate limiting prevents mass enumeration

---

## Security Best Practices Followed ✅

1. ✅ **Input Validation**: All inputs validated and sanitized
2. ✅ **Output Encoding**: Prisma handles JSON encoding safely
3. ✅ **Rate Limiting**: Prevents abuse and DoS
4. ✅ **Error Handling**: No information leakage
5. ✅ **Secure IDs**: Cryptographically secure random generation
6. ✅ **Data Expiration**: Automatic cleanup prevents data accumulation
7. ✅ **Type Safety**: TypeScript + Prisma provide compile-time safety
8. ✅ **Transaction Safety**: Database operations use transactions
9. ✅ **CORS**: Properly configured for extension access
10. ✅ **Size Limits**: Prevents resource exhaustion

---

## Recommendations for Production

1. **Redis Rate Limiting**: Migrate rate limiting to Redis for multi-instance deployments
2. **Monitoring**: Add logging/monitoring for rate limit violations
3. **Cleanup Job**: Implement a scheduled job to clean up expired shares
4. **IP Validation**: Use a reverse proxy with trusted IP headers
5. **Analytics**: Track share creation patterns to detect abuse
6. **Content Security Policy**: Add CSP headers to share pages
7. **HTTPS Only**: Ensure all API calls use HTTPS in production

---

## Testing Recommendations

1. **Rate Limit Testing**: Verify rate limits work correctly
2. **Payload Size Testing**: Test with payloads near the 5MB limit
3. **JSON Depth Testing**: Test with deeply nested JSON structures
4. **URL Validation Testing**: Test with various malicious URL patterns
5. **Expiration Testing**: Verify shares expire and are cleaned up correctly
6. **Concurrent Request Testing**: Test behavior under load

---

## Conclusion

The Style Guide Share API implements comprehensive security measures to prevent misuse, abuse, and attacks. The combination of rate limiting, input validation, secure ID generation, and automatic expiration provides strong protection against common attack vectors.

The API is **production-ready** with the following considerations:

- ✅ Single-instance deployments: Fully ready
- ⚠️ Multi-instance deployments: Consider Redis for rate limiting
- ✅ Security: Strong protection against common attacks
- ✅ Privacy: Automatic data expiration
- ✅ Performance: Efficient database queries with indexes
