import React, { useEffect } from 'react';
import intl from 'utils/intl';
import { isFunction } from 'lodash';
import { Popconfirm } from 'choerodon-ui';
import { Form, Button, Select, Lov, TextField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import OverflowTip from '@/components/OverflowTip';
import CollapseUpIcon from '@/assets/collapse_up.svg';
import styles from './index.less';

function getText(name, record) {
  return record.getField(name).getText(record.get(name)) || '-';
}

function getListText(name, record) {
  const value = record.get(name);
  if (['NOT_IN', 'IN'].includes(record.get('operator'))) {
    if (record.get('componentType') === 'LOV') {
      if (typeof value === 'object' && value) {
        return value.map(e => e[record.get('rightLovMeaningField')]).join('、') || '-';
      }
    }

    if (record.get('componentType') === 'SELECT') {
      if (typeof value === 'object' && value) {
        return value.map(e => record.getField(name).getText(e)).join('、') || '-';
      }
    }

    return value || '-';
  } else {
    return record.getField(name).getText(record.get(name)) || '-';
  }
  // if (typeof value === 'object') {
  //   return value.join('、') || '-';
  // }
  // return value || '-';
}

const ConditionConfig = observer(
  ({
    isExist,
    condition,
    conditionDs,
    customizeConditionCombinationDs,
    getScuxRenderRightValue,
    setCuxConditionStr,
    disabled,
  }) => {
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
      const effectiveCondition = conditionDs.records.filter(record => record.status !== 'delete');
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
        if (isFunction(setCuxConditionStr)) {
          const data = setCuxConditionStr(conditionCombination, effectiveCondition);
          return data;
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

    const deleteRightValue = record => {
      conditionDs.remove(record);
    };

    const renderRightValue = record => {
      // if (!record.get('operator') || ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'))) {
      //   return <div colSpan={6} />;
      // } else {
      const basicConfig = {
        colSpan: 13,
        disabled:
          !record.get('leftValue') ||
          !record.get('operator') ||
          ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator')) ||
          disabled,
        name: 'rightValue',
        clearButton: false,
      };

      if (isFunction(getScuxRenderRightValue)) {
        return getScuxRenderRightValue({ record, basicConfig });
      }

      if (record.get('componentType') === 'LOV') {
        return <Lov {...basicConfig} />;
      }

      if (record.get('componentType') === 'SELECT') {
        return <Select {...basicConfig} />;
      }

      return <TextField {...basicConfig} />;
      // }
    };

    const createCondition = () => {
      conditionDs.create({});
      setCustomizeConditionCombination();
    };

    const renderCustomRuleConfig = () => (
      <div className="rule-config-list">
        {conditionDs &&
          conditionDs.records &&
          conditionDs.records.length > 0 &&
          conditionDs.records.map((record, index) => {
            return (
              <div className="rule-config-item">
                <OverflowTip className="rule-config-index">#{index + 1}</OverflowTip>
                <OverflowTip className="rule-config-prev">
                  {getText('leftValueCodeObj', record)}
                </OverflowTip>
                <OverflowTip className="rule-config-compare">
                  {getText('operator', record)}
                </OverflowTip>
                <OverflowTip className="rule-config-next">
                  {getListText('rightValue', record)}
                </OverflowTip>
              </div>
            );
          })}
        <div className="rule-config-footer">
          <span>
            {intl.get(`spfm.rulesDefinition.view.select.customize`).d('自定义组合规则')}：
          </span>
          <span>{customizeConditionCombinationDs?.current?.get('conditionCombination')}</span>
        </div>
      </div>
    );

    return !disabled ? (
      <div className={styles['fx-condition-editor']}>
        <div className="fx-condition-editor-wrapper" />
        <div>
          {conditionDs &&
            conditionDs.records &&
            conditionDs.records.length > 0 &&
            conditionDs.records.map(record => {
              if (record.status !== 'delete') {
                return (
                  <div className="fx-editor-form">
                    <Form record={record} labelLayout="float" columns={48}>
                      <div colSpan={2} className="fx-index">
                        #{record.index + 1}
                      </div>
                      <Lov name="leftValueCodeObj" colSpan={13} disabled={disabled} />
                      <Select
                        name="operator"
                        colSpan={13}
                        disabled={!record.get('leftValue') || disabled}
                        onChange={value => changeRightValueComponent(record, value)}
                        optionsFilter={options => {
                          if (record.get('componentType') === 'TEXT') {
                            return !['IN', 'NOT_IN'].includes(options?.data?.value);
                          } else {
                            return true;
                          }
                        }}
                      />
                      {renderRightValue(record)}
                      <div colSpan={7}>
                        {!disabled && (
                          <Button
                            className="action-btn"
                            icon="delete"
                            shape="circle"
                            funcType="flat"
                            clearButton={false}
                            onClick={() => deleteRightValue(record)}
                          />
                        )}
                        {record.index + 1 === conditionDs.length && !disabled && (
                          <Button
                            // style={{ marginLeft: '8px' }}
                            className="action-btn"
                            icon="add"
                            shape="circle"
                            funcType="flat"
                            clearButton={false}
                            onClick={() => {
                              createCondition();
                            }}
                          />
                        )}
                      </div>
                    </Form>
                  </div>
                );
              } else {
                return null;
              }
            })}
        </div>

        <div className="fx-condition-editor-icon">
          <img alt="icon" src={CollapseUpIcon} />
        </div>

        <div className="fx-condition-editor-wrapper">
          <div className="rule-editor-form">
            <Form dataSet={customizeConditionCombinationDs} labelLayout="float" columns={20}>
              <TextField colSpan={20} name="conditionCombination" disabled={disabled} />
            </Form>
          </div>
        </div>
      </div>
    ) : (
      <div className={styles['rule-config']}>
        <div className="rule-config-name">
          {isExist
            ? intl.get(`spfm.rulesDefinition.view.select.customize`).d('自定义组合规则')
            : intl.get(`spfm.rulesDefinition.view.select.true`).d('无条件限制')}
        </div>
        {!!isExist && renderCustomRuleConfig()}
      </div>
    );
  }
);

export default ConditionConfig;
