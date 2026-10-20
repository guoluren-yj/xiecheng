import React, { useEffect } from 'react';
import { Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import { FormItem } from '@/routes/Components';

export default observer(({ headerDs, editFlag, modal }) => {
  const commonFormProps = {
    editor: 'select',
    editable: editFlag,
  };

  useEffect(() => {
    modal.handleOk(async () => {
      headerDs.current.set('checkRuleConfig', 1);
      const valiFields = ['checkResultConditionList'];
      const res = await Promise.all(
        valiFields.map((item) => headerDs.current.getField(item).checkValidity())
      );
      return res.every((item) => item);
    });
  }, [modal, headerDs]);

  return (
    <Form
      columns={1}
      dataSet={headerDs}
      showHelp="tooltip"
      labelLayout={editFlag ? 'float' : 'vertical'}
    >
      <FormItem
        name="autoInvoiceDocumentNode"
        {...commonFormProps}
        clearButton={false}
        help={
          headerDs?.current?.get('autoInvoiceDocumentNode') &&
          (headerDs?.current?.get('autoInvoiceDocumentNode') === 'BILL_COMPLETED'
            ? intl
                .get(`ssta.settleStrategy.model.settleStrategy.help.billMeassage`)
                .d(
                  '包括   无需自动 以及  电商账单推送两种模式的对账完成场景，即对账单确认后，系统自动勾选 srm对账单  或 电商对账单匹配的结算事务行 以及 结算事务行关联的售后事务行（关联同一电商子订单号）生成开票结算单'
                )
            : intl
                .get(`ssta.settleStrategy.model.settleStrategy.help.pollMessage`)
                .d(
                  '事务推送至结算池后，系统每日闲时定时轮询无需对账仅开票的电商线上直连开票数据，根据结算策略配置的并单、拆单规则自动生成开票结算单'
                ))
        }
      />
      <FormItem name="autoInvoiceState" {...commonFormProps} clearButton={false} />
    </Form>
  );
});
