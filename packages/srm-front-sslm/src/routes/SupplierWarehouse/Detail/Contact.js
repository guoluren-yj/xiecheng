/**
 * Contact - 联系人
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Table, TextField } from 'choerodon-ui/pro';

import { yesOrNoRender } from 'utils/renderer';

const Contact = ({ dataSet, isEdit, custLoading, customizeTable, code = '', buttonCode = '' }) => {
  const columns = [
    {
      name: 'name',
      width: 150,
      editor: isEdit,
    },
    // {
    //   name: 'gender',
    //   width: 100,
    //   editor: isEdit,
    // },
    {
      name: 'idType',
      width: 150,
      editor: isEdit,
    },
    {
      name: 'idNumber',
      width: 150,
      editor: isEdit && <TextField restrict="a-zA-Z0-9-_" />,
    },
    {
      name: 'department',
      width: 150,
      editor: isEdit,
    },
    {
      name: 'position',
      width: 150,
      editor: isEdit,
    },
    {
      name: 'contactType',
      editor: isEdit,
      width: 150,
    },
    {
      name: 'mobilephone',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'mail',
      editor: isEdit,
      width: 200,
    },
    {
      name: 'officePhone',
      editor: isEdit && <TextField restrict="a-zA-Z0-9-_" />,
      width: 150,
    },
    {
      name: 'defaultFlag',
      editor: isEdit,
      width: 150,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'remark',
      width: 150,
      editor: isEdit,
    },
    {
      name: 'enabledFlag',
      width: 100,
      editor: isEdit,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];
  const buttons = isEdit ? ['add', 'delete'] : [];
  return customizeTable(
    {
      code, // 单元编码，必传
      readOnly: !isEdit,
      buttonCode,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      custLoading={custLoading}
      virtualCell={false}
    />
  );
};

export default Contact;
