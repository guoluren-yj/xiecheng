// 操作记录状态
const processOperationIconMap = {
  NEW: 'add', // 新建
  CLOSE: 'not_interested', // 关闭
  SUBMIT: 'check', // 提交
  APV_ACCESS: 'authorize', // 审批通过
  APV_REJECT: 'authorize', // 审批拒绝
  PUBLISH: 'publish2', // 发布
  PUBLISH_CANCEL: 'cancel', // 取消发布
  CONFIRM: 'check', // 确认
  DELIVERY_DATE_SUBMIT: 'reply', // 交期反馈
  DELIVERY_DATE_ACCESS: 'authorize', // 交期审批通过
  DELIVERY_DATE_REJECT: 'authorize', // 交期审批拒绝
  UPDATE: 'mode_edit', // 更新
  URGENT_CANCEL: 'flash_off', // 取消加急
  URGENT: 'flash_on', // 加急
  EXPORT_TO_ERP_SUCCESS: 'check', // 导出至ERP成功
  EXPORT_TO_ERP_FAIL: 'reply', // 导出至ERP失败
  AUTO_CONFIRM: 'check', //	自动确认
  SYNC_SUCCESS: 'near_me-o', // 同步
  SYNC_FALSE: 'near_me-o', // 同步
  CHANGE: 'mode_edit', // 变更
  CANCEL: 'cancel', // 取消
  EXPORT_TO_OA_SUCCESS: 'check', // 订单导入oa成功
  EXPORT_TO_OA_FAIL: 'reply', //	订单导入OA失败
  OPEN: 'assignment_turned_in-o', // 打开
  CANCEL_SYNC: 'cancel', // 取消导出外部系统
  CLOSE_SYNC: 'not_interested', // 关闭导出外部系统
  CLOSE_WFL: 'not_interested', // 关闭审批中
  CANCELING: 'cancel', // 取消审批中
  CANCELING_WFL: 'cancel', // 取消审批中
  CLOSEING: 'not_interested', // 关闭审批中
};
const getComputedColor = (action) => {
  switch (action) {
    case 'APV_ACCESS':
    case 'DELIVERY_DATE_ACCESS':
      return '#47B881';
    case 'APV_REJECT':
    case 'DELIVERY_DATE_REJECT':
      return '#F56349';
    default:
      return '#E5E5E5';
  }
};
export { processOperationIconMap, getComputedColor };
