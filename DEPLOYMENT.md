# AWS Deployment Guide - Rubber Track Wholesale

Complete step-by-step guide for deploying to Amazon Web Services.

## 📋 Architecture Overview

```
[Users] → [CloudFront CDN] → [S3 (Frontend)] 
                          ↓
                      [API Gateway / ALB]
                          ↓
                      [EC2 (Backend)]
                          ↓
                   [MongoDB Atlas]
```

## 🎯 Deployment Options

### Option A: Simple & Fast (Recommended for Beginners)
- Frontend: AWS Amplify (easiest)
- Backend: AWS Elastic Beanstalk
- Database: MongoDB Atlas

### Option B: Full Control
- Frontend: S3 + CloudFront
- Backend: EC2 + Application Load Balancer
- Database: MongoDB Atlas or AWS DocumentDB

---

## 🚀 Option A: Simple Deployment

### Step 1: Database (MongoDB Atlas)

1. **Create Account**
   - Go to https://cloud.mongodb.com
   - Sign up for free

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "Free" tier (M0)
   - Select AWS as cloud provider
   - Choose region closest to your users
   - Click "Create"

3. **Setup Access**
   - Create database user (username/password)
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Note: For production, restrict to specific IPs

4. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Example: `mongodb+srv://user:pass@cluster.mongodb.net/rubber_track_wholesale`

### Step 2: Backend (AWS Elastic Beanstalk)

1. **Prepare Application**
   ```bash
   cd backend
   
   # Create requirements.txt if not exists
   pip freeze > requirements.txt
   
   # Create Procfile
   echo "web: uvicorn server:app --host 0.0.0.0 --port 8000" > Procfile
   
   # Zip everything
   zip -r backend.zip . -x "*.pyc" -x "__pycache__/*" -x "venv/*"
   ```

2. **Deploy to Elastic Beanstalk**
   - Go to AWS Console → Elastic Beanstalk
   - Click "Create Application"
   - Application name: `rubber-track-api`
   - Platform: Python 3.11
   - Upload `backend.zip`
   - Click "Create environment"

3. **Configure Environment Variables**
   - Go to Configuration → Software
   - Add environment variables:
     - `MONGO_URL`: Your MongoDB Atlas connection string
     - `DB_NAME`: `rubber_track_wholesale`
     - `SECRET_KEY`: Generate random 32+ character string
   - Click "Apply"

4. **Initialize Database**
   - SSH into EB instance or use AWS Systems Manager
   - Run: `python init_data.py`

5. **Note Backend URL**
   - Example: `http://rubber-track-api.us-east-1.elasticbeanstalk.com`

### Step 3: Frontend (AWS Amplify)

1. **Build Frontend**
   ```bash
   cd frontend
   
   # Update .env with backend URL
   echo "REACT_APP_BACKEND_URL=http://your-eb-url.elasticbeanstalk.com" > .env
   
   # Build
   yarn build
   ```

2. **Deploy to Amplify**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Choose "Deploy without Git"
   - Drag and drop the `build` folder
   - Click "Save and deploy"

3. **Get Frontend URL**
   - Example: `https://main.d1234567890.amplifyapp.com`

4. **Optional: Add Custom Domain**
   - In Amplify, go to "Domain management"
   - Add your domain: `rubbertrackwholesale.com`
   - Follow DNS configuration instructions

### Step 4: Update CORS

Update backend `server.py` with your frontend URL:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-amplify-url.amplifyapp.com", "https://rubbertrackwholesale.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redeploy backend after this change.

---

## 🔧 Option B: Advanced Deployment

### Step 1: Frontend (S3 + CloudFront)

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://rubbertrackwholesale-frontend
   aws s3 website s3://rubbertrackwholesale-frontend --index-document index.html
   ```

2. **Build & Upload**
   ```bash
   cd frontend
   yarn build
   aws s3 sync build/ s3://rubbertrackwholesale-frontend
   ```

3. **Create CloudFront Distribution**
   - Origin: Your S3 bucket
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Default Root Object: index.html
   - Custom Error Response: 404 → /index.html (for React Router)

4. **Get CloudFront URL**
   - Example: `https://d111111abcdef8.cloudfront.net`

