import React, { PureComponent } from 'react';
import { Table, Tooltip } from 'hzero-ui';
import { Modal } from 'choerodon-ui/pro';
import { dateRender, dateTimeRender, yesOrNoRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { sum } from 'lodash';
import styles from './index.less';
import abnormal from '@/assets/abnormal.svg';
import { thousandBitSeparator } from '@/routes/utils.js';
import ExecuteCondition from '@/routes/components/ExecuteCondition';

const prefix = `sqam.common`;

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
  unitCode: ['SQAM.CLAIM_CERTIFIED_LIST.LIST'],
})
export default class ListTable extends PureComponent {
  @Bind()
  computedDays(record) {
    const { statusCode, cancelDate, approvedDate, confirmedDate } = record;
    if (approvedDate) {
      if (confirmedDate) {
        const beforeDate = new Date(approvedDate).getTime();
        const currentDate = new Date(confirmedDate);
        const diffDay = currentDate.getTime() - beforeDate;
        return Math.floor(diffDay / 24 / 3600 / 1000);
      } else if (statusCode === 'CANCELLED') {
        const beforeDate = new Date(cancelDate).getTime();
        const currentDate = new Date();
        const diffDay = currentDate.getTime() - beforeDate;
        return Math.floor(diffDay / 24 / 3600 / 1000);
      } else {
        const beforeDate = new Date(approvedDate).getTime();
        const currentDate = new Date();
        const diffDay = currentDate.getTime() - beforeDate;
        return Math.floor(diffDay / 24 / 3600 / 1000);
      }
    }
  }

  // 点击查看执行情况
  @Bind()
  checkExecuteCondition = (record) => {
    Modal.open({
      drawer: true,
      key: Modal.key(),
      closable: true,
      className: styles['execute-modal'],
      style: {
        width: 1000,
        padding: 0,
      },
      title: `${intl.get(`sqam.common.view.message.executeCondition`).d('索赔单执行情况')} ${
        record.formNum
      }`,
      children: <ExecuteCondition record={record} />,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      okCancel: false,
    });
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const {remote, loading, dataSource, pagination, onDetail, onSearch, customizeTable, onRowSelectChange } = this.props;
    const columns = [
      {
        title: intl.get(`${prefix}.model.claimNum`).d('索赔单号'),
        dataIndex: 'formNum',
        fixed: 'left',
        width: 150,
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => onDetail(record)}>{val}</a>
            {record.executionBillData ? (
              <Tooltip title={record.executionBillData}>
                <img src={abnormal} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`sqam.common.model.formTitle`).d('索赔单标题'),
        dataIndex: 'formTitle',
        width: 250,
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'statusCodeMeaning',
        width: 100,
        // render: val => (<Popover content={val}>{val}</Popover>),
      },

      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        // render: val => (<Popover content={val}>{val}</Popover>),
      },
      {
        title: intl.get(`${prefix}.model.claimSum`).d('索赔总额'),
        dataIndex: 'totalAmount',
        width: 100,
        render: (val, record) => thousandBitSeparator(val, record.amountPrecision),
      },
      {
        title: intl.get(`${prefix}.model.expenseProcessType`).d('费用处理方式'),
        dataIndex: 'expenseProcessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`${prefix}.model.resultDate`).d('索赔完成时间'),
        dataIndex: 'resultDate',
        width: 180,
      },
      {
        title: intl.get(`${prefix}.model.claimType`).d('索赔类型'),
        dataIndex: 'claimTypeName',
        width: 100,
        // render: val => (<Popover content={val}>{val}</Popover>),
      },
      // {
      //   title: intl.get(`entity.supplier.code`).d('供应商编码'),
      //   dataIndex: 'supplierCode',
      //   width: 120,
      // },
      {
        title: intl.get(`${prefix}.model.isToState`).d('是否申诉'),
        dataIndex: 'appealedFlag', // 1 为已申诉，0 为未申诉
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${prefix}.panel.statementContent`).d('申诉内容'),
        dataIndex: 'appealContentMeaning',
        width: 100,
        // render: val => (<Popover content={val}>{val}</Popover>),
      },
      {
        title: intl.get(`${prefix}.model.applyTimes`).d('申诉次数'),
        dataIndex: 'appealedSum',
        width: 100,
        render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${prefix}.model.applyDeal`).d('申诉处理'),
        dataIndex: 'appealHandleActionMeaning',
        width: 100,
      },
      {
        title: intl.get(`entity.company.name`).d('公司名称'),
        dataIndex: 'companyName',
        // render: val => (<Popover content={val}>{val}</Popover>),
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 100,
        // render: val => (<Popover content={val}>{val}</Popover>),
      },
      {
        title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 100,
        // render: val => (<Popover content={val}>{val}</Popover>),
      },
      {
        title: intl.get(`${prefix}.date.requireFeedbackDate`).d('要求反馈日期'),
        dataIndex: 'feedbackDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${prefix}.date.realFeedbackDate`).d('实际反馈日期'),
        dataIndex: 'actualFeedbackDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`hzero.common.date.release`).d('发布日期'),
        dataIndex: 'approvedDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`${prefix}.model.common.releaseDay`).d('索赔进行天数'),
        dataIndex: 'releaseDays',
        width: 120,
        render: (val, record) => thousandBitSeparator(this.computedDays(record)),
      },
      {
        title: intl.get(`${prefix}.model.common.confirmedDate`).d('确认日期'),
        dataIndex: 'confirmedDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`${prefix}.date.statementDate`).d('申诉日期'),
        dataIndex: 'appealedDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`${prefix}.date.statementDealDate`).d('申诉处理日期'),
        dataIndex: 'appealHandledDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${prefix}.model.common.feedbackOpinion`).d('确认说明'),
        dataIndex: 'feedbackOpinion',
        width: 100,
        // render: val => (<Popover content={val}>{val}</Popover>),
      },
      {
        title: intl.get(`${prefix}.model.common.executionBillNum`).d('扣款单编号'),
        dataIndex: 'executionBillNum',
        width: 150,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createName',
        // width: 100,
      },
      {
        title: intl.get(`hzero.common.button.watchDetails`).d('查看执行情况'),
        dataIndex: 'executeCondition',
        width: 140,
        render: (val, record) => (
          <a
            onClick={() => {
              this.checkExecuteCondition(record);
            }}
          >
            {intl.get(`hzero.common.button.look`).d('查看')}
          </a>
        ),
      },
    ];
    const rowSelection = remote?remote.process("SQAM_CLAIM_CERTIFIED_FINAL_LIST_TABLE_ROW_SELECTION",null,{onRowSelectChange}):null;
    return customizeTable(
      {
        code: 'SQAM.CLAIM_CERTIFIED_LIST.LIST',
      },
      <Table
        bordered
        scroll={{ x: sum(columns.map((n) => n.width)) + 300 }}
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        rowSelection={rowSelection}
        onChange={(page, size) => onSearch(page, size)}
      />
    );
  }
}
