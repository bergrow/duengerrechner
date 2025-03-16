const init = () => {
  // Fertilizer Rows
  fertData.push(...(JSON.parse(localStorage.getItem("customFertData")) || []));
  const tbody = document.querySelector("#fertilizer-table > tbody");
  let row = tbody.querySelector("tr:last-of-type");
  let params = new URLSearchParams(document.location.search);
  params
    .get("f")
    .split(";")
    .forEach((val, i, ary) => {
      const [id, dose] = val.split(",");
      const data = fertData.find((item) => item.id === parseInt(val));
      if (data === undefined) return;
      updateRow(row, { dose: 1, ...data }, toFloat(dose));
      if (i < ary.length - 1) row = addRow(tbody);
    });
  // Water Row
  waterData = JSON.parse(localStorage.getItem("waterData")) || {};
  if (Object.keys(waterData).length !== 0) {
    const dilution = toFloat(params.get("d"));
    const dilutionText = dilution === 0 ? "unverdünnt" : `${dilution} % verdünnt`;
    const data = {
      dilution: dilutionText,
      gh: calcGH(waterData.ca, waterData.mg),
      kh: calcKH(waterData.ks),
      ...waterData,
    };
    updateRow(document.querySelector("#water-row"), data, 1 - dilution / 100);
  }
  // Summary Row
  let nSum;
  document.querySelectorAll("#sum-row > td span").forEach((span) => {
    const name = span.id.slice(0, -4);
    let value = Array.from(
      document.querySelectorAll(`span[name=${name}]`),
      (elem) => parseFloat(elem.dataset.value) || 0
    ).reduce((a, c) => a + c, 0);
    if (name === "n") nSum = value;
    span.textContent = ["n-no3", "n-nh4", "n-nu", "n-org"].includes(name)
      ? `${formatValue((value / nSum) * 100, 0, " %", "0")}`
      : formatValue(value, decimals(name));
  });
};

window.print();
window.addEventListener("afterprint", (event) => {
  console.log("after print");
  window.close();
});