### Step 2: Backend (EC2)

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.small or larger
   - Security Group: Allow ports 80, 443, 8001

2. **SSH and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Install dependencies
   sudo apt update
   sudo apt install python3-pip python3-venv nginx -y
   
   # Clone or upload your code
   cd /home/ubuntu
   unzip backend.zip
   
   # Setup Python
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Set environment variables
   nano .env
   # Add: MONGO_URL, DB_NAME, SECRET_KEY
   
   # Initialize database
   python init_data.py
   ```

3. **Setup Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/backend
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name api.rubbertrackwholesale.com;
       
       location / {
           proxy_pass http://localhost:8001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
   
   Enable:
   ```bash
   sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Setup Systemd Service**
   ```bash
   sudo nano /etc/systemd/system/backend.service
   ```
   
   Add:
   ```ini
   [Unit]
   Description=Rubber Track Backend
   After=network.target
   
   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/backend
   Environment="PATH=/home/ubuntu/backend/venv/bin"
   EnvironmentFile=/home/ubuntu/backend/.env
   ExecStart=/home/ubuntu/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   Start:
   ```bash
   sudo systemctl enable backend
   sudo systemctl start backend
   sudo systemctl status backend
   ```

5. **Setup SSL (Let's Encrypt)**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d api.rubbertrackwholesale.com
   ```

---

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Use strong SECRET_KEY (32+ random characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Restrict MongoDB IP whitelist
- [ ] Set up AWS WAF (Web Application Firewall)
- [ ] Enable CloudWatch logging
- [ ] Set up backup strategy
- [ ] Use AWS Secrets Manager for sensitive data
- [ ] Configure security groups properly
- [ ] Enable MFA for AWS account

## 📊 Monitoring

### CloudWatch (AWS)
- Set up alarms for:
  - High CPU usage
  - High memory usage
  - Error rates
  - API latency

### MongoDB Atlas
- Enable monitoring and alerts
- Set up automated backups

## 💰 Cost Estimates (Monthly)

### Minimal Setup:
- MongoDB Atlas (Free tier): $0
- Elastic Beanstalk (t3.micro): ~$10
- Amplify: ~$0.15 per GB served
- **Total: ~$15-30/month**

### Production Setup:
- MongoDB Atlas (M10): ~$60
- EC2 (t3.small): ~$15
- S3 + CloudFront: ~$5-20
- Application Load Balancer: ~$20
- **Total: ~$100-150/month**

## 🔄 Updates & Maintenance

### Update Backend:
```bash
# SSH to EC2
cd /home/ubuntu/backend
git pull  # or upload new files
sudo systemctl restart backend
```

### Update Frontend:
```bash
cd frontend
yarn build
aws s3 sync build/ s3://your-bucket --delete
# CloudFront invalidation
aws cloudfront create-invalidation --distribution-id YOUR-ID --paths "/*"
```

## 🆘 Troubleshooting

### Backend not starting:
```bash
# Check logs
sudo journalctl -u backend -f

# Check if port is in use
sudo lsof -i :8001
```

### Database connection issues:
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Test connection: `mongosh "your-connection-string"`

### CORS errors:
- Verify REACT_APP_BACKEND_URL matches actual backend URL
- Check CORS settings in server.py
- Ensure frontend and backend domains are configured

## 📚 Additional Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)

## ✅ Deployment Verification

After deployment, verify:
1. ✅ Frontend loads at your domain
2. ✅ Can login to admin panel
3. ✅ Products display correctly
4. ✅ Can add/edit products in admin
5. ✅ Search functionality works
6. ✅ Contact form submits
7. ✅ All pages load correctly
8. ✅ Mobile responsive design works
9. ✅ HTTPS enabled
10. ✅ SEO meta tags visible in page source

---

**🎉 Your e-commerce platform is now live on AWS!**

For support, contact your development team or AWS support.
