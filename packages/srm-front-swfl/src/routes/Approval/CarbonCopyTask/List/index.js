/* eslint-disable camelcase */
/**
 * List - 抄送流程
 * @date: 2018-8-14
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import { DataSet } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
// import { routerRedux } from 'dva/router';
import queryString from 'querystring';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined, isNil, omit, isFunction, isArray } from 'lodash';
import moment from 'moment';

import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';

import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getCurrentUserId,
  getResponse,
} from 'utils/utils';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';

import { listTableDS } from '@/stores/carbonCopyTaskDS';
import { queryPreviousInfo } from '@/services/taskService';

import AsyncTree from '@/components/CategoryTree';
import MoveWidthUnit from '@/components/MoveWidthUnit/index.tsx';
import { UpdateModalClass } from '@/components/UpdateModal/Provider';
import { APPROVAL_LIST_CC_TASK_LEFT_TREE_FLOD } from '@/utils/constant';
import ListTable from './ListTable';
import FooterButtons from './FooterButtons';
import styles from './index.less';

/**
 * 抄送流程组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} carbonCopyTask - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ carbonCopyTask, loading }) => ({
  carbonCopyTask,
  fetchList: loading.effects['carbonCopyTask/fetchTaskList'],
  tenantId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
@withProps(({ remote }) => {
  const dsProps = listTableDS();
  const remoteDsProps = remote
    ? remote.process('SWFL_APPROVAL_WORKBENCH_CARBON_COPY_LIST_TABLE', dsProps, {})
    : dsProps;
  const tableDs = new DataSet(remoteDsProps);
  return { tableDs };
}, {})
@formatterCollections({
  code: [
    'hwfp.task',
    'hwfp.involvedTask',
    'hwfp.carbonCopyTask',
    'hwfp.common',
    'hpfm.organization',
  ],
})
export default class List extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.treeRef = null;
    this.listTableRef = null;
    const value = parseInt(
      localStorage.getItem(
        `tree.customized.APPROVAL_CARBONCOPY_LEFT_LIST.${props.tenantId}.${props.userId}`
      ),
      10
    );
    const defaultTreeFold = localStorage.getItem(APPROVAL_LIST_CC_TASK_LEFT_TREE_FLOD) !== 'false';
    this.state = {
      treeFoldFlag: defaultTreeFold, // 左侧树折叠标识
      documentId: null, // 树目录父节点标识
      categoryId: null, // 树目录子节点标识
      dragModalWidth: false,
      modalWidth: !defaultTreeFold ? 0 : value || 188,
      oldModalWidth: value || 188,
      rightFlag: false,
    };
  }

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.props.tableDs.addEventListener('load', this.handleBeforeLoad);
    this.props.tableDs.addEventListener('select', this.handleSelect);
    this.props.tableDs.addEventListener('unSelect', this.handleSelect);
    this.props.tableDs.addEventListener('selectAll', this.handleSelect);
    this.props.tableDs.addEventListener('unSelectAll', this.handleSelect);
    this.initQuery();
    this.props.dispatch({ type: 'carbonCopyTask/queryProcessStatus' });
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

  handleBeforeLoad = ({ dataSet }) => {
    this.handleQueryPreviousInfo(dataSet.records);
  };

  handleQueryPreviousInfo = (records) => {
    const { custConfig } = this.props;
    if (custConfig && custConfig['HWFP.APPROVAL_TABLE_UNIT_GROUP.CARBON']) {
      const customizeUnitConfig = custConfig['HWFP.APPROVAL_TABLE_UNIT_GROUP.CARBON'];
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
            new Set(records.map((record) => record.get('procInstId')).filter(Boolean))
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
                  const processInstanceId = record.get('procInstId');
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

  initQuery = () => {
    this.changeSetDefaultFilter(this.props);
  };

  @Bind()
  handleSelect({ dataSet }) {
    // 导出按钮显示用
    if (isFunction(this.props.changeExportSelectFlag)) {
      this.props.changeExportSelectFlag(dataSet.selected.length !== 0);
    }
  }

  changeSetDefaultFilter = (currentProps = {}) => {
    const { urlActiveKey = '', defaultDocumentId = '', processModelId = '' } = currentProps;
    if (
      this.treeRef &&
      isFunction(this.treeRef.defaultSelectArr) &&
      defaultDocumentId &&
      urlActiveKey === 'carbonCopy'
    ) {
      this.treeRef.defaultSelectArr(defaultDocumentId, processModelId);
    }
    const {
      location: { state: { _back } = {} },
      tableDs,
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : tableDs.currentPage;
    if (!defaultDocumentId || urlActiveKey !== 'carbonCopy') {
      const timer = setInterval(() => {
        if (tableDs.getState('queryState') === 'ready') {
          clearInterval(timer);
          tableDs.setState('queryState', undefined);
          this.handleSearch({ carbonCopy: true, page });
        }
      }, 200);
    }
  };

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { documentId, categoryId, processModelId } = this.state;
    const { tenantId, tableDs } = this.props;
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
    const { startTime__range, ...others } = omit(filterValues, [
      'startedUserLov',
      'documentLov',
      'processSearch',
      '__dirty',
      'sortCode',
      'sortType',
      'startUserLovMeaning',
    ]);
    const [startedAfter, startedBefore] = (startTime__range || '').split(',');
    const queryParams = {
      tenantId,
      startedAfter: startedAfter ? moment(startedAfter).format(DATETIME_MIN) : null,
      startedBefore: startedBefore ? moment(startedBefore).format(DATETIME_MAX) : null,
      carbonCopy: true,
      page: isEmpty(fields) ? {} : fields,
      ...others,
      ...fields,
      documentId,
      categoryId,
      processModelId,
    };
    if (filterValues.customizeOrderField) {
      filterValues.customizeOrderField.split(',').forEach((orderField) => {
        const [sortCode, sortType] = orderField.split(':');
        if (sortCode === 'startTime_') {
          queryParams.processStartTimeSort = sortType.toUpperCase();
        } else if (sortCode === 'endTime') {
          queryParams.processEndTimeSort = sortType.toUpperCase();
        }
      });
    }
    this.props.tableDs.setQueryParameter('queryParams', queryParams);
    this.props.tableDs.query().then(() => {
      this.props.tableDs.current = undefined;
    });
  }

  @Bind()
  setUnfoldStyle() {
    const treeClientHeight = document.getElementById('ccAsyncTree')?.clientHeight;
    const treeScrollHeight = document.getElementById('ccAsyncTree')?.scrollHeight;
    const newFlag = treeClientHeight && treeScrollHeight && treeClientHeight < treeScrollHeight;
    const { rightFlag } = this.state;
    if (rightFlag === newFlag) {
      return;
    }
    this.setState({
      rightFlag: newFlag,
    });
  }

  /* 树展开收起 */
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
    localStorage.setItem(APPROVAL_LIST_CC_TASK_LEFT_TREE_FLOD, `${!treeFoldFlag}`);
    this.setState({ treeFoldFlag: !treeFoldFlag });
  }

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

  handleChangeModalWidth = (width) => {
    const { dragModalWidth } = this.state;
    const { tenantId, userId } = this.props;
    if (!dragModalWidth) {
      this.setState({ dragModalWidth: true });
    }
    const maxWidth = (document.body.clientWidth / 5) * 2 || 600;
    const widthValue = width > maxWidth ? maxWidth : width;
    localStorage.setItem(
      `tree.customized.APPROVAL_CARBONCOPY_LEFT_LIST.${tenantId}.${userId}`,
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

  // 筛选框刷新时刷新左侧树
  @Bind()
  handleSearchAll() {
    this.handleSearch();
    this.refreshNumber();
  }

  // 绑定左侧菜单组件
  onTreeRef = (ref) => {
    this.treeRef = ref;
  };

  refreshNumber = () => {
    if (!this.state.treeFoldFlag) {
      return;
    }
    // 刷新左侧菜单组件上的流程数量
    if (isFunction(this.treeRef.queryTree)) {
      this.treeRef.queryTree();
    }
  };

  onTreeNodeSelect = (param) => {
    const { listTableRef } = this;
    this.props.handleTreeNodeSelect({
      ...param,
      searchBarRef: listTableRef.searchBarRef,
      tableRef: listTableRef,
    });
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const { treeFoldFlag, modalWidth } = this.state;
    const {
      fetchList,
      carbonCopyTask: { list, pagination, processStatus = [] },
      tableDs,
      match,
      containerRef,
      urlActiveKey = '',
      defaultDocumentId = '',
      processModelId = '',
      customizeTable,
      document,
    } = this.props;
    const listProps = {
      pagination,
      processStatus,
      dataSource: list,
      loading: fetchList,
      match,
      onChange: this.handleSearch,
      onSearch: this.handleSearchAll,
    };
    return (
      <div className={classnames(styles.content, 'swfl-approval-workbench-cc-task')}>
        <div className={styles['content-container']}>
          <div className={styles['content-container-left']} style={{ width: modalWidth }}>
            <div id="ccAsyncTree" style={{ height: '100%', overflow: 'auto' }}>
              <AsyncTree
                onTreeRef={this.onTreeRef}
                onSearch={this.setTreeId}
                handleCloseModal={this.handleCloseModal}
                type="carbonCopy"
                onUnfoldStyle={this.setUnfoldStyle}
                defaultDocumentId={urlActiveKey === 'carbonCopy' ? defaultDocumentId : ''}
                processModelId={urlActiveKey === 'carbonCopy' ? processModelId : ''}
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
            style={{ width: `calc(100% - ${modalWidth}px)` }}
            className={classnames({
              [styles['content-container-right']]: true,
              [styles['content-container-right-unFold']]: !treeFoldFlag,
              [styles['content-container-right-fold']]: treeFoldFlag,
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
                customizeTable={customizeTable}
                {...listProps}
              />
            </UpdateModalClass>
            <FooterButtons
              onRef={(ref) => {
                this.footerRef = ref;
              }}
              tableDs={tableDs}
            />
          </div>
        </div>
      </div>
    );
  }
}
