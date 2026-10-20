import { isEmpty, } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const tableDS = () => {
  return {
    autoQuery: true,
    dataToJSON: 'all',
    pageSize: 20,
    primaryKey: 'skgfId',
    cacheSelection: true,
    fields: [
      {
        name: 'sourceNum',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.sourceNum').d('单据编号'),
      },
      {
        name: 'sourceLineNum',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.sourceLineNum').d('行号'),
      },
      {
        name: 'companyId',
        label: intl.get('ssrc.common.companyName').d('公司名称'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        transformRequest: (value) => value && value.companyId,
        transformResponse: (value, record) => {
          return value
            ? {
                companyId: value,
                companyName: record.companyName,
              }
            : null;
        },
        required: true,
      },
      {
        name: 'ouId',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.ouName').d('业务实体'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.OU',
        transformRequest: (value) => value && value.ouId,
        transformResponse: (value, record) => {
          return value
            ? {
                ouId: value,
                ouName: record.ouName,
              }
            : null;
        },
        required: true,
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              companyId: record.get('companyId')?.companyId,
            };
          },
        },
      },
      {
        name: 'purOrganizationId',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.purchOrgName').d('采购组织'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
        transformRequest: (value) => value && value.purchaseOrgId,
        transformResponse: (value, record) => {
          return value
            ? {
                purchaseOrgId: value,
                organizationName: record.purOrganizationName,
              }
            : null;
        },
      },
      {
        name: 'purchaserId',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.purchaserName').d('采购员'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.PUR_ORG_AGENT',
        lovPara: {
          organizationId,
        },
        transformRequest: (value) => value && value.purchaseAgentId,
        transformResponse: (value, record) => {
          return value
            ? {
                purchaseAgentId: value,
                purchaseAgentName: record.purchaseAgentName,
              }
            : null;
        },
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              purchaseOrgId: record.get('purOrganizationId')?.purchaseOrgId,
            };
          },
        },
      },
      {
        name: 'invOrganizationId',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.inventoryOrg').d('库存组织'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        transformRequest: (value) => value && value.organizationId,
        transformResponse: (value, record) => {
          return value
            ? {
                organizationId: value,
                organizationName: record.invOrganizationName,
              }
            : null;
        },
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              companyId: record.get('companyId')?.companyId,
              ouId: record.get('ouId')?.ouId,
            };
          },
        },
      },
      {
        name: 'inventoryId',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.inventory').d('库房'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVENTORY',
        transformRequest: (value) => value && value.inventoryId,
        transformResponse: (value, record) => {
          return value
            ? {
                inventoryId: value,
                inventoryName: record.inventoryName,
              }
            : null;
        },
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              organizationId: record.get('invOrganizationId')?.organizationId,
            };
          },
        },
      },
      {
        name: 'locationId',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.location').d('库位'),
        type: 'object',
        lovCode: 'HPFM.LOCATION',
        transformRequest: (value) => value && value.locationId,
        transformResponse: (value, record) => {
          return value
            ? {
                locationId: value,
                locationName: record.locationName,
              }
            : null;
        },
      },
      {
        name: 'receivingContactName',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.receivingContactName').d('收货人'),
      },
      {
        name: 'receivingMobile',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.receivingMobile').d('收货人电话'),
      },
      {
        name: 'address',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.address').d('详细地址'),
      },
      {
        name: 'expandCompany',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.expandCompany').d('拓展公司'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        multiple: true,
        transformResponse: (value, data) => {
          const { expandCompany, expandCompanyMeaning } = data || {};
          const idList = expandCompany?.split(',') || [];
          const nameList = expandCompanyMeaning?.split(',') || [];
          return value
            ? idList.map((item, index) => ({
                companyId: item,
                companyName: nameList[index],
              }))
            : null;
        },
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.companyId).join(',');
        },
      },
      {
        name: 'expandInvOrganization',
        type: 'object',
        multiple: true,
        label: intl
          .get(`ssrc.orgInfoChange.model.orgInfoChange.expandInvOrganization`)
          .d('拓展库存组织'),
        lovCode: 'SPFM.USER_AUTH.INVORG',
        transformResponse: (value, data) => {
          const { expandInvOrganization, expandInvOrganizationMeaning } = data || {};
          const idList = expandInvOrganization?.split(',') || [];
          const nameList = expandInvOrganizationMeaning?.split(',') || [];
          return value
            ? idList.map((item, index) => ({
                organizationId: item, // 值集值字段默认数字类型 若是后期值集主键加密 需要再次处理
                organizationName: nameList[index],
              }))
            : null;
        },
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.organizationId).join(',');
        },
      },
      {
        name: 'sourceTypeMeaning',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.sourceType').d('单据来源'),
      },
      {
        name: 'changeStatusMeaning',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.changeStatus').d('变更状态'),
      },
      {
        name: 'changeInfo',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.changeInfo').d('变更反馈信息'),
      },
    ],
    queryFields: [
      {
        name: 'companyId',
        label: intl.get('ssrc.common.companyName').d('公司名称'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        required: true,
        display: true,
      },
      {
        name: 'ouId',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.ouName').d('业务实体'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.OU',
        required: true,
        display: true,
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              companyId: record.get('companyId')?.companyId,
            };
          },
        },
      },
      {
        name: 'sourceNum',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.sourceNum').d('单据编号'),
        display: true,
      },
      {
        name: 'purOrganizationId',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.purchOrgName').d('采购组织'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
        display: true,
      },
      {
        name: 'purchaserId',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.purchaserName').d('采购员'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.PUR_ORG_AGENT',
        display: true,
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              organizationId,
              purchaseOrgId: record.get('purOrganizationId')?.purchaseOrgId,
            };
          },
        },
      },
      {
        name: 'invOrganizationId',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.inventoryOrg').d('库存组织'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        display: true,
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              companyId: record.get('companyId')?.companyId,
              ouId: record.get('ouId')?.ouId,
            };
          },
        },
      },
      {
        name: 'inventoryId',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.inventory').d('库房'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVENTORY',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              organizationId: record.get('invOrganizationId')?.organizationId,
            };
          },
        },
      },
      {
        name: 'locationId',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.location').d('库位'),
        type: 'object',
        lovCode: 'HPFM.LOCATION',
      },
      {
        name: 'receivingContactName',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.receivingContactName').d('收货人'),
      },
      {
        name: 'receivingMobile',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.receivingMobile').d('收货人电话'),
      },
      {
        name: 'address',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.address').d('详细地址'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        range: true,
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.sourceCreationDate').d('创建时间'),
        sortFlag: true,
        display: true,
        defaultValue: [moment().subtract(6, 'months').startOf('day'), moment().endOf('day')],
      },
      {
        name: 'changeStatus',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.changeStatus').d('变更状态'),
        lookupCode: 'SPFM.SKGF_CHANGE_STATUS',
      },
      {
        name: 'sourceType',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.sourceType').d('单据来源'),
        lookupCode: 'SPFM.DOCUMENT_VALUE',
      },
    ],
    transport: {
      read: ({ data }) => {
        let sortList = [];
        if (data.customizeOrderField) {
          sortList = data.customizeOrderField.split(':');
        }
        return {
          url: `${SRM_PLATFORM}/v1/${organizationId}/skgf/list`,
          method: 'POST',
          data: {
            ...data,
            organizationId,
            creationDate: undefined,
            customizeOrderField: undefined,
            creationDate_range: data.creationDate,
            sortParam: isEmpty(sortList) ? undefined : sortList[0],
            sortDirection: isEmpty(sortList) ? undefined : sortList[1],
          },
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        if (!dataSet?.length) {
          return;
        }

        dataSet.forEach((record = {}) => {
          const changeStatus = record.get('changeStatus');
          if (changeStatus === 'SYNC_ING') {
            Object.assign(record, { selectable: false });
          }
        });
      },
      update: ({ record }) => {
        record.set('updateFlag', 1);
      },
      batchSelect: ({ records }) => {
        records.forEach((record) => {
          record.set('selectFlag', 1);
        });
      },
      batchUnSelect: ({ records }) => {
        records.forEach((record) => {
          record.set('selectFlag', 0);
        });
      },
    },
  };
};

