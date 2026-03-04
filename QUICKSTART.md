# Quick Start Guide

Get your wedding e-invitation up and running in 5 minutes!

## Prerequisites
- Node.js installed
- MySQL installed and running

## Setup Steps

### 1. Install Dependencies (1 minute)
```bash
npm install
```

### 2. Configure Database (2 minutes)

**Option A: Quick Setup (Recommended)**
```bash
# Copy environment file
cp .env.example .env

# Edit .env and set your MySQL password
# Change ADMIN_PASSWORD to something secure

# Run database setup
npm run setup-db
```

**Option B: Manual Setup**
1. Create database in MySQL: `CREATE DATABASE wedding_invitation;`
2. Update `.env` with your credentials
3. Run: `npm run setup-db`

### 3. Customize Your Information (2 minutes)

**Update couple names in all HTML files:**
- Search for "John & Alice" and replace with your names
- Search for "J & A" and replace with your initials

**Update wedding date:**
- In `index.html` line 48: Change data-date attribute
- In all pages: Update "December 31, 2026"

### 4. Start the Server
```bash
# Development mode (auto-reload)
npm run dev

# Or production mode
npm start
```

### 5. Open in Browser
```
http://localhost:3000
```

## What's Next?

### Essential Customizations:
1. ✅ Add your photos to `frontend/images/` folder
2. ✅ Add background music to `frontend/audio/` folder  
3. ✅ Update event details in `details.html`
4. ✅ Write your story in `story.html`
5. ✅ Update registry links in `registry.html`
6. ✅ Add Google Maps embed in `details.html`

### Access Admin Panel:
```
URL: http://localhost:3000/admin
Username: admin (or what you set in .env)
Password: (what you set in .env)
```

## Common Issues

**"Cannot connect to MySQL"**
- Make sure MySQL is running
- Check password in `.env` file
- Verify database exists

**"Port 3000 already in use"**
- Change PORT in `.env` to 3001 or another port
- Or stop other applications using port 3000

**Admin login doesn't work**
- Check ADMIN_USERNAME and ADMIN_PASSWORD in `.env`
- Make sure JWT_SECRET is set
- Clear browser cache and try again

## Testing Checklist

After setup, test these features:
- [ ] Homepage loads correctly
- [ ] Countdown timer is working
- [ ] Navigation works on all pages
- [ ] Music player appears and can be toggled
- [ ] RSVP form can be submitted
- [ ] Messages can be posted
- [ ] Admin panel login works
- [ ] Admin can view RSVPs and messages
- [ ] Mobile responsive design works

## Ready to Deploy?

See the full README.md for deployment instructions to:
- Heroku
- AWS
- DigitalOcean
- Railway

## Need Help?

1. Check the full `README.md` for detailed documentation
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify all environment variables are set

---

**Congratulations! Your wedding e-invitation is ready! 🎉**
