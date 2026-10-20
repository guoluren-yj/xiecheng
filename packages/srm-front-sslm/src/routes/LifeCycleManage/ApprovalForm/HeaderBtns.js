/*
 * @Date: 2023-09-06 17:11:19
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import React from 'react';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import DynamicButtons from '_components/DynamicButtons';

import { riskScan } from '@/routes/LifeCycleManage/utils';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import ApplyStrategy from '@/routes/Workbench/PlatformSupplier/ApplyStrategy';

const Index = ({
  record,
  loading,
  headerInfo,
  sourceType,
  customizeBtnGroup,
  onSupplement,
  workflowFlag = false,
}) => {
  // 关联业务单据回调
  const handleRelatedDoc = () => {
    const { companyId, requisitionId, toStageId, supplierCompanyId, supplierTenantId } = headerInfo;
    openTab({
      title: 'hzero.common.view.title.supplierRelatedDoc',
      key: '/sslm/supplier-related-doc/list',
      path: '/sslm/supplier-related-doc/list',
      search: querystring.stringify({
        companyId,
        toStageId,
        requisitionId,
        supplierCompanyId,
        supplierTenantId, // src-31940 用于关联单据查询供应商分类
      }),
    });
  };

  // 操作记录回调
  const handleOperationRecord = () => {
    const { requisitionId } = headerInfo;
    const params = { documentType: 'LIFE_CYCLE_MANAGE', documentId: requisitionId };
    operationRecordsModal(params);
  };

  // 适用策略查看
  const viewApplyStrategy = () => {
    const { strategyName, versionNumber } = record.get(['strategyName', 'versionNumber']);
    const curVersion = intl
      .get('sslm.common.view.version', {
        name: versionNumber,
      })
      .d(`版本${versionNumber}`);
    Modal.open({
      drawer: true,
      okCancel: false,
      style: { width: 1200 },
      key: 'lifeCycleHistory',
      bodyStyle: { background: '#F7F8FA', padding: 0 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: strategyName
        ? intl
            .get('sslm.common.model.title.applyStrategy', {
              strategyName,
              versionNumber: curVersion,
            })
            .d(`适用策略-${strategyName}-${curVersion}`)
        : intl.get('sslm.workbench.model.platformSupplier.applyStrategy').d('适用策略'),
      children: <ApplyStrategy record={record} />,
    });
  };

  // 头按钮集合
  const buttons = [
    {
      name: 'infoSupplement',
      hidden: !workflowFlag,
      child: intl.get('sslm.common.model.field.infoSupplement').d('信息补录'),
      btnProps: {
        loading,
        color: 'primary',
        icon: 'mode_edit',
        onClick: onSupplement,
      },
    },
    {
      name: 'operationRecord',
      child: intl.get('hzero.common.button.operation').d('操作记录'),
      btnProps: {
        funcType: 'flat',
        icon: 'operation_service_request',
        onClick: handleOperationRecord,
      },
    },
    {
      name: 'applyStrategy',
      child: intl.get('sslm.common.view.applyStrategy').d('适用策略'),
      btnProps: {
        icon: 'timeline',
        funcType: 'flat',
        onClick: viewApplyStrategy,
      },
    },
    {
      name: 'supplierRelatedDoc',
      child: intl.get('sslm.common.view.supplierRelatedDoc').d('关联业务单据'),
      btnProps: {
        icon: 'library_books',
        funcType: 'flat',
        onClick: handleRelatedDoc,
      },
    },
    {
      name: 'supplierInfo',
      child: intl.get('sslm.common.view.button.supplierInfo').d('供应商360信息'),
      btnProps: {
        icon: 'domain_list',
        funcType: 'flat',
        onClick: () => handleSupplierDetail({ ...headerInfo, sourceType }),
      },
    },
    {
      name: 'riskScan',
      child: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
      btnProps: {
        icon: 'document_scanner-o',
        funcType: 'flat',
        onClick: () => riskScan(headerInfo),
      },
    },
  ].map(btn => ({ loading, waitType: 'throttle', wait: 300, ...btn }));

  return customizeBtnGroup(
    {
      code: 'SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.HEADER_BTNS',
      pro: true,
    },
    <DynamicButtons
      maxNum={5}
      trigger="hover"
      buttons={buttons}
      defaultBtnType="c7n-pro"
      unitCode="SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.HEADER_BTNS"
    />
  );
};

export default Index;
