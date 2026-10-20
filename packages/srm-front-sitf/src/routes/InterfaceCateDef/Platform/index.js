/**
 * InterfaceCateDef - 接口类别定义页面 --平台级
 * @date: 2018-11-30
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import TenantIndex from '../Tenant/index';

@connect(({ interfaceCateDef, loading }) => ({
  interfaceCateDef,
  loading: loading.effects['interfaceCateDef/fetchInterfaceCareDef'],
}))
export default class index extends TenantIndex {}
