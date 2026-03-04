# Wedding E-Invitation Customization Checklist

Use this checklist to customize your wedding e-invitation before launch!

## 🚀 Initial Setup
- [ ] Run `npm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Update database credentials in `.env`
- [ ] Set secure `ADMIN_PASSWORD` in `.env`
- [ ] Set random `JWT_SECRET` in `.env`
- [ ] Run `npm run setup-db`
- [ ] Verify server starts with `npm start`

## 👫 Personal Information

### Names & Initials
- [ ] Replace "John & Alice" with your names in all HTML files
- [ ] Replace "J & A" in navbar with your initials (all HTML files)
- [ ] Update footer names in all pages

### Wedding Date & Time
- [ ] Update date in `index.html` line 44 (display text)
- [ ] Update countdown timer date in `index.html` line 48 (data-date attribute)
- [ ] Update date throughout all pages
- [ ] Update time (currently 6:00 PM)
- [ ] Verify timezone is correct

## 📍 Event Details (details.html)

### Venue Information
- [ ] Update venue name (line 50)
- [ ] Update address (lines 51-53)
- [ ] Update phone number (line 55)
- [ ] Update email (line 56)

### Schedule/Timeline
- [ ] Update ceremony time (line 63)
- [ ] Update ceremony location (line 64)
- [ ] Update cocktail hour time (line 68)
- [ ] Update reception time (line 73)
- [ ] Update reception details (line 74)
- [ ] Adjust timeline as needed

### Additional Details
- [ ] Update dress code information (lines 91-104)
- [ ] Update parking information (lines 111-123)
- [ ] Update accommodation details (lines 131-143)
- [ ] Update contact information (line 169)

### Google Maps
- [ ] Get Google Maps embed code for your venue
- [ ] Replace placeholder in `details.html` (line 152)
- [ ] Test map loads correctly

## 📖 Our Story (story.html)

### Story Content
- [ ] Write "How We Met" section (lines 49-58)
- [ ] Update date/season for "How We Met"
- [ ] Write "First Date" section (lines 67-76)
- [ ] Update date for "First Date"
- [ ] Write "The Proposal" section (lines 85-94)
- [ ] Update date for "The Proposal"
- [ ] Write "Today & Forever" section (lines 103-112)

## 🖼️ Photos

### Add Your Photos
- [ ] Add couple photos to `frontend/images/` folder
- [ ] Optimize images (under 500KB each)
- [ ] Update `story.html` with your story photos (4 images)
- [ ] Update `gallery.html` with gallery photos (6-20 images)
- [ ] Add alt text descriptions to all images
- [ ] Test gallery lightbox works

### Image Updates
Replace these placeholders:
- [ ] `story.html` line 60: How We Met photo
- [ ] `story.html` line 69: First Date photo
- [ ] `story.html` line 87: Proposal photo
- [ ] `story.html` line 105: Recent photo
- [ ] `gallery.html` lines 55-81: All gallery items

## 🎵 Background Music
- [ ] Choose romantic background music
- [ ] Convert to MP3 format
- [ ] Name file `wedding-music.mp3`
- [ ] Place in `frontend/audio/` folder
- [ ] Test music plays on page load
- [ ] Test music toggle button works

## 🎁 Gift Registry (registry.html)

### Registry Links
- [ ] Update Amazon registry link (line 61)
- [ ] Update Crate & Barrel link (line 72)
- [ ] Update honeymoon fund link (line 83)
- [ ] Add/remove registry options as needed

### Monetary Gifts
- [ ] Update bank name (line 97)
- [ ] Update account number (line 98)
- [ ] Update routing number (line 99)
- [ ] Update Venmo handle (line 102)
- [ ] Update PayPal email (line 103)
- [ ] Update Zelle info (line 104)

### Thank You Message
- [ ] Customize thank you message (lines 115-121)

## 🎨 Design Customization (Optional)

### Colors
If you want to change from monochrome:
- [ ] Update CSS variables in `frontend/css/main.css` (lines 8-19)
- [ ] Test all pages with new colors

### Fonts
If you want different fonts:
- [ ] Choose Google Fonts
- [ ] Update font imports in all HTML files
- [ ] Update `--font-primary` and `--font-secondary` in CSS

## ✅ Testing

### Functionality Testing
- [ ] Test all navigation links work
- [ ] Test countdown timer displays correctly
- [ ] Test mobile menu opens/closes
- [ ] Test music player toggle
- [ ] Submit test RSVP - verify it saves
- [ ] Post test message - verify it appears
- [ ] Test gallery lightbox (prev/next/close)
- [ ] Test all external links work

### Admin Panel Testing
- [ ] Access admin panel at `/admin`
- [ ] Login with credentials
- [ ] View RSVP statistics
- [ ] View submitted RSVPs
- [ ] Delete a test RSVP
- [ ] View messages
- [ ] Approve a message
- [ ] Delete a message
- [ ] Logout and re-login

### Responsive Testing
- [ ] Test on mobile phone (iPhone)
- [ ] Test on mobile phone (Android)
- [ ] Test on tablet (iPad)
- [ ] Test on desktop
- [ ] Test on large screen (1920px+)
- [ ] Test in portrait and landscape

### Browser Testing
- [ ] Test in Chrome
- [ ] Test in Safari
- [ ] Test in Firefox
- [ ] Test in Edge

## 🚀 Pre-Launch

### Content Review
- [ ] Proofread all text for typos
- [ ] Verify all dates are correct
- [ ] Verify all times are correct (including timezone)
- [ ] Verify all names are spelled correctly
- [ ] Check all links work
- [ ] Verify contact information is accurate

### Performance
- [ ] Optimize all images
- [ ] Test page load speed
- [ ] Verify music file isn't too large
- [ ] Test on slow internet connection

### Security
- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Never commit `.env` file to git
- [ ] Verify CORS settings are appropriate

## 🌐 Deployment

### Pre-Deployment
- [ ] Choose hosting platform (Heroku/AWS/DigitalOcean/Railway)
- [ ] Set up MySQL database on hosting
- [ ] Configure environment variables on server
- [ ] Test database connection

### Deployment
- [ ] Deploy application
- [ ] Run database setup on production
- [ ] Test production site works
- [ ] Test RSVP form on production
- [ ] Test admin panel on production

### Post-Deployment
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate
- [ ] Update `.env` with production FRONTEND_URL
- [ ] Test all features on live site
- [ ] Send test invitation to friend

## 📧 Launch

### Share Your Invitation
- [ ] Get your website URL
- [ ] Create short message with URL
- [ ] Send to family and friends
- [ ] Post on social media (if desired)
- [ ] Add to wedding website QR codes (optional)

### Monitor
- [ ] Check RSVPs daily
- [ ] Moderate messages if needed
- [ ] Respond to any special requests
- [ ] Keep backup of RSVP data

## 🎉 Additional Features (Optional)

Consider adding:
- [ ] Custom domain name
- [ ] Email notifications for new RSVPs
- [ ] Guest list with unique invite codes
- [ ] Multiple language support
- [ ] Live streaming link (for virtual guests)
- [ ] Photo upload feature for guests
- [ ] Digital guestbook
- [ ] Wedding hashtag display
- [ ] Real-time RSVP counter on homepage

---

## Quick Reference

**Update Wedding Date:**
- `index.html` line 44 & 48
- All other HTML pages footer

**Update Names:**
- Search "John & Alice" in all files
- Search "J & A" in all files

**Add Photos:**
- Place in `frontend/images/`
- Update `story.html` and `gallery.html`

**Admin Access:**
- URL: `yourdomain.com/admin`
- Credentials: Set in `.env`

---

**Print this checklist and check items off as you complete them!**

Good luck with your wedding! 💍✨
