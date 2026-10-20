/*
 * @Description: 结算策略详情-结算单金额调整弹框
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useEffect, useContext, useCallback } from 'react';
import { Form, useDataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { Store } from '../StoreProvider';
import { FormItem } from '@/routes/Components';
import { invAmountAdjustDS } from '@/stores/SettleStrategyDS';

const commonPrompt = 'ssta.settleStrategy.model.settleStrategy';

const cascadeMapFields = {
  priceEditFlag: 'priceAllowanceCtrlType',
  priceAllowanceCtrlType: 'priceAllowance',
  taxAmountEditFlag: 'taxAmountAllowanceCtrlType',
  taxAmountAllowanceCtrlType: 'taxAllowance',
};

/**
 * @description: 结算单金额调整弹窗
 * @param {*}
 * @return {ReactNode}
 */
export default observer(({ modal }) => {
  const { editFlag, settleConfigId, platModalFlag, emitChangeModals } = useContext(Store);

  const invAmountAdjustDs = useDataSet(() => invAmountAdjustDS(platModalFlag), [platModalFlag]);

  useEffect(() => {
    invAmountAdjustDs.addEventListener('update', handleCascadeMap);
    invAmountAdjustDs.setQueryParameter('settleConfigId', settleConfigId);
    invAmountAdjustDs.query();
    modal.handleOk(async () => {
      emitChangeModals('enableInvoiceAmountAdjustFlag');
      const res = await invAmountAdjustDs.submit();
      return res;
    });
    return () => {
      invAmountAdjustDs.removeEventListener('update', handleCascadeMap);
    };
  }, [modal, settleConfigId, invAmountAdjustDs, handleCascadeMap, emitChangeModals]);

  /**
   * @description: ds更新监听事件
   * @param {Object} 字段名称、值、旧值、当前记录
   * @return {*}
   */
  const handleCascadeMap = useCallback(({ name, value, oldValue, record }) => {
    const casField = cascadeMapFields[name];
    if (!isNil(oldValue) && value !== oldValue && casField) {
      record.set(casField, null);
      handleCascadeMap({ name: casField, value, oldValue, record });
    }
  }, []);

  const {
    priceEditFlag,
    taxAmountEditFlag,
    priceAllowanceCtrlType: priceCtrlType,
    taxAmountAllowanceCtrlType: taxCtrlType,
  } =
    invAmountAdjustDs.current?.get([
      'priceEditFlag',
      'taxAmountEditFlag',
      'priceAllowanceCtrlType',
      'taxAmountAllowanceCtrlType',
    ]) || {};

  return (
    <Form
      dataSet={invAmountAdjustDs}
      columns={1}
      useColon={false}
      labelLayout={editFlag ? 'float' : 'vertical'}
    >
      <FormItem
        name="priceEditFlag"
        editor="checkbox"
        editable={editFlag}
        renderer={({ value }) => yesOrNoRender(Number(value))}
      />
      {Number(priceEditFlag) && (
        <FormItem name="priceAllowanceCtrlType" editor="select" editable={editFlag} />
      )}
      {['AMOUNT', 'PROPORTION'].includes(priceCtrlType) && (
        <FormItem
          name="priceAllowance"
          editor="numberfield"
          editable={editFlag}
          showHelp="tooltip"
          help={
            priceCtrlType === 'AMOUNT'
              ? intl
                  .get(`${commonPrompt}.help.priceAllowanceAmount`)
                  .d('允差范围=输入单价-原单价，上下限包含等号')
              : intl
                  .get(`${commonPrompt}.help.priceAllowanceProportion`)
                  .d('允差范围（%）=（输入单价-原单价）/原单价 *100%，上下限包含等号')
          }
          renderer={({ value, record }) => {
            if (!isNil(value) && record.get('priceAllowanceCtrlType') === 'PROPORTION') {
              return `${value}%`;
            } else {
              return value;
            }
          }}
        />
      )}
      <FormItem
        name="taxRateEditFlag"
        editor="checkbox"
        editable={editFlag}
        renderer={({ value }) => yesOrNoRender(Number(value))}
      />
      <FormItem
        name="taxAmountEditFlag"
        editor="checkbox"
        editable={editFlag}
        renderer={({ value }) => yesOrNoRender(Number(value))}
      />
      {Number(taxAmountEditFlag) && (
        <FormItem name="taxAmountAllowanceCtrlType" editor="select" editable={editFlag} />
      )}
      {['AMOUNT', 'PROPORTION'].includes(taxCtrlType) && (
        <FormItem
          name="taxAllowance"
          editor="numberfield"
          editable={editFlag}
          showHelp="tooltip"
          help={
            taxCtrlType === 'AMOUNT'
              ? intl
                  .get(`${commonPrompt}.help.taxAllowanceAmount`)
                  .d('税额允差范围=输入税额-原税额，上下限包含等号')
              : intl
                  .get(`${commonPrompt}.help.taxAllowanceProportion`)
                  .d('允差范围（%）=（输入税额-原税额）/原税额 *100%，上下限包含等号')
          }
          renderer={({ value, record }) => {
            if (!isNil(value) && record.get('taxAmountAllowanceCtrlType') === 'PROPORTION') {
              return `${value}%`;
            } else {
              return value;
            }
          }}
        />
      )}
      <FormItem
        name="unitBatchEditFlag"
        editor="checkbox"
        editable={editFlag}
        showHelp="tooltip"
        help={intl
          .get(`${commonPrompt}.help.unitBatchEditFlagInfo`)
          .d(
            '配置每可以修改解决人为调整单价时单价精度不够的问题，但注意考虑传入ERP时ERP接受用修改后的每来计算金额'
          )}
        renderer={({ value }) => yesOrNoRender(Number(value))}
      />
    </Form>
  );
});
