import { INQUIRY } from '@/utils/globalVariable';

// 采购方：澄清函维护Tab-新建澄清答疑预览
export function getClarifyUpdateCode(sourceKey = INQUIRY) {
  return {
    // 基础信息
    baseCode: `SSRC.${sourceKey}_HALL.NEW_CLARIFY.PREVIEW`,
    // 关联表格
    tableCode: `SSRC.${sourceKey}_HALL.NEW_CLARIFY.PREVIEW_RELATED_ISSUES_TABLE`,
    // collapse
    collapseCode: `SSRC.${sourceKey}_HALL.NEW_CLARIFY.PREVIEW_COLLAPSE`,
  };
}

// 采购方：澄清函维护Tab-澄清函详情
export function getClarifyDetailCode(sourceKey = INQUIRY) {
  return {
    // 关联表格
    tableCode: `SSRC.${sourceKey}_HALL.NEW_CLARIFY.DETAIL_RELATED_ISSUES_TABLE`,
    // 澄清函基本信息
    baseFormCode: `SSRC.${sourceKey}_HALL.NEW_CLARIFY.DETAIL_RELATED_ISSUES_BASE_FORM`,
    // collapse
    collapseCode: `SSRC.${sourceKey}_HALL.NEW_CLARIFY.DETAIL_COLLAPSE`,
  };
}
