/**
 * InterfaceSearchOrg - 接口查询 租户级
 * @date: 2018-9-18
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import InterfaceSearch from '../InterfaceSearch/InterfaceSearch';

/**
 * InterfaceSearchOrg - 接口查询 租户级
 * @extends {Component} - React.Component
 * @reactProps {Object} interfaceSearchOrg - 数据源
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ interfaceSearchOrg, loading, batchStatisticOrg }) => ({
  interfaceSearchOrg,
  batchStatisticOrg,
  modelName: 'interfaceSearchOrg',
  queryInterfaceList: loading.effects['interfaceSearchOrg/queryInterfaceList'],
  queryBatchList: loading.effects['interfaceSearchOrg/queryBatchList'],
  reRunBatchList: loading.effects['interfaceSearchOrg/reRunBatchList'],
}))
export default class Main extends InterfaceSearch {}
