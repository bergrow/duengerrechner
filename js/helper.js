// Helper functions
const delimiter = () => {
  const delimiter = new Option("———", "-1");
  delimiter.disabled = true;
  return delimiter;
};
const decimals = (name) => ("n-no3n-nh4n-nun-orgpkcamgsghkh".match(name) ? 1 : 2);
const isString = (str) => typeof str === "string" || str instanceof String;
const formatValue = (value, decimals, suffix = "", zero = "-") => {
  const formattingSettings = { maximumFractionDigits: decimals, minimumFractionDigits: decimals };
  return `${value && value !== 0 ? value.toLocaleString(undefined, formattingSettings) : zero} ${suffix}`.trim();
};
const round = (v, p = 2) => toFloat(v.toFixed(p));
const toFloat = (str, def = 0) => parseFloat(str) || def;
const calcGH = (ca, mg) => ca * 0.14 + mg * 0.2307;
const calcKH = (ks) => (ks === 0 ? 0 : (ks - 0.05) * 2.8);
