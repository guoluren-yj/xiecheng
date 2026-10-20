/**
 * 字段映射 DataSet
 * @Author: chendengji <dengji.chen@hand-china.com>
 * @Date: 2020-08-20 13:37:15
 * @LastEditTime: 2019-10-11 10:03:57
 * @Copyright: Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export default () => ({
  selection: false,
  transport: {
    read: () => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/model-setting-lines`,
        method: 'GET',
      };
    },
    submit: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/model-setting-lines`,
        data,
        params,
        method: 'POST',
      };
    },
  },
  primaryKey: 'modelSettingLineId',
  fields: [
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.sourceField`).d('来源字段'),
      name: 'sourceName',
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.configTableField`).d('配置表字段'),
      name: 'modelFieldName',
    },
    {
      name: 'modelName',
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.targetField`).d('目标字段'),
      name: 'targetName',
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.fieldProperties`).d('字段属性'),
      name: 'fieldProps',
      ignore: 'always',
    },
    {
      name: 'fieldProperty',
    },
  ],
});
