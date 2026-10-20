/**
 * PCN工作台DS
 * @date: 2021-06-07
 * @author: ZYF <yanfengz.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { BUCKET_NAME, BUCKET_DIRECTORY } from '@/routes/components/utils/constant';

const organizationId = getCurrentOrganizationId();
const SRM_SIEC = '/siec';

const pcnmanageWorkbenchDS = ({ queryFlag = '0', id } = {}) => ({
  autoQuery: false,
  primaryKey: id,
  dataToJSON: 'selected',
  cacheSelection: true, // 跨页勾选
  pageSize: 20,
  fields: [
    {
      name: 'operate',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.operate`).d('操作'),
    },
    {
      name: 'pcnNum',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.pcnNum`).d('变更单号'),
    },
    {
      name: 'statusCode',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.statusCode`).d('状态'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.supplierCompanyId`).d('供应商'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.client`).d('客户'),
    },
    {
      name: 'typeName',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.pcnTypeId`).d('变更类型'),
    },
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.lineNum`).d('行号'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.itemName`).d('物料名称'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.categoryName`).d('物料品类'),
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.uomName`).d('单位'),
    },
    {
      name: 'supplierInventoryQuantity',
      type: 'number',
      label: intl.get(`siec.pcnmanageWorkbench.view.supplierInventoryQuantity`).d('供应商库存'),
    },
    {
      name: 'supplierProcessingMethod',
      type: 'string',
      label: intl
        .get(`siec.pcnmanageWorkbench.view.supplierProcessingMethod`)
        .d('供应商库存处理方式'),
    },
    {
      name: 'buyerInventoryQuantity',
      type: 'number',
      label: intl.get(`siec.pcnmanageWorkbench.view.buyerInventoryQuantity`).d('采购方库存'),
    },
    {
      name: 'buyerProcessingMethod',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.buyerProcessingMethod`).d('采购方库存处理方式'),
    },
    {
      name: 'attachmentUuidLine',
      type: 'attachment',
      label: intl.get(`siec.pcnmanageWorkbench.view.attachmentUuidLine`).d('行附件'),
      bucketName: BUCKET_NAME,
      bucketDirectory: BUCKET_DIRECTORY,
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.createdByName`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`siec.pcnmanageWorkbench.view.creationDate`).d('创建时间'),
    },
    {
      name: 'effectiveDate',
      type: 'date',
      label: intl.get(`siec.pcnmanageWorkbench.view.effectiveDate`).d('变更生效日期'),
    },
    {
      name: 'finalEffectiveDate',
      type: 'date',
      label: intl.get(`siec.pcnmanageWorkbench.view.finalEffectiveDate`).d('最终变更生效日期'),
    },
    // {
    //   name: 'evaluationOpinionMeaning',
    //   type: 'string',
    //   label: intl.get(`siec.pcnmanageWorkbench.view.evaluationOpinion`).d('评估意见'),
    // },
    {
      name: 'evaluationOpinion',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.evaluationOpinion`).d('评估意见'),
      lookupCode: 'SIEC.PCN_EVALUATION_OPINION',
      multiple: ',',
    },
    {
      name: 'supplierPrincipal',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.supplierPrincipal`).d('供应方产品负责人'),
    },
    {
      name: 'principalContact',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.principalContact`).d('负责人联系方式'),
    },
    {
      name: 'principalEmail',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.principalEmail`).d('负责人邮箱地址'),
    },
    {
      name: 'importStatusMeaning',
      type: 'string',
      label: intl.get(`sinv.common.model.common.erpSyncStatus`).d('导出状态'),
    },
    {
      name: 'operationRecord',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.operationHistory`).d('操作历史'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { statusConfigId = '' } = data;
      if (statusConfigId) {
        return {
          url: `${SRM_SIEC}/v1/${organizationId}/pcn-headers/supplier`,
          method: 'GET',
          data: {
            ...data,
            queryFlag,
            customizeUnitCode:
              queryFlag === '0'
                ? 'SIEC.WORKSPACE_LIST.SEARCHBAR_PCN,SIEC.WORKSPACE_LIST.LIST'
                : 'SIEC.WORKSPACE_LIST.SEARCHBAR_PCN_ALL,SIEC.WORKSPACE_LIST.ALL_LIST',
          },
        };
      }
    },
  },
});

const operationTableDs = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'operator',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.operator`).d('操作人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`siec.pcnmanageWorkbench.view.operationTime`).d('操作时间'),
    },
    {
      name: 'operationCode',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.operationCode`).d('操作编码'),
    },
    {
      name: 'operationName',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.operationName`).d('动作'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`siec.pcnmanageWorkbench.view.remark`).d('说明'),
    },
  ],
  transport: {
    read: (value) => {
      const {
        data: { pcnHeaderId },
      } = value;
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/pcn-headers/history/${pcnHeaderId}`,
        method: 'GET',
      };
    },
  },
});
export { pcnmanageWorkbenchDS, operationTableDs };
