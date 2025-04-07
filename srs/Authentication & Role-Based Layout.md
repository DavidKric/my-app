You are an expert in Next.js authentication using NextAuth or similar.

Help me create a robust **Authentication & Role-based** system for the legal PDF app’s frontend:
1. NextAuth or Clerk integration for login, registration, password reset.
2. Roles: Admin, Lawyer, Paralegal, each controlling UI availability (Admin panel, plugin mgmt, etc.).
3. Minimal friction for user sign-in but enterprise security (e.g. SSO).
4. UI flow: login page -> project workspace (or admin panel if Admin).
5. Refer to my SRS [paste relevant section], focusing on Auth & Authorization.

Discuss:
- Setting up NextAuth in Next.js 14 (App Router).
- Storing roles in JWT or session, verifying in server components or page layout.
- Conditionally rendering components (admin only, etc.).
- Example code for sign-in, sign-up pages, protecting routes (with middlewares or protected layouts).
- Best practices for security (CSRF, session management, SSR/SSG).
- Future expansion to SSO or multi-tenant.

End with a short sample of how to wrap each major page or layout in an “auth check” so unauthorized roles see an error or get redirected.
