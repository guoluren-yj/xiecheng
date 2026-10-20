import React, { PureComponent } from 'react';
import { Form, Checkbox } from 'hzero-ui';
import { sum, isNumber } from 'lodash';

import intl from 'utils/intl';
// import formatterCollections from 'utils/intl/formatterCollections';
import EditTable from 'components/EditTable';
import CPopover from '@/routes/sbid/components/CPopover';
import styles from './index.less';

export default class ProfessionalTable extends PureComponent {
  _renderTableList(title = '', _, dataList = []) {
    const { fetchExpertAllocationDataLoading } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.userName.`).d('专家子账户'),
        dataIndex: 'loginName',
        width: 150,
        render: val => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertName`).d('专家名称'),
        dataIndex: 'expertName',
        width: 150,
        render: val => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertLevel`).d('专家级别'),
        dataIndex: 'expertLevelMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertType`).d('专家类型'),
        dataIndex: 'expertTypeMeaning',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.leaderFlag`).d('专家组长'),
        dataIndex: 'leaderFlag',
        width: 150,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('leaderFlag', {
              initialValue: record.leaderFlag || 0,
            })(
              <Checkbox
                disabled
                defaultValue={record.leaderFlag}
                checkedValue={1}
                unCheckedValue={0}
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.evaluateLeaderFlag`).d('评标负责人'),
        dataIndex: 'evaluateLeaderFlag',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('evaluateLeaderFlag', {
                initialValue: val,
              })(<Checkbox checked={val} disabled />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        <div
          className={styles['item-list-search']}
          style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}
        >
          <h4>{title}</h4>
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
    const {
      scoringNoneExpert,
      scoringBusinessExpert,
      scoringTechnologyExpert,
      header,
    } = this.props;

    return (
      <React.Fragment>
        {header.bidRuleType === 'NONE' && this._renderTableList('', '', scoringNoneExpert)}
        {header.bidRuleType === 'DIFF' &&
          this._renderTableList(
            intl.get(`ssrc.bidHall.model.bidHall.businessTeam`).d('商务组'),
            'BUSINESS',
            scoringBusinessExpert
          )}
        {header.bidRuleType === 'DIFF' &&
          this._renderTableList(
            intl.get(`ssrc.bidHall.model.bidHall.technologyTeam`).d('技术组'),
            'TECHNOLOGY',
            scoringTechnologyExpert
          )}
      </React.Fragment>
    );
  }
}
