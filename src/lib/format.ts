export function formatPrice(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return `${n.toFixed(3)} DT`;
}

export function generateOrderNumber() {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ET${y}${m}${d}-${rand}`;
}

export function generateSellerCode(seed: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans caracteres ambigus (0/O, 1/I...)
  const base = seed
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, "X");
  let rand = "";
  for (let i = 0; i < 4; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${base}${rand}`;
}
