/**
 * index -预付款申请审批明细
 * @date: 2020-03-12
 * @author zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import { Icon, Button, Collapse, Spin, Form, Row, Col, Input } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { connect } from 'dva';
import { createPagination, getEditTableData } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import Upload from 'components/Upload';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './../index.less';
import AdvanceHeader from './../Compontent/AdvanceHeader';
import Supplier from '../../components/AdvPaycomponent/Supplier';
import Agreement from '../../components/AdvPaycomponent/Agreement';
import TheOrder from '../../components/AdvPaycomponent/TheOrder';

const { Panel } = Collapse;
const { TextArea } = Input;

const common = 'sfin.advancePaymentRecord.model.common.';

@connect(({ payApprove, loading }) => ({
  payApprove,
  loading:
    loading.effects['payApprove/queryHeader'] ||
    loading.effects['payApprove/fetchAdvanceLine'] ||
    loading.effects['payApprove/approve'] ||
    loading.effects['payApprove/reject'],
}))
@Form.create({ fieldNameProp: null })
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
@withCustomize({
  unitCode: [
    'SFIN.PAY_APPROVE_DETAIL.LINE_SUPPLIER',
    'SFIN.PAY_APPROVE_DETAIL.LINE_CONTRACT',
    'SFIN.PAY_APPROVE_DETAIL.LINE_ORDER',
    'SFIN.PAY_APPROVE_DETAIL.APPROVAL_FORM',
  ],
})
export default class PayDetail extends Component {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { id },
      },
    } = this.props;
    this.state = {
      paymentHeaderId: id,
      collapseKeys: ['header', 'list'], // 打开的折叠面板key
      headerInfo: {},
      InvoiceLineSource: [],
      InvoicePagination: {},
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { id },
      },
      dispatch,
    } = this.props;
    dispatch({
      type: 'payApprove/queryHeader',
      payload: {
        paymentHeaderId: id,
        customizeUnitCode: 'SFIN.PAY_APPROVE_DETAIL.ADVANCE_HEADER',
      },
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
      payload: { paymentHeaderId: id, customizeUnitCode: 'SFIN.PAY_APPROVE_DETAIL.ADVANCE_HEADER' },
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
      type: 'payApprove/fetchAdvanceLine',
      payload: {
        paymentHeaderId,
        page,
        customizeUnitCode,
        // customizeUnitCode:
        //   'SFIN.PAY_APPROVE_DETAIL.LINE_SUPPLIER,SFIN.PAY_APPROVE_DETAIL.LINE_CONTRACT,SFIN.PAY_APPROVE_DETAIL.LINE_ORDER',
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

  @Bind()
  @Throttle(1000)
  approve(type) {
    this.props.form.validateFields((err) => {
      if (err) {
        return false;
      } else {
        const { headerInfo, InvoiceLineSource } = this.state;
        const { dispatch, form, history } = this.props;
        const lines = getEditTableData(InvoiceLineSource, ['_status'], { force: true });
        const paymentHeaderList = [];
        paymentHeaderList.push({
          ...headerInfo,
          paymentAdvanceLineList: lines,
        });
        const approvedRemark = form.getFieldValue('approvedRemark')
          ? form.getFieldValue('approvedRemark')
          : '';
        if (InvoiceLineSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
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
                  'SFIN.PAY_APPROVE_DETAIL.ADVANCE_HEADER,SFIN.PAY_APPROVE_DETAIL.LINE_CONTRACT,SFIN.PAY_APPROVE_DETAIL.LINE_ORDER,SFIN.PAY_APPROVE_DETAIL.LINE_SUPPLIER',
              },
            }).then((res) => {
              if (res) {
                notification.success();
                history.push(`/sfin/pay-approve/list`);
              }
            });
          }
        }
      }
    });
  }

  render() {
    // const { collapseKeys, headerInfo } = this.state;
    const { form, customizeTable, loading = false, customizeForm } = this.props;
    const {
      collapseKeys,
      headerInfo = {},
      InvoiceLineSource = [],
      InvoicePagination = {},
      selectedRows = [],
    } = this.state;
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
    };

    const invioceProps = {
      selectedRows,
      customizeTable,
      unitCode: 'SFIN.PAY_APPROVE_DETAIL.LINE_SUPPLIER',
      loading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
      onSearch: this.fetchAdvanceLine,
      onSelectedRowChange: this.onSelectedRowChange,
    };
    const agreementProps = {
      selectedRows,
      customizeTable,
      unitCode: 'SFIN.PAY_APPROVE_DETAIL.LINE_CONTRACT',
      loading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
      handleInput: this.handleInput,
      onSearch: this.fetchAdvanceLine,
      onSelectedRowChange: this.onSelectedRowChange,
    };
    const theorderProps = {
      selectedRows,
      unitCode: 'SFIN.PAY_APPROVE_DETAIL.LINE_ORDER',
      customizeTable,
      loading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
      handleInput: this.handleInput,
      onSearch: this.fetchAdvanceLine,
      onSelectedRowChange: this.onSelectedRowChange,
    };

    const theorderLineProps = {
      selectedRows,
      unitCode: 'SFIN.PAY_APPROVE_DETAIL.LINE_ORDER',
      customizeTable,
      loading,
      dataSource: InvoiceLineSource,
      pagination: InvoicePagination,
      handleInput: this.handleInput,
      onSearch: this.fetchAdvanceLine,
      onSelectedRowChange: this.onSelectedRowChange,
      isOrderLine: 1,
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`${common}payApproveDetail`).d('预付款申请审批明细')}
          backPath="/sfin/pay-approve/list"
        >
          <Button loading={loading} onClick={() => this.approve('approve')} type="primary">
            {intl.get(`sfin.payment.common.approved`).d('审批通过')}
          </Button>
          <Button loading={loading} onClick={() => this.approve('reject')}>
            {intl.get(`sfin.payment.common.unApproved`).d('审批拒绝')}
          </Button>
          <Upload {...uploadProps} />
        </Header>
        <Content>
          {customizeForm(
            {
              code: 'SFIN.PAY_APPROVE_DETAIL.APPROVAL_FORM',
              form: this.props.form,
              dataSource: headerInfo,
            },
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
          )}

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
                  loading={loading}
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
