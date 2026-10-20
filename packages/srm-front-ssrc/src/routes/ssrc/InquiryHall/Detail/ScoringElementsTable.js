/**
 * rfx维护－评分要素
 * @date: 2019-08-07
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Modal, Checkbox, Popover } from 'hzero-ui';
import { sum, isNumber } from 'lodash';

import { scoreIntervalRender } from '@/utils/renderer';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import styles from './index.less';

export default class ScoringElementsTable extends PureComponent {
  /**
   * 显示权重
   *
   * @param {*} [dataLists=[]]
   * @returns
   * @memberof ScoringElementsTable
   */
  renderWeight(type = '', dataLists = []) {
    if (!dataLists.length || !type) {
      return null;
    }

    const weightType = this.getWeightType(type);
    const hasWeight = dataLists.filter((data) => data && weightType in data);
    if (!hasWeight) {
      return null;
    }

    const ScoreElementWeight = hasWeight[0][weightType] || 0;

    return (
      <div>
        {intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')} : &nbsp;{' '}
        {ScoreElementWeight}%
      </div>
    );
  }

  /**
   * 判断权重的类型
   *
   * @param {string} [title='']
   * @returns
   * @memberof ScoringElementsTable
   */
  getWeightType(title = '') {
    let type = '';
    switch (title) {
      case 'BUSINESS':
        type = 'businessWeight';
        break;
      case 'TECHNOLOGY':
        type = 'technologyWeight';
        break;
      default:
        type = 'weight';
        break;
    }

    return type;
  }

  /**
   * 渲染要素细项内容
   */
  renderIndicateContent(content) {
    return <Popover content={content}>{content}</Popover>;
  }

  _renderTableList(title = '', type = '', dataLists = []) {
    const { loading, openAssignExpertModal } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateDetail`).d('要素细项'),
        dataIndex: 'indicateName',
        width: 200,
        render: (text, record) => {
          if (record.indicateLevel === 'ONE' && record.detailEnabledFlag) {
            return {
              children: this.renderIndicateContent(
                record.indicateRemark
                  ? `${record.indicateName}（${record.indicateRemark}）`
                  : record.indicateName
              ),
              props: {
                colSpan: 2,
              },
            };
          }
          return this.renderIndicateContent(
            record.indicateRemark
              ? `${record.indicateName}（${record.indicateRemark}）`
              : record.indicateName
          );
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoringInterval`).d('评分区间'),
        dataIndex: 'scoringInterval',
        width: 100,
        render: (val, record) => {
          if (record.indicateLevel === 'ONE' && record.detailEnabledFlag) {
            return {
              children:
                record.indicateType === 'SCORE'
                  ? scoreIntervalRender(record.minScore, record.maxScore)
                  : '-',
              props: {
                colSpan: 0,
              },
            };
          }
          return scoreIntervalRender(record.minScore, record.maxScore);
        },
      },
      {
        title: <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}%</span>,
        dataIndex: 'weight',
        width: 100,
        align: 'right',
        render: (val, record) => (
          <React.Fragment>{record.indicateType === 'SCORE' ? val : '-'}</React.Fragment>
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertAllocation`).d('专家分配'),
        dataIndex: 'action',
        width: 100,
        render: (val, record) =>
          record.indicateLevel === 'ONE' ? (
            <Form.Item>
              <a onClick={() => openAssignExpertModal(record)}>
                {intl.get(`ssrc.inquiryHall.view.message.button.view`).d('查看')}
              </a>
            </Form.Item>
          ) : (
            ''
          ),
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        <div
          className={styles['item-list-search']}
          style={{ display: 'flex', justifyContent: 'start', marginTop: '20px' }}
        >
          <h4 style={{ marginRight: title ? '40px' : '' }}>{title}</h4>
          {this.renderWeight(type, dataLists)}
        </div>
        <EditTable
          bordered
          rowKey="evaluateIndicId"
          loading={loading}
          columns={columns}
          pagination={false}
          scroll={{ x: scrollX }}
          dataSource={dataLists}
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
      header,
      scoringNoneTempelate,
      scoringBusinessTempelate,
      scoringTechnologyTempelate,
      evaluateAssignModalVisible,
      cancelAssignExpert,
      currentScoringExperts,
      fetchEvaluateIndicAssignLoading,
    } = this.props;

    const expertColumns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertSubAccount`).d('专家子账户'),
        dataIndex: 'loginName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertName`).d('专家姓名'),
        dataIndex: 'expertName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherAssign`).d('是否分配'),
        dataIndex: 'assignFlag',
        width: 100,
        align: 'center',
        render: (val, record) => (
          <React.Fragment>
            <Form.Item>
              {record.$form.getFieldDecorator('assignFlag', {
                initialValue: record.assignFlag,
              })(
                <Checkbox
                  disabled
                  defaultValue={record.assignFlag}
                  checkedValue={1}
                  unCheckedValue={0}
                />
              )}
            </Form.Item>
          </React.Fragment>
        ),
      },
    ];

    const scrollX = sum(expertColumns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        {header.bidRuleType === 'NONE' && this._renderTableList('', '', scoringNoneTempelate)}
        {header.bidRuleType === 'DIFF' &&
          this._renderTableList(
            intl.get(`ssrc.inquiryHall.model.inquiryHall.businessTeam`).d('商务组'),
            'BUSINESS',
            scoringBusinessTempelate
          )}
        {header.bidRuleType === 'DIFF' &&
          this._renderTableList(
            intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyTeam`).d('技术组'),
            'TECHNOLOGY',
            scoringTechnologyTempelate
          )}
        <Modal
          visible={evaluateAssignModalVisible}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.assignExpert`).d('分配专家')}
              </span>
            </div>
          }
          footer={null}
          onCancel={cancelAssignExpert}
        >
          <Form>
            <EditTable
              bordered
              columns={expertColumns}
              rowKey="evaluateExpertId"
              loading={fetchEvaluateIndicAssignLoading}
              dataSource={currentScoringExperts}
              srcoll={{ x: scrollX, y: 360 }}
              pagination={false}
            />
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}
