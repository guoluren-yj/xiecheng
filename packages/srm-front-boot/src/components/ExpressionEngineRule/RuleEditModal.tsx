/**
 * RuleEditModal 表达式引擎规则弹框组件
 * @date: 2022-04-26
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useMemo, useRef } from 'react';
import {
  Form,
  TextField,
  NumberField,
  TextArea,
  Select,
  Lov,
  DataSet,
} from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import { RecordStatus } from 'choerodon-ui/dataset/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import ExpressionEngine from '../ExpressionEngine';
import { saveExpressionEngineRule, updateExpressionEngineRule } from './expressionEngineRuleService';
import { getRuleBaseInfoDs, getExpressionEngineFormConfig } from './utils';
import style from './index.less';

export default function RuleEditModal (props) {
  const {
    record,
    defaultRuleConfigs,
    dataSource,
    leftValueLovQueryPara,
    modal,
    code,
    ruleTableQuery,
    resetRuleTable,
    leftValueCode,
    dsConfigHook,
    rightValueParaHook,
    returnRuleDataHook,
    beforeSave,
    returnRuleDsConfigHook,
    returnRuleDsChangeHook,
    returnRuleDataInitHook,
  } = props;

  const returnRuleDsConfig = returnRuleDsConfigHook ? returnRuleDsConfigHook(defaultRuleConfigs) : defaultRuleConfigs;

  const {id: ruleRowId, expressionActionName, expressionActionDescription, expressionPriority, conditionExpressionJson, ...otherRecord} = record;

  const expressionEngineRef = useRef<typeof ExpressionEngine>();

  const ruleBaseInfoDs = useMemo(() => {
    return new DataSet(getRuleBaseInfoDs({expressionActionName, expressionActionDescription, expressionPriority}));
  }, [expressionActionName, expressionActionDescription, expressionPriority]);

  const returnRuleDs = useMemo(() => {
    return new DataSet(getExpressionEngineFormConfig(returnRuleDsConfig, otherRecord, dataSource, { returnRuleDsChangeHook, returnRuleDataInitHook }));
  }, [record]);

  const renderFormItem =(configs: any[] = []) => {
    return configs.map((config) => {
      const basicConfig = {
        name: config.name,
        rowSpan: 1,
      };
      let Component = <TextField {...basicConfig} />;
      if (config.type && config.type.toLowerCase() === 'number') {
        Component = <NumberField {...basicConfig} />;
      }
      if (config.lovCode) {
        Component = <Lov {...basicConfig} />;
      }
      if (config.lookupCode || config.component === 'select') {
        Component = <Select {...basicConfig} />;
      }
      return Component;
    });
  };

  modal.handleCancel(() => {
    const { resetExpressionEngineAllDs } = expressionEngineRef.current || {};
    if (resetExpressionEngineAllDs) {
      resetExpressionEngineAllDs();
    }
    resetRuleTable();
  });

  modal.handleOk(async() => {
    // 强行设置 status 方便校验
    if(ruleBaseInfoDs.current && returnRuleDs.current) {
      ruleBaseInfoDs.current.status = RecordStatus.update;
      returnRuleDs.current.status = RecordStatus.update;
    }
    const ruleBaseInfoValidate = await ruleBaseInfoDs.validate();
    const returnRuleDsValidate = await returnRuleDs.validate();
    const { getExpressionEngineJson } = expressionEngineRef.current;
    const conditionExpressionJson = await getExpressionEngineJson();
    // 分别对ds进行校验，如果校验不通过返回false
    if(!ruleBaseInfoValidate || !returnRuleDsValidate || !conditionExpressionJson) {
      return false;
    }
    const ruleBaseInfoData = ruleBaseInfoDs.current && ruleBaseInfoDs.current.toData();
    let returnRuleData = returnRuleDs.current!.toData();
    if (returnRuleDataHook) {
      returnRuleData = returnRuleDataHook({ param: returnRuleData, config: defaultRuleConfigs });
    }
    const valueExpressionJson = JSON.stringify(returnRuleData);
    const handleExpressionEngineRule = ruleRowId ? updateExpressionEngineRule : saveExpressionEngineRule;
    const params = {
      ...record,
      ...ruleBaseInfoData,
      conditionExpressionJson,
      valueExpressionJson,
      code,
      sceneExecuteConfig: defaultRuleConfigs,
    };
    if (beforeSave) {
      const flag = await beforeSave(params);
      if (!flag) {
        return false;
      }
    }
    handleExpressionEngineRule(params).then(res => {
      if(getResponse(res)) {
        ruleTableQuery();
        (notification as any).success();
        return true;
      } else {
        return false;
      }
    });
  });

  return (
    <div className={style['expression-engine-rule-edit-modal']}>
      <div className='edit-modal-base-info'>
        <div className="title">
          {intl.get('hzero.common.view.title.baseInfo').d('基础信息')}
        </div>
        <Form
          dataSet={ruleBaseInfoDs}
          columns={2}
          labelLayout={LabelLayout.float}
          className="rules-definition-editor-header"
        >
          <TextField name="expressionActionName" colSpan={1} />
          <NumberField name="expressionPriority" colSpan={1} min={1} step={1} />
          <TextArea name="expressionActionDescription" colSpan={2} />
        </Form>
      </div>
      <div className='edit-modal-expression-engine-component'>
        <div className="title">
          {intl.get('component.ExpressionEngineRule.view.modal.title.engineComponent').d('条件规则')}
        </div>
        <ExpressionEngine
          dataSource={record}
          childRef={expressionEngineRef}
          leftValueLovQueryPara={leftValueLovQueryPara}
          leftValueCode={leftValueCode}
          dsConfigHook={dsConfigHook}
          rightValueParaHook={rightValueParaHook}
        />
      </div>
      <div className='edit-modal-execution-rule'>
        <div className="title">
          {intl.get('component.ExpressionEngineRule.view.modal.title.executionRule').d('执行规则')}
        </div>
        <Form dataSet={returnRuleDs} labelLayout={LabelLayout.float} className="rules-definition-editor-header" columns={1}>
          {renderFormItem(returnRuleDsConfig)}
        </Form>
      </div>
    </div>
  );
}
