/**
 * SourceDataDetail - 源数据查询 - 源数据模板
 * @date: 2018-10-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import SourceDataDetail from '../../SourceDataSearch/SourceDataDetail/SourceDataDetail';

/**
 * 源数据模板 - 租户级
 * @extends {Component} - React.Component
 * @reactProps {Object} sourceDataSearchOrg - 数据源
 * @return React.element
 */
@connect(({ sourceDataSearchOrg, loading }) => ({
  sourceDataSearchOrg,
  modelName: 'sourceDataSearchOrg',
  fetchConfig: loading.effects['sourceDataSearchOrg/fetchConfig'],
  fetchData: loading.effects['sourceDataSearchOrg/fetchData'],
}))
export default class Main extends SourceDataDetail {}
