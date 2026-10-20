/**
 * SourceDataSearchOrg - 源数据查询 - 租户级
 * @date: 2018-10-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import SourceDataSearch from '../SourceDataSearch/SourceDataSearch';

/**
 * 源数据查询 - 租户级
 * @extends {Component} - React.Component
 * @reactProps {Object} - sourceDataSearchOrg 数据源
 * @reactProps {Function} - [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ sourceDataSearchOrg, loading }) => ({
  sourceDataSearchOrg,
  modelName: 'sourceDataSearchOrg',
  queryBatchList: loading.effects['sourceDataSearchOrg/queryBatchList'],
}))
export default class Main extends SourceDataSearch {}
