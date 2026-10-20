/*
 * index - 需求维护明细页面
 * @date: 2019-12-5
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Spin, Collapse, Icon, Form, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';

import BaseInfo from './BaseInfo';
import AssociatedInvoiceList from './AssociatedInvoiceList';
import DeductionInformationList from './DeductionInformationList';
import PaymentMethodList from './PaymentMethodList';
import PrepaymentInformationList from './PrepaymentInformationList';

// import styles from './index.less';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const promptCode = 'sfin.paymentRecord';

/**
 * Detail - 业务组件 - 送货单创建明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [paymentRecord={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {boolean} [getHeaderAttachmentUuidLoading=false] - 获取附件uuid处理中
 * @reactProps {boolean} [deleteDetailLinesLoading=false] - 删除明细行处理中
 * @reactProps {boolean} [submitDeliveryLoading=false] - 提交送货单处理中
 * @reactProps {boolean} [deleteDeliveryLoading=false] - 删除送货单处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建行处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护行处理中
 * @reactProps {boolean} [queryDetailHeaderLoading=false] - 查询明细头处理中
 * @reactProps {boolean} [queryDetailListLoading=false] - 查询明细行处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, paymentRecord = {} }) => ({
  fetchDetailHeaderLoading: loading.effects['paymentRecord/fetchDetailHeader'],
  fetchDetectionListLoading: loading.effects['paymentRecord/fetchDetectionList'],
  fetchAssociatedInvoiceListLoading: loading.effects['paymentRecord/fetchAssociatedInvoiceList'],
  fetchDeductionInformationListLoading:
    loading.effects['paymentRecord/fetchDeductionInformationList'],
  fetchPaymentMethodListLoading: loading.effects['paymentRecord/fetchPaymentMethodList'],
  fetchPrepaymentInformationListLoading:
    loading.effects['paymentRecord/fetchPrepaymentInformationList'],
  detailHeader: paymentRecord.detailHeader || {},
  associatedInvoiceList: paymentRecord.associatedInvoiceList || {},
  prepaymentInformationList: paymentRecord.prepaymentInformationList || {},
  paymentMethodList: paymentRecord.paymentMethodList || {},
  deductionInformationList: paymentRecord.deductionInformationList || {},
}))
@formatterCollections({
  code: [
    'sqam.paymentRecord',
    'hzero.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'entity.roles',
    'entity.supplier',
    'sfin.payment',
    'sfin.payableInvoice',
    'sqam.common',
    'sfin.paymentRecord',
  ],
})
export default class Detail extends PureComponent {
  state = {
    collapseKeys: ['baseinfo'],
  };

  componentDidMount() {
    this.fetchDetailHeader();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'paymentRecord/updateState',
      payload: {
        detailHeader: {},
        detectionList: { list: [], pagination: {} },
        associatedInvoiceList: { list: [], pagination: {} },
      },
    });
  }

  /**
   * fetchDetectionList - 查询检测细项列表
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchAssociatedInvoiceList(page) {
    const { dispatch, match } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'paymentRecord/fetchAssociatedInvoiceList',
      payload: { id, page },
    });
  }

  /**
   * fetchDetectionList - 查询检测细项列表
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchDeductionInformationList(page) {
    const { dispatch, match } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'paymentRecord/fetchDeductionInformationList',
      payload: { id, page },
    });
  }

  /**
   * fetchDetectionList - 查询检测细项列表
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchPaymentMethodList(page) {
    const { dispatch, match } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'paymentRecord/fetchPaymentMethodList',
      payload: { id, page },
    });
  }

  /**
   * fetchDetectionList - 查询检测细项列表
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchPrepaymentInformationList(page) {
    const { dispatch, match } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'paymentRecord/fetchPrepaymentInformationList',
      payload: { id, page },
    });
  }

  /**
   * fetch风险评估报告详情
   */
  @Bind()
  fetchDetailHeader() {
    const { dispatch, match } = this.props;
    const { params = {} } = match;
    const { id } = params;
    dispatch({
      type: 'paymentRecord/fetchDetailHeader',
      payload: { id },
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  render() {
    const {
      form,
      fetchDetailHeaderLoading = false,
      detailHeader = {},
      associatedInvoiceList = {},
      deductionInformationList = {},
      prepaymentInformationList = {},
      paymentMethodList = {},
      fetchAssociatedInvoiceListLoading = false,
      fetchDeductionInformationListLoading = false,
      fetchPrepaymentInformationListLoading = false,
      fetchPaymentMethodListLoading = false,
    } = this.props;
    const { collapseKeys } = this.state;
    const baseInfoProps = {
      form,
      detailHeader,
    };
    const associatedInvoiceListProps = {
      fetchList: this.fetchAssociatedInvoiceList,
      content: associatedInvoiceList,
      fetchListLoading: fetchAssociatedInvoiceListLoading,
    };
    const deductionInformationListProps = {
      fetchList: this.fetchDeductionInformationList,
      content: deductionInformationList,
      fetchListLoading: fetchDeductionInformationListLoading,
    };
    const prepaymentInformationListProps = {
      fetchList: this.fetchPrepaymentInformationList,
      content: prepaymentInformationList,
      fetchListLoading: fetchPrepaymentInformationListLoading,
    };
    const paymentMethodListProps = {
      fetchList: this.fetchPaymentMethodList,
      content: paymentMethodList,
      fetchListLoading: fetchPaymentMethodListLoading,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.paymentRecord`).d('付款单明细')}
          backPath="/sfin/pay-record/list"
        />
        <Content wrapperClassName={classnames(DETAIL_DEFAULT_CLASSNAME)}>
          <Spin spinning={fetchDetailHeaderLoading}>
            <Collapse
              forceRender
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                forceRender
                showArrow={false}
                header={
                  <Fragment>
                    <h3>
                      {intl.get(`${promptCode}.view.message.title.baseinfo`).d('付款基本信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('baseinfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseinfo') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="baseinfo"
              >
                <BaseInfo {...baseInfoProps} />
              </Panel>
            </Collapse>
          </Spin>
          <Tabs animated={false}>
            <TabPane
              tab={intl.get(`${promptCode}.view.message.title.associatedInvoice`).d('关联发票')}
              key="1"
            >
              <AssociatedInvoiceList {...associatedInvoiceListProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`${promptCode}.view.message.title.deductionInformation`).d('扣款信息')}
              key="2"
            >
              <DeductionInformationList {...deductionInformationListProps} />
            </TabPane>
            <TabPane
              tab={intl
                .get(`${promptCode}.view.message.title.prepaymentInformation`)
                .d('预付款信息')}
              key="3"
            >
              <PrepaymentInformationList {...prepaymentInformationListProps} />
            </TabPane>
            <TabPane tab={intl.get(`sfin.payment.common.sourceCode`).d('付款方式')} key="4">
              <PaymentMethodList {...paymentMethodListProps} />
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
