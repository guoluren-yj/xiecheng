/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/**
 *  待办事项列表
 */

import React, { Fragment, Component } from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import { DataSet } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import queryString from 'querystring';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, isUndefined, isNil, omit, isFunction, isObject, isArray } from 'lodash';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getResponse,
  getCurrentUserId,
} from 'utils/utils';
import notification from 'utils/notification';
import withProps from 'utils/withProps';
import { toJS } from 'mobx';

import { batchApproveTasks, queryPreviousInfo } from '@/services/taskService';
import { queryQuickReply } from '@/services/quickReply';
import { listTableDS, listOperatorDS } from '@/stores/taskDS';
import AsyncTree from '@/components/CategoryTree';
import MoveWidthUnit from '@/components/MoveWidthUnit/index.tsx';
import { UpdateModalClass } from '@/components/UpdateModal/Provider';
import { APPROVAL_LIST_TASK_LEFT_TREE_FLOD } from '@/utils/constant';
import ListTable from './ListTable';
import FooterButtons from './FooterButtons';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();
const userId = getCurrentUserId();

@formatterCollections({
  code: ['hwfp.task', 'hwfp.common', 'hpfm.organization', 'hwfp.processDefine'],
})
@withProps(
  ({ remote }) => {
    const dsProps = {
      modifiedCheck: false,
      ...listTableDS(),
    };
    const remoteDsProps = remote
      ? remote.process('SWFL_APPROVAL_WORKBENCH_TASK_LIST_TABLE', dsProps, {})
      : dsProps;
    const tableDs = new DataSet(remoteDsProps);
    const operatorDs = new DataSet(listOperatorDS());
    return { tableDs, operatorDs };
  },
  {}
  // { cacheState: true, keepOriginDataSet: true }
)
@connect(({ task }) => ({
  newTask: task,
}))
export default class Task extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.treeRef = null;
    this.filterFormRef = null;
    this.listTableRef = null;
    this.footerRef = null;
    const value = parseInt(
      localStorage.getItem(`tree.customized.APPROVAL_TASK_LEFT_LIST.${tenantId}.${userId}`),
      10
    );
    const defaultTreeFold = localStorage.getItem(APPROVAL_LIST_TASK_LEFT_TREE_FLOD) !== 'false';
    this.state = {
      treeFoldFlag: defaultTreeFold, // 左侧树折叠标识
      documentId: null, // 树目录父节点标识
      categoryId: null, // 树目录子节点标识
      openQuickReply: false,
      allScreen: false,
      openTag: true,
      dragModalWidth: false,
      modalWidth: !defaultTreeFold ? 0 : value || 188,
      oldModalWidth: value || 188,
      rightFlag: false,
      expandRootFlag:
        localStorage.getItem('tree.customized.APPROVAL_TASK_LEFT_LIST_EXPAND_TREE_ROOT') !==
        'false',
    };
  }

  componentDidMount() {
    this.props.tableDs.addEventListener('load', this.handleBeforeLoad);
    this.props.tableDs.addEventListener('select', this.handleSelect);
    this.props.tableDs.addEventListener('unSelect', this.handleSelect);
    this.props.tableDs.addEventListener('selectAll', this.handleSelect);
    this.props.tableDs.addEventListener('unSelectAll', this.handleSelect);
    this.queryQuickReplyArr();
    this.initQuery();
  }

  componentWillUnmount() {
    this.props.tableDs.removeEventListener('load', this.handleBeforeLoad);
    this.props.tableDs.removeEventListener('select', this.handleSelect);
    this.props.tableDs.removeEventListener('unSelect', this.handleSelect);
    this.props.tableDs.removeEventListener('selectAll', this.handleSelect);
    this.props.tableDs.removeEventListener('unSelectAll', this.handleSelect);
  }

  componentWillReceiveProps = (nextProps) => {
    const {
      location: { search = '' },
    } = this.props;
    const {
      location: { search: nextSearch = '' },
    } = nextProps;
    if (nextSearch) {
      const { uselessParam = '' } = queryString.parse(search.substr(1));
      const { uselessParam: nextUselessParam = '' } = queryString.parse(nextSearch.substr(1));
      // 再次跳转时进行判断，是否set新的筛选数据
      if (uselessParam !== nextUselessParam) {
        this.changeSetDefaultFilter(nextProps);
      }
    }
  };

  initQuery = () => {
    this.changeSetDefaultFilter(this.props);
  };

  changeSetDefaultFilter = (currentProps = {}) => {
    const { urlActiveKey = '', defaultDocumentId = '', processModelId = '' } = currentProps;
    if (
      this.treeRef &&
      isFunction(this.treeRef.defaultSelectArr) &&
      defaultDocumentId &&
      urlActiveKey === 'task'
    ) {
      this.treeRef.defaultSelectArr(defaultDocumentId, processModelId);
    }

    const {
      location: { state: { _back } = {} },
      tableDs,
    } = this.props;

    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : tableDs.currentPage;
    if (!defaultDocumentId || urlActiveKey !== 'task') {
      const timer = setInterval(() => {
        if (tableDs.getState('queryState') === 'ready') {
          clearInterval(timer);
          tableDs.setState('queryState', undefined);
          this.handleSearch(page);
        }
      }, 200);
    }
  };

  // 查询快捷回复
  queryQuickReplyArr = () => {
    const { dispatch } = this.props;
    queryQuickReply().then((res) => {
      const result = getResponse(res);
      if (result) {
        dispatch({
          type: 'task/updateQuickReplyArr',
          payload: result,
        });
      }
    });
  };

  handleBeforeLoad = ({ dataSet }) => {
    dataSet.forEach((record) => {
      record.selectable = record.get('batchFlag') === 1;
    });
    this.handleQueryPreviousInfo(dataSet.records);
  };

  @Bind()
  handleSelect({ dataSet }) {
    // 当前页已选
    const currentSelectedSize = dataSet.selected.length;
    // 当前页可选
    const currentSelectableSize = (dataSet.filter((record) => record.selectable) || []).length;
    // 当前页全部选中
    this.props.operatorDs.current.set(
      'checkedAll',
      currentSelectableSize > 0 && currentSelectedSize === currentSelectableSize
    );
    if (dataSet.selected.length === 0) {
      this.props.operatorDs.current.reset();
    }
    // 导出按钮显示用
    if (isFunction(this.props.changeExportSelectFlag)) {
      this.props.changeExportSelectFlag(dataSet.selected.length !== 0);
    }
    this.footerRef.setState({
      checked: !isEmpty(dataSet.selected),
      checkedSize: dataSet.selected.length,
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(params = {}) {
    const { documentId, categoryId, processModelId } = this.state;
    const { tableDs } = this.props;
    const filterValues =
      !tableDs.queryDataSet || isNil(tableDs.queryDataSet.current)
        ? {}
        : filterNullValueObject(tableDs.queryDataSet.current.toData());
    if ('processSearch' in filterValues) {
      if (filterValues.processSearch.length === 1) {
        filterValues.processDescriptionLike = String(filterValues.processSearch);
        filterValues.processDefinitionNameLike = String(filterValues.processSearch);
        filterValues.processInstanceId = String(filterValues.processSearch);
      } else {
        filterValues.processDescriptionLike = null;
        filterValues.processDefinitionNameLike = null;
        filterValues.processInstanceId = null;
        filterValues.queryConditionList = filterValues.processSearch;
      }
    }
    // 排除'starteduserlov'和'_dirty'属性
    const { startTime__range, createdTime_range, priority, ...others } = omit(filterValues, [
      'processSearch',
      '__dirty',
    ]);
    const [startedAfter, startedBefore] = (startTime__range || '').split(',');
    const [createdAfter, createdBefore] = (createdTime_range || '').split(',');
    let minimumPriority = null;
    let maximumPriority = null;
    if (priority === 'low') {
      minimumPriority = 0;
      maximumPriority = 33;
    } else if (priority === 'medium') {
      minimumPriority = 34;
      maximumPriority = 66;
    } else if (priority === 'height') {
      minimumPriority = 67;
      maximumPriority = 100;
    }
    const queryParams = {
      tenantId,
      startedBefore: startedBefore ? moment(startedBefore).format(DEFAULT_DATETIME_FORMAT) : null,
      startedAfter: startedAfter ? moment(startedAfter).format(DEFAULT_DATETIME_FORMAT) : null,
      createdBefore: createdBefore ? moment(createdBefore).format(DEFAULT_DATETIME_FORMAT) : null,
      createdAfter: createdAfter ? moment(createdAfter).format(DEFAULT_DATETIME_FORMAT) : null,
      minimumPriority,
      maximumPriority,
      //  page: isEmpty(fields) ? {} : fields,
      ...others,
      // ...urlParmas,
      ...params,
      documentId,
      categoryId,
      processModelId,
    };
    if (filterValues.customizeOrderField) {
      filterValues.customizeOrderField.split(',').forEach((orderField) => {
        const [sortCode, sortType] = orderField.split(':');
        if (sortCode === 'startTime_') {
          queryParams.processStartDateSort = sortType.toUpperCase();
        } else if (sortCode === 'createdTime') {
          queryParams.durationTimeSort = sortType.toUpperCase();
        }
      });
    }
    tableDs.setQueryParameter('queryParams', queryParams);
    tableDs.query().then(() => {
      tableDs.current = undefined;
    });
    this.footerRef.setState({
      opeartionFlag: false,
    });
    this.listTableRef.setState({
      selectionMode: 'none',
    });
    // 重置
    this.resetBatchOperation();
  }

  handleQueryPreviousInfo = (records) => {
    const { custConfig } = this.props;
    if (custConfig && custConfig['HWFP.APPROVAL_TABLE_UNIT_GROUP.NOT_APPROVED']) {
      const customizeUnitConfig = custConfig['HWFP.APPROVAL_TABLE_UNIT_GROUP.NOT_APPROVED'];
      const { fields } = customizeUnitConfig;
      const preStageField = fields ? fields.find((i) => i.fieldCode === 'preStage') : undefined;
      // 若上一节点字段显示属性配置成否，则不需要查
      if (
        preStageField &&
        (preStageField.visible !== 0 ||
          (preStageField.conditionHeaderDTOs &&
            preStageField.conditionHeaderDTOs.some((item) => item.conType === 'visible')))
      ) {
        if (records && records.length) {
          const processInstanceIds = Array.from(
            new Set(records.map((record) => record.get('processInstanceId')).filter(Boolean))
          );
          if (processInstanceIds.length) {
            queryPreviousInfo(processInstanceIds).then((res) => {
              if (getResponse(res) && res && isArray(res) && res.length) {
                const previousNodeMap = {};
                res.forEach((node) => {
                  if (node.procInstId) {
                    previousNodeMap[node.procInstId] = node;
                  }
                });
                records.forEach((record) => {
                  const processInstanceId = record.get('processInstanceId');
                  if (processInstanceId && previousNodeMap[processInstanceId]) {
                    const { previousNodeName, previousApprover, previousComment } = previousNodeMap[
                      processInstanceId
                    ];
                    record.init('previousNodeName', previousNodeName);
                    record.init('previousApprover', previousApprover);
                    record.init('previousComment', previousComment);
                  }
                });
              }
            });
          }
        }
      }
    }
  };

  @Bind()
  setUnfoldStyle() {
    const treeClientHeight = document.getElementById('taskAsyncTree')?.clientHeight;
    const treeScrollHeight = document.getElementById('taskAsyncTree')?.scrollHeight;
    const newFlag = treeClientHeight && treeScrollHeight && treeClientHeight < treeScrollHeight;
    const { rightFlag } = this.state;
    if (rightFlag === newFlag) {
      return;
    }
    this.setState({
      rightFlag: newFlag,
    });
  }

  @Bind()
  handleCheckedAll(flag) {
    if (flag) {
      this.props.tableDs.selectAll();
    } else {
      this.props.tableDs.unSelectAll();
    }
  }

  @Bind()
  handleBatchOperation() {
    this.props.tableDs.unSelectAll();
    // this.listTableRef.handleSelectionMode();
  }

  @Bind()
  resetBatchOperation() {
    if (this.props.operatorDs.current) {
      this.props.operatorDs.current.set('checkedAll', false);
    }
    this.props.tableDs.unSelectAll();
  }

  @Debounce(200)
  @Bind()
  handleSubmit() {
    const { tableDs, operatorDs } = this.props;
    const selectedRows = tableDs.selected;
    if (isEmpty(selectedRows)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return null;
    } else {
      let comment = operatorDs.current.get('approvalOpinion');
      if (!comment) {
        const value = intl
          .get('hwfp.task.view.option.approved', { name: '审批通过' })
          .d('审批通过');
        if (isObject(value)) {
          comment = value.msg;
        } else {
          comment = value;
        }
      }
      const action = operatorDs.current.get('batchOperation');
      const lovValueField = operatorDs
        .getField('batchSelected')
        .get('valueField', operatorDs.current);
      const batchSelected = toJS(operatorDs.current.get('batchSelected'));
      const assigneeValue = {};
      if (action === 'delegate') {
        assigneeValue.assignee = batchSelected.length > 0 ? batchSelected[0][lovValueField] : null;
      } else if (['addsign', 'approveandaddsign'].includes(action)) {
        assigneeValue.assignList =
          batchSelected.length > 0 ? batchSelected.map((record) => record[lovValueField]) : null;
      }
      const actionType = {
        approved: 'complete',
        rejected: 'complete',
        delegate: 'delegate',
        addsign: 'AddSign',
        approveandaddsign: 'ApproveAndAddSign',
      };
      const approveResult = {
        approved: 'Approved',
        rejected: 'Rejected',
        delegate: 'Delegate',
        addsign: 'Approved',
        approveandaddsign: 'Approved',
      };
      let variables = [];
      if (action !== 'delegate') {
        variables = [
          { name: 'approveResult', value: approveResult[action] || approveResult.approved },
          { name: 'comment', value: comment },
        ];
      }
      const dataSource = selectedRows.map((item) => ({
        action: actionType[action] || 'complete',
        currentTaskId: item.get('id'),
        batchFlag: item.get('batchFlag'),
        comment,
        processName: item.get('processName'),
        processInstanceId: item.get('encryptProcInstId'),
        processDefinitionId: item.get('processDefinitionId'),
        variables,
        ...assigneeValue,
      }));
      // 异步处理
      // 暂时改为调用后刷新页面
      batchApproveTasks(dataSource)
        .then((res) => {
          if (getResponse(res)) {
            this.handleRefresh();
          }
        })
        .finally(() => {
          if (this.props.operatorDs.current) {
            this.props.operatorDs.current.set('batchSelected', undefined);
          }
        });
    }
  }

  @Bind()
  handleRefresh() {
    // 提交后刷新
    const { tableDs } = this.props;
    let params = {};
    if (tableDs.queryParameter && tableDs.queryParameter.queryParams) {
      params = tableDs.queryParameter.queryParams;
    }
    this.handleSearch(params);
    this.refreshNumber();
  }

  // 绑定左侧菜单组件
  onTreeRef = (ref) => {
    this.treeRef = ref;
  };

  // 筛选框刷新时刷新左侧树
  @Bind()
  handleSearchAll() {
    this.handleSearch();
    this.refreshNumber();
  }

  // 给子组件使用
  @Bind()
  refreshNumber() {
    if (!this.state.treeFoldFlag) {
      return;
    }
    // 刷新tab上的流程数量
    if (isFunction(this.props.queryTableNum)) {
      this.props.queryTableNum();
    }
    // this.refreshTreeNumber();
  }

  // 给父亲组件使用
  @Bind()
  refreshTreeNumber() {
    // 刷新左侧菜单组件上的流程数量
    if (isFunction(this.treeRef.queryTree)) {
      this.treeRef.queryTree();
    }
  }

  @Bind()
  handleFoldTree() {
    const { modalWidth, treeFoldFlag, oldModalWidth } = this.state;
    if (treeFoldFlag) {
      // 收起树目录，树宽度置0
      this.setState({ oldModalWidth: modalWidth, modalWidth: 0 });
    } else {
      // 展开树目录，树宽度置为收起前的值
      this.setState({ modalWidth: oldModalWidth });
    }
    localStorage.setItem(APPROVAL_LIST_TASK_LEFT_TREE_FLOD, `${!treeFoldFlag}`);
    this.setState({ treeFoldFlag: !treeFoldFlag });
  }

  updateTreeFoldFlag = () => {
    this.setState({ treeFoldFlag: false });
  };

  // 设置树节点信息
  setTreeId = (params = {}) => {
    if (params && params.documentId) {
      // 选中树节点
      this.setState(
        {
          documentId: params.documentId,
          categoryId: params.categoryId,
          processModelId: params.processModelId,
        },
        () => this.handleSearch()
      );
    } else {
      // 直接选择了全部，没有对应节点标识
      this.setState({ documentId: null, categoryId: null, processModelId: null }, () =>
        this.handleSearch()
      );
    }
  };

  // 根据快捷回复显示，改变表格高度
  handleTableHeight = (openQuickReply, allScreen, openTag) => {
    this.setState({
      openQuickReply,
      allScreen,
      openTag,
    });
  };

  handleChangeModalWidth = (width) => {
    const { dragModalWidth } = this.state;
    if (!dragModalWidth) {
      this.setState({ dragModalWidth: true });
    }
    const maxWidth = (document.body.clientWidth / 5) * 2 || 600;
    const widthValue = width > maxWidth ? maxWidth : width;
    localStorage.setItem(
      `tree.customized.APPROVAL_TASK_LEFT_LIST.${tenantId}.${userId}`,
      widthValue
    );
    this.setState({ modalWidth: widthValue });
  };

  finishChangeModalWidth = () => {
    this.setState({ dragModalWidth: false });
  };

  // 切换tab时关闭详情页
  handleCloseModal = () => {
    if (this.listTableRef && isFunction(this.listTableRef.handleModalClose)) {
      this.listTableRef.handleModalClose();
    }
  };

  handleExpandRoot = (expand) => {
    localStorage.setItem(
      'tree.customized.APPROVAL_TASK_LEFT_LIST_EXPAND_TREE_ROOT',
      expand ? 'true' : 'false'
    );
  };

  onTreeNodeSelect = (param) => {
    const { listTableRef } = this;
    console.log(this.props, 'task');
    this.props.handleTreeNodeSelect({
      ...param,
      searchBarRef: listTableRef.searchBarRef,
      tableRef: listTableRef,
    });
  };

  render() {
    const {
      treeFoldFlag,
      openQuickReply,
      allScreen,
      openTag,
      modalWidth,
      expandRootFlag,
    } = this.state;
    const {
      operatorDs,
      tableDs,
      match,
      newTask: { quickReplyArr = [], processTag = [] },
      containerRef,
      urlActiveKey = '',
      defaultDocumentId = '',
      processModelId = '',
      customizeTable,
      document,
      renderFooterExtraButtons,
    } = this.props;
    const openTagValue = quickReplyArr.length > 0 ? openTag : false;
    return (
      <Fragment>
        <div className={styles.content}>
          <div className={styles['content-container']}>
            <div className={styles['content-container-left']} style={{ width: modalWidth }}>
              <div
                id="taskAsyncTree"
                style={{ height: '100%', overflow: 'auto' }}
                className={styles['task-async-tree']}
              >
                <AsyncTree
                  expandRootFlag={expandRootFlag}
                  onTreeRef={this.onTreeRef}
                  onSearch={this.setTreeId}
                  handleCloseModal={this.handleCloseModal}
                  onUnfoldStyle={this.setUnfoldStyle}
                  defaultDocumentId={urlActiveKey === 'task' ? defaultDocumentId : ''}
                  processModelId={urlActiveKey === 'task' ? processModelId : ''}
                  treeData={document}
                  onTreeNodeSelect={this.onTreeNodeSelect}
                />
              </div>
            </div>
            {treeFoldFlag && (
              <MoveWidthUnit
                onChange={this.handleChangeModalWidth}
                handleWidth={this.finishChangeModalWidth}
              />
            )}
            <div
              ref={(ref) => {
                this.rightRef = ref;
              }}
              style={{ width: `calc(100% - ${modalWidth}px)`, zIndex: 0 }}
              className={classnames({
                [styles['content-container-right']]: true,
                [styles['content-container-right-unFold']]: !treeFoldFlag,
                [styles['content-container-right-fold']]: treeFoldFlag,
                [styles['right-table-allscreen-opentag']]:
                  openQuickReply && allScreen && openTagValue,
                [styles['right-table-allscreen-closetag']]:
                  openQuickReply && allScreen && !openTagValue,
                [styles['right-table-screen-opentag']]:
                  openQuickReply && !allScreen && openTagValue,
                [styles['right-table-screen-closetag']]:
                  openQuickReply && !allScreen && !openTagValue,
              })}
            >
              <div
                className={styles['content-container-left-fold-btn']}
                onClick={this.handleFoldTree}
              >
                <Icon type={treeFoldFlag ? 'baseline-arrow_left' : 'baseline-arrow_right'} />
              </div>
              <UpdateModalClass location={this.props.location} containerRef={containerRef}>
                <ListTable
                  onRef={(ref) => {
                    this.listTableRef = ref;
                  }}
                  tableDs={tableDs}
                  match={this.props.match}
                  refreshNumber={this.refreshNumber}
                  handleNext={this.props.handleNext}
                  customizeTable={customizeTable}
                  processTag={processTag}
                  handleSearchAll={this.handleSearchAll}
                />
              </UpdateModalClass>
              <FooterButtons
                onRef={(ref) => {
                  this.footerRef = ref;
                }}
                match={match}
                tableDs={tableDs}
                operatorDs={operatorDs}
                onCheck={this.handleCheckedAll}
                onBatchOperation={this.handleBatchOperation}
                onSubmit={this.handleSubmit}
                afterSubmit={this.handleRefresh}
                handleTableHeight={this.handleTableHeight}
                renderExtraButtons={renderFooterExtraButtons}
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
