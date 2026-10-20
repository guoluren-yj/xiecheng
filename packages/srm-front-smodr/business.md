业务
一、商城申请工作台
1. 订单申请状态
requestStatus
{
  NEW: 新建
  SUBMITTING： 提交中
  SUBMITTED： 已提交
  ACCEPTING: 受理中    编辑、提交（-> 执行中）、取消
  RETURNED： 已退回
  CANCELLING： 取消中
  CANCELED： 已取消
  CONVERSION_PROCESSING： 执行中
  CONVERSION_COMPLETED： 已完成
  APPROVED: 已审批
  REJECTED： 审批拒绝
  WITHDRAWN： 已撤回
}
2. 整单tab状态
待提交: 受理中
审批中： 已提交
待执行： 已审批
全部
3. 明细tab
可取消： 受理中、执行中、已退回     批量取消(执行中单据必须是可退回的 - canCloseQuantity === 1)
执行中
全部