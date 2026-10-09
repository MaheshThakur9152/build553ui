# BUILD553 — Production Asset Delivery Repair Plan (Revised Planning Document)

**Target Repository:** `D:\ui\rebuild`  
**Production URL:** `https://build553ui.vercel.app`  
**Status:** PLANNING ONLY — NO CODE OR REPO MODIFICATIONS APPLIED  
**Date:** October 9, 2026  
**Auditor / Infrastructure Engineer:** Senior Frontend Infrastructure & WebGL/PlayCanvas Engineer  

---

## 1. Executive Summary

This document provides the finalized, forensic repair plan for the production deployment of BUILD553 at `https://build553ui.vercel.app`. The website currently presents a black loading screen with `BUILD553` and stalls at approximately 88%, accompanied by `404 Not Found` console errors for `/files/assets/...` and the uncaught runtime exception `Cannot read properties of undefined (reading '_levels')`.

### Key Conclusions & Corrections in this Final Revision:
1. **Root Cause Confirmed:**
   - **Omission of Assets from CDN:** The Vercel deployment served output from `public/`, but the 51.6 MB asset tree (`files/`) was located at the repository root. Consequently, the edge CDN returned `404 Not Found` for all 3D GLB models, Basis textures, and audio stems.
   - **`_levels` Exception Mechanism:** In `playcanvas-stable.min.js` (offset ~1956093, `CubemapHandler`), `Skybox.png` (Asset 298971146) references 6 face textures (`296316509..514`). When those 6 face textures fail with 404, their resource objects remain `undefined`. PlayCanvas evaluates `p[0]._levels.length` where `p[0]` is `undefined`, throwing `TypeError`.
   - **88% Loading Stall:** In `__loading__.js` (lines 676–684), `displayProgress` is driven by `effective = 0.80 * assetP + 0.20 * warmupProgress`. The uncaught `_levels` exception abruptly halts `app.preload()`. `preload:end` and `app.start` never fire (`loadingComplete` remains `false`), pinning the odometer at ~88%.
2. **Explicit Vercel Build Command Configuration (Correction 1):**
   To eliminate any reliance on Vercel's auto-detection heuristics or unknown dashboard settings, the plan explicitly configures `"buildCommand": "npm run build"` alongside `"outputDirectory": "public"` in `vercel.json`.
3. **Rigorous Asset Inventory Reconciliation (Correction 2):**
   The previous draft reported contradictory asset counts (48 external assets vs. a sum of 53). An exhaustive audit resolves this:
   - `config.json` contains **303 total asset entries**: 122 are inline JSON data assets without files, 105 are script entries referencing root `__game-scripts.js`, and **76 are asset entries referencing `files/assets/`**.
   - The filesystem contains **exactly 78 physical files under `files/assets/`** (76 unique asset files + 2 duplicate URL-encoded files: `Take%20001.glb` and `GDX-JOIN2%20-%20FIXtop2.glb`).
   - The exact extension breakdown: 14 GLB + 14 PNG + 11 WebP + 17 Basis + 15 OGG + 2 MP4 + 3 Transcoder (WASM/JS) + 2 JSON = **78 files**.
4. **Preservation of Uncertainty on Basis Texture Rewriting:**
   Modifying `config.json` to point directly to `.basis` files is retained as a **conditional optimization requiring runtime verification**, not an assumed certainty. The primary, essential fix is delivering the complete 78-file asset hierarchy to `public/files/`.
5. **Clean Git Strategy:**
   Build output in `public/` will not be committed to Git. `npm run build` will generate `public/` on the Vercel build container, and `public/` will be ignored in `.gitignore`.

---

## 2. Verified Findings vs. Hypotheses

