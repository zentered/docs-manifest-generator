// https://stackoverflow.com/a/53436880
export default function removeNull(obj) {
  obj.routes = obj.routes
    .filter((item) => item !== null)
    .map((item) => {
      return item.routes ? removeNull(item) : item
    })
  return obj
}
