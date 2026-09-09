/* 1954 Midtown layout. Meters. Club at origin, street +Z, alley -Z. */

export const SECOND_Y = 4.4;

export const CLUB = { minX: -16.5, maxX: 16.5, minZ: -16.5, maxZ: 12.5 };
export const DINER = { minX: -38.8, maxX: -16.5, minZ: -16.5, maxZ: 12.5 };
export const HOTEL = { minX: 16.5, maxX: 38.8, minZ: -16.5, maxZ: 12.5 };
export const ATRIUM = { minX: -7.3, maxX: 7.3, minZ: -7.6, maxZ: 5.4 };
export const STAIRS = {
    minX: 13.2, maxX: 16.35, minZ: 2.15, maxZ: 10.15,
    zBottom: 10.15, zTop: 2.15,
};
export const FIRE_ESC = {
    minX: 13.2, maxX: 15.85, minZ: -24.05, maxZ: -16.28,
    zBottom: -24.05, zTop: -16.32,
};

export const BOUNDS = { minX: -52.5, maxX: 52.5, minZ: -29.4, maxZ: 40.15 };

export const SHOPS = [
    { id: "records", label: "REX'S RECORDS", minX: -38.2, maxX: -28.2, minZ: 32.05, maxZ: 40.0, doorX: -33.2 },
    { id: "pharmacy", label: "47TH PHARMACY", minX: -26.8, maxX: -16.8, minZ: 32.05, maxZ: 40.0, doorX: -21.8 },
    { id: "florist", label: "LILY'S", minX: -15.4, maxX: -9.0, minZ: 32.05, maxZ: 40.0, doorX: -12.2 },
    { id: "rivoli", label: "RIVOLI", minX: -8.0, maxX: 18.2, minZ: 32.05, maxZ: 40.0, doorX: 6.0 },
    { id: "liquor", label: "MIDTOWN GIN", minX: 19.6, maxX: 29.6, minZ: 32.05, maxZ: 40.0, doorX: 24.6 },
    { id: "barber", label: "TONY'S", minX: 31.2, maxX: 40.6, minZ: 32.05, maxZ: 40.0, doorX: 35.8 },
];

function inRect(x, z, r) {
    return x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ;
}

export function inClubStairs(x, z) {
    return x >= STAIRS.minX && x <= STAIRS.maxX && z >= STAIRS.minZ && z <= STAIRS.maxZ;
}

export function inFireEscape(x, z) {
    return x >= FIRE_ESC.minX && x <= FIRE_ESC.maxX && z >= FIRE_ESC.minZ && z <= FIRE_ESC.maxZ;
}

export function inAtrium(x, z) {
    return inRect(x, z, ATRIUM);
}

export function inClubFootprint(x, z) {
    return inRect(x, z, CLUB);
}

export function inDiner(x, z) {
    return inRect(x, z, DINER);
}

export function inHotel(x, z) {
    return inRect(x, z, HOTEL);
}

export function shopAt(x, z) {
    for (const s of SHOPS) {
        if (inRect(x, z, s)) return s;
    }
    return null;
}

export function isOutside(x, z) {
    return !inClubFootprint(x, z) && !inDiner(x, z) && !inHotel(x, z) && !shopAt(x, z);
}

export function getFloorY(x, z, yHint = 0) {
    if (inClubStairs(x, z)) {
        const t = (STAIRS.zBottom - z) / (STAIRS.zBottom - STAIRS.zTop);
        return Math.max(0, Math.min(1, t)) * SECOND_Y;
    }
    if (inFireEscape(x, z)) {
        const t = (z - FIRE_ESC.zBottom) / (FIRE_ESC.zTop - FIRE_ESC.zBottom);
        return Math.max(0, Math.min(1, t)) * SECOND_Y;
    }
    if (inClubFootprint(x, z) && !inAtrium(x, z) && !inClubStairs(x, z)) {
        if (yHint > SECOND_Y * 0.42) return SECOND_Y;
    }
    return 0;
}

export function getZone(x, z, y = 0) {
    if (inFireEscape(x, z)) return y > 2.2 ? "lounge" : "alley";
    if (inClubStairs(x, z)) return y > 2.2 ? "lounge" : "club";
    if (inDiner(x, z)) return "diner";
    if (inHotel(x, z)) return "hotel";
    const shop = shopAt(x, z);
    if (shop) return shop.id;
    if (inClubFootprint(x, z)) {
        if (y > SECOND_Y * 0.42 && !inAtrium(x, z)) return "lounge";
        return "club";
    }
    if (z < CLUB.minZ) return "alley";
    return "street";
}

export function onDanceFloor(x, z, y = 0) {
    return Math.abs(x) < 7.6 && Math.abs(z) < 7.6 && y < 2.2 && inClubFootprint(x, z);
}

