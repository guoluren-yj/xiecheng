/**
 * interfacePageConfig - 接口页面配置 - 平台级
 * @date: 2018-12-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import InterfacePageConfig from './InterfacePageConfig';

/**
 * 接口查询
 * @extends {Component} - React.Component
 * @reactProps {Object} interfacePageConfig - 数据源
 * @return React.element
 */
@connect(({ interfacePageConfig, loading }) => ({
  interfacePageConfig,
  loading: loading.effects,
  saveLoading: loading.effects['interfacePageConfig/save'],
  fetchLoading: loading.effects['interfacePageConfig/fetch'],
}))
export default class Main extends InterfacePageConfig {}
