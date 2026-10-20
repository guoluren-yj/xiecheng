/**
 * ConsumeRecord - 产品使用详情
 * @date: 2018-12-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import CacheComponent from 'components/CacheComponent';
import { filterNullValueObject } from 'utils/utils';
import QueryForm from './QueryForm';

/**
 * 产品使用详情
 * @extends {Component} - React.Component
 * @reactProps {Object} consumeRecord - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['seci.consumeRecord', 'entity.tenant'] })
@connect(({ consumeRecord, loading }) => ({
  consumeRecord,
  fetchLoading: loading.effects['consumeRecord/fetchConsumeRecord'],
}))
@withRouter
@CacheComponent({ cacheKey: '/seci/consume-record' })
export default class ConsumeRecord extends PureComponent {
  form;

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'consumeRecord/updateState',
      payload: {
        data: [],
      },
    });
    this.fetchConsumeRecord();
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchConsumeRecord(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'consumeRecord/fetchConsumeRecord',
      payload: {
        page: isEmpty(pageData) ? {} : pageData,
        ...filterValues,
        consumeDateFrom:
          filterValues.consumeDateFrom &&
          filterValues.consumeDateFrom.format(DEFAULT_DATETIME_FORMAT),
        consumeDateTo:
          filterValues.consumeDateTo && filterValues.consumeDateTo.format(DEFAULT_DATETIME_FORMAT),
      },
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.fetchConsumeRecord();
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryConsumeRecord(queryData = {}) {
    this.fetchConsumeRecord(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchConsumeRecord(pagination);
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
   * 渲染方法
   * @returns
   */
  render() {
    const {
      consumeRecord: { data = [], pagination = {} },
      fetchLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get('entity.tenant.name').d('租户名称'),
        dataIndex: 'tenantName',
        width: 150,
      },
      {
        title: intl.get(`seci.consumeRecord.model.consumeRecord.loginName`).d('操作账号'),
        dataIndex: 'loginName',
      },
      {
        title: intl.get(`seci.consumeRecord.model.consumeRecord.realName`).d('账号名称'),
        dataIndex: 'realName',
        width: 150,
      },
      {
        title: intl.get(`seci.consumeRecord.model.consumeRecord.productName`).d('使用产品'),
        dataIndex: 'productName',
        width: 150,
      },
      {
        title: intl.get(`seci.consumeRecord.model.consumeRecord.consumeDate`).d('使用时间'),
        dataIndex: 'consumeDate',
        width: 120,
        align: 'center',
      },
    ];

    return (
      <React.Fragment>
        <Header title={intl.get(`seci.consumeRecord.view.message.title`).d('产品使用明细')} />
        <Content>
          <QueryForm onQueryConsumeRecord={this.onQueryConsumeRecord} onRef={this.handleBindRef} />
          <Table
            bordered
            loading={fetchLoading}
            rowKey="consumeRecordId"
            dataSource={data}
            columns={columns}
            pagination={pagination}
            onChange={this.handleStandardTableChange}
          />
        </Content>
      </React.Fragment>
    );
  }
}
