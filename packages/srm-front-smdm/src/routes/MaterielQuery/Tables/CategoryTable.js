/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-06-03 15:24:41
 * @LastEditors: yanglin
 * @LastEditTime: 2021-11-30 19:49:49
 */
/**
 * CategoryTable - 自主品类分配定义
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Table, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

/**
 * 自主品类分配定义
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class CategoryTable extends PureComponent {
  /**
   * 方法含义？
   * 参数？
   */
  @Bind()
  handleTableChange(pagination) {
    this.props.onTableChange(pagination, 'queryCategory');
  }

  /**
   * 渲染是否
   * @param {Boolean} v
   */
  @Bind()
  yesOrNoRender(v) {
    const statusMap = ['default', 'success'];
    return (
      <Badge
        status={statusMap[v]}
        text={v === 1 ? intl.get('hzero.common.status.yes') : intl.get('hzero.common.status.no')}
      />
    );
  }

  render() {
    const { dataSource = [], customizeTable } = this.props;
    // const { content = [] } = dataSource;
    const columns = [
      {
        title: intl.get(`smdm.materiel.model.materiel.categoryCode`).d('品类代码'),
        dataIndex: 'categoryCode',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.categoryName`).d('品类名称'),
        dataIndex: 'categoryName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.defaultFlag`).d('是否主品类'),
        dataIndex: 'defaultFlag',
        render: this.yesOrNoRender,
      },
    ];
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SMDM_MATERIELQUERY_CATEGORY.LIST',
          },
          <Table
            bordered
            rowKey="categoryAssignId"
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            onChange={this.handleTableChange}
          />
        )}
      </React.Fragment>
    );
  }
}