export function zoneLabel(zone) {
    switch (zone) {
        case "club": return "THE FLOOR";
        case "lounge": return "THE LOUNGE";
        case "alley": return "THE ALLEY";
        case "street": return "47TH STREET";
        case "diner": return "DOTTIE'S DINER";
        case "hotel": return "HOTEL ASTORIA";
        case "records": return "REX'S RECORDS";
        case "pharmacy": return "47TH PHARMACY";
        case "florist": return "LILY'S";
        case "rivoli": return "THE RIVOLI";
        case "liquor": return "MIDTOWN GIN";
        case "barber": return "TONY'S BARBER";
        default: return "MIDTOWN";
    }
}

export function zoneTint(zone) {
    switch (zone) {
        case "club": return "#00fff7";
        case "lounge": return "#e0b25a";
        case "alley": return "#39ff14";
        case "street": return "#ffb25a";
        case "diner": return "#ff6b6b";
        case "hotel": return "#d4c4a8";
        case "records": return "#c77dff";
        case "pharmacy": return "#66ffe0";
        case "florist": return "#ff6b9a";
        case "rivoli": return "#ffe7a8";
        case "liquor": return "#e0b25a";
        case "barber": return "#ff3355";
        default: return "#00fff7";
    }
}

function wall(boxes, minX, maxX, minZ, maxZ, minY = -1, maxY = 8.6) {
    boxes.push({ minX, maxX, minZ, maxZ, minY, maxY });
}

