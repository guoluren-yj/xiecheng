import React from 'react';
import { Tag } from 'choerodon-ui';
import classnames from 'classnames';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { isString } from 'lodash';
import notification from 'utils/notification';
import { fetchOperationFlag, revokeWorkFlowByKey } from '@/services/RequisitionPlanServices';

// 需求计划工作台tag颜色
const colorRender = (value, meaning) => {
  if (
    [
      'SUBMIT_SYNC',
      'UNCANCELLED',
      'EXCUTED',
      'ASSIGNED',
      'APPROVED',
      1,
      '1',
      'SYNC_SUCCESS',
      'PUSHED',
    ].includes(value)
  ) {
    // 绿色
    return (
      <Tag className={classnames('c7n-tag-green')} style={{ border: 0 }}>
        {meaning}
      </Tag>
    );
  } else if (['PENDING', 'EXOSYS_APPROVAL', 'WORKFLOW_APPROVAL', 'SUBMITTED'].includes(value)) {
    // 蓝色
    return (
      <Tag className={classnames('c7n-tag-yellow')} style={{ border: 0 }}>
        {meaning}
      </Tag>
    );
  } else if (['REJECTED', 'SEND_BACK', 'CANCELLED', 'CLOSED'].includes(value)) {
    //  红色
    return (
      <Tag className={classnames('c7n-tag-red')} style={{ border: 0 }}>
        {meaning}
      </Tag>
    );
  } else {
    // 橘色
    return (
      <Tag className={classnames('c7n-tag-yellow')} style={{ border: 0 }}>
        {meaning}
      </Tag>
    );
  }
};

// 需求计划工作台-明细-全部行状态tag颜色
const lineStatusColorRender = (value, meaning) => {
  if (['APPROVED', 'PUSHED'].includes(value)) {
    // 绿色
    return (
      <Tag className={classnames('c7n-tag-green')} style={{ border: 0 }}>
        {meaning}
      </Tag>
    );
  } else if (['REJECTED', 'CANCELED'].includes(value)) {
    //  红色
    return (
      <Tag className={classnames('c7n-tag-red')} style={{ border: 0 }}>
        {meaning}
      </Tag>
    );
  } else if (['NEW', 'SUBMITTED'].includes(value)) {
    // 橘色
    return (
      <Tag className={classnames('c7n-tag-yellow')} style={{ border: 0 }}>
        {meaning}
      </Tag>
    );
  } else {
    // 蓝色
    return (
      <Tag className={classnames('c7n-tag-yellow')} style={{ border: 0 }}>
        {meaning}
      </Tag>
    );
  }
};

/**
 * 撤销工作流审批
 * @param {String} businessKey businessKey
 */
function revokeWorkFlow(businessKey) {
  return new Promise(async (resolve) => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('hzero.common.view.revokeApproval.tip')
        .d('是否确认撤销审批？撤销后您仍可再次提交发起审批（仅工作流审批发起人可撤销审批）'),
      onOk: async () => {
        const res = await revokeWorkFlowByKey({ businessKey });
        if (isString(res)) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: res,
          });
        } else if (res && !res.failed) {
          resolve(true);
          notification.success();
        }
        resolve(false);
      },
      afterClose: () => {
        resolve(false);
      },
    });
  });
}

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {Array} businessKeys businessKeys
 */
async function getBatchOperationFlag(businessKeys) {
  const res = getResponse(
    await fetchOperationFlag({ body: businessKeys, query: { revokeFlag: 1 } })
  );
  if (res) {
    return res;
  }
  return {};
}

export { colorRender, lineStatusColorRender, getBatchOperationFlag, revokeWorkFlow };
