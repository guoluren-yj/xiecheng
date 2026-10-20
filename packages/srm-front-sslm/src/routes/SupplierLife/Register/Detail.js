/**
 * Registered - 供应商生命周期配置 - 注册申请单调查表页面
 * @date: 2018-9-7
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Spin, Button } from 'hzero-ui';
import PropTypes from 'prop-types';
import querystring from 'querystring';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import Investigation from '@/routes/Investigation/Component/Investigation';
import styles from './index.less';
import OperatingRecord from '../../OperatingRecord';
/**
 * 注册申请单调查表页面
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
@connect(({ loading, investigationReceived }) => ({
  loading: loading.effects['investigationReceived/fetchReceivedInvestigationDetail'],
  investigationReceived,
}))
@formatterCollections({ code: ['sslm.investigationReceived', 'sslm.common'] })
export default class ReceivedInvestigationDetail extends Component {
  constructor(props) {
    super(props);
    const routerParam = querystring.parse(this.props.location.search.substr(1));
    this.state = {
      investgHeaderId: routerParam.investgHeaderId,
      investigateTemplateId: routerParam.investigateTemplateId,
      organizationId: routerParam.organizationId,
      historyVisible: false,
    };
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'investigationReceived/init',
    });
    this.handleSearch({ investgHeaderId: this.state.investgHeaderId });
  }

  /**
   * 查询邀约汇总列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationReceived/fetchReceivedInvestigationDetail',
      payload: { ...fields },
    });
  }

  @Bind()
  renderForm() {
    const {
      investigationReceived: { detail, investigateTypes = [], processStatusList = [] },
      loading,
    } = this.props;
    const { investigateTemplateId, investgHeaderId, organizationId } = this.state;
    const status = processStatusList.find(item => item.value === detail.processStatus);
    const type = investigateTypes.find(item => item.value === detail.investigateType);
    return (
      <div>
        <Spin spinning={loading}>
          <div className={styles['description-list']}>
            <div>
              <div>
                {intl
                  .get(`sslm.investigationReceived.view.message.investgNumber`)
                  .d('调查表编号: ')}
              </div>
              <div>{detail.investgNumber || ''}</div>
            </div>
            <div>
              <div>
                {intl.get(`sslm.investigationReceived.view.message.companyNum`).d('客户编码: ')}
              </div>
              <div>{detail.companyNum || ''}</div>
            </div>
            <div>
              <div>
                {intl.get(`sslm.investigationReceived.view.message.companyName`).d('客户名称: ')}
              </div>
              <div>{detail.shortName || ''}</div>
            </div>
            <div>
              <div>{intl.get('hzero.common.status').d('状态')}:</div>
              <div>{(status && status.meaning) || detail.processStatus || ''}</div>
            </div>
            <div>
              <div>
                {intl
                  .get(`sslm.investigationReceived.view.message.investigateTempCode`)
                  .d('模板代码: ')}
              </div>
              <div>{detail.templateCode || ''}</div>
            </div>
            <div>
              <div>
                {intl
                  .get(`sslm.investigationReceived.view.message.investigateTempName`)
                  .d('调查表模板: ')}
              </div>
              <div>{detail.templateName || ''}</div>
            </div>
            <div>
              <div>{intl.get(`sslm.investigationReceived.view.message.type`).d('调查表类型')}:</div>
              <div>{(type && type.meaning) || detail.investigateType || ''}</div>
            </div>
            <div>
              <div>{intl.get('sslm.common.view.creator.name').d('创建人')}:</div>
              <div>{detail.createUserName || ''}</div>
            </div>
            <div>
              <div>
                {intl.get(`sslm.investigationReceived.view.message.releaseDate`).d('发布时间')}:
              </div>
              <div>{dateTimeRender(detail.releaseDate) || ''}</div>
            </div>
            <div>
              <div>
                {intl.get(`sslm.investigationReceived.view.message.submitDate`).d('提交时间')}:
              </div>
              <div>{dateTimeRender(detail.submitDate) || ''}</div>
            </div>
            <div>
              <div>
                {intl
                  .get(`sslm.investigationReceived.view.message.lastUpdateDate`)
                  .d('最后审批时间')}
                :
              </div>
              <div>{dateTimeRender(detail.lastUpdateDate) || ''}</div>
            </div>
            <div>
              <div>
                {intl
                  .get(`sslm.investigationReceived.view.message.lastUpdateByName`)
                  .d('最后审批人')}
                :
              </div>
              <div>{detail.lastUpdateByName || ''}</div>
            </div>
            <div className={styles['one-line']}>
              <div>{intl.get(`sslm.investigationReceived.view.message.remark`).d('调查说明')}:</div>
              <div>{detail.remark || ''}</div>
            </div>
            <div className={styles['one-line']}>
              <div>
                {intl.get(`sslm.investigationReceived.view.message.partnerRemark`).d('反馈备注')}:
              </div>
              <div>{detail.partnerRemark || ''}</div>
            </div>
            <div>
              <div>
                {intl
                  .get(`sslm.investigationReceived.view.message.partnerCompanyNum`)
                  .d('供应商编码')}
                :
              </div>
              <div>{detail.partnerCompanyNum || ''}</div>
            </div>
            <div>
              <div>
                {intl
                  .get(`sslm.investigationReceived.view.message.partnerCompanyName`)
                  .d('供应商名称')}
                :
              </div>
              <div>{detail.partnerShortName || ''}</div>
            </div>
            <div>
              <div>
                {intl.get(`sslm.investigationReceived.view.message.partnerBuildDate`).d('注册时间')}
                :
              </div>
              <div>{dateTimeRender(detail.partnerBuildDate) || ''}</div>
            </div>
          </div>
          <Investigation
            investigateTemplateId={investigateTemplateId}
            investgHeaderId={investgHeaderId}
            organizationId={organizationId}
          />
        </Spin>
      </div>
    );
  }

  // 是否打开弹框
  @Bind()
  showOperating() {
    const { historyVisible } = this.state;
    this.setState({
      historyVisible: !historyVisible,
    });
  }

  render() {
    const { investgHeaderId, organizationId, historyVisible } = this.state;
    const historyParams = {
      historyVisible,
      investgHeaderId,
      organizationId,
      key: investgHeaderId,
      onShowOperatingRecord: this.showOperating,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sslm.investigationReceived.view.message.detailTitle`)
            .d('调查表明细查询')}
          backPath="/sslm/registered-application-form/list"
        >
          <Button type="primary" icon="clock-circle-o" onClick={this.showOperating}>
            {intl.get('sslm.investigationReceived.view.button.operationHistory').d('操作记录')}
          </Button>
        </Header>
        <Content>{this.renderForm()}</Content>
        <OperatingRecord {...historyParams} />
      </React.Fragment>
    );
  }
}
