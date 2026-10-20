/**
 * rfx维护－专家
 * @date: 2019-08-07
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { phoneRender } from '@/utils/renderer';
import CPopover from '@/routes/ssrc/components/CPopover';
import styles from './index.less';

export default class ProfessionalTable extends PureComponent {
  _renderTableList(_, dataList = []) {
    const { fetchExpertAllocationDataLoading, header = {} } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertSubAccount`).d('专家子账户'),
        dataIndex: 'loginName',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertName`).d('专家姓名'),
        dataIndex: 'expertName',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.duty`).d('职责'),
        dataIndex: 'evaluateLeaderFlagMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.currentScoringType`).d('本次评分类别'),
        dataIndex: 'teamMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertType`).d('专家类型'),
        dataIndex: 'expertTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxPhone`).d('联系电话'),
        dataIndex: 'phone',
        width: 200,
        render: (value, record) => phoneRender(record.internationalTelCodeMeaning, value),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxEmail`).d('电子邮箱'),
        dataIndex: 'email',
        width: 165,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
    ];
    if (header.bidRuleType === 'NONE') {
      columns.splice(3, 1);
    }

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        <div
          className={styles['item-list-search']}
          style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}
        >
          <span />
        </div>
        <EditTable
          bordered
          rowKey="evaluateExpertId"
          loading={fetchExpertAllocationDataLoading}
          columns={columns}
          scroll={{ x: scrollX, y: 360 }}
          dataSource={dataList}
          pagination={false}
        />
      </React.Fragment>
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { evaluateExpertList, header } = this.props;

    return (
      <React.Fragment>
        {header.bidRuleType === 'NONE' && this._renderTableList('', evaluateExpertList)}
        {header.bidRuleType !== 'NONE' &&
          this._renderTableList('BUSINESS_TECHNOLOGY', evaluateExpertList)}
      </React.Fragment>
    );
  }
}
