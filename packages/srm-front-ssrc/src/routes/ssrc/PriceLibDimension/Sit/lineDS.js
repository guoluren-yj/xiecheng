import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import intl from 'utils/intl';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const listLineDS = () => ({
  // autoQuery: true,
  selection: false,
  primaryKey: 'templateId',

  // table表单显示的字段
  fields: [
    {
      name: 'templateStatusMeaning',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'templateCode',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.templateCode').d('模板编码'),
      format: 'uppercase',
      validator: (value, _, record) => {
        const reg = /[a-z\u4e00-\u9fa5]/g;
        if (reg.test(record.get('templateCode'))) {
          return intl
            .get('ssrc.priceLibDimension.priceLibCode.validation.notLowercase')
            .d('价格库编码不能为中文和小写英文字母');
        }
        return true;
      },
    },
    {
      name: 'templateName',
      type: 'intl',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.templateName').d('模板名称'),
    },
    {
      name: 'templateType',
      type: 'string',
      // required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.templateType').d('模板类型'),
      lookupCode: 'SSRC.PRICE_LIB_TEMPLATE_TYPE',
    },
    {
      name: 'remark',
      type: 'intl',
      label: intl.get('hzero.common.remark').d('备注'),
    },

    {
      name: 'templateDetail',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.templateManage').d('模板管理'),
    },
    {
      name: 'realName',
      type: 'string',
      defaultValue: getCurrentUser().realName,
      label: intl.get('ssrc.priceLibDimension.model.dimension.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('ssrc.priceLibDimension.model.dimension.creationDate').d('创建时间'),
      transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'versionNum',
      type: 'number',
      label: intl.get('ssrc.priceLibDimension.model.dimension.versionNum').d('版本'),
    },
    {
      name: 'enable',
      type: 'string',
      label: intl.get('hzero.common.status.enable').d('启用'),
    },
    {
      name: 'edit',
      type: 'string',
      label: intl.get('hzero.common.edit').d('编辑'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.operation').d('操作记录'),
    },
  ],

  // 查询表单字段
  queryFields: [
    {
      name: 'codeOrName',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.temCodeOrName').d('模板编码/名称'),
      labelWidth: 150,
      format: 'uppercase',
    },
    {
      name: 'templateType',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.templateType').d('模板类型'),
      lookupCode: 'SSRC.PRICE_LIB_TEMPLATE_TYPE',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SPC}/v1/${organizationId}/price-lib-templates/list/platform`,
      method: 'GET',
    },
    submit: (val) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-templates/platform`,
        data: val.data,
        method: 'POST',
      };
    },
  },
});

export { listLineDS };
