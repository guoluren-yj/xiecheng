/**
 * PacketMonitor -接口请求报文监控 --租户级
 * @date: 2018-11-30
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import TenantIndex from '../Tenant/TenantIndex';

@connect(({ packetMonitorOrg, loading }) => ({
  packetMonitorOrg,
  modelName: 'packetMonitorOrg',
  loading: loading.effects['packetMonitorOrg/fetchPacketMonitor'],
}))
export default class index extends TenantIndex {}
