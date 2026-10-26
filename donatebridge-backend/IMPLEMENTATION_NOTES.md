# DonateBridge implementation notes

## Changes included
- Donor donation creation is blocked unless the donor profile is VERIFIED (backend and frontend).
- NGO donation requests are blocked unless the NGO profile is VERIFIED (backend).
- Volunteer pickup acceptance and lifecycle actions are blocked unless the volunteer profile is VERIFIED (backend).
- Donors can permanently delete eligible AVAILABLE/CANCELLED donations. Donations with accepted requests or active deliveries are protected from donor deletion.
- Admins can permanently delete any donation; linked request and pickup records are cleaned up as part of deletion.
- Added workflow-scoped contact profile API: `GET /api/profiles/donation/{donationId}/contacts`. It returns phone/email/address/profile information only to an admin or a donor/NGO/volunteer involved in that donation workflow.
- Added contact panels to donor request, NGO pickup, and volunteer pickup views.
- Added admin donation deletion UI.

## Validation
- Frontend TypeScript validation passed with `tsc --noEmit`.
- Full Vite production build could not run in this environment because the uploaded `node_modules` lacks the platform-specific optional Rollup binary. Run `npm install` in `DonateBridgeFrontend` and then `npm run build`.
- Backend Maven build could not run because Maven Wrapper could not download Maven in this environment. Run `./mvnw test` or `./mvnw package` on a machine with Maven Central access.

## Configuration security
The original project contained database and Cloudinary credentials plus a JWT secret in `application.properties`. These were replaced with environment-variable placeholders in this ZIP. Set `DB_PASSWORD`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` before running. Rotate any credentials that were present in the original uploaded archive.
