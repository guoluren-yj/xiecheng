import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';
import { filterNullValueObject, getResponse } from 'utils/utils';
import { isString } from 'lodash';
import notification from 'utils/notification';
import { revokeWorkFlowByKey, fetchOperationFlag } from '@/services/commonService';

// 对POST导出 查询字段的处理 标准多选字段变为list对象
export const getPostParams = params => {
  const multFields = ['multiSelectHeaderNums', 'multiSelectHeaderAndLineNums'];
  const newParams = multFields.reduce((a, b) => {
    // eslint-disable-next-line no-param-reassign
    a[b] = params[b] ? `${params[b]}`.split(',') : undefined;
    return a;
  }, {});
  return filterNullValueObject({
    ...params,
    ...newParams,
  });
};

/**
 * 撤销工作流审批
 * @param {String} businessKey businessKey
 */
export function revokeWorkFlow(businessKey) {
  return new Promise(async resolve => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('hzero.common.view.revokeApproval.tip`')
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
export async function getBatchOperationFlag(businessKeys) {
  const res = getResponse(
    await fetchOperationFlag({ body: businessKeys, query: { revokeFlag: 1 } })
  );
  if (res) {
    return res;
  }
  return {};
}
