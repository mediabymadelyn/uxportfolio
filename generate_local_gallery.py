#!/usr/bin/env python3
"""
Simple Art Gallery Generator
Scans images/art/ folder and generates HTML for all images found
"""

import os
from pathlib import Path

ART_FOLDER = "images/art"
SUPPORTED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP'}

def scan_art_folder():
    """Find all image files in the art folder"""
    art_path = Path(ART_FOLDER)
    if not art_path.exists():
        print(f"❌ Error: {ART_FOLDER} folder not found!")
        return []
    
    images = []
    for file in art_path.iterdir():
        if file.suffix in SUPPORTED_EXTENSIONS:
            images.append(file.name)
    
    return sorted(images)

def generate_gallery_html(images):
    """Generate HTML for the image gallery"""
    if not images:
        return '''
              <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 0;">
                <p style="font-style: italic; color: rgba(255,255,255,0.7);">
                  No images found in images/art/ folder. Add some artwork images there!
                </p>
              </div>
'''
    
    html = ''
    for image in images:
        html += f'''
              <div class="art-item" style="border-radius: 8px; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;">
                <img src="{ART_FOLDER}/{image}" alt="Artwork" style="width: 100%; height: 300px; object-fit: cover; display: block;" />
              </div>
'''
    
    return html

def update_play_html(gallery_html):
    """Update play.html with the new gallery"""
    try:
        with open('play.html', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find the section markers
        start_marker = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; padding: 2rem 0;">'
        end_marker = '</div>\n          </section>'
        
        start_idx = content.find(start_marker)
        if start_idx == -1:
            print("❌ Error: Could not find gallery grid in play.html")
            return False
        
        # Find position after the start marker
        insert_pos = start_idx + len(start_marker)
        
        # Find the end of the grid
        end_idx = content.find(end_marker, insert_pos)
        if end_idx == -1:
            print("❌ Error: Could not find end of gallery")
            return False
        
        # Replace content between markers
        new_content = (
            content[:insert_pos] +
            '\n              ' +
            gallery_html.strip() +
            '\n\n            ' +
            content[end_idx:]
        )
        
        with open('play.html', 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"❌ Error updating play.html: {e}")
        return False

def main():
    print("🎨 Scanning images/art/ folder...")
    
    images = scan_art_folder()
    
    if not images:
        print("⚠️  No artwork images found in images/art/")
        print("   Add some .jpg, .png, or .gif files there and run this again!")
        return
    
    print(f"✅ Found {len(images)} images:")
    for img in images:
        print(f"   • {img}")
    
    print("\n🖼️  Generating gallery HTML...")
    gallery_html = generate_gallery_html(images)
    
    print("📝 Updating play.html...")
    if update_play_html(gallery_html):
        print(f"✨ Success! Your art gallery has been updated with {len(images)} pieces.")
        print("\n💡 Tips:")
        print("   • Edit play.html to customize titles and descriptions")
        print("   • Run this script again after adding new images")
        print("\nNext steps:")
        print("   git add play.html images/art/")
        print("   git commit -m 'Update art gallery'")
        print("   git push")
    else:
        print("❌ Failed to update play.html")

if __name__ == '__main__':
    main()
