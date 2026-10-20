import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import PageTreeTable from './PageTreeTable';

// 通用
function openTreeModal({ title, drawer = true, columns, treeConfig, ...otherProps }) {
  const tableStyle = { maxHeight: drawer ? 'calc(100vh - 300px)' : 'calc(100vh - 400px)' };
  return Modal.open({
    title,
    drawer,
    closable: !drawer,
    style: { width: 742 },
    children: (
      <PageTreeTable style={tableStyle} {...otherProps} treeConfig={treeConfig} columns={columns} />
    ),
  });
}

// 目录
export function openCatalog(props = {}) {
  const treeConfig = {
    idField: 'catalogId',
    parentField: 'parentCatalogId',
    childrenField: 'subCatalogs',
    url: 'v1/{organizationId}/catalogs/less',
    subUrl: 'v1/{organizationId}/catalogs/sub-catalog/less/{catalogId}',
  };
  const columns = [
    {
      name: 'catalogCode',
      isQuery: true,
      label: intl.get('small.common.model.catalogCode').d('目录编码'),
    },
    {
      name: 'catalogName',
      isQuery: true,
      label: intl.get('small.common.model.catalogName').d('目录名称'),
    },
    {
      name: 'level',
      width: 90,
      align: 'right',
      label: intl.get('small.common.model.catalogLevel').d('目录层级'),
    },
  ];
  openTreeModal({
    ...props,
    columns,
    treeConfig,
    title: intl.get('small.common.model.mallCatalog').d('商城目录'),
  });
}

// 分类
export function openCategory(props = {}) {
  const treeConfig = {
    idField: 'categoryId',
    url: 'v1/{organizationId}/category/page-tree',
    subUrl: 'v1/{organizationId}/category/page-tree/{categoryId}',
  };
  const columns = [
    {
      name: 'categoryCode',
      isQuery: true,
      label: intl.get('small.common.view.product.categoryCode').d('分类编码'),
    },
    {
      name: 'categoryName',
      isQuery: true,
      label: intl.get('small.common.view.product.categoryName').d('分类名称'),
    },
  ];
  openTreeModal({
    ...props,
    columns,
    treeConfig,
    title: intl.get(`small.common.model.product.category`).d('商品分类'),
  });
}
