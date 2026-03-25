export default class AboutSection extends HTMLElement {
  static get observedAttributes() {
    return ["title", "collapsed"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .about {
          background: rgba(10, 22, 40, 0.8);
          border: 1px solid #1e3a5f;
          border-radius: 8px;
          overflow: hidden;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: rgba(30, 58, 95, 0.5);
          cursor: pointer;
          user-select: none;
        }

        .header:hover {
          background: rgba(30, 58, 95, 0.7);
        }

        .title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #ff8c00;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .title::before {
          content: "?";
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255, 140, 0, 0.2);
          font-size: 0.75rem;
        }

        .toggle {
          color: #00bfff;
          font-size: 0.7rem;
          transition: transform 0.2s ease;
        }

        .toggle.collapsed {
          transform: rotate(-90deg);
        }

        .content {
          padding: 1rem;
          color: #e8e8e8;
          font-size: 0.9rem;
          line-height: 1.6;
          border-top: 1px solid #1e3a5f;
        }

        .content.hidden {
          display: none;
        }

        ::slotted(h3) {
          color: #00bfff;
          font-size: 0.95rem;
          margin: 0 0 0.5rem 0;
        }

        ::slotted(p) {
          margin: 0 0 0.75rem 0;
        }

        ::slotted(p:last-child) {
          margin-bottom: 0;
        }

        ::slotted(ul) {
          margin: 0.5rem 0;
          padding-left: 1.25rem;
        }

        ::slotted(li) {
          margin-bottom: 0.25rem;
        }

        ::slotted(code) {
          background: rgba(0, 191, 255, 0.1);
          color: #00bfff;
          padding: 0.125rem 0.375rem;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.85em;
        }

        ::slotted(a) {
          color: #00bfff;
          text-decoration: none;
        }

        ::slotted(a:hover) {
          text-decoration: underline;
        }
      </style>

      <div class="about">
        <div class="header">
          <span class="title">About this page</span>
          <span class="toggle">▼</span>
        </div>
        <div class="content">
          <slot></slot>
        </div>
      </div>
    `;

    this.header = this.shadowRoot.querySelector(".header");
    this.content = this.shadowRoot.querySelector(".content");
    this.toggle = this.shadowRoot.querySelector(".toggle");
    this.titleEl = this.shadowRoot.querySelector(".title");
  }

  connectedCallback() {
    this.header.addEventListener("click", () => this.toggleContent());

    // Initialize from attributes
    this.updateTitle();
    if (this.hasAttribute("collapsed")) {
      this.collapse();
    }
  }

  attributeChangedCallback(name) {
    if (name === "title") this.updateTitle();
    if (name === "collapsed") {
      if (this.hasAttribute("collapsed")) {
        this.collapse();
      } else {
        this.expand();
      }
    }
  }

  updateTitle() {
    const title = this.getAttribute("title") || "About this page";
    this.titleEl.textContent = title;
  }

  toggleContent() {
    if (this.content.classList.contains("hidden")) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  collapse() {
    this.content.classList.add("hidden");
    this.toggle.classList.add("collapsed");
  }

  expand() {
    this.content.classList.remove("hidden");
    this.toggle.classList.remove("collapsed");
  }
}

customElements.define("about-section", AboutSection);
