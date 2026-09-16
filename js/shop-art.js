/* Original printed ephemera and 12fps paper-cut cinema for 47th Street. */
import * as THREE from "three";

function texture(canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function printedCard(
  lines,
  { ink = "#263e39", paper = "#f0ddae", width = 512, height = 256 } = {},
) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const g = c.getContext("2d");
  g.fillStyle = paper;
  g.fillRect(0, 0, width, height);
  g.strokeStyle = ink;
  g.lineWidth = 3;
  g.strokeRect(10, 10, width - 20, height - 20);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = ink;
  const rows = Array.isArray(lines) ? lines : [lines];
  rows.forEach((line, i) => {
    const fontSize = Math.min(
      i ? height * 0.135 : height * 0.24,
      width / (String(line).length * 0.62),
    );
    g.font = `${i ? "500" : "800"} ${fontSize}px ${i ? "Georgia" : "Georgia"}, serif`;
    g.fillText(
      line,
      width / 2,
      ((i + 0.65) * height) / rows.length,
      width - 36,
    );
  });
  return texture(c);
}

export const RECORD_ART = [
  {
    title: "MIDNIGHT CURRENT",
    artist: "THE 47TH STREET CIRCUIT",
    ink: "#95e9ce",
    paper: "#132c35",
  },
  {
    title: "BLUE HOUR",
    artist: "VELVET QUARTET",
    ink: "#e7c775",
    paper: "#233f70",
  },
  {
    title: "TOMORROW, AGAIN",
    artist: "THE FUTURE IMPERFECT",
    ink: "#fd956c",
    paper: "#4b2448",
  },
];

export function recordSleeve(index) {
  const data = RECORD_ART[index % RECORD_ART.length];
  const c = document.createElement("canvas");
  c.width = 384;
  c.height = 384;
  const g = c.getContext("2d");
  g.fillStyle = data.paper;
  g.fillRect(0, 0, 384, 384);
  g.fillStyle = data.ink;
  g.textAlign = "left";
  g.font = "800 30px Georgia";
  g.fillText(data.title, 22, 44, 340);
  g.font = "12px monospace";
  g.fillText(data.artist, 24, 68);
  g.save();
  g.beginPath();
  g.rect(22, 88, 340, 245);
  g.clip();
  if (index % 3 === 0) {
    g.fillStyle = "#06141e";
    for (let i = 0; i < 8; i++) {
      const h = 75 + ((i * 43) % 130);
      g.fillRect(i * 53 - 10, 330 - h, 42, h);
      g.fillStyle = data.ink;
      for (let j = 0; j < 5; j++) g.fillRect(i * 53, 335 - h + j * 20, 6, 8);
      g.fillStyle = "#06141e";
    }
    g.strokeStyle = data.ink;
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(15, 245);
    g.lineTo(110, 245);
    g.lineTo(131, 142);
    g.lineTo(169, 290);
    g.lineTo(191, 220);
    g.lineTo(383, 220);
    g.stroke();
  } else if (index % 3 === 1) {
    g.fillStyle = "#efc875";
    g.beginPath();
    g.arc(272, 151, 65, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#101b31";
    g.beginPath();
    g.ellipse(151, 281, 118, 26, -0.15, 0, Math.PI * 2);
    g.fill();
    g.save();
    g.translate(170, 230);
    g.rotate(-0.5);
    g.fillRect(-48, -35, 160, 25);
    g.beginPath();
    g.moveTo(91, -47);
    g.lineTo(147, -60);
    g.lineTo(147, 13);
    g.lineTo(91, 0);
    g.fill();
    g.strokeStyle = "#101b31";
    g.lineWidth = 17;
    g.beginPath();
    g.arc(10, 0, 39, 0, Math.PI);
    g.stroke();
    g.restore();
    g.strokeStyle = data.ink;
    g.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      g.beginPath();
      g.moveTo(20, 301 + i * 5);
      g.lineTo(370, 255 + i * 5);
      g.stroke();
    }
  } else {
    for (let i = 5; i > 0; i--) {
      g.strokeStyle = i % 2 ? data.ink : "#b887d1";
      g.lineWidth = 7;
      g.beginPath();
      g.ellipse(192, 211, 24 * i, 15 * i, -0.45, 0, Math.PI * 2);
      g.stroke();
    }
    g.fillStyle = "#181625";
    g.fillRect(131, 183, 122, 38);
    g.fillStyle = "#97eddf";
    g.fillRect(139, 189, 106, 21);
    g.fillStyle = data.ink;
    g.beginPath();
    g.moveTo(193, 213);
    g.lineTo(166, 304);
    g.lineTo(235, 304);
    g.fill();
  }
  g.restore();
  g.strokeStyle = data.ink;
  g.lineWidth = 2;
  g.strokeRect(11, 11, 362, 362);
  g.fillStyle = data.ink;
  g.font = "12px monospace";
  g.fillText(`REX 00${index + 1}   •   LONG PLAY   •   33⅓`, 24, 358);
  return texture(c);
}

