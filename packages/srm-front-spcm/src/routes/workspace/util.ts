export const getOperationList = (staus: string, electricSignFlag: number, archiveFlag: number = 0, record) => {
  const { supplementFlag } = record?.get(['supplementFlag']) || {};
  const obj = {
    PENDING: ['Copy', 'Edit', 'Delete'],
    SUBMITTED: ['Copy', 'Revoke', 'Approve'],
    REJECTED: ['Copy', 'Edit', 'Delete'],
    SUPPLIER_REJECTED: ['Copy', 'Edit', 'Delete'],
    CONFIRMED_0: ['Copy', 'Archive', 'Change', 'Terminate'],
    CONFIRMED_1: ['Copy', 'Chapter', 'Rollback'],
    PUBLISHED: ['Copy', 'Invalid', 'Change'],
    APPROVED: ['Copy', 'Chapter', 'Rollback'],
    EFFECTED: ['Copy', 'Archive', 'Terminate', 'Change', 'Voucher'],
    TERMINATION: ['Copy', 'Voucher', archiveFlag === 0 && 'Archive', 'BreakOff', 'Chapter'],
    CANCELLATION: ['Copy'],
    APPROVAL_PENDING: ['Copy', 'Revoke', 'Approve'], // 待审批
    TERMINATION_CONFIRM: ['Copy', 'Voucher'],
    ARCHIVE: ['Copy', 'Terminate', 'Change', 'Voucher'],
    INVALID_TO_APPROVAL: ['Copy', 'Revoke', 'Approve'],
    TERMINATION_TO_APPROVAL: ['Copy', 'Voucher', 'Revoke', 'Approve'],
    CHANGE_TO_APPROVAL: ['Copy', 'Revoke', 'Approve'],
    ARCHIVE_TO_APPROVAL: ['Copy', 'Voucher', 'Revoke', 'Approve'],
    EXPIRED: ['Copy', 'Voucher', archiveFlag === 0 && 'Archive'],
    REPLENISHING: ['Copy'],
    PURCHASER_SIGN_CONTRACT: ['Copy', 'Chapter', 'Rollback'],
    SUPPLIER_SIGN_CONTRACT: ['Copy'],
    // 待生效，主协议显示【复制】【版本查看】按钮
    TO_BE_VALID: [!supplementFlag && 'Copy', 'Invalid', 'ComfirmEffect', 'ComfirmCancel'],
    // 审批生效中
    EFFECTED_TO_APPROVAL: supplementFlag ? ['Revoke', 'Approve'] : ['Copy', 'Revoke', 'Approve'],
    // 创建签署任务失败
    CREATE_SIGNING_TASK_FAILED: ['Copy', 'Rollback'],
    SIGNING: ['Copy', 'InvalidSignedTask'],
    INVALID_SIGNED_TASK: ['Rollback'],
  };
  const objMore = {
    // EFFECTED: ['Voucher'],
    // TERMINATION: ['Voucher'],
    // TERMINATION_CONFIRM: ['Voucher'],
    // ARCHIVE: ['Voucher'],
    // TERMINATION_TO_APPROVAL: ['Voucher'],
    // ARCHIVE_TO_APPROVAL: ['Voucher'],
    // EXPIRED: ['Voucher'],
  };
  return {
    moreActionArr: objMore[staus] || [],
    action: obj[staus]||obj[`${staus}_${electricSignFlag||0}`] || [],
  };
  // 更多操作
};


// eslint-disable-next-line no-unused-vars
const a = [
  {
    value: 'PENDING',
    meaning: '新建',
  },
  {
    value: 'SUBMITTED',
    meaning: '已提交',
  },
  {
    value: 'PUBLISHED',
    meaning: '已发布',
    orderSeq: 3,
  },
  {
    value: 'REJECTED',
    meaning: '审批拒绝',
    orderSeq: 4,
  },
  {
    value: 'SUPPLIER_REJECTED',
    meaning: '拒绝生效',
    orderSeq: 5,
  },
  {
    value: 'CONFIRMED',
    meaning: '已确认',
    orderSeq: 6,
  },
  {
    value: 'DELETED',
    meaning: '已删除',
    orderSeq: 7,
  },
  {
    value: 'APPROVED',
    meaning: '已审批',
    orderSeq: 8,
  },
  {
    value: 'EFFECTED',
    meaning: '已生效',
    orderSeq: 9,
  },
  {
    value: 'TERMINATION',
    meaning: '已终止',
    orderSeq: 10,
  },
  {
    value: 'CANCELLATION',
    meaning: '已作废',
    orderSeq: 11,
  },
  {
    value: 'APPROVAL_PENDING',
    meaning: '待审批',
    orderSeq: 12,
  },
  {
    value: 'TERMINATION_CONFIRM',
    meaning: '终止确认',
    orderSeq: 13,
  },
  {
    value: 'HAVE_ALTERATION',
    meaning: '已变更',
    orderSeq: 14,
  },
  {
    value: 'ARCHIVE',
    meaning: '已归档',
    orderSeq: 15,
  },
  {
    value: 'INVALID_TO_APPROVAL',
    meaning: '作废待审批',
    orderSeq: 25,
  },
  {
    value: 'CHANGE_TO_APPROVAL',
    meaning: '变更审批中',
    orderSeq: 30,
  },
  {
    value: 'TERMINATION_TO_APPROVAL',
    meaning: '终止审批中',
    orderSeq: 35,
  },
  {
    value: 'ARCHIVE_TO_APPROVAL',
    meaning: '归档审批中',
    orderSeq: 36,
  },
  {
    value: 'EXPIRED',
    meaning: '已失效',
    orderSeq: 40,
  },
  {
    value: 'REJECT',
    meaning: '已拒绝',
    orderSeq: 43,
  },
  {
    value: 'AFTER_SUP_CONFIRM',
    meaning: '供应商确认前变更',
    orderSeq: 50,
  },
  {
    value: 'BEFORE_SUP_CONFIRM',
    meaning: '供应商确认后变更',
    orderSeq: 60,
  },
  {
    value: 'REPLENISHING',
    meaning: '补充协议中',
    orderSeq: 70,
  },
  {
    value: 'SUPPLEMENT_COMPLETE',
    meaning: '补充完成',
    orderSeq: 80,
  },
  {
    value: 'PURCHASER_SIGN_CONTRACT',
    meaning: '采购方签署',
    orderSeq: 90,
  },
  {
    value: 'SUPPLIER_SIGN_CONTRACT',
    meaning: '供应方签署',
    orderSeq: 95,
  },
];