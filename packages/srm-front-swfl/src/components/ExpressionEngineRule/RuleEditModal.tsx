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

import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import ExpressionEngine from '../ExpressionEngine/index.tsx'
import { saveExpressionEngineRule, updateExpressionEngineRule } from './expressionEngineRuleService.ts';
import { getRuleBaseInfoDs, getExpressionEngineFormConfig } from './utils.ts';
import style from './index.less';

export default function RuleEditModal (props) {
  const { record, defaultRuleConfigs, dataSource, leftValueLovQueryPara, modal, code, ruleTableQuery, resetRuleTable, defaultRet, defaultRuleDs, saveDefaultRule, saveRuleHook, returnRuleDsHook, afterSaveRuleHook, queryInfo, encryptBody } = props;

  const {id: ruleRowId, expressionActionName, expressionActionDescription, expressionPriority, conditionExpressionJson,  ...otherRecord} = record;

  const expressionEngineRef = useRef();

  const ruleBaseInfoDs = useMemo(() => {
    return new DataSet(getRuleBaseInfoDs({expressionActionName, expressionActionDescription, expressionPriority}))
  }, [expressionActionName, expressionActionDescription, expressionPriority])

  const returnRuleDs = useMemo(() => {
    let config = getExpressionEngineFormConfig(defaultRuleConfigs, otherRecord, dataSource);
    if (returnRuleDsHook) {
      config = returnRuleDsHook(config);
    } 
    return new DataSet(config);
  }, [record])

  const renderFormItem =(configs = []) => {
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
      if (config.lookupCode) {
        Component = <Select {...basicConfig} />;
      }
      return Component;
    });
  }

  modal.handleCancel(() => {
    const { resetExpressionEngineAllDs } = expressionEngineRef.current || {};
    if(resetExpressionEngineAllDs) {
      resetExpressionEngineAllDs();
    }
    resetRuleTable();
  })

  modal.handleOk(async() => {
    // 强行设置 status 方便校验
    if(ruleBaseInfoDs.current && returnRuleDs.current) {
      ruleBaseInfoDs.current.status = 'update';
      returnRuleDs.current.status = 'update';
    }
    const ruleBaseInfoValidate = await ruleBaseInfoDs.validate();
    const returnRuleDsValidate = await returnRuleDs.validate();
    const { getExpressionEngineJson } = expressionEngineRef.current;
    const conditionExpressionJson = await getExpressionEngineJson();
    // 分别对ds进行校验，如果校验不通过返回false
    if(!ruleBaseInfoValidate || !returnRuleDsValidate || !conditionExpressionJson) {
      return false
    }
    const ruleBaseInfoData = ruleBaseInfoDs.current && ruleBaseInfoDs.current.toData();
    const returnRuleData = returnRuleDs.current.toData();
    const valueExpressionJson = JSON.stringify(returnRuleData);
    const handleExpressionEngineRule = ruleRowId ? updateExpressionEngineRule : saveExpressionEngineRule;
    let flag = true;
    if (saveRuleHook) {
      flag = await saveRuleHook({ defaultRet, defaultRuleDs, saveDefaultRule });
    }
    if (!flag) {
      return false;
    }
    const response = await handleExpressionEngineRule({
      ...record,
      ...ruleBaseInfoData,
      conditionExpressionJson,
      valueExpressionJson,
      code,
      sceneExecuteConfig: defaultRuleConfigs,
  }, { encryptBody })
    if(getResponse(response)) {
      if (afterSaveRuleHook) {
        afterSaveRuleHook(queryInfo);
      } else {
        ruleTableQuery();
      }
      notification.success();
      return true;
    } else {
      return false;
    }
  })

  return (
    <div className={style['expression-engine-rule-edit-modal']}>
      <div className='edit-modal-base-info'>
        <div className="title">
          {intl.get('component.ExpressionEngineRule.view.modal.title.basicInfo').d('基本信息')}
        </div>
        <Form
          dataSet={ruleBaseInfoDs}
          columns={2}
          labelLayout="float"
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
        <ExpressionEngine dataSource={record} childRef={expressionEngineRef} leftValueLovQueryPara={leftValueLovQueryPara} />
      </div>
      <div className='edit-modal-execution-rule'>
        <div className="title">
          {intl.get('component.ExpressionEngineRule.view.modal.title.executionRule').d('执行规则')}
        </div>
        <Form dataSet={returnRuleDs} labelLayout="vertical" className="rules-definition-editor-header" columns={1}>
          {renderFormItem(defaultRuleConfigs)}
        </Form>
      </div>
    </div>
  )
}
