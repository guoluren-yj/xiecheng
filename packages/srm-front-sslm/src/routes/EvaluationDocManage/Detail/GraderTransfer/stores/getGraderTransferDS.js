/*
 * @Date: 2022-09-14 14:29:22
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getGraderTransferDS = ({ evalHeaderId, granularity }) => ({
  autoQuery: true,
  dataToJSON: 'selected',
  cacheSelection: true,
  primaryKey: 'evalDtlRespId',
  queryFields: [
    {
      name: 'indicatorId',
      type: 'object',
      lovCode: 'SSLM.KPI_EVALDTL_INDICATOR',
      lovPara: {
        evalHeaderId,
        tenantId: organizationId,
      },
      label: intl.get('sslm.supplierDocManage.modal.graderTransfer.project').d('评价项目'),
      transformRequest: value => value && value.indicatorId,
    },
    {
      name: 'userId',
      type: 'object',
      lovCode: 'SSLM.KPI_USER',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get(`sslm.supplierDocManage.model.docManage.evaluationPerson`).d('评分人'),
      transformRequest: value => value && value.userId,
    },
    {
      name: 'supplierId',
      type: 'object',
      lovCode: 'SSLM.KPI_DTL_SUPPLIER',
      lovPara: {
        evalHeaderId,
        tenantId: organizationId,
      },
      label: intl.get(`sslm.common.view.supplier.supplierCompany`).d('供应商'),
      transformRequest: value => value && value.supplierId,
    },
    {
      name: 'respWeight',
      type: 'number',
      label: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeightPrec`).d('权重%'),
    },
    granularity === 'SU+CA' && {
      name: 'categoryIds',
      type: 'object',
      lovCode: 'SSLM.KPI_DTL_CATEGORY',
      lovPara: {
        evalHeaderId,
        tenantId: organizationId,
      },
      label: intl.get(`sslm.supplierDocManage.model.docManage.purchaseProduct`).d('采购品类'),
      multiple: true,
      transformRequest: value => (!isEmpty(value) ? value.map(i => i.categoryId) : null),
    },
    granularity === 'SU+IT' && {
      name: 'itemId',
      type: 'object',
      lovCode: 'SSLM.KPI_DTL_ITEM',
      textField: 'itemName',
      lovPara: {
        evalHeaderId,
        tenantId: organizationId,
      },
      label: intl.get(`sslm.supplierDocManage.model.docManage.itemName`).d('物料'),
      transformRequest: value => value && value.itemId,
    },
  ].filter(Boolean),
  fields: [
    {
      name: 'indicatorCode',
      label: intl.get('sslm.supplierDocManage.modal.graderTransfer.projectNum').d('评价项目编号'),
    },
    {
      name: 'indicatorName',
      label: intl.get('sslm.supplierDocManage.modal.graderTransfer.project').d('评价项目'),
    },
    {
      name: 'supplierNum',
      label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
    },
    {
      name: 'supplierName',
      label: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
    },
    {
      name: 'categoryName',
      label: intl.get(`sslm.supplierDocManage.view.docManage.categoryName`).d('参评品类'),
    },
    {
      name: 'itemName',
      label: intl.get(`sslm.supplierDocManage.view.docManage.itemName`).d('参评物料'),
    },
    {
      name: 'completeFlagMeaning',
      label: intl.get(`sslm.supplierDocManage.model.docManage.evaluationStatus`).d('评分状态'),
    },
    {
      name: 'userName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.evaluationPerson`).d('评分人'),
    },
    {
      name: 'respWeight',
      label: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeightPrec`).d('权重%'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/${evalHeaderId}/batch-query-transform`,
      method: 'POST',
    },
  },
});
