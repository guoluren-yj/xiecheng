/*
 * @Date: 2022-07-11 11:50:12
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getPlatformSupplierListDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.workbench.model.platformSupplier.supplierName').d('供应商'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.workbench.model.platformSupplier.companyName').d('公司'),
    },
    {
      name: 'categoryDescriptions',
      label: intl.get('sslm.common.view.supplier.class').d('供应商分类'),
    },
    {
      name: 'isShowMonitor',
      label: intl.get('sslm.workbench.model.platformSupplier.enterpriseMonitor').d('企业监控'),
    },
    {
      name: 'isShowScan',
      label: intl.get('sslm.workbench.model.platformSupplier.riskAnalysis').d('风险分析'),
    },
    {
      name: 'sailorAccountManage',
      label: intl
        .get('sslm.workbench.model.platformSupplier.sailorAccountManage')
        .d('供应商销售员管理'),
    },
    {
      name: 'purchaseAgentNameJoint',
      label: intl.get('sslm.common.model.buyer').d('采购员'),
    },
    {
      name: 'categoryName',
      label: intl.get('sslm.workbench.model.platformSupplier.category').d('品类'),
    },
    {
      name: 'itemName',
      label: intl.get('sslm.workbench.model.platformSupplier.item').d('物料'),
    },
    {
      name: 'supplyFlag',
      label: intl.get('sslm.workbench.model.platformSupplier.supplyFlag').d('是否可供'),
    },
    {
      name: 'supplyStatus',
      label: intl.get('sslm.workbench.model.platformSupplier.supplyStatus').d('可供状态'),
    },
    {
      name: 'contactName',
      label: intl.get('sslm.workbench.model.platformSupplier.defaultContact').d('默认联系人'),
    },
    {
      name: 'contactPhone',
      label: intl.get('sslm.workbench.model.platformSupplier.mobilePhone').d('手机号'),
    },
    {
      name: 'erpNum',
      label: intl.get('sslm.workbench.model.platformSupplier.erpSupplierNum').d('ERP供应商编码'),
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sslm.common.modal.common.socialCode').d('统一社会信用代码'),
    },
    {
      name: 'businessRegistrationNumber',
      label: intl.get('sslm.common.modal.common.registrationNumber').d('企业注册登记号/税号'),
    },
    {
      name: 'dunsCode',
      label: intl.get('sslm.common.modal.common.dunsCode').d('邓白氏编码'),
    },
    {
      name: 'stageDescription',
      label: intl.get('sslm.workbench.model.platformSupplier.lifeCycleStage').d('生命周期阶段'),
    },
    {
      name: 'gradeTypeMeaning',
      label: intl.get('sslm.workbench.model.platformSupplier.gradeApplication').d('升降级单据'),
    },
    {
      name: 'lifeCycleHistory',
      label: intl.get('sslm.workbench.model.platformSupplier.lifeCycleHistory').d('生命周期历史'),
    },
    {
      name: 'applyStrategy',
      label: intl.get('sslm.workbench.model.platformSupplier.applyStrategy').d('适用策略'),
    },
    {
      name: 'dimensionCode',
      lookupCode: 'SSLM.LIFE_CYCLE_DIMENSION_CODE',
      label: intl
        .get('sslm.workbench.model.platformSupplier.lifecycleDimension')
        .d('生命周期管控维度'),
    },
    {
      name: 'documentsManage',
      label: intl.get('sslm.workbench.model.platformSupplier.documentsManage').d('单据管理'),
    },
    {
      name: 'riskManages',
      label: intl.get('sslm.workbench.model.platformSupplier.riskManage').d('风险管理'),
    },
    {
      name: 'joinMonitor',
      label: intl.get('sslm.workbench.model.platformSupplier.isMonitor').d('加入监控'),
    },
    {
      name: 'riskScanning',
      label: intl.get('sslm.workbench.model.platformSupplier.isScan').d('风险扫描'),
    },
    {
      name: 'riskHistory',
      label: intl.get('sslm.workbench.model.platformSupplier.riskHistory').d('风险扫描历史'),
    },
    {
      name: 'electronicAuthStatus',
      label: intl
        .get('sslm.common.model.supplier.platform.thirdServiceAuthStatus')
        .d('电子签章认证状态'),
    },
    {
      name: 'thirdServiceAuthStatus',
      label: intl
        .get('sslm.common.model.supplier.platform.thirdServiceAuthStatus')
        .d('电子签章认证状态'),
    },
    {
      name: 'riskScanDate',
      type: 'dateTime',
      label: intl.get('sslm.common.view.common.riskScanDate').d('最新风险扫描时间'),
    },
    {
      name: 'riskLevelMeaning',
      label: intl.get('sslm.common.view.common.riskLevel').d('风险等级'),
    },
    {
      name: 'fileUrl',
      label: intl.get('sslm.common.view.common.latestRiskReport').d('最新风险报告'),
    },
    {
      name: 'relationSearch',
      label: intl.get('sslm.common.view.common.relationSearch').d('关系排查'),
    },
    {
      name: 'latestCheckTime',
      type: 'dateTime',
      label: intl.get('sslm.common.view.common.latestRelationDate').d('最新关系排查时间'),
    },
    {
      name: 'latestCheckFileUrl',
      label: intl.get('sslm.common.view.common.latestRelationReport').d('最新关系排查报告'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...others } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-workbench/supplier`,
        method: 'GET',
        data: {
          ...queryParams,
          ...others,
        },
      };
    },
  },
});

export { getPlatformSupplierListDS };
