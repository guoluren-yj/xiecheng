/**
 * ExpressionEngineRule 表达式引擎规则
 * @date: 2022-04-26
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, {useEffect, useImperativeHandle, useMemo, useState} from 'react';
import { DataSet, Form, Table, Button, Modal, TextField, NumberField, Lov, Select, Tooltip } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import type { Buttons } from 'choerodon-ui/pro/lib/table/interface';
import type { ExpressionEngineProps } from './interface';
import { getExpressionEngineFormConfig, getExpressionRuleDs } from './utils';
import { queryExpressionEngineRuleInfo, deleteExpressionEngineRule, saveReturnRule, updateReturnRule } from './expressionEngineRuleService';
import RuleEditModal from './RuleEditModal';
import style from './index.less';
import FilterBarTable from '../FilterBarTable';

const modalKey = Modal.key();

function ExpressionEngineRule (props: ExpressionEngineProps) {

  const {
    code,
    sceneCode,
    title,
    showTitle = true,
    leftValueLovQueryPara,
    leftValueCode,
    dsConfigHook,
    dataSource,
    defaultDataChangeHook,
    rightValueParaHook,
    params,
    sceneExecuteConfigHook,
    defaultReturnHook,
    defaultRuleParamHook,
    returnRuleDsConfigHook,
    returnRuleDsChangeHook,
    returnRuleDataInitHook,
    returnRuleDataHook,
    expressionFieldValueHook,
    beforeSave,
  } = props;
  const [defaultRuleDs, setDefaultRuleDs] = useState<DataSet>();
  const [defaultRuleConfigs, setDefaultRuleConfigs] = useState<any[]>();
  const [conditionRuleDs, setConditionRuleDs] = useState<DataSet>();
  const [currentExpression, setCurrentExpression] = useState({} as any);
  const [defaultRet, setDefaultRed] = useState({});

  useEffect(() => {
    if(code && sceneCode) {
      queryInfo();
    }
  }, [code, sceneCode]);

  const queryInfo = () => {
    queryExpressionEngineRuleInfo({ ...params, code, sceneCode }).then( res => {
      if(getResponse(res)) {
        let { sceneExecuteConfig } = res;
        if (sceneExecuteConfigHook) {
          sceneExecuteConfig = sceneExecuteConfigHook(sceneExecuteConfig);
        }
        const { expression = {} } = res;
        let defaultReturn = JSON.parse(expression.defaultRetJson || '{}');
        if (defaultReturnHook) {
          defaultReturn = defaultReturnHook({ param: defaultReturn, config: sceneExecuteConfig });
        }
        const defaultRetDs = new DataSet(getExpressionEngineFormConfig(sceneExecuteConfig, defaultReturn, dataSource, {defaultDataChangeHook}));
        const marmotExpressionActionDs = new DataSet(getExpressionRuleDs(sceneExecuteConfig, expression.marmotExpressionActionList, { code, sceneCode }, expressionFieldValueHook));
        setDefaultRed(defaultReturn);
        setCurrentExpression(expression);
        setDefaultRuleConfigs(sceneExecuteConfig);
        setDefaultRuleDs(defaultRetDs);
        if(defaultDataChangeHook) {
          defaultDataChangeHook(defaultRetDs.current ? defaultRetDs.current.toJSONData() : {});
        }
        setConditionRuleDs(marmotExpressionActionDs);
      }
    });
  };

  const { addConditionRule = noop, ruleTableQuery = noop, resetRuleTable = noop } = useMemo(() => {
    if(!conditionRuleDs) return {};
    return {
      addConditionRule: () => {
        conditionRuleDs!.create({});
        openEditModal(conditionRuleDs!.current, intl.get('hzero.common.create').d('新建'));
      },
      ruleTableQuery: () => {
        conditionRuleDs!.query();
      },
      resetRuleTable: () => {
        conditionRuleDs!.reset();
      },
    };
  }, [conditionRuleDs]);

  const openEditModal = (record, title) => {
    const recordData = record.toData();
    Modal.open({
      key: modalKey,
      title,
      closable: true,
      okCancel: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: 742 },
      okText: intl.get(`hzero.common.button.save`).d('保存'),
      children: (
        <RuleEditModal
          code={code}
          record={recordData}
          dataSource={dataSource}
          defaultRuleConfigs={defaultRuleConfigs}
          leftValueCode={leftValueCode}
          rightValueParaHook={rightValueParaHook}
          leftValueLovQueryPara={leftValueLovQueryPara}
          ruleTableQuery={ruleTableQuery}
          resetRuleTable={resetRuleTable}
          dsConfigHook={dsConfigHook}
          returnRuleDsConfigHook={returnRuleDsConfigHook}
          returnRuleDsChangeHook={returnRuleDsChangeHook}
          returnRuleDataInitHook={returnRuleDataInitHook}
          returnRuleDataHook={returnRuleDataHook}
          beforeSave={beforeSave}
        />
      ),
    });
  };

  /**
   * 创建按钮
   */
   const createButton = (): Buttons => {
    return (isEmpty(defaultRet) ? null : (
      <Button icon="playlist_add" key="add" onClick={() => addConditionRule()}>
        {intl.get('hzero.common.create').d('新建')}
      </Button>
    )) as any;
  };

  const renderFormItem =(configs: any[] = []) => {
    return configs.map((config) => {
      const basicConfig = {
        name: config.name,
        rowSpan: 1,
        newLine: true,
        onChange: () => {
          saveDefaultRule(defaultRuleDs);
        },
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
  };

  const deleteRuleRow = (record) => {
    const deleted = record.toData();
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        deleteExpressionEngineRule(deleted).then((res) => {
          if (getResponse(res)) {
            ruleTableQuery();
            (notification as any).success();
          }
        });
      },
    });
  };

  const saveDefaultRule = (ds) => {
    ds.current.status = 'update';
    // 对返回进行校验
    ds.validate().then((res) => {
      if (res) {
        let param = ds.current.toData();
        const { id, objectVersionNumber } = currentExpression;
        const handleReturnRule = id ? updateReturnRule : saveReturnRule;
        if (defaultRuleParamHook) {
          param = defaultRuleParamHook({ param, config: defaultRuleConfigs });
        }
        handleReturnRule({ code, sceneCode, defaultRetJson: JSON.stringify(param), id, objectVersionNumber, sceneExecuteConfig: defaultRuleConfigs }).then(res => {
          if(getResponse(res)) {
            const defaultReturn = JSON.parse(res.defaultRetJson || '{}');
            setDefaultRed(defaultReturn);
            queryInfo();
            (notification as any).success();
          }
        });
      }
    });
  };

  const getColumns = (configs: any[] = []) => {
    const bastColumns = [
      {
        name: 'expressionActionName',
        width: 220,
      },
      {
        name: 'expressionActionDescription',
      },
      {
        name: 'expressionPriority',
        width: 120,
      },
      {
        name: 'conditionExpression',
        width: 100,
        renderer: ({ value }) => (
          <Tooltip title={value}>
            <span
              style={{
                cursor: 'point',
                color: '#fff',
                padding: '2px 4px',
                borderRadius: '3px',
                background: 'rgb(42 190 206)',
              }}
            >
              {intl.get('component.ExpressionEngineRule.model.ExpressionEngineRule.conditionExpression').d('表达式')}
            </span>
          </Tooltip>
        ),
      },
    ];
    const returnRuleColumns = configs.map(config => {
      const { name, width = 200} = config;
      return { name, width };
    });
    const actionColumn = {
      name: 'action',
      width: 200,
      renderer: ({ record }) => (
        <span className="action-link">
          <a onClick={() => openEditModal(record, intl.get('hzero.common.button.edit').d('编辑'))}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
          <a onClick={() => deleteRuleRow(record)}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        </span>
      ),
    };
    return [...bastColumns, ...returnRuleColumns, actionColumn];
  };

  const buttons: Buttons[] = [createButton()];

  return (
    <div className={style['expression-engine']}>
      {
        defaultRuleConfigs && defaultRuleConfigs.length > 0 && (
          <div className="expression-engine-default-rule">
            <div className="expression-engine-default-rule-title">
              {title || intl.get('component.ExpressionEngineRule.view.component.defaultRule.title').d('默认规则')}
            </div>
            <Form dataSet={defaultRuleDs} labelLayout={LabelLayout.float} className="rules-definition-editor-header" columns={2}>
              {renderFormItem(defaultRuleConfigs)}
            </Form>
          </div>
        )
      }
      {
        currentExpression && (
          <div className="expression-engine-rule-edit">
            <div className="expression-engine-rule-edit-title">
              {title || intl.get('component.ExpressionEngineRule.view.component.ruleEdit.title').d('规则维护')}
            </div>
            {conditionRuleDs && (
              <FilterBarTable
                dataSet={conditionRuleDs}
                columns={getColumns(defaultRuleConfigs)}
                buttons={buttons}
                filterBarConfig={{
                  collpaseble: true,
                  collpase: true,
                }}
              />
            )}
          </div>
        )
      }
    </div>
  );
}

export default formatterCollections({
  code: ['component.ExpressionEngineRule'],
})(
  ExpressionEngineRule
);

function noop() {}
