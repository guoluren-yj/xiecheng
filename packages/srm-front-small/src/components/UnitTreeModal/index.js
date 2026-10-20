import React from 'react';
import { Modal, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import CustomTree from './CustomTree';
import { fetchUnits, fetchRegions, fetchCategorys, fetchCatalogs } from './api';

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: false,
  destroyOnClose: true,
  drawer: true,
};


// 右侧树
function openTree({
  disabled,
  name,
  title,
  allText,
  allField,
  idField,
  textField,
  record,
  parentField,
  readOnly,
  nodeType,
  whole,
  placeholder,
  compose = {},
  disableData = [],
  api = (e) => e,
  childField = 'children',
  dataStoreKey,
  okCallBack = (e) => e,
  siggle,
  expands,
  alertProps,
}) {
  let checkedNodes = record.get(name) || [];
  const all = {
    [idField]: 'ALL',
    [textField]: allText,
  };
  const children = (
    <CustomTree
      expands={expands}
      disabled={disabled}
      api={api}
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
      storeName={`${dataStoreKey || name}_tree`}
      initNodes={checkedNodes}
      siggle={siggle}
      alertProps={alertProps}
    />
  );
  const okFn = () => {
    if (nodeType === 'last') {
      const lastCheckData = checkedNodes.filter((f) => !f[childField]);
      record.set(name, lastCheckData);
      return true;
    }

    const delData = [];
    checkedNodes.forEach((f) => {
      // 如果该节点的父节点也存在，则删除该节点
      if (checkedNodes.some((s) => s[idField] === f[parentField])) {
        delData.push(f);
      }
    });
    const checkData = checkedNodes.filter((f) => !delData.some((s) => s[idField] === f[idField]));
    const isAll = checkedNodes.find((s) => s[idField] === 'ALL');
    if (isAll) {
      record.set(name, [isAll]);
      record.set(allField, 1);
      okCallBack({ isAll, checkData: checkedNodes });
      return true;
    }
    record.set(name, checkData);
    record.set(allField, 0);
    okCallBack({ isAll, checkData });
  };
  const modalObj = {
    title,
    ...modalProps,
    style: { width: 380 },
    onOk: okFn,
    afterClose: () => {
      checkedNodes = [];
    },
    children,
  };
  if (readOnly) {
    modalObj.footer = [
      <Button
        color="primary"
        onClick={() => modal.close()}
      >
        {intl.get('small.common.model.close').d('关闭')}
      </Button>,
    ];
  }
  const modal = Modal.open(modalObj);
}

// name record
export function openUnitTree(params) {
  openTree({
    idField: 'unitId',
    allField: 'allUnitFlag',
    textField: 'unitName',
    parentField: 'parentUnitId',
    compose: { composeKey: 'unitCodeName', composeFields: ['unitCode', 'unitName'] },
    title: intl.get('small.common.view.assignOrg').d('分配组织'),
    allText: intl.get('small.common.model.allOrg').d('所有组织'),
    placeholder: intl.get('small.common.model.inputNameOrCode').d('输入名称或编码'),
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
    title: intl.get('small.common.view.assignRegion').d('分配区域'),
    allText: intl.get('small.common.model.allRegion').d('所有区域'),
    placeholder: intl.get('small.common.model.inputName').d('输入名称'),
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
    title: intl.get('small.common.view.assignCategory').d('分配分类'),
    allText: intl.get('small.common.model.allCategory').d('所有分类'),
    placeholder: intl.get('small.common.model.inputNameOrCode').d('输入名称或编码'),
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
    title: intl.get('small.common.view.assignCatalog').d('分配目录'),
    allText: intl.get('small.common.model.allCatalog').d('所有目录'),
    placeholder: intl.get('small.common.model.inputNameOrCode').d('输入名称或编码'),
    api: fetchCatalogs,
    ...params,
  });
}
