import React, { PureComponent } from 'react';
import { Table, Popover, Badge } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { yesOrNoRender, valueMapMeaning, dateTimeRender } from 'utils/renderer';
import IMChatDraggable from '_components/IMChatDraggable';

import styles from './OpeningBid.less';

/**
 * 数据列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class TableList extends PureComponent {
  /**
   * 编辑
   * @param {object} record - 数据对象
   */
  editOption(record) {
    this.props.onEdit(record);
  }

  /**
   * 删除
   * @param {object} record - 数据对象
   */
  deleteOption(record) {
    this.props.onDelete(record);
  }

  /**
   *跳转到维护页面
   *
   */
  @Bind()
  inquiryUpdate(record) {
    const { onInquiryUpdate } = this.props;
    onInquiryUpdate(record);
  }

  /**
   *跳转到初审页面
   *
   */
  @Bind()
  preliminary(record) {
    const { onPreliminary } = this.props;
    onPreliminary(record);
  }

  /**
   *跳转到开标页面
   *
   */
  @Bind()
  openingBid(record) {
    const { onOpeningBid } = this.props;
    onOpeningBid(record);
  }

  /**
   *跳转到明细页面
   *
   */
  @Bind()
  inquiryDetail(record) {
    const { onInquiryDetail } = this.props;
    onInquiryDetail(record);
  }

  /**
   * 跳转到核价页面
   */
  @Bind()
  inquiryCheckPrice(record) {
    const { onInquiryCheckPrice } = this.props;
    onInquiryCheckPrice(record);
  }

  /**
   * 跳转到还比价页面
   */
  @Bind()
  inquiryFeedbackBargain(record) {
    const { onInquiryFeedbackBargain } = this.props;
    onInquiryFeedbackBargain(record);
  }

  /**
   * 跳转到评分管理评分结果确认页面
   * @param {Object} record
   */
  @Bind()
  rfxEvaluation(record) {
    const { rfxEvaluation = () => {} } = this.props;
    rfxEvaluation(record);
  }

  /**
   * 跳转到评分管理页面
   *
   * @param {*} record
   * @memberof TableList
   */
  @Bind()
  directScoreManager(record) {
    const { directScoreManager = () => {} } = this.props;
    directScoreManager(record);
  }

  /**
   * 跳转到预定标，确认候选人页面
   * @param {Object} record = {}
   */
  @Bind()
  onOperating(record) {
    const { onOperateBidModel } = this.props;
    onOperateBidModel(record);
  }

  /**
   * 展示报价响应不足modal
   * @param {!Object} record - 行记录
   */
  @Bind()
  handleShowQuoFeedBackLackModal(record = {}) {
    const { onShowQuoFeedBackLackModal } = this.props;
    onShowQuoFeedBackLackModal(record);
  }

  /**
   * 公告查看
   * */
  @Bind()
  previewNotice(record = {}) {
    const { previewNotice = () => {} } = this.props;
    previewNotice(record);
  }

  /**
   * 渲染操作
   */
  @Bind()
  actionRender(record = {}) {
    const { directBidWinnerNotice = () => {}, directPrequalification = () => {} } = this.props;
    const { observerFlag = 0, sourceCategory, biddingFlag } = record || {};
    // 是否是新竞价单
    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    if (observerFlag === 1) {
      return '-'; // 仅为观察员
    }

    let mean = '';
    switch (record.rfxStatus) {
      case 'NEW':
      case 'ROUNDED':
      case 'RELEASE_REJECTED':
        // 新竞价单 隐藏该按钮
        if (!newBiddingFlag) {
          mean = (
            <a onClick={() => this.inquiryUpdate(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.maintain`).d('维护')}
            </a>
          );
        }
        break;
      case 'PREQUAL_CUTOFF':
        mean = (
          <a>{intl.get(`ssrc.inquiryHall.view.message.button.preQualification`).d('资格预审')}</a>
        );
        break;
      case 'IN_POSTQUAL':
        mean = (
          <a>{intl.get(`ssrc.inquiryHall.view.message.button.postQualification`).d('资格后审')}</a>
        );
        break;
      case 'PRETRIAL_PENDING':
        if (record.isPretrailUserFlag === 1) {
          mean = (
            <a onClick={() => this.preliminary(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.preliminary`).d('初审')}
            </a>
          );
        } else {
          mean = '';
        }
        break;
      case 'CHECK_PENDING':
      case 'CHECK_REJECTED':
        mean = record.checkedEnabledFlag === 1 && (
          <a onClick={() => this.inquiryCheckPrice(record)}>
            {intl.get(`ssrc.inquiryHall.view.message.button.checkPrice`).d('核价')}
          </a>
        );
        break;
      case 'IN_QUOTATION':
        if (!record.sealedQuotationFlag && record.sourceCategory !== 'RFA') {
          mean = (
            <a onClick={() => this.inquiryFeedbackBargain(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.stillCompare`).d('还比价')}
            </a>
          );
        }
        break;
      case 'OPEN_BID_PENDING':
        if (record.openEnabledFlag === 1) {
          mean = (
            <a onClick={() => this.openingBid(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.openingBid`).d('开标')}
            </a>
          );
        } else {
          mean = '';
        }

        break;
      case 'SCORING': // 评分阶段
        mean = (
          <span style={{ display: 'flex', justifyContent: 'space-between' }}>
            {record.scoreStatus === 'SCORING' && record.evaluateExpertFlag === 1 && (
              <a onClick={() => this.rfxEvaluation(record)}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.scored').d('评分')}
              </a>
            )}
            {record.evaluateLeaderFlag === 1 && (
              <a onClick={() => this.directScoreManager(record)}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.scoreManager').d('评分管理')}
              </a>
            )}
          </span>
        );
        break;
      case 'IN_PREQUAL':
      case 'PENDING_PREQUAL': // 资格预审
        if (record.prequalUserFlag === 1) {
          mean = (
            <a onClick={() => directPrequalification(record)}>
              {record.enabledSubmitFlag > 0
                ? intl.get('ssrc.inquiryHall.model.inquiryHall.prequalification').d('资格预审')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationView`).d('预审查看')}
            </a>
          );
        }
        break;
      case 'NOT_START':
        if (record.preQualificationFlag === 1 && record.prequalUserFlag === 1) {
          mean = (
            <a onClick={() => directPrequalification(record)}>
              {record.enabledSubmitFlag > 0
                ? intl.get('ssrc.inquiryHall.model.inquiryHall.prequalification').d('资格预审')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationView`).d('预审查看')}
            </a>
          );
        }
        break;
      case 'OPENED': // 操作
        mean = (
          <a onClick={() => this.onOperating(record)}>
            {intl.get(`ssrc.inquiryHall.view.message.button.operating`).d('操作')}
          </a>
        );
        break;
      case 'LACK_QUOTED': // 报价响应不足
        mean = (
          <a onClick={() => this.handleShowQuoFeedBackLackModal(record)}>
            {intl.get(`ssrc.inquiryHall.view.message.button.operating`).d('操作')}
          </a>
        );
        break;
      case 'FINISHED':
        mean = (
          <a onClick={() => directBidWinnerNotice(record)}>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.bidNotices`).d('中标通知/公告')}
          </a>
        );
        break;
      case 'ROUND_QUOTATION': // 多轮报价
        mean =
          record.evaluateLeaderFlag === 1 &&
          (record.roundQuotationRule === 'SCORE' || record.roundQuotationRule === 'AUTO_SCORE') ? (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {record.scoreStatus === 'SCORING' ? (
                <a onClick={() => this.rfxEvaluation(record)}>
                  {intl.get('ssrc.inquiryHall.model.inquiryHall.scored').d('评分')}
                </a>
              ) : (
                ''
              )}
              {record.evaluateLeaderFlag === 1 ? (
                <a onClick={() => this.directScoreManager(record)}>
                  {intl.get('ssrc.inquiryHall.model.inquiryHall.scoreManager').d('评分管理')}
                </a>
              ) : (
                ''
              )}
            </div>
          ) : record.roundQuotationRule === 'CHECK' ? (
            <a onClick={() => this.inquiryCheckPrice(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.checkPrice`).d('核价')}
            </a>
          ) : (
            ''
          );
        break;
      case 'BARGAINING':
        if (record.bargainingStage === 'CHECK') {
          mean = record.checkedEnabledFlag === 1 && (
            <a onClick={() => this.inquiryCheckPrice(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.checkPrice`).d('核价')}
            </a>
          );
        } else {
          mean = (
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              {record.scoreStatus === 'SCORING' && record.evaluateExpertFlag === 1 && (
                <a onClick={() => this.rfxEvaluation(record)}>
                  {intl.get('ssrc.inquiryHall.model.inquiryHall.scored').d('评分')}
                </a>
              )}
              {record.evaluateLeaderFlag === 1 && (
                <a onClick={() => this.directScoreManager(record)}>
                  {intl.get('ssrc.inquiryHall.model.inquiryHall.scoreManager').d('评分管理')}
                </a>
              )}
            </span>
          );
        }
        break;
      default:
        break;
    }
    return mean;
  }

  /**
   * 渲染询价监控台
   */
  @Bind()
  inquiryMonitoringStationRender(record) {
    let mean = null;
    if (record.supervisorFlag === 1) {
      mean = (
        <a onClick={() => this.goMonitor(record)}>
          {intl.get(`ssrc.inquiryHall.view.message.button.detail`).d('详情')}
        </a>
      );
    }
    return mean;
  }

  /**
   * 报价响应
   */
  @Bind()
  quotationFeedBack(record) {
    const { onQuotationFeedBack } = this.props;
    onQuotationFeedBack(record);
  }

  /**
   * 跳转到监控台
   */
  @Bind()
  goMonitor(record) {
    const { onGoMonitor } = this.props;
    onGoMonitor(record);
  }

  /**
   * 渲染Rfx单号 filed
   */
  @Bind()
  statusMeaningRender(val, record) {
    const { rfxStatusMeaning, sourceCategoryMeaning, rfxNum } = record;
    const dragText = intl
      .get(`ssrc.inquiryHall.model.inquiryHall.sourceCategoryNum`, {
        rfxNum,
        sourceCategory: sourceCategoryMeaning,
      })
      .d('{sourceCategory}单{rfxNum}');
    const chatProps = {
      dragText,
      requestBody: record,
    };
    switch (val) {
      case 'IN_QUOTATION':
        return (
          <IMChatDraggable cardCode="SSRC_RFX_QUOTATIOIN_ATTENTION" {...chatProps}>
            {rfxStatusMeaning}
          </IMChatDraggable>
        );
      case 'BARGAINING':
        return (
          <IMChatDraggable cardCode="SSRC_RFX_BARGAIN_ATTENTION" {...chatProps}>
            {rfxStatusMeaning}
          </IMChatDraggable>
        );
      case 'ROUND_QUOTATION':
        return (
          <IMChatDraggable cardCode="SSRC_RFX_ROUND_QUOTATIOIN_ATTENTION" {...chatProps}>
            {rfxStatusMeaning}
          </IMChatDraggable>
        );
      default:
        return (
          <IMChatDraggable cardCode="SSRC_RFX_COMMON_STATUS_ATTENTION" {...chatProps}>
            {rfxStatusMeaning}
          </IMChatDraggable>
        );
    }
  }

  /**
   * 渲染columns
   * @returns {*}
   */
  renderColumns() {
    const { sourceMethod = [], auctionDirection = [], directQuestionAnswer } = this.props;
    const inquiryHallColumns = [
      {
        title: (
          <span style={{ marginLeft: '18px' }}>{intl.get('hzero.common.status').d('状态')}</span>
        ),
        dataIndex: 'rfxStatus',
        width: 120,
        fixed: 'left',
        render: this.statusMeaningRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 120,
        fixed: 'left',
        render: (val, record) => this.actionRender(record),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.RFXNo.`).d('RFX单号'),
        dataIndex: 'rfxNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => <a onClick={() => this.inquiryDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitle`).d('询价单标题'),
        dataIndex: 'rfxTitle',
        width: 120,
        fixed: 'left',
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.monitoringPlatform`).d('询价监控台'),
        dataIndex: 'monitoringPlatform',
        width: 100,
        render: (val, record) => {
          const { observerFlag = 0, supervisorFlag = 0 } = record || {};

          if (observerFlag === 1 || supervisorFlag !== 1) {
            return '-'; // 仅为观察员
          }

          return this.inquiryMonitoringStationRender(record);
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTime`).d('报价开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadline`).d('报价截止时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
        dataIndex: 'purOrganizationName',
        width: 120,
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
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.round`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quoteResponse`).d('报价响应'),
        dataIndex: 'quotationFeedBack',
        width: 100,
        render: (val, record) => <a onClick={() => this.quotationFeedBack(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.preQualification`).d('资格预审'),
        dataIndex: 'preQualificationFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.applicationDeadline`)
          .d('资格预审截止时间'),
        dataIndex: 'prequalEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.createdUnitName`).d('创建人部门'),
        dataIndex: 'createdUnitName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertEvaluation`).d('专家评分'),
        dataIndex: 'expertScoreFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
        dataIndex: 'templateName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
        dataIndex: 'sourceCategoryMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式'),
        dataIndex: 'sourceMethod',
        width: 120,
        render: (val) => valueMapMeaning(sourceMethod, val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式'),
        dataIndex: 'quotationTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`).d('密封报价'),
        dataIndex: 'sealedQuotationFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.model.common.documentCreationDate`).d('单据创建时间'),
        dataIndex: 'sourceCreationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingDirection`).d('报价方向'),
        dataIndex: 'auctionDirection',
        width: 100,
        render: (val) => valueMapMeaning(auctionDirection, val),
      },
      {
        title: intl.get(`ssrc.common.model.common.createdByName`).d('创建人'),
        dataIndex: 'createByName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionAnswer`).d('澄清答疑'),
        dataIndex: 'questionAnswer',
        width: 100,
        render: (_, record) => {
          const { observerFlag = 0 } = record || {};

          if (observerFlag === 1) {
            return '-'; // 仅为观察员
          }

          return record.rfxStatus !== 'NEW' ? (
            <Badge
              count={record.unreadIssueCount}
              offset={[0, 10]}
              className={styles['badge-item']}
            >
              <a onClick={() => directQuestionAnswer(record)}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.questionAnswer`).d('澄清答疑')}
              </a>
            </Badge>
          ) : null;
        },
      },
    ];
    return inquiryHallColumns;
  }

  render() {
    const { loading, dataSource, pagination, onChange, customizeTable } = this.props;
    const scrollX = sum(this.renderColumns().map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable(
      { code: 'SSRC.INQUIRY_HALL.LIST' },
      <Table
        bordered
        rowKey="rfxHeaderId"
        loading={loading}
        columns={this.renderColumns()}
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={(page) => onChange(page)}
      />
    );
  }
}
