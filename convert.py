import re
import json

def html_to_jsx_style(style_str):
    if not style_str.strip(): return '{}'
    parts = style_str.strip().strip(';').split(';')
    obj = {}
    for p in parts:
        if ':' not in p: continue
        k, v = p.split(':', 1)
        k, v = k.strip(), v.strip()
        # camelCase the keys
        parts_k = k.split('-')
        k_camel = parts_k[0] + ''.join(word.capitalize() for word in parts_k[1:])
        obj[k_camel] = v
    return '{' + json.dumps(obj) + '}'

with open('copy_2.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract style
style_match = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
if style_match:
    styles = style_match.group(1)
    with open('append_styles.css', 'w', encoding='utf-8') as f:
        f.write(styles)

# Extract body contents
body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL)
if not body_match:
    print("No body found")
    exit(1)
body = body_match.group(1)

# Remove the preloader and scroll progress since page.tsx already has them, or keep them?
# Let's keep them and replace everything inside the return of Home().

# 1. class -> className
jsx = body.replace('class=', 'className=')
# 2. for -> htmlFor
jsx = jsx.replace('for=', 'htmlFor=')
# 3. autocomplete -> autoComplete
jsx = jsx.replace('autocomplete=', 'autoComplete=')
# 4. onclick -> onClick
jsx = jsx.replace('onclick=', 'onClick=')
# 5. Inline styles string to object
def style_replacer(m):
    return f'style={{{html_to_jsx_style(m.group(1))}}}'
jsx = re.sub(r'style="([^"]*)"', style_replacer, jsx)

# 6. self close tags
tags = ['img', 'input', 'br', 'hr', 'source', 'meta', 'link']
for tag in tags:
    jsx = re.sub(rf'<{tag}([^>]*?)(?<!/)>', rf'<{tag}\1 />', jsx)

# 7. Convert comments
jsx = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', jsx, flags=re.DOTALL)

with open('services/main-frontend/src/app/page.tsx', 'r', encoding='utf-8') as f:
    old_page = f.read()

# We need to replace the return statement with the new JSX.
# find eturn (
start_idx = old_page.find('return (')
if start_idx != -1:
    new_page = old_page[:start_idx] + 'return (\n    <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container noise">\n' + jsx + '\n    </div>\n  );\n}\n'
    with open('services/main-frontend/src/app/page.tsx', 'w', encoding='utf-8') as f:
        f.write(new_page)
    print("Done generating page.tsx")
else:
    print("Could not find return statement in page.tsx")

