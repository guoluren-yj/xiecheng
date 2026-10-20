export const PRIMARY_KEY = 'code';
export const PARENT_KEY = 'parentCode';
export const CHILDREN_KEY = 'children';
export const EXPAND_KEY = 'expand';
export const CHECK_KEY = 'isChecked';

export const treeDS = () => ({
  idField: PRIMARY_KEY,
  parentField: PARENT_KEY,
  expandField: EXPAND_KEY,
  checkField: CHECK_KEY,
  // childrenField: CHILDREN_KEY,
  paging: false,
  fields: [
    { name: 'menuName', type: 'string' },
    { name: 'expand', type: 'boolean' },
  ],
});

export const treeToArr = data => {
  const arr = [];
  const _treeToArr = (_data, parentCode) => {
    _data.forEach(item => {
      const arrItem = {
        ...item,
        name: item.unitName || item.groupName || item.menuName,
        [PRIMARY_KEY]: item.unitCode || item.groupCode || item.menuCode, // id存在重复，故使用code作为主键
        [PARENT_KEY]: parentCode || item.parentCode || item.parentId, // 一级菜单的parentId是0
      };
      arr.push(arrItem);
      if (arrItem.subMenus && arrItem.subMenus.length > 0) {
        _treeToArr(arrItem.subMenus, arrItem.code);
      }
      if (arrItem.groupList && arrItem.groupList.length > 0) {
        _treeToArr(arrItem.groupList, arrItem.code);
      }
      if (arrItem.units && arrItem.units.length > 0) {
        _treeToArr(arrItem.units, arrItem.groupCode);
      }
    });
  };
  _treeToArr(data);
  return arr;
};

export const findRelatedNode = (allData, nodeKey) => {
  const nodes = [];
  const leafNodes = findLeafNode(allData, nodeKey);
  const parentNodes = findParentNode(allData, nodeKey);
  nodes.push(...leafNodes, ...parentNodes);
  return nodes;
};

export const findLeafNode = (allData, nodeKey) => {
  const nodes = [];
  const _findLeftNode = key => {
    const leftNode = allData.filter(node => node[PARENT_KEY] === key);
    if (leftNode.length > 0) {
      nodes.push(...leftNode);
      leftNode.forEach(item => _findLeftNode(item[PRIMARY_KEY]));
    }
  };
  _findLeftNode(nodeKey);
  return nodes;
};

export const findParentNode = (allData, nodeKey) => {
  const nodes = [];
  const _findParentNode = key => {
    const leafNodes = allData.filter(node => node[PRIMARY_KEY] === key);
    if (leafNodes.length > 0) {
      nodes.push(...leafNodes);
      leafNodes.forEach(item => _findParentNode(item[PARENT_KEY]));
    }
  };
  _findParentNode(nodeKey);
  return nodes;
};

export const deDuplicationArr = allData => {
  const nodes = [];
  const keyMap = {};
  allData.forEach(item => {
    const key = item[PRIMARY_KEY];
    if (!keyMap[key]) {
      nodes.push(item);
      keyMap[key] = true;
    }
  });
  return nodes;
};

export const transformTreeDataChildren = treeData => {
  const func = (leafTreeData, parentCode) => {
    const arr = [];
    leafTreeData.forEach(item => {
      const newItem = {
        ...item,
        name: item.unitName || item.groupName || item.menuName,
        [PRIMARY_KEY]: item.unitCode || item.groupCode || item.menuCode, // id存在重复，故使用code作为主键
        [PARENT_KEY]: parentCode || item.parentCode || item.parentId, // 一级菜单的parentId是0
      };
      if (newItem.subMenus && newItem.subMenus.length > 0) {
        newItem[CHILDREN_KEY] = func(newItem.subMenus, newItem[PRIMARY_KEY]);
      }
      if (newItem.groupList && newItem.groupList.length > 0) {
        newItem[CHILDREN_KEY] = func(newItem.groupList, newItem[PRIMARY_KEY]);
      }
      if (newItem.units && newItem.units.length > 0) {
        newItem[CHILDREN_KEY] = func(newItem.units, newItem[PRIMARY_KEY]);
      }
      arr.push(newItem);
    });
    return arr;
  };
  return func(treeData);
};
