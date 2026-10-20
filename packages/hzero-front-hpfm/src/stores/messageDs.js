import { HZERO_PLATFORM } from 'utils/config';
import intl from 'utils/intl';
import { CODE } from 'utils/regExp';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();

function message() {
  return isTenant ? `${tenantId}/response-messages` : 'response-messages';
}

export const listTableDs = () => ({
  fields: [
    {
      label: intl.get('hzero.common.tenantName').d('所属租户'),
      name: 'tenantName',
    },
    // 原表格列
    {
      label: intl.get('hpfm.message.model.message.code').d('消息编码'),
      name: 'code',
    },
    {
      label: intl.get('hpfm.message.model.message.type').d('消息类型'),
      name: 'messageTypeCode',
    },
    {
      label: intl.get('hpfm.message.model.message.lang').d('语言'),
      name: 'langMeaning',
    },
    {
      label: intl.get('hpfm.message.model.message.description').d('消息描述'),
      name: 'description',
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${HZERO_PLATFORM}/v1/${message()}`,
        method: 'GET',
        params: {
          customizeUnitCode: isTenant
            ? 'HPFM.MESSAGE_USER_LIST.FILTER'
            : 'HPFM.MESSAGE_LIST.FILTER',
          ...params,
          interfaceVersion: 2,
        },
      };
    },
  },
});

// 详情页
export const detailFormDs = () => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('hpfm.message.model.message.tenant.name').d('租户名称'),
      name: 'tenantLov',
      lovCode: 'HPFM.TENANT',
      required: !isTenant,
      type: 'object',
      textField: 'tenantName',
      // lovPara: { tenantId: getCurrentOrganizationId() },
      ignore: 'always',
    },
    {
      name: 'tenantName',
      bind: 'tenantLov.tenantName',
    },
    {
      name: 'tenantNum',
      bind: 'tenantLov.tenantNum',
    },
    {
      name: 'tenantId',
      bind: 'tenantLov.tenantId',
    },
    {
      label: intl.get('hpfm.message.model.message.code').d('消息编码'),
      name: 'code',
      required: true,
      maxLength: 180,
      pattern: CODE,
      dynamicProps: ({ record }) => ({
        required: !(isTenant && parseInt(record.get('tenantId'), 10) === 0),
      }),
    },
    {
      label: intl.get('hzero.common.model.common.entryCategory').d('类别'),
      name: 'type',
      lookupCode: 'HPFM.MESSAGE_TYPE',
      dynamicProps: ({ record }) => ({
        required: !(isTenant && parseInt(record.get('tenantId'), 10) === 0),
      }),
    },
    {
      label: intl.get('hpfm.message.model.message.type').d('消息类型'),
      name: 'messageTypeCode',
      lookupCode: 'SYSTEM_ERROR_LIST',
      dynamicProps: ({ record }) => ({
        required: !(isTenant && parseInt(record.get('tenantId'), 10) === 0),
      }),
    },
    {
      label: intl.get('hpfm.message.model.issue.level').d('问题等级'),
      name: 'issueLevel',
      lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_LEVEL',
      dynamicProps: ({ record }) => ({
        required: !(isTenant && parseInt(record.get('tenantId'), 10) === 0),
      }),
    },
    {
      label: intl.get('hpfm.message.model.issue.module').d('问题模块'),
      name: 'issueModule',
      lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_MODULE',
      dynamicProps: ({ record }) => ({
        required: !(isTenant && parseInt(record.get('tenantId'), 10) === 0),
      }),
    },
    {
      label: intl.get('hpfm.message.model.issue.role.follow').d('默认跟进角色'),
      name: 'issueRoleFollows',
      multiple: true,
      lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_ROLE_FOLLOW',
      dynamicProps: ({ record }) => ({
        required: !(
          (isTenant && parseInt(record.get('tenantId'), 10) === 0) ||
          record.get('issueLevel') === 'IGNORE'
        ),
      }),
    },
    {
      label: intl.get('hpfm.message.model.issue.solution').d('解决方案'),
      name: 'issueSolution',
    },
  ],
});
