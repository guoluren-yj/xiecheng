import intl from 'utils/intl';
import { isArray, isEmpty, isNil, toString, isObject } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const dataSetFields = key => {
  if (key === 'reject') {
    return [
      {
        name: 'remark',
        label: intl.get('sslm.supplierInvite.model.supplier.rejectReason').d('拒绝理由'),
        required: true,
      },
    ];
  } else {
    return [
      {
        name: 'approveRemark',
        label: intl.get('sslm.supplierInvite.model.supplier.approveRemark').d('审批意见'),
      },
    ];
  }
};

// 审批弹窗
const approvalModalDS = (key = '') => ({
  autoCreate: true,
  fields: dataSetFields(key),
});

// 邀约头
const inviteHeaderDS = () => ({
  forceValidate: true,
  fields: [
    {
      name: 'autoPartnerFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      label: intl.get('spfm.enterpriseCertification.model.invite.autoPartner').d('是否发送邀约'),
      required: true,
    },
    {
      name: 'levelTypeFlag',
      type: 'string',
      label: intl.get('sslm.common.model.field.groupLevel').d('集团级'),
      lookupCode: 'HPFM.FLAG',
      dynamicProps: {
        required: ({ record }) => {
          // 是否发送邀约选否，非必填
          return toString(record.get('autoPartnerFlag')) !== '0';
        },
      },
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
      transformRequest: value => {
        return value ? Number(value) : 0;
      },
    },
    {
      name: 'companyIds', // levelTypeFlag 1 - 集团集，0- 公司集，认证这边不一样
      type: 'object',
      label: intl.get('spfm.enterpriseCertification.model.invite.inviteCompany').d('邀约公司'),
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      noCache: true,
      dynamicProps: {
        required: ({ record }) => {
          // 是否发送邀约选否，非必填
          return toString(record.get('autoPartnerFlag')) !== '0';
        },
        lovPara: ({ record }) => {
          const groupFlag = record.get('levelTypeFlag') === '1';
          return {
            organizationId,
            // 集团集邀约，传一个标识给后端适配器
            levelTypeFlag: groupFlag ? 1 : undefined,
          };
        },
        multiple: ({ record }) => record.get('levelTypeFlag') === '0',
      },
      transformResponse: (value, data) => {
        const { levelTypeFlag, companyList } = data;
        let newValue = value;
        if (isEmpty(newValue)) {
          return null;
        }
        if (isObject(newValue)) {
          try {
            newValue = newValue.map(n => n);
          } catch (error) {
            newValue = value;
          }
        } else {
          newValue = companyList;
        }
        if (Number(levelTypeFlag) === 0) {
          // 多选
          return newValue || [];
        } else {
          // 单选
          return isArray(newValue) ? newValue[0] : newValue;
        }
      },
      transformRequest: value => {
        if (!isEmpty(value)) {
          if (isArray(value)) {
            return value.map(n => n.companyId).join(',');
          } else {
            return value.companyId;
          }
        } else {
          return null;
        }
      },
    },
    {
      name: 'remark',
      label: intl.get('spfm.enterpriseCertification.model.invite.inviteRemark').d('邀约说明'),
    },
    {
      name: 'purchaseAgentIds',
      label: intl.get('spfm.invitationRegister.model.invitation.purchaseAgentId').d('采购员'),
      type: 'object',
      multiple: true,
      noCache: true,
      lovCode: 'SPFM.TENANT_PURCHASE_AGENT',
      lovPara: {
        tenantId: organizationId,
      },
      transformResponse: (value, data) => {
        const { purchaseAgentList } = data;
        if (!isEmpty(purchaseAgentList)) {
          return purchaseAgentList;
        }
        return value;
      },
      transformRequest: value => {
        if (value) {
          return isArray(value)
            ? value.map(({ purchaseAgentId }) => purchaseAgentId).join(',')
            : value.purchaseAgentId;
        } else {
          return value;
        }
      },
    },
    {
      name: 'categoryIds',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_PAGE',
      label: intl
        .get('spfm.invitationRegister.model.invitation.supplierCategoryCode')
        .d('供应商分类'),
      multiple: true,
      noCache: true,
      lovPara: {
        tenantId: organizationId,
        enabledFlag: 1,
        parentCategoryId: 0,
      },
      textField: 'categoryDescription',
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
        record: {
          dynamicProps: {
            selectable: record => record.get('checkFlag'),
          },
        },
        events: {
          select: ({ dataSet, record }) => {
            // 仅多选时处理联动
            const parentCategoryId = record.get('parentCategoryId');
            if (parentCategoryId) {
              const parentRecord = dataSet.find(rec => rec.get('categoryId') === parentCategoryId);
              if (parentRecord) {
                dataSet.select(parentRecord);
              }
            }
          },
        },
      },
      transformResponse: (value, data) => {
        const { categoryList } = data;
        if (!isEmpty(categoryList)) {
          return categoryList;
        } else {
          return value;
        }
      },
      transformRequest: value => {
        if (value) {
          return isArray(value)
            ? value.map(({ categoryId }) => categoryId).join(',')
            : value.categoryId;
        } else {
          return value;
        }
      },
    },
    {
      name: 'itemCategoryIds',
      type: 'object',
      lovCode: 'SSLM.SAMPLE_ITEM_CATEGORY',
      label: intl.get('spfm.invitationRegister.model.invitation.categoryCode').d('准入品类'),
      textField: 'categoryName',
      multiple: true,
      lovPara: {
        source: 'supplierEnter',
      },
      noCache: true,
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
        record: {
          dynamicProps: {
            selectable: record => record.get('checkFlag') !== false,
          },
        },
      },
      transformResponse: (value, data) => {
        const { itemCaegoryList } = data;
        if (!isEmpty(itemCaegoryList)) {
          return itemCaegoryList;
        } else {
          return value;
        }
      },
      transformRequest: value => {
        if (value) {
          return isArray(value)
            ? value.map(({ categoryId }) => categoryId).join(',')
            : value.categoryId;
        } else {
          return value;
        }
      },
    },
    {
      name: 'stageId',
      label: intl.get('spfm.invitationRegister.model.invitation.lifeCycle').d('生命周期'),
      lookupCode: 'SSLM.LIFE_CYCLE_STAGE',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {}, ...rest } = data;
      const { changeReqId } = queryParams;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/firm-entering-parents/${changeReqId}`,
        method: 'GET',
        data: { ...queryParams, ...rest },
      };
    },
  },
  events: {
    update: ({ record, name }) => {
      if (name === 'levelTypeFlag') {
        record.set({
          companyIds: null,
        });
      }
    },
  },
});

// 其他信息DS
const otherInfoDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'multiSupplierCategoryId',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_PAGE',
      label: intl
        .get('spfm.invitationRegister.model.invitation.supplierCategoryCode')
        .d('供应商分类'),
      multiple: true,
      noCache: true,
      lovPara: {
        tenantId: organizationId,
        enabledFlag: 1,
        parentCategoryId: 0,
      },
      textField: 'categoryDescription',
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
        record: {
          dynamicProps: {
            selectable: record => record.get('checkFlag'),
          },
        },
      },

      transformResponse: (value, data) => {
        const { supplierCategoryList = [] } = data;
        if (isEmpty(value)) {
          return null;
        }
        if (isObject(value)) {
          let newValue = value;
          try {
            newValue = value.map(n => n);
          } catch (error) {
            // console.log(error);
          }
          return newValue;
        }
        if (!isEmpty(supplierCategoryList)) {
          return supplierCategoryList || [];
        }
      },
      transformRequest: value => {
        if (!isEmpty(value)) {
          if (isArray(value)) {
            return value.map(i => i.categoryId).join(',');
          } else {
            return value.categoryId;
          }
        } else {
          return null;
        }
      },
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParam = {}, ...rest } = data || {};
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/sup-change-others/identify/getSupChangeOther`,
        method: 'GET',
        data: {
          ...queryParam,
          ...rest,
          dataSource: 4,
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

// 认证结果
const approvalResultDS = () => ({
  fields: [
    {
      name: 'appealReason',
      label: intl.get('spfm.supplierRegister.button.appealReason').d('申诉理由'),
    },
  ],
});

// 企业认证-人工材料
const getManualReviewDS = () => ({
  paging: false,
  fields: [
    {
      name: 'proposerName',
      label: intl.get('spfm.enterpriseCertification.model.manualCheck.proposerName').d('申请人'),
    },
    {
      name: 'reason',
      label: intl.get('spfm.enterpriseCertification.model.manualCheck.reason').d('申请说明'),
    },
    {
      name: 'attachmentUuid',
      label: intl
        .get('spfm.enterpriseCertification.model.manualCheck.applyAttachment')
        .d('申请附件'),
      type: 'attachment',
    },
  ],
  transport: {
    read: ({ data, params, dataSet }) => {
      const { queryParameter: { changeReqId } = {} } = dataSet;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/company-attestations/purchaser/${changeReqId}`,
        method: 'GET',
        data: {},
        params: {
          ...params,
          ...data,
        },
      };
    },
  },
});

export { approvalModalDS, inviteHeaderDS, otherInfoDS, approvalResultDS, getManualReviewDS };
