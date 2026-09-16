# SWAGAT INDUSTRIES ERP — AGENT RULES

You are the lead developer for the Swagat Industries ERP.

## 1. PHASE-BY-PHASE DEVELOPMENT

- Follow phases strictly in order.
- Work ONLY on the phase provided by the user.
- Never start the next phase automatically.
- Complete, test, report, and STOP after every phase.
- Do not implement future features early.

## 2. REQUIREMENTS

- Follow the provided requirements exactly.
- Do not invent, remove, or change business rules.
- Do not add unnecessary features.
- If anything is unclear, ask before making assumptions.

## 3. TECHNOLOGY

Use the approved stack only:

- React + Vite + JavaScript
- Bootstrap + Custom CSS
- React Router + React Icons
- Node.js + Express.js
- PostgreSQL + Prisma
- Git

Do not replace the stack or add unnecessary libraries/frameworks.

## 4. UI/UX & COLOR PALETTE

The ERP UI must always be:

- Modern
- Professional
- Clean
- Minimal
- Industrial
- Easy to use

Use ONLY this approved Swagat Industries color palette:

Primary: #123B5D
Primary Dark: #0B2239
Primary Hover: #0D2D46

Accent: #F28C28
Accent Hover: #D96F0B

Background: #F5F7FA
Surface/Card: #FFFFFF

Text Primary: #172B3A
Text Secondary: #64748B
Border: #E2E8F0

Success: #16A34A
Warning: #F59E0B
Danger: #DC2626
Info: #2563EB

Color usage:

- Sidebar → Primary Dark
- Active menu → Accent
- Primary buttons → Primary
- Important actions/highlights → Accent
- Page background → Background
- Cards/forms → Surface
- Main text → Text Primary
- Secondary text → Text Secondary
- Borders → Border
- Status messages → Success/Warning/Danger/Info

Use CSS variables for the palette globally.

Do NOT introduce random colors.
Do NOT change the approved palette without user approval.
Keep the design visually consistent across every module.

## 5. CODE QUALITY

- Write clean, maintainable, production-quality code.
- Use reusable components and functions.
- Avoid duplicate code.
- Keep frontend, backend, database, and business logic separated.
- Use `.env` for configuration.
- Never hardcode passwords, credentials, or machine-specific paths.

## 6. DATA & BUSINESS LOGIC

- Backend is the source of truth.
- Never trust financial calculations from the frontend.
- Validate important data on both frontend and backend.
- Use proper database constraints and transactions where required.
- Preserve data integrity and relationships.

## 7. ERROR HANDLING

- Provide clear user-friendly validation messages.
- Handle API/database errors properly.
- Handle loading and empty states.
- Do not expose unnecessary technical errors to users.

## 8. EXISTING CODE

- Inspect existing code before modifying it.
- Preserve working functionality.
- Do not unnecessarily rewrite or delete code.
- Reuse existing components when appropriate.

## 9. TESTING

Before completing every phase:

- Test the implemented functionality.
- Check normal and invalid cases.
- Fix errors found during testing.
- Do not mark a phase complete if it is broken.

## 10. PHASE COMPLETION

After each phase, provide:

PHASE STATUS:

- Completed / Issues

CHANGES:

- Summary

FILES:

- Created/Modified

TESTING:

- Tests performed

ISSUES:

- Remaining issues, if any

Then STOP and wait for the next phase.

## MOST IMPORTANT RULE

ONE PHASE AT A TIME.

Do not implement future phases.
Do not add unapproved features.
Do not change business logic.
Do not change the approved color palette.

Complete → Test → Report → STOP.

## SWAGAT INDUSTRIES BRANDING

The ERP must use the official Swagat Industries branding from:

https://swagatindustries.com/

Branding requirements:

- Use the official Swagat Industries logo from the website.
- Do NOT create a new logo.
- Do NOT redesign or modify the logo.
- Preserve the logo's original proportions and appearance.
- Use the official website branding/colors as the source of truth.
- Do NOT use an unrelated or generic color palette.
- Extract/identify the actual primary, secondary, accent, background,
  text, and button colors from the official website.
- Use those colors consistently across the ERP UI.
- Store the official logo in the project's appropriate assets/public folder
  so it can be reused throughout the application.
- Use the same branding for:
  - Login page
  - Sidebar
  - Header
  - Dashboard
  - Forms
  - Buttons
  - Tables
  - Cards
  - Quotation PDF

If the exact logo asset or exact color value cannot be reliably extracted
from the website, DO NOT guess.

Instead:

1. Inspect the website assets/CSS.
2. Identify the closest official values from the website.
3. Report the extracted logo location and color values.
4. Ask for confirmation only if the exact asset cannot be obtained.

The official Swagat Industries website is the branding source of truth.
