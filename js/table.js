// Table functions
const addRow = (tbody, eventHandler = null, appendix = null) => {
  if (appendix) appendix.parentNode.removeChild(appendix);
  let newRow = tbody.querySelector("tr:last-of-type").cloneNode(true);
  clearRow(newRow);
  if (eventHandler) newRow.addEventListener("input", eventHandler);
  tbody.appendChild(newRow);
  if (appendix) tbody.querySelector("tr:last-of-type").appendChild(appendix);
  return newRow;
};

const updateRow = (row, data, multiplier = 1) => {
  row.querySelectorAll("span").forEach((span) => {
    const name = span.getAttribute("name");
    let value = data[name];
    value = isString(value) ? value : round(value * multiplier, 3);
    span.dataset.value = value;
    span.textContent = isString(value) ? value : formatValue(value, decimals(name));
  });
};

const removeRow = (tbody, appendix = null) => {
  tbody.removeChild(tbody.querySelector("tr:last-of-type"));
  if (appendix) tbody.querySelector("tr:last-of-type").appendChild(appendix);
};

const clearRow = (row) => {
  row.querySelector("div.input-container")?.classList.remove("milliliter", "gram");
  row.querySelectorAll("select").forEach((select) => {
    select.selectedIndex = 0;
    select.disabled = false;
  });
  row.querySelectorAll("input").forEach((input) => {
    input.value = "";
    input.checked = false;
  });
  row.classList.remove("checked-off");
  row.querySelectorAll("span").forEach((span) => {
    span.textContent = "";
    if ("value" in span.dataset) span.dataset.value = 0;
    if ("original" in span.dataset) span.dataset.original = "";
  });
};
