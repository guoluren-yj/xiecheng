import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject, getCurrentTenant } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const { tenantId } = getCurrentTenant();

const getBackScoreDS = params => ({
  autoQuery: true,
  cacheSelection: true,
  autoLocateFirst: false,
  dataToJSON: 'selected',
  primaryKey: 'evalDtlRespId',
  queryFields: [
    {
      name: 'indicatorId',
      type: 'object',
      lovCode: 'SSLM.KPI_EVALDTL_INDICATOR',
      lovPara: {
        tenantId: organizationId,
        evalHeaderId: params.headerId,
      },
      label: intl.get(`sslm.commonApplication.model.commonApplication.description`).d('评价项目'),
      transformRequest: value => value && value.indicatorId,
    },
    {
      name: 'userId',
      type: 'object',
      lovCode: 'SSLM.KPI_USER',
      textField: 'userName',
      lovPara: {
        tenantId: organizationId,
      },
      label: intl.get(`sslm.common.view.scorer`).d('评分人'),
      transformRequest: value => value && value.userId,
    },
    {
      name: 'supplierId',
      type: 'object',
      lovCode: 'SSLM.KPI_DTL_SUPPLIER',
      lovPara: {
        tenantId,
        evalHeaderId: params.headerId,
      },
      label: intl.get(`sslm.supplierDocManage.model.docManage.vendor`).d('供应商'),
      transformRequest: value => value && value.supplierId,
      computedProps: {
        textField: ({ record }) =>
          record.get('erpSupplierName') ? 'erpSupplierName' : 'companyName',
      },
    },

    {
      name: 'categoryIds',
      type: 'object',
      lovCode: 'SSLM.KPI_DTL_CATEGORY',
      lovPara: {
        tenantId,
        evalHeaderId: params.headerId,
      },
      label: intl.get(`sslm.supplierDocManage.model.docManage.purchaseProduct`).d('采购品类'),
      multiple: true,
      transformRequest: value => value && value.map(i => i.categoryId),
    },

    {
      name: 'itemId',
      type: 'object',
      lovCode: 'SSLM.KPI_DTL_ITEM',
      textField: 'itemName',
      lovPara: {
        tenantId,
        evalHeaderId: params.headerId,
      },
      label: intl.get(`sslm.supplierDocManage.model.docManage.itemName`).d('物料'),
      transformRequest: value => value && value.itemId,
    },
  ],
  fields: [
    {
      name: 'indicatorCode',
      label: intl
        .get(`sslm.commonApplication.model.commonApplication.indicateCode`)
        .d('评价项目编号'),
    },
    {
      name: 'indicatorName',
      label: intl.get(`sslm.commonApplication.model.commonApplication.description`).d('评价项目'),
    },
    {
      name: 'supplierNum',
      label: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
    },
    {
      name: 'supplierName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
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
      name: 'completeFlag',
      label: intl.get(`sslm.commonApplication.model.commonApplication.procStatus`).d('评分状态'),
    },
    {
      name: 'completeFlagMeaning',
      label: intl.get(`sslm.commonApplication.model.commonApplication.procStatus`).d('评分状态'),
    },
    {
      name: 'userName',
      label: intl.get(`sslm.common.view.scorer`).d('评分人'),
    },
    {
      name: 'respWeight',
      label: intl.get(`sslm.common.view.weight`).d('权重（%）'),
    },
    {
      name: 'score',
      label: intl.get('sslm.commonApplication.view.message.score').d('得分'),
    },
    {
      name: 'backReason',
      label: intl.get('sslm.commonApplication.model.message.backReason').d('退回原因'),
      dynamicProps: ({ dataSet }) => {
        if (dataSet.isAllPageSelection) {
          return {
            disabled: dataSet.isAllPageSelection,
          };
        }
      },
    },
  ],
  transport: {
    read: ({ data }) => {
      const { headerId } = params;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/${headerId}/batch-query-post`,
        method: 'POST',
        data: filterNullValueObject({ ...data }),
      };
    },
  },
});

const backScoreColumns = granularity => [
  {
    name: 'indicatorCode',
    width: 150,
  },
  {
    name: 'indicatorName',
    width: 150,
  },
  {
    name: 'supplierNum',
    width: 150,
  },
  {
    name: 'supplierName',
    width: 150,
  },
  ...(granularity === 'SU+CA'
    ? [
        {
          name: 'categoryName',
          width: 150,
        },
      ]
    : granularity === 'SU+IT'
    ? [
        {
          name: 'itemName',
          width: 150,
        },
      ]
    : []),
  {
    name: 'completeFlagMeaning',
    width: 80,
    // renderer: ({ value }) => (
    //   <span>
    //     {+value === 1 ? intl.get('sslm.common.model.status.submitted').d('已提交') : value}
    //   </span>
    // ),
  },
  {
    name: 'userName',
    width: 120,
  },
  {
    name: 'respWeight',
    width: 110,
  },
  {
    name: 'score',
    width: 70,
  },
  {
    name: 'backReason',
    width: 120,
    editor: true,
    lock: 'right',
  },
];

export { getBackScoreDS, backScoreColumns };
