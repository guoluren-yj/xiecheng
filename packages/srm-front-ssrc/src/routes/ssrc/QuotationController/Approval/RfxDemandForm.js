import React, { Component } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
// import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import {
  fetchExpertCurrent,
  fetchExpertHistory,
  fetchScoreCurrent,
  fetchScoreHistory,
} from '@/services/inquiryHallNewService';

import TimeControl from './TimeControl.js';
import styles from './index.less';
import PreQualification from './Prequalification';
import ExpertTable from './ExpertTable';
import ScoringElementTable from './ScoringElementTable';
import ExpertTableDS from './ExpertTableDS';
import { ScoringElementDS } from './ScoringElementDS';
import { historyRenderPure } from '../NewDetail/utils';
import InitialReviewTable from './InitialReviewTable.js';
import { InitialReviewDS } from './InitialReviewDS.js';
import BiddingRuleForm from './BiddingRuleForm';

@observer
export default class RfxDemandForm extends Component {
  constructor(props) {
    super(props);

    this.BusinessScoringElementDS = new DataSet(ScoringElementDS({ team: 'BUSINESS' }));
    /** ********* 协鑫二开新增价格要素-勿动!!! *********** */
    this.PriceScoringElementDS = new DataSet(ScoringElementDS({ team: 'BUSINESS' }));
    this.TechnologyScoringElementDS = new DataSet(ScoringElementDS({ team: 'TECHNOLOGY' }));
    this.AllScoringElementDS = new DataSet(ScoringElementDS({ team: 'BUSINESS_TECHNOLOGY' }));
    this.NoneExpertTableDS = new DataSet(ExpertTableDS());
    this.AllExpertTableDS = new DataSet(ExpertTableDS());
    this.InitialReviewDS = new DataSet(InitialReviewDS());
  }

  componentDidMount() {
    this.initPage();
  }

