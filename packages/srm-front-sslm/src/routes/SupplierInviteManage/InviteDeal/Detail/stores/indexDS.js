import intl from 'utils/intl';
// import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isArray, isEmpty, isNil } from 'lodash';

const organizationId = getCurrentOrganizationId();

// 拒绝理由
const inviteRejectModalDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'refuseReason',
      label: intl.get(`spfm.disposeInvite.view.message.title.modal.refuse`).d('拒绝原因'),
    },
  ],
});

// 调查表拒绝
const investigateRejectModalDS = ({ inviteInfo = {} } = {}) => ({
  autoCreate: true,
  fields: [
    {
      name: 'rejectRemark',
      label: intl.get(`spfm.disposeInvite.view.message.refuseReason`).d('拒绝原因'),
    },
    {
      name: 'flag',
      label: intl.get(`spfm.disposeInvite.view.message.investigationisChange`).d('是否变更调查表'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      help: intl
        .get(`spfm.disposeInvite.view.message.tab.investigateDescribe`)
        .d('变更调查表模板后，原调查表将被取消作废，供应商需重新填写新调查表的内容'),
    },
    {
      name: 'investigateType',
      label: intl.get(`spfm.disposeInvite.model.purchaserCooperation.type`).d('调查类型'),
      lookupCode: 'SSLM.INVESTIGATE_TYPE',
      required: true,
      computedProps: {
        disabled: ({ record }) => !record.get('flag'),
        required: ({ record }) => record.get('flag'),
      },
    },
    {
      name: 'investigateTemplateLov',
      type: 'object',
      label: intl.get(`spfm.disposeInvite.model.purchaserCooperation.template`).d('调查表模板'),
      lovCode: 'SSLM.INVESTIGATE_TEMPLATE_ID',
      computedProps: {
        disabled: ({ record }) => !record.get('investigateType'),
        required: ({ record }) => record.get('investigateType'),
        lovPara: ({ record }) => {
          const { inviteType, companyId, inviteCompanyId, inviteCompanyIds } = inviteInfo;
          return {
            organizationId,
            enabledFlag: 1,
            investigateType: record.get('investigateType'),
            assignMenuScope: 'srm.partner.my-partner.supplier-invite',
            companyIds: inviteType === 'CUSTOMER' ? inviteCompanyIds || inviteCompanyId : companyId,
          };
        },
      },
      noCache: true,
      ignore: 'always',
    },
    {
      name: 'investigateTemplateId',
      bind: 'investigateTemplateLov.investigateTemplateId',
    },
    {
      name: 'remark',
      label: intl.get(`spfm.disposeInvite.view.message.remark`).d('调查说明'),
      computedProps: {
        disabled: ({ record }) => !record.get('flag'),
        required: ({ record }) => record.get('flag'),
      },
    },
  ],
  events: {
    update: ({ value, record, name }) => {
      if (name === 'flag') {
        if (!value) {
          record.set({
            investigateType: null,
            investigateTemplateLov: null,
            remark: null,
          });
        }
      }
    },
  },
});

// 补充调查
const supplementInvestigModalDS = ({ purchaseSelectedRows = [] }) => ({
  fields: [
    {
      name: 'flag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: '0',
      label: intl.get('spfm.companySearch.view.message.sendInvestigation').d('发送调查表'),
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
      transformRequest: value => {
        return value ? Number(value) : 0;
      },
    },
    {
      name: 'investigateType',
      label: intl.get('spfm.companySearch.view.message.investigateType').d('调查表类型'),
      lookupCode: 'SSLM.INVESTIGATE_TYPE',
      dynamicProps: {
        required: ({ record }) => !!Number(record.get('flag')),
        disabled: ({ record }) => !Number(record.get('flag')),
      },
    },
    {
      name: 'investigateTemplateIdLov',
      type: 'object',
      lovCode: 'SSLM.INVESTIGATE_TEMPLATE_ID',
      label: intl.get('spfm.companySearch.view.message.investigateTemplate').d('调查表模板'),
      dynamicProps: {
        required: ({ record }) => !!Number(record.get('flag')),
        disabled: ({ record }) => !record.get('investigateType'),
        lovPara: ({ record }) => ({
          organizationId,
          enabledFlag: 1,
          investigateType: record.get('investigateType'),
        }),
      },
      noCache: true,
      ignore: 'always',
    },
    {
      name: 'investigateTemplateId',
      bind: 'investigateTemplateIdLov.investigateTemplateId',
    },
    {
      name: 'multiSupplierCategoryIdLov',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_PAGE',
      label: intl
        .get('spfm.invitationRegister.model.invitation.supplierCategoryCode')
        .d('供应商分类'),
      multiple: true,
      noCache: true,
      ignore: 'always',
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
        const { multiSupplierCategoryList } = data;
        return multiSupplierCategoryList || [];
      },
    },
    {
      name: 'multiSupplierCategoryId',
      bind: 'multiSupplierCategoryIdLov.categoryId',
      transformRequest: value => {
        if (value) {
          return isArray(value) ? value.join(',') : value;
        } else {
          return value;
        }
      },
    },
    {
      name: 'categoryIdLov',
      type: 'object',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      label: intl.get('spfm.invitationRegister.model.invitation.categoryCode').d('准入品类'),
      textField: 'categoryName',
      multiple: true,
      lovPara: {
        tenantId: organizationId,
        businessObjectCode: 'SRM_C_SRM_SPFM_PARTNER_INVITE',
      },
      noCache: true,
      ignore: 'always',
      transformResponse: (value, data) => {
        const { categoryIdList } = data;
        return categoryIdList || [];
      },
      optionsProps: {
        paging: 'server',
        idField: 'categoryId',
        parentIdField: 'parentCategoryId',
        record: {
          dynamicProps: {
            selectable: record => record.get('isCheck') !== false,
          },
        },
      },
    },
    {
      name: 'categoryIds',
      bind: 'categoryIdLov.categoryId',
    },
    {
      name: 'roleType',
      label: intl.get('spfm.companySearch.view.message.supplierRole').d('供应商角色'),
      lookupCode: 'SPFM.PARTNER_INVITE_ROLE_TYPE',
      defaultValue: 'SALES',
    },
    {
      name: 'purchaseAgentIdLov',
      label: intl.get('spfm.invitationRegister.model.invitation.purchaseAgentId').d('采购员'),
      type: 'object',
      noCache: true,
      multiple: true,
      lovCode: 'SPFM.PURCHASE_AGENT_NOUSER',
      lovPara: {
        tenantId: organizationId,
      },
      ignore: 'always',
      // transformResponse: (value, data) => {
      //   console.log(data);
      //   const { purchaseAgentIdList } = data;
      //   return purchaseAgentIdList || [];
      // },
      defaultValue: purchaseSelectedRows,
    },
    {
      name: 'purchaseAgentId',
      bind: 'purchaseAgentIdLov.purchaseAgentId',
      transformRequest: value => {
        if (value) {
          return isArray(value) ? value.join(',') : value;
        } else {
          return value;
        }
      },
    },
    {
      name: 'remark',
      label: intl.get('spfm.disposeInvite.view.message.remark').d('调查说明'),
      dynamicProps: {
        disabled: ({ record }) => !Number(record.get('flag')),
      },
    },
    {
      name: 'childRoleId',
      type: 'object',
      lovCode: 'SRM.PURCHASER_SALES_ROLE_LIST',
      label: intl
        .get('sslm.supplierInvite.model.supplierInvite.suppplierChildRole')
        .d('供应商子角色'),
      lovPara: {
        tenantId: organizationId,
      },
      noCache: true,
      transformRequest: value => value && value.id,
    },
  ],
  events: {
    update: ({ record, name }) => {
      if (name === 'flag') {
        record.set({
          investigateType: null,
          investigateTemplateIdLov: null,
          remark: null,
        });
      }
      if (name === 'investigateType') {
        record.set({
          investigateTemplateIdLov: null,
        });
      }
    },
  },
});

