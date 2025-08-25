# Digital Claims Management System - Frontend

Enterprise-grade React application for insurance claims management with role-based access control, multi-step forms, document uploads, and real-time status tracking.

## Features

- **Multi-Role Support**: Policyholder, Adjuster, Supervisor, and Admin roles
- **Claims Management**: Submit, review, approve, and track insurance claims
- **Multi-Step Forms**: Guided claim submission with validation
- **Document Upload**: Secure file uploads with S3 integration
- **Real-time Updates**: Live status tracking and notifications
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **State Management**: Redux Toolkit for predictable state management
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Redux Toolkit** - State management with RTK Query
- **React Router** - Client-side routing
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Dropzone** - File upload handling
- **React Hot Toast** - Toast notifications

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running on port 8080

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_AWS_REGION=us-east-1
REACT_APP_S3_BUCKET=your-s3-bucket
```

4. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`.

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run test:e2e` - Run end-to-end tests with Playwright

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   └── layout/         # Layout components (Header, Sidebar)
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── claims/         # Claims-related pages
│   └── admin/          # Admin pages
├── store/              # Redux store and slices
│   └── slices/         # Redux slices
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and API calls
├── hooks/              # Custom React hooks
└── App.tsx             # Main application component
```

## Key Features

### Role-Based Access Control (RBAC)

The application supports four user roles with different permissions:

- **Policyholder**: Submit and track own claims
- **Adjuster**: Review and process assigned claims
- **Supervisor**: Oversee all claims, assign work, approve high-value claims
- **Admin**: Full system access, user management, system settings

### Claims Workflow

1. **Submission**: Multi-step form with policy selection, incident details, item listing, and document upload
2. **Triage**: Automatic assignment based on claim type and value
3. **Review**: Adjuster reviews claim, requests additional information if needed
4. **Approval**: Supervisor approval for high-value claims
5. **Payment**: Processing and tracking of approved claims
6. **Audit**: Complete audit trail of all actions

### State Management

Uses Redux Toolkit with the following slices:
- `authSlice` - User authentication and profile
- `claimsSlice` - Claims data and operations
- `uiSlice` - UI state (sidebar, notifications, theme)

### Form Handling

React Hook Form with Zod validation provides:
- Type-safe form validation
- Real-time error feedback
- Optimized re-renders
- Easy integration with TypeScript

### File Uploads

Secure file upload system with:
- Drag-and-drop interface using React Dropzone
- Client-side file validation
- S3 presigned URL uploads
- File type and size restrictions
- Progress tracking

## Testing

### Unit Tests
```bash
npm test
```

### End-to-End Tests
```bash
npm run test:e2e
```

Test files are located in:
- `src/**/*.test.tsx` - Unit tests
- `e2e/` - Playwright E2E tests

## Deployment

### Build for Production
```bash
npm run build
```

### Docker Deployment
```bash
docker build -t claims-frontend .
docker run -p 3000:3000 claims-frontend
```

### AWS Deployment
The application is designed to be deployed on AWS with:
- **CloudFront** - CDN and static hosting
- **S3** - Static file storage
- **ALB** - Load balancing
- **ECS** - Container orchestration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8080/api` |
| `REACT_APP_AWS_REGION` | AWS region | `us-east-1` |
| `REACT_APP_S3_BUCKET` | S3 bucket for documents | - |
| `REACT_APP_COGNITO_USER_POOL_ID` | Cognito User Pool ID | - |
| `REACT_APP_COGNITO_CLIENT_ID` | Cognito Client ID | - |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
