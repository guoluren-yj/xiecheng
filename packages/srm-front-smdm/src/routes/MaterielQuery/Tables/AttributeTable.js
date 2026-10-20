/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-06-03 15:24:41
 * @LastEditors: yanglin
 * @LastEditTime: 2022-06-27 20:25:36
 */
/**
 * AttributeTable - 自定义物品属性
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Table } from 'hzero-ui';
import intl from 'utils/intl';

/**
 * 自定义物品属性
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class AttributeTable extends PureComponent {
  componentDidMount() {
    const { onClearRows, itemId, onTableChange } = this.props;
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
    if (itemId) {
      onTableChange({}, 'queryAttribute');
    }
  }

  render() {
    const { dataSource, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get(`smdm.materiel.model.materiel.attributeName`).d('属性描述'),
        dataIndex: 'attributeName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.attributeValue`).d('属性值'),
        dataIndex: 'attributeValue',
      },
    ];
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SMDM_MATERIELQUERY_ATTRIBUTETABLE.LIST',
          },
          <Table
            rowKey="itemAttributeId"
            dataSource={dataSource}
            columns={columns}
            bordered
            pagination={false}
          />
        )}
      </React.Fragment>
    );
  }
}
