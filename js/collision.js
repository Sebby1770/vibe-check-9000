// Resolve each horizontal axis against the full movement segment, so a slow
// frame cannot jump over a thin wall. Sliding along the other axis stays free.
export function resolveMovement(pos,previous,colliders) {
  const {bounds,boxes}=colliders;
  let x=Math.max(bounds.minX,Math.min(bounds.maxX,pos.x));
  let z=Math.max(bounds.minZ,Math.min(bounds.maxZ,pos.z));
  const active=boxes.filter(b=>pos.y>=(b.minY??-99)&&pos.y<=(b.maxY??99));
  for(const b of active){
    if(previous.z<=b.minZ||previous.z>=b.maxZ)continue;
    if(previous.x<=b.minX&&x>b.minX)x=Math.min(x,b.minX);
    else if(previous.x>=b.maxX&&x<b.maxX)x=Math.max(x,b.maxX);
  }
  for(const b of active){
    if(x<=b.minX||x>=b.maxX)continue;
    if(previous.z<=b.minZ&&z>b.minZ)z=Math.min(z,b.minZ);
    else if(previous.z>=b.maxZ&&z<b.maxZ)z=Math.max(z,b.maxZ);
  }
  pos.x=x;pos.z=z;
  // Recover a position already inside a fixture (e.g. after a scripted seat).
  for(const b of active)if(pos.x>b.minX&&pos.x<b.maxX&&pos.z>b.minZ&&pos.z<b.maxZ){
    const distances=[pos.x-b.minX,b.maxX-pos.x,pos.z-b.minZ,b.maxZ-pos.z];
    const side=distances.indexOf(Math.min(...distances));
    if(side===0)pos.x=b.minX;else if(side===1)pos.x=b.maxX;else if(side===2)pos.z=b.minZ;else pos.z=b.maxZ;
  }
  return pos;
}
