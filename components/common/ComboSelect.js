class ComboSelect extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: relative;
          display: inline-block;
          font-family: system-ui, sans-serif;
        }

        input {
          width: 200px;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          max-height: 150px;
          overflow-y: auto;
          display: none;
          z-index: 10;
        }

        .item {
          padding: 8px;
          cursor: pointer;
        }

        .item:hover {
          background: #eee;
        }
      </style>

      <input type="text" />
      <div class="list"></div>
    `;

    this.input = this.shadowRoot.querySelector("input");
    this.list = this.shadowRoot.querySelector(".list");
    this.options = [];
  }

  connectedCallback() {
    const attr = this.getAttribute("options");
    if (attr) {
      try {
        this.options = JSON.parse(attr);
      } catch {
        console.warn("Invalid JSON in options attribute");
      }
    }

    this.input.addEventListener("input", () => this.filter());
    this.input.addEventListener("focus", () => this.showAll());

    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) {
        this.list.style.display = "none";
      }
    });
  }

  filter() {
    const value = this.input.value.toLowerCase();
    const filtered = this.options.filter((o) =>
      o.toLowerCase().includes(value),
    );
    this.render(filtered);
  }

  showAll() {
    this.render(this.options);
  }

  render(items) {
    this.list.innerHTML = "";
    if (items.length === 0) {
      this.list.style.display = "none";
      return;
    }

    items.forEach((item) => {
      const div = document.createElement("div");
      div.textContent = item;
      div.className = "item";
      div.addEventListener("click", () => {
        this.input.value = item;
        this.list.style.display = "none";
      });
      this.list.appendChild(div);
    });

    this.list.style.display = "block";
  }
}

customElements.define("combo-select", ComboSelect);
