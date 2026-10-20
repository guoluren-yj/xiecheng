/*
 * Contact - 联系人信息
 * @Date: 2023-04-10 19:45:18
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Table, SecretField, TelField } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { dsDeleteData } from '@/routes/components/utils/utils';

const Contact = ({ dataSet, isEdit, custLoading, customizeTable, tableMaxHeight }) => {
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
      name: 'name',
      width: 150,
      renderer: isEdit
        ? null
        : ({ record, name }) => (
          <SecretField readOnly={!isEdit} record={record} name={name} displayOutput={!isEdit} />
          ),
    },
    {
      name: 'mail',
      width: 150,
      renderer: isEdit
        ? null
        : ({ record, name }) => (
          <SecretField readOnly={!isEdit} record={record} name={name} displayOutput={!isEdit} />
          ),
    },
    {
      name: 'mobilephone',
      width: 200,
      editor: false,
      renderer: ({ record, name }) =>
        isEdit ? (
          <TelField mode="secret" record={record} name={name} />
        ) : (
          <SecretField displayOutput record={record} name={name} tooltip="none" />
        ),
    },
    {
      name: 'contactType',
      width: 120,
    },
    {
      name: 'department',
      width: 150,
    },
    {
      name: 'position',
      width: 150,
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
  ].map(column => ({ editor: isEdit, ...column }));

  return customizeTable(
    {
      code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.CONTACT',
    },
    <Table
      rowHeight="auto"
      dataSet={dataSet}
      columns={columns}
      buttons={getButtons()}
      custLoading={custLoading}
      style={tableMaxHeight}
      selectionMode={isEdit ? 'rowbox' : 'none'}
    />
  );
};

export default Contact;
