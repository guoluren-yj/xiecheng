import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 监控管理 列表 DS
 * @returns
 */
const CommonTableDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-manage/monitor-company`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-manage/remove-monitor`,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  cacheSelection: true,
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.status`).d('状态'),
      name: 'effectiveFlag',
      type: 'string',
      lookupCode: 'HPFM.EFFECTIVE_FLAG',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.businessName`).d('企业名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.socialCreditCode`).d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.invalidTime`).d('失效时间'),
      name: 'expireTime',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.monitorAdder`).d('监控添加人'),
      name: 'userName',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 企业列表
 * @returns
 */
const BusinessListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      // const ids = data?.categoryIdList ?? [];
      // const idsStr = ids.length ? ids.join(',') : '';
      // eslint-disable-next-line no-param-reassign
      // delete data.categoryIdList;

      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-manage/srm-enterprise-list`,
        params,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'supplierCompanyId',
  cacheSelection: true,
  fields: [
    {
      label: intl.get('sdat.monitorBusiness.model.suppliersCode').d('公司编码'),
      name: 'supplierCompanyNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.suppliersName').d('供应商名称'),
      name: 'supplierCompanyName',
      type: 'string',
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sdat.monitorBusiness.model.unifiedSocialCodes').d('统一社会信用代码'),
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get('sdat.monitorBusiness.model.suppliersName').d('供应商名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      name: 'socialCode',
      label: intl.get('sdat.monitorBusiness.model.unifiedSocialCodes').d('统一社会信用代码'),
    },
    {
      name: 'categoryObj',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_PAGE',
      label: intl.get('sdat.monitorBusiness.model.supplierTypeList').d('供应商分类'),
      multiple: true,
      noCache: true,
      ignore: 'always',
      // lovQueryAxiosConfig: () => {
      //   return {
      //     url: `/sslm/v1/${getCurrentOrganizationId()}/supplier-categorys/tree-c7n`,
      //     method: 'GET',
      //   };
      // },
      lovPara: {
        tenantId: getCurrentOrganizationId(),
        enabledFlag: 1,
        parentCategoryId: 0,
      },
      textField: 'categoryDescription',
      optionsProps: (dsProps) => {
        return {
          ...dsProps,
          paging: 'server',
          idField: 'categoryId',
          parentIdField: 'parentCategoryId',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('checkFlag'),
            },
          },
          events: {
            select: ({ dataSet, record }) => {
              // 仅多选时处理联动
              const parentCategoryId = record.get('parentCategoryId');
              if (parentCategoryId) {
                const parentRecord = dataSet.find(
                  (rec) => rec.get('categoryId') === parentCategoryId
                );
                if (parentRecord) {
                  dataSet.select(parentRecord);
                }
              }
            },
          },
        };
      },
      transformResponse: (value, data) => {
        const { categoryList } = data;
        if (!isEmpty(categoryList)) {
          return categoryList;
        } else {
          return value;
        }
      },
    },
    {
      name: 'categoryIdList',
      bind: 'categoryObj.categoryId',
    },
  ],
  events: {},
});

/**
 * 企业列表
 * @returns
 */
const AddedBusinessListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-enterprise/monitor-enterprise-other`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  cacheSelection: true,
  fields: [
    {
      label: intl.get('sdat.monitorBusiness.model.supplierCodes').d('供应商编码'),
      name: 'supplierCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.supplierNames').d('供应商名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sdat.monitorBusiness.model.unifiedSocialCodes').d('统一社会信用代码'),
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get('sdat.monitorBusiness.model.supplierNames').d('供应商名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sdat.monitorBusiness.model.unifiedSocialCodes').d('统一社会信用代码'),
    },
    {
      name: 'categoryObj',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_PAGE',
      label: intl.get('sdat.monitorBusiness.model.supplierTypeList').d('供应商分类'),
      multiple: true,
      noCache: true,
      ignore: 'always',
      lovPara: {
        tenantId: getCurrentOrganizationId(),
        enabledFlag: 1,
        parentCategoryId: 0,
      },
      textField: 'categoryDescription',
      optionsProps: (dsProps) => {
        return {
          ...dsProps,
          paging: 'server',
          idField: 'categoryId',
          parentIdField: 'parentCategoryId',
          treeFlag: 'Y',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('checkFlag'),
            },
          },
          events: {
            select: ({ dataSet, record }) => {
              // 仅多选时处理联动
              const parentCategoryId = record.get('parentCategoryId');
              if (parentCategoryId) {
                const parentRecord = dataSet.find(
                  (rec) => rec.get('categoryId') === parentCategoryId
                );
                if (parentRecord) {
                  dataSet.select(parentRecord);
                }
              }
            },
          },
        };
      },
      transformResponse: (value, data) => {
        const { categoryList } = data;
        if (!isEmpty(categoryList)) {
          return categoryList;
        } else {
          return value;
        }
      },
    },
    {
      name: 'categoryIdList',
      bind: 'categoryObj.categoryId',
    },
  ],
  events: {},
});

/**
 * getResultDetailDs: 添加企业后的详情结果
 * @returns
 */
const getResultDetailDs = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-enterprise/add-monitor-result`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  paging: false,
  primaryKey: 'companyId',
  cacheSelection: true,
  selection: false,
  fields: [
    {
      label: intl.get('hzero.common.view.serialNumber').d('序号'),
      name: 'number',
      type: 'number',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.supplierNames').d('供应商名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.socialCode').d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.addResult').d('添加结果'),
      name: 'result',
      type: 'string',
    },
  ],
});

export { CommonTableDS, BusinessListDS, AddedBusinessListDS, getResultDetailDs };
