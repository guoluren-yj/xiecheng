import React, { PureComponent } from 'react';
import { Table, Popover, Tooltip } from 'hzero-ui';
import { sum } from 'lodash';
import { dateRender, dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import rejectImg from '@/assets/problem_approve_reject.svg';
import { thousandBitSeparator } from '@/routes/utils.js';

const prefix = `sqam.common.model.qualityRectification`;
const rejProblemStatus = ['NEW', 'ICA_SUBMITTED', 'PCA_SUBMITTED'];
const rejApprovalProblemStatus = ['PUBULISH APPROVAE REJECT', 'CANCEL FINISH APPROVAL REJECT'];

/**
 * 8D创建-数据列表展示
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

export default class ListTable extends PureComponent {
  /**
   * 关联8D跳转
   * @param {!object} record - 8D对象
   */
  @Bind()
  handleEdit8D() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/audit8D/detail`,
      })
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource,
      pagination,
      onChange,
      onDetail,
      showModal,
      customizeTable,
      onAttachmentOption,
      selectedRowKeys,
      onSelectRow,
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
        title: intl.get(`${prefix}.status`).d('整改报告状态'),
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
        width: 120,
        fixed: true,
      },
      {
        title: intl.get(`${prefix}.icaDemandDate`).d('ICA要求时间'),
        dataIndex: 'icaDemandDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${prefix}.openDays`).d('开放天数'),
        dataIndex: 'openDays',
        render: (text) => thousandBitSeparator(Number(text)),
        width: 90,
      },
      {
        title: `${intl.get(`${prefix}.icaDelayDays`).d('ICA累计延期')}/${intl
          .get(`hzero.common.date.unit.day`)
          .d('天')}`,
        dataIndex: 'icaDelayDays',
        width: 150,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${prefix}.pcaDemandDate`).d('PCA要求日期'),
        dataIndex: 'pcaDemandDate',
        width: 170,
        render: dateRender,
      },
      {
        title: `${intl.get(`${prefix}.pcaDelayDays`).d('PCA累计延期')}/${intl
          .get(`hzero.common.date.unit.day`)
          .d('天')}`,
        dataIndex: 'pcaDelayDays',
        width: 140,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${prefix}.issue`).d('问题类型'),
        dataIndex: 'problemTypeCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 100,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
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
        title: intl.get(`sqam.common.model.common.relatedRectification`).d('关联整改报告'),
        dataIndex: 'associateProblemNums',
        width: 120,
        render: (val, record) => <a onClick={() => showModal(record.problemHeaderId)}>{val}</a>,
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
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get('hzero.common.date.release').d('发布日期'),
        dataIndex: 'publishedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${prefix}.publishedName`).d('发布人'),
        dataIndex: 'publishedBy',
        width: 100,
        render: (_, record) => record.publishedName,
      },
      {
        title: intl.get(`${prefix}.rectifyTypeCodeMeaning`).d('整改单类型'),
        dataIndex: 'rectifyTypeCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.attachmentUuid`).d('附件管理'),
        dataIndex: 'attachmentUuid',
        width: 100,
        align: 'center',
        render: (_, record) =>
          record.attachmentUuid || record.supplierAttachmentUuid ? (
            <a onClick={() => onAttachmentOption(record)}>
              {intl.get(`${prefix}.attachmentUuid`).d('附件管理')}
            </a>
          ) : null,
      },
    ];
    return customizeTable(
      {
        code: 'SQAM.AUDIT_8D_LIST.GRID',
      },
      <Table
        bordered
        scroll={{ x: sum(columns.map((n) => n.width)) }}
        rowKey="problemHeaderId"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onChange(page)}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectRow,
        }}
      />
    );
  }
}
