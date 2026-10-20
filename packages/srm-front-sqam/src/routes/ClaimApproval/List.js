import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { yesOrNoRender, dateRender, dateTimeRender } from 'utils/renderer';
import { isNumber, sum } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { thousandBitSeparator } from '@/routes/utils.js';

// function numberFormat (val, a) {
//   // const count = countDecimals(val);
//   return isNumber(val) && !isNaN(val) ? numberRender(val, a) : val;
// }

// function countDecimals(val) {
//   return isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? `${val}`.split('.')[1].length || 0
//     : 0;
// }

@withCustomize({
  unitCode: ['SQAM.CLAIM_APPROVAL_LIST.GRID'],
})
export default class List extends Component {
  render() {
    const { dataSource, goDetail, pagination, onChange, customizeTable } = this.props;
    const { operationRecord, fetchClaimLoading } = this.props;
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'statusCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`sqam.common.model.claimNum`).d('索赔单号'),
        dataIndex: 'formNum',
        width: 150,
        render: (val, record) => <a onClick={() => goDetail(record.formHeaderId)}>{val}</a>,
      },
      {
        title: intl.get(`sqam.common.model.formTitle`).d('索赔单标题'),
        dataIndex: 'formTitle',
        width: 250,
      },
      {
        title: intl.get(`sqam.common.model.claimType`).d('索赔类型'),
        dataIndex: 'claimTypeName',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCode',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 180,
      },
      {
        title: intl.get(`sqam.common.model.appealedFlag`).d('是否申诉'),
        dataIndex: 'appealedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sqam.common.model.dealAction`).d('处理动作'),
        dataIndex: 'appealHandleActionMeaning',
        width: 80,
      },
      {
        title: intl.get(`sqam.common.model.claimSum`).d('索赔总额'),
        dataIndex: 'totalAmount',
        width: 130,
        align: 'right',
        render: (val, record) => thousandBitSeparator(val, record.amountPrecision),
        // render: (val, record) =>
        //   !isNaN(val) &&
        //   Number.parseFloat(+val).toLocaleString(language, {
        //     maximumFractionDigits:
        //       record.amountPrecision && record.amountPrecision >= 0
        //         ? record.amountPrecision <= 20
        //           ? record.amountPrecision
        //           : 20
        //         : 0,
        //     minimumFractionDigits: record.amountPrecision || 0,
        //   }),
      },
      {
        title: intl.get(`entity.company.name`).d('公司名称'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`sqam.common.date.requireFeedbackDate`).d('要求反馈日期'),
        dataIndex: 'feedbackDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createName',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        dataIndex: 'operationRecord',
        width: 120,
        render: (_, { formHeaderId }) => (
          <a onClick={() => operationRecord(true, formHeaderId)}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </a>
        ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      bordered: true,
      dataSource,
      pagination,
      columns,
      onChange,
      loading: fetchClaimLoading,
      scroll: { x: scrollX },
    };
    return customizeTable(
      {
        code: 'SQAM.CLAIM_APPROVAL_LIST.GRID',
      },
      <Table {...tableProps} />
    );
  }
}
