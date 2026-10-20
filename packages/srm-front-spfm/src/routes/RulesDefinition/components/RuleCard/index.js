/**
 * index.js
 * 规则卡片组件
 * @date: 2020-07-06
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Table, Select } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import intl from 'utils/intl';

import { getCondOperatorDs } from '../../stores/policyConfigDs';
import './index.less';

const { Column } = Table;
const { Option } = Select;

function RuleCard(props = {}) {
  const { title, conditionDataSet = {}, selectorDataSet = {} } = props;
  conditionDataSet.getField('leftValue').set('options', selectorDataSet);
  const deleteData = (record, dataSet) => {
    dataSet.delete(
      record,
      intl.get('spfm.rulesDefinition.card.option.delete').d('数据会进入临时删除状态，确定删除？')
    );
  };

  const renderAction = (record, dataSet) => {
    return (
      <a onClick={() => deleteData(record, dataSet)}>
        {intl.get('hzero.common.button.delete').d('删除')}
      </a>
    );
  };

  const renderOperator = (record) => {
    const leftValue = record.get('leftValue');
    let operatorOptions = getCondOperatorDs().filter((item) => item.type !== 'number');
    const selectorData = selectorDataSet.toData() || [];
    const target = selectorData.find((item) => item.name === leftValue);
    // number类型且没有值集编码的 可选择大小于条件
    if (target && target.type === 'number' && !target.lovCode && !target.lookupCode) {
      operatorOptions = getCondOperatorDs();
    }
    return (
      <Select record={record} name="operator">
        {operatorOptions.map((item) => (
          <Option value={item.value}>{item.meaning}</Option>
        ))}
      </Select>
    );
  };

  const buttons = ['add'];

  return (
    <Card title={title}>
      <Table dataSet={conditionDataSet} buttons={buttons}>
        <Column name="leftValue" editor width={150} />
        <Column
          className="operator-select"
          header={intl.get('spfm.rulesDefinition.model.rulesDefinition.operator').d('特性条件')}
          width={150}
          renderer={({ record }) => renderOperator(record)}
        />
        <Column name="rightValue" editor />
        <Column
          name="action"
          renderer={({ record, dataSet }) => renderAction(record, dataSet)}
          width={80}
        />
      </Table>
    </Card>
  );
}

export default RuleCard;
