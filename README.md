# Rubber Track Wholesale - E-Commerce Platform

Complete production-ready e-commerce platform for selling rubber tracks and undercarriage parts with advanced SEO features.

## 🚀 Features

### Frontend
✅ Modern Industrial Design - Dark slate with orange accents  
✅ Responsive Mobile-Friendly  
✅ Product Catalog - Browse by brand, category  
✅ Dynamic Search - Find by track size, SKU, part number  
✅ SEO Optimized Pages  

### Admin Panel
✅ Dashboard with Statistics  
✅ Product Management (Add/Edit/Delete with images)  
✅ SEO Management (Meta tags, schema, alt tags)  
✅ Brand & Category Management  
✅ Order & Customer Management  
✅ Contact Message Management  

### Advanced SEO
✅ Schema Markup (JSON-LD) Auto-generated  
✅ Dynamic Meta Tags  
✅ Semantic HTML  
✅ Image Alt Tags  
✅ Structured Data  

## 🛠️ Tech Stack

**Frontend:** React 19, Tailwind CSS, Shadcn UI  
**Backend:** Python FastAPI, MongoDB, JWT Auth  

## 📦 Quick Start

### Default Admin Access
- URL: `http://localhost:3000/admin/login`
- Username: `admin`
- Password: `admin123`

⚠️ **Change password immediately in production!**

## 📁 Code Location

All code is in `/app` directory:
- Frontend: `/app/frontend/`
- Backend: `/app/backend/`

## 💾 Download Your Code

### From Emergent Platform:
1. Look for "Export Code" or "Download Project" button in Emergent interface
2. Or ask Emergent support: "How do I download my project?"
3. You'll get a ZIP file with all code

### Share with Your Developer:
- Send ZIP file via email/Google Drive/Dropbox
- OR push to GitHub and share the repository link
- OR give developer access to this Emergent workspace

## 🌐 Deployment Guide

### Option 1: MongoDB Atlas + AWS (Recommended)

**Database (MongoDB Atlas):**
1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Get connection string
4. Update `backend/.env` with connection string

**Frontend (AWS Amplify):**
```bash
cd frontend
yarn build
# Upload build/ folder to AWS Amplify
```

**Backend (AWS EC2):**
```bash
# SSH into EC2 instance
git clone your-repo
cd backend
pip install -r requirements.txt
python init_data.py
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Option 2: Simple Hosting
- Frontend: Vercel, Netlify
- Backend: Railway, Render, Heroku
- Database: MongoDB Atlas

## 📖 For Your Developer

### Setup Steps:
1. **Extract ZIP file**
2. **Install dependencies:**
   ```bash
   cd frontend && yarn install
   cd backend && pip install -r requirements.txt
   ```
3. **Configure environment:**
   - Create `frontend/.env`
   - Create `backend/.env`
   - Set MongoDB connection
4. **Initialize database:**
   ```bash
   cd backend && python init_data.py
   ```
5. **Run locally:**
   ```bash
   # Frontend
   cd frontend && yarn start
   
   # Backend
   cd backend && uvicorn server:app --reload
   ```

### Environment Variables:

**frontend/.env:**
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

**backend/.env:**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=rubber_track_wholesale
SECRET_KEY=change-this-secret-key-min-32-chars
```

## 🎯 Key Files

- `/app/contracts.md` - API documentation
- `/app/backend/init_data.py` - Database initialization script
- `/app/backend/server.py` - Main backend server
- `/app/frontend/src/App.js` - Main React app

## 📞 Need Help?

Your developer can:
- Check `/app/contracts.md` for API details
- Run `python init_data.py` to reset database
- Visit `http://localhost:8001/docs` for API documentation

## ✅ What's Included

✅ Complete working frontend (public website)  
✅ Complete working backend (API + database)  
✅ Admin panel with SEO management  
✅ 3 sample products already loaded  
✅ 9 brands pre-configured  
✅ 5 product categories  
✅ JWT authentication  
✅ Schema markup generation  
✅ All SEO features  

## 🚀 Production Checklist

- [ ] Change admin password
- [ ] Set up MongoDB Atlas
- [ ] Configure AWS/hosting
- [ ] Update environment variables
- [ ] Set up HTTPS/SSL
- [ ] Test all features
- [ ] Add real product images
- [ ] Configure domain name

---

**🎉 Your complete e-commerce platform is ready!**

Give the ZIP file to your developer and they'll have everything needed to deploy on AWS or any hosting platform.
