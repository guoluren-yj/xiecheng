/**
 * ExpressionEngineRule 表达式引擎规则
 * @date: 2022-04-26
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useState } from 'react';
import { DataSet, Form, Table, Button, Modal, TextField, NumberField, Lov, Select, Tooltip } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';

import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import { ExpressionEngineProps } from './interface.ts';
import { getExpressionEngineFormConfig, getExpressionRuleDs } from './utils.ts';
import { queryExpressionEngineRuleInfo, deleteExpressionEngineRule, saveReturnRule, updateReturnRule } from './expressionEngineRuleService.ts';
import RuleEditModal from './RuleEditModal.tsx';
import styles from './index.less';

const modalKey = Modal.key();

function ExpressionEngineRule(props: ExpressionEngineProps) {

  const { code, sceneCode, title, showTitle = true, leftValueLovQueryPara, dataSource, createButtonHook, saveRuleHook, returnRuleDsHook, afterSaveRuleHook, defaultRetDsHook, encryptBody } = props;

  const [defaultRuleDs, setDefaultRuleDs] = useState();
  const [defaultRuleConfigs, setDefaultRuleConfigs] = useState();
  const [conditionRuleDs, setConditionRuleDs] = useState();
  const [currentExpression, setCurrentExpression] = useState({});
  const [defaultRet, setDefaultRed] = useState({});

  useEffect(() => {
    if (code && sceneCode) {
      queryInfo();
    }
  }, [code, sceneCode])

  const queryInfo = () => {
    queryExpressionEngineRuleInfo({ code, sceneCode }).then(res => {
      if (getResponse(res)) {
        const { sceneExecuteConfig = [], expression = {} } = res;
        const defaultReturn = JSON.parse(expression.defaultRetJson || '{}');
        let defaultRetDsConfig = getExpressionEngineFormConfig(sceneExecuteConfig, defaultReturn, dataSource);
        if (defaultRetDsHook) {
          defaultRetDsConfig = defaultRetDsHook(defaultRetDsConfig, { sceneExecuteConfig });
        }
        const defaultRetDs = new DataSet(defaultRetDsConfig);
        const marmotExpressionActionDs = new DataSet(getExpressionRuleDs(sceneExecuteConfig, expression.marmotExpressionActionList, { code, sceneCode }));
        setDefaultRed(defaultReturn);
        setCurrentExpression(expression);
        setDefaultRuleConfigs(sceneExecuteConfig);
        setDefaultRuleDs(defaultRetDs);
        setConditionRuleDs(marmotExpressionActionDs);
      }
    })
  }

  const addConditionRule = () => {
    conditionRuleDs.create({});
    openEditModal(conditionRuleDs.current, intl.get('hzero.common.create').d('新建'));
  }

  const ruleTableQuery = () => {
    conditionRuleDs.query();
  }

  const resetRuleTable = () => {
    conditionRuleDs.reset();
  }

  const openEditModal = (record, title) => {
    const recordData = record.toData();
    Modal.open({
      key: modalKey,
      title,
      closable: true,
      okCancel: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: 800 },
      children: (
        <RuleEditModal
          code={code}
          record={recordData}
          dataSource={dataSource}
          defaultRuleConfigs={defaultRuleConfigs}
          leftValueLovQueryPara={leftValueLovQueryPara}
          ruleTableQuery={ruleTableQuery}
          resetRuleTable={resetRuleTable} 
          defaultRet={defaultRet}
          defaultRuleDs={defaultRuleDs}
          saveDefaultRule={saveDefaultRule}
          saveRuleHook={saveRuleHook}
          afterSaveRuleHook={afterSaveRuleHook}
          returnRuleDsHook={returnRuleDsHook}
          queryInfo={queryInfo}
          encryptBody={encryptBody}
        />
      ),
    });
  }

  /**
   * 创建按钮
   */
  const createButton = () => {
    let showFlag = false;
    if (createButtonHook) {
      showFlag = createButtonHook({ defaultRuleConfigs });
    } else if (!showFlag && !isEmpty(defaultRet)){
      showFlag = false;
    }
    return !showFlag ? null : (
      <Button icon="playlist_add" key="add" onClick={() => addConditionRule()}>
        {intl.get('hzero.common.create').d('新建')}
      </Button>
    );
  };

  const renderFormItem = (configs = []) => {
    return configs.map((config) => {
      const basicConfig = {
        name: config.name,
        colSpan: 1,
        // newLine: true
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

  const deleteRuleRow = (record) => {
    const deleted = record.toData();
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        deleteExpressionEngineRule(deleted).then((res) => {
          if (getResponse(res)) {
            ruleTableQuery();
            notification.success();
          }
        });
      },
    });
  }

  const saveDefaultRule = async(ds, refreshFlag = true) => {
    ds.current.status = 'update';
    // 对返回进行校验
    const res = await ds.validate();
    if (!res) {
      return false;
    }
    const param = ds.current.toData();
    const { id, objectVersionNumber } = currentExpression;
    const handleReturnRule = id ? updateReturnRule : saveReturnRule;
    const resp = await handleReturnRule({
      code,
      sceneCode,
      defaultRetJson: JSON.stringify(param),
      id,
      objectVersionNumber,
      sceneExecuteConfig: defaultRuleConfigs,
    }, { encryptBody });
    if (getResponse(resp)) {
      const defaultReturn = JSON.parse(resp.defaultRetJson || '{}');
      setDefaultRed(defaultReturn);
      if (refreshFlag) {
        queryInfo();
      }
      notification.success({});
      return true;
    }
    return false;
  };

  const getColumns = (configs = []) => {
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
      const { name, width = 200 } = config;
      return { name, width };
    })
    const actionColumn = {
      name: 'action',
      width: 200,
      renderer: ({ record }) => (
        <>
          <a onClick={() => openEditModal(record, intl.get('hzero.common.button.edit').d('编辑'))} style={{ marginRight: 8 }}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
          <a onClick={() => deleteRuleRow(record)}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>
        </>
      ),
    };
    return [...bastColumns, ...returnRuleColumns, actionColumn];
  }

  const buttons = [createButton()];

  return (
    <div className={styles['expression-engine1']}>
      {
        showTitle && (
          <div className="expression-engine-title">
            {(title || intl.get('component.ExpressionEngineRule.view.component.title').d('规则引擎'))}
            {(<Button color='primary' onClick={() => saveDefaultRule(defaultRuleDs)}>{intl.get('component.ExpressionEngineRule.action.button.save').d('保存规则')}</Button>)}
          </div>
        )
      }
      {
        defaultRuleConfigs && defaultRuleConfigs.length > 0 && (
          <div className="expression-engine-default-rule">
            <div className="expression-engine-default-rule-title">
              <span>{title || intl.get('component.ExpressionEngineRule.view.component.defaultRule.title').d('默认规则')}</span>
              {!showTitle && (<Button color='primary' onClick={() => saveDefaultRule(defaultRuleDs)}>{intl.get('component.ExpressionEngineRule.action.button.save').d('保存规则')}</Button>)}
            </div>
            <Alert message={intl.get('component.ExpressionEngineRule.view.component.action.info').d('当您变更默认规则后需要先执行【保存规则】操作后才会更新【规则维护】数据')} type='info' showIcon />
            <Form dataSet={defaultRuleDs} labelLayout="float" className="rules-definition-editor-header" columns={2}>
              {renderFormItem(defaultRuleConfigs)}
            </Form>
          </div>
        )
      }
      {
        currentExpression && (
          <div className="expression-engine-rule-edit">
            <div className="expression-engine-rule-edit-title">
              <span>{title || intl.get('component.ExpressionEngineRule.view.component.ruleEdit.title').d('规则维护')}</span>
            </div>
            {conditionRuleDs && <Table dataSet={conditionRuleDs} columns={getColumns(defaultRuleConfigs)} buttons={buttons} />}
          </div>
        )
      }
    </div>
  )
}

export default formatterCollections({
  code: ['component.ExpressionEngineRule'],
})(
  observer(ExpressionEngineRule)
);
