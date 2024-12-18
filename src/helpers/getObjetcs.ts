export function getObjects(obj, val) {
  let objects: any[] = [];
  for (const i in obj) {
    if (!obj.hasOwnProperty(i)) continue;

    if (obj[i] && typeof obj[i] === 'object') {
      objects = objects.concat(getObjects(obj[i], val));
    } else if (obj[i]?.toString().toLowerCase().includes(val.toString().toLowerCase())) {
      if (objects.lastIndexOf(obj) === -1) {
        objects.push(obj);
      }
    }
  }
  return objects;
}
