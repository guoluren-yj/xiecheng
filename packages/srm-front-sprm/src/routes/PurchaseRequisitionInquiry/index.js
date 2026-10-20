/**
 * PurchaseRequisitionInquiry - 需求查询
 * @date: 2019-01-21
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Tabs, Modal, Button, Tooltip } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { isEmpty, isUndefined, isArray } from 'lodash';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  createPagination,
  getCurrentOrganizationId,
  filterNullValueObject,
  getCurrentTenant,
  getResponse,
} from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import ExcelExport from 'components/ExcelExport';
import { SRM_SPRM } from '_utils/config';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import notification from 'utils/notification';
import { dateTimeRender } from 'utils/renderer';
import {
  fetchExecutionLink,
  fetchUomControl,
} from '@/services/purchaseRequisitionAssignmentService';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
import DetailFilterForm from './DetailSearch/FilterForm';
import DetailListTable from './DetailSearch/ListTable';
import OperationRecord from '../components/OperationRecord/OperationRecord';
import Icons from '../components/Icons';
import EvaluateModal from './EvaluaterModal';
import BillDetailModal from './BillDetailModal';
import { getPostParams } from '@/routes/utils';
import style from './index.less';

const { TabPane } = Tabs;

const buttonPrompt = 'sprm.purchaseRequisitionInquiry.view.button';
const titlePrompt = 'sprm.purchaseRequisitionInquiry.view.title';
const modelPrompt = 'sprm.purchaseRequisitionInquiry.model.common';

@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.DETAIL_SEARCH',
    'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.WHOLE_QUERY.FILTER',
    'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.DETAIL_SEARCH.FILTER',
    'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.WHOLE',
    'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.EXECUTIONBILL',
    'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.BTNS',
    'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.WHOLE_BTNS',
  ],
})
@connect(({ purchaseRequisitionInquiry, loading }) => ({
  purchaseRequisitionInquiry,
  loading: loading.effects['purchaseRequisitionInquiry/fetchList'],
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionInquiry/fetchOperationRecordList'],
  fetchDetailLoading: loading.effects['purchaseRequisitionInquiry/fetchDetailList'],
  fetchUpdateRecordListLoading: loading.effects['purchaseRequisitionInquiry/fetchUpdateRecordList'],
  listUrgentLoding: loading.effects['purchaseRequisitionInquiry/listUrgent'],
  listCancelUrgentLoding: loading.effects['purchaseRequisitionInquiry/listCancelUrgent'],
  detailUrgentLoding: loading.effects['purchaseRequisitionInquiry/detailUrgent'],
  detailCancelUrgentLoding: loading.effects['purchaseRequisitionInquiry/detailCancelUrgent'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionApproval',
    'sprm.purchaseRequisitionAssign',
    'sprm.purchaseRequisitionInquiry',
    'sprm.purchaseReqInquiry',
    'sprm.purchaseRequisitionCancel',
    'sprm.purchaseReqCreation',
    'sprm.common',
    'hzero.common',
    'sprm.demandForTheQuery',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
    'entity.business',
    'entity.attachment',
    'spfm.configServer',
    'sodr.quotePurchaseRequisition',
    'sodr.orderMaintenanceEntry',
    'sodr.sendOrder',
  ],
})
export default class PurchaseRequisitionInquiry extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tabKey: this.props.purchaseRequisitionInquiry?.lastActiveTabKey || 'wholeOrderQuery',
      modalList: {},
      prHeaderId: null,
      prLineId: null,
      displayLineNum: '',
      operationRecordList: [],
      operationRecordPagination: {},
      operationRecordModalVisible: false,
      evaluateModalVisible: false,
      billDetailModalVisible: false,
      selectedRowKeys: [],
      selectedDetailRowKeys: [],
      filterValues: {},
      isOldUser: false,
      doubleUintFlag: 0,
    };
  }

  componentDidMount() {
    const {
      purchaseRequisitionInquiry: { pagination },
      location: { state: { _back } = {} },
      dispatch,
    } = this.props;
    if (_back === -1) {
      this.handleSearch(pagination);
    } else {
      this.handleSearch();
    }
    dispatch({ type: 'purchaseRequisitionInquiry/fetchLov' });
    this.getExecutionLink();
    this.getDoubleUnitSetting();
  }

  componentDidUpdate(prevProps) {
    const { custLoading } = this.props;
    const custLoadingChange = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingChange) {
      this.handleSearch();
    }
  }

  /**
   * 条件查询及表格翻页
   * @param {object} page - 查询参数
   */
  @Bind()
  handleSearch(page = {}, _, sorter = {}) {
    const { tabKey } = this.state;
    if (tabKey === 'detailQuery') {
      this.handleSearchDetail(page, sorter);
    } else {
      this.handleSearchWholeOrder(page, sorter);
    }
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

  handleSearchDetail(page, sorter) {
    const { dispatch, tenantId } = this.props;
    let filterValues = {};
    if (!isUndefined(this.detailForm)) {
      const formValue = this.detailForm.getFieldsValue();
      const values = {
        ...formValue,
        createdDateStart:
          formValue.createdDateStart && formValue.createdDateStart.format(DEFAULT_DATETIME_FORMAT),
        createdDateEnd:
          formValue.createdDateEnd && formValue.createdDateEnd.format(DEFAULT_DATETIME_FORMAT),
        neededDateStart:
          formValue.neededDateStart && formValue.neededDateStart.format(DATETIME_MIN),
        neededDateEnd: formValue.neededDateEnd && formValue.neededDateEnd.format(DATETIME_MAX),
        requestDateStart:
          formValue.requestDateStart && formValue.requestDateStart.format(DATETIME_MIN),
        requestDateEnd: formValue.requestDateEnd && formValue.requestDateEnd.format(DATETIME_MAX),
        assignedDateStart:
          formValue.assignedDateStart &&
          formValue.assignedDateStart.format(DEFAULT_DATETIME_FORMAT),
        assignedDateEnd:
          formValue.assignedDateEnd && formValue.assignedDateEnd.format(DEFAULT_DATETIME_FORMAT),
        purchaseAgentNames: null,
        purchaseOrgNames: null,
        createdBysNames: null,
      };
      filterValues = filterNullValueObject(values);
      dispatch({
        type: 'purchaseRequisitionInquiry/updateState',
        payload: {
          detailFilterValues: filterValues,
        },
      });
    }
    let sort = {};
    const { field, order } = sorter;
    switch (true) {
      case field === 'requestedBy':
        sort = { order, field: 'requestedBy' };
        break;
      // case field === 'prLineStatusCodeMeaning':
      //   sort = { order, field: 'prStatusCode' };
      //   break;
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
      type: 'purchaseRequisitionInquiry/fetchDetailList',
      payload: {
        page: isEmpty(page) ? {} : page,
        ...filterValues,
        tenantId,
        sort,
        customizeUnitCode:
          'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.DETAIL_SEARCH.FILTER,SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.DETAIL_SEARCH',
      },
    });
    this.setState({
      selectedRowKeys: [],
      filterValues, // 缓存查询参数给-明细查询-查看-查询时候使用
    });
  }

  /**
   * 整单查询
   * @param {*} page
   */
  handleSearchWholeOrder(page, sorter) {
    const { dispatch, tenantId } = this.props;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
        creationDateFrom:
          formValue.creationDateFrom && formValue.creationDateFrom.format(DEFAULT_DATETIME_FORMAT),
        creationDateTo:
          formValue.creationDateTo && formValue.creationDateTo.format(DEFAULT_DATETIME_FORMAT),
      };
      filterValues = filterNullValueObject(values);
    }
    let sort = {};
    const { field, order } = sorter;
    switch (true) {
      case field === 'requestedBy':
        sort = { order, field: 'requestedBy' };
        break;
      case ['companyName', 'ouName', 'purchaseOrgName', 'purchaseAgentName'].includes(field):
        sort = { order, field: field.replace('Name', 'Id') };
        break;
      case field === 'prStatusMeaning':
        sort = { order, field: 'prStatusCode' };
        break;
      default:
        sort = sorter;
        break;
    }
    dispatch({
      type: 'purchaseRequisitionInquiry/fetchList',
      payload: {
        page: isEmpty(page) ? {} : page,
        ...filterValues,
        tenantId,
        sort,
        customizeUnitCode:
          'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.WHOLE,SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.WHOLE_QUERY.FILTER',
      },
    });
    this.setState({ selectedRowKeys: [] });
    dispatch({
      type: 'purchaseRequisitionInquiry/updateState',
      payload: {
        notErpDetailSource: {},
      },
    });
  }

  /**
   * 跳转详情页
   * @param {object} rec - 操作的行
   */
  @Bind()
  handleDetail(rec) {
    const { dispatch } = this.props;
    const { prSourcePlatformMeaning, prHeaderId, prSourcePlatform: prSourcePlatformCode } = rec;
    dispatch(
      routerRedux.push({
        pathname:
          prSourcePlatformCode.toLowerCase() === 'erp'
            ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
            : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`,
        state: { prSourcePlatformMeaning, prSourcePlatformCode },
      })
    );
  }

  /**
   * 查询操作记录列表
   * @param {Object} page 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId, displayLineNum } = this.state;
    dispatch({
      type: 'purchaseRequisitionInquiry/fetchOperationRecordList',
      payload: {
        prHeaderId,
        page,
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

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(rec, flag) {
    if (flag) {
      this.setState({ updateRecordModalVisible: true });
    } else {
      this.setState({ operationRecordModalVisible: true });
    }
    this.setState({
      prHeaderId: rec.prHeaderId,
      displayLineNum: rec.displayLineNum,
      record: rec,
    });
  }

  /**
   * openBillDetailModal - 打开执行单据详情弹窗
   */
  @Bind()
  openBillDetailModal(record) {
    this.setState({
      billDetailModalVisible: true,
      prLineId: record.prLineId,
    });
  }

  /**
   * evaluateModal - 打开评价弹窗
   */
  @Bind()
  evaluateModal(rec) {
    this.setState({
      modalList: rec,
      prHeaderId: rec.prHeaderId,
      evaluateModalVisible: true,
    });
  }

  @Bind()
  hideModal() {
    this.setState({
      evaluateModalVisible: false,
    });
  }

  /**
   * 数据行选择操作
   */
  @Bind()
  handleSelectRow(selectedRowKeys) {
    const { tabKey } = this.state;
    const {
      dispatch,
      purchaseRequisitionInquiry: { list },
    } = this.props;
    this.setState(selectedRowKeys);
    const newList = list.map((item) => {
      return {
        ...item,
        cuz_selected: selectedRowKeys.selectedRowKeys.includes(item.prHeaderId || item.prLineId),
      };
    });
    dispatch({
      type: 'purchaseRequisitionInquiry/updateState',
      payload:
        tabKey === 'wholeOrderQuery'
          ? {
              list: newList,
            }
          : {
              detailList: newList,
            },
    });
    if (selectedRowKeys?.selectRow) {
      dispatch({
        type: 'purchaseRequisitionInquiry/updateState',
        payload: {
          selectRow: selectedRowKeys?.selectRow,
        },
      });
    }
  }

  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  @Bind()
  tabChange(tabKey) {
    const { dispatch } = this.props;

    dispatch({
      type: 'purchaseRequisitionInquiry/updateState',
      payload: {
        lastActiveTabKey: tabKey,
      },
    });

    this.setState(
      {
        tabKey,
      },
      () => this.handleSearch()
    );
  }

  /**
   *列表整单加急
   */
  @Bind()
  handleListUrgent() {
    const {
      dispatch,
      purchaseRequisitionInquiry: { list, pagination = {} },
    } = this.props;
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length > 0) {
      const prHeaders = list.filter((item) => selectedRowKeys.indexOf(item.prHeaderId) >= 0);
      Modal.confirm({
        title: intl.get(`sodr.sendOrder.view.message.confirmUrgent`).d('是否确认整单加急'),
        onOk: () => {
          dispatch({
            type: 'purchaseRequisitionInquiry/listUrgent',
            payload: prHeaders,
          }).then((res) => {
            if (res) {
              this.setState({ selectedRowKeys: [] });
              notification.success();
              this.handleSearch(pagination);
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
   *列表取消加急
   */
  @Bind()
  handleCancelUrgent() {
    const {
      dispatch,
      purchaseRequisitionInquiry: { list, pagination },
    } = this.props;
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length > 0) {
      const prHeaders = list.filter((item) => selectedRowKeys.indexOf(item.prHeaderId) >= 0);
      // .map(item => {
      //   const { poHeaderId, objectVersionNumber, _token } = item;
      //   return {
      //     _token,
      //     tenantId,
      //     poHeaderId,
      //     objectVersionNumber,
      //   };
      // });
      Modal.confirm({
        title: intl
          .get(`sodr.sendOrder.view.message.confirmCancelUrgent`)
          .d('是否确认取消整单加急'),
        onOk: () => {
          dispatch({
            type: 'purchaseRequisitionInquiry/listCancelUrgent',
            payload: prHeaders,
          }).then((res) => {
            if (res) {
              this.setState({ selectedRowKeys: [] });
              notification.success();
              this.handleSearch(pagination);
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
   *  明细加急
   */
  @Bind()
  @Throttle(500)
  handleDetailUrgent() {
    const {
      dispatch,
      purchaseRequisitionInquiry: { detailPagination = {}, detailList = [] },
    } = this.props;
    const { selectedDetailRowKeys } = this.state;
    if (selectedDetailRowKeys.length > 0) {
      const prLines = detailList.filter(
        (item) => selectedDetailRowKeys.indexOf(item.prLineId) >= 0
      );
      Modal.confirm({
        title: intl.get(`sodr.sendOrder.view.message.confirmDetailUrgent`).d('是否确认加急'),
        onOk: () => {
          dispatch({
            type: 'purchaseRequisitionInquiry/detailUrgent',
            payload: prLines,
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleSearch(detailPagination);
              this.setState({ selectedDetailRowKeys: [] });
              dispatch({
                type: 'purchaseRequisitionInquiry/updateState',
                payload: {
                  selectRow: [],
                },
              });
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
   * 明细取消加急
   * */
  @Bind()
  @Throttle(500)
  handleCancelDetailUrgent() {
    const {
      dispatch,
      purchaseRequisitionInquiry: { detailPagination = {}, detailList = [] },
    } = this.props;
    const { selectedDetailRowKeys } = this.state;
    if (selectedDetailRowKeys.length > 0) {
      const prLines = detailList.filter(
        (item) => selectedDetailRowKeys.indexOf(item.prLineId) >= 0
      );
      Modal.confirm({
        title: intl
          .get(`sodr.sendOrder.view.message.confirmCancelDetailUrgent`)
          .d('是否确认取消加急'),
        onOk: () => {
          dispatch({
            type: 'purchaseRequisitionInquiry/detailCancelUrgent',
            payload: prLines,
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleSearch(detailPagination);
              this.setState({ selectedDetailRowKeys: [] });
              dispatch({
                type: 'purchaseRequisitionInquiry/updateState',
                payload: {
                  selectRow: [],
                },
              });
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
   * 查询变更记录
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleUpdateRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId, displayLineNum } = this.state;
    dispatch({
      type: 'purchaseRequisitionInquiry/fetchUpdateRecordList',
      payload: {
        prHeaderId,
        page,
        displayLineNum,
      },
    }).then((result) => {
      if (result) {
        this.setState({
          updateRecordList: result.content,
          updateRecordPagination: createPagination(result),
        });
      }
    });
  }

  // 点击重置的时候清空 state 暂存的 查询参数
  @Bind
  handleResetSearchValues() {
    this.setState({
      filterValues: {},
    });
  }

  render() {
    const {
      loading,
      tenantId,
      fetchDetailLoading,
      fetchOperationRecordListLoading,
      purchaseRequisitionInquiry: {
        list,
        pagination,
        problemSource,
        autoOrderStatus,
        closeStatus,
        flag,
        executeBillType,
        cancelStatus,
        prStatus,
        queryParams,
        detailQueryParams,
        detailPagination,
        detailList,
        abcTypeList,
        executionStrategyList,
      },
      fetchUpdateRecordListLoading,
      listUrgentLoding,
      listCancelUrgentLoding,
      detailUrgentLoding,
      detailCancelUrgentLoding,
      customizeTable,
      customizeBtnGroup,
      dispatch,
      customizeFilterForm,
    } = this.props;
    const {
      tabKey,
      modalList,
      prLineId,
      prHeaderId,
      selectedRowKeys,
      selectedDetailRowKeys,
      operationRecordList,
      operationRecordPagination,
      evaluateModalVisible,
      billDetailModalVisible,
      operationRecordModalVisible,
      updateRecordPagination,
      updateRecordList,
      updateRecordModalVisible,
      filterValues,
      record,
      isOldUser,
      doubleUintFlag,
    } = this.state;
    const filterProps = {
      closeStatus,
      cancelStatus,
      problemSource,
      prStatus,
      flag,
      pagination,
      onRef: (node) => {
        this.form = node.props.form;
      },
      customizeFilterForm,
      onSearch: this.handleSearch,
    };
    const detailFilterProps = {
      dispatch,
      loading,
      abcTypeList,
      problemSource,
      pagination: detailPagination,
      autoOrderStatus,
      flag,
      executeBillType,
      prStatus,
      executionStrategyList,
      isOldUser,
      onRef: (node) => {
        this.detailForm = node.props.form;
      },
      customizeFilterForm,
      onSearch: this.handleSearch,
      onResetSearchValues: this.handleResetSearchValues,
    };
    const { page: pageData, ...otherDetailQueryParams } = detailQueryParams || {};
    const { page, ...otherQueryParams } = queryParams || {};
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
    const listProps = {
      loading,
      pagination,
      selectedRowKeys,
      dataSource: list,
      onDetail: this.handleDetail,
      onChange: this.handleSearch,
      evaluate: this.evaluateModal,
      onHide: this.openOperationRecord,
      onSelectRow: this.handleSelectRow,
      customizeTable,
    };
    const detailListProps = {
      dataSource: detailList,
      loading: fetchDetailLoading,
      pagination: detailPagination,
      doubleUintFlag,
      onDetail: this.handleDetail,
      onChange: this.handleSearch,
      onSelectRow: this.handleSelectRow,
      selectedRowKeys: selectedDetailRowKeys,
      onHide: this.openOperationRecord,
      onView: this.openBillDetailModal,
      customizeTable,
    };

    const evaluateProps = {
      modalList,
      prHeaderId,
      hideModal: this.hideModal,
      modalSearch: this.modalSearch,
      visible: evaluateModalVisible,
      handleSearchWholeOrder: this.handleSearch,
    };
    const billDetailModalProps = {
      prLineId,
      pubPathFlag: true,
      visible: billDetailModalVisible,
      onClose: this.handleModalVisible,
      filterValues,
      customizeTable,
    };
    // const exportBtnProps = {
    //   icon: 'unarchive',
    //   type: 'c7n-pro',
    //   disabled: isArray(selectedRowKeys) && isEmpty(selectedRowKeys),
    // };
    // const detailExportBtnProps = {
    //   icon: 'unarchive',
    //   type: 'c7n-pro',
    //   disabled: isArray(selectedDetailRowKeys) && isEmpty(selectedDetailRowKeys),
    // };
    const prHeaderIds = selectedRowKeys.join(',');
    const prLineIds = selectedDetailRowKeys.join(',');
    const updateRecordProps = {
      title: intl.get(`${modelPrompt}.changeLog`).d('变更日志'),
      pagination: updateRecordPagination,
      record,
      dataSource: updateRecordList,
      visible: updateRecordModalVisible,
      loading: fetchUpdateRecordListLoading,
      handleOperationRecordSearch: this.handleUpdateRecordSearch,
      hideModal: () => this.handleModalVisible('updateRecordModalVisible', false),
      columnsCover: [
        {
          title: intl.get('sprm.common.model.common.changer').d('变更人'),
          dataIndex: 'processUserName',
          width: 100,
        },
        {
          title: intl.get(`sprm.common.model.common.changeTime`).d('变更时间'),
          width: 140,
          dataIndex: 'processedDate',
          render: dateTimeRender,
        },
        {
          title: intl.get(`sprm.common.model.common.prNum`).d('采购申请编号'),
          width: 100,
          dataIndex: 'displayPrNum',
        },
        {
          title: intl.get(`sprm.common.model.common.motion`).d('动作'),
          width: 100,
          dataIndex: 'processTypeCodeMeaning',
        },
        {
          title: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
          width: 80,
          dataIndex: 'displayLineNum',
        },
        {
          title: intl.get(`sprm.common.model.common.changeFields`).d('变更字段'),
          width: 100,
          dataIndex: 'changeField',
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
      ],
    };
    const DeatailHeaderBtn = observer(() => {
      const headerButtons = [
        {
          name: 'urgent',
          noNest: true,
          // btnProps: { onClick: this.handleDetailUrgent },
          child: (text) => (
            <Tooltip
              className={style['tooltip-adjust']}
              title={
                (detailList || [])
                  .filter((item) => selectedDetailRowKeys.includes(item.prLineId))
                  .find((ele) => ele.urgentFlag === 1) &&
                (detailList || [])
                  .filter((item) => selectedDetailRowKeys.includes(item.prLineId))
                  .find((ele) => ele.urgentFlag !== 1)
                  ? intl
                      .get(`sprm.common.message.urgentFlagChoose`)
                      .d('勾选的行既存在有加急标识和未加急标识，请重新勾选数据！')
                  : ''
              }
            >
              <Button
                type="primary"
                loading={detailUrgentLoding}
                onClick={this.handleDetailUrgent}
                disabled={
                  (isArray(selectedDetailRowKeys) && isEmpty(selectedDetailRowKeys)) ||
                  !(detailList || [])
                    .filter((item) => selectedDetailRowKeys.includes(item.prLineId))
                    .every((ele) => ele.urgentFlag !== 1)
                }
              >
                <Icons size={16} type="main-urgent" />
                {text || intl.get(`${buttonPrompt}.detailUrgent`).d('加急')}
              </Button>
            </Tooltip>
          ),
        },
        {
          name: 'cancelUrgent',
          noNest: true,
          // btnProps: { onClick: this.handleCancelDetailUrgent },
          child: (text) => (
            <Tooltip
              className={style['tooltip-adjust']}
              title={
                (detailList || [])
                  .filter((item) => selectedDetailRowKeys.includes(item.prLineId))
                  .find((ele) => ele.urgentFlag === 1) &&
                (detailList || [])
                  .filter((item) => selectedDetailRowKeys.includes(item.prLineId))
                  .find((ele) => ele.urgentFlag !== 1)
                  ? intl
                      .get(`sprm.common.message.urgentFlagChoose`)
                      .d('勾选的行既存在有加急标识和未加急标识，请重新勾选数据！')
                  : ''
              }
            >
              <Button
                type="default"
                loading={detailCancelUrgentLoding}
                onClick={this.handleCancelDetailUrgent}
                disabled={
                  (isArray(selectedDetailRowKeys) && isEmpty(selectedDetailRowKeys)) ||
                  !(detailList || [])
                    .filter((item) => selectedDetailRowKeys.includes(item.prLineId))
                    .every((ele) => ele.urgentFlag === 1)
                }
              >
                <Icons size={16} type="main-cancel-urgent" />
                {text || intl.get(`${buttonPrompt}.cancelDetailUrgent`).d('取消加急')}
              </Button>
            </Tooltip>
          ),
        },
        {
          name: 'newExport',
          noNest: true,
          child: (text) => (
            <ExcelExportPro
              data-name="newExport"
              {...{
                templateCode: 'SPUC_SPRM_INQUIRY_LINE_EXPORT',
                otherButtonProps: {
                  icon: 'unarchive',
                  type: 'c7n-pro',
                  permissionList: [
                    {
                      code: 'hzero.srm.requirement.prm.pr-inquiry.ps.new.detail.list.export',
                      type: 'button',
                    },
                  ],
                },
                buttonText:
                  text ||
                  (isArray(selectedDetailRowKeys) && isEmpty(selectedDetailRowKeys)
                    ? intl.get('hzero.common.export.new').d('导出-新')
                    : intl.get(`${buttonPrompt}.checkExport.new`).d('勾选导出-新')),
                method: 'POST',
                allBody: true,
                requestUrl: `${SRM_SPRM}/v1/${tenantId}/purchase-request/query-detail/export-modeler`,
                queryParams:
                  isArray(selectedDetailRowKeys) && isEmpty(selectedDetailRowKeys)
                    ? getPostParams(
                        {
                          ...otherDetailQueryParams,
                        },
                        'line',
                        true
                      )
                    : {
                        prLineIds: selectedDetailRowKeys,
                        customizeUnitCode:
                          'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.DETAIL_SEARCH.FILTER,SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.DETAIL_SEARCH',
                      },
              }}
            />
          ),
        },
        {
          name: 'export',
          btnType: 'c7n-pro',
          btnProps: {
            otherButtonProps: {
              icon: 'unarchive',
              type: 'c7n-pro',
              permissionList: [
                {
                  code: 'hzero.srm.requirement.prm.pr-inquiry.ps.detail.list.export',
                  type: 'button',
                },
              ],
            },
            buttonText:
              isArray(selectedDetailRowKeys) && isEmpty(selectedDetailRowKeys)
                ? intl.get('hzero.common.button.export').d('导出')
                : intl.get(`${buttonPrompt}.checkExport`).d('勾选导出'),
            requestUrl: `${SRM_SPRM}/v1/${tenantId}/purchase-request/query-detail/export`,
            queryParams:
              isArray(selectedDetailRowKeys) && isEmpty(selectedDetailRowKeys)
                ? {
                    ...otherDetailQueryParams,
                  }
                : {
                    prLineIds,
                    customizeUnitCode:
                      'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.DETAIL_SEARCH.FILTER,SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.DETAIL_SEARCH',
                  },
          },
          noNest: true,
          child: (text) => (
            <ExcelExport
              data-name="export"
              {...{
                otherButtonProps: {
                  icon: 'unarchive',
                  type: 'c7n-pro',
                  permissionList: [
                    {
                      code: 'hzero.srm.requirement.prm.pr-inquiry.ps.detail.list.export',
                      type: 'button',
                    },
                  ],
                },
                buttonText:
                  text ||
                  (isArray(selectedDetailRowKeys) && isEmpty(selectedDetailRowKeys)
                    ? intl.get('hzero.common.button.export').d('导出')
                    : intl.get(`${buttonPrompt}.checkExport`).d('勾选导出')),
                requestUrl: `${SRM_SPRM}/v1/${tenantId}/purchase-request/query-detail/export`,
                queryParams:
                  isArray(selectedDetailRowKeys) && isEmpty(selectedDetailRowKeys)
                    ? {
                        ...otherDetailQueryParams,
                      }
                    : {
                        prLineIds,
                        customizeUnitCode:
                          'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.DETAIL_SEARCH.FILTER,SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.DETAIL_SEARCH',
                      },
              }}
            />
          ),
        },
      ];

      return (
        <>
          {customizeBtnGroup(
            {
              code: 'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.BTNS',
              pro: true,
            },
            <DynamicButtons buttons={headerButtons} />
          )}
        </>
      );
    });

    const WholeHeaderBtn = observer(() => {
      const headerButtons = [
        {
          name: 'urgent',
          noNest: true,
          // btnProps: { onClick: this.handleListUrgent },
          child: (text) => (
            <Tooltip
              className={style['tooltip-adjust']}
              title={
                list
                  .filter((item) => selectedRowKeys.includes(item.prHeaderId))
                  .find((ele) => ele.urgentFlag === 1) &&
                list
                  .filter((item) => selectedRowKeys.includes(item.prHeaderId))
                  .find((ele) => ele.urgentFlag !== 1)
                  ? intl
                      .get(`sprm.common.message.urgentFlagChoose`)
                      .d('勾选的行既存在有加急标识和未加急标识，请重新勾选数据！')
                  : ''
              }
            >
              <Button
                type="primary"
                onClick={this.handleListUrgent}
                loading={listUrgentLoding}
                disabled={
                  (isArray(selectedRowKeys) && isEmpty(selectedRowKeys)) ||
                  !list
                    .filter((item) => selectedRowKeys.includes(item.prHeaderId))
                    .every((ele) => ele.urgentFlag !== 1)
                }
              >
                <Icons size={16} type="main-urgent" />
                {text || intl.get(`${buttonPrompt}.wholeUrgent`).d('整单加急')}
              </Button>
            </Tooltip>
          ),
        },
        {
          name: 'cancelUrgent',
          noNest: true,
          // btnProps: { onClick: this.handleCancelUrgent },
          child: (text) => (
            <Tooltip
              className={style['tooltip-adjust']}
              title={
                list
                  .filter((item) => selectedRowKeys.includes(item.prHeaderId))
                  .find((ele) => ele.urgentFlag === 1) &&
                list
                  .filter((item) => selectedRowKeys.includes(item.prHeaderId))
                  .find((ele) => ele.urgentFlag !== 1)
                  ? intl
                      .get(`sprm.common.message.urgentFlagChoose`)
                      .d('勾选的行既存在有加急标识和未加急标识，请重新勾选数据！')
                  : ''
              }
            >
              <Button
                onClick={this.handleCancelUrgent}
                loading={listCancelUrgentLoding}
                disabled={
                  (isArray(selectedRowKeys) && isEmpty(selectedRowKeys)) ||
                  !list
                    .filter((item) => selectedRowKeys.includes(item.prHeaderId))
                    .every((ele) => ele.urgentFlag === 1)
                }
              >
                <Icons size={16} type="main-cancel-urgent" />
                {text || intl.get(`${buttonPrompt}.cancelWholeUrgent`).d('整单取消加急')}
              </Button>
            </Tooltip>
          ),
        },
        {
          name: 'newExport',
          noNest: true,
          child: (text) => (
            <ExcelExportPro
              data-name="newExport"
              {...{
                templateCode: 'SPUC_SPRM_INQUIRY_HEAD_EXPORT',
                otherButtonProps: {
                  icon: 'unarchive',
                  type: 'c7n-pro',
                  permissionList: [
                    {
                      code: 'hzero.srm.requirement.prm.pr-inquiry.ps.new.whole.list.export',
                      type: 'button',
                    },
                  ],
                },
                buttonText:
                  text ||
                  (isArray(selectedRowKeys) && isEmpty(selectedRowKeys)
                    ? intl.get('hzero.common.export.new').d('导出-新')
                    : intl.get(`${buttonPrompt}.checkExport.new`).d('勾选导出-新')),
                method: 'POST',
                allBody: true,
                requestUrl: `${SRM_SPRM}/v1/${tenantId}/purchase-requests/export-modeler`,
                queryParams:
                  isArray(selectedRowKeys) && isEmpty(selectedRowKeys)
                    ? { ...otherQueryParams }
                    : {
                        prHeaderIds: selectedRowKeys,
                        customizeUnitCode:
                          'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.WHOLE,SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.WHOLE_QUERY.FILTER',
                      },
              }}
            />
          ),
        },
        {
          name: 'export',
          noNest: true,
          child: (text) => (
            <ExcelExport
              data-name="export"
              {...{
                otherButtonProps: {
                  icon: 'unarchive',
                  type: 'c7n-pro',
                  permissionList: [
                    {
                      code: 'hzero.srm.requirement.prm.pr-inquiry.ps.whole.list.export',
                      type: 'button',
                    },
                  ],
                },
                buttonText:
                  text ||
                  (isArray(selectedRowKeys) && isEmpty(selectedRowKeys)
                    ? intl.get('hzero.common.button.export').d('导出')
                    : intl.get(`${buttonPrompt}.checkExport`).d('勾选导出')),
                requestUrl: `${SRM_SPRM}/v1/${tenantId}/purchase-requests/export`,
                queryParams:
                  isArray(selectedRowKeys) && isEmpty(selectedRowKeys)
                    ? {
                        ...otherQueryParams,
                      }
                    : {
                        prHeaderIds,
                        customizeUnitCode:
                          'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.WHOLE,SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.WHOLE_QUERY.FILTER',
                      },
              }}
            />
          ),
        },
      ];

      return (
        <>
          {customizeBtnGroup(
            {
              code: 'SPRM.PURCHASE_REQUISITION_INQUIRY.LIST.WHOLE_BTNS',
              pro: true,
            },
            <DynamicButtons buttons={headerButtons} />
          )}
        </>
      );
    });

    return (
      <React.Fragment>
        <Header title={intl.get(`${titlePrompt}.requisitionQuery`).d('需求查询')}>
          {tabKey === 'detailQuery' && <DeatailHeaderBtn />}
          {tabKey === 'wholeOrderQuery' && <WholeHeaderBtn />}
        </Header>
        <Content>
          <Tabs activeKey={tabKey} onChange={this.tabChange} animated={false} forceRender>
            <TabPane
              tab={intl.get(`${titlePrompt}.singleInquiry`).d('整单查询')}
              key="wholeOrderQuery"
              forceRender
            >
              <FilterForm {...filterProps} />
              <ListTable {...listProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`${titlePrompt}.detailInquiry`).d('明细查询')}
              key="detailQuery"
              forceRender
            >
              <DetailFilterForm {...detailFilterProps} />
              {tabKey === 'detailQuery' && <DetailListTable {...detailListProps} />}
            </TabPane>
          </Tabs>
          <OperationRecord {...operationRecordProps} />
          <OperationRecord {...updateRecordProps} />
          {evaluateModalVisible && <EvaluateModal {...evaluateProps} />}
          {billDetailModalVisible && <BillDetailModal {...billDetailModalProps} />}
        </Content>
      </React.Fragment>
    );
  }
}
