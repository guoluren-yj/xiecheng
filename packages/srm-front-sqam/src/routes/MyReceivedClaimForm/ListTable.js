import React, { PureComponent } from 'react';
import { Table, Tooltip, Popover } from 'hzero-ui';
import { dateRender, dateTimeRender, yesOrNoRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { sum } from 'lodash';
import styles from './index.less';
import yanqiImg from '@/assets/yanqi.svg';
import { thousandBitSeparator } from '@/routes/utils.js';

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
  unitCode: ['SQAM.RECEIVED_CLAIM_FORM_LIST.GRID'],
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
        const beforeDate = new Date(approvedDate).getTime();
        const currentDate = new Date(cancelDate).getTime();
        const diffDay = currentDate - beforeDate;
        return Math.floor(diffDay / 24 / 3600 / 1000);
      } else {
        const beforeDate = new Date(approvedDate).getTime();
        const currentDate = new Date();
        const diffDay = currentDate.getTime() - beforeDate;
        return Math.floor(diffDay / 24 / 3600 / 1000);
      }
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onDetail, onSearch, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'statusCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.model.claimNum`).d('索赔单号'),
        dataIndex: 'formNum',
        width: 150,
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => onDetail(record)}>{val}</a>
            {record.overdueDays ? (
              <Tooltip
                title={`${intl.get(`${prefix}.view.message.overdueDays`).d('反馈延迟天数')}： ${
                  record.overdueDays < 0
                    ? intl.get(`${prefix}.view.message.extended`).d('已超期')
                    : `${record.overdueDays}${intl.get(`hzero.common.date.unit.day`).d('天')}`
                }
              `}
              >
                <img src={yanqiImg} alt="img" style={{ marginLeft: '5px' }} />
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
        title: intl.get(`${prefix}.model.claimType`).d('索赔类型'),
        dataIndex: 'claimTypeName',
        width: 100,
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCode',
        width: 100,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: intl.get(`${prefix}.model.claimSum`).d('索赔总额'),
        dataIndex: 'totalAmount',
        width: 125,
        render: (val, record) => thousandBitSeparator(val, record.amountPrecision),
      },
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
        title: intl.get(`sqam.common.model.customCompany`).d('客户公司'),
        dataIndex: 'companyName',
        width: 100,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 100,
      },
      {
        title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.date.requireFeedbackTime`).d('要求反馈时间'),
        dataIndex: 'feedbackDate',
        width: 120,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sqam.common.view.message.autoConfirmFlag`).d('超期自动确认'),
        dataIndex: 'autoConfirmFlag',
        width: 130,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${prefix}.date.realFeedbackDate`).d('实际反馈日期'),
        dataIndex: 'actualFeedbackDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`hzero.common.date.release`).d('发布日期'),
        dataIndex: 'approvedDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`${prefix}.model.common.releaseDays`).d('已发布天数'),
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
      },
      {
        title: intl.get(`${prefix}.model.common.dataSourceCode`).d('来源单号'),
        dataIndex: 'dataSourceNum',
        width: 200,
        render: (val) => (
          <Popover placement="topLeft" content={val}>
            {val}
          </Popover>
        ),
      },
      {
        title: intl.get(`${prefix}.model.common.executionBillNums`).d('索赔执行单据'),
        dataIndex: 'executionBillNum',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.model.resultDate`).d('索赔完成时间'),
        dataIndex: 'resultDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 100,
        render: dateTimeRender,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'createName',
        width: 100,
      },
    ];
    return customizeTable(
      {
        code: 'SQAM.RECEIVED_CLAIM_FORM_LIST.GRID',
      },
      <Table
        bordered
        scroll={{ x: sum(columns.map((n) => n.width)) + 100 }}
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page, size) => onSearch(page, size)}
      />
    );
  }
}
