/*
 * @Date: 2022-10-28 16:08:49
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { observer } from 'mobx-react-lite';
import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { Form, TextField, Select, CheckBox, NumberField } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { fetchConfigTable } from '@/services/commonService';
import RuleConfiguration from '@/routes/components/RuleConfiguration';

const NodeForm = ({ record, remote }, nodeRuleRef) => {
  const [type, setType] = useState(null);
  const [nodeTypeConfig, setNodeTypeConfig] = useState([]);
  const [conditionJson, setConditionJson] = useState(record?.get('conditionJson'));

  const { nodeType, controlFlag, documentType, authManualFlag } =
    record?.get(['nodeType', 'controlFlag', 'documentType', 'authManualFlag']) || {};

  useEffect(() => {
    // 查询单据类型与配置表的对应关系
    fetchConfigTable({ configCode: 'sslm_sup_common_config' }).then(response => {
      const res = getResponse(response);
      if (res) {
        const configType = (res.find(config => config.documentType === documentType) || {}).type;
        setNodeTypeConfig(res);
        setType(configType);
      }
    });
  }, []);

  // 节点类型、单据类型改变的回调
  const handleDocumentAndNodeChange = useCallback(
    (value, name) => {
      const configType = (nodeTypeConfig.find(config => config.documentType === value) || {}).type;
      setType(configType);
      // 增加documentType的值，为了RuleConfiguration每次都重新render
      setConditionJson(JSON.stringify({ conditionType: 'TRUE', documentType: value }));
      switch (name) {
        case 'nodeType':
          record.set({
            documentType: null,
            ruleValue: null,
          });
          break;
        default:
          break;
      }
    },
    [nodeTypeConfig]
  );

  return (
    <Fragment>
      <Form record={record} labelLayout="float" columns={2} style={{ paddingBottom: 16 }}>
        <TextField name="nodeDesc" />
        <Select
          name="nodeType"
          onChange={value => handleDocumentAndNodeChange(value, 'nodeType')}
        />
        <Select
          name="documentType"
          onChange={value => handleDocumentAndNodeChange(value, 'documentType')}
        />
        <CheckBox
          name="controlFlag"
          showHelp="tooltip"
          hidden={nodeType === 'REGULATION' || !authManualFlag}
          help={intl
            .get('sslm.supplierLifePolicyConfig.modal.field.strongControlFlagMsg')
            .d('开启强管控，手工发起创建升降级单据时会校验是否有满足条件的单据')}
        />
        <Select
          name="queryDocRule"
          showHelp="tooltip"
          hidden={nodeType === 'REGULATION' || !controlFlag || !authManualFlag}
          help={intl
            .get('sslm.common.model.field.queryDocRuleMsg')
            .d(
              '若选择“查询所有历史单据”，手工发起创建升降级单据时，会实时查询供应商所有历史单据是否满足节点配置条件，任意一条满足即可创建升降级单据。若选择“仅查询匹配策略后创建的单据”，仅会查询供应商匹配到相同策略阶段之后创建的最新一条的单据是否满足条件，满足才可创建升降级单据。'
            )}
        />
      </Form>
      <RuleConfiguration
        ref={nodeRuleRef}
        remote={remote}
        conditionJson={conditionJson}
        type={type}
      />
      {nodeType === 'REGULATION' && (
        <Fragment>
          <div style={{ fontSize: '14px', fontWeight: 600, margin: '24px 0px 16px' }}>
            {intl.get('sslm.common.view.message.executionRule').d('执行规则')}
          </div>
          <Form record={record} labelLayout="float" columns={1} style={{ paddingBottom: 16 }}>
            <NumberField name="ruleValue" />
          </Form>
        </Fragment>
      )}
    </Fragment>
  );
};

export default observer(NodeForm, { forwardRef: true });
