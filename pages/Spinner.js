import Page from "./Page.js";
// import custom components so they are available
import { PreloadOptions, Spinner } from "../components/Spinner/index.js";
import { CUISINES } from "./data/Spinner/constants.js";

export default class SpinnerPage extends Page {
  #children = () => `
    ${PreloadOptions({
      selects: [{ id: "cuisines", label: "Cuisines", options: CUISINES }],
    })}
    <form id="ui-form">
      <textarea
        id="wedges_input"
        class="ui-input"
        placeholder="Enter names (comma or line separated)"
        rows="4"
      ></textarea>
      <button class="ui-button" type="submit">
        <span>Spin</span>
      </button>
    </form>
    <div class="spinning-wheel">
      <div class="indicator-wrapper">
        <div class="indicator"></div>
      </div>
      <spinner-element slicecount="8" labelmode="radial"></spinner-element>
    </div>
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
