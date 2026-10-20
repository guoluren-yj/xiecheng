import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const listLineDS = () => ({
  // autoQuery: true,
  selection: false,
  primaryKey: 'translateId',

  // table表单显示的字段
  fields: [
    {
      name: 'tenantIdMeaning',
      type: 'string',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.tenantName').d('所属租户'),
    },
    {
      name: 'translateCode',
      type: 'string',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.translateCode').d('翻译编码'),
    },
    {
      name: 'translateName',
      type: 'string',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.translateName').d('翻译名称'),
    },
    {
      name: 'lovCode',
      type: 'string',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.lovCode').d('值集编码'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.remark').d('描述'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('hzero.common.status').d('状态'),
    },
  ],
  // 查询表单字段
  queryFields: [
    {
      name: 'translateCode',
      type: 'string',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.translateCode').d('翻译编码'),
    },
    {
      name: 'translateName',
      type: 'string',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.translateName').d('翻译名称'),
    },
    !isTenantRoleLevel() && {
      name: 'tenantNum',
      type: 'object',
      lovCode: 'HPFM.TENANT',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.sourceFrom').d('所属租户'),
      transformRequest: (value) => value && value.tenantNum,
    },
  ].filter(Boolean),
  transport: {
    read: {
      url: isTenantRoleLevel()
        ? `${HZERO_PLATFORM}/v1/${organizationId}/sql-translates`
        : `${HZERO_PLATFORM}/v1/${organizationId}/sql-translates/site`,
      method: 'GET',
    },
  },
});

// drawer form ds
const drawerFormDS = () => ({
  // autoQuery: true,
  // autoCreate: true,
  autoQueryAfterSubmit: false,

  // table表单显示的字段
  fields: [
    {
      name: 'translateCode',
      type: 'string',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.translateCode').d('翻译编码'),
      required: true,
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('translateCode'))) {
          return intl
            .get('hpfm.valueSetTranslate.translateCode.validation.notChinese')
            .d('翻译编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'translateName',
      type: 'intl',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.translateName').d('翻译名称'),
      required: true,
    },
    {
      name: 'tenantIdLov',
      type: 'object',
      lovCode: 'HPFM.TENANT',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.tenantIdLov').d('所属租户'),
      textField: 'tenantName',
      valueField: 'tenantId',
      ignore: 'always',
    },
    {
      name: 'tenantId',
      type: 'string',
      bind: 'tenantIdLov.tenantId',
    },
    {
      name: 'tenantIdMeaning',
      type: 'string',
      bind: 'tenantIdLov.tenantName',
    },
    {
      name: 'tenantNum',
      type: 'string',
      bind: 'tenantIdLov.tenantNum',
    },
    {
      name: 'lovCodeLov',
      type: 'object',
      lovCode: isTenantRoleLevel()
        ? 'HPFM.LOV.LOV_DETAIL_CODE.ORG'
        : 'HLOD.LOV.LOV_DETAIL_TYPE.SITE',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.lovCode').d('值集编码'),
      textField: 'lovCode',
      valueField: 'lovCode',
      ignore: 'always',
      required: true,
      lovQueryAxiosConfig: () => {
        return {
          url: `/hpfm/v1/lov-headers`,
          method: 'GET',
        };
      },
      lovPara: { enabledFlag: 1 },
    },
    {
      name: 'lovCode',
      type: 'string',
      bind: 'lovCodeLov.lovCode',
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.enabledFlag').d('是否启用'),
    },
    {
      name: 'remark',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.remark').d('描述'),
    },
    {
      name: 'sqlStatement',
      type: 'string',
      label: intl.get('hpfm.valueSetTranslate.model.valueSetTranslate.sqlStatement').d('sql语句'),
      required: true,
    },
  ],
  transport: {
    read: (params) => {
      return {
        url: isTenantRoleLevel()
          ? `${HZERO_PLATFORM}/v1/${organizationId}/sql-translates/${params.data.translateId}`
          : `${HZERO_PLATFORM}/v1/${organizationId}/sql-translates/${params.data.translateId}/site`,
        method: 'GET',
      };
    },
    submit: (val) => {
      return {
        url: isTenantRoleLevel()
          ? `${HZERO_PLATFORM}/v1/${organizationId}/sql-translates`
          : `${HZERO_PLATFORM}/v1/${organizationId}/sql-translates/site`,
        data: val.data[0],
        method: 'POST',
      };
    },
  },
});

export { listLineDS, drawerFormDS };
