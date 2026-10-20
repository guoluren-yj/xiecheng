/**
 * 开标公有方法
 * 适配角色工作台改造 - 将开标弹框改造为路有页面 显示内容不同 故提取相同部分
 * @date: 2022-10-18
 * @author: yujie.shao@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { filterNullValueObject, getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import { batchOpenBindding } from '@/services/inquiryHallNewService';
import { openingBid } from '@/services/inquiryHallService';

const organizationId = getCurrentOrganizationId();

/**
 * 无密码提示内容
 * @param {Boolean} judgeFlag - 判断标识
 */
export const renderNoPassTipContent = ({ checkedList, switchValue }) => {
  return checkedList.length && switchValue > 0
    ? intl
        .get(`ssrc.inquiryHall.view.message.confirm.sureSectionOpeningBid`, {
          list: checkedList.map((item) => item.sectionName).join(','),
          length: checkedList.length,
        })
        .d(
          `已选择${checkedList.map((item) => item.sectionName).join(',')}等${
            checkedList.length
          }个标段，是否确认开标`
        )
    : intl.get(`ssrc.inquiryHall.view.message.confirm.sureOpeningBid`).d('是否确认开标');
};

// 开标确定请求接口数据
export const getOpenBidData = async (params) => {
  // judgeFlag otherParams-有密码比无密码 多传了openPassword
  const { judgeFlag, projectLineSectionList, rfxHeaderId, openPassword } = params;
  let response;
  if (judgeFlag) {
    response = getResponse(
      await batchOpenBindding(
        filterNullValueObject({
          projectLineSectionList,
          rfxHeaderId,
          organizationId,
          openPassword,
        })
      )
    );
  } else {
    response = getResponse(
      await openingBid(
        filterNullValueObject({
          rfxHeaderId,
          openPassword,
        })
      )
    );
  }
  return response;
};

// 开标前校验提示
export const openBidValidateTips = ({ openedFlag, passwordFlag }) => {
  if (openedFlag === 1) {
    return notification.warning({
      message: intl
        .get(`ssrc.inquiryHall.view.message.confirm.notOpenAgain`)
        .d('已开标,不允许再次开标!'),
    });
  } else if (passwordFlag === null) {
    return notification.warning({
      message: intl
        .get(`ssrc.inquiryHall.view.message.confirm.notAllowedOpen`)
        .d('当前用户不在开标人列表中,不允许开标!'),
    });
  }
  return false;
};
