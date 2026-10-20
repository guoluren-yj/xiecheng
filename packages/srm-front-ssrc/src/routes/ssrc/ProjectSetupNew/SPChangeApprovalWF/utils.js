import React from 'react';
import { isEmpty, isArray, intersection } from 'lodash';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';

import { filterCustomizeCodes } from '@/utils/utils';

import Style from './index.less';

// 获取个性化编码
export function getCustomizeUnitCode(codeName) {
  if (!codeName || isEmpty(codeName)) return null;

  // 个性化编码集合
  const codeMap = new Map([
    // ------------------------ 标题卡片个性化单元 start --------------------------------
    ['headerInfoCard', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.HEADER_INFO_CARD'], // 头信息标题卡片
    ['baseInfoCard', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.BASE_INFO_CARD'], // 基础信息标题卡片
    ['purAndOrgCard', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.PUR_AND_ORG_CARD'], // 采购组织及人员标题卡片
    ['itemInfoCard', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.ITEM_INFO_CARD'], // 物料信息标题卡片
    ['reqOnSupplierCard', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.REQ_ON_SUPPLIER_CARD'], // 对供应商要求标题卡片
    ['sourceDemandCard', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.SOURCE_DEMAND_CARD'], // 寻源要求标题卡片
    ['projectPlanCard', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.PROJECT_PLAN_CARD'], // 项目计划标题卡片
    ['attachmentCard', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.ATTACHMENT_CARD'], // 附件标题卡片
    // ------------------------ 标题卡片个性化单元 end -----------------------------------
    ['headerAfCard', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.HEADER_AF_CARD'], // 头信息基础卡片
    ['headerAfCardButtons', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.HEADER_AF_CARD_BUTTONS'], // 头信息基础卡片-按钮组
    ['baseInfoForm', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.ASIC_INFO_FORM'], // 基础信息form
    ['purOrgDemandForm', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.PUR_ORG_DEMAND_FORM'], // 采购组织及人员-需求方form
    ['purOrgExecutorForm', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.PUR_ORG_EXECUTOR_FORM'], // 采购组织及人员-执行人form
    ['sourceDemandForm', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.SOURCE_DEMAND_FORM'], // 寻源要求form
    ['sourceMethodForm', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.SOURCE_METHOD_FORM'], // 对供应商要求-寻源方式form
    ['attachmentForm', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.ATTACHMENT_FORM'], // 附件form
    ['itemLineTable', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.ITEM_LINE_TABLE'], // 物料信息-标的物table
    ['secAndPacketTable', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.SEC_AND_PACKET_TABLE'], // 物料信息-标段/包信息table
    ['supplierTable', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.SUPPLIER_TABLE'], // 供应商table
    ['projectPlanTable', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.PROJECT_PLAN_TABLE'], // 项目计划table
    ['viewItemLineTable', 'SSRC.SOURCE_PROJECT_CHANGE_APPROVE.VIEW_ITEM_LINE_TABLE'], // 标段分配物料弹框
  ]);
  return filterCustomizeCodes(codeMap, codeName);
}

// 渲染变更字段
export function renderChangeFieldsColor({ record, name, value }) {
  const { changeType, changeFields } = record?.get(['changeType', 'changeFields']) || {};
  // 新增或者修改的flag
  let addOrModifiedFlag = changeType === 'ADD';

  // 传入name有多个 如果changeFields和name list有交集，则标红
  if (
    (changeType === 'MODIFY' &&
      isArray(name) &&
      changeFields &&
      intersection(name, changeFields).length > 0) ||
    intersection(name, changeFields).length > 0
  ) {
    addOrModifiedFlag = true;
  } else {
    // 传入name是字符串
    addOrModifiedFlag =
      addOrModifiedFlag ||
      (changeType === 'MODIFY' && changeFields?.includes(name)) ||
      changeFields?.includes(name);
  }

  if (changeType === 'DELETE') {
    return (
      <span className={`${Style['sp-change-red']} ${Style['sp-change-delete']}`}>
        {value ?? '-'}
      </span>
    );
  } else if (addOrModifiedFlag) {
    return <span className={Style['sp-change-red']}>{value ?? '-'}</span>;
  }
  return value;
}

// 渲染表格字段tag
export function renderFieldTag({ record }) {
  const { changeType, changeTypeMeaning } = record?.get(['changeType', 'changeTypeMeaning']) || {};
  const colorMap = new Map([
    ['ADD', 'green'],
    ['DELETE', 'red'],
    ['MODIFY', 'orange'],
    ['NONE', 'gray'],
  ]);

  return (
    <Tag color={colorMap.get(changeType) ?? 'gray'} border={false}>
      {changeTypeMeaning ?? intl.get('ssrc.projectSetup.model.spChange.unChange').d('未变更')}
    </Tag>
  );
}
