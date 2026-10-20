/**
 * index - 需求取消
 * @date: 2019-1-25
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button, Spin, Tabs, Tooltip, Form } from 'hzero-ui';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  createPagination,
  filterNullValueObject,
  getCurrentTenant,
  getCurrentOrganizationId,
  getResponse,
} from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT, DATETIME_MIN } from 'utils/constants';
import notification from 'utils/notification';
import { dateTimeRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isArray, isEmpty } from 'lodash';

import Search from './Search.js';
import List from './List.js';
import OperationRecord from '../components/OperationRecord/OperationRecord';
import FormSearch from './FormSearch';
import FormList from './FormList';
import PromptModal from './PromptModal';
import { fetchConfig, fetchChangeConfig } from '@/services/purchaseRequisitionCancelService';
import { fetchUomControl } from '@/services/purchaseRequisitionCreationService';

const organizationId = getCurrentOrganizationId();
// 设置sprm国际化前缀 - message
const messagePrompt = 'sprm.purchaseRequisitionCancel.view.message';
const titlePrompt = 'sprm.purchaseRequisitionCancel.view.title';

const { TabPane } = Tabs;

// const { Option } = Select;

// 初始化通用布局
// const formItemLayout = {
//   labelCol: { span: 10 },
//   wrapperCol: { span: 14 },
// };

/**
 * Cancel - 需求取消组件
 * @exports
 * @reactProps {object} purchaseRequisitionCancel - 数据源
 * @reactProps {boolean} fetchListLoading - 数据加载是否完成
 * @reactProps {function} dispatch - 触发请求函数
 * @reactProps {string[]} statusList - 状态下拉框值集
 * @reactProps {string[]} sourceList - 单据来源下拉框值集
 * @reactProps {object[]} tableData - table 数据源
 * @reactProps {object} pagination - table 分页信息
 * @returns React.element
 */
