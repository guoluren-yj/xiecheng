/*
 * @Description: 物料查询页
 * @Date: 2020-05-08 17:35:16
 * @Author: HJ <jinhuang02@hand-china.com>
 * @Copyright: Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { createPagination } from 'utils/utils';
import intl from 'utils/intl';

/**
 * 客户物品
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class PartnerTable extends PureComponent {
  componentDidMount() {
    const { itemId, onTableChange } = this.props;
    if (itemId) {
      onTableChange({}, 'queryPartner');
    }
  }

  /**
   * 方法含义？
   * @param {*} pagination - <>
   */
  @Bind()
  handleTableChange(pagination) {
    this.props.onTableChange(pagination, 'queryPartner');
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { dataSource } = this.props;
    const { content = [] } = dataSource;
    const columns = [
      {
        title: intl.get('smdm.materiel.model.materiel.customer.name').d('客户名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码'),
        dataIndex: 'itemCode',
      },
      {
        title: intl.get('smdm.materiel.model.materiel.itemName').d('物料名称'),
        dataIndex: 'itemName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.sourceCode`).d('数据来源'),
        dataIndex: 'sourceCode',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.uomName`).d('单位'),
        dataIndex: 'uomName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.uomRate`).d('转换率(1:n)'),
        dataIndex: 'uomConversionRate',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        align: 'center',
        dataIndex: 'option',
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                this.onOpen(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];

    return (
      <React.Fragment>
        <Table
          bordered
          rowKey="partnerRelationId"
          dataSource={content}
          columns={columns}
          pagination={createPagination(dataSource)}
          onChange={this.handleTableChange}
        />
      </React.Fragment>
    );
  }
}
