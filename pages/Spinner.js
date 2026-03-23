import { Spinner } from "../components/Spinner/index.js";
import Page from "./Page.js";

export default class SpinnerPage extends Page {
  #children = () => `
          <form id="ui-form">
      <input
        id="numslices_input"
        class="ui-input"
        type="number"
        placeholder="number of slices"
      />
      <button class="ui-button" type="submit">
        <span>Spin</span>
      </button>
    </form>
    <spinner-element sliceCount="8"></spinner-element>
  `;
  constructor() {
    super("spinnerPage");
  }

  connectedCallback() {
    super.connectedCallback();
    const tpl = document.createElement("template");
    tpl.innerHTML = this.#children();
    const content = tpl.content.cloneNode(true);
    super.appendChild(content);
  }
}

customElements.define("spinner-page", SpinnerPage);
