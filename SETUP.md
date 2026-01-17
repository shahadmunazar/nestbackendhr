# Enterprise NestJS Multi-Tenant Setup

## Prerequisites
- Node.js (v18+)
- MySQL Database

## Setup Instructions

### 1. Install Dependencies
You must install the new dependencies added to `package.json`.
```bash
npm install
```

### 2. Environment Configuration
Update the `.env` file with your database credentials.
```env
DATABASE_URL="mysql://root:password@localhost:3306/nest_hrmanagemnet_db"
```

### 3. Database Migration
Initialize the database schema.
```bash
# Since npx might struggle on your system, use the custom script added:
npm run prisma:migrate
```

### 4. Generate Client
Regenerate the Prisma Client to ensure types are correct.
```bash
npm run prisma:generate
```

### 5. Run the Application
```bash
npm run start:dev
```

## Architecture Details

- **Multi-Tenancy**: Implemented using a shared shared-database strategy.
- **Tenant Context**: The `x-tenant-id` header is extracted by `TenantMiddleware` and stored in `ClsService`.
- **Prisma Scoping**: The `PrismaService` includes a `tenantScope` getter (or automatic extension logic if you uncomment it) to extend the client with `where: { tenantId }` clauses automatically.
  - Usage: `this.prisma.tenantScope.user.findMany(...)` ensures scoping.
  - Direct access: `this.prisma.user.findMany(...)` is **unscoped** (admin mode).

## Usage Example

To make a request as a tenant:
```bash
curl -H "x-tenant-id: <tenant-uuid>" http://localhost:3000/users
```
