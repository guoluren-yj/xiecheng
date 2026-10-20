import React, { Component, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import { Icon, Collapse, Spin, Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'utils/intl';
import { createPagination } from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import Upload from '_components/Upload';
import { routerRedux } from 'dva/router';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './../index.less';
import PayHeaderInfo from './../Compontent/PayHeaderInfo';
import AssociatedDoc from './../Compontent/AssociatedDoc';
import InvoiceLine from './../Compontent/InvoiceLine';

const { Panel } = Collapse;
const { TabPane } = Tabs;
@connect(({ receivedPayQuery, loading }) => ({
  receivedPayQuery,
  listLoading: loading.effects['receivedPayQuery/queryList'],
  headerLoading: loading.effects['receivedPayQuery/queryHeader'],
  invoiceLineLoading: loading.effects['receivedPayQuery/fetchInvoiceLine'],
  associatedLineLoading: loading.effects['receivedPayQuery/fetchLine'],
}))
@formatterCollections({
  code: [
    'sfin.payment',
    'sfin.advancePaymentRecord',
    'sfin.paymentRecord',
    'entity.supplier',
    'sfin.invoiceBill',
    'sfin.paymentQuery',
    'entity.attachment',
    'entity.company',
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
        params: { id },
      },
      dispatch,
    } = this.props;
    dispatch({ type: 'receivedPayQuery/queryHeader', payload: { paymentHeaderId: id } }).then(
      (headerInfo) => {
        if (headerInfo) {
          this.setState({ headerInfo });
        }
      }
    );
  }

  @Bind()
  fetchInvoiceLine(page = {}) {
    const {
      match: {
        params: { id },
      },
      dispatch,
    } = this.props;
    dispatch({
      type: 'receivedPayQuery/fetchInvoiceLine',
      payload: { paymentHeaderId: id, ...page },
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
        params: { id },
      },
      dispatch,
    } = this.props;
    dispatch({
      type: 'receivedPayQuery/fetchLine',
      payload: { paymentHeaderId: id, ...page },
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
        pathname: `/sfin/receive-pay-query/cancel-after-ver/detail`,
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
    // const {
    //   payQuery: { headerInfo = {} },
    // } = this.props;
    const uploadProps = {
      btnText: intl.get(`entity.attachment.upload`).d('附件查看'),
      btnProps: {
        icon: 'upload',
      },
      viewOnly: true,
      showFilesNumber: false,
      attachmentUUID: headerInfo.attachmentUuid ? headerInfo.attachmentUuid : '',
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sfin-acceptance',
      // afterOpenUploadModal: this.afterOpenHeaderUploadModal,
    };
    const redirectFlag = match.path === '/sfin/collection-record/receive-pay-query/detail/:id';
    return (
      <Fragment>
        <Header
          title={intl.get(`sfin.payment.common.receivedPayDetail`).d('收款申请明细')}
          backPath={redirectFlag ? '/sfin/collection-record/list' : '/sfin/receive-pay-query/list'}
        >
          <Upload {...uploadProps} />
        </Header>
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
                    <h3>
                      {intl.get(`sfin.payment.common.button.receivedPayHeader`).d('收款头信息')}
                    </h3>
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
