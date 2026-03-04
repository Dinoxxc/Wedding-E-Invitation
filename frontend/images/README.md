# Wedding Photos

Place your wedding and couple photos here.

## Recommended Image Specifications

### For Gallery Page
- **Format:** JPG or PNG
- **Resolution:** 1920x1080 or higher
- **Aspect Ratio:** Square (1:1) or landscape (16:9) recommended
- **File Size:** Optimize to under 500KB per image for faster loading
- **Quantity:** 6-20 images work well for the gallery

### For Story Page
- **Format:** JPG or PNG
- **Resolution:** 1200x800 or higher
- **File Size:** Under 300KB per image
- **Quantity:** 4-8 images (one per story milestone)

### Image Optimization Tools
1. **TinyPNG** - https://tinypng.com (Free online compression)
2. **Squoosh** - https://squoosh.app (Google's image optimizer)
3. **ImageOptim** - https://imageoptim.com (Mac application)
4. **GIMP** - Free image editor with export optimization

## How to Add Your Photos

### For the Gallery Page (`gallery.html`)

1. Add your images to this folder
2. Open `frontend/gallery.html`
3. Replace the placeholder divs with img tags:

```html
<!-- Replace this: -->
<a href="#" class="gallery-item scroll-reveal">
  <div class="gallery-placeholder">Photo 1<br>Add your image</div>
</a>

<!-- With this: -->
<a href="#" class="gallery-item scroll-reveal">
  <img src="/images/your-photo-1.jpg" alt="Description of photo">
</a>
```

### For the Story Page (`story.html`)

1. Add your images to this folder
2. Open `frontend/story.html`
3. Replace the placeholder divs with img tags:

```html
<!-- Replace this: -->
<div style="flex: 1; min-width: 300px; height: 300px; background: var(--color-bg-light); display: flex; align-items: center; justify-content: center; color: var(--color-muted);">
  [Add your photo here]
</div>

<!-- With this: -->
<div style="flex: 1; min-width: 300px;">
  <img src="/images/story-photo-1.jpg" alt="How we met" style="width: 100%; height: auto; object-fit: cover;">
</div>
```

## Sample File Names

Organize your photos with clear names:
```
images/
├── hero-couple.jpg           # Main hero image
├── story-how-we-met.jpg      # Story section 1
├── story-first-date.jpg      # Story section 2
├── story-proposal.jpg        # Story section 3
├── story-today.jpg           # Story section 4
├── gallery-01.jpg            # Gallery images
├── gallery-02.jpg
├── gallery-03.jpg
└── ...
```

## Image Ideas

### Gallery Photos
- Engagement photos
- Couple portraits
- Candid moments together
- Travel photos
- Special memories
- Pre-wedding photoshoot
- Proposal photos
- Fun moments

### Story Section Photos
- How We Met: Photo from around that time
- First Date: Photo from early relationship
- Proposal: Engagement photos
- Today & Forever: Recent couple photo

## Tips for Great Photos

1. **Consistency:** Use photos with similar editing style
2. **Quality:** Choose your best, clearest photos
3. **Variety:** Mix close-ups, full body shots, and environment shots
4. **Faces:** Make sure faces are clear and well-lit
5. **Storytelling:** Choose photos that tell your story
6. **Privacy:** Only include photos you're comfortable sharing publicly

## No Photos Yet?

The website works fine with placeholders. You can:
1. Launch with placeholders and add photos later
2. Use stock photos temporarily
3. Use illustrations or graphics instead

The monochrome design looks elegant even with simple placeholders!
