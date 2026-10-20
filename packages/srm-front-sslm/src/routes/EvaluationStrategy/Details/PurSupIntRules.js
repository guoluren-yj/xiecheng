/**
 * @Description: 供应商评估策略- 详情页 - 采供方交互规则
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-28 16:45:46
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import FormField from '@/routes/components/FormField';

const PurSupIntRules = observer(({ dataSet, isEdit, custLoading, customizeForm, readOnly }) => {
  const [showFlag, setShowFlag] = useState(false);
  const [showViewParentFlag, setShowViewParentFlag] = useState(false);
  const [showAutoExecuteFlag, setShowAutoExecuteFlag] = useState(false);

  const { supplierSelfAssessmentFlag, evalScope, evalType } =
    dataSet.current?.get(['supplierSelfAssessmentFlag', 'evalScope', 'evalType']) || {};

  // 线上评分
  const isOnLine = useMemo(() => evalType === 'ONLINE', [evalType]);

  useEffect(() => {
    const autoExecuteFlag = evalType === 'ONLINE' && supplierSelfAssessmentFlag === 1;
    // 供应商自评后自动执行评分显示赋值处理
    if (autoExecuteFlag) {
      setShowAutoExecuteFlag(true);
    } else {
      setShowAutoExecuteFlag(false);
      // eslint-disable-next-line no-unused-expressions
      dataSet?.current?.set({
        autoExecuteFlag: 0,
      });
    }
    if (supplierSelfAssessmentFlag) {
      setShowFlag(supplierSelfAssessmentFlag === 1);
    }
    if (evalScope) {
      setShowViewParentFlag(['LEAF'].includes(evalScope));
    } else {
      setShowViewParentFlag(false);
    }
  }, [supplierSelfAssessmentFlag, evalType]);

  // 过滤下拉框，勾选按照指标类型自评，仅展示”仅底层指标“、”无需评分“
  const hanldeOptionFilter = record => {
    let flag = true;
    const selfIndicatorType = dataSet.current?.get('selfIndicatorType');
    const value = record.get('value');
    if (selfIndicatorType) {
      flag = ['LEAF', 'NULL'].includes(value);
      return flag;
    } else {
      return flag;
    }
  };

  return customizeForm(
    {
      readOnly,
      code: 'SSLM.EVAL_PLAN_STRATEGY.DETAIL_PUR_SUP_INT_RULES',
    },
    <Form
      useWidthPercent
      dataSet={dataSet}
      columns={3}
      custLoading={custLoading}
      labelLayout={isEdit ? 'float' : 'vertical'}
      className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
    >
      <FormField
        isEdit={isEdit}
        componentType="CHECKBOX"
        name="supplierSelfAssessmentFlag"
        disabled={!isEdit}
        onChange={value => {
          setShowFlag(value === 1);
        }}
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <FormField
        isEdit={isEdit}
        name="selfIndicatorType"
        disabled={!isEdit}
        hidden={!showFlag}
        componentType="CHECKBOX"
        renderer={({ value }) => yesOrNoRender(value)}
        onChange={() => {
          setShowViewParentFlag(false);
        }}
      />
      <FormField
        isEdit={isEdit}
        name="evalScope"
        hidden={!showFlag}
        style={{ width: '100%', marginTop: '5px' }}
        disabled={!isEdit}
        componentType="SELECT"
        optionsFilter={hanldeOptionFilter}
        onChange={value => {
          const displayFlag = ['LEAF'].includes(value);
          setShowViewParentFlag(displayFlag);
        }}
        renderer={({ record = {} }) => {
          const { evalScopeMeaning } = record.data || {};
          return evalScopeMeaning;
        }}
      />
      <FormField
        isEdit={isEdit}
        name="supplierAutoPublishFlag"
        disabled={!isEdit}
        componentType="CHECKBOX"
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <FormField
        isEdit={isEdit}
        name="viewParentFlag"
        disabled={!isEdit}
        hidden={!showViewParentFlag}
        componentType="CHECKBOX"
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <FormField
        isEdit={isEdit}
        name="autoExecuteFlag"
        disabled={!isEdit}
        hidden={!showAutoExecuteFlag}
        componentType="CHECKBOX"
        renderer={({ value }) => yesOrNoRender(value)}
      />
      <FormField
        isEdit={isEdit}
        name="vetoScoreFlag"
        disabled={!isEdit}
        hidden={!isOnLine}
        componentType="CHECKBOX"
        renderer={({ value }) => yesOrNoRender(value)}
        showHelp={isEdit ? 'tooltip' : 'label'}
        help={intl
          .get('sslm.evaluationStrategyDetail.form.label.vetoScoreMsg')
          .d(
            '勾选该配置时，在供应商自评和评分人内部评估环节，若评估指标包含否决项且勾选了“否决该项“，则其余指标置灰无需打分'
          )}
      />
    </Form>
  );
});

export default PurSupIntRules;
