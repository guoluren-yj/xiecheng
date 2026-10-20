/**
 * @Description: 供应商评估策略- 详情页 - 供应商评估计划规则
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-28 16:45:46
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { useState, useEffect } from 'react';
import { Form } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import FormField from '@/routes/components/FormField';

const SupplierEvaluationProgramRules = ({
  dataSet,
  isEdit,
  custLoading,
  customizeForm,
  readOnly,
}) => {
  const [showFlag, setShowFlag] = useState(false);
  useEffect(() => {
    if (dataSet.current?.get('needFlag')) {
      setShowFlag(dataSet.current?.get('needFlag') === 1);
    }
  }, [dataSet.current?.get('needFlag')]);

  return customizeForm(
    {
      readOnly,
      code: 'SSLM.EVAL_PLAN_STRATEGY.DETAIL_EVA_RULES',
    },
    <Form
      dataSet={dataSet}
      columns={3}
      useWidthPercent
      custLoading={custLoading}
      labelLayout={isEdit ? 'float' : 'vertical'}
      className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
    >
      <FormField
        isEdit={isEdit}
        name="needFlag"
        componentType="CHECKBOX"
        disabled={!isEdit}
        onClick={() => {
          setShowFlag(!showFlag);
        }}
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <FormField
        isEdit={isEdit}
        name="preciseFlag"
        componentType="CHECKBOX"
        disabled={!isEdit}
        hidden={!showFlag}
        showHelp={isEdit ? 'tooltip' : 'label'}
        renderer={({ value }) => yesOrNoRender(value)}
        help={intl
          .get('sslm.evaluationStrategyDetail.form.label.preciseFlagInfo')
          .d(
            '若选择“精确日期”，那么需要选择评估计划行上具体的“评估计划日期从、评估计划日期至”；若不选择“精确日期”，那么只需要选择评估计划行上的“评估计划月份'
          )}
      />
    </Form>
  );
};

export default SupplierEvaluationProgramRules;
