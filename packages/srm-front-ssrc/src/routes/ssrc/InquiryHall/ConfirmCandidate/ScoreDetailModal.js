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
import { Bind } from 'lodash-decorators';
import remoteHoc from 'hzero-front/lib/utils/remote';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getContentScrollHeight } from '@/utils/utils';
import {
  scoreIntervalRender,
  getZeroTrue,
  renderExpertPass,
  zeroAmountScoreRender,
} from '@/utils/renderer';

const { TabPane } = Tabs;

@remoteHoc({
  code: 'SSRC_SCORE_DETAIL_MODAL',
  name: 'scoreRemote',
})
@formatterCollections({ code: ['ssrc.inquiryHall', 'scux.ssrc'] })
export default class ScoreDetailModal extends Component {
  /**
   * 渲染数据
   * @param {Array} dataSource 待处理数据列表
   * @param {String} type 类型
   */
  @Bind()
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
        indicateName: intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总'),
        indicateType: 'SCORE',
        indicScore:
          type === 'sync'
            ? scoreDetailList?.sumPassStatus || scoreDetailList[`${type}Total`]
            : scoreDetailList[`${type}PassStatus`] || scoreDetailList[`${type}Total`],
        evaluateDetailId: uuidv4(),
        approvedCount:
          type === 'sync' ? scoreDetailList.approvedCount : scoreDetailList[`${type}ApprovedCount`],
      },
    ];
  }

  /**
   * 渲染要素细项内容
   */
  renderIndicateContent(content) {
    return <Popover content={content}>{content}</Popover>;
  }

  // 供应商分数标题
  renderSupplierTitle = (type = '') => {
    const { scoreDetailList = {} } = this.props;
    let list = [];
    if (type === 'business') {
      list = this.renderDataSource(scoreDetailList.businessScoreLineList, 'business') || [];
    } else if (type === 'technology') {
      list = this.renderDataSource(scoreDetailList.technologyScoreLineList, 'technology') || [];
    } else if (type === 'sync') {
      list = this.renderDataSource(scoreDetailList.syncScoreLineList, 'sync') || [];
    }
    if (!list || !list.length) {
      return intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierScore`).d('供应商分数');
    }

    switch (list[0].supplierScoreTitle) {
      case 'SCORE':
        return intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierScore`).d('供应商分数');
      case 'SCORE_PASS':
        return `${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierScore`)
          .d('供应商分数')}(${intl
          .get(`ssrc.inquiryHall.model.inquiryHall.whetherPassed`)
          .d('是否通过')})`;
      case 'PASS':
        return intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherPassed`).d('是否通过');
      default:
        return intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierScore`).d('供应商分数');
    }
  };

  getCloumns(type = '') {
    const { scoreRemote } = this.props;

    let columns = [
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
        title: this.renderSupplierTitle(type),
        dataIndex: 'indicScore',
        width: 140,
        render: (val, record) => {
          if (Number(record.zeroAmountScoreFlag)) return zeroAmountScoreRender();
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
          return record.indicateType !== 'PASS' ? (
            typeof val === 'number' ? (
              val && val.toFixed(2)
            ) : (
              <span style={{ color: getZeroTrue(record?.approvedCount) ? 'red' : '' }}>{val}</span>
            )
          ) : record.passStatusMeaning ? (
            typeof record.passStatusMeaning === 'number' ? (
              record.passStatusMeaning.toFixed(2)
            ) : (
              renderExpertPass(record) || record.passStatusMeaning
            )
          ) : null;
        },
      },
      {
        title: <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}%</span>,
        dataIndex: 'weight',
        width: 100,
        render: (val, record) => (record.indicateType !== 'PASS' ? val : '-'),
      },
    ];

    columns = scoreRemote ? scoreRemote.process('SSRC_SCORE_DETAIL_MODAL_PROCESS_MODAL_TABLE_COLUMNS', columns, {
      type,
      that: this,
    }) : columns;
    columns = (columns || []).filter(Boolean);

    return columns;
  }

  render() {
    const {
      loading,
      scoreDetailModalVisible,
      cancelScoreDetailModal,
      scoreDetailList = {},
      scoreRemote,
    } = this.props;

    const columns = this.getCloumns();

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    const tabPanes = [
      <TabPane
        tab={intl.get('ssrc.inquiryHall.view.tab.businessGroup').d('商务组')}
        key="business"
      >
        <Table
          bordered
          loading={loading}
          columns={this.getCloumns('business')}
          rowKey="evaluateDetailId"
          dataSource={
            this.renderDataSource(scoreDetailList.businessScoreLineList, 'business') || []
          }
          scroll={{ x: scrollX, y: getContentScrollHeight() }}
          pagination={false}
        />
      </TabPane>,
      <TabPane
        tab={intl.get('ssrc.inquiryHall.view.tab.technicalGroup').d('技术组')}
        key="technology"
      >
        <Table
          bordered
          loading={loading}
          columns={this.getCloumns('technology')}
          rowKey="evaluateDetailId"
          dataSource={
            this.renderDataSource(scoreDetailList.technologyScoreLineList, 'technology') || []
          }
          scroll={{ x: scrollX, y: getContentScrollHeight() }}
          pagination={false}
        />
      </TabPane>,
    ];

    const remotePanes = scoreRemote ? scoreRemote.process('SSRC_SCORE_DETAIL_MODAL_PROCESS_MODAL_TABPANES', tabPanes, {
        scoreDetailList,
        loading,
        TabPane,
        getColumns: (...params) => { return this.getCloumns(...params); },
        renderDataSource: (...params) => { return this.renderDataSource(...params); },
        getContentScrollHeight,
        that: this,
    }) : tabPanes;

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
            {remotePanes}
          </Tabs>
        ) : (
          <Table
            bordered
            loading={loading}
            columns={this.getCloumns('sync')}
            rowKey="evaluateDetailId"
            dataSource={this.renderDataSource(scoreDetailList.syncScoreLineList, 'sync') || []}
            scroll={{ x: scrollX, y: getContentScrollHeight() }}
            pagination={false}
          />
        )}
      </Modal>
    );
  }
}
