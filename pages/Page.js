export default class Page extends HTMLElement {
  #template = (id) =>
    `<div class='page' id=${id}>
  </div>`;
  constructor(id) {
    super();
    this.id = id;
  }

  connectedCallback() {
    const tpl = document.createElement("template");
    tpl.innerHTML = this.#template(this.id);

    const content = tpl.content.cloneNode(true);
    this.appendChild(content);
  }
}
