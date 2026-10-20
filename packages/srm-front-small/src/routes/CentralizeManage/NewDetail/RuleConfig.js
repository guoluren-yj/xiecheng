import React, { useMemo, useEffect } from 'react';
import { Table, Select, Tooltip, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import styles from './index.less';

const MultiButton = observer(({ children, dataSet, ...props }) => {
  const disabled = (dataSet.length < 2 || (dataSet.length - dataSet.selected.length === 0));
  return (
    <Tooltip
      title={
        dataSet.selected < 1
          ? intl.get('hzero.common.message.selectAtLeastOne').d('请至少选择一条数据')
          : disabled
            ? intl.get('small.centralize.view.buyerInfpTip').d('请至少维护一条数据') : null
      }
    >
      <Button dataSet={dataSet} disabled={disabled || dataSet.selected < 1} {...props}>
        {children}
      </Button>
    </Tooltip>
  );
});

function RuleConfig(props) {
  const { readOnly: formReadOnly, formDataSet, configDataSet } = props;
  const publishStatus = formDataSet.current?.get('publishStatus');
  const readOnly = useMemo(()=> (formReadOnly || publishStatus === 'PUBLISHED'), [formReadOnly, publishStatus]);

  useEffect(() => {
    configDataSet.selection = readOnly ? false : 'multiple';
    // configDataSet.getField('centralizedConditionValueList').set('multiple', !readOnly);
  }, [readOnly]);

  function handleBatchDelete(records) {
    const deleteConditionIdList = configDataSet.getState('deleteConditionIdList') || [];
    records.forEach((record) => {
      if (record.get('conditionLineId')) {
        deleteConditionIdList.push(record.get('conditionLineId'));
        configDataSet.setState('deleteConditionIdList', deleteConditionIdList);
      }
    });
    configDataSet.remove(records, true);
  }

  function renderSelect(record) {
    const list = configDataSet.getField('characterType').getOptions()?.toData() || [];
    return (
      <Select
        record={record}
        name="characterType"
        showValidation="tooltip"
        optionsFilter={(r1) => {
          return !configDataSet.filter((r) => r.index !== record.index)
          .map((m) => m.get('characterType')).includes(r1.get('value'));
        }}
      >
        {list.map(m=> (
          <Select.Option value={m.value} key={m.value}>
            {m.meaning}
          </Select.Option>
        ))}
      </Select>
    );
  }

  const columns = [
    {
      name: 'characterType',
      width: 200,
      editor: false,
      renderer: !readOnly ? ({ record })=> renderSelect(record) : null,
    },
    {
      name: 'centralizedConditionValueList',
      className: 'centralized-value-list',
      editor: !readOnly,
      renderer: !readOnly ? null : ({ text }) => {
        return typeof text === 'string' ? text?.split('/')?.join('、') || '-' : '';
      },
    },
    {
      name: 'operates',
      title: intl.get('hzero.common.button.action').d('操作'),
      width: 180,
      align: 'left',
      lock: 'right',
      show: !readOnly,
      command: ({ record, dataSet }) => {
        return [
          <Button onClick={() => handleBatchDelete([record])} disabled={dataSet.length < 2}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>,
        ];
      },
    },
  ].filter(f => f.show !== false);

  const buttons = [
    <Button
      icon="playlist_add"
      funcType="flat"
      color="primary"
      onClick={()=>{ configDataSet.create({}, 0); }}
    >
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
    <MultiButton
      icon="delete_sweep"
      dataSet={configDataSet}
      onClick={() => handleBatchDelete(configDataSet.selected)}
    >
      {intl.get('small.common.model.batchDelete').d('批量删除')}
    </MultiButton>,
  ];

  return (
    <div className={styles['rule-config']}>
      <Table
        dataSet={configDataSet}
        columns={columns}
        buttons={readOnly ? [] : buttons}
        style={{maxHeight: '420px'}}
        customizedCode="SMCT_CENTRALIZED_TEMPLATE.DETAIL.RULE_CONFIG"
      />
    </div>
  );
}

export default observer(RuleConfig);
