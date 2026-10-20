/**
 * NonErpPurchaseRequisition - 非ERP采购申请
 * @date: 2019-01-24
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Modal, Tooltip } from 'hzero-ui';
import { routerRedux } from 'dva/router';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Content, Header } from 'components/Page';
import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Button } from 'components/Permission';
import {
  createPagination,
  filterNullValueObject,
  // getCurrentOrganizationId,
  getCurrentTenant,
  getResponse,
} from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import OperationRecord from '../components/OperationRecord/OperationRecord';
import { fetchConfigSheetRfxPrepare } from '@/services/purchaseRequisitionApprovalService';
import Search from './Search.js';
import List from './List.js';

const messagePrompt = 'sprm.purchaseRequisitionApproval.view.message';
const buttonPrompt = 'sprm.purchaseRequisitionApproval.view.button';
const titlePrompt = 'sprm.purchaseRequisitionApproval.view.title';
@withCustomize({
  unitCode: [
    'SRPM.PURCHAE_REQUISITION_APPROVE.LIST.FILTER',
    'SRPM.PURCHAE_REQUISITION_APPROVE.LIST.GRID',
    'SRPM.PURCHAE_REQUISITION_APPROVE.LIST.BTN',
  ],
})
@connect(({ purchaseRequisitionApproval, loading }) => ({
  purchaseRequisitionApproval,
  queryListLoading: loading.effects['purchaseRequisitionApproval/queryList'],
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionApproval/fetchOperationRecordList'],
  approving: loading.effects['purchaseRequisitionApproval/passApprovalList'],
  rejecting: loading.effects['purchaseRequisitionApproval/rejectApprovalList'],
  approvalLoading: loading.effects['purchaseRequisitionApproval/approvalApprovalList'],
}))
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionApproval',
    'sprm.common',
    'hzero.common',
    'entity.supplier',
    'entity.roles',
  ],
})
export default class Message extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      operationRecordList: [],
      operationRecordPagination: {},
      operationRecordModalVisible: false,
    };
    this.visibleOldPrepareConfigSheet = false;
  }

  componentDidMount() {
    const {
      dispatch,
      custLoading,
      location: { state: { _back } = {} },
      purchaseRequisitionApproval: { listPagination = {} },
    } = this.props;
    this.fetchConfigSheetRfxPrepare();
    dispatch({ type: 'purchaseRequisitionApproval/init' });
    if (_back === -1) {
      this.handleListSearch(listPagination);
    } else {
      this.props.dispatch({
        type: 'purchaseRequisitionApproval/fetchEnum',
      });
      if (!custLoading) {
        this.handleListSearch();
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { custLoading } = this.props;

    const custLoadingChange = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingChange) {
      this.handleListSearch();
    }
  }

  // 配置表配置显示寻源准备节点新老内容
  @Bind()
  fetchConfigSheetRfxPrepare() {
    fetchConfigSheetRfxPrepare({
      tenant: getCurrentTenant().tenantNum,
    }).then(res => {
      const result = getResponse(res);
      if (!result) {
        return;
      }
      this.visibleOldPrepareConfigSheet = result && !isEmpty(result.content);
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo'];
    timeArray.forEach(item => {
      dealTime[item] = filterValues[item]
        ? filterValues[item].format(DEFAULT_DATETIME_FORMAT)
        : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * 查询表格数据
   * @param {Object} params
   */
  @Bind()
  handleListSearch(page = {}, _, sorter = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    let sort = {};
    const { field, order } = sorter;
    switch (true) {
      case field === 'requestedBy':
        sort = { order, field: 'requestedBy' };
        break;
      case ['companyName', 'ouName', 'purchaseOrgName', 'purchaseAgentName'].includes(field):
        sort = { order, field: field.replace('Name', 'Id') };
        break;
      // case field === 'prLineStatusCodeMeaning':
      //   sort = { order, field: 'prLineStatusCode' };
      //   break;
      default:
        sort = sorter;
        break;
    }
    dispatch({
      type: 'purchaseRequisitionApproval/queryList',
      payload: {
        ...handleFormValues,
        sort,
        customizeUnitCode:
          'SRPM.PURCHAE_REQUISITION_APPROVE.LIST.FILTER,SRPM.PURCHAE_REQUISITION_APPROVE.LIST.GRID',
        page,
      },
    });
  }

  /**
   * 查询操作记录列表
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
   * @param {*} record
   */
  @Bind()
  openOperationRecord(record) {
    this.setState({
      operationRecordModalVisible: true,
      prHeaderId: record.prHeaderId,
      record,
    });
  }

  /**
   * 控制弹窗的显示和隐藏
   * @param {String} modalVisible
   * @param {Boolean} flag
   * @memberof Detail
   */
  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  /**
   * 订单审批通过
   */
  @Throttle(500)
  @Bind()
  approvalApprovalList() {
    const { dispatch, approvalLoading, purchaseRequisitionApproval = {} } = this.props;
    const { approvalList = [], listPagination = {}, selectInfo = {} } = purchaseRequisitionApproval;
    const { selectedListRowKeys = [], selectPendingStatus = '' } = selectInfo || {};
    if (selectedListRowKeys && selectedListRowKeys.length > 0) {
      const approvalOrders = approvalList.filter(
        item => selectedListRowKeys.indexOf(item.prHeaderId) >= 0
      );
      Modal.confirm({
        title: intl.get(`${messagePrompt}.confirmApprove`).d('是否确认审批通过需求'),
        confirmLoading: approvalLoading,
        onOk: () => {
          dispatch({
            type: 'purchaseRequisitionApproval/approvalApprovalList',
            payload: {
              approvalPendingStatus: selectPendingStatus,
              prHeaderList: approvalOrders,
            },
          }).then(res => {
            if (res) {
              notification.success();
              this.handleListSearch(listPagination);
            }
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 订单审批拒绝
   */
  @Throttle(500)
  @Bind()
  rejectApprovalList() {
    const { dispatch, purchaseRequisitionApproval = {} } = this.props;
    const { approvalList = [], listPagination = {}, selectInfo = {} } = purchaseRequisitionApproval;
    const { selectedListRowKeys = [], selectPendingStatus = '' } = selectInfo;
    if (selectedListRowKeys && selectedListRowKeys.length > 0) {
      const rejectOrders = approvalList.filter(
        item => selectedListRowKeys.indexOf(item.prHeaderId) >= 0
      );

      Modal.confirm({
        title: intl.get(`${messagePrompt}.confirmReject`).d('是否确认审批拒绝需求'),
        onOk: () => {
          dispatch({
            type: 'purchaseRequisitionApproval/rejectApprovalList',
            payload: {
              approvalPendingStatus: selectPendingStatus,
              prHeaderList: rejectOrders,
            },
          }).then(res => {
            if (res) {
              this.handleListSearch(listPagination);
              notification.success();
            }
          });
        },
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 跳转详情
   * @params
   */
  @Bind()
  onHandleToDetail({ prHeaderId, prSourcePlatform }) {
    const { dispatch } = this.props;
    if (prSourcePlatform !== 'ERP') {
      if (this.visibleOldPrepareConfigSheet) {
        dispatch(
          routerRedux.push({
            pathname: `/sprm/purchase-requisition-approval/detail-non-erp/${prHeaderId}`,
          })
        );
      } else {
        dispatch(
          routerRedux.push({
            pathname: `/sprm/purchase-requisition-approval/new-detail-nonerp/${prHeaderId}`,
          })
        );
      }
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/purchase-requisition-approval/detail-erp/${prHeaderId}`,
        })
      );
    }
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectedChange(selectedRowKeys, selectRows) {
    const { dispatch } = this.props;
    const allApprovalPendingStatus = Array.from(
      new Set(selectRows?.map(ele => ele.approvalPendingStatus))
    );
    dispatch({
      type: 'purchaseRequisitionApproval/updateState',
      payload: {
        selectInfo: {
          selectedListRowKeys: selectedRowKeys,
          selectPendingStatus:
            allApprovalPendingStatus.length === 1 ? allApprovalPendingStatus[0] : '',
        },
      },
    });
  }

  /**
   * onCell - 设置表格单元格属性函数
   */
  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 300,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const {
      operationRecordList,
      operationRecordPagination,
      operationRecordModalVisible,
      record,
    } = this.state;
    const {
      approving,
      rejecting,
      queryListLoading,
      fetchOperationRecordListLoading,
      purchaseRequisitionApproval: {
        prSourcePlatformList,
        approvalPendingStatusList,
        approvalList,
        listPagination,
        selectInfo,
      },
      customizeFilterForm,
      customizeTable,
      approvalLoading,
      customizeBtnGroup,
    } = this.props;
    const { selectedListRowKeys = [], selectPendingStatus = '' } = selectInfo;
    const searchProps = {
      customizeFilterForm,
      prSourcePlatformList,
      approvalPendingStatusList,
      pagination: listPagination,
      onFilterChange: this.handleListSearch,
      onRef: node => {
        this.filterForm = node.props.form;
      },
    };
    const listProps = {
      customizeTable,
      dataSource: approvalList,
      pagination: listPagination,
      loading: queryListLoading,
      rowSelection: {
        selectedRowKeys: selectedListRowKeys,
        onChange: this.handleRowSelectedChange,
        //  === 'CANCELLEDING' || selectPendingStatus === 'CLOSEDING'
        getCheckboxProps: currentRecord => ({
          disabled:
            selectPendingStatus && currentRecord.approvalPendingStatus !== selectPendingStatus,
        }),
      },
      onChange: this.handleListSearch,
      onShow: this.openOperationRecord,
      onDetail: this.onHandleToDetail,
    };
    const operationRecordProps = {
      record,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      pagination: operationRecordPagination,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    const HeaderBtn = observer(() => {
      const headerButtons = [
        {
          name: 'approve',
          noNest: true,
          // btnProps: { onClick: this.handleDetailUrgent },
          child: text => (
            <Tooltip
              title={intl
                .get('sprm.common.view.button.approveRule')
                .d('申请取消的审批，无法进行批量审批，请进入详情页进行操作')}
              theme="light"
            >
              <Button
                type="primary"
                icon="check"
                loading={approving || approvalLoading}
                style={{ marginLeft: '10px' }}
                onClick={this.approvalApprovalList}
                disabled={
                  isEmpty(selectedListRowKeys) ||
                  ((selectPendingStatus === 'CANCELLEDING' ||
                    selectPendingStatus === 'CLOSEDING') &&
                    selectedListRowKeys.length > 1) ||
                  !selectPendingStatus
                }
                permissionList={[
                  {
                    code: `hzero.srm.requirement.prm.pr-approval.ps.approval-btn`,
                  },
                ]}
              >
                {text || intl.get(`${buttonPrompt}.approval`).d('审批通过')}
              </Button>
            </Tooltip>
          ),
        },
        {
          name: 'reject',
          noNest: true,
          btnProps: { icon: close },
          child: text => (
            <Tooltip
              title={intl
                .get('sprm.common.view.button.approveRule')
                .d('申请取消的审批，无法进行批量审批，请进入详情页进行操作')}
              theme="light"
            >
              <Button
                icon="close"
                loading={rejecting}
                onClick={this.rejectApprovalList}
                disabled={
                  isEmpty(selectedListRowKeys) ||
                  ((selectPendingStatus === 'CANCELLEDING' ||
                    selectPendingStatus === 'CLOSEDING') &&
                    selectedListRowKeys.length > 1) ||
                  !selectPendingStatus
                }
                permissionList={[
                  {
                    code: `hzero.srm.requirement.prm.pr-approval.ps.reject-btn`,
                  },
                ]}
              >
                {text || intl.get(`${buttonPrompt}.reject`).d('审批拒绝')}
              </Button>
            </Tooltip>
          ),
        },
      ];

      return (
        <>
          {customizeBtnGroup(
            {
              code: 'SRPM.PURCHAE_REQUISITION_APPROVE.LIST.BTN',
              pro: true,
            },
            <DynamicButtons buttons={headerButtons} />
          )}
        </>
      );
    });
    return (
      <React.Fragment>
        <Header title={intl.get(`${titlePrompt}.requireApproval`).d('需求审批')}>
          <HeaderBtn />
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
          <OperationRecord {...operationRecordProps} />
        </Content>
      </React.Fragment>
    );
  }
}
