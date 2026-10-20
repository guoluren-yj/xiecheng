/*
 * Contact - 联系人
 * @Date: 2023-08-16 20:01:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useContext } from 'react';
import { Table, useDataSet, SecretField } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { Context } from '@/routes/SupplierDetailNew/Context';

import { getContactDS } from '../stores/getContactDS';

const customizeUnitCode = 'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.CONTACTS';

const Contact = () => {
  const dataSet = useDataSet(() => getContactDS(), []);
  const context = useContext(Context);
  const { customizeTable, contactList = [], tableMaxHeight } = context;

  useEffect(() => {
    dataSet.loadData(contactList);
  });

  const columns = [
    {
      name: 'name',
      width: 100,
      renderer: ({ record, name }) => (
        <SecretField displayOutput record={record} name={name} tooltip={false} />
      ),
    },
    {
      name: 'gender',
      width: 60,
    },
    {
      name: 'mail',
      width: 180,
      renderer: ({ record, name }) => (
        <SecretField displayOutput record={record} name={name} tooltip={false} />
      ),
    },
    {
      name: 'mobilephone',
      width: 150,
      renderer: ({ record, name }) => (
        <SecretField displayOutput record={record} name={name} tooltip="none" />
      ),
    },
    {
      name: 'idTypeMeaning',
      width: 100,
    },
    {
      name: 'idNum',
      width: 150,
      renderer: ({ record, name }) => (
        <SecretField displayOutput record={record} name={name} tooltip={false} />
      ),
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

export default Contact;
