/**
 * 遍历树
 */
const mapTree = (data = [], callback) => {
  const _mapTree = (_data, _callback) =>
    _data.map((item, index, arr) => {
      let newItem = item;
      if (item.children && item.children.length > 0) {
        newItem = { ...newItem, children: _mapTree(item.children, _callback) };
      }
      return callback(newItem, index, arr) || newItem;
    });
  return _mapTree(data, callback);
};
/**
 * findTree
 */
const findTree = (data = [], judgeFn = () => false) => {
  const _getNodeData = (_data) => {
    for (let index = 0; index < _data.length; index++) {
      const item = _data[index];
      if (judgeFn(item, index, _data)) {
        return { item, index, arr: _data };
      }
      if (item.children && item.children.length > 0) {
        const nodeData = _getNodeData(item.children);
        if (nodeData) {
          return nodeData;
        }
      }
    }
  };
  return _getNodeData(data) || {};
};
/**
 * 一维数组转为tree
 */
const toTree = (data, childKeyName = 'id', parentKeyName = 'pid', childrenName = 'children') => {
  const result = [];
  if (!Array.isArray(data)) {
    return result;
  }
  data.forEach((item) => {
    // eslint-disable-next-line no-param-reassign
    delete item[childrenName];
  });
  const map = {};
  data.forEach((item) => {
    if (item[childKeyName]) {
      map[item[childKeyName]] = item;
    }
  });
  data.forEach((item) => {
    const parent = map[item[parentKeyName]];
    if (parent) {
      (parent[childrenName] || (parent[childrenName] = [])).push(item);
    } else {
      result.push(item);
    }
  });
  return result;
};
/**
 * 转数组
 */
const treeToArr = (data, childrenName = 'children') => {
  const arr = [];
  const _treeToArr = (_data) => {
    _data.forEach((item) => {
      arr.push(item);
      if (item?.[childrenName]?.length > 0) {
        _treeToArr(item[childrenName]);
      }
    });
  };
  _treeToArr(data);
  return arr;
};
/**
 * findAncestorsTree 记录找到节点的路径，可以反向追踪父级
 */
const findAncestorsTree = (data = [], judgeFn = () => false) => {
  const ancesArr = []; // 记录找到的子孙的父级
  let grade = -1; // 等级
  const _getNodeData = (_data) => {
    grade++;
    for (let index = 0; index < _data.length; index++) {
      const item = _data[index];
      ancesArr[grade] = item;
      if (judgeFn(item, index, _data)) {
        return { item, index, arr: _data };
      }
      if (item.children && item.children.length > 0) {
        const nodeData = _getNodeData(item.children);
        if (nodeData) {
          return nodeData;
        }
      }
    }
    grade--;
  };
  return { ...(_getNodeData(data) || {}), grade, ancesArr };
};
export { findTree, mapTree, toTree, treeToArr, findAncestorsTree };
