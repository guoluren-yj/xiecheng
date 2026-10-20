import moment from 'moment';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, getCurrentUserId } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();
const currentUserId = getCurrentUserId();

const indexDS = () => ({
  dataToJSON: 'selected',
  autoCreate: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'categoryAlterNumber',
      label: intl.get('sslm.supplierCategoryAlter.model.supply.categoryAlterNumber').d('申请单号'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get('sslm.supplierCategoryAlter.model.supply.supplierCompanyNum').d('供应商代码'),
    },
    {
      name: 'supplierZhOrEnCompanyNum',
      label: intl
        .get('sslm.supplierCategoryAlter.model.supply.supplierCompanyName')
        .d('供应商名称'),
    },
    {
      name: 'processStatus',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'processStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'realName',
      label: intl.get('sslm.common.view.creator.name').d('创建人'),
    },

    {
      name: 'alterReason',
      label: intl.get('sslm.supplierCategoryAlter.model.supply.applyReason').d('申请理由'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.common.view.creation.time').d('创建时间'),
    },
  ],
  queryFields: [
    {
      name: 'categoryAlterNumber',
      label: intl.get('sslm.supplierCategoryAlter.model.supply.categoryAlterNumber').d('申请单号'),
    },
    {
      name: 'supplierCompanyId',
      type: 'object',
      label: intl.get('sslm.supplierCategoryAlter.model.supply.supplierCompanyId').d('供应商'),
      noCache: true,
      lovCode: 'SSLM.USER_AUTH.SUPPLIER',
      valueField: 'uniqueKey',
      lovPara: { tenantId: organizationId, userId: currentUserId, asyncCountFlag: 'Y' },
      transformRequest: value => value && value.supplierCompanyId,
    },
    {
      name: 'processStatus',
      type: 'object',
      label: intl.get('hzero.common.status').d('状态'),
      lookupCode: 'SSLM.SUPPLIER_CTG_ALTER_STATUS',
      transformRequest: value => value && value.value,
    },
    {
      name: 'startDate',
      type: 'date',
      label: intl.get('hzero.common.date.creation.from').d('创建日期从'),
      max: 'endDate',
      transformRequest: value => value && moment(value).format(DATETIME_MIN),
    },
    {
      name: 'endDate',
      type: 'date',
      label: intl.get('hzero.common.date.creation.to').d('创建日期至'),
      min: 'startDate',
      transformRequest: value => value && moment(value).format(DATETIME_MAX),
    },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_SSLM}/v1/${organizationId}/supplier-category-alter`,
      method: 'GET',
      params: {
        ...params,
        querySelfFlag: 1,
        customizeUnitCode:
          'SSLM.SUPPLIER_CATEGORY_ALTER_LIST.LIST,SSLM.SUPPLIER_CATEGORY_ALTER_LIST.SEARCH_FORM',
      },
    }),
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        if (!['NEW', 'REJECTED'].includes(record.data.processStatus)) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
});

export { indexDS };
