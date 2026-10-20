/**
 * RulesDefinitionModal.js 维护弹框
 * @date: 2021-06-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import {
  Form,
  TextField,
  NumberField,
  TextArea,
  SelectBox,
  Select,
  Lov,
  Button,
  Icon,
} from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { getCondOperatorDs } from './stores/policyConfigDs';
import style from './index.less';

const { Option } = SelectBox;

const RulesDefinitionModal = observer((props = {}) => {
  const {
    policyConfigDataDs,
    conditionJsonDs,
    paramTableDs,
    returnFieldDs,
    returnValueDs,
    customizeConditionCombinationDs,
    conditionCreate = () => {},
  } = props;

  if (conditionJsonDs) {
    conditionJsonDs.getField('leftValue').set('options', paramTableDs);
  }

  const getFieldValue = () => {
    if (
      policyConfigDataDs.current.get('conditionType') === 'OR' ||
      policyConfigDataDs.current.get('conditionType') === 'AND'
    ) {
      const effectiveCondition = conditionJsonDs.records.filter(
        record => record.status !== 'delete'
      );
      if (effectiveCondition.length === 0) {
        return '';
      } else if (effectiveCondition.length === 1) {
        return '1';
      } else {
        return effectiveCondition
          .map((_, index) => index + 1)
          .join(` ${policyConfigDataDs.current.get('conditionType')} `);
      }
    } else {
      return customizeConditionCombinationDs.current.get('customizeConditionCombination');
    }
  };

  if (customizeConditionCombinationDs && customizeConditionCombinationDs.current) {
    customizeConditionCombinationDs.current.set('customizeConditionCombination', getFieldValue());
  }

  const renderOperator = record => {
    const leftValue = record.get('leftValue');
    let operatorOptions = getCondOperatorDs().filter(item => item.type !== 'number');
    const selectorData = paramTableDs.toData() || [];
    const target = selectorData.find(item => item.name === leftValue);
    // number类型且没有值集编码的 可选择大小于条件
    if (target && target.type === 'number' && !target.lovCode && !target.lookupCode) {
      operatorOptions = getCondOperatorDs();
    }
    return operatorOptions.map(item => <Option value={item.value}>{item.meaning}</Option>);
  };

  /**
   * 判断是否是json数据
   * @param {String} str
   */
  const isJSON = str => {
    if (typeof str === 'string') {
      try {
        const obj = JSON.parse(str);
        if (typeof obj === 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  };

  const renderRightValue = record => {
    const leftValue = record.getState(record.get('leftValue'));
    const selectorData = paramTableDs.toData() || [];
    const target = selectorData.find(item => item.name === leftValue);
    const fieldDefinition = record.get('fieldDefinition') || target || {};
    const { _componentAttribute = '{}' } = fieldDefinition; // _componentAttribute 组件上的属性配置, 和后端约定为 json字符串
    const componentAttribute = isJSON(_componentAttribute) ? JSON.parse(_componentAttribute) : {};
    const basicConfig = {
      colSpan: 6,
      disabled: !record.get('leftValue') || !record.get('operator'),
      name: 'rightValue',
      ...transformComponentAttribute(componentAttribute),
    };
    let Component = <TextField {...basicConfig} />;
    if (fieldDefinition.type && fieldDefinition.type.toLowerCase() === 'number') {
      Component = <NumberField {...basicConfig} />;
    }
    if (fieldDefinition.lovCode) {
      Component = <Lov {...basicConfig} />;
    }
    if (fieldDefinition.lookupCode) {
      Component = <Select {...basicConfig} />;
    }
    return Component;
  };

  const createCondition = () => {
    conditionCreate();
  };

  const changeRightValueComponent = (record, value) => {
    record.setState(value, value);
  };

  const transformComponentAttribute = componentAttribute => {
    const { placeholder, ...otherComponentAttribute } = componentAttribute;
    return {
      ...otherComponentAttribute,
      placeholder:
        placeholder &&
        typeof placeholder === 'string' &&
        placeholder.includes('spfm.rulesDefinition.common')
          ? intl.get(placeholder)
          : '',
    };
  };

  const renderReturnFields = () => {
    const returnFields = returnValueDs.toData() || [];
    return returnFields.map(obj => {
      const { _componentAttribute = '{}' } = obj; // _componentAttribute 组件上的属性配置, 和后端约定为 json字符串
      const componentAttribute = isJSON(_componentAttribute) ? JSON.parse(_componentAttribute) : {};
      const basicConfig = {
        ...transformComponentAttribute(componentAttribute),
      };
      let Component = <TextField name={obj.name} {...basicConfig} />;
      if (obj.type && obj.type.toLowerCase() === 'number') {
        Component = <NumberField name={obj.name} {...basicConfig} />;
      }
      if (obj.lovCode) {
        Component = <Lov name={obj.name} {...basicConfig} tableProps={{ rowHeight: 32 }} />;
      }
      if (obj.lookupCode) {
        Component = <Select name={obj.name} {...basicConfig} />;
      }
      return Component;
    });
  };

  const deleteRightValue = record => {
    conditionJsonDs.delete(record);
  };

  const isEmptyParam = paramTableDs.toData() && paramTableDs.toData().length <= 0;

  return (
    <div className={style['rules-definition-editor']}>
      <Form
        dataSet={policyConfigDataDs}
        columns={2}
        labelLayout="float"
        className="rules-definition-editor-header"
      >
        <TextField name="actionName" colSpan={1} />
        <NumberField name="priority" colSpan={1} min={1} step={1} />
        <TextArea name="description" colSpan={2} />
        <div className="editor-title" colSpan={2}>
          {intl.get('spfm.rulesDefinition.view.card.condition').d('条件规则')}
        </div>
        <SelectBox
          label={intl.get('spfm.rulesDefinition.model.rulesDefinition.conditionType').d('策略逻辑')}
          name="conditionType"
          colSpan={2}
          disabled={isEmptyParam}
        >
          <Option value="TRUE">
            {intl.get('spfm.rulesDefinition.view.select.true').d('无条件限制')}
          </Option>
          {!isEmptyParam && (
            <>
              <Option value="OR">
                {intl.get('spfm.rulesDefinition.view.select.or').d('满足任一条件')}
              </Option>
              <Option value="AND">
                {intl.get('spfm.rulesDefinition.view.select.and').d('满足所有条件')}
              </Option>
              <Option value="CUSTOMIZE">
                {intl.get('spfm.rulesDefinition.view.select.customize').d('自定义组合规则')}
              </Option>
            </>
          )}
        </SelectBox>
      </Form>
      <div className="rules-definition-editor-wrapper">
        {policyConfigDataDs.current && policyConfigDataDs.current.get('conditionType') !== 'TRUE' && (
          <>
            {conditionJsonDs &&
              conditionJsonDs.records &&
              conditionJsonDs.records.length > 0 &&
              conditionJsonDs.records.map(record => {
                if (record.status !== 'delete') {
                  return (
                    <div className="rule-editor-form">
                      <Form record={record} labelLayout="float" columns={20}>
                        <div colSpan={1}>#{record.index + 1}</div>
                        <Select
                          name="leftValue"
                          colSpan={6}
                          onChange={value => changeRightValueComponent(record, value)}
                        />
                        <Select name="operator" colSpan={6} disabled={!record.get('leftValue')}>
                          {renderOperator(record)}
                        </Select>
                        {renderRightValue(record)}
                        <Button
                          icon="delete"
                          colSpan={1}
                          shape="circle"
                          funcType="flat"
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
            <Form dataSet={customizeConditionCombinationDs} labelLayout="float" columns={20}>
              <div colSpan={1} />
              {policyConfigDataDs.current &&
                policyConfigDataDs.current.get('conditionType') !== 'TRUE' && (
                  <Tooltip
                    title={intl.get('spfm.rulesDefinition.view.card.button.add').d('新建条件规则')}
                    colSpan={18}
                  >
                    <a
                      className="rules-definition-control-point"
                      onClick={createCondition}
                      colSpan={18}
                    >
                      <Icon type="control_point" />
                    </a>
                  </Tooltip>
                )}
              {conditionJsonDs && conditionJsonDs.records && conditionJsonDs.records.length > 0 && (
                <>
                  {/* 这两个div用来进行跨行布局 */}
                  <div colSpan={1} />
                  <div colSpan={1} />
                  <TextField
                    name="customizeConditionCombination"
                    colSpan={18}
                    help={intl
                      .get('spfm.rulesDefinition.view.help.customizeConditionCombination')
                      .d('使用 AND 和 OR 合并筛选器条件行。示例：(1 AND 2) OR 3')}
                    disabled={policyConfigDataDs.current.get('conditionType') !== 'CUSTOMIZE'}
                  />
                </>
              )}
            </Form>
          </>
        )}
      </div>
      <div className="rules-definition-editor-wrapper">
        <div className="editor-title">
          {intl.get('spfm.rulesDefinition.view.card.policyConfig').d('执行规则')}
        </div>
        <div className="rule-editor-form">
          <Form dataSet={returnFieldDs} labelLayout="float">
            {renderReturnFields()}
          </Form>
        </div>
      </div>
    </div>
  );
});

export default RulesDefinitionModal;
