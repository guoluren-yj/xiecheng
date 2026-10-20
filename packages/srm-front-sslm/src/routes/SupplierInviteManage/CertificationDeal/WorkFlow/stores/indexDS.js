import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { isArray } from 'lodash';

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
  transport: {
    read: ({ data, dataSet }) => {
      const { queryParameter: { changeReqId } = {} } = dataSet;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/firm-entering-parents/${changeReqId}`,
        method: 'GET',
        data: {
          ...data,
        },
      };
    },
  },
  fields: [
    {
      name: 'autoPartnerFlag',
      type: 'number',
      label: intl.get('spfm.enterpriseCertification.model.invite.autoPartner').d('是否发送邀约'),
    },
    {
      name: 'companyName',
      label: intl.get('spfm.enterpriseCertification.model.invite.inviteCompany').d('邀约公司'),
      transformResponse: (value, data) => {
        const { companyList, companyName } = data;
        if (companyList) {
          if (isArray(companyList)) {
            const companyStr = companyList.map(n => n.companyName).join(',');
            return companyStr;
          } else {
            return companyName;
          }
        } else {
          return companyName;
        }
      },
    },
    {
      name: 'remark',
      label: intl.get('spfm.enterpriseCertification.model.invite.inviteRemark').d('邀约说明'),
    },
  ],
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

// 审批头表单信息

const getHeaderDs = () => ({
  paging: false,
  fields: [
    {
      name: 'companyName',
      maxLength: 500,
      type: 'intl',
      label: intl.get('spfm.enterprise.model.legal.companyName').d('企业名称'),
    },
    {
      name: 'certificationStatus',
      label: intl.get('spfm.enterprise.model.legal.certificationStatus').d('认证状态'),
    },
    {
      name: 'certificationStatusMeaning',
    },
    {
      name: 'registeredCountryName',
    },
    {
      name: 'registeredCapital',
      label: intl.get('spfm.enterprise.model.legal.registeredCapitals').d('注册资本(万)'),
    },
    {
      name: 'currencyName',
      label: intl.get('spfm.enterprise.model.legal.currencyName').d('注册资本币种'),
    },
    {
      name: 'buildDate',
      type: 'date',
      label: intl.get('spfm.enterprise.model.legal.buildDate').d('成立日期'),
    },
    {
      name: 'errorMessage',
    },
  ],
});

export { approvalModalDS, inviteHeaderDS, approvalResultDS, getManualReviewDS, getHeaderDs };
