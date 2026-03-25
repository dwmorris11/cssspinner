import "../common/ComboSelect.js";
// NOTE: This component returns an HTML String to match the template pattern
// It does not return an HTML Div Element directly

/**
 * Creates a PreloadOptions HTML string with combo selects
 * @param {Object|Array} config - Configuration object or options array
 * @param {Array} config.selects - Array of select configs: { id, options, label }
 * @param {string} [label] - Label when passing options array directly
 * @returns {string}
 */
export default function PreloadOptions(config, label) {
  // If passed an array directly, wrap it as a single select
  const selectList = Array.isArray(config)
    ? [{ options: config, label }]
    : config?.selects || [];

  const selectsHtml = selectList
    .map(({ id, options, label }, index) => {
      const selectId = id || `preload-select-${index}`;
      const optionsAttr = options ? `options='${JSON.stringify(options)}'` : "";
      const labelAttr = label ? `label="${label}"` : "";

      return `
        <div class="preload-option">
          <combo-select id="${selectId}" ${labelAttr} ${optionsAttr}></combo-select>
          <button class="preload-add-btn" data-select="${selectId}">Add</button>
        </div>`;
    })
    .join("");

  return `<div class="preload-options">${selectsHtml}</div>`;
}
