import React, { useEffect } from 'react';
import intl from 'utils/intl';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';

import { Header, Content } from 'components/Page';
import { Table, DataSet, Modal, Button, Dropdown, Menu } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Button as ButtonPermission } from 'components/Permission';
import styles from './index.less';
import { DataSchedulingDS, DataSchedulingFormDS } from './stores/DataSchedulingDS';
import { LogListDS } from './stores/LogListDS';
import DataScheduleForm from './components/DataScheduleForm';

import { updateEnable, excuteJob, terminateJob } from '../../services/schedule';

const key1 = Modal.key();
const key2 = Modal.key();
const key3 = Modal.key();

// 表格请求通用操作
function useTableAction(mapServices = {}) {
  return async function triggerService({
    type, // 对应mapServices
    record, // 表格行记录
    dataSet, // 表格ds
    params, // 外部参数
    isTip = true,
    isQuery = true,
    successCallback = (e) => e, // 成功后回调
    errorCallback = (e) => e, // 失败后回调
  }) {
    const [api, getParams] = mapServices?.[type] || [];
    if (typeof api !== 'function') return false;
    // 如果有自定义参数方法，则走自定义，否则走触发时传入的params
    const requestParams = getParams ? getParams({ record, dataSet, params }) : params;
    const ds = dataSet; // 浅拷贝一下，防止eslint
    ds.status = 'loading';
    const res = getResponse(await api(requestParams));
    ds.status = 'ready';
    if (res) {
      if (isTip) notification.success();
      if (isQuery) ds.query(ds.currentPage);
      successCallback();
    } else {
      errorCallback();
    }
  };
}

@formatterCollections({ code: ['sads.dataSchedule', 'sads.indexcongig'] })
export default class DataScheduling extends React.PureComponent {
  dataSchedulingDS = new DataSet({ ...DataSchedulingDS(), autoQuery: true });

  dataSchedulingFormDS = null;

