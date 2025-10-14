# Staging Environment Setup Guide

This document outlines the steps to complete the staging environment setup for Doc@Home.

## ✅ Completed Tasks

### 1. Git Branch Setup
- ✅ Created `develop` branch from `main`
- ✅ Pushed `develop` branch to GitHub repository

### 2. Deployment Configurations
- ✅ Updated `netlify.toml` with branch-specific configurations
  - Staging environment on `develop` branch
  - Production environment on `main` branch
- ✅ Created `render.yaml` for backend staging deployment
- ✅ Updated `vercel.json` for improved backend deployment

### 3. Documentation Updates
- ✅ Updated `CONTRIBUTING.md` with new staging workflow
- ✅ Updated `README.md` with deployment information
- ✅ Documented environment URLs and contribution flow

## 🔧 Manual Setup Required

### GitHub Branch Protection
Set up branch protection rules in GitHub:

1. Go to Repository Settings → Branches
2. Add rule for `main` branch:
   - Require pull request reviews before merging
   - Require status checks to pass
   - Include administrators
   - Restrict pushes to project admins only

3. Add rule for `develop` branch:
   - Require pull request reviews before merging
   - Require status checks to pass
   - Allow pushes from contributors (for feature branches)

### Netlify Setup
1. Connect the repository to Netlify (if not already connected)
2. Netlify will automatically detect the `netlify.toml` configuration
3. Branch deployments will be enabled automatically
4. Staging URL: `https://develop--docathome.netlify.app`

### Render Setup
1. Connect the repository to Render
2. Use the `render.yaml` configuration file
3. Create two web services:
   - Production: connected to `main` branch
   - Staging: connected to `develop` branch
4. Configure environment variables for both services
5. Staging URL: `https://docathome-backend-staging.onrender.com`

### Vercel Setup (Alternative)
If using Vercel for backend:
1. Connect repository to Vercel
2. Configure branch deployments
3. Set up environment variables

## 🌐 Environment URLs

| Environment | Frontend | Backend | Status |
|-------------|----------|---------|--------|
| Production | https://docathome.netlify.app | https://docathome-backend.onrender.com | ✅ Ready |
| Staging | https://develop--docathome.netlify.app | https://docathome-backend-staging.onrender.com | 🔧 Setup Required |

## 📋 Next Steps

1. Set up branch protection rules on GitHub
2. Configure Netlify deployment
3. Configure Render backend deployment
4. Test the staging environment
5. Update any hardcoded URLs in the codebase if needed

## 🔍 Testing the Setup

1. Create a test feature branch from `develop`
2. Make a small change and create a PR to `develop`
3. Verify staging deployment works
4. Merge to `develop` and test staging environment
5. Create PR from `develop` to `main` for production release