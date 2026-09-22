// Shared footprints keep architecture, walking routes and map pins in agreement.
export const DISTRICT_BOUNDS = { maxX: 174, maxZ: 76 };
export const DISTRICT_BUILDINGS = [
  { x:64,z:-18,w:16,d:18,h:22,name:'THE MERCER',color:0x785b4f },
  { x:86,z:-18,w:18,d:18,h:30,name:'EASTSIDE ROOMS',color:0x8b7661 },
  { x:125,z:-20,w:16,d:16,h:20,name:'PARK VIEW',color:0x9a725e },
  { x:146,z:-20,w:20,d:16,h:27,name:'THE HAWTHORNE',color:0x716866 },
  { x:168,z:1,w:10,d:30,h:25,name:'GARDEN COURT',color:0x876b58 },
  { x:124,z:40,w:12,d:16,h:20,name:'BLUE NOTE BOOKS',color:0x865d4b },
  { x:138,z:40,w:12,d:16,h:28,name:'SUNRISE BAKERY',color:0x9c826a },
  { x:152,z:40,w:12,d:16,h:23,name:'PARKSIDE FLORAL',color:0x737867 },
  { x:166,z:40,w:12,d:16,h:34,name:'THE ATLAS',color:0x78645b },
  { x:123,z:70,w:14,d:10,h:32,name:'48TH STUDIOS',color:0x8b715e },
  { x:141,z:70,w:18,d:10,h:24,name:'THE EXCHANGE',color:0x785d51 },
  { x:163,z:70,w:20,d:10,h:37,name:'EASTERN ARCADE',color:0x6f7472 },
];
export const DISTRICT_PARKS = [
  {id:'mercer',name:'Mercer Pocket Garden',x:77,z:2,w:36,d:22},
  {id:'hawthorne',name:'Hawthorne Park',x:140,z:2,w:40,d:24},
];
export const DISTRICT_PLACES = [
  {id:'mercer',name:'Mercer Pocket Garden',x:77,z:13,y:0},
  {id:'hawthorne',name:'Hawthorne Park',x:140,z:15,y:0},
  {id:'eastavenue',name:'East Avenue',x:109,z:30,y:0},
  {id:'48th',name:'48th Street · the new block',x:139,z:62,y:0},
];
export const DISTRICT_SEATS = DISTRICT_PARKS.flatMap(p=>[-1,1].map((side,i)=>({
  id:`${p.id}-bench-${i}`,x:p.x+side*8,z:p.z+5,y:0,eye:1.18,
  lookX:p.x,lookZ:p.z,r:1.7,prompt:`[E] SIT IN ${p.name.toUpperCase()}`,
})));
export function districtZone(x,z) {
  for(const p of DISTRICT_PARKS) if(Math.abs(x-p.x)<=p.w/2 && Math.abs(z-p.z)<=p.d/2)return p.id;
  if(x>=96 && z>=49)return '48th';
  if(x>=96 && z<18)return 'eastavenue';
  return null;
}
export function districtColliders() {
  return [
    ...DISTRICT_BUILDINGS.map(b=>({minX:b.x-b.w/2,maxX:b.x+b.w/2,minZ:b.z-b.d/2,maxZ:b.z+b.d/2,minY:-1,maxY:b.h})),
    ...DISTRICT_PARKS.map(p=>({minX:p.x-2.3,maxX:p.x+2.3,minZ:p.z-2.3,maxZ:p.z+2.3,minY:-1,maxY:2.5,sightMaxY:1.1})),
  ];
}
