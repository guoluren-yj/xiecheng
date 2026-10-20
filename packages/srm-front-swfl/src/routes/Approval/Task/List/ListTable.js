import React, { Component, createRef } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { Tag, Icon, Tooltip, Text, message, Popover } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';

import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';
import Store from '@/components/UpdateModal/Store';
import { ResignedDisplay } from '@/utils/util';
import { detailApproveFormDS } from '@/stores/taskDS';
import { TASK_TAB_DRAWER_ID } from '../../utils';
import Detail from '../Detail';
import DetailTitle from './DetailTitle';
import TaskTag from './TaskTag';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();
@observer
export default class ListTable extends Component {
  static contextType = Store;

  constructor(props) {
    super(props);
    props.onRef(this);

    this.flowChartDrawerRef = null;
    this.approveFormDS = new DataSet(detailApproveFormDS());
    this.detailRef = null;
    this.headerButtonRef = null;
    this.taskTagRef = createRef();
    this.state = {
      tableAggregation: true,
    };
  }

  @Bind()
  getColumns() {
    const { tableAggregation } = this.state;
    const { processTag = [] } = this.props;
    return [
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
            width: 120,
            renderer: ({ record }) => {
              const { processInstanceId, processName, rushFlag } = record.get([
                'processInstanceId',
                'processName',
                'rushFlag',
              ]);
              return (
                <a onClick={() => this.showDetailModal(record || {}, record)}>
                  {processInstanceId}
                  {` - ${processName}`}
                  {rushFlag ? (
                    <Tooltip
                      title={intl
                        .get('hwfp.common.view.title.rush.process.remind')
                        .d('流程加急，请尽快审批')}
                    >
                      <span className={styles['task-info-rush-icon']}>
                        <Icon type="priority" />
                      </span>
                    </Tooltip>
                  ) : (
                    ''
                  )}
                </a>
              );
            },
          },
          {
            name: 'startUserName',
            width: 200,
            renderer: ({ value, record }) => {
              const employeeResign = record.get('employeeResign');
              return (
                <span style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
                  <Text>{value}</Text>
                  {employeeResign ? (
                    <Tag color="#E5E7EC" className={styles['task-info-content-tag']}>
                      <span style={{ color: '#4E5769' }}>
                        {intl.get('hpfm.organization.model.position.leave').d('离职')}
                      </span>
                    </Tag>
                  ) : null}
                </span>
              );
            },
          },
          {
            name: 'startUserUnitName',
            width: 200,
          },
          {
            name: 'startTime',
            width: 200,
            renderer: ({ value }) => dateTimeRender(value) || '-',
          },
        ],
      },
      {
        name: 'processLabelList',
        className: styles['label-cell'],
        width: tableAggregation ? 150 : undefined,
        tooltip: 'none',
        renderer: ({ record, value }) => {
          if (!record) {
            return null;
          }
          const updateLabel = (label) => record.init('processLabelList', label);
          return (
            <TaskTag
              processTag={processTag}
              tags={value}
              procId={record.get('processInstanceId')}
              updateLabel={updateLabel}
              inline={!tableAggregation}
            />
          );
        },
      },
      {
        name: 'createTime',
        width: 150,
        renderer: ({ record, text }) => {
          const durationTimeStr = record.get('durationTimeStr');
          const previousNodeName = record.get('previousNodeName');
          return (
            <div className={styles['node-info']}>
              {previousNodeName && <div>{text ? dateTimeRender(text) : ''}</div>}
              <Tag color="rgb(235, 247, 241)" style={{ marginLeft: '-7px' }}>
                <span style={{ color: 'rgb(71, 184, 131)' }}>
                  {intl.get('hwfp.common.view.has.stayed').d('已停留')}:&nbsp;
                  {durationTimeStr || ''}
                </span>
              </Tag>
            </div>
          );
        },
      },
      {
        key: 'currentStage',
        width: 320,
        aggregation: true,
        aggregationLimit: 4,
        align: 'left',
        header: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
        help: intl
          .get('hwfp.common.view.title.currentStageTooltip')
          .d('正在审批中的流程节点名称及对应审批人'),
        children: [
          {
            name: 'name',
            header: tableAggregation
              ? intl.get('hwfp.common.model.apply.nodeName').d('节点名称')
              : undefined,
            width: 200,
          },
          {
            name: 'assigneeName',
            width: 120,
            renderer: ({ value }) => <ResignedDisplay value={value} />,
          },
          {
            name: 'modelStandardTime',
            width: 120,
          },
        ],
      },
      {
        key: 'preStage',
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
        name: 'description',
        width: 350,
        renderer: ({ text }) => {
          if (!text) {
            return '-';
          }
          return tableAggregation
            ? text.split('\n').map((t) => (
              <div>
                <Text>{t}</Text>
              </div>
              ))
            : text;
        },
      },
    ];
  }

  // 详情页关闭
  handleModalClose = () => {
    const { handleClose } = this.context;
    this.approveFormDS.current.reset();
    handleClose();
  };

  // 审批通过或审批拒绝之后自动打开下一个流程
  handleNextProcess = () => {
    const { tableDs, handleNext } = this.props;
    const { currentPage, currentIndex, totalCount } = tableDs;
    const { handleClose } = this.context;
    const queryPage = (totalCount - 1) / 10 > currentPage - 1 ? currentPage : currentPage - 1;
    tableDs.query(queryPage).then(() => {
      if (tableDs.totalCount > 0) {
        tableDs
          .locate(tableDs.totalCount > currentIndex ? currentIndex : currentIndex - 1)
          .then((res) => {
            if (res && res.toData()) {
              // 阻止自动打开下一个流程
              if (!handleNext) {
                this.approveFormDS.current.reset();
                return handleClose();
              }
              handleClose();
              this.showDetailModal(res, res);
              message.success(
                intl.get('hwfp.common.message.view.title.nextProcess').d('已自动打开下一条待办'),
                2.5,
                'top'
              );
            } else {
              this.approveFormDS.current.reset();
              handleClose();
            }
          });
      } else {
        message.success(
          intl.get('hwfp.common.message.view.title.finishProcess').d('已完成所有待办'),
          2.5,
          'top'
        );
        this.approveFormDS.current.reset();
        handleClose();
      }
    });
  };

  // 详情页抽屉
  showDetailModal = (currentRecord, originRecord) => {
    const record = currentRecord.toData ? currentRecord.toData() : currentRecord;
    const { match, tableDs, processTag } = this.props;
    match.params.id = record.id;
    match.params.processInstanceId = record.encryptProcInstId;
    const { openModal, setModalValue } = this.context;
    const title = record.startUserName
      ? `${record.processInstanceId}-${record.processName}-${record.startUserName}`
      : `${record.processInstanceId}-${record.startUserName}`;
    const updateLabel = (label) => {
      if (originRecord) {
        originRecord.init('processLabelList', label);
      }
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
      title: (
        <DetailTitle
          title={title}
          processTag={processTag}
          tags={record.processLabelList}
          procId={record.processInstanceId}
          updateLabel={updateLabel}
        />
      ),
      mask: false,
      destroyOnClose: true,
      drawer: true,
      closable: true,
      closeOnLocationChange: false,
      resizable: true,
      customizable: true,
      customizedCode: 'APPROVAL_TASK_DETAIL',
      style: {
        minWidth: '742px',
      },
      children: (
        <Detail
          onRef={(ref) => {
            this.detailRef = ref;
          }}
          match={match}
          tenantId={tenantId}
          flowChatMatch={{
            params: { id: record.processInstanceId, processInstanceId: record.encryptProcInstId },
          }}
          approveFormParams={approveFormParams}
          handleCancel={() => {
            this.handleModalClose();
            tableDs.query();
          }}
          handleNextProcess={() => this.handleNextProcess()}
          refreshNumber={this.props.refreshNumber}
        />
      ),
      footer: null,
      onClose: () => {
        setModalValue('');
        this.approveFormDS.current.reset();
      },
      className: 'detail-drawer swfl-approval-workbench-task-detail-modal',
      id: TASK_TAB_DRAWER_ID,
    };
    openModal(modalObj);
  };

  beforeQuery = ({ params }) => {
    const { tableDs } = this.props;
    if (!tableDs.queryDataSet) {
      tableDs.queryDataSet = new DataSet();
    }
    const {
      startedUserList,
      startedUserUnitList,
      customizeOrderField,
      rushFlag,
      labelIdList,
    } = params;
    if (customizeOrderField) {
      // stayTime 其实是 createdTime，由于需要显示名称不同，故增加 stayTime 作为纯排序字段，此处需要转换成 createdTime
      // eslint-disable-next-line no-param-reassign
      params.customizeOrderField = params.customizeOrderField.replace('stayTime', 'createdTime');
    }
    if (startedUserList) {
      // eslint-disable-next-line no-param-reassign
      params.startedUserList = params.startedUserList.split(',');
    }
    if (startedUserUnitList) {
      // eslint-disable-next-line no-param-reassign
      params.startedUserUnitList = params.startedUserUnitList.split(',');
    }
    if (!isNil(rushFlag)) {
      // eslint-disable-next-line no-param-reassign
      params.rushFlag = Number(params.rushFlag);
    }
    if (labelIdList) {
      // eslint-disable-next-line no-param-reassign
      params.labelIdList = params.labelIdList.split(',');
    }
    tableDs.setState('queryState', 'ready');
    tableDs.queryDataSet.loadData([params]);
    return true;
  };

  handleQuery = () => {
    const { handleSearchAll } = this.props;
    handleSearchAll();
  };

  handleAggregationChange = (value) => {
    this.setState({ tableAggregation: value });
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

  render() {
    const { tableAggregation } = this.state;
    const { tableDs, customizeTable = () => {} } = this.props;
    return (
      <div className={styles['list-table']}>
        {customizeTable(
          { code: 'HWFP.APPROVAL_TABLE_UNIT_GROUP.NOT_APPROVED' },
          <SearchBarTable
            searchCode="HWFP.APPROVAL_WORKBENCH_LIST.TASK.FILTER"
            tableRef={(ref) => {
              this.tableRef = ref;
            }}
            searchBarRef={(ref) => {
              this.searchBarRef = ref;
            }}
            autoHeight={{
              type: 'maxHeight',
              diff: -80,
            }}
            className={styles['list-table-head']}
            highLightRow="click"
            dataSet={tableDs}
            columns={this.getColumns()}
            pagination={false}
            aggregation={tableAggregation}
            onAggregationChange={this.handleAggregationChange}
            searchBarConfig={{
              beforeQuery: this.beforeQuery,
              onQuery: this.handleQuery,
              autoQuery: false,
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
          />
        )}
      </div>
    );
  }
}
