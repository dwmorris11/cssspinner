// Curated color palette - 30 vibrant and distinct colors
const COLOR_PALETTE = [
  "#FF6B6B", // coral red
  "#4ECDC4", // teal
  "#FFE66D", // sunny yellow
  "#95E1D3", // mint
  "#F38181", // salmon
  "#AA96DA", // lavender
  "#FCBAD3", // pink
  "#A8D8EA", // sky blue
  "#FF9F43", // orange
  "#6BCB77", // green
  "#845EC2", // purple
  "#FF6F91", // hot pink
  "#FFC75F", // golden yellow
  "#00C9A7", // emerald
  "#C34A36", // rust
  "#008B74", // deep teal
  "#B39CD0", // soft purple
  "#FF8066", // coral orange
  "#00D2FC", // cyan
  "#D5CABD", // warm gray
  "#4D8076", // forest
  "#F9F871", // lemon
  "#FF5E78", // watermelon
  "#2C73D2", // royal blue
  "#D65DB1", // magenta
  "#0089BA", // ocean blue
  "#EE9B00", // amber
  "#9B5DE5", // violet
  "#00BBF9", // bright blue
  "#00F5D4", // aqua
];

export default class Spinner extends HTMLElement {
  static observedAttributes = ["slicecount", "labels"];

  #template = (sliceCount) =>
    `<div class="spinner-wrapper">
    <div class="spinner" style="--slice-count: ${sliceCount}">
      <div class="wedges"></div>
      <div class="labels"></div>
    </div>
    <div class="label-tooltip" hidden></div>
    <div class="pin"></div>
  </div>`;

  constructor(sliceCount) {
    super();
    this.sliceCount = sliceCount;
  }

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.isConnected && oldValue !== newValue) {
      this.#render();
    }
  }

  #render() {
    this.innerHTML = "";
    const sliceCount = parseInt(this.getAttribute("slicecount")) || 8;
    // Parse labels from attribute, or use defaults
    let labels;
    try {
      labels = JSON.parse(this.getAttribute("labels") || "[]");
    } catch {
      labels = [];
    }
    const tpl = document.createElement("template");
    tpl.innerHTML = this.#template(sliceCount);

    const content = tpl.content.cloneNode(true);
    const wedgesDiv = content.querySelector(".wedges");
    const labelsDiv = content.querySelector(".labels");

    const sectionSize = 360 / sliceCount;

    const tooltip = content.querySelector(".label-tooltip");
    for (let i = 1; i <= sliceCount; i++) {
      // Cycle through the color palette
      const sliceColor = COLOR_PALETTE[(i - 1) % COLOR_PALETTE.length];

      // Wedge
      const wedge = document.createElement("div");
      wedge.className = "slice-wedge";
      wedge.style.cssText = `--i: ${i}; --slice-random-color: ${sliceColor}`;
      wedgesDiv.appendChild(wedge);

      // Curved label using SVG
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.classList.add("slice-label-svg");
      svg.style.cssText = `--i: ${i}`;

      // Arc path - adjust radius (35) for text position
      const pathId = `arc-${i}`;
      const startAngle = (i - 1) * sectionSize + sectionSize * 0.15; // offset from edge
      const endAngle = i * sectionSize - sectionSize * 0.15;
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("id", pathId);
      path.setAttribute("d", describeArc(50, 50, 35, startAngle, endAngle));
      path.setAttribute("fill", "none");

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      const textPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "textPath",
      );
      textPath.setAttribute("href", `#${pathId}`);
      textPath.setAttribute("startOffset", "50%");
      const labelText = labels[i - 1] || "";
      const fontSize = calculateFontSize(labelText, sliceCount);
      text.setAttribute("font-size", fontSize);
      text.style.fontSize = `${fontSize}px`;
      textPath.textContent = labelText;

      text.appendChild(textPath);
      svg.appendChild(path);
      svg.appendChild(text);
      labelsDiv.appendChild(svg);
      // Add hover events to show tooltip
      svg.addEventListener("mouseenter", () => {
        tooltip.textContent = labelText;
        tooltip.hidden = false;
      });

      svg.addEventListener("mouseleave", () => {
        tooltip.hidden = true;
      });
    }

    this.appendChild(content);
  }
}

// Helper functions
function describeArc(x, y, radius, startAngle, endAngle) {
  const end = polarToCartesian(x, y, radius, endAngle);
  const start = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  /* The SVG arc syntax is A rx ry rotation large-arc-flag sweep-flag x y. */
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function calculateFontSize(text, sliceCount, radius = 35) {
  const sectionAngle = (360 / sliceCount) * 0.7; // usable arc angle
  const arcLength = radius * ((sectionAngle * Math.PI) / 180);
  const estimatedTextWidth = text.length * 0.5; // rough estimate per char
  const idealSize = arcLength / estimatedTextWidth;
  return Math.max(2, Math.min(6, idealSize)); // clamp 2-6
}

customElements.define("spinner-element", Spinner);
