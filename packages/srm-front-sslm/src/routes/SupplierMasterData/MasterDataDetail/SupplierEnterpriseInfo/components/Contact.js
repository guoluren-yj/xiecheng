/*
 * Contact - 联系人
 * @Date: 2023-08-16 20:01:15
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useContext } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { yesOrNoRender, enableRender } from 'utils/renderer';
import { Context } from '@/routes/SupplierMasterData/Context';
import { getContactDS } from '../stores/getContactDS';

const customizeUnitCode = '';

const Contact = () => {
  const dataSet = useDataSet(() => getContactDS(), []);
  const context = useContext(Context);
  const {
    customizeTable,
    enterpriseBasicInfo: { contactList = [] } = {},
    tableMaxHeight,
  } = context;

  useEffect(() => {
    dataSet.loadData(contactList);
  });

  const columns = [
    {
      name: 'name',
      width: 100,
    },
    {
      name: 'gender',
      width: 60,
    },
    {
      name: 'mail',
      width: 180,
    },
    {
      name: 'mobilephone',
      width: 140,
    },
    {
      name: 'idTypeMeaning',
      width: 100,
    },
    {
      name: 'idNum',
      width: 150,
    },
    {
      name: 'contactTypeMeaning',
      width: 100,
    },
    {
      name: 'department',
      width: 100,
    },
    {
      name: 'position',
      width: 100,
    },
    {
      name: 'telephone',
      width: 150,
    },
    {
      name: 'description',
      width: 150,
    },
    {
      name: 'defaultFlag',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'enabledFlag',
      width: 80,
      renderer: ({ value }) => enableRender(value),
    },
  ];
  return customizeTable(
    {
      code: customizeUnitCode,
    },
    <Table dataSet={dataSet} columns={columns} style={{ maxHeight: tableMaxHeight }} />
  );
};

export default Contact;
