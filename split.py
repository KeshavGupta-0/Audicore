import os
import re

html_path = 'templates/index.html'
css_dir = 'static/css'
js_dir = 'static/js'

os.makedirs(css_dir, exist_ok=True)
os.makedirs(js_dir, exist_ok=True)

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract CSS
css_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if css_match:
    with open(os.path.join(css_dir, 'styles.css'), 'w', encoding='utf-8') as f:
        f.write(css_match.group(1).strip() + '\n')
    
    content = content.replace(css_match.group(0), '<link rel="stylesheet" href="/static/css/styles.css">')

# 2. Extract JS
js_pattern = r'{%\s*raw\s*%}\s*<script type="text/babel">(.*?)</script>\s*{%\s*endraw\s*%}'
js_match = re.search(js_pattern, content, re.DOTALL)

if js_match:
    with open(os.path.join(js_dir, 'app.jsx'), 'w', encoding='utf-8') as f:
        f.write(js_match.group(1).strip() + '\n')
    
    content = content.replace(js_match.group(0), '<script type="text/babel" src="/static/js/app.jsx"></script>')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Split complete.')
