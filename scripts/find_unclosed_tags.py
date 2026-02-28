import html.parser

class TagValidator(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        # Standard void elements
        self.void_elements = {
            'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
            'link', 'meta', 'param', 'source', 'track', 'wbr'
        }

    def handle_starttag(self, tag, attrs):
        if tag not in self.void_elements:
            # Store tag and current line number
            self.stack.append((tag, self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag not in self.void_elements:
            if not self.stack:
                print(f"Error: Unexpected closing tag </{tag}> at line {self.getpos()[0]}")
                return

            last_tag, start_line = self.stack[-1]
            if last_tag == tag:
                 self.stack.pop()
            else:
                # Try to find a match deeper in the stack (implying missing closing tags in between)
                # primitive recovery: just complain
                print(f"Error: Mismatch! Expected closing for <{last_tag}> (from line {start_line}), but found </{tag}> at line {self.getpos()[0]}")
                # We do NOT pop here to show the root cause usually, or we pop if we assume the last tag was just unclosed.
                # Let's peek to see if the tag matches something deeper
                found = False
                for i in range(len(self.stack) - 1, -1, -1):
                    if self.stack[i][0] == tag:
                        found = True
                        # Assume everything after it was unclosed
                        print(f"   -> Closing matches open tag <{tag}> from line {self.stack[i][1]}. Assuming intermediate tags were unclosed.")
                        # remove this tag and everything after it
                        del self.stack[i:]
                        break
                if not found:
                     print(f"   -> This closing tag </{tag}> does not match any open tag.")

    def report_unclosed(self):
        print("\n--- Unclosed Tags Report ---")
        if not self.stack:
            print("All tags balanced!")
        else:
             for tag, line in self.stack:
                 print(f"Unclosed tag <{tag}> starting at line {line}")

filename = r"c:\Users\Usuario\Pictures\Proyetcos de Optiabi\Revision0009_FullSystem.html"
validator = TagValidator()

try:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    validator.feed(content)
    validator.report_unclosed()
except Exception as e:
    print(f"Script error: {e}")
