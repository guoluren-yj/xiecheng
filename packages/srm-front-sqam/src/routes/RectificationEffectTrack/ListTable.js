import React, { PureComponent } from 'react';
import { Table, Popover, Tooltip } from 'hzero-ui';
import { Link } from 'dva/router';
import { dateRender, dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import rejectImg from '@/assets/problem_approve_reject.svg';
import styles from './index.less';

const prefix = 'sqam.common.model.qualityRectification';
const rejProblemStatus = ['NEW', 'ICA_SUBMITTED', 'PCA_SUBMITTED', 'COMPLETED', 'VALIDATED'];
const rejApprovalProblemStatus = [
  'PUBULISH APPROVAE REJECT',
  'CANCEL FINISH APPROVAL REJECT',
  'TRACK APPROVAL REJECT',
];

export default class ListTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onChange, showModal, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get(`${prefix}.code`).d('整改报告编号'),
        dataIndex: 'problemNum',
        width: 150,
        fixed: true,
        render: (val, record) => (
          <Link to={`/sqam/rectification-effect-track/detail/${record.problemHeaderId}`}>
            {val}
          </Link>
        ),
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'problemStatusMeaning',
        fixed: true,
        width: 120,
        render: (val, { problemStatus, approvalProblemStatus, approvalProblemStatusMeaning }) => (
          <div>
            {val}
            {rejProblemStatus.includes(problemStatus) &&
            rejApprovalProblemStatus.includes(approvalProblemStatus) ? (
              <Tooltip title={approvalProblemStatusMeaning}>
                <img style={{ marginLeft: 5 }} src={rejectImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`${prefix}.validationResults`).d('验证结果'),
        dataIndex: 'validateResultFlagMeaning',
        fixed: true,
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
        title: intl.get(`${prefix}.validateDate`).d('验证时间'),
        dataIndex: 'validateDate',
        width: 100,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${prefix}.title`).d('整改报告标题'),
        dataIndex: 'problemTitle',
        width: 180,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 180,
      },
      {
        title: intl.get(`${prefix}.issue`).d('问题类型'),
        dataIndex: 'problemTypeCode',
        render: (val, record) => <span>{record.problemTypeCodeMeaning}</span>,
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
        title: intl
          .get(`sqam.common.view.message.tab.correlationRectification`)
          .d('关联质量整改报告'),
        width: 150,
        dataIndex: 'associateProblemNums',
        render: (val, record) => <a onClick={() => showModal(record.problemHeaderId)}>{val}</a>,
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
        title: intl.get('hzero.common.date.creation').d('创建日期'),
        dataIndex: 'creationDate',
        render: dateRender,
      },
      {
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'createdName',
        width: 180,
      },
      {
        title: intl.get(`${prefix}.rectifyTypeCodeMeaning`).d('整改单类型'),
        dataIndex: 'rectifyTypeCodeMeaning',
        width: 100,
      },
    ];
    return customizeTable(
      {
        code: 'SQAM.EFFECT_TRACK_LIST.GRID',
      },
      <Table
        bordered
        scroll={{ x: 2000 }}
        // rowKey="problemHeaderId"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onChange(page)}
      />
    );
  }
}
