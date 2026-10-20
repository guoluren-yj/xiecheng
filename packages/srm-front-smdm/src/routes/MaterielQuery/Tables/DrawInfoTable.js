import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';

/**
 * 自定义物品属性
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
export default class ComponentTable extends PureComponent {
  componentDidMount() {
    const { itemId, onTableChange } = this.props;
    if (itemId) {
      onTableChange({}, 'queryDrawInfo');
    }
  }

  @Bind()
  handleTableChange(pagination) {
    this.props.onTableChange(pagination, 'queryDrawInfo');
  }

  @Bind()
  handleCols() {
    const { remote } = this.props;
    const columns = [
      {
        title: intl.get(`smdm.materiel.model.materiel.drawingLink`).d('图纸链接'),
        dataIndex: 'drawingLink',
        render: (val) => <a onClick={() => window.open(val)}>{val}</a>,
        width: 600,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.drawingVersion`).d('图纸版本'),
        dataIndex: 'drawingVersion',
        width: 350,
      },
      {
        title: intl
          .get(`smdm.materiel.model.materiel.drawingVersionText`)
          .d('图纸版本（支持非数字）'),
        dataIndex: 'drawingVersionText',
        width: 350,
      },
    ];
    return (
      remote?.process('SMDM_ITEM_QUERY_DETAIL_DRAWINFO_COLS', columns, { ...this.props }) || columns
    );
  }

  render() {
    const { dataSource, customizeTable } = this.props;

    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SMDM_MATERIELQUERY_DETAIL.DRAWING_INFO',
          },
          <Table
            rowKey="itemDrawingsId"
            dataSource={dataSource}
            columns={this.handleCols()}
            bordered
            pagination={false}
            onChange={this.handleTableChange}
          />
        )}
      </React.Fragment>
    );
  }
}
