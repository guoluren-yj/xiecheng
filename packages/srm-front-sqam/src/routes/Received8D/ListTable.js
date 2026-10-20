import React, { PureComponent } from 'react';
import { Table, Popover, Tooltip } from 'hzero-ui';
import { sum } from 'lodash';
import { dateRender } from 'utils/renderer';
import yanqiImg from '@/assets/yanqi.svg';
import intl from 'utils/intl';
import rejectImg from '@/assets/problem_approve_reject.svg';
import { thousandBitSeparator } from '@/routes/utils.js';

const prefix = `sqam.common.model.qualityRectification`;
// const rejProblemStatus = ['NEW', 'ICA_SUBMITTED', 'PCA_SUBMITTED'];
// const rejApprovalProblemStatus = ['PUBULISH APPROVAE REJECT', 'CANCEL FINISH APPROVAL REJECT'];
const rejICAorPCA = ['ICA_REJECTED', 'PCA_REJECTED'];

/**
 * 我收到的8D-数据列表展示
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
    } = this.props;
    const columns = [
      {
        title: intl.get(`${prefix}.code`).d('整改报告编号'),
        dataIndex: 'problemNum',
        width: 150,
        fixed: true,
        render: (val, record) => {
          const icaDelayDays = `${intl.get(`${prefix}.icaDelayDays`).d('ICA累计延期')}/${intl
            .get(`hzero.common.date.unit.day`)
            .d('天')} : ${thousandBitSeparator(Number(record.icaDelayDays))}${intl
            .get(`hzero.common.date.unit.day`)
            .d('天')}`;
          const pcaDelayDays = `${intl.get(`${prefix}.pcaDelayDays`).d('PCA累计延期')}/${intl
            .get(`hzero.common.date.unit.day`)
            .d('天')} : ${thousandBitSeparator(Number(record.pcaDelayDays))}${intl
            .get(`hzero.common.date.unit.day`)
            .d('天')}`;
          return (
            <div>
              <a onClick={() => onDetail(record)}>{val}</a>
              {['PUBLISHED', 'ICA_REJECTED', 'PCA_FEEDBACKING', 'PCA_REJECTED'].includes(
                record.problemStatus
              ) &&
              (record.icaDelayDays > 0 || record.pcaDelayDays > 0) ? (
                <Tooltip
                  title={
                    <div>
                      {record.icaDelayDays > 0 && <p style={{ margin: 0 }}>{icaDelayDays}</p>}
                      {record.pcaDelayDays > 0 && <p style={{ margin: 0 }}>{pcaDelayDays}</p>}
                    </div>
                  }
                >
                  <img src={yanqiImg} alt="img" style={{ marginLeft: '5px' }} />
                </Tooltip>
              ) : null}
            </div>
          );
        },
      },
      {
        title: intl.get(`${prefix}.status`).d('状态'),
        dataIndex: 'problemStatusMeaning',
        width: 120,
        fixed: true,
        render: (val, record) => {
          const {
            problemStatus,
            approvedRemark,
            approvalActionCode,
            // approvalProblemStatus,
            // approvalProblemStatusMeaning,
          } = record;
          return (
            <div>
              {val}
              {rejICAorPCA.includes(approvalActionCode) && rejICAorPCA.includes(problemStatus) ? (
                <Tooltip title={approvedRemark}>
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
        fixed: true,
      },
      {
        title: intl.get(`${prefix}.issue`).d('问题类型'),
        dataIndex: 'problemTypeCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`entity.customer.tag`).d('客户'),
        dataIndex: 'companyName',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.clientInventory`).d('客户库存组织'),
        dataIndex: 'invOrganizationName',
        width: 110,
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
        title: intl.get(`sqam.common.view.common.relatedRectification`).d('关联整改报告'),
        dataIndex: 'associateNum',
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
        title: intl.get(`${prefix}.claimFormNum1`).d('关联索赔单号'),
        dataIndex: 'claimFormNum',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createdName',
        width: 100,
      },
      {
        title: intl.get('hzero.common.date.release').d('发布日期'),
        dataIndex: 'publishedDate',
        render: dateRender,
        width: 100,
      },
      {
        title: intl.get(`${prefix}.publishedName`).d('发布人'),
        dataIndex: 'publishedBy',
        width: 100,
        render: (_, record) => record.publishedName,
      },
      {
        title: intl.get(`${prefix}.attachmentUuid`).d('附件管理'),
        dataIndex: 'attachmentUuid',
        width: 100,
        align: 'center',
        render: (_, record) =>
          record.attachmentUuid || record.supplierAttachmentUuid ? (
            <a onClick={() => onAttachmentOption(record)}>
              {intl.get('entity.attachment.view').d('附件查看')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`${prefix}.rectifyTypeCodeMeaning`).d('整改单类型'),
        dataIndex: 'rectifyTypeCodeMeaning',
        width: 100,
      },
    ];
    const scroll = { x: sum(columns.map((n) => n.width)) };
    return customizeTable(
      {
        code: 'SQAM.RECEIVED_8D_LIST.GRID',
      },
      <Table
        bordered
        rowKey="problemHeaderId"
        scroll={scroll}
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onChange(page)}
      />
    );
  }
}
