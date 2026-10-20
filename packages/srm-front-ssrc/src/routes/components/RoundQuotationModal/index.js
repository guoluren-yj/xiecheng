/**
 * 组件-多轮报价物品信息 弹窗
 * @date: 2019-11-21
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Button, Modal } from 'hzero-ui';
import { isFunction, noop } from 'lodash';
import { Bind } from 'lodash-decorators';

import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import CPopover from '@/routes/components/CPopover/';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { isText, getPriceName, getAvailableQtyName } from '@/utils/utils';
import { getQuotationName } from '@/utils/globalVariable';

import { numberSeparatorRender } from '@/utils/renderer';
import common from './index.less';

export default class RoundQuotationModal extends Component {
  constructor(props) {
    super(props);

    const { record } = props || {};
    const { secondarySourceCategory } = record || {};

    this.state = {
      doubleUnitFlag: false, // 双单位标志
    };

    this.quotationName = getQuotationName(secondarySourceCategory === 'NEW_BID');
  }

  componentDidMount() {
    this.queryDoubleUnit();
  }

  componentWillUnmount() {
    this.setState({ doubleUnitFlag: false });
  }

  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  /**
   * 依据状态渲染行样式
   *
   * @param {*} [item={}]
   * @param {*} [index=null]
   * @returns
   * @memberof RoundQuotationModal
   */
  tableRowClass(item = {}) {
    let RedColorClassName = 'ssrc-round-quotation-red-color';
    if (!item.minPriceFlag) {
      RedColorClassName = '';
    }

    return common[RedColorClassName];
  }

  /**
   * 表格列
   *
   * @returns
   * @memberof RoundQuotationModal
   */
  renderColumns() {
    const { doubleUnitFlag } = this.state;
    const columns = [
      {
        title: intl.get('ssrc.common.goodsNum').d('物料编码'),
        dataIndex: 'itemCode',
        width: 180,
      },
      {
        title: intl.get('ssrc.common.goodsDescription').d('物品描述'),
        dataIndex: 'itemName',
        width: 250,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get('ssrc.common.supplierNum').d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 180,
      },
      {
        title: intl.get('ssrc.common.supplierName').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 250,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get('ssrc.common.rowAmount').d('行金额'),
        dataIndex: 'totalPrice',
        width: 80,
        align: 'right',
        render: (val) => {
          return val && numberSeparatorRender(val);
        },
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.common.model.common.availableQuantity`).d('可供数量'),
            dataIndex: 'validQuotationSecQuantity',
            width: 120,
          }
        : null,
      {
        title: getAvailableQtyName(doubleUnitFlag),
        dataIndex: 'validQuotationQuantity',
        width: 120,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.common.model.common.taxPrice`).d('单价(含税)'),
            dataIndex: 'validQuotationSecPrice',
            width: 120,
            render: (val) => {
              return val && numberSeparatorRender(val);
            },
          }
        : null,
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'validQuotationPrice',
        width: 120,
        render: (val) => {
          return val && numberSeparatorRender(val);
        },
      },
      {
        title: intl.get('ssrc.common.taxRate').d('税率'),
        dataIndex: 'taxRate',
        width: 80,
      },
      {
        title: intl
          .get(`ssrc.expertScoring.view.modal.commonQuotationLineStatus`, {
            quotationName: this.quotationName,
          })
          .d('{quotationName}状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
    ].filter(Boolean);

    return columns;
  }

  getExportNewButtonQueryParam = () => {
    const { record = {}, skipSummaryFlag = '', quotationHeaderIds = [] } = this.props;
    if (skipSummaryFlag) {
      return {
        skipSummaryFlag,
        quotationHeaderIds,
        rfxHeaderId: record.sourceHeaderId,
      };
    } else {
      return {
        rfxHeaderId: record.sourceHeaderId,
      };
    }
  };

  startScoreFinal = async () => {
    const {
      onCancelClick = noop,
      startScore = noop,
      exportScoringBussSumRemote, // 确认汇总远程埋点
      record, // 评分汇总id信息
      startRoundQuotation,
    } = this.props;
    if (exportScoringBussSumRemote) {
      // 校验埋点
      const beforeStartScoreRes = await exportScoringBussSumRemote.event.fireEvent(
        'beforeStartScore',
        {
          onCancelClick,
          record,
          startRoundQuotation,
        }
      );
      if (beforeStartScoreRes === false) return false;
    }
    startScore();
  };

  // 按钮组合
  getButtons = () => {
    const {
      onCancelClick = noop,
      startRoundQuotation = noop,
      beginRoundQuotationLoading,
      roundBeginScoreLoading,
      exportScoringBussSumRemote, // 确认汇总远程埋点
      record, // 评分汇总id信息
      expertScoreSumHeader, // 评分汇总头信息
      bidEvalProgress, // 评分汇总步骤条
    } = this.props;
    // 评分确认汇总埋点按钮
    const exportScoringBussSumButtons = exportScoringBussSumRemote
      ? exportScoringBussSumRemote.process(
          'SSRC_EXPERT_SCORING_BUSS_SUM_PROCESS_ROUND_QUOTATION_BUTTONS',
          [],
          { expertScoreSumHeader, record, bidEvalProgress }
        )
      : [];
    return [
      {
        name: 'cancel',
        child: intl.get(`ssrc.common.view.button.cancel`).d('取消'),
        btnProps: {
          onClick: onCancelClick,
        },
      },
      {
        name: 'startRoundQuotation',
        btnProps: { onClick: startRoundQuotation, loading: beginRoundQuotationLoading },
        child: intl.get(`ssrc.expertScoring.view.modal.button.starRoundQuo`).d('发起多轮报价'),
      },
      {
        name: 'startScore',
        btnProps: {
          type: 'primary',
          onClick: this.startScoreFinal,
          loading: roundBeginScoreLoading,
        },
        child: intl.get(`ssrc.expertScoring.view.modal.button.startScore`).d('开始评分'),
      },
      {
        name: 'exportTable',
        btnComp: ExcelExportPro,
        btnProps: {
          allBody: true,
          templateCode: 'SRM_C_SRM_SSRC_RFX_EVALUATE_EXPERT_ROUND_QUOTATION_EXPORT',
          name: 'exportProject',
          method: 'POST',
          requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/round-headers/round-quotation/export`,
          buttonText: intl.get(`ssrc.common.button.exportNew`).d('导出(新)'),
          queryParams: this.getExportNewButtonQueryParam,
          otherButtonProps: {
            permissionList: [
              {
                code:
                  'srm.ssrc.source.manage.evaluate.score.button.ssrc.expert-scoring.round-quotation.export',
                type: 'button',
                meaning: `${
                  intl.get(`ssrc.expertScoring.view.message.title.expertScoring`).d('专家评分') -
                  intl.get(`ssrc.common.button.exportNew`).d('导出(新)')
                }`,
              },
            ],
          },
        },
      },
      ...(exportScoringBussSumButtons || []),
    ];
  };

  render() {
    const {
      fetchExpertScoreItemLinesLoading,
      roundQuotationModalVisible = false,
      dataSource = [],
      pagination = {},
      onChange = () => {},
      customizeTable,
      closable = true,
      candelRoundQuotationModal = () => {},
      customizeBtnGroup,
      onCancelClick = noop,
      startRoundQuotation = noop,
      startScore = noop,
      beginRoundQuotationLoading,
      roundBeginScoreLoading,
    } = this.props;

    const scrollX = tableScrollWidth(this.renderColumns()) || 0;

    return (
      <Modal
        visible={roundQuotationModalVisible}
        width="80%"
        zIndex={999}
        closable={closable}
        title={intl.get(`ssrc.expertScoring.view.modal.title.isRoundQuo`).d('是否开启多轮报价')}
        footer={
          <div>
            {isFunction(customizeBtnGroup) ? (
              customizeBtnGroup(
                {
                  code: 'SSRC.EXPERT_SCORE_MANAGE.ROUND_MODAL_BUTTON',
                  pro: true,
                },
                <DynamicButtons buttons={this.getButtons()} />
              )
            ) : (
              <>
                <Button onClick={onCancelClick}>
                  {intl.get(`ssrc.common.view.button.cancel`).d('取消')}
                </Button>
                <Button onClick={startRoundQuotation} loading={beginRoundQuotationLoading}>
                  {intl.get(`ssrc.expertScoring.view.modal.button.starRoundQuo`).d('发起多轮报价')}
                </Button>
                <Button type="primary" onClick={startScore} loading={roundBeginScoreLoading}>
                  {intl.get(`ssrc.expertScoring.view.modal.button.startScore`).d('开始评分')}
                </Button>
                <ExcelExportPro
                  allBody
                  name="export"
                  method="POST"
                  buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
                  requestUrl={`/ssrc/v1/${getCurrentOrganizationId()}/round-headers/round-quotation/export`}
                  templateCode="SRM_C_SRM_SSRC_RFX_EVALUATE_EXPERT_ROUND_QUOTATION_EXPORT"
                  queryParams={this.getExportNewButtonQueryParam()}
                  otherButtonProps={{
                    icon: 'unarchive',
                    type: 'c7n-pro',
                    style: { marginRight: '8px' },
                    permissionList: [
                      {
                        code:
                          'srm.ssrc.source.manage.evaluate.score.button.ssrc.expert-scoring.round-quotation.export',
                        type: 'button',
                        meaning: `${
                          intl
                            .get(`ssrc.expertScoring.view.message.title.expertScoring`)
                            .d('专家评分') - intl.get(`ssrc.common.button.exportNew`).d('导出(新)')
                        }`,
                      },
                    ],
                  }}
                />
              </>
            )}
          </div>
        }
        onCancel={() => closable && candelRoundQuotationModal()}
      >
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: 'SSRC.EXPERT_SCORE_MANAGE.ROUND_QUOTATION_LINE',
            },
            <Table
              bordered
              rowKey="quotationLineId"
              rowClassName={(item) => this.tableRowClass(item)}
              loading={fetchExpertScoreItemLinesLoading}
              columns={this.renderColumns()}
              scroll={{ x: scrollX }}
              pagination={pagination}
              dataSource={dataSource}
              onChange={(page) => onChange(page)}
            />
          )
        ) : (
          <Table
            bordered
            rowKey="quotationLineId"
            rowClassName={(item) => this.tableRowClass(item)}
            loading={fetchExpertScoreItemLinesLoading}
            columns={this.renderColumns()}
            scroll={{ x: scrollX }}
            pagination={pagination}
            dataSource={dataSource}
            onChange={(page) => onChange(page)}
          />
        )}
      </Modal>
    );
  }
}
