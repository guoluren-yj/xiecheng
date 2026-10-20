// 操作记录 icon 统一
// 文档链接 - https://doc.weixin.qq.com/sheet/e2_AGYA_gYwAHgMhfR0bv0TqynmY8gsA?scode=ANYAJQfWAA0uBXAEg0AK0AnwbHAHc&tab=BB08J2

export enum OperationIconType {
  Add = 'add', // 新建
  Submit = 'check', // 提交
  Publish = 'publish2', // 发布
  Push = 'publish2', // 推送
  CancelPublish = 'publish_cancel', // 取消发布
  Approve = 'authorize', // 审批
  Cancel = 'cancel', // 取消
  Fail = 'cancel', // 失败
  Abandon = 'cancel', // 作废
  Close = 'not_interested', // 关闭
  Edit = 'mode_edit', // 编辑
  Modify = 'mode_edit', // 修改
  Change = 'mode_edit', // 变更
  Fill = 'mode_edit', // 填写
  Update = 'autorenew', // 更新
  Verify = 'autorenew', // 查验
  Sync = 'autorenew', // 同步
  Delete = 'delete', // 删除
  Confirm = 'check_circle', // 确认
  Occupy = 'relation', // 预占
  Deliver = 'how_to_vote', // 妥投
  Collect = 'how_to_vote', // 采集
  Receive = 'move_to_inbox', // 接收
  Ship = 'local_shipping', // 发出商品
  Feedback = 'record_test', // 差异反馈
  Revoke = 'reply', // 撤销
  Return = 'reply', // 退回
  Withdraw = 'reply', // 撤回
  Refund = 'reply', // 退款
  Apply = 'done_all', // 应用
  Allocate = 'auto_complete', // 分配
  Suspend = 'enhanced_encryption-o', // 暂挂
  Enable = 'finished', // 启用
  Disable = 'not_interested', // 禁用
  Urgent = 'flash_on', // 加急
  CancelUrgent = 'flash_off', // 取消加急
  MultiQuote = 'monetization_on-o', // 多轮报价
  ExpertScore = 'person_pin-o', // 专家评分
  BidOpening = 'assignment_turned_in-o', // 开标
  Pause = 'remove_circle_outline', // 暂停
  InitialReview = 'operation_subtask', // 初审
  Forward = 'call_missed_outgoing', // 转交
  TakeEffect = 'verified_user-o', // 生效
  Expire = 'cancel_presentation', // 失效
  Clarify = 'contact_support', // 澄清答疑
  PutOnShelf = 'publish-o', // 上架
  TakeOffShelf = 'get_app-o', // 下架
  SummaryStats = 'inventory', // 汇总统计
  Upgrade = 'arrow_circle_up-o', // 升级
  Downgrade = 'arrow_circle_down-o', // 降级
  Payment = 'account_balance_wallet-o', // 支付
  Archive = 'folder_open2' // 归档
}
