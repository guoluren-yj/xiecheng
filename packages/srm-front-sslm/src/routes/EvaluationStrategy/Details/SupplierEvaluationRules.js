/**
 * @Description: 供应商评估策略- 详情页 - 供应商评估规则
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-28 16:45:46
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Form } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';

const SupplierEvaluationRules = observer(
  ({ dataSet, isEdit, custLoading, customizeForm, readOnly }) => {
    return customizeForm(
      {
        readOnly,
        code: 'SSLM.EVAL_PLAN_STRATEGY.DETAIL_SUP_EVA_RULES',
      },
      <Form
        useWidthPercent
        columns={3}
        dataSet={dataSet}
        custLoading={custLoading}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
      >
        <FormField name="evalType" isEdit={isEdit} componentType="SELECT" />
        <FormField
          name="evalTplCode"
          isEdit={isEdit}
          componentType="LOV"
          hidden={dataSet.current?.get('evalType') !== 'ONLINE'}
        />
      </Form>
    );
  }
);

export default SupplierEvaluationRules;
