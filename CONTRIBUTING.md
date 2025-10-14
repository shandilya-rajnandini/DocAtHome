# 🙌 Contributing to Doc@Home

Thank you for your interest in contributing to **Doc@Home**!  
We’re happy to welcome new contributors — whether you’re fixing bugs, improving documentation, or suggesting features. Let’s build something great together!

---

## 🚀 How to Contribute (Fork and Pull Request Workflow)

Follow these simple steps to make your contribution:

1. Fork this repository by clicking the **Fork** button at the top-right corner.

2. Clone your forked repository to your local machine:

   git clone https://github.com/Gupta-02/DocAtHome.git  
   cd DocAtHome

3. Create a new branch from `develop`:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b your-feature-branch
   ```

4. Make your changes in code or documentation.

5. Stage and commit your changes:

   git add .  
   git commit -m "your commit message"

6. Push your changes:

   git push origin your-branch-name

7. Open GitHub → go to your fork → click **"Compare & pull request"** to open a pull request targeting the `develop` branch.

---

## 🌟 Staging Environment Workflow

We use a **staging-first deployment strategy** to ensure quality and prevent bugs from reaching production:

### Branch Structure
- **`main`** - Production branch (only project admins can merge)
- **`develop`** - Staging branch for testing new features

### Deployment URLs
- **Production**: https://docathome.netlify.app
- **Staging**: https://develop--docathome.netlify.app (auto-deployed from `develop` branch)
- **Backend Production**: https://docathome-backend.onrender.com
- **Backend Staging**: https://docathome-backend-staging.onrender.com

### Contribution Flow
1. **Create feature branch** from `develop`
2. **Make changes** and test locally
3. **Push to your fork** and create PR to `develop`
4. **Test on staging** - Your changes will be automatically deployed to staging
5. **Project admin reviews** and merges to `develop`
6. **Final testing** on staging environment
7. **Release to production** - Admin merges `develop` into `main`

### Testing Requirements
- ✅ All tests pass locally
- ✅ Feature works on staging environment
- ✅ No breaking changes
- ✅ Code review approved

---

## 📝 Commit Message Guidelines

Use clear and meaningful commit messages. Follow this format:

```
type(scope): short description
```

**Examples:**

- `feat(auth): add two-factor authentication`
- `fix(profile): resolve avatar upload issue`
- `docs(contributing): update staging workflow`
- `refactor(api): optimize database queries`

**Common types:**

- `feat` = new feature
- `fix` = bug fix
- `docs` = documentation only changes
- `style` = formatting only
- `refactor` = code restructure (no logic change)
- `test` = adding or updating tests
- `chore` = maintenance tasks

---

## 🛠️ Project Setup (Local Installation)

To run the project locally, follow these steps:

**Requirements:**

- Node.js and npm  
- MongoDB (local or MongoDB Atlas)

**Backend Setup:**

cd backend  
npm install  

Create a `.env` file in the `backend` folder with the following:

PORT=5000  
MONGO_URI=<your_mongodb_connection_string>  
JWT_SECRET=<your_jwt_secret>  
RAZORPAY_KEY_ID=<your_razorpay_key_id>  
RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>  

Start the backend server:  
npm run dev

**Frontend Setup:**

cd ../frontend  
npm install  

Create a `.env` file in the `frontend` folder with:

VITE_RAZORPAY_KEY_ID=<your_razorpay_key_id>  

Start the frontend server:  
npm run dev

Then open your browser and go to: http://localhost:5173

---

## 🐞 Reporting a Bug or Suggesting a Feature

To report a bug or request a new feature:

1. Go to the [Issues](https://github.com/shandilya-rajnandini/DocAtHome/issues) tab.

2. Click **"New issue"**.

3. Choose:

   - **Bug Report**: Describe the problem and how to reproduce it.  
   - **Feature Request**: Describe the idea and why it's useful.

Please be respectful, clear, and helpful.

---

Thank you for helping improve Doc@Home! 💙  
Your contribution means a lot.

