/*
 * @Date: 2022-10-28 16:09:00
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, forwardRef, useState, useCallback } from 'react';
import { Form, TextField, CheckBox, NumberField } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';

import RuleConfiguration from '@/routes/components/RuleConfiguration';

const ConditionForm = ({ record }, nodeRuleRef) => {
  const { conditionJson, authManualFlag } = record?.get(['conditionJson', 'authManualFlag']) || {};

  const [showRules, setShowRules] = useState(!!authManualFlag);

  const handleAuthManualChange = useCallback(value => {
    record.set('conditionJson', JSON.stringify({ conditionType: 'TRUE' }));
    setShowRules(!!value);
  }, []);

  return (
    <Fragment>
      <Form record={record} labelLayout="float" columns={2} style={{ paddingBottom: 16 }}>
        <TextField name="conditionDesc" />
        <NumberField name="orderSeq" />
      </Form>
      <TopSection>
        <SecondSection title={intl.get('sslm.common.modal.permissionsControl').d('权限控制')}>
          <Form record={record} labelLayout="float" style={{ paddingBottom: 16 }}>
            <CheckBox name="authManualFlag" onChange={handleAuthManualChange} />
          </Form>
          {showRules && (
            <RuleConfiguration
              ref={nodeRuleRef}
              conditionJson={conditionJson}
              type="sslm_life_cycle_strategy_condition_auth_condition_config"
            />
          )}
        </SecondSection>
      </TopSection>
    </Fragment>
  );
};

export default forwardRef(ConditionForm);
