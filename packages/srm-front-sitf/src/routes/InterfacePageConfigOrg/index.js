/**
 * interfacePageConfigOrg - 接口页面配置 - 租户级
 * @date: 2018-12-24
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import InterfacePageConfig from '../InterfacePageConfig/InterfacePageConfig';

/**
 * 接口查询
 * @extends {Component} - React.Component
 * @reactProps {Object} interfacePageConfigOrg - 数据源
 * @return React.element
 */
@connect(({ interfacePageConfigOrg, loading }) => ({
  interfacePageConfigOrg,
  loading: loading.effects,
  modelName: 'interfacePageConfigOrg',
  saveLoading: loading.effects['interfacePageConfigOrg/save'],
  fetchLoading: loading.effects['interfacePageConfigOrg/fetch'],
}))
export default class Main extends InterfacePageConfig {}
