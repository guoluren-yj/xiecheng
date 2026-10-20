/**
 * inquiryHall - 确认中标候选人 - 评分明细Modal
 * @date: 2019-07-02
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Table, Popover, Tabs } from 'hzero-ui';
import { sum, isNumber, isEmpty } from 'lodash';
import uuidv4 from 'uuid/v4';
// import { Bind } from 'lodash-decorators';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { scoreIntervalRender } from '@/utils/renderer';

const { TabPane } = Tabs;

@formatterCollections({ code: ['ssrc.inquiryHall'] })
export default class ScoreDetailModal extends Component {
  /**
   * 渲染数据
   * @param {Array} dataSource 待处理数据列表
   * @param {String} type 类型
   */
  renderDataSource(dataSource, type) {
    const { scoreDetailList = {} } = this.props;
    if (isEmpty(dataSource)) return;
    let newDataSource = [];
    dataSource.forEach((item) => {
      // 有一级要素且存在二级要素
      if (item.detailEnabledFlag) {
        const { evaluateScoreLineDtlList = [], ...otherItems } = item;
        // 二级要素
        const newLine = evaluateScoreLineDtlList.map((lineItem) => {
          return {
            ...lineItem,
            indicateName: lineItem.twoIndicateName,
            maxScore: lineItem.twoMaxScore,
            minScore: lineItem.twoMinScore,
            weight: lineItem.twoWeight,
            remark: lineItem.twoRemark,
            indicScore: lineItem.twoIndicateScore,
          };
        });
        newDataSource = [
          ...newDataSource,
          {
            // 一级要素
            ...otherItems,
            evaluateDetailId: uuidv4(),
          },
          ...newLine,
          {
            indicateName: intl.get('ssrc.inquiryHall.model.inquiryHall.subtotal').d('小计'),
            indicateType: 'SCORE',
            indicScore: otherItems.summary,
            evaluateDetailId: uuidv4(),
          },
        ];
      } else {
        // 只有一级要素
        newDataSource = [...newDataSource, { ...item, evaluateDetailId: uuidv4() }];
      }
    });
    return [
      ...newDataSource,
      {
        indicateName: intl.get('ssrc.inquiryHall.model.inquiryHall.total').d('总计'),
        indicateType: 'SCORE',
        indicScore: scoreDetailList[`${type}Total`],
        evaluateDetailId: uuidv4(),
      },
    ];
  }

  /**
   * 渲染要素细项内容
   */
  renderIndicateContent(content) {
    return <Popover content={content}>{content}</Popover>;
  }

  render() {
    const {
      loading,
      scoreDetailModalVisible,
      cancelScoreDetailModal,
      scoreDetailList = {},
    } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateDetail`).d('要素细项'),
        dataIndex: 'indicateName',
        width: 150,
        render: (text, record) => {
          if (record.indicateLevel === 'ONE' && record.detailEnabledFlag) {
            // 一级要素且有二级要素
            return {
              children: this.renderIndicateContent(
                record.remark ? `${record.indicateName}（${record.remark}）` : record.indicateName
              ),
              props: {
                colSpan: 3,
              },
            };
          }
          if (!record.indicateLevel && !record.detailEnabledFlag) {
            // 小计或者总计列
            return {
              children: <Popover content={text}>{text}</Popover>,
              props: {
                colSpan: 2,
              },
            };
          }
          return this.renderIndicateContent(
            record.remark ? `${record.indicateName}（${record.remark}）` : record.indicateName
          );
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoringInterval`).d('评分区间'),
        dataIndex: 'scoringInterval',
        width: 100,
        render: (text, record) => {
          if (record.indicateLevel === 'ONE' && record.detailEnabledFlag) {
            // 一级要素且有二级要素
            return {
              children: scoreIntervalRender(record.minScore, record.maxScore),
              props: {
                colSpan: 0,
              },
            };
          }
          if (!record.indicateLevel && !record.detailEnabledFlag) {
            // 小计或者总计列
            return {
              children: <Popover content={text}>{text}</Popover>,
              props: {
                colSpan: 0,
              },
            };
          }
          // 只有一级要素，当一级要素为通过制，显示-
          return record.indicateType !== 'PASS'
            ? scoreIntervalRender(record.minScore, record.maxScore)
            : '-';
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierScore`).d('供应商分数'),
        dataIndex: 'indicScore',
        width: 100,
        render: (val, record) => {
          const { passStatusMeaning } = record || {};
          if (record.indicateLevel === 'ONE' && record.detailEnabledFlag) {
            // 一级要素且有二级要素
            return {
              children: val,
              props: {
                colSpan: 0,
              },
            };
          }
          // 只有一级要素，当一级要素为通过制，显示passStatusMeaning
          return record.indicateType !== 'PASS'
            ? val && val.toFixed(2)
            : passStatusMeaning && typeof passStatusMeaning === 'number'
            ? passStatusMeaning.toFixed(2)
            : null;
        },
      },
      {
        title: <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}%</span>,
        dataIndex: 'weight',
        width: 100,
        render: (val, record) => (record.indicateType !== 'PASS' ? val : '-'),
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <Modal
        width={700}
        bodyStyle={{ padding: '8px 24px 24px' }}
        visible={scoreDetailModalVisible}
        title={intl.get(`ssrc.inquiryHall.model.inquiryHall.scoringView`).d('评分查看')}
        footer={false}
        onCancel={cancelScoreDetailModal}
      >
        {scoreDetailList.sourceRuleType === 'DIFF' ? (
          <Tabs defaultActiveKey="business" onChange={this.changeTabs} animated={false}>
            <TabPane
              tab={intl.get('ssrc.inquiryHall.view.tab.businessGroup').d('商务组')}
              key="business"
            >
              <Table
                bordered
                loading={loading}
                columns={columns}
                rowKey="evaluateDetailId"
                dataSource={
                  this.renderDataSource(scoreDetailList.businessScoreLineList, 'business') || []
                }
                srcoll={{ x: scrollX }}
                pagination={false}
              />
            </TabPane>
            <TabPane
              tab={intl.get('ssrc.inquiryHall.view.tab.technicalGroup').d('技术组')}
              key="technology"
            >
              <Table
                bordered
                loading={loading}
                columns={columns}
                rowKey="evaluateDetailId"
                dataSource={
                  this.renderDataSource(scoreDetailList.technologyScoreLineList, 'technology') || []
                }
                srcoll={{ x: scrollX }}
                pagination={false}
              />
            </TabPane>
          </Tabs>
        ) : (
          <Table
            bordered
            loading={loading}
            columns={columns}
            rowKey="evaluateDetailId"
            dataSource={this.renderDataSource(scoreDetailList.syncScoreLineList, 'sync') || []}
            srcoll={{ x: scrollX }}
            pagination={false}
          />
        )}
      </Modal>
    );
  }
}