  @Bind()
  getScheduleColumns() {
    return [
      {
        name: 'inputSourceCode',
        width: 150,
        lock: 'left',
      },
      {
        name: 'inputSourceName',
        minWidth: 150,
      },
      {
        name: 'pipelineName',
        minWidth: 200,
      },
      {
        name: 'remark',
        minWidth: 200,
      },
      {
        name: 'threadTotal',
        width: 100,
      },
      {
        name: 'cron',
        width: 200,
      },
      {
        name: 'enabledFlag',
        width: 90,
        align: 'center',
        renderer: ({ value, text }) => (
          <Tag
            className={classNames(
              styles['list-normal-tag'],
              value ? styles['success-tag'] : styles['warning-tag']
            )}
          >
            {text}
          </Tag>
        ),
      },
      {
        name: 'operation',
        header: intl.get(`hzero.common.action`).d('操作'),
        width: 150,
        align: 'center',
        lock: 'right',
        renderer: ({ record, dataSet }) => {
          const enabledFlag = record.get('enabledFlag');
          return (
            <span className="action-link">
              <ButtonPermission type="text" onClick={() => this.openAddModal(record)}>
                {intl.get('hzero.common.edit').d('编辑')}
              </ButtonPermission>
              <ButtonPermission type="text" onClick={() => this.openAddModal(record, true)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </ButtonPermission>
              <Dropdown
                placement="bottomRight"
                overlay={
                  <Menu>
                    <Menu.Item>
                      <ButtonPermission type="text" onClick={() => this.openLogModal(record)}>
                        {intl.get('sads.dataSchedule.view.button.log').d('日志')}
                      </ButtonPermission>
                    </Menu.Item>
                    <Menu.Item>
                      <ButtonPermission
                        disabled={!enabledFlag}
                        type="text"
                        onClick={() =>
                          this.handleTriggerService({ record, dataSet, type: 'excute' })
                        }
                      >
                        {intl.get('hzero.common.button.trigger').d('执行')}
                      </ButtonPermission>
                    </Menu.Item>
                    <Menu.Item>
                      <ButtonPermission
                        type="text"
                        onClick={() =>
                          this.handleTriggerService({ record, dataSet, type: 'update' })
                        }
                      >
                        {enabledFlag
                          ? intl.get(`hzero.common.button.unEnabled`).d('禁用')
                          : intl.get(`hzero.common.button.enabled`).d('启用')}
                      </ButtonPermission>
                    </Menu.Item>
                  </Menu>
                }
              >
                <ButtonPermission type="text">
                  {intl.get('hzero.common.button.more').d('更多')}
                </ButtonPermission>
              </Dropdown>
            </span>
          );
        },
      },
    ];
  }

  @Bind()
  getLogListColumns() {
    return [
      {
        name: 'jobId',
        minWidth: 100,
      },
      {
        name: 'successFlagDesc',
        width: 120,
      },
      {
        name: 'percentage',
        width: 120,
        renderer: ({ record, value }) =>
          record.get('successFlag') === 3
            ? !value
              ? intl.get('sads.dataSchedule.modal.loading').d('加载中')
              : `${Number(value * 100).toFixed(2)}%`
            : '-',
      },
      {
        name: 'rowTotal',
        width: 120,
      },
      {
        name: 'taskCreateDate',
        width: 160,
      },
      {
        name: 'taskStartDate',
        width: 160,
      },
      {
        name: 'taskEndDate',
        width: 160,
      },
      {
        name: 'errorMessage',
        minWidth: 200,
      },
      {
        name: 'jobParam',
        width: 120,
      },
      {
        name: 'statement',
        width: 120,
      },
      {
        name: 'action',
        width: 130,
        lock: 'right',
        renderer: ({ record, dataSet }) => {
          return (
            <span className="action-link">
              <ButtonPermission
                type="text"
                onClick={() => this.openErrorDetailModal(record.get('errorDetail'))}
              >
                {intl.get('sads.dataSchedule.view.button.errorInfo').d('错误详情')}
              </ButtonPermission>
              <ButtonPermission
                type="text"
                disabled={![2, 3].includes(record.get('successFlag'))}
                onClick={() => this.handleTriggerService({ record, dataSet, type: 'terminate' })}
              >
                {intl.get('sads.dataSchedule.view.button.terminate').d('终止')}
              </ButtonPermission>
            </span>
          );
        },
      },
    ];
  }

  handleTriggerService = useTableAction({
    excute: [excuteJob, ({ record }) => ({ jobId: record.get('jobId') })],
    terminate: [terminateJob, ({ record }) => record.get('logId')],
    update: [
      updateEnable,
      ({ record }) => {
        const preEnabledFlag = record.get('enabledFlag');
        const newEnabledFlag = Number(!preEnabledFlag);
        return { ...record.toData(), enabledFlag: newEnabledFlag };
      },
    ],
  });

  @Bind()
  async handleCreate(formRecord) {
    if (formRecord.getState('viewFlag')) {
      return true;
    }
    const valid = await this.dataSchedulingFormDS.current.validate();
    if (!valid) {
      return false;
    }
    const res = await this.dataSchedulingFormDS.submit();
    if (getResponse(res)) {
      this.dataSchedulingDS.query(this.dataSchedulingDS.currentPage);
    } else {
      return false;
    }
    return true;
  }

  @Bind()
  openLogModal(record) {
    const logListDS = new DataSet({ ...LogListDS(), autoQuery: true });
    logListDS.setQueryParameter('jobId', record.get('jobId'));
    const modalProperties = {
      title: intl.get('sads.dataSchedule.view.title.logList').d('日志列表'),
      key: key1,
      drawer: true,
      closable: true,
      style: {
        width: 1090,
      },
      children: (
        // <Table dataSet={logListDS} columns={this.getLogListColumns()} queryFieldsLimit={2} />
        <LogDetail dataSet={logListDS} columns={this.getLogListColumns()} queryFieldsLimit={2} />
      ),
    };
    Modal.open(modalProperties);
  }

  @Bind()
  openAddModal(record, viewFlag) {
    this.dataSchedulingFormDS = new DataSet({ ...DataSchedulingFormDS(), autoQuery: false });
    const formRecord = record
      ? this.dataSchedulingFormDS.create({ ...record.toData() })
      : this.dataSchedulingFormDS.create();
    // 查看
    if (viewFlag) {
      formRecord.setState('viewFlag', true);
    } else {
      formRecord.setState('viewFlag', false);
    }
    const modalTitle = viewFlag
      ? intl.get('sads.dataSchedule.model.title.view').d('查看数据调度')
      : record
      ? intl.get('sads.dataSchedule.model.title.edit').d('编辑数据调度')
      : intl.get('sads.dataSchedule.model.title.create').d('新建数据调度');
    const modalProperties = {
      title: modalTitle,
      drawer: true,
      closable: true,
      style: {
        width: 380,
      },
      key: key3,
      children: <DataScheduleForm record={formRecord} />,
      onCancel: () => {
        this.handCancelScheduleModal(formRecord);
      },
      onOk: () => this.handleCreate(formRecord),
    };
    Modal.open(modalProperties);
  }

  @Bind()
  handCancelScheduleModal(formRecord) {
    const jobId = formRecord.get('jobId');
    if (!jobId) {
      this.dataSchedulingFormDS.remove(formRecord);
    }
    if (this.dataSchedulingDS.current) {
      this.dataSchedulingDS.current.reset();
    }
    return true;
  }

  openErrorDetailModal(errorDetail) {
    const modalProperties = {
      title: intl.get('sads.dataSchedule.view.title.errorInfo').d('错误详情'),
      key: key2,
      drawer: true,
      closable: true,
      style: {
        width: 380,
      },
      okCancel: false,
      children: <p>{errorDetail}</p>,
    };
    Modal.open(modalProperties);
  }

  render() {
    return (
      <React.Fragment>
        <Header title={intl.get('sads.dataSchedule.view.header.title').d('数据调度')}>
          <Button color="primary" icon="add" onClick={() => this.openAddModal()}>
            {intl.get('hzero.common.button.new').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table
            columns={this.getScheduleColumns()}
            dataSet={this.dataSchedulingDS}
            queryFieldsLimit={3}
          />
        </Content>
      </React.Fragment>
    );
  }
}

const LogDetail = observer((props) => {
  const { dataSet = [], columns = [], ...others } = props;
  // 定时刷新
  useEffect(() => {
    const timeId = setInterval(() => {
      const hasExecuting = dataSet.filter((i) => [2, 3].includes(i.get('successFlag')));
      if (hasExecuting.length !== 0) {
        dataSet.query(dataSet.currentPage);
      } else {
        clearInterval(timeId);
      }
    }, 3000);
    return () => {
      clearInterval(timeId);
    };
  }, []);
  return <Table dataSet={dataSet} columns={columns} {...others} />;
});
