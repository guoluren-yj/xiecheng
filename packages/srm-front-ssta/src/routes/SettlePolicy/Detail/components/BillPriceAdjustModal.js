/*
 * @Description: 结算策略详情-对账单价调整
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useEffect, useMemo, useContext, useCallback } from 'react';
import { isNil } from 'lodash';
import { observer } from 'mobx-react-lite';
import { DataSet, Form } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { Store } from '../StoreProvider';
import { FormItem } from '@/routes/Components';
import { billPriceAdjustDS } from '@/stores/SettleStrategyDS';

const commonPrompt = 'ssta.settleStrategy.model.settleStrategy';

const cascadeMapFields = {
  priceAllowanceCtrlType: 'priceAllowance',
};

/**
 * @description: 对账单价调整
 * @param {Object} props
 * @return {ReactNode}
 */
export default observer(({ modal }) => {
  const { editFlag, settleConfigId, platModalFlag, emitChangeModals } = useContext(Store);
  const billPriceAdjustDs = useMemo(() => new DataSet(billPriceAdjustDS(platModalFlag)), [
    platModalFlag,
  ]);

  useEffect(() => {
    billPriceAdjustDs.addEventListener('update', handleCascadeMap);
    billPriceAdjustDs.setQueryParameter('settleConfigId', settleConfigId);
    billPriceAdjustDs.query();
    modal.handleOk(async () => {
      emitChangeModals('enableBillPriceAdjustFlag');
      billPriceAdjustDs.current.set('priceEditFlag', 1);
      const res = await billPriceAdjustDs.submit();
      return res;
    });
    return () => {
      billPriceAdjustDs.removeEventListener('update', handleCascadeMap);
    };
  }, [billPriceAdjustDs, handleCascadeMap, modal, settleConfigId, emitChangeModals]);

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

  const ctrlType = billPriceAdjustDs.current?.get('priceAllowanceCtrlType');

  return (
    <Form
      columns={1}
      useColon={false}
      dataSet={billPriceAdjustDs}
      labelLayout={editFlag ? 'float' : 'vertical'}
    >
      <FormItem name="priceAllowanceCtrlType" editor="select" editable={editFlag} />
      {['AMOUNT', 'PROPORTION'].includes(ctrlType) && (
        <FormItem
          name="priceAllowance"
          editor="numberfield"
          editable={editFlag}
          showHelp="tooltip"
          help={
            ctrlType === 'AMOUNT'
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
    </Form>
  );
});