// 邀约头
const inviteHeaderDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('spfm.disposeInvite.model.topinfo.companyName').d('邀请方'),
    },
    {
      name: 'levelTypeFlag',
      lookupCode: 'HPFM.FLAG',
      label: intl.get('spfm.disposeInvite.model.topinfo.levelTypeFlag').d('是否集团级'),
      dynamicProps: {
        disabled: ({ record }) =>
          !(
            ['PENDING'].includes(record.get('processStatus')) &&
            record.get('inviteType') === 'CUSTOMER'
          ),
      },
      // 存表levelTypeFlag = 1 公司级，0 集团级
    },
    {
      name: 'inviteCompanyIds',
      label: intl.get('sslm.supplierInvite.model.invite.inviteCompany').d('被邀请公司'),
      type: 'object',
      lovCode: 'SSLM.ENTERING_INVITE_COMPANY',
      required: true,
      dynamicProps: {
        disabled: ({ record }) =>
          !(
            ['PENDING'].includes(record.get('processStatus')) &&
            record.get('inviteType') === 'CUSTOMER'
          ),
        multiple: ({ record }) => {
          return (
            !(Number(record.get('levelTypeFlag')) === 1) && record.get('inviteType') === 'CUSTOMER'
          );
        },
        lovPara: ({ record }) => {
          return {
            partnerCompanyId: record.get('sourceKey'),
          };
        },
      },
      transformResponse: (value, data) => {
        const {
          levelTypeFlag,
          inviteCompanyIdList = [],
          inviteType,
          inviteCompanyName,
          inviteCompanyId,
        } = data || {};
        const singleFlag = Number(levelTypeFlag) === 1;
        // 邀请成为客户
        if (inviteType === 'CUSTOMER') {
          // levelTypeFlag = 1 对应前端集团级，单选
          if (!isEmpty(inviteCompanyIdList)) {
            if (singleFlag) {
              return inviteCompanyIdList[0];
            } else {
              return inviteCompanyIdList;
            }
          } else {
            return null;
          }
          // 邀请供应商，取供应商公司数据
        } else if (inviteType === 'SUPPLIER') {
          return {
            companyId: inviteCompanyId,
            companyName: inviteCompanyName,
          };
        }
        return null;
      },
      transformRequest: (value, record) => {
        const singleFlag = Number(record.get('levelTypeFlag')) === 1;
        const { inviteType, inviteCompanyIds } = record.get(['inviteType', 'inviteCompanyIds']);
        // 邀请成为客户
        if (inviteType === 'CUSTOMER') {
          if (!isEmpty(value)) {
            if (!singleFlag) {
              const companyIdList = (value || []).map(item => item.companyId);
              return (companyIdList || []).join(',');
            } else {
              return value.companyId;
            }
          } else {
            return null;
          }
          // 邀请供应商，页面不可编辑，防止transformResponse转化id，在把原值set回去
        } else if (inviteType === 'SUPPLIER') {
          return inviteCompanyIds && inviteCompanyIds.companyId;
        }
        return null;
      },
    },
    {
      name: 'privateFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      label: intl.get('spfm.disposeInvite.model.topinfo.privateFlag').d('私有化'),
    },
    {
      name: 'sendInvestigateTemplateFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      label: intl
        .get('spfm.disposeInvite.model.topinfo.autosendInvestigateFlag')
        .d('是否发送调查表'),
    },
    {
      name: 'investigateTypeMeaning',
      label: intl.get('spfm.disposeInvite.model.topinfo.investigateType').d('调查表类型'),
    },
    {
      name: 'investigateTemplateName',
      label: intl.get('spfm.disposeInvite.model.topinfo.templateName').d('调查表模板'),
    },
    {
      name: 'investigateCategoryName',
      type: 'string',
      label: intl.get('spfm.disposeInvite.model.topinfo.categoryName').d('准入品类'),
    },
    {
      name: 'purchaseAgentNameJoint',
      label: intl.get('spfm.disposeInvite.model.topinfo.purchaseAgent').d('采购员'),
    },
    {
      name: 'multiSupplierCategoryDesc',
      type: 'string',
      label: intl.get('spfm.disposeInvite.model.topinfo.multiSupplierCategoryDesc').d('供应商分类'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('spfm.disposeInvite.model.topinfo.creationDate').d('邀请时间'),
    },
    {
      name: 'roleType',
      type: 'string',
      lookupCode: 'SPFM.PARTNER_INVITE_ROLE_TYPE',
      label: intl.get('spfm.disposeInvite.model.topinfo.roleType').d('供应商角色'),
    },
    {
      name: 'salesPersonName',
      type: 'string',
      label: intl.get('spfm.disposeInvite.model.topinfo.salesPersonName').d('供应商销售员'),
    },
    {
      name: 'salesPersonPhone',
      type: 'string',
      label: intl.get('sslm.supplierInvite.model.invite.salesPhone').d('销售员手机号'),
    },
    {
      name: 'salesPersonEmail',
      type: 'string',
      label: intl.get('sslm.supplierInvite.model.invite.salesMail').d('销售员邮箱'),
    },
    {
      name: 'inviteRemark',
      type: 'string',
      label: intl.get('spfm.disposeInvite.model.topinfo.inviteRegisterRemark').d('邀请备注'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'levelTypeFlag') {
        let inviteCompanyInfo = null;
        const companyInfo = record.get('inviteCompanyIds');
        const singleFlag = Number(value) === 1;
        if (!isEmpty(companyInfo)) {
          // 切换到单选
          if (singleFlag) {
            if (companyInfo.length === 1) {
              const { companyId, companyName } = companyInfo[0];
              inviteCompanyInfo = {
                companyId,
                companyName,
              };
            }
          } else {
            const { companyId, companyName } = companyInfo;
            inviteCompanyInfo = [
              {
                companyId,
                companyName,
              },
            ];
          }
          record.init('inviteCompanyIds', inviteCompanyInfo);
        }
      }
    },
  },
});