  componentWillUnmount() {
    this.clearDS();
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const { rfxId: prevId = null } = prevProps;
    const { rfxId = null } = this.props;

    return rfxId && rfxId !== prevId;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.initPage();
    }
  }

  initPage = () => {
    this.initAllDS();
    this.fetchExpert();
    this.fetchScoreDetail();
  };

  clearDS = () => {
    const { remote, bidFlag = false } = this.props;
    this.BusinessScoringElementDS.reset();
    this.TechnologyScoringElementDS.reset();
    this.AllScoringElementDS.reset();
    this.NoneExpertTableDS.reset();
    this.AllExpertTableDS.reset();
    this.InitialReviewDS.reset();

    this.BusinessScoringElementDS.loadData();
    this.TechnologyScoringElementDS.loadData();
    this.AllScoringElementDS.loadData();
    this.NoneExpertTableDS.loadData();
    this.AllExpertTableDS.loadData();
    this.InitialReviewDS.loadData();

    if (remote?.event) {
      remote.event.fireEvent('remoteClearDSEvent', {
        priceScoringElementDS: this.PriceScoringElementDS,
        bidFlag,
      });
    }
  };

  // get header info
  getBaseInfoHeader = () => {
    const { header = {} } = this.props;
    const { rfxHeaderBaseInfoAdjustDTO = {} } = header;
    return rfxHeaderBaseInfoAdjustDTO || {};
  };

  // get value from header info
  getFieldFromHeader = (key) => {
    if (!key || typeof key !== 'string') {
      return null;
    }

    const header = this.getBaseInfoHeader();
    return header[key];
  };

  /**
   * 获取专家数据
   */
  fetchExpert = async () => {
    const { organizationId, currentMode = null, custKey } = this.props;
    const header = this.getBaseInfoHeader();

    const {
      adjustRecordId = null,
      rfxHeaderAdjustId: sourceHeaderAdjustId = null,
      rfxHeaderId: sourceHeaderId = null,
    } = header;

    let data = [];

    const bidRuleType = this.getFieldFromHeader('bidRuleType');
    const code =
      !currentMode || currentMode === 'current'
        ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE_READ,SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF_READ`
        : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE_HIS,SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF_HIS`;

    const queryParams = {
      organizationId,
      sourceHeaderId,
      sourceFrom: 'RFX',
      expertStatus: 'SUBMITTED',
      adjustRecordId,
      sourceHeaderAdjustId,
      customizeUnitCode: code,
    };

    try {
      if (!currentMode || currentMode === 'current') {
        data = await fetchExpertCurrent(queryParams);
      }
      if (currentMode === 'history') {
        data = await fetchExpertHistory(queryParams);
      }
      data = getResponse(data);
      if (!data) {
        return;
      }
    } catch (e) {
      throw e;
    } finally {
      if (bidRuleType === 'NONE') {
        this.AllExpertTableDS.loadData(data);
      } else {
        this.NoneExpertTableDS.loadData(data);
      }
    }
  };

  /**
   * 获取评分要素数据
   */
  fetchScoreDetail = async () => {
    const { organizationId, currentMode = null, custKey, bidFlag = false, remote } = this.props;
    const header = this.getBaseInfoHeader();
    const {
      adjustRecordId = null,
      rfxHeaderAdjustId: sourceHeaderAdjustId = null,
      rfxHeaderId: sourceHeaderId = null,
      tenantId,
    } = header;

    const code =
      !currentMode || currentMode === 'current'
        ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_NONE_READ,SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_TECH_READ`
        : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_NONE_HIS,SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_TECH_HIS`;

    const queryParams = {
      organizationId,
      sourceHeaderId,
      sourceFrom: 'RFX',
      indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
      indicateLevel: 'ONE', // 查询一级评分要素
      adjustRecordId,
      sourceHeaderAdjustId,
      tenantId,
      customizeUnitCode: code,
    };
    try {
      let data = null;
      if (!currentMode || currentMode === 'current') {
        data = await fetchScoreCurrent(queryParams);
      }
      if (currentMode === 'history') {
        data = await fetchScoreHistory(queryParams);
      }

      if (isEmpty(data)) {
        return;
      }
      const {
        otherIndicList = [],
        businessIndicList = [],
        technologyIndicList = [],
        initialReviewIndicList = [],
      } = data || {};

      const loadBusinessData = (props) => {
        const { dataSource = [] } = props || {};
        this.BusinessScoringElementDS.loadData(dataSource);
      };

      const eventProps = {
        bidFlag,
        header,
        dataSource: businessIndicList,
        priceScoringElementDS: this.PriceScoringElementDS,
        businessScoringElementDS: this.BusinessScoringElementDS,
        loadBusinessData,
      };
      if (remote?.event) {
        remote.event.fireEvent('remoteLoadBusinessData', eventProps);
      } else {
        loadBusinessData(eventProps);
      }

      this.TechnologyScoringElementDS.loadData(technologyIndicList);
      this.AllScoringElementDS.loadData(otherIndicList);
      this.InitialReviewDS.loadData(initialReviewIndicList);
    } catch (e) {
      throw e;
    }
  };

  initAllDS = () => {
    const {
      header = {},
      organizationId,
      userId,
      rfxId = null,
      currentMode = null,
      remote,
      bidFlag = false,
    } = this.props;

    const commonData = {
      header,
      organizationId,
      userId,
      rfxHeaderId: rfxId,
      currentMode,
    };

    this.NoneExpertTableDS.setQueryParameter('commonData', commonData);
    this.AllExpertTableDS.setQueryParameter('commonData', commonData);
    this.AllScoringElementDS.setQueryParameter('commonData', commonData);
    this.BusinessScoringElementDS.setQueryParameter('commonData', commonData);
    this.TechnologyScoringElementDS.setQueryParameter('commonData', commonData);
    this.InitialReviewDS.setQueryParameter('commonData', commonData);

    if (remote?.event) {
      remote.event.fireEvent('remoteInitDSEvent', {
        priceScoringElementDS: this.PriceScoringElementDS,
        bidFlag,
        commonData,
      });
    }
  };

  // expert
  renderExpertTable = () => {
    const { bidRuleType = null } = this.getBaseInfoHeader() || {};

    if (!bidRuleType) {
      return;
    }

    return (
      <div className={styles['m-b-m']}>
        {bidRuleType === 'NONE' &&
          this._renderTableList('', 'BUSINESS_TECHNOLOGY', this.AllExpertTableDS)}
        {bidRuleType !== 'NONE' && this._renderTableList('', 'TECHNOLOGY', this.NoneExpertTableDS)}
      </div>
    );
  };

  _renderTableList(title = null, type = null, ds = {}) {
    const {
      customizeTable,
      custLoading,
      rfxId,
      organizationId = null,
      currentMode = null,
    } = this.props;
    const header = this.getBaseInfoHeader();

    const ExpertProps = {
      organizationId,
      custLoading,
      rfxId,
      ds,
      type,
      header,
      sourceHeaderId: rfxId,
      fetchExpert: this.fetchExpert,
      customizeTable,
      currentMode,
      unitCode: this.getExpertUnitCode,
    };

    return (
      <div>
        {title}
        <ExpertTable {...ExpertProps} />
      </div>
    );
  }

  // 评分要素
  renderScoreDetailTabale = () => {
    const { remote, bidFlag = false, currentMode } = this.props;
    const { bidRuleType = null } = this.getBaseInfoHeader() || {};

    if (!bidRuleType) {
      return;
    }

    return (
      <div style={{ marginTop: '18px' }}>
        {bidRuleType === 'NONE' &&
          this._renderScoreTableList('', 'BUSINESS_TECHNOLOGY', this.AllScoringElementDS)}
        {remote
          ? remote.render(
              'SSRC_QUOTATION_CONTROLLER_APPROVAL_RENDER_PREPARE_PRICE_SCORE_ELEMENT',
              null,
              {
                bidFlag,
                currentMode,
                /** ********* 协鑫二开新增价格要素-勿动!!! *********** */
                priceScoringElementDS: this.PriceScoringElementDS,
                header: this.getBaseInfoHeader(),
              }
            )
          : null}
        {bidRuleType !== 'NONE' &&
          this._renderScoreTableList(
            intl
              .get(`ssrc.inquiryHall.model.inquiryHall.businessScoringElements`)
              .d('商务组评分要素'),
            'BUSINESS',
            this.BusinessScoringElementDS
          )}
        {bidRuleType !== 'NONE' &&
          this._renderScoreTableList(
            intl
              .get(`ssrc.inquiryHall.model.inquiryHall.technologyScoringElements`)
              .d('技术组评分要素'),
            'TECHNOLOGY',
            this.TechnologyScoringElementDS
          )}
      </div>
    );
  };

  getClassName = (record, field = null) => {
    const { currentMode = null } = this.props;
    const adjustFields = record?.get?.('evaluateIndicAdjustFields');
    let className = '';
    if (adjustFields?.includes(field)) {
      if (currentMode === 'current') {
        className = 'changeAfter';
      } else if (currentMode === 'history') {
        className = 'changeBefore';
      }
    }

    return className;
  };

  // 权重比较渲染
  renderDiffWeight = (data = {}) => {
    const { currentDS = {}, type = null } = data;
    const WeightField = type === 'BUSINESS' ? 'businessWeight' : 'technologyWeight';
    const ExistRecord = currentDS.find((item = {}) => item.get(WeightField));

    return (
      <div
        style={{ display: 'inline-flex' }}
        className={this.getClassName(ExistRecord, WeightField)}
      >
        {historyRenderPure(
          { dataSet: currentDS, record: ExistRecord },
          'sourceEvaluateIndic',
          WeightField,
          {
            styles: {
              marginRight: '4px',
              color: 'rgba(0, 0, 0, .85)',
            },
          }
        )}
        %
      </div>
    );
  };

  // 评分要素工厂函数
  _renderScoreTableList(title = null, type = null, ds = {}) {
    const {
      rfxId,
      organizationId,
      customizeTable,
      custLoading,
      currentMode = null,
      custKey,
    } = this.props;

    const header = this.getBaseInfoHeader();
    const dataFlag = (ds.toData() || []).length > 0;
    const { templateScoreType = '' } = header || {};

    const ScoreProps = {
      ds,
      type,
      header,
      custKey,
      customizeTable,
      custLoading,
      organizationId,
      sourceHeaderId: rfxId,
      fetchScoreDetail: this.fetchScoreDetail,
      currentMode,
    };

    return (
      <div>
        {title ? (
          <div className={classnames(styles['score-element-header'])}>
            {title}
            {type !== 'BUSINESS_TECHNOLOGY' && dataFlag && templateScoreType !== 'SCORE_NEW' ? (
              <span style={{ marginLeft: '16px' }}>
                <span style={{ marginRight: '4px' }}>(</span>
                {this.renderDiffWeight({
                  currentDS: ds,
                  type,
                })}
                <span style={{ marginLeft: '4px' }}>)</span>
              </span>
            ) : null}
          </div>
        ) : null}
        <ScoringElementTable {...ScoreProps} />
        <div className={styles['default-gap']} />
      </div>
    );
  }

  render() {
    const {
      header,
      match,
      organizationId,
      userId,
      rfxId,
      custKey,
      custLoading,
      customizeForm,
      currentType,
      currentMode,
      quotationName,
      adjustTypeList = [],
      // isSection,
      customizeTable = () => {},
      biddingHallFlag,
      judgeNewBiddingFlag,
    } = this.props;
    const ExpertScoreVisibleFlag =
      !isEmpty(header?.rfxHeaderBaseInfoAdjustDTO) &&
      (adjustTypeList?.includes('RFX_EXPERT_SCORE') || currentType === 'detail');

    const TimeControlProps = {
      header,
      match,
      rfxId,
      currentMode,
      organizationId,
      userId,
      custKey,
      custLoading,
      customizeForm,
      quotationName,
      biddingHallFlag,
      judgeNewBiddingFlag,
    };
    const PreQualificationPorps = {
      header,
      match,
      rfxId,
      currentMode,
      custLoading,
      customizeForm,
      organizationId,
    };
    const { initialReview = '' } = header?.rfxHeaderBaseInfoAdjustDTO || {};
    const reviewProps = {
      ds: this.InitialReviewDS,
      organizationId,
      currentMode,
      header,
      customizeTable,
      custKey,
    };

    // 竞价规则
    const biddingRuleFormProps = {
      header,
      custLoading,
      currentMode,
      biddingHallFlag,
      customizeForm,
      custKey,
    };

    const newBiddingFlag = judgeNewBiddingFlag();

    return (
      <div className={styles['rfx-quotation-controller-detail-rfxDemand-wrapper']}>
        {header.rfxRequirePrequalHeaderAdjustDTO &&
          !isEmpty(header.rfxRequirePrequalHeaderAdjustDTO) &&
          (adjustTypeList?.includes('RFX_PREQUAL') || currentType === 'detail') && (
            <div className={styles['rfx-quotation-controller-item-content']}>
              <h4 className={styles['rfx-card-item-title-level-two']}>
                <div className={styles['rfx-card-item-title-line']} />
                {intl.get('ssrc.inquiryHall.view.message.tab.preQualification').d('资格预审')}
              </h4>
              <PreQualification {...PreQualificationPorps} />
            </div>
          )}
        {(adjustTypeList?.includes('RFX_QUOTATION') || currentType === 'detail') && (
          <div className={styles['rfx-quotation-controller-item-content']}>
            <h4 className={styles['rfx-card-item-title-level-two']}>
              <div className={styles['rfx-card-item-title-line']} />
              {!newBiddingFlag
                ? intl
                    .get(`ssrc.inquiryHall.view.title.commonRfxMaintaionQuotation`, {
                      quotationName,
                    })
                    .d('{quotationName}')
                : intl.get('ssrc.inquiryHall.view.title.bidding').d('竞价')}
            </h4>
            <TimeControl {...TimeControlProps} />
          </div>
        )}
        {/* 竞价规则 */}
        {newBiddingFlag ? (
          <div className={styles['rfx-quotation-controller-item-content']}>
            <h4 className={styles['rfx-card-item-title-level-two']}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get('ssrc.inquiryHall.view.inquiryHall.biddingRule').d('竞价规则')}
            </h4>
            <BiddingRuleForm {...biddingRuleFormProps} />
          </div>
        ) : (
          ''
        )}
        {ExpertScoreVisibleFlag ? (
          <div className={styles['rfx-quotation-controller-item-content']}>
            <h4 className={styles['rfx-card-item-title-level-two']}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get(`ssrc.inquiryHall.view.message.experts`).d('专家')}
            </h4>
            {this.renderExpertTable()}
          </div>
        ) : null}
        {ExpertScoreVisibleFlag && initialReview === 'NEED' ? (
          <div className={styles['rfx-quotation-controller-item-content']}>
            <h4 className={styles['rfx-card-item-title-level-two']}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get(`ssrc.inquiryHall.view.message.tab.complianceCheck`).d('符合性检查')}
            </h4>
            <InitialReviewTable {...reviewProps} />
          </div>
        ) : null}
        {ExpertScoreVisibleFlag ? (
          <div className={styles['rfx-quotation-controller-item-content']}>
            <h4 className={styles['rfx-card-item-title-level-two']}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')}
            </h4>
            {this.renderScoreDetailTabale()}
          </div>
        ) : null}
      </div>
    );
  }
}
