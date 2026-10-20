/**
 * InterfaceSearchOrg - 接口查询详情 租户级
 * @date: 2018-9-18
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import InterfaceListDetail from '../../InterfaceSearch/InterfaceListDetail/InterfaceListDetail';

/**
 * interfaceListDetailOrg - 接口查询详情 租户级
 * @extends {Component} - React.Component
 * @reactProps {Object} interfaceListDetailOrg - 数据源
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ interfaceListDetailOrg, loading, batchStatisticOrg }) => ({
  interfaceListDetailOrg,
  batchStatisticOrg,
  modelName: 'interfaceListDetailOrg',
  fetchData: loading.effects['interfaceListDetailOrg/fetchData'],
  fetchConfig: loading.effects['interfaceListDetailOrg/fetchConfig'],
}))
export default class Main extends InterfaceListDetail {}
