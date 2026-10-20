/*
 * @Date: 2022-12-09 13:53:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { useObserver } from 'mobx-react-lite';
import { Form, Table, CheckBox } from 'choerodon-ui/pro';
import React, { Fragment, useMemo, useCallback, useState, useEffect } from 'react';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { TopSection, SecondSection } from '_components/Section';

import FormField from '@/routes/components/FormField';
import { c7nTableMaxHeight } from '@/routes/components/utils';

const PurchaseInfo = ({
  isEdit,
  purchaseHeaderDS,
  purchaseLineDS,
  custLoading,
  customizeForm,
  customizeTable,
  headerCustCode,
  lineCustCode,
}) => {
  const [headerFrozenChecked, setHeaderFrozenChecked] = useState(false);

  const lineDataLength = useObserver(() => purchaseLineDS.toData().length);
  const dimensionCode = purchaseHeaderDS?.parent?.current?.get('dimensionCode');

  useEffect(() => {
    if (lineDataLength) {
      const allFrozenFlag = purchaseLineDS.some(record =>
        [0, undefined].includes(record.get('frozenFlag'))
      );
      setHeaderFrozenChecked(!allFrozenFlag);
    }
  }, [lineDataLength]);

  useEffect(() => {
    purchaseLineDS.setQueryParameter('customizeUnitCode', lineCustCode);
    purchaseHeaderDS.setQueryParameter('customizeUnitCode', headerCustCode);
    purchaseLineDS.query();
    purchaseHeaderDS.query();
  }, [lineCustCode, headerCustCode]);

  // 头采购冻结回调
  const handleHeaderFrozen = useCallback((value, dataSet) => {
    dataSet.forEach(record => {
      record.set('frozenFlag', value ? 1 : 0);
    });
    setHeaderFrozenChecked(value);
  }, []);

  // 行采购冻结回调
  const handleLineFrozen = useCallback(() => {
    const allFrozenFlag = purchaseLineDS.some(record => record.get('frozenFlag') === 0);
    setHeaderFrozenChecked(!allFrozenFlag);
  }, []);

  const columns = useMemo(() => {
    return [
      {
        name: 'purchaseOrgId',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'organizationName',
        width: 150,
      },
      {
        name: 'purchaseAgentId',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'termId',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'typeCode',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'tradeTerms',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'tradeTermsSite',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'currencyCode',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'reconciliationAccount',
        width: 150,
        editor: isEdit,
      },
      {
        name: 'sortNumber',
        width: 120,
        editor: isEdit,
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
        renderer: ({ value }) => yesOrNoRender(value) || '-',
      },
    ];
  }, [headerFrozenChecked, isEdit]);

  return (
    <Fragment>
      <TopSection className="purchase-wrap">
        <SecondSection
          title={intl.get('sslm.common.view.title.purchaseHeaderInfo').d('采购财务头信息')}
        >
          {customizeForm(
            {
              code: headerCustCode,
            },
            <Form
              columns={3}
              useWidthPercent
              dataSet={purchaseHeaderDS}
              style={{ marginBottom: 32 }}
              labelLayout={isEdit ? 'float' : 'vertical'}
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
                  dimensionCode === 'GROUP' &&
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
                renderer={({ value }) => yesOrNoRender(value) || '-'}
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
              code: lineCustCode,
            },
            <Table
              columns={columns}
              dataSet={purchaseLineDS}
              custLoading={custLoading}
              style={{ maxHeight: c7nTableMaxHeight }}
              selectionMode={isEdit ? 'rowbox' : 'none'}
              buttons={isEdit ? ['add', 'delete'] : []}
            />
          )}
        </SecondSection>
      </TopSection>
    </Fragment>
  );
};

export default PurchaseInfo;
