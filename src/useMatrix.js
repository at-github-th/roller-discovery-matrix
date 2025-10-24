import { useEffect, useState } from "react";
export function useMatrixData(staticData){
  const [remote,setRemote]=useState(null);
  useEffect(()=>{ fetch('/api/matrix')
    .then(r=>r.ok?r.json():Promise.reject())
    .then(d=>{ if (d && Array.isArray(d.categories) && d.categories.length) setRemote(d.categories); })
    .catch(()=>{}); },[]);
  return remote ?? staticData;
}
