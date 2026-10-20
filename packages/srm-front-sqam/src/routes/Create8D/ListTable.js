import React, { PureComponent } from 'react';
import { Table, Popover, Tooltip } from 'hzero-ui';
import { dateRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import rejectImg from '@/assets/problem_approve_reject.svg';

const prefix = `sqam.common.model.qualityRectification`;
const rejProblemStatus = ['NEW', 'ICA_SUBMITTED', 'PCA_SUBMITTED'];
const rejApprovalProblemStatus = ['PUBULISH APPROVAE REJECT', 'CANCEL FINISH APPROVAL REJECT'];

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
  unitCode: ['SQAM.CREATE_8D_LIST.GRID'],
})
export default class ListTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource,
      selectedRowKeys,
      pagination,
      onChange,
      onDetail,
      showModal,
      onSelectRow,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${prefix}.code`).d('整改报告编号'),
        dataIndex: 'problemNum',
        width: 150,
        fixed: true,
        render: (val, record) => <a onClick={() => onDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`${prefix}.status`).d('状态'),
        dataIndex: 'problemStatusMeaning',
        width: 120,
        fixed: true,
        render: (val, record) => {
          const { problemStatus, approvalProblemStatus, approvalProblemStatusMeaning } = record;
          return (
            <div>
              {val}
              {rejProblemStatus.includes(problemStatus) &&
              rejApprovalProblemStatus.includes(approvalProblemStatus) ? (
                <Tooltip title={<div>{approvalProblemStatusMeaning}</div>}>
                  <img style={{ marginLeft: 5 }} src={rejectImg} alt="img" />
                </Tooltip>
              ) : null}
            </div>
          );
        },
      },
      {
        title: intl.get(`${prefix}.title`).d('整改报告标题'),
        dataIndex: 'problemTitle',
        width: 180,
      },
      {
        title: intl.get(`${prefix}.issue`).d('问题类型'),
        dataIndex: 'problemTypeCodeMeaning',
        width: 100,
      },

      {
        title: intl.get(`${prefix}.significance`).d('重视度'),
        dataIndex: 'problemImportanceCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.urgency`).d('紧急度'),
        dataIndex: 'problemUrgencyCodeMeaning',
        width: 120,
      },
      {
        title: intl.get('sqam.common.model.common.relatedRectification').d('关联整改报告'),
        width: 120,
        dataIndex: 'associateProblemNums',
        render: (val, record) => <a onClick={() => showModal(record.problemHeaderId)}>{val}</a>,
      },
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
      },
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get('entity.organization.class.inventory').d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 100,
      },
      {
        title: intl.get('entity.item.code').d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get('entity.item.name').d('物料名称'),
        dataIndex: 'itemName',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.dataSource`).d('创建方式'),
        dataIndex: 'sourceCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.sourceNum`).d('来源单据编号'),
        dataIndex: 'sourceNum',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'createdName',
        width: 150,
      },
      {
        title: intl.get('hzero.common.date.creation').d('创建日期'),
        dataIndex: 'creationDate',
        render: dateRender,
      },
      {
        title: intl.get(`${prefix}.rectifyTypeCodeMeaning`).d('整改单类型'),
        dataIndex: 'rectifyTypeCodeMeaning',
        width: 100,
      },
    ];
    return customizeTable(
      {
        code: 'SQAM.CREATE_8D_LIST.GRID',
      },
      <Table
        bordered
        scroll={{ x: 2000 }}
        rowKey="problemHeaderId"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectRow,
        }}
        onChange={(page) => onChange(page)}
      />
    );
  }
}
