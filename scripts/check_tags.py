
filename = r"c:\Users\Usuario\Pictures\Proyetcos de Optiabi\Revision0009_FullSystem.html"

with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

body_open = 0
body_close = 0
html_open = 0
html_close = 0

for i, line in enumerate(lines):
    if "<body>" in line.lower():
        body_open += 1
        print(f"<body> at line {i+1}")
    if "</body>" in line.lower():
        body_close += 1
        print(f"</body> at line {i+1}")
    if "<html>" in line.lower():
        html_open += 1
        print(f"<html> at line {i+1}")
    if "</html>" in line.lower():
        html_close += 1
        print(f"</html> at line {i+1}")

print(f"Total: <html> {html_open}, </html> {html_close}, <body> {body_open}, </body> {body_close}")
