// 封装树形数据
export function getArrayByTree({ treeData = [], key, parentKey, title, lastSelectOnly = false }) {
  const flatArr = [];
  const a = (list) =>
    list.forEach((item) => {
      const n = item;
      const { children, ...flatOther } = item;
      const isHasChild = children && children.length > 0;
      n.title = item[title];
      n.key = item[key];
      n.value = item[key];
      n.parentKey = item[parentKey];
      n.isLeaf = !isHasChild;
      n.disableCheckbox = lastSelectOnly ? isHasChild : false;
      flatArr.push(flatOther);
      if (isHasChild) {
        a(children);
      }
    });
  a(treeData);
  return [treeData, flatArr];
}

// 判断是否有重复数据
export function isRepeat(arr, key) {
  const hash = {};
  for (let i = 0; i < arr.length; i++) {
    const remark = key ? arr[i][key] : arr[i];
    if (hash[remark]) {
      return [true, arr[i]];
    } else {
      hash[remark] = true;
    }
  }
  return [false];
}

// 判断是否为json字符串
export function isJson(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}
