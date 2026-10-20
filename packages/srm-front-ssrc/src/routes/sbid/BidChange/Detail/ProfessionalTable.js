import React, { PureComponent } from 'react';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
// import formatterCollections from 'utils/intl/formatterCollections';
import EditTable from 'components/EditTable';
import CPopover from '@/routes/sbid/components/CPopover';
import styles from './index.less';
import { phoneRender } from '@/utils/renderer';

export default class ProfessionalTable extends PureComponent {
  _renderTableList(_, dataList = []) {
    const { fetchExpertAllocationDataLoading, header = {} } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.userName.`).d('专家子账户'),
        dataIndex: 'loginName',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertName`).d('专家名称'),
        dataIndex: 'expertName',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.duty`).d('职责'),
        dataIndex: 'evaluateLeaderFlagMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.currentScoringType`).d('本次评分类别'),
        dataIndex: 'teamMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertType`).d('专家类型'),
        dataIndex: 'expertTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.rfxPhone`).d('联系电话'),
        dataIndex: 'phone',
        render: (val, record) => phoneRender(record.internationalTelCodeMeaning, val),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.rfxEmail`).d('电子邮箱'),
        dataIndex: 'email',
        width: 165,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
    ];
    if (header.bidRuleType === 'NONE') {
      columns.splice(3, 1); // 删除评分类别
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
          scroll={{ x: scrollX }}
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
    const { evaluateExpertList = [], header } = this.props;

    return (
      <React.Fragment>
        {header.bidRuleType === 'NONE' && this._renderTableList('', evaluateExpertList)}
        {header.bidRuleType === 'DIFF' &&
          this._renderTableList('BUSINESS_TECHNOLOGY', evaluateExpertList)}
      </React.Fragment>
    );
  }
}
