// 澄清答疑-问题维护Tab-问题详情
export function getQueUpdateDetailCode(bidFlag) {
  return !bidFlag
    ? {
        // 我的问题表格
        tableCode: `SSRC.SUPPLIER_CLARIFICATION.DETAIL_QUESTION_TABLE`,
      }
    : {};
}

// 澄清答疑-查看澄清函-澄清函详情
export function getQueClarifyDetailCode(bidFlag) {
  return !bidFlag
    ? {
        // 关联问题表格
        tableCode: `SSRC.SUPPLIER_CLARIFICATION.CLARIFICATION_DETAIL_TABLE`,
      }
    : {};
}
