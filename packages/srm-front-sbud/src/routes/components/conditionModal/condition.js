import React, { useEffect } from 'react';

import { Form, Button, Select, Lov, TextField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';

import styles from './index.less';

const ConditionConfig = observer(({ condition, conditionDs, customizeConditionCombinationDs }) => {
  useEffect(() => {
    if (condition.conditionLines && condition.conditionLines.length) {
      conditionDs.loadData(condition.conditionLines);
      customizeConditionCombinationDs.loadData([
        {
          conditionCombination: condition.conditionCombination,
        },
      ]);
    } else {
      conditionDs.loadData([]);
      conditionDs.create({});
      customizeConditionCombinationDs.loadData([]);
      customizeConditionCombinationDs.create({});
      setCustomizeConditionCombination();
    }
  }, []);

  const getFieldValue = () => {
    const effectiveCondition = conditionDs.records.filter((record) => record.status !== 'delete');
    const conditionCombination = customizeConditionCombinationDs.current.get(
      'conditionCombination'
    );
    if (effectiveCondition.length === 0) {
      return '';
    } else if (effectiveCondition.length === 1) {
      return '1';
    } else {
      if (conditionCombination && conditionCombination.includes(effectiveCondition.length)) {
        return conditionCombination;
      }
      return `${conditionCombination} AND ${effectiveCondition.length}`;
    }
  };

  const setCustomizeConditionCombination = () => {
    if (customizeConditionCombinationDs && customizeConditionCombinationDs.current) {
      customizeConditionCombinationDs.current.set('conditionCombination', getFieldValue());
    }
  };

  const changeRightValueComponent = (record, value) => {
    record.setState({
      value,
    });
  };

  const deleteRightValue = (record) => {
    conditionDs.delete(record);
    // .then(()=>{
    //     customizeConditionCombinationDs.validate()
    // });
  };

  const renderRightValue = (record) => {
    if (!record.get('operator') || ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'))) {
      return <div colSpan={6} />;
    } else {
      const basicConfig = {
        colSpan: 6,
        disabled: !record.get('sourceFieldCode') || !record.get('operator'),
        name: 'targetValue',
        clearButton: false,
      };

      if (record.get('sourceFieldComponentType') === 'LOV') {
        return <Lov {...basicConfig} />;
      }

      if (record.get('sourceFieldComponentType') === 'SELECT') {
        return <Select {...basicConfig} />;
      }
    }
  };

  const createCondition = () => {
    conditionDs.create({});
    setCustomizeConditionCombination();
  };

  return (
    <div className={styles['fx-condition-editor']}>
      <div className="fx-condition-editor-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="editor-title">
            {intl.get('hpfm.individual.view.message.title.conditionList').d('判断条件')}
          </div>
          <div className="editor-add" onClick={createCondition}>
            <Icon
              type="control_point"
              style={{ fontSize: '18px', color: 'rgb(52, 166, 248)', marginRight: '8px' }}
            />
            {intl.get('hpfm.individual.view.button.addCondition').d('添加条件')}
          </div>
        </div>
      </div>
      <div style={{ minHeight: '150px' }}>
        {conditionDs &&
          conditionDs.records &&
          conditionDs.records.length > 0 &&
          conditionDs.records.map((record) => {
            if (record.status !== 'delete') {
              return (
                <div className="fx-editor-form">
                  <Form record={record} labelLayout="float" columns={20}>
                    <div colSpan={1} className="fx-index">
                      {record.index + 1}
                    </div>
                    <Lov name="sourceFieldCodeObj" colSpan={6} />
                    <Select
                      name="operator"
                      colSpan={6}
                      disabled={!record.get('sourceFieldCode')}
                      onChange={(value) => changeRightValueComponent(record, value)}
                    />
                    {renderRightValue(record)}
                    <Button
                      icon="delete"
                      colSpan={1}
                      shape="circle"
                      funcType="flat"
                      clearButton={false}
                      onClick={() => {
                        deleteRightValue(record);
                      }}
                    />
                  </Form>
                </div>
              );
            } else {
              return null;
            }
          })}
      </div>

      <div className="fx-condition-editor-wrapper">
        <div className="editor-title">
          {intl.get('hpfm.individual.view.message.title.calculatLogic').d('筛选逻辑')}
        </div>
        <div className="editor-tip">
          {intl
            .get('hpfm.individual.view.message.title.tips3')
            .d('使用条件编号及AND、OR编写运算规则。示例(1 OR 2) AND 3')}
        </div>
        <div className="rule-editor-form">
          <Form dataSet={customizeConditionCombinationDs} labelLayout="float" columns={20}>
            <TextField colSpan={20} name="conditionCombination" />
          </Form>
        </div>
      </div>
    </div>
  );
});

export default ConditionConfig;