export function buildColliders() {
    const boxes = [];

    // Club front wall, door gap at x [-1.5, 1.5] on the ground
    wall(boxes, -16.5, -1.5, 12.32, 12.68);
    wall(boxes, 1.5, 16.5, 12.32, 12.68);
    wall(boxes, -1.5, 1.5, 12.32, 12.68, 3.15, 8.6);

    // Club back wall, ground door + 2F fire-escape window
    wall(boxes, -16.5, -1.4, -16.72, -16.28);
    wall(boxes, 1.4, 13.2, -16.72, -16.28);
    wall(boxes, 15.85, 16.5, -16.72, -16.28);
    wall(boxes, -1.4, 1.4, -16.72, -16.28, 3.15, 8.6);
    wall(boxes, 13.2, 15.85, -16.72, -16.28, -1, 4.35);
    wall(boxes, 13.2, 15.85, -16.72, -16.28, 7.2, 8.6);

    // Club side walls
    wall(boxes, -16.72, -16.28, -16.5, 12.5);
    wall(boxes, 16.28, 16.72, -16.5, 12.5);

    // Diner shell, door at x [-28.4, -25.6]
    wall(boxes, -38.8, -28.4, 12.32, 12.68);
    wall(boxes, -25.6, -16.5, 12.32, 12.68);
    wall(boxes, -28.4, -25.6, 12.32, 12.68, 3.0, 8.6);
    wall(boxes, -38.95, -38.55, -16.5, 12.5);
    wall(boxes, -38.8, -16.5, -16.72, -16.28);
    wall(boxes, -16.72, -16.28, -16.5, -0.4);

    // Hotel shell, door at x [23.6, 26.4]
    wall(boxes, 16.5, 23.6, 12.32, 12.68);
    wall(boxes, 26.4, 38.8, 12.32, 12.68);
    wall(boxes, 23.6, 26.4, 12.32, 12.68, 3.0, 8.6);
    wall(boxes, 38.55, 38.95, -16.5, 12.5);
    wall(boxes, 16.5, 38.8, -16.72, -16.28);
    wall(boxes, 16.28, 16.72, -16.5, -0.4);

    // Interior furniture — ground
    wall(boxes, -5.3, 5.3, -14.35, -10.15, -1, 2.9);
    wall(boxes, -16.4, -13.55, -8.5, 8.5, -1, 2.9);
    wall(boxes, -8.95, -7.45, 10.0, 11.15, -1, 2.5);
    wall(boxes, 7.45, 8.85, 10.15, 10.75, -1, 2.2);
    wall(boxes, -32.6, -18.4, 2.4, 5.1, -1, 1.8);
    wall(boxes, -27.1, -18.6, 5.55, 7.25, -1, 1.85);
    wall(boxes, 21.4, 28.6, 4.6, 7.4, -1, 1.6);

    // Atrium railings (second floor) — full rectangle
    wall(boxes, -7.7, 7.7, 5.28, 5.78, 4.2, 5.75);
    wall(boxes, -7.7, 7.7, -7.98, -7.48, 4.2, 5.75);
    wall(boxes, -7.75, -7.18, -7.6, 5.4, 4.2, 5.75);
    wall(boxes, 7.18, 7.75, -7.6, 5.4, 4.2, 5.75);

    // Stair rails
    wall(boxes, 13.08, 13.36, 2.9, 9.5, -1, 6.4);
    wall(boxes, 16.12, 16.42, 2.9, 9.5, -1, 6.4);

    // West banquettes + north chaise + club chairs
    wall(boxes, -15.7, -13.9, -4.0, 5.2, 4.2, 5.6);
    wall(boxes, 8.7, 12.5, 7.95, 9.2, 4.2, 5.4);
    wall(boxes, 12.05, 13.45, 1.95, 3.25, 4.2, 5.5);
    wall(boxes, 10.45, 11.85, 0.45, 1.75, 4.2, 5.5);

    // Lounge stage + jukebox + tables + lounge bar
    wall(boxes, -3.6, 3.6, -14.7, -12.2, 4.2, 5.6);
    wall(boxes, 10.7, 11.6, -9.7, -9.0, 4.2, 6.2);
    wall(boxes, -15.4, -13.8, -10.6, -5.8, 4.2, 6.0);
    for (const [x, z] of [[-12.2, 7.0], [-9.4, 6.5], [-12.4, 4.2], [9.2, 7.1], [11.4, 5.4], [-11.6, -3.4], [-9.2, -5.6], [9.6, -4.2], [11.5, -6.4], [-12.0, 1.2]]) {
        wall(boxes, x - 0.55, x + 0.55, z - 0.55, z + 0.55, 4.2, 5.35);
    }

    // Ground VIP couches
    wall(boxes, 12.4, 14.8, -5.0, -3.4, -1, 1.4);
    wall(boxes, 12.4, 14.8, 1.0, 2.6, -1, 1.4);
    wall(boxes, 12.0, 14.4, 5.8, 7.4, -1, 1.4);

    // Alley junk
    wall(boxes, -9.4, -6.2, -23.5, -20.8, -1, 1.8);
    wall(boxes, 3.6, 6.6, -27.2, -24.6, -1, 1.6);
    wall(boxes, -2.2, 0.4, -22.4, -20.6, -1, 1.4);

    // Alley back wall + side fences + lots beside the block
    wall(boxes, -55, 55, -30.2, -29.55);
    wall(boxes, -39.2, -38.7, -30, -16.5);
    wall(boxes, 38.7, 39.2, -30, -16.5);
    wall(boxes, 38.9, 55, -30, 12.5);
    wall(boxes, -55, -38.9, -30, 12.5);

    // Shop row across 47th — shells with doors, then the towers behind
    function shopShell(s, doorW = 2.5) {
        const z0 = s.minZ;
        const z1 = s.maxZ;
        const dl = s.doorX - doorW / 2;
        const dr = s.doorX + doorW / 2;
        wall(boxes, s.minX, dl, z0 - 0.14, z0 + 0.14);
        wall(boxes, dr, s.maxX, z0 - 0.14, z0 + 0.14);
        wall(boxes, dl, dr, z0 - 0.14, z0 + 0.14, 2.55, 10);
        wall(boxes, s.minX, s.maxX, z1 - 0.14, z1 + 0.14);
        wall(boxes, s.minX - 0.14, s.minX + 0.14, z0, z1);
        wall(boxes, s.maxX - 0.14, s.maxX + 0.14, z0, z1);
    }
    for (const s of SHOPS) shopShell(s);
    wall(boxes, -90, SHOPS[0].minX - 0.2, 32.05, 90, -1, 120);
    wall(boxes, SHOPS[SHOPS.length - 1].maxX + 0.2, 90, 32.05, 90, -1, 120);
    wall(boxes, -90, 90, 40.12, 90, -1, 120);

    // Shop counters / booths / chairs
    wall(boxes, -37.4, -29.0, 37.55, 39.35, -1, 1.5); // records counter
    wall(boxes, -26.0, -17.6, 37.45, 39.2, -1, 1.5); // pharmacy counter
    wall(boxes, -14.7, -9.7, 37.6, 39.15, -1, 1.35); // florist table
    wall(boxes, 3.4, 8.6, 36.7, 39.15, -1, 1.7); // rivoli ticket
    wall(boxes, 20.4, 28.8, 37.5, 39.25, -1, 1.5); // gin counter
    wall(boxes, 32.4, 39.4, 37.15, 38.55, -1, 1.45); // barber back bar
    wall(boxes, 33.35, 34.95, 34.85, 36.35, -1, 1.25); // barber chair
    wall(boxes, 36.15, 37.75, 34.85, 36.35, -1, 1.25);

    // Parked cars — parallel to the curb, out of the driving lanes
    wall(boxes, -22.1, -18.1, 18.05, 19.65, -1, 1.4);
    wall(boxes, -8.4, -4.4, 18.05, 19.65, -1, 1.4);
    wall(boxes, 12.4, 16.4, 18.05, 19.65, -1, 1.4);
    wall(boxes, 27.4, 31.4, 18.05, 19.65, -1, 1.4);
    wall(boxes, -34.2, -30.2, 26.05, 27.65, -1, 1.4);
    wall(boxes, 6.2, 10.2, 26.05, 27.65, -1, 1.4);

    // Newsstand + phone booth + subway kiosk
    wall(boxes, -13.3, -10.4, 15.35, 16.85, -1, 2.2);
    wall(boxes, 6.45, 7.85, 15.55, 16.95, -1, 2.4);
    wall(boxes, -24.2, -20.6, 27.4, 29.8, -1, 2.8);

    return { bounds: BOUNDS, boxes, getFloorY };
}
