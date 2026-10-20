import React, { Component, Fragment } from 'react';
import { DataSet, Lov, Table, Button, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
// import { observer } from 'mobx-react';
import { isNumber } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { executeStrategy, restoreStrategy, deleteSalePriceStrategy } from './api';
import Detail from '@/routes/sagm/PriceStrategy/Detail';
import c7nModal, { showRecordModal } from '@/utils/c7nModal';
import { strategyDetailRenderer } from '../../SagmWorkbench/renderers';
import styles from './index.less';

export default class Strategy extends Component {
  constructor(props) {
    super(props);
    const { agreementHeaderId } = props;
    this.createDs = new DataSet({
      autoCreate: true,
      selection: 'multiple',
      fields: [
        {
          name: 'strategyLov',
          type: 'object',
          lovCode: 'SAGM.PRICE_STRATEGY',
          lovPara: {
            saleAgreementHeaderId: agreementHeaderId,
            enableFlag: 1,
            isAddSelected: 1,
          },
          multiple: true,
        },
      ],
    });
  }

  organizationId = getCurrentOrganizationId();

  handleViewDetail = (record) => {
    const { viewSkuBackPath } = this.props;
    const { priceStrategyId, strategyCode } = record.toData();
    const title = `${strategyCode}-${intl
      .get('sagm.priceStrategy.view.strategyDetail')
      .d('策略明细')}`;
    c7nModal({
      style: { width: 800 },
      footer: null,
      title,
      children: <Detail type={priceStrategyId} readOnly viewSkuBackPath={viewSkuBackPath} />,
    });
  };

  updateStrategy = async (params, type = 'execute') => {
    const { pagination, onUpdateData, tableDs } = this.props;
    const serviceMap = {
      execute: executeStrategy,
      restore: restoreStrategy,
      delete: deleteSalePriceStrategy,
    };

    const defaultApi = () => new Promise();
    const api = serviceMap[type] || defaultApi;

    tableDs.status = 'submitting';
    const result = getResponse(await api(params));
    tableDs.status = 'ready';
    if (result) {
      notification.success();
      onUpdateData(pagination);
    }
  };

  handleDelete = (record) => {
    const { tableDs } = this.props;
    if (record.status === 'add') {
      tableDs.remove([record]);
    } else {
      this.updateStrategy([record.toData()], 'delete');
    }
  };

  handleOpenHistory = (priceStrategyLineId) => {
    showRecordModal({
      width: 700,
      params: { priceStrategyLineId },
      url: `/sagm/v1/${this.organizationId}/strategy-change-records`,
    });
  };

  renderOptions = ({ record }) => {
    const { disabled } = this.props;
    const { statusCode = 'NEW', statusCodeMeaning, priceStrategyLineId } = record.toData();
    // 优先级发生改变过，不可执行或者还原
    // ['NEW', 'EXECUTING', 'EXECUTED', 'RESTORED']
    const statusText = ['NEW', 'RESTORED'].includes(statusCode)
      ? intl.get('sagm.common.model.execute').d('执行')
      : ['EXECUTING', 'RESTORING'].includes(statusCode)
      ? statusCodeMeaning
      : intl.get('sagm.common.model.restore').d('还原');

    const priorityChange = record.getField('priority').dirty;

    const options = [
      {
        key: 'delete',
        name: intl.get('sagm.common.model.delete').d('删除'),
        event: () => this.handleDelete(record),
        disabled: ['EXECUTING', 'EXECUTED', 'RESTORING'].includes(statusCode) || disabled,
      },
      {
        key: 'execute',
        name: statusText,
        event: () =>
          this.updateStrategy(
            [record.toData()],
            ['NEW', 'RESTORED'].includes(statusCode)
              ? 'execute'
              : statusCode === 'EXECUTED'
              ? 'restore'
              : ''
          ),
        disabled:
          ['EXECUTING', 'RESTORING'].includes(statusCode) ||
          record.status === 'add' ||
          priorityChange,
      },
      {
        key: 'record',
        name: intl.get('sagm.common.model.operating').d('操作记录'),
        event: () => this.handleOpenHistory(priceStrategyLineId),
        disabled: record.status === 'add',
      },
    ];

    return (
      <span className="action-link">
        {options.map((m) => (
          <a
            disabled={m.disabled}
            key={m.key}
            onClick={m.event}
            style={{ display: 'inline-block', minWidth: 36 }}
          >
            {m.name}
          </a>
        ))}
      </span>
    );
  };

  handleChangeSort = (record, changeIndex) => {
    const { tableDs } = this.props;
    const priority = record.get('priority');
    const changeRecord = tableDs.get(changeIndex);
    if (changeRecord) {
      const changePriority = changeRecord.get('priority');
      record.set('priority', changePriority);
      changeRecord.set('priority', priority);
      tableDs.move(record.index, changeIndex);
    }
  };

  getSortDisable = (record, changeIndex) => {
    const { tableDs } = this.props;
    const changeRecord = tableDs.get(changeIndex);
    if (!changeRecord) return true;
    return ![record, changeRecord].some((s) =>
      ['NEW', 'RESTORED'].includes(s.get('statusCode') || 'NEW')
    );
  };

  getColumns = () => {
    const { disabled } = this.props;
    return [
      {
        name: 'strategyCode',
        minWidth: 120,
      },
      {
        name: 'strategyName',
        minWidth: 200,
      },
      {
        name: 'versionNum',
        width: 100,
        renderer: strategyDetailRenderer,
      },
      {
        name: 'strategyDetail',
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => this.handleViewDetail(record)}>
            {intl.get('sagm.priceStrategy.view.strategyDetail').d('策略明细')}
          </a>
        ),
      },
      {
        name: 'priority',
        width: 80,
        renderer: ({ text, record }) => {
          if (disabled) return text;
          // 上调禁用 上面无记录||上条记录与本记录同时不为新建或已还原
          const upDisibled = this.getSortDisable(record, record.index - 1);
          const downDisabled = this.getSortDisable(record, record.index + 1);
          return (
            <div className={styles['priority-action']}>
              <span>{text}</span>
              <span className="priority-icons">
                <Icon
                  type="expand_less"
                  onClick={() => {
                    if (!upDisibled) {
                      this.handleChangeSort(record, record.index - 1);
                    }
                  }}
                  style={{ fontSize: '14px', color: upDisibled ? '#ccc' : undefined }}
                />
                <Icon
                  type="expand_more"
                  onClick={() => {
                    if (!downDisabled) {
                      this.handleChangeSort(record, record.index + 1);
                    }
                  }}
                  style={{ fontSize: '14px', color: downDisabled ? '#ccc' : undefined }}
                />
              </span>
            </div>
          );
        },
      },
      {
        name: 'option',
        width: 200,
        renderer: this.renderOptions,
      },
    ];
  };

  handleChangeStrategy = (list) => {
    const { onCreateStrategy = () => {} } = this.props;
    this.createDs.reset();
    onCreateStrategy(list || []);
  };

  handleDrag = (dataSet, _, result) => {
    const { prioritys } = this.props;
    let { source: { index: sourceIndex } = {}, destination: { index: desIndex } = {} } =
      result || {};
    if (isNumber(sourceIndex) && isNumber(desIndex)) {
      if (sourceIndex > desIndex) {
        const tmp = sourceIndex;
        sourceIndex = desIndex;
        desIndex = tmp;
      }
      dataSet.forEach((record, index) => {
        if (sourceIndex <= index && index <= desIndex) {
          const { priority } = prioritys.find((f) => f.index === index) || {};
          record.set('priority', priority);
        }
      });
    }
  };

  render() {
    const { tableDs, onRefresh, agreementHeaderId } = this.props;
    if (tableDs.length !== 0) {
      const newPriceStrategyCodes = tableDs.map((m) => m.get('strategyCode')).join(',');
      this.createDs
        .getField('strategyLov')
        .setLovPara('newPriceStrategyCodes', newPriceStrategyCodes);
    }
    const RefreshButton = observer(({ dataSet }) => (
      <Button
        loading={dataSet.status === 'loading'}
        color="primary"
        icon="refresh"
        funcType="flat"
        disabled={!agreementHeaderId}
        onClick={() => onRefresh(tableDs.currentPage)}
      >
        {intl.get('sagm.common.button.refresh').d('刷新')}
      </Button>
    ));
    const buttons = [
      <RefreshButton dataSet={tableDs} />,
      <Lov
        dataSet={this.createDs}
        name="strategyLov"
        mode="button"
        // disabled={disabled}
        icon="playlist_add"
        clearButton={false}
        modalProps={{
          title: intl.get('sagm.common.view.priceStragegy').d('价格策略'),
        }}
        onChange={this.handleChangeStrategy}
      >
        {intl.get('sagm.common.button.create').d('新建')}
      </Lov>,
    ];
    return (
      <Fragment>
        <Table
          dragRow={false}
          dataSet={tableDs}
          columns={this.getColumns()}
          buttons={buttons}
          onDragEnd={this.handleDrag}
        />
      </Fragment>
    );
  }
}
