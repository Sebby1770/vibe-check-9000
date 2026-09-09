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

export const BOUNDS = { minX: -52.5, maxX: 52.5, minZ: -29.4, maxZ: 37.8 };

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

export function isOutside(x, z) {
    return !inClubFootprint(x, z) && !inDiner(x, z) && !inHotel(x, z);
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
    wall(boxes, 13.2, 15.85, -16.72, -16.28, -1, 3.15);

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
    wall(boxes, -32.6, -18.4, 2.4, 5.1, -1, 1.8);
    wall(boxes, 21.4, 28.6, 4.6, 7.4, -1, 1.6);

    // Atrium railings (second floor) — full rectangle
    wall(boxes, -7.7, 7.7, 5.28, 5.78, 4.2, 5.75);
    wall(boxes, -7.7, 7.7, -7.98, -7.48, 4.2, 5.75);
    wall(boxes, -7.75, -7.18, -7.6, 5.4, 4.2, 5.75);
    wall(boxes, 7.18, 7.75, -7.6, 5.4, 4.2, 5.75);

    // Stair rails
    wall(boxes, 13.08, 13.36, 2.9, 9.5, -1, 6.4);
    wall(boxes, 16.12, 16.42, 2.9, 9.5, -1, 6.4);

    // West banquettes
    wall(boxes, -15.7, -13.9, -4.0, 5.2, 4.2, 5.6);

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

    // Far buildings across the street
    wall(boxes, -90, 90, 32.05, 90, -1, 120);

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
