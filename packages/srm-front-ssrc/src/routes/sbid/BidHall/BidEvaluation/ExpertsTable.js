import React, { Component } from 'react';
import { Table, Popover, Popconfirm, Badge, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getContentScrollHeight } from '@/utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import { getQuotationName } from '@/utils/globalVariable';
import { zeroAmountScoreRender, getZeroTrue, scoreIntervalRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

// import FileGroup from '@/routes/components/SupplierQuotationAttachment';

export default class ExpertsTable extends Component {
  state = {
    scoreDrawerVisible: false, // 评分明细侧弹框
    expertName: undefined, // 专家名称
    supplierCompanyName: undefined, // 供应商名称
  };

  /**
   * 重新评分
   * @param {Object} record
   */
  @Bind()
  reScoring(record) {
    const { onReScoring } = this.props;
    onReScoring(record);
  }

  /**
   * 单个专家-供应商评分细项
   * @param {Number} evaluateScoreId
   */
  @Bind()
  fetchScoreline(evaluateScoreId) {
    const { onFetchScoreline } = this.props;
    onFetchScoreline(evaluateScoreId);
  }

  /**
   * 评分明细侧弹框 - 打开
   * @param {Object} record
   */
  @Bind()
  showScoreDrawer(record) {
    this.setState({
      expertName: record.expertName,
      supplierCompanyName: record.supplierCompanyName,
      scoreDrawerVisible: true,
    });
    this.fetchScoreline(record.evaluateScoreIds);
  }

  /**
   * 评分明细侧弹框 - 关闭
   */
  @Bind()
  hideScoreDrawer() {
    const { onClearScoreLine } = this.props;
    this.setState({
      scoreDrawerVisible: false,
    });
    onClearScoreLine();
  }

  /**
   * 渲染寻源侧弹框评分数据
   */
  renderRfxScoreDataSource() {
    const { scoreLine = {} } = this.props;
    if (isEmpty(scoreLine.scoreLineList)) return [];
    let dataSource = [];
    scoreLine.scoreLineList.forEach((item) => {
      // 如果存在二级要素
      if (Number(item.detailEnabledFlag)) {
        const { evaluateScoreLineDtlList = [] } = item;
        const twoIndicateList = evaluateScoreLineDtlList.map((ele) => ({ ...ele, rowKey: uuid() }));
        dataSource = [
          ...dataSource,
          { rowKey: uuid(), ...item },
          ...twoIndicateList,
          {
            indicateName: intl.get('ssrc.bidHall.model.bidHall.summary').d('小计'),
            indicScore: item.indicScore,
            rowKey: uuid(),
          },
        ];
      } else {
        dataSource = [...dataSource, { rowKey: uuid(), ...item }];
      }
    });
    return [
      ...dataSource,
      {
        indicateName: intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总'),
        indicScore: scoreLine.totalSummary,
        rowKey: uuid(),
        approvedCount: scoreLine?.approvedCount,
      },
    ];
  }

  // 供应商分数标题
  renderSupplierTitle = () => {
    const list = this.renderRfxScoreDataSource();
    if (!list || !list.length) {
      return intl.get(`ssrc.expertScoring.model.expertScoring.supplierScore`).d('供应商分数');
    }

    switch (list[0].supplierScoreTitle) {
      case 'SCORE':
        return intl.get(`ssrc.expertScoring.model.expertScoring.supplierScore`).d('供应商分数');
      case 'SCORE_PASS':
        return `${intl
          .get(`ssrc.expertScoring.model.expertScoring.supplierScore`)
          .d('供应商分数')}(${intl
          .get(`ssrc.expertScoring.model.expertScoring.passStatus`)
          .d('是否通过')})`;
      case 'PASS':
        return intl.get(`ssrc.expertScoring.model.expertScoring.passStatus`).d('是否通过');
      default:
        return intl.get(`ssrc.expertScoring.model.expertScoring.supplierScore`).d('供应商分数');
    }
  };

  /**
   * 渲染寻源，专家维度下评分明细
   */
  renderScoreRfxTable() {
    const { fetchLoading, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicateDetail`).d('要素细项'),
        dataIndex: 'indicateName',
        width: 150,
        render: (text, record) => {
          const obj = {
            children:
              record.indicateLevel === 'TWO' ? (
                <Popover content={record.twoIndicateName}>{record.twoIndicateName}</Popover>
              ) : (
                <Popover content={text}>{text}</Popover>
              ),
            props: {},
          };
          // 一级要素且有二级要素
          if (record.indicateLevel === 'ONE' && Number(record.detailEnabledFlag)) {
            obj.props.colSpan = 3;
          }
          // 小计或者总计列
          if (!record.indicateLevel && !Number(record.detailEnabledFlag)) {
            obj.props.colSpan = 2;
          }
          return obj;
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.scoringInterval`).d('评分区间'),
        dataIndex: 'scoringInterval',
        width: 150,
        render: (text, record) => {
          const obj = {
            children:
              record.indicateType !== 'PASS'
                ? record.indicateLevel === 'TWO'
                  ? scoreIntervalRender(record.twoMinScore, record.twoMaxScore)
                  : scoreIntervalRender(record.minScore, record.maxScore)
                : '-',
            props: {},
          };
          // 一级要素且有二级要素
          if (record.indicateLevel === 'ONE' && Number(record.detailEnabledFlag)) {
            obj.props.colSpan = 0;
          }
          // 小计或者总计列
          if (!record.indicateLevel && !Number(record.detailEnabledFlag)) {
            obj.props.colSpan = 0;
          }
          return obj;
        },
      },
      {
        title: this.renderSupplierTitle(),
        dataIndex: 'indicScore',
        width: 150,
        render: (val, record) => {
          const Style = { color: getZeroTrue(record?.approvedCount) ? 'red' : '' };
          const obj = {
            children:
              record.indicateType !== 'PASS' ? (
                record.indicateLevel === 'TWO' ? (
                  record.twoIndicateScore
                ) : Number(record.zeroAmountScoreFlag) ? (
                  zeroAmountScoreRender()
                ) : (
                  <span style={Style}>{val}</span>
                )
              ) : (
                record.passStatusMeaning
              ),
            props: {},
          };
          // 一级要素且有二级要素
          if (record.indicateLevel === 'ONE' && Number(record.detailEnabledFlag)) {
            obj.props.colSpan = 0;
          }
          return obj;
        },
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.weight`).d('权重')}%</span>,
        dataIndex: 'weight',
        width: 120,
        render: (val, record) =>
          record.indicateType !== 'PASS'
            ? record.indicateLevel === 'TWO'
              ? record.twoWeight
              : val
            : '-',
      },
    ];
    return customizeTable(
      {
        code: 'SSRC.EXPERT_SCORE_MANAGE.EXPERT.SCORE_LINE_RFX',
      },
      <Table
        bordered
        loading={fetchLoading}
        columns={columns}
        rowKey="rowKey"
        dataSource={this.renderRfxScoreDataSource()}
        pagination={false}
        className="score-rfx-table"
        scroll={{ y: getContentScrollHeight(80, false, 'score-rfx-table') }}
      />
    );
  }

  renderScoreLineTable() {
    const { scoreLine = {}, fetchLoading } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.indicScore`).d('评分要素'),
        dataIndex: 'indicateName',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertScoring`).d('专家打分'),
        dataIndex: 'indicScore',
        width: 100,
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.weight`).d('权重')}%</span>,
        dataIndex: 'weight',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.realScore`).d('实际得分'),
        dataIndex: 'realScore',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.team`).d('所属组别'),
        dataIndex: 'teamMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.passStatus`).d('是否通过'),
        dataIndex: 'passStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertSuggestion`).d('专家意见'),
        dataIndex: 'remark',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
    ];
    return (
      <Table
        bordered
        loading={fetchLoading}
        columns={columns}
        rowKey="evaluateLineId"
        dataSource={scoreLine.scoreLineList || []}
        pagination={false}
      />
    );
  }

  render() {
    const {
      bidFlag,
      settings,
      organizationId,
      dataSource = [],
      loading,
      sourceFrom,
      directorQuotationDetail,
      current,
      header = {},
      customizeTable,
      remote,
      // newQuotationFlag,
      templateConfig = {},
    } = this.props;
    const {
      scoreDrawerVisible = false,
      expertName = undefined,
      supplierCompanyName = undefined,
    } = this.state;
    const otherProps = {
      record: header,
    };
    const columns = remote
      ? remote.process(
          'PROCESS_TABLE_COLUMNS',
          [
            current !== 'TECHNOLOGY_SUMMARY_RFX'
              ? {
                  title:
                    sourceFrom === 'BID'
                      ? intl.get(`ssrc.bidHall.model.bidHall.quotationNum`).d('投标编号')
                      : sourceFrom === 'RFX'
                      ? intl
                          .get(`ssrc.bidHall.model.bidHall.commonQuotationDetail`, {
                            quotationName: getQuotationName(bidFlag),
                          })
                          .d('{quotationName}详情')
                      : intl.get(`ssrc.bidHall.model.bidHall.rfAnswerDetail`).d('回复详情'),
                  dataIndex: 'quotationNum',
                  width: 120,
                  render: (val, record) =>
                    sourceFrom === 'RFX' || sourceFrom === 'RFP' || sourceFrom === 'RFI' ? (
                      <a onClick={() => directorQuotationDetail(record)}>
                        {sourceFrom === 'RFX'
                          ? intl
                              .get(`ssrc.bidHall.model.bidHall.commonQuotationDetail`, {
                                quotationName: getQuotationName(bidFlag),
                              })
                              .d('{quotationName}详情')
                          : intl.get(`ssrc.bidHall.model.bidHall.rfAnswerDetail`).d('回复详情')}
                      </a>
                    ) : (
                      val
                    ),
                }
              : null,
            // ======================================================
            // 此列二开，禁止修改参数名
            {
              title:
                sourceFrom === 'BID'
                  ? intl.get(`ssrc.bidHall.model.bidHall.supplierBidCompanyName`).d('投标方名称')
                  : intl.get(`ssrc.common.supplierName`).d('供应商名称'),
              dataIndex: 'supplierCompanyName',
              width: 120,
              render: (val) => <Popover content={val}>{val}</Popover>,
            },
            // ======================================================
            {
              title: intl.get(`ssrc.bidHall.model.bidHall.scoreDetail`).d('评分详情'),
              dataIndex: 'scoreDetail',
              width: 100,
              render: (_, record) =>
                sourceFrom === 'BID' ? (
                  <Popover
                    trigger="click"
                    content={this.renderScoreLineTable()}
                    title={`${record.expertName}${intl
                      .get('ssrc.bidHall.view.message.expertTo')
                      .d('专家对')}${record.supplierCompanyName}${intl
                      .get('ssrc.bidHall.view.message.score.details')
                      .d('的评分明细')}`}
                    arrowPointAtCenter
                  >
                    <a onClick={() => this.fetchScoreline(record.evaluateScoreIds)}>
                      {intl.get(`ssrc.bidHall.model.bidHall.scoreDetail`).d('评分详情')}
                    </a>
                  </Popover>
                ) : (
                  <a onClick={() => this.showScoreDrawer(record)}>
                    {intl.get(`ssrc.bidHall.model.bidHall.scoreDetail`).d('评分详情')}
                  </a>
                ),
            },
            {
              title: intl.get(`ssrc.bidHall.model.bidHall.reviewerCommnet`).d('评审意见'),
              dataIndex: 'expertSuggestion',
              width: 150,
              render: (val) => <Popover content={val}>{val}</Popover>,
            },
            {
              title:
                sourceFrom === 'BID' || bidFlag
                  ? intl.get(`ssrc.bidHall.model.bidHall.invalidTender`).d('无效投标')
                  : sourceFrom === 'RFX'
                  ? intl.get(`ssrc.bidHall.model.bidHall.suggestInvalid`).d('建议无效')
                  : intl.get('ssrc.bidHall.model.bidHall.invalidAnswer').d('无效回复'),
              dataIndex: 'suggestInvalidFlag',
              width: 80,
              render: (val) =>
                val ? (
                  <Badge
                    status="error"
                    text={intl.get(`ssrc.bidHall.model.bidHall.suggestInvalid`).d('建议无效')}
                  />
                ) : (
                  ''
                ),
            },
            {
              title: intl.get(`ssrc.bidHall.model.bidHall.attachment`).d('附件'),
              dataIndex: 'attachmentUuid',
              width: 100,
              render: (val) => {
                return (
                  <Upload
                    viewOnly
                    filePreview
                    icon="download"
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-expert-header"
                    attachmentUUID={val}
                    tenantId={organizationId}
                  />
                );
              },
            },
            // 此列二开，禁止修改参数名
            {
              title: intl.get('hzero.common.button.action').d('操作'),
              dataIndex: 'action',
              width: 100,
              render: (_, record) =>
                record.scoreStatus === 'SCORED' ? (
                  sourceFrom === 'RFX' ? (
                    (
                      [2, '2'].includes(templateConfig?.systemVersion)
                        ? templateConfig?.repeatScoreFlag
                        : settings['011106'] && +settings['011106'].settingValue
                    ) ? (
                      <Popconfirm
                        title={
                          <span>
                            <span>
                              {intl.get(`ssrc.bidHall.model.bidHall.attachmentUuid`).d('重新评分')}
                            </span>
                            <span>{record.expertName}</span>
                            <span>{intl.get(`ssrc.bidHall.model.bidHall.toThe`).d('对')}</span>
                            <span>{record.supplierCompanyName}</span>
                            <span>
                              {intl
                                .get(`ssrc.bidHall.model.bidHall.toScoreAgain`)
                                .d('进行重新评分')}
                            </span>
                          </span>
                        }
                        onConfirm={() => this.reScoring(record)}
                      >
                        <a href="#">
                          {intl.get(`ssrc.bidHall.model.bidHall.reScore`).d('重新评分')}
                        </a>
                      </Popconfirm>
                    ) : (
                      ''
                    )
                  ) : (
                    <Popconfirm
                      title={
                        <span>
                          <span>
                            {intl.get(`ssrc.bidHall.model.bidHall.attachmentUuid`).d('重新评分')}
                          </span>
                          <span>{record.expertName}</span>
                          <span>{intl.get(`ssrc.bidHall.model.bidHall.toThe`).d('对')}</span>
                          <span>{record.supplierCompanyName}</span>
                          <span>
                            {intl.get(`ssrc.bidHall.model.bidHall.toScoreAgain`).d('进行重新评分')}
                          </span>
                        </span>
                      }
                      onConfirm={() => this.reScoring(record)}
                    >
                      <a href="#">{intl.get(`ssrc.bidHall.model.bidHall.reScore`).d('重新评分')}</a>
                    </Popconfirm>
                  )
                ) : (
                  intl.get(`ssrc.bidHall.model.bidHall.reScoring`).d('重新评分中')
                ),
            },
          ].filter(Boolean),
          otherProps
        )
      : [
          current !== 'TECHNOLOGY_SUMMARY_RFX'
            ? {
                title:
                  sourceFrom === 'BID'
                    ? intl.get(`ssrc.bidHall.model.bidHall.quotationNum`).d('投标编号')
                    : sourceFrom === 'RFX'
                    ? intl
                        .get(`ssrc.bidHall.model.bidHall.commonQuotationDetail`, {
                          quotationName: getQuotationName(bidFlag),
                        })
                        .d('{quotationName}详情')
                    : intl.get(`ssrc.bidHall.model.bidHall.rfAnswerDetail`).d('回复详情'),
                dataIndex: 'quotationNum',
                width: 120,
                render: (val, record) =>
                  sourceFrom === 'RFX' || sourceFrom === 'RFP' || sourceFrom === 'RFI' ? (
                    <a onClick={() => directorQuotationDetail(record)}>
                      {sourceFrom === 'RFX'
                        ? intl
                            .get(`ssrc.bidHall.model.bidHall.commonQuotationDetail`, {
                              quotationName: getQuotationName(bidFlag),
                            })
                            .d('{quotationName}详情')
                        : intl.get(`ssrc.bidHall.model.bidHall.rfAnswerDetail`).d('回复详情')}
                    </a>
                  ) : (
                    val
                  ),
              }
            : null,
          // ======================================================
          // 此列二开，禁止修改参数名
          {
            title:
              sourceFrom === 'BID'
                ? intl.get(`ssrc.bidHall.model.bidHall.supplierBidCompanyName`).d('投标方名称')
                : intl.get(`ssrc.common.supplierName`).d('供应商名称'),
            dataIndex: 'supplierCompanyName',
            width: 120,
            render: (val) => <Popover content={val}>{val}</Popover>,
          },
          // ======================================================
          {
            title: intl.get(`ssrc.bidHall.model.bidHall.scoreDetail`).d('评分详情'),
            dataIndex: 'scoreDetail',
            width: 100,
            render: (_, record) =>
              sourceFrom === 'BID' ? (
                <Popover
                  trigger="click"
                  content={this.renderScoreLineTable()}
                  title={`${record.expertName}${intl
                    .get('ssrc.bidHall.view.message.expertTo')
                    .d('专家对')}${record.supplierCompanyName}${intl
                    .get('ssrc.bidHall.view.message.score.details')
                    .d('的评分明细')}`}
                  arrowPointAtCenter
                >
                  <a onClick={() => this.fetchScoreline(record.evaluateScoreIds)}>
                    {intl.get(`ssrc.bidHall.model.bidHall.scoreDetail`).d('评分详情')}
                  </a>
                </Popover>
              ) : (
                <a onClick={() => this.showScoreDrawer(record)}>
                  {intl.get(`ssrc.bidHall.model.bidHall.scoreDetail`).d('评分详情')}
                </a>
              ),
          },
          {
            title: intl.get(`ssrc.bidHall.model.bidHall.reviewerCommnet`).d('评审意见'),
            dataIndex: 'expertSuggestion',
            width: 150,
            render: (val) => <Popover content={val}>{val}</Popover>,
          },
          {
            title:
              sourceFrom === 'BID' || bidFlag
                ? intl.get(`ssrc.bidHall.model.bidHall.invalidTender`).d('无效投标')
                : sourceFrom === 'RFX'
                ? intl.get(`ssrc.bidHall.model.bidHall.suggestInvalid`).d('建议无效')
                : intl.get('ssrc.bidHall.model.bidHall.invalidAnswer').d('无效回复'),
            dataIndex: 'suggestInvalidFlag',
            width: 80,
            render: (val) =>
              val ? (
                <Badge
                  status="error"
                  text={intl.get(`ssrc.bidHall.model.bidHall.suggestInvalid`).d('建议无效')}
                />
              ) : (
                ''
              ),
          },
          {
            title: intl.get(`ssrc.bidHall.model.bidHall.attachment`).d('附件'),
            dataIndex: 'attachmentUuid',
            width: 100,
            render: (val) => {
              return (
                <Upload
                  viewOnly
                  filePreview
                  icon="download"
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-expert-header"
                  attachmentUUID={val}
                  tenantId={organizationId}
                />
              );
            },
          },
          // ======================================================
          // 此列二开，禁止修改参数名
          {
            title: intl.get('hzero.common.button.action').d('操作'),
            dataIndex: 'action',
            width: 100,
            render: (_, record) =>
              record.scoreStatus === 'SCORED' ? (
                sourceFrom === 'RFX' ? (
                  (
                    [2, '2'].includes(templateConfig?.systemVersion)
                      ? templateConfig?.repeatScoreFlag
                      : settings['011106'] && +settings['011106'].settingValue
                  ) ? (
                    <Popconfirm
                      title={
                        <span>
                          <span>
                            {intl.get(`ssrc.bidHall.model.bidHall.attachmentUuid`).d('重新评分')}
                          </span>
                          <span>{record.expertName}</span>
                          <span>{intl.get(`ssrc.bidHall.model.bidHall.toThe`).d('对')}</span>
                          <span>{record.supplierCompanyName}</span>
                          <span>
                            {intl.get(`ssrc.bidHall.model.bidHall.toScoreAgain`).d('进行重新评分')}
                          </span>
                        </span>
                      }
                      onConfirm={() => this.reScoring(record)}
                    >
                      <a href="#">{intl.get(`ssrc.bidHall.model.bidHall.reScore`).d('重新评分')}</a>
                    </Popconfirm>
                  ) : (
                    ''
                  )
                ) : (
                  <Popconfirm
                    title={
                      <span>
                        <span>
                          {intl.get(`ssrc.bidHall.model.bidHall.attachmentUuid`).d('重新评分')}
                        </span>
                        <span>{record.expertName}</span>
                        <span>{intl.get(`ssrc.bidHall.model.bidHall.toThe`).d('对')}</span>
                        <span>{record.supplierCompanyName}</span>
                        <span>
                          {intl.get(`ssrc.bidHall.model.bidHall.toScoreAgain`).d('进行重新评分')}
                        </span>
                      </span>
                    }
                    onConfirm={() => this.reScoring(record)}
                  >
                    <a href="#">{intl.get(`ssrc.bidHall.model.bidHall.reScore`).d('重新评分')}</a>
                  </Popconfirm>
                )
              ) : (
                intl.get(`ssrc.bidHall.model.bidHall.reScoring`).d('重新评分中')
              ),
          },
          // ======================================================
        ].filter(Boolean);
    return (
      <React.Fragment>
        {customizeTable(
          {
            code:
              sourceFrom === 'RFP' || sourceFrom === 'RFI'
                ? 'SSRC.EXPERT_SCORE_MANAGE.EXPERT_LINE_RFI'
                : 'SSRC.EXPERT_SCORE_MANAGE.EXPERT_LINE',
          },
          <Table
            bordered
            columns={columns}
            rowKey="evaluateScoreIds"
            dataSource={dataSource}
            pagination={false}
            loading={loading && loading.fetchExpertScoreInfoLoading}
          />
        )}
        <Modal
          destroyOnClose
          width={600}
          title={`${expertName}${intl
            .get('ssrc.bidHall.view.message.expertTo')
            .d('专家对')}${supplierCompanyName}${intl
            .get('ssrc.bidHall.view.message.score.details')
            .d('的评分明细')}`}
          wrapClassName="ant-modal-sidebar-right"
          transitionName="move-right"
          onCancel={this.hideScoreDrawer}
          onOk={this.hideScoreDrawer}
          visible={scoreDrawerVisible}
        >
          {this.renderScoreRfxTable()}
        </Modal>
      </React.Fragment>
    );
  }
}
