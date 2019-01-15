export default function getIds() {
  return Object.keys(localStorage).map(Number).filter(Number.isSafeInteger).sort((a, b) => a - b);
}
