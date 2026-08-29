/* Dark-cinema entry-flow register — extracted from JourneyFlow.tsx so the
   Schools chooser and the student-scenario header can share it instead of
   duplicating it. Intake conversation: one question per screen, chips as
   inspiration, free text as the hero. Navy register consistent with the sim. */
export const jinStyles = `
  .jin-root {
    min-height: 100vh;
    background: linear-gradient(180deg, #07091c 0%, #0e1737 55%, #182046 100%);
    color: var(--lq-cream, #f6f2ea);
    display: flex;
    flex-direction: column;
  }
  .jin-top {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px clamp(16px, 4vw, 40px);
    border-bottom: 1px solid rgba(146, 184, 255, 0.12);
  }
  .jin-top-meta {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(246,242,234,0.5);
  }
  .jin-ghost {
    background: rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.14);
    color: rgba(246,242,234,0.85);
    border-radius: 999px;
    padding: 8px 16px;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .jin-stage {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(24px, 6vh, 64px) clamp(16px, 4vw, 40px) 90px;
  }
  .jin-card { width: 100%; max-width: 760px; animation: jinIn 500ms cubic-bezier(0.2,0.7,0.2,1) both; }
  @keyframes jinIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  .jin-eyebrow {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #92b8ff;
    margin-bottom: 16px;
  }
  .jin-q {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(26px, 4.4vw, 42px);
    letter-spacing: -0.022em;
    line-height: 1.15;
    color: var(--lq-cream, #f6f2ea);
    margin: 0 0 10px;
    max-width: 24ch;
  }
  .jin-sub {
    font-size: 15.5px;
    color: rgba(246,242,234,0.6);
    margin: 0 0 22px;
  }
  .jin-framing {
    font-family: var(--font-display);
    font-style: italic;
    font-size: clamp(16px, 2vw, 19px);
    color: rgba(246,242,234,0.75);
    margin: 0 0 14px;
    max-width: 52ch;
  }
  .jin-chips { display: flex; flex-wrap: wrap; gap: 9px; margin-bottom: 20px; }
  .jin-chip {
    padding: 11px 18px;
    border-radius: 999px;
    border: 1px solid rgba(246,242,234,0.25);
    background: rgba(246,242,234,0.05);
    color: rgba(246,242,234,0.9);
    font-size: 14.5px;
    font-weight: 550;
    cursor: pointer;
    transition: background 200ms ease, border-color 200ms ease, transform 200ms cubic-bezier(0.2,0.7,0.2,1);
  }
  .jin-chip:hover { transform: translateY(-1px); border-color: rgba(146,184,255,0.6); }
  .jin-chip.is-on {
    background: var(--lq-cream, #f6f2ea);
    color: #131b33;
    border-color: var(--lq-cream, #f6f2ea);
  }
  .jin-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1.5px solid rgba(246,242,234,0.28);
    padding: 10px 2px 12px;
    color: var(--lq-cream, #f6f2ea);
    font-family: var(--font-display);
    font-style: italic;
    font-size: clamp(17px, 2.2vw, 21px);
    outline: none;
    margin-bottom: 22px;
    transition: border-color 200ms ease;
  }
  .jin-input:focus { border-color: #92b8ff; }
  .jin-input::placeholder { color: rgba(246,242,234,0.35); }
  .jin-row { display: flex; align-items: center; gap: 14px; }
  .jin-name {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 6px 6px 16px;
    border: 1px solid rgba(246,242,234,0.2);
    border-radius: 999px;
  }
  .jin-name em {
    font-family: var(--font-mono);
    font-style: normal;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(246,242,234,0.5);
  }
  .jin-name input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--lq-cream, #f6f2ea);
    font-size: 14px;
    width: 130px;
    padding: 6px 4px;
  }
  .jin-next {
    margin-left: auto;
    border: none;
    border-radius: 999px;
    padding: 13px 26px;
    background: var(--lq-cream, #f6f2ea);
    color: #131b33;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: transform 200ms cubic-bezier(0.2,0.7,0.2,1), opacity 200ms ease;
  }
  .jin-next:hover:not(:disabled) { transform: translateY(-1px); }
  .jin-next:disabled { opacity: 0.35; cursor: default; }
  .jin-redirect { display: flex; gap: 8px; margin-top: 26px; }
  .jin-redirect input {
    flex: 1;
    background: transparent;
    border: 1.5px dashed rgba(246,242,234,0.3);
    border-radius: 999px;
    padding: 12px 18px;
    color: var(--lq-cream, #f6f2ea);
    font-family: var(--font-display);
    font-style: italic;
    font-size: 15px;
    outline: none;
  }
  .jin-redirect input:focus { border-color: rgba(146,184,255,0.7); border-style: solid; }
  .jin-redirect input::placeholder { color: rgba(246,242,234,0.4); }
  .jin-redirect button {
    border: 1px solid rgba(246,242,234,0.3);
    border-radius: 999px;
    padding: 12px 20px;
    background: transparent;
    color: rgba(246,242,234,0.9);
    font-weight: 650;
    font-size: 13.5px;
    cursor: pointer;
  }
  .jin-redirect button:disabled { opacity: 0.35; cursor: default; }

  /* Chooser option cards — same idiom as JourneyFlow's .jy-card flagship
     tiles (large rectangular dark choice card), given their own names since
     .jy-card itself lives in JourneyFlow's component-scoped style tag. */
  .chooser-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
    margin-top: 8px;
  }
  .chooser-option {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 8px;
    padding: 26px 24px 20px;
    border-radius: 14px;
    background: rgba(246, 242, 234, 0.05);
    border: 1px solid rgba(246, 242, 234, 0.10);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    cursor: pointer;
    transition: background 240ms ease, border-color 240ms ease, box-shadow 240ms ease, transform 240ms cubic-bezier(0.2,0.7,0.2,1);
  }
  .chooser-option:hover {
    background: color-mix(in srgb, #92b8ff 9%, rgba(246, 242, 234, 0.05));
    border-color: color-mix(in srgb, #92b8ff 42%, transparent);
    box-shadow: 0 14px 36px color-mix(in srgb, #92b8ff 16%, transparent);
    transform: translateY(-2px);
  }
  .chooser-option-eyebrow {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(146, 184, 255, 0.85);
  }
  .chooser-option-title {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 21px;
    letter-spacing: -0.015em;
    line-height: 1.25;
    color: var(--lq-cream, #f6f2ea);
  }
  .chooser-option-blurb {
    font-size: 14px;
    line-height: 1.55;
    color: rgba(246, 242, 234, 0.62);
  }
  .chooser-option-meta {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(246, 242, 234, 0.45);
  }
  .chooser-option-arrow {
    margin-top: auto;
    padding-top: 8px;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 13px;
    color: #92b8ff;
  }
`
