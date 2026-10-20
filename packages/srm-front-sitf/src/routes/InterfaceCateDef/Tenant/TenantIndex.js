/**
 * TenantIndex -接口类别定义
 * @date: 2018-11-30
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import index from './index';

@connect(({ interfaceCateDefOrg, loading }) => ({
  interfaceCateDefOrg,
  modelName: 'interfaceCateDefOrg',
  loading: loading.effects['interfaceCateDefOrg/fetchInterfaceCareDef'],
  updateLoading: loading.effects['interfaceCateDefOrg/updateInterFaceCareDef'],
}))
export default class TenantIndex extends index {}
