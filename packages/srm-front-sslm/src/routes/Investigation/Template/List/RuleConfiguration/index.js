import React, { Fragment, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Content } from 'components/Page';
import intl from 'hzero-front/lib/utils/intl';
import {
  TextField,
  Lov,
  SelectBox,
  Select,
  NumberField,
  Button,
  Tooltip,
  Icon,
  Form,
} from 'choerodon-ui/pro';
import { TopSection, SecondSection } from '_components/Section';

import { isJSON, getCondOperatorDs } from './stores';

import styles from './index.less';

const { Option } = SelectBox;

const RuleConfiguration = observer(
  ({
    record: { conditionJson },
    conditionRuleDs,
    conditionJsonDs,
    customizeConditionCombinationDs,
    paramTableDs,
  }) => {
    if (conditionJsonDs) {
      conditionJsonDs.getField('leftValue').set('options', paramTableDs);
    }

    const getFieldValue = () => {
      if (
        conditionRuleDs.current.get('conditionType') === 'OR' ||
        conditionRuleDs.current.get('conditionType') === 'AND'
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
            .join(` ${conditionRuleDs.current.get('conditionType')} `);
        }
      } else {
        return customizeConditionCombinationDs.current.get('customizeConditionCombination');
      }
    };

    if (customizeConditionCombinationDs && customizeConditionCombinationDs.current) {
      customizeConditionCombinationDs.current.set('customizeConditionCombination', getFieldValue());
    }

    const renderOperator = operatorRecord => {
      const leftValue = operatorRecord.get('leftValue');
      let operatorOptions = getCondOperatorDs().filter(item => item.type !== 'number');
      const selectorData = paramTableDs.toData() || [];
      const target = selectorData.find(item => item.name === leftValue);
      // number类型且没有值集编码的 可选择大小于条件
      if (target && target.type === 'number' && !target.lovCode && !target.lookupCode) {
        operatorOptions = getCondOperatorDs();
      }
      return operatorOptions.map(item => <Option value={item.value}>{item.meaning}</Option>);
    };

    const transformComponentAttribute = componentAttribute => {
      const { placeholder, ...otherComponentAttribute } = componentAttribute;
      return {
        ...otherComponentAttribute,
        placeholder:
          placeholder &&
          typeof placeholder === 'string' &&
          placeholder.includes('sslm.investDefOrg.common')
            ? intl.get(placeholder)
            : '',
      };
    };

    const renderRightValue = rightValueRecord => {
      const leftValue = rightValueRecord.getState(rightValueRecord.get('leftValue'));
      const selectorData = paramTableDs.toData() || [];
      const target = selectorData.find(item => item.name === leftValue);
      const fieldDefinition = rightValueRecord.get('fieldDefinition') || target || {};
      const { _componentAttribute = '{}' } = fieldDefinition; // _componentAttribute 组件上的属性配置, 和后端约定为 json字符串
      const componentAttribute = isJSON(_componentAttribute) ? JSON.parse(_componentAttribute) : {};
      const basicConfig = {
        colSpan: 6,
        disabled: !rightValueRecord.get('leftValue') || !rightValueRecord.get('operator'),
        name: 'rightValue',
        maxTagCount: 1,
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
      conditionJsonDs.create({});
    };

    const deleteRightValue = record => {
      conditionJsonDs.delete(record, {
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('sslm.common.view.message.sureDeleteSelectedRows').d('确认删除选中行？'),
      });
    };

    const changeRightValueComponent = (record, value) => {
      record.setState(value, value);
    };

    const isEmptyParam = paramTableDs.toData() && paramTableDs.toData().length <= 0;

    useEffect(() => {
      if (conditionJson) {
        const { conditionLines, conditionType, customizeConditionCombination } = JSON.parse(
          conditionJson
        );
        conditionRuleDs.loadData([{ conditionType }]);
        conditionJsonDs.loadData(conditionLines);
        customizeConditionCombinationDs.loadData([{ customizeConditionCombination }]);
      } else {
        conditionRuleDs.create({});
        conditionJsonDs.loadData([]);
        customizeConditionCombinationDs.create({});
      }
    }, [conditionJson]);

    const handleOnChange = value => {
      if (value === 'TRUE') {
        conditionJsonDs.reset();
        customizeConditionCombinationDs.loadData([{}]);
      }
    };

    return (
      <Content style={{ padding: 0, margin: 20 }}>
        <TopSection>
          <SecondSection
            title={intl.get(`sslm.investDefOrg.model.rulesDefinition.conditionRule`).d('条件规则')}
          >
            <Form
              dataSet={conditionRuleDs}
              labelLayout="float"
              // style={{ marginTop: 16 }}
              useColon={false}
              columns={1}
            >
              <SelectBox
                name="conditionType"
                colSpan={2}
                disabled={isEmptyParam}
                onChange={handleOnChange}
                className={styles['rule-config-condition']}
              >
                <Option value="TRUE">
                  {intl.get('sslm.investDefOrg.model.select.true').d('无条件限制')}
                </Option>
                {!isEmptyParam && (
                  <>
                    <Option value="OR">
                      {intl.get('sslm.investDefOrg.model.select.or').d('满足任一条件')}
                    </Option>
                    <Option value="AND">
                      {intl.get('sslm.investDefOrg.model.select.and').d('满足所有条件')}
                    </Option>
                    <Option value="CUSTOMIZE">
                      {intl.get('sslm.investDefOrg.model.select.customize').d('自定义组合规则')}
                    </Option>
                  </>
                )}
              </SelectBox>
            </Form>
            <div className={styles['rules-definition-editor-wrapper']}>
              {conditionRuleDs.current && conditionRuleDs.current.get('conditionType') !== 'TRUE' && (
                <Fragment>
                  {conditionJsonDs &&
                    conditionJsonDs.records &&
                    conditionJsonDs.records.length > 0 &&
                    conditionJsonDs.records.map(conditionJsonRecord => {
                      if (conditionJsonRecord.status !== 'delete') {
                        return (
                          <div className="rule-editor-form">
                            <Form record={conditionJsonRecord} labelLayout="float" columns={20}>
                              <div colSpan={1}>#{conditionJsonRecord.index + 1}</div>
                              {/* 特性 */}
                              <Select
                                name="leftValue"
                                colSpan={6}
                                onChange={value =>
                                  changeRightValueComponent(conditionJsonRecord, value)
                                }
                              />
                              {/* 特性条件 */}
                              <Select
                                name="operator"
                                colSpan={6}
                                disabled={!conditionJsonRecord.get('leftValue')}
                              >
                                {renderOperator(conditionJsonRecord)}
                              </Select>
                              {/* 特性值 */}
                              {renderRightValue(conditionJsonRecord)}
                              <Button
                                icon="delete"
                                colSpan={1}
                                shape="circle"
                                funcType="flat"
                                onClick={() => {
                                  deleteRightValue(conditionJsonRecord);
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
                    {conditionRuleDs.current &&
                      conditionRuleDs.current.get('conditionType') !== 'TRUE' && (
                        <Tooltip
                          title={intl
                            .get('spfm.rulesDefinition.view.card.button.add')
                            .d('新建条件规则')}
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
                    {/* 这两个div用来进行跨行布局 */}
                    <div colSpan={1} />
                    <div colSpan={1} />
                    {conditionJsonDs &&
                      conditionJsonDs.records &&
                      conditionJsonDs.records.length > 0 && (
                        <TextField
                          name="customizeConditionCombination"
                          colSpan={18}
                          help={intl
                            .get('spfm.rulesDefinition.view.help.customizeConditionCombination')
                            .d('使用 AND 和 OR 合并筛选器条件行。示例：(1 AND 2) OR 3')}
                          disabled={conditionRuleDs.current.get('conditionType') !== 'CUSTOMIZE'}
                        />
                      )}
                  </Form>
                </Fragment>
              )}
            </div>
          </SecondSection>
        </TopSection>
      </Content>
    );
  }
);

export default RuleConfiguration;
