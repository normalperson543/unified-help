export const LOADING_TEXT = [
  "mraowwwww :3",
  "loading...",
  "wait for it...",
  "so how's ur day today?",
  "loading text",
  "you spin me right round baby right round",
  "wrrf! arf arf! :3",
  "mrrp mrrp~",
  "nyaa!",
  "colon three",
  "i will hack this club",
  "i want to cheese",
  "zach latta is my god"
]

export function randomLoadingText(): string { // claude code :sob: because of stupid type checks
  return LOADING_TEXT[Math.floor(Math.random() * LOADING_TEXT.length)];
}