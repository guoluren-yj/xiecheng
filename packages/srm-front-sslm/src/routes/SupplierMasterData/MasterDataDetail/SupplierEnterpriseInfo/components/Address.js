/*
 * Address - 地址
 * @Date: 2023-08-16 20:57:27
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useContext } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { Context } from '@/routes/SupplierMasterData/Context';
import { getAddressDS } from '../stores/getAddressDS';

const customizeUnitCode = '';

const Address = () => {
  const dataSet = useDataSet(() => getAddressDS(), []);
  const context = useContext(Context);
  const {
    enterpriseBasicInfo: { addressList = [] } = {},
    customizeTable,
    tableMaxHeight,
  } = context;

  useEffect(() => {
    dataSet.loadData(addressList);
  });

  const columns = [
    {
      name: 'countryName',
      width: 120,
    },
    {
      name: 'regionName',
      width: 200,
      renderer: ({ record }) => record && record.get('regionPathName'),
    },
    {
      name: 'addressDetail',
    },
    {
      name: 'postCode',
      width: 100,
    },
    {
      name: 'description',
      width: 220,
    },
    {
      name: 'enabledFlag',
      width: 80,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];

  return customizeTable(
    {
      code: customizeUnitCode,
    },
    <Table dataSet={dataSet} columns={columns} style={{ maxHeight: tableMaxHeight }} />
  );
};

export default Address;
