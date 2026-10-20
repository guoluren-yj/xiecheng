import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
import intl from 'utils/intl';

import { INVITE_REGISTER_CODE, INVITE_SUPPLIER_CODE } from '../../utils';

const organizationId = getCurrentOrganizationId();

const getCustomizeUnitCode = () => {
  return INVITE_REGISTER_CODE.concat(INVITE_SUPPLIER_CODE).join(',');
};

// 处理个性化功能单元，配置默认值替换已有值问题
const getTransformResponse = (defaultValue = '') => ({
  transformResponse: value => {
    return value || defaultValue;
  },
});

// 邀约进度查询-邀约信息-侧弹窗
const inviteInfoDS = ({ inviteSupplierFlag = false } = {}) => ({
  paging: false,
  fields: [
    {
      name: 'purchaseAgentIdLov',
      label: intl.get('spfm.invitationRegister.model.invitation.purchaseAgentId').d('采购员'),
      transformResponse: (value, data) => {
        const { purchaseAgentName } = data;
        return purchaseAgentName || '';
      },
    },
    {
      name: 'supplierName',
      label: intl.get('spfm.companySearch.view.message.supplierName').d('供应商企业'),
      ...getTransformResponse(),
    },
    {
      name: 'supplierErpCode',
      label: intl.get('sslm.supplierInvite.model.invite.supplierErpCode').d('供应商EPR编码'),
      ...getTransformResponse(),
    },
    {
      name: 'roleType',
      label: intl.get('spfm.companySearch.view.message.supplierRole').d('供应商角色'),
      transformResponse: (value, data) => {
        const { roleTypeMeaning } = data;
        return roleTypeMeaning || '';
      },
    },
    {
      name: 'levelTypeFlag',
      label: intl.get('spfm.companySearch.view.message.levelTypeOrg').d('集团级'),
      ...getTransformResponse(0),
    },
    {
      name: 'investigateType',
      label: intl.get('spfm.companySearch.view.message.investigateType').d('调查表类型'),
      lookupCode: 'SSLM.INVESTIGATE_TYPE',
      ...getTransformResponse(),
    },
    {
      name: 'investigateTemplateIdLov',
      label: intl.get('spfm.companySearch.view.message.investigateTemplate').d('调查表模板'),
      transformResponse: (value, data) => {
        const { templateName } = data;
        return templateName || '';
      },
    },
    {
      name: 'multiSupplierCategoryIdLov',
      label: intl
        .get('spfm.invitationRegister.model.invitation.supplierCategoryCode')
        .d('供应商分类'),
      transformResponse: (value, data) => {
        const { supplierCategoryName } = data;
        return supplierCategoryName || '';
      },
    },
    {
      name: 'categoryIdLov',
      label: intl.get('spfm.invitationRegister.model.invitation.categoryCode').d('准入品类'),
      transformResponse: (value, data) => {
        const { categoryNames } = data;
        return categoryNames || '';
      },
    },
    {
      name: 'remark',
      label: intl.get('spfm.disposeInvite.view.message.remark').d('调查说明'),
      ...getTransformResponse(),
    },
    {
      name: 'inviteRemark',
      label: intl.get('spfm.companySearch.view.message.inviteRemark').d('邀请说明'),
      ...getTransformResponse(),
    },
    {
      name: 'inviteRegisterRemark',
      label: intl.get('spfm.companySearch.view.message.inviteRemark').d('邀请说明'),
      transformResponse: (value, data) => {
        const { inviteRemark } = data;
        return inviteRemark || '';
      },
    },
    {
      name: 'childRoleId',
      label: intl
        .get('sslm.supplierInvite.model.supplierInvite.suppplierChildRole')
        .d('供应商子角色'),
      transformResponse: (value, data) => {
        const { childRoleName } = data;
        return childRoleName || '';
      },
    },
    {
      name: 'mergerInvitationFlag',
      label: intl.get('sslm.supplierInvite.model.invite.mergerInvitationFlag').d('合并邀约'),
      ...getTransformResponse(0),
    },
    {
      name: 'autosendInvestigateFlag',
      label: intl.get('spfm.companySearch.view.message.sendInvestigation').d('发送调查表'),
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('inviteType') !== 'REGISTER'
            ? intl.get('spfm.companySearch.view.message.sendInvestigation').d('发送调查表')
            : intl.get('sslm.supplierInvite.model.invite.sendInvestigation').d('发送邀约调查表'),
      },
      transformResponse: (value, data) => {
        const { investigateFlag } = data;
        return investigateFlag || 0;
      },
    },
    {
      name: 'companyIdLov',
      label: inviteSupplierFlag
        ? intl.get(`spfm.companySearch.view.message.inviter`).d('邀请方')
        : intl.get(`spfm.companySearch.view.message.invitationRegistration`).d('邀请注册公司'),
      transformResponse: (value, data) => {
        const { companyName } = data;
        return companyName || '';
      },
    },
    {
      name: 'inviteCompanyLov',
      label: intl.get(`spfm.companySearch.view.message.InvitePartnerCompanies`).d('邀约合作公司'),
      transformResponse: (value, data) => {
        const { inviteCompanyNames } = data;
        return inviteCompanyNames || '';
      },
    },
    {
      name: 'supplierMail',
      label: intl.get('sslm.supplierInvite.model.invite.salesMail').d('销售员邮箱'),
      ...getTransformResponse(),
    },
    {
      name: 'salesPersonName',
      label: intl.get('sslm.supplierInvite.model.invite.salesName').d('销售员姓名'),
      ...getTransformResponse(),
    },
    {
      name: 'salesPersonIdsLov',
      label: intl.get('sslm.supplierInvite.model.invite.salesName').d('销售员姓名'),
      transformResponse: (value, data) => {
        const { salesPersonName } = data;
        return salesPersonName || '';
      },
    },
    {
      name: 'salesPersonEmail',
      label: intl.get('sslm.supplierInvite.model.invite.salesMail').d('销售员邮箱'),
      ...getTransformResponse(),
    },
    {
      name: 'salesInternationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      name: 'salesPersonPhone',
      type: 'tel',
      regionField: 'salesInternationalTelCode',
      label: intl.get('sslm.supplierInvite.model.invite.salesPhone').d('销售员手机号'),
      ...getTransformResponse(),
    },
    {
      name: 'autosendPartnerInviteFlag',
      label: intl.get('spfm.invitationRegister.model.invitation.autoSendInviteFlag').d('发送邀约'),
      ...getTransformResponse(0),
    },
    {
      name: 'autobuildPartnerFlag',
      label: intl
        .get('spfm.invitationRegister.model.invitation.autoPartnerFlag')
        .d('自动建立合作伙伴关系'),
      ...getTransformResponse(0),
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
    },
    {
      name: 'purchaseAgentPhone',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl
        .get('spfm.invitationRegister.model.invitation.purchaseAgentPhone')
        .d('采购员联系方式'),
      ...getTransformResponse(),
    },
    {
      name: 'cancelRegisterInvestigateFlag',
      label: intl.get('sslm.supplierInvite.model.invite.cancelInvestigate').d('取消默认注册调查表'),
      ...getTransformResponse(0),
    },
    {
      name: 'sendRegisterInvestigateFlag',
      label: intl.get('sslm.supplierInvite.model.invite.registerInvestigate').d('发送注册调查表'),
      ...getTransformResponse(0),
    },
    {
      name: 'inviteInvestigateRemark',
      label: intl.get('spfm.disposeInvite.view.message.remark').d('调查说明'),
      ...getTransformResponse(),
    },
    {
      name: 'toCycleStageId',
      label: intl.get('spfm.invitationRegister.model.invitation.lifeCycle').d('生命周期'),
      transformResponse: (value, data) => {
        const { toCycleStageDescription } = data;
        return toCycleStageDescription || '';
      },
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { inviteId } = data;
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/invite-details/${inviteId}`,
        method: 'GET',
        params: {
          ...params,
          customizeUnitCode: getCustomizeUnitCode(),
        },
        data,
      };
    },
  },
});

export { inviteInfoDS };