const batchEditDS = () => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'companyId',
        label: intl.get('ssrc.common.companyName').d('公司名称'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        transformRequest: (value) => value && value.companyId,
        required: true,
      },
      {
        name: 'ouId',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.ouName').d('业务实体'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.OU',
        transformRequest: (value) => value && value.ouId,
        required: true,
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              companyId: record.get('companyId')?.companyId,
            };
          },
        },
      },
      {
        name: 'purOrganizationId',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.purchOrgName').d('采购组织'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
        transformRequest: (value) => value && value.purchaseOrgId,
      },
      {
        name: 'purchaserId',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.purchaserName').d('采购员'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.PUR_ORG_AGENT',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              organizationId,
              purchaseOrgId: record.get('purOrganizationId')?.purchaseOrgId,
            };
          },
        },
        transformRequest: (value) => value && value.purchaseAgentId,
      },
      {
        name: 'invOrganizationId',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.inventoryOrg').d('库存组织'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        transformRequest: (value) => value && value.organizationId,
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              companyId: record.get('companyId')?.companyId,
              ouId: record.get('ouId')?.ouId,
            };
          },
        },
      },
      {
        name: 'inventoryId',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.inventory').d('库房'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVENTORY',
        transformRequest: (value) => value && value.inventoryId,
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              organizationId: record.get('invOrganizationId')?.organizationId,
            };
          },
        },
      },
      {
        name: 'locationId',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.location').d('库位'),
        type: 'object',
        lovCode: 'HPFM.LOCATION',
        transformRequest: (value) => value && value.locationId,
      },
      {
        name: 'receivingContactName',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.receivingContactName').d('收货人'),
      },
      {
        name: 'receivingMobile',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.receivingMobile').d('收货人电话'),
      },
      {
        name: 'address',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.address').d('详细地址'),
      },
      {
        name: 'expandCompany',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.expandCompany').d('拓展公司'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        multiple: true,
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.companyId).join(',');
        },
      },
      {
        name: 'expandInvOrganization',
        type: 'object',
        multiple: true,
        label: intl
          .get(`ssrc.orgInfoChange.model.orgInfoChange.expandInvOrganization`)
          .d('拓展库存组织'),
        lovCode: 'SPFM.USER_AUTH.INVORG',
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.organizationId).join(',');
        },
      },
    ],
  };
};

const batchUpdateDataSet = () => {
  return {
    autoCreate: false,
    autoQuery: false,
    fields: [
      {
        name: 'sourceTypes',
        label: intl.get('ssrc.orgInfoChange.model.orgInfoChange.sourceType').d('单据来源'),
        lookupCode: 'SPFM.DOCUMENT_VALUE',
        multiple: true,
        required: true,
      },
      {
        name: 'dateFrom',
        type: 'dateTime',
        required: true,
        // range: true,
        label: intl.get('ssrc.filterBar.view.placeholder.startTime').d('开始时间'),
        // sortFlag: true,
        // display: true,
        // defaultValue: [moment().subtract(6, 'months').startOf('day'), moment().endOf('day')],
      },
      {
        name: 'dateTo',
        type: 'dateTime',
        required: true,
        // range: true,
        label: intl.get('ssrc.filterBar.view.placeholder.endTime').d('结束时间'),
        min: 'dateFrom',
        // sortFlag: true,
        // display: true,
        // defaultValue: [moment().subtract(6, 'months').startOf('day'), moment().endOf('day')],
      },
    ],
  };
};

export { tableDS, batchEditDS, batchUpdateDataSet, };
