/*
 * Main - 历史版本对比
 * @date: 2018/08/08 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import HistoryVersion from '../../../SupplierDetail/HistoryVersion/HistoryVersion';

/**
 * 历史版本对比页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invitationList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, supplierDetailByManage }) => ({
  supplierDetailByManage,
  loading: loading.effects['supplierDetailByManage/fetchHistoryVersionList'],
  operationLoading: loading.effects['supplierDetailByManage/fetchOperationList'],
  modelName: 'supplierDetailByManage',
}))
export default class Main extends HistoryVersion {}
