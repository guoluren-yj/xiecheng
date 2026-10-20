/*
 * NonErpPurchaseRequisition - 非ERP采购申请
 * @date: 2019-01-24
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Spin, Modal, Collapse, Icon, Form, Row, Col, Input } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isNumber, isEmpty } from 'lodash';
// import classnames from 'classnames';

// import UploadModal from 'components/Upload/index';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import { createPagination, getResponse } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button } from 'components/Permission';

import OperationRecord from '../../components/OperationRecord/OperationRecord';
import NonErpDeliveryInformationHeader from './NonErpDeliveryInformationHeader';
import NonHeaderInfo from './NonErpHeaderInfo';
import NonErpList from './NonErpList';
import NonErpBillingInformation from './NonErpBillingInformation';
import styles from './index.less';
import { fetchPermissions, fetchUomControl } from '@/services/purchaseRequisitionCreationService';

const { Panel } = Collapse;
const { TextArea } = Input;
const FormItem = Form.Item;

const viewMessagePrompt = 'sprm.purchaseRequisitionApproval.view.message';
const titlePrompt = 'sprm.purchaseRequisitionApproval.view.title';
const buttonPrompt = 'sprm.purchaseRequisitionApproval.view.button';
const modelPrompt = 'sprm.purchaseRequisitionApproval.model.common';

@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    // 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.LINE',
    'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.HEADER_SRM', // 非erp头
    'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.LINE_ECOMMERCE',
    'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.SRM_LINE',
    'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.DELIVERYINFO',
    'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.NOERP_PANEL',
  ],
})
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionApproval',
    'sprm.common',
    'entity.business',
    'entity.company',
    'entity.organization',
    'entity.item',
    'entity.attachment',
    'entity.roles',
    'entity.supplier',
    'sprm.purchaseReqCreation',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, purchaseRequisitionApproval }) => ({
  detailApproveLoading: loading.effects['purchaseRequisitionApproval/detailApprove'],
  detailRejectLoading: loading.effects['purchaseRequisitionApproval/detailReject'],
  queryDetailHeaderLoading: loading.effects['purchaseRequisitionApproval/queryDetailHeader'],
  queryDetailListLoading: loading.effects['purchaseRequisitionApproval/queryDetailList'],
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionApproval/fetchOperationRecordList'],
  purchaseRequisitionApproval,
}))
export default class NonErpPurchaseRequisition extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
    } = this.props;
    const prHeaderId = params.id;
    this.state = {
      prHeaderId,
      operationRecordList: [],
      operationRecordPagination: {},
      headerInfo: {}, // 头form数据源
      collapseKeys: ['headerInfo', 'purchaseLineInfo'], // 打开的折叠面板key
      listDataSource: [], // 表格数据源
      listPagination: {}, // 表格分页
      isClearListCacheDataSource: true, // 是否清除表格缓存数据源
      operationRecordModalVisible: false,
      priceList: [],
      doubleUintFlag: 0, // 双单位配置
      permissonFlag: { externalAttachmentUuid: false },
    };
  }

  componentDidMount() {
    const { prHeaderId } = this.state;
    if (isNumber(+prHeaderId)) {
      this.fetchDetailHeader();
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
    this.fetchCheckPermissions();
    this.getDoubleUnitSetting();
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

  @Bind()
  async fetchCheckPermissions() {
    const buttonPermissionList = ['hzero.srm.requirement.prm.pr-approval.ps.external-attachment'];
    await fetchPermissions(buttonPermissionList).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed && res[0]) {
        const permissonFlag = {};
        permissonFlag.externalAttachmentUuid = res[0].approve || false;
        this.setState({ permissonFlag });
      }
    });
  }

  @Throttle(500)
  @Bind()
  openPriceCompare() {
    const { prHeaderId, priceList } = this.state;
    const detailUrl = `/sprm/purchase-requisition-approval/detail-non-erp/${prHeaderId}`;
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
    const customizeUnitCode = 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.HEADER_SRM';
    dispatch({
      type: 'purchaseRequisitionApproval/queryDetailHeader',
      payload: { prHeaderId, customizeUnitCode },
    }).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        this.setState(
          {
            headerInfo: result,
          },
          () => {
            this.fetchDetailList();
          }
        );
      }
    });
  }

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchDetailList(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId, headerInfo } = this.state;
    dispatch({
      type: 'purchaseRequisitionApproval/queryDetailList',
      payload: {
        prHeaderId,
        page,
        customizeUnitCode: 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.SRM_LINE',
        hideFlag: 0,
        approvalPendingStatus: headerInfo.approvalPendingStatus,
      },
    }).then((res) => {
      if (res && res.content) {
        this.setState({
          listDataSource: [...res.content],
          // listDataSource: [...res.content.map(n => ({ ...n, _status: 'update' }))],
          listPagination: createPagination(res),
        });
      }
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

  /**
   * 查询操作记录列表
   * @param {Object} page 查询字段
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
    }).then((result) => {
      if (result) {
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
  approvalApprovalList() {
    const { dispatch } = this.props;
    const { headerInfo, listDataSource } = this.state;
    const { validateFields = (e) => e } = this.headerInfo.props.form;
    const { approvalPendingStatus } = headerInfo;
    this.setState({ approvedRemarkRequired: false }, () => {
      validateFields({ force: true }, (err, values) => {
        if (isEmpty(err)) {
          const { approvedRemark } = values;
          Modal.confirm({
            title: intl.get(`${viewMessagePrompt}.confirmApprove`).d('是否确认审批通过需求'),
            onOk: () => {
              dispatch({
                type: 'purchaseRequisitionApproval/approvalApprovalList',
                payload: {
                  approvalPendingStatus,
                  prHeaderList: [
                    {
                      ...headerInfo,
                      approvedRemark,
                      lines: listDataSource,
                    },
                  ],
                },
              }).then((res) => {
                if (res && !res.failed) {
                  notification.success();
                  dispatch(
                    routerRedux.push({
                      pathname: `/sprm/purchase-requisition-approval/list`,
                    })
                  );
                } else if (res && res.failed) {
                  notification.error({ message: res.message });
                }
              });
            },
          });
        }
      });
    });
  }

  /**
   * 订单审批拒绝
   */
  @Throttle(500)
  @Bind()
  rejectApprovalList() {
    const { dispatch } = this.props;
    const { headerInfo, listDataSource } = this.state;
    const { validateFields = (e) => e } = this.headerInfo.props.form;
    const { approvalPendingStatus } = headerInfo;
    this.setState(
      {
        approvedRemarkRequired: !(
          approvalPendingStatus === 'CANCELLEDING' || approvalPendingStatus === 'CLOSEDING'
        ),
      },
      () => {
        Modal.confirm({
          title: intl.get(`${viewMessagePrompt}.confirmReject`).d('是否确认审批拒绝需求'),
          onOk: () => {
            validateFields({ force: true }, (err, values) => {
              if (isEmpty(err)) {
                const { approvedRemark } = values;
                dispatch({
                  type: 'purchaseRequisitionApproval/rejectApprovalList',
                  payload: {
                    approvalPendingStatus,
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
              }
            });
          },
          onCancel: () => {
            this.setState({ approvedRemarkRequired: false }, () => validateFields({ force: true }));
          },
        });
      }
    );
  }

  render() {
    const {
      form,
      dispatch,
      detailRejectLoading,
      detailApproveLoading,
      queryDetailListLoading,
      queryDetailHeaderLoading,
      fetchOperationRecordListLoading,
      customizeTable,
      customizeForm,
      form: { getFieldDecorator },
      customizeCollapse,
    } = this.props;
    const {
      headerInfo,
      collapseKeys,
      listDataSource,
      listPagination,
      operationRecordList,
      approvedRemarkRequired,
      operationRecordPagination,
      operationRecordModalVisible,
      isClearListCacheDataSource,
      priceList,
      permissonFlag,
      doubleUintFlag,
    } = this.state;
    const headerInfoFormProps = {
      form,
      headerInfo,
      customizeForm,
      approvedRemarkRequired,
      loading: queryDetailHeaderLoading,
      onRef: (node) => {
        this.headerInfo = node;
      },
    };
    const { prSourcePlatform, prHeaderId, approvalPendingStatus, prStatusCode } = headerInfo;
    const operationRecordProps = {
      record: { prHeaderId, prSourcePlatform },
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      pagination: operationRecordPagination,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    const listProps = {
      dispatch,
      prSourcePlatform,
      isClearListCacheDataSource,
      onRef: (node) => {
        this.list = node;
      },
      doubleUintFlag,
      dataSource: listDataSource,
      pagination: listPagination,
      onSearch: this.fetchDetailList,
      loading: queryDetailListLoading,
      customizeTable,
    };
    const uploadProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sprm-pr',
      btnText: intl.get(`entity.attachment.view`).d('附件查看'),
      attachmentUUID: headerInfo.attachmentUuid,
      viewOnly: true,
      showFilesNumber: true,
      btnProps: {
        icon: 'paper-clip',
      },
    };
    const externalModalProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sprm-pr',
      btnText: intl.get(`sprm.common.btn.externalAttachmentUuid`).d('外部附件'),
      attachmentUUID: headerInfo.externalAttachmentUuid,
      viewOnly: true,
      showFilesNumber: true,
      btnProps: {
        icon: 'paper-clip',
      },
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
            onClick={this.approvalApprovalList}
            loading={detailApproveLoading}
            disabled={
              !(
                approvalPendingStatus === 'CANCELLEDING' ||
                approvalPendingStatus === 'CLOSEDING' ||
                prStatusCode === 'SUBMITTED'
              )
            }
          >
            {intl.get(`${buttonPrompt}.approval`).d('审批通过')}
          </Button>
          <Button
            icon="close"
            className="label-btn"
            onClick={this.rejectApprovalList}
            loading={detailRejectLoading}
            disabled={
              !(
                approvalPendingStatus === 'CANCELLEDING' ||
                approvalPendingStatus === 'CLOSEDING' ||
                prStatusCode === 'SUBMITTED'
              )
            }
          >
            {intl.get(`${buttonPrompt}.reject`).d('审批拒绝')}
          </Button>
          <UploadModal {...uploadProps} />
          {permissonFlag.externalAttachmentUuid && <UploadModal {...externalModalProps} />}
          {priceList.length > 0 && (
            <Button onClick={() => this.openPriceCompare()}>
              {intl.get(`${buttonPrompt}.priceList`).d('比价单')}
            </Button>
          )}
          <Button
            icon="clock-circle-o"
            className="label-btn"
            onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
          >
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={false}>
            <Form>
              <Row gutter={48}>
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
                code: 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.NOERP_PANEL',
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
                        {collapseKeys
                          ? collapseKeys.some((o) => o === 'headerInfo')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')
                          : intl.get(`hzero.common.button.up`).d('收起')}
                      </a>
                      <Icon
                        type={
                          collapseKeys
                            ? collapseKeys.some((o) => o === 'headerInfo')
                              ? 'up'
                              : 'down'
                            : 'up'
                        }
                      />
                    </Fragment>
                  }
                  key="headerInfo"
                >
                  <NonHeaderInfo {...headerInfoFormProps} />
                </Panel>
                {!prSourcePlatform || ['CATALOGUE', 'SRM'].includes(prSourcePlatform) ? (
                  ''
                ) : (
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>{intl.get(`${titlePrompt}.deliveryInfo`).d('收货/收单信息')}</h3>
                        <a>
                          {collapseKeys
                            ? collapseKeys.some((o) => o === 'deliveryInformationHeader')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon
                          type={
                            collapseKeys
                              ? collapseKeys.some((o) => o === 'deliveryInformationHeader')
                                ? 'up'
                                : 'down'
                              : 'down'
                          }
                        />
                      </Fragment>
                    }
                    key="deliveryInformationHeader"
                  >
                    <NonErpDeliveryInformationHeader {...headerInfoFormProps} />
                  </Panel>
                )}
                {!prSourcePlatform || ['CATALOGUE', 'SRM'].includes(prSourcePlatform) ? (
                  ''
                ) : (
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>{intl.get(`${titlePrompt}.billingInfo`).d('开票信息')}</h3>
                        <a>
                          {collapseKeys
                            ? collapseKeys.some((o) => o === 'billingInformation')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon
                          type={
                            collapseKeys
                              ? collapseKeys.some((o) => o === 'billingInformation')
                                ? 'up'
                                : 'down'
                              : 'down'
                          }
                        />
                      </Fragment>
                    }
                    key="billingInformation"
                  >
                    <NonErpBillingInformation {...headerInfoFormProps} />
                  </Panel>
                )}

                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get(`${titlePrompt}.purchaseLineInfo`).d('采购申请行信息')}</h3>
                      <a>
                        {collapseKeys
                          ? collapseKeys.some((o) => o === 'purchaseLineInfo')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')
                          : intl.get(`hzero.common.button.up`).d('收起')}
                      </a>
                      <Icon
                        type={
                          collapseKeys
                            ? collapseKeys.some((o) => o === 'purchaseLineInfo')
                              ? 'up'
                              : 'down'
                            : 'up'
                        }
                      />
                    </Fragment>
                  }
                  key="purchaseLineInfo"
                >
                  <NonErpList {...listProps} />
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
