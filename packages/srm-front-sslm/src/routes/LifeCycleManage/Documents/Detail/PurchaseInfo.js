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
import { dsDeleteData } from '@/routes/components/utils/utils';

const PurchaseInfo = ({
  dataSet: { purchaseHeaderDs, purchaseLineDs },
  isEdit,
  custLoading,
  customizeForm,
  customizeTable,
  readOnlyFlag,
  customizeUnitCode,
  buttonCode,
  sourceKey,
  lifeCycleDetailRemote,
}) => {
  const [headerFrozenChecked, setHeaderFrozenChecked] = useState(false);

  const lineDataLength = useObserver(() => purchaseLineDs.toData().length);
  const dimensionCode = purchaseHeaderDs?.parent?.current?.get('dimensionCode');

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
        name: 'paymentTypeCode',
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

  // 单据样式定制，审批表单只读
  const custProps = sourceKey === 'APPROVAL_FORM' ? { readOnly: true } : { readOnly: readOnlyFlag };

  const getButtons = useCallback(() => {
    // 工作流-信息补录弹框里，不展示表格按钮
    const _buttons =
      isEdit && sourceKey !== 'SUPPLEMENT'
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
    return lifeCycleDetailRemote
      ? lifeCycleDetailRemote.process(
          'SSLM.LIFE_CYCLE_MANAGE_DETAIL_PURCHASE_INFO_LINE_BUTTONS',
          _buttons,
          { purchaseLineDs }
        )
      : _buttons;
  }, [isEdit, sourceKey, purchaseLineDs, lifeCycleDetailRemote]);

  return (
    <Fragment>
      <TopSection className="no-top-section">
        <SecondSection
          title={intl.get('sslm.common.view.title.purchaseHeaderInfo').d('采购财务头信息')}
        >
          {customizeForm(
            {
              code: customizeUnitCode[0],
              ...custProps,
            },
            <Form
              columns={3}
              useWidthPercent
              custLoading={custLoading}
              dataSet={purchaseHeaderDs}
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
              code: customizeUnitCode[1],
              buttonCode,
              ...custProps,
            },
            <Table
              columns={columns}
              dataSet={purchaseLineDs}
              custLoading={custLoading}
              style={{ maxHeight: c7nTableMaxHeight }}
              selectionMode={isEdit && sourceKey !== 'SUPPLEMENT' ? 'rowbox' : 'none'}
              buttons={getButtons()}
            />
          )}
        </SecondSection>
      </TopSection>
    </Fragment>
  );
};

export default PurchaseInfo;
