/*
 * ErpPurchaseRequisition - ERP采购申请
 * @date: 2019-01-23
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Spin, Modal, Collapse, Icon, Form, Input, Row, Col } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';
// import classnames from 'classnames';

import { Content, Header } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { createPagination, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { fetchUomControl } from '@/services/purchaseRequisitionAssignmentService';
import OperationRecord from '../../components/OperationRecord/OperationRecord';
import HeaderInfo from './ErpHeaderInfo';
import ErpList from './ErpList';
import styles from './index.less';

const messagePrompt = 'sprm.purchaseRequisitionApproval.view.message';
const buttonPrompt = 'sprm.purchaseRequisitionApproval.view.button';
const titlePrompt = 'sprm.purchaseRequisitionApproval.view.title';
const modelPrompt = 'sprm.purchaseRequisitionApproval.model.common';
const { Panel } = Collapse;
const FormItem = Form.Item;
const { TextArea } = Input;
/**
 * ErpPurchaseRequisition - Erp采购申请
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [deliveryOrder={}] - model中的数据源
 * @reactProps {!Object} [loading={}] - 送货单明细加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 送货单明细加载是否完成
 * @reactProps {!boolean} queryDetailHeaderLoading - 查询头明细
 * @reactProps {!boolean} queryDetailListLoading - 查询行明细
 * @reactProps {!boolean} fetchOperationRecordListLoading -查询操作记录
 * @reactProps {!boolean} rejectDeliveryOrderLoading - 送货单审批拒绝
 * @reactProps {!boolean} approveDeliveryOrderLoading - 送货单审批通过
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.LINE_ERP', // erphang
    'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.HEADER_ERP',
    'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.ERP_PANEL',
  ],
})
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionApproval',
    'sprm.common',
    'entity.business',
    'entity.company',
    'entity.roles',
    'entity.item',
    'entity.attachment',
    'entity.organization',
    'entity.supplier',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, purchaseRequisitionApproval }) => ({
  queryDetailHeaderLoading: loading.effects['purchaseRequisitionApproval/queryDetailHeader'],
  queryDetailListLoading: loading.effects['purchaseRequisitionApproval/queryErpList'],
  rejectDeliveryOrderLoading: loading.effects['purchaseRequisitionApproval/reject'],
  approveDeliveryOrderLoading: loading.effects['purchaseRequisitionApproval/approve'],
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionApproval/fetchOperationRecordList'],

  purchaseRequisitionApproval,
}))
export default class ErpPurchaseRequisition extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
    } = this.props;
    const prHeaderId = params.id;
    this.state = {
      prHeaderId,
      headerInfo: {},
      priceList: [],
      operationRecordList: [],
      operationRecordPagination: {},
      operationRecordModalVisible: false,
      doubleUintFlag: 0,
      collapseKeys: ['headerInfo', 'purchaseLineInfo'], // 打开的折叠面板key
    };
  }

  componentDidMount() {
    const { prHeaderId } = this.state;
    this.fetchDetailHeader();
    this.fetchDetailList();
    this.getDoubleUnitSetting();
    // 查询比价单
    this.props
      .dispatch({
        type: 'purchaseRequisitionApproval/fetchPriceList',
        payload: prHeaderId,
      })
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          this.setState({
            priceList: result,
          });
        }
      });
  }

  @Bind()
  getDoubleUnitSetting() {
    fetchUomControl().then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({
          doubleUintFlag: result?.SPRM,
        });
      }
    });
  }

  @Throttle(500)
  @Bind()
  openPriceCompare() {
    const { prHeaderId, priceList } = this.state;
    const detailUrl = `/sprm/purchase-requisition-approval/detail-erp/${prHeaderId}`;
    const router = {
      pathname: `/sprm/purchase-requisition-approval/price-list`,
      state: {
        detailUrl,
        priceList,
      },
    };
    this.props.history.push(router);
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader() {
    const { dispatch } = this.props;
    const { prHeaderId } = this.state;
    const customizeUnitCode = 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.HEADER_ERP';
    dispatch({
      type: 'purchaseRequisitionApproval/queryDetailHeader',
      payload: { prHeaderId, customizeUnitCode },
    }).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        this.setState({
          headerInfo: res,
        });
      }
    });
  }

  /**
   * fetchDetailList - 查询行明细数据
   */
  @Bind()
  fetchDetailList(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId } = this.state;
    const customizeUnitCode = 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.LINE_ERP';
    dispatch({
      type: 'purchaseRequisitionApproval/queryErpList',
      payload: {
        prHeaderId,
        page,
        customizeUnitCode,
      },
    }).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed && result.content) {
        this.setState({
          listDataSource: res.content,
          // listDataSource: [...res.content.map(n => ({ ...n, _status: 'update' }))],
          listPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId } = this.state;
    dispatch({
      type: 'purchaseRequisitionApproval/fetchOperationRecordList',
      payload: {
        prHeaderId,
        page,
      },
    }).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed && result.content) {
        this.setState({
          operationRecordList: result.content,
          operationRecordPagination: createPagination(result),
        });
      }
    });
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(record) {
    this.setState({
      operationRecordModalVisible: true,
      prHeaderId: record.prHeaderId,
    });
  }

  @Throttle(500)
  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  /**
   * 审批通过
   * @memberof Detail
   */
  @Throttle(500)
  @Bind()
  approve() {
    const { dispatch } = this.props;
    const { headerInfo, listDataSource } = this.state;
    const { validateFields = (e) => e } = this.headerInfo.props.form;
    this.setState({ approvedRemarkRequired: false }, () => {
      validateFields({ force: true }, (err, values) => {
        if (isEmpty(err)) {
          const { approvedRemark } = values;
          Modal.confirm({
            title: intl.get(`${messagePrompt}.confirmApprove`).d('是否确认审批通过需求'),
            onOk: () => {
              dispatch({
                type: 'purchaseRequisitionApproval/approval',
                payload: {
                  prHeaderList: [
                    {
                      ...headerInfo,
                      approvedRemark,
                      lines: listDataSource,
                    },
                  ],
                },
              }).then((res) => {
                const result = getResponse(res);
                if (result && !result.failed) {
                  notification.success();
                  dispatch(
                    routerRedux.push({
                      pathname: `/sprm/purchase-requisition-approval/list`,
                    })
                  );
                }
              });
            },
          });
        }
      });
    });
  }

  /**
   * 审批拒绝
   * @memberof Detail
   */
  @Throttle(500)
  @Bind()
  reject() {
    const { dispatch } = this.props;
    const { headerInfo, listDataSource } = this.state;
    const { validateFields = (e) => e } = this.headerInfo.props.form;
    this.setState({ approvedRemarkRequired: true }, () => {
      Modal.confirm({
        title: intl.get(`${messagePrompt}.confirmReject`).d('是否确认审批拒绝需求'),
        onOk: () => {
          validateFields({ force: true }, (err, values) => {
            if (isEmpty(err)) {
              const { approvedRemark } = values;
              dispatch({
                type: 'purchaseRequisitionApproval/reject',
                payload: [
                  {
                    ...headerInfo,
                    approvedRemark,
                    lines: listDataSource,
                  },
                ],
              }).then((res) => {
                const result = getResponse(res);
                if (result && !result.failed) {
                  notification.success();
                  dispatch(
                    routerRedux.push({
                      pathname: `/sprm/purchase-requisition-approval/list`,
                    })
                  );
                }
              });
            }
          });
        },
        onCancel: () => {
          this.setState({ approvedRemarkRequired: false }, () => validateFields({ force: true }));
        },
      });
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
      queryDetailHeaderLoading,
      fetchOperationRecordListLoading,
      approveDeliveryOrderLoading,
      rejectDeliveryOrderLoading,
      queryDetailListLoading,
      customizeTable,
      customizeForm,
      form: { getFieldDecorator },
      form,
      customizeCollapse,
    } = this.props;
    const {
      operationRecordList,
      operationRecordPagination,
      operationRecordModalVisible,
      headerInfo,
      collapseKeys,
      listDataSource,
      listPagination,
      approvedRemarkRequired,
      priceList,
      doubleUintFlag,
    } = this.state;
    const { prStatusCode, approvalPendingStatus, externalApprovingFlag } = headerInfo;
    const headerInfoProps = {
      headerInfo,
      customizeForm,
      approvedRemarkRequired,
      loading: queryDetailHeaderLoading,
      onRef: (node) => {
        this.headerInfo = node;
      },
      form,
    };
    const LogisticInfoProps = {
      headerInfo,
      loading: queryDetailListLoading,
      onSearchList: this.fetchDetailList,
      hideModal: this.openOperationRecord,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      dataSource: listDataSource,
      pagination: listPagination,
      doubleUintFlag,
      customizeTable,
    };
    const operationRecordProps = {
      record: headerInfo,
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    return (
      <div className={styles['order-detail']}>
        <Header
          title={intl.get(`${titlePrompt}.requireDetail`).d('需求明细')}
          backPath="/sprm/purchase-requisition-approval/list"
        >
          <Button
            icon="check"
            type="primary"
            onClick={this.approve}
            loading={approveDeliveryOrderLoading}
            disabled={
              !(
                approvalPendingStatus === 'CANCELLEDING' ||
                approvalPendingStatus === 'CLOSEDING' ||
                (prStatusCode === 'SUBMITTED' && externalApprovingFlag !== 1)
              )
            }
          >
            {intl.get(`${buttonPrompt}.approval`).d('审批通过')}
          </Button>
          <Button
            icon="close"
            onClick={this.reject}
            loading={rejectDeliveryOrderLoading}
            disabled={
              !(
                approvalPendingStatus === 'CANCELLEDING' ||
                approvalPendingStatus === 'CLOSEDING' ||
                (prStatusCode === 'SUBMITTED' && externalApprovingFlag !== 1)
              )
            }
          >
            {intl.get(`${buttonPrompt}.reject`).d('审批拒绝')}
          </Button>
          {priceList.length > 0 && (
            <Button onClick={() => this.openPriceCompare()}>
              {intl.get(`${buttonPrompt}.priceList`).d('比价单')}
            </Button>
          )}
          <Button
            icon="clock-circle-o"
            onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
          >
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={queryDetailHeaderLoading || queryDetailListLoading}>
            <Form>
              <Row>
                <Col>{intl.get(`${modelPrompt}.approvedRemark`).d('审批意见')}</Col>
              </Row>
              <Row className="approve-option">
                <Col span={12}>
                  <FormItem className={styles['ant-modal-body']}>
                    {getFieldDecorator('approvedRemark', {
                      rules: [
                        {
                          max: 160,
                          message: intl
                            .get(`hzero.common.validation.max`, {
                              max: 160,
                            })
                            .d(`长度不能超过${160}个字符`),
                        },
                        {
                          required: approvedRemarkRequired,
                          message: intl
                            .get('hzero.common.validation.notNull', {
                              name: intl.get(`${modelPrompt}.approvedRemark`).d('审批意见'),
                            })
                            .d(
                              `${intl.get(`${modelPrompt}.approvedRemark`).d('审批意见')}不能为空`
                            ),
                        },
                      ],
                    })(<TextArea rows={2} style={{ height: '56px' }} />)}
                  </FormItem>
                </Col>
              </Row>
            </Form>
            {customizeCollapse(
              {
                code: 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.ERP_PANEL',
              },
              <Collapse
                className="form-collapse"
                defaultActiveKey={['headerInfo', 'purchaseLineInfo']}
                onChange={this.onCollapseChange}
              >
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get(`${titlePrompt}.purchaseHeadInfo`).d('采购申请头信息')}</h3>
                      <a>
                        {collapseKeys.some((item) => item === 'headerInfo')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon
                        type={collapseKeys.some((item) => item === 'headerInfo') ? 'up' : 'down'}
                      />
                    </Fragment>
                  }
                  key="headerInfo"
                >
                  <HeaderInfo {...headerInfoProps} />
                </Panel>
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get(`${titlePrompt}.purchaseLineInfo`).d('采购申请行信息')}</h3>
                      <a>
                        {collapseKeys.includes('purchaseLineInfo')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('purchaseLineInfo') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="purchaseLineInfo"
                >
                  <ErpList {...LogisticInfoProps} />
                </Panel>
              </Collapse>
            )}
          </Spin>
          <OperationRecord {...operationRecordProps} />
        </Content>
      </div>
    );
  }
}
