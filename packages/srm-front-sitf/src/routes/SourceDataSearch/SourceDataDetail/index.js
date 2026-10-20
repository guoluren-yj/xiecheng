/**
 * SourceDataDetail - 源数据查询 - 源数据模板
 * @date: 2018-10-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import SourceDataDetail from './SourceDataDetail';

/**
 * 源数据模板
 * @extends {Component} - React.Component
 * @reactProps {Object} sourceDataSearch - 数据源
 * @return React.element
 */
@connect(({ sourceDataSearch, loading }) => ({
  sourceDataSearch,
  fetchConfig: loading.effects['sourceDataSearch/fetchConfig'],
  fetchData: loading.effects['sourceDataSearch/fetchData'],
}))
export default class Main extends SourceDataDetail {}
