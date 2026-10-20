/**
 * ComponentTable - 组件清单
 * @date: 2018-9-25
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Table } from 'hzero-ui';
import { enableRender } from 'utils/renderer';
import { createPagination } from 'utils/utils';
import { numberPrecision } from '@/routes/utils.js';
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
      onTableChange({}, 'queryComponent');
    }
  }

  @Bind()
  handleTableChange(pagination) {
    this.props.onTableChange(pagination, 'queryComponent');
  }

  render() {
    const { dataSource, customizeTable, remote } = this.props;
    const { content = [] } = dataSource;
    const { disableCompentPrecision } = remote?.props?.process || {};
    const columns = [
      {
        title: intl.get(`smdm.materiel.model.materiel.lineNumber`).d('行号'),
        dataIndex: 'lineNumber',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.componentCode`).d('组件代码'),
        dataIndex: 'componentCode',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.componentLocalName`).d('组件本地名称'),
        dataIndex: 'componentLocalName',
      },
      {
        title: intl.get(`smdm.materiel.view.message.tab.affiliatedOrgTable`).d('所属组织'),
        dataIndex: 'invOrganizationName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.quantity`).d('数量'),
        dataIndex: 'quantity',
        render: (val, record) => (disableCompentPrecision ? val : (val ? Number(numberPrecision(val, record.uomPrecision)) : val)),
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.uomName`).d('单位'),
        dataIndex: 'uomName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.height`).d('高度（米）'),
        dataIndex: 'height',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.depth`).d('深度（米）'),
        dataIndex: 'depth',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.width`).d('宽度（米）'),
        dataIndex: 'width',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.netWeight`).d('净重（kg）'),
        dataIndex: 'netWeight',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.grossWeight`).d('毛重（kg）'),
        dataIndex: 'grossWeight',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.originCountry`).d('生产国家'),
        dataIndex: 'originCountry',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.measurement`).d('物品测量'),
        dataIndex: 'measurement',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.material`).d('材料'),
        dataIndex: 'material',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.shippingMarkSize`).d('唛头尺寸'),
        dataIndex: 'shippingMarkSize',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.productBrand`).d('产品品牌/型号'),
        dataIndex: 'productBrand',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.enabledFlag`).d('是否启用'),
        dataIndex: 'enabledFlag',
        render: (val) => enableRender(val ? 1 : 0),
      },
    ];

    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SMDM_MATERIELQUERY_COMPONENT.LIST',
          },
          <Table
            rowKey="componentId"
            dataSource={content}
            columns={columns}
            pagination={createPagination(dataSource)}
            bordered
            onChange={this.handleTableChange}
          />
        )}
      </React.Fragment>
    );
  }
}
