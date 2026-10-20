/*
 * TotalPointsRule - 总分等级条件配置
 * @Date: 2024-02-01 10:06:23
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { TopSection, SecondSection } from '_components/Section';

import RuleConfiguration from '@/routes/components/RuleConfiguration';
import { fetchTotalLevelCondition } from '@/services/indicatorTemplateDefineService';

const Index = ({ record, evalTplId }, ref) => {
  // 条件规则ref
  const conditionRuleRef = useRef(null);

  const [conditionJson, setConditionJson] = useState('');
  const [conditionRuleData, setConditionRuleData] = useState({});

  const strategyId = record.get('strategyId');

  useImperativeHandle(ref, () => ({
    conditionRuleData,
    getSaveParams: conditionRuleRef.current?.getSaveParams,
  }));

  useEffect(() => {
    if (strategyId) {
      fetchTotalLevelCondition({ strategyId }).then(response => {
        const res = getResponse(response);
        if (res) {
          setConditionRuleData(res);
          setConditionJson(res.conditionJson);
        }
      });
    }
  }, [strategyId]);

  return (
    <TopSection>
      <SecondSection title={intl.get('sslm.common.model.field.conditionRule').d('条件规则')}>
        <div style={{ marginBottom: 32 }}>
          <RuleConfiguration
            ref={conditionRuleRef}
            sourceKey="TOTAL_POINTS_LEVEL"
            conditionJson={conditionJson}
            type="sslm_kpi_eval_level_config"
            queryParams={{
              SSLM_KPI_EVAL_IND_LEVEL: {
                templateId: evalTplId,
              },
            }}
          />
        </div>
      </SecondSection>
    </TopSection>
  );
};

export default forwardRef(Index);
