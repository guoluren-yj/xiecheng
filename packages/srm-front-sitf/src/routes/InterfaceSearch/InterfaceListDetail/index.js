/**
 * interfaceListDetail - 接口详情查询 租户级
 * @date: 2018-9-18
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import InterfaceListDetail from './InterfaceListDetail';

/**
 * 接口详情查询 租户级
 * @extends {Component} - React.Component
 * @reactProps {Object} interfaceListDetail - 数据源
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ interfaceListDetail, loading }) => ({
  interfaceListDetail,
  fetchData: loading.effects['interfaceListDetail/fetchData'],
  fetchConfig: loading.effects['interfaceListDetail/fetchConfig'],
}))
export default class Main extends InterfaceListDetail {}
