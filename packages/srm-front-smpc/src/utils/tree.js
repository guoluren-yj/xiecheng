import React from 'react';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import CustomTree from '@/components/CustomTree';
import { fetchUnits, fetchRegions, fetchCategorys, fetchCatalogs } from '@/services/api';

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: false,
  destroyOnClose: true,
  drawer: true,
  okText: intl.get('hzero.common.button.save').d('保存'),
};

// 右侧树
function openTree({
  name,
  title,
  allText,
  allField,
  idField,
  textField,
  record,
  parentField,
  quickCheck = false,
  readOnly,
  nodeType,
  whole,
  defaultValue,
  placeholder,
  compose = {},
  disableData = [],
  api = (e) => e,
  checkValueConfig,
  hiddenNode = () => false,
  childField = 'children',
  onSave,
}) {
  let checkedNodes = defaultValue || record.get(name) || [];
  const all = {
    [idField]: 'ALL',
    [textField]: allText,
  };

  const children = (
    <CustomTree
      api={api}
      quickCheck={quickCheck}
      checkValueConfig={checkValueConfig}
      all={all}
      whole={whole}
      idField={idField}
      parentField={parentField}
      textField={textField}
      childField={childField}
      compose={compose}
      readOnly={readOnly}
      disableData={disableData}
      onChange={(k) => {
        checkedNodes = k;
      }}
      placeholder={placeholder}
      storeName={`${name}_tree`}
      initNodes={checkedNodes}
      hiddenNode={hiddenNode}
    />
  );
  const okFn = () => {
    if (nodeType === 'last') {
      const lastCheckData = checkedNodes.filter((f) => !f[childField]);
      if (onSave) {
        return onSave(lastCheckData);
      }
      record.set(name, lastCheckData);
      return true;
    }
    const isAll = checkedNodes.find((s) => s[idField] === 'ALL');
    if (isAll) {
      record.set(name, [isAll]);
      record.set(allField, 1);
      return true;
    }
    const delData = [];
    // 删除掉childField
    const mapCheckNodes = checkedNodes.map((m) => {
      // 如果该节点的父节点也存在，则删除该节点
      if (checkedNodes.some((s) => s[idField] === m[parentField])) {
        delData.push(m);
      }
      return { ...m, [childField]: undefined };
    });
    const checkData = mapCheckNodes.filter((f) => !delData.some((s) => s[idField] === f[idField]));
    record.set(name, checkData);
    record.set(allField, 0);
  };
  Modal.open({
    title,
    ...modalProps,
    style: { width: 380 },
    onOk: okFn,
    afterClose: () => {
      checkedNodes = [];
    },
    children,
    footer: readOnly ? null : undefined,
  });
}

// name record
export function openUnitTree(params) {
  openTree({
    idField: 'unitId',
    allField: 'allUnitFlag',
    textField: 'unitName',
    parentField: 'parentUnitId',
    quickCheck: true,
    compose: { composeKey: 'unitCodeName', composeFields: ['unitCode', 'unitName'] },
    title: intl.get('smpc.product.view.assignOrg').d('分配组织'),
    allText: intl.get('smpc.product.model.allOrg').d('所有组织'),
    placeholder: intl.get('smpc.product.model.inputNameOrCode').d('请输入名称、编码查询'),
    api: fetchUnits,
    ...params,
  });
}

export function openRegionTree(params) {
  openTree({
    idField: 'regionCode',
    allField: 'allRegionFlag',
    textField: 'regionName',
    parentField: 'parentRegionCode',
    title: intl.get('smpc.product.view.assignRegion').d('分配区域'),
    allText: intl.get('smpc.product.model.allRegion').d('所有区域'),
    placeholder: intl.get('smpc.product.model.inputName').d('输入名称'),
    hiddenNode: (node) => node.regionCode === 'N/A' || node.regionName === 'N/A',
    api: fetchRegions,
    ...params,
  });
}

export function openCategoryTree(params) {
  openTree({
    idField: 'categoryId',
    allField: 'allCategoryFlag',
    textField: 'categoryName',
    parentField: 'parentId',
    compose: { composeKey: 'categoryCodeName', composeFields: ['categoryCode', 'categoryName'] },
    title: intl.get('sagm.common.view.assignCategory').d('分配分类'),
    allText: intl.get('sagm.common.model.allCategory').d('所有分类'),
    placeholder: intl.get('smpc.product.model.inputNameOrCode').d('请输入名称、编码查询'),
    api: fetchCategorys,
    ...params,
  });
}

export function openCatalogTree(params) {
  openTree({
    idField: 'catalogId',
    allField: 'allCatalogFlag',
    textField: 'catalogName',
    childField: 'subCatalogs',
    parentField: 'parentCatalogId',
    compose: { composeKey: 'catalogCodeName', composeFields: ['catalogCode', 'catalogName'] },
    title: intl.get('sagm.common.view.assignCatalog').d('分配目录'),
    allText: intl.get('sagm.common.model.allCatalog').d('所有目录'),
    placeholder: intl.get('smpc.product.model.inputNameOrCode').d('请输入名称、编码查询'),
    api: fetchCatalogs,
    ...params,
  });
}
