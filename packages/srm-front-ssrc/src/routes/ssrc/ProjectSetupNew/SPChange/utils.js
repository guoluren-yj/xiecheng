import { isEmpty } from 'lodash';

import { filterCustomizeCodes } from '@/utils/utils';

// 获取个性化编码
export function getCustomizeUnitCode(codeName) {
  if (!codeName || isEmpty(codeName)) return null;

  // 个性化编码集合
  const codeMap = new Map([
    // ------------------------ 标题卡片个性化单元 start --------------------------------
    ['baseInfoCard', 'SSRC.SOURCE_PROJECT_CHANGE.BASE_INFO_CARD'], // 基础信息标题卡片
    ['purAndOrgCard', 'SSRC.SOURCE_PROJECT_CHANGE.PUR_AND_ORG_CARD'], // 采购组织及人员标题卡片
    ['itemInfoCard', 'SSRC.SOURCE_PROJECT_CHANGE.ITEM_INFO_CARD'], // 物料信息标题卡片
    ['reqOnSupplierCard', 'SSRC.SOURCE_PROJECT_CHANGE.REQ_ON_SUPPLIER_CARD'], // 对供应商要求标题卡片
    ['sourceDemandCard', 'SSRC.SOURCE_PROJECT_CHANGE.SOURCE_DEMAND_CAR'], // 寻源要求标题卡片
    ['projectPlanCard', 'SSRC.SOURCE_PROJECT_CHANGE.PROJECT_PLAN_CARD'], // 项目计划标题卡片
    ['attachmentCard', 'SSRC.SOURCE_PROJECT_CHANGE.ATTACHMENT_CAR'], // 附件标题卡片
    // ------------------------ 标题卡片个性化单元 end -----------------------------------
    ['headerButton', 'SSRC.SOURCE_PROJECT_CHANGE.HEADER_BUTTONS'], // 头按钮
    ['baseInfoForm', 'SSRC.SOURCE_PROJECT_CHANGE.BASIC_INFO_FORM'], // 基础信息form
    ['purOrgDemandForm', 'SSRC.SOURCE_PROJECT_CHANGE.PUR_ORG_DEMAND_FORM'], // 采购组织及人员-需求方form
    ['purOrgExecutorForm', 'SSRC.SOURCE_PROJECT_CHANGE.PUR_ORG_EXECUTOR_FORM'], // 采购组织及人员-执行人form
    ['sourceDemandForm', 'SSRC.SOURCE_PROJECT_CHANGE.SOURCE_DEMAND_FORM'], // 寻源要求form
    ['sourceMethodForm', 'SSRC.SOURCE_PROJECT_CHANGE.SOURCE_METHOD_FORM'], // 对供应商要求-寻源方式form
    ['attachmentForm', 'SSRC.SOURCE_PROJECT_CHANGE.ATTACHMENT_FORM'], // 附件form
    ['itemLineTableBtn', 'SSRC.SOURCE_PROJECT_CHANGE.ITEM_LINE_TABLE_BUTTONS'], // 物料信息-标的物table-表格按钮
    ['itemLineTable', 'SSRC.SOURCE_PROJECT_CHANGE.ITEM_LINE_TABLE'], // 物料信息-标的物table
    ['secAndPacketTableBtn', 'SSRC.SOURCE_PROJECT_CHANGE.SEC_AND_PACKET_TABLE_BUTTONS'], // 物料信息-标段/包信息-表格按钮
    ['secAndPacketTable', 'SSRC.SOURCE_PROJECT_CHANGE.SEC_AND_PACKET_TABLE'], // 物料信息-标段/包信息table
    ['supplierTableBtn', 'SSRC.SOURCE_PROJECT_CHANGE.SUPPLIER_TABLE_BUTTONS'], // 供应商table-表格按钮
    ['supplierTable', 'SSRC.SOURCE_PROJECT_CHANGE.SUPPLIER_TABLE'], // 供应商table
    ['projectPlanTableBtn', 'SSRC.SOURCE_PROJECT_CHANGE.PROJECT_PLAN_TABLE_BUTTONS'], // 项目计划table-表格按钮
    ['projectPlanTable', 'SSRC.SOURCE_PROJECT_CHANGE.ROJECT_PLAN_TABLE'], // 项目计划table
    ['allotItemLineTableBtn', 'SSRC.SOURCE_PROJECT_CHANGE.ALLOT_ITEM_LINE_TABLE_BUTTONS'], // 标段分配物料弹框-表格按钮
    ['allotItemLineTable', 'SSRC.SOURCE_PROJECT_CHANGE.ALLOT_ITEM_LINE_TABLE'], // 标段分配物料弹框
  ]);
  return filterCustomizeCodes(codeMap, codeName);
}
