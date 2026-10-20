import React, { PureComponent } from 'react';
import { Table, Popover, Tooltip } from 'hzero-ui';
import { sum } from 'lodash';
import { dateRender } from 'utils/renderer';
import yanqiImg from '@/assets/yanqi.svg';
import intl from 'utils/intl';
import { Button as PermissionButton } from 'components/Permission';
import rejectImg from '@/assets/problem_approve_reject.svg';
import { thousandBitSeparator } from '@/routes/utils.js';
import styles from './index.less';

const prefix = `sqam.common.model.qualityRectification`;
const rejProblemStatus = ['NEW', 'ICA_SUBMITTED', 'PCA_SUBMITTED', 'COMPLETED', 'VALIDATED'];
const rejApprovalProblemStatus = [
  'PUBULISH APPROVAE REJECT',
  'CANCEL FINISH APPROVAL REJECT',
  'TRACK APPROVAL REJECT',
];

/**
 * 我发起的8D-数据列表展示
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
      onCopy,
      loading,
      remote,
      dataSource,
      pagination,
      selectedRowKeys,
      onSelectRow,
      onChange,
      onDetail,
      showModal,
      customizeTable,
      onAttachmentOption,
    } = this.props;
    const _columns = [
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
          const { problemStatus, approvalProblemStatus, approvalProblemStatusMeaning } = record;
          return (
            <div>
              {val}
              {rejProblemStatus.includes(problemStatus) &&
              rejApprovalProblemStatus.includes(approvalProblemStatus) ? (
                <Tooltip title={approvalProblemStatusMeaning}>
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
        fixed: true,
        width: 180,
      },
      {
        title: intl.get(`${prefix}.validateResults`).d('验证结果'),
        dataIndex: 'validateResultFlagMeaning',
        width: 100,
        render: (val, record) =>
          record.problemStatus === 'VALIDATED' ? (
            <div>
              {val}
              {record.validateResultFlag === 0 && record.validateFailCount > 1 && (
                <span className={styles['triangle-up-validateResult']}>
                  <i className={styles.triangle} />
                  <span className={styles.validateFailCount}>{record.validateFailCount}</span>
                </span>
              )}
            </div>
          ) : null,
      },
      {
        title: intl.get(`${prefix}.issue`).d('问题类型'),
        dataIndex: 'problemTypeCodeMeaning',
        width: 100,
      },
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 150,
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
        title: intl.get(`sqam.common.view.common.relatedRectification`).d('关联整改报告'),
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
        title: intl.get(`${prefix}.claimFormNum`).d('关联索赔单号'),
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
        title: intl.get('hzero.common.date.creation').d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get('hzero.common.date.release').d('发布日期'),
        dataIndex: 'publishedDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${prefix}.publishedName`).d('发布人'),
        dataIndex: 'publishedBy',
        width: 100,
        render: (_, record) => record.publishedName,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'operation',
        width: 100,
        render: (_, record) => (
          <PermissionButton
            type="text"
            onClick={() => onCopy(record)}
            permissionList={[
              {
                code: `srm.sqam.business.problem.manage.initiated.button.copy`,
                type: 'button',
              },
            ]}
          >
            {intl.get('hzero.common.button.copy').d('复制')}
          </PermissionButton>
        ),
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
      {
        title: intl.get(`${prefix}.rectifyTypeCodeMeaning`).d('整改单类型'),
        dataIndex: 'rectifyTypeCodeMeaning',
        width: 100,
      },
    ];
    const columns = remote
      ? remote?.process('SQAM.INITIATED_8D_LIST_COLUMNS', _columns, {})
      : _columns;
    const scroll = { x: sum(columns.map((n) => n.width)) };
    return customizeTable(
      {
        code: 'SQAM.INITIATED_8D_LIST.GRID',
      },
      <Table
        bordered
        rowKey="problemHeaderId"
        scroll={scroll}
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
