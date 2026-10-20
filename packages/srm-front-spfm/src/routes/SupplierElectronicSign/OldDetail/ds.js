import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const certificateDs = ({ authType }) => ({
  forceValidate: true,
  fields: [
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('entity.company.name').d('公司名称'),
    },
    {
      name: 'receivableAmount',
      dynamicProps: {
        required: ({ record }) =>
          !record.get('editFlag') &&
          (record.get('authenticateResult') === 'failed' ||
            record.get('authenticateResult') === 'TO_PAY_SUCCESS'),
      },
    },
    {
      name: 'unifiedSocialCode',
      type: 'string',
      label: intl
        .get(`spfm.certificateAuthority.model.certificateAuthority.Credit`)
        .d('社会统一信用代码'),
    },
    {
      name: 'legalName',
      type: 'string',
      label: intl.get(`spfm.certificateAuthority.model.certificateAuthority.legal`).d('法定代表人'),
      maxLength: 120,
      dynamicProps: {
        required: ({ record }) => !record.get('editFlag') && authType !== 'ESIGN',
      },
    },
    {
      name: 'legalLocale',
      type: 'string',
      label: intl.get(`spfm.certificateAuthority.model.legalLocale`).d('法人归属地'),
      lookupCode: 'SPFM.AUTH_INFO_LEAGA_AREA',
      dynamicProps: {
        required: ({ record }) => !record.get('editFlag'),
      },
    },
    {
      name: 'legalDocumentType',
      type: 'string',
      label: intl
        .get(`spfm.certificateAuthority.model.certificateAuthority.certificateType`)
        .d('证件类型'),
      lookupCode: 'SPFM.ID_TYPE',
      dynamicProps: {
        required: ({ record }) => !record.get('editFlag'),
      },
      // defaultValue: 'I',
    },
    {
      name: 'legalIdNum',
      label: intl.get(`spfm.certificateAuthority.model.certificate.ID`).d('证件号码'),
      restrict: '0-9a-zA-Z*',
      validator: (value) => {
        const pattern = /^[0-9a-zA-Z*]{1,}$/;
        if (!pattern.test(value)) {
          return intl.get('hzero.common.certificate.ID').d('证件格式不正确');
        }
      },
      dynamicProps: {
        type: ({ record }) => (record.get('authInfoId') ? 'secret' : 'string'),
        required: ({ record }) => !record.get('editFlag') && authType !== 'ESIGN',
      },
    },

    {
      name: 'bankAccountNum',
      label: intl
        .get(`spfm.certificateAuthority.model.certificateAuthority.bankAccountNum`)
        .d('银行账户'),
      dynamicProps: {
        type: ({ record }) => (record.get('authInfoId') ? 'secret' : 'string'),
        required: ({ record }) => !record.get('editFlag'),
      },
    },
    {
      name: 'bankBranchNameLov',
      type: 'object',
      label: intl
        .get(`spfm.certificateAuthority.model.certificateAuthority.bankBranchName`)
        .d('开户行名称'),
      dynamicProps: {
        required: ({ record }) => !record.get('editFlag'),
      },
      lovCode: 'SPFM.CA_AUTH.BANK_BRANCH',
      ignore: 'always',
      textField: 'subbranch',
      optionsProps: {
        pageSize: 20,
      },
      lovPara: {
        nullAbleFlag: 1, // 用于后端判断无查询条件时是否需要返回数据
      },
    },
    {
      name: 'bankBranchName',
      bind: 'bankBranchNameLov.subbranch',
    },
    {
      name: 'city',
      bind: 'bankBranchNameLov.city',
    },
    {
      name: 'cnapsCode',
      bind: 'bankBranchNameLov.cnapsCode',
    },
    {
      name: 'province',
      bind: 'bankBranchNameLov.province',
    },
    {
      name: 'bankName',
      // type: 'string',
      label: intl
        .get(`spfm.certificateAuthority.model.certificateAuthority.bankName`)
        .d('银行名称'),
      dynamicProps: {
        required: ({ record }) => !record.get('editFlag'),
      },
      disabled: true,
      bind: 'bankBranchNameLov.bank',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/sign-integration-company-ca/detail`,
        method: 'GET',
      };
    },
  },
});

export default certificateDs;
