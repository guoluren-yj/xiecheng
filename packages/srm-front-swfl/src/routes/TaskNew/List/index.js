/* eslint-disable no-param-reassign */
/**
 *  待办事项列表
 */

import React, { Fragment, Component } from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import { DataSet } from 'choerodon-ui/pro';
import { Tree, Icon } from 'choerodon-ui';

import { Bind } from 'lodash-decorators';
import { isEmpty, isNil, omit, isObject } from 'lodash';
import moment from 'moment';
import queryString from 'querystring';

import { Header } from 'components/Page';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import withProps from 'utils/withProps';
import { toJS } from 'mobx';

import { fetchTaskCategoryList, batchApproveTasks } from '@/services/taskService';
import { listFormDS, listTableDS, listOperatorDS } from '@/stores/oldTaskDS';

import styles from './index.less';
import CategoryTree from './CategoryTree';
import ListTable from './ListTable';
import FilterForm from './FilterForm';
import FooterButtons from './FooterButtons';

const tenantId = getCurrentOrganizationId();

@formatterCollections({ code: ['hwfp.task', 'hwfp.common', 'hpfm.organization'] })
@withProps(
  () => {
    const formDs = new DataSet(listFormDS());
    const tableDs = new DataSet(listTableDS());
    const operatorDs = new DataSet(listOperatorDS());
    return { formDs, tableDs, operatorDs };
  },
  { cacheState: true, keepOriginDataSet: true }
)
@connect(({ task }) => ({
  newTask: task,
}))
export default class Task extends Component {
  constructor(props) {
    super(props);
    this.filterFormRef = null;
    this.listTableRef = null;
    this.footerRef = null;
    this.state = {
      queryParameter: {},
      treeData: [],
      treeFoldFlag: true, // 左侧树折叠标识
      filterFlag: false,
    };
  }

  componentDidMount() {
    const {
      newTask: { queryParameter = {} },
    } = this.props;
    this.handleSearch(queryParameter);
    this.props.tableDs.addEventListener('load', this.handleBeforeLoad);
    this.props.tableDs.addEventListener('select', this.handleSelect);
    this.props.tableDs.addEventListener('unSelect', this.handleSelect);
    this.props.tableDs.addEventListener('selectAll', this.handleSelect);
    this.props.tableDs.addEventListener('unSelectAll', this.handleSelect);
  }

  componentWillReceiveProps = () => {
    if (window.location.search.indexOf('from=TaskNew') !== -1) {
      window.history.pushState(null, null, window.location.pathname);
      this.handleRefresh();
    }
  };

