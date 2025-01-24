// Table functions
const addRow = (tbody, eventHandler, appendix = null) => {
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
    value = isNaN(value) ? value : round(value * multiplier, 3);
    span.dataset.value = value;
    span.textContent = isNaN(value) ? value : formatValue(value, decimals(name));
  });
};

const removeRow = (tbody, appendix = null) => {
  tbody.removeChild(tbody.querySelector("tr:last-of-type"));
  if (appendix) tbody.querySelector("tr:last-of-type").appendChild(appendix);
};

const clearRow = (row) => {
  row.querySelectorAll("select").forEach((select) => (select.selectedIndex = 0));
  row.querySelectorAll("input[type=number]").forEach((input) => (input.value = ""));
  row.querySelectorAll("input[type=checkbox]").forEach((input) => (input.checked = false));
  row.querySelectorAll("span").forEach((span) => {
    span.textContent = "";
    span.classList.remove("checked-off");
    if ("value" in span.dataset) span.dataset.value = 0;
    if ("original" in span.dataset) span.dataset.original = "";
  });
};
