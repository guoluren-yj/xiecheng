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
      customizeTable = () => {},
    } = this.props;
    const columns = [
      {
        title: intl.get('spfm.configServer.model.supplier.businessUnitFlag').d('业务实体'),
        dataIndex: 'ouName',
        width: 160,
        fixed: 'left',
      },
      {
        title: intl.get(`entity.business.origationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 160,
        fixed: 'left',
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 80,
        fixed: 'left',
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
        fixed: 'left',
      },
      {
        title: intl.get(`sinv.common.model.common.stockType`).d('特殊库存'),
        dataIndex: 'specialStockMeaning',
        width: 80,
        fixed: 'left',
      },
      {
        title: intl.get(`sinv.inventoryInquiry.view.message.unlimitedUsage`).d('非限制使用数量'),
        dataIndex: 'unlimitedQuantity',
        width: 150,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.inventoryInquiry.view.message.limitUsage`).d('限制使用数量'),
        dataIndex: 'limitedQuantity',
        width: 150,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.inventoryInquiry.view.message.qualityInspectionNum`).d('质检数量'),
        dataIndex: 'qualityInspectionQuantity',
        width: 100,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.inventoryInquiry.view.message.frozenQuantity`).d('冻结数量'),
        dataIndex: 'frozenQuantity',
        width: 150,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
        render: (_val, record) => this.showUomText(record),
      },
      {
        title: intl.get(`sinv.common.model.common.lotNum`).d('批次号'),
        dataIndex: 'batchNum',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.serialNum`).d('序列号'),
        dataIndex: 'seqNum',
        width: 100,
      },
      {
        title: intl.get(`sinv.common.model.common.inventoryName`).d('库房'),
        dataIndex: 'inventoryName',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.locationName`).d('库位'),
        dataIndex: 'locationName',
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable(
      {
        code: 'SINV.INVENTORY_INQUIRY_VENDOR.LIST',
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
