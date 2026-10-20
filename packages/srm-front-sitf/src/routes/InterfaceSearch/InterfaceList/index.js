/**
 * InterfaceSearch - 接口查询 - 接口列表
 * @date: 2018-9-18
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Layout } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { filterNullValueObject } from 'utils/utils';
import QueryForm from './QueryForm';

const { Content } = Layout;
/**
 * 接口查询 - 接口列表 - 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class InterfaceSearch extends PureComponent {
  Form;

  componentDidMount() {
    const { batchStatus = '' } = this.props;
    if (batchStatus === 'batchStatus') {
      this.fetchData();
    }
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchData(pageData = {}) {
    const { queryInterfaceList } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    if (queryInterfaceList) {
      queryInterfaceList({
        page: pageData,
        ...filterValues,
      });
    }
  }

  /**
   *点击查询按钮事件
   *
   * @param {Object} queryData 查询条件
   */
  @Bind()
  queryValue(queryData = {}) {
    this.fetchData(queryData);
  }

  /**
   *分页change时间
   *
   * @param {Object} pagination 分页参数
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchData(pagination);
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
   *渲染方法
   */
  render() {
    const {
      interfaceData = {},
      loading,
      history,
      queryData = {},
      batchStatus = '',
      modelName = 'interfaceListDetail',
    } = this.props;

    const columns = [
      {
        title: intl.get('entity.interface.type').d('接口类别'),
        dataIndex: 'interfaceCategoryCode',
        width: 150,
      },
      {
        title: intl.get('entity.interface.code').d('接口代码'),
        dataIndex: 'interfaceCode',
        width: 150,
      },
      {
        title: intl.get('entity.interface.name').d('接口名称'),
        dataIndex: 'interfaceName',
        width: 100,
      },
      {
        title: intl.get('entity.interface.type').d('接口类型'),
        dataIndex: 'interfaceType',
        width: 120,
        render: (val, record) => {
          return <span>{record.interfaceTypeMeaning}</span>;
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        align: 'left',
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('sitf.common.interface.individualFlag').d('二开'),
        dataIndex: 'individualFlag',
        align: 'left',
        width: 80,
        render: (val, record) => {
          return record.individualFlag === 1 ? (
            <span>{intl.get('sitf.common.interface.individualFlag').d('二开')}</span>
          ) : (
            <span>{intl.get('sitf.common.interface.normal').d('标准')}</span>
          );
        },
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'comments',
        width: 120,
      },
      {
        title: intl.get('sitf.interfaceSearch.model.interfaceSearch.interfaceId').d('接口表'),
        align: 'left',
        width: 100,
        render: (_, record) => (
          <a
            onClick={() => {
              history.push(
                `/sitf/${
                  modelName === 'interfaceSearchOrg' ? 'interface-search-org' : 'interface-search'
                }/interface-list-detail?interfaceId=${record.interfaceId}&tenant=${record.tenantId}`
              );
            }}
          >
            {intl.get('sitf.interfaceSearch.model.interfaceSearch.interfaceId').d('接口表')}
          </a>
        ),
      },
    ];

    return (
      <React.Fragment>
        <Content style={{ margin: '8px 16px 16px', padding: '16px' }}>
          <QueryForm
            queryValue={this.queryValue}
            queryData={queryData}
            onRef={this.handleBindRef}
            batchStatus={batchStatus}
          />
          <Table
            bordered
            scroll={{ x: 1151 }}
            loading={loading}
            rowKey="interfaceId"
            dataSource={interfaceData.list}
            columns={columns}
            pagination={interfaceData.pagination}
            onChange={this.handleStandardTableChange}
          />
        </Content>
      </React.Fragment>
    );
  }
}
