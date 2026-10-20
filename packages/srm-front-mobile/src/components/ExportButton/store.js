import uuid from 'uuid/v4';
import intl from 'utils/intl';

export const PRIMARY_KEY = 'key';
export const PARENT_KEY = 'parentCode';
export const CHILDREN_KEY = 'children';
export const EXPAND_KEY = 'expand';
export const CHECK_KEY = 'isChecked';

/**
 * 将文档和分类结构转换为树形结构
 * @param {Array} documents - 文档数组（来自 res.content）
 * @returns {Array} 树形结构数组
 */
export const transformDocumentCategory = (documents) => {
  if (!Array.isArray(documents) || documents.length === 0) {
    return [];
  }

  return documents.map((doc) => {
    // 将文档转换为父节点
    const docNode = {
      documentId: doc.documentId,
      documentCode: doc.documentCode,
      documentName: doc.documentName,
      // 统一字段名以适配 treeToArr
      menuName: doc.documentName,
      menuCode: doc.documentCode,
      code: doc.documentCode, // 添加 code 字段以支持递归调用
      // 一级节点没有父节点
      parentCode: null,
      parentId: null,
      // 标记为文档节点
      nodeType: 'document',
    };

    // 如果有分类，转换为子节点
    if (doc.categories && Array.isArray(doc.categories) && doc.categories.length > 0) {
      docNode.categories = doc.categories.map((cat) => ({
        categoryId: cat.categoryId,
        categoryCode: cat.categoryCode,
        categoryName: cat.categoryName,
        // 统一字段名以适配 treeToArr
        menuName: cat.categoryName,
        menuCode: cat.categoryCode,
        code: cat.categoryCode, // 添加 code 字段以支持递归调用
        // 分类的父节点是文档
        parentCode: doc.documentCode,
        parentId: doc.documentId,
        // 标记为分类节点
        nodeType: 'category',
      }));
      // 将 categories 映射为 subMenus 以适配 treeToArr 的递归逻辑
      docNode.subMenus = docNode.categories;
    }

    return docNode;
  });
};

export const treeDS = () => ({
  idField: PRIMARY_KEY,
  expandField: EXPAND_KEY,
  checkField: CHECK_KEY,
  childrenField: CHILDREN_KEY,
  paging: false,
  fields: [
    { name: 'key', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'code', type: 'string' },
    { name: 'expand', type: 'boolean' },
    { name: 'isChecked', type: 'boolean' },
    { name: 'nodeType', type: 'string' },
    { name: 'documentId', type: 'number' },
    { name: 'documentCode', type: 'string' },
    { name: 'categoryId', type: 'number' },
    { name: 'categoryCode', type: 'string' },
  ],
});

export const treeToArr = (data) => {
  const arr = [];

  /**
   * 将树结构拍平为 Tree 组件需要的数据结构
   * @param {Array} _data 树节点数据
   * @param {string|null} parentCode 父节点编码
   */
  const _treeToArr = (_data, parentCode) => {
    _data.forEach((item) => {
      const {
        subMenus,
        groupList,
        units,
        categories,
        documentId,
        documentCode,
        documentName,
        categoryId,
        categoryCode,
        categoryName,
        ...rest
      } = item;
      const arrItem = {
        ...rest,
        name: rest.unitName || rest.groupName || rest.menuName,
        [PRIMARY_KEY]: rest.key || rest.unitCode || rest.groupCode || rest.menuCode,
        code: rest.code || rest.unitCode || rest.groupCode || rest.menuCode,
        [PARENT_KEY]: parentCode ?? rest.parentCode ?? null,
        documentId,
        documentCode,
        documentName,
        categoryId,
        categoryCode,
        categoryName,
        nodeType: rest.nodeType,
      };
      arr.push(arrItem);
      if (subMenus && subMenus.length > 0) {
        _treeToArr(subMenus, arrItem.code);
      }
      if (groupList && groupList.length > 0) {
        _treeToArr(groupList, arrItem.code);
      }
      if (units && units.length > 0) {
        _treeToArr(units, arrItem.groupCode);
      }
    });
  };
  _treeToArr(data);
  return arr;
};

/**
 * 将文档和分类结构转换为 Tree 组件直接使用的 children 结构
 * @param {Array} documents 文档数组
 * @returns {Array} 树形节点数组
 */
export const transformDocumentCategoryToTreeData = (documents) => {
  if (!Array.isArray(documents) || documents.length === 0) {
    return [];
  }

  const rootKey = `root_${Date.now()}`;
  const rootNode = {
    key: rootKey,
    name: intl.get('smbl.checkRules.view.title.allDocuments').d('所有流程单据'),
    code: 'ALL_DOCUMENTS',
    isChecked: false,
    expand: true,
    parentCode: null,
    parentKey: null,
    nodeType: 'document',
    [CHILDREN_KEY]: documents.map((doc) => {
      const { documentCode } = doc;
      const documentKey = uuid();
      const documentNode = {
        key: documentKey,
        documentId: doc.documentId,
        documentCode,
        documentName: doc.documentName,
        menuName: doc.documentName,
        menuCode: documentCode,
        code: documentCode,
        name: doc.documentName,
        isChecked: false,
        parentCode: 'ALL_DOCUMENTS',
        parentKey: rootKey,
        nodeType: 'document',
      };

      const categories = Array.isArray(doc.categories) ? doc.categories : [];
      if (categories.length > 0) {
        documentNode[CHILDREN_KEY] = categories.map((cat) => ({
          key: uuid(),
          categoryId: cat.categoryId,
          categoryCode: cat.categoryCode,
          categoryName: cat.categoryName,
          documentId: doc.documentId,
          documentCode,
          menuName: cat.categoryName,
          menuCode: cat.categoryCode,
          code: cat.categoryCode,
          name: cat.categoryName,
          isChecked: false,
          parentCode: documentCode,
          parentKey: documentKey,
          nodeType: 'category',
        }));
      }

      return documentNode;
    }),
  };

  return [rootNode];
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
  const _findLeftNode = (key) => {
    const leftNode = allData.filter((node) => node[PARENT_KEY] === key);
    if (leftNode.length > 0) {
      nodes.push(...leftNode);
      leftNode.forEach((item) => _findLeftNode(item[PRIMARY_KEY]));
    }
  };
  _findLeftNode(nodeKey);
  return nodes;
};

export const findParentNode = (allData, nodeKey) => {
  const nodes = [];
  const _findParentNode = (key) => {
    const leafNodes = allData.filter((node) => node[PRIMARY_KEY] === key);
    if (leafNodes.length > 0) {
      nodes.push(...leafNodes);
      leafNodes.forEach((item) => _findParentNode(item[PARENT_KEY]));
    }
  };
  _findParentNode(nodeKey);
  return nodes;
};

export const deDuplicationArr = (allData) => {
  const nodes = [];
  const keyMap = {};
  allData.forEach((item) => {
    const key = item[PRIMARY_KEY];
    if (!keyMap[key]) {
      nodes.push(item);
      keyMap[key] = true;
    }
  });
  return nodes;
};

export const transformTreeDataChildren = (treeData) => {
  const func = (leafTreeData, parentCode) => {
    const arr = [];
    leafTreeData.forEach((item) => {
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
