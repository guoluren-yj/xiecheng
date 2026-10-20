import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
import { isArray, isEmpty, isNil, toString } from 'lodash';

const organizationId = getCurrentOrganizationId();

// 表单DS
const indexDS = ({ templateDs } = {}) => ({
  forceValidate: true,
  fields: [
    {
      name: 'assignIdLov',
      type: 'object',
      required: true,
      lovCode: 'SPFM.PORTAL_ASSIGN',
      noCache: true,
      ignore: 'always',
      defaultValidationMessages: {
        valueMissingNoLabel: '',
      },
    },
    {
      name: 'assignId',
      bind: 'assignIdLov.assignId',
    },
    {
      name: 'webUrl',
      bind: 'assignIdLov.webUrl',
    },
    {
      name: 'directCooperation',
      type: 'boolean',
      required: true,
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.cooperation').d('直接合作'),
      help: intl
        .get('sslm.registerPolicy.modal.registerPolicy.cooperationTips')
        .d('认证审批通过后按照策略内预定义的维度和公司自动与供应商建立合作关系'),
      // computedProps: {
      //   disabled: () => {
      //     // 有调查表则本字段禁用
      //     const hasTemplateFlag = templateDs ? !!(templateDs.records || []).length || false : false;
      //     return hasTemplateFlag;
      //   },
      // },
    },
    {
      name: 'autoInvite',
      type: 'boolean',
      required: true,
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('sslm.registerPolicy.modal.registerPolicy.autoInvite')
        .d('自动发送采购方邀约'),
      help: intl
        .get('sslm.registerPolicy.modal.registerPolicy.autoInviteTips')
        .d('认证审批通过后按照策略内预定义的维度和公司向供应商发送邀约，邀约同意后建立合作关系'),
    },
    {
      name: 'allowSupplierInvite',
      type: 'boolean',
      required: true,
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('sslm.registerPolicy.modal.registerPolicy.activeInvite')
        .d('由供应商发起邀约'),
      computedProps: {
        disabled: () => {
          // 有调查表则本字段禁用
          const hasTemplateFlag = templateDs ? !!(templateDs.records || []).length || false : false;
          return hasTemplateFlag;
        },
      },
      help: intl
        .get('sslm.registerPolicy.modal.registerPolicy.activeInviteTips')
        .d(
          '认证过程中，可以由供应商选择合作公司；认证通过后，按照采购方维护的信息判断是否建立合作关系'
        ),
    },
    {
      name: 'dimensionCode',
      type: 'string',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.coopeDimension').d('合作维度'),
      lookupCode: 'SSLM.LIFE_CYCLE_DIMENSION_CODE',
      computedProps: {
        required: ({ record }) => {
          const { directCooperation, autoInvite, allowSupplierInvite } = record.get([
            'directCooperation',
            'autoInvite',
            'allowSupplierInvite',
          ]);
          const flag = directCooperation === 0 && autoInvite === 0 && allowSupplierInvite === 0;
          if (flag) {
            return false;
          } else {
            return true;
          }
        },
      },
    },
    {
      name: 'companyIdLov', // levelTypeFlag 0 - 集团集，1- 公司集，传递数据时需处理
      type: 'object',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.company').d('公司'),
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      noCache: true,
      computedProps: {
        lovPara: ({ record }) => {
          const dimensionCode = record.get('dimensionCode') === 'GROUP';
          return {
            organizationId,
            // 集团集邀约，传一个标识给后端适配器
            levelTypeFlag: dimensionCode ? 1 : undefined,
          };
        },
        multiple: ({ record }) => record.get('dimensionCode') === 'COMPANY',
        required: ({ record }) => {
          const { directCooperation, autoInvite, allowSupplierInvite } = record.get([
            'directCooperation',
            'autoInvite',
            'allowSupplierInvite',
            'dimensionCode',
          ]);
          const flag = directCooperation === 0 && autoInvite === 0 && allowSupplierInvite === 0;
          const notRequired = flag;
          if (notRequired) {
            return false;
          } else {
            return true;
          }
        },
      },
      ignore: 'always',
      transformResponse: (value, data) => {
        const { dimensionCode, companyNameList, companyNames, companyIds } = data;
        if (dimensionCode === 'COMPANY') {
          return companyNameList || [];
        } else {
          return {
            companyId: companyIds,
            companyName: companyNames,
          };
        }
      },
    },
    {
      name: 'companyIdLovMeaning',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.company').d('公司'),
      ignore: 'always',
      transformResponse: (value, data) => {
        const { companyNameList } = data;
        if (isEmpty(companyNameList)) {
          return '';
        } else {
          return companyNameList.map(i => i.companyName).join(',');
        }
      },
    },
    {
      name: 'companyIds',
      bind: 'companyIdLov.companyId',
      transformRequest: (value, record) => {
        const multipleFlag = !!(record.get('dimensionCode') === 'COMPANY');
        if (value) {
          if (isEmpty(value)) {
            return null;
          } else if (multipleFlag) {
            return isArray(value) ? value.join(',') : value;
          } else {
            return value;
          }
        } else {
          return value;
        }
      },
    },
    {
      name: 'companyNames',
      bind: 'companyIdLov.companyName',
      ignore: 'always',
    },
    {
      name: 'approveMethod',
      type: 'string',
      lookupCode: 'SPFM_APPROVING_METHOD',
      required: true,
      defaultValue: 'platform',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.approval').d('认证审批方式'),
      computedProps: {
        disabled: ({ record }) => {
          // 有调查表则本字段禁用
          const hasTemplateFlag = templateDs ? !!(templateDs.records || []).length || false : false;
          const allowSupplierInviteFlag = !!record.get('allowSupplierInvite');
          return hasTemplateFlag || allowSupplierInviteFlag;
        },
      },
    },
    {
      name: 'realNameFlag',
      type: 'boolean',
      required: true,
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('sslm.registerPolicy.modal.registerPolicy.enableRealName')
        .d('注册时开启实名认证'),
    },
    {
      name: 'agreeTermsFlag',
      type: 'boolean',
      required: true,
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('sslm.registerPolicy.modal.registerPolicy.cooperateTerms')
        .d('认证前同意合作条款'),
      help: intl
        .get('sslm.registerPolicy.modal.registerPolicy.cooperateTermsTips')
        .d(
          '供应商点击"完善企业信息"前，须查看并同意预定义的所有合作条款才可以进行下一步，条款可在【静态文本管理】功能下维护'
        ),
    },
    {
      name: 'emailValidationFlag',
      type: 'boolean',
      required: true,
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('sslm.registerPolicy.modal.registerPolicy.emailCheck')
        .d('企业邮箱验证（推荐）'),
      computedProps: {
        disabled: ({ record }) => {
          const { moneyValidationFlag, artificialValidationFlag } = record.get([
            'moneyValidationFlag',
            'artificialValidationFlag',
          ]);
          const flag = moneyValidationFlag === 0 && artificialValidationFlag === 0;
          return flag;
        },
      },
    },
    {
      name: 'moneyValidationFlag',
      type: 'boolean',
      required: true,
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
      label: intl.get('spfm.enterpriseCertification.view.title.accountTransfer').d('对公账户打款'),
      computedProps: {
        disabled: ({ record }) => {
          const { emailValidationFlag, artificialValidationFlag } = record.get([
            'emailValidationFlag',
            'artificialValidationFlag',
          ]);
          const flag = emailValidationFlag === 0 && artificialValidationFlag === 0;
          return flag;
        },
      },
    },
    {
      name: 'artificialValidationFlag',
      type: 'boolean',
      required: true,
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
      label: intl.get('spfm.enterpriseCertification.view.title.materialReview').d('人工材料审核'),
      computedProps: {
        disabled: ({ record }) => {
          const { emailValidationFlag, moneyValidationFlag } = record.get([
            'emailValidationFlag',
            'moneyValidationFlag',
          ]);
          const flag = emailValidationFlag === 0 && moneyValidationFlag === 0;
          return flag;
        },
      },
    },
    {
      name: 'phoneReceiveFlag',
      type: 'boolean',
      required: true,
      defaultValue: '1',
      trueValue: '1',
      falseValue: '0',
      label: intl.get('hzero.common.phone').d('手机'),
      computedProps: {
        disabled: ({ record }) => {
          const { emailReceiveFlag } = record.get(['emailReceiveFlag']);
          const disabledFlag = emailReceiveFlag === '0';
          return disabledFlag;
        },
      },
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
    },
    {
      name: 'emailReceiveFlag',
      type: 'boolean',
      required: true,
      defaultValue: '1',
      trueValue: '1',
      falseValue: '0',
      label: intl.get('hzero.common.email').d('邮箱'),
      computedProps: {
        disabled: ({ record }) => {
          const { phoneReceiveFlag } = record.get(['phoneReceiveFlag']);
          const disabledFlag = phoneReceiveFlag === '0';
          return disabledFlag;
        },
      },
      transformResponse: value => {
        return isNil(value) ? value : toString(value);
      },
    },
    {
      name: 'defaultReceiveCodeType',
      type: 'string',
      required: true,
      lookupCode: 'SPFM_CHECK_CODE_RECEIVE_TYPE',
      defaultValue: 'PHONE',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.defaultMode').d('默认方式'),
      computedProps: {
        disabled: ({ record }) => {
          const { phoneReceiveFlag, emailReceiveFlag } = record.get([
            'phoneReceiveFlag',
            'emailReceiveFlag',
          ]);
          const editFlag = phoneReceiveFlag === '1' && emailReceiveFlag === '1';
          return !editFlag;
        },
      },
    },
    {
      name: 'passwordDefaultFlag',
      type: 'boolean',
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('sslm.registerPolicy.modal.registerPolicy.defaultPassword')
        .d('注册时默认按安全策略中的密码填充'),
    },
  ],
  events: {
    update: ({ value, record, name }) => {
      const { directCooperation, autoInvite, allowSupplierInvite } = record.get([
        'directCooperation',
        'autoInvite',
        'allowSupplierInvite',
      ]);
      const flag = directCooperation === 0 && autoInvite === 0 && allowSupplierInvite === 0;
      switch (name) {
        case 'directCooperation':
          record.set({
            autoInvite: value ? 0 : 1,
            allowSupplierInvite: 0,
          });
          if (flag) {
            record.set({
              dimensionCode: null,
              companyIdLov: null,
            });
          }
          break;
        case 'autoInvite':
          record.set({
            allowSupplierInvite: value ? 0 : 1,
          });
          if (flag) {
            record.set({
              dimensionCode: null,
              companyIdLov: null,
            });
          }
          break;
        case 'allowSupplierInvite':
          if (flag) {
            record.set({
              dimensionCode: null,
              companyIdLov: null,
            });
          }
          if (value) {
            record.set({
              approveMethod: 'tenant',
            });
          }
          break;
        case 'dimensionCode':
          record.set({
            companyIdLov: null,
          });
          break;
        case 'emailReceiveFlag':
        case 'phoneReceiveFlag':
          {
            const { phoneReceiveFlag, emailReceiveFlag, defaultReceiveCodeType } = record.get([
              'phoneReceiveFlag',
              'emailReceiveFlag',
              'defaultReceiveCodeType',
            ]);
            const defaultMode =
              phoneReceiveFlag !== '1'
                ? 'EMAIL'
                : emailReceiveFlag !== '1'
                ? 'PHONE'
                : defaultReceiveCodeType;
            record.set({
              defaultReceiveCodeType: defaultMode,
            });
          }
          break;
        default:
          break;
      }
    },
  },
});

