// 询价要求form

import React, { Component } from 'react';
import { Tooltip, Output, Modal } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { isEmpty, isNil, noop } from 'lodash';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import CollapseForm from '_components/CollapseForm';

import intl from 'utils/intl';
import { yesOrNoRender, dateTimeRender } from 'utils/renderer';

import { numberSeparatorRender } from '@/utils/renderer';
import MatterDetail from '@/routes/components/MatterDetail/MatterDetail';
import RenderBiddingNodes from '@/routes/ssrc/components/BiddingNodes/RenderBiddingNodes';
import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import Prequal from './Prequal';
import ScoringElementTable from './ScoringElementTable';
import ExpertTable from './ExpertTable';
import InitialReviewTable from './InitialReviewTable';

@observer
export default class RfxDemandForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      technologyWeight: 50,
      businessWeight: 50,
    };
  }

  // render yes no
  yesOrNoRenderer(value = null) {
    const currentValue = this.translaeTorNumber(value);
    const statusMap = ['error', 'success'];
    return (
      <Badge
        status={statusMap[currentValue]}
        text={
          currentValue
            ? intl.get('hzero.common.status.yes').d('是')
            : intl.get('hzero.common.status.no').d('否')
        }
      />
    );
  }

  renderDurationTime(record = {}, field = null, otherPayload = {}) {
    if (!field) {
      return null;
    }

    const {
      newBiddingFlag, // 新竞价
    } = otherPayload || {};

    let quoteDay = 0;
    let quoteHour = 0;
    let quoteMinute = 0;
    const Times = record.get(field) || null;

    const setFields = () => {
      const DayMeaning =
        quoteDay +
        intl.get('hzero.common.date.unit.day').d('天') +
        quoteHour +
        intl.get('hzero.common.date.unit.hours').d('小时') +
        quoteMinute +
        intl.get('hzero.common.date.unit.minutes').d('分钟');

      return DayMeaning;
    };

    if (isNil(Times)) {
      return;
    }

    quoteDay = Math.floor(Times / 1440);
    quoteHour =
      quoteDay > 0
        ? Math.floor((Times - quoteDay * 1440) / 60)
        : Times
        ? Math.floor(Times / 60)
        : Times;
    quoteMinute = quoteHour > 0 || quoteDay > 0 ? Times - quoteDay * 1440 - quoteHour * 60 : Times;

    // 新竞价保留1位
    if (newBiddingFlag) {
      quoteMinute = quoteMinute.toFixed(1);
    } else {
      quoteMinute = quoteMinute.toFixed(2);
    }
    return setFields();
  }

  // 预审小组lov tooltip
  renderpretialMemberLovTooltip(value = null) {
    return <Tooltip title={value}>{value || '-'}</Tooltip>;
  }

  prepareFields() {
    const bidFlag = this.props.rfx?.bidFlag;
    const Fields = [
      <Output
        name="sourceCategoryMeaning"
        renderer={({ record }) => {
          if (bidFlag) {
            return record?.get('secondarySourceCategoryMeaning');
          }
          return record?.get('sourceCategoryMeaning');
        }}
      />,
    ];
    return Fields;
  }

  // 渲染符合性检查
  renderComplianceCheckWrapper() {
    return (
      <div className={styles['m-t-xlg']}>
        <h4 className={classnames(styles['rfx-card-item-title-level-two'])}>
          <div className={styles['rfx-card-item-title-line']} />
          <span>
            {intl.get(`ssrc.inquiryHall.view.message.tab.complianceCheck`).d('符合性检查')}
          </span>
        </h4>
        {this.renderComplianceCheckTable()}
      </div>
    );
  }

  // 渲染符合性检查table
  renderComplianceCheckTable() {
    const {
      rfxInfoDS,
      sourceHeaderId,
      organizationId,
      initialReviewDS,
      customizeTable,
      rfx,
    } = this.props;
    const infoHeader = rfxInfoDS.current.toData() || {};
    const { unitCodeSymbol } = rfx || {};
    const reviewProps = {
      unitCodeSymbol,
      customizeTable,
      sourceHeaderId,
      organizationId,
      ds: initialReviewDS,
      header: infoHeader,
    };
    return <InitialReviewTable {...reviewProps} />;
  }

  // 寻源事项须知
  handleMatterDetail = (value = '') => {
    const MatterDetailProps = {
      matterDetail: value,
      onRef: (ref = {}) => {
        this.MatterDetail = ref;
      },
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      closable: true,
      drawer: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.tab.matterDetailNotice`).d('寻源事项须知'),
      children: <MatterDetail {...MatterDetailProps} />,
      style: { width: '60%' },
      cancelText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
      footer: (_, cancelBtn) => cancelBtn,
      cancelProps: {
        color: 'primary',
      },
    });
  };

  renderScoreDetailTabale() {
    const {
      businessScoringElementDS,
      technologyScoringElementDS,
      allScoringElementDS,
      rfxInfoDS = {},
      /** ********* 协鑫二开新增价格要素-勿动!!! *********** */
      priceScoringElementDS,
      remote,
      bidFlag,
    } = this.props;

    const bidRuleType = rfxInfoDS.current.get('bidRuleType');

    if (!bidRuleType) {
      return null;
    }

    return (
      <div className={styles['m-t-xlg']}>
        <h4 className={classnames(styles['rfx-card-item-title-level-two'])}>
          <div className={styles['rfx-card-item-title-line']} />
          <span>{intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')}</span>
        </h4>

        {bidRuleType === 'NONE' &&
          this._renderScoreTableList('', 'BUSINESS_TECHNOLOGY', allScoringElementDS)}
        {remote
          ? remote.render('SSRC_INQUIRY_HALL_DETAIL_RENDER_PREPARE_PRICE_SCORE_ELEMENT', null, {
              bidFlag,
              priceScoringElementDS,
              rfxInfoDS,
              that: this,
            })
          : null}
        {bidRuleType !== 'NONE' &&
          this._renderScoreTableList(
            intl
              .get(`ssrc.inquiryHall.model.inquiryHall.businessScoringElements`)
              .d('商务组评分要素'),
            'BUSINESS',
            businessScoringElementDS
          )}
        {bidRuleType !== 'NONE' &&
          this._renderScoreTableList(
            intl
              .get(`ssrc.inquiryHall.model.inquiryHall.technologyScoringElements`)
              .d('技术组评分要素'),
            'TECHNOLOGY',
            technologyScoringElementDS
          )}
      </div>
    );
  }

  translaeTorNumber = (value = null) => {
    const result = !value || value === '0' || value === 'NO' || value === 'N' ? 0 : 1;
    return result;
  };

  // 权重渲染默认值
  calcWeight(type = null, ds = {}) {
    if (type === 'BUSINESS_TECHNOLOGY') {
      return;
    }

    let weigthData = 50;
    const data = ds.toData();
    if (isEmpty(data)) {
      return weigthData;
    }

    const firstLineData = data[0];
    if (type === 'BUSINESS') {
      weigthData = firstLineData.businessWeight;
      weigthData = weigthData || weigthData === 0 ? weigthData : 50;
    }
    if (type === 'TECHNOLOGY') {
      weigthData = firstLineData.technologyWeight;
      weigthData = weigthData || weigthData === 0 ? weigthData : 50;
    }
    return weigthData;
  }

  // 评分要素工厂函数
  _renderScoreTableList(title = null, type = null, ds = {}) {
    const {
      sourceHeaderId,
      organizationId,
      rfxInfoDS,
      customizeTable,
      rfx = {},
      remote,
      bidFlag = false,
    } = this.props;

    const dataFlag = (ds.toData() || []).length > 0;
    const weight = this.calcWeight(type, ds);

    const templateScoreType = rfxInfoDS.current.get('templateScoreType');

    const ScoreProps = {
      templateScoreType,
      ds,
      type,
      organizationId,
      sourceHeaderId,
      customizeTable,
      rfx,
      remote,
      rfxInfoDS,
    };

    const weightDisplay = <span style={{ marginLeft: '16px' }}>({`${weight || 0} % `})</span>;

    const remoteProps = {
      bidFlag,
    };

    return (
      <div>
        <div className={classnames(styles['score-element-header'])}>
          {title}
          {type !== 'BUSINESS_TECHNOLOGY' && dataFlag && templateScoreType !== 'SCORE_NEW'
            ? remote
              ? remote.render(
                  'SSRC_INQUIRY_HALL_DETAIL_RENDER_SCORE_ELEMENT_WEIGHT',
                  weightDisplay,
                  remoteProps
                )
              : weightDisplay
            : null}
        </div>
        <ScoringElementTable {...ScoreProps} />
        <div className={styles['default-gap']} />
      </div>
    );
  }

  quotationFields(autoRoundQuotationFlag) {
    const { rfxInfoDS, serviceChargeFlag = false } = this.props;
    const record = rfxInfoDS.current || null;
    if (!record) {
      return [];
    }

    const openerFlag = (rfxInfoDS.current && rfxInfoDS.current.get('openerFlag')) || 0;
    let sealedQuotationFlag = rfxInfoDS.current && rfxInfoDS.current.get('sealedQuotationFlag'); // 密封报价
    sealedQuotationFlag = this.translaeTorNumber(sealedQuotationFlag);
    const preQualificationFlag = rfxInfoDS.current.get('preQualificationFlag'); // 资格预审
    const biddingPriceFlag = record.get('sourceCategory') === 'RFA'; // 竞价标识
    const startFlag = record.get('startFlag') || 0;
    const quotationEndDateFlag = record.get('quotationEndDateFlag') || 0;
    const matterRequireFlag = record.get('matterRequireFlag') || 0;
    const quotationRunningDurationFlag = record.get('quotationRunningDurationFlag') || 0;
    const Fields = [
      !preQualificationFlag && !autoRoundQuotationFlag ? (
        <Output name="startFlag" renderer={({ value }) => this.yesOrNoRenderer(value)} />
      ) : null,
      !preQualificationFlag && !autoRoundQuotationFlag ? (
        <div name="quotationField_1_2" fieldClassName="td-no-visible1" />
      ) : null,
      !preQualificationFlag && !autoRoundQuotationFlag ? (
        <div name="quotationField_1_3" fieldClassName="td-no-visible1" />
      ) : null,
      quotationEndDateFlag && !biddingPriceFlag && startFlag && !autoRoundQuotationFlag ? (
        quotationRunningDurationFlag === 1 ? (
          <Output name="quotationEndDate" />
        ) : (
          <Output
            name="startQuotationRunningDuration"
            renderer={({ record: currentRecord }) =>
              this.renderDurationTime(currentRecord, 'startQuotationRunningDuration')
            }
          />
        )
      ) : null,
      !startFlag && !autoRoundQuotationFlag ? <Output name="quotationStartDate" /> : null,
      quotationEndDateFlag && !startFlag && !autoRoundQuotationFlag ? (
        <Output name="quotationEndDate" />
      ) : null,
      biddingPriceFlag ? (
        quotationRunningDurationFlag === 1 ? (
          <Output name="quotationEndDate" />
        ) : (
          <Output
            name="quotationRunningDuration"
            renderer={({ record: currentRecord }) =>
              this.renderDurationTime(currentRecord, 'quotationRunningDuration')
            }
          />
        )
      ) : null,
      biddingPriceFlag ? <Output name="quotationInterval" /> : null,
      biddingPriceFlag ? <Output name="quotationOrderTypeMeaning" /> : null,
      biddingPriceFlag ? <Output name="auctionRuleMeaning" /> : null,
      biddingPriceFlag ? <Output name="openRuleMeaning" /> : null,
      biddingPriceFlag ? <Output name="rankRuleMeaning" /> : null,
      biddingPriceFlag ? <Output name="autoDeferFlag" /> : null,
      biddingPriceFlag ? <Output name="autoDeferDuration" /> : null,
      biddingPriceFlag ? <Output name="autoDeferTypeMeaning" /> : null,
      biddingPriceFlag ? <Output name="autoDeferPeriod" /> : null,
      biddingPriceFlag ? <Output name="maxDeferCount" /> : null,
      <Output name="sealedQuotationFlag" renderer={({ value }) => this.yesOrNoRenderer(value)} />,
      sealedQuotationFlag && openerFlag ? (
        <Output name="passwordFlag" renderer={({ value }) => this.yesOrNoRenderer(value)} />
      ) : null,
      openerFlag && sealedQuotationFlag ? (
        <Output
          name="openBidLov"
          renderer={({ value }) => this.renderpretialMemberLovTooltip(value)}
        />
      ) : null,
      <Output name="quotationTypeMeaning" />,
      <Output name="currencyCode" />,
      <Output name="multiCurrencyFlag" renderer={({ value }) => this.yesOrNoRenderer(value)} />,
      <Output name="quotationScopeMeaning" />,
      <Output name="paymentTypeName" />,
      <Output name="paymentTermName" />,
      <Output name="paymentTermFlag" renderer={({ value }) => this.yesOrNoRenderer(value)} />,
      <Output name="bidFileExpense" renderer={(value) => this.rendererBidBond(value)} />,
      serviceChargeFlag && <Output name="bidFileDownloadNodeMeaning" />,
      serviceChargeFlag && (
        <Output
          name="serviceExpenseChargeFlag"
          renderer={({ value }) => this.yesOrNoRenderer(value)}
        />
      ),
      <Output name="bidBond" renderer={(value) => this.rendererBidBond(value)} />,
      <Output name="minQuotedSupplier" />,
      <Output name="centralPurchaseFlag" renderer={({ value }) => this.yesOrNoRenderer(value)} />,
      <Output name="taxChangeFlag" renderer={({ value }) => this.yesOrNoRenderer(value)} />,
      <Output
        name="continuousQuotationFlag"
        renderer={({ value }) => this.yesOrNoRenderer(value)}
      />,
      <Output name="quantityChangeFlag" renderer={({ value }) => this.yesOrNoRenderer(value)} />,
      <Output
        name="diyLadderQuotationFlag"
        renderer={({ value }) => this.yesOrNoRenderer(value)}
      />,
      <Output name="clarifyEndDate" />,
      matterRequireFlag ? (
        <Output
          name="matterDetail"
          renderer={({ value }) => (
            <a onClick={() => this.handleMatterDetail(value, record)}>
              {intl.get('hzero.common.view.title.view').d('查看')}
            </a>
          )}
        />
      ) : null,
    ];

    return Fields.filter(Boolean);
  }

  roundQuotationFields() {
    const { rfxInfoDS } = this.props;
    const currentQuotationRounds = [];
    const records = rfxInfoDS.current || null;
    if (!records) {
      return [];
    }
    const StartFlag = records.get('startFlag');
    const quotationRounds = records.get('quotationRounds');
    for (let i = 1; i < quotationRounds + 1; i++) {
      currentQuotationRounds.push(i);
    }

    const Fields = [
      !records.get('preQualificationFlag') ? (
        <Output name="multiCurrencyFlag" renderer={({ value }) => this.yesOrNoRenderer(value)} />
      ) : null,
      // !records.get('preQualificationFlag') ? <Output name="startFlag" renderer={(data) => this.renderCheckboxField(data, intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始'))} /> : null,
      StartFlag
        ? currentQuotationRounds.map((item) => (
          <Output
            name={`roundQuotationRunningDurationMeaning${item}`}
            label={intl
                .get('ssrc.inquiryHall.model.inquiryHall.roundRuningTime', {
                  num: item,
                })
                .d('第{num}轮报价运行时间')}
          />
          ))
        : currentQuotationRounds.map((item) => (
          <Output
            name={`quotationTime${item}`}
            label={intl
                .get('ssrc.inquiryHall.model.inquiryHall.roundDuringTime', {
                  num: item,
                })
                .d('第{num}轮报价时间')}
            disabled
            renderer={({ value }) => {
                return dateTimeRender(value);
              }}
          />
          )),
    ];
    return Fields.filter(Boolean);
  }

  // 竞价大厅-竞价时间
  renderBiddingTimeForm = () => {
    const { rfxInfoDS, biddingTimeDS } = this.props;
    const rfxInfoRecord = rfxInfoDS.current || null;
    if (!rfxInfoRecord) {
      return [];
    }

    const { biddingHallFlag } = rfxInfoDS.getQueryParameter('commonProps') || {};

    const {
      rfxStatus,
      biddingMode,
      biddingFlag,
      sourceCategory,
      preQualificationFlag,
      biddingOnlineSignInFlag, // 签到标识
      signInRunningDurationFlag, // 签到运行时间标识
      biddingTrialBiddingFlag, // 试竞价标识
      startingTrialBiddingRunningDurationFlag, // 试竞价运行时间标识
      startingBiddingRunningDurationFlag, // 正式竞价运行时间标识
      autoDeferFlag, // 是否启用自动延时标识
      biddingSupplementPriceRunningDurationFlag, // 补充单价运行标识
      biddingTarget, // 竞价对象
      biddingTotalPricePrinciple, // 总价竞价原则
    } = rfxInfoRecord?.get([
      'rfxStatus',
      'biddingMode', // 竞价模式
      'biddingFlag', // 1-竞价大厅
      'sourceCategory',
      'preQualificationFlag',
      'biddingOnlineSignInFlag',
      'signInRunningDurationFlag',
      'biddingTrialBiddingFlag',
      'startingTrialBiddingRunningDurationFlag',
      'startingBiddingRunningDurationFlag',
      'autoDeferFlag',
      'biddingSupplementPriceRunningDurationFlag',
      'biddingTarget',
      'biddingTotalPricePrinciple',
    ]);

    // 单据如果是以下状态，则询价单维护啥明细显示啥，否则代表单子已成功发布，显示具体时间
    const newRfxStatus = [
      'NEW',
      'RELEASE_APPROVING',
      'RELEASE_REJECTED',
      'ROUNDED',
      'CANCELED',
    ].includes(rfxStatus);

    // 竞价大厅标识
    const newBiddingFlag =
      !!biddingHallFlag && sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
    // 延时相关字段显示标识 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【启用自动延时】为【启用】时展示，任一不满足时隐藏
    const timerToTriggerFlag =
      !!newBiddingFlag && biddingMode === 'BRITISH_BIDDING' && autoDeferFlag;
    // 总价竞价且总价竞价原则为总价必输
    const totalPriceFlag =
      biddingTarget === 'TOTAL_PRICE' && biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';

    const timerToTriggerFields = timerToTriggerFlag
      ? [
        <Output
          name="autoDeferDuration"
          renderer={({ value }) => {
              if (!isNil(value)) {
                return `${value}${intl
                  .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
                  .d('分钟')}`;
              }
              return null;
            }}
        />,
          // <Output name="maxDeferCount" renderer={this.renderNoRestrictions} />,
        ]
      : [];

    // 签到字段
    const signInFields = biddingOnlineSignInFlag
      ? [
        <Output
          name="signInStartDate"
          renderer={({ value, record }) => {
              const { signInStartFlag } = record.get(['signInStartFlag']);
              if (signInStartFlag && newRfxStatus) {
                if (preQualificationFlag) {
                  return intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.startAfterPreQualificationEnd`)
                    .d('资格预审截止即开始');
                }
                return intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始');
              }
              return dateTimeRender(value);
            }}
        />,
          signInRunningDurationFlag && newRfxStatus ? (
            <Output
              name="signInRunningDuration"
              renderer={({ record }) =>
                this.renderDurationTime(record, 'signInRunningDuration', { newBiddingFlag: true })
              }
            />
          ) : (
            <Output name="signInEndDate" />
          ),
          /* 占位符 */
        <div name="signInEndDateField_1_3" fieldClassName="td-no-visible" />,
        ].filter(Boolean)
      : [];

    // 试竞价字段
    const trailBiddingFields = biddingTrialBiddingFlag
      ? [
        <Output
          name="startingTrialBiddingStartDate"
          renderer={({ value, record }) => {
              const { startingTrialBiddingStartFlag } = record.get([
                'startingTrialBiddingStartFlag',
              ]);
              if (startingTrialBiddingStartFlag && newRfxStatus) {
                if (biddingOnlineSignInFlag) {
                  return intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.startAfterSignIn`)
                    .d('签到截止即开始');
                }
                if (preQualificationFlag) {
                  return intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.startAfterPreQualificationEnd`)
                    .d('资格预审截止即开始');
                }
                return intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始');
              }
              return dateTimeRender(value);
            }}
        />,
          startingTrialBiddingRunningDurationFlag && newRfxStatus ? (
            <Output
              name="startingTrialBiddingRunningDuration"
              renderer={({ record }) =>
                this.renderDurationTime(record, 'startingTrialBiddingRunningDuration', {
                  newBiddingFlag: true,
                })
              }
            />
          ) : (
            <Output name="startingTrialBiddingEndDate" />
          ),
          /* 占位符 */
        <div name="startingTrialBiddingEndDateField_2_3" fieldClassName="td-no-visible" />,
        ].filter(Boolean)
      : [];

    // 正式竞价字段
    const biddingFields = [
      <Output
        name="quotationStartDate"
        renderer={({ value, record }) => {
          const { startFlag } = record.get(['startFlag']);
          if (startFlag && newRfxStatus) {
            if (biddingTrialBiddingFlag) {
              return intl
                .get(`ssrc.inquiryHall.model.inquiryHall.startAfterTrialBiddingEnd`)
                .d('试竞价截止即开始');
            }
            if (biddingOnlineSignInFlag) {
              return intl
                .get(`ssrc.inquiryHall.model.inquiryHall.startAfterSignIn`)
                .d('签到截止即开始');
            }
            if (preQualificationFlag) {
              return intl
                .get(`ssrc.inquiryHall.model.inquiryHall.startAfterPreQualificationEnd`)
                .d('资格预审截止即开始');
            }
            return intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始');
          }
          return dateTimeRender(value);
        }}
      />,
      startingBiddingRunningDurationFlag && newRfxStatus ? (
        <Output
          name="quotationRunningDuration"
          renderer={({ record }) =>
            this.renderDurationTime(record, 'quotationRunningDuration', { newBiddingFlag: true })
          }
        />
      ) : (
        <Output name="quotationEndDate" />
      ),
      /* 占位符 */
      <div name="quotationEndDateField_3_3" fieldClassName="td-no-visible" />,
    ];

    // 补充单价字段
    const biddingSupplementPriceFields = totalPriceFlag
      ? [
        <Output
          name="biddingSupplementPriceStartDate"
          renderer={({ value, record }) => {
              const { biddingSupplementPriceStartFlag } = record.get([
                'biddingSupplementPriceStartFlag',
              ]);
              if (biddingSupplementPriceStartFlag && newRfxStatus) {
                return intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.startAfterQuotationEnd`)
                  .d('竞价截止即开始');
              }
              return dateTimeRender(value);
            }}
        />,
          biddingSupplementPriceRunningDurationFlag && newRfxStatus ? (
            <Output
              name="biddingSupplementPriceRunningDuration"
              renderer={({ record }) =>
                this.renderDurationTime(record, 'biddingSupplementPriceRunningDuration', {
                  newBiddingFlag: true,
                })
              }
            />
          ) : (
            <Output name="biddingSupplementPriceEndDate" />
          ),
          /* 占位符 */
        <div name="biddingSupplementPriceEndDateField_4_3" fieldClassName="td-no-visible" />,
        ]
      : [];

    const fields = [
      ...signInFields,
      ...trailBiddingFields,
      ...biddingFields,
      ...biddingSupplementPriceFields,
      ...timerToTriggerFields,
      // 占位符
      <div name="biddingTime_7_1" fieldClassName="td-no-visible" />,
      /* 竞价节点 */
      <RenderBiddingNodes name="biddingTimeNode" rfxInfoDS={biddingTimeDS} />,
    ];
    return fields.filter(Boolean);
  };

  renderNoRestrictions = ({ value = null }) => {
    if (isNil(value)) {
      return intl.get('ssrc.common.view.noRestrictions').d('不限制');
    }

    return value;
  };

  // 竞价大厅竞价规则
  renderBiddingRuleForm = () => {
    const {
      rfxInfoDS,
      newBiddingFlag,
      // japOrDutchBiddingTotalPrice = noop,
      japanBiddingTotalPrice = noop,
      // britishBidding = noop,
      dutchBiddingTotalPrice = noop,
    } = this.props;
    const rfxInfoRecord = rfxInfoDS.current || null;
    if (!rfxInfoRecord) {
      return [];
    }
    // const { biddingHallFlag } = rfxInfoDS.getQueryParameter('commonProps') || {};
    const {
      biddingMode,
      // biddingFlag,
      // sourceCategory,
      quotationOrderType,
      biddingTarget,
      quotationType,
      autoDeferFlag,
      biddingTotalPricePrinciple,
      isBritishBidTrafficLight,
      biddingTrialBiddingFlag,
      biddingStageChangeableFlag,
    } = rfxInfoRecord?.get([
      'biddingMode', // 竞价模式
      'biddingFlag', // 1-竞价大厅
      'sourceCategory',
      'quotationOrderType', // 头上的报价次序
      'biddingTarget', // 竞价对象
      'quotationType',
      'autoDeferFlag',
      'biddingTotalPricePrinciple',
      'isBritishBidTrafficLight',
      'biddingTrialBiddingFlag',
      'biddingStageChangeableFlag',
    ]);

    // 竞价大厅标识
    // const newBiddingFlag = !!biddingHallFlag && sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
    // 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】时展示，任一不为时隐藏
    const britishBiddingFlag = !!newBiddingFlag && biddingMode === 'BRITISH_BIDDING';
    // 报价次序 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】且【报价方式】为【线上报价】时展示，任一不满足时隐藏

    const currentTotalPriceFlag = biddingTarget === 'TOTAL_PRICE' && newBiddingFlag;

    const japanBiddingFlag = japanBiddingTotalPrice();

    const japanTotalBiddingFlag = japanBiddingFlag && currentTotalPriceFlag;

    const dutchBiddingFlag = dutchBiddingTotalPrice();

    const dutchTotalBiddingFlag = dutchBiddingFlag && currentTotalPriceFlag;

    // const japOrDutchBiddingFlag = japanBiddingFlag || dutchBiddingFlag;

    const japOrDutchTotalBiddingFlag = japanTotalBiddingFlag || dutchTotalBiddingFlag;

    const biddingQuotationOrderFlag =
      biddingMode === 'BRITISH_BIDDING' &&
      biddingTarget === 'UNIT_PRICE' &&
      quotationType === 'ONLINE'; // BRITISH_BIDDING 英式竞价
    // 报价间隔时间 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】且【报价次序】为【序列】时展示，任一不满足时隐藏
    const quotationIntervalFlag =
      biddingMode === 'BRITISH_BIDDING' &&
      biddingTarget === 'UNIT_PRICE' &&
      quotationOrderType === 'SEQUENCE';
    // 起竞价、报价幅度、安全价 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【总价竞价】，任一不满足时隐藏
    const totalBiddingPriceFlag = !!britishBiddingFlag && biddingTarget === 'TOTAL_PRICE';
    // 【竞价对象】是单价，【报价次序】是并行时，显示【单价竞价规则】，否则不显示
    const unitBiddingRuleVisibleFlag =
      biddingTarget === 'UNIT_PRICE' && quotationOrderType === 'PARALLEL';
    // 总价 - 总价必输
    const totalRequiredFlag =
      biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED' && totalBiddingPriceFlag;

    // 总价竞价显示的字段flag 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【总价竞价】，任一不满足时隐藏
    const biddingTotalPriceFlag = britishBiddingFlag && biddingTarget === 'TOTAL_PRICE';

    // 总价竞价-启用红绿灯
    const totalPriceTrafficLight = biddingTotalPriceFlag && isBritishBidTrafficLight;

    // 总价竞价 - 试竞价 - 启用红绿灯
    const trialTotalPriceTrafficLight = totalPriceTrafficLight && biddingTrialBiddingFlag;

    // 竞价 允许调整节点
    const allowAdjustBiddingStage = newBiddingFlag && biddingStageChangeableFlag === 1;

    // 日/荷兰 试竞价 标识
    const trialJapanDutchTotal = japOrDutchTotalBiddingFlag && biddingTrialBiddingFlag;

    const fields = [
      <Output name="biddingTargetMeaning" />,
      biddingQuotationOrderFlag && <Output name="quotationOrderTypeMeaning" />,
      quotationIntervalFlag && (
        <Output
          name="quotationInterval"
          renderer={({ value }) => this.rendererQuotationInterval(value)}
        />
      ),
      // <Output name="auctionRuleMeaning" />,
      <Output name="biddingStrategyMeaning" />,
      // 起竞价 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【总价竞价】，任一不满足时隐藏
      (totalBiddingPriceFlag && isBritishBidTrafficLight !== 1) || japOrDutchTotalBiddingFlag ? (
        <Output
          name="startingBiddingPrice"
          renderer={({ value }) => numberSeparatorRender(value)}
        />
      ) : null,
      <Output
        name="trialStartingBiddingPrice"
        renderer={({ value }) => numberSeparatorRender(value)}
        hidden={!trialJapanDutchTotal}
      />,
      <Output
        name="quotationRange"
        hidden={!currentTotalPriceFlag}
        renderer={({ record }) => {
          const { floatType, floatTypeMeaning, quotationRange } = record
            ? record.get(['floatType', 'floatTypeMeaning', 'quotationRange'])
            : {};
          if (floatType && !isNil(quotationRange)) {
            return `${floatTypeMeaning || '-'} | ${numberSeparatorRender(quotationRange)} ${
              floatType === 'ratio' ? '%' : ''
            }`;
          } else if (floatType && floatTypeMeaning) {
            return `${floatTypeMeaning} | -`;
          }
          return '-';
        }}
      />,
      <Output
        name="biddingTrialQuotationRange"
        hidden={!trialJapanDutchTotal}
        renderer={({ record }) => {
          const { floatType, floatTypeMeaning, biddingTrialQuotationRange = 10 } = record
            ? record.get(['floatType', 'floatTypeMeaning', 'biddingTrialQuotationRange'])
            : {};

          if (isNil(biddingTrialQuotationRange)) {
            return '-';
          }

          let text = numberSeparatorRender(biddingTrialQuotationRange);

          if (floatType === 'ratio') {
            text = `${biddingTrialQuotationRange}%`;
          }

          if (floatTypeMeaning) {
            text = `${floatTypeMeaning} | ${text}`;
          }

          return text;
        }}
      />,
      totalBiddingPriceFlag && (
        <Output
          name="safePrice"
          renderer={({ value }) => {
            if (isNil(value)) {
              return intl.get('ssrc.common.view.noRestrictions').d('不限制');
            }
            return numberSeparatorRender(value);
          }}
        />
      ),
      <Output name="biddingAllowedQuotationCount" renderer={this.renderNoRestrictions} />,
      autoDeferFlag ? (
        <Output name="deferBiddingAllowedQuotationCount" renderer={this.renderNoRestrictions} />
      ) : null,
      <Output name="rankRuleMeaning" />,
      <Output name="openRuleMeaning" />,
      <Output name="sealedQuotationFlag" renderer={({ value }) => this.yesOrNoRenderer(value)} />,
      currentTotalPriceFlag && <Output name="biddingTotalPricePrincipleMeaning" />,
      unitBiddingRuleVisibleFlag && <Output name="biddingUnitPriceRuleMeaning" />,
      totalRequiredFlag && (
        <Output
          name="biddingSpreadPrice"
          renderer={({ value }) => {
            return numberSeparatorRender(value);
          }}
        />
      ),
      autoDeferFlag ? <Output name="autoDeferTypeMeaning" /> : null,
      <Output
        name="isBritishBidTrafficLight"
        hidden={!newBiddingFlag}
        renderer={({ value }) => {
          return yesOrNoRender(value);
        }}
        showHelp="label"
      />,
      <Output
        name="isBritishBidLowestPriceGreen"
        hidden={!newBiddingFlag || isBritishBidTrafficLight !== 1}
        renderer={({ value }) => yesOrNoRender(value)}
        showHelp="label"
      />,
      <Output
        name="targetPriceLowerLimit"
        hidden={!totalPriceTrafficLight}
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      <Output
        name="targetPriceUpperLimit"
        hidden={!totalPriceTrafficLight}
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      <Output
        name="trialTargetPriceLowerLimit"
        hidden={!trialTotalPriceTrafficLight}
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      <Output
        name="trialTargetPriceUpperLimit"
        hidden={!trialTotalPriceTrafficLight}
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      <Output
        name="biddingOnlineSignInFlag"
        hidden={!allowAdjustBiddingStage}
        renderer={({ value }) => yesOrNoRender(value)}
      />,
      <Output
        name="biddingTrialBiddingFlag"
        hidden={!allowAdjustBiddingStage}
        renderer={({ value }) => yesOrNoRender(value)}
      />,
      <Output
        name="autoDeferFlag"
        hidden={!allowAdjustBiddingStage}
        renderer={({ value }) => yesOrNoRender(value)}
      />,
      <Output
        name="biddingIntervalDuration"
        renderer={({ record }) =>
          this.renderDurationTime(record, 'biddingIntervalDuration', { newBiddingFlag: true })
        }
        hidden={!japOrDutchTotalBiddingFlag}
      />,
      <Output
        name="biddingDisclosePrice"
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
        hidden={!japOrDutchTotalBiddingFlag}
      />,
      <Output
        name="biddingTrialDisclosePrice"
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
        hidden={!trialJapanDutchTotal}
      />,
      <Output name="biddingEliminateRoundNumber" hidden={!japanTotalBiddingFlag} />,
      <Output name="biddingMinShortlistedSupplierNumber" hidden={!japOrDutchTotalBiddingFlag} />,
      <Output name="biddingEndType" hidden={!japOrDutchTotalBiddingFlag} />,
      <Output name="biddingEstimatedRoundNumber" hidden={!japOrDutchTotalBiddingFlag} />,
      <Output name="biddingEstimatedTrialRoundNumber" hidden={!trialJapanDutchTotal} />,
    ];

    return fields.filter(Boolean);
  };

  // 间隔时间
  rendererQuotationInterval(value = null) {
    return !isNil(value) ? `${value}${intl.get('hzero.common.date.unit.minutes').d('分钟')}` : null;
  }

  // 保证金
  rendererBidBond({ value = null }) {
    if (!value) {
      return intl.get('ssrc.common.view.gratis').d('免费');
    }

    return numberSeparatorRender(value);
  }

  // 其它
  expandFields() {
    const Fields = [<Output name="openBidOrderMeaning" />, <Output name="bidRuleTypeMeaning" />];

    return Fields.filter(Boolean);
  }

  // 专家表格
  renderExpertTable() {
    const { rfxInfoDS = {}, noneExpertTableDS = {}, allExpertTableDS = {} } = this.props;
    const bidRuleType = rfxInfoDS.current.get('bidRuleType');

    if (!bidRuleType) {
      return;
    }

    return (
      <div className={styles['m-b-m']}>
        {bidRuleType === 'NONE' &&
          this._renderTableList('', 'BUSINESS_TECHNOLOGY', allExpertTableDS)}
        {bidRuleType !== 'NONE' && this._renderTableList('', 'TECHNOLOGY', noneExpertTableDS)}
      </div>
    );
  }

  _renderTableList(title = null, type = null, ds = {}) {
    const { distributeExpert, customizeTable, rfx = {}, rfxInfoDS, sourceHeaderId } = this.props;
    const ExpertProps = {
      distributeExpert,
      ds,
      type,
      customizeTable,
      rfx,
      rfxInfoDS,
      sourceHeaderId,
    };

    return (
      <div>
        {title}
        <ExpertTable {...ExpertProps} />
      </div>
    );
  }

  // 专家-二级标题卡片
  renderExpertModuleCard = () => {
    const { remote, rfxInfoDS, bidFlag } = this.props;
    const showFlag = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_DETAIL_PROCESS_RELEASE_PREPARE_EXPERT_MODULE_CARD',
          true,
          { rfxInfoDS, bidFlag }
        )
      : true;
    return showFlag ? (
      <>
        <h4 className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}>
          <div className={styles['rfx-card-item-title-line']} />
          {intl.get(`ssrc.inquiryHall.view.message.experts`).d('专家')}
        </h4>
        {this.renderExpertTable()}
      </>
    ) : null;
  };

  render() {
    const {
      rfxInfoDS = {},
      customizeCollapseForm,
      proxyDsCreate = {},
      custConfig = [],
      rfx = {},
      organizationId,
      prequalHeaderDsMap,
      prequalScoreElementDsMap,
      sourceHeaderId,
      preQualificationFormRef,
      prequalScoreElementDS,
      biddingTimeDS,
      biddingRuleDS,
      newBiddingFlag,
    } = this.props;
    const { unitCodeSymbol, quotationName } = rfx;
    // if (!rfxInfoDS.current) {
    //   return null;
    // }

    // const { biddingHallFlag } = rfxInfoDS?.getQueryParameter('commonProps') || {};
    const {
      preQualificationFlag, // 资格审查标识
      mergeType,
      roundQuotationRule, // 自动多轮报价规则
      // sourceCategory,
      // biddingFlag,
    } =
      rfxInfoDS?.current?.get([
        'preQualificationFlag',
        'mergeType',
        'roundQuotationRule',
        'sourceCategory',
        'biddingFlag',
      ]) || {};
    // 竞价大厅标识
    // const newBiddingFlag = !!biddingHallFlag && sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    // 资格审查标识
    // const preQualificationFlag = rfxInfoDS.current?.get('preQualificationFlag');
    // const mergeType = rfxInfoDS.current?.get('mergeType');
    // 自动多轮报价规则
    // const roundQuotationRule = rfxInfoDS.current?.get('roundQuotationRule');
    const autoRoundQuotationFlag =
      roundQuotationRule === 'AUTO' ||
      roundQuotationRule === 'AUTO_CHECK' ||
      roundQuotationRule === 'AUTO_SCORE';
    // 资格预审模块
    const prequalProps = {
      rfx,
      rfxInfoDS,
      organizationId,
      sourceHeaderId,
      customizeCollapseForm,
      preQualificationFormRef,
      prequalScoreElementDS,
      prequalHeaderDsMap,
      prequalScoreElementDsMap,
    };

    return (
      <div>
        <div>
          {custConfig.length > 1 || custConfig[0]?.visible !== 0 ? (
            <h4 className={styles['rfx-card-item-title-level-two']}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get('ssrc.inquiryHall.view.inquiryHall.rfxPrepare').d('寻源准备')}
            </h4>
          ) : null}
          <div className={styles['rfx-card-item-form']}>
            {customizeCollapseForm(
              {
                code: `SSRC.${unitCodeSymbol}_DETAIL.RFXPREPARE`,
                dataSet: rfxInfoDS,
                labelLayout: 'float',
              },
              <CollapseForm
                dataSet={rfxInfoDS}
                labelLayout="vertical"
                className="c7n-pro-vertical-form-display"
                showLines={5}
                columns={3}
                useWidthPercent
              >
                {this.prepareFields()}
              </CollapseForm>
            )}
          </div>
        </div>
        {preQualificationFlag && (mergeType || !isEmpty(prequalHeaderDsMap)) ? (
          <Prequal {...prequalProps} />
        ) : null}
        {!newBiddingFlag && autoRoundQuotationFlag ? (
          <div>
            <h4 className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get(`ssrc.inquiryHall.view.title.autoRoundQuotation`).d('自动多轮报价')}
            </h4>
            <div className={styles['rfx-card-item-form']}>
              <CollapseForm
                dataSet={rfxInfoDS}
                showLines={6}
                columns={3}
                labelLayout="vertical"
                className="c7n-pro-vertical-form-display"
                useWidthPercent
              >
                {this.roundQuotationFields()}
              </CollapseForm>
            </div>
          </div>
        ) : null}
        {!newBiddingFlag && (
          <div>
            <h4 className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl
                .get(`ssrc.inquiryHall.view.title.rfxMaintaionQuotationRFX`, { quotationName })
                .d(`{quotationName}`)}
            </h4>
            <div className={styles['rfx-card-item-form']}>
              {customizeCollapseForm(
                {
                  code: `SSRC.${unitCodeSymbol}_DETAIL.RFX_DEMAND_QUOTATION`,
                  dataSet: rfxInfoDS,
                  labelLayout: 'vertical',
                  proxyDsCreate,
                },
                <CollapseForm
                  dataSet={rfxInfoDS}
                  showLines={6}
                  columns={3}
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                  useWidthPercent
                >
                  {this.quotationFields(autoRoundQuotationFlag)}
                </CollapseForm>
              )}
            </div>
          </div>
        )}
        {/* 竞价大厅-竞价规则 */}
        {newBiddingFlag && (
          <div className={styles['rfx-card-item-form']}>
            <h4
              id="rfxDemandSide"
              className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}
            >
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get('ssrc.inquiryHall.view.inquiryHall.biddingRule').d('竞价规则')}
            </h4>
            {customizeCollapseForm(
              {
                code: `SSRC.${unitCodeSymbol}_DETAIL.BIDDING_RULE`,
                dataSet: biddingRuleDS,
                labelLayout: 'vertical',
                proxyDsCreate,
              },
              <CollapseForm
                dataSet={biddingRuleDS}
                showLines={6}
                columns={3}
                labelLayout="vertical"
                className="c7n-pro-vertical-form-display"
                firstShowFields={[]}
                useWidthPercent
              >
                {this.renderBiddingRuleForm()}
              </CollapseForm>
            )}
          </div>
        )}
        {/* 竞价大厅-竞价时间 */}
        {newBiddingFlag && (
          <div>
            <h4 className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get('ssrc.inquiryHall.view.inquiryHall.biddingTimer').d('竞价时间')}
            </h4>
            <div className={styles['rfx-card-item-form']}>
              {customizeCollapseForm(
                {
                  code: `SSRC.${unitCodeSymbol}_DETAIL.BIDDING_TIME`,
                  dataSet: biddingTimeDS,
                  labelLayout: 'vertical',
                  proxyDsCreate,
                },
                <CollapseForm
                  dataSet={biddingTimeDS}
                  showLines={6}
                  columns={3}
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                  useWidthPercent
                >
                  {this.renderBiddingTimeForm()}
                </CollapseForm>
              )}
            </div>
          </div>
        )}
        {rfxInfoDS.current?.get('expertScoreType') &&
        rfxInfoDS.current?.get('expertScoreType') !== 'NONE' ? (
          <div>
            <div className={styles['default-gap']} />
            {this.renderExpertModuleCard()}
            {rfxInfoDS.current?.get('initialReview') === 'NEED' &&
              this.renderComplianceCheckWrapper()}
            {this.renderScoreDetailTabale()}
            <div className={styles['rfx-card-item-form']}>
              <CollapseForm
                dataSet={rfxInfoDS}
                showLines={0}
                labelLayout="vertical"
                className="c7n-pro-vertical-form-display"
                columns={3}
                useWidthPercent
              >
                {this.expandFields()}
              </CollapseForm>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
