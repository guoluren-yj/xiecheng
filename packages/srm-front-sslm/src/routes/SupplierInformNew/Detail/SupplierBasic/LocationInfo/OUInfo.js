/*
 * OUInfo - OU层信息
 * @Date: 2023-04-12 17:26:12
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Table, SecretField } from 'choerodon-ui/pro';
import { dateRender } from 'utils/renderer';
import { dsDeleteData } from '@/routes/components/utils/utils';

const OUInfo = ({ dataSet, isEdit, custLoading, customizeTable }) => {
  const getButtons = useCallback(() => {
    return isEdit
      ? [
          'add',
          [
            'delete',
            {
              onClick: () => dsDeleteData({ dataSet }),
            },
          ],
        ]
      : [];
  }, [isEdit, dataSet]);

  const columns = [
    {
      width: 140,
      name: 'ouId',
    },
    {
      width: 200,
      name: 'billPeriod',
    },
    {
      width: 120,
      name: 'typeCode',
    },
    {
      width: 120,
      name: 'ticketDay',
    },
    {
      width: 160,
      name: 'termCode',
    },
    {
      width: 120,
      name: 'bankCode',
    },
    {
      width: 160,
      name: 'bankName',
      editor: false,
    },
    {
      width: 160,
      name: 'bankFirm',
      editor: false,
    },
    {
      width: 160,
      name: 'bankBranchName',
      editor: false,
    },
    {
      width: 160,
      name: 'bankAccountName',
      editor: false,
    },
    {
      width: 160,
      name: 'bankAccountNum',
      editor: <SecretField readOnly displayOutput />,
    },
    {
      width: 120,
      name: 'taxId',
    },
    {
      width: 120,
      name: 'currencyCode',
    },
    {
      width: 120,
      name: 'creationDate',
      editor: false,
      renderer: ({ value }) => dateRender(value),
    },
    {
      width: 130,
      name: 'expirationDate',
      renderer: ({ value }) => dateRender(value),
    },
  ].map(column => ({ editor: isEdit, ...column }));

  return customizeTable(
    {
      code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OU',
    },
    <Table
      columns={columns}
      dataSet={dataSet}
      buttons={getButtons()}
      style={{ maxHeight: 430 }}
      custLoading={custLoading}
      selectionMode={isEdit ? 'rowbox' : 'none'}
    />
  );
};

export default OUInfo;
