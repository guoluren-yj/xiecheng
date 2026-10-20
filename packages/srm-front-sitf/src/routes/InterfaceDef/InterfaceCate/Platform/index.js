/**
 * InterfaceCate -接口类别定义 查询页 --平台级 继承 租户级index,传值不同
 * @date: 2018-12-28
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { connect } from 'dva';
import index from '../Tenant/index';

@connect(({ interfaceDef, loading }) => ({
  interfaceDef,
  loading: loading.effects['interfaceDef/fetchInterfaceDef'],
  tableLoading: loading.effects['interfaceDef/fetchInterFaceTable'],
}))
export default class TenantIndex extends index {}
