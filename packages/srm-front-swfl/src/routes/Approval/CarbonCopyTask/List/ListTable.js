/* eslint-disable no-param-reassign */
import React, { PureComponent } from 'react';
import { Modal, Button, DataSet } from 'choerodon-ui/pro';
import { Tag, Text, Popover, Icon } from 'choerodon-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isNil } from 'lodash';

import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import ApprovalReply from 'srm-front-boot/lib/components/ApprovalReply';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';

import { processStatusRender, ResignedDisplay } from '@/utils/util';

import Store from '@/components/UpdateModal/Store';
import Detail from '../Detail';
import styles from './index.less';
import { CC_TASK_TAB_DRAWER_ID } from '../../utils';

/**
 * 抄送流程展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */

const tenantId = getCurrentOrganizationId();
@connect(({ carbonCopyTask, loading }) => ({
  carbonCopyTask,
  forecastLoading: loading.effects['carbonCopyTask/fetchForecast'],
}))
@formatterCollections({
  code: [
    'hwfp.involvedTask',
    'hwfp.carbonCopyTask',
    'hwfp.common',
    'entity.position',
    'entity.department',
    'hpfm.organization',
  ],
})
export default class ListTable extends PureComponent {
  static contextType = Store;

  constructor(props) {
    super(props);
    props.onRef(this);
    this.flowChartDrawerRef = null;
    this.state = {
      tableAggregation: true,
    };
  }

  /**
   * 详情
   * @param {object} record - 头数据
   */
  changeDetail(record) {
    openTab({
      title: `${record.processName}`,
      key: `/hwfp/carbon-copy-task/detail/${record.encryptId}`,
      path: `/hwfp/carbon-copy-task/detail/${record.encryptId}`,
      icon: 'edit',
      closable: true,
    });
  }

  @Bind()
  handleComment(processInstanceId) {
    Modal.open({
      title: intl.get('hwfp.task.button.comment').d('评论'),
      footer: null,
      drawer: true,
      bodyStyle: {
        padding: 0,
        background: '#F8F9FB',
      },
      closable: true,
      children: <ApprovalReply processInstanceId={processInstanceId} />,
    });
  }

  // 详情页抽屉
  showDetailModal = (currentRecord) => {
    const record = currentRecord.toData ? currentRecord.toData() : currentRecord;
    const { openModal, handleClose } = this.context;
    const {
      match,
      forecastLoading = false,
      carbonCopyTask: { [record.id]: { uselessParam } = {} },
    } = this.props;
    match.params.id = record.id;
    match.params.processInstanceId = record.encryptId;
    const flowProps = {
      match,
      tenantId,
      uselessParam,
      loading: forecastLoading,
    };
    const {
      businessKey,
      formDefinitionCode,
      formKey,
      moduleForm,
      originFormKey,
      processDefinitionId,
      processDefinitionKey,
    } = record;
    const approveFormParams = {
      businessKey,
      formDefinitionCode,
      formKey,
      moduleForm,
      originFormKey,
      processDefinitionId,
      processDefinitionKey,
    };
    const modalObj = {
      title: record.startUserName
        ? `${record.id}-${record.processName}-${record.startUserName}`
        : `${record.id}-${record.processName}`,
      mask: false,
      distroyOnClose: true,
      drawer: true,
      closable: true,
      closeOnLocationChange: false,
      resizable: true,
      style: {
        minWidth: '50vw',
      },
      customizable: true,
      customizedCode: 'APPROVAL_CARBONCOPY_DETAIL',
      children: (
        <Detail match={match} flowProps={flowProps} approveFormParams={approveFormParams} />
      ),
      footer: () =>
        record.commentReplyFlag === 1 ? (
          <Button
            funcType="raised"
            color="default"
            style={{ margin: '12px 20px' }}
            onClick={() => this.handleComment(record.id)}
          >
            {intl.get('hwfp.task.button.comment').d('评论')}
          </Button>
        ) : null,
      onClose: handleClose,
      className: 'detail-drawer swfl-approval-workbench-cc-task-detail-modal',
      id: CC_TASK_TAB_DRAWER_ID,
    };
    openModal(modalObj);
  };

