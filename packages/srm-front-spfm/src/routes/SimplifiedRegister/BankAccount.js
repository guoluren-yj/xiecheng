/**
 * BankAccount - 银行账户
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect, useCallback } from 'react';
import { Table, SecretField } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

const BankAccount = ({ dataSet, isEdit, companyId, defaultBankInfo, legalDS }) => {
  useEffect(() => {
    if (companyId) {
      dataSet.setQueryParameter('companyId', companyId);
      dataSet.query();
    }
  }, [companyId]);

  const handleAdd = useCallback(() => {
    const legalData = legalDS.current.toData() || {};
    const { domesticForeignRelation, companyName } = legalData;
    const { countryId, countryName } = defaultBankInfo;
    const currentRow = dataSet.current || {};
    if (domesticForeignRelation === '1') {
      currentRow.set({
        bankCountryObj: {
          countryId,
          countryName,
        },
        bankAccountName: companyName,
      });
    }
  }, []);

  const columns = [
    {
      name: 'bankCountryObj',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'bankCode',
      width: 200,
    },
    {
      name: 'bankName',
      width: 200,
    },
    {
      name: 'bankFirmObj',
      width: 200,
      editor: isEdit,
      help: intl.get("sslm.common.view.bank.bankFirmHelp").d('若输入查询条件后检索不到对应分行，请尝试输入分行完整全称、准确的联行行号或其中连续的关键字进行检索。例如「中国工商银行股份有限公司上海市大木桥路支行」可输入「大木桥」，避免输入「大桥或工行大木桥」。'),
      showHelp: isEdit ? 'tooltip' : 'none',
    },
    {
      name: 'bankBranchName',
      width: 200,
    },
    {
      name: 'bankAccountName',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'bankAccountNum',
      width: 200,
      editor: <SecretField readOnly={!isEdit} />,
    },
    {
      name: 'enabledFlag',
      width: 100,
      editor: isEdit,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'masterFlag',
      width: 100,
      editor: isEdit,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'remark',
      width: 200,
      editor: isEdit,
    },
  ];
  const buttons = isEdit
    ? [
        ['add', { afterClick: handleAdd }],
        [
          'delete',
          {
            onClick: () =>
              dataSet.delete(dataSet.selected, {
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: intl
                  .get('spfm.supplierRegister.view.message.deleteConfirm')
                  .d('确认删除选中行？'),
              }),
          },
        ],
      ]
    : [];
  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      selectionMode={isEdit ? 'rowbox' : 'click'}
    />
  );
};

export default BankAccount;
