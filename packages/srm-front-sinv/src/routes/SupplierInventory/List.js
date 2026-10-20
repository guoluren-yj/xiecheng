/*
 * List - 供应商库存录入查询列表信息
 * @date: 2019/12/14 10:41:50
 * @author: ZTC <tangchen.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { dateTimeRender } from 'utils/renderer';
import { sum, isNumber, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { showBigNumber } from '../components/utils';

/**
 * 供应商库存录入查询列表信息
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form 表单
 * @return React.element
 */

const modelPrompt = 'sinv.common.model.common';
@Form.create({ fieldNameProp: null })
export default class List extends PureComponent {
  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  @Bind()
  showUomText(record) {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      pagination = {},
      onModalVisible,
      customizeTable,
      onOccupancyModalVisible,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.supplierCompanyCode`).d('供应商编码'),
        dataIndex: 'supplierCode',
        width: 200,
      },
      {
        title: intl.get(`${modelPrompt}.supplierCompanyName`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 200,
      },
      {
        title: intl.get(`${modelPrompt}.company`).d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`${modelPrompt}.ouId`).d('业务实体'),
        dataIndex: 'ouName',
        width: 200,
      },
      {
        title: intl.get(`${modelPrompt}.invOrganizationId`).d('收货组织'),
        dataIndex: 'organizationName',
        width: 200,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
        render: (_val, record) => this.showUomText(record),
      },
      {
        title: intl.get(`${modelPrompt}.undeliveredQuantity`).d('未交货数量'),
        dataIndex: 'undeliveredQuantity',
        width: 100,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`${modelPrompt}.onWayQuantity`).d('在途数量'),
        dataIndex: 'occupiedQuantity',
        width: 100,
        render: (val, record) => {
          return <a onClick={() => onOccupancyModalVisible(true, record)}>{showBigNumber(val)}</a>;
        },
      },
      {
        title: intl.get(`${modelPrompt}.stockQuantity`).d('库存现有量'),
        dataIndex: 'stockQuantity',
        width: 100,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`${modelPrompt}.lastUpdateTime`).d('最后更新时间'),
        dataIndex: 'lastUpdateDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sinv.common.view.button.operationRecord`).d('操作记录'),
        dataIndex: 'operationRecord',
        width: 100,
        render: (_, record) => {
          return (
            <a onClick={() => onModalVisible(true, record)}>
              {intl.get('sinv.common.view.button.operationRecord').d('操作记录')}
            </a>
          );
        },
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable(
      {
        code: 'SINV.SUPPLIER_INVENTORY.LIST',
      },
      <EditTable
        resizable
        loading={loading}
        bordered
        scroll={{ x: scrollX }}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onSearch(page)}
      />
    );
  }
}
