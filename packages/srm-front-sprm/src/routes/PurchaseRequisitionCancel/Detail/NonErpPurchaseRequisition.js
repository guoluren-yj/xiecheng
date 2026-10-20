/*
 * NonErpPurchaseRequisition - 非ERP采购申请
 * @date: 2019-02-22
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import { Button } from 'components/Permission';
import { Spin, Modal, Collapse, Icon, Form } from 'hzero-ui';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import { Bind, Throttle } from 'lodash-decorators';
import { PRIVATE_BUCKET } from '_utils/config';
import { isNumber, isArray, isEmpty } from 'lodash';
import moment from 'moment';
// import UploadModal from 'components/Upload/index';

import UploadModal from 'srm-front-boot/lib/components/Upload';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import {
  createPagination,
  getEditTableData,
  getCurrentTenant,
  getCurrentOrganizationId,
  getResponse,
} from 'utils/utils';
import notification from 'utils/notification';
import { DETAIL_DEFAULT_CLASSNAME, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import cuxRemote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import { handleVerifyIs } from '../utils/index';
import { BudgetCheckTable } from '@/routes/components/BudgetCheckTable';
import {
  fetchPermissions,
  budgetCheck,
  fetchUomControl,
  fetchBasePrice,
} from '@/services/purchaseRequisitionCreationService';
import { fetchConfig, fetchChangeOldConfig } from '@/services/purchaseRequisitionCancelService';
import OperationRecord from '../../components/OperationRecord/OperationRecord';
import NonErpDeliveryInformationHeader from './NonErpDeliveryInformationHeader';
import NonHeaderInfo from './NonErpHeaderInfo';
import NonErpList from './NonErpList';
import NonErpBillingInformation from './NonErpBillingInformation';
import styles from './index.less';
import PromptModal from '../PromptModal';

const { Panel } = Collapse;

const commonPrompt = 'sprm.common.model.common';
const viewMessagePrompt = 'sprm.purchaseReqCancel.view.message';
const viewTitlePrompt = 'sprm.purchaseReqCancel.view.title';
const organizationId = getCurrentOrganizationId();
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.HEADER',
    'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.LINE',
    'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.LINE_OTHER',
    'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.DELIVERYINFO',
    'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.NOERP_PANEL',
    'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.CHANGE_LINE',
  ],
})
@cuxRemote(
  {
    code: 'SPRM_PURCHASE_CONTRAL_LIST_REMOTE',
    name: 'remote',
  },
  {
    process: {},
  }
)
@connect(({ loading, purchaseRequisitionCancel }) => ({
  cancelDeliveryLoading: loading.effects['purchaseRequisitionCancel/cancel'],
  queryDetailHeaderLoading: loading.effects['purchaseRequisitionCancel/queryDetailHeader'],
  queryDetailListLoading: loading.effects['purchaseRequisitionCancel/queryDetailList'],
  fetchPurchaseCloseLoading: loading.effects['purchaseRequisitionCancel/fetchPurchaseClose'],
  fetchSubmitLoading: loading.effects['purchaseRequisitionCancel/fetchPurchaseSubmit'],
  revokeLoading: loading.effects['purchaseRequisitionCancel/revokeChange'],
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionCancel/fetchOperationRecordList'],
  purchaseRequisitionCancel,
  // prChangeConfigs: purchaseRequisitionCancel.prChangeConfigs,
}))
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionApproval',
    'sprm.purchaseReqCancel',
    'sprm.purchaseRequisitionCancel',
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
export default class NonErpPurchaseRequisition extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
    } = this.props;
    const prHeaderId = params.id;
    this.state = {
      prHeaderId,
      doubleUintFlag: 0,
      headerInfo: {}, // 头form数据源
      collapseKeys: ['orderHeaderInfo', 'purchaseLineInfo'], // 打开的折叠面板key
      listDataSource: [], // 表格数据源
      listPagination: {}, // 表格分页
      isClearListCacheDataSource: true, // 是否清除表格缓存数据源
      urlflagIf: this.props.location.search.includes('flag'),
      isNew: this.props.location.pathname.includes('/sprm/purchase-platform/cancel-noerp-detail'),
      editFlag: false,
      isNewTeant: false,
      permissonFlag: { externalAttachmentUuid: false },
      isNewChangeTeant: false,
      budgetCheckLoading: false,
      basePriceFlag: true,
      itemLimitRule: [],
    };
  }

  componentDidMount() {
    const {
      prHeaderId,
      // urlflagIf
    } = this.state;
    // const { dispatch } = this.props;
    // if (urlflagIf) {
    //   dispatch({ type: 'purchaseRequisitionCancel/fetchPrChangeConfigs' });
    // }
    this.getDoubleUnitSetting();
    if (isNumber(+prHeaderId)) {
      this.fetchDetailHeader();
      this.fetchCheckPermissions();
    }

    fetchChangeOldConfig({
      organizationId,
      tenant: getCurrentTenant().tenantNum,
      tenantNum: getCurrentTenant().tenantNum,
    }).then(res => {
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
    }).then(res => {
      const result = getResponse(res);
      if (result) {
        if (isEmpty(result.content)) {
          this.setState({
            isNewTeant: true,
          });
        }
      }
    });
  }

  @Bind()
  getDoubleUnitSetting() {
    fetchUomControl().then(res => {
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
      fetchBasePrice({ companyId, prSourcePlatform: 'ERP' }).then(res => {
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
      type: 'purchaseRequisitionCancel/queryDetailHeader',
      payload: { prHeaderId, customizeUnitCode: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.HEADER' },
    }).then(res => {
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
        Object.keys(parameterMap).forEach(key => {
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
          }).then(res1 => {
            if (res1 && isArray(res1)) {
              const itemLimitRule = JSON.parse(res1[0])?.map(rule => rule);
              this.setState({ itemLimitRule });
            }
          });
        }, 50);
        this.setState(
          {
            headerInfo: res,
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
    const {
      prHeaderId,
      headerInfo: { prSourcePlatform },
      listDataSource,
    } = this.state;
    listDataSource.forEach(ele => {
      if (ele.$form) {
        ele.$form.resetFields();
      }
    });
    dispatch({
      type: 'purchaseRequisitionCancel/queryDetailList',
      payload: {
        prHeaderId,
        page,
        customizeUnitCode:
          prSourcePlatform === 'SRM'
            ? 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.CHANGE_LINE'
            : 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.LINE_OTHER',
      },
    }).then(res => {
      const lineCompanyId = res?.content?.[0]?.companyId;
      this.fetchBasePrice(lineCompanyId);
      if (res) {
        this.setState({
          listDataSource:
            prSourcePlatform === 'SRM'
              ? res.content?.map(n => ({ ...n, _status: 'update' }))
              : res.content,
          listPagination: createPagination(res),
          editFlag: false,
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
      type: 'purchaseRequisitionCancel/fetchOperationRecordList',
      payload: {
        prHeaderId,
        page,
      },
    }).then(result => {
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
  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  /**
   * cancel - 取消采购申请
   */
  @Bind()
  cancel() {
    const { dispatch } = this.props;
    const { headerInfo, isNew } = this.state;
    Modal.confirm({
      title: intl.get(`${viewMessagePrompt}.confirmCancel`).d('是否取消需求'),
      onOk: () => {
        dispatch({
          type: 'purchaseRequisitionCancel/cancel',
          payload: {
            prHeaderDTOs: [headerInfo],
          },
        }).then(res => {
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
      },
    });
  }

  /**
   * 关闭按钮
   * @memberof Close
   */
  // @Bind()
  // handleClose() {
  //   const { headerInfo } = this.state;
  //   const { prStatusCode } = headerInfo;
  //   const { dispatch, history } = this.props;
  //   const ifCanClose = ['SUSPEND', 'ASSIGNED', 'APPROVED'].includes(prStatusCode);
  //   if (ifCanClose) {
  //     handleVerifyIs({
  //       title: `${intl.get(`${viewMessagePrompt}.confirmClose`).d('是否关闭需求')}`,
  //       callback: () => {
  //         dispatch({
  //           type: 'purchaseRequisitionCancel/fetchPurchaseClose',
  //           payload: headerInfo,
  //         }).then(res => {
  //           if (res) {
  //             // this.fetchDetailHeader();
  //             // this.fetchDetailList();
  //             notification.success();
  //             history.push('/sprm/purchase-requisition-cancel/list');
  //           }
  //         });
  //       },
  //     });
  //   } else {
  //     notification.warning({
  //       message: intl
  //         .get(`${viewMessagePrompt}.confirmCloseWarning`)
  //         .d('只有已审批、已分配、暂挂状态的采购申请允许关闭'),
  //     });
  //   }
  // }

  /**
   * 提交
   */
  @Bind()
  @Throttle(500)
  async handleSubmit() {
    const { headerInfo, listDataSource, editFlag, isNew } = this.state;
    const { dispatch, form } = this.props;
    let headerDate = {};
    if (headerInfo.cancelStatusCode === 'CANCELLED') {
      notification.error({
        message: intl
          .get(`${viewMessagePrompt}.errorMessage`)
          .d('此申请已取消，请至采购申请查询界面查看申请状态。'),
      });
      return;
    }
    // if (listDataSource.length <= 0) {
    //   notification.warning({
    //     message: intl
    //       .get(`spfm.configServer.model.purchaserUpdateModal.selectNull`)
    //       .d('你没有勾选任何数据！'),
    //   });
    //   return;
    // }
    form.validateFields(async (err, values) => {
      if (!err) {
        headerDate = { ...headerInfo, ...values };
        let attrubiteFlag = 0;
        if (listDataSource[0] && listDataSource[0].$form) {
          const dataName = listDataSource[0].$form.getFieldsValue();
          const attrubiteNames = Object.keys(dataName);
          listDataSource.forEach(ele => {
            if (ele.$form) {
              attrubiteNames?.map(item => {
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
          const prLineListTem = getEditTableData(listDataSource);
          const prLineList = prLineListTem?.map(item => ({
            ...item,
            supplierList: !isArray(item.supplierList)
              ? item.newSupplierList
              : item.supplierList?.map(ele => ({
                  ...ele,
                })),
            neededDate: item.neededDate
              ? moment(item.neededDate).format(DEFAULT_DATETIME_FORMAT)
              : null,
          }));
          if (prLineListTem.length && prLineListTem.length > 0) {
            if (headerInfo.prSourcePlatform === 'SRM') {
              this.setState({
                budgetCheckLoading: true,
              });
              const checkMsg = await budgetCheck([
                {
                  ...headerDate,
                  prLineList,
                },
              ]);

              this.setState({
                budgetCheckLoading: false,
              });

              if (checkMsg && checkMsg?.length && !checkMsg.failed) {
                // 预算不足的行
                const failedList = [];

                // 需要检查提示的行
                const checkList = [];

                (checkMsg[0].prLineList || []).forEach(item => {
                  if (item?.failed === '1') {
                    failedList.push({
                      ...item,
                      displayPrNum: checkMsg[0].displayPrNum,
                    });
                  } else if (['02', '03'].includes(item.errorStatusCode)) {
                    checkList.push({
                      ...item,
                      displayPrNum: checkMsg[0].displayPrNum,
                    });
                  }
                });
                if (!isEmpty(failedList)) {
                  const prListStr = failedList
                    .map(e => `${e.displayPrNum}|${e.lineNum}`)
                    .join(', ');
                  notification.error({
                    message:
                      intl.get(`${commonPrompt}.prNum`).d('采购申请编号') +
                      prListStr +
                      failedList[0].errorMessage,
                  });
                  return;
                } else if (!isEmpty(checkList)) {
                  // 余额已超过预警线 或者  余额不足，未超过预算允差范围
                  C7nModal.open({
                    key: C7nModal.key(),
                    drawer: true,
                    style: { width: '742px' },
                    closable: true,
                    title: intl.get(`${commonPrompt}.budgetCheckTip`).d('预算校验提示'),
                    border: true,
                    children: (
                      <BudgetCheckTable
                        data={checkList}
                        tipMessage={intl
                          .get(`sprm.common.model.common.budgetCheckSubmit`)
                          .d('以下申请行已超预警线或超量占用，请确认是否继续提交？')}
                      />
                    ),
                    onOk: async () => {
                      dispatch({
                        type: 'purchaseRequisitionCancel/fetchPurchaseSubmit',
                        payload: {
                          ...headerDate,
                          prLineList,
                          customizeUnitCode:
                            'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.HEADER,SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.CHANGE_LINE',
                        },
                      }).then(res => {
                        if (res) {
                          this.setState({ selectedRows: [] });
                          notification.success();
                          this.props.history.push(
                            isNew
                              ? '/sprm/purchase-platform/list'
                              : `/sprm/purchase-requisition-cancel/list`
                          );
                        }
                      });
                    },
                    destroyOnClose: true,
                  });
                  return;
                }
              } else if (checkMsg?.failed) {
                notification.error({ message: checkMsg?.message });
                return;
              }
            }
            dispatch({
              type: 'purchaseRequisitionCancel/fetchPurchaseSubmit',
              payload: {
                ...headerDate,
                prLineList,
                customizeUnitCode:
                  'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.HEADER,SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.CHANGE_LINE',
              },
            }).then(res => {
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
            message: intl
              .get(`${viewMessagePrompt}.forbidChange`)
              .d('当前行信息无更改,不允许提交变更'),
          });
        }
      } else {
        notification.error({
          messages: intl.get('hzero.common.validation.format').d('数据格式校验不通过'),
        });
      }
    });
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
    }).then(res => {
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

  /**
   * 改变主键
   * @param {Array} selectedRows 选中数据数组
   */
  @Bind()
  handleChangeSelectRowKeys(_, selectedRows) {
    this.setState({ selectedRows });
  }

  @Bind
  handleEditFlagTrue() {
    this.setState({ editFlag: true });
  }

  /**
   * 修改行数据
   * @param {Array} listDataSource
   */
  @Bind()
  handleChangeList(listDataSource) {
    this.setState({ listDataSource });
  }

  /**
   * 取消按钮
   * @memberof Cancel
   */
  @Bind()
  handleCancel() {
    // const { selectedRows = [] } = this.state;
    const { headerInfo, isNew } = this.state;
    const { dispatch, form } = this.props;
    const { cancelledRemark } = form.getFieldsValue();
    return dispatch({
      type: 'purchaseRequisitionCancel/cancel',
      payload: { prHeaderDTOs: [{ ...headerInfo, cancelledRemark }] },
    }).then(res => {
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
      }).then(res => {
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
          .get(`${viewMessagePrompt}.confirmCloseWarning`)
          .d('只有已审批、已分配、暂挂状态的采购申请允许关闭'),
      });
    }
  }

  /**
   * 退回按钮
   * @memberof SendBack
   */
  @Bind()
  handleSendBack() {
    // const { selectedRows = [] } = this.state;
    const { headerInfo, isNew } = this.state;
    const { dispatch, form } = this.props;
    const { sendBackRemark: extendRemark } = form.getFieldsValue();
    return dispatch({
      type: 'purchaseRequisitionCancel/sendBack',
      payload: { ...headerInfo, extendRemark },
    }).then(res => {
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

  @Bind()
  promptModalHandleOk() {
    const { promptModalFlag } = this.state;
    if (promptModalFlag === 'cancelledRemark') {
      this.handleCancel();
      this.promptModalHandleCancel();
    } else if (promptModalFlag === 'closedRemark') {
      this.handleClose();
      this.promptModalHandleCancel();
    } else if (promptModalFlag === 'sendBackRemark') {
      this.handleSendBack();
      this.promptModalHandleCancel();
    }
  }

  @Bind()
  handleOpenPromptModal(promptModalFlag) {
    const { headerInfo } = this.state;
    if (headerInfo.cancelStatusCode === 'CANCELLED') {
      notification.error({
        message: intl
          .get(`${viewMessagePrompt}.errorMessage`)
          .d('此申请已取消，请至采购申请查询界面查看申请状态。'),
      });
      return;
    }
    this.setState({ promptModalFlag, promptModalVisible: true });
  }

  @Bind()
  promptModalHandleCancel() {
    const { form } = this.props;
    form.resetFields();
    this.setState({ promptModalVisible: false });
  }

  @Bind()
  async fetchCheckPermissions() {
    const buttonPermissionList = ['hzero.srm.requirement.prm.pr-cancel.ps.external-attachment'];
    await fetchPermissions(buttonPermissionList).then(res => {
      if (res && res[0]) {
        const permissonFlag = {};
        permissonFlag.externalAttachmentUuid = res[0].approve || false;
        this.setState({ permissonFlag });
      }
    });
  }

  render() {
    const {
      form,
      cancelDeliveryLoading,
      fetchOperationRecordListLoading,
      queryDetailListLoading = false,
      queryDetailHeaderLoading = false,
      fetchPurchaseCloseLoading = false,
      fetchSubmitLoading = false,
      revokeLoading = false,
      // prChangeConfigs = [],
      dispatch,
      customizeForm,
      customizeTable,
      customizeCollapse,
      match: { path = '' },
      remote,
    } = this.props;
    const {
      headerInfo,
      collapseKeys,
      listDataSource,
      listPagination,
      approvedRemarkRequired,
      operationRecordList,
      operationRecordPagination,
      operationRecordModalVisible,
      isClearListCacheDataSource,
      urlflagIf,
      selectedRows = [],
      // editFlag,
      promptModalVisible = false,
      promptModalFlag,
      isNew,
      permissonFlag = {},
      isNewTeant = false,
      isNewChangeTeant,
      budgetCheckLoading,
      doubleUintFlag,
      basePriceFlag,
      itemLimitRule,
    } = this.state;
    const {
      prSourcePlatform,
      prStatusCode,
      shopExecuteFlag,
      changedFlag,
      prHeaderId,
      prHeaderClosedFlag,
      prHeaderCancelledFlag,
    } = headerInfo;
    const sendBackVisible = prStatusCode === 'APPROVED' && prSourcePlatform === 'SRM';
    const revokeVisable = prStatusCode === 'REJECTED';
    const headerInfoFormProps = {
      form,
      headerInfo,
      approvedRemarkRequired,
      loading: queryDetailHeaderLoading,
      onRef: node => {
        this.headerInfo = node;
      },
      customizeForm,
    };
    const operationRecordProps = {
      record: { prHeaderId: headerInfo.prHeaderId, prSourcePlatform: headerInfo.prSourcePlatform },
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      pagination: operationRecordPagination,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    const listProps = {
      isNewTeant,
      prSourcePlatform,
      ref: node => {
        this.list = node;
      },
      remote,
      itemLimitRule,
      doubleUintFlag,
      customizeTable,
      loading: queryDetailListLoading,
      dataSource: listDataSource,
      pagination: listPagination,
      onSearch: this.fetchDetailList,
      isClearListCacheDataSource,
      // prChangeConfigs: prChangeConfigs.filter((item) => item.tableName === 'SPRM_PR_LINE'),
      headerInfo,
      dispatch,
      onFetchDetailHeader: this.fetchDetailHeader,
      onFetchDetailList: this.fetchDetailList,
      selectedRows,
      handleChangeSelectRowKeys: this.handleChangeSelectRowKeys,
      urlflagIf,
      isNew,
      handleEditFlagTrue: this.handleEditFlagTrue,
      onChangeListData: this.handleChangeList,
      lineCancelPermisson: permissonFlag['line-cancelPermisson'],
      basePriceFlag,
    };
    const uploadProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sprm-pr',
      btnText: intl.get(`${viewMessagePrompt}.attachmentView`).d('附件查看'),
      attachmentUUID: headerInfo.attachmentUuid,
      viewOnly: true,
      showFilesNumber: true,
      btnProps: {
        icon: 'paper-clip',
      },
    };

    const externalModalProps = {
      btnText: intl.get(`sprm.common.btn.externalAttachmentUuid`).d('外部附件'),
      btnProps: {
        icon: 'paper-clip',
      },
      showFilesNumber: true,
      attachmentUUID: headerInfo.externalAttachmentUuid,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'sprm-pr',
      viewOnly: true,
    };

    const promptModalProps = {
      visible: promptModalVisible,
      form,
      flag: promptModalFlag,
      params: { prHeaderId },
      promptTitle:
        promptModalFlag === 'cancelledRemark'
          ? intl.get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`).d('取消原因')
          : promptModalFlag === 'closedRemark'
          ? intl.get(`sprm.purchaseRequisitionCancel.view.message.closeReason`).d('关闭原因')
          : intl.get(`sprm.purchaseRequisitionCancel.view.message.sendBackReason`).d('退回原因'),
      handleOk: this.promptModalHandleOk,
      handleCancel: this.promptModalHandleCancel,
    };

    const submitBtn = (
      <Button
        disabled={queryDetailHeaderLoading || queryDetailListLoading}
        icon="check"
        type="primary"
        onClick={this.handleSubmit}
        loading={fetchSubmitLoading || budgetCheckLoading}
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
    );

    const cancelBtn = (
      <Button
        disabled={
          queryDetailHeaderLoading ||
          queryDetailListLoading ||
          !(
            headerInfo.cancelStatusCode === 'UNCANCELLED' &&
            headerInfo.closeStatusCode === 'UNCLOSED'
          ) ||
          shopExecuteFlag === 1 ||
          headerInfo.cancelStatusCode === 'CANCELLEDING' ||
          (isNewTeant && headerInfo.prHeaderCancelledFlag !== 1)
        }
        icon="check"
        type="primary"
        // onClick={this.cancel}
        onClick={() => this.handleOpenPromptModal('cancelledRemark')}
        loading={cancelDeliveryLoading}
        permissionList={[
          {
            code: `hzero.srm.requirement.prm.pr-cancel.ps.cancel`,
            type: 'button',
            meaning: '取消按钮权限',
          },
        ]}
      >
        {intl.get(`sprm.purchasePlatform.view.button.cancel`).d('取消')}
      </Button>
    );
    const closeBtn = (
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
    );

    const returnBtn = (
      <Button
        onClick={() => this.handleOpenPromptModal('sendBackRemark')}
        loading={fetchPurchaseCloseLoading}
        permissionList={[
          {
            code: `hzero.srm.requirement.prm.pr-control.ps.send-back.button`,
            type: 'button',
            meaning: '退回按钮权限',
          },
        ]}
      >
        {intl.get(`sprm.purchasePlatform.view.button.sendBack`).d('退回')}
      </Button>
    );

    const revokeBtn = isNew ? (
      <Button
        disabled={queryDetailHeaderLoading || queryDetailListLoading}
        type="primary"
        onClick={this.handleRevoke}
        loading={fetchSubmitLoading || revokeLoading}
        permissionList={[
          {
            code: `hzero.srm.requirement.prm.pr-platform.ps.control-revoke`,
            type: 'button',
            meaning: '撤销变更按钮权限',
          },
        ]}
      >
        {intl.get(`${commonPrompt}.revoke`).d('撤销变更')}
      </Button>
    ) : (
      <Button
        disabled={queryDetailHeaderLoading || queryDetailListLoading}
        type="primary"
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
    );
    return (
      <Fragment>
        <Header
          title={intl.get(`${viewMessagePrompt}.erpTitle`).d('需求明细')}
          backPath={
            !path.includes('purchase-platform')
              ? '/sprm/purchase-requisition-cancel/list'
              : '/sprm/purchase-platform/list'
          }
        >
          {revokeVisable && changedFlag === 1 && isNewChangeTeant && revokeBtn}
          {urlflagIf ? (
            (prStatusCode === 'APPROVED' || (prStatusCode === 'REJECTED' && changedFlag === 1)) &&
            submitBtn
          ) : (
            <>
              {changedFlag !== 1 && (prHeaderCancelledFlag === 1 || !isNewTeant) && cancelBtn}
              <UploadModal {...uploadProps} />
              {permissonFlag.externalAttachmentUuid && <UploadModal {...externalModalProps} />}
              <Button
                icon="clock-circle-o"
                className="label-btn"
                onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
              >
                {intl.get(`hzero.common.button.operating`).d('操作记录')}
              </Button>
            </>
          )}
          {changedFlag !== 1 &&
            isNewTeant &&
            prHeaderClosedFlag === 1 &&
            (prSourcePlatform === 'SRM' || prSourcePlatform === 'SHOP') &&
            closeBtn}
          {sendBackVisible && returnBtn}
        </Header>
        <Content>
          <Spin
            spinning={queryDetailHeaderLoading || queryDetailListLoading}
            wrapperClassName={DETAIL_DEFAULT_CLASSNAME}
          >
            {customizeCollapse(
              {
                code: 'SPRM.PURCHASE_REQUISITION_CANCEL.DETAIL.NOERP_PANEL',
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
                      <h3>{intl.get(`${viewTitlePrompt}.purchaseHeadInfo`).d('采购申请头信息')}</h3>
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
                  <NonHeaderInfo {...headerInfoFormProps} />
                </Panel>
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>{intl.get(`${viewTitlePrompt}.deliveryInfo`).d('收货/收单信息')}</h3>
                        <a>
                          {collapseKeys.includes('deliveryInformationHeader')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon
                          type={collapseKeys.includes('deliveryInformationHeader') ? 'up' : 'down'}
                        />
                      </Fragment>
                    }
                    key="deliveryInformationHeader"
                  >
                    <NonErpDeliveryInformationHeader {...headerInfoFormProps} />
                  </Panel>
                )}
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>{intl.get(`${viewTitlePrompt}.billingInfo`).d('开票信息')}</h3>
                        <a>
                          {collapseKeys.includes('billingInformation')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('billingInformation') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="billingInformation"
                  >
                    <NonErpBillingInformation {...headerInfoFormProps} />
                  </Panel>
                )}
                <Panel
                  className={styles['line-panel-wrapper']}
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get(`${viewTitlePrompt}.purchaseLineInfo`).d('采购申请行信息')}</h3>
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
                  <NonErpList {...listProps} />
                </Panel>
              </Collapse>
            )}
          </Spin>
          <OperationRecord {...operationRecordProps} />
          <PromptModal {...promptModalProps} />
        </Content>
      </Fragment>
    );
  }
}
