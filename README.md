# App Skeleton Template

This is a full-stack monorepo skeleton extracted from the Fiery project. It includes:
- **Backend**: Express, Prisma, Better-Auth (Google Provider).
- **Frontend**: Vite, React, Tailwind CSS, Shadcn/UI.
- **Infrastructure**: Docker Compose setup with PostgreSQL.

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (v20+)
- Google Cloud Console credentials (for Auth)

### Setup
1. Clone this template into your new project directory.
2. Configure `.env` files in `be/` and `fe/` (see their respective READMEs).
3. Run `docker-compose up` from the root.

## Structure
- `be/`: Express backend with authentication.
- `fe/`: Vite/React frontend with dashboard and auth integration.
