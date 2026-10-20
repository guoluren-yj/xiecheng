import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { EMAIL } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();

// 伙伴信息
const partnerDS = (props) => {
  const { editable, pcHeaderId } = props;
  return {
    paging: false,
    selection: editable && 'multiple',
    primaryKey: 'partnerId',

    fields: [
      {
        name: 'partnerTypeId',
      },
      {
        name: 'partnerTypeName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.partnerTypeName`).d('伙伴类型名称'),
        required: true,
      },
      {
        name: 'partnerTypeCode',
        type: 'string',
        label: intl.get(`spcm.common.model.common.partnerTypeCode`).d('伙伴类型编码'),
      },
      {
        name: 'companyIdLov',
        type: 'object',
        label: intl.get(`entity.company.code`).d('公司编码'),
        required: true,
        lovCode: 'SPCM.USER_AUTH.SUPPLIER',
        ignore: 'always',
        textField: 'supplierCompanyNum',
        lovPara: { enabledFlag: 1, tenantId: organizationId },
      },
      {
        name: 'companyId',
        bind: 'companyIdLov.companyId',
      },
      {
        name: 'companyNum',
        bind: 'companyIdLov.supplierCompanyNum',
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get(`entity.company.name`).d('公司名称'),
        bind: 'companyIdLov.supplierCompanyName',
      },
      {
        label: intl.get(`spcm.common.model.common.unifiedSocialCode`).d('统一社会信用代码'),
        name: 'unifiedSocialCode',
        type: 'string',
      },
      {
        label: intl.get(`spcm.common.model.common.postCode`).d('邮编'),
        name: 'postCode',
        type: 'string',
      },
      {
        name: 'legalRepName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.legalRepName`).d('代表人'),
        validator: (value) => {
          if (value && value.length > 150) {
            return intl.get('hzero.common.validation.max', { max: 150 });
          }
          return true;
        },
      },
      {
        name: 'corporateDuty',
        type: 'string',
        label: intl.get(`spcm.common.model.common.corporateDuty`).d('法人职务'),
        validator: (value) => {
          if (value && value.length > 60) {
            return intl.get('hzero.common.validation.max', { max: 60 });
          }
          return true;
        },
      },
      {
        name: 'address',
        type: 'string',
        label: intl.get(`spcm.common.model.common.address`).d('地址'),
        validator: (value) => {
          if (value && value.length > 300) {
            return intl.get('hzero.common.validation.max', { max: 300 });
          }
          return true;
        },
      },
      {
        name: 'contacts',
        type: 'string',
        label: intl.get(`spcm.common.model.common.contacts`).d('联系人'),
        validator: (value) => {
          if (value && value.length > 100) {
            return intl.get('hzero.common.validation.max', { max: 100 });
          }
          return true;
        },
      },
      {
        name: 'telNum',
        type: 'string',
        label: intl.get(`spcm.common.model.common.telNum`).d('联系电话'),
        validator: (value) => {
          if (value && value.length > 30) {
            return intl.get('hzero.common.validation.max', { max: 30 });
          }
          return true;
        },
      },
      {
        name: 'taxRegistrationPhone',
        type: 'string',
        label: intl.get(`spcm.common.model.common.taxRegistrationPhone`).d('税务登记电话'),
        validator: (value) => {
          if (value && value.length > 30) {
            return intl.get('hzero.common.validation.max', { max: 30 });
          }
          return true;
        },
      },
      {
        name: 'faxes',
        type: 'string',
        label: intl.get(`spcm.common.model.common.faxes`).d('传真'),
        validator: (value) => {
          if (value && value.length > 60) {
            return intl.get('hzero.common.validation.max', { max: 60 });
          }
          return true;
        },
      },
      {
        name: 'mail',
        type: 'string',
        label: intl.get(`spcm.common.model.common.mail`).d('邮箱'),
        validator: (value) => {
          if (value && !EMAIL.test(value)) {
            return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
          }
          return true;
        },
      },
      {
        name: 'bankName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.bankName`).d('开户行名称'),
        validator: (value) => {
          if (value && value.length > 320) {
            return intl.get('hzero.common.validation.max', { max: 320 });
          }
          return true;
        },
      },
      {
        name: 'bankAccountName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.bankAccountName`).d('账户名称'),
        validator: (value) => {
          if (value && value.length > 320) {
            return intl.get('hzero.common.validation.max', { max: 320 });
          }
          return true;
        },
      },
      {
        name: 'bankAccountNum',
        type: 'string',
        label: intl.get(`spcm.common.model.common.bankAccountNum`).d('银行账号'),
        validator: (value) => {
          if (value && value.length > 30) {
            return intl.get('hzero.common.validation.max', { max: 30 });
          }
          return true;
        },
      },
      {
        name: 'bankAddress',
        type: 'string',
        label: intl.get(`spcm.common.model.common.bankAddress`).d('开户行地址'),
        validator: (value) => {
          if (value && value.length > 150) {
            return intl.get('hzero.common.validation.max', { max: 150 });
          }
          return true;
        },
      },
      {
        name: 'bankFirm',
        type: 'string',
        label: intl.get(`spcm.common.model.common.bankNumber`).d('联行行号'),
        validator: (value) => {
          if (value && value.length > 150) {
            return intl.get('hzero.common.validation.max', { max: 150 });
          }
          return true;
        },
      },
      {
        label: intl.get(`spcm.common.model.common.businessRegistrationNumber`).d('商业注册号/税号'),
        name: 'businessRegistrationNumber',
        type: 'string',
      },
      {
        label: intl.get(`spcm.common.model.common.dunsCode`).d('邓白氏码'),
        name: 'dunsCode',
        type: 'string',
      },
      {
        name: 'intlBankAccountNum',
        type: 'string',
        label: intl.get(`spcm.common.model.common.intlBankAccountNum`).d('国际银行账号'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get(`hzero.common.explain`).d('说明'),
        validator: (value) => {
          if (value && value.length > 480) {
            return intl.get('hzero.common.validation.max', { max: 480 });
          }
          return true;
        },
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParams } = data;
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-partner/list`,
          method: 'GET',
          data: queryParams,
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-partner/batch`,
          method: 'DELETE',
          data,
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        const { records = [] } = dataSet;
        for (let i = 0; i < records.length; i++) {
          // 当满足条件时禁用勾选框
          if (records[i].get('predefinedFlag') === 1) {
            records[i].selectable = false;
          }
        }
      },
    },
  };
};

export default partnerDS;
