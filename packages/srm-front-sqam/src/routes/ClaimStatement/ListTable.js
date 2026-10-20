import React, { PureComponent } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import EditTable from '_components/EditTable';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { thousandBitSeparator } from '@/routes/utils.js';

import rejectImg from '@/assets/problem_approve_reject.svg';

/**
 * 8D创建- 列表展示
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

@withCustomize({
  unitCode: ['SQAM.CLAIM_STATEMENT.GRID'],
})
export default class ListTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {remote, loading, dataSource, pagination, onChange, onDetail, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'statusCodeMeaning',
        width: 100,
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
        width: 180,
        render: (val, record) => <a onClick={() => onDetail(record)}>{val}</a>,
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
        title: intl.get('entity.supplier.code').d('供应商编码'),
        dataIndex: 'supplierCode',
        width: 120,
      },
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`sqam.common.model.claimSum`).d('索赔总额'),
        dataIndex: 'totalAmount',
        width: 120,
        render: (val, record) => thousandBitSeparator(val, record.amountPrecision),
      },
      {
        title: intl.get('entity.company.companyName').d('公司名称'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get('entity.organization.class.ouFlag').d('业务实体'),
        dataIndex: 'ouName',
        width: 100,
      },
      {
        title: intl.get('entity.organization.class.inventory').d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 100,
      },
      {
        title: intl.get('sqam.common.date.requireFeedbackDate').d('要求反馈日期'),
        dataIndex: 'feedbackDate',
        render: dateRender,
        width: 120,
      },
      {
        title: intl.get('sqam.common.date.statementDate').d('申诉日期'),
        dataIndex: 'appealedDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createName',
      },
    ];
    const rowSelection = remote.process("SSLM_CLAIM_STATEMENT_LIST_TABLE_ROW_SELECTION",null,{_this:this});
    return customizeTable(
      {
        code: 'SQAM.CLAIM_STATEMENT.GRID',
      }, 
      <EditTable
        bordered
        scroll={{ x: 1500 }}
        rowKey="formHeaderId"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        rowSelection={rowSelection}
        onChange={page => onChange(page)}
      />
    );
  }
}
