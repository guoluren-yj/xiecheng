/**
 * index -预付款申请审批明细
 * @date: 2020-03-12
 * @author zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import { Icon, Collapse, Spin, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { connect } from 'dva';
import { createPagination } from 'utils/utils';
import intl from 'utils/intl';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import Upload from 'components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './../index.less';
import AdvanceHeader from './../Compontent/AdvanceHeader';
import Supplier from '../../components/AdvPaycomponent/Supplier';
import Agreement from '../../components/AdvPaycomponent/Agreement';
import TheOrder from '../../components/AdvPaycomponent/TheOrder';

const { Panel } = Collapse;

const common = 'sfin.advancePaymentRecord.model.common.';
@connect(({ payQuery, payApprove, loading }) => ({
  payQuery,
  payApprove,
  headerLoading: loading.effects['payQuery/queryHeader'],
  fetchAdvanceLineLoading: loading.effects['payQuery/fetchAdvanceLine'],
}))
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SFIN.PAY_QUERY_DETAIL.HEADER',
    'SFIN.PAY_QUERY_DETAIL.LINE_CONTRACT',
    'SFIN.PAY_QUERY_DETAIL.LINE_ORDER',
    'SFIN.PAY_QUERY_DETAIL.LINE_SUPPLIER',
  ],
})
@formatterCollections({
  code: [
    'sfin.payment',
    'sfin.advancePaymentRecord',
    'entity.supplier',
    'entity.attachment',
    'entity.company',
    'entity.supplier',
  ],
})
export default class PayDetail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { id, paymentHeaderId },
      },
    } = this.props;
    this.state = {
      paymentHeaderId: id || paymentHeaderId,
      collapseKeys: ['header', 'list'], // 打开的折叠面板key
      headerInfo: {},
      InvoiceLineSource: [],
      InvoicePagination: {},
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { id, paymentHeaderId },
      },
      dispatch,
    } = this.props;
    const customizeUnitCode = 'SFIN.PAY_QUERY_DETAIL.HEADER';
    dispatch({
      type: 'payQuery/queryHeader',
      payload: { paymentHeaderId: id || paymentHeaderId, customizeUnitCode },
    }).then((headerInfo) => {
      if (headerInfo) {
        this.setState({ headerInfo });
        this.fetchAdvanceLine();
      }
    });
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

  // @Bind
  // fetchHeader() {
  //   const {
  //     match: {
  //       params: { id },
  //     },
  //     dispatch,
  //   } = this.props;
  //   dispatch({ type: 'payQuery/queryHeader', payload: { paymentHeaderId: id } }).then(
  //     headerInfo => {
  //       if (headerInfo) {
  //         this.setState({ headerInfo });
  //       }
  //     }
  //   );
  // }
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
    const customizeUnitCode = 'SFIN.PAY_QUERY_DETAIL.HEADER';
    dispatch({
      type: 'payQuery/queryHeader',
      payload: { paymentHeaderId: id || paymentHeaderId, customizeUnitCode },
    }).then((headerInfo) => {
      if (headerInfo) {
        this.setState({ headerInfo });
      }
    });
  }

  /**
   * 查询行信息
   */
  @Bind()
  fetchAdvanceLine(page = {}) {
    const { dispatch } = this.props;
    const { paymentHeaderId, headerInfo } = this.state;
    const { paymentSourceTypeCode } = headerInfo || {};

    const customizeUnitCode = ['CONTRACT'].includes(paymentSourceTypeCode)
      ? 'SFIN.PAY_QUERY_DETAIL.LINE_CONTRACT'
      : ['ORDER'].includes(paymentSourceTypeCode)
      ? 'SFIN.PAY_QUERY_DETAIL.LINE_ORDER'
      : ['SUPPLIER'].includes(paymentSourceTypeCode)
      ? 'SFIN.PAY_QUERY_DETAIL.LINE_SUPPLIER'
      : 'SFIN.PAY_QUERY_DETAIL.LINE_ORDER';
    dispatch({
      type: 'payQuery/fetchAdvanceLine',
      payload: {
        paymentHeaderId,
        page,
        customizeUnitCode,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          InvoiceLineSource: res.content.map((n) => ({ ...n, _status: 'update' })),
          InvoicePagination: createPagination(res),
        });
      }
    });
  }

  render() {
    // const { collapseKeys, headerInfo } = this.state;
    const {
      headerLoading = false,
      fetchAdvanceLineLoading,
      customizeTable,
      match,
      customizeForm,
    } = this.props;
    const showPubType = match.path !== '/pub/sfin/pay-query/advance/detail/:id';
    const {
      collapseKeys,
      headerInfo = {},
      InvoiceLineSource = [],
      InvoicePagination = {},
      selectedRows = [],
    } = this.state;
    // 头
    const headerProps = {
      customizeForm,
    };
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
    };

    const invioceProps = {
      selectedRows,
      customizeTable,
      unitCode: 'SFIN.PAY_QUERY_DETAIL.LINE_SUPPLIER',
      loading: fetchAdvanceLineLoading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
      onSearch: this.fetchAdvanceLine,
      onSelectedRowChange: this.onSelectedRowChange,
    };
    const agreementProps = {
      selectedRows,
      customizeTable,
      unitCode: 'SFIN.PAY_QUERY_DETAIL.LINE_CONTRACT',
      loading: fetchAdvanceLineLoading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
      handleInput: this.handleInput,
      onSearch: this.fetchAdvanceLine,
      onSelectedRowChange: this.onSelectedRowChange,
    };
    const theorderProps = {
      selectedRows,
      customizeTable,
      unitCode: 'SFIN.PAY_QUERY_DETAIL.LINE_ORDER',
      loading: fetchAdvanceLineLoading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
      handleInput: this.handleInput,
      onSearch: this.fetchAdvanceLine,
      onSelectedRowChange: this.onSelectedRowChange,
    };
    const theorderLineProps = {
      selectedRows,
      customizeTable,
      unitCode: 'SFIN.PAY_QUERY_DETAIL.LINE_ORDER',
      loading: fetchAdvanceLineLoading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
      handleInput: this.handleInput,
      onSearch: this.fetchAdvanceLine,
      onSelectedRowChange: this.onSelectedRowChange,
      isOrderLine: 1,
    };

    return (
      <Fragment>
        {showPubType && (
          <Header
            title={intl.get(`sfin.payment.common.payApproveDetail`).d('预付款申请明细')}
            backPath="/sfin/pay-query/list"
          >
            <Upload {...uploadProps} />
          </Header>
        )}
        <Content>
          {/* <Form>
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
          </Form> */}
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
                    <h3>{intl.get(`${common}advancePaymentHeader`).d('预付款头信息')}</h3>
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
                <AdvanceHeader
                  onRef={this.handleBindRef}
                  Ref={(node) => {
                    this.HeaderRef = node;
                  }}
                  updateState={this.updateState}
                  editable={1}
                  maintainEditable={0}
                  headerInfo={headerInfo}
                  loading={headerLoading}
                  {...headerProps}
                />
              </Panel>
              <Panel
                forceRender
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>{intl.get(`${common}advancePaymentList`).d('预付款行信息')}</h3>
                    <a>
                      {collapseKeys.includes('list')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('list') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="list"
              >
                {headerInfo.paymentSourceTypeCode === 'SUPPLIER' && <Supplier {...invioceProps} />}
                {headerInfo.paymentSourceTypeCode === 'CONTRACT' && (
                  <Agreement {...agreementProps} />
                )}
                {headerInfo.paymentSourceTypeCode === 'ORDER' && <TheOrder {...theorderProps} />}
                {headerInfo.paymentSourceTypeCode === 'PO_LINE' && (
                  <TheOrder {...theorderLineProps} />
                )}
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
