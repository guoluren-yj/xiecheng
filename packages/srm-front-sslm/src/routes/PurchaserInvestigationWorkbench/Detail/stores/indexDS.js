import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { EMAIL, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();

// 头ds
const getDetailHeaderDS = (isEdit = false) => ({
  fields: [
    {
      name: 'investgNumber',
      label: intl.get('sslm.common.model.investiagte.code').d('调查表编号'),
      disabled: true,
    },
    {
      name: 'investigateLevel',
      type: 'string',
      lookupCode: 'SSLM.INVESTIGATE_LEVEL',
      label: intl.get('sslm.common.model.investigate.level').d('调查表管控维度'),
      disabled: true,
    },
    {
      name: 'companyNum',
      label: intl.get(`sslm.common.view.company.code`).d('公司编码'),
    },
    {
      name: 'companyName',
      label: intl.get(`sslm.common.view.company.companyName`).d('公司名称'),
      disabled: true,
    },
    {
      name: 'investigateType',
      type: 'string',
      lookupCode: 'SSLM.INVESTIGATE_TYPE',
      label: intl.get('sslm.common.model.investigate.type').d('调查表类型'),
      disabled: true,
    },
    {
      name: 'investigateTemplateCode',
      label: intl.get(`sslm.common.model.investigate.template.code`).d('调查表模板代码'),
      disabled: true,
    },
    {
      name: 'investigateTemplateName',
      label: intl.get('sslm.common.model.investigate.template').d('调查表模板'),
      disabled: true,
    },
    {
      name: 'processStatus',
      lookupCode: 'SSLM.INVESTIGATE_STATUS',
      label: intl.get(`sslm.common.model.investigate.status`).d('调查表状态'),
      disabled: true,
    },
    {
      name: 'createUserRealName',
      label: intl.get(`sslm.common.view.creator.name`).d('创建人'),
      disabled: true,
    },
    {
      name: 'unitName',
      label: intl.get('sslm.common.view.creator.unitName').d('创建人部门'),
      disabled: true,
    },
    {
      name: 'partnerCompanyNum',
      label: intl.get(`sslm.common.view.supplier.code`).d('供应商编码'),
      disabled: true,
    },
    {
      name: 'supplierZhOrEnCompanyNum',
      label: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
      disabled: true,
    },
    {
      name: 'partnerBuildDate',
      type: 'dateTime',
      label: intl.get(`sslm.investigCorrelat.view.message.partnerBuildDate`).d('注册时间'),
      disabled: true,
    },
    {
      name: 'remark',
      label: intl.get(`sslm.investigCorrelat.view.message.remark`).d('调查说明'),
    },
    {
      name: 'partnerRemark',
      label: intl.get(`sslm.investigCorrelat.view.message.partnerRemark`).d('反馈备注'),
      disabled: true,
    },
    {
      name: 'partnerContactor',
      label: intl.get(`sslm.common.view.contact.name`).d('联系人'),
      required: isEdit,
      type: 'object',
      valueField: 'name',
      textField: 'name',
      lovCode: 'SSLM.SUPPLIER_MAIN_DATA_CONTACT',
      noCache: true,
      computedProps: {
        lovPara: ({ record }) => {
          const { partnerTenantId, companyId, partnerCompanyId } = record.get([
            'partnerCompanyId',
            'companyId',
            'partnerTenantId',
          ]);
          return {
            companyId,
            partnerTenantId,
            partnerCompanyId,
          };
        },
      },
      transformRequest: value => value && value.name,
      transformResponse: (value, data) => {
        if (!value) {
          return null;
        } else {
          const {
            partnerContactor,
            partnerContactPhone,
            internationalTelCode,
            partnerContactMail,
          } = data;
          return {
            name: partnerContactor,
            mobilephone: partnerContactPhone,
            internationalTelCode,
            mail: partnerContactMail,
          };
        }
      },
    },
    {
      name: 'partnerContactPhone',
      label: intl.get(`hzero.common.phone`).d('电话'),
      type: 'tel',
      telMode: 'secret',
      regionField: 'internationalTelCode',
      required: isEdit,
      bind: 'partnerContactor.mobilephone',
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'internationalTelCode',
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
      bind: 'partnerContactor.internationalTelCode',
    },
    {
      name: 'partnerContactMail',
      label: intl.get(`hzero.common.email`).d('邮箱'),
      required: isEdit,
      type: 'secret',
      bind: 'partnerContactor.mail',
      pattern: EMAIL,
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('hzero.common.date.creation').d('创建时间'),
    },
    {
      name: 'releaseDate',
      disabled: true,
      type: 'dateTime',
      label: intl.get('hzero.common.date.releaseTime').d('发布时间'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { investgHeaderId, otherParmas = {}, ...others } = data;
      const { customizeUnitCode = '' } = otherParmas;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/investigate/${investgHeaderId}`,
        method: 'GET',
        params: {
          customizeUnitCode: customizeUnitCode || 'SSLM.INVESTIGATION_WORKBENCH_DETAIL.HEADER',
          desensitize: true,
        },
        data: { investgHeaderId, ...others, ...otherParmas },
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/investigate`,
        method: 'PUT',
        data: data && data[0],
        params: { customizeUnitCode: 'SSLM.INVESTIGATION_WORKBENCH_DETAIL.HEADER' },
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

// 邀约拒绝
const inviteRejectModalDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'rejectRemark',
      label: intl.get(`sslm.investigCorrelat.view.message.refuseModalTitle`).d('拒绝原因'),
    },
  ],
});

// 调查表拒绝
const investigateRejectModalDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'rejectRemark',
      label: intl.get(`sslm.investigCorrelat.view.message.refuseModalTitle`).d('拒绝原因'),
    },
    {
      name: 'isChange',
      label: intl.get(`sslm.investigCorrelat.view.message.isChangeInvestigate`).d('是否变更调查表'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      help: intl
        .get(`sslm.investigCorrelat.view.message.changeWarning`)
        .d('变更调查表模版后，原调查表将被取消作废，供应商需要重新填写新调查表内容。'),
    },
    {
      name: 'investigateType',
      label: intl.get(`sslm.investigCorrelat.view.message.investigateType`).d('调查表类型'),
      lookupCode: 'SSLM.INVESTIGATE_TYPE',
      required: true,
      computedProps: {
        disabled: ({ record }) => !record.get('isChange'),
        required: ({ record }) => record.get('isChange'),
      },
    },
    {
      name: 'investigateTemplateId',
      type: 'object',
      label: intl.get(`sslm.investigCorrelat.view.message.investigateTemplate`).d('调查表模版'),
      lovCode: 'SSLM.INVESTIGATE_TEMPLATE_ID',
      computedProps: {
        disabled: ({ record }) => !record.get('investigateType'),
        required: ({ record }) => record.get('investigateType'),
        lovPara: ({ record }) => {
          const companyIds = record.get('companyIds');
          return {
            organizationId,
            enabledFlag: 1,
            companyIds,
            investigateType: record.get('investigateType'),
            assignMenuScope: 'srm.partner.purchaser-investigation-workbench',
          };
        },
      },
      noCache: true,
      transformRequest: value => value && value.investigateTemplateId,
      transformResponse: (value, data) => {
        if (!value) {
          return null;
        } else {
          const { investigateType, investigateTemplateId } = data;
          return {
            investigateType,
            investigateTemplateId,
          };
        }
      },
    },
    {
      name: 'remark',
      label: intl.get(`sslm.common.model.investigate.remark`).d('调查说明'),
      computedProps: {
        disabled: ({ record }) => !record.get('isChange'),
      },
    },
  ],
  events: {
    update: ({ value, record, name }) => {
      switch (name) {
        case 'isChange':
          if (!value) {
            record.set({
              investigateType: null,
              investigateTemplateId: null,
              remark: null,
            });
          }
          break;
        case 'investigateType':
          record.set({
            investigateTemplateId: null,
          });
          break;
        default:
          break;
      }
    },
  },
});

export { getDetailHeaderDS, inviteRejectModalDS, investigateRejectModalDS };
