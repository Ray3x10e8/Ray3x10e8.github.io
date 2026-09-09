# Freedom countdown

A static, mobile-friendly countdown page for **19 February 2027**. Visitors see
an “Enter codeword” prompt first. The countdown appears only after the correct
codeword is entered.

Until five weeks remain, the countdown displays weeks and days. From exactly
five weeks remaining, it displays days, hours, minutes, and seconds.

## Files

- `index.html` — page structure
- `styles.css` — design and responsive layout
- `script.js` — codeword check and countdown logic

Keep all three files together in the same folder.

## Add it to an existing GitHub Pages website

1. Open the repository that publishes your website.
2. Open its publishing folder. This is usually the repository root, `/docs`, or
   the output folder used by your GitHub Actions workflow.
3. Create a folder named `freedom` inside that publishing folder.
4. Upload `index.html`, `styles.css`, and `script.js` into `freedom`.
5. Commit the files.

The page will then be available at:

```text
https://YOUR-DOMAIN/freedom/
```

For a project site without a custom domain, it will usually be:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/freedom/
```

## Important limitation

GitHub Pages is static hosting. This codeword screen is suitable as a casual
privacy gate, but it is not secure authentication: a technically knowledgeable
visitor can inspect or bypass client-side code. Real access control requires a
server-side authentication service.

## Change the date or codeword

- Change `TARGET_DATE` near the top of `script.js` to change the deadline.
- To change the codeword, calculate its SHA-256 hash and replace
  `CODEWORD_HASH` in `script.js`.
