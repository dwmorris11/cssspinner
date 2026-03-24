import Slice from "./Slice.js";

export default class Spinner extends HTMLElement {
  static observedAttributes = ["slicecount"];

  #template = (sliceCount) =>
    `<div class="spinner" style="--slice-count: ${sliceCount}"></div>`;

  constructor(sliceCount) {
    super();
    this.sliceCount = sliceCount;
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "slicecount" && oldValue !== null) {
      this.#render();
    }
  }

  #render() {
    this.innerHTML = "";
    const sliceCount = this.getAttribute("sliceCount") || this.sliceCount || 8;
    const tpl = document.createElement("template");
    tpl.innerHTML = this.#template(sliceCount);

    const content = tpl.content.cloneNode(true);
    const spinnerDiv = content.querySelector(".spinner");

    // Generate Slices
    for (let i = 1; i <= sliceCount; i++) {
      const randomColor =
        "#" +
        Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, "0");

      spinnerDiv.appendChild(new Slice(i, randomColor));
    }
    this.appendChild(content);
  }
}

customElements.define("spinner-element", Spinner);
