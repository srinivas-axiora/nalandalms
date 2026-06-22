# Exporting the Nalanda Docs to Microsoft Word (.docx)

The documents are authored in Markdown (versionable, diff-friendly, editable in VS Code). Here are three ways to produce `.docx`, easiest first. **Option A (Pandoc CLI) is the most reliable** — it preserves headings, tables, and generates a table of contents.

---

## Option A — Pandoc CLI (recommended)

Pandoc is a single, free document converter. This is the highest-fidelity path.

### 1. Install Pandoc (Windows, one-time)
```powershell
winget install --id JohnMacFarlane.Pandoc -e
```
(Alternatively download from https://pandoc.org/installing.html.) Close and reopen the terminal so `pandoc` is on PATH; verify with `pandoc --version`.

### 2. Convert one document
Run from the repo root. **PowerShell:**
```powershell
pandoc "docs/01-PRD-Product-Requirements.md" -o "docs/word/01-PRD.docx" --toc --toc-depth=2
```

### 3. Convert ALL documents at once
**PowerShell:**
```powershell
New-Item -ItemType Directory -Force docs/word | Out-Null
Get-ChildItem docs/*.md | ForEach-Object {
  pandoc $_.FullName -o ("docs/word/" + $_.BaseName + ".docx") --toc --toc-depth=2
}
```
**Git Bash:**
```bash
mkdir -p docs/word
for f in docs/*.md; do
  pandoc "$f" -o "docs/word/$(basename "${f%.md}").docx" --toc --toc-depth=2
done
```

### 4. (Optional) Apply your corporate Word theme
Create a styled template once, then reference it so output uses your fonts/branding:
```powershell
pandoc -o docs/word/reference.docx --print-default-data-file reference.docx   # creates a template to edit
pandoc "docs/01-PRD-Product-Requirements.md" -o "docs/word/01-PRD.docx" --reference-doc=docs/word/reference.docx --toc
```
Edit `reference.docx` styles (Heading 1/2, Normal, Table) in Word, save, and reuse it for all docs.

---

## Option B — VS Code extension (no CLI commands)

Use a Markdown extension that exports to Word. A widely used, real option is **"Markdown Preview Enhanced"** (publisher `shd101wyy`).

1. In VS Code: Extensions (Ctrl+Shift+X) → search **Markdown Preview Enhanced** → Install.
2. Open a `docs/*.md` file → open the preview (Ctrl+K V).
3. Right-click in the preview → **Pandoc → Save as Word (.docx)** (this option uses Pandoc under the hood, so install Pandoc per Option A first).

> Note: Most VS Code Markdown→Word extensions delegate to Pandoc. If an extension reports "pandoc not found," install Pandoc (Option A step 1). Search the Marketplace for "pandoc" or "markdown to word" if you prefer a different one — verify the publisher and reviews before installing.

---

## Option C — Quick manual paste (no tools)

For a one-off: open the `.md` file, use VS Code's Markdown preview (Ctrl+Shift+V), select all in the preview, and paste into Word. Formatting is approximate (tables usually survive). Fine for a quick draft; use Option A for clean deliverables.

---

## Recommended convenience script (optional)

If you want a repeatable build, add this to `package.json` scripts (requires Pandoc installed):
```json
"docs:word": "node -e \"const{execSync}=require('child_process');const fs=require('fs');fs.mkdirSync('docs/word',{recursive:true});for(const f of fs.readdirSync('docs').filter(x=>x.endsWith('.md'))){execSync('pandoc \\\"docs/'+f+'\\\" -o \\\"docs/word/'+f.replace(/\\.md$/,'.docx')+'\\\" --toc --toc-depth=2',{stdio:'inherit'})}\""
```
Then run `npm run docs:word`.

---

## Pre-built output & theme (already generated)

- The `.docx` files are already generated in `docs/word/` using a branded template **`docs/reference.docx`** (Axiora corporate **teal #0F766E** headings).
- To re-generate after editing the Markdown, reuse the theme:
  ```bash
  for f in docs/*.md; do pandoc "$f" -o "docs/word/$(basename "${f%.md}").docx" --reference-doc=docs/reference.docx --toc --toc-depth=2; done
  ```
- To adjust branding (fonts, exact colors, logo in header/footer): open `docs/reference.docx` in Word, edit the **Heading 1/2/Title/Normal** styles and page header, save, and re-run the command above.

## Notes

- Pandoc 3.10 was installed (via winget) to produce the `.docx` files; the Markdown sources remain the source of truth.
- `docs/word/` is a good place to keep generated `.docx`; consider adding it to `.gitignore` if you don't want binaries in version control.