  // 关闭详情页
  handleModalClose = () => {
    const { handleClose } = this.context;
    handleClose();
  };

  getColumns = () => {
    const { tableAggregation } = this.state;
    const { processStatus = [] } = this.props;
    const processStatusObj = {};
    processStatus.forEach((item) => {
      processStatusObj[item.value] = item.meaning;
    });
    return [
      {
        name: 'processStatus',
        width: 120,
        renderer: ({ value }) => {
          return (
            <div style={{ overflow: 'hidden' }} className={styles['process-status-tag']}>
              {processStatusRender(processStatusObj, value)}
            </div>
          );
        },
      },
      {
        key: 'processDetail',
        width: 320,
        aggregation: true,
        aggregationLimit: 5,
        align: 'left',
        header: intl.get('hwfp.common.model.process.detail').d('流程明细'),
        children: [
          {
            name: 'process',
            width: 240,
            header: intl.get('hwfp.common.model.process.process').d('流程'),
            renderer: ({ record }) => {
              const { id, processName } = record.get(['id', 'processName']);
              return (
                <a onClick={() => this.showDetailModal(record || {})}>
                  {id}
                  {` - ${processName}`}
                </a>
              );
            },
          },
          {
            name: 'startUserName',
            width: 200,
            header: intl.get('hwfp.common.model.apply.owner').d('申请人'),
            renderer: ({ record }) => {
              const { startUserName, employeeResign } = record.get([
                'startUserName',
                'employeeResign',
              ]);
              return (
                <>
                  {startUserName}
                  {employeeResign && (
                    <Tag color="#E5E7EC" className={styles['task-info-content-tag']}>
                      <span style={{ color: '#4E5769' }}>
                        {intl.get('hpfm.organization.model.position.leave').d('离职')}
                      </span>
                    </Tag>
                  )}
                </>
              );
            },
          },
          {
            name: 'startUserUnitName',
            width: 200,
            header: intl.get('hwfp.common.model.apply.startUserUnitName').d('申请部门'),
          },
          {
            name: 'startTime',
            width: 200,
            header: intl.get('hwfp.common.model.apply.time').d('申请时间'),
            renderer: ({ value }) => dateTimeRender(value) || '-',
          },
        ],
      },
      {
        key: 'currentStage',
        width: 220,
        aggregation: true,
        aggregationLimit: 4,
        align: 'left',
        header: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
        help: intl
          .get('hwfp.common.view.title.currentStageTooltip')
          .d('正在审批中的流程节点名称及对应审批人'),
        children: [
          {
            name: 'taskName',
            width: 200,
            header: tableAggregation
              ? intl.get('hwfp.common.model.apply.nodeName').d('节点名称')
              : undefined,
          },
          {
            name: 'currentApprover',
            width: 200,
            header: intl.get('hwfp.common.model.apply.approver').d('审批人'),
            renderer: ({ value }) => {
              const currentApprover = value ? value.replace(/,/g, ', ') : '-';
              return <ResignedDisplay value={currentApprover} />;
            },
          },
          {
            name: 'modelStandardTime',
            width: 120,
          },
        ],
      },
      {
        key: 'preStage',
        className: styles['list-table-cell'],
        width: 220,
        aggregation: true,
        aggregationLimit: 4,
        align: 'left',
        header: intl.get('hwfp.common.view.message.current.preStage').d('上一节点'),
        help: intl
          .get('hwfp.common.view.title.preStageTooltip')
          .d('上一已完成节点参与审批人员及存在审批拒绝/驳回意见集合'),
        children: [
          {
            name: 'previousNodeName',
            width: 200,
            header: tableAggregation
              ? intl.get('hwfp.common.model.apply.nodeName').d('节点名称')
              : undefined,
          },
          {
            name: 'previousApprover',
            width: 120,
            header: tableAggregation
              ? intl.get('hwfp.common.model.apply.approver').d('审批人')
              : undefined,
            renderer: ({ value }) => {
              const previousApprover = value ? value.replace(/,/g, ', ') : '-';
              return <ResignedDisplay value={previousApprover} />;
            },
          },
          {
            name: 'previousComment',
            width: 200,
            header: tableAggregation
              ? intl.get('hwfp.common.model.apply.approveComment').d('审批意见')
              : undefined,
          },
        ],
      },
      {
        name: 'endTime',
        width: 150,
        renderer: ({ value }) => dateTimeRender(value) || '-',
      },
      {
        name: 'description',
        width: 350,
        renderer: ({ text }) => {
          if (!text) {
            return '-';
          }
          return tableAggregation ? (
            text.split('\n').map((t) => (
              <div>
                <Text>{t}</Text>
              </div>
            ))
          ) : (
            <Text>{text}</Text>
          );
        },
      },
    ];
  };

