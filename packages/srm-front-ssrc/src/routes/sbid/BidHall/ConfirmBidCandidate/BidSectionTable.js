/**
 * bidHall - 招标/确认招标候选人 - 标段详情Table
 * @date: 2019-07-03
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Table } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import Switch from 'components/Switch';
import CPopover from '@/routes/sbid/components/CPopover';
import { numberSeparatorRender } from '@/utils/renderer';
// import common from '@/routes/sbid/common.less';

const FormItem = Form.Item;
@formatterCollections({ code: ['ssrc.bidHall'] })
export default class BidSectionTable extends Component {
  /**
   * 是否推荐
   *
   * @param {*} e
   * @param {*} record
   * @memberof BidSectionTable
   */
  @Bind()
  changeCanidate(isChecked, record) {
    if (!isChecked) {
      record.$form.setFieldsValue({
        candidateSuggestion: '',
        candidateFlag: 0,
      });
    } else {
      record.$form.setFieldsValue({
        candidateFlag: 1,
        candidateSuggestion: '',
      });
    }
  }

  /**
   * 金额千分隔
   *
   * @param {*} val
   * @returns
   * @memberof BidSectionTable
   */
  thousandDivider(val) {
    if (!val) {
      return;
    }

    const num = parseFloat(val).toLocaleString();
    return num;
  }

  render() {
    // const HideClassName = common['display-none'];

    const {
      match,
      header = {},
      dataSource = [],
      openScoreDetailModal,
      directorTender,
      customizeTable,
      historyTag = '',
      businessWeight = '',
      technologyWeight = '',
    } = this.props;
    const { bidRuleType = '' } = header;

    const pathFrom = match.path === '/pub/ssrc/expert-scoring/workflow/bid/:sourceHeaderId';

    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.scoreRank`).d('排行'),
        dataIndex: 'scoreRank',
        width: 80,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quotationNum`).d('投标编号'),
        dataIndex: 'quotationNum',
        fixed: 'left',
        width: 150,
        render: (val, record) =>
          pathFrom ? (
            <a onClick={() => directorTender(record)}>{val}</a>
          ) : ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('quotationNum', {
                initialValue: val,
              })(<a onClick={() => directorTender(record)}>{val}</a>)}
              {record.$form.getFieldDecorator('evaluateSummaryId', {
                initialValue: record.evaluateSummaryId,
              })}
              {record.$form.getFieldDecorator('objectVersionNumber', {
                initialValue: record.objectVersionNumber,
              })}
            </FormItem>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.common.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
        fixed: 'left',
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      header.explorationFlag && {
        title: intl.get(`ssrc.common.supplierExplorationStatus`).d('是否踏勘'),
        dataIndex: 'supplierExplorationStatusMeaning',
        width: 100,
      },
      header.explorationFlag && {
        title: intl.get(`ssrc.common.supplierExplorationDate`).d('踏勘日期'),
        dataIndex: 'supplierExplorationDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.totalAmount`).d('投标总价'),
        dataIndex: 'totalAmount',
        width: 100,
        align: 'right',
        render: (val, record) => (
          <span style={record.redPrice === 'TOTAL' ? { color: '#F5222D' } : {}}>
            {numberSeparatorRender(val)}
          </span>
        ),
      },
      bidRuleType === 'DIFF' && {
        title: (
          <div>
            {intl.get(`ssrc.bidHall.model.bidHall.businessScore`).d('商务分')}
            {businessWeight ? `(${businessWeight}%)` : '(0%)'}
          </div>
        ),
        dataIndex: 'businessScore',
        width: 140,
        render: (val) => val && Number(val).toFixed(2),
      },
      bidRuleType === 'DIFF' && {
        title: (
          <div>
            {intl.get(`ssrc.bidHall.model.bidHall.technologyScore`).d('技术分')}
            {technologyWeight ? `(${technologyWeight}%)` : '(0%)'}
          </div>
        ),
        dataIndex: 'technologyScore',
        width: 140,
        render: (val) => val && val.toFixed(2),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.totalScore`).d('总分'),
        dataIndex: 'score',
        width: 80,
        render: (val, record) =>
          pathFrom ? (
            <a onClick={() => openScoreDetailModal(record)}>{val}</a>
          ) : ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('score', {
                initialValue: val,
              })(<a onClick={() => openScoreDetailModal(record)}>{val}</a>)}
            </FormItem>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.recommending`).d('推荐'),
        dataIndex: 'candidateFlag',
        width: 80,
        render: (val, record) =>
          historyTag === 'history' ? (
            yesOrNoRender(val)
          ) : pathFrom ? (
            <Switch disabled checked={val} />
          ) : ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('candidateFlag', {
                initialValue: val,
              })(
                <Switch
                  disabled={record.invalidFlag}
                  checkedValue={1}
                  uncheckedValue={0}
                  onChange={(e) => this.changeCanidate(e, record)}
                />
              )}
            </FormItem>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.candidateSuggestion`).d('推荐意见'),
        dataIndex: 'candidateSuggestion',
        width: 280,
        render: (val, record) =>
          historyTag === 'history' ? (
            val
          ) : pathFrom ? (
            val
          ) : ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('candidateSuggestion', {
                initialValue: val,
                rules: [
                  {
                    required: record.$form.getFieldValue('candidateFlag') && !record.invalidFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.bidHall.model.bidHall.candidateSuggestion`)
                        .d('推荐意见'),
                    }),
                  },
                ],
              })(
                <Input
                  style={{ width: '100%' }}
                  disabled={
                    !record.$form.getFieldValue('candidateFlag') || historyTag === 'history'
                  }
                />
              )}
            </FormItem>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.invalidTender`).d('无效投标'),
        dataIndex: 'invalidFlag',
        width: 100,
        render: (val) =>
          val ? (
            <FormItem>{intl.get(`ssrc.bidHall.model.bidHall.invalid`).d('无效')}</FormItem>
          ) : (
            ''
          ),
      },
    ].filter(Boolean);

    // 保证金大于0
    if (header.bidBond > 0) {
      columns.splice(3, 0, {
        title: intl.get('ssrc.bidHall.model.bidHall.bidBondStatus').d('保证金'),
        dataIndex: 'expenseStatus',
        width: 150,
        render: (val, record) => (
          <span style={val === 'NO_PAY' ? { color: 'red' } : {}}>
            {record.expenseStatusMeaning}
          </span>
        ),
      });
    }

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return pathFrom
      ? customizeTable(
          {
            code: 'SSRC.EXPERT_SCORE_MANAGE.LINE_DETAIL_BID',
          },
        <Table
          bordered
          rowKey="evaluateSummaryId"
          scroll={{ x: scrollX }}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
        )
      : customizeTable(
          {
            code: 'SSRC.EXPERT_SCORE_MANAGE.LINE_EDIT_BID',
          },
        <EditTable
          bordered
          rowKey="evaluateSummaryId"
          scroll={{ x: scrollX }}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
        );
  }
}
