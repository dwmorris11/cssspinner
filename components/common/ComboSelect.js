export default class ComboSelect extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --combo-width: 260px;
          --combo-max-height: 180px;
          --combo-font: system-ui, sans-serif;
          --combo-bg: rgba(10, 22, 40, 0.95);
          --combo-border: #1e3a5f;
          --combo-radius: 6px;
          --combo-padding: 8px;
          --combo-hover-bg: rgba(255, 140, 0, 0.15);
          --combo-active-bg: rgba(255, 140, 0, 0.25);
          --combo-selected-bg: rgba(255, 140, 0, 0.2);
          --combo-tag-bg: rgba(255, 140, 0, 0.2);
          --combo-tag-color: #ff8c00;
          --combo-tag-remove-bg: #cc3300;
          --combo-tag-remove-color: white;
          --combo-header-bg: rgba(30, 58, 95, 0.8);
          --combo-header-color: #6b8aad;
          --combo-text-color: #e8e8e8;

          position: relative;
          display: inline-block;
          font-family: var(--combo-font);
        }

        .label {
          display: block;
          margin-bottom: 4px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #ff8c00;
        }

        input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--combo-text-color);
          min-width: 60px;
          flex: 1;
        }

        input::placeholder {
          color: var(--combo-header-color);
        }

        .container {
          display: flex;
          align-items: stretch;
        }

        .wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 6px;
          border: 1px solid var(--combo-border);
          border-radius: var(--combo-radius) 0 0 var(--combo-radius);
          background: var(--combo-bg);
          width: var(--combo-width);
          align-items: center;
        }

        .arrow {
          margin-left: auto;
          font-size: 0.7rem;
          opacity: 0.8;
          color: #00bfff;
          transition: transform 0.15s ease;
          pointer-events: none;
        }

        .arrow.open {
          transform: rotate(180deg);
        }

        .tag {
          background: var(--combo-tag-bg);
          color: var(--combo-tag-color);
          padding: 4px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .summary {
          color: #00bfff;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 4px 8px;
          display: none;
        }

        .summary.visible {
          display: block;
        }

        .tag-remove {
          background: var(--combo-tag-remove-bg);
          color: var(--combo-tag-remove-color);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
        }

        input {
          border: none;
          outline: none;
          flex: 1;
          min-width: 80px;
          font-size: 1rem;
          padding: 4px;
        }

        /* Dropdown list */
        .list {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: var(--combo-bg);
          border: 1px solid var(--combo-border);
          border-radius: var(--combo-radius);
          max-height: var(--combo-max-height);
          overflow-y: auto;
          display: none;
          z-index: 10;
          transform-origin: top;
          transform: scaleY(0.9);
          opacity: 0;
          transition: opacity 0.15s ease, transform 0.15s ease;
        }

        .list.open {
          display: block;
          opacity: 1;
          transform: scaleY(1);
        }

        .item {
          padding: var(--combo-padding);
          cursor: pointer;
          color: var(--combo-text-color);
        }

        .item:hover {
          background: var(--combo-hover-bg);
        }

        .item.active {
          background: var(--combo-active-bg);
        }

        .item.selected {
          background: var(--combo-selected-bg);
          font-weight: 500;
        }

        .item.selected::before {
          content: "✓ ";
          color: var(--combo-tag-color);
        }

        .header {
          padding: 4px 8px;
          font-size: 0.8rem;
          text-transform: uppercase;
          background: var(--combo-header-bg);
          color: var(--combo-header-color);
        }

        .select-all {
          font-weight: 600;
        }

        /* Mode switch */
        .mode-switch {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          padding: 4px 6px;
          border: 1px solid var(--combo-border);
          border-left: none;
          border-radius: 0 var(--combo-radius) var(--combo-radius) 0;
          background: var(--combo-bg);
          cursor: pointer;
          user-select: none;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          gap: 4px;
        }

        .mode-switch:hover {
          opacity: 1;
          background: var(--combo-hover-bg);
        }

        .mode-switch.active {
          font-weight: bold;
        }

        .mode-switch.hidden {
          display: none;
        }

        /* Full border-radius when switch is hidden */
        .container.no-switch .wrapper {
          border-radius: var(--combo-radius);
        }

        .mode-label {
          padding: 2px;
          opacity: 0.5;
          color: #6b8aad;
        }

        .mode-label.active {
          opacity: 1;
          font-weight: bold;
          color: #00bfff;
        }
      </style>

      <label class="label" part="label"></label>
      <div class="container">
        <div class="wrapper" part="wrapper">
          <span class="summary" part="summary"></span>
          <span class="arrow" part="arrow">▼</span>
        </div>
        <div class="mode-switch" part="mode-switch" title="Simple / Detailed">
          <span class="mode-label mode-simple">S</span>
          <span class="mode-label mode-detailed">D</span>
        </div>
      </div>

      <div class="list" part="list"></div>
    `;

    this.wrapper = this.shadowRoot.querySelector(".wrapper");
    this.list = this.shadowRoot.querySelector(".list");
    this.arrow = this.shadowRoot.querySelector(".arrow");
    this.labelEl = this.shadowRoot.querySelector(".label");
    this.summaryEl = this.shadowRoot.querySelector(".summary");

    this.input = document.createElement("input");
    this.input.setAttribute("part", "input");
    this.input.setAttribute("role", "combobox");
    this.input.setAttribute("aria-autocomplete", "list");
    this.input.setAttribute("aria-expanded", "false");
    this.input.setAttribute("aria-haspopup", "listbox");
    this.input.setAttribute("placeholder", "Type to filter...");
    this.list.setAttribute("role", "listbox");
    this.wrapper.insertBefore(this.input, this.summaryEl);

    this.switch = this.shadowRoot.querySelector(".mode-switch");

    this.options = [];
    this.rawOptions = null;
    this.selected = [];
    this.activeIndex = -1;

    this.mode = "detailed"; // default

    this.typeBuffer = "";
    this.lastTypeTime = 0;

    this.simpleLabel = this.getAttribute("simple-label") || "S";
    this.detailedLabel = this.getAttribute("detailed-label") || "D";
  }

  static get observedAttributes() {
    return ["simple-label", "detailed-label", "label"];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "simple-label") {
      this.simpleLabel = newVal;
      this.updateLabels();
    }
    if (name === "detailed-label") {
      this.detailedLabel = newVal;
      this.updateLabels();
    }
    if (name === "label") {
      this.labelEl.textContent = newVal;
      this.labelEl.style.display = newVal ? "block" : "none";
    }
  }

  connectedCallback() {
    const attr = this.getAttribute("options");
    if (attr) {
      try {
        this.rawOptions = JSON.parse(attr);
        this.normalizeOptions();
      } catch {}
    }

    // Initialize label
    const labelAttr = this.getAttribute("label");
    if (labelAttr) {
      this.labelEl.textContent = labelAttr;
      this.labelEl.style.display = "block";
    } else {
      this.labelEl.style.display = "none";
    }

    this.updateLabels();

    this.input.addEventListener("input", () => this.filter());
    this.input.addEventListener("focus", () => this.showAll());
    this.input.addEventListener("keydown", (e) => this.handleKey(e));

    this.switch.addEventListener("click", () => {
      this.mode = this.mode === "simple" ? "detailed" : "simple";
      this.updateLabels();
      this.input.value = "";
      this.filter();
    });

    document.addEventListener("click", (e) => {
      // Use composedPath for shadow DOM compatibility
      if (!e.composedPath().includes(this)) this.closeList();
    });
  }

  updateLabels() {
    const simpleEl = this.shadowRoot.querySelector(".mode-simple");
    const detailedEl = this.shadowRoot.querySelector(".mode-detailed");

    simpleEl.textContent = this.simpleLabel;
    detailedEl.textContent = this.detailedLabel;

    // Highlight the active mode
    simpleEl.classList.toggle("active", this.mode === "simple");
    detailedEl.classList.toggle("active", this.mode === "detailed");
  }

  normalizeOptions() {
    if (!Array.isArray(this.rawOptions)) return;

    if (typeof this.rawOptions[0] === "string") {
      this.options = this.rawOptions.map((label) => ({ label, group: null }));
    } else {
      this.options = [];
      this.rawOptions.forEach((g) => {
        const group = g.group || null;
        (g.items || []).forEach((label) => {
          this.options.push({ label, group });
        });
      });
    }

    this.updateModeSwitch();
  }

  updateModeSwitch() {
    const hasGroups = this.options.some((o) => o.group !== null);
    const container = this.shadowRoot.querySelector(".container");

    this.switch.classList.toggle("hidden", !hasGroups);
    container.classList.toggle("no-switch", !hasGroups);
  }

  /* TYPE-AHEAD */
  handleTypeAhead(char) {
    const now = Date.now();
    if (now - this.lastTypeTime > 500) this.typeBuffer = "";
    this.lastTypeTime = now;

    this.typeBuffer += char.toLowerCase();

    const items = Array.from(this.list.querySelectorAll(".item"));
    const idx = items.findIndex((item) =>
      item.textContent.toLowerCase().startsWith(this.typeBuffer),
    );

    if (idx >= 0) {
      this.activeIndex = idx;
      this.updateActive(items);
    }
  }

  /* KEYBOARD NAVIGATION */
  handleKey(e) {
    const items = Array.from(this.list.querySelectorAll(".item"));

    if (e.key.length === 1 && /[a-z0-9]/i.test(e.key)) {
      this.handleTypeAhead(e.key);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (items.length === 0) return;
      this.activeIndex = (this.activeIndex + 1) % items.length;
      this.updateActive(items);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (items.length === 0) return;
      this.activeIndex = (this.activeIndex - 1 + items.length) % items.length;
      this.updateActive(items);
    }

    if (e.key === "Enter") {
      if (this.activeIndex >= 0 && items[this.activeIndex]) {
        items[this.activeIndex].click();
      }
    }

    if (e.key === "Escape") this.closeList();
  }

  updateActive(items) {
    items.forEach((item, i) => {
      item.classList.toggle("active", i === this.activeIndex);
    });

    const active = items[this.activeIndex];
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  /* TAGS */
  addTag(value) {
    if (this.selected.includes(value)) return;

    this.selected.push(value);

    const tag = document.createElement("div");
    tag.className = "tag";
    tag.setAttribute("part", "tag");
    tag.textContent = value;

    const remove = document.createElement("div");
    remove.className = "tag-remove";
    remove.setAttribute("part", "tag-remove");
    remove.textContent = "×";

    remove.addEventListener("click", () => {
      this.removeTag(value);
    });

    tag.appendChild(remove);
    this.wrapper.insertBefore(tag, this.input);

    this.dispatchEvent(new CustomEvent("change", { detail: this.selected }));
    this.updateSummary();
  }

  removeTag(value) {
    this.selected = this.selected.filter((v) => v !== value);
    // Find and remove the tag element
    const tags = this.wrapper.querySelectorAll(".tag");
    tags.forEach((tag) => {
      if (tag.textContent.replace("×", "").trim() === value) {
        tag.remove();
      }
    });
    this.dispatchEvent(new CustomEvent("change", { detail: this.selected }));
    this.updateSummary();
  }

  toggleTag(value) {
    if (this.selected.includes(value)) {
      this.removeTag(value);
    } else {
      this.addTag(value);
    }
  }

  /* SELECT ALL */
  isAllSelected() {
    if (this.mode === "simple") {
      const groups = [
        ...new Set(this.options.map((o) => o.group).filter(Boolean)),
      ];
      return groups.length > 0 && groups.every((g) => this.selected.includes(g));
    } else {
      const allLabels = this.options.map((o) => o.label);
      return allLabels.length > 0 && allLabels.every((l) => this.selected.includes(l));
    }
  }

  updateSummary() {
    const allSelected = this.isAllSelected();
    const tags = this.wrapper.querySelectorAll(".tag");

    if (allSelected && this.selected.length > 0) {
      // Show summary, hide tags
      this.summaryEl.textContent = "✓ All selected";
      this.summaryEl.classList.add("visible");
      tags.forEach((t) => (t.style.display = "none"));
    } else {
      // Hide summary, show tags
      this.summaryEl.classList.remove("visible");
      tags.forEach((t) => (t.style.display = ""));
    }
  }

  toggleSelectAll() {
    if (this.mode === "simple") {
      const groups = [
        ...new Set(this.options.map((o) => o.group).filter(Boolean)),
      ];
      const allSelected = groups.every((g) => this.selected.includes(g));

      this.selected = allSelected ? [] : [...groups];
    } else {
      const allLabels = this.options.map((o) => o.label);
      const allSelected = allLabels.every((l) => this.selected.includes(l));

      this.selected = allSelected ? [] : [...allLabels];
    }

    Array.from(this.wrapper.querySelectorAll(".tag")).forEach((t) =>
      t.remove(),
    );
    this.selected.forEach((v) => this.addTag(v));
    this.dispatchEvent(new CustomEvent("change", { detail: this.selected }));
    this.updateSummary();
    // Re-render to update selection state in dropdown
    this.filter();
  }

  /* FILTER + RENDER */
  filter() {
    const value = this.input.value.toLowerCase();
    const filtered = this.options.filter((o) =>
      o.label.toLowerCase().includes(value),
    );
    this.activeIndex = -1;
    this.render(filtered);
  }

  showAll() {
    this.activeIndex = -1;
    this.render(this.options);
  }

  openList() {
    this.list.classList.add("open");
    this.arrow.classList.add("open");
    this.input.setAttribute("aria-expanded", "true");
  }

  closeList() {
    this.list.classList.remove("open");
    this.arrow.classList.remove("open");
    this.input.setAttribute("aria-expanded", "false");
  }

  render(items) {
    this.list.innerHTML = "";
    if (items.length === 0) {
      this.closeList();
      return;
    }

    /* Select All */
    const selectAll = document.createElement("div");
    const allSelected = this.isAllSelected();
    selectAll.textContent = allSelected ? "✓ All selected" : "Select all";
    selectAll.className = allSelected ? "item select-all selected" : "item select-all";
    selectAll.setAttribute("part", "item select-all");
    selectAll.setAttribute("role", "option");
    selectAll.setAttribute("aria-selected", allSelected);
    selectAll.addEventListener("click", () => this.toggleSelectAll());
    this.list.appendChild(selectAll);

    let currentGroup = null;

    items.forEach((o) => {
      if (this.mode === "simple") {
        if (o.group && o.group !== currentGroup) {
          currentGroup = o.group;

          const groupItem = document.createElement("div");
          groupItem.textContent = currentGroup;
          groupItem.className = this.selected.includes(currentGroup)
            ? "item selected"
            : "item";
          groupItem.setAttribute("part", "item group-item");
          groupItem.setAttribute("role", "option");
          groupItem.setAttribute("aria-selected", this.selected.includes(currentGroup));

          const groupName = currentGroup; // capture value for closure
          groupItem.addEventListener("click", () => {
            this.toggleTag(groupName);
            this.input.value = "";
            this.filter(); // Re-render to update selection state
          });

          this.list.appendChild(groupItem);
        }
        return;
      }

      if (o.group && o.group !== currentGroup) {
        currentGroup = o.group;

        const header = document.createElement("div");
        header.textContent = currentGroup;
        header.className = "header";
        header.setAttribute("part", "header");
        this.list.appendChild(header);
      }

      const div = document.createElement("div");
      div.textContent = o.label;
      div.className = this.selected.includes(o.label) ? "item selected" : "item";
      div.setAttribute("part", "item");
      div.setAttribute("role", "option");
      div.setAttribute("aria-selected", this.selected.includes(o.label));

      div.addEventListener("click", () => {
        this.toggleTag(o.label);
        this.input.value = "";
        this.filter(); // Re-render to update selection state
      });

      this.list.appendChild(div);
    });

    this.openList();
  }

  /* PUBLIC API */
  get values() {
    return this.selected;
  }

  set optionsList(arr) {
    this.rawOptions = arr;
    this.normalizeOptions();
  }
}

customElements.define("combo-select", ComboSelect);
/*
<combo-select>
  <span slot="simple"><img src="simple.svg"></span>
  <span slot="detailed"><img src="detail.svg"></span>
</combo-select>

Use Flat arrays or grouped arrays:
[
  { group: "Asian", items: ["Thai", "Japanese"] },
  { group: "Latin", items: ["Mexican", "Peruvian"] }
]

*/