@withCustomize({
  unitCode: [
    'SPRM.PURCHASE_REQUISITION_CANCEL.LIST.DETAIL',
    'SPRM.PURCHASE_REQUISITION_CANCEL.LIST.WHOLE_FILTER',
    'SPRM.PURCHASE_REQUISITION_CANCEL.LIST.WHOLE',
    'SPRM.PURCHASE_REQUISITION_CANCEL.LIST.DETAIL_FILTER',
  ],
})
@connect(({ purchaseRequisitionCancel = {}, loading = {} }) => ({
  purchaseRequisitionCancel,
  searchListLoading: loading.effects['purchaseRequisitionCancel/searchList'],
  searchSingleLoading: loading.effects['purchaseRequisitionCancel/searchSingleOrder'],
  cancelLoading: loading.effects['purchaseRequisitionCancel/cancelPurchase'],
  fetchPurchaseLinesCloseLoading:
    loading.effects['purchaseRequisitionCancel/fetchPurchaseLinesClose'],
  fetchValueLoading: loading.effects['purchaseRequisitionCancel/fetchValue'],
  fetchOperationRecordListLoading:
    loading.effects['purchaseRequisitionCancel/fetchOperationRecordList'],
}))
@formatterCollections({
  code: [
    'sprm.purchaseRequisitionCancel',
    'sprm.purchaseRequisitionApproval',
    'sprm.purchaseRequisitionInquiry',
    'sprm.purchaseReqCreation',
    'sprm.purchaseReqInquiry',
    'sprm.purchasePlatform',
    'sprm.common',
    'hzero.common',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'spfm.configServer',
  ],
})
@Form.create({ fieldNameProp: null })
export default class Cancel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tabKey: null,
      displayLineNum: '',
      collapsed: false,
      selectedRows: [],
      operationRecordList: [],
      operationRecordPagination: {},
      operationRecordModalVisible: false,
      promptModalVisible: false,
      currentRecord: {},
      isNewTeant: false,
      srmChangeFlag: 0,
      erpChangeFlag: 0,
      doubleUintFlag: 0, // 业务规则双单位配置
    };
  }

  componentDidMount() {
    const {
      dispatch,
      custLoading,
      purchaseRequisitionCancel: { pagination, singlePagination, lastActiveTabKey },
    } = this.props;
    dispatch({
      type: 'purchaseRequisitionCancel/fetchValue',
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
    fetchChangeConfig().then(res => {
      const result = getResponse(res);
      if (result) {
        const { srmChangeFlag, erpChangeFlag } = result;
        this.setState({
          srmChangeFlag,
          erpChangeFlag,
        });
      }
    });
    if (!custLoading) {
      if (lastActiveTabKey === 'lineCancel') {
        this.handleSearch(pagination);
      } else {
        this.singleCancelSearch(singlePagination);
      }
    }
    this.getDoubleUnitSetting();
  }

  componentDidUpdate(prevProps) {
    const { custLoading } = this.props;
    const {
      purchaseRequisitionCancel: { pagination, singlePagination, lastActiveTabKey },
    } = this.props;
    const custLoadingChange = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingChange) {
      if (lastActiveTabKey === 'lineCancel') {
        this.handleSearch(pagination);
      } else {
        this.singleCancelSearch(singlePagination);
      }
    }
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

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId, displayLineNum } = this.state;
    dispatch({
      type: 'purchaseRequisitionCancel/fetchOperationRecordList',
      payload: {
        prHeaderId,
        page,
        displayLineNum,
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
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleUpdateRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { prHeaderId, displayLineNum } = this.state;
    dispatch({
      type: 'purchaseRequisitionCancel/fetchUpdateRecordList',
      payload: {
        prHeaderId,
        page,
        displayLineNum,
      },
    }).then(result => {
      if (result) {
        this.setState({
          updateRecordList: result.content,
          updateRecordPagination: createPagination(result),
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
      currentRecord: rec,
      prHeaderId: rec.prHeaderId,
      displayLineNum: rec.displayLineNum,
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  /**
   * 选择行变化
   * @param {*} selectedRowKeys
   * @memberof Cancel
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 查询表单请求
   * @param {object} page - 分页信息
   * @memberof Cancel
   */
  @Bind()
  handleSearch(page = {}, _, sorter = {}) {
    const { dispatch } = this.props;
    const neededFields = ['neededDateStart', 'neededDateEnd'];
    const createFields = ['createdDateStart', 'createdDateEnd'];
    const values = this.searchForm ? this.searchForm.getFieldsValue() : {};
    const data = {};
    neededFields.forEach(n => {
      if (values[n]) {
        data[n] = values[n].format(DATETIME_MIN);
      }
    });
    createFields.forEach(n => {
      if (values[n]) {
        data[n] = values[n].format(DEFAULT_DATETIME_FORMAT);
      }
    });
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
      type: 'purchaseRequisitionCancel/searchList',
      payload: {
        ...filterNullValueObject({
          page,
          ...values,
          ...data,
          sort,
          customizeUnitCode:
            'SPRM.PURCHASE_REQUISITION_CANCEL.LIST.DETAIL,SPRM.PURCHASE_REQUISITION_CANCEL.LIST.DETAIL_FILTER',
        }),
      },
    }).then(res => {
      if (res) {
        this.setState({
          selectedRows: [],
        });
      }
    });
  }

  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  handleRefBind(node) {
    this.searchForm = node.props.form;
  }

  @Bind()
  tabChange(activeKey) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseRequisitionCancel/updateState',
      payload: {
        lastActiveTabKey: activeKey,
      },
    });
    if (activeKey === 'lineCancel') {
      this.handleSearch();
    } else if (activeKey === 'singleCancel') {
      this.singleCancelSearch();
    }
  }

  /**
   * 查看详情页面
   */
  @Bind()
  viewDetail(record) {
    const { dispatch } = this.props;
    const { type, id } = record;
    dispatch(
      routerRedux.push({
        pathname: `/sprm/purchase-requisition-cancel/${type}/${id}`,
      })
    );
  }

  @Bind()
  singleCancelSearch(page = {}, _, sorter = {}) {
    const { dispatch } = this.props;
    const params = this.formSearch ? this.formSearch.getFieldsValue() : {};
    const dateFields = ['creationDateFrom', 'creationDateTo'];
    dateFields.forEach(n => {
      if (params[n]) {
        params[n] = params[n].format(DEFAULT_DATETIME_FORMAT);
      }
    });
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
      type: 'purchaseRequisitionCancel/searchSingleOrder',
      payload: {
        page,
        sort,
        ...params,
        customizeUnitCode:
          'SPRM.PURCHASE_REQUISITION_CANCEL.LIST.WHOLE_FILTER,SPRM.PURCHASE_REQUISITION_CANCEL.LIST.WHOLE',
      },
    });
  }

  /**
   * 取消按钮
   * @memberof Cancel
   */
  @Bind()
  handleCancel() {
    // debugger
    const { selectedRows = [] } = this.state;
    const { dispatch, form } = this.props;
    const { cancelledRemark } = form.getFieldsValue();
    return dispatch({
      type: 'purchaseRequisitionCancel/cancelPurchaseByWhole',
      payload: { selectedRows: selectedRows?.map(item => ({ ...item, cancelledRemark })) },
    }).then(res => {
      if (res && isArray(res)) {
        let cancelMsg = '';
        res.forEach(ele => {
          cancelMsg += `${ele.message}\n`;
        });
        if (cancelMsg) {
          notification.warning({
            message: cancelMsg,
            duration: null,
            style: {
              'white-space': 'pre-wrap',
            },
          });
        } else {
          notification.success();
        }
        this.handleSearch();
        this.setState({
          selectedRows: [],
        });
      } else if (res && res.failed) {
        notification.error({ message: res.message });
      }
    });
  }

  /**
   * 关闭按钮
   * @memberof Close
   */
  @Bind()
  handleClose() {
    const { selectedRows } = this.state;
    const { dispatch, form } = this.props;
    const ifCanClose = selectedRows.every(item =>
      ['SUSPEND', 'ASSIGNED', 'APPROVED'].includes(item.prLineStatusCode)
    );
    if (ifCanClose) {
      const { closedRemark } = form.getFieldsValue();
      return dispatch({
        type: 'purchaseRequisitionCancel/fetchPurchaseLinesClose',
        payload: selectedRows?.map(item => ({ ...item, closedRemark })),
      }).then(res => {
        if (res) {
          const { successCounts, failedCounts } = res;
          this.setState({
            selectedRows: [],
          });
          this.handleSearch();
          notification.success({
            message: intl
              .get(`${messagePrompt}.successAndfailed`, { successCounts, failedCounts })
              .d(`成功了${successCounts}条，失败了${failedCounts}条`),
          });
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
   * 展开或折叠整单取消的更多按钮
   */
  @Bind()
  toggleCollapse() {
    this.setState(state => ({
      collapsed: !state.collapsed,
    }));
  }

  /**
   * 跳转详情
   * @params
   */
  @Bind()
  onHandleToDetail({ prHeaderId, prSourcePlatform }, flag) {
    let search = null;
    const { dispatch } = this.props;
    if (flag) search = 'flag=update';
    if (prSourcePlatform !== 'ERP') {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/purchase-requisition-cancel/detail-non-erp/${prHeaderId}`,
          search,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/sprm/purchase-requisition-cancel/detail-erp/${prHeaderId}`,
          search,
        })
      );
    }
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
    }
  }

  @Bind()
  handleOpenPromptModal(promptModalFlag) {
    this.setState({ promptModalFlag, promptModalVisible: true });
  }

  @Bind()
  promptModalHandleCancel() {
    this.setState({ promptModalVisible: false });
  }

  render() {
    const {
      currentRecord,
      tabKey,
      selectedRows,
      operationRecordPagination,
      operationRecordList,
      operationRecordModalVisible,
      updateRecordPagination = {},
      updateRecordModalVisible = false,
      updateRecordList = [],
      promptModalVisible = false,
      promptModalFlag = '',
      isNewTeant = false,
      srmChangeFlag,
      erpChangeFlag,
      doubleUintFlag = 0,
    } = this.state;
    const {
      purchaseRequisitionCancel: {
        statusList,
        sourceList,
        abcList,
        tableData,
        pagination,
        dataSource,
        singlePagination,
        lastActiveTabKey,
      },
      searchListLoading,
      cancelLoading,
      fetchPurchaseLinesCloseLoading,
      searchSingleLoading,
      fetchOperationRecordListLoading,
      fetchUpdateRecordListLoading,
      customizeTable,
      form,
      customizeFilterForm,
    } = this.props;
    const searchProps = {
      onSearch: this.handleSearch,
      statusList,
      sourceList,
      abcList,
      pagination,
      customizeFilterForm,
      onRef: this.handleRefBind,
    };
    const formSearchProps = {
      statusList,
      sourceList,
      abcList,
      pagination: singlePagination,
      customizeFilterForm,
      onSearch: this.singleCancelSearch,
      onRef: node => {
        this.formSearch = node.props.form;
      },
    };
    const operationRecordProps = {
      record: currentRecord,
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.handleOperationRecordSearch,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
      filterCondition: ['displayLineNum'],
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
          render: (text, record) => {
            const { processTypeCode, multiExecutorName } = record;
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
    const updateRecordProps = {
      title: intl.get(`spfm.configServer.model.order.recordFlag`).d('变更记录'),
      pagination: updateRecordPagination,
      dataSource: updateRecordList,
      visible: updateRecordModalVisible,
      loading: fetchUpdateRecordListLoading,
      record: currentRecord,
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
    const listProps = {
      isNewTeant,
      onHide: this.openOperationRecord,
      onHandleToDetail: this.onHandleToDetail,
      tableData,
      pagination,
      rowSelection: {
        selectedRowKeys: selectedRows?.map(n => n.prLineId),
        onChange: this.onSelectChange,
      },
      doubleUintFlag,
      loading: searchListLoading,
      onChange: this.handleSearch,
      customizeTable,
    };
    const formListProps = {
      isNewTeant,
      srmChangeFlag,
      erpChangeFlag,
      dataSource,
      pagination: singlePagination,
      rowSelection: {
        selectedRowKeys: selectedRows?.map(n => n.prHeaderId),
        onChange: this.singleCancelSearch,
      },
      customizeTable,
      loading: searchSingleLoading,
      onChange: this.singleCancelSearch,
      onHide: (record, flag) => this.openOperationRecord(record, flag),
      onHandleToDetail: this.onHandleToDetail,
    };
    const promptModalProps = {
      visible: promptModalVisible,
      form,
      params: { prLineIds: selectedRows?.map(n => n.prLineId) },
      flag: promptModalFlag,
      promptTitle:
        promptModalFlag === 'cancelledRemark'
          ? intl.get(`${messagePrompt}.cancelReason`).d('取消原因')
          : intl.get(`${messagePrompt}.closeReason`).d('关闭原因'),
      handleOk: this.promptModalHandleOk,
      handleCancel: this.promptModalHandleCancel,
    };

    const cancelFlag = selectedRows?.every(e => e.prLineCancelledFlag === 1);
    const closeFlag = selectedRows?.every(e => e.prLineClosedFlag === 1);

    return (
      <Fragment>
        {/* 多语言改动 */}
        <Header title={intl.get(`${titlePrompt}.requisitionControl`).d('需求控制')}>
          {lastActiveTabKey === 'lineCancel' && (
            <>
              <Button
                type="primary"
                icon="rollback"
                onClick={() => this.handleOpenPromptModal('cancelledRemark')}
                loading={cancelLoading}
                disabled={
                  !selectedRows.length || tabKey === 'singleCancel' || (isNewTeant && !cancelFlag)
                }
              >
                {intl.get(`sprm.purchasePlatform.view.button.cancel`).d('取消')}
              </Button>
              {isNewTeant && (
                <Button
                  icon="close"
                  onClick={() => this.handleOpenPromptModal('closedRemark')}
                  loading={fetchPurchaseLinesCloseLoading}
                  disabled={!selectedRows.length || !closeFlag}
                >
                  {intl.get(`sprm.purchasePlatform.view.button.close`).d('关闭')}
                </Button>
              )}
            </>
          )}
        </Header>
        <Content>
          <Spin spinning={cancelLoading || false}>
            <Tabs activeKey={lastActiveTabKey} onChange={this.tabChange} animated={false}>
              <TabPane
                tab={intl.get(`${messagePrompt}.lineSearch`).d('按行查询')}
                key="lineCancel"
                forceRender
              >
                <Search {...searchProps} />
                <List {...listProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`${messagePrompt}.singleSearch`).d('整单查询')}
                key="singleCancel"
                forceRender
              >
                <FormSearch {...formSearchProps} />
                <FormList {...formListProps} />
              </TabPane>
            </Tabs>
          </Spin>
          <OperationRecord {...operationRecordProps} />
          <OperationRecord {...updateRecordProps} />
          {promptModalVisible && <PromptModal {...promptModalProps} />}
        </Content>
      </Fragment>
    );
  }
}
