import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';

import EnableTag from '@/components/EnableTag';
import c7nModal, { showRecordModal } from '@/utils/c7nModal';
import { SRM_SAGM } from 'srm-front-boot/lib/utils/config';
import { executeStrategy, unLock } from './api';

import Detail from './Detail';
import RecordTimeLine from './Record';
import recordRender from './Record/agmHeader';

@formatterCollections({ code: ['sagm.common', 'sagm.priceStrategy'] })
export default class StrategyConfig extends Component {
  state = { execLoading: false };

  organizationId = getCurrentOrganizationId();

  tableDs = new DataSet({
    autoQuery: true,
    queryFields: [
      {
        name: 'strategyCodeName',
        label: intl.get('sagm.priceStrategy.view.strategyCodeName').d('策略编码/名称'),
      },
    ],
    fields: [
      {
        name: 'strategyCode',
        label: intl.get('sagm.priceStrategy.view.strategyCode').d('策略编码'),
      },
      {
        name: 'strategyName',
        label: intl.get('sagm.priceStrategy.view.strategyName').d('策略名称'),
      },
      {
        name: 'remark',
        label: intl.get('sagm.common.view.remark').d('备注'),
      },
      {
        name: 'realName',
        label: intl.get('sagm.common.view.creator').d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get('sagm.common.view.creationDate').d('创建时间'),
      },
      { name: 'enableFlag', label: intl.get('hzero.common.status').d('状态') },
      { name: 'versionNum', label: intl.get('sagm.common.view.version').d('版本') },
      {
        name: 'strategyDetail',
        label: intl.get('sagm.priceStrategy.view.strategyDetail').d('策略明细'),
      },
      { name: 'option', label: intl.get('hzero.common.action').d('操作') },
    ],
    transport: {
      read: ({ data }) => ({
        url: `/sagm/v1/${this.organizationId}/price-strategys`,
        method: 'GET',
        data: {
          ...data,
          isAddSelected: 0,
        },
      }),
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          if (record.get('enableFlag')) {
            Object.assign(record, { selectable: false });
          }
        });
      },
    },
  });

  columns = [
    { name: 'strategyCode', width: 140 },
    { name: 'strategyName', minWidth: 120 },
    { name: 'remark', width: 120 },
    { name: 'realName', width: 120 },
    { name: 'creationDate', width: 180 },
    {
      name: 'enableFlag',
      width: 120,
      renderer: ({ record }) => <EnableTag enabledFlag={record.get('enableFlag')} />,
    },
    { name: 'versionNum', width: 80 },
    {
      name: 'strategyDetail',
      width: 100,
      renderer: ({ record }) => (
        <a
          onClick={() =>
            this.handleEdit(record.get('priceStrategyId'), record.get('strategyCode'), true)
          }
        >
          {intl.get('sagm.priceStrategy.model.strategyDetail').d('策略明细')}
        </a>
      ),
    },
    {
      name: 'versionNum',
      width: 120,
      title: intl.get('hzero.common.button.historyVersion').d('历史版本'),
      renderer: ({ record }) =>
        record.get('versionNum') !== 1 ? (
          <a onClick={() => this.viewHistory(record)}>
            {intl.get('hzero.common.button.viewDetails').d('查看详情')}
          </a>
        ) : (
          '-'
        ),
    },
    { name: 'option', width: 200, renderer: this.renderOptions },
  ];

  @Bind
  renderOptions({ record }) {
    return (
      <span className="action-link">
        {record.get('enableFlag') ? (
          <a onClick={() => this.unLock(record.get('priceStrategyId'))}>
            {intl.get('sagm.common.button.unLock').d('解锁')}
          </a>
        ) : (
          <a
            onClick={() =>
              this.handleEdit(record.get('priceStrategyId'), record.get('strategyCode'))
            }
          >
            {intl.get('hzero.common.edit').d('编辑')}
          </a>
        )}
        <a onClick={() => this.handleExec([record])} disabled={record.get('enableFlag')}>
          {intl.get('sagm.common.model.exec').d('执行')}
        </a>
        <a onClick={() => this.handleOpenHistory(record.get('priceStrategyId'))}>
          {intl.get('hzero.common.button.operating').d('操作记录')}
        </a>
      </span>
    );
  }

  @Bind
  fetchList(type = 'create') {
    if (type === 'create') {
      this.tableDs.query();
    } else {
      this.tableDs.query(this.tableDs.currentPage);
    }
  }

  @Bind
  handleEdit(key, code = '', readOnly = false) {
    const title =
      key === 'create'
        ? intl.get('sagm.priceStrategy.view.priceStrategy.create').d('新建价格策略')
        : readOnly
        ? `${code}-${intl.get('sagm.priceStrategy	view.strategyDetail').d('策略明细')}`
        : `${code}-${intl.get('sagm.priceStrategy.view.priceStrategy.matain').d('策略明细维护')}`;
    const {
      match: { path = '' },
    } = this.props;
    c7nModal({
      style: { width: 800 },
      footer: readOnly ? null : undefined,
      title,
      children: (
        <Detail
          type={key}
          onFetchList={this.fetchList}
          readOnly={readOnly}
          path={path}
          viewSkuBackPath="/s2-mall/sagm/price-strategy"
        />
      ),
    });
  }

  @Bind
  viewHistory(record) {
    const { strategyCode = '' } = record.toData();
    const ds = new DataSet({
      autoQuery: false,
      paging: false,
      transport: {
        read: {
          url: `${SRM_SAGM}/v1/${this.organizationId}/price-strategys/history/${strategyCode}`,
          method: 'GET',
        },
      },
    });
    ds.query();
    c7nModal({
      title: intl.get('hzero.common	button.historyVersion').d('历史版本'),
      style: { width: 742 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
      children: (
        <RecordTimeLine
          dataSet={ds}
          renderer={(args) => recordRender(args, this.handleEdit, strategyCode)}
        />
      ),
    });
  }

  // 解锁
  @Bind()
  async unLock(priceStrategyId) {
    this.tableDs.status = 'loading';
    const res = getResponse(
      await unLock({
        priceStrategyId,
      })
    );
    this.tableDs.status = 'ready';
    if (res) {
      this.tableDs.query(this.tableDs.currentPage);
    }
  }

  @Bind()
  handleOpenHistory(priceStrategyId) {
    showRecordModal({
      width: 700,
      params: { priceStrategyId },
      url: `/sagm/v1/${this.organizationId}/strategy-historys`,
    });
  }

  @Bind
  async handleExec(list = []) {
    this.setState({ execLoading: true });
    this.tableDs.status = 'loading';
    const params = list.map((record) => record.toData());
    const res = await executeStrategy(params);
    this.setState({ execLoading: false });
    this.tableDs.status = 'ready';
    const result = getResponse(res);
    if (result) {
      this.tableDs.query(this.tableDs.currentPage);
    }
  }

  render() {
    const { execLoading } = this.state;
    const ExecBtn = observer(({ dataSet }) => (
      <Button
        type="primary"
        icon="enter"
        loading={execLoading}
        onClick={() => this.handleExec(dataSet.selected)}
        disabled={dataSet.selected.length === 0}
      >
        {intl.get('sagm.common.model.batchExec').d('批量执行')}
      </Button>
    ));
    return (
      <Fragment>
        <Header title={intl.get('sagm.priceStrategy.view.priceStrategyManage').d('价格策略管理')}>
          <ExecBtn dataSet={this.tableDs} />
          <Button icon="plus" onClick={() => this.handleEdit('create')}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={this.tableDs} columns={this.columns} />
        </Content>
      </Fragment>
    );
  }
}
