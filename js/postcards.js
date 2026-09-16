/* Only the game's WebGL canvas is photographed. No screen or camera permissions. */
export function framePhoto(source) {
  const c = document.createElement("canvas");
  c.width = 960;
  c.height = 540;
  const g = c.getContext("2d");
  const aspect = 16 / 9,
    w = source.width,
    h = source.height,
    sw = Math.min(w, h * aspect),
    sh = sw / aspect;
  g.drawImage(
    source,
    (w - sw) / 2,
    (h - sh) / 2,
    sw,
    sh,
    0,
    0,
    c.width,
    c.height,
  );
  let image = c.toDataURL("image/jpeg", 0.8);
  if (image.length >= 180000) image = c.toDataURL("image/jpeg", 0.55);
  if (image.length >= 180000) {
    c.width = 480;
    c.height = 270;
    g.drawImage(source, (w - sw) / 2, (h - sh) / 2, sw, sh, 0, 0, 480, 270);
    image = c.toDataURL("image/jpeg", 0.65);
  }
  return image;
}
export async function drawPhotoPostcard(photo) {
  const img = new Image();
  img.src = photo.image;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = 1120;
  c.height = 790;
  const g = c.getContext("2d");
  g.fillStyle = "#eee2c3";
  g.fillRect(0, 0, c.width, c.height);
  g.drawImage(img, 40, 40, 1040, 585);
  g.fillStyle = "#31584a";
  g.font = "36px Georgia";
  g.fillText(photo.title, 42, 683, 900);
  g.font = "15px monospace";
  g.fillText(`${photo.clock} · 47TH STREET · NOVEMBER 12, 1954`, 44, 724);
  g.textAlign = "right";
  g.fillText("VIBE CHECK 9000", 1075, 755);
  return c;
}
