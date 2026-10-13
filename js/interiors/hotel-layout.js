// Furniture footprints keep a continuous route from the street to the east stairs and rear lounge.
export const HOTEL_FURNITURE=[
 {x:20.3,z:-5.9,w:1.1,d:3.2}, {x:23.2,z:-9.1,w:3.2,d:1.1},
 {x:22.6,z:-5.9,w:1.5,d:1.0}, {x:31.8,z:-5.7,w:3.2,d:1.1},
 {x:31.8,z:-3.4,w:1.5,d:1.0}, {x:20,z:-13.8,w:3.4,d:.9},
];
export const hotelFurnitureColliders=()=>HOTEL_FURNITURE.map(({x,z,w,d})=>({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:0,maxY:2,sightMaxY:1.35}));
