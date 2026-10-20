import intl from 'utils/intl';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { getPlatformVersionApi, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const isTenant = isTenantRoleLevel();
// const layoutCode = isTenant ? 'SPFM.PORTAL.LAYPUT.ORG.VIEW' : 'SPFM.PORTAL.LAYOUT.VIEW';
const getCurrentUrl = getPlatformVersionApi('portal-assigns-customize');
const groupParam = isTenant ? { tenantId: getCurrentOrganizationId() } : {};
export default function getProtalDs() {
  return {
    // autoQuery: true,
    primaryKey: 'assignId',
    cacheSelection: true,
    pageSize: 20,
    fields: [
      {
        name: 'assignId',
        type: 'string',
      },
      {
        name: 'groupObject',
        type: 'object',
        label: intl.get('hptl.portalAssign.model.portalAssign.groupName').d('集团名称'),
        lovCode: 'HPFM.GROUP',
        textField: 'groupName',
        valueFiled: 'groupNum',
        required: true,
        lovPara: { enabledFlag: 1, ...groupParam },
      },
      {
        name: 'groupNum',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.groupNum').d('集团编码'),
        bind: 'groupObject.groupNum',
        disabled: true,
      },
      {
        name: 'groupName',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.groupName').d('集团名称'),
        bind: 'groupObject.groupName',
      },
      {
        name: 'groupId',
        type: 'string',
        bind: 'groupObject.groupId',
      },
      {
        name: 'tenantId',
        type: 'string',
        bind: 'groupObject.tenantId',
      },
      {
        name: 'companyObject',
        type: 'object',
        label: intl.get('hptl.portalAssign.model.portalAssign.companyName').d('公司名称'),
        lovCode: 'HPFM.COMPANY',
        textField: 'companyName',
        valueFiled: 'companyNum',
        dynamicProps: ({ record }) => {
          const groupObject = record.get('groupObject');
          if (groupObject) {
            return {
              lovPara: {
                tenantId: groupObject.tenantId,
                groupId: groupObject.groupId,
              },
            };
          } else {
            return {
              disabled: !record.get('groupId'),
            };
          }
        },
      },
      {
        name: 'companyNum',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.companyNum').d('公司编码'),
        bind: 'companyObject.companyNum',
        disabled: true,
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.companyName').d('公司名称'),
        bind: 'companyObject.companyName',
      },
      {
        name: 'companyId',
        type: 'string',
        bind: 'companyObject.companyId',
      },
      {
        name: 'webUrl',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.webUrl').d('企业门户域名'),
        required: true,
      },
      {
        name: 'layoutObject',
        type: 'object',
        // lovCode: layoutCode,
        textField: 'layoutName',
        valueField: 'layoutId',
        label: intl.get('hptl.portalAssign.model.portalAssign.templateName').d('模板名称'),
        // lovPara: { enabledFlag: 1 },
      },
      {
        name: 'layoutId',
        type: 'string',
        bind: 'layoutObject.id',
      },
      {
        name: 'layoutCode',
        type: 'string',
        bind: 'layoutObject.layoutCode',
      },
      {
        name: 'layoutName',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.templateName').d('模板名称'),
        bind: 'layoutObject.layoutName',
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status').d('状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'skipAfterLoginFlag',
        type: 'boolean',
        label: intl.get('hptl.portalAssign.model.portalConfig.enableMiddlePage').d('启用中间页'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'newRegisterFlag',
        type: 'boolean',
        // disabled: true,
        label: intl
          .get('hptl.portalAssign.model.portalAssign.enableRegisterFlag')
          .d('开启新注册流程'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'interBusinessShield',
        type: 'boolean',
        label: intl
          .get('hptl.portalAssign.model.portalAssign.interBusinessShield')
          .d('默认企业间屏蔽'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('newRegisterFlag') === 1;
          },
        },
      },
      {
        name: 'tenantApproval',
        type: 'boolean',
        label: intl.get('hptl.portalAssign.model.portalAssign.tenantApproval').d('租户级审批'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('newRegisterFlag') === 1;
          },
        },
      },
      {
        name: 'sendMessageFlag',
        type: 'boolean',
        label: intl.get('hptl.portalAssign.model.portalAssign.sendMessageFlag').d('邮件提醒'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'afterRegister',
        lookupCode: 'SPFM.LAYOUT.AFTER_REGISTER',
        type: 'string', // 0:无  1:自动建立合作关系  2：自动发送邀约 3：自动发送邀约调查表
        label: intl.get('hptl.portalAssign.model.portalAssign.registerStep').d('注册默认后续流程'),
        textField: 'meaning',
        defaultValue: '0',
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('newRegisterFlag') === 1;
          },
        },
      },
      {
        name: 'inviteLevel',
        type: 'string', // group:公司级  company:集团级
        label: intl.get('hptl.portalAssign.model.portalAssign.latitude').d('邀约维度'),
        dynamicProps: ({ record }) => {
          const afterRegister = record.get('afterRegister');
          return { required: afterRegister !== '0' };
        },
      },
      {
        name: 'inviteCompanyObject',
        lovCode: 'HPFM.COMPANY',
        type: 'object',
        label: intl.get('hptl.portalAssign.model.portalAssign.company').d('公司'),
        dynamicProps: ({ record }) => {
          const groupObject = record.get('groupObject');
          const afterRegister = record.get('afterRegister');
          if (groupObject) {
            return {
              lovPara: {
                tenantId: groupObject.tenantId,
                groupId: groupObject.groupId,
              },
              required: afterRegister !== '0',
            };
          }
        },
      },
      {
        name: 'inviteCompanyName',
        type: 'string',
        bind: 'inviteCompanyObject.companyName',
      },
      {
        name: 'inviteCompanyId',
        type: 'string',
        bind: 'inviteCompanyObject.companyId',
      },
      {
        name: 'questionnaireTemplateObject',
        lovCode: 'SSLM.INVESTIGATE_TEMPLATE_ID',
        type: 'object',
        label: intl.get('hptl.portalAssign.model.portalAssign.survey.template').d('调查模板'),
        textField: 'templateName',
        valueField: 'questionnaireTemplate',
        dynamicProps: ({ record }) => {
          const groupObject = record.get('groupObject');
          const afterRegister = record.get('afterRegister');
          return {
            required: afterRegister === '3',
            lovPara: groupObject
              ? {
                  tenantId: groupObject.tenantId,
                }
              : {},
          };
        },
        lovQueryAxiosConfig: (lovCode, data, lovPara) => {
          return {
            url: `${SRM_SSLM}/v1/${lovPara.data.tenantId}/investigate-templates/inv/temp/lov`,
            method: 'GET',
          };
        },
      },
      {
        name: 'questionnaireTemplate',
        type: 'string',
        bind: 'questionnaireTemplateObject.investigateTemplateId',
      },
      {
        name: 'templateName',
        type: 'string',
        bind: 'questionnaireTemplateObject.templateName',
      },
      {
        name: 'userIdList',
        type: 'object',
        lovCode: 'SPUC.ACCEPT_USER',
        label: intl.get('hptl.portalAssign.model.portalAssign.userIdList').d('接收者子账户'),
        valueField: 'userId',
        multiple: true,
        dynamicProps: ({ record }) => {
          const groupObject = record.get('groupObject');
          if (groupObject) {
            return {
              lovPara: {
                tenantId: groupObject.tenantId,
              },
            };
          }
        },
      },
      {
        name: 'userNameList',
        type: 'array',
        multiple: true,
      },
      {
        name: 'personalRegisterFlag',
        type: 'boolean',
        label: intl.get('hptl.portalAssign.model.portalAssign.personalRegister').d('启用个人注册'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'mustCompanyTabs',
        label: intl
          .get(`hptl.portalAssign.model.portalAssign.otherInformRequired`)
          .d('其他信息必填页签'),
        lookupCode: 'SPFM.COMPANY_TABS',
        multiple: true,
        transformRequest: (value) => value && value.join(','),
        transformResponse: (value) => value && value.split(','),
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('newRegisterFlag') === 1;
          },
        },
      },
      {
        name: 'domainNameUser',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.domainNameUser').d('域名使用方'),
        lookupCode: 'SPFM.PORTAL_DOMAIN_NAME_USER',
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/${getCurrentUrl}`,
          method: 'get',
          // data,
          data: {
            ...data,
            customizeUnitCode: isTenant
              ? 'SPFM.PORTAL.MANAGE.TENANT.SEARCH_BAR'
              : 'PORTAL.ASSIGN.SEARCH_BAR', // 筛选器个性化单元编码
          },
        };
      },
      create: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/${getCurrentUrl}`,
          method: 'post',
          data: data[0],
        };
      },
      update: ({ data }) => {
        const newData = data[0];
        const { userIdList } = newData;
        if (userIdList) {
          newData.userIdList = userIdList.map((item) => item.userId);
          newData.userNameList = userIdList.map((item) => item.userName);
        }
        return {
          url: `${SRM_PLATFORM}/v1/${getCurrentUrl}`,
          method: 'put',
          data: newData,
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/${getCurrentUrl}`,
          method: 'delete',
          data: data[0],
        };
      },
    },
  };
}

export function layoutDs() {
  return {
    // autoQuery: true,
    pageSize: 10,
    primaryKey: 'layoutId',
    cacheSelection: true,
    forceValidate: true,
    fields: [
      {
        name: 'layoutObject',
        type: 'object',
        ignore: "always",
        textField: 'layoutName',
        valueField: 'layoutCode',
        label: intl.get('hptl.portalAssign.model.portalAssign.templateName').d('模板名称'),
      },
      {
        name: 'layoutId',
        type: 'string',
        bind: 'layoutObject.layoutId',
        disabled: true,
      },
      {
        name: 'layoutCode',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.layoutCode').d('模板编码'),
        bind: 'layoutObject.layoutCode',
      },
      {
        name: 'layoutName',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.templateName').d('模板名称'),
        bind: 'layoutObject.layoutName',
        required: true,
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.description').d('模板描述'),
      },
      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('hptl.portalAssign.model.portalAssign.tenantName').d('所属租户'),
      },

      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enable').d('启用'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/${getCurrentUrl}`,
          method: 'get',
          // data,
          data: {
            ...data,
            customizeUnitCode: isTenant
              ? 'SPFM.PORTAL.LAYOUT.MANAGE.TENANT.SEARCH_BAR'
              : 'PORTAL_LAYOUT.SEARCH', // 筛选器个性化单元编码
          },
        };
      },
      create: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/${getCurrentUrl}`,
          method: 'post',
          data: data[0],
        };
      },
    },
  };
}
