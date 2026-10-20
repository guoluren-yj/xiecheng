import intl from 'utils/intl';

export const selectionInfoMap = () => ({
  RECOMMENDATION: intl
    .get('ssrc.inquiryHall.message.inquiryHall.recommendation')
    .d('需要选用供应商，并给供应商分配数量，提交之后生成寻源结果'),
  CANCEL: intl
    .get('ssrc.inquiryHall.message.inquiryHall.cancel')
    .d('完成本次询价，不需要选用供应商，提交之后不生成寻源结果，并不释放采购申请'),
  RELEASE: intl
    .get('ssrc.inquiryHall.message.inquiryHall.release')
    .d('取消本次询价，不需要选用供应商，提交之后不生成寻源结果，并释放采购申请'),
});
