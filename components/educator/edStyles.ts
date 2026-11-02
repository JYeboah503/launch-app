/**
 * Shared educator primitives, corporate register. Rendered ONCE by
 * EducatorDashboard's root; every educator view relies on these.
 *
 * The `.ed-btn*` names are kept (dozens of call sites) but styled as exact
 * twins of globals.css `.corp-btn*` — one visual register, two spellings.
 * Everything else here mirrors the corporate recipes: white cards on the
 * cream canvas, navy CTAs and focus rings, mono eyebrows, Newsreader heads.
 */

export const edShared = `
  /* ── Page + type ─────────────────────────────────────────────── */
  .ed-page { max-width: 1152px; margin: 0 auto; padding: 0 24px 110px; }
  .ed-eyebrow { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--lq-ink-3); font-weight: 600; margin-bottom: 12px; }
  .ed-h1 { font-family: var(--font-display); font-weight: 400; font-size: clamp(28px, 3.4vw, 40px); letter-spacing: -0.022em; line-height: 1.08; color: var(--lq-ink); margin: 0 0 12px; }
  .ed-h2 { font-family: var(--font-display); font-weight: 500; font-size: 20px; letter-spacing: -0.015em; color: var(--lq-ink); }
  .ed-h3 { font-family: var(--font-display); font-weight: 500; font-size: 16px; letter-spacing: -0.01em; color: var(--lq-ink); }
  .ed-lede { font-size: 16px; color: var(--lq-ink-2); line-height: 1.55; max-width: 56ch; }
  .ed-dim { font-size: 12px; color: var(--lq-ink-3); }
  .ed-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
  .ed-block-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }

  /* ── Cards (corp-card twins) ─────────────────────────────────── */
  .ed-scard { background: #fff; border: 1px solid var(--lq-line); border-radius: 16px; padding: 22px; transition: border-color 200ms ease, box-shadow 200ms ease; }
  .ed-scard:hover { border-color: var(--lq-line-2); box-shadow: 0 10px 30px rgba(14,24,51,0.06); }
  .ed-scard-accent { border-color: var(--launch-navy); background: rgba(10,42,107,0.04); }
  .ed-scard-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
  .ed-empty { text-align: center; padding: 48px; background: #fff; border: 1px dashed var(--lq-line-2); border-radius: 16px; }
  .ed-empty p { color: var(--lq-ink-2); margin-bottom: 16px; font-style: italic; font-family: var(--font-display); font-size: 17px; }
  .ed-guide-note { font-size: 12.5px; color: var(--lq-ink-2); line-height: 1.55; margin-bottom: 14px; }

  /* ── Buttons — exact corp-btn twins ──────────────────────────── */
  .ed-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 18px; border-radius: 999px; font-family: var(--font-body); font-weight: 600; font-size: 14px; border: 1px solid transparent; cursor: pointer; transition: background 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease, box-shadow 160ms ease; }
  .ed-btn-primary { background: var(--launch-navy); color: var(--lq-cream); }
  .ed-btn-primary:hover:not(:disabled) { background: var(--launch-navy-2); transform: translateY(-1px); }
  .ed-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
  .ed-btn-ghost { background: #fff; color: var(--lq-ink-2); border-color: var(--lq-line-2); }
  .ed-btn-ghost:hover { color: var(--lq-ink); border-color: var(--launch-navy); }

  /* ── Modals + fields ─────────────────────────────────────────── */
  .ed-modal-root { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .ed-modal-backdrop { position: absolute; inset: 0; background: rgba(10, 42, 107, 0.42); backdrop-filter: blur(4px); }
  .ed-modal-card { position: relative; background: #fff; border-radius: 18px; width: 100%; max-width: 460px; max-height: 86vh; overflow-y: auto; padding: 22px 24px 24px; box-shadow: 0 24px 60px -18px rgba(10,42,107,0.32); }
  .ed-modal-wide { max-width: 760px; }
  .ed-modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .ed-modal-title { font-family: var(--font-display); font-weight: 500; font-size: 21px; letter-spacing: -0.015em; color: var(--lq-ink); }
  .ed-modal-foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
  .ed-x { appearance: none; background: transparent; border: 1px solid var(--lq-line-2); border-radius: 999px; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; color: var(--lq-ink-2); cursor: pointer; }
  .ed-x:hover { color: var(--lq-ink); border-color: var(--launch-navy); }
  .ed-field { margin-bottom: 16px; }
  .ed-label { display: block; font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--lq-ink-3); font-weight: 600; margin-bottom: 7px; }
  .ed-input, .ed-select { width: 100%; border: 1px solid var(--lq-line-2); border-radius: 10px; padding: 11px 14px; font-family: var(--font-body); font-size: 14px; color: var(--lq-ink); background: #fff; }
  .ed-input:focus, .ed-select:focus { outline: none; border-color: var(--launch-navy); box-shadow: 0 0 0 4px rgba(10,42,107,0.12); }

  /* ── Motion ──────────────────────────────────────────────────── */
  @keyframes ed-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`
