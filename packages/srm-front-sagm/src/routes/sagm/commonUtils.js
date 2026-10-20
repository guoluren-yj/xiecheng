import { Modal } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { queryBatchApprovaFlag, queryBatchSimpleApprovalHistory } from '_utils/utils';

import { fetchOperationFlagService, revokeApproveService } from './commonApi';

// 封装树形数据
export function getArrayByTree({ treeData = [], key, parentKey, title, lastSelectOnly = false }) {
  const flatArr = [];
  const a = list =>
    list.forEach(item => {
      const n = item;
      const { children, ...flatOther } = item;
      const isHasChild = children && children.length > 0;
      n.title = item[title];
      n.key = item[key];
      n.value = item[key];
      n.parentKey = item[parentKey];
      n.isLeaf = !isHasChild;
      n.disableCheckbox = lastSelectOnly ? isHasChild : false;
      flatArr.push(flatOther);
      if (isHasChild) {
        a(children);
      }
    });
  a(treeData);
  return [treeData, flatArr];
}

// 判断是否有重复数据
export function isRepeat(arr, key) {
  const hash = {};
  for (let i = 0; i < arr.length; i++) {
    const remark = key ? arr[i][key] : arr[i];
    if (hash[remark]) {
      return [true, arr[i]];
    } else {
      hash[remark] = true;
    }
  }
  return [false];
}

/**
 * 查询工作流审批/撤销审批/审批进度
 */
export async function protocolEventLoad({ dataSet }) {
  const keys = dataSet.reduce((pre, record) => {
    const workflowBusinessKey = record.get('workflowBusinessKey') || [];
    const _businessKey = workflowBusinessKey[0];
    if (_businessKey) {
      pre.push(_businessKey);
    }
    return pre;
  }, []);
  if (isEmpty(keys)) return;
  // 查询是否可以审批businessKey的对象
  const map = getResponse(await queryBatchApprovaFlag(keys));
  // 查询简易审批进度
  const historyMap = getResponse(await queryBatchSimpleApprovalHistory(keys));
  // 查询是否可以撤销审批接口
  const res = getResponse(await fetchOperationFlagService(keys));
  // 可以撤销审批businessKey集合
  const canRevokeList = Object.keys(res).filter(n => {
    const { REVOKE } = res[n] || {};
    return REVOKE;
  });
  dataSet.forEach(r => {
    const workflowBusinessKey = r.get('workflowBusinessKey') || [];
    const _businessKey = workflowBusinessKey[0];
    r.init({
      wflApproveFlag: Number(!!map[_businessKey]),
      wflRevokeApproveFlag: Number(canRevokeList.includes(_businessKey)),
      ...(map[_businessKey] || {}),
      simpleApprovalHistory: historyMap[_businessKey] || [],
    });
  });
}

/**
 * 撤销审批
 */
export async function handleRevokeApprove(businessKey, callback = e => e) {
  Modal.confirm({
    title: intl.get('hzero.common.message.confirm').d('提示'),
    children: intl
      .get('hzero.common.view.revokeApproval.tip')
      .d('您确定要撤销审批吗？您可以在撤销后再次提交审批（注意：仅工作流审批发起人可执行撤销）'),
    onOk: async () => {
      const res = getResponse(await revokeApproveService(businessKey));
      if (isEmpty(res)) {
        notification.success();
        if (callback) {
          callback();
        }
      } else {
        notification.error({
          message: intl.get('hzero.common.status.mistake').d('错误'),
          description: res,
        });
      }
    },
  });
}
