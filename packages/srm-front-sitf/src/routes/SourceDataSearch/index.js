/**
 * SourceDataSearch - 源数据查询
 * @date: 2018-10-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import SourceDataSearch from './SourceDataSearch';

/**
 * 源数据查询
 * @extends {Component} - React.Component
 * @reactProps {Object} supplierDetail - 数据源
 * @return React.element
 */
@connect(({ sourceDataSearch, loading }) => ({
  sourceDataSearch,
  queryBatchList: loading.effects['sourceDataSearch/queryBatchList'],
}))
export default class Main extends SourceDataSearch {}