// 调查表头
const investigateHeaderDS = () => ({
  fields: [
    {
      name: 'investgNumber',
      type: 'string',
      label: intl.get(`spfm.disposeInvite.view.message.investgNumber`).d('调查表编号'),
    },
    {
      name: 'processStatusMeaning',
      label: intl.get(`spfm.disposeInvite.view.message.processStatusMeaning`).d('状态'),
    },
    {
      name: 'releaseDate',
      type: 'dateTime',
      label: intl.get(`hzero.common.date.release`).d('发布时间'),
    },
    {
      name: 'createUserRealName',
      label: intl.get(`hzero.common.entity.creator`).d('创建人'),
    },
    {
      name: 'companyNum',
      label: intl.get('entity.customer.code').d('客户编码'),
    },
    {
      name: 'companyName',
      label: intl.get('entity.customer.name').d('客户名称'),
    },
    {
      name: 'partnerCompanyNum',
      type: 'string',
      label: intl.get('entity.supplier.code').d('供应商编码'),
    },
    {
      name: 'partnerCompanyName',
      label: intl.get('entity.supplier.name').d('供应商名称'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`spfm.disposeInvite.view.message.remark`).d('调查说明'),
    },
    {
      name: 'partnerRemark',
      type: 'string',
      label: intl.get(`spfm.disposeInvite.view.message.partnerRemark`).d('反馈备注'),
    },
  ],
});

export {
  inviteRejectModalDS,
  supplementInvestigModalDS,
  investigateRejectModalDS,
  inviteHeaderDS,
  investigateHeaderDS,
};
