import { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";

export const PRIMARY_FIELD = '_id';
export const PARENT_FIELD = '_parentId';
export const CHILDREN_FIELD = '_children';
export const EXPAND_FIELD = '_expand';
export const CHECK_FIELD = '_isChecked';
export const TYPE_FIELD = '_type';
export const TEXT_FIELD = '_name';

export interface IDirectory {
  directoryCode: string;
  directoryId: number| string;
  directoryName: string;
  menuGroupCode: string;
  linkCode: string;
  parentLinkCode: string;
  printDocumentList: IDocument[];
}

export interface IDocument {
  dirId: number | string; 
  docId: number | string; 
  docCode: string;
  docName: string; 
  printReportList: IPrintReport[];
}

export interface IPrintReport {
  docId: number | string;
  reportId: number | string;
  reportCode: string;
  reportName: string;
}

export interface ITreeNodeData {
  [PRIMARY_FIELD]: number | string;
  [PARENT_FIELD]: number | string;
  [TYPE_FIELD]: TreeNodeType;
  [TEXT_FIELD]: string;
  reportCode?: string;
  reportId?: number | string;
}

export enum TreeNodeType {
  DIRECTORY = 'DIRECTORY',
  DOCUMENT = 'DOCUMENT',
  REPORT = 'REPORT',
}

export const treeDS = () => ({
  idField: PRIMARY_FIELD,
  parentField: PARENT_FIELD,
  expandField: EXPAND_FIELD,
  checkField: CHECK_FIELD,
  paging: false,
  fields: [
    { name: 'menuName', type: 'string' },
    { name: 'expand', type: 'boolean' },
  ],
} as DataSetProps);

export const findRelatedNode = (allData, nodeKey) => {
  const nodes: ITreeNodeData[] = [];
  const leafNodes = findLeafNode(allData, nodeKey);
  const parentNodes = findParentNode(allData, nodeKey);
  nodes.push(...leafNodes, ...parentNodes);
  return nodes;
};

// 查询子级节点
export const findLeafNode = (allData: ITreeNodeData[], nodeKey: number | string) => {
  const nodes: ITreeNodeData[] = [];
  const _findLeftNode = key => {
    const leftNode = allData.filter(node => node[PARENT_FIELD] === key);
    if (leftNode.length > 0) {
      nodes.push(...leftNode);
      leftNode.forEach(item => _findLeftNode(item[PRIMARY_FIELD]));
    }
  };
  _findLeftNode(nodeKey);
  return nodes;
};

// 查找父级节点
export const findParentNode = (allData: ITreeNodeData[], nodeKey:  number | string) => {
  const nodes: ITreeNodeData[] = [];
  const _findParentNode = key => {
    const leafNodes = allData.filter(node => node[PRIMARY_FIELD] === key);
    if (leafNodes.length > 0) {
      nodes.push(...leafNodes);
      leafNodes.forEach(item => _findParentNode(item[PARENT_FIELD]));
    }
  };
  _findParentNode(nodeKey);
  return nodes;
};

// 数组根据主键去重
export const deDuplicationArr = (allData: ITreeNodeData[]) => {
  const nodes: ITreeNodeData[] = [];
  const keyMap = {};
  allData.forEach(item => {
    const key = item[PRIMARY_FIELD];
    if (!keyMap[key]) {
      nodes.push(item);
      keyMap[key] = true;
    }
  });
  return nodes;
};
