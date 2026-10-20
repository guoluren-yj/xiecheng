import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function thirdPartyRelationDS() {
  return {
    primaryKey: 'relationId',
    autoQuery: true,
    selection: 'multiple',
    autoQueryAfterSubmit: true,
    pageSize: 10,
    // table表单显示的字段
    fields: [
      {
        name: 'user',
        type: 'object',
        lovCode: 'HIAM.USER.ORG',
        lovPara: { tenantId: organizationId },
        label: intl.get('smbl.common.model.realName').d('用户名'),
        required: true,
      },
      {
        name: 'loginName',
        type: 'string',
        label: intl.get('smbl.common.model.loginName').d('账号'),
        bind: 'user.loginName',
      },
      {
        name: 'userId',
        type: 'string',
        bind: 'user.id',
      },
      {
        name: 'realName',
        type: 'string',
        label: intl.get('smbl.common.model.realName').d('用户名'),
        bind: 'user.realName',
      },
      {
        name: 'thirdUserName',
        type: 'string',
        label: intl
          .get('smbl.thirdPartyRelation.model.ThirdPartyRelation.thirdUserName')
          .d('三方用户名'),
        required: true,
      },
      {
        name: 'thirdPartyAccount',
        type: 'object',
        label: intl
          .get('smbl.thirdPartyAcc.model.ThirdPartyAcc.thirdPartyAccount')
          .d('三方运营账号'),
        lovCode: 'SMBL.THIRD_PARTY_ACCOUNT',
        lovPara: { tenantId: organizationId },
        required: true,
      },
      {
        name: 'thirdPartyAccountDesc',
        type: 'string',
        label: intl
          .get('smbl.thirdPartyAcc.model.ThirdPartyAcc.thirdPartyAccount')
          .d('三方运营账号'),
        bind: 'thirdPartyAccount.thirdPartyAccountDesc',
      },
      {
        name: 'thirdPartyAccountId',
        type: 'string',
        bind: 'thirdPartyAccount.thirdPartyAccountId',
      },
      {
        name: 'thirdPartyDesc',
        type: 'string',
        label: intl.get('smbl.thirdParty.model.ThirdParty.thirdParty').d('三方平台'),
        bind: 'thirdPartyAccount.thirdPartyDesc',
      },
      {
        name: 'creationDate',
        type: 'string',
        label: intl.get('smbl.thirdParty.model.create.time').d('绑定时间'),
      },
      {
        name: 'userTenantName',
        type: 'string',
        label: intl.get('hzero.common.model.tenantName').d('租户'),
      },
      {
        name: 'tenantName',
        type: 'string',
        label: intl.get('smbl.thirdParty.view.thirdPartyAccount.tenant').d('三方账号所属租户'),
      },
      // {
      //   name: 'test',
      //   type: 'string',
      //   label: '所属租户一致',
      // },
      {
        name: 'enableFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enabled').d('启用'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
    ],
    // 查询表单字段
    queryFields: [
      {
        name: 'loginName',
        type: 'string',
        label: intl.get('smbl.common.model.loginName').d('账号'),
      },
      {
        name: 'realName',
        type: 'string',
        label: intl.get('smbl.common.model.realName').d('用户名'),
      },
      {
        name: 'thirdUserName',
        type: 'string',
        label: intl
          .get('smbl.thirdPartyRelation.model.ThirdPartyRelation.thirdUserName')
          .d('三方用户名'),
      },
      {
        name: 'tenant',
        type: 'object',
        label: intl.get('hzero.common.model.tenantName').d('租户'),
        lovCode: 'HPFM.TENANT',
      },
      // {
      //   name: 'thirdParty',
      //   type: 'object',
      //   label: intl.get('smbl.thirdParty.model.ThirdParty.thirdParty').d('三方平台'),
      //   lovCode: 'SMBL.THIRD_PARTY.VIEW',
      // },
      {
        name: 'thirdPartyAccount',
        type: 'object',
        label: intl
          .get('smbl.thirdPartyAcc.model.ThirdPartyAcc.thirdPartyAccount')
          .d('三方运营账号'),
        lovCode: 'SMBL.THIRD_PARTY_ACCOUNT',
        lovPara: { tenantId: organizationId },
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
          userTenantId: data.tenant !== undefined ? data.tenant.tenantId : null,
          // thirdPartyId: data.thirdParty !== undefined ? data.thirdParty.thirdPartyId : null,
          thirdPartyAccountId:
            data.thirdPartyAccount !== undefined
              ? data.thirdPartyAccount.thirdPartyAccountId
              : null,
        };
        delete newData.thirdParty;
        delete newData.tenant;
        delete newData.thirdPartyAccount;
        let realUrl = `${SRM_SMBL}/v1/third-party-relations`;
        if (isTenantRoleLevel()) {
          realUrl = `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/third-party-relations`;
        }
        return {
          data: { ...newData },
          url: realUrl,
          method: 'get',
        };
      },
      destroy: () => {
        let realUrl = `${SRM_SMBL}/v1/third-party-relations`;
        if (isTenantRoleLevel()) {
          realUrl = `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/third-party-relations`;
        }
        return {
          url: realUrl,
          method: 'delete',
        };
      },
      update: () => {
        let realUrl = `${SRM_SMBL}/v1/third-party-relations`;
        if (isTenantRoleLevel()) {
          realUrl = `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/third-party-relations`;
        }
        return {
          url: realUrl,
          method: 'post',
        };
      },
      create: () => {
        let realUrl = `${SRM_SMBL}/v1/third-party-relations`;
        if (isTenantRoleLevel()) {
          realUrl = `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/third-party-relations`;
        }
        return {
          url: realUrl,
          method: 'post',
        };
      },
    },
  };
}

export { thirdPartyRelationDS };
