var systemTheme = () => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
var customFertData;
var waterData;

// Init
const init = () => {
  customFertData = JSON.parse(localStorage.getItem("customFertData")) || [];
  populateFertilizerDropdown();

  waterData = JSON.parse(localStorage.getItem("waterData")) || {};
  populateWaterModalForm();
  updateWaterRow(document.querySelector("#water-row"));

  const checklistRow = document.querySelector("#checklist-table tbody tr");
  checklistRow.addEventListener("input", (event) => updateChecklistRow(event.currentTarget));
  document.querySelector("#fertilizer-table tbody tr").addEventListener("input", (event) => {
    updateFertRow(event.currentTarget);
    updateChecklistRow(checklistRow, event.currentTarget);
  });
  document
    .querySelector("#water-table tbody tr")
    .addEventListener("input", (event) => updateWaterRow(event.currentTarget));

  const toggleThemeButton = document.querySelector("#toggle-theme-button");
  if (systemTheme() === "light") toggleThemeButton.classList.add("theme-toggle--toggled");
  toggleThemeButton.addEventListener("click", (event) => toggleTheme(event));

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (_) => {
    if (!document.documentElement.dataset.theme) toggleThemeButton.classList.toggle("theme-toggle--toggled");
  });
};

const toggleTheme = (event) => {
  event.currentTarget.classList.toggle("theme-toggle--toggled");
  const { documentElement: html } = document;
  if (!html.dataset.theme) html.dataset.theme = systemTheme();
  html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
};

// Main Table
const populateFertilizerDropdown = () => {
  fertData.forEach((item) => addFertilizerDropdownOption(new Option(item.name, item.id)));
  if (customFertData.length !== 0) addFertilizerDropdownOption(delimiter());
  customFertData.forEach((item) => addFertilizerDropdownOption(new Option(item.name, item.id)));
};

const addFertilizer = (data) => {
  if (customFertData.length === 0) addFertilizerDropdownOption(delimiter());
  const id = 1000 + customFertData.length;
  customFertData.push({ id: id, ...data });
  localStorage.setItem("customFertData", JSON.stringify(customFertData));
  addFertilizerDropdownOption(new Option(data.name, id));
};

const addFertilizerDropdownOption = (option) => {
  document.querySelectorAll("select[name=fertilizer]").forEach((select) => select.appendChild(option.cloneNode(true)));
};

const addFertRow = (numRows = 1) => {
  const rowButtons = document.querySelector("#fertilizer-row-buttons");
  const tbody = document.querySelector("#fertilizer-table tbody");
  for (let i = 0; i < numRows; i++) {
    const checklistRow = addRow(document.querySelector("#checklist-table tbody"), (event) =>
      updateChecklistRow(event.currentTarget)
    );
    const row = addRow(
      tbody,
      (event) => {
        updateFertRow(event.currentTarget);
        updateChecklistRow(checklistRow, event.currentTarget);
      },
      rowButtons
    );
  }
  rowButtons.querySelectorAll("button")[1].disabled = false;
};

const updateFertRow = (row) => {
  const data = fertData
    .concat(customFertData)
    .find((item) => item.id == row.querySelector("select[name=fertilizer]").selectedOptions[0].value);
  if (data === undefined) return;
  const dose = toFloat(row.querySelector("input[name=dose]").value);
  updateRow(row, data, dose);
  updateSums();
};

const removeFertRow = () => {
  const rowButtons = document.querySelector("#fertilizer-row-buttons");
  const tbody = document.querySelector("#fertilizer-table tbody");
  removeRow(tbody, rowButtons);
  if (tbody.querySelectorAll("tr").length === 1) rowButtons.querySelectorAll("button")[1].disabled = true;
  removeRow(document.querySelector("#checklist-table tbody"));
  updateSums();
};

const updateWaterRow = (row) => {
  if (Object.keys(waterData).length === 0) return;
  const data = {
    gh: calcGH(waterData.ca, waterData.mg),
    kh: calcKH(waterData.ks),
    ...waterData,
  };
  const dilution = toFloat(row.querySelector("input[name=dilution]").value);
  updateRow(row, data, 1 - dilution / 100);
  updateSums();
};

