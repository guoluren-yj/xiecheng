/*
 * HistoryVersion - 历史版本对比
 * @date: 2018/08/08 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';

import ListTable from './ListTable';
import OperationRecordModal from './OperationRecordModal';

/**
 * 历史版本对比页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invitationList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['sslm.historyVersion', 'sslm.enterpriseInform'] })
export default class HistoryVersion extends Component {
  constructor(props) {
    super(props);
    const isPub = props.location.pathname.includes('/pub/'); // 判断是否为pub页面
    const isInclude = this.props.location.pathname.includes('/include/'); // 判断是否为include页面
    const routerParam = qs.parse(this.props.location.search.substr(1));
    const {
      companyId,
      partnerCompanyId,
      tenantId,
      partnerTenantId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
      changeReqId,
      sourceTarget,
      toStageId,
      requisitionId,
    } = routerParam;
    this.state = {
      type: null,
      operationVisible: false,
      companyId,
      partnerCompanyId,
      tenantId,
      partnerTenantId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
      changeReqId,
      investgHeaderId: null, // 调查表头id
      applyChangeReqId: null, // 企业信息变更，供应商信息变更单据id
      isPub,
      sourceTarget,
      toStageId,
      requisitionId,
      isInclude,
    };
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  getSnapshotBeforeUpdate(nextProps) {
    const routerParam = qs.parse(this.props.location.search.substr(1));
    const nextRouterParam = qs.parse(nextProps.location.search.substr(1));
    const changeFlag =
      routerParam.changeReqId !== nextRouterParam.changeReqId ||
      routerParam.companyId !== nextRouterParam.companyId ||
      routerParam.supplierCompanyId !== nextRouterParam.supplierCompanyId ||
      routerParam.sourceTarget !== nextRouterParam.sourceTarget ||
      routerParam.toStageId !== nextRouterParam.toStageId ||
      routerParam.requisitionId !== nextRouterParam.requisitionId;
    if (changeFlag) {
      this.setState({
        companyId: nextRouterParam.companyId,
        partnerCompanyId: nextRouterParam.partnerCompanyId,
        tenantId: nextRouterParam.tenantId,
        partnerTenantId: nextRouterParam.partnerTenantId,
        supplierCompanyId: nextRouterParam.supplierCompanyId,
        spfmCompanyId: nextRouterParam.spfmCompanyId,
        spfmPartnerCompanyId: nextRouterParam.spfmPartnerCompanyId,
        changeReqId: nextRouterParam.changeReqId,
        sourceTarget: nextRouterParam.sourceTarget,
        toStageId: nextRouterParam.toStageId,
        requisitionId: nextRouterParam.requisitionId,
      });
    }
    return changeFlag;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      modelName = 'supplierDetail',
      [modelName]: { historyPagination = {} },
    } = this.props;
    if (snapshot) {
      this.handleSearch(historyPagination);
    }
  }

  componentDidMount() {
    const {
      modelName = 'supplierDetail',
      [modelName]: { historyPagination = {} },
    } = this.props;
    this.props.dispatch({
      type: `${modelName}/init`,
    });
    this.handleSearch(historyPagination);
  }

  componentWillUnmount() {
    const { dispatch, modelName = 'supplierDetail' } = this.props;

    dispatch({
      type: `${modelName}/clearHistoryVersionData`,
    });
  }

  /**
   * 查询历史版本列表
   * @param {Object} page 查询字段
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, modelName = 'supplierDetail' } = this.props;
    const routerParam = qs.parse(this.props.location.search.substr(1));
    const { companyId, partnerCompanyId } = routerParam;
    if (partnerCompanyId && companyId) {
      dispatch({
        type: `${modelName}/fetchHistoryVersionList`,
        payload: {
          page,
          supplierId: partnerCompanyId,
          purchaserId: companyId,
        },
      });
    }
  }

  /**
   * 查询历史版本列表
   * @param {Object} page 查询字段
   */
  @Bind()
  handleSearchOperationList(page = {}) {
    const { type, investgHeaderId, applyChangeReqId } = this.state;
    const { dispatch, modelName = 'supplierDetail' } = this.props;
    dispatch({
      type: `${modelName}/fetchOperationList`,
      payload: {
        page,
        type,
        investgHeaderId,
        changeReqId: applyChangeReqId,
      },
    });
  }

  /**
   * 打开操作记录弹窗
   * @param {*} type
   */
  @Bind()
  handleOperate(type, investgHeaderId, applyChangeReqId) {
    this.setState({
      type,
      investgHeaderId,
      applyChangeReqId,
      operationVisible: true,
    });
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  handleCancel() {
    this.setState({
      operationVisible: false,
    });
  }

  // 处理返回路径
  @Bind()
  handleBackPath() {
    const {
      companyId,
      partnerCompanyId,
      tenantId,
      partnerTenantId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
      changeReqId,
      sourceTarget,
      toStageId,
      requisitionId,
    } = this.state;
    const { match, location } = this.props;
    const { source } = qs.parse(location.search.substr(1));
    let backPath = '';
    switch (source) {
      case 'collectQuery': // 生命周期汇总查询列表
        backPath = '/sslm/supplier-manager/list';
        break;
      default: {
        const basePath = match.path.substring(0, match.path.indexOf('/version-history'));
        backPath = `${basePath}/supplier-detail?${qs.stringify({
          tenantId,
          companyId,
          partnerCompanyId,
          partnerTenantId,
          supplierCompanyId,
          spfmCompanyId,
          spfmPartnerCompanyId,
          changeReqId,
          sourceTarget,
          toStageId,
          requisitionId,
        })}`;
        break;
      }
    }
    return backPath;
  }

  render() {
    const { remote, modelName = 'supplierDetail' } = this.props;
    const {
      [modelName]: { historyPagination, operationPagination, historyList, operationList },
      loading,
      operationLoading,
    } = this.props;
    const { operationVisible, isPub, isInclude } = this.state;
    const listProps = {
      loading,
      remote,
      pagination: historyPagination,
      dataSource: historyList,
      searchPaging: this.handleSearch,
      operate: this.handleOperate,
      isPub,
      isInclude,
    };
    const hiddenBackPath = isInclude;

    return (
      <React.Fragment>
        <Header
          title={intl.get('sslm.historyVersion.view.message.titleHistory').d('历史版本对比')}
          backPath={hiddenBackPath ? '' : this.handleBackPath()}
        />
        <Content>
          <ListTable {...listProps} />
        </Content>
        {operationVisible && (
          <OperationRecordModal
            handleSearch={this.handleSearchOperationList}
            pagination={operationPagination}
            dataSource={operationList}
            loading={operationLoading}
            visible={operationVisible}
            onCancel={this.handleCancel}
          />
        )}
      </React.Fragment>
    );
  }
}