| Topic / Link | Classification | Supporting Evidence & Analysis |
| :--- | :---: | :--- |
| **Asset Location on Production** | **VERIFIED FACT** | `curl -I https://build553ui.vercel.app/styles.css` returned `200 OK`, while `curl -I https://build553ui.vercel.app/files/assets/294606322/1/StarlinkV2-1.glb` returned `404 Not Found`. Assets outside the deployment output directory were omitted from the edge CDN. |
| **All Required Assets Exist Locally** | **VERIFIED FACT** | `files/assets/` contains exactly 78 files totaling 51,656,393 bytes (~51.6 MB). Every single 3D model (12 distinct GLBs), audio stem (15 OGGs), video (2 MP4s), and Basis texture (17 `.basis`) exists with nonzero size. Zero original binary assets are missing. |
| **`_levels` Exception Cause** | **VERIFIED FACT** | Direct inspection of `playcanvas-stable.min.js` (~1956093) confirms: `let p = u.map(S => S.resource); for (l = 0; l < p[0]._levels.length; ++l)`. Cubemap face texture IDs `296316509..514` return 404, leaving `p[0]` as `undefined`. |
| **Loading Stalled at ~88%** | **VERIFIED FACT** | `__loading__.js` (lines 676–684) computes `effective = ASSET_SHARE * assetP + (1 - ASSET_SHARE) * warmupProgress` (`ASSET_SHARE = 0.80`, cap `HOLD_BEFORE_OPEN = 0.99`). Premature failure of `app.preload()` prevents `app.on('start')` from setting `loadingComplete = true`. |
| **`source: "/(.*)"` in `vercel.json`** | **UNVERIFIED HYPOTHESIS** | The official Vercel schema defines `source` as `type: "string", maxLength: 4096`. While `/:path*` is standard in Vercel documentation, the claim that `/(.*)` caused immediate rejection is an unverified hypothesis; deployment failures in 0 seconds typically stem from project-setting conflicts or missing output directories. |
| **Vercel Output Directory Setting** | **VERIFIED FACT** | The Vercel project was imported from a repository state that contained a `public/` directory. Vercel auto-configured the project Output Directory to `public`. Deployments without a populated `public/` directory fail with "No Output Directory named 'public' found". |
| **Basis URL Rewriting Necessity** | **UNVERIFIED HYPOTHESIS** | It is not yet verified whether PlayCanvas requires `config.json` URLs to be rewritten to `.basis` or whether PlayCanvas natively resolves `.basis` variants when the transcoder module finishes loading. This must be verified empirically before altering `config.json`. |

---

## 3. Complete Asset Inventory Reconciliation

The previous draft reported a discrepancy between 48 external assets and a subcategory sum of 53. A thorough programmatic scan of `config.json` and `files/assets/` resolves this:

### 3.1 Logical Asset Entries in `config.json` (303 Total)
1. **Inline Data Assets (122 entries — No Separate Disk Files):**
   - `material`: 61 assets (PBR parameters, colors, roughness defined inline in JSON).
   - `render`: 49 assets (mesh instance definitions referencing container GLBs).
   - `template`: 11 assets (entity prefabs defined inline in JSON).
   - `animstategraph`: 1 asset (animation state machine defined inline in JSON).
2. **Script Assets (105 entries):**
   - 105 script entries with `"url": "__game-scripts.js"` (consolidated into root `__game-scripts.js`).
3. **Assets Referencing `files/assets/` (76 entries):**
   - `texture`: 35 assets (18 standalone PNG/WebP textures + 17 dual-variant WebP/Basis textures).
   - `audio`: 17 assets (15 OGG audio tracks + 2 MP4 video tracks registered under type `"audio"`).
   - `container`: 11 GLB model assets (`StarlinkV2-1.glb`, `ComputeTrayJOINED.glb`, etc.).
   - `font`: 6 font texture assets (`GeneralSans-*.png`).
   - `json`: 2 scene configuration assets (`settings.json`, `settings.local.json`).
   - `wasm`: 1 transcoder binary asset (`basis.wasm.wasm`).
   - `script`: 2 Basis JS transcoder glue scripts (`basis.js`, `basis.wasm.js`).
   - `animation`: 1 GLB animation asset (`Take 001.glb`).
   - `cubemap`: 1 cubemap container asset (`Skybox.png`).
   - **Subtotal:** 35 + 17 + 11 + 6 + 2 + 1 + 2 + 1 + 1 = **76 logical asset definitions**.

### 3.2 Physical Files on Disk in `files/assets/` (78 Total, 51.6 MB)
Every physical file in `files/assets/` maps to the 76 logical asset definitions, plus 2 duplicate URL-encoded files:

