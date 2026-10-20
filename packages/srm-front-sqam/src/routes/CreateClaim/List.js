import React, { Component } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
// import { numberRender } from 'utils/renderer';
import { isNumber, sum } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { math } from 'choerodon-ui/dataset';
import { dateRender, dateTimeRender } from 'utils/renderer';

import { thousandBitSeparator } from '@/routes/utils.js';

import rejectImg from '@/assets/problem_approve_reject.svg';

// function numberFormat(val) {
//   const count = countDecimals(val);
//   return isNumber(val) && !isNaN(val) ? numberRender(val, count <= 2 ? 2 : count) : val;
// }

// function countDecimals(val) {
//   return isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
//     ? `${val}`.split('.')[1].length || 0
//     : 0;
// }

@withCustomize({
  unitCode: ['SQAM.CREATE_CLAIM_LIST.GRID'],
})
export default class List extends Component {
  render() {
    const {
      goDetail,
      claimList,
      fetchClaim,
      pagination,
      rowSelection,
      fetchClaimLoading,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'statusCodeMeaning',
        width: 90,
        render: (val, record) => (
          <div>
            {val}
            <span>
              {record.statusCode === 'REJECTED' && (
                <Tooltip
                  title={
                    <div>
                      {intl
                        .get(`sqam.common.view.message.approvalRefusedMessage`)
                        .d('审批拒绝: 详见审批记录列表')}
                    </div>
                  }
                >
                  <img style={{ marginLeft: 5 }} src={rejectImg} alt="img" />
                </Tooltip>
              )}
            </span>
          </div>
        ),
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
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCode',
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 180,
      },
      {
        title: intl.get(`sqam.common.model.claimSum`).d('索赔总额'),
        dataIndex: 'totalAmount',
        width: 100,
        align: 'right',
        render: (val, record) =>
          val
            ? thousandBitSeparator(val, record.amountPrecision)
            : math.toFixed(val, record.amountPrecision),
      },
      {
        title: intl.get(`entity.company.name`).d('公司名称'),
        dataIndex: 'companyName',
        width: 180,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 180,
      },
      {
        title: intl.get(`sqam.common.date.requireFeedbackDate`).d('要求反馈日期'),
        dataIndex: 'feedbackDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`hzero.common.date.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createName',
        width: 120,
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const tableProps = {
      rowKey: 'formHeaderId',
      pagination,
      rowSelection,
      onChange: fetchClaim,
      bordered: true,
      dataSource: claimList,
      loading: fetchClaimLoading,
      columns,
      scroll: { x: scrollX },
    };
    return customizeTable(
      {
        code: 'SQAM.CREATE_CLAIM_LIST.GRID',
      },
      <Table {...tableProps} />
    );
  }
}