export function checkerFloor(dark = "#28373c", light = "#e7deca", count = 12) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  for (let x = 0; x < count; x++)
    for (let y = 0; y < count; y++) {
      g.fillStyle = (x + y) % 2 ? dark : light;
      g.fillRect(
        (x * 256) / count,
        (y * 256) / count,
        256 / count + 1,
        256 / count + 1,
      );
    }
  return texture(c);
}

export function barberStripes() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = "#fff0d2";
  g.fillRect(0, 0, 256, 512);
  for (let i = -6; i < 12; i++) {
    g.fillStyle = i % 2 ? "#285575" : "#b93040";
    g.beginPath();
    g.moveTo(0, i * 90);
    g.lineTo(256, i * 90 + 128);
    g.lineTo(256, i * 90 + 160);
    g.lineTo(0, i * 90 + 32);
    g.fill();
  }
  const tex = texture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// An original 36-second silent short with title, three animated scenes and an actual clue.
export function createFilm() {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 360;
  const g = c.getContext("2d");
  const tex = texture(c);
  let lastDraw = -Infinity,
    start = null,
    selected = "rain",
    active = false;
  const titles = {
    rain: "NEON IN THE RAIN",
    visor: "THE MIDNIGHT VISOR",
    cats: "ALLEY CATS OF 47TH",
  };
  function intertitle(title, sub) {
    g.strokeStyle = "#dacba2";
    g.lineWidth = 2;
    g.strokeRect(30, 28, 580, 304);
    g.strokeRect(38, 36, 564, 288);
    g.fillStyle = "#f0dfb5";
    g.textAlign = "center";
    g.font = "bold 29px Georgia";
    g.fillText(title, 320, 159, 550);
    g.font = "18px Georgia";
    g.fillText(sub, 320, 207, 535);
  }
  function skyline(t, accent) {
    g.fillStyle = "#2e3039";
    g.fillRect(0, 0, 640, 360);
    g.fillStyle = "#d9c89f";
    g.beginPath();
    g.arc(480, 80, 33, 0, Math.PI * 2);
    g.fill();
    for (let i = 0; i < 11; i++) {
      const h = 90 + ((i * 41) % 105);
      g.fillStyle = i % 2 ? "#191c24" : "#22252e";
      g.fillRect(i * 68 - 30, 285 - h, 58, h);
      g.fillStyle = "#a49575";
      for (let r = 0; r < 4; r++)
        for (let v = 0; v < 2; v++)
          if ((i + r + v) % 3)
            g.fillRect(i * 68 - 16 + v * 22, 300 - h + r * 27, 7, 11);
    }
    g.fillStyle = "#10151c";
    g.fillRect(0, 283, 640, 77);
    g.strokeStyle = accent;
    g.lineWidth = 2;
    for (let i = 0; i < 70; i++) {
      const x = ((i * 47 + t * 30) % 690) - 30,
        y = (i * 31 + t * 145) % 360;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x - 9, y + 25);
      g.stroke();
    }
    for (let i = 0; i < 15; i++)
      g.fillRect(i * 47, 300 + ((i * 11) % 40), 20 + Math.sin(t + i) * 8, 1);
  }
  function walker(x, y, t, accent, visor = false) {
    g.save();
    g.translate(x, y);
    g.strokeStyle = "#080b10";
    g.lineWidth = 9;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(0, -30);
    g.lineTo(Math.sin(t * 6) * 13, 0);
    g.moveTo(0, -30);
    g.lineTo(-Math.sin(t * 6) * 13, 0);
    g.stroke();
    g.fillStyle = "#080b10";
    g.beginPath();
    g.moveTo(-16, -79);
    g.lineTo(17, -79);
    g.lineTo(23, -25);
    g.lineTo(-22, -25);
    g.fill();
    g.fillStyle = "#bfb195";
    g.beginPath();
    g.arc(0, -91, 12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#080b10";
    g.fillRect(-21, -99, 43, 5);
    g.fillRect(-12, -112, 24, 14);
    if (visor) {
      g.fillStyle = accent;
      g.fillRect(-12, -95, 25, 7);
    }
    g.restore();
  }
  function cat(x, y, t) {
    g.save();
    g.translate(x, y);
    g.fillStyle = "#070c12";
    g.beginPath();
    g.ellipse(0, -12, 27, 14, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(24, -26, 14, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(11, -33);
    g.lineTo(13, -51);
    g.lineTo(24, -36);
    g.lineTo(36, -50);
    g.lineTo(38, -29);
    g.fill();
    g.strokeStyle = "#070c12";
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(-24, -13);
    g.quadraticCurveTo(-58, -28, -37, -48 + Math.sin(t * 2) * 7);
    g.stroke();
    g.fillStyle = "#ceecbe";
    g.fillRect(19, -30, 4, 3);
    g.fillRect(30, -30, 4, 3);
    g.restore();
  }
  function draw(t, force = false) {
    if (!force && t - lastDraw < 1 / 12) return;
    lastDraw = t;
    g.fillStyle = "#12131a";
    g.fillRect(0, 0, 640, 360);
    if (!active) {
      intertitle(
        "THE RIVOLI",
        "Present your stub. A small impossibility follows.",
      );
      tex.needsUpdate = true;
      return;
    }
    if (start == null) start = t;
    const elapsed = Math.max(0, t - start) % 36;
    const accent =
      selected === "visor"
        ? "#82c8bb"
        : selected === "cats"
          ? "#d7bd85"
          : "#8ea8bb";
    if (elapsed < 4)
      intertitle(titles[selected], "A 47TH STREET PICTURE  •  1954 (PROBABLY)");
    else if (elapsed < 14) {
      skyline(elapsed, accent);
      const x = 70 + (elapsed - 4) * 40;
      if (selected === "cats") cat(x, 307 + Math.sin(elapsed * 6) * 2, elapsed);
      else walker(x, 317, elapsed, accent, selected === "visor");
      g.fillStyle = "#f0dfb5";
      g.textAlign = "center";
      g.font = "17px Georgia";
      g.fillText(
        "On this block, even the rain keeps an appointment.",
        320,
        345,
      );
    } else if (elapsed < 25) {
      skyline(elapsed, accent);
      g.fillStyle = "#715850";
      g.fillRect(190, 87, 270, 230);
      g.fillStyle = "#111820";
      g.fillRect(253, 163, 145, 154);
      g.fillStyle = accent;
      g.textAlign = "center";
      g.font = "bold 23px Georgia";
      g.fillText("DOTTIE'S", 327, 128);
      for (let i = 0; i < 3; i++) {
        g.strokeStyle = accent;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(287 + i * 34, 231);
        g.quadraticCurveTo(
          273 + i * 34 + Math.sin(elapsed * 3 + i) * 8,
          211,
          287 + i * 34,
          192,
        );
        g.stroke();
      }
      cat(169, 312, elapsed);
      walker(445, 316, elapsed * 0.1, accent, true);
      g.fillStyle = "#f0dfb5";
      g.font = "17px Georgia";
      g.fillText("The cat knew where the night went for coffee.", 320, 345);
    } else if (elapsed < 31) {
      g.fillStyle = "#b7a788";
      g.beginPath();
      g.ellipse(320, 225, 145, 45, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#e0c69a";
      g.beginPath();
      g.moveTo(230, 228);
      g.lineTo(367, 160);
      g.lineTo(412, 238);
      g.closePath();
      g.fill();
      g.fillStyle = "#774d42";
      g.beginPath();
      g.moveTo(230, 228);
      g.lineTo(412, 238);
      g.lineTo(411, 261);
      g.lineTo(230, 245);
      g.fill();
      for (let i = 0; i < 3; i++) {
        g.strokeStyle = "#e8dec1";
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(276 + 35 * i, 153);
        g.quadraticCurveTo(
          255 + 35 * i + Math.sin(elapsed * 2 + i) * 12,
          111,
          280 + 35 * i,
          79,
        );
        g.stroke();
      }
      g.fillStyle = "#f0dfb5";
      g.textAlign = "center";
      g.font = "20px Georgia";
      g.fillText("Ask Dottie about the booth after midnight.", 320, 315);
    } else
      intertitle(
        "THE END. FOR NOW.",
        "Tomorrow has been postponed. The pie has not.",
      );
    // Deterministic grain and gate weave avoid noisy per-frame allocations.
    g.fillStyle = "rgba(240,223,181,.12)";
    const frame = Math.floor(t * 12);
    for (let i = 0; i < 70; i++)
      g.fillRect(
        (i * 127 + frame * 71) % 640,
        (i * 53 + frame * 17) % 360,
        1,
        2,
      );
    g.fillStyle = "#0a0b10";
    g.fillRect(0, 0, 640, 9);
    g.fillRect(0, 351, 640, 9);
    tex.needsUpdate = true;
  }
  draw(0, true);
  return {
    texture: tex,
    draw,
    play(id = "rain") {
      selected = /cat/i.test(id)
        ? "cats"
        : /visor/i.test(id)
          ? "visor"
          : "rain";
      start = null;
      active = true;
      lastDraw = -Infinity;
    },
    setActive(value) {
      if (active === !!value) return;
      active = !!value;
      start = null;
      lastDraw = -Infinity;
    },
    get active() {
      return active;
    },
  };
}