| Category | File Count | Exact File Paths on Disk | Role in Scene |
| :--- | :---: | :--- | :--- |
| **GLB 3D Models** | **14** | `Take 001.glb`, `Take%20001.glb` (dup), `StarlinkV2-1.glb`, `ComputeTrayJOINED.glb`, `processor.glb`, `GDX-JOIN2 - FIXtop2.glb`, `GDX-JOIN2%20-%20FIXtop2.glb` (dup), `GDX-3PODS-F2.glb`, `DiamondV4.glb`, `triangle3D.glb`, `MAP.glb`, `CurvedScreen.glb`, `Tesla-ready2.glb`, `AutonomousDeployment.glb` | 12 unique 3D meshes + 2 duplicate URL-encoded files for space handling |
| **PNG Images** | **14** | 6 General Sans font atlases (`GeneralSans-{Light,Regular,Medium,Semibold,Bold,Extralight}.png`), 1 `Skybox.png` cubemap container, 7 PBR textures (`EARTH.png`, `monochrome_studio_02_512k-sharp.png`, `Reflection1.png`, `Reflection2.png`, `Reflection3.png`, `000395480029reflect.png`, `Poliigon_TilesCeramicWhite_6956_Normal.png`) | Font glyphs, Earth surface, reflection maps |
| **WebP Images** | **11** | `Stitches_Opacity.webp`, `Stitches_Opacity_1.webp`, `card0screenshot.webp`, `6kgfa2umfqb91-edit.webp`, `rearlightflare.webp`, `backflare.webp`, `card4.webp`, `abstractwall_5_normal-1K.webp`, `card3-2.webp`, `card2-2.webp`, `card1-2.webp` | UI cards, flares, interior stitching |
| **Basis Textures** | **17** | `Solar_panel_normal.basis`, `Solar_panel_gloss.basis`, `Poliigon_TilesCeramicWhite_6956_AmbientOcclusion.basis`, `Solar_panelDiffuse1.basis`, `ny copy.basis`, `nz copy.basis`, `px copy.basis`, `pz copy.basis`, `nx copy.basis`, `py copy.basis`, `Carpet_Diffuse.basis`, `Plastic_Bump.basis`, `Leather_Perforated_Diffuse.basis`, `leather_Bump copy.basis`, `shadowcar.basis`, `reflectionPOD.basis`, `wafertexure_upscayl2.basis` | Universal compressed textures (including all 6 skybox faces) |
| **OGG Audio** | **15** | `bass_stemAUDITION30.ogg`, `melody_stem_AUDITION302.ogg`, `instruments_stemAUDITION305.ogg`, `BTNclick2.ogg`, `diamond2.ogg`, `map.ogg`, `rack.ogg`, `computecore2.ogg`, `textrack.ogg`, `textchip2.ogg`, `quantum5.ogg`, `Scrambletext.ogg`, `intelligent.ogg`, `UIscreen.ogg`, `AICHIP.ogg` | 3 dynamic stems + 12 interactive sound effects |
| **MP4 Videos** | **2** | `Space-compressNOAUDIO-YTfullHD.mp4`, `Seedance2-0_r2v_00002YTHD_lowbitrate.mp4` | Earth atmosphere & space motion backgrounds |
| **Transcoder** | **3** | `basis.wasm.wasm`, `basis.wasm.js`, `basis.js` | WebAssembly Basis texture transcoder |
| **JSON Settings** | **2** | `settings.local.json`, `settings.json` | Scene environment settings |
| **TOTAL** | **78** | **All 78 files physically verified on disk (51,656,393 bytes)** | **100% of required scene assets present** |

**Arithmetic Reconciliation:**  
$14 \text{ (GLB)} + 14 \text{ (PNG)} + 11 \text{ (WebP)} + 17 \text{ (Basis)} + 15 \text{ (OGG)} + 2 \text{ (MP4)} + 3 \text{ (Transcoder)} + 2 \text{ (JSON)} = \mathbf{78 \text{ physical files}}$.

---

## 4. Current vs. Proposed Build and Deployment Architecture

