/*
 * SupplierClassify - 供应商分类
 * @Date: 2023-04-12 10:27:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Table } from 'choerodon-ui/pro';
import { renderStatus, handleExtTextRenderIntercept } from '@/routes/components/utils';

const SupplierClassify = ({
  dataSet,
  custLoading,
  customizeTable,
  tableMaxHeight,
  handleCompareRender,
  customizeUnitCode,
  showUpdateFlag,
}) => {
  const columns = [
    showUpdateFlag && {
      type: 'select',
      name: 'objectFlag',
      renderer: renderStatus,
    },
    {
      name: 'categoryCode',
      displayField: 'categoryCode',
    },
    {
      name: 'categoryDescription',
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      width: 80,
    },
  ]
    .filter(Boolean)
    .map(column => {
      const { type, displayField, ...others } = column;
      return {
        renderer: ({ value, record, name }) =>
          handleCompareRender({ value, record, name, type, displayField }),
        ...others,
      };
    });

  return customizeTable(
    {
      code: customizeUnitCode,
      readOnly: true,
      extTextRenderIntercept: handleExtTextRenderIntercept,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      style={tableMaxHeight}
      custLoading={custLoading}
      selectionMode="none"
    />
  );
};

export default SupplierClassify;
