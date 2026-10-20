/*
 * NonErpPurchaseRequisition - ERP采购申请-需求取消
 * @date: 2019-07-16
 * @author: zuoxiangyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { connect } from 'dva';
import { Collapse, Icon, Form, Modal, Spin } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind, Throttle } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import moment from 'moment';

import { Button } from 'components/Permission';

import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { DETAIL_DEFAULT_CLASSNAME, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { isNumber, isArray, isEmpty } from 'lodash';
import {
  createPagination,
  getEditTableData,
  getCurrentTenant,
  getCurrentOrganizationId,
  getResponse,
} from 'utils/utils';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import { handleVerifyIs } from '../utils/index';
import {
  fetchDoExecute,
  fetchUomControl,
  fetchBasePrice,
} from '@/services/purchaseRequisitionCreationService';
import { fetchChangeOldConfig, fetchConfig } from '@/services/purchaseRequisitionCancelService';
import ErpHeaderInfo from './ErpHeaderInfo';
import ErpList from './ErpList';
import styles from './index.less';
import OperationRecord from '../../components/OperationRecord/OperationRecord';
import PromptModal from '../PromptModal';

const { Panel } = Collapse;

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'sprm.common.model.common';
const messagePrompt = 'sprm.purchaseRequisitionCancel.view.message';
const viewMessagePrompt = 'sprm.purchaseReqCancel.view.message';
const titlePrompt = 'sprm.purchaseReqCancel.view.title';

@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.ERP_LINE', // erphang
    'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.HEADER_ERP',
    'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.ERP_PANEL',
    'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.CHANGE_ERP_LINE',
  ],
})
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionApproval',
    'sprm.purchaseRequisitionCancel',
    'sprm.purchaseReqCancel',
    'sprm.purchaseReqCreation',
    'sprm.purchasePlatform',
    'sprm.common',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
  ],
})
@connect(({ loading = {}, purchaseRequisitionCancel }) => ({
  // cancelDeliveryLoading: loading.effects['purchaseRequisitionCancel/cancel'],
  queryDetailHeaderLoading: loading.effects['purchaseRequisitionCancel/queryErpHeader'],
  queryDetailListLoading: loading.effects['purchaseRequisitionCancel/queryErpList'],
  fetchPurchaseCloseLoading: loading.effects['purchaseRequisitionCancel/fetchPurchaseClose'],
  fetchSubmitLoading: loading.effects['purchaseRequisitionCancel/fetchSubmit'],
  revokeLoading: loading.effects['purchaseRequisitionCancel/revokeChange'],
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionCancel/fetchOperationRecordList'],
  purchaseRequisitionCancel,
  prChangeConfigs: purchaseRequisitionCancel.prChangeConfigs,
}))
export default class NonErpPurchaseRequisition extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: { params = {}, path = '' },
    } = this.props;
    const prHeaderId = params.id;
    this.state = {
      prHeaderId,
      doubleUintFlag: 0,
      headerInfo: {}, // 头form数据源
      collapseKeys: ['orderHeaderInfo', 'purchaseLineInfo'], // 打开的折叠面板key
      selectedRows: [],
      operationRecordList: [],
      operationRecordPagination: {},
      isClearListCacheDataSource: true, // 是否清除表格缓存数据源
      operationRecordModalVisible: false,
      urlflagIf: this.props.location.search.includes('flag'),
      isNew: path.includes('/sprm/purchase-platform/cancelerp-detail'),
      editFlag: false,
      isNewTeant: false,
      isNewChangeTeant: false,
      erpCancelFlag: '0',
      basePriceFlag: true,
      itemLimitRule: [],
    };
  }

  componentDidMount() {
    const { prHeaderId, urlflagIf } = this.state;
    const { dispatch } = this.props;
    if (urlflagIf) {
      dispatch({ type: 'purchaseRequisitionCancel/fetchPrChangeConfigs' });
    }
    if (isNumber(+prHeaderId)) {
      this.fetchDetailHeader();
      this.fetchDetailList();
    }

    fetchChangeOldConfig({
      organizationId,
      tenant: getCurrentTenant().tenantNum,
      tenantNum: getCurrentTenant().tenantNum,
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        if (isEmpty(result.content)) {
          this.setState({
            isNewChangeTeant: true,
          });
        }
      }
    });

    fetchConfig({
      organizationId,
      tenant: getCurrentTenant().tenantNum,
      tenantNum: getCurrentTenant().tenantNum,
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        if (isEmpty(result.content)) {
          this.setState({
            isNewTeant: true,
          });
        }
      }
    });

    fetchDoExecute([{ fullPathCode: 'SITE.SPUC.PR.CONTROL.CANCEL' }]).then((res) => {
      if (res && isArray(res)) {
        const erpCancelFlag = res[0];
        this.setState({
          erpCancelFlag,
        });
      }
    });
    this.getDoubleUnitSetting();
  }

  @Bind()
  getDoubleUnitSetting() {
    fetchUomControl().then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({
          doubleUintFlag: result.SPRM,
        });
      }
    });
  }

  @Bind()
  fetchBasePrice(companyId) {
    if (companyId) {
      fetchBasePrice({ companyId, prSourcePlatform: 'ERP' }).then((res) => {
        this.setState({ basePriceFlag: res });
      });
    }
  }

  /**
   * fetchDetailHeader - 查询头明细数据
   */
  @Bind()
  fetchDetailHeader() {
    const { dispatch } = this.props;
    const { prHeaderId } = this.state;
    dispatch({
      type: 'purchaseRequisitionCancel/queryErpHeader',
      payload: {
        customizeUnitCode: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.HEADER_ERP',
        prHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.fetchBasePrice(res?.companyId);
        const parameterMap = {
          ...res,
          companyLov: undefined,
          ouLov: undefined,
          unitLov: undefined,
          prTypeLov: undefined,
          requestedByLov: undefined,
          localCurrencyLov: undefined,
          originalCurrencyLov: undefined,
          purchaseOrgLov: undefined,
          purchaseAgentLov: undefined,
          invoiceAddressLov: undefined,
          invoiceMethodCodeLov: undefined,
          invoiceTypeCodeLov: undefined,
          invoiceTitleTypeCodeLov: undefined,
          invoiceDetailTypeCodeLov: undefined,
          prLineList: undefined,
          addLineList: undefined,
        };
        Object.keys(parameterMap).forEach((key) => {
          if (typeof parameterMap[key] === 'object') {
            parameterMap[key] = undefined;
          }
        });
        setTimeout(() => {
          dispatch({
            type: 'purchaseRequisitionCancel/fetchDoExecute',
            payload: [
              {
                fullPathCode: 'SITE.SPUC.PR.CREATION.ITEM_LIMIT',
                parameterMap,
              },
            ],
          }).then((res1) => {
            if (res1 && isArray(res1)) {
              const itemLimitRule = JSON.parse(res1[0])?.map((rule) => rule);
              this.setState({ itemLimitRule });
            }
          });
        }, 50);
        this.setState({
          headerInfo: res,
        });
      }
    });
  }

  /**
   * fetchDetailList - 查询行明细数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchDetailList(page = {}) {
    const { dispatch, tenantId } = this.props;
    const { prHeaderId } = this.state;
    dispatch({
      type: 'purchaseRequisitionCancel/queryErpList',
      payload: {
        tenantId,
        page,
        prHeaderId,
        customizeUnitCode: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.CHANGE_ERP_LINE',
      },
    }).then((res) => {
      if (res) {
        const lineCompanyId = res?.content?.[0]?.companyId;
        this.fetchBasePrice(lineCompanyId);
        this.setState({
          erpDataSource: res.content?.map((n) => ({ ...n, _status: 'update' })),
          erpPagination: createPagination(res),
          editFlag: false,
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
      type: 'purchaseRequisitionCancel/fetchOperationRecordList',
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
   * cancel - 取消采购申请
   */
  @Bind()
  cancel() {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    Modal.confirm({
      title: intl.get(`${messagePrompt}.confirmCancel`).d('是否取消需求'),
      onOk: () => {
        dispatch({
          type: 'purchaseRequisitionCancel/cancel',
          payload: {
            prHeaderDTOs: [headerInfo],
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/sprm/purchase-requisition-cancel/list`,
              })
            );
          }
        });
      },
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
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(record) {
    this.setState({
      operationRecordModalVisible: true,
      prHeaderId: record.prHeaderId,
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  // /**
  //  * 关闭按钮
  //  * @memberof Close
  //  */
  // @Bind()
  // handleClose() {
  //   const { headerInfo } = this.state;
  //   const { prStatusCode } = headerInfo;
  //   const { dispatch } = this.props;
  //   const ifCanClose = ['SUSPEND', 'ASSIGNED', 'APPROVED'].includes(prStatusCode);
  //   if (ifCanClose) {
  //     handleVerifyIs({
  //       title: `${intl.get(`${messagePrompt}.confirmClose`).d('是否关闭需求')}`,
  //       callback: () => {
  //         dispatch({
  //           type: 'purchaseRequisitionCancel/fetchPurchaseClose',
  //           payload: headerInfo,
  //         }).then(res => {
  //           if (res) {
  //             this.fetchDetailHeader();
  //             this.fetchDetailList();
  //             notification.success();
  //           }
  //         });
  //       },
  //     });
  //   } else {
  //     notification.warning({
  //       message: intl
  //         .get(`${messagePrompt}.confirmCloseWarning`)
  //         .d('只有已审批、已分配、暂挂状态的采购申请允许关闭'),
  //     });
  //   }
  // }

  @Bind()
  promptModalHandleOk() {
    const { promptModalFlag } = this.state;
    if (promptModalFlag === 'cancelledRemark') {
      this.handleCancel();
      this.promptModalHandleCancel();
    } else if (promptModalFlag === 'closedRemark') {
      this.handleClose();
      this.promptModalHandleCancel();
    }
  }

  @Bind()
  handleOpenPromptModal(promptModalFlag) {
    this.setState({ promptModalFlag, promptModalVisible: true });
  }

  @Bind()
  promptModalHandleCancel() {
    const { form } = this.props;
    form.resetFields();
    this.setState({ promptModalVisible: false });
  }

  /**
   * 提交
   */
  @Bind()
  @Throttle(500)
  handleSubmit() {
    const { headerInfo, erpDataSource, editFlag, isNew } = this.state;
    const { dispatch } = this.props;
    const headerDate = { ...headerInfo };
    if (headerInfo.cancelStatusCode === 'CANCELLED') {
      notification.error({
        message: intl
          .get(`${viewMessagePrompt}.errorMessage`)
          .d('此申请已取消，请至采购申请查询界面查看申请状态。'),
      });
      return;
    }
    // if (erpDataSource.length <= 0) {
    //   notification.warning({
    //     message: intl
    //       .get(`spfm.configServer.model.purchaserUpdateModal.selectNull`)
    //       .d('你没有勾选任何数据！'),
    //   });
    //   return;
    // }
    let attrubiteFlag = 0;
    if (erpDataSource[0] && erpDataSource[0].$form) {
      const dataName = erpDataSource[0].$form.getFieldsValue();
      const attrubiteNames = Object.keys(dataName);
      erpDataSource.forEach((ele) => {
        // if (ele.$form) {
        //   if (attrubiteFlag === 1) {
        //     return;
        //   }
        //   if (attrubiteNames.some((item) => ele.$form.isFieldTouched(item))) {
        //     attrubiteFlag = 1;
        //   }
        // }
        if (ele.$form) {
          // eslint-disable-next-line no-unused-expressions
          attrubiteNames?.map((item) => {
            if (ele.$form.isFieldTouched(item)) {
              attrubiteFlag = 1;
            } else if (!ele.$form.getFieldValue(item)) {
              ele.$form.registerField(item);
              ele.$form.setFieldsInitialValue({
                [item]: ele[item],
              });
            }
            return null;
          });
        }
      });
    }
    if (editFlag || attrubiteFlag === 1) {
      const prLineListTem = getEditTableData(erpDataSource);
      const prLineList = prLineListTem?.map((item) => ({
        ...item,
        supplierList: !isArray(item.supplierList)
          ? item.newSupplierList
          : item.supplierList?.map((ele) => ({
              ...ele,
            })),
        neededDate: item.neededDate
          ? moment(item.neededDate).format(DEFAULT_DATETIME_FORMAT)
          : null,
      }));
      if (prLineListTem.length && prLineListTem.length > 0) {
        dispatch({
          type: 'purchaseRequisitionCancel/fetchPurchaseSubmit',
          payload: {
            ...headerDate,
            prLineList,
            customizeUnitCode:
              'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.HEADER,SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.CHANGE_ERP_LINE',
          },
        }).then((res) => {
          if (res) {
            this.setState({ selectedRows: [] });
            notification.success();
            this.props.history.push(
              isNew ? '/sprm/purchase-platform/list' : `/sprm/purchase-requisition-cancel/list`
            );
          }
        });
      }
    } else {
      notification.warning({
        message: intl.get(`${viewMessagePrompt}.forbidChange`).d('当前行信息无更改,不允许提交变更'),
      });
    }
  }

  @Bind
  handleEditFlagTrue() {
    this.setState({ editFlag: true });
  }

  /**
   * 修改行数据
   * @param {Array} erpDataSource
   */
  @Bind()
  handleChangeList(erpDataSource) {
    this.setState({ erpDataSource });
  }

  /**
   * 取消按钮
   * @memberof Cancel
   */
  @Bind()
  handleCancel() {
    // const { selectedRows = [] } = this.state;
    const { headerInfo } = this.state;
    const { dispatch, form } = this.props;
    const { cancelledRemark } = form.getFieldsValue();
    return dispatch({
      type: 'purchaseRequisitionCancel/cancel',
      payload: { prHeaderDTOs: [{ ...headerInfo, cancelledRemark }] },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/sprm/purchase-requisition-cancel/list`,
          })
        );
      }
    });
  }

  /**
   * 关闭按钮
   * @memberof Close
   */
  @Bind()
  handleClose() {
    const { headerInfo } = this.state;
    const { prStatusCode } = headerInfo;
    // const { selectedRows } = this.state;
    const { dispatch, form } = this.props;
    const ifCanClose = ['SUSPEND', 'ASSIGNED', 'APPROVED'].includes(prStatusCode);
    if (ifCanClose) {
      const { closedRemark } = form.getFieldsValue();
      return dispatch({
        type: 'purchaseRequisitionCancel/fetchPurchaseClose',
        payload: { ...headerInfo, closedRemark },
      }).then((res) => {
        if (res) {
          // this.fetchDetailHeader();
          // this.fetchDetailList();
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: `/sprm/purchase-requisition-cancel/list`,
            })
          );
        }
      });
    } else {
      notification.warning({
        message: intl
          .get(`${messagePrompt}.confirmCloseWarning`)
          .d('只有已审批、已分配、暂挂状态的采购申请允许关闭'),
      });
    }
  }

  /**
   * 撤销变更
   */
  @Bind()
  @Throttle(500)
  handleRevoke() {
    const { headerInfo, isNew } = this.state;
    const { dispatch } = this.props;

    dispatch({
      type: 'purchaseRequisitionCancel/revokeChange',
      payload: {
        ...headerInfo,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: isNew
              ? '/sprm/purchase-platform/list'
              : `/sprm/purchase-requisition-cancel/list`,
          })
        );
      }
    });
  }

  render() {
    const {
      form,
      dispatch,
      queryDetailListLoading,
      queryDetailHeaderLoading,
      cancelDeliveryLoading,
      fetchPurchaseCloseLoading = false,
      revokeLoading = false,
      fetchSubmitLoading = false,
      customizeForm,
      customizeTable,
      customizeCollapse,
      prChangeConfigs = [],
    } = this.props;
    const {
      prHeaderId,
      collapseKeys,
      headerInfo,
      selectedRows,
      approvedRemarkRequired,
      erpDataSource,
      erpPagination,
      isClearListCacheDataSource,
      operationRecordModalVisible,
      operationRecordPagination,
      operationRecordList,
      fetchOperationRecordListLoading,
      promptModalVisible = false,
      promptModalFlag,
      isNew,
      isNewTeant,
      urlflagIf,
      isNewChangeTeant,
      erpCancelFlag,
      doubleUintFlag,
      basePriceFlag,
      itemLimitRule = [],
    } = this.state;
    const { prStatusCode, closeStatusCode, cancelStatusCode, changedFlag } = headerInfo;
    const headerInfoFormProps = {
      form,
      headerInfo,
      approvedRemarkRequired,
      loading: queryDetailHeaderLoading,
      onRef: (node) => {
        this.headerInfo = node;
      },
      customizeForm,
    };
    const listProps = {
      ref: (node) => {
        this.list = node;
      },
      prHeaderId,
      itemLimitRule,
      isNewTeant,
      dispatch,
      doubleUintFlag,
      loading: queryDetailListLoading,
      selectedRows,
      dataSource: erpDataSource,
      pagination: erpPagination,
      onFetchDetailHeader: this.fetchDetailHeader,
      onSearch: this.fetchDetailList,
      isClearListCacheDataSource,
      hideModal: this.openOperationRecord,
      customizeTable,
      urlflagIf,
      headerInfo,
      handleEditFlagTrue: this.handleEditFlagTrue,
      onChangeListData: this.handleChangeList,
      prChangeConfigs: prChangeConfigs.filter((item) => item.tableName === 'SPRM_PR_LINE'),
      erpCancelFlag,
      basePriceFlag,
    };

    const operationRecordProps = {
      prHeaderId,
      record: { prHeaderId, prSourcePlatform: 'ERP' },
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
    };

    const promptModalProps = {
      visible: promptModalVisible,
      form,
      flag: promptModalFlag,
      params: { prHeaderId },
      promptTitle:
        promptModalFlag === 'cancelledRemark'
          ? intl.get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`).d('取消原因')
          : intl.get(`sprm.purchaseRequisitionCancel.view.message.closeReason`).d('关闭原因'),
      handleOk: this.promptModalHandleOk,
      handleCancel: this.promptModalHandleCancel,
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`${titlePrompt}.requirementDetail`).d('需求明细')}
          backPath={
            isNew ? '/sprm/purchase-platform/list' : '/sprm/purchase-requisition-cancel/list'
          }
        >
          {urlflagIf ? (
            <Button
              disabled={queryDetailHeaderLoading || queryDetailListLoading}
              icon="check"
              type="primary"
              onClick={this.handleSubmit}
              loading={fetchSubmitLoading}
              permissionList={[
                {
                  code: `hzero.srm.requirement.prm.pr-cancel.ps.submit`,
                  type: 'button',
                  meaning: '提交按钮权限',
                },
              ]}
            >
              {intl.get(`hzero.common.button.submit`).d('提交')}
            </Button>
          ) : (
            changedFlag !== 1 && (
              <>
                <Button
                  disabled={
                    queryDetailHeaderLoading ||
                    queryDetailListLoading ||
                    closeStatusCode !== 'UNCLOSED' ||
                    cancelStatusCode !== 'UNCANCELLED' ||
                    erpCancelFlag === '0' ||
                    isNew ||
                    (isNewTeant && headerInfo.prHeaderCancelledFlag !== 1)
                  }
                  permissionList={[
                    {
                      code: `hzero.srm.requirement.prm.pr-cancel.ps.cancel`,
                      type: 'button',
                      meaning: '取消按钮权限',
                    },
                  ]}
                  icon="close"
                  // type="primary"
                  // onClick={this.cancel}
                  onClick={() => this.handleOpenPromptModal('cancelledRemark')}
                  loading={cancelDeliveryLoading}
                >
                  {intl.get(`sprm.purchasePlatform.view.button.cancel`).d('取消')}
                </Button>
                {isNewTeant && (
                  <Button
                    icon="close"
                    // onClick={this.handleClose}
                    onClick={() => this.handleOpenPromptModal('closedRemark')}
                    loading={fetchPurchaseCloseLoading}
                    disabled={
                      queryDetailHeaderLoading ||
                      queryDetailListLoading ||
                      !(
                        headerInfo.cancelStatusCode === 'UNCANCELLED' &&
                        headerInfo.closeStatusCode === 'UNCLOSED'
                      ) ||
                      headerInfo.prHeaderClosedFlag !== 1
                    }
                    permissionList={[
                      {
                        code: `hzero.srm.requirement.prm.pr-cancel.ps.close`,
                        type: 'button',
                        meaning: '关闭按钮权限',
                      },
                    ]}
                  >
                    {intl.get(`sprm.purchasePlatform.view.button.close`).d('关闭')}
                  </Button>
                )}
              </>
            )
          )}
          {prStatusCode === 'REJECTED' && isNewChangeTeant && (
            <Button
              disabled={queryDetailHeaderLoading || queryDetailListLoading}
              // type="primary"
              onClick={this.handleRevoke}
              loading={fetchSubmitLoading || revokeLoading}
              permissionList={[
                {
                  code: `hzero.srm.requirement.prm.pr-cancel.ps.revoke`,
                  type: 'button',
                  meaning: '撤销变更按钮权限',
                },
              ]}
            >
              {intl.get(`${commonPrompt}.revoke`).d('撤销变更')}
            </Button>
          )}
          {/* <Button
            icon="close"
            // onClick={this.handleClose}
            onClick={() => this.handleOpenPromptModal('closedRemark')}
            loading={fetchPurchaseCloseLoading}
            // disabled={!selectedRows.length}
            disabled={
              queryDetailHeaderLoading || queryDetailListLoading || closeStatusCode === 'CLOSED'
            }
          >
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button> */}
        </Header>
        <Content wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
          <Spin spinning={queryDetailHeaderLoading || queryDetailListLoading}>
            {customizeCollapse(
              {
                code: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.ERP_PANEL',
              },
              <Collapse
                className="form-collapse"
                defaultActiveKey={collapseKeys}
                onChange={this.onCollapseChange}
              >
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get(`${titlePrompt}.purchaseHeadInfo`).d('采购申请头信息')}</h3>
                      <a>
                        {collapseKeys.includes('orderHeaderInfo')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="orderHeaderInfo"
                >
                  <ErpHeaderInfo {...headerInfoFormProps} />
                </Panel>
                <Panel
                  className={styles['line-panel-wrapper']}
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
                  <ErpList {...listProps} />
                </Panel>
              </Collapse>
            )}
          </Spin>
        </Content>
        <OperationRecord {...operationRecordProps} />
        <PromptModal {...promptModalProps} />
      </Fragment>
    );
  }
}