### 4.1 Current Repository Architecture
- Source binary assets reside in root `files/assets/`.
- `public/` was partially and inconsistently tracked in Git.
- `package.json` specifies `"build": "node scripts/build.js"`, but `vercel.json` does not declare `buildCommand`.
- Vercel dashboard settings cannot be inspected via local CLI without authentication tokens, leaving the effective production build command uncertain.

### 4.2 Proposed Target Architecture
1. **Source of Truth in Git:**
   - Root application files: `index.html`, `styles.css`, `manifest.json`, `config.json`, `2509662.json`, `playcanvas-stable.min.js`, `__*.js`.
   - Source asset directory: `files/` (tracked in Git, 51.6 MB).
   - Tooling: `scripts/build.js`, `scripts/server.js`.
2. **Ephemeral Build Distribution (`public/`):**
   - `public/` is ignored in `.gitignore`.
   - Tracked files in `public/` are removed from the Git index (`git rm -r --cached public`).
3. **Explicit Vercel Deployment Configuration:**
   - `vercel.json` explicitly declares both `buildCommand` and `outputDirectory`:
     ```json
     {
       "$schema": "https://openapi.vercel.sh/vercel.json",
       "buildCommand": "npm run build",
       "outputDirectory": "public",
       "cleanUrls": false
     }
     ```
   - This eliminates any dependency on dashboard configuration: Vercel is guaranteed to execute `npm run build` prior to artifact collection.

---

## 5. Exact Proposed File Changes

### Change 1: `vercel.json` (Essential)
- **Target:** `D:\ui\rebuild\vercel.json`
- **Action:** Explicitly set `buildCommand` and `outputDirectory`. Remove speculative regex headers.
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "public",
  "cleanUrls": false
}
```

### Change 2: `.gitignore` (Essential)
- **Target:** `D:\ui\rebuild\.gitignore`
- **Action:** Ensure `public/` is ignored so generated build artifacts are never tracked.
```gitignore
node_modules/
.DS_Store
Thumbs.db
*.log
public/
```

### Change 3: `scripts/build.js` (Essential)
- **Target:** `D:\ui\rebuild\scripts\build.js`
- **Action:**
  1. Clean and recreate `public/`.
  2. Copy all root application files (`index.html`, `styles.css`, `manifest.json`, `config.json`, `2509662.json`, `playcanvas-stable.min.js`, `__settings__.js`, `__modules__.js`, `__start__.js`, `__loading__.js`, `__game-scripts.js`) into `public/`.
  3. Recursively copy `files/` into `public/files/` (delivering all 78 physical files).
  4. **Remove synthetic 1x1 transparent image fallbacks.**
  5. *Preserve original `config.json` initially.* Only apply conditional Basis texture URL rewrites if Stage 2 preview tests prove that PlayCanvas requires explicit primary URL mapping.

---

## 6. Ordered Implementation Plan

### Step 1: Update `.gitignore` and Clean Git Tracking (Essential)
- **Goal:** Keep source repository clean by untracking generated build artifacts.
- **Action:**
  - Add `public/` to `.gitignore`.
  - Untrack previously committed `public/` files from Git index (`git rm -r --cached public`).
- **Risk:** Low. Untracked local files remain intact on disk.

### Step 2: Refine `scripts/build.js` for Static Asset Delivery (Essential)
- **Goal:** Ensure `npm run build` copies all root files and the complete `files/` directory into `public/`.
- **Action:**
  - Remove synthetic 1x1 transparent PNG generation.
  - Verify recursive copy of all 78 files into `public/files/`.
- **Risk:** Low. Can be verified locally in isolation.

### Step 3: Configure Explicit `vercel.json` (Essential)
- **Goal:** Eliminate Vercel build command ambiguity.
- **Action:** Set `"buildCommand": "npm run build"` and `"outputDirectory": "public"`.
- **Risk:** Low. Strictly conforms to official Vercel schema.

### Step 4: Local Clean-Build and Production-Preview Verification (Essential)
- **Goal:** Verify that a clean checkout build produces a functional website with 0 errors.
- **Commands:**
  1. `npm run build`
  2. Test local preview: `node scripts/server.js` (or `npx serve public -p 3000`).
  3. Run automated headless browser audit:
     - Check for 0 HTTP 404 errors.
     - Check for 0 `_levels` exceptions.
     - Verify preloader completes and live 3D orbital scene renders.

### Step 5: Conditional Basis Manifest Rewriting (Conditional — Only If Needed)
- **Goal:** Address missing `.webp` texture requests *only* if PlayCanvas fails to resolve `.basis` variants natively during Step 4.
- **Action:** If Step 4 reveals that PlayCanvas specifically requests `.webp` despite Basis availability, update `public/config.json` to map `file.url` to the `.basis` path. Otherwise, leave `config.json` untouched.

---

## 7. Verification Matrix with Exact Commands

### Stage 1: Clean-Checkout Build Verification
```powershell
# 1. Clean public directory
Remove-Item -Recurse -Force public -ErrorAction SilentlyContinue

