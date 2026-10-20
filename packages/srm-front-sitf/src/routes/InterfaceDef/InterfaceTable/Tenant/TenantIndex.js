/**
 * InterfaceDef -接口表定义 查询页 --租户级 继承 index
 * @date: 2018-12-28
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { connect } from 'dva';

import index from './index';

@connect(({ interfaceDefOrg, loading }) => ({
  interfaceDefOrg,
  modelName: 'interfaceDefOrg',
  loading: loading.effects['interfaceDefOrg/fetchInterfaceDef'],
  tableLoading: loading.effects['interfaceDefOrg/fetchInterFaceTable'],
}))
export default class TenantIndex extends index {}
