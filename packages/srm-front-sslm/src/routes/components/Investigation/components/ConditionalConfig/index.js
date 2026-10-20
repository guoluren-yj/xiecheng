import React, { Fragment, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import intl from 'hzero-front/lib/utils/intl';
import { TextField, Lov, Select, Button, Tooltip, Icon, Form, Spin } from 'choerodon-ui/pro';
import { TopSection, SecondSection } from '_components/Section';
import { getResponse } from 'utils/utils';

import FormField from '@/routes/components/FormField';
import { queryConditionRule } from '@/services/orgInvestigateTemplateService';
import styles from './index.less';

const RuleConfiguration = observer(
  ({ record: currentRecord, conditionLineDs, customizeConditionDs, type }) => {
    const [loading, setLoading] = useState(false);
    const getFieldValue = () => {
      return customizeConditionDs.current.get('customizeConditionCombination');
    };

    if (customizeConditionDs && customizeConditionDs.current) {
      customizeConditionDs.current.set('customizeConditionCombination', getFieldValue());
    }

    /**
     * 处理字段值
     * @param {*} rightValueRecord
     * @returns
     */
    const renderRightValue = conditionLineRecord => {
      const { componentType, toValueListFlag } = conditionLineRecord.get([
        'componentType',
        'toValueListFlag',
        'fieldName',
      ]);

      // const fieldNameStr = fieldName && camelCase(fieldName);
      // 附件类型开启下拉框展示，以及checkbox和switch展示成下拉框
      const toSelectFlag = !!Number(toValueListFlag);
      const showSelectFlag =
        componentType === 'Checkbox' || componentType === 'Switch' || toSelectFlag;
      const newComponentType = showSelectFlag ? 'SELECT' : componentType;

      const basicConfig = {
        colSpan: 6,
        disabled: !conditionLineRecord.get('fieldName') || !conditionLineRecord.get('relation'),
        name: 'fieldValue',
        isEdit: true,
        componentType: newComponentType,
      };
      return <FormField {...basicConfig} />;
    };

    const createCondition = () => {
      const { investgCfHeaderId, investgCfLineId, investigateTemplateId, tenantId } = currentRecord;
      conditionLineDs.create({
        investgCfHeaderId,
        investgCfLineId,
        investigateTemplateId,
        tenantId,
        valueType: type,
      });
    };

    const deleteRightValue = record => {
      conditionLineDs.delete(record);
    };

    useEffect(() => {
      const { investgCfLineId } = currentRecord;

      setLoading(true);
      queryConditionRule({
        investgCfLineId,
        valueType: type,
      })
        .then(res => {
          if (getResponse(res)) {
            const {
              requireFx,
              editableFx,
              defaultValueFx,
              investgCfLineFxList = [],
              conditionCombination,
            } = res;
            const customizeFxEnum = {
              required: requireFx,
              editable: editableFx,
              defaultValue: defaultValueFx,
            };
            customizeConditionDs.create({
              customizeConditionCombination: customizeFxEnum[type] || conditionCombination,
            });
            conditionLineDs.loadData(investgCfLineFxList);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }, []);

    return (
      <Spin spinning={loading}>
        <TopSection>
          <SecondSection>
            <div className={styles['rules-definition-editor-wrapper']}>
              <Fragment>
                {conditionLineDs &&
                  conditionLineDs.records &&
                  conditionLineDs.records.length > 0 &&
                  conditionLineDs.records.map(conditionLineRecord => {
                    if (conditionLineRecord.status !== 'delete') {
                      return (
                        <div className={styles['rule-editor-form']}>
                          <Form record={conditionLineRecord} labelLayout="float" columns={20}>
                            <div colSpan={1}>#{conditionLineRecord.index + 1}</div>
                            {/* 字段名称 */}
                            <Lov
                              name="fieldNameLov"
                              colSpan={6}
                              // onChange={value =>
                              //   changeRightValueComponent(conditionLineRecord, value)
                              // }
                            />
                            {/* 特性条件 */}
                            <Select
                              name="relation"
                              colSpan={6}
                              // disabled={!conditionLineRecord.get('fieldName')}
                            />
                            {/* 字段值 */}
                            {renderRightValue(conditionLineRecord)}
                            <Button
                              icon="delete"
                              colSpan={1}
                              shape="circle"
                              funcType="flat"
                              onClick={() => {
                                deleteRightValue(conditionLineRecord);
                              }}
                            />
                          </Form>
                        </div>
                      );
                    } else {
                      return null;
                    }
                  })}
                <Form dataSet={customizeConditionDs} labelLayout="float" columns={20}>
                  <div colSpan={1} />
                  <Tooltip
                    title={intl.get('sslm.investDefOrg.view.card.button.add').d('新建条件规则')}
                    colSpan={18}
                  >
                    <a
                      className={styles['rules-definition-control-point']}
                      onClick={createCondition}
                      colSpan={18}
                    >
                      <Icon type="control_point" />
                    </a>
                  </Tooltip>
                  {/* 这两个div用来进行跨行布局 */}
                  <div colSpan={1} />
                  <div colSpan={1} />
                  {conditionLineDs &&
                    conditionLineDs.records &&
                    conditionLineDs.records.length > 0 && (
                      <TextField
                        name="customizeConditionCombination"
                        colSpan={18}
                        help={intl
                          .get('sslm.investDefOrg.view.help.customizeConditionCombination')
                          .d('使用 AND 和 OR 合并筛选器条件行。示例：(1 AND 2) OR 3')}
                      />
                    )}
                </Form>
              </Fragment>
            </div>
          </SecondSection>
        </TopSection>
      </Spin>
    );
  }
);

export default RuleConfiguration;
