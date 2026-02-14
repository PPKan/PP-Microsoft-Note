import os
import json
import re
from datetime import datetime

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(BASE_DIR, 'content')
OUTPUT_FILE = os.path.join(BASE_DIR, 'posts.json')

def parse_frontmatter(content):
    # Regex to find YAML block
    match = re.match(r'^---\s*[\r\n]+([\s\S]*?)[\r\n]+---', content)
    if not match:
        return None
    
    yaml_block = match.group(1)
    metadata = {}
    
    for line in yaml_block.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()
            
            # Basic list parsing for tags: [a, b]
            if value.startswith('[') and value.endswith(']'):
                value = [v.strip() for v in value[1:-1].split(',')]
            elif value.startswith('- '):
                # Handle yaml list items if needed, but for now assuming [a,b] format or single line
                pass
                
            metadata[key] = value
            
    return metadata

def generate_posts():
    if not os.path.exists(CONTENT_DIR):
        print(f"Content directory not found: {CONTENT_DIR}")
        return

    posts = []
    
    for filename in os.listdir(CONTENT_DIR):
        if filename.endswith('.md'):
            filepath = os.path.join(CONTENT_DIR, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            metadata = parse_frontmatter(content)
            
            if metadata:
                post_data = metadata.copy()
                post_data['filename'] = filename
                # Use ID from metadata or filename
                if 'id' not in post_data:
                    post_data['id'] = filename.replace('.md', '')
                
                posts.append(post_data)

    # Sort by date descending
    posts.sort(key=lambda x: x.get('date', ''), reverse=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=4, ensure_ascii=False)
        
    print(f"Successfully generated posts.json with {len(posts)} posts.")

if __name__ == "__main__":
    generate_posts()
