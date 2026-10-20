/**
 * inquiryHall - 寻源服务/确认招标候选人 - 标段详情Table
 * @date: 2019-07-03
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Table, Tag, Tooltip } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getContentScrollHeight } from '@/utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { getQuotationName } from '@/utils/globalVariable';

import EditTable from 'components/EditTable';
import Switch from 'components/Switch';
import CPopover from '@/routes/ssrc/components/CPopover';
// import common from '@/routes/ssrc/common.less';
import { numberSeparatorRender, getZeroTrue } from '@/utils/renderer';

const FormItem = Form.Item;
const { TextArea } = Input;

@formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common'] })
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

    const num = numberSeparatorRender(val);

    return num;
  }

  render() {
    // const HideClassName = common['display-none'];

    const {
      remote,
      header = {},
      dataSource = [],
      openScoreDetailModal,
      directorQuotationDetail,
      businessWeight = '',
      technologyWeight = '',
      match: { path },
      historyTag,
      customizeTable,
      sourceFrom,
      bidSectionList,
      state,
    } = this.props;
    const {
      bidRuleType = '',
      secondarySourceCategory,
      templateScoreType = '',
      scoreType = '',
      currentUserIsOnlyTechnologyExpertFlag, // 仅当登录子账户=当前询价单维护技术专家，且无其他角色（商务技术、商务专家无影响；不处理技术专家为评分负责人、核价员等寻源小组中任何一个成员的时候都不处理），隐藏报价详情/投标详情
    } = header;
    const pathFrom = path && path.includes('/pub');
    const bidFlag = secondarySourceCategory === 'NEW_BID';

    const preColumns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreRank`).d('排名'),
        dataIndex: 'scoreRank',
        width: 80,
        fixed: 'left',
      },
      // 此列二开，禁止修改参数名
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 250,
        fixed: 'left',
        render: (val, record) => (
          <div style={{ display: 'flex' }}>
            <CPopover content={val}>{val}</CPopover>
            {record?.eliminateFlag === 1 ? (
              <Tag
                style={{
                  background: '#868D9C',
                  color: 'white',
                  marginLeft: '10px',
                  borderRadius: '5px',
                }}
              >
                {intl.get(`ssrc.common.view.status.allEliminate`).d('全部淘汰')}
              </Tag>
            ) : null}
          </div>
        ),
      },
      // 该列被【海亮教育】二开，请勿改变字段名
      ((!currentUserIsOnlyTechnologyExpertFlag && sourceFrom === 'RFX') ||
        sourceFrom !== 'RFX') && {
        title:
          sourceFrom === 'RFX'
            ? intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationParticulars`, {
                  quotationName: getQuotationName(bidFlag),
                })
                .d('{quotationName}详情')
            : intl.get(`ssrc.inquiryHall.model.inquiryHall.rfAnswerDetail`).d('回复详情'),
        dataIndex: 'quotationNum',
        width: 130,
        render: (val, record) =>
          pathFrom ? (
            <a onClick={() => directorQuotationDetail(record)}>
              {sourceFrom === 'RFX'
                ? intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationParticulars`, {
                      quotationName: getQuotationName(bidFlag),
                    })
                    .d('{quotationName}详情')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.rfAnswerDetail`).d('回复详情')}
            </a>
          ) : ['create', 'update'].includes(record._status) ? (
            <FormItem>
              <a onClick={() => directorQuotationDetail(record)}>
                {sourceFrom === 'RFX'
                  ? intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationParticulars`, {
                        quotationName: getQuotationName(bidFlag),
                      })
                      .d('{quotationName}详情')
                  : intl.get(`ssrc.inquiryHall.model.inquiryHall.rfAnswerDetail`).d('回复详情')}
              </a>
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
      // 该列被【海亮教育】二开，请勿改变字段名
      sourceFrom === 'RFX' && {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.totalAmount`).d('总价'),
        dataIndex: 'totalAmount',
        width: 100,
        align: 'right',
        render: (val, record) => (
          <span style={record.redPrice === 'TOTAL' ? { color: '#f5222d' } : {}}>
            {numberSeparatorRender(val)}
          </span>
        ),
      },
      // 该列被【协鑫】二开，请勿改变字段名
      bidRuleType === 'DIFF' && {
        title: (
          <div>
            {dataSource[0]?.businessPassStatus
              ? intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.businessScoringResult`)
                  .d('商务打分结果')
              : intl.get(`ssrc.inquiryHall.model.inquiryHall.businessScore`).d('商务评分')}
            {dataSource[0]?.businessPassStatus ||
            templateScoreType === 'SCORE_NEW' ||
            scoreType === 'SCORE_NEW'
              ? ''
              : businessWeight
              ? `(${businessWeight}%)`
              : '(0%)'}
          </div>
        ),
        dataIndex: 'businessScore',
        width: 140,
        render: (val, record) => (
          <span
            style={{
              color:
                record.businessPassStatus && getZeroTrue(record?.businessApprovedCount)
                  ? 'red'
                  : '',
            }}
          >
            {record.businessPassStatus || (val && Number(val).toFixed(2))}
          </span>
        ),
      },
      // 该列被【山鹰】二开，请勿改变字段名
      bidRuleType === 'DIFF' && {
        title: (
          <div>
            {dataSource[0]?.technologyPassStatus
              ? intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.technologyScoringResult`)
                  .d('技术打分结果')
              : intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyScore`).d('技术评分')}
            {dataSource[0]?.technologyPassStatus ||
            templateScoreType === 'SCORE_NEW' ||
            scoreType === 'SCORE_NEW'
              ? ''
              : technologyWeight
              ? `(${technologyWeight}%)`
              : '(0%)'}
          </div>
        ),
        dataIndex: 'technologyScore',
        width: 140,
        render: (val, record) => (
          <span
            style={{
              color:
                record.technologyPassStatus && getZeroTrue(record?.technologyApprovedCount)
                  ? 'red'
                  : '',
            }}
          >
            {record.technologyPassStatus || (val && val.toFixed(2))}
          </span>
        ),
      },
      {
        title: dataSource[0]?.sumPassStatus
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.scoringResult`).d('打分结果')
          : intl.get(`ssrc.inquiryHall.model.inquiryHall.totalScore`).d('总分'),
        dataIndex: 'score',
        width: 100,
        render: (val, record) =>
          pathFrom ? (
            <a
              onClick={() => openScoreDetailModal(record)}
              style={{
                color: record.sumPassStatus && getZeroTrue(record?.approvedCount) ? 'red' : '',
              }}
            >
              {record.sumPassStatus || val}
            </a>
          ) : ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('score', {
                initialValue: val,
              })(
                <a
                  onClick={() => openScoreDetailModal(record)}
                  style={{
                    color: record.sumPassStatus && getZeroTrue(record?.approvedCount) ? 'red' : '',
                  }}
                >
                  {record.sumPassStatus || (val && val.toFixed(2))}
                </a>
              )}
            </FormItem>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.recommend`).d('推荐'),
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
                  disabled={record.invalidFlag || record.eliminateFlag}
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.candidateSuggestion`).d('推荐意见'),
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
                        .get(`ssrc.inquiryHall.model.inquiryHall.candidateSuggestion`)
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
      // 该列被【绝味】二开，请勿改变字段名
      {
        title:
          sourceFrom === 'RFX'
            ? intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonInvalidQuotation`, {
                  quotationName: getQuotationName(bidFlag),
                })
                .d('无效{quotationName}')
            : intl.get('ssrc.inquiryHall.model.inquiryHall.invalidAnswer').d('无效回复'),
        dataIndex: 'invalidFlag',
        width: 100,
        render: (val) =>
          val ? (
            <FormItem>{intl.get(`ssrc.inquiryHall.model.inquiryHall.invalid`).d('无效')}</FormItem>
          ) : (
            ''
          ),
      },
      {
        title:
          sourceFrom === 'RFX'
            ? intl
                .get(`ssrc.inquiryHall.model.inquiryHall.commonInvalidQuotationReason`, {
                  quotationName: getQuotationName(bidFlag),
                })
                .d('无效{quotationName}原因')
            : intl.get('ssrc.inquiryHall.model.inquiryHall.invalidAnswerReason').d('无效回复原因'),
        dataIndex: 'invalidReason',
        width: 100,
        render: (val) =>
          val ? (
            <Tooltip title={val} placement="topLeft">
              <TextArea disabled>{val}</TextArea>
            </Tooltip>
          ) : (
            ''
          ),
      },
    ].filter(Boolean);

    const processProps = {
      bidSectionList,
      header,
      historyTag,
      bidFlag,
      dataSource,
      businessWeight,
      bidRuleType,
      sourceFrom,
      pathFrom,
      state,
      that: this,
    };

    const columns = remote
      ? remote.process('SSRC_CONFIRM_CANDIDATE_PROCESS_TABLE_COLUMNS', preColumns, processProps)
      : preColumns;

    // 保证金大于0
    if (header.bidBond > 0) {
      columns.splice(2, 0, {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.bidBond').d('保证金'),
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

    return (
      <div>
        {pathFrom
          ? customizeTable(
              {
                code: 'SSRC.EXPERT_SCORE_MANAGE.LINE_DETAIL',
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
                code:
                  historyTag === 'history'
                    ? 'SSRC.EXPERT_SCORE_MANAGE.LINE_VIEW'
                    : 'SSRC.EXPERT_SCORE_MANAGE.LINE_EDIT',
              },
              <EditTable
                bordered
                rowKey="evaluateSummaryId"
                scroll={{ x: scrollX, y: getContentScrollHeight(50) }}
                dataSource={dataSource}
                columns={columns}
                pagination={false}
              />
            )}
      </div>
    );
  }
}
