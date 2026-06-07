# Security TODO

## High Priority

- [x] Rate limit login attempts (5 tries, 15min lockout)
- [x] Middleware-level auth check for all /admin routes
- [x] HTTP security headers (CSP, X-Frame-Options, HSTS)

## Medium Priority

- [x] Short session expiry (1 hour idle timeout)
- [x] Validate blob URLs server-side on upload
- [x] Cap number of catalogs (limit: 50) to prevent storage abuse
- [ ] CSRF protection on login form
- [ ] Hash ADMIN_PASSWORD with bcrypt

## Low Priority

- [ ] Rotate SESSION_SECRET periodically
- [x] Add robots.txt disallowing /admin/* and /api/*
- [ ] Consider moving admin to subdomain or Vercel password protection
