/**
 * InterfaceSearch - 接口查询
 * @date: 2018-9-18
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import InterfaceSearch from './InterfaceSearch';

/**
 * 接口查询
 * @extends {Component} - React.Component
 * @reactProps {Object} interfaceSearch - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ interfaceSearch, loading, batchStatistic }) => ({
  interfaceSearch,
  batchStatistic,
  queryInterfaceList: loading.effects['interfaceSearch/queryInterfaceList'],
  queryBatchList: loading.effects['interfaceSearch/queryBatchList'],
  reRunBatchList: loading.effects['interfaceSearch/reRunBatchList'],
}))
export default class Main extends InterfaceSearch {}
