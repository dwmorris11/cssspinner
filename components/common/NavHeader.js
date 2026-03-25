export default class NavHeader extends HTMLElement {
  static get observedAttributes() {
    return ["title", "logo"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: rgba(10, 22, 40, 0.95);
          border-bottom: 1px solid #1e3a5f;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: #e8e8e8;
        }

        .brand:hover {
          color: #ff8c00;
        }

        .logo {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .title {
          font-size: 1.25rem;
          font-weight: bold;
          background: linear-gradient(135deg, #ff8c00, #ffa333);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        ::slotted(a) {
          color: #e8e8e8;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        ::slotted(a:hover) {
          color: #ff8c00;
          background: rgba(255, 140, 0, 0.1);
        }

        ::slotted(a.active) {
          color: #ff8c00;
          background: rgba(255, 140, 0, 0.15);
          border: 1px solid rgba(255, 140, 0, 0.3);
        }

        /* Mobile menu button */
        .menu-toggle {
          display: none;
          background: transparent;
          border: 1px solid #1e3a5f;
          border-radius: 6px;
          padding: 0.5rem;
          cursor: pointer;
          color: #00bfff;
        }

        .menu-toggle:hover {
          background: rgba(0, 191, 255, 0.1);
        }

        .menu-toggle svg {
          width: 24px;
          height: 24px;
          display: block;
        }

        @media (max-width: 640px) {
          header {
            flex-wrap: wrap;
            padding: 1rem;
          }

          .menu-toggle {
            display: block;
          }

          nav {
            display: none;
            width: 100%;
            flex-direction: column;
            padding-top: 1rem;
            margin-top: 1rem;
            border-top: 1px solid #1e3a5f;
          }

          nav.open {
            display: flex;
          }

          ::slotted(a) {
            width: 100%;
            text-align: center;
          }
        }
      </style>

      <header>
        <a class="brand" href="/">
          <img class="logo" src="" alt="" hidden />
          <span class="title"></span>
        </a>

        <button class="menu-toggle" aria-label="Toggle navigation menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18" stroke-linecap="round"/>
          </svg>
        </button>

        <nav>
          <slot></slot>
        </nav>
      </header>
    `;

    this.nav = this.shadowRoot.querySelector("nav");
    this.menuToggle = this.shadowRoot.querySelector(".menu-toggle");
    this.logoEl = this.shadowRoot.querySelector(".logo");
    this.titleEl = this.shadowRoot.querySelector(".title");
  }

  connectedCallback() {
    this.menuToggle.addEventListener("click", () => {
      this.nav.classList.toggle("open");
    });

    // Initialize from attributes
    this.updateTitle();
    this.updateLogo();
  }

  attributeChangedCallback(name) {
    if (name === "title") this.updateTitle();
    if (name === "logo") this.updateLogo();
  }

  updateTitle() {
    const title = this.getAttribute("title") || "";
    this.titleEl.textContent = title;
  }

  updateLogo() {
    const logo = this.getAttribute("logo");
    if (logo) {
      this.logoEl.src = logo;
      this.logoEl.alt = this.getAttribute("title") || "Logo";
      this.logoEl.hidden = false;
    } else {
      this.logoEl.hidden = true;
    }
  }
}

customElements.define("nav-header", NavHeader);
