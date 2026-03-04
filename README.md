# Wedding E-Invitation

A modern, elegant, and fully-featured wedding e-invitation website with dark mode support and complete backend system.

## Version

**Current Version:** v1.0.0 (March 2026)

See [Changelog](#changelog) for version history.

---

## Features

### Frontend Features
- ✨ **Modern & Minimal Design** - Clean white aesthetic with elegant typography
- 🌙 **Dark Mode** - Toggle between light and dark themes (preference saved)
- 📱 **Fully Responsive** - Works perfectly on all devices (mobile, tablet, desktop)
- ⏱️ **Countdown Timer** - Live countdown to the wedding day
- 🖼️ **Photo Gallery** - Beautiful gallery with lightbox functionality
- 🎵 **Background Music** - Music player with toggle controls
- 📝 **RSVP Form** - Guests can confirm attendance online
- 💬 **Guest Messages** - Visitors can leave congratulatory messages
- 🎁 **Gift Registry** - Bank account information and gift details
- 📍 **Event Details** - Complete information with Google Maps integration
- 📖 **Our Story** - Timeline of your relationship journey
- 🎨 **Smooth Animations** - Hover effects and 3D transforms
- 🧭 **Smart Navigation** - Sidebar on home, back button on other pages

### Backend Features
- 🔐 **Secure Admin Panel** - JWT-based authentication
- 💾 **MySQL Database** - Persistent storage for RSVPs and messages
- 📊 **Analytics Dashboard** - View RSVP statistics and manage responses
- ✅ **Message Moderation** - Approve or delete guest messages
- 🛡️ **Input Validation** - Server-side validation and XSS protection
- 🚀 **RESTful API** - Clean API endpoints for all operations

---

## Tech Stack

### Frontend
- HTML5, CSS3 (CSS Variables for theming)
- Vanilla JavaScript (ES6+)
- Google Fonts (Cormorant Garamond, Montserrat)
- Responsive Design with mobile-first approach
- Dark Mode with localStorage persistence

### Backend
- Node.js
- Express.js
- MySQL (with mysql2 driver)
- JWT for authentication
- bcryptjs for password hashing
- dotenv for environment configuration

---

## Project Structure

```
Wedding E-Invitation/
├── frontend/
│   ├── index.html              # Home page with sidebar
│   ├── story.html              # Our Story
│   ├── gallery.html            # Photo Gallery
│   ├── details.html            # Event Details
│   ├── rsvp.html               # RSVP Form
│   ├── messages.html           # Guest Messages
│   ├── registry.html           # Gift Registry
│   ├── admin.html              # Admin Panel
│   ├── css/
│   │   └── main.css            # Main styles with dark mode
│   ├── js/
│   │   └── main.js             # Core functionality
│   ├── images/                 # Your photos
│   └── audio/                  # Background music
├── backend/
│   ├── server.js               # Express server
│   ├── config/
│   │   ├── database.js         # MySQL connection
│   │   └── setup.js            # Database setup script
│   ├── routes/                 # API routes
│   └── middleware/             # Authentication & validation
├── package.json
├── .env                        # Environment variables
├── .gitignore
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher) or XAMPP
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/wedding-e-invitation.git
cd wedding-e-invitation
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure MySQL Database

**For XAMPP users:**
1. Start Apache and MySQL from XAMPP Control Panel
2. The default MySQL password is empty

**For standalone MySQL:**
1. Make sure MySQL is running
2. Note your MySQL root password

### Step 4: Configure Environment Variables

Create/edit `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=wedding_invitation
DB_PORT=3306

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123

# JWT Secret (change this!)
JWT_SECRET=your_random_secret_key_here

# Server
PORT=3000
```

### Step 5: Set Up the Database

Run the database setup script:
```bash
npm run setup-db
```

This will:
- Create the database if it doesn't exist
- Create the required tables (rsvp, messages, admin_users)
- Create admin user with hashed password

### Step 6: Customize Your Wedding Details

#### Update Couple Names

**All HTML files:**
- Replace "Dika & Sasa" with your names
- Replace "Andika Noor Ismawan" and "Nadia Salsabila Melyani" with your full names
- Update "D & S" in the sidebar brand (index.html only)

**Key files to edit:**
- `index.html`: Lines 22, 37, 38
- `story.html`: Update story content
- `details.html`: Update venue, date, and location
- `registry.html`: Update bank account details

#### Update Wedding Date

**index.html:**
- Line 38: Update displayed date
- Line 43: Update countdown date in JavaScript

**main.js:**
- Line 33: Update wedding date for countdown timer
```javascript
const weddingDate = new Date('2026-12-31T18:00:00').getTime();
```

#### Add Your Photos

1. Place your photos in `frontend/images/` folder
2. Update image references in HTML files
3. Recommended image sizes:
   - Gallery: 800x800px (square)
   - Story: 600x400px
   - Optimized for web (compressed)

#### Add Background Music

1. Place your music file (MP3 format) in `frontend/audio/` folder
2. Name it `wedding-music.mp3` or update the reference in HTML files

#### Update Event Details

**details.html:**
- Update venue name, address, and time
- Replace Google Maps iframe with your venue location
- Update dress code information

**registry.html:**
- Update bank account numbers
- Update account names
- Update mailing address

### Step 7: Run the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Step 8: Access the Admin Panel

1. Navigate to `http://localhost:3000/admin`
2. Login with credentials from `.env`:
   - Username: `admin`
   - Password: `changeme123`
3. View RSVPs and manage messages

---

## API Endpoints

### Public Endpoints

#### RSVP
- `POST /api/rsvp` - Submit an RSVP
- `GET /api/rsvp/check/:email` - Check RSVP status

#### Messages
- `GET /api/messages` - Get approved messages
- `POST /api/messages` - Submit a message

### Admin Endpoints (Require Authentication)

#### Authentication
- `POST /api/admin/login` - Admin login (returns JWT token)

#### RSVP Management
- `GET /api/admin/rsvps` - Get all RSVPs with statistics
- `DELETE /api/admin/rsvps/:id` - Delete an RSVP

#### Message Management
- `GET /api/admin/messages` - Get all messages (including unapproved)
- `PATCH /api/admin/messages/:id/approve` - Approve a message
- `DELETE /api/admin/messages/:id` - Delete a message

---

## Dark Mode

The website includes a dark mode toggle that:
- Switches between light and dark themes
- Saves user preference to localStorage
- Persists across page refreshes and navigation
- Icon changes: 🌙 (light mode) → ☀️ (dark mode)
- Available on all pages

**Toggle button location:**
- Desktop: Top-right corner
- Mobile: Adjusted for smaller screens

---

## Customization Guide

### Change Color Scheme

Edit `frontend/css/main.css` and modify CSS variables:

**Light Mode:**
```css
:root {
  --color-primary: #000000;      /* Text color */
  --color-secondary: #333333;    /* Secondary text */
  --color-muted: #666666;        /* Muted text */
  --color-light: #ffffff;        /* Background */
  --color-bg: #fafafa;           /* Alt background */
  --color-border: #e8e8e8;       /* Borders */
}
```

**Dark Mode:**
```css
[data-theme="dark"] {
  --color-primary: #ffffff;      /* Text color */
  --color-secondary: #e0e0e0;    /* Secondary text */
  --color-muted: #999999;        /* Muted text */
  --color-light: #0a0a0a;        /* Background */
  --color-bg: #1a1a1a;           /* Alt background */
  --color-border: #2a2a2a;       /* Borders */
}
```

### Adjust Spacing

Spacing system in `main.css`:
```css
--space-xs: 0.5rem;    /* 8px */
--space-sm: 1rem;      /* 16px */
--space-md: 1.5rem;    /* 24px */
--space-lg: 2rem;      /* 32px */
--space-xl: 3rem;      /* 48px */
--space-2xl: 4rem;     /* 64px */
--space-3xl: 6rem;     /* 96px */
```

### Change Fonts

Update Google Fonts link in HTML files and CSS variables:
```css
--font-primary: 'Your Serif Font', serif;
--font-secondary: 'Your Sans Font', sans-serif;
```

---

## Deployment

### Deploy to Production Server

1. **Set environment to production:**
```env
NODE_ENV=production
```

2. **Use process manager (PM2):**
```bash
npm install -g pm2
pm2 start backend/server.js --name wedding
pm2 startup
pm2 save
```

3. **Set up reverse proxy (Nginx):**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Get SSL certificate (Certbot):**
```bash
sudo certbot --nginx -d yourdomain.com
```

### Important: Security Checklist

Before going live:
- [ ] Change `ADMIN_PASSWORD` to a strong password
- [ ] Generate secure `JWT_SECRET` (32+ characters)
- [ ] Enable HTTPS with SSL certificate
- [ ] Update CORS settings for your domain
- [ ] Set up database backups
- [ ] Test all features thoroughly
- [ ] Remove sensitive data from git history

---

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
mysql --version

# Test connection
mysql -u root -p

# Verify credentials in .env
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=3001

# Or kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill
```

### Dark Mode Not Working
- Check browser localStorage is enabled
- Clear browser cache
- Check browser console for JavaScript errors
- Verify `initDarkMode()` is being called

### Admin Login Not Working
- Verify credentials in `.env`
- Check JWT_SECRET is set
- Clear browser localStorage
- Check browser console for errors

---

## Changelog

### v1.0.0 (March 2026)
**Initial Release**

#### Features
- ✨ Clean minimal white design
- 🌙 Dark mode with localStorage persistence
- 📱 Fully responsive layout
- 🎨 Smooth hover effects and 3D transforms
- ⏱️ Live countdown timer
- 🖼️ Photo gallery with lightbox
- 🎵 Background music player
- 📝 RSVP form with validation
- 💬 Guest messages system
- 🎁 Gift registry page
- 📖 Love story timeline
- 🧭 Smart navigation (sidebar on home, back button on others)

#### Backend
- 🔐 JWT authentication
- 💾 MySQL database integration
- 📊 Admin panel for RSVP and message management
- 🛡️ Input validation and XSS protection
- 🚀 RESTful API endpoints

#### Technical
- Node.js + Express backend
- Vanilla JavaScript (no frameworks)
- CSS Variables for theming
- Mobile-first responsive design
- Modular and maintainable code structure

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible changes
- **MINOR** version for new features (backward-compatible)
- **PATCH** version for bug fixes

### Version History
- **v1.0.0** - Initial release with core features

### Planned Updates
- v1.1.0 - Additional language support (coming soon)
- v1.2.0 - Guest list management (coming soon)
- v1.3.0 - Photo upload by guests (coming soon)

---

## Contributing

This is a personal wedding invitation project, but feel free to:
- Fork for your own wedding
- Submit bug reports
- Suggest improvements
- Share your customizations

---

## License

This project is provided as-is for personal use. Feel free to modify and customize for your wedding!

---

## Credits

**Developed for:** Andika Noor Ismawan (Dika) & Nadia Salsabila Melyani (Sasa)  
**Design:** Modern minimalist wedding invitations  
**Fonts:** Google Fonts (Cormorant Garamond, Montserrat)  
**Icons:** Unicode emojis

---

Made with ❤️ for your special day

**Congratulations on your wedding!** 🎊💒✨
