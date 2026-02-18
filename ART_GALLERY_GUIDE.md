# Art Gallery - Easy Setup Guide

## ✨ Super Simple Method (Works Now!)

No Instagram API needed - just use your local artwork files!

### How to Add Art:

1. **Save your artwork images to the `images/art/` folder**
   ```bash
   # Example: drag and drop your images into images/art/
   ```

2. **Run the generator script**
   ```bash
   python3 generate_local_gallery.py
   ```

3. **Push to GitHub**
   ```bash
   git add play.html images/art/
   git commit -m "Add new artwork"
   git push
   ```

That's it! Your art page is updated.

### What the Script Does:
- Automatically finds all images in `images/art/`
- Creates the gallery HTML
- Updates `play.html`
- Uses your filename as the title (e.g., `sunset-painting.jpg` → "Sunset Painting")

### Tips:
- Name your files descriptively: `digital-portrait-2024.jpg`
- Supported formats: JPG, PNG, GIF, WebP
- Recommended size: 600-1200px square or vertical
- After running the script, you can edit `play.html` to customize titles/descriptions

---

## 🔄 Instagram Method (For Later)

When Meta's developer registration works, you can use `update_art_gallery.py` to automatically fetch from Instagram. See `README_INSTAGRAM_SETUP.md` for details.

---

## Which Should I Use?

**Local images** (`generate_local_gallery.py`):
- ✅ Works immediately
- ✅ No API setup needed
- ✅ Full control over images
- ⚠️ Manual: add images yourself

**Instagram** (`update_art_gallery.py`):
- ✅ Automatic: pulls from Instagram
- ✅ Always in sync
- ⚠️ Requires API setup
- ⚠️ Depends on Instagram/Meta

**You can use both!** Start with local images now, add Instagram automation later.
