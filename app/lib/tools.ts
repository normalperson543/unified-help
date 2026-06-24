/* since this is a menial task, this was vibecoded */
export function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }

  const color = ((hash >> 0) & 0xffffff).toString(16).padStart(6, "0");
  return `#${color}`;
}

export function getShortTitle(str: string) {
  let cutoff = str.length;
  const KEYWORDS = [",", ".", "-", ":", ";", " and ", " or "];
  KEYWORDS.forEach((k) => {
    const index = str.indexOf(k);
    if (index === -1) return;
    if (index < cutoff) cutoff = index;
  });
  return str.substring(0, cutoff);
}
