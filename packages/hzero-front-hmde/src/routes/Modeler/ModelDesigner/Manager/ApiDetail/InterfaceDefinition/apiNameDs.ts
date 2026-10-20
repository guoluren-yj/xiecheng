/*
 * @filename:
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import { isTenantRoleLevel } from 'utils/utils';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

// 接口名称LOVds
export default (refServiceCode): DataSetProps => ({
  autoCreate: true,
  fields: [
    {
      name: 'api',
      type: 'object' as FieldType,
      ignore: 'always' as FieldIgnore,
      required: true,
      lovCode: isTenantRoleLevel() ? 'HMDE.API' : 'HMDE.API.SITE',
      lovQueryAxiosConfig: {
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/apis/page?serviceCode=${refServiceCode}`,
        method: 'GET',
      },
    },
    { name: 'apiName', type: 'string' as FieldType, bind: 'api.apiName' },
    { name: 'apiCode', type: 'string' as FieldType, bind: 'api.apiCode' },
    { name: 'apiId', type: 'string' as FieldType, bind: 'api.apiId' },
    { name: 'apiPath', type: 'string' as FieldType, bind: 'api.apiPath' },
    { name: 'apiMethod', type: 'string' as FieldType, bind: 'api.apiMethod' },
    { name: 'logicModelApiBindId', type: 'string' as FieldType, bind: 'api.logicModelApiBindId' },
  ],
});
