/*
 * @Date: 2022-03-10 11:55:18
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Modal, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { PUBLIC_BUCKET } from '_utils/config';
import { downloadFileByAxios } from 'services/api';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { exportOperationRecord } from '@/services/commonService';
import Content from './Content';

const tenantId = getCurrentOrganizationId();

// 需展示查询条件和导出的单据
const documentTypeList = [
  'LIFE_CYCLE_MANAGE', // 生命周期管理工作台
  'REPORT_EVAL', // 采购方评估工作台 - 管理
  'REPORT_EVAL_SUBMIT', // 采购方评估工作台 - 评分
  'EVAL_PLAN', // 评估计划
  'EVAL_MANAGE', // 采购方绩效考评工作台
  'EVAL_MANAGE_SUBMIT', // 绩效考评-评分
  'SUPPLY_ABILITY_CHANGE_REQ', // 供货能力申请单
  'QUOTA_APPLICATION', // 配额申请单、配额主数据
  'SUPPLIER_INFO_CHANGE', // 供应商信息变更单
  'ENTERPRISE_TENANT_CONFIRM', // 企业信息变更
  'ENTERPRISE_PLATFORM_CONFIRM', // 企业信息变更确认
  'INVESTIGATE', // 采购方调查表工作台
  'simpleSupplier', // 简易入库
  'SUPPLIER_ENTRY', // 供应商录入
  'ENTERPRISE_APPROVAL_TENANT', // 供应商邀约管理-认证处理
];

const handleExport = (documentId, documentType, filterBarRef) => {
  const filterBarValues = filterBarRef?.getQueryParameter() || {};
  const { operateTime, ...rest } = filterBarValues;
  const newOperateTime = operateTime?.split(',') || [];
  return exportOperationRecord({
    ...rest,
    documentId,
    documentType,
    operateTimeFrom: newOperateTime[0],
    operateTimeTo: newOperateTime[1],
  }).then(response => {
    const res = getResponse(response);
    if (res) {
      const api = `${HZERO_FILE}/v1/${tenantId}/files/download`;
      const queryParams = [
        { name: 'url', value: res },
        { name: 'bucketName', value: `${PUBLIC_BUCKET}` },
      ];
      downloadFileByAxios({ requestUrl: api, queryParams });
    }
  });
};

export function operationRecordsModal(config = {}) {
  const { documentId, documentType, changeReqId } = config;
  const showFlag = documentTypeList.includes(documentType);
  const newDocumentId = documentType === 'ENTERPRISE_TENANT_CONFIRM' ? changeReqId : documentId;
  let filterBarRef = null;
  Modal.open({
    key: Modal.key(),
    movable: false,
    drawer: true,
    okCancel: false,
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    title: intl.get('hzero.common.button.operating').d('操作记录'),
    children: (
      <Content
        showFlag={showFlag}
        {...config}
        onRef={ref => {
          filterBarRef = ref;
        }}
      />
    ),
    footer: okBtn => (
      <div>
        {okBtn}
        <Button
          hidden={!showFlag}
          onClick={() => handleExport(newDocumentId, documentType, filterBarRef)}
        >
          {intl.get('hzero.common.button.export').d('导出')}
        </Button>
      </div>
    ),
  });
}
