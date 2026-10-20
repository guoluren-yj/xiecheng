import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';

function thirdPartyAccDS() {
  return {
    primaryKey: 'thirdPartyAccountId',
    autoQuery: true,
    selection: 'multiple',
    autoQueryAfterSubmit: true,
    pageSize: 10,

    fields: [
      // table表单显示的字段
      {
        name: 'srmAccount',
        type: 'string',
        label: intl.get('smbl.thirdPartyAcc.model.ThirdPartyAcc.srmAccount').d('账号'),
      },

      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('hzero.common.model.tenantName').d('租户'),
      },
      {
        name: 'tenantId',
        type: 'string',
      },
      {
        name: 'thirdPartyAccount',
        type: 'string',
        label: intl
          .get('smbl.thirdPartyAcc.model.ThirdPartyAcc.thirdPartyAccount')
          .d('三方运营账号'),
        required: true,
      },
      {
        name: 'thirdPartySecret',
        type: 'string',
        label: intl.get('smbl.thirdPartyAcc.model.ThirdPartyAcc.thirdPartySecret').d('三方秘钥'),
      },
      {
        name: 'thirdPartyAccountDesc',
        type: 'intl',
        label: intl
          .get('smbl.thirdPartyAcc.model.ThirdPartyAcc.thirdPartyAccountDesc')
          .d('运营号描述'),
        required: true,
      },
      {
        name: 'thirdPartyDesc',
        type: 'object',
        label: intl.get('smbl.thirdParty.model.ThirdParty.thirdParty').d('三方平台'),
      },
      {
        name: 'thirdPartyId',
        type: 'string',
      },
      {
        name: 'enableFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enabled').d('启用'),
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'thirdPartyExecuteFlag',
        type: 'boolean',
        label: intl
          .get('smbl.thirdPartyAcc.model.ThirdPartyAcc.thirdPartyExecuteFlag')
          .d('启用客户系统认证'),
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'thirdPartyExecuteCode',
        type: 'string',
        label: intl
          .get('smbl.thirdPartyAcc.model.ThirdPartyAcc.thirdPartyExecuteCode')
          .d('客户系统认证执行代码'),
      },
      {
        name: 'siteFlag',
        type: 'boolean',
        label: intl.get('smbl.thirdPartyAcc.model.ThirdPartyAcc.siteFlag').d('是否平台运营账号'),
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'autoBindFlag',
        type: 'boolean',
        label: intl.get('smbl.thirdPartyAcc.model.ThirdPartyAcc.autoBindFlag').d('是否自动绑定'),
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'operationAction',
        type: 'string',
        label: intl.get('hzero.common.table.column.option').d('操作'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hzero.common.model.remark').d('备注'),
      },

      {
        name: 'tenant',
        type: 'object',
        label: intl.get('hzero.common.model.tenantName').d('租户'),
        lovCode: 'HPFM.TENANT',
        required: true,
      },
      {
        name: 'thirdParty',
        type: 'object',
        label: intl.get('smbl.thirdParty.model.ThirdParty.thirdParty').d('三方平台'),
        lovCode: 'SMBL.THIRD_PARTY.VIEW',
        required: true,
      },

      {
        name: 'application',
        type: 'object',
        label: intl.get('smbl.thirdParty.model.ThirdParty.application').d('应用'),
        noCache: true,
        lovCode: 'SMBL.APPLICATION.VIEW',
        required: true,
        transformRequest: (value) => value && value.applicationCode,
      },
      {
        name: 'applicationCode',
        bind: 'application.applicationCode',
      },
      {
        label: intl.get('smbl.thirdParty.model.ThirdParty.applicationName').d('应用名称'),
        name: 'applicationName',
        bind: 'application.applicationName',
      },
      {
        name: 'msgBorbidFlag',
        type: 'boolean',
        label: intl.get('smbl.thirdPartyAcc.model.ThirdPartyAcc.msgBorbidFlag').d('禁止消息推送'),
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'todoForbidFlag',
        type: 'boolean',
        label: intl.get('smbl.thirdPartyAcc.model.ThirdPartyAcc.todoForbidFlag').d('禁止待办推送'),
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'integrateMethod',
        type: 'string',
        required: true,
        label: intl.get('smbl.thirdPartyAcc.model.ThirdPartyAcc.integrateMethod').d('集成方式'),
        lookupCode: 'SMBL.THIRD_PARTY_ACC_INTEGRATE_METHOD',
      },
    ],
    // 查询表单字段
    queryFields: [
      {
        name: 'tenant',
        type: 'object',
        label: intl.get('hzero.common.model.tenantName').d('租户'),
        lovCode: 'HPFM.TENANT',
      },
      {
        name: 'thirdParty',
        type: 'object',
        label: intl.get('smbl.thirdParty.model.ThirdParty.thirdParty').d('三方平台'),
        lovCode: 'SMBL.THIRD_PARTY.VIEW',
      },
      {
        name: 'srmAccount',
        type: 'string',
        label: intl.get('smbl.thirdPartyAcc.model.ThirdPartyAcc.srmAccount').d('账号'),
      },
      {
        name: 'thirdPartyAccount',
        type: 'string',
        label: intl.get('smbl.thirdPartyAcc.model.ThirdPartyAcc.thirdPartyAccount').d('三方账号'),
      },
    ],

    // 事件
    events: {
      // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
      submitSuccess: ({ dataSet }) => dataSet.query(1),
    },

    transport: {
      read: ({ data }) => {
        const newData = {
          ...data,
          tenantId: data.tenant !== undefined ? data.tenant.tenantId : null,
          thirdPartyId: data.thirdParty !== undefined ? data.thirdParty.thirdPartyId : null,
        };
        delete newData.tenant;
        delete newData.thirdParty;
        return {
          data: { ...newData },
          url: `${SRM_SMBL}/v1/third-party-accs`,
          method: 'get',
        };
      },
      destroy: {
        url: `${SRM_SMBL}/v1/third-party-accs`,
        method: 'delete',
      },
      create: ({ data }) => {
        const newData = {
          ...data[0],
          tenantId:
            data[0].tenant.tenantId !== undefined ? data[0].tenant.tenantId : data[0].tenantId,
          tenantName:
            data[0].tenant.tenantName !== undefined
              ? data[0].tenant.tenantName
              : data[0].tenantName,
          thirdPartyId:
            data[0].thirdParty.thirdPartyId !== undefined
              ? data[0].thirdParty.thirdPartyId
              : data[0].thirdPartyId,
          thirdPartyDesc:
            data[0].thirdParty.thirdPartyDesc !== undefined
              ? data[0].thirdParty.thirdPartyDesc
              : data[0].thirdPartyDesc,
        };
        return {
          data: {
            ...newData,
          },
          url: `${SRM_SMBL}/v1/third-party-accs`,
          method: 'post',
        };
      },
      update: ({ data }) => {
        console.info(data[0].tenant.tenantId, 9999);
        const newData = {
          ...data[0],
          tenantId:
            data[0].tenant.tenantId !== undefined ? data[0].tenant.tenantId : data[0].tenantId,
          tenantName:
            data[0].tenant.tenantName !== undefined
              ? data[0].tenant.tenantName
              : data[0].tenantName,
          thirdPartyId:
            data[0].thirdParty.thirdPartyId !== undefined
              ? data[0].thirdParty.thirdPartyId
              : data[0].thirdPartyId,
          thirdPartyDesc:
            data[0].thirdParty.thirdPartyDesc !== undefined
              ? data[0].thirdParty.thirdPartyDesc
              : data[0].thirdPartyDesc,
        };
        return {
          data: {
            ...newData,
          },
          url: `${SRM_SMBL}/v1/third-party-accs`,
          method: 'post',
        };
      },
    },
  };
}
export { thirdPartyAccDS };