const updateSums = () => {
  let n;
  ["n", "n-no3", "n-nh4", "n-nu", "n-org", "p", "k", "ca", "mg", "s", "b", "cu", "fe", "mn", "mo", "zn"].forEach(
    (name) => {
      let value = Array.from(
        document.querySelectorAll(`span[name=${name}]`),
        (elem) => parseFloat(elem.dataset.value) || 0
      ).reduce((a, c) => a + c, 0);
      if (name === "n") n = value;
      document.querySelector(`#${name}-sum`).textContent = ["n-no3", "n-nh4", "n-nu", "n-org"].includes(name)
        ? `${formatValue((value / n) * 100, 0)} %`
        : formatValue(value, decimals(name));
    }
  );
};

const changeOptRanges = () => {
  document.querySelectorAll("#opt-ranges em[data-stage]").forEach((em) => em.classList.toggle("hidden"));
};

const showMicros = (event) => {
  document.querySelectorAll(".macro").forEach((elem) => elem.classList.add("hidden"));
  document.querySelectorAll(".micro").forEach((elem) => elem.classList.remove("hidden"));
  toggleScrollButtons(event);
};

const showMacros = (event) => {
  document.querySelectorAll(".macro:not(.n-form)").forEach((elem) => elem.classList.remove("hidden"));
  document.querySelectorAll(".micro").forEach((elem) => elem.classList.add("hidden"));
  toggleScrollButtons(event);
};

const toggleScrollButtons = (event) => {
  const {
    currentTarget: activeButton,
    currentTarget: { parentNode: scrollButtons },
  } = event;
  const disabledButton = scrollButtons.querySelector("button[disabled]");
  activeButton.disabled = true;
  disabledButton.disabled = false;
};

const toggleNForm = (event) => {
  document.querySelectorAll(".n-form").forEach((elem) => elem.classList.toggle("hidden"));
  event.currentTarget.toggleAttribute("toggled");
};

// New Fertilizer Modal
const changePhase = (u) => {
  if (u.value == "g") {
    u.form.density.value = 1;
    u.form.density.readOnly = true;
  } else u.form.density.readOnly = false;
};

const saveNewFertilizerForm = (event) => {
  const data = saveModalForm(event);
  if (!data) return;
  const density = toFloat(data.get("density"));
  data.delete("density");
  let res = {};
  for (const [k, v] of data.entries()) {
    if (convTable[k]) {
      res[convTable[k].to] = round(v * convTable[k].factor * 10 * density);
    } else res[k] = isNaN(v) ? v : round(v * 10 * density);
  }
  addFertilizer(res);
  toggleModal(event);
  event.currentTarget.reset();
};

// Water Modal
const populateWaterModalForm = () => {
  const form = document.getElementById("water-modal-form");
  form.querySelectorAll("input[type=number]:not([disabled])").forEach((input) => {
    if (convTable[input.name]) {
      input.value = round(waterData[convTable[input.name].to] / convTable[input.name].factor, 1);
    } else input.value = waterData[input.name];
  });
  updateCalculatedValues(form);
};

const convertValue = (event) => {
  const {
    currentTarget: {
      form,
      value: convFac,
      dataset: { target },
    },
  } = event;
  form[target].value = (toFloat(form[target].value) / convFac).toFixed(convFac < 1 ? 1 : 3);
  form[target].setAttribute("step", convFac < 1 ? "0.1" : "0.001");
};

const updateCalculatedValuesEventHandler = (event) => {
  const {
    currentTarget: { form },
  } = event;
  updateCalculatedValues(form);
};

const updateCalculatedValues = (form) => {
  const ks = toFloat(form.querySelector("input[name=ks]").value);
  const [ca, mg] = ["ca", "mg"].map((name) => {
    const val = toFloat(form.querySelector(`input[name=${name}]`).value);
    const convFac = toFloat(form.querySelector(`select[name=${name}-u]`).value);
    return val * (convFac > 1 ? convFac : 1);
  });
  form.querySelector("input[name=gh]").value = calcGH(ca, mg).toFixed(1);
  form.querySelector("input[name=kh]").value = calcKH(ks).toFixed(1);
};

