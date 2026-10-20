import { getCurrentOrganizationId } from 'utils/utils';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import intl from 'utils/intl';
import { isFunction, isBoolean } from 'lodash';

const organizationId = getCurrentOrganizationId();

// 创建头ds
const getCreateHeaderDS = () => ({
  fields: [
    {
      name: 'investigateLevel',
      type: 'string',
      lookupCode: 'SSLM.INVESTIGATE_LEVEL',
      label: intl.get('sslm.investMaintain.model.investMaintain.level').d('调查表管控维度'),
      required: true,
    },
    {
      name: 'companyIdLov',
      label: intl.get('sslm.common.view.company.name').d('公司'),
      type: 'object',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      lovPara: {
        tenantId: organizationId,
        enabledFlag: 1,
      },
      ignore: 'always',
      computedProps: {
        required: props => {
          const { record, dataSet } = props;
          // 标准必填逻辑
          const standardRequired = record.get('investigateLevel') === 'COMPANY';
          // 个性化必填配置
          let cuzRequired;
          const field = dataSet.getField('companyIdLov');
          const fieldDynamicProps = field.get('dynamicProps');
          const { required } = fieldDynamicProps || {};
          if (isFunction(required)) {
            cuzRequired = required(props);
          }
          return isBoolean(cuzRequired) ? cuzRequired : standardRequired;
        },
      },
      // computedProps, dynamicProps同时存在computedProps优先级高，
      // 这里写dynamicProps原因是个性化保留原逻辑和配置必填否，个性化返回的required都是undefined，写这个用于区分这两种场景
      dynamicProps: {
        required: () => {},
      },
    },
    {
      name: 'companyId',
      type: 'string',
      required: true,
      bind: 'companyIdLov.companyId',
      computedProps: {
        required: ({ record }) => record.get('investigateLevel') === 'COMPANY',
      },
    },
    {
      name: 'investigateType',
      type: 'string',
      lookupCode: 'SSLM.INVESTIGATE_TYPE',
      label: intl.get('sslm.investMaintain.model.investMaintain.type').d('调查表类型'),
      required: true,
    },
    {
      name: 'investigateTemplateIdLov',
      label: intl.get('sslm.investMaintain.model.investMaintain.template').d('调查表模板'),
      type: 'object',
      lovCode: 'SSLM.INVESTIGATE_TEMPLATE_ID',
      required: true,
      computedProps: {
        disabled: ({ record }) => !record.get('investigateType'),
        lovPara: ({ record }) => {
          const { investigateType, companyId } = record.get(['investigateType', 'companyId']);
          return {
            organizationId,
            enabledFlag: 1,
            investigateType,
            companyId,
            assignMenuScope: 'srm.partner.purchaser-investigation-workbench',
          };
        },
      },
      ignore: 'always',
    },
    {
      name: 'investigateTemplateId',
      type: 'string',
      bind: 'investigateTemplateIdLov.investigateTemplateId',
    },
    {
      name: 'createUserName',
      label: intl.get('sslm.common.view.creator.name').d('创建人'),
      type: 'string',
      disabled: true,
    },
    {
      name: 'unitName',
      label: intl.get('sslm.common.view.creator.unitName').d('创建人部门'),
      type: 'string',
      disabled: true,
    },
    {
      name: 'remark',
      label: intl.get('sslm.investMaintain.model.investMaintain.remark').d('调查说明'),
      type: 'string',
    },
  ],
});

// 创建行ds
const getCreateTableDS = () => ({
  primaryKey: 'companyNum',
  fields: [
    {
      name: 'companyNum',
      type: 'string',
      label: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
      required: true,
    },
    {
      name: 'companyName',
      label: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
    },
    {
      name: 'business',
      type: 'string',
      label: intl.get('sslm.investMaintain.model.investMaintain.business').d('经营性质'),
    },
    {
      name: 'taxpayerType',
      lookupCode: 'HPFM.TAXPAYER_TYPE',
      label: intl.get('sslm.investMaintain.model.investMaintain.taxpayerType').d('纳税人类型'),
    },
    {
      name: 'partnerContactor',
      label: intl.get('sslm.common.view.contact.name').d('联系人'),
      type: 'object',
      valueField: 'name',
      textField: 'name',
      lovCode: 'SSLM.SUPPLIER_MAIN_DATA_CONTACT',
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
      transformRequest: value => (value ? value.name : null),
    },
    {
      name: 'partnerContactPhone',
      label: intl.get('sslm.investMaintain.model.investMaintain.ContactPhone').d('联系电话'),
      // required: true,
      type: 'tel',
      regionField: 'internationalTelCode',
      validator: mobilephoneValidator,
      bind: 'partnerContactor.mobilephone',
    },
    {
      name: 'internationalTelCode',
      // label: intl.get('sslm.investMaintain.model.investMaintain.ContactPhone').d('联系电话'),
      defaultValue: '+86',
      lookupCode: 'HPFM.IDD',
      bind: 'partnerContactor.internationalTelCode',
    },
    {
      name: 'partnerContactMail',
      label: intl.get('hzero.common.email').d('邮箱'),
      type: 'string',
      // required: true,
      bind: 'partnerContactor.mail',
    },
    {
      label: intl.get('sslm.investMaintain.model.investMaintain.buildDate').d('注册日期'),
      name: 'buildDate',
      type: 'dateTime',
    },
    {
      name: 'riskScan',
      label: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
    },
    {
      name: 'riskScanDate',
      type: 'dateTime',
      label: intl.get('sslm.common.view.common.riskScanDate').d('最新风险扫描时间'),
    },
    {
      name: 'riskLevelMeaning',
      label: intl.get('sslm.common.view.common.riskLevel').d('风险等级'),
    },
    {
      name: 'fileUrl',
      label: intl.get('sslm.common.view.common.latestRiskReport').d('最新风险报告'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      if (dataSet) {
        dataSet.forEach(record => {
          Object.assign(record, { status: 'add' });
        });
      }
    },
  },
});

// 校验手机格式
const mobilephoneValidator = (value, name, record) => {
  const testReg = record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE;
  if (value && !testReg.test(value)) {
    return intl.get('hzero.common.validation.phone').d('手机格式不正确');
  }
  return true;
};

export { getCreateHeaderDS, getCreateTableDS };
