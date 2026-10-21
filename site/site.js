/* Turns each .row into split-flap tiles and spins the title board in once, like the game's title card.
   Without JavaScript the rows stay plain text; with reduced motion the tiles appear already settled. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

function tile(ch) {
  const el = document.createElement("span");
  el.className = ch === " " ? "flap flap-gap" : ch === ":" ? "flap flap-colon" : "flap";
  el.dataset.final = ch;
  el.innerHTML = `<b>${ch === " " ? "" : ch}</b>`;
  return el;
}
function setGlyph(el, ch) {
  const b = el.firstChild;
  if (b.textContent === ch) return;
  b.textContent = ch;
  el.classList.remove("flip");
  void el.offsetWidth;
  el.classList.add("flip");
}
function spin(el, delay, turns) {
  const final = el.dataset.final;
  if (final === " " || final === ":") return;
  let n = 0;
  el.firstChild.textContent = "";
  setTimeout(function step() {
    if (n++ >= turns) { setGlyph(el, final); return; }
    setGlyph(el, GLYPHS[(GLYPHS.indexOf(final) + n * 7 + turns) % GLYPHS.length]);
    setTimeout(step, 46);
  }, delay);
}

let order = 0;
for (const row of document.querySelectorAll(".row")) {
  const text = row.textContent.trim();
  row.textContent = "";
  for (const ch of text) row.append(tile(ch));
  // Only the title board spins; the small time boards are already set.
  if (!still && row.closest(".board")) for (const el of row.children) spin(el, 260 + order++ * 55, 5 + (order % 4) * 2);
}