const saveWaterModalForm = (event) => {
  const data = saveModalForm(event);
  if (!data) return;
  let res = {};
  for (const key of data.keys()) {
    if (key.match(/-/g)) continue;
    const value = toFloat(data.get(key));
    const convFac = toFloat(data.get(`${key}-u`));
    res[key] = value * (convFac < 1 ? 1 : convFac);
  }
  for (const [k, v] of Object.entries(res)) {
    if (convTable[k]) {
      waterData[convTable[k].to] = round(v * convTable[k].factor, 3);
    } else waterData[k] = v;
  }
  localStorage.setItem("waterData", JSON.stringify(waterData));
  updateWaterRow(document.querySelector("#water-row"));
  toggleModal(event);
};

// Checklist Modal
const updateChecklistRow = (row, fromRow) => {
  const quantSpan = row.querySelector("span[name=quantity]");
  const uSpan = row.querySelector("span[name=u]");
  const qualSelect = row.querySelector("select[name=quality]");
  const quality = toFloat(qualSelect.selectedOptions[0].value);
  const checklistMultiplier = toFloat(
    document.querySelector("#checklist-modal input[name=checklist-multiplier]").value,
    1
  );

  // If checked off
  const checkedOff = row.querySelector("[name=check-off]").checked;
  if (checkedOff) row.classList.add("checked-off");
  else row.classList.remove("checked-off");
  qualSelect.disabled = checkedOff;

  // If updated externally by change of the underlying fert table row
  if (fromRow) {
    row.querySelector("span[name=name]").textContent =
      fromRow.querySelector("select[name=fertilizer]").selectedOptions[0].text;
    quantSpan.dataset.original = toFloat(fromRow.querySelector("input[name=dose]").value);
    uSpan.dataset.original = fromRow.querySelector("span[name=u]").textContent;
  }

  quantSpan.textContent = formatValue(round(quantSpan.dataset.original * quality * checklistMultiplier));
  uSpan.textContent = quality === 1 ? uSpan.dataset.original : "ml";
};

const updateChecklistMultiplier = (event) =>
  document.querySelectorAll("#checklist-table tbody tr").forEach((row) => updateChecklistRow(row));

const addToFertigationProtocol = (event) => {
  const fertilizers = Array.from(document.querySelectorAll("#checklist-table tbody tr")).map((row) => {
    const rqs = (q) => row.querySelector(q).textContent;
    return {
      name: rqs("span[name=name]"),
      quality: rqs("select[name=quality] option:checked"),
      quantity: `${rqs("span[name=quantity]")} ${rqs("span[name=u]")}`,
    };
  });

  const inputValue = (name) => document.querySelector(`#checklist-modal input[name=${name}]`).value;
  const data = {
    date: new Date(),
    quantity: inputValue("checklist-multiplier"),
    ph: inputValue("ph"),
    ec: `${inputValue("ec")} mS`,
    fertilizers: fertilizers,
    waterDilution: `${document.querySelector("#water-table input[name=dilution]").value} %`,
  };

  const fertigationProtocol = JSON.parse(localStorage.getItem("fertigationProtocol")) || [];
  fertigationProtocol.push(data);
  localStorage.setItem("fertigationProtocol", JSON.stringify(fertigationProtocol));
};

// Reset Modal
const resetCalculator = (event) => {
  localStorage.removeItem("waterData");
  localStorage.removeItem("customFertData");
  location.reload();
};

// Helper functions
const delimiter = () => {
  const delimiter = new Option("———", "-1");
  delimiter.disabled = true;
  return delimiter;
};
const decimals = (name) => ("n-no3n-nh4n-nun-orgpkcamgsghkh".match(name) ? 1 : 2);
const formatValue = (value, decimals) => {
  const formattingSettings = { maximumFractionDigits: decimals, minimumFractionDigits: decimals };
  return value && value !== 0 ? value.toLocaleString(undefined, formattingSettings) : "-";
};
const round = (v, p = 2) => toFloat(v.toFixed(p));
const toFloat = (str, def = 0) => parseFloat(str) || def;
const calcGH = (ca, mg) => ca * 0.14 + mg * 0.2307;
const calcKH = (ks) => (ks === 0 ? 0 : (ks - 0.05) * 2.8);
const convTable = {
  cao: { to: "ca", factor: 0.715 },
  k2o: { to: "k", factor: 0.8302 },
  mgo: { to: "mg", factor: 0.603 },
  no3: { to: "n", factor: 0.226 },
  p2o5: { to: "p", factor: 0.436 },
  po4: { to: "p", factor: 0.326 },
  so4: { to: "s", factor: 0.334 },
};
