import { isArray } from 'lodash';

export default function arrayRemove(array, item) {
  if (!isArray(array)) {
    return array;
  }
  const index = array.indexOf(item);
  if (index >= 0) {
    const newArray = array.slice();
    newArray.splice(index, 1);
    return newArray;
  }
  return array;
}
