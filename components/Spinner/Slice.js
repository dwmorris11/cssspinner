export default class Slice extends HTMLElement {
  #template = (index, color) => `
    <div class="slice" style="--i: ${index}; --slice-random-color: ${color}"></div>
  `;

  constructor(index = 0, color = "#000000") {
    super();
    this.index = index;
    this.color = color;
  }

  connectedCallback() {
    const tpl = document.createElement("template");
    tpl.innerHTML = this.#template(this.index, this.color);

    this.appendChild(tpl.content.cloneNode(true));
  }
}

customElements.define("slice-element", Slice);
