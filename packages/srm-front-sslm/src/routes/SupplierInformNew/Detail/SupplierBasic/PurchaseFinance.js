/*
 * @Date: 2023-04-12 14:48:30
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { useObserver } from 'mobx-react-lite';
import React, { useCallback, useState, useEffect } from 'react';
import { Form, Table, CheckBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import FormField from '@/routes/components/FormField';
import { dsDeleteData } from '@/routes/components/utils/utils';
import { TopSection, SecondSection } from '_components/Section';

const PurchaseFinance = ({
  isEdit,
  isRead,
  changeLevel,
  custLoading,
  customizeForm,
  customizeTable,
  supplierInformRemote,
  dataSet: [{ dataSet: purchaseHeaderDs }, { dataSet: purchaseLineDs }],
}) => {
  const [headerFrozenChecked, setHeaderFrozenChecked] = useState(false);

  const lineDataLength = useObserver(() => purchaseLineDs.toData().length);

  useEffect(() => {
    if (lineDataLength) {
      const allFrozenFlag = purchaseLineDs.some(record =>
        [0, undefined].includes(record.get('frozenFlag'))
      );
      setHeaderFrozenChecked(!allFrozenFlag);
    }
  }, [lineDataLength]);

  // 头采购冻结回调
  const handleHeaderFrozen = useCallback((value, dataSet) => {
    dataSet.forEach(record => {
      record.set('frozenFlag', value ? 1 : 0);
    });
    setHeaderFrozenChecked(value);
  }, []);

  // 行采购冻结回调
  const handleLineFrozen = useCallback(() => {
    const allFrozenFlag = purchaseLineDs.some(record => record.get('frozenFlag') === 0);
    setHeaderFrozenChecked(!allFrozenFlag);
  }, []);

  const getButtons = useCallback(() => {
    const _buttons = isEdit
      ? [
          'add',
          [
            'delete',
            {
              onClick: () => dsDeleteData({ dataSet: purchaseLineDs }),
            },
          ],
        ]
      : [];
    return supplierInformRemote
      ? supplierInformRemote.process(
          'SSLM_SUPPLIER_INFORM_NEW_SUPPLIER_BASIC_PURCHASE_INFO_LINE_BUTTONS',
          _buttons,
          { purchaseLineDs }
        )
      : _buttons;
  }, [isEdit, purchaseLineDs, supplierInformRemote]);

  const columns = [
    {
      name: 'organizationCode',
      width: 150,
    },
    {
      name: 'organizationName',
      width: 120,
      editor: false,
    },
    {
      name: 'purchaseAgentId',
      width: 150,
    },
    {
      name: 'termId',
      width: 150,
    },
    {
      name: 'typeCode',
      width: 160,
    },
    {
      name: 'tradeTerms',
      width: 160,
    },
    {
      name: 'tradeTermsSite',
      width: 160,
    },
    {
      name: 'currencyCode',
      width: 150,
    },
    {
      name: 'reconciliationAccount',
      width: 150,
    },
    {
      name: 'sortNumber',
      width: 150,
    },
    {
      name: 'frozenFlag',
      width: 120,
      editor: isEdit && <CheckBox style={{ marginLeft: 56 }} onChange={handleLineFrozen} />,
      header: ({ dataSet }) => (
        <span>
          {intl.get(`sslm.supplierInform.model.purchase.frozenFlag`).d('采购冻结')}
          {isEdit ? (
            <CheckBox
              style={{ marginLeft: 10 }}
              checked={headerFrozenChecked}
              onChange={value => handleHeaderFrozen(value, dataSet)}
            />
          ) : null}
        </span>
      ),
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ].map(column => ({ editor: isEdit, ...column }));

  return (
    <TopSection className="no-top-section">
      <SecondSection
        title={intl.get('sslm.common.view.title.purchaseHeaderInfo').d('采购财务头信息')}
      >
        {customizeForm(
          {
            code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_HEAD',
            readOnly: isRead,
          },
          <Form
            columns={3}
            dataSet={purchaseHeaderDs}
            custLoading={custLoading}
            labelLayout={isEdit ? 'float' : 'vertical'}
            style={{ marginBottom: 32 }}
            useWidthPercent
            className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
          >
            <FormField isEdit={isEdit} name="programmeGroups" componentType="SELECT" />
            <FormField isEdit={isEdit} name="schemeGroup" />
            <FormField isEdit={isEdit} name="accountGroup" componentType="LOV" />
            <FormField isEdit={isEdit} name="reconciliationAccount" componentType="LOV" />
            <FormField
              isEdit={isEdit}
              name="ouId"
              componentType="LOV"
              help={
                isEdit &&
                changeLevel === 'GROUP' &&
                intl
                  .get('sslm.supplierInform.model.supplierInform.interMessage')
                  .d('变更后此ERP公司代码将更新至集团下所有公司。')
              }
            />
            <FormField isEdit={isEdit} name="termId" componentType="LOV" />
            <FormField
              isEdit={isEdit}
              name="frozenFlag"
              componentType="CheckBox"
              renderer={({ value }) => yesOrNoRender(value)}
            />
            <FormField isEdit={isEdit} name="paymentFrozen" componentType="SELECT" />
          </Form>
        )}
      </SecondSection>
      <SecondSection
        title={intl.get('sslm.common.view.title.purchaseLineInfo').d('采购财务行信息')}
      >
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_LINE',
          },
          <Table
            columns={columns}
            dataSet={purchaseLineDs}
            buttons={getButtons()}
            style={{ maxHeight: 430 }}
            custLoading={custLoading}
            selectionMode={isEdit ? 'rowbox' : 'none'}
          />
        )}
      </SecondSection>
    </TopSection>
  );
};

export default PurchaseFinance;
