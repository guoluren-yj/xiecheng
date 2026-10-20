/*
 * @Descripttion: 值列表相关DataSet配置
 * @Date: 2021-08-10 16:07:25
 * @Author: ZHIJIAN.XU@HAND-CHINA.COM
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import intl from 'srm-front-boot/lib/utils/intl';
import { getResponse } from 'utils/utils';

// TODO: 提测前删除
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const relyDs = (businessObjectId): DataSetProps => ({
  autoCreate: true,
  autoQuery: true,
  selection: false,
  paging: false,
  transport: {
    read: ({ params }) => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-field-dependence/list`,
      method: 'GET',
      params: {
        ...params,
        businessObjectId,
      },
    }),
    destroy: ({ data }) => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-field-dependence`,
      method: 'DELETE',
      data: data[0],
    }),
    create: ({ data }) => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-field-dependence`,
      method: 'POST',
      data: {
        ...data[0],
        businessObjectId,
      },
    }),
  },
  fields: [
    {
      name: 'fieldDependenceId',
      type: FieldType.string,
      unique: true,
    },
    {
      label: intl.get('hmde.bo.field.rely.controlField').d('控制字段'),
      name: 'controlBusinessObjectField',
      type: FieldType.object,
      required: true,
      textField: 'businessObjectFieldName',
      valueField: 'businessObjectFieldCode',
      lookupAxiosConfig: () => {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-field-dependence/available-field/list`,
          method: 'GET',
          params: {
            businessObjectId,
          },
        };
      },
      ignore: FieldIgnore.always,
    },
    {
      name: 'controlBusinessObjectFieldCode',
      type: FieldType.string,
      bind: 'controlBusinessObjectField.businessObjectFieldCode',
    },
    {
      name: 'controlBusinessObjectFieldName',
      type: FieldType.string,
      bind: 'controlBusinessObjectField.businessObjectFieldName',
    },
    {
      label: intl.get('hmde.bo.field.rely.slaveField').d('受控字段'),
      name: 'slaveBusinessObjectField',
      type: FieldType.object,
      required: true,
      textField: 'businessObjectFieldName',
      valueField: 'businessObjectFieldCode',
      lookupAxiosConfig: () => {
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-field-dependence/available-field/list`,
          method: 'GET',
          params: {
            businessObjectId,
          },
        };
      },
      ignore: FieldIgnore.always,
    },
    {
      name: 'slaveBusinessObjectFieldCode',
      type: FieldType.string,
      bind: 'slaveBusinessObjectField.businessObjectFieldCode',
    },
    {
      name: 'slaveBusinessObjectFieldName',
      type: FieldType.string,
      bind: 'slaveBusinessObjectField.businessObjectFieldName',
    },
    {
      name: 'enabledFlag',
      type: FieldType.boolean,
    },
    {
      name: 'controlBusinessObjectFieldLovValueDTO',
      type: FieldType.object,
    },
  ],
});

const controlLovValueDs = (record): DataSetProps => ({
  transport: {
    read: () => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/business-object-field-dependence/${record.get('fieldDependenceId')}/detail`,
      method: 'GET',
      transformResponse: (response) => {
        const res = JSON.parse(response);
        if (getResponse(res)) {
          record.setState('lovCode', res.slaveBusinessObjectFieldLovCode);
          const valueMap = {};
          (res.controlBusinessObjectFieldLovValueDTO || []).forEach((item) => {
            valueMap[item?.value] = res.valueMap?.[item?.value] || [];
          });
          record.set('valueMap', valueMap);
          record.set(
            'controlBusinessObjectFieldLovValueDTO',
            res.controlBusinessObjectFieldLovValueDTO || []
          );
          return (
            res.controlBusinessObjectFieldLovValueDTO?.map((item) => ({
              ...item,
              valueMap: res.valueMap?.[item?.value] || [],
            })) || []
          );
        }
      },
    }),
    update: () => ({
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/business-object-field-dependence`,
      method: 'PUT',
      data: {
        ...record.toJSONData(),
      },
    }),
  },
  paging: false,
  fields: [
    {
      name: 'meaning',
      type: FieldType.string,
    },
    {
      name: 'value',
      type: FieldType.string,
    },
    {
      name: 'valueMap',
      multiple: true,
      type: FieldType.string,
    },
  ],
  events: {
    update: ({ name, value, record: _record }) => {
      if (name === 'valueMap') {
        const key = _record.get('value');
        record.set(`valueMap.${key}`, value);
      }
    },
  },
});

export { relyDs, controlLovValueDs };
