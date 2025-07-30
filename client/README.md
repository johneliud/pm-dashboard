# Project Management Dashboard

A comprehensive project management dashboard that integrates with GitHub Projects to provide real-time analytics, team performance tracking, and project insights.

## Features

- **GitHub Integration**: Sync data from GitHub Projects automatically
- **Real-time Analytics**: Track project progress, velocity, and team performance
- **Milestone Tracking**: Monitor milestone progress and deadlines
- **Team Performance**: Analyze workload distribution and productivity
- **Risk Analysis**: Identify potential project risks and bottlenecks
- **Sprint Tracking**: Monitor sprint progress and burndown charts

## Architecture

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication
- **GitHub API**: Integration with GitHub GraphQL API

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- GitHub Personal Access Token
- Git

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project-management-dashboard
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/pm_dashboard

# GitHub Integration
GITHUB_TOKEN=your_github_personal_access_token_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Database Setup

The database will be automatically initialized when you start the server for the first time. The schema includes:

- Users and authentication
- Projects and GitHub integration
- Work items and team members
- Analytics and performance data

## GitHub Token Setup

### Creating a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "PM Dashboard Token")
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `read:project` (Read access to projects)
   - `read:user` (Read access to user profile)
   - `read:org` (Read access to organization data)

### Adding GitHub Credentials in the Web App

1. **Register/Login** to the dashboard
2. **Create a New Project**:
   - Project Name: Your project display name
   - GitHub Owner: Username or organization name
   - GitHub Repository: Repository name
   - GitHub Project Number: Found in your GitHub project URL (`/projects/[number]`)

3. **Project Sync**: The app will automatically test the GitHub connection and sync data

### Finding Your GitHub Project Number

Your GitHub project number is in the URL:
- `https://github.com/users/username/projects/1` → Project Number: `1`
- `https://github.com/orgs/orgname/projects/5` → Project Number: `5`

## Running the Application

### Development Mode

1. **Start the backend**:
```bash
cd server
npm run dev
```

2. **Start the frontend** (in a new terminal):
```bash
cd client
npm start
```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Production Deployment

#### Backend (Render)
1. Connect your GitHub repository to Render
2. Set Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables in Render dashboard

#### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set Root Directory: `client`
3. Build Command: `npm run build`
4. Output Directory: `build`
5. Install Command: `npm install`
6. Add environment variable: `REACT_APP_API_URL=https://your-render-app.onrender.com/api`

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@host:port/database
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=production
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

## Core Features

### 1. Project Overview
- Progress indicators showing completion status
- Milestone timeline and progress
- Recent activity and updates

### 2. Team Performance
- Individual workload analysis
- Velocity tracking over time
- Performance metrics and trends

### 3. Work Item Analytics
- Status distribution charts
- Priority and size analysis
- Completion trends

### 4. Sprint Tracking
- Sprint burndown charts
- Velocity measurements
- Sprint goal tracking

## Security

- JWT-based authentication with secure token storage
- Environment variables for sensitive configuration
- CORS protection for API endpoints
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **GitHub API Rate Limits**
   - Ensure your token has proper permissions
   - Check rate limit status in API responses

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Ensure PostgreSQL is running
   - Check firewall settings

3. **CORS Errors**
   - Update CORS origins in server configuration
   - Verify frontend URL matches CORS settings

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Project Endpoints
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `POST /api/projects/:id/sync` - Sync project data
- `GET /api/projects/:id/items` - Get project items

### Analytics Endpoints
- `GET /api/analytics/:projectId/overview` - Project overview data
- `GET /api/analytics/:projectId/milestones` - Milestone progress
- `GET /api/analytics/:projectId/team-workload` - Team performance
- `GET /api/analytics/:projectId/risk-analysis` - Risk assessment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation

---

**Note**: Make sure to keep your GitHub token secure and never commit it to version control. Use environment variables for all sensitive configuration.
