import os, glob, re

def print_errors(f):
    r = open(f, 'r', encoding='utf-8').read()
    bad = re.findall(r'className=\{\\.*?\\\}', r, re.DOTALL)
    for b in bad: 
        print(f"---{f}---\n{repr(b)}\n")
    bad = re.findall(r'style=\{\{ height: \\\\%\\\\ \}\}', r, re.DOTALL)
    for b in bad: print(b)

for path in glob.glob('labs-ui/**/*.jsx', recursive=True): print_errors(path)
