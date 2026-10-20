/*
 * @Description: 物料查询页
 * @Date: 2020-05-08 17:35:16
 * @Author: HJ <jinhuang02@hand-china.com>
 * @Copyright: Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Table } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { createPagination } from 'utils/utils';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';

/**
 * 客户物品
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@connect(({ materielQuery }) => ({
  materielQuery,
}))
@Form.create({ fieldNameProp: null })
export default class ItemOrgUomTable extends PureComponent {
  componentWillUnmount() {
    this.props.dispatch({
      type: 'materielQuery/updateState',
      payload: {
        itemOrgUomData: [],
      },
    });
  }

  componentDidMount() {
    const { itemId, onTableChange } = this.props;
    if (itemId) {
      onTableChange({}, 'queryItemOrgUom');
    }
  }

  /**
   * 方法含义？
   * @param {*} pagination - <>
   */
  @Bind()
  handleTableChange(pagination) {
    this.props.onTableChange(pagination, 'queryItemOrgUom');
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { dataSource, customizeTable } = this.props;
    const { content = [] } = dataSource;
    const columns = [
      {
        title: intl.get('smdm.materiel.model.ItemOrgUom.primaryAmount').d('Y'),
        dataIndex: 'primaryAmount',
      },
      {
        title: intl.get('smdm.materiel.model.ItemOrgUom.primaryUomName').d('基本单位'),
        dataIndex: 'primaryUomName',
      },
      {
        title: intl.get(`smdm.materiel.model.ItemOrgUom.optionalAmount`).d('X'),
        dataIndex: 'optionalAmount',
      },
      {
        title: intl.get(`smdm.materiel.model.ItemOrgUom.uomName`).d('可选计量单位'),
        dataIndex: 'uomName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.enabledFlag`).d('是否启用'),
        dataIndex: 'enabledFlag',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
    ];
    return (
      <React.Fragment>
        {
          customizeTable && customizeTable({
            code: 'SMDM_MATERIELQUERY_DETAIL.UOM_LIST',
          },
            <Table
              bordered
              rowKey="partnerRelationId"
              dataSource={content}
              columns={columns}
              pagination={createPagination(dataSource)}
              onChange={this.handleTableChange}
            />
          )
        }

      </React.Fragment>
    );
  }
}
