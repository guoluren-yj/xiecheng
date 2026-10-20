import React, { Fragment } from 'react';
import { Popover, Steps } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import Style from './index.less';

const { Step } = Steps;

/**
 * 进行中-待审批-执行情况
 * @param {Object} record 行信息
 */
export function approveExecutiveRender({ record }) {
  const { headerWorkFlows = [], observerFlag } = record.toData();
  const currentWorkFlow = headerWorkFlows && headerWorkFlows[headerWorkFlows.length - 1];
  return !observerFlag && !isEmpty(headerWorkFlows) ? (
    <Fragment>
      <div className={Style.approvalInfo}>
        <Popover content={workFlowStepRender(headerWorkFlows)} placement="bottomLeft">
          {currentWorkFlow.employeeName + (currentWorkFlow.approvalMessageMeaning || '-')}
        </Popover>
      </div>
    </Fragment>
  ) : null;
}

export function workFlowStepRender(headerWorkFlows) {
  return (
    headerWorkFlows &&
    headerWorkFlows.length && (
      <Steps
        size="small"
        current={headerWorkFlows.length}
        direction="vertical"
        className={Style.steps}
      >
        {headerWorkFlows.map(item => {
          if (item.approvalMessage === 'Pending') {
            return (
              <Step
                className={Style.approvalPending}
                title={`${item.employeeName}${item.approvalMessageMeaning || '-'}`}
                icon={<img src={require('@/assets/step-approval.svg')} alt="" />}
              />
            );
          } else if (item.approvalMessage === 'Rejected') {
            return (
              <Step
                className={Style.refuse}
                title={`${item.employeeName}${item.approvalMessageMeaning || '-'}`}
                icon={<img src={require('@/assets/step-refuse.svg')} alt="" />}
              />
            );
          }
          return (
            <Step
              title={`${item.employeeName}${item.approvalMessageMeaning || '-'}`}
              icon={<img src={require('@/assets/step-pass.svg')} alt="" />}
            />
          );
        })}
      </Steps>
    )
  );
}
