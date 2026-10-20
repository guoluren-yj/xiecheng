/**
 * index - 接口批次统计 - 租户级
 * @date: 2018-11-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import BatchStatistic from '../Site/BatchStatistic';

@connect(({ batchStatisticOrg, loading }) => ({
  batchStatisticOrg,
  modelName: 'batchStatisticOrg',
  fetchLoading: loading.effects['batchStatisticOrg/fetchBatchStatistic'],
}))
export default class Main extends BatchStatistic {}
