/* since this is a menial task, this was vibecoded */
export default function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }

  const color = ((hash >> 0) & 0xFFFFFF).toString(16).padStart(6, '0');
  return `#${color}`;
}