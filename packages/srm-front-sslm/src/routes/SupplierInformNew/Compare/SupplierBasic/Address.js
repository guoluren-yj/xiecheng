/*
 * Address - 地址信息
 * @Date: 2023-04-10 20:54:40
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Table } from 'choerodon-ui/pro';
import { renderStatus, handleExtTextRenderIntercept } from '@/routes/components/utils';

const Address = ({
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
      name: 'countryId',
      width: 150,
      displayField: 'countryName',
    },
    {
      name: 'regionPathName',
      width: 220,
    },
    {
      name: 'addressDetail',
      width: 200,
    },
    {
      name: 'postCode',
      width: 130,
    },
    {
      name: 'description',
      width: 200,
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
      rowHeight={30}
      dataSet={dataSet}
      columns={columns}
      selectionMode="none"
      style={tableMaxHeight}
      custLoading={custLoading}
    />
  );
};

export default Address;
