# Jules Coding & Integration Guidelines

Welcome! This file provides instructions, API configurations, and rules for developing, testing, and securing this repository.

## 🛠️ MCP & Third-Party Integrations

You have access to the following backend services. Use them to verify data, deploy, or maintain UI consistency:

### 1. Supabase (Database & Backend)
- **Database Schema:** Check `prisma/schema.prisma` or `migration.sql` for the current table schemas.
- **Client Initialization:** The app uses `@supabase/supabase-js` or Prisma Client to connect.
- **Rules:**
  - Always validate database queries to prevent SQL injections.
  - Implement mock database models if you are testing features in a client-only environment.

### 2. Stitch (Design System & UI/UX)
- **Design Principles:** Use Tailwind CSS, Shadcn UI, and glassmorphism styling.
- **Theme:** Sleek dark-mode / high-fidelity aesthetics.
- **Animations:** Use `framer-motion` for micro-animations (e.g., hover states, sheet slide-outs, list item transitions).

### 3. Render (Staging & Deployment)
- **Service Name:** `omni-flow`
- **Service ID:** `srv-d5f03gmmcj7s73asfui0`
- **Auto-Deploy:** Enabled on commits to the `main` branch.
- **Manual Trigger:** If you need to trigger a deployment test, use the environment variable `RENDER_API_KEY` (never hardcode it):
  ```javascript
  const renderApiKey = process.env.RENDER_API_KEY;
  if (renderApiKey) {
    fetch('https://api.render.com/v1/services/srv-d5f03gmmcj7s73asfui0/deploys', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${renderApiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }
  ```

## 🛡️ Security & Zero-Defects Standard

1. **Security Vulnerability Hardening:**
   - Never commit hardcoded secret keys or API tokens.
   - Always sanitize inputs against XSS and injection vulnerabilities.
   - If an error is caught in a try/catch block, log a sanitized message; never expose raw error stacks to the client.
2. **Build and Verification:**
   - Always run `npm run build` or `pnpm build` before submitting a Pull Request.
   - Fix all ESLint warnings and TypeScript compilation errors.
