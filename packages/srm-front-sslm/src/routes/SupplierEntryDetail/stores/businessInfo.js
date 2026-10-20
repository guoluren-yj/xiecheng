import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';
// import moment from 'moment';
import { isEmpty } from 'lodash';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';
// import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getBusinessInfoDs = ({ changeReqId }) => ({
  paging: false,
  fields: [
    {
      name: 'businessType',
      type: 'string',
      required: true,
      multiple: true,
      label: intl.get('sslm.supplierEntryDetail.model.businessInfo.businessType').d('主要身份'),
      lookupCode: 'SPFM.MASTER.STATUS',
      // help: intl
      //   .get('sslm.supplierEntryDetail.model.businessInfo.interMessage')
      //   .d('如果您是供应商，请仅维护主要身份为「我要销售」'),
    },
    {
      name: 'interBusinessShield',
      type: 'boolean',
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get(`sslm.supplierEntryDetail.model.businessInfo.interBusinessShield`)
        .d('不允许其他企业找到我'),
    },
    {
      name: 'serviceType',
      type: 'string',
      multiple: ',',
      required: true,
      label: intl.get('sslm.supplierEntryDetail.model.businessInfo.serviceType').d('经营性质'),
      lookupCode: 'SPFM.BUSINESS.NATURE',
      transformRequest: value => {
        if (isEmpty(value)) {
          return null;
        } else {
          return (value && value.split(',')) || [];
        }
      },
    },
    {
      name: 'industryReqList',
      multiple: true,
      required: true,
      label: intl.get('sslm.supplierEntryDetail.model.businessInfo.industryList').d('行业类型'),
      lovCode: 'HPFM.INDUSTRY_SECOND',
      type: 'object',
      computedProps: {
        lovPara: ({ record }) => {
          const domesticForeignFlag = record.get('domesticForeignFlag');
          return {
            domesticFlag: domesticForeignFlag,
          };
        },
      },
      transformRequest: value => {
        if (isEmpty(value)) {
          return [];
        } else {
          return value.map(i => i.industryId);
        }
      },
      transformResponse: (value, data) => {
        const { industryReqList } = data;
        if (isEmpty(industryReqList)) {
          return null;
        } else {
          const list = industryReqList.map(item => {
            const { industryId, industryName } = item;
            return {
              industryId,
              industryName,
            };
          });
          return list;
        }
      },
    },
    {
      name: 'industryCategoryReqList',
      multiple: true,
      required: true,
      label: intl
        .get('sslm.supplierEntryDetail.model.businessInfo.industryCategoryList')
        .d('主营品类'),
      lovCode: 'HPFM.INDUSTRY.CATEGORY',
      type: 'object',
      valueField: 'categoryId',
      textField: 'categoryName',
      computedProps: {
        disabled: ({ record }) => {
          const disabledFlag = isEmpty(record.get('industryReqList'));
          return disabledFlag;
        },
        lovPara: ({ record }) => {
          const industryReqList = record.get('industryReqList');
          const toStr = isEmpty(industryReqList)
            ? null
            : industryReqList.map(i => i.industryId).join(',');
          return {
            industryIds: toStr,
          };
        },
      },
      transformRequest: value => {
        if (isEmpty(value)) {
          return [];
        } else {
          return value.map(i => i.categoryId);
        }
      },
      transformResponse: (value, data) => {
        const { industryCategoryReqList } = data;
        if (isEmpty(industryCategoryReqList)) {
          return null;
        } else {
          const list = industryCategoryReqList.map(item => {
            const { industryCategoryId, categoryName } = item;
            return {
              categoryId: industryCategoryId,
              categoryName,
            };
          });
          return list;
        }
      },
    },
    {
      name: 'serviceAreaReqList',
      multiple: ',',
      required: true,
      lookupCode: 'SPFM.COMPANY.SERVICE_AREA',
      label: intl
        .get('sslm.supplierEntryDetail.model.businessInfo.serviceAreaList')
        .d('送货服务范围'),
      transformRequest: value => {
        if (isEmpty(value)) {
          return null;
        } else {
          return (value && value.split(',')) || [];
        }
      },
    },
    {
      name: 'website',
      type: 'string',
      // pattern: STRICT_URL,
      label: intl.get('sslm.supplierEntryDetail.model.businessInfo.website').d('公司官网'),
    },
    {
      name: 'logoUrl',
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('sslm.supplierEntryDetail.model.businessInfo.description').d('公司简介'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...other } = data;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/com-business-req/after/${changeReqId}`,
        method: 'GET',
        data: {
          customizeUnitCode:
            'SSLM.SUPPLIER_ENTRY_DETAIL.BUSINESS_INFO,SSLM.SUPPLIER_ENTRY_DETAIL.BUSINESS_INFO_LOGO',
          ...queryParams,
          ...other,
          changeReqId,
          dataSource: 3,
        },
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'update' });
        });
      }
    },
  },
});

export { getBusinessInfoDs };
