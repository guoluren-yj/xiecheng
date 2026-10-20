/*
 * @Description: 结算匹配规则-尾差手动调整弹框
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { memo, useEffect, useContext, useState, useCallback } from 'react';
import { useDataSet, Form } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { FormItem } from '@/routes/Components';
import { toleManualAdjustDS } from '@/stores/SettleStrategyDS';
import { Store } from '../StoreProvider';
import styles from '../index.less';

const commonPrompt = 'ssta.settleStrategy.view.settleStrategy';

/**
 * @description: 尾差手动调整弹框
 * @param {Object} props
 * @return {ReactNode}
 */
export default memo(({ modal }) => {
  const { editFlag, headerDs, settleConfigId, platModalFlag, emitChangeModals } = useContext(Store);

  const manualAdjustDs = useDataSet(() => toleManualAdjustDS(settleConfigId, platModalFlag), [
    settleConfigId,
    platModalFlag,
  ]);

  const [percentFlag, setPercentFlag] = useState(
    headerDs.current.get('invoiceAllowanceCtrlType') === 'PROPORTION'
  );

  manualAdjustDs.setState('invCtrlType', percentFlag);

  useEffect(() => {
    modal.handleOk(handleSubmit);
  }, [modal, handleSubmit, manualAdjustDs]);

  const handleSubmit = useCallback(async () => {
    emitChangeModals('amountAdjustFlag0');
    manualAdjustDs.parent = headerDs.current.toJSONData();
    manualAdjustDs.current.status = 'update';
    const res = await manualAdjustDs.submit();
    if (res?.success) {
      const { objectVersionNumber } = res.content[0];
      headerDs.current.set('objectVersionNumber', objectVersionNumber);
    }
    return res;
  }, [manualAdjustDs, headerDs, emitChangeModals]);

  const handleCtrlTypeChange = useCallback(
    (value) => {
      setPercentFlag(value === 'PROPORTION');
      manualAdjustDs.current.set({
        taxIncludedAmountTolRange: { lower: 0, upper: 0 },
        taxAmountTolRange: { lower: 0, upper: 0 },
      });
    },
    [manualAdjustDs]
  );

  return (
    <Form
      columns={1}
      useColon={false}
      showHelp="tooltip"
      dataSet={manualAdjustDs}
      labelLayout={editFlag ? 'float' : 'vertical'}
      className={styles['tole-adjust-modal']}
    >
      <FormItem
        editor="select"
        dataSet={headerDs}
        editable={editFlag}
        clearButton={false}
        name="invoiceAllowanceCtrlType"
        onChange={handleCtrlTypeChange}
        optionsFilter={(record) => record.get('value') !== 'NONE'}
      />
      <FormItem
        editable={editFlag}
        editor="numberfield"
        name="taxIncludedAmountTolRange"
        renderer={({ value }) => (percentFlag && !isNil(value) ? `${value}%` : value)}
        help={
          percentFlag
            ? intl
                .get(`${commonPrompt}.help.taxIncAllowanceProportion`)
                .d(
                  '允差范围（%）=（系统发票含税金额-税务发票含税金额）/ 税务发票含税金额*100% ，上下限包含等号'
                )
            : intl
                .get(`${commonPrompt}.help.taxIncAllowanceAmount`)
                .d('含税金额允差范围=系统含税金额-税务发票含税金额，上下限包含等号')
        }
      />
      <FormItem
        editable={editFlag}
        editor="numberfield"
        name="taxAmountTolRange"
        renderer={({ value }) => (percentFlag && !isNil(value) ? `${value}%` : value)}
        help={
          percentFlag
            ? intl
                .get(`${commonPrompt}.help.taxAmoAllowanceProportion`)
                .d('允差范围（%）=（系统发票税额-税务发票税额）/ 税务发票税额*100%，上下限包含等号')
            : intl
                .get(`${commonPrompt}.help.taxAmoAllowanceAmount`)
                .d('税额允差范围=系统税额-税务发票税额，上下限包含等号')
        }
      />
      <FormItem name="validateLevel" editor="select" editable={editFlag} />
      <FormItem name="validateAction" editor="select" editable={editFlag} />
      <FormItem
        name="directInvoiceAutoSubmitFlag"
        editor="checkbox"
        editable={editFlag}
        help={intl
          .get(`${commonPrompt}.help.directInvoiceAutoSubmitFlag`)
          .d('电商/开票平台直连开票成功，若税务发票与系统开票单金额尾差在允差范围内，则直接提交')}
        renderer={({ value }) => yesOrNoRender(Number(value))}
      />
    </Form>
  );
});
