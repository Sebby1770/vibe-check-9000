import { DISTRICT_BUILDINGS, EAST_COUNTERS, districtZone } from './district-layout.js';
// Guide deliveries around the solid block rather than pointing through its walls.
export function neighborhoodWaypoint(position,destination) {
  if(!EAST_COUNTERS.some(c=>c.id===destination?.id))return null;
  const {x,z}=position,zone=districtZone(x,z);
  if(zone===destination.id)return {target:destination,hint:'AT THE COUNTER'};
  const inside=DISTRICT_BUILDINGS.find(b=>b.id===zone);
  if(inside)return {target:{x:inside.x,z:inside.z-inside.d/2-1},hint:'OUT THROUGH THE FRONT DOOR'};
  if(destination.id==='arcade'&&z<50){
    if(x>112||x<96)return {target:{x:109,z:29},hint:'EAST AVENUE → 48TH STREET'};
    return {target:{x:109,z:56},hint:'UP EAST AVENUE'};
  }
  if(destination.id!=='arcade'&&z>49){
    if(x>112)return {target:{x:109,z:56},hint:'48TH STREET → EAST AVENUE'};
    return {target:{x:109,z:29},hint:'DOWN EAST AVENUE TO 47TH'};
  }
  if(x<96)return {target:{x:100,z:29},hint:'EAST ALONG 47TH STREET'};
  const b=DISTRICT_BUILDINGS.find(b=>b.id===destination.id),front=b.z-b.d/2-1;
  if(Math.abs(x-b.x)>1.1)return {target:{x:b.x,z:front},hint:'FIND THE SIGNED FRONT DOOR'};
  return {target:destination,hint:'STEP INSIDE · E AT THE COUNTER'};
}