  handleAggregationChange = (value) => {
    this.setState({ tableAggregation: value });
  };

  beforeQuery = ({ params }) => {
    const { tableDs } = this.props;
    if (!tableDs.queryDataSet) {
      tableDs.queryDataSet = new DataSet();
    }
    const { startedUserList, startedUserUnitList, processStatusList, readFlag } = params;
    if (startedUserList) {
      params.startedUserList = startedUserList.split(',');
    }
    if (startedUserUnitList) {
      params.startedUserUnitList = startedUserUnitList.split(',');
    }
    if (processStatusList) {
      params.processStatusList = processStatusList.split(',');
    }
    if (!isNil(readFlag)) {
      params.readFlag = Number(readFlag);
    }
    tableDs.setState('queryState', 'ready');
    tableDs.queryDataSet.loadData([params]);
    return true;
  };

  handleQuery = () => {
    const { onSearch } = this.props;
    onSearch();
  };

  renderTableRight = () => {
    const { tableAggregation } = this.state;
    return (
      <div className={styles['table-layout']}>
        <Popover content={intl.get('hwfp.common.table.flatTableView').d('平铺表视图')}>
          <div
            className={styles[!tableAggregation ? 'isActive' : 'isNormal']}
            onClick={() => this.handleAggregationChange(false)}
          >
            <Icon type="reorder" className={styles['icon-font']} />
          </div>
        </Popover>
        <Popover content={intl.get('hwfp.common.table.aggregateTableView').d('聚合表视图')}>
          <div
            className={styles[tableAggregation ? 'isActive' : 'isNormal']}
            onClick={() => this.handleAggregationChange(true)}
          >
            <Icon type="view_day" className={styles['icon-font']} />
          </div>
        </Popover>
      </div>
    );
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const { tableAggregation } = this.state;
    const { tableDs, customizeTable = () => {} } = this.props;
    return (
      <div className={styles['list-table']}>
        {customizeTable(
          { code: 'HWFP.APPROVAL_TABLE_UNIT_GROUP.CC' },
          <SearchBarTable
            searchCode="HWFP.APPROVAL_WORKBENCH_LIST.CC_FILTER"
            highLightRow="click"
            dataSet={tableDs}
            columns={this.getColumns()}
            // selectionMode="none"
            pagination={false}
            aggregation={tableAggregation}
            onAggregationChange={this.handleAggregationChange}
            autoHeight={{
              type: 'maxHeight',
              diff: -80,
            }}
            searchBarConfig={{
              beforeQuery: this.beforeQuery,
              onQuery: this.handleQuery,
              autoQuery: false,
              fieldProps: {
                startedUserList: {
                  lovPara: {
                    tenantId: getCurrentOrganizationId(),
                    empStatus: 'ALL',
                  },
                },
              },
              left: {
                render: (_, ds) => (
                  <MultipleTextSplitInput
                    dataSet={ds}
                    style={{ width: '300px' }}
                    name="processSearch"
                    placeholder={intl
                      .get('hwfp.common.model.apply.queryKeyName')
                      .d('请输入流程描述、名称、标识查询')}
                  />
                ),
              },
              right: {
                render: this.renderTableRight,
              },
            }}
            searchBarRef={(ref) => {
              this.searchBarRef = ref;
            }}
            tableRef={(ref) => {
              this.tableRef = ref;
            }}
          />
        )}
      </div>
    );
  }
}
