/*
 * @Date: 2022-12-08 15:12:22
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const getQueryParams = status => {
  switch (status) {
    case 'waitSubmit':
      return {
        queryStatus: 'NEW',
        unitCode: [
          'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.SUBMIT',
          'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.WAIT_SUBMIT_SEARCH_BAR',
        ],
      };
    case 'approval':
      return {
        queryStatus: 'APPROVING',
        unitCode: [
          'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.APPROVAL',
          'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.APPROVAL_SEARCH_BAR',
        ],
      };
    case 'all':
      return {
        queryStatus: 'ALL',
        unitCode: [
          'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.ALL',
          'SSLM.LIFE_CYCLE.DOCUMENTS_LIST.ALL_SEARCH_BAR',
        ],
      };
    default:
      return {};
  }
};

// 单据列表ds
export const getDocumentsListDS = status => ({
  selection: status === 'waitSubmit' ? 'multiple' : false,
  primaryKey: 'requisitionId',
  cacheSelection: true,
  dataToJSON: 'selected',
  pageSize: 20,
  fields: [
    {
      name: 'processStatus',
      lookupCode: 'SSLM.LIFE_CYCLE_REQ_STATUS',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'operation',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'documentNumber',
      label: intl.get('sslm.common.view.document.number').d('单据编号'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.common.view.supplier.supplierCompany').d('供应商'),
    },
    {
      name: 'dimensionCode',
      lookupCode: 'SSLM.LIFE_CYCLE_DIMENSION',
      label: intl.get('sslm.supplierLifeManage.model.supplier.dimension').d('管控维度'),
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.company.name').d('公司'),
    },
    {
      name: 'documentType',
      lookupCode: 'SSLM.LIFE_CYCLE_CHANGE_DOCUMENT_TYPE',
      label: intl.get('sslm.common.view.document.type').d('单据类型'),
    },
    {
      name: 'fromStageId',
      lookupCode: 'SSLM.LIFE_CYCLE_STAGE',
      label: intl.get('sslm.common.view.sourceStage').d('起始阶段'),
    },
    {
      name: 'toStageId',
      lookupCode: 'SSLM.LIFE_CYCLE_STAGE',
      label: intl.get('sslm.common.view.targetStage').d('目标阶段'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.common.view.creator.name').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sslm.common.view.creation.time').d('创建时间'),
    },
    {
      name: 'applyStrategy',
      label: intl.get('sslm.common.view.applyStrategy').d('适用策略'),
    },
    {
      name: 'operation',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      label: intl.get('sslm.common.model.approve.approveDate').d('审批完成日期'),
      name: 'approveDate',
      type: 'date',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryStatus = '', unitCode = [] } = getQueryParams(status);
      return {
        url: `${SRM_SSLM}/v1/${tenantId}/life-cycle-change-reqss`,
        method: 'GET',
        data: {
          ...data,
          status: queryStatus,
          customizeUnitCode: unitCode.join(','),
        },
      };
    },
  },
});
