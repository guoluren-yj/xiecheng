import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from 'utils/intl';

export const PRIMARY_KEY = '_code_';
export const PARENT_KEY = '_parentCode_';
export const CHILDREN_KEY = '_children_';
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
}) as DataSetProps;

export const treeToArr = data => {
  if (!Array.isArray(data)) {
    return [];
  }
  const arr: any[] = [];
  data.forEach(item => {
    const { combineCode, exportTemplates, importTemplates } = item;
    arr.push({
      ...item,
      [PRIMARY_KEY]: combineCode,
    });
    if (exportTemplates && exportTemplates.length) {
      const exportTemplatesCode = `${combineCode}__export-templates__`;
      arr.push({
        [PRIMARY_KEY]: exportTemplatesCode,
        [PARENT_KEY]: combineCode,
        combineCode,
        name: intl.get('hmde.boComposition.view.message.tab.exportTemplate').d('导出模板'),
      });
      exportTemplates.forEach(template => {
        arr.push({
          ...template,
          [PRIMARY_KEY]: `${exportTemplatesCode}-${template.templateCode}`,
          [PARENT_KEY]: exportTemplatesCode,
          type: 'export',
        });
      });
    }
    if (importTemplates && importTemplates.length) {
      const importTemplatesCode = `${combineCode}__import-templates__`;
      arr.push({
        [PRIMARY_KEY]: importTemplatesCode,
        [PARENT_KEY]: combineCode,
        combineCode,
        name: intl.get('hmde.boComposition.view.message.tab.importTemplate').d('导入模板'),
        type: 'import',
      });
      importTemplates.forEach(template => {
        arr.push({
          ...template,
          [PRIMARY_KEY]: `${importTemplatesCode}-${template.templateCode}`,
          [PARENT_KEY]: importTemplatesCode,
          type: 'import',
        });
      });
    }
  });
  return arr;
};

export const findRelatedNode = (allData, nodeKey) => {
  const nodes: any[] = [];
  const leafNodes = findLeafNode(allData, nodeKey);
  const parentNodes = findParentNode(allData, nodeKey);
  nodes.push(...leafNodes, ...parentNodes);
  return nodes;
};

export const findLeafNode = (allData, nodeKey) => {
  const nodes: any[] = [];
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
  const nodes: any[] = [];
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
  const nodes: any[] = [];
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
  const func = (leafTreeData, parentCode?: any) => {
    const arr: any[] = [];
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
