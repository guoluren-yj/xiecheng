/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-08-30 16:49:31
 * @LastEditors: wangmiao
 * @LastEditTime: 2021-11-04 16:55:20
 */
import intl from 'utils/intl';

const OrganizationAndStaffFormDS = (bidFlag) => {
  return {
    autoCreate: true,
    dataToJSON: 'all',
    fields: [
      {
        name: 'openBidLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.openBidder`).d('开标员'),
        type: 'string',
      },
      {
        name: 'prequalCheckerLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalChecker`).d('初审审查员'),
        type: 'string',
      },
      {
        name: 'inquierLov',
        label: !bidFlag
          ? intl.get('ssrc.common.view.message.RfxCreator').d('询价员')
          : intl.get('ssrc.common.view.message.BIDCreator').d('招标员'),
        type: 'string',
      },
      {
        name: 'checkPriceLov',
        type: 'string',
        label: !bidFlag
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.RFXcheckPricer`).d('核价员')
          : intl.get(`ssrc.inquiryHall.model.inquiryHall.BIDcheckPricer`).d('定标员'),
      },
      {
        name: 'observeLov',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.observePerson`).d('观察员'),
      },
    ],
  };
};
export default OrganizationAndStaffFormDS;
