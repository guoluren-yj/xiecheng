import React, { Component, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { sum, isNumber, isNil } from 'lodash';
import intl from 'utils/intl';
import { showBigNumber } from '../components/utils';

/**
 * 验收单列表
 *
 * @export
 * @class List - 列表组价
 * @extends {Component} - React.Component
 * @reactProps {boolean} loading - 数据加载状态
 * @reactProps {object} tableData - 列表数据源
 * @reactProps {object} pagination - 列表分页信息
 * @reactProps {object} rowSelection - 选择行对象
 * @reactProps {function} onChange - 分页查询
 * @returns React.element
 */
export default class List extends Component {
  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  showUomText = (record) => {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  };

  render() {
    const {
      loading,
      detailPagination,
      detailDataSource,
      onChange,
      rowSelection,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sinv.acceptance.view.message.acceptListNum`).d('验收单号'),
        dataIndex: 'acceptListNum',
        width: 180,
      },
      {
        title: intl.get(`sinv.common.model.common.companyName`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.supplierCompanyName`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.orderSeq`).d('序号'),
        dataIndex: 'orderSeq',
        width: 80,
        render: (_value, _record, index) => index + 1,
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.uom`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.itemCategoryName`).d('物料品类'),
        dataIndex: 'itemCategoryName',
        width: 180,
      },
      {
        title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 180,
        render: (_val, record) => this.showUomText(record),
      },
      {
        title: intl.get(`sinv.common.model.common.acceptQuantity`).d('本次验收数量'),
        dataIndex: 'acceptQuantity',
        width: 120,
        render: (value) => showBigNumber(value),
      },
      {
        title: intl.get(`sinv.common.model.common.acceptOpinionCodeMeaning`).d('验收意见'),
        dataIndex: 'acceptOpinionCodeMeaning',
        width: 120,
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.pcNum`).d('协议编号'),
        dataIndex: 'pcNum',
        width: 150,
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.pcName`).d('协议名称'),
        dataIndex: 'pcName',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
        dataIndex: 'poHeaderNum',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
        dataIndex: 'poLineNum',
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 240;
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SINV.ACCEPTANCE_QUERY.LIST_BAY_DETAIL',
          },
          <Table
            bordered
            loading={loading}
            columns={columns}
            dataSource={detailDataSource}
            pagination={detailPagination}
            scroll={{ x: scrollX }}
            rowKey="acceptListLineId"
            rowSelection={rowSelection}
            onChange={(page) => onChange(page)}
          />
        )}
      </Fragment>
    );
  }
}
