import React, { PureComponent, Fragment } from 'react';
// import { Table, Form } from 'hzero-ui';

import EditTable from 'components/EditTable';
import { dateRender } from 'utils/renderer';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import { thousandBitSeparator } from '@/routes/utils.js';

/**
 * 索赔项目数据列表展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
// @withCustomize({
//   unitCode: ['SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM'],
// })
export default class ListTable extends PureComponent {
  render() {
    const {
      ListLoading,
      dataSource = [],
      pagination = {},
      onChange,
      customizeTable,
      selectedRowKeys,
      onSelectRow,
      DetailHeadDataSource,
    } = this.props;
    const { claimAmountMaintainMode = '' } = DetailHeadDataSource;
    const columns = [
      {
        title: intl.get(`sqam.common.model.common.displayNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 80,
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.model.claimItemCode`).d('索赔项目编码'),
        dataIndex: 'claimItemNum',
        width: 150,
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.model.claimItemDesc`).d('索赔项目描述'),
        dataIndex: 'claimItemDesc',
        width: 180,
        // fixed: true,
      },
      {
        title: intl.get(`sqam.common.date.happenDate`).d('发生日期'),
        dataIndex: 'occurDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get('entity.item.name').d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`sqam.common.model.unit`).d('单位'),
        dataIndex: 'uomCodeAndName',
        width: 120,
      },
      // {
      //   title: intl.get(`sqam.common.model.unitPrice`).d('单价'),
      //   dataIndex: 'unitPrice',
      //   align: 'right',
      //   width: 120,
      // },
      {
        title: intl.get('sqam.common.model.common.quantity').d('数量'),
        dataIndex: 'quantity',
        width: 150,
        render: text => thousandBitSeparator(text),
      },
      claimAmountMaintainMode === 'netPrice' && {
        title: intl.get(`sqam.common.model.claimInvoiceBill.netPrice`).d('索赔单价（不含税）'),
        dataIndex: 'netPrice',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.pricePrecision),
      },
      claimAmountMaintainMode === 'taxIncludedPrice' && {
        title: intl
          .get(`sqam.common.model.claimInvoiceBill.taxIncludedPrice`)
          .d('索赔单价（含税）'),
        dataIndex: 'taxIncludedPrice',
        width: 120,
        render: (text, record) => thousandBitSeparator(text, record.pricePrecision),
      },
      {
        title: intl.get('sqam.common.model.claimState').d('索赔说明'),
        dataIndex: 'lineExplain',
        width: 100,
      },
      // {
      //   title: intl.get('sqam.common.model.isIncludeTax').d('是否含税'),
      //   dataIndex: 'taxFlag',
      //   width: 100,
      //   render: yesOrNoRender,
      // },
      {
        title: intl.get(`sqam.common.model.common.taxRate`).d('税率(%)'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`sqam.common.model.claimInvoiceBill.noTaxBill`).d('索赔行金额（不含税）'),
        dataIndex: 'lineAmount',
        align: 'right',
        width: 100,
        // render: (value) => {
        //   return numberRender(value, 2, false);
        // },
        render: (val, record) => thousandBitSeparator(val, record.amountPrecision),
      },
      {
        title: intl.get(`sqam.common.model.claimInvoiceBill.hasTaxBill`).d('索赔行金额（含税）'),
        dataIndex: 'taxIncludedLineAmount',
        width: 100,
        align: 'right',
        // render: (value) => {
        //   return numberRender(value, 2, false);
        // },
        render: (val, record) => thousandBitSeparator(val, record.amountPrecision),
      },
      {
        title: intl.get('sqam.common.model.common.jointCode').d('连带物品编码'),
        dataIndex: 'associateItemCode',
        width: 130,
      },
      {
        title: intl.get(`sqam.common.model.common.jointUnit`).d('连带物品单位'),
        dataIndex: 'associateItemUomCodeAndName',
        width: 120,
      },
      {
        title: intl.get('sqam.common.model.common.jointNum').d('连带物品数量'),
        dataIndex: 'associateItemQuantity',
        width: 120,
        render: text => thousandBitSeparator(text),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'lineRemark',
      },
      {
        title: intl.get(`sqam.common.model.common.inspection`).d('关联质检单'),
        dataIndex: 'fromInspectionNum',
        width: 150,
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 150,
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.model`).d('型号'),
        dataIndex: 'model',
        width: 150,
      },
    ].filter(v => v);

    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM',
          },
          <EditTable
            bordered
            scroll={{ x: 2300 }}
            rowKey="formLineId"
            loading={ListLoading}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            onChange={page => onChange(page)}
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectRow,
            }}
          />
        )}
      </Fragment>
    );
  }
}
