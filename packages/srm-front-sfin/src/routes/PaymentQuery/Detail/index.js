import React, { Component, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import { Icon, Collapse, Spin, Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'utils/intl';
import { createPagination } from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import Upload from '_components/Upload';
import { routerRedux } from 'dva/router';

import styles from './../index.less';
import PayHeaderInfo from './../Compontent/PayHeaderInfo';
import AssociatedDoc from './../Compontent/AssociatedDoc';
import InvoiceLine from './../Compontent/InvoiceLine';

const { Panel } = Collapse;
const { TabPane } = Tabs;
@connect(({ payQuery, loading }) => ({
  payQuery,
  listLoading: loading.effects['payQuery/queryList'],
  headerLoading: loading.effects['payQuery/queryHeader'],
  invoiceLineLoading: loading.effects['payQuery/fetchInvoiceLine'],
  associatedLineLoading: loading.effects['payQuery/fetchLine'],
}))
@formatterCollections({
  code: [
    'sfin.payment',
    'sfin.advancePaymentRecord',
    'sfin.paymentRecord',
    'sfin.paymentQuery',
    'entity.supplier',
    'sfin.invoiceBill',
    'entity.company',
    'entity.attachment',
  ],
})
export default class PayDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['header'], // 打开的折叠面板key
      tabKey: 'invoiceLine',
      headerInfo: {},
    };
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {string} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind()
  changeTab(key) {
    this.setState({
      tabKey: key,
    });
  }

  componentDidMount() {
    this.fetchHeader();
    this.fetchInvoiceLine();
    this.fetchLine();
  }

  @Bind()
  fetchHeader() {
    const {
      match: {
        path,
        params: { id, paymentHeaderId },
      },
      dispatch,
    } = this.props;
    // eslint-disable-next-line no-console
    console.log(path);
    const customizeUnitCode = 'SFIN.PAY_QUERY_DETAIL.GENERAL_HEADER';
    dispatch({
      type: 'payQuery/queryHeader',
      payload: { paymentHeaderId: id || paymentHeaderId, customizeUnitCode },
    }).then((headerInfo) => {
      if (headerInfo) {
        this.setState({ headerInfo });
      }
    });
  }

  @Bind()
  fetchInvoiceLine(page = {}) {
    const {
      match: {
        params: { id, paymentHeaderId },
      },
      dispatch,
    } = this.props;
    dispatch({
      type: 'payQuery/fetchInvoiceLine',
      payload: {
        paymentHeaderId: id || paymentHeaderId,
        page,
        customizeUnitCode: 'SFIN.PAY_QUERY_DETAIL.INVOICE_LINE',
      },
    }).then((invoiceLine) => {
      if (invoiceLine) {
        this.setState({
          InvoiceLineSource: invoiceLine.content,
          InvoicePagination: createPagination(invoiceLine),
        });
      }
    });
  }

  @Bind()
  fetchLine(page = {}) {
    const {
      match: {
        params: { id, paymentHeaderId },
      },
      dispatch,
    } = this.props;
    dispatch({
      type: 'payQuery/fetchLine',
      payload: {
        paymentHeaderId: id || paymentHeaderId,
        page,
        customizeUnitCode: 'SFIN.PAY_QUERY_DETAIL.ASSOIATED_LINE',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          lineSource: res.content,
          linePagination: createPagination(res),
        });
      }
    });
  }

  // 跳转
  @Bind()
  onToDetail(record) {
    const { dispatch } = this.props;
    const { paymentHeaderId, paymentLineId } = record;
    dispatch(
      routerRedux.push({
        pathname: `/sfin/pay-query/cancel-after-ver/detail`,
        search: `?paymentHeaderId=${paymentHeaderId}&paymentLineId=${paymentLineId}`,
        // search: paymentHeaderId ? querystring.stringify({ paymentHeaderId }) : null,
      })
    );
  }

  render() {
    const {
      collapseKeys,
      tabKey,
      headerInfo = {},
      InvoiceLineSource,
      InvoicePagination,
      lineSource,
      linePagination,
    } = this.state;
    const { headerLoading, invoiceLineLoading, associatedLineLoading, match = {} } = this.props;
    const showPubType = match.path !== '/pub/sfin/pay-query/detail/:id';
    // const {
    //   payQuery: { headerInfo = {} },
    // } = this.props;
    const uploadProps = {
      btnText: intl.get(`hzero.common.button.uploadView`).d('附件查看'),
      btnProps: {
        icon: 'upload',
      },
      viewOnly: true,
      showFilesNumber: false,
      attachmentUUID: headerInfo.attachmentUuid ? headerInfo.attachmentUuid : '',
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sfin-acceptance',
      showPubType,
      // afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    };
    const redirectFlag = match.path === '/sfin/pay-record/pay-query/detail/:id';
    return (
      <Fragment>
        {showPubType && (
          <Header
            title={intl.get(`sfin.payment.common.payApproveDetail`).d('付款申请明细')}
            backPath={redirectFlag ? '/sfin/pay-record/list' : '/sfin/pay-query/list'}
          >
            <Upload {...uploadProps} />
          </Header>
        )}
        <Content>
          <Spin spinning={false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
            <Collapse
              className={styles['form-collapse']}
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              <Panel
                forceRender
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>{intl.get(`sfin.payment.title.paymentHeader`).d('付款头信息')}</h3>
                    <a>
                      {collapseKeys.includes('header')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('header') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="header"
              >
                <PayHeaderInfo
                  onRef={this.handleBindRef}
                  Ref={(node) => {
                    this.HeaderRef = node;
                  }}
                  loading={headerLoading}
                  updateState={this.updateState}
                  editable={1}
                  maintainEditable={0}
                  headerInfo={headerInfo}
                />
              </Panel>
            </Collapse>
          </Spin>
          <Tabs
            defaultActiveKey={tabKey}
            activeKey={tabKey}
            onChange={this.changeTab}
            animated={false}
          >
            <TabPane
              tab={intl.get('sfin.invoiceBill.view.invoiceRow').d('发票行')}
              key="invoiceLine"
            >
              <InvoiceLine
                onToDetail={this.onToDetail}
                dataSource={InvoiceLineSource}
                pagination={InvoicePagination}
                onTableChange={this.fetchInvoiceLine}
                loading={invoiceLineLoading}
              />
            </TabPane>
            <TabPane
              tab={intl.get('sfin.payment.view.associatedDoc').d('关联单据')}
              key="associatedDoc"
            >
              <AssociatedDoc
                dataSource={lineSource}
                pagination={linePagination}
                onTableChange={this.fetchLine}
                loading={associatedLineLoading}
              />
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
