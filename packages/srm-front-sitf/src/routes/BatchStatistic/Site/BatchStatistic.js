/**
 * BatchStatistic - 接口批次统计
 * @date: 2018-11-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { Header, Content } from 'components/Page';
import qs from 'querystring';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { openTab } from 'utils/menuTab';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import CacheComponent from 'components/CacheComponent';
import { createPagination, filterNullValueObject, isTenantRoleLevel } from 'utils/utils';
import QueryForm from './QueryForm';
import QueryFormOrg from './QueryFormOrg';

/**
 * 监控系统
 * @extends {Component} - React.Component
 * @reactProps {Object} batchStatistic - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({ code: ['sitf.batchStatistic', 'entity.interface', 'entity.tenant'] })
@withRouter
@CacheComponent({ cacheKey: '/sitf/batch-statistic' })
export default class BatchStatistic extends PureComponent {
  form;

  componentDidMount() {
    const { dispatch, modelName = 'batchStatistic' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        queryData: {},
        data: {
          list: [],
        },
      },
    });
    if (isTenantRoleLevel()) {
      this.fetchBatchStatistic();
    }
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchBatchStatistic(pageData = {}) {
    const { dispatch, modelName = 'batchStatistic' } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const searchData = {
      ...filterValues,
      tenant: filterValues.tenantId,
      startDate: filterValues.startDate && filterValues.startDate.format(DEFAULT_DATETIME_FORMAT),
      endDate: filterValues.endDate && filterValues.endDate.format(DEFAULT_DATETIME_FORMAT),
    };
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        data: {
          list: [],
        },
      },
    });
    dispatch({
      type: `${modelName}/fetchBatchStatistic`,
      payload: {
        page: pageData,
        ...searchData,
      },
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.fetchBatchStatistic();
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryBatchStatistic(queryData = {}) {
    this.fetchBatchStatistic(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchBatchStatistic(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 打开批次查询
   * @param {Object} record 行数据
   * @param {string} dataExecuteResult 状态
   */
  @Bind()
  OpenBatchSearch(record = {}, dataExecuteResult = '') {
    const { dispatch, modelName = 'batchStatistic' } = this.props;
    openTab({
      title: 'hzero.common.title.interfaceSearch',
      icon: 'form',
      key:
        modelName === 'batchStatisticOrg' ? `/sitf/interface-search-org` : `/sitf/interface-search`,
      path:
        modelName === 'batchStatisticOrg'
          ? `/sitf/interface-search-org/list`
          : `/sitf/interface-search/list`,
      closable: true,
      search: qs.stringify({ status: 'batchStatus' }),
    });
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        queryData: {
          dataExecuteResult,
          interfaceCode: record.interfaceCode,
          creationDateFrom: record.startDate,
          creationDateTo: record.endDate,
          tenant: record.tenant,
          tenantName: record.tenantName,
        },
      },
    });
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const { modelName = 'batchStatistic', fetchLoading } = this.props;
    const { [modelName]: batchStatistic } = this.props;
    const { data = {} } = batchStatistic;
    const columns = [
      {
        title: intl.get('entity.interface.name').d('接口名称'),
        dataIndex: 'interfaceName',
      },
      {
        title: intl.get('sitf.batchStatistic.model.batchStatistic.totalCount').d('批次总数'),
        dataIndex: 'totalCount',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get('sitf.batchStatistic.model.batchStatistic.newCount').d('新建批次数'),
        dataIndex: 'newCount',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get('sitf.batchStatistic.model.batchStatistic.runningCount').d('运行中批次数'),
        dataIndex: 'runningCount',
        align: 'left',
        width: 120,
        render: (val, record) => {
          if (val === 0) {
            return val;
          } else {
            return <a onClick={() => this.OpenBatchSearch(record, 'UNEXECUTE')}>{val}</a>;
          }
        },
      },
      {
        title: intl.get('sitf.batchStatistic.model.batchStatistic.partCount').d('部分成功批次数'),
        dataIndex: 'partCount',
        align: 'left',
        width: 120,
        render: (val, record) => {
          if (val === 0) {
            return val;
          } else {
            return <a onClick={() => this.OpenBatchSearch(record, 'PART')}>{val}</a>;
          }
        },
      },
      {
        title: intl.get('sitf.batchStatistic.model.batchStatistic.successCount').d('成功批次数'),
        dataIndex: 'successCount',
        align: 'left',
        width: 100,
        render: (val, record) => {
          if (val === 0) {
            return val;
          } else {
            return <a onClick={() => this.OpenBatchSearch(record, 'SUCCESS')}>{val}</a>;
          }
        },
      },
      {
        title: intl.get('sitf.batchStatistic.model.batchStatistic.failedCount').d('失败批次数'),
        dataIndex: 'failedCount',
        align: 'left',
        width: 100,
        render: (val, record) => {
          if (val === 0) {
            return val;
          } else {
            return <a onClick={() => this.OpenBatchSearch(record, 'FAILED')}>{val}</a>;
          }
        },
      },
      {
        title: intl.get('sitf.batchStatistic.model.batchStatistic.startDate').d('时间从'),
        dataIndex: 'startDate',
        align: 'left',
        width: 100,
      },
      {
        title: intl.get('sitf.batchStatistic.model.batchStatistic.endDate').d('时间至'),
        dataIndex: 'endDate',
        align: 'left',
        width: 100,
      },
    ];

    const level = isTenantRoleLevel();

    return (
      <React.Fragment>
        <Header title={intl.get('sitf.batchStatistic.view.message.title').d('接口批次统计')} />
        <Content>
          {+level ? (
            <QueryFormOrg
              onQueryBatchStatistic={this.onQueryBatchStatistic}
              onRef={this.handleBindRef}
            />
          ) : (
            <QueryForm
              onQueryBatchStatistic={this.onQueryBatchStatistic}
              onRef={this.handleBindRef}
            />
          )}
          <Table
            bordered
            loading={fetchLoading}
            rowKey="interfaceId"
            dataSource={data.list}
            columns={columns}
            pagination={createPagination(data)}
            onChange={this.handleStandardTableChange}
          />
        </Content>
      </React.Fragment>
    );
  }
}