// 关联调查表模板ds
const templateDS = () => ({
  paging: false,
  primaryKey: 'strategyInvestgAssignId',
  fields: [
    {
      name: 'investigateType',
      type: 'string',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.investigationType').d('调查表类型'),
      lookupCode: 'SSLM.INVESTIGATE_TYPE',
    },
    {
      name: 'templateName',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.template').d('调查表模板名称'),
    },
    {
      name: 'templateCode',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.templateCode').d('调查表模版编码'),
    },
    {
      name: 'versionNumber',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.effectiveVersion').d('生效版本'),
    },
    {
      name: 'sendConditions',
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.sendConditions').d('发送条件'),
      ignore: 'always',
    },
    {
      name: 'conditionsConfig',
      label: intl
        .get(`sslm.investDefOrg.model.investDefOrg.conditionsConfiguration`)
        .d('发送条件配置'),
      ignore: 'always',
    },
    {
      name: 'orderSeq',
      type: 'number',
      precision: 0,
      step: 1,
      required: true,
      min: 0,
      label: intl.get('sslm.registerPolicy.modal.registerPolicy.priority').d('优先级'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { assignId, strategyCfBasicId, tenantId } = {} } = dataSet;
      const isPlatform = dataSet.getState('isPlatform');
      const path = `${SRM_PLATFORM}/v1/${organizationId}/strategy-investg-assigns/all-template`;
      const url = isPlatform ? `${path}/site/${assignId}` : `${path}/${assignId}`;
      return {
        url,
        method: 'GET',
        params: {
          strategyCfBasicId,
          tenantId,
        },
        data: {},
      };
    },
    destroy: ({ data, params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/strategy-investg-assigns/batch-delete`,
        method: 'DELETE',
        data,
        params,
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

const getInvestigateTemplateDS = () => ({
  dataToJSON: 'selected',
  autoCreate: true,
  fields: [
    {
      name: 'investigateTemplateLov',
      type: 'object',
      multiple: true,
      noCache: true,
      lovCode: 'SSLM.INVESTIGATE_TEMPLATE_ID',
      lovPara: {
        organizationId,
        enabledFlag: 1,
      },
    },
  ],
});

export { indexDS, templateDS, getInvestigateTemplateDS };
