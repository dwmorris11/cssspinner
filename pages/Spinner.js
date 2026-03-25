import Page from "./Page.js";
// import custom components so they are available
import { PreloadOptions, Spinner } from "../components/Spinner/index.js";
import { CUISINES } from "./data/Spinner/constants.js";

export default class SpinnerPage extends Page {
  #children = () => `
    ${PreloadOptions({
      selects: [{ id: "cuisines", label: "Cuisines", options: CUISINES }],
    })}
    <form id="ui-form" aria-label="Spinning wheel configuration">
      <label for="wedges_input">Wheel options (comma or line separated)</label>
      <textarea
        id="wedges_input"
        class="ui-input"
        placeholder="Enter names (comma or line separated)"
        rows="4"
        aria-describedby="input-hint"
      ></textarea>
      <span id="input-hint" class="visually-hidden">Enter at least 2 options to spin the wheel</span>
      <button class="ui-button" type="submit" aria-label="Spin the wheel">
        <span>Spin</span>
      </button>
    </form>
    <div class="spinning-wheel" role="img" aria-label="Spinning wheel">
      <div class="indicator-wrapper" aria-hidden="true">
        <div class="indicator"></div>
      </div>
      <spinner-element slicecount="8" labelmode="radial"></spinner-element>
    </div>
    <div id="spin-result" role="status" aria-live="polite" class="visually-hidden"></div>
    <about-section title="About the Spinner">
      <p>This page demonstrates a <strong>CSS-powered spinning wheel</strong> built entirely with Vanilla JS and CSS.</p>
      <p>The only package used was esbuild to minify the javascript. <a href="https://github.com/dwmorris11/cssspinner" target="_blank">View source</a></p>
      <p><strong>Features showcased:</strong></p>
      <ul>
        <li>CSS conic-gradient for pie slice rendering</li>
        <li>CSS keyframe animations with cubic-bezier easing</li>
        <li>SVG text paths for curved/radial labels</li>
        <li>Web Components (Custom Elements)</li>
        <li>Custom resusable ComboFilterSelect that allows selecting groups or details</li>
        <li>Responsive design with CSS custom properties</li>
        <li>Accessibility: reduced motion support, ARIA labels</li>
      </ul>
      <p>Enter names separated by commas or newlines, then click Spin to randomly select a winner.</p>
    </about-section>
  `;
  constructor() {
    super("spinnerPage");
  }

  connectedCallback() {
    super.connectedCallback();
    this.#render();
  }

  #parseWedges(text) {
    // Split by newlines or commas, trim whitespace, filter empty
    const labels = text
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // Clamp between 2 and 30
    if (labels.length < 2) return null;
    return labels.slice(0, 30);
  }

  #render() {
    const tpl = document.createElement("template");
    tpl.innerHTML = this.#children();
    const content = tpl.content.cloneNode(true);
    const spinnerElement = content.querySelector("spinner-element");
    const textarea = content.querySelector("textarea");
    const form = content.querySelector("#ui-form");

    // Load saved text from cookie on page load
    const savedText = Page.getCookie("savedText");
    if (savedText) {
      textarea.value = savedText;
      const labels = this.#parseWedges(savedText);
      if (labels) {
        spinnerElement.setAttribute("slicecount", labels.length.toString());
        spinnerElement.setAttribute("labels", JSON.stringify(labels));
      }
    }

    // Update spinner as user types
    textarea.addEventListener("input", () => {
      const labels = this.#parseWedges(textarea.value);
      if (labels) {
        spinnerElement.setAttribute("slicecount", labels.length.toString());
        spinnerElement.setAttribute("labels", JSON.stringify(labels));
      } else {
        // Reset to empty/default state when fewer than 2 items
        spinnerElement.setAttribute("slicecount", "0");
        spinnerElement.setAttribute("labels", "[]");
      }
    });

    // spin the wheel
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const textarea = form.querySelector("textarea");
      const labels = this.#parseWedges(textarea.value);
      if (!labels) {
        return;
      }

      // Update spinner with new labels
      spinnerElement.setAttribute("slicecount", labels.length.toString());
      spinnerElement.setAttribute("labels", JSON.stringify(labels));

      const spinner = spinnerElement.querySelector(".spinner");
      spinner.classList.remove("spinning");
      void spinner.offsetWidth;
      spinner.style.setProperty(
        "--final-rotation",
        `${Math.random() * 360}deg`,
      );
      spinner.classList.add("spinning");

      // Announce result after spin animation (3s, or 0.5s with reduced motion)
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? 500
        : 3000;
      setTimeout(() => {
        const finalRotation = parseFloat(
          spinner.style.getPropertyValue("--final-rotation"),
        );
        const sliceAngle = 360 / labels.length;
        // Calculate which slice the indicator points to (top = 0 degrees)
        const normalizedAngle = (360 - (finalRotation % 360)) % 360;
        const winningIndex = Math.floor(normalizedAngle / sliceAngle);
        const winner = labels[winningIndex];
        const resultEl = this.querySelector("#spin-result");
        if (resultEl && winner) {
          resultEl.textContent = `The wheel landed on: ${winner}`;
        }
      }, duration);

      if (textarea) {
        document.cookie = `savedText=${encodeURIComponent(textarea.value)}; path=/; max-age=${30 * 24 * 60 * 60}`;
      }
    });

    super.appendChild(content);

    // Wire up preload Add buttons (must be after appendChild)
    this.querySelectorAll(".preload-add-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const selectId = btn.dataset.select;
        const comboSelect = this.querySelector(`#${selectId}`);
        if (!comboSelect) return;
        const values = comboSelect.values || [];
        if (values.length === 0) return;

        // Append values to textarea
        const textareaEl = this.querySelector("#wedges_input");
        textareaEl.value = values.join("\n");

        // Clear combo select selections
        comboSelect.selected = [];
        comboSelect.shadowRoot
          .querySelectorAll(".tag")
          .forEach((t) => t.remove());

        // Trigger input event to update spinner
        textareaEl.dispatchEvent(new Event("input"));
      });
    });
  }
}

customElements.define("spinner-page", SpinnerPage);
