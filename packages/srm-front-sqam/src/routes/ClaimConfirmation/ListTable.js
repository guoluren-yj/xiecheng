import React, { PureComponent } from 'react';
import { Table, Tooltip } from 'hzero-ui';

import { dateTimeRender, yesOrNoRender, dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import styles from './index.less';
import yanqiImg from '@/assets/yanqi.svg';
import { thousandBitSeparator } from '@/routes/utils.js';

/**
 * 8D审核-数据列表展示
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
  unitCode: ['SQAM.CLAIM_CONFIRMATION_LIST.GRID'],
})
export default class ListTable extends PureComponent {
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

  render() {
    const { loading, dataSource, pagination, onChange, onDetail, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'statusCodeMeaning',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`sqam.common.model.claimNum`).d('索赔单号'),
        dataIndex: 'formNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => (
          <div className={styles['row-agent-column']}>
            <a onClick={() => onDetail(record)}>{val}</a>
            {record.overdueDays ? (
              <Tooltip
                title={`${intl.get(`sqam.common.view.message.overdueDays`).d('反馈延迟天数')}： ${
                  // record.overdueDays < 0
                  //   ? intl.get(`sqam.common.view.message.extended`).d('已超期')
                  `${record.overdueDays}${intl.get(`hzero.common.date.unit.day`).d('天')}`
                }
              `}
              >
                <img src={yanqiImg} alt="img" />
              </Tooltip>
            ) : null}
          </div>
        ),
      },
      {
        title: intl.get(`sqam.common.model.formTitle`).d('索赔单标题'),
        dataIndex: 'formTitle',
        width: 120,
      },
      {
        title: intl.get(`sqam.common.model.customCompany`).d('客户公司'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get(`sqam.common.date.requireFeedbackTime`).d('要求反馈时间'),
        dataIndex: 'feedbackDate',
        width: 130,
        render: dateTimeRender,
      },
      {
        title: intl.get(`sqam.common.view.message.autoConfirmFlag`).d('超期自动确认'),
        dataIndex: 'autoConfirmFlag',
        width: 130,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sqam.common.model.claimSum`).d('索赔总额'),
        dataIndex: 'totalAmount',
        width: 150,
        // render: (val) => numberRender(val, 2, false),
        render: (val, record) => thousandBitSeparator(val, record.amountPrecision),
      },
      {
        title: intl.get(`sqam.common.model.isToState`).d('是否申诉'),
        dataIndex: 'appealedFlag',
        width: 170,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`sqam.common.model.applyDeal`).d('申诉处理'),
        dataIndex: 'appealHandleActionMeaning',
        width: 100,
      },
      {
        title: intl.get(`sqam.common.model.common.claimReleaseDate`).d('索赔发布日期'),
        dataIndex: 'approvedDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sqam.common.model.common.releaseDay`).d('索赔进行天数'),
        dataIndex: 'releaseDays',
        width: 120,
        render: (val, record) => thousandBitSeparator(this.computedDays(record)),
      },
    ];
    return customizeTable(
      {
        code: 'SQAM.CLAIM_CONFIRMATION_LIST.GRID',
      },
      <Table
        bordered
        scroll={{ x: 1700 }}
        rowKey="problemHeaderId"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onChange(page)}
      />
    );
  }
}
