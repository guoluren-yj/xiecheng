/*
 * @Date: 2023-10-19 15:48:32
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';

import GeneralForm from '@/routes/components/GeneralForm';
import { getConditionType, getOperatorType } from '@/routes/components/utils';
import RuleConfiguration from '@/routes/components/RuleConfiguration';

import styles from './styles.less';

// 查看条件规则
const CheckRuleConfiguration = ({ conditionJson }) => {
  if (conditionJson) {
    const { conditionLines, conditionType, customizeConditionCombination } = JSON.parse(
      conditionJson
    );
    return (
      <div className={styles['check-rule-wrap']}>
        <div className={styles['condition-type']}>{getConditionType()[conditionType]}</div>
        {!isEmpty(conditionLines) && (
          <div className={styles['condition-detail-wrap']}>
            {conditionLines.map((condition, index) => (
              <div className={styles['condition-detail']}>
                <span>{`#${index + 1}`}</span>
                <span>{condition.fieldDefinition?.label}</span>
                <span>{getOperatorType()[condition.operator]}</span>
                <span>{condition.rightValueMeaning || condition.rightValue}</span>
              </div>
            ))}
            <div className={styles['condition-combination']}>
              {`${intl
                .get('sslm.common.model.field.customize')
                .d('自定义规则组合')}: ${customizeConditionCombination}`}
            </div>
          </div>
        )}
      </div>
    );
  }
  return <div />;
};

const Detail = observer(({ isEdit, ruleRef, evalTplId, policyFormDs }) => {
  const conditionJson = policyFormDs.current?.get('conditionJson');

  const fields = [
    {
      name: 'strategyCode',
    },
    {
      name: 'orderSeq',
      componentType: 'NUMBERFIELD',
    },
    {
      name: 'strategyName',
      colSpan: 2,
      newLine: true,
      resize: 'vertical',
      componentType: 'TEXTAREA',
    },
  ];
  const ruleFields = [
    {
      name: 'executionRule',
      componentType: 'SELECT',
    },
    {
      name: 'matchCondition',
      componentType: 'SELECT',
    },
  ];
  return (
    <Spin dataSet={policyFormDs}>
      <GeneralForm
        columns={2}
        fields={fields}
        isEdit={isEdit}
        dataSet={policyFormDs}
        style={{ marginBottom: 16 }}
      />
      <TopSection>
        <SecondSection title={intl.get('sslm.common.model.field.conditionRule').d('条件规则')}>
          <div style={{ marginBottom: 32 }}>
            {isEdit ? (
              <RuleConfiguration
                ref={ruleRef}
                sourceKey="KPI_TEMPLATE"
                conditionJson={conditionJson}
                type="kpi_template_lov_config"
                queryParams={{
                  'SSLM.KPI_TPL_EVAL_IND_LEVEL': {
                    templateId: evalTplId,
                  },
                  'SSLM.KPI_TPL_EVAL_COLLECT_LEVEL': {
                    templateId: evalTplId,
                  },
                }}
              />
            ) : (
              <CheckRuleConfiguration conditionJson={conditionJson} />
            )}
          </div>
        </SecondSection>
        <SecondSection title={intl.get('sslm.common.view.message.executionRule').d('执行规则')}>
          <GeneralForm
            columns={2}
            fields={ruleFields}
            isEdit={isEdit}
            dataSet={policyFormDs}
            style={{ marginTop: 16 }}
          />
        </SecondSection>
      </TopSection>
    </Spin>
  );
});

export default Detail;
