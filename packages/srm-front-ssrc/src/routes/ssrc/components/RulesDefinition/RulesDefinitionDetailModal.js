import React from 'react';
import { Form, Output, Tooltip } from 'choerodon-ui/pro';
import { isArray } from 'lodash';
import { List } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { getCondOperatorDs } from './indexDS';
import style from './index.less';

const RulesDefinitionModal = observer((props = {}) => {
  const {
    policyConfigDataDs,
    conditionJsonDs,
    paramTableDs,
    returnFieldDs,
    returnValueDs,
    customizeConditionCombinationDs,
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
        (record) => record.status !== 'delete'
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

  const renderOperator = (record) => {
    let operatorOptions = getCondOperatorDs().filter((item) => item.type !== 'number');
    const selectorData = paramTableDs.toData() || [];
    const target = selectorData.find((item) => item.name === record.leftValue);
    // number类型且没有值集编码的 可选择大小于条件
    if (target && target.type === 'number' && !target.lovCode && !target.lookupCode) {
      operatorOptions = getCondOperatorDs();
    }
    const valueObj = operatorOptions.find((item) => item.value === record.operator);
    return <span>{valueObj.meaning}</span>;
  };

  /**
   * 判断是否是json数据
   * @param {String} str
   */
  const isJSON = (str) => {
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

  const renderRightValue = (record) => {
    const selectorData = paramTableDs.toData() || [];
    const target = selectorData.find((item) => item.name === record.leftValue) || {};
    const fieldDefinition = record.fieldDefinition || target || {};

    let value = record.rightValue;
    if (fieldDefinition.lovCode || fieldDefinition.lookupCode) {
      value = record.rightValueMeaning;
    }
    if (isJSON(value)) {
      return isArray(JSON.parse(value)) ? JSON.parse(value).join(',') : JSON.parse(value);
    }
    return value;
  };

  const transformComponentAttribute = (componentAttribute) => {
    const { placeholder, ...otherComponentAttribute } = componentAttribute;
    return {
      ...otherComponentAttribute,
      placeholder:
        placeholder &&
        typeof placeholder === 'string' &&
        placeholder.includes('ssrc.rulesDefinition.common')
          ? intl.get(placeholder)
          : '',
    };
  };

  const renderReturnFields = () => {
    const returnFields = returnValueDs.toData() || [];
    return returnFields.map((obj) => {
      const { _componentAttribute = '{}' } = obj; // _componentAttribute 组件上的属性配置, 和后端约定为 json字符串
      const componentAttribute = isJSON(_componentAttribute) ? JSON.parse(_componentAttribute) : {};
      const basicConfig = {
        ...transformComponentAttribute(componentAttribute),
      };
      let Component = <Output name={obj.name} {...basicConfig} />;
      if (obj.lovCode) {
        Component = <Output name={obj.name} {...basicConfig} tableProps={{ rowHeight: 32 }} />;
      }
      return Component;
    });
  };

  const getConditionType = (ds) => {
    switch (ds?.current?.get('conditionType')) {
      case 'TRUE':
        return intl.get('ssrc.rulesDefinition.view.select.true').d('无条件限制');
      case 'OR':
        return intl.get('ssrc.rulesDefinition.view.select.or').d('满足任一条件');
      case 'AND':
        return intl.get('ssrc.rulesDefinition.view.select.and').d('满足所有条件');
      case 'CUSTOMIZE':
        return intl.get('ssrc.rulesDefinition.view.select.customize').d('自定义组合规则');
      default:
        return intl.get('ssrc.rulesDefinition.view.select.true').d('无条件限制');
    }
  };

  // 气泡显示鼠标进入
  const handleEnter = (e, item) => {
    if (e.target.scrollWidth > e.target.clientWidth) {
      Tooltip.show(e.target, {
        title: renderRightValue(item),
      });
    }
  };

  // 鼠标移出
  const handleLeave = () => {
    Tooltip.hide();
  };

  return (
    <div className={style['rules-definition-editor']}>
      <Form
        dataSet={policyConfigDataDs}
        columns={2}
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
        labelAlign="left"
      >
        <Output name="actionName" colSpan={1} />
        <Output name="priority" colSpan={1} min={1} step={1} />
        <Output name="description" colSpan={2} type="multipleLine" />
        <div className="editor-title" colSpan={2}>
          <div className={style['card-sub-title-line']} />
          {intl.get('ssrc.rulesDefinition.view.card.condition').d('条件规则')}
        </div>
        <Output
          label={getConditionType(policyConfigDataDs)}
          name="conditionType"
          colSpan={2}
          renderer={() => {
            const conditionType = policyConfigDataDs?.current?.get('conditionType');
            if (conditionType !== 'TRUE') {
              return (
                <List
                  bordered
                  footer={
                    <div
                      style={{
                        fontFamily: 'PingFangSC-Regular',
                        fontSize: '12px',
                        color: '#1D2129',
                        fontWeight: '400',
                      }}
                    >
                      {`${getConditionType(
                        policyConfigDataDs
                      )}:  ${customizeConditionCombinationDs?.current?.get(
                        'customizeConditionCombination'
                      )}`}
                    </div>
                  }
                  dataSource={conditionJsonDs?.toData()}
                  renderItem={(item, index) => {
                    return (
                      <List.Item>
                        <div className={style['rules-definition-condition-list']}>
                          <div className={style['rules-definition-condition-index']}>
                            #{index + 1}
                          </div>
                          <div className={style['rules-definition-condition-label']}>
                            {item?.fieldDefinition?.label}
                          </div>
                          <div className={style['rules-definition-condition-left']}>
                            {renderOperator(item)}
                          </div>
                          <div
                            onMouseLeave={handleLeave}
                            onMouseEnter={(e) => handleEnter(e, item)}
                            className={style['rules-definition-condition-right']}
                          >
                            {renderRightValue(item)}
                          </div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              );
            } else {
              return null;
            }
          }}
        />
      </Form>
      <div className="rules-definition-editor-wrapper-editor">
        <div className="editor-title">
          <div className={style['card-sub-title-line']} />
          {intl.get('ssrc.rulesDefinition.view.card.policyConfig').d('执行规则')}
        </div>
        <div>
          <Form
            dataSet={returnFieldDs}
            labelLayout="vertical"
            className="c7n-pro-vertical-form-display"
            labelAlign="left"
          >
            {renderReturnFields()}
          </Form>
        </div>
      </div>
    </div>
  );
});

export default RulesDefinitionModal;
