/*
 * @Date: 2022-09-27 20:43:41
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { forwardRef, useImperativeHandle, useMemo, useEffect } from 'react';
import { DataSet, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';

import RulesDefinition from './RulesDefinition';
import {
  getConditionRuleDs,
  getConditionJsonDs,
  getParamTableDs,
  getCustomizeConditionCombinationDs,
} from './stores';

const RuleConfiguration = (
  { remote, conditionJson, type, sourceKey = '', queryParams = {} },
  ref
) => {
  const paramTableDs = useMemo(() => new DataSet(getParamTableDs({ type, sourceKey })), [
    type,
    sourceKey,
  ]); // 特性
  const conditionRuleDs = useMemo(() => new DataSet(getConditionRuleDs()), []); // 策略逻辑
  const conditionJsonDs = useMemo(() => new DataSet(getConditionJsonDs({ queryParams })), [
    JSON.stringify(queryParams),
  ]); // 特性条件
  const customizeConditionCombinationDs = useMemo(
    () => new DataSet(getCustomizeConditionCombinationDs()),
    []
  ); // 自定义组合规则

  useEffect(() => {
    if (type) {
      paramTableDs.query();
    }
  }, [paramTableDs]);

  useImperativeHandle(ref, () => {
    return {
      paramTableDs,
      conditionRuleDs,
      conditionJsonDs,
      getSaveParams,
      customizeConditionCombinationDs,
    };
  });

  // 获取需保存的参数
  const getSaveParams = async () => {
    const { conditionType } = conditionRuleDs.current?.toData() || {};
    let validateFlag;
    if (conditionType === 'TRUE') {
      // 无条件限制时，不校验自定义组合规则
      validateFlag = (await conditionRuleDs.validate()) && (await conditionJsonDs.validate());
    } else {
      validateFlag =
        (await conditionRuleDs.validate()) &&
        (await conditionJsonDs.validate()) &&
        (await customizeConditionCombinationDs.validate());
    }
    const conditionLines = conditionType === 'TRUE' ? [] : conditionJsonDs?.toData() || [];
    if (conditionType !== 'TRUE' && isEmpty(conditionLines)) {
      notification.error({
        message: intl.get('sslm.common.view.message.atLeastOneRules').d('至少维护一行策略逻辑'),
      });
      return false;
    } else if (validateFlag) {
      const { customizeConditionCombination } =
        customizeConditionCombinationDs?.current?.toData() || {};
      const params = {
        ...(conditionRuleDs?.current?.toData() || {}),
        conditionLines,
        customizeConditionCombination:
          conditionType === 'TRUE' ? '' : customizeConditionCombination,
      };
      return { conditionJson: JSON.stringify(params) };
    }
  };

  return (
    <Spin dataSet={paramTableDs}>
      <RulesDefinition
        remote={remote}
        conditionJson={conditionJson}
        paramTableDs={paramTableDs}
        conditionRuleDs={conditionRuleDs}
        conditionJsonDs={conditionJsonDs}
        customizeConditionCombinationDs={customizeConditionCombinationDs}
      />
    </Spin>
  );
};

export default forwardRef(RuleConfiguration);
