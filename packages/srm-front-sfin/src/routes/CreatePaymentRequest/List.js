/**
 * index -创建一般付款申请
 * @date: 2019-12-11
 * @author zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
// import { Form, Input } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { sum } from 'lodash';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
// import { dateRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';

const commonPrompt = 'sfin.payment.common';
@withCustomize({
  unitCode: ['SFIN.PAYMENT_REQUEST_CREATE_LIST.GRID'],
})
export default class List extends React.Component {
  @Bind()
  protocolType(text, record) {
    const { redirectDetail = (e) => e } = this.props;
    return <a onClick={() => redirectDetail(record.paymentHeaderId)}>{text}</a>;
  }

  @Bind()
  handleInvoiceDetail(record) {
    const { openActionHistory } = this.props;
    openActionHistory(record);
  }

  render() {
    const {
      loading,
      dataSource,
      onSearch,
      pagination,
      selectedRows,
      customizeTable,
      onSelectedRowChange = (e) => e,
    } = this.props;
    const selectedRowKeys = selectedRows.map((item) => item.paymentHeaderId);
    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectedRowChange,
    };
    const tableProps = {
      columns: [
        {
          title: intl.get(`${commonPrompt}.paymentStatusMeaning`).d('申请单状态'),
          dataIndex: 'paymentStatusMeaning',
          width: 90,
        },
        {
          title: intl.get(`${commonPrompt}.paymentNum`).d('付款申请单号'),
          dataIndex: 'paymentNum',
          width: 140,
          render: this.protocolType,
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          width: 140,
        },
        {
          title: intl.get(`sfin.common.model.common.ouName`).d('业务实体'),
          dataIndex: 'ouName',
          width: 120,
        },
        {
          title: intl.get(`sfin.common.model.common.supplierCompanyNum`).d('供应商编码'),
          dataIndex: 'supplierCompanyNum',
          width: 140,
        },
        {
          title: intl.get(`${commonPrompt}.companyName`).d('供应商名称'),
          dataIndex: 'supplierCompanyName',
          width: 100,
        },
        {
          title: intl.get(`${commonPrompt}.invoiceBodyName`).d('开票主体'),
          dataIndex: 'invoiceTitle',
          width: 100,
        },
        {
          title: intl.get(`${commonPrompt}.paymentAmount`).d('付款金额'),
          dataIndex: 'paymentAmount',
          width: 120,
          render: (text, record) => thousandBitSeparator(text, record.amountPrecision),
        },
        {
          title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
          dataIndex: 'currencyCode',
          width: 60,
        },
        {
          title: intl.get(`${commonPrompt}.paymentDate`).d('付款日期'),
          dataIndex: 'paymentDate',
          width: 100,
          render: dateRender,
        },
        {
          title: intl.get(`${commonPrompt}.createdByName`).d('申请人'),
          dataIndex: 'createdByName',
          width: 80,
        },
        {
          title: intl.get(`${commonPrompt}.creationDate`).d('申请日期'),
          dataIndex: 'creationDate',
          width: 100,
          render: dateRender,
        },
        {
          title: intl.get(`${commonPrompt}.remark`).d('备注'),
          dataIndex: 'remark',
          width: 120,
        },
        {
          title: intl.get(`hzero.common.button.operating`).d('操作记录'),
          dataIndex: 'pcTypeCode',
          width: 80,
          render: (val, record) => (
            <a color="#29BECE" onClick={() => this.handleInvoiceDetail(record)}>
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </a>
          ),
        },
      ],
      loading,
      dataSource,
      rowSelection,
      bordered: true,
      rowKey: 'paymentHeaderId',
      onChange: (page) => onSearch(page),
      pagination,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };

    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SFIN.PAYMENT_REQUEST_CREATE_LIST.GRID',
          },
          <EditTable {...tableProps} />
        )}
      </React.Fragment>
    );
  }
}
