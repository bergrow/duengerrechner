// Base64url (RFC 4648 §5): URL-safe alphabet without padding, so share links
// survive chat clients that mangle "+" when auto-linking.
const toBase64Url = (base64) => base64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");

const fromBase64Url = (base64Url) => {
  const base64 = base64Url.replaceAll("-", "+").replaceAll("_", "/");
  return base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
};

const decodeSearchParam = (schemaSearchParam) => {
  if (schemaSearchParam === null) return;
  try {
    const schema = atob(fromBase64Url(schemaSearchParam));
    return schema
      .split(";")
      .map((item) => {
        const [id, dose] = item.split(",").map((num) => Number(num));
        if (isNaN(id) || id === undefined || isNaN(dose) || dose === undefined) return;
        return { id: id, dose: dose };
      })
      .filter(Boolean);
  } catch (error) {
    return;
  }
};

const encodeSearchParam = (schema) => {
  const encoded = schema
    .map((item) => {
      return `${item.id},${item.dose}`;
    })
    .join(";");
  return toBase64Url(btoa(encoded));
};
