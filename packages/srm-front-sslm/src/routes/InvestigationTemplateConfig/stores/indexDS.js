import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

// 模板ds
const listDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'releaseFlag',
      label: intl.get('sslm.investDefOrg.model.investDefOrg.latestFlag').d('生效状态'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'templateCode',
      label: intl
        .get('sslm.investTempConfig.model.investTempConfig.investTemplateCode')
        .d('调查表模板编码'),
      disabled: true,
    },
    {
      name: 'templateName',
      type: 'intl',
      required: true,
      maxLength: 255,
      label: intl
        .get('sslm.investDefOrg.model.investDefOrg.investTemplateName')
        .d('调查表模板名称'),
    },
    {
      name: 'investigateType',
      label: intl.get(`sslm.investDefOrg.model.investDefOrg.investigateType`).d('调查表类型'),
      lookupCode: 'SSLM.INVESTIGATE_TYPE',
      required: true,
    },
    {
      name: 'industryId',
      label: intl.get(`sslm.investDefOrg.model.investDefOrg.industryId`).d('行业'),
      type: 'object',
      lovCode: 'SPFM.INDUSTRYS',
      transformRequest: value => value && value.industryId,
    },
    {
      name: 'remark',
      label: intl.get(`hzero.common.remark`).d('备注'),
    },
    {
      name: 'versionNumber',
      label: intl.get(`sslm.investDefOrg.model.investDefOrg.versionNumber`).d('版本'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
    },
    {
      name: 'creator',
      label: intl.get(`sslm.investDefOrg.model.investDefOrg.creator`).d('创建人'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('hzero.common.status.enable').d('启用'),
      defaultValue: 1,
    },
    {
      name: 'reserveFlag',
      type: 'Boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('sslm.investTempConfig.model.investTempConfig.reserveFlag')
        .d('跨模板或跨版本时预留字段自动带值'),
    },
    {
      name: 'customStatus',
      label: intl.get('hzero.common.common.status').d('状态'),
      ignore: 'always',
      transformResponse: (value, data) => {
        const { releaseFlag, enabledFlag } = data;
        if (enabledFlag === 0 && releaseFlag === 1) {
          return 'TEMPT_DISABLED';
        }
        return releaseFlag;
      },
    },
    {
      name: 'customStatusMeaning',
      ignore: 'always',
      transformResponse: (value, data) => {
        const { enabledFlag, releaseFlag, releaseFlagMeaning } = data;
        if (enabledFlag === 0 && releaseFlag === 1) {
          return intl.get('hzero.common.status.alreadyDisabled').d('已禁用');
        }
        return releaseFlagMeaning;
      },
    },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/investigate-templates/query-template`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode:
            'SSLM.INVESTIGATION_TEMP_CONFIG.SEARCH_BAR,SSLM.INVESTIGATION_TEMP_CONFIG.LIST_TABLE',
        },
      };
    },
  },
});

// 历史版本
const getHistoryVersionDS = () => ({
  selection: false,
  fields: [
    {
      name: 'versionNumber',
      type: 'string',
      label: intl.get(`sslm.investDefOrg.model.investDefOrg.versionNumber`).d('版本'),
    },
    {
      name: 'releaseDate',
      type: 'dateTime',
      label: intl.get('hzero.common.date.releaseTime').d('发布时间'),
    },
    {
      name: 'releaseName',
      label: intl.get('sslm.investTempConfig.modal.investTempConfig.publisher').d('发布人'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/investigate-templates/history`,
        method: 'GET',
        params: {
          ...params,
          ...data,
        },
        data: {},
      };
    },
  },
});

export { listDS, getHistoryVersionDS };
