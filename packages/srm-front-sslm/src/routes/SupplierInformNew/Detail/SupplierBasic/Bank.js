/*
 * Bank - 银行信息
 * @Date: 2023-04-11 09:10:12
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Table, SecretField } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { dsDeleteData } from '@/routes/components/utils/utils';

const Bank = ({
  dataSet,
  isEdit,
  setLoading,
  custLoading,
  customizeTable,
  tableMaxHeight,
  headerInfo,
  headerInfo: { supplierCompanyName } = {},
  supplierInformRemote,
}) => {
  const getButtons = useCallback(() => {
    const btns = isEdit
      ? [
          [
            'add',
            {
              afterClick: () => {
                if (dataSet.current) {
                  dataSet.current.set({
                    bankAccountName: supplierCompanyName,
                  });
                }
              },
            },
          ],
          [
            'delete',
            {
              onClick: () => dsDeleteData({ dataSet }),
            },
          ],
        ]
      : [];
    const buttons = supplierInformRemote
      ? supplierInformRemote.process('SSLM_SUPPLIER_INFORM_NEW_SUPPLIER_BASIC_BANK_BTNS', btns, {
          isEdit,
          dataSet,
          headerInfo,
          setLoading,
        })
      : btns;
    return buttons;
  }, [isEdit, dataSet, headerInfo]);

  const columns = [
    {
      name: 'bankCountryId',
      width: 150,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'bankCode',
      width: 150,
    },
    {
      name: 'bankName',
      width: 180,
    },
    {
      name: 'bankFirm',
      width: 200,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'bankBranchName',
      width: 300,
    },
    {
      name: 'bankAccountName',
      width: 300,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'bankAccountNum',
      width: 250,
      editor: record => (
        <SecretField
          readOnly={!isEdit || record.get('extSourceAccountFlag')}
          displayOutput={!isEdit || record.get('extSourceAccountFlag')}
        />
      ),
    },
    {
      name: 'intlBankAccountNum',
      width: 250,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'accountNature',
      width: 160,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'accountPurpose',
      width: 120,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'currencyId',
      width: 140,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'bankIdentifyCodeType',
      width: 120,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'bankIdentifyCode',
      width: 200,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'paymentType',
      width: 150,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
    {
      name: 'enabledFlag',
      width: 80,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'masterFlag',
      width: 100,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'remark',
      width: 200,
      editor: record => isEdit && !record.get('extSourceAccountFlag'),
    },
  ];

  const newColumns = supplierInformRemote
    ? supplierInformRemote.process('SSLM_SUPPLIER_INFORM_NEW_PLATFORM_BANK_INFO_COLUMNS', columns, {
        headerInfo,
      })
    : columns;

  return customizeTable(
    {
      code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BANK',
    },
    <Table
      dataSet={dataSet}
      columns={newColumns}
      buttons={getButtons()}
      custLoading={custLoading}
      style={tableMaxHeight}
      selectionMode={isEdit ? 'rowbox' : 'none'}
    />
  );
};

export default Bank;
