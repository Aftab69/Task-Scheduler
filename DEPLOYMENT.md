# Task Scheduler - Render.com Deployment Guide

## 🚀 Quick Deployment Overview

This guide will help you deploy the Task Scheduler application on Render.com using the Free tier.

### 📋 Prerequisites

1. **Render.com Account**: Free tier account
2. **GitHub Repository**: Code pushed to GitHub
3. **MongoDB Atlas**: Database configured and running
4. **Domain**: Optional (using default Render URLs)

---

## 🛠️ Step 1: Backend Deployment

### Create Backend Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

```
Name: task-scheduler-backend
Environment: Node
Root Directory: ./server
Build Command: npm install
Start Command: npm run server
Instance Type: Free
```

### Environment Variables

Add these environment variables in the Render dashboard:

```
MONGODB_URI=mongodb+srv://roomboom812_db_user:PnpmIEgfqvkific6@cluster0.b4fxvdu.mongodb.net/?appName=Cluster0
JWT_SECRET=your_secure_jwt_secret_here_minimum_32_characters
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://task-scheduler-frontend.onrender.com
```

**Important**: Generate a secure JWT secret using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎨 Step 2: Frontend Deployment

### Create Frontend Static Site

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure the service:

```
Name: task-scheduler-frontend
Root Directory: ./
Build Command: npm run build
Publish Directory: dist
Instance Type: Free
Auto-Deploy: Yes (on push to main)
```

### Environment Variables

Add this environment variable:

```
VITE_API_URL=https://task-scheduler-backend.onrender.com/api
```

---

## 🧪 Step 3: Testing & Verification

### Test Backend API

1. Wait for backend deployment to complete
2. Test health endpoint: `https://task-scheduler-backend.onrender.com/health`
3. Test authentication endpoints

### Test Frontend Application

1. Wait for frontend deployment to complete
2. Visit: `https://task-scheduler-frontend.onrender.com`
3. Test user registration and login
4. Verify task management functionality

---

## 🔧 Configuration Files

### Updated Files for Production

1. **`src/api/config.js`** - Dynamic API URL detection
2. **`server/server.js`** - Production-ready CORS and port configuration
3. **`.env.example`** - Environment variable documentation

### Key Changes Made

- Backend uses `process.env.PORT` for Render's port (10000)
- CORS configured for production security
- API URL dynamically detects production environment
- Environment variables properly configured

---

## 🔒 Security Considerations

### ✅ Implemented Security

- JWT authentication with secure secrets
- CORS configuration for allowed origins
- Password hashing with bcrypt (cost factor 12)
- Input validation and sanitization
- Protected API routes

### 🔐 Production Security

1. **MongoDB Atlas**: Configure IP whitelist for Render's ranges
2. **JWT Secret**: Use a strong, unique secret (32+ characters)
3. **Environment Variables**: Never commit to version control
4. **HTTPS**: Automatically handled by Render

---

## 📊 Monitoring & Troubleshooting

### Logs

- **Backend**: Render Dashboard → Web Service → Logs
- **Frontend**: Render Dashboard → Static Site → Logs

### Common Issues

1. **CORS Errors**: Check FRONTEND_URL environment variable
2. **Database Connection**: Verify MONGODB_URI string
3. **Build Failures**: Check package.json build scripts
4. **Port Conflicts**: Backend should use port 10000 on Render

### Performance Monitoring

Monitor these metrics in Render Dashboard:
- Response times
- Error rates
- Memory usage
- Build times

---

## 🌐 Deployment URLs

After successful deployment:

- **Backend**: `https://task-scheduler-backend.onrender.com`
- **Frontend**: `https://task-scheduler-frontend.onrender.com`
- **API Base URL**: `https://task-scheduler-backend.onrender.com/api`

---

## 💡 Tips & Best Practices

1. **Local Testing**: Always test changes locally before deploying
2. **Branch Strategy**: Use separate branches for development
3. **Rollbacks**: Render automatically keeps previous deployments
4. **Environment Separation**: Use different environment variables for dev/prod
5. **Database Backups**: Regular backups in MongoDB Atlas

---

## 🆘 Support

If you encounter issues:

1. Check Render logs for error messages
2. Verify environment variables are correctly set
3. Ensure MongoDB Atlas allows connections from Render
4. Test locally with production environment variables

For Render-specific issues: [Render Documentation](https://render.com/docs)

---

## 📝 Post-Deployment Checklist

- [ ] User registration works
- [ ] User login/logout functions
- [ ] Task CRUD operations work
- [ ] Calendar widget displays correctly
- [ ] Database operations are successful
- [ ] CORS properly configured
- [ ] SSL/HTTPS working (automatic)
- [ ] Mobile responsive design verified
- [ ] Error handling tested
- [ ] Performance is acceptable