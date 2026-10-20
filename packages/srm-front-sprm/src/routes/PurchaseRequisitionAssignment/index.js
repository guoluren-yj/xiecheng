/**
 * index - 需求分配
 * @date: 2019-07-10
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Radio, Tooltip } from 'hzero-ui';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { isEmpty, isUndefined, isArray, isFunction } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';

import moment from 'moment';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { Header, Content } from 'components/Page';
import Icons from 'components/Icons';
import intl from 'utils/intl';
import {
  filterNullValueObject,
  createPagination,
  getCurrentOrganizationId,
  getCurrentTenant,
  getResponse,
} from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { Button as PermissionButton } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SPRM } from '_utils/config';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { dateTimeRender } from 'utils/renderer';
import {
  fetchExecutionLink,
  fetchUomControl,
} from '@/services/purchaseRequisitionAssignmentService';
import { observer } from 'mobx-react-lite';
import { getPostParams } from '@/routes/utils';
import { refundedDs } from '../components/refundedModal/refundedDs';
import RefundedModal from '../components/refundedModal';

import Search from './Search.js';
import List from './List.js';
import PromptModal from './PromptModal.js';
import LadderPrice from './../components/LadderPrice.js';
import OperationRecord from '../components/OperationRecord/OperationRecord';
import styles from './index.less';

const buttonPrompt = 'sprm.purchaseRequisitionAssign.view.button';
const titlePrompt = 'sprm.purchaseRequisitionAssign.view.title';

/**
 * 需求分配组件
 * @export
 * @class Assignment - 需求分配组件
 * @extends {Component} - React.Component
 * @reactProps {object} PurchaseRequisitionAssignment - 数据源
 * @reactProps {boolean} searchLoading - 查询请求状态
 * @returns React.element
 */
@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_ASSIGNMENT.LIST.FILTER_S',
    'SPRM.PURCHASE_REQUISITION_ASSIGNMENT.LIST.MODAL',
    'SPRM.PURCHASE_REQUISITION_ASSIGNMENT.LIST.BACK_MODAL',
  ],
})
@cuxRemote(
  {
    code: 'SPRM_REQASSIGNMENT_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      seachParam: undefined,
    },
  }
)
@connect(({ purchaseRequisitionAssignment = {}, loading = {} }) => ({
  purchaseRequisitionAssignment,
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionAssignment/fetchOperationRecordList'],
  searchLoading: loading.effects['purchaseRequisitionAssignment/searchList'],
  saveAssignmentLoading: loading.effects['purchaseRequisitionAssignment/saveAssignmentConfigure'],
  saveSuspendLoading: loading.effects['purchaseRequisitionAssignment/saveSuspendConfigure'],
  enableLoading: loading.effects['purchaseRequisitionAssignment/enable'],
  attechmentLoading: loading.effects['purchaseRequisitionAssignment/viewAttachment'],
  queryBuyerLoading: loading.effects['purchaseRequisitionAssignment/queryBuyer'],
  backUnassignLoading: loading.effects['purchaseRequisitionAssignment/backUnassign'],
}))
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionAssign',
    'sprm.purchaseRequisitionApproval',
    'sprm.common',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.attachment',
    'entity.roles',
    'entity.item',
    'sprm.purchaseRequisitionCancel',
    'sprm.purchaseReqCreation',
    'sodr.common',
    'ssrc.priceLibrary',
    'hzero.common',
  ],
})
export default class Assignment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prLineStatusCode: 'APPROVED',
      waitAssignRequestFlag: 1,
      selectedRowKeys: [],
      selectedRows: [],
      visible: false,
      modalKey: '',
      title: '',
      operationRecordList: [],
      operationRecordPagination: {},
      operationRecordModalVisible: false,
      displayLineNum: undefined,
      tenantId: getCurrentOrganizationId(),
      referPriceVisible: false,
      priceRecordId: null,
      allTransferFlag: null, // 是否转单
      setting: '0', // 自动分配的未开启执行策略
      isOldUser: false,
      doubleUintFlag: 0,
    };
  }

  /**
   * react 生命周期
   * @memberof Assignment
   */
  componentDidMount() {
    const { pagination, dispatch, custLoading } = this.props;
    dispatch({ type: 'purchaseRequisitionAssignment/init' });
    if (!custLoading) {
      this.handleSearch(pagination);
    }
    this.fetchSettings();
    this.getExecutionLink();
    this.getDoubleUnitSetting();
  }

  componentDidUpdate(prevProps) {
    const { custLoading, pagination } = this.props;
    const custLoadingChange = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingChange) {
      this.handleSearch(pagination);
    }
  }

  /**
   * fetchDetailHeader - 查询配置中心
   */
  @Bind()
  fetchSettings() {
    const { dispatch } = this.props;
    // dispatch({
    //   type: 'purchaseRequisitionAssignment/fetchSettings',
    // }).then((res) => {
    //   if (res) {
    //     this.setState({
    //       setting: res['010915'], // 自动分配的未开启执行策略
    //     });
    //   }
    // });
    dispatch({
      type: 'purchaseRequisitionAssignment/fetchDoExecute',
      payload: [{ fullPathCode: 'SITE.SPUC.PR.EXECUTION_STRATEGY' }],
    }).then((res) => {
      if (res && isArray(res)) {
        this.setState({
          setting: res[0], // 自动分配的未开启执行策略
        });
      }
    });
  }

  @Bind()
  getExecutionLink() {
    fetchExecutionLink({ tenantNum: getCurrentTenant().tenantNum }).then((res) => {
      const result = getResponse(res);
      if (result && !isEmpty(result.content)) {
        this.setState({
          isOldUser: true,
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
          doubleUintFlag: result.SPRM,
        });
      }
    });
  }

  /**
   * 查询条件按钮改变事件
   * @param {String} status
   */
  @Bind()
  statusBtnSearch(status) {
    let stateParam = {};
    switch (status) {
      case 'APPROVED':
        stateParam = {
          prLineStatusCode: status,
        };
        break;
      case 'ASSIGNED':
        stateParam = {
          prLineStatusCode: status,
        };
        break;
      case 'SUSPEND':
        stateParam = {
          prLineStatusCode: status,
        };
        break;
      case 'ALL':
        stateParam = {
          prLineStatusCode: '',
        };
        break;
      default:
        stateParam = {};
    }
    // eslint-disable-next-line no-unused-expressions
    this.searchForm && this.searchForm.resetFields();
    this.setState(stateParam, () => this.handleSearch());
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   */
  @Bind()
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeStartArray = ['neededDateStart', 'requestDateStart'];
    const timeEndArray = ['neededDateEnd', 'requestDateEnd'];
    const timeArray = [
      'createdDateStart',
      'createdDateEnd',
      'assignedDateStart',
      'assignedDateEnd',
    ];
    timeStartArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    timeEndArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
    });
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item]
        ? moment(filterValues[item]).format(DEFAULT_DATETIME_FORMAT)
        : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * 查询表格数据
   * @params {object} statusFile - 状态查询字段
   */
  @Bind()
  handleSearch(page = {}, _, sorter = {}) {
    const { dispatch } = this.props;
    const { seachParam } = this.props?.remote?.props?.process || {};
    const { prLineStatusCode, waitAssignRequestFlag } = this.state;
    const filterValues = isUndefined(this.searchForm)
      ? {}
      : filterNullValueObject(this.searchForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    const erpControlFlag = 1;
    const data = prLineStatusCode === 'APPROVED' ? { waitAssignRequestFlag } : {};
    let sort = {};
    const { field, order } = sorter;
    switch (true) {
      case field === 'requestedBy':
        sort = { order, field: 'requestedBy' };
        break;
      case ['companyName', 'ouName', 'purchaseOrgName', 'purchaseAgentName'].includes(field):
        sort = { order, field: field.replace('Name', 'Id') };
        break;
      default:
        sort = sorter;
        break;
    }
    dispatch({
      type: 'purchaseRequisitionAssignment/searchList',
      payload: {
        page,
        prLineStatusCode,
        ...data,
        erpControlFlag,
        ...handleFormValues,
        executedByName: null,
        purchaseAgentNames: undefined,
        sort,
        seachParam,
        customizeUnitCode:
          'SPRM.PURCHASE_REQUISITION_ASSIGNMENT.LIST.FILTER_S,SPRM.PURCHASE_REQUISITION_ASSIGNMENT.LIST.GRID',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
      }
    });
  }

  /**
   *分配
   *
   * @memberof Assignment
   */
  @Bind()
  @Throttle(500)
  async handleAssign() {
    const { selectedRows, setting } = this.state;
    // 二开分配按钮弹窗的跳转逻辑，存在报错信息
    const { getCuxAssignBtn } = this.props?.remote?.props?.process || {};
    const cuxAssignErrorMsg = isFunction(getCuxAssignBtn)
      ? await getCuxAssignBtn(selectedRows)
      : null;
    const allSameFlag =
      selectedRows.every((ele) => ele.transferFlag === undefined) ||
      selectedRows.every((ele) => ele.transferFlag === 0) ||
      selectedRows.every((ele) => ele.transferFlag === 1);
    if (cuxAssignErrorMsg) {
      notification.error({ message: cuxAssignErrorMsg });
      return;
    }
    if (!allSameFlag && setting === '1') {
      notification.warning({
        message: intl
          .get(`sprm.common.model.common.reMaintainSelect`)
          .d('存在已转单和未转单的申请行，请重新勾选！'),
      });
    } else {
      this.setState({
        visible: true,
        modalKey: 'assign',
        title: intl.get(`${titlePrompt}.applyAssign`).d('需求分配'),
        allTransferFlag: selectedRows.every((ele) => ele.transferFlag === 1), // 已转单为1,未转单为0
      });
    }
  }

  /**
   * 暂挂
   * @memberof Assignment
   */
  @Bind()
  @Throttle(500)
  handleSuspend() {
    this.setState({
      visible: true,
      modalKey: 'suspend',
      title: intl.get(`${titlePrompt}.applySuspend`).d('需求暂挂'),
    });
  }

  /**
   * 启用
   * @memberof Assignment
   */
  @Bind()
  @Throttle(500)
  handleEnable() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseRequisitionAssignment/enable',
      payload: { selectedRows },
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
        this.handleSearch();
        notification.success();
      }
    });
  }

  /**
   * 选择行变化
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 关闭 modal
   * @memberof Assignment
   */
  @Bind()
  handleCloseModal() {
    this.setState({
      visible: false,
    });
  }

  /**
   * @params {object} values - modal 获取的值
   * @memberof Assignment
   */
  @Bind()
  handleOk(values = {}) {
    const { modalKey, selectedRows } = this.state;
    const prLineVOS = selectedRows?.map((item) => {
      return {
        ...item,
        executionStrategyCode: values.executionStrategyCode,
        // executionStrategyMeaning: values.executionStrategyMeaning,
      };
    });
    const { dispatch } = this.props;
    if (!isEmpty(values)) {
      if (modalKey === 'assign') {
        dispatch({
          type: 'purchaseRequisitionAssignment/saveAssignmentConfigure',
          payload: {
            prLineVOS,
            values,
          },
        })
          .then((res) => {
            if (res) {
              this.handleCloseModal();
              this.handleSearch();
              this.modalForm.props.form.resetFields();
              this.setState({
                selectedRows: [],
              });
              notification.success();
            }
          })
          .finally(() => {
            this.modalForm.handleOkBtnLoading();
          });
      } else if (modalKey === 'suspend') {
        dispatch({
          type: 'purchaseRequisitionAssignment/saveSuspendConfigure',
          payload: {
            prLineVOS: selectedRows,
            values,
          },
        })
          .then((res) => {
            if (res) {
              this.handleCloseModal();
              this.handleSearch();
              this.modalForm.props.form.resetFields();
              this.setState({
                selectedRows: [],
              });
              notification.success();
            }
          })
          .finally(() => {
            this.modalForm.handleOkBtnLoading();
          });
      }
    }
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId, displayLineNum } = this.state;
    dispatch({
      type: 'purchaseRequisitionAssignment/fetchOperationRecordList',
      payload: {
        page,
        prHeaderId,
        displayLineNum,
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

  @Bind()
  @Throttle(500)
  handleReturnToAssign() {
    const { backUnassignLoading = false, dispatch } = this.props;
    const refunded = new DataSet(refundedDs());
    Modal.open({
      key: Modal.key(),
      title: intl.get('sprm.common.modal.refunded.reason').d('退回原因'),
      closable: true,
      movable: false,
      destroyOnClose: true,
      confirmLoading: backUnassignLoading,
      children: (
        <RefundedModal
          ds={refunded}
          code="SPRM.PURCHASE_REQUISITION_ASSIGNMENT.LIST.BACK_MODAL"
          refundedLabel={intl.get('sprm.common.modal.refunded.reason').d('退回原因')}
        />
      ),
      onOk: async () => {
        const validateFlag = await refunded.validate();
        const { ...backToUnassignReasonInfo } = refunded.toData()[0];
        if (validateFlag) {
          const { selectedRows } = this.state;
          dispatch({
            type: 'purchaseRequisitionAssignment/backUnassign',
            payload: {
              prLineVOS: selectedRows,
              ...backToUnassignReasonInfo,
            },
          }).then((res) => {
            const result = getResponse(res);
            if (result) {
              this.handleSearch();
              this.setState({
                selectedRows: [],
              });
              notification.success();
            }
          });
        } else {
          return false;
        }
      },
      onCancel: () => {},
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
      displayLineNum: record.displayLineNum,
      record,
    });
  }

  /**
   * handleModalVisible - 关闭操作记录弹框
   */
  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  @Bind()
  handleReferPrice(date) {
    this.setState({ priceRecordId: date.prLineId, referPriceVisible: true });
  }

  render() {
    const {
      tenantId,
      selectedRows,
      selectedRowKeys,
      visible,
      modalKey,
      title,
      operationRecordList,
      operationRecordPagination,
      operationRecordModalVisible,
      prLineStatusCode,
      referPriceVisible,
      priceRecordId,
      allTransferFlag,
      setting,
      record,
      isOldUser,
      doubleUintFlag,
    } = this.state;
    const {
      dispatch,
      searchLoading,
      saveAssignmentLoading,
      queryBuyerLoading,
      saveSuspendLoading,
      fetchOperationRecordListLoading,
      enableLoading,
      purchaseRequisitionAssignment,
      customizeTable,
      customizeFilterForm,
      customizeForm,
      backUnassignLoading,
    } = this.props;
    const {
      prSourcePlatformList,
      projectCategoryList,
      erpEditStatusList,
      executionStrategyList,
      abcTypeList,
      executionStatusList,
      queryParams = {},
      pagination = {},
      dataSource = [],
      enumMap = [],
      yesAndNoList = [],
      secondLevelStrategyCode = [],
    } = purchaseRequisitionAssignment;
    const { getCuxAssignDefaultValue } = this.props?.remote?.props?.process || {};
    // debugger;
    const { page: _, ...oQ } = queryParams; // TODO 清除导出的page
    const searchProps = {
      dispatch,
      enumMap,
      abcTypeList,
      yesAndNoList,
      prSourcePlatformList,
      projectCategoryList,
      executionStatusList,
      executionStrategyList,
      pagination,
      isOldUser,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.searchForm = node.props.form;
      },
      prLineStatusCode,
      customizeFilterForm,
    };
    const listProps = {
      dataSource,
      pagination,
      erpEditStatusList,
      onShow: this.openOperationRecord,
      rowSelection: {
        selectedRowKeys,
        onChange: this.onSelectChange,
      },
      doubleUintFlag,
      prLineStatusCode,
      loading: searchLoading,
      onChange: this.handleSearch,
      onPriceSet: this.handleReferPrice,
      customizeTable,
    };
    const operationRecordProps = {
      record,
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
      columnsCover: [
        {
          title: intl.get('entity.roles.operator').d('操作人'),
          dataIndex: 'processUserName',
          width: 100,
        },
        {
          title: intl.get(`sprm.purchaseRequisitionApproval.model.common.handleDate`).d('操作时间'),
          width: 140,
          dataIndex: 'processedDate',
          render: dateTimeRender,
        },
        {
          title: intl.get(`sprm.purchaseRequisitionApproval.model.common.motion`).d('动作'),
          width: 100,
          dataIndex: 'processTypeCodeMeaning',
        },
        {
          title: intl
            .get(`sprm.purchaseRequisitionApproval.model.common.handleRemark`)
            .d('操作说明'),
          width: 100,
          dataIndex: 'processRemark',
          render: (text, currentRecord) => {
            const { processTypeCode, multiExecutorName } = currentRecord;
            const assignRemark =
              processTypeCode === 'ASSIGNED' && text
                ? intl.get('sprm.common.model.assignText', { text }).d(`,分配说明：${text}`)
                : '';
            const textRender =
              processTypeCode !== 'ASSIGNED'
                ? text
                : multiExecutorName
                ? intl
                    .get('sprm.purchaseRequisitionApproval.model.assignRemark', {
                      multiExecutorName,
                      text: assignRemark,
                    })
                    .d(`申请行已分配给${multiExecutorName}${assignRemark}`)
                : intl.get('sprm.purchaseRequisitionApproval.model.assigned').d('申请行已分配');
            return (
              <Tooltip title={textRender} placement="left">
                {textRender}
              </Tooltip>
            );
          },
        },
        {
          title: intl
            .get(`sprm.purchaseRequisitionApproval.model.common.changeField`)
            .d('修改内容'),
          width: 100,
          dataIndex: 'changeField',
        },
        {
          title: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
          width: 80,
          dataIndex: 'displayLineNum',
        },
        {
          title: intl.get(`sprm.purchaseRequisitionApproval.model.common.beforeModify`).d('修改前'),
          dataIndex: 'oldValue',
          onCell: this.onCell,
          width: 250,
        },
        {
          title: intl.get(`sprm.purchaseRequisitionApproval.model.common.afterModify`).d('修改后'),
          dataIndex: 'newValue',
          onCell: this.onCell,
          width: 250,
        },
        {
          title: intl.get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`).d('取消原因'),
          dataIndex: 'cancelledRemark',
          width: 250,
        },
        {
          title: intl.get(`sprm.purchaseRequisitionCancel.view.message.closeReason`).d('关闭原因'),
          dataIndex: 'closeReason',
          width: 250,
        },
      ],
    };
    const modalProps = {
      title,
      visible,
      modalKey,
      tenantId,
      dispatch,
      selectedRows,
      queryBuyerLoading,
      saveAssignmentLoading,
      saveSuspendLoading,
      executionStrategyList,
      onClose: this.handleCloseModal,
      onModalOk: this.handleOk,
      onRef: (node) => {
        this.modalForm = node;
      },
      getCuxAssignDefaultValue,
      setting,
      customizeForm,
      allTransferFlag,
      secondLevelStrategyCode,
      isOldUser,
    };
    const referPriceProps = {
      priceRecordId,
      visible: referPriceVisible,
      hideModal: () => this.handleModalVisible('referPriceVisible', false),
    };
    // const checkExportBtnProps = {
    //   icon: 'export',
    //   disabled: isArray(selectedRowKeys) && isEmpty(selectedRowKeys),
    // };

    const ExportBtn = observer(({ currentTab }) => {
      let exportCode = '';
      let newExportCode = '';
      switch (currentTab) {
        case 'APPROVED': // 待分配
          exportCode = 'hzero.srm.requirement.prm.pr-assign.ps.will-assign.list.export';
          newExportCode = 'hzero.srm.requirement.prm.pr-assign.ps.new.will-assign.list.export';
          break;
        case 'ASSIGNED': // 已分配
          exportCode = 'hzero.srm.requirement.prm.pr-assign.ps.assigned.list.export';
          newExportCode = 'hzero.srm.requirement.prm.pr-assign.ps.new.assigned.list.export';
          break;
        case 'SUSPEND': // 暂挂
          exportCode = 'hzero.srm.requirement.prm.pr-assign.ps.suspend.list.export';
          newExportCode = 'hzero.srm.requirement.prm.pr-assign.ps.new.suspend.list.export';
          break;
        default:
          // 全部
          exportCode = 'hzero.srm.requirement.prm.pr-assign.ps.all.list.export';
          newExportCode = 'hzero.srm.requirement.prm.pr-assign.ps.new.all.list.export';
          break;
      }
      return (
        <>
          <ExcelExportPro
            templateCode="SPUC_SPRM_ASSIGN_LINE_EXPORT"
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: newExportCode,
                  type: 'button',
                },
              ],
            }}
            buttonText={
              isArray(selectedRowKeys) && isEmpty(selectedRowKeys)
                ? intl.get('hzero.common.export.new').d('导出-新')
                : intl.get(`${buttonPrompt}.checkedExport.new`).d('勾选导出-新')
            }
            requestUrl={`${SRM_SPRM}/v1/${tenantId}/purchase-request/line/can-assign/export-modeler`}
            method="POST"
            allBody
            queryParams={
              isArray(selectedRowKeys) && isEmpty(selectedRowKeys)
                ? getPostParams({ ...oQ, prLineStatusCode }, 'line', true)
                : { prLineIds: selectedRowKeys }
            }
          />
          <ExcelExport
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: exportCode,
                  type: 'button',
                },
              ],
            }}
            buttonText={
              isArray(selectedRowKeys) && isEmpty(selectedRowKeys)
                ? intl.get('hzero.common.button.export').d('导出')
                : intl.get(`${buttonPrompt}.checkedExport`).d('勾选导出')
            }
            requestUrl={`${SRM_SPRM}/v1/${tenantId}/purchase-request/line/can-assign/export`}
            queryParams={
              isArray(selectedRowKeys) && isEmpty(selectedRowKeys)
                ? { ...oQ, prLineStatusCode }
                : { prLineIds, ...oQ, prLineStatusCode }
            }
          />
        </>
      );
    });

    const prLineIds = selectedRowKeys.join(',');
    return (
      <React.Fragment>
        <Header title={intl.get(`${titlePrompt}.applyAssign`).d('需求分配')}>
          <PermissionButton
            type="primary"
            className="action-btns"
            loading={saveAssignmentLoading}
            disabled={
              selectedRows.length < 1 ||
              selectedRows.find((item) => item.prLineStatusCode === 'SUSPEND') ||
              searchLoading
            }
            permissionList={[
              {
                code: `hzero.srm.requirement.prm.pr-assign.button.assign`,
                type: 'button',
              },
            ]}
            onClick={this.handleAssign}
          >
            <Icons type="main-invitation-register" style={{ marginRight: '5px' }} />
            {intl.get(`${buttonPrompt}.assign`).d('分配')}
          </PermissionButton>
          <PermissionButton
            className="action-btns"
            loading={saveSuspendLoading}
            disabled={
              selectedRows.length < 1 ||
              selectedRows.find((item) => ['SUSPEND'].includes(item.prLineStatusCode)) ||
              searchLoading
            }
            onClick={this.handleSuspend}
            permissionList={[
              {
                code: `hzero.srm.requirement.prm.pr-assign.button.suspend`,
                type: 'button',
              },
            ]}
          >
            <Icons type="participate-in" style={{ marginRight: '5px' }} />
            {intl.get(`${buttonPrompt}.suspend`).d('暂挂')}
          </PermissionButton>
          <PermissionButton
            className="action-btns"
            loading={enableLoading}
            disabled={
              selectedRows.length < 1 ||
              selectedRows.find((item) =>
                ['ASSIGNED', 'APPROVED'].includes(item.prLineStatusCode)
              ) ||
              searchLoading
            }
            permissionList={[
              {
                code: `hzero.srm.requirement.prm.pr-assign.button.enable`,
                type: 'button',
              },
            ]}
            onClick={this.handleEnable}
          >
            <Icons type="Enable" style={{ marginRight: '5px' }} />
            {intl.get(`${buttonPrompt}.enable`).d('启用')}
          </PermissionButton>
          <ExportBtn currentTab={prLineStatusCode} />
          {prLineStatusCode === 'ASSIGNED' && (
            <Tooltip
              placement="left"
              title={
                !selectedRows.every((item) => item?.executionStatusCode === 'ASSIGNED')
                  ? intl
                      .get('sprm.common.view.warning.hasUnassigned')
                      .d('选中数据中含非已分配的申请')
                  : null
              }
              theme="dark"
            >
              <PermissionButton
                onClick={this.handleReturnToAssign}
                loading={backUnassignLoading}
                disabled={
                  !selectedRows.every(
                    (item) =>
                      item?.occupiedQuantity === 0 &&
                      item?.orderOccupiedQuantity === 0 &&
                      item?.sourceOccupiedQuantity === 0 &&
                      item?.executionStatusCode === 'ASSIGNED'
                  ) ||
                  selectedRows.length === 0 ||
                  searchLoading
                }
                key="returnToAssign"
                type="c7n-pro"
                permissionList={[
                  {
                    code: `hzero.srm.requirement.prm.pr-assign.ps.returntoassign`,
                    type: 'button',
                    meaning: '退回至待分配',
                  },
                ]}
              >
                {intl
                  .get('sprm.purchaseRequisitionAssign.view.button.returnToAssign')
                  .d('退回至待分配')}
              </PermissionButton>
            </Tooltip>
          )}
        </Header>
        <Content>
          <div className={styles['purchase-requisition-assignment']}>
            <Radio.Group defaultValue="APPROVED">
              <Radio.Button value="APPROVED" onClick={() => this.statusBtnSearch('APPROVED')}>
                {intl.get(`${buttonPrompt}.notAssign`).d('待分配')}
              </Radio.Button>
              <Radio.Button value="ASSIGNED" onClick={() => this.statusBtnSearch('ASSIGNED')}>
                {intl.get(`${buttonPrompt}.assigned`).d('已分配')}
              </Radio.Button>
              <Radio.Button value="SUSPEND" onClick={() => this.statusBtnSearch('SUSPEND')}>
                {intl.get(`${buttonPrompt}.suspend`).d('暂挂')}
              </Radio.Button>
              <Radio.Button value="ALL" onClick={() => this.statusBtnSearch('ALL')}>
                {intl.get(`${buttonPrompt}.all`).d('全部')}
              </Radio.Button>
            </Radio.Group>
          </div>
          <Search {...searchProps} />
          <List {...listProps} />
          {visible && <PromptModal {...modalProps} />}
          {referPriceVisible && <LadderPrice {...referPriceProps} />}
          <OperationRecord {...operationRecordProps} />
        </Content>
      </React.Fragment>
    );
  }
}
