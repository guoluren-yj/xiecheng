/*
 * @Date: 2024-02-04 12:28:41
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Steps, Divider, Icon, Popover } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { formatYesOrNo } from '@/routes/components/utils';
import { handleGetSteps } from '@/services/purchaserEvaluationWorkbenchServices';
import { ReactComponent as ResultConfirm } from '@/assets/evaluation/resultConfirm.svg';
import { ReactComponent as SelfEvaluation } from '@/assets/evaluation/selfEvaluation.svg';
import { ReactComponent as EvaluationReady } from '@/assets/evaluation/evaluationReady.svg';
import { ReactComponent as EvaluationComputed } from '@/assets/evaluation/evaluationComputed.svg';
import { ReactComponent as InternalEvaluation } from '@/assets/evaluation/internalEvaluation.svg';

import styles from '../styles.less';
import BasicInfo from '../../Details/BasicInfo';

const { Step } = Steps;
const icons = {
  EVAL_RESULT: ResultConfirm,
  EVAL_PREPARE: EvaluationReady,
  SUPPLIER_EVAL: SelfEvaluation,
  INTERNAL_EVAL: InternalEvaluation,
  EVAL_COMPLETE: EvaluationComputed,
};

const Index = ({
  needFeedbackFlag,
  evalType,
  dataSet,
  basicInfoDs,
  custLoading,
  customizeForm,
  customizeCode,
  progressStatus,
}) => {
  const [stepsConfig, setStepsConfig] = useState([]);
  const { selfIndicatorType, evalScopeMeaning, supplierAutoPublishFlag } =
    basicInfoDs.current?.get([
      'selfIndicatorType',
      'evalScopeMeaning',
      'supplierAutoPublishFlag',
    ]) || {};

  useEffect(() => {
    querySteps();
  }, []);

  // 查询步骤条
  const querySteps = () => {
    handleGetSteps().then(response => {
      const res = getResponse(response);
      if (res) {
        const steps = res.map(item => ({ ...item, IconDom: icons[item.progressStatus] }));
        setStepsConfig(steps);
      }
    });
  };

  const steps = useMemo(() => {
    const result = stepsConfig
      .map(step => {
        if (step.progressStatus === 'SUPPLIER_EVAL') {
          return { ...step, hidden: !needFeedbackFlag };
        }
        if (step.progressStatus === 'INTERNAL_EVAL') {
          return { ...step, hidden: evalType !== 'ONLINE' };
        }
        return { ...step, hidden: false };
      })
      .filter(n => !n.hidden);
    return result;
  }, [needFeedbackFlag, evalType]);

  // 获取不同节点悬浮框内容
  const getPopoverContent = ({ itemStatus }) => {
    switch (itemStatus) {
      case 'SUPPLIER_EVAL':
        return (
          <div className={styles['popover-content-wrap']}>
            <div className={styles['popover-content']}>
              <span>
                {intl
                  .get('sslm.evaluationStrategyDetail.form.label.selfratedByIndicatorYype')
                  .d('按照指标类型自评')}
              </span>
              <spna>{formatYesOrNo(selfIndicatorType)}</spna>
            </div>
            <div className={styles['popover-content']}>
              <span>
                {intl.get('sslm.evaluationStrategyDetail.form.label.evalScope').d('自评范围')}
              </span>
              <span>{evalScopeMeaning}</span>
            </div>
          </div>
        );
      case 'EVAL_COMPLETE':
        return (
          <div className={styles['popover-content-wrap']}>
            <div className={styles['popover-content']}>
              <span>
                {intl
                  .get('sslm.evaluationStrategyDetail.form.label.isAutoPublish')
                  .d('自动发布评估结果')}
              </span>
              <span>{formatYesOrNo(supplierAutoPublishFlag)}</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Steps className={styles['steps-wrap']}>
        {steps.map(config => {
          const {
            hidden,
            IconDom,
            progressStatus: newProgressStatus,
            progressStatusMeaning,
          } = config;
          return (
            <Step
              icon={<IconDom />}
              hidden={hidden}
              key={newProgressStatus}
              title={
                ['SUPPLIER_EVAL', 'EVAL_COMPLETE'].includes(newProgressStatus) ? (
                  <Popover
                    placement="bottom"
                    content={() => getPopoverContent({ itemStatus: newProgressStatus })}
                  >
                    <span style={{ userSelect: 'none', display: 'flex', alignItems: 'center' }}>
                      {progressStatusMeaning}
                      <Icon type="alt_route-o" style={{ fontSize: 14, marginLeft: 8 }} />
                    </span>
                  </Popover>
                ) : (
                  <span style={{ userSelect: 'none', display: 'flex', alignItems: 'center' }}>
                    {progressStatusMeaning}
                  </span>
                )
              }
            />
          );
        })}
      </Steps>
      <Divider dashed style={{ margin: '16px 0' }} />
      <BasicInfo
        isEdit={false}
        isCreate={false}
        pubEdit={false}
        dataSet={dataSet}
        customizeReadOnly
        custLoading={custLoading}
        customizeForm={customizeForm}
        customizeCode={customizeCode}
        progressStatus={progressStatus}
      />
    </div>
  );
};

export default Index;