  @Bind()
  handleBeforeLoad({ dataSet }) {
    dataSet.forEach((record) => {
      record.selectable = record.get('batchFlag') === 1;
    });
  }

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
    // 查询时页脚批量选择状态改变，下拉值重置为审批通过
    this.props.operatorDs.current.set('batchOperation', 'Approved');
    params = this.handleSaveQueryParameter(params);
    const {
      location: { search = '' },
    } = this.props;
    let urlParmas = {};
    if (search) {
      const { documentId, documentCode } = queryString.parse(search.substr(1));
      urlParmas = filterNullValueObject({ documentId, documentCode });
    }
    const filterValues = isNil(this.props.formDs.current)
      ? {}
      : filterNullValueObject(this.props.formDs.current.toData());
    const { startedTime = {}, priority, ...others } = omit(filterValues, [
      'startedUserLov',
      '__dirty',
    ]);
    const { startedBefore, startedAfter } = startedTime;
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
    this.props.tableDs.setQueryParameter('queryParams', {
      tenantId,
      startedBefore: startedBefore ? moment(startedBefore).format(DATETIME_MAX) : null,
      startedAfter: startedAfter ? moment(startedAfter).format(DATETIME_MIN) : null,
      minimumPriority,
      maximumPriority,
      //  page: isEmpty(fields) ? {} : fields,
      ...others,
      ...urlParmas,
      ...params,
    });
    this.loadTaskCategoryTree();
    this.props.tableDs.query();
    this.footerRef.setState({
      opeartionFlag: false,
    });
    this.listTableRef.setState({
      selectionMode: 'none',
    });
    // 重置
    this.resetBatchOperation();
  }

  @Bind()
  loadTaskCategoryTree() {
    fetchTaskCategoryList().then((res) => {
      const result = getResponse(res);
      if (res && res.length) {
        this.setState({
          treeData: result,
        });
      } else if (res && res.length === 0) {
        this.setState({
          treeData: [],
        });
      }
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
    this.listTableRef.handleSelectionMode();
  }

  @Bind()
  resetBatchOperation() {
    if (this.props.operatorDs.current) {
      this.props.operatorDs.current.set('checkedAll', false);
    }
    this.props.tableDs.unSelectAll();
  }

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
      const assigneeValue =
        operatorDs.current.get('batchOperation') === 'delegate' &&
        toJS(operatorDs.current.get('batchDelegate')) &&
        toJS(operatorDs.current.get('batchDelegate')).length > 0
          ? toJS(operatorDs.current.get('batchDelegate'))[0].data.employeeNum
          : '';
      const dataSource = selectedRows.map((item) => ({
        action: operatorDs.current.get('batchOperation') === 'delegate' ? 'delegate' : 'complete',
        assignee: assigneeValue,
        currentTaskId: item.get('id'),
        // formKey: item.get('formKey'),
        batchFlag: item.get('batchFlag'),
        comment,
        processName: item.get('processName'),
        processInstanceId: item.get('encryptProcInstId'),
        processDefinitionId: item.get('processDefinitionId'),
        variables: [
          { name: 'approveResult', value: operatorDs.current.get('batchOperation') },
          { name: 'comment', value: comment },
        ],
      }));
      // 异步处理
      // 暂时改为调用后刷新页面
      batchApproveTasks(dataSource).then((res) => {
        if (getResponse(res)) {
          this.handleRefresh();
        }
      });
    }
  }

  @Bind()
  handleSaveQueryParameter(newQueryParameter) {
    const { queryParameter: originQueryParameter } = this.state;
    const { dispatch } = this.props;
    const queryParameter = isEmpty(newQueryParameter)
      ? {}
      : {
          ...originQueryParameter,
          ...newQueryParameter,
        };
    this.setState({
      queryParameter,
    });
    dispatch({
      type: 'task/updateState',
      payload: {
        queryParameter,
      },
    });
    return queryParameter;
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
  }

  @Bind()
  handleFoldTree() {
    this.setState({ treeFoldFlag: !this.state.treeFoldFlag });
  }

  @Bind()
  handleFilterFlag(value) {
    this.setState({ filterFlag: value });
  }

  render() {
    const { treeFoldFlag, treeData = [], queryParameter = {}, filterFlag } = this.state;
    const { formDs, operatorDs, tableDs, match } = this.props;
    return (
      <Fragment>
        <Header title={intl.get('hwfp.task.view.message.title.task').d('我的待办事项')} />
        <div className={styles.content}>
          <div className={styles['content-container']}>
            {!treeFoldFlag ? (
              <div className={styles['content-container-left-fold']}>
                <div />
                <div>
                  <Icon type="format_indent_increase" onClick={this.handleFoldTree} />
                </div>
              </div>
            ) : (
              <div className={styles['content-container-left']}>
                <div className={styles['content-container-left-unFold']}>
                  <Icon type="format_indent_decrease" onClick={this.handleFoldTree} />
                </div>
                <header className={styles['left-tree-title']}>
                  {intl.get('hwfp.task.view.message.title.taskCategoy').d('待办事项分类')}
                </header>
                {treeData.length < 1 ? (
                  <Tree
                    defaultExpandAll
                    showIcon
                    className={styles['left-tree']}
                    onSelect={this.handleSearch}
                  >
                    <Tree.TreeNode
                      key="all"
                      title={intl.get('hzero.common.status.all').d('全部')}
                      icon={<Icon type="format_list_numbered" />}
                    />
                  </Tree>
                ) : (
                  <CategoryTree
                    treeData={treeData}
                    onSearch={this.handleSearch}
                    queryParameter={queryParameter}
                  />
                )}
              </div>
            )}
            <div
              ref={(ref) => {
                this.rightRef = ref;
              }}
              className={classnames({
                [styles['content-container-right']]: true,
                [styles['content-container-right-unFold']]: !treeFoldFlag,
                [styles['content-container-right-fold']]: treeFoldFlag,
              })}
            >
              <FilterForm
                onRef={(ref) => {
                  this.filterFormRef = ref;
                }}
                onFilterFlag={this.handleFilterFlag}
                formDs={formDs}
                onSearch={this.handleSearch}
              />
              <ListTable
                onRef={(ref) => {
                  this.listTableRef = ref;
                }}
                tableDs={tableDs}
                filterFlag={filterFlag}
              />
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
              />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}
