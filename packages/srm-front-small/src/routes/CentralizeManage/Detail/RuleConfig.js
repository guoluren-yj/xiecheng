import React from 'react';
import { Tag } from 'choerodon-ui';
import { Form, TextField, Select, Icon, Lov, SelectBox, Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import FormPro from '@/components/FormPro';
import arrow from '@/assets/double-arro-right.svg';
import SupplierHocLov from '@/components/SupplierHocLov';
import OverflowTip from '@/components/OverflowTip';
import styles from './index.less';

function getText(name, record) {
  return record.getField(name).getText(record.get(name)) || '-';
}

function getListText(name, record) {
  const value = record.get(name);
  if (typeof value === 'object') {
    return value.join('、') || '-';
  }
  return value || '-';
}

function RuleConfig(props) {
  const { readOnly, ruleName, expressionName, formDataSet, configDataSet } = props;
  const isCustomRule = formDataSet.current.get(ruleName);

  // 删除
  function handleRuleDelete(record) {
    const deleteConditionIdList = configDataSet.getState('deleteConditionIdList') || [];
    if (record.get('conditionLineId')) {
      deleteConditionIdList.push(record.get('conditionLineId'));
      configDataSet.setState('deleteConditionIdList', deleteConditionIdList);
    }
    configDataSet.remove(record, true);
  }

  function renderCustomRuleConfig() {
    if (readOnly) {
      return (
        <div className="rule-config-list">
          {configDataSet.map((record, index) => {
            return (
              <div className="rule-config-item">
                <OverflowTip className="rule-config-index">#{index + 1}</OverflowTip>
                <OverflowTip className="rule-config-prev">
                  {getText('characterType', record)}
                </OverflowTip>
                <OverflowTip className="rule-config-compare">
                  {getText('conditionCharacter', record)}
                </OverflowTip>
                <OverflowTip className="rule-config-next">
                  {getListText('conditionLineValueMeaning', record)}
                </OverflowTip>
              </div>
            );
          })}
          <div className="rule-config-footer">
            <span>{intl.get(`small.centralize.model.customRule`).d('自定义组合规则')}：</span>
            <span>{formDataSet.current.get(expressionName)}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="rule-config-form">
        {configDataSet.map((record, index) => {
          return (
            <Form record={record} labelLayout="float" columns={3}>
              <div className="rule-form-wrapper">
                <div className="rule-index">#{index + 1}</div>
                <div>
                  <Select
                    name="characterType"
                    style={{ width: 240, margin: '0 8px' }}
                    onOption={({ record: r }) => ({
                      disabled: configDataSet
                        .toData()
                        ?.map(n => n.characterType)
                        ?.includes(r.get('value')),
                    })}
                  />
                </div>
                <div>
                  <Select name="conditionCharacter" style={{ width: 160, margin: '0 8px' }} />
                </div>
                <div>
                  <Tooltip
                    theme="light"
                    title={
                      ['INCLUDE', 'UNINCLUDE'].includes(record.get('conditionCharacter')) &&
                      record.get('conditionLineValueMeaning').map(n => (
                        <Tag
                          color="rgba(0,0,0,.06)"
                          style={{
                            color: '#000',
                            height: 18,
                            lineHeight: '18px',
                            fontWeight: 400,
                            padding: '0 4px',
                            fontSize: 12,
                          }}
                        >
                          {n}
                        </Tag>
                      ))
                    }
                  >
                    {record.get('characterType') === 'SUPPLIER' ? (
                      <SupplierHocLov
                        noCache
                        dataSet={configDataSet}
                        record={record}
                        maxTagCount={2}
                        style={{ width: 380, margin: '0 8px' }}
                        name="centralizedConditionValueList"
                        oldLovFieldsProps={[
                          {
                            name: 'centralizedConditionValueList',
                            lovCode: 'SMAL.TENANT_SUPPLIER_ALL',
                          },
                        ]}
                      />
                    ) : (
                      <Lov
                        name="centralizedConditionValueList"
                        maxTagCount={2}
                        dataSet={configDataSet}
                        record={record}
                        style={{ width: 380, margin: '0 8px' }}
                      />
                    )}
                  </Tooltip>
                </div>
                <div className="rule-operate">
                  {configDataSet.length > 1 && (
                    <Icon
                      type="delete"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRuleDelete(record)}
                    />
                  )}
                  {index + 1 === configDataSet.length && (
                    <Icon
                      type="add"
                      style={{ cursor: 'pointer', marginLeft: 6 }}
                      onClick={() => {
                        configDataSet.create({});
                      }}
                    />
                  )}
                </div>
              </div>
            </Form>
          );
        })}
        <div style={{ paddingLeft: 39, paddingRight: 57 }}>
          <img src={arrow} alt="" className="rule-img" />
          <div>
            <Form dataSet={formDataSet} labelLayout="float" columns={1}>
              <TextField name={expressionName} />
            </Form>
            <div style={{ color: 'rgba(0,0,0,.45)', marginTop: 8 }}>
              {intl
                .get('small.common.desc.custom.expression')
                .d('使用条件编号及AND、OR编写运算规则。示例：（1 AND 2）OR 3')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['rule-config']}>
      {readOnly ? (
        <div className="rule-config-name">
          {isCustomRule
            ? intl.get(`small.centralize.model.customRule`).d('自定义组合规则')
            : intl.get(`small.centralize.model.noLimit`).d('无条件限制')}
        </div>
      ) : (
        <FormPro
          fields={[{ name: ruleName, FormField: SelectBox }]}
          columns={3}
          dataSet={formDataSet}
          style={{ marginTop: 8, marginBottom: 16 }}
        />
      )}
      {!!isCustomRule && renderCustomRuleConfig()}
    </div>
  );
}

export default observer(RuleConfig);