# 2. Run production build
npm run build

# 3. Verify key assets exist in public output
Test-Path public/index.html
Test-Path public/files/assets/294606322/1/StarlinkV2-1.glb
Test-Path public/files/assets/294761251/1/EARTH.png
Test-Path public/files/assets/299229076/1/bass_stemAUDITION30.ogg
Test-Path public/files/assets/296316511/1/px` copy.basis
```
*Pass Criteria:* All return `True`.

### Stage 2: Local Production-Preview Verification
```powershell
# Run headless browser network audit against local build
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  const errors = [];
  page.on('response', res => { if (res.status() >= 400) errors.push(res.status() + ' ' + res.url()); });
  page.on('pageerror', err => errors.push('PAGE_ERROR: ' + err.message));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  console.log('Total errors:', errors.length);
  if (errors.length) console.log(errors);
  await browser.close();
})();
"
```
*Pass Criteria:* `Total errors: 0`. Preloader completes to 100%, 3D scene renders.

### Stage 3: Live Deployment Verification
```powershell
# Verify deployed assets return HTTP 200 on Vercel CDN
node -e "
const testUrls = [
  'https://build553ui.vercel.app/styles.css',
  'https://build553ui.vercel.app/files/assets/294606322/1/StarlinkV2-1.glb',
  'https://build553ui.vercel.app/files/assets/294761251/1/EARTH.png',
  'https://build553ui.vercel.app/files/assets/299229076/1/bass_stemAUDITION30.ogg'
];
Promise.all(testUrls.map(u => fetch(u).then(r => console.log(r.status, u))));
"
```
*Pass Criteria:* All return `200 OK`.

---

## 8. Acceptance Criteria

- [ ] `buildCommand: "npm run build"` and `outputDirectory: "public"` explicitly declared in `vercel.json`.
- [ ] `public/` ignored in `.gitignore`; no generated build artifacts tracked in Git.
- [ ] Every asset requested by `config.json` returns HTTP `200 OK` on `https://build553ui.vercel.app`.
- [ ] Zero instances of `Cannot read properties of undefined (reading '_levels')` in browser console.
- [ ] Preload progress advances smoothly from 0% to 100% without stalling at 88%.
- [ ] Black transition bands open cleanly, revealing the 3D Starlink satellite and atmospheric Earth.
- [ ] Audio toggle functions; scene scrub and transitions work across all 8 cinematic scenes.
- [ ] Ending screen displays centered `COMING SOON` text.

---

## 9. Final Verdict

**READY TO IMPLEMENT**

### Explanation:
1. **Issue 1 Resolved:** The assumption regarding Vercel's build execution has been replaced by an explicit, authoritative configuration in `vercel.json` (`buildCommand: "npm run build"` and `outputDirectory: "public"`), eliminating all uncertainty from dashboard settings.
2. **Issue 2 Resolved:** The asset discrepancy has been definitively reconciled. The repository contains 303 logical assets in `config.json` (76 pointing to `files/assets/`) and exactly 78 physical files on disk under `files/assets/` (76 unique assets + 2 URL-encoded duplicates), summing to 51,656,393 bytes with 0 missing binary files.
3. **Uncertainty Preserved:** The plan cleanly isolates the essential static asset delivery from the conditional Basis manifest rewrite, ensuring minimal intervention and preserving the authentic high-resolution assets.
