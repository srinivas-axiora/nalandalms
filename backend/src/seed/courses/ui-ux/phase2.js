export const phase2 = {
  "chapters": [
    {
      "id": "CH-UIX-007",
      "courseId": "CRS-UIX-001",
      "chapterNumber": 7,
      "title": "Visual Design Principles: Visual Hierarchy, Typography & Spatial Rhythm",
      "summary": "Master the visual foundations of digital UI: focal points, contrast ratios, typographic anatomy (x-height, leading, tracking), modular typographic scales, and the mathematical rigor of the 8pt spatial grid system.",
      "readingTimeMinutes": 36,
      "videoUrl": "https://www.youtube.com/watch?v=sByzHoiYFX0",
      "body": "<h2>1. The Science of Visual Hierarchy</h2>\n<p>Visual hierarchy is the arrangement and presentation of design elements in the order of their perceptual importance. When a user lands on a digital interface, their visual scan path is determined not by reading linearly from top to bottom, but by subconscious visual cues that pull attention toward elements possessing higher <strong>visual weight</strong>.</p>\n<p>Decades of eye-tracking research (e.g., Nielsen Norman Group) reveal two primary viewing patterns:</p>\n<ul>\n  <li><strong>The F-Pattern:</strong> Dominant on text-heavy content (blogs, documentation, news). Users read across the top in a horizontal bar, drop down and read across a shorter second horizontal line, and finally scan vertically down the left edge.</li>\n  <li><strong>The Z-Pattern:</strong> Dominant on visually structured landing pages and dashboards. The eye traverses from top-left (logo) to top-right (CTA), cuts diagonally down to bottom-left (features), and sweeps across to bottom-right (terminal CTA).</li>\n</ul>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/sByzHoiYFX0' title='Visual Hierarchy and Typography in UI Design' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Levers of Visual Weight</h2>\n<p>Designers control visual hierarchy through five primary levers:</p>\n<ol>\n  <li><strong>Size & Scale:</strong> Larger elements command immediate attention. A 36px heading naturally establishes primacy over 16px body copy.</li>\n  <li><strong>Color & Contrast:</strong> High-contrast, saturated elements leap forward from muted, desaturated backgrounds. A vibrant purple CTA button against a white canvas creates an instant focal point.</li>\n  <li><strong>Weight & Density:</strong> Bold or black font weights carry greater visual mass than light or regular weights of identical font size.</li>\n  <li><strong>Whitespace (Negative Space):</strong> Isolating an element with ample whitespace amplifies its visual prominence far more effectively than merely enlarging its dimensions.</li>\n  <li><strong>Depth & Elevation:</strong> Subtle drop shadows, z-index elevation, and borders elevate elements toward the user along the conceptual z-axis.</li>\n</ol>\n\n<h2>3. Digital Typography Anatomy & Modular Scales</h2>\n<p>Typography is the voice of your interface; text accounts for over 90% of user interface content. Understanding typographic anatomy prevents layout discord:</p>\n<ul>\n  <li><strong>Baseline:</strong> The invisible horizontal line upon which characters sit.</li>\n  <li><strong>X-Height:</strong> The height of lowercase letters (such as 'x', 'o', 'a'). Typefaces with generous x-heights (e.g., Inter, Roboto, San Francisco) offer dramatically superior legibility at small screen sizes.</li>\n  <li><strong>Leading (Line Height):</strong> The vertical distance between baselines of successive lines of text. For body copy, optimal readability requires a line height of <strong>140% to 160%</strong> of the font size (e.g., 16px font with 24px line-height).</li>\n  <li><strong>Tracking & Kerning:</strong> Tracking adjusts letter spacing uniformly across a word or sentence; kerning adjusts spacing between specific character pairs (e.g., 'AV'). As font size increases (headlines), letter spacing should tighten slightly (-1% to -2%); at small sizes (10-12px captions), tracking should loosen (+2% to +4%).</li>\n  <li><strong>Measure (Line Length):</strong> Optimal reading comprehension occurs at <strong>45 to 75 characters per line</strong> (including spaces). Lines that are too long cause reader fatigue; lines that are too short cause awkward rhythmic breaks.</li>\n</ul>\n\n<h3>The Modular Typographic Scale:</h3>\n<p>Rather than picking arbitrary font sizes, professional design systems employ mathematical ratios. Using the <strong>Major Second (1.125)</strong> or <strong>Minor Third (1.2)</strong> ratio anchored on a 16px base:</p>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Token</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Font Size</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Line Height</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Font Weight</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Usage</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>text-xs</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>12px (0.75rem)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>16px</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Medium (500)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Badges, timestamps, fine print</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>text-sm</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>14px (0.875rem)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>20px</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Regular (400) / SemiBold (600)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Table data, secondary captions, form hints</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>text-base</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>16px (1.000rem)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>24px</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Regular (400)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Default body text, form input labels</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>text-lg</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>18px (1.125rem)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>28px</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>SemiBold (600)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Subheaders, card titles</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>text-xl</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>20px (1.250rem)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>28px</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Bold (700)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Modal titles, Section headers (H3)</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>text-2xl</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>24px (1.500rem)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>32px</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Bold (700)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Page titles, Primary headers (H2)</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>text-4xl</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>36px (2.250rem)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>44px</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>ExtraBold (800)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Hero banner titles (H1)</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>4. The 8pt Spatial Grid System</h2>\n<p>In modern digital design, spacing must never be arbitrary. The industry standard is the <strong>8pt grid system</strong>, where all margins, paddings, dimensions, and line-heights are multiples of 8 (with a 4pt sub-grid for dense micro-components like icons and tags).</p>\n<h3>Why 8 Pixels?</h3>\n<ol>\n  <li><strong>Screen Scaling:</strong> Modern displays scale interfaces across 1x, 2x (@2x Retina), 3x (@3x Super Retina), and 1.5x Android displays. Numbers divisible by 8 scale cleanly without producing half-pixel rendering artifacts (e.g., 8 × 1.5 = 12px, whereas 7 × 1.5 = 10.5px, causing blurry rasterization).</li>\n  <li><strong>Decision Velocity:</strong> Replaces infinite random padding choices (11px, 13px, 17px) with a strict, disciplined scale: [4px, 8px, 16px, 24px, 32px, 40px, 48px, 64px, 80px, 96px].</li>\n  <li><strong>Engineering Harmony:</strong> Front-end frameworks (Tailwind CSS, Material UI) map directly to 8pt/4pt units (e.g., <code>p-2 = 8px</code>, <code>p-4 = 16px</code>, <code>p-6 = 24px</code>).</li>\n</ol>\n\n<h2>5. Key Takeaways</h2>\n<ol>\n  <li>Visual hierarchy governs eye movement via scale, contrast, weight, whitespace, and elevation.</li>\n  <li>Users scan content in F-patterns (text dense) and Z-patterns (structured landing pages).</li>\n  <li>Optimal digital body typography demands 140%-160% line height and 45-75 characters per line.</li>\n  <li>Typefaces with tall x-heights maximize screen legibility at small font sizes.</li>\n  <li>The 8pt spatial grid eliminates blurry subpixel rendering and accelerates design-engineering handoff.</li>\n</ol>"
    },
    {
      "id": "CH-UIX-008",
      "courseId": "CRS-UIX-001",
      "chapterNumber": 8,
      "title": "Color Theory, Perceptual Systems & Dark Mode Architecture",
      "summary": "Engineer robust digital color systems: HSL and OKLCH color spaces, the 60-30-10 distribution rule, semantic palette architecture (Primary, Neutral, Surface, Alert), WCAG contrast ratios, and dark mode elevation mapping.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=_2LLXnUdUIc",
      "body": "<h2>1. The Physics and Perception of Color in Digital UI</h2>\n<p>Color is one of the most immediate emotional communication tools in UI design, yet it is also the most frequently abused. Color in digital interfaces serves functional purposes: establishing brand recognition, communicating visual hierarchy, indicating interactivity, and providing urgent system feedback.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/_2LLXnUdUIc' title='Color Theory for UI Design' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Color Models: RGB vs HSL vs OKLCH</h2>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Model</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Dimensions</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Strengths & UI Applications</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>RGB / HEX</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Red, Green, Blue (0-255 or #000000 to #FFFFFF)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Hardware display native. Non-intuitive for humans to tweak brightness or tint manually.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>HSL</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Hue (0°-360°), Saturation (0%-100%), Lightness (0%-100%)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Intuitive for building shade ramps by keeping Hue constant while adjusting Lightness.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>OKLCH</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Lightness, Chroma, Hue</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Perceptually uniform.</strong> In standard HSL, pure yellow at 50% lightness looks blindingly bright, while pure blue at 50% looks dark. OKLCH fixes perceptual luminance so colors of the same lightness have identical perceived brightness across all hues.</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>3. The 60-30-10 Color Balance Rule</h2>\n<p>Adapted from interior architecture, the <strong>60-30-10 rule</strong> prevents visual chaos and ensures interfaces feel balanced and professional:</p>\n<ul>\n  <li><strong>60% Dominant Neutral:</strong> The foundational background and canvas color (e.g., crisp white #FFFFFF or cool gray #F8FAFC in light mode; deep slate #0F172A in dark mode).</li>\n  <li><strong>30% Secondary Structure:</strong> Card surfaces, sidebars, borders, input backgrounds, and primary body typography.</li>\n  <li><strong>10% Accent / Interactive:</strong> The high-impact brand accent color reserved exclusively for primary calls-to-action (CTAs), active states, links, and key focal points. When everything is colorful, nothing stands out.</li>\n</ul>\n\n<h2>4. Semantic Color Architecture in Design Systems</h2>\n<p>Professional design systems do not refer to colors by their raw visual appearance (e.g., <code>blue</code> or <code>#3B82F6</code>). They structure colors into a three-tiered semantic hierarchy:</p>\n<ol>\n  <li><strong>Primitive / Global Tokens:</strong> Raw color ramps (e.g., <code>blue-50</code> through <code>blue-900</code>).</li>\n  <li><strong>Semantic Tokens:</strong> Meaning-assigned tokens mapped to roles:\n    <ul>\n      <li><code>color-interactive-primary</code>: Used for primary action buttons.</li>\n      <li><code>color-feedback-success</code>: Positive confirmations (#10B981).</li>\n      <li><code>color-feedback-warning</code>: Cautions and pending states (#F59E0B).</li>\n      <li><code>color-feedback-danger</code>: Destructive actions and form errors (#EF4444).</li>\n      <li><code>color-surface-elevated</code>: Floating dropdowns and modals.</li>\n    </ul>\n  </li>\n  <li><strong>Component Tokens:</strong> Scoped specifically to a UI widget (e.g., <code>btn-primary-bg = color-interactive-primary</code>).</li>\n</ol>\n\n<h2>5. WCAG Accessibility Contrast Math</h2>\n<p>The Web Content Accessibility Guidelines (WCAG 2.2) define mathematical contrast ratios based on relative luminance:</p>\n<ul>\n  <li><strong>Level AA (Minimum Legal Standard):</strong>\n    <ul>\n      <li><strong>4.5 : 1</strong> contrast ratio for normal body text (< 18pt or < 14pt bold).</li>\n      <li><strong>3.0 : 1</strong> contrast ratio for large text (≥ 18pt regular or ≥ 14pt bold) and user interface graphical components (input borders, icons, buttons).</li>\n    </ul>\n  </li>\n  <li><strong>Level AAA (Enhanced / High Contrast Standard):</strong>\n    <ul>\n      <li><strong>7.0 : 1</strong> for normal body text.</li>\n      <li><strong>4.5 : 1</strong> for large text.</li>\n    </ul>\n  </li>\n</ul>\n\n<h2>6. Dark Mode Engineering: Elevation & Surface Tinting</h2>\n<p>Designing dark mode is not a naive color inversion. Inverting pure white (#FFFFFF) to pure black (#000000) causes extreme visual vibration, halation, and severe eye strain.</p>\n<h3>Rules for Dark Mode Excellence:</h3>\n<ol>\n  <li><strong>Never Use Pure Black (#000000) for Canvas:</strong> Use deep dark gray or desaturated navy (e.g., #121212 or #0F172A). Pure black creates excessive contrast against white text (21:1) that causes text to blur for astigmatic eyes.</li>\n  <li><strong>Communicate Elevation via Lightness, Not Drop Shadows:</strong> In light mode, elevated modals cast dark drop shadows. In dark mode, shadows are invisible against dark backgrounds. Instead, higher elevation surfaces are rendered with <em>lighter surface tints</em> (e.g., base canvas = #121212, card surface = #1E1E1E, modal dialog = #2A2A2A).</li>\n  <li><strong>Desaturate Accent Colors:</strong> Vibrant, highly saturated primary brand colors that look gorgeous in light mode will vibrate painfully and fail contrast in dark mode. Desaturate primary accents (shift from 500 to 400 or 300 tier) to prevent optical vibration.</li>\n  <li><strong>Reduce Typography Contrast:</strong> Use off-white (#E2E8F0 or #F1F5F9 at 87% opacity) rather than pure white (#FFFFFF) for primary text in dark mode.</li>\n</ol>\n\n<h2>7. Key Takeaways</h2>\n<ol>\n  <li>OKLCH provides perceptually uniform color ramps where brightness matches human eye sensitivity.</li>\n  <li>The 60-30-10 rule balances dominant neutrals, structural containers, and high-impact accents.</li>\n  <li>WCAG 2.2 AA mandates 4.5:1 contrast for normal body text and 3:1 for large text and UI borders.</li>\n  <li>Dark mode requires dark gray surfaces, elevation conveyed via lightness tints, and desaturated accents.</li>\n  <li>Semantic color tokens decouple raw hex codes from their UI functional responsibilities.</li>\n</ol>"
    },
    {
      "id": "CH-UIX-009",
      "courseId": "CRS-UIX-001",
      "chapterNumber": 9,
      "title": "Layout Grids, Responsive Breakpoints & Mobile Ergonomics",
      "summary": "Structure responsive digital interfaces: 12-column desktop grids, 4-column mobile grids, margin and gutter math, responsive layout breakpoints, mobile thumb zone ergonomics, safe area insets, and minimum touch targets.",
      "readingTimeMinutes": 37,
      "videoUrl": "https://www.youtube.com/watch?v=c9wgsmXwYnU",
      "body": "<h2>1. The Architecture of Layout Grids</h2>\n<p>A layout grid is the underlying mathematical framework that governs the positioning and alignment of elements on a screen. Far from restricting creativity, grids provide structural cohesion, rhythm, and predictability, allowing multiple designers and engineers to build complex multi-page applications with seamless consistency.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/c9wgsmXwYnU' title='Responsive Grid Systems in UI Design' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Anatomy of a Column Grid System</h2>\n<p>Every responsive grid comprises three fundamental components:</p>\n<ul>\n  <li><strong>Columns:</strong> The vertical colored bands where content, cards, and UI elements reside. Content spans across integer numbers of columns (e.g., a card spanning 4 of 12 columns).</li>\n  <li><strong>Gutters:</strong> The fixed spacing separating adjacent columns. Gutters prevent content from bleeding together. Standard gutter sizes are <strong>16px, 24px, or 32px</strong>.</li>\n  <li><strong>Margins (Side Padding):</strong> The outer buffer space between the leftmost/rightmost columns and the edge of the viewport. Margins protect content from crashing into screen borders.</li>\n</ul>\n\n<h3>Why the 12-Column Grid Dominates Desktop:</h3>\n<p>The number 12 is the most mathematically versatile integer for interface design because it is evenly divisible by <strong>1, 2, 3, 4, 6, and 12</strong>. This allows seamless division into:</p>\n<ul>\n  <li>2 equal halves (6 columns each)</li>\n  <li>3 equal thirds (4 columns each)</li>\n  <li>4 equal quarters (3 columns each)</li>\n  <li>6 equal columns (2 columns each)</li>\n  <li>Asymmetric splits (e.g., 8-column main content + 4-column sidebar)</li>\n</ul>\n\n<h2>3. Responsive Breakpoints & Device Adaptations</h2>\n<p>Interfaces must adapt fluidly across thousands of physical device viewports. Industry-standard responsive design defines distinct tier breakpoints:</p>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Device Class</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Viewport Width</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Columns</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Gutter</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Margin</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Mobile Portrait</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>320px – 480px (Base: 390px)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>4 columns</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>16px</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>16px</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Tablet / Small Laptop</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>768px – 1024px (Base: 834px)</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>8 columns</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>24px</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>32px</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Desktop Regular</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>1280px – 1440px</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>12 columns</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>24px</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Auto / Centered (Max-width: 1200px)</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Ultra-Wide Monitor</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>1920px+</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>12 columns</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>32px</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Auto / Centered (Max-width: 1440px)</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>4. Mobile Ergonomics & Steven Hoober's Thumb Zone</h2>\n<p>Pioneering mobile research by <strong>Steven Hoober</strong> revealed that 49% of smartphone users operate their devices using one hand, with the thumb performing virtually all interactions. On modern tall smartphone screens (e.g., iPhone 15 Pro, Samsung Galaxy S24), the physical reach of the thumb divides the viewport into three ergonomic zones:</p>\n<pre><code>\n+-----------------------------------------+\n|  HARD TO REACH (The Stretch Zone)       |  <-- Back buttons, settings, non-urgent icons\n|  (Requires shifting grip or two hands)  |\n+-----------------------------------------+\n|  NATURAL ZONE (The Comfortable Sweep)   |  <-- Main feed, cards, interactive lists\n|  (Effortless thumb arc rotation)        |\n+-----------------------------------------+\n|  EASY TO REACH (The Sweet Spot)         |  <-- Primary CTA, Bottom Navigation Bar,\n|  (Lowest physical fatigue)              |      Floating Action Buttons (FAB)\n+-----------------------------------------+\n</code></pre>\n\n<h3>Ergonomic Design Directives:</h3>\n<ul>\n  <li><strong>Place Primary CTAs at the Bottom:</strong> Critical actions (e.g., 'Checkout', 'Save', 'Submit') should be pinned to the bottom sheet or bottom action bar rather than positioned at the top of the viewport.</li>\n  <li><strong>Bottom Navigation Bars:</strong> Core navigational switches belong in a 3-to-5 item bottom tab bar where thumbs naturally rest.</li>\n  <li><strong>Minimum Touch Target Sizes:</strong>\n    <ul>\n      <li><strong>Apple Human Interface Guidelines (HIG):</strong> Minimum touch target of <strong>44 × 44 pt</strong>.</li>\n      <li><strong>Google Material Design 3:</strong> Minimum touch target of <strong>48 × 48 dp</strong>.</li>\n      <li>Even if an icon visually renders at 20 × 20 px, its clickable hitbox (padding) must expand to at least 44 × 44 px to prevent mis-taps.</li>\n    </ul>\n  </li>\n</ul>\n\n<h2>5. Safe Areas & Hardware Sensor Insets</h2>\n<p>Modern smartphones feature physical hardware intrusions: the notch, the Apple Dynamic Island, rounded corner bezels, and the iOS bottom Home Indicator bar.</p>\n<p>Interfaces must utilize <strong>Safe Area Insets</strong> (in CSS: <code>env(safe-area-inset-top)</code> and <code>env(safe-area-inset-bottom)</code>). Fixed bottom buttons must include sufficient bottom padding (typically 34px on iPhones) to ensure the interactive element is not triggered accidentally when a user swipes up to return to the home screen.</p>\n\n<h2>6. Key Takeaways</h2>\n<ol>\n  <li>Layout grids combine columns, gutters, and margins to enforce visual order and spatial rhythm.</li>\n  <li>The 12-column desktop grid provides maximum flexibility by dividing cleanly into 2, 3, 4, and 6 parts.</li>\n  <li>Mobile viewports utilize 4 columns with standard 16px margins and 16px gutters.</li>\n  <li>Hoober's thumb zone dictates placing frequent interactions and primary CTAs in the bottom half of mobile screens.</li>\n  <li>Maintain minimum touch target sizes of 44x44pt (Apple) and 48x48dp (Google) with safe-area hardware padding.</li>\n</ol>"
    },
    {
      "id": "CH-UIX-010",
      "courseId": "CRS-UIX-001",
      "chapterNumber": 10,
      "title": "Figma Deep Dive: Vectors, Components, Variants & Component Properties",
      "summary": "Unlock the full engineering power of Figma: Vector Networks vs standard Bezier curves, Boolean operations, Master Components and Instances, Variant matrices, and Component Properties (Boolean, Text, Instance Swap, Variant).",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=k74IrUNaJnk",
      "body": "<h2>1. The Industry Standard: Figma as a Product Platform</h2>\n<p>Figma is not merely a drawing tool; it is an interactive engineering platform running on WebAssembly and WebGL. In enterprise product design, mastering Figma's component architecture bridges the conceptual gap between design assets and production codebases (React, Vue, iOS Swift, Android Jetpack Compose).</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/k74IrUNaJnk' title='Figma Components and Variants Tutorial' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Vector Networks vs Traditional Bezier Paths</h2>\n<p>Traditional vector illustration tools (Illustrator, Sketch) rely on continuous path loops where a point connects to at most two other points. Figma pioneered <strong>Vector Networks</strong>:</p>\n<ul>\n  <li>A single vertex point in Figma can branch out to three, four, or more connecting lines in any direction.</li>\n  <li>Complex shapes, icons, and geometric polygons can be constructed within a single vector layer without needing dozens of grouped compound paths.</li>\n  <li><strong>Boolean Operations:</strong> Union Selection, Subtract Selection, Intersect Selection, and Exclude Selection allow non-destructive geometry compounding, keeping original shape primitives editable.</li>\n</ul>\n\n<h2>3. Frames vs Groups: The Critical Distinction</h2>\n<p>One of the most frequent beginner mistakes in Figma is using Groups (<code>Cmd+G</code>) instead of Frames (<code>Cmd+Alt+G</code> / <code>F</code>):</p>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Attribute</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Groups</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Frames</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Bounds & Dimensions</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Bound strictly to child layers. Resizing a group distorts and stretches child vector shapes.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Independent bounding box (like a <code>&lt;div&gt;</code> in HTML). Can be sized independently of children.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Constraints & Auto Layout</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Do not support constraints or Auto Layout.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Fully support directional constraints (Left, Right, Center, Scale) and Auto Layout flexbox logic.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Clipping Content</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Cannot clip overflow content.</td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Supports <code>Clip content</code> (identical to CSS <code>overflow: hidden</code>).</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>4. Master Components vs Component Instances</h2>\n<p>Components are reusable UI elements that can be published across files and design systems:</p>\n<ul>\n  <li><strong>Main / Master Component:</strong> The single source of truth represented by four purple solid diamonds (❖). Any visual or structural alteration to the main component instantly cascades across every instance throughout the entire design system.</li>\n  <li><strong>Component Instance:</strong> A linked clone represented by a single purple hollow diamond (◇). Instances inherit all master changes but allow local <strong>overrides</strong> (text content, fills, nested icon swaps, visibility toggles).</li>\n  <li><strong>Instance Reset:</strong> Designers can selectively reset individual property overrides or revert the entire instance back to the master state at any time.</li>\n</ul>\n\n<h2>5. Component Sets & Variants</h2>\n<p>Before Variants, design systems suffered from 'component explosion'—requiring separate master components for <code>Button/Primary/Default</code>, <code>Button/Primary/Hover</code>, <code>Button/Secondary/Disabled</code>, resulting in hundreds of disconnected assets.</p>\n<p><strong>Variants</strong> combine related components into a single unified <strong>Component Set</strong> container with structured property dimensions:</p>\n<ul>\n  <li><strong>Type / Hierarchy:</strong> <code>Primary</code> | <code>Secondary</code> | <code>Tertiary</code> | <code>Destructive</code></li>\n  <li><strong>Size:</strong> <code>Small (32px)</code> | <code>Medium (40px)</code> | <code>Large (48px)</code></li>\n  <li><strong>State:</strong> <code>Default</code> | <code>Hover</code> | <code>Pressed</code> | <code>Focused</code> | <code>Disabled</code></li>\n</ul>\n\n<h2>6. Modern Component Properties (Component Props)</h2>\n<p>To streamline variant sets and mirror React props, Figma introduced <strong>Component Properties</strong>, reducing variant matrix size by up to 80%:</p>\n<ol>\n  <li><strong>Boolean Properties:</strong> Toggles layer visibility on or off with a simple boolean switch in the right sidebar (e.g., <code>hasLeadingIcon = true/false</code>, <code>showBadge = true/false</code>). Eliminates the need to duplicate variants just to show or hide an icon.</li>\n  <li><strong>Text Properties:</strong> Exposes editable string fields in the instance sidebar (e.g., <code>buttonLabel = 'Get Started'</code>). Designers can edit copy without double-clicking into deep nested layers.</li>\n  <li><strong>Instance Swap Properties:</strong> Surfaces an icon picker dropdown directly in the top-level property panel, enabling users to swap child icons with any asset in the icon library with a single click.</li>\n  <li><strong>Variant Properties:</strong> Defines the core visual configuration axes (Size, Color, Theme).</li>\n</ol>\n\n<h2>7. Key Takeaways</h2>\n<ol>\n  <li>Figma's Vector Networks allow multi-branching vertices for complex, clean geometric icon design.</li>\n  <li>Frames act like HTML <code>&lt;div&gt;</code> elements with independent bounds, constraints, and overflow clipping.</li>\n  <li>Main components (❖) cascade updates down to all linked instances (◇) while preserving overrides.</li>\n  <li>Variants group related component permutations into a single coherent component set.</li>\n  <li>Component Properties (Boolean, Text, Instance Swap) prevent variant explosion and mirror React component props.</li>\n</ol>"
    },
    {
      "id": "CH-UIX-011",
      "courseId": "CRS-UIX-001",
      "chapterNumber": 11,
      "title": "Auto Layout Mastery: Flexbox-Style Responsive UI Layouts in Figma",
      "summary": "Master responsive layout engineering in Figma: Horizontal and Vertical Auto Layout, Padding and Gap mechanics, Hug vs Fill vs Fixed sizing rules, Absolute Positioning within Auto Layout, Flex-wrapping, and nested layout architectures.",
      "readingTimeMinutes": 37,
      "videoUrl": "https://www.youtube.com/watch?v=pA0N5p5p9nU",
      "body": "<h2>1. The Power of Auto Layout</h2>\n<p><strong>Auto Layout</strong> is Figma's implementation of the CSS Flexbox layout engine. Rather than manually nudging rectangles and text layers whenever copy changes, Auto Layout frames dynamically expand, contract, wrap, and redistribute space automatically.</p>\n<p>Designing without Auto Layout is like coding a website using absolute pixel coordinates from 1996. Auto Layout ensures your designs behave identically to modern responsive frontend code (HTML, CSS Flexbox, React Native Flexbox).</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/pA0N5p5p9nU' title='Figma Auto Layout Masterclass' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Core Dimensions of Auto Layout</h2>\n<p>Applying Auto Layout (<code>Shift+A</code>) to a frame exposes four fundamental spatial parameters:</p>\n<ul>\n  <li><strong>Direction:</strong>\n    <ul>\n      <li><strong>Vertical:</strong> Arranges child elements in a top-to-bottom column (<code>flex-direction: column</code>).</li>\n      <li><strong>Horizontal:</strong> Arranges child elements in a left-to-right row (<code>flex-direction: row</code>).</li>\n      <li><strong>Wrap:</strong> Elements flow horizontally and automatically wrap to the next line when container width is exceeded (<code>flex-wrap: wrap</code>).</li>\n    </ul>\n  </li>\n  <li><strong>Gap (Item Spacing):</strong> The uniform distance between adjacent siblings (maps directly to CSS <code>gap: 16px</code>). Can be set to a fixed pixel value or <strong>Auto</strong> (maps to CSS <code>justify-content: space-between</code>).</li>\n  <li><strong>Padding:</strong> The internal whitespace between child elements and the outer boundary of the frame. Figma supports independent top, right, bottom, and left padding values (or uniform padding).</li>\n  <li><strong>Alignment:</strong> A 9-point grid matrix controlling how child elements align along the cross axis and main axis (Top-Left, Center, Bottom-Right, etc.).</li>\n</ul>\n\n<h2>3. Sizing Rules: Fixed, Hug, and Fill Container</h2>\n<p>The true magic of Auto Layout lies in the relationship between parent frames and child elements along both the Horizontal (X) and Vertical (Y) axes:</p>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Sizing Mode</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>CSS Flexbox Equivalent</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Behavior & Use Case</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Fixed</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>width: 320px;</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>The element retains its exact specified pixel dimension regardless of children or parent size. Used for fixed-width sidebars or avatar icons.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Hug Contents</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>width: fit-content;</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>The frame dynamically sizes itself to tightly enclose its internal children plus its defined padding. Essential for buttons and tags that must expand when copy changes.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Fill Container</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>flex-grow: 1; width: 100%;</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>The child expands to stretch and occupy all available remaining space within its parent frame. Crucial for responsive card grids, fluid headers, and multi-line body text.</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>4. Absolute Positioning Within Auto Layout</h2>\n<p>Historically, placing an element at an arbitrary coordinate inside an Auto Layout frame required breaking Auto Layout. Figma solves this with <strong>Absolute Positioning</strong>:</p>\n<ul>\n  <li>Selecting an element inside an Auto Layout frame and toggling the Absolute Position icon (top-right of the design panel) takes the layer out of the normal flex flow.</li>\n  <li>The element can now be pinned to any corner (e.g., placing an unread notification badge at <code>top: -4px, right: -4px</code> of an avatar icon) while the parent frame retains full Auto Layout capabilities.</li>\n</ul>\n\n<h2>5. Nested Auto Layout Architecture (Card Component Blueprint)</h2>\n<p>Professional UI components are constructed by nesting multiple Auto Layout frames hierarchically:</p>\n<pre><code>\n[ Frame: CardContainer (Vertical, Fixed width 360px, Hug height, Padding: 24px, Gap: 16px) ]\n  ├── [ Frame: ImageHeader (Fixed height 180px, Fill width) ]\n  │     └── [ Frame: Badge (Absolute position: top 12px, left 12px, Hug) ]\n  ├── [ Frame: ContentStack (Vertical, Fill width, Hug height, Gap: 8px) ]\n  │     ├── [ Text: CategorySubtitle (Fill width, Hug height) ]\n  │     ├── [ Text: CardTitle (Fill width, Hug height) ]\n  │     └── [ Text: BodyDescription (Fill width, Hug height) ]\n  └── [ Frame: FooterActionRow (Horizontal, Fill width, Hug height, Gap: Auto / space-between) ]\n        ├── [ Text: PriceLabel (Hug width, Hug height) ]\n        └── [ Frame: PrimaryButton (Horizontal, Hug width, Hug height, Padding: 12px 20px) ]\n</code></pre>\n\n<h2>6. Key Takeaways</h2>\n<ol>\n  <li>Auto Layout directly mirrors CSS Flexbox properties: direction, gap, padding, and alignment.</li>\n  <li>'Hug Contents' wraps tightly around child content; 'Fill Container' stretches to occupy available parent width.</li>\n  <li>Buttons must always be built with 'Hug Contents' to expand smoothly when localized into languages with longer words (e.g., German).</li>\n  <li>Absolute Positioning allows floating badges and pin-icons without disrupting the flexbox flow.</li>\n  <li>Responsive card designs combine vertical ContentStacks set to 'Fill' with space-between footer rows.</li>\n</ol>"
    },
    {
      "id": "CH-UIX-012",
      "courseId": "CRS-UIX-001",
      "chapterNumber": 12,
      "title": "Micro-Interactions, Motion Design & State Choreography",
      "summary": "Bring interfaces to life with purposeful motion design: Dan Saffer's micro-interaction architecture, Disney's 12 principles of animation adapted to UI, cubic-bezier easing curves, transition durations, Smart Animate in Figma, and interactive component state choreography.",
      "readingTimeMinutes": 38,
      "videoUrl": "https://www.youtube.com/watch?v=2x0ZgV2c0sI",
      "body": "<h2>1. The Purpose of UI Motion</h2>\n<p>Motion in digital user interfaces is not gratuitous decoration; it is functional communication. When implemented with discipline, motion explains spatial relationships, directs attention to critical state changes, provides physical continuity across page transitions, and imbues digital software with tactile elegance.</p>\n<p>Poor motion feels sluggish, distracting, and nauseating. Elite UI motion is subtle, swift, and imperceptible as animation—it feels like natural physics.</p>\n\n<div class='video-container' style='position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 24px 0;'>\n  <iframe src='https://www.youtube.com/embed/2x0ZgV2c0sI' title='Micro-interactions and UI Motion Design' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;' allowfullscreen></iframe>\n</div>\n\n<h2>2. Dan Saffer's Micro-Interaction Model</h2>\n<p>In his definitive book <em>Microinteractions</em>, Dan Saffer identified that the difference between a product you tolerate and a product you love lies in the quality of its micro-interactions (e.g., pulling to refresh an inbox, toggling a switch, liking a post, typing in a password). Every micro-interaction consists of four discrete stages:</p>\n<ol>\n  <li><strong>The Trigger:</strong> What initiates the interaction. Can be a <em>User Trigger</em> (clicking a button, dragging a card, swiping) or a <em>System Trigger</em> (incoming push notification, battery level dropping to 10%).</li>\n  <li><strong>The Rules:</strong> The underlying logic governing what happens when the trigger fires (e.g., if switch is ON, toggle dark theme; if network fails, show error snackbar).</li>\n  <li><strong>The Feedback:</strong> The visual, auditory, or haptic response that confirms the rule has executed (e.g., switch knob glides right, turns emerald green, phone emits a soft tactile vibration).</li>\n  <li><strong>Loops & Modes:</strong> Meta-rules that govern the interaction over time (e.g., does the notification banner dismiss itself after 4 seconds? Does repeated clicking trigger a warning?).</li>\n</ol>\n\n<h2>3. Easing Curves & The Physics of Motion</h2>\n<p>In the physical universe, objects never move at constant linear velocity. Gravity, friction, and mass dictate that objects accelerate as they start and decelerate before coming to rest. Linear motion in UI feels robotic, jarring, and unnatural.</p>\n<table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>\n  <thead>\n    <tr style='background-color: #f1f5f9;'>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Easing Type</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Cubic Bezier</th>\n      <th style='padding: 12px; border: 1px solid #cbd5e1; text-align: left;'>Physics & Best Use Case</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Ease-Out (Deceleration)</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>cubic-bezier(0.0, 0.0, 0.2, 1)</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Starts at peak velocity and decelerates to a gentle stop. <strong>Primary easing for entering elements</strong> (modals appearing, dropdowns opening, drawer sliding into view). Matches physical entry.</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Ease-In (Acceleration)</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>cubic-bezier(0.4, 0.0, 1, 1)</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Starts slowly and accelerates off screen. <strong>Primary easing for exiting elements</strong> (dismissing alerts, closing modals, sliding sheets away).</td>\n    </tr>\n    <tr>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><strong>Ease-In-Out (Standard)</strong></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'><code>cubic-bezier(0.4, 0.0, 0.2, 1)</code></td>\n      <td style='padding: 12px; border: 1px solid #cbd5e1;'>Accelerates smoothly, travels, and decelerates gently. <strong>Primary easing for on-screen transitions</strong> where element remains in view (expanding an accordion card, repositioning list items).</td>\n    </tr>\n  </tbody>\n</table>\n\n<h2>4. Duration Benchmarks for Digital Interfaces</h2>\n<p>Animation speed directly impacts perceived product responsiveness. Transitions that exceed 400ms make software feel laggy:</p>\n<ul>\n  <li><strong>Micro-transitions (100ms – 150ms):</strong> Hover states, button color changes, active tap scales, checkbox checkmarks. Fast enough to feel instantaneous while preventing hard cuts.</li>\n  <li><strong>Standard UI Transitions (200ms – 300ms):</strong> Dropdown expansions, tooltips, toast snackbars, toggle switches, tab line switches. The sweet spot for interface choreography.</li>\n  <li><strong>Complex Orchestrations (300ms – 450ms):</strong> Full-screen modal sheets, side navigation drawer slides, page route transitions. Any animation exceeding 500ms should only be used for rare celebratory moments (e.g., confetti after completing a loan application).</li>\n</ul>\n\n<h2>5. Smart Animate in Figma & Interactive Component Choreography</h2>\n<p>Figma's <strong>Smart Animate</strong> engine tracks matching layer names between two screens or component variants and automatically interpolates differences in position, size, fill, opacity, and rotation:</p>\n<ol>\n  <li><strong>Layer Naming Continuity:</strong> Smart Animate only interpolates between layers that share the <em>exact same name</em> and structural hierarchy. If a layer is renamed from <code>Icon</code> to <code>CloseButton</code>, Figma will cross-fade rather than morph.</li>\n  <li><strong>State Choreography for Interactive Components:</strong>\n    <ul>\n      <li><strong>Default:</strong> Base neutral resting state.</li>\n      <li><strong>Hover:</strong> Subtle elevation increase (+2px Y offset, soft shadow) and 5% darker fill (150ms Ease-Out).</li>\n      <li><strong>Pressed / Active:</strong> Subtle scale down to 98% (transforms downwards along Z-axis) to simulate physical keypress (100ms Ease-In).</li>\n      <li><strong>Focused:</strong> Visible 2px high-contrast outline ring (accessible focus indicator).</li>\n      <li><strong>Loading:</strong> Replaces text label with animated circular spinner or skeleton shimmer.</li>\n      <li><strong>Disabled:</strong> 40% opacity, cursor: not-allowed, stripped of hover/press transitions.</li>\n    </ul>\n  </li>\n</ol>\n\n<h2>6. Key Takeaways</h2>\n<ol>\n  <li>Micro-interactions consist of four elements: Trigger, Rules, Feedback, and Loops/Modes.</li>\n  <li>Never use linear motion for UI; apply Ease-Out for entering elements and Ease-In for exiting elements.</li>\n  <li>Keep standard UI motion between 200ms and 300ms; anything over 400ms degrades perceived speed.</li>\n  <li>Figma Smart Animate requires exact layer name matching across frames to interpolate position and size.</li>\n  <li>Choreograph complete interactive component states: default, hover, pressed, focused, disabled, and loading.</li>\n</ol>"
    }
  ],
  "assessments": [
    {
      "id": "ASM-UIX-007",
      "courseId": "CRS-UIX-001",
      "chapterId": "CH-UIX-007",
      "title": "Assessment: Visual Hierarchy, Typography & Spatial Rhythm",
      "description": "Test your mastery of eye-tracking patterns (F/Z), typographic anatomy, line-height math, modular scale ratios, and the 8pt grid system.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-UIX-061",
          "question": "Which reading pattern is predominantly observed during eye-tracking studies on text-dense interfaces such as editorial blogs and documentation?",
          "options": [
            "The Z-Pattern",
            "The F-Pattern",
            "The Circular Spiral Pattern",
            "The Diagonal S-Curve"
          ],
          "correctIndex": 1,
          "explanation": "The F-Pattern describes how users read text-heavy content by scanning across the top line, scanning a shorter distance across the second line, and glancing vertically down the left margin."
        },
        {
          "id": "Q-UIX-062",
          "question": "What is the primary technical advantage of using an 8-point spatial grid system in digital interface design?",
          "options": [
            "It automatically optimizes SEO meta tags.",
            "Multiples of 8 scale cleanly across different device pixel densities (@1x, @2x, @3x, and 1.5x Android) without generating blurry subpixel fractions.",
            "It forces all fonts to be 8pt in size.",
            "It eliminates the need for CSS flexbox."
          ],
          "correctIndex": 1,
          "explanation": "8 divides cleanly and multiplies evenly into integer values across standard display densities (e.g., 8 × 1.5 = 12px), eliminating half-pixel anti-aliasing blur."
        },
        {
          "id": "Q-UIX-063",
          "question": "In digital typography, what is the recommended line-height (leading) for comfortable body text readability?",
          "options": [
            "80% to 100% of font size",
            "140% to 160% of font size",
            "300% to 400% of font size",
            "Exactly 10 pixels regardless of font size"
          ],
          "correctIndex": 1,
          "explanation": "A line-height of 140% to 160% (1.4 to 1.6) provides optimal vertical separation between baselines, preventing lines of text from blurring together during horizontal sweeps."
        },
        {
          "id": "Q-UIX-064",
          "question": "What is the optimal 'measure' (line length) for comfortable body copy reading on screens?",
          "options": [
            "10 to 20 characters per line",
            "45 to 75 characters per line (including spaces)",
            "150 to 200 characters per line",
            "As many characters as can fit across the entire viewport"
          ],
          "correctIndex": 1,
          "explanation": "The human eye tracks comfortably across 45 to 75 characters per line; exceeding this causes eye strain when locating the start of the next line."
        },
        {
          "id": "Q-UIX-065",
          "question": "Why do typefaces with generous 'x-heights' (such as Inter or San Francisco) perform better in digital UI design?",
          "options": [
            "They take up less storage space on the server.",
            "Taller lowercase letters maximize legibility and perceptual clarity at small screen sizes.",
            "They convert automatically into SVG vectors.",
            "They prevent screen burn-in on OLED displays."
          ],
          "correctIndex": 1,
          "explanation": "A larger x-height makes lowercase characters appear proportionally larger and more open, significantly enhancing legibility at small UI text sizes (12-14px)."
        },
        {
          "id": "Q-UIX-066",
          "question": "What happens to letter-spacing (tracking) best practices as font size increases from small captions to large hero headlines?",
          "options": [
            "Tracking should expand significantly (+10%) for large headlines.",
            "Tracking should tighten slightly (-1% to -2%) for large headlines to keep character spacing optically balanced.",
            "Tracking must remain exactly 0 across all scales.",
            "Large headlines should always be italicized."
          ],
          "correctIndex": 1,
          "explanation": "Because large font sizes naturally amplify physical space between glyphs, tightening tracking (-1% to -2%) creates a tighter, more cohesive headline aesthetic."
        },
        {
          "id": "Q-UIX-067",
          "question": "Which of the following typographic scales uses a 1.250 multiplication ratio?",
          "options": [
            "Minor Second",
            "Major Second",
            "Major Third",
            "Golden Ratio"
          ],
          "correctIndex": 2,
          "explanation": "The Major Third scale utilizes a mathematical ratio of 1.250 (e.g., 16px × 1.25 = 20px, 20px × 1.25 = 25px)."
        },
        {
          "id": "Q-UIX-068",
          "question": "How does whitespace (negative space) influence visual weight in UI design?",
          "options": [
            "It decreases an element's importance by pushing it away.",
            "Surrounding an element with generous whitespace isolates it, elevating its focal prominence without requiring larger font sizes or brighter colors.",
            "It causes users to believe the page is broken.",
            "It is considered wasted real estate that should be filled with ads."
          ],
          "correctIndex": 1,
          "explanation": "Ample negative space acts as a visual spotlight, giving elements room to breathe and directing immediate perceptual focus."
        },
        {
          "id": "Q-UIX-069",
          "question": "What visual pattern is most prevalent on landing pages with structured hero cards, navigation headers, and primary CTAs?",
          "options": [
            "The F-Pattern",
            "The Z-Pattern",
            "The Inverted Triangle Pattern",
            "The Random Brownian Pattern"
          ],
          "correctIndex": 1,
          "explanation": "The Z-Pattern tracks how viewers scan landing pages from top-left (brand) to top-right (menu/login), diagonally across the hero area, and through the bottom call-to-action."
        },
        {
          "id": "Q-UIX-070",
          "question": "In the 8pt grid system, what sub-grid increment is standard for micro-elements like icon padding, badges, and fine borders?",
          "options": [
            "1pt",
            "4pt",
            "7pt",
            "10pt"
          ],
          "correctIndex": 1,
          "explanation": "A 4pt half-grid is the standard companion to the 8pt system, providing necessary granular spacing for compact elements like tags, icons, and status badges."
        }
      ]
    },
    {
      "id": "ASM-UIX-008",
      "courseId": "CRS-UIX-001",
      "chapterId": "CH-UIX-008",
      "title": "Assessment: Color Theory, Perceptual Systems & Dark Mode",
      "summary": "Evaluate your mastery of color spaces (RGB, HSL, OKLCH), the 60-30-10 distribution rule, WCAG contrast standards, and dark mode elevation mapping.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-UIX-071",
          "question": "Why is the OKLCH color space superior to standard HSL for building design system color palettes?",
          "options": [
            "OKLCH uses less GPU memory.",
            "OKLCH is perceptually uniform, meaning two colors with the same lightness value will have the same perceived brightness to the human eye regardless of hue.",
            "OKLCH only works in dark mode.",
            "OKLCH automatically generates React components."
          ],
          "correctIndex": 1,
          "explanation": "Unlike HSL (where yellow at 50% lightness looks vastly brighter than blue at 50%), OKLCH provides true perceptual uniformity, creating harmonious, accessible color ramps."
        },
        {
          "id": "Q-UIX-072",
          "question": "In the 60-30-10 color balance rule, what role does the 10% accent color play?",
          "options": [
            "It fills the primary background canvas.",
            "It is reserved exclusively for high-impact focal points such as primary CTA buttons, links, active states, and critical notifications.",
            "It defines the color of all paragraph body text.",
            "It is used for modal backdrop overlays."
          ],
          "correctIndex": 1,
          "explanation": "Restricting high-saturation accent color to 10% ensures that primary interactive actions immediately command visual attention without causing visual clutter."
        },
        {
          "id": "Q-UIX-073",
          "question": "What is the minimum WCAG 2.2 Level AA contrast ratio required for normal body text (< 18pt regular)?",
          "options": [
            "2.5 : 1",
            "3.0 : 1",
            "4.5 : 1",
            "7.0 : 1"
          ],
          "correctIndex": 2,
          "explanation": "WCAG 2.2 AA mandates a minimum contrast ratio of 4.5:1 against the background for regular body copy to ensure readability for visually impaired users."
        },
        {
          "id": "Q-UIX-074",
          "question": "What is the minimum WCAG 2.2 Level AA contrast ratio required for large text (≥ 18pt or ≥ 14pt bold) and active UI components (input borders)?",
          "options": [
            "1.5 : 1",
            "3.0 : 1",
            "4.5 : 1",
            "10.0 : 1"
          ],
          "correctIndex": 1,
          "explanation": "Large text and functional graphical user interface elements (such as borders and interactive button outlines) require a minimum 3.0:1 contrast ratio under Level AA."
        },
        {
          "id": "Q-UIX-075",
          "question": "Why should dark mode UI avoid using pure black (#000000) as the foundational background canvas?",
          "options": [
            "Pure black consumes double the battery life of dark gray.",
            "Pure black creates harsh 21:1 contrast against white text that triggers optical vibration, halation, and eye strain, especially for users with astigmatism.",
            "Modern OLED screens cannot display pure black.",
            "Pure black is protected by trademark law."
          ],
          "correctIndex": 1,
          "explanation": "Deep dark grays (#121212 or #0F172A) reduce harsh contrast glare, alleviate eye strain, and allow subtle depth layers to be visible."
        },
        {
          "id": "Q-UIX-076",
          "question": "How should elevation and depth be communicated in dark mode interfaces where drop shadows are largely invisible?",
          "options": [
            "By drawing bright neon borders around every element.",
            "By rendering higher-elevation surfaces (cards, modals, dropdowns) with progressively lighter surface tints.",
            "By animating cards with continuous pulsation.",
            "By reducing text size on elevated surfaces."
          ],
          "correctIndex": 1,
          "explanation": "In dark mode, physical elevation is conveyed by lightening surface tones (e.g., base canvas at #121212, card at #1E1E1E, floating modal at #2C2C2C)."
        },
        {
          "id": "Q-UIX-077",
          "question": "Why must primary brand accent colors frequently be desaturated when adapted for dark mode?",
          "options": [
            "Because saturated colors become invisible in dark rooms.",
            "Because high-saturation bright colors vibrate visually against dark backgrounds and cause optical distortion and poor contrast readability.",
            "Because dark mode only supports monochromatic colors.",
            "Because browsers convert saturated colors to grayscale automatically."
          ],
          "correctIndex": 1,
          "explanation": "Highly saturated colors vibrate uncomfortably against dark backgrounds; shifting to lighter, desaturated tones maintains legibility without jarring visual noise."
        },
        {
          "id": "Q-UIX-078",
          "question": "What is the difference between a Primitive Color Token and a Semantic Color Token in a design system?",
          "options": [
            "Primitive tokens are written in Python, while semantic tokens are written in Swift.",
            "Primitive tokens define raw color values (e.g., `blue-500 = #3B82F6`), while semantic tokens define purpose and meaning (e.g., `color-action-primary = blue-500`).",
            "Primitive tokens are only used for print design.",
            "Semantic tokens cannot be changed once created."
          ],
          "correctIndex": 1,
          "explanation": "Semantic tokens abstract raw hex codes into functional design roles, allowing theme switching (such as light/dark mode) without altering component definitions."
        },
        {
          "id": "Q-UIX-079",
          "question": "What is the WCAG Level AAA contrast requirement for regular body text?",
          "options": [
            "3.0 : 1",
            "4.5 : 1",
            "7.0 : 1",
            "12.0 : 1"
          ],
          "correctIndex": 2,
          "explanation": "WCAG Level AAA represents enhanced accessibility and requires a strict 7.0:1 contrast ratio for normal body text."
        },
        {
          "id": "Q-UIX-080",
          "question": "Which semantic color role is universally designated for destructive actions, validation errors, and system failure alerts?",
          "options": [
            "color-feedback-info",
            "color-feedback-warning",
            "color-feedback-danger / error",
            "color-feedback-neutral"
          ],
          "correctIndex": 2,
          "explanation": "The danger/error semantic token (conventionally red) communicates critical warnings, destructive deletion actions, and form validation failures."
        }
      ]
    },
    {
      "id": "ASM-UIX-009",
      "courseId": "CRS-UIX-001",
      "chapterId": "CH-UIX-009",
      "title": "Assessment: Layout Grids, Responsive Breakpoints & Mobile Ergonomics",
      "summary": "Test your expertise in 12-column desktop layouts, 4-column mobile grids, gutter sizing, Hoober's thumb zone ergonomics, safe area insets, and minimum touch targets.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-UIX-081",
          "question": "Why is a 12-column grid considered the industry gold standard for responsive desktop layouts?",
          "options": [
            "Because 12 is the number of months in a year.",
            "Because 12 divides evenly into 1, 2, 3, 4, 6, and 12, allowing effortless multi-column combinations (halves, thirds, quarters, and asymmetric sidebars).",
            "Because desktop monitors are always 12 inches wide.",
            "Because CSS only supports up to 12 columns in CSS grid."
          ],
          "correctIndex": 1,
          "explanation": "12 is a superior highly composite number for responsive layouts, enabling clean symmetrical splits into halves (6-6), thirds (4-4-4), quarters (3-3-3-3), and sidebars (8-4)."
        },
        {
          "id": "Q-UIX-082",
          "question": "In responsive web design, what is a 'Gutter'?",
          "options": [
            "The empty white space at the very bottom of a webpage.",
            "The fixed horizontal spacing separating adjacent columns within a layout grid.",
            "The outer margin between the screen edge and the grid.",
            "The code comment section at the top of a CSS file."
          ],
          "correctIndex": 1,
          "explanation": "Gutters are the fixed channels of whitespace between columns that prevent adjacent UI elements and cards from colliding."
        },
        {
          "id": "Q-UIX-083",
          "question": "According to Steven Hoober's mobile ergonomics research, what percentage of smartphone users operate their phones using a single hand?",
          "options": [
            "Approximately 10%",
            "Approximately 49%",
            "Exactly 85%",
            "Less than 5%"
          ],
          "correctIndex": 1,
          "explanation": "Empirical observation shows that ~49% of smartphone users rely on one-handed thumb interaction, making thumb-reach zones critical for mobile UX."
        },
        {
          "id": "Q-UIX-084",
          "question": "Where should primary actions (e.g., 'Add to Cart', 'Submit Form', Bottom Tabs) be placed on mobile app interfaces?",
          "options": [
            "In the top-right corner to match desktop conventions.",
            "Within the bottom half of the screen (the 'Natural' / 'Easy' thumb reach zone).",
            "Hidden behind a hamburger menu in the top-left.",
            "Centered precisely in the dead center of the screen."
          ],
          "correctIndex": 1,
          "explanation": "Placing key interactive CTAs within the bottom thumb zone allows users to interact effortlessly without shifting their physical grip or using a second hand."
        },
        {
          "id": "Q-UIX-085",
          "question": "What is Apple's Human Interface Guidelines (HIG) minimum recommended touch target size for interactive controls?",
          "options": [
            "24 × 24 pt",
            "32 × 32 pt",
            "44 × 44 pt",
            "64 × 64 pt"
          ],
          "correctIndex": 2,
          "explanation": "Apple's iOS guidelines mandate a minimum interactive hitbox of 44 × 44 pt to accommodate human finger pad dimensions and minimize mis-taps."
        },
        {
          "id": "Q-UIX-086",
          "question": "What is Google Material Design's minimum recommended touch target size for interactive controls?",
          "options": [
            "30 × 30 dp",
            "40 × 40 dp",
            "48 × 48 dp",
            "72 × 72 dp"
          ],
          "correctIndex": 2,
          "explanation": "Google Material Design mandates minimum 48 × 48 dp touch targets with at least 8dp spacing between adjacent touch elements."
        },
        {
          "id": "Q-UIX-087",
          "question": "How many columns are standard for mobile smartphone viewports in responsive grid frameworks?",
          "options": [
            "1 column",
            "4 columns",
            "8 columns",
            "12 columns"
          ],
          "correctIndex": 1,
          "explanation": "A 4-column grid (paired with 16px margins and 16px gutters) is standard for mobile screens (320px–480px width)."
        },
        {
          "id": "Q-UIX-088",
          "question": "What is the purpose of 'Safe Area Insets' in modern smartphone UI design?",
          "options": [
            "To encrypt sensitive passwords stored in local storage.",
            "To provide internal padding that prevents UI elements from overlapping physical hardware obstructions like notches, camera cutouts, and bottom home indicators.",
            "To lock the interface in portrait orientation.",
            "To prevent unauthorized screenshots."
          ],
          "correctIndex": 1,
          "explanation": "Safe area insets prevent content from being clipped by hardware rounded corners, sensor notches, or system home indicator gestures."
        },
        {
          "id": "Q-UIX-089",
          "question": "If an icon is designed with a visible visual graphic size of 20 × 20 pixels, how should its interactive hitbox be structured?",
          "options": [
            "It must remain strictly 20 × 20 pixels to match the artwork.",
            "Its interactive tap area (hitbox) should be expanded via padding to at least 44 × 44 px.",
            "The icon must be scaled up to 44px visually, even if it looks unpleasantly massive.",
            "Icons should never be clickable in mobile design."
          ],
          "correctIndex": 1,
          "explanation": "Designers add transparent padding around small icons so that the clickable/tappable area meets the 44x44px minimum while maintaining refined visual aesthetics."
        },
        {
          "id": "Q-UIX-090",
          "question": "What is the typical responsive breakpoint range for Tablet portrait and small laptop devices?",
          "options": [
            "320px – 480px",
            "768px – 1024px",
            "1440px – 1920px",
            "2560px+"
          ],
          "correctIndex": 1,
          "explanation": "768px to 1024px captures standard tablet displays (such as iPads) and small convertibles, usually configured with an 8-column layout."
        }
      ]
    },
    {
      "id": "ASM-UIX-010",
      "courseId": "CRS-UIX-001",
      "chapterId": "CH-UIX-010",
      "title": "Assessment: Figma Vectors, Components, Variants & Component Props",
      "summary": "Evaluate your technical mastery of Vector Networks, Frames vs Groups, Master Component inheritance, Variant sets, and Component Properties.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-UIX-091",
          "question": "How do Figma's Vector Networks fundamentally differ from traditional vector paths found in legacy tools like Illustrator?",
          "options": [
            "Vector Networks only support straight black lines.",
            "In a Vector Network, a single vertex point can connect to three or more branching lines in any direction, rather than being restricted to a two-point continuous loop.",
            "Vector Networks require 3D graphics cards to open.",
            "Vector Networks convert vector shapes into bitmap JPEGs upon saving."
          ],
          "correctIndex": 1,
          "explanation": "Figma's Vector Networks allow multi-directional branching from a single vertex, making complex geometric icon construction faster and cleaner."
        },
        {
          "id": "Q-UIX-092",
          "question": "What is the primary operational difference between a Frame and a Group in Figma?",
          "options": [
            "Groups can contain code, while Frames can only contain images.",
            "Frames have an independent bounding box, support Auto Layout, constraints, and overflow clipping, whereas Groups are strictly bound to the bounding box of their children.",
            "Frames are only available in paid enterprise plans.",
            "There is no difference; they are identical."
          ],
          "correctIndex": 1,
          "explanation": "Frames behave like HTML `<div>` containers with independent bounds, responsive constraints, clipping, and layout engines, whereas groups simply cluster layers together."
        },
        {
          "id": "Q-UIX-093",
          "question": "What symbol in Figma represents a Main / Master Component?",
          "options": [
            "A single hollow purple diamond (◇)",
            "Four solid purple diamonds forming a larger diamond (❖)",
            "A blue circle with an exclamation point",
            "A green padlock icon"
          ],
          "correctIndex": 1,
          "explanation": "The four solid purple diamonds (❖) denote a Main Component, while a single hollow purple diamond (◇) indicates a linked component instance."
        },
        {
          "id": "Q-UIX-094",
          "question": "What happens when a designer updates the font color of a Master Component in a design system?",
          "options": [
            "The file crashes immediately.",
            "The update cascades across all linked instances across the entire file and subscribed libraries, except where an instance has an explicit local fill override.",
            "Only new instances created in the future will receive the update.",
            "Instances must be manually deleted and re-inserted."
          ],
          "correctIndex": 1,
          "explanation": "Changes made to the Master Component instantly propagate down to all linked instances, preserving local instance overrides."
        },
        {
          "id": "Q-UIX-095",
          "question": "What major problem did the introduction of Figma 'Variants' solve for design systems?",
          "options": [
            "It eliminated the need to use keyboard shortcuts.",
            "It eliminated component library explosion by organizing hundreds of separate component permutations into a single coherent component set with dropdown properties.",
            "It decreased Figma's monthly subscription fee.",
            "It allowed designers to draw in 3D."
          ],
          "correctIndex": 1,
          "explanation": "Variants unified disparate component states (e.g., Button-Primary-Hover, Button-Secondary-Disabled) into a single component set with configurable properties."
        },
        {
          "id": "Q-UIX-096",
          "question": "What is the primary function of a 'Boolean Property' in Figma components?",
          "options": [
            "To calculate mathematical formulas in tables.",
            "To toggle the visibility of a layer (such as an icon or badge) on or off with a simple switch in the instance sidebar.",
            "To validate whether user input in a form is true or false.",
            "To delete unused components from the library."
          ],
          "correctIndex": 1,
          "explanation": "A Boolean property connects a layer's visibility to a true/false toggle in the property panel, eliminating the need to create duplicate variants just to show or hide an icon."
        },
        {
          "id": "Q-UIX-097",
          "question": "Which Component Property allows a designer to swap a nested icon instance directly from the right-hand inspection panel without digging into layer hierarchies?",
          "options": [
            "Text Property",
            "Boolean Property",
            "Instance Swap Property",
            "Variant Axis Property"
          ],
          "correctIndex": 2,
          "explanation": "The Instance Swap Property surfaces an asset picker directly in the instance panel, enabling fast 1-click swapping of nested components like icons."
        },
        {
          "id": "Q-UIX-098",
          "question": "What does the 'Clip content' checkbox on a Figma Frame accomplish?",
          "options": [
            "It saves a screenshot of the frame to the user's desktop.",
            "It hides any child layers or artwork that extend beyond the physical boundaries of the frame (equivalent to CSS `overflow: hidden`).",
            "It removes all vectors inside the frame.",
            "It copies the frame to the clipboard."
          ],
          "correctIndex": 1,
          "explanation": "'Clip content' masks any child element whose coordinates fall outside the parent frame boundaries, matching CSS `overflow: hidden`."
        },
        {
          "id": "Q-UIX-099",
          "question": "What is a 'Text Property' in Figma components?",
          "options": [
            "A property that changes the font family to Comic Sans.",
            "A component property that exposes an editable text field in the sidebar, allowing copy changes without double-clicking into deep nested layers.",
            "An OCR scanner that extracts text from screenshots.",
            "A spellcheck plugin."
          ],
          "correctIndex": 1,
          "explanation": "Text properties surface string inputs directly on the component's main properties panel, streamlining copywriting and preventing accidental layout edits."
        },
        {
          "id": "Q-UIX-100",
          "question": "Which boolean operation in Figma removes the overlapping area of the top shape from the bottom shape?",
          "options": [
            "Union Selection",
            "Subtract Selection",
            "Intersect Selection",
            "Exclude Selection"
          ],
          "correctIndex": 1,
          "explanation": "Subtract Selection cuts out the overlapping geometry of the uppermost layer from the underlying layer, leaving the non-overlapping portion."
        }
      ]
    },
    {
      "id": "ASM-UIX-011",
      "courseId": "CRS-UIX-001",
      "chapterId": "CH-UIX-011",
      "title": "Assessment: Auto Layout Mastery & Flexbox UI in Figma",
      "summary": "Test your skills in Auto Layout directions, gap and padding parameters, Hug vs Fill vs Fixed sizing mechanics, Absolute Positioning, and nested component architecture.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-UIX-101",
          "question": "What CSS Flexbox layout engine concept does Figma Auto Layout directly mirror?",
          "options": [
            "CSS Float and Clearfix",
            "CSS Flexbox (flex-direction, gap, padding, justify-content, align-items)",
            "HTML Table Layouts",
            "Canvas 2D Context"
          ],
          "correctIndex": 1,
          "explanation": "Auto Layout is built on the same principles as CSS Flexbox, enabling responsive layout behaviors that translate directly into front-end code."
        },
        {
          "id": "Q-UIX-102",
          "question": "What sizing mode should be applied to an action button container so that its width automatically expands or contracts based on the length of its text label?",
          "options": [
            "Fixed Width",
            "Fill Container",
            "Hug Contents",
            "Scale with Canvas"
          ],
          "correctIndex": 2,
          "explanation": "'Hug Contents' (equivalent to `width: fit-content`) ensures the parent frame dynamically resizes to tightly wrap its text label plus horizontal padding."
        },
        {
          "id": "Q-UIX-103",
          "question": "What sizing behavior occurs when an element inside an Auto Layout frame is set to 'Fill Container'?",
          "options": [
            "It fills the entire user's monitor screen.",
            "It stretches to occupy all available remaining space within its immediate parent frame along that axis (equivalent to `flex-grow: 1`).",
            "It shrinks to 0 pixels.",
            "It locks its dimensions permanently."
          ],
          "correctIndex": 1,
          "explanation": "'Fill Container' causes a child element to expand dynamically to fill all available space within its parent frame, crucial for responsive fluid columns."
        },
        {
          "id": "Q-UIX-104",
          "question": "What keyboard shortcut adds Auto Layout to selected layers in Figma?",
          "options": [
            "Cmd + G (Ctrl + G)",
            "Shift + A",
            "Cmd + K (Ctrl + K)",
            "Alt + Shift + Enter"
          ],
          "correctIndex": 1,
          "explanation": "Shift + A is the universal shortcut to convert selected elements or frames into an Auto Layout container in Figma."
        },
        {
          "id": "Q-UIX-105",
          "question": "Setting an Auto Layout frame's horizontal spacing to 'Auto' achieves what layout effect?",
          "options": [
            "It removes all spacing between elements.",
            "It distributes elements with equal spacing pushed to the far edges of the container (equivalent to CSS `justify-content: space-between`).",
            "It centers all elements on top of each other.",
            "It randomizes the spacing."
          ],
          "correctIndex": 1,
          "explanation": "Setting gap to 'Auto' replicates `justify-content: space-between`, pushing the first element to the left edge and the last element to the right edge."
        },
        {
          "id": "Q-UIX-106",
          "question": "How does 'Absolute Positioning' within an Auto Layout frame function?",
          "options": [
            "It forces the entire frame to lock to 0,0 coordinates.",
            "It removes the selected child element from the normal flex layout flow, allowing it to be positioned anywhere within the frame while maintaining responsive parent sizing.",
            "It prevents the layer from being edited.",
            "It exports the layer to a separate file."
          ],
          "correctIndex": 1,
          "explanation": "Absolute positioning exempts a layer from the flex calculation, enabling floating badges, pin icons, or close buttons positioned freely over auto-layout content."
        },
        {
          "id": "Q-UIX-107",
          "question": "Why is designing buttons with 'Fixed Width' considered bad practice in multi-lingual design systems?",
          "options": [
            "Fixed-width buttons crash Chrome.",
            "When translated into languages with longer compound words (such as German or Finnish), text will overflow or truncate awkwardly if the container cannot expand.",
            "Translators refuse to work on fixed buttons.",
            "Fixed buttons cannot display icons."
          ],
          "correctIndex": 1,
          "explanation": "Fixed-width containers truncate localized copy. Setting buttons to 'Hug Contents' allows them to expand fluidly when text length increases during localization."
        },
        {
          "id": "Q-UIX-108",
          "question": "In a nested card layout, what setting should the body paragraph text layer have to ensure it wraps onto multiple lines without overflowing the card?",
          "options": [
            "Horizontal: Fixed, Vertical: Fixed",
            "Horizontal: Fill Container, Vertical: Hug Contents",
            "Horizontal: Hug Contents, Vertical: Fill Container",
            "Horizontal: Hug Contents, Vertical: Hug Contents"
          ],
          "correctIndex": 1,
          "explanation": "Setting horizontal width to 'Fill Container' forces text to respect parent card boundaries and wrap, while vertical 'Hug Contents' allows the card height to expand to fit the lines."
        },
        {
          "id": "Q-UIX-109",
          "question": "What feature in modern Figma Auto Layout allows child tags or badges in a list to flow onto a new line when the container width narrows?",
          "options": [
            "Grid Stacking",
            "Wrap (flex-wrap: wrap)",
            "Truncate Overflow",
            "Z-Index Shifting"
          ],
          "correctIndex": 1,
          "explanation": "The Auto Layout Wrap feature allows elements to flow horizontally and wrap onto successive rows when container width shrinks, matching CSS `flex-wrap: wrap`."
        },
        {
          "id": "Q-UIX-110",
          "question": "What happens if a child element set to 'Fill Container' is placed inside a parent frame set to 'Hug Contents' along the same axis?",
          "options": [
            "Figma handles it with an infinite loop calculation.",
            "Figma flags a layout circular dependency and automatically converts the parent to Fixed sizing or forces the child to Fixed.",
            "The browser crashes.",
            "The elements disappear completely."
          ],
          "correctIndex": 1,
          "explanation": "A child cannot fill a parent whose size depends on hugging that child (a circular dependency). Figma resolves this by preventing or resetting the conflicting sizing mode."
        }
      ]
    },
    {
      "id": "ASM-UIX-012",
      "courseId": "CRS-UIX-001",
      "chapterId": "CH-UIX-012",
      "title": "Assessment: Micro-Interactions, Motion Design & State Choreography",
      "summary": "Evaluate your understanding of Dan Saffer's micro-interaction framework, easing curves (Ease-In, Ease-Out, Ease-In-Out), duration benchmarks, and Smart Animate.",
      "durationMinutes": 20,
      "passingScore": 70,
      "questions": [
        {
          "id": "Q-UIX-111",
          "question": "What are the four components of Dan Saffer's micro-interaction model?",
          "options": [
            "Color, Font, Spacing, Shadow",
            "Trigger, Rules, Feedback, Loops & Modes",
            "Research, Wireframe, Prototype, Test",
            "Input, Output, Storage, Processing"
          ],
          "correctIndex": 1,
          "explanation": "Dan Saffer defines micro-interactions by four building blocks: Trigger (initiator), Rules (logic), Feedback (confirmation), and Loops & Modes (meta-behavior over time)."
        },
        {
          "id": "Q-UIX-112",
          "question": "Which easing curve is most appropriate for elements ENTERING the viewport (e.g., a modal dialog appearing or a toast notification sliding in)?",
          "options": [
            "Linear",
            "Ease-In (Acceleration)",
            "Ease-Out (Deceleration)",
            "Stepped Timing"
          ],
          "correctIndex": 2,
          "explanation": "Ease-Out (deceleration) enters at high velocity and smoothly decelerates to a stop, creating a natural arrival feel without jarring bounces."
        },
        {
          "id": "Q-UIX-113",
          "question": "Which easing curve is most appropriate for elements EXITING the viewport (e.g., dismissing an alert or closing a side drawer)?",
          "options": [
            "Ease-In (Acceleration)",
            "Ease-Out (Deceleration)",
            "Bounce",
            "Constant Velocity"
          ],
          "correctIndex": 0,
          "explanation": "Ease-In (acceleration) starts slowly and accelerates off screen, quickly clearing the viewport so the user can continue their task."
        },
        {
          "id": "Q-UIX-114",
          "question": "What is the recommended duration benchmark for standard digital UI transitions (such as dropdown expansions and toggle switches)?",
          "options": [
            "50ms to 80ms",
            "200ms to 300ms",
            "800ms to 1200ms",
            "At least 2 full seconds"
          ],
          "correctIndex": 1,
          "explanation": "200ms to 300ms is the sweet spot for interface animations: fast enough to feel immediate while slow enough for the human eye to perceive spatial continuity."
        },
        {
          "id": "Q-UIX-115",
          "question": "Why is 'Linear' easing considered poor practice for standard interface motion?",
          "options": [
            "Linear easing uses too much CPU power.",
            "Linear motion maintains an unnatural, constant speed from start to finish with no acceleration or deceleration, feeling robotic and jarring.",
            "Linear easing cannot be coded in CSS.",
            "Linear easing makes text blurry."
          ],
          "correctIndex": 1,
          "explanation": "Objects in the physical world possess mass and inertia; linear motion ignores physics, making transitions feel artificial and abrupt."
        },
        {
          "id": "Q-UIX-116",
          "question": "What is the critical rule for Figma's 'Smart Animate' to smoothly morph a shape between two screens?",
          "options": [
            "Both screens must be exported as GIFs first.",
            "The corresponding layers on both screens must share the exact same layer name and exist within the same hierarchical grouping.",
            "Both layers must be colored red.",
            "Smart Animate only works on text layers."
          ],
          "correctIndex": 1,
          "explanation": "Smart Animate relies on matching layer names to interpolate geometric and spatial changes. If layer names differ, Figma defaults to a cross-dissolve."
        },
        {
          "id": "Q-UIX-117",
          "question": "What happens to perceived software speed when animation durations exceed 400 milliseconds?",
          "options": [
            "Users perceive the application as fast and responsive.",
            "Users perceive the interface as sluggish, laggy, and obstructive to their productivity.",
            "Server response times decrease.",
            "Battery consumption drops to zero."
          ],
          "correctIndex": 1,
          "explanation": "Transitions longer than 400ms force users to wait for visual choreography to finish before interacting, creating perceived lag."
        },
        {
          "id": "Q-UIX-118",
          "question": "What interactive component state provides an explicit visual ring to indicate keyboard navigation focus for accessibility?",
          "options": [
            "Hover state",
            "Active / Pressed state",
            "Focused state",
            "Disabled state"
          ],
          "correctIndex": 2,
          "explanation": "The focused state provides a prominent outline ring (focus indicator) enabling motor-impaired and keyboard-only users to track active controls."
        },
        {
          "id": "Q-UIX-119",
          "question": "What visual transformation commonly choreographs an 'Active / Pressed' state on a button to simulate a physical button press?",
          "options": [
            "Enlarging the button to 150% scale",
            "A subtle downward scale (e.g., scale(0.98)) and slightly reduced shadow to simulate being depressed along the Z-axis",
            "Rotating the button 180 degrees",
            "Inverting the entire page colors"
          ],
          "correctIndex": 1,
          "explanation": "Scaling a button down slightly (0.97–0.98) upon click/press mimics tactile depth, providing immediate physical feedback."
        },
        {
          "id": "Q-UIX-120",
          "question": "What is a 'System Trigger' in micro-interaction architecture?",
          "options": [
            "A user clicking a button with a mouse.",
            "An interaction initiated automatically by a software condition or system event (such as battery dropping below 15% or a geofence crossing).",
            "A developer writing code in VS Code.",
            "A hardware reboot of the computer."
          ],
          "correctIndex": 1,
          "explanation": "System triggers are initiated by system events, data state changes, or sensor thresholds rather than direct user physical input."
        }
      ]
    }
  ]
};
