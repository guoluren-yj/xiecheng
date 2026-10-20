import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

const BasicInfoDS = (isEdit) => ({
  autoCreate: true,
  fields: [
    {
      name: 'templateId',
    },
    {
      name: 'templateCode',
      type: 'string',
      required: isEdit,
      label: intl.get('ssrc.priceLibDimension.model.dimension.priceLibCode').d('价格库编码'),
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
      required: isEdit,
      label: intl.get('ssrc.priceLibDimension.model.dimension.priceLibName').d('价格库名称'),
    },
    {
      name: 'templateStatus',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
      lookupCode: 'SSRC.PRICE_LIB_TEMPLATE_STATUS',
    },
    {
      name: 'templateType',
      type: 'string',
      // required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.priceLibType').d('价格库类型'),
      lookupCode: 'SSRC.PRICE_LIB_TEMPLATE_TYPE',
    },
    {
      name: 'versionNum',
      type: 'number',
      label: intl.get('ssrc.priceLibDimension.model.dimension.versionNum').d('版本'),
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
      // transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('hzero.common.remark').d('备注'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SPC}/v1/${organizationId}/price-lib-templates/detail`,
      method: 'GET',
    },
    submit: (val) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-templates`,
        data: val.data,
        method: 'POST',
      };
    },
  },
});

export default BasicInfoDS;
