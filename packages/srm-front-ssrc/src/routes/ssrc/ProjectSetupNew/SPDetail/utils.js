import { isEmpty } from 'lodash';

import { filterCustomizeCodes } from '@/utils/utils';

// 获取明细个性化编码
export function getCustomizeUnitCode(codeName, otherPayload) {
  if (!codeName || isEmpty(codeName)) return null;

  const { pageSourceCategory = 'detail' } = otherPayload || {};

  // 个性化编码集合-明细
  const detailCodeMap = new Map([
    // ------------------------ 标题卡片个性化单元 start --------------------------------
    ['baseInfoCard', 'SSRC.SOURCE_PROJECT_DETAIL.BASE_INFO_CARD'], // 基础信息标题卡片
    ['purAndOrgCard', 'SSRC.SOURCE_PROJECT_DETAIL.PUR_AND_ORG_CARD'], // 采购组织及人员标题卡片
    ['itemInfoCard', 'SSRC.SOURCE_PROJECT_DETAIL.ITEM_INFO_CARD'], // 物料信息标题卡片
    ['reqOnSupplierCard', 'SSRC.SOURCE_PROJECT_DETAIL.REQ_ON_SUPPLIER_CARD'], // 对供应商要求标题卡片
    ['sourceDemandCard', 'SSRC.SOURCE_PROJECT_DETAIL.SOURCE_DEMAND_CARD'], // 寻源要求标题卡片
    ['projectPlanCard', 'SSRC.SOURCE_PROJECT_DETAIL.PROJECT_PLAN_CARD'], // 项目计划标题卡片
    ['attachmentCard', 'SSRC.SOURCE_PROJECT_DETAIL.ATTACHMENT_CARD'], // 附件标题卡片
    // ------------------------ 标题卡片个性化单元 end -----------------------------------
    ['baseInfoForm', 'SSRC.SOURCE_PROJECT_DETAIL.BASIC_INFO_FORM'], // 基础信息form
    ['purOrgDemandForm', 'SSRC.SOURCE_PROJECT_DETAIL.PUR_ORG_DEMAND_FORM'], // 采购组织及人员-需求方form
    ['purOrgExecutorForm', 'SSRC.SOURCE_PROJECT_DETAIL.PUR_ORG_EXECUTOR_FORM'], // 采购组织及人员-执行人form
    ['sourceDemandForm', 'SSRC.SOURCE_PROJECT_DETAIL.SOURCE_DEMAND_FORM'], // 寻源要求form
    ['sourceMethodForm', 'SSRC.SOURCE_PROJECT_DETAIL.SOURCE_METHOD_FORM'], // 对供应商要求-寻源方式form
    ['attachmentForm', 'SSRC.SOURCE_PROJECT_DETAIL.ATTACHMENT_FORM'], // 附件form
    ['itemLineTable', 'SSRC.SOURCE_PROJECT_DETAIL.ITEM_LINE_TABLE'], // 物料信息-标的物table
    ['secAndPacketTable', 'SSRC.SOURCE_PROJECT_DETAIL.SEC_AND_PACKET_TABLE'], // 物料信息-标段/包信息table
    ['supplierTable', 'SSRC.SOURCE_PROJECT_DETAIL.SUPPLIER_TABLE'], // 供应商table
    ['projectPlanTable', 'SSRC.SOURCE_PROJECT_DETAIL.PROJECT_PLAN_TABLE'], // 项目计划table
    ['viewItemLineTable', 'SSRC.SOURCE_PROJECT_DETAIL.ALLOT_ITEM_LINE_TABLE'], // 标段分配物料弹框
  ]);

  // 个性化编码集合-版本查看
  const versionCodeMap = new Map([
    // ------------------------ 标题卡片个性化单元 start --------------------------------
    ['baseInfoCard', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.BASE_INFO_CARD'], // 基础信息标题卡片
    ['purAndOrgCard', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.PUR_AND_ORG_CARD'], // 采购组织及人员标题卡片
    ['itemInfoCard', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.ITEM_INFO_CARD'], // 物料信息标题卡片
    ['reqOnSupplierCard', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.REQ_ON_SUPPLIER_CARD'], // 对供应商要求标题卡片
    ['sourceDemandCard', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.SOURCE_DEMAND_CARD'], // 寻源要求标题卡片
    ['projectPlanCard', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.PROJECT_PLAN_CARD'], // 项目计划标题卡片
    ['attachmentCard', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.ATTACHMENT_CARD'], // 附件标题卡片
    // ------------------------ 标题卡片个性化单元 end -----------------------------------
    ['headerButtons', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.HEADER_BUTTON_GROUP'], // 页面头按钮组
    ['baseInfoForm', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.BASIC_INFO_FORM'], // 基础信息form
    ['purOrgDemandForm', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.PUR_ORG_DEMAND_FORM'], // 采购组织及人员-需求方form
    ['purOrgExecutorForm', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.PUR_ORG_EXECUTOR_FORM'], // 采购组织及人员-执行人form
    ['sourceDemandForm', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.SOURCE_DEMAND_FORM'], // 寻源要求form
    ['sourceMethodForm', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.SOURCE_METHOD_FORM'], // 对供应商要求-寻源方式form
    ['attachmentForm', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.ATTACHMENT_FORM'], // 附件form
    ['itemLineTable', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.ITEM_LINE_TABLE'], // 物料信息-标的物table
    ['secAndPacketTable', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.SEC_AND_PACKET_TABLE'], // 物料信息-标段/包信息table
    ['supplierTable', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.SUPPLIER_TABLE'], // 供应商table
    ['projectPlanTable', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.PROJECT_PLAN_TABLE'], // 项目计划table
    ['viewItemLineTable', 'SSRC.SOURCE_PROJECT_VERSION_VIEW.ALLOT_ITEM_LINE_TABLE'], // 标段分配物料弹框
  ]);

  // 个性化编码集合-审批
  const approvalCodeMap = new Map([
    // ------------------------ 标题卡片个性化单元 start --------------------------------
    ['headerInfoCard', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.HEADER_INFO_CARD'], // 头信息标题卡片
    ['baseInfoCard', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.BASE_INFO_CARD'], // 基础信息标题卡片
    ['purAndOrgCard', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.PUR_AND_ORG_CARD'], // 采购组织及人员标题卡片
    ['itemInfoCard', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.ITEM_INFO_CARD'], // 物料信息标题卡片
    ['reqOnSupplierCard', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.REQ_ON_SUPPLIER_CARD'], // 对供应商要求标题卡片
    ['sourceDemandCard', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.SOURCE_DEMAND_CARD'], // 寻源要求标题卡片
    ['projectPlanCard', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.PROJECT_PLAN_CARD'], // 项目计划标题卡片
    ['attachmentCard', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.ATTACHMENT_CARD'], // 附件标题卡片
    // ------------------------ 标题卡片个性化单元 end -----------------------------------
    ['headerAfCard', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.HEADER_BASIC_AF_CARD'], // 头信息基础卡片
    ['headerAfCardButtons', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.HEADER_AF_CARD_BUTTONS'], // 头信息基础卡片-按钮组
    ['baseInfoForm', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.BASIC_INFO_FORM'], // 基础信息form
    ['purOrgDemandForm', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.PUR_ORG_DEMAND_FORM'], // 采购组织及人员-需求方form
    ['purOrgExecutorForm', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.PUR_ORG_EXECUTOR_FORM'], // 采购组织及人员-执行人form
    ['sourceDemandForm', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.SOURCE_DEMAND_FORM'], // 寻源要求form
    ['sourceMethodForm', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.SOURCE_METHOD_FORM'], // 对供应商要求-寻源方式form
    ['attachmentForm', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.ATTACHMENT_FORM'], // 附件form
    ['itemLineTable', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.ITEM_LINE_TABLE'], // 物料信息-标的物table
    ['secAndPacketTable', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.SEC_AND_PACKET_TABLE'], // 物料信息-标段/包信息table
    ['supplierTable', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.SUPPLIER_TABLE'], // 供应商table
    ['projectPlanTable', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.PROJECT_PLAN_TABLE'], // 项目计划table
    ['viewItemLineTable', 'SSRC.SOURCE_PROJECT_RELEASE_APPROVAL.ALLOT_ITEM_LINE_TABLE'], // 标段分配物料弹框
  ]);

  const mapDto = {
    detail: detailCodeMap,
    version: versionCodeMap,
    approval: approvalCodeMap,
  };

  return filterCustomizeCodes(mapDto[pageSourceCategory] || detailCodeMap, codeName);

}

