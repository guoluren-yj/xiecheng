
import moment from 'moment';
import { Modal } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import { colorMap } from '@/utils/constant';
import { getResponse } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import notification from 'utils/notification';
import { revokeApproveService } from '@/services/oms/workflowApproveService';


export function renderTag(list = [], value = '') {
  const initStyle = { border: 'none' };
  function render() {
    const newList = list
      .map((i) => {
        if (i.matchList.includes(value)) {
          return colorMap[i?.colorType];
        } if (i.matchList.length === 0) {
          return colorMap[i?.colorType];
        }
        return undefined;
      })
      .find((item) => !!item);
    return newList;
  };
  const color = render();

  return { color, initStyle };
}

/**
 * 获取时间区间
 * @param {*} date 日期
 * @param {*} startRange 开始时间范围
 * @param {*} endRange 结束时间范围
 * @param {*} type 'Y', 'M', 'D',
 * @returns [startDate, endDate]
 */
export function getStartToEndDates(date, startRange, endRange, type) {
  const startDate = moment(date).set({[type]: moment(date).get(type) + startRange, 'D': 1}).format(DATETIME_MIN);
  const endDate = moment(date).set({[type]: moment(date).get(type) + endRange, 'D': 1}).subtract(1, 'd').format(DATETIME_MAX);
  return [startDate, endDate];
}

/**
 * 撤销审批
 */
 export async function handleRevokeApprove(businessKey, callback = (e) => e) {
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
        })
      }
    },
  });
}
