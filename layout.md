You are an expert front-end engineer. Below are 7 usability issues (Usability heuristics) found on a live web page. For each one, identify the root cause and propose a concrete, minimal code fix — HTML, CSS, ARIA or copy as appropriate — that stays consistent with the existing markup and keeps the page accessible. Work through them issue by issue, keeping the same numbering.

Page: Swagat Industries ERP
URL: http://localhost:3000/payments?quotationId=16
Audit: Usability · Usability heuristics · 7 issues

---

## 1. The database connection status is given high visual prominence in the header, competing with user-facing controls. This technical detail is likely secondary to the user's primary tasks and adds unnecessary cognitive load.

- **Selector:** `#root > div > div > header > div:nth-of-type(2) > div:nth-of-type(1)`
  The database connection status is given high visual prominence in the header, competing with user-facing controls. This technical detail is likely secondary to the user's primary tasks and adds unnecessary cognitive load.

- **Severity:** Suggestion
- **Category:** Hierarchy

> PostgreSQL Connected

**Suggested rewrite:** Move technical status indicators to a footer or a less prominent "System Status" area.

**Element:**

```html
<div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px; background-color: rgb(220, 252, 231); color: rgb(21, 128, 61);"><s…
```

---

- [View on page ↗](http://localhost:3000/payments?quotationId=16)

## 2. The edit and delete icons are positioned at the extreme edge of the row, far from the primary data points. This makes it harder to visually track which row an action belongs to, especially on wider screens.

- **Selector:** `div:nth-of-type(2) > div:nth-of-type(2) > table > thead > tr > th:nth-of-type(9)`
  The edit and delete icons are positioned at the extreme edge of the row, far from the primary data points. This makes it harder to visually track which row an action belongs to, especially on wider screens.

- **Severity:** Minor
- **Category:** Spacing & alignment

> ACTIONS

**Suggested rewrite:** Reduce the horizontal padding in the table or move the actions column closer to the data columns.

**Element:**

```html
<th style="width: 120px; text-align: right;">Actions</th>
```

---

- [View on page ↗](http://localhost:3000/payments?quotationId=16)

## 3. The location pin icon in the Industry / Site column is vertically misaligned with the adjacent text, appearing to float slightly above the text baseline.

- **Selector:** `div:nth-of-type(2) > table > tbody > tr:nth-of-type(1) > td:nth-of-type(5) > div:nth-of-type(2)`
  The location pin icon in the Industry / Site column is vertically misaligned with the adjacent text, appearing to float slightly above the text baseline.

- **Severity:** Minor
- **Category:** Spacing & alignment

> BHESAN

**Suggested rewrite:** Center the icon vertically relative to the line of text or align its base to the text baseline.

**Element:**

```html
<div style="font-size: 11px; color: var(--text-secondary);">📍 BHESAN</div>
```

---

- [View on page ↗](http://localhost:3000/payments?quotationId=16)

## 4. The vertical spacing (leading) between the primary and secondary lines of text in the Customer and Industry / Site columns is very tight, causing the information to feel cramped and reducing scannability.

- **Selector:** `div:nth-of-type(2) > div:nth-of-type(2) > table > tbody > tr:nth-of-type(1) > td:nth-of-type(4)`
  The vertical spacing (leading) between the primary and secondary lines of text in the Customer and Industry / Site columns is very tight, causing the information to feel cramped and reducing scannability.

- **Severity:** Suggestion
- **Category:** Spacing & alignment

> DHRUVIL

**Suggested rewrite:** Increase the line height or add a small vertical margin between the two lines of text within these cells.

**Element:**

```html
<td style="font-weight: 600; color: var(--text-main);">
  DHRUVIL
  <div style="font-size: 11px; color: var(--text-secondary);">9876543210</div>
</td>
```

---

- [View on page ↗](http://localhost:3000/payments?quotationId=16)

## 5. The pink color of the location pin icon introduces a high-contrast focal point for a secondary piece of information, which competes with more critical data like the Amount or Quotation Number.

- **Selector:** `div:nth-of-type(2) > table > tbody > tr:nth-of-type(1) > td:nth-of-type(5) > div:nth-of-type(2)`
  The pink color of the location pin icon introduces a high-contrast focal point for a secondary piece of information, which competes with more critical data like the Amount or Quotation Number.

- **Severity:** Suggestion
- **Category:** Hierarchy

> BHESAN

**Suggested rewrite:** Change the icon color to a neutral grey or the primary blue used for other interactive elements to maintain a cleaner visual hierarchy.

**Element:**

```html
<div style="font-size: 11px; color: var(--text-secondary);">📍 BHESAN</div>
```

---

- [View on page ↗](http://localhost:3000/payments?quotationId=16)

## 6. The logo is placed in a high-contrast white box that abruptly interrupts the dark visual theme of the sidebar, creating a "stuck-on" appearance rather than an integrated brand element.

- **Selector:** `#root > div > aside > div:nth-of-type(1) > div > img`
  The logo is placed in a high-contrast white box that abruptly interrupts the dark visual theme of the sidebar, creating a "stuck-on" appearance rather than an integrated brand element.

- **Severity:** Minor
- **Category:** Consistency

> Swagat Industries Logo

**Suggested rewrite:** Use a transparent version of the logo or match the box background to the sidebar's dark theme.

**Element:**

```html
<img
  src="/logo.png"
  alt="Swagat Industries Logo"
  style="max-height: 38px; max-width: 100%; height: auto; object-fit: contain;"
/>
```

---

- [View on page ↗](http://localhost:3000/payments?quotationId=16)

## 7. The primary action for the table ("Record Payment") is visually isolated on the far right, separated from the search and filter controls by a large expanse of whitespace. This forces a wide eye-scan to understand available table interactions.

- **Selector:** `div > div > main > div:nth-of-type(2) > div:nth-of-type(1) > button`
  The primary action for the table ("Record Payment") is visually isolated on the far right, separated from the search and filter controls by a large expanse of whitespace. This forces a wide eye-scan to understand available table interactions.

- **Severity:** Minor
- **Category:** Grouping

> Record Payment

**Suggested rewrite:** Group the "Record Payment" button more closely with the search and filter inputs to create a unified control bar.

**Element:**

```html
<button class="btn-accent-swagat"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www…
```

---

- [View on page ↗](http://localhost:3000/payments?quotationId=16)
