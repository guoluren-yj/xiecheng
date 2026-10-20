/*
 * SubsequentAction - 后续动作
 * @Date: 2023-10-18 16:25:24
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isNil } from 'lodash';
import React, { useRef, useCallback } from 'react';
import { Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';

import GeneralForm from '@/routes/components/GeneralForm';
import styles from '@/routes/IndicatorTemplateDefine/index.less';
import { saveStrategy } from '@/services/indicatorTemplateDefineService';
import RuleConfiguration from './RuleConfiguration';
import RuleDetail from './RuleConfiguration/Detail';
import { getRuleConfigurationDs, getPolicyFormDs } from '../../stores/getSubsequentActionDS';

const SubsequentAction = observer(({ dataSet, isEdit, evalTplId }) => {
  let _modal = null; // 策略弹框
  const ruleRef = useRef(null);

  const evalGranularity = dataSet.getState('evalGranularity');

  // 新增策略
  const handleCreatePolicy = useCallback(
    (record, strategyDs) => {
      const policyFormDs = new DataSet(getPolicyFormDs({ isEdit, evalGranularity }));
      if (record) {
        const strategyId = record.get('strategyId');
        policyFormDs.setQueryParameter('strategyId', strategyId);
        policyFormDs.query();
      }
      _modal.update({
        title: intl.get('sslm.common.view.policy.edit').d('策略编辑'),
        children: (
          <RuleDetail
            isEdit={isEdit}
            ruleRef={ruleRef}
            evalTplId={evalTplId}
            policyFormDs={policyFormDs}
          />
        ),
        onOk: () => {
          return new Promise(async resolve => {
            if (isEdit) {
              const validateFlag = await policyFormDs.validate();
              const conditionJson = await ruleRef.current?.getSaveParams();
              if (validateFlag && conditionJson) {
                saveStrategy({
                  evalTplId,
                  ...(policyFormDs.current?.toJSONData() || {}),
                  ...conditionJson,
                })
                  .then(response => {
                    const res = getResponse(response);
                    if (res) {
                      notification.success();
                      strategyDs.query();
                      _modal.open();
                    }
                  })
                  .finally(() => {
                    resolve(false);
                  });
              } else {
                resolve(false);
              }
            } else {
              _modal.open();
              resolve(false);
            }
          });
        },
        onCancel: () => {
          _modal.open();
          return false;
        },
      });
    },
    [isEdit, ruleRef, evalTplId, evalGranularity]
  );

  // 策略配置
  const handleRuleConfiguration = useCallback(() => {
    const ruleConfigurationDs = new DataSet(getRuleConfigurationDs({ evalTplId }));
    _modal = Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 742 },
      cancelButton: isEdit,
      className: styles['policy-config-modal'],
      okText: isEdit
        ? intl.get(`hzero.common.button.sure`).d('确定')
        : intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('sslm.common.view.field.policyConfig').d('策略配置'),
      children: (
        <RuleConfiguration
          isEdit={isEdit}
          dataSet={ruleConfigurationDs}
          handlePolicy={handleCreatePolicy}
        />
      ),
    });
  }, [isEdit, evalTplId, evalGranularity]);

  const fields = [
    {
      name: 'autoUpgradeFlag',
      componentType: 'CHECKBOX',
      renderer: ({ value }) => (isNil(value) ? '-' : yesOrNoRender(value)),
    },
    {
      name: 'ruleConfiguration',
      isEdit: false,
      hidden: !dataSet.current?.get('autoUpgradeFlag'),
      label: (
        <span style={{ fontWeight: 400 }}>
          {intl.get('sslm.common.model.field.ruleConfiguration').d('条件配置')}
        </span>
      ),
      renderer: () => (
        <a onClick={handleRuleConfiguration} style={{ fontWeight: isEdit ? 400 : 500 }}>
          {isEdit
            ? intl.get('hzero.common.button.edit').d('编辑')
            : intl.get('hzero.common.button.view').d('查看')}
        </a>
      ),
    },
  ];

  return <GeneralForm dataSet={dataSet} isEdit={isEdit} fields={fields} />;
});

export default SubsequentAction;
