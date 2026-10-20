/*
 * Detail - 调查表明细维护
 * @date: 2018/08/08 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Button, Modal, Spin } from 'hzero-ui';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import FilterForm from './FilterForm';

/**
 * 调查表明细维护页面
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
@Form.create({ fieldNameProp: null })
@connect(({ loading, investigationDetailMaintain }) => ({
  investigationDetailMaintain,
  allLoading:
    loading.effects['investigationDetailMaintain/handlerRelease'] ||
    loading.effects['investigationDetailMaintain/handlerDeleteInvestigation'] ||
    loading.effects['investigationDetailMaintain/handlerSaveInvestigation'] ||
    loading.effects['investigationDetailMaintain/fetchInvestigationDetail'],
}))
@formatterCollections({
  code: ['sslm.investDetailMaintain', 'sslm.common', 'sslm.investigationCorrelation'],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const routerParam = querystring.parse(this.props.location.search.substr(1));
    this.state = {
      investgHeaderId: routerParam.investgHeaderId,
      investigateTemplateId: routerParam.investigateTemplateId,
    };
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = { ...prevState };
    const routerParam = querystring.parse(nextProps.location.search.substr(1));
    const { investigateTemplateId, investgHeaderId } = routerParam;
    if (investigateTemplateId !== prevState.investigateTemplateId) {
      nextState.investigateTemplateId = investigateTemplateId;
    }
    if (investgHeaderId !== prevState.investgHeaderId) {
      nextState.investgHeaderId = investgHeaderId;
    }
    return nextState;
  }

  getSnapshotBeforeUpdate(prevProps) {
    const thisParams = querystring.parse(this.props.location.search.substr(1));
    const prevParams = querystring.parse(prevProps.location.search.substr(1));
    const { investgHeaderId } = thisParams;
    const { investgHeaderId: prevInvestgHeaderId } = prevParams;
    return investgHeaderId !== prevInvestgHeaderId;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleQuery();
    }
  }

  componentDidMount() {
    this.handleQuery();
  }

  /**
   * 初始化查询
   */
  @Bind()
  handleQuery() {
    this.props.dispatch({
      type: 'investigationDetailMaintain/initCode',
    });
    this.fetchInvestigationDetail({ investgHeaderId: this.state.investgHeaderId });
  }

  /**
   * 查询邀约汇总列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  fetchInvestigationDetail(fields = {}) {
    const { dispatch } = this.props;
    if (fields.investgHeaderId) {
      dispatch({
        type: 'investigationDetailMaintain/fetchInvestigationDetail',
        payload: {
          ...fields,
          customizeUnitCode: 'SSLM.INVESTIGATION_CREATE_DETAIL.HEADER_TEMPORARY',
        },
      });
    }
  }

  /**
   * 发布调查表
   */
  @Bind()
  handlerRelease() {
    const {
      dispatch,
      investigationDetailMaintain: { detail = {} },
      history,
      allLoading,
      form: { getFieldsValue },
    } = this.props;
    const { investgHeaderId } = this.state;
    const { objectVersionNumber } = detail;
    Modal.confirm({
      title: intl
        .get(`sslm.investigationCorrelation.view.message.releaseContent`)
        .d('确定发布吗？'),
      onOk() {
        const formData = getFieldsValue();
        const payload = {
          ...detail,
          objectVersionNumber,
          investgHeaderId,
          customizeUnitCode: 'SSLM.INVESTIGATION_CREATE_DETAIL.HEADER_TEMPORARY',
          ...formData,
        };
        dispatch({
          type: 'investigationDetailMaintain/handlerRelease',
          payload,
        }).then(result => {
          if (result) {
            notification.success();
            history.push('/sslm/investigation/list');
          }
        });
      },
      confirmLoading: allLoading,
    });
  }

  /**
   * 删除调查表
   */
  @Bind()
  handlerDeleteInvestigation() {
    const that = this;
    const { dispatch, allLoading } = this.props;
    const { investgHeaderId } = this.state;
    Modal.confirm({
      title: intl.get(`sslm.investigationCorrelation.view.message.deleteContent`).d('确定删除吗？'),
      onOk() {
        dispatch({
          type: 'investigationDetailMaintain/handlerDeleteInvestigation',
          payload: {
            investigateHeaderIdList: [investgHeaderId],
          },
        }).then(result => {
          if (result) {
            notification.success();
            that.props.history.push('/sslm/investigation/list');
          }
        });
      },
      confirmLoading: allLoading,
    });
  }

  /**
   * 保存调查表
   */
  @Bind()
  handlerSaveInvestigation() {
    const {
      dispatch,
      investigationDetailMaintain: { detail = {} },
    } = this.props;
    const { objectVersionNumber } = detail;
    const { investgHeaderId } = this.state;
    const formData = this.props.form.getFieldsValue();
    const payload = {
      ...detail,
      objectVersionNumber,
      investgHeaderId,
      customizeUnitCode: 'SSLM.INVESTIGATION_CREATE_DETAIL.HEADER_TEMPORARY',
      ...formData,
    };
    dispatch({
      type: 'investigationDetailMaintain/handlerSaveInvestigation',
      payload,
    }).then(result => {
      if (result) {
        notification.success();
        this.fetchInvestigationDetail({ investgHeaderId });
      }
    });
  }

  render() {
    const {
      form,
      investigationDetailMaintain: { detail = {}, investigateTypes = [], processStatusList = [] },
      allLoading,
    } = this.props;
    const { investgHeaderId, investigateTemplateId } = this.state;
    const filterProps = {
      form,
      detail,
      investgHeaderId,
      investigateTemplateId,
      investigateTypes,
      processStatusList,
    };
    return (
      <Fragment>
        <Header
          title={intl
            .get(`sslm.investigationCorrelation.view.message.detail.title`)
            .d('调查表明细')}
          backPath="/sslm/investigation/list"
        >
          <Button icon="rocket" type="primary" onClick={this.handlerRelease} loading={allLoading}>
            {intl.get('hzero.common.button.release').d('发布')}
          </Button>
          <Button icon="save" onClick={this.handlerSaveInvestigation} loading={allLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="delete" onClick={this.handlerDeleteInvestigation} loading={allLoading}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={allLoading || false}>
            <FilterForm {...filterProps} />
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
