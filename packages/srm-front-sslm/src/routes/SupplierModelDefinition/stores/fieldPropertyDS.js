/**
 * 字段属性 DataSet
 * @Author: chendengji <dengji.chen@hand-china.com>
 * @Date: 2020-08-20 13:37:15
 * @LastEditTime: 2019-10-11 10:03:57
 * @Copyright: Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export default () => ({
  paging: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/model-line-propertys`,
        method: 'GET',
        data: {},
        params: {
          ...params,
          modelSettingLineId: data.modelSettingLineId,
        },
      };
    },
    submit: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/model-line-propertys/save`,
        data,
        params,
        method: 'POST',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/model-line-propertys`,
        method: 'DELETE',
        data,
      };
    },
  },
  fields: [
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.fieldPropertyCode`).d('属性名称'),
      name: 'fieldPropertyCode',
      lookupCode: 'SSLM.MODEL.FIELD_PROPERTY',
      required: true,
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.fieldPropertyDesc`).d('属性描述'),
      name: 'fieldPropertyDesc',
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.fieldPropertyValue`).d('属性值'),
      name: 'fieldPropertyValue',
      computedProps: {
        required: ({ record }) => record.get('fieldPropertyCode') !== 'lovParam',
      },
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'fieldPropertyCode') {
        record.getField('fieldPropertyValue').reset();
        if (value === 'required' || value === 'display') {
          record.set('fieldPropertyValue', '1');
        } else if (value === 'disabled' || value === 'displayUrl') {
          record.set('fieldPropertyValue', '0');
        } else {
          record.set('fieldPropertyValue', '');
        }
      }
    },
  },
});
