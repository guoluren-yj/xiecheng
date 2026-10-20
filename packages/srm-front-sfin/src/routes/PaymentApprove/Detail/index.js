import React, { Component, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import { Icon, Button, Collapse, Spin, Tabs, Form, Row, Col, Input } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

// import querystring from 'querystring';

import { createPagination } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import Upload from '_components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './../index.less';
import PayHeaderInfo from './../Compontent/PayHeaderInfo';
import AssociatedDoc from './../Compontent/AssociatedDoc';
import InvoiceLine from './../Compontent/InvoiceLine';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
@connect(({ payApprove, loading }) => ({
  payApprove,
  listLoading: loading.effects['payQuery/queryList'],
  headerLoading: loading.effects['payQuery/queryHeader'],
  invoiceLineLoading: loading.effects['payQuery/fetchInvoiceLine'],
  associatedLineLoading: loading.effects['payQuery/fetchLine'],
}))
@formatterCollections({
  code: [
    'sfin.payment',
    'sfin.advancePaymentRecord',
    'entity.supplier',
    'entity.attachment',
    'sfin.invoiceBill',
    'sfin.common',
    'sfin.common',
    'sinv.acceptanceSheetCreate',
    'sinv.acceptancee',
    'entity.company',
    '',
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

  @Bind()
  @Throttle(1000)
  approve(type) {
    const { headerInfo } = this.state;
    const { dispatch, form, history } = this.props;
    const paymentHeaderList = [];
    paymentHeaderList.push(headerInfo);
    const approvedRemark = form.getFieldValue('approvedRemark')
      ? form.getFieldValue('approvedRemark')
      : '';
    if (type === 'reject') {
      dispatch({
        type: 'payApprove/reject',
        payload: { paymentHeaderList, approvedRemark },
      }).then((res) => {
        if (res) {
          notification.success();
          history.push(`/sfin/pay-approve/list`);
        }
      });
    } else {
      dispatch({
        type: 'payApprove/approve',
        payload: {
          paymentHeaderList,
          approvedRemark,
          customizeUnitCode:
            'SFIN.PAY_APPROVE_DETAIL.ASSOIATED_LINE,SFIN.PAY_APPROVE_DETAIL.GENERAL_HEADER,SFIN.PAY_APPROVE_DETAIL.INVOICE_LINE',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          history.push(`/sfin/pay-approve/list`);
        }
      });
    }
  }

  componentDidMount() {
    this.fetchHeader();
    this.fetchInvoiceLine();
    this.fetchLine();
  }

  @Bind
  fetchHeader() {
    const {
      match: {
        params: { id },
      },
      dispatch,
    } = this.props;
    dispatch({
      type: 'payApprove/queryHeader',
      payload: { paymentHeaderId: id, customizeUnitCode: 'SFIN.PAY_APPROVE_DETAIL.GENERAL_HEADER' },
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
        params: { id },
      },
      dispatch,
    } = this.props;
    dispatch({
      type: 'payApprove/fetchInvoiceLine',
      payload: {
        paymentHeaderId: id,
        page,
        customizeUnitCode: 'SFIN.PAY_APPROVE_DETAIL.INVOICE_LINE',
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
        params: { id },
      },
      dispatch,
    } = this.props;
    dispatch({
      type: 'payApprove/fetchLine',
      payload: {
        paymentHeaderId: id,
        page,
        customizeUnitCode: 'SFIN.PAY_APPROVE_DETAIL.ASSOIATED_LINE',
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
        pathname: `/sfin/pay-approve/cancel-after-ver/detail`,
        search: `?paymentHeaderId=${paymentHeaderId}&paymentLineId=${paymentLineId}&source=maintain`,
        // search: paymentHeaderId ? querystring.stringify({ paymentHeaderId }) : null,
      })
    );
  }

  render() {
    const {
      collapseKeys,
      tabKey,
      InvoicePagination,
      linePagination,
      lineSource,
      InvoiceLineSource,
      headerInfo,
    } = this.state;
    const { form, headerLoading, invoiceLineLoading, associatedLineLoading } = this.props;
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
    return (
      <Fragment>
        <Header
          title={intl.get(`sfin.payment.common.payApproveDetail`).d('付款申请审批明细')}
          backPath="/sfin/pay-approve/list"
        >
          <Button onClick={() => this.approve('approve')} type="primary">
            {intl.get(`sfin.payment.common.approved`).d('审批通过')}
          </Button>
          <Button onClick={() => this.approve('reject')}>
            {intl.get(`sfin.payment.common.unApproved`).d('审批拒绝')}
          </Button>
          <Upload {...uploadProps} />
        </Header>
        <Content>
          <Form>
            <Row gutter={48} className={styles['half-row']}>
              <Col span={12}>
                <Form.Item
                  className={styles['remark-style']}
                  label={intl.get(`sfin.payment.approvedRemark`).d('审批意见')}
                >
                  {form.getFieldDecorator(`approvedRemark`)(
                    <TextArea rows={2} style={{ height: '56px' }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>

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
                      {intl.get(`sinv.acceptancee.title.acceptanceHeaderInfo`).d('付款头信息')}
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
                  updateState={this.updateState}
                  editable={1}
                  maintainEditable={0}
                  headerInfo={headerInfo}
                  loading={headerLoading}
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
