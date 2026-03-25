/**
 * Spinner - A Web Component for creating interactive spinning wheels
 *
 * A custom HTML element that renders a circular spinner/wheel with customizable wedges and labels.
 * Each wedge is colored from a curated color palette, and labels can be displayed along curved paths.
 *
 * @class Spinner
 * @extends HTMLElement
 *
 * @example
 * // Basic usage with default 8 slices
 * <spinner-element></spinner-element>
 *
 * @example
 * // Custom slice count
 * <spinner-element slicecount="12"></spinner-element>
 *
 * @example
 * // With labels
 * <spinner-element slicecount="6" labels='["Red", "Blue", "Green", "Yellow", "Purple", "Orange"]'></spinner-element>
 *
 * @attribute {number} slicecount - Number of wedges to display (default: 8)
 * @attribute {string} labels - JSON array of label strings for each wedge (default: empty array)
 * @attribute {string} labelmode - "curved" (default) for arc text, "radial" for 90° rotated text pointing outward
 *
 * @fires mouseenter - Triggered when hovering over a label, displays tooltip
 * @fires mouseleave - Triggered when leaving a label, hides tooltip
 *
 * @description
 * The Spinner component creates a circular wheel divided into equal wedges, each with:
 * - A distinct color from a 30-color vibrant palette
 * - An optional curved text label positioned along the wedge arc
 * - Interactive tooltip on hover
 * - Responsive font sizing based on label length and slice count
 *
 * The component uses SVG for text path rendering to achieve curved labels along the wheel perimeter.
 * A central pin and optional label tooltip complete the interaction experience.
 */
import { COLOR_PALETTE } from "../../pages/data/Spinner/constants.js";
export default class Spinner extends HTMLElement {
  static observedAttributes = ["slicecount", "labels", "labelmode"];

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

      // Label using SVG
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.classList.add("slice-label-svg");
      svg.style.cssText = `--i: ${i}`;

      const labelText = labels[i - 1] || "";
      const labelMode = this.getAttribute("labelmode") || "curved";

      if (labelMode === "radial") {
        // Radial mode: text rotated 90° pointing outward
        const midAngle = (i - 0.5) * sectionSize;
        const radius = 30;
        const angleRad = ((midAngle - 90) * Math.PI) / 180;
        const x = 50 + radius * Math.cos(angleRad);
        const y = 50 + radius * Math.sin(angleRad);

        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.setAttribute("transform", `rotate(${midAngle - 90}, ${x}, ${y})`);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        const fontSize = calculateRadialFontSize(labelText, sliceCount);
        text.setAttribute("font-size", fontSize);
        text.style.fontSize = `${fontSize}px`;
        text.textContent = labelText;
        svg.appendChild(text);
      } else {
        // Curved mode: text along arc path (default)
        const pathId = `arc-${i}`;
        const startAngle = (i - 1) * sectionSize + sectionSize * 0.15;
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
        const fontSize = calculateFontSize(labelText, sliceCount);
        text.setAttribute("font-size", fontSize);
        text.style.fontSize = `${fontSize}px`;
        textPath.textContent = labelText;

        text.appendChild(textPath);
        svg.appendChild(path);
        svg.appendChild(text);
      }

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

function calculateRadialFontSize(text, sliceCount) {
  // Radial text has more room along the radius but limited by slice width
  const maxRadius = 35; // available radial space
  const charWidth = 0.55;
  const textWidth = text.length * charWidth;
  const radiusBasedSize = maxRadius / textWidth;
  // Also consider slice angle for height constraint
  const sliceAngle = 360 / sliceCount;
  const angleBasedSize = sliceAngle * 0.15;
  const idealSize = Math.min(radiusBasedSize, angleBasedSize);
  return Math.max(2, Math.min(5, idealSize)); // clamp 2-5
}

customElements.define("spinner-element", Spinner);
