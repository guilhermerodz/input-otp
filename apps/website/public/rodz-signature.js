(() => {
  const VIEW_BOX = "0 0 960 380";

  // [SVG path, stroke width, start time (0–1), draw time (0–1)]
  const STROKES = [
    [
      "M65 221 C119 112 259 44 361 73 C416 89 408 141 359 181 C300 228 232 234 137 213",
      8,
      0,
      0.22,
    ],
    [
      "M205 91 C168 177 134 267 112 331",
      8,
      0.18,
      0.13,
    ],
    [
      "M137 213 C204 244 251 287 315 276 C345 271 361 246 375 222",
      8,
      0.28,
      0.14,
    ],
    [
      "M374 222 C355 199 376 180 399 188 C421 196 418 221 399 234 C380 247 360 236 365 216 C371 193 399 190 424 203 C447 215 463 211 482 192 C506 168 536 179 535 207 C534 232 508 244 488 234 C470 225 482 202 499 184 C521 160 536 125 545 98 C552 78 565 86 558 116 C549 158 528 211 539 236 C551 261 582 247 608 220",
      8,
      0.38,
      0.34,
    ],
    [
      "M608 220 C633 208 658 196 680 194 L638 241 C658 235 687 236 700 247 C712 258 696 274 675 287 C654 300 633 310 614 319 C647 303 684 283 719 261 C763 233 810 196 838 151 C852 128 854 108 844 99",
      8,
      0.68,
      0.32,
    ],
  ];

  class RodzSignature extends HTMLElement {
    static get observedAttributes() {
      return ["duration", "color"];
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      if (this.isConnected) this.render();
    }

    replay() {
      this.render();
    }

    render() {
      const duration = Math.max(
        300,
        Number(this.getAttribute("duration")) || 2800,
      );
      const color = this.getAttribute("color") || "#111111";

      const paths = STROKES.map(
        ([path, width, delay, pathDuration]) => `
          <path
            d="${path}"
            pathLength="1"
            stroke-width="${width}"
            style="
              --delay: ${delay * duration}ms;
              --path-duration: ${pathDuration * duration}ms;
            "
          />
        `,
      ).join("");

      if (!this.shadowRoot) {
        this.attachShadow({ mode: "open" });
      }

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
          }

          svg {
            display: block;
            width: 100%;
            height: auto;
            overflow: visible;
          }

          /* No non-scaling-stroke here: the site renders the signature far
             below the 760px reference width, and a fixed 8px screen stroke
             turns into a marker blob at footer size. Strokes scale with the
             viewBox instead. */
          path {
            fill: none;
            stroke: ${color};
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-dasharray: 1;
            stroke-dashoffset: 1;
            animation:
              draw var(--path-duration)
              cubic-bezier(.42, 0, .16, 1)
              var(--delay)
              forwards;
          }

          @keyframes draw {
            to {
              stroke-dashoffset: 0;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            path {
              animation: none;
              stroke-dashoffset: 0;
            }
          }
        </style>

        <svg
          viewBox="${VIEW_BOX}"
          role="img"
          aria-label="Rodz signature"
        >
          ${paths}
        </svg>
      `;
    }
  }

  if (!customElements.get("rodz-signature")) {
    customElements.define("rodz-signature", RodzSignature);
  }
})();
