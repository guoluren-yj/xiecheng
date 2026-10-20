import React, { Component } from 'react';
import { DataSet, Lov, Modal, NumberField, Form } from 'choerodon-ui/pro';
import { isEmpty, isObject } from 'lodash';
import { Bind, debounce } from 'lodash-decorators';
import classnames from 'classnames';
import { runInAction, action } from 'mobx';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { SRM_SSRC } from 'srm-front-boot/lib/utils/config';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import Editing from '@/assets/editing.svg';
import { valueIncorrect } from '@/routes/components/Widget/dataVerification';
import {
  referenceTemplateSavedOfQuotationController,
  fetchScoreDetailOfQuotationController,
  fetchExpertOfQuotationController,
  saveControllerInitialReviewLines,
  queryControllerReviewElements,
} from '@/services/inquiryHallNewService';
import ExpertTableDS from './ExpertTableDS';
import {
  ScoringElementTableDS,
  ReferenceTemplateDS,
  assignedExpertOptionDS,
} from './ScoringElementTableDS';
import { InitialReviewDS } from './InitialReviewDS';

import TimeControl from './TimeControl.js';
import styles from './index.less';
import PreQualification from './Prequalification';
import ApplyToOtherSection from './ApplyToOtherSection';
import ApplyToPreQualification from './ApplyToPreQualification';
import ExpertTable from './ExpertTable';
import ScoringElementTable from './ScoringElementTable';
import InitialReviewTable from './InitialReviewTable';
import { historyRenderPure } from './utils';
import BiddingDemandForm from './BiddingDemandForm';

class RfxDemandForm extends Component {
  constructor(props) {
    super(props);
    const { onRef = () => {}, remote, bidFlag, header } = props;
    onRef(this);

    this.state = {
      technologyWeight: null,
      businessWeight: null,
      isInitialLoading: false,
    };

    this.assignedExpertOptionDs = new DataSet(assignedExpertOptionDS());
    this.BusinessScoringElementDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_BUSINESS_SCORE_TABLE_DS',
            ScoringElementTableDS({
              team: 'BUSINESS',
              assignedExpertOptionDs: this.assignedExpertOptionDs,
            }),
            {
              bidFlag,
              header,
            }
          )
        : ScoringElementTableDS({
            team: 'BUSINESS',
            assignedExpertOptionDs: this.assignedExpertOptionDs,
          })
    );
    this.TechnologyScoringElementDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_TECHNOLOGY_SCORE_TABLE_DS',
            ScoringElementTableDS({
              team: 'TECHNOLOGY',
              assignedExpertOptionDs: this.assignedExpertOptionDs,
            }),
            {
              bidFlag,
              header,
            }
          )
        : ScoringElementTableDS({
            team: 'TECHNOLOGY',
            assignedExpertOptionDs: this.assignedExpertOptionDs,
          })
    );
    // ===========================================
    /**
     * 协鑫二开价格要素ds,勿动！！！
     */
    this.PriceScoringElementDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_PRICE_SCORE_TABLE_DS',
            ScoringElementTableDS({
              team: 'BUSINESS',
              assignedExpertOptionDs: this.assignedExpertOptionDs,
            }),
            {
              bidFlag,
            }
          )
        : ScoringElementTableDS({
            team: 'BUSINESS',
            assignedExpertOptionDs: this.assignedExpertOptionDs,
          })
    );
    // ==========================================
    this.AllScoringElementDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_ALL_SCORE_TABLE_DS',
            ScoringElementTableDS({
              team: 'BUSINESS_TECHNOLOGY',
              assignedExpertOptionDs: this.assignedExpertOptionDs,
            }),
            {
              header,
              bidFlag,
            }
          )
        : ScoringElementTableDS({
            team: 'BUSINESS_TECHNOLOGY',
            assignedExpertOptionDs: this.assignedExpertOptionDs,
          })
    );
    this.NoneExpertTableDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_NONE_EXPERTY_TABLE_DS',
            ExpertTableDS(),
            {
              header,
              bidFlag,
            }
          )
        : ExpertTableDS()
    );
    this.AllExpertTableDS = new DataSet(
      remote
        ? remote.process(
            'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_ALL_EXPERT_TABLE_DS',
            ExpertTableDS(),
            {
              header,
              bidFlag,
            }
          )
        : ExpertTableDS()
    );
    // this.ReferenceTemplateDS = new DataSet(ReferenceTemplateDS());
    this.InitialReviewDS = new DataSet(InitialReviewDS());

    // cux ds init
    if (remote?.event) {
      remote.event.fireEvent('rfxDemandFormCuxInit', {
        that: this,
      });
    }
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
    const { remote } = this.props;
    const baseHeader = this.getBaseInfoHeader() || {};
    const { evaluateAllowedChangeFlag = 0, expertScoreType = null } = baseHeader;

    if (evaluateAllowedChangeFlag && expertScoreType && expertScoreType !== 'NONE') {
      this.initAllDS();
      this.fetchExpert();
      this.fetchScoreDetail();
      this.fetchQueryReviewElements();

      // cux ds init
      if (remote?.event) {
        remote.event.fireEvent('remoteRfxDemandFormCuxInitPage', {
          that: this,
        });
      }
    }
  };

  clearDS = () => {
    const { remote, bidFlag = false } = this.props;
    this.BusinessScoringElementDS.reset();
    this.TechnologyScoringElementDS.reset();
    this.AllScoringElementDS.reset();
    this.NoneExpertTableDS.reset();
    this.AllExpertTableDS.reset();
    this.InitialReviewDS.reset();
    if (remote?.event) {
      remote.event.fireEvent('clearPriceScoringDS', {
        bidFlag,
        PriceScoringElementDS: this.PriceScoringElementDS,
      });
    }

    this.expertClearDS();
    this.scoreClearDS();

    if (this.ReferenceTemplateDS) {
      this.ReferenceTemplateDS.reset();
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
  @action
  fetchExpert = async () => {
    const { organizationId, custKey } = this.props;
    const header = this.getBaseInfoHeader();
    const {
      adjustRecordId = null,
      rfxHeaderAdjustId: sourceHeaderAdjustId = null,
      rfxHeaderId: sourceHeaderId = null,
    } = header;
    let data = [];

    const bidRuleType = this.getFieldFromHeader('bidRuleType');
    // this.expertClearDS();

    try {
      const experts = await fetchExpertOfQuotationController({
        organizationId,
        sourceHeaderId,
        sourceFrom: 'RFX',
        expertStatus: 'SUBMITTED',
        adjustRecordId,
        sourceHeaderAdjustId,
        customizeUnitCode: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_NONE,SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_DIFF`,
      });

      data = experts || [];
      runInAction('fetchExpert', () => {
        if (bidRuleType === 'NONE') {
          this.AllExpertTableDS.loadData(data);
        } else {
          this.NoneExpertTableDS.loadData(data);
        }
      });
    } catch (e) {
      throw e;
    }
  };

  expertClearDS = () => {
    this.AllExpertTableDS.loadData();
    this.NoneExpertTableDS.loadData();
  };

  /**
   * 获取评分要素数据
   * queryFrom 查询来源 queryAfterTwoElementSave(二级要素保存后查询)
   * 其他查询来源 保持loadData数据 原有逻辑
   * 如有其他缓存需求 提需处理
   */
  @action
  fetchScoreDetail = async (param) => {
    const { queryFrom = '', elementRecord = {} } = param || {};
    const { organizationId, custKey, remote, bidFlag = false } = this.props;
    const header = this.getBaseInfoHeader();
    const {
      adjustRecordId = null,
      rfxHeaderAdjustId: sourceHeaderAdjustId = null,
      rfxHeaderId: sourceHeaderId = null,
    } = header;

    // this.scoreClearDS();

    try {
      const data = await fetchScoreDetailOfQuotationController({
        organizationId,
        sourceHeaderId,
        sourceFrom: 'RFX',
        indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
        indicateLevel: 'ONE', // 查询一级评分要素
        adjustRecordId,
        sourceHeaderAdjustId,
        customizeUnitCode: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_TECHNOLOFY,SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_NONE,SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_V2`,
      });

      const { otherIndicList = [], businessIndicList = [], technologyIndicList = [] } = data || {};
      const remoteFetchScoreDetail = (dataSource) => {
        // 二级评分要素细项保存后 要素查询 针对变更和新建的要素增加缓存处理
        if (queryFrom === 'queryAfterTwoElementSave') {
          this.cacheAndLoadScoreElement({
            ds: this.BusinessScoringElementDS,
            data: dataSource,
            elementRecord,
          });
          return;
        }
        this.BusinessScoringElementDS.loadData(dataSource);
      };

      runInAction('fetchScoreDetail', () => {
        if (remote?.event) {
          remote.event.fireEvent('remoteFetchScoreDetail', {
            bidFlag,
            remoteFetchScoreDetail,
            header,
            businessIndicList,
            PriceScoringElementDS: this.PriceScoringElementDS,
            that: this,
            data,
            param,
          });
        } else {
          remoteFetchScoreDetail(businessIndicList);
        }

        // 评分要素细项保存后 要素查询 针对变更和新建的要素增加缓存处理
        if (queryFrom === 'queryAfterTwoElementSave') {
          this.cacheAndLoadScoreElement({
            ds: this.TechnologyScoringElementDS,
            data: technologyIndicList,
            elementRecord,
          });
          this.cacheAndLoadScoreElement({
            ds: this.AllScoringElementDS,
            data: otherIndicList,
            elementRecord,
          });
          return;
        }

        this.TechnologyScoringElementDS.loadData(technologyIndicList);
        this.AllScoringElementDS.loadData(otherIndicList);
      });
    } catch (e) {
      throw e;
    }
  };

  /*
   * 前端开发要素表格行缓存 (避免保存评分要素细项弹框后 变更的和新建的要素数据丢失) 缓存从两方面
   * 1. ds.loadData() 增加cache 缓存变更数据
   * 2. 找出新建create数据(踢出当前二级要素保存的新建一级要素) 在ds.loadData() 后 将create数据再次create
   * createLineKey 新建要素行唯一id 用来处理一级二级要素全是新建行 在处理新建行缓存时 踢出当前行
   * evaluateIndicAdjustId 要素行id
   */
  @Bind()
  cacheAndLoadScoreElement(params) {
    const { ds, data = [], elementRecord = {} } = params || {};
    const { createLineKey = '', evaluateIndicAdjustId = '' } = elementRecord || {};
    const _data = ds.toData() || [];
    if (_data.length > 0) {
      const currentSavedRecords = []; // 当前已保存行记录
      const otherRecords = []; // 其他行记录
      ds.forEach((r) => {
        if (r.get('evaluateIndicAdjustId') === evaluateIndicAdjustId) {
          currentSavedRecords.push(r);
        } else {
          otherRecords.push(r);
        }
      });
      // 移出数据 避免create重复数据 (remove 其他记录 保留cache 强制remove 当前记录 采用load后台数据)
      ds.remove(otherRecords);
      ds.remove(currentSavedRecords, true);
      // 还原新创建的数据
      const createData =
        _data.filter((i) => !i.evaluateIndicAdjustId && i.createLineKey !== createLineKey) || [];
      ds.loadData(data, null, true);
      // eslint-disable-next-line no-unused-expressions
      if (createData.length > 0) createData.reverse()?.forEach((i) => ds.create(i, 0));
    } else {
      ds.loadData(data, null, true);
    }
  }

  initAllDS = () => {
    const {
      header = {},
      organizationId,
      userId,
      rfxId = null,
      remote,
      bidFlag = false,
    } = this.props;

    const commonData = {
      header: header?.rfxHeaderBaseInfoAdjustDTO,
      organizationId,
      userId,
      rfxHeaderId: rfxId,
    };

    this.NoneExpertTableDS.setQueryParameter('commonData', commonData);
    this.AllExpertTableDS.setQueryParameter('commonData', commonData);
    this.AllScoringElementDS.setQueryParameter('commonData', commonData);
    this.BusinessScoringElementDS.setQueryParameter('commonData', commonData);
    if (remote?.event) {
      remote.event.fireEvent('priceSetQueryParameter', {
        bidFlag,
        commonData,
        PriceScoringElementDS: this.PriceScoringElementDS,
      });
    }
    this.TechnologyScoringElementDS.setQueryParameter('commonData', commonData);
    this.ReferenceTemplateDS = new DataSet(ReferenceTemplateDS(header?.rfxHeaderBaseInfoAdjustDTO));
    if (!this.ReferenceTemplateDS?.current) {
      this.ReferenceTemplateDS.create({});
    }
    this.ReferenceTemplateDS.setQueryParameter('commonData', commonData);
    this.InitialReviewDS.setQueryParameter('commonData', commonData);
  };

  scoreClearDS = () => {
    const { remote, bidFlag = false } = this.props;
    this.BusinessScoringElementDS.loadData();
    if (remote?.event) {
      remote.event.fireEvent('priceScoreClearDS', {
        bidFlag,
        PriceScoringElementDS: this.PriceScoringElementDS,
      });
    }
    this.TechnologyScoringElementDS.loadData();
    this.AllScoringElementDS.loadData();
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
    const { bidRuleType = null } = this.getBaseInfoHeader() || {};
    const {
      header = {},
      customizeTable,
      custLoading,
      rfxId,
      organizationId = null,
      custKey,
      remote,
      bidFlag,
      RfxInfoDS,
    } = this.props;

    const ExpertProps = {
      custKey,
      organizationId,
      custLoading,
      rfxId,
      ds,
      type,
      header: header?.rfxHeaderBaseInfoAdjustDTO,
      sourceHeaderId: rfxId,
      fetchExpert: this.fetchExpert,
      customizeTable,
      bidRuleType,
      businessScoringElementDS: this.BusinessScoringElementDS,
      technologyScoringElementDS: this.TechnologyScoringElementDS,
      priceScoringElementDS: this.PriceScoringElementDS, // 协鑫二开价格要素专用，勿动！！！
      allScoringElementDS: this.AllScoringElementDS,
      remote,
      fetchScoreDetail: this.fetchScoreDetail,
      bidFlag,
      RfxInfoDS,
    };

    return (
      <div>
        {title}
        <ExpertTable {...ExpertProps} />
      </div>
    );
  }

  // 查询列表 - 符合性检查
  async fetchQueryReviewElements() {
    const { organizationId } = this.props;
    const header = this.getBaseInfoHeader();
    const {
      adjustRecordId = null,
      rfxHeaderAdjustId: sourceHeaderAdjustId = null,
      rfxHeaderId: sourceHeaderId = null,
    } = header;
    const data = await queryControllerReviewElements({
      organizationId,
      sourceHeaderId,
      sourceFrom: 'RFX',
      indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
      indicateLevel: 'ONE', // 查询一级评分要素
      adjustRecordId,
      sourceHeaderAdjustId,
    });
    if (data) {
      let { initialReviewIndicList = [] } = data;
      initialReviewIndicList = initialReviewIndicList.map((item) => {
        const targetItem = item;
        targetItem.assignedExpertList = null;
        targetItem.assignedExperts = null;
        return targetItem;
      });
      this.InitialReviewDS.loadData(initialReviewIndicList);
    }
  }

  // 评分要素/初步评审 -- 选择评分模板
  @Bind()
  async selectScoreElementTemplate(record = {}, type = 'score') {
    const { organizationId } = this.props;
    const header = this.getBaseInfoHeader();
    const { templatePurpose, templateId = null } = record || {};
    const {
      templateId: sourceTemplateId = null,
      tenantId,
      adjustRecordId,
      rfxHeaderAdjustId: sourceHeaderAdjustId = null,
      rfxHeaderId: sourceHeaderId = null,
    } = header;

    if (!sourceHeaderId) {
      return;
    }

    try {
      let result = await referenceTemplateSavedOfQuotationController({
        organizationId,
        templatePurpose,
        sourceHeaderId,
        sourceFrom: 'RFX',
        templateId,
        sourceTemplateId,
        indicStatus: 'SUBMITTED',
        tenantId,
        adjustRecordId,
        sourceHeaderAdjustId,
        type,
      });
      result = getResponse(result);
      if (type === 'score') {
        // eslint-disable-next-line no-unused-expressions
        this.ReferenceTemplateDS?.current?.set('templateLov', null);
      } else {
        // eslint-disable-next-line no-unused-expressions
        this.ReferenceTemplateDS?.current?.set('reviewTemplateLov', null);
      }
      if (!result) {
        return;
      }
      notification.success();
      if (type === 'score') {
        this.fetchScoreDetail();
      } else {
        this.fetchQueryReviewElements();
      }
    } catch (e) {
      if (type === 'score') {
        // eslint-disable-next-line no-unused-expressions
        this.ReferenceTemplateDS?.current?.set('templateLov', null);
      } else {
        // eslint-disable-next-line no-unused-expressions
        this.ReferenceTemplateDS?.current?.set('reviewTemplateLov', null);
      }
      throw e;
    }
  }

  // 评分要素
  renderScoreDetailTabale = () => {
    const {
      rfxId = null,
      remote,
      bidFlag = false,
      isSelectPass = false,
      custKey,
      custLoading,
      organizationId,
      customizeForm,
    } = this.props;
    const header = this.getBaseInfoHeader();
    const {
      rfxStatus,
      allOpenedFlag,
      bidRuleType = null,
      templateScoreType = null,
      existSecondOpenBidFlag = null,
      rfxHeaderId: sourceHeaderId = null,
    } = header;

    if (!bidRuleType) {
      return null;
    }
    const newOpenedBidFlag =
      rfxStatus === 'OPEN_BID_PENDING' && existSecondOpenBidFlag && allOpenedFlag;

    return (
      <div style={{ marginTop: '18px' }}>
        <h4 className={styles['rfx-card-item-title-level-two']}>
          <div className={styles['rfx-card-item-title-line']} />
          <span>{intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')}</span>
        </h4>

        {this.ReferenceTemplateDS?.current &&
        !newOpenedBidFlag &&
        this.getRemoteVisibleFlag({ key: 'scoreReferenceTemplate' })
          ? customizeForm(
              {
                code: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_DETAIL_TEMPLATE_FORM`,
                dataSet: this.ReferenceTemplateDS,
                enableEmpty: true,
              },
              <Form
                labelLayout="float"
                columns={3}
                style={{ marginBottom: '16px', marginTop: '16px' }}
                dataSet={this.ReferenceTemplateDS}
                useWidthPercent
              >
                <Lov
                  name="templateLov"
                  noCache
                  clearButton={false}
                  icon="template_configuration"
                  onChange={(data) => this.selectScoreElementTemplate(data, 'score')}
                  tableProps={{
                    selectionMode: 'rowbox',
                    // alwaysShowRowBox: true,
                  }}
                  lovPara={{
                    enabledFlag: 1,
                    // expertCategory: type,
                    scoreMode: bidRuleType,
                    templatePurpose: 'EXPERT_SCORE',
                    scoreTemplateScoreType: templateScoreType,
                  }}
                  disabled={!rfxId}
                />
              </Form>
            )
          : ''}

        {bidRuleType === 'NONE' &&
          this._renderScoreTableList('', 'BUSINESS_TECHNOLOGY', this.AllScoringElementDS)}
        {remote
          ? remote.render('SSRC_QUOTATION_CONTROLLER_UPDATE_RENDER_PRICE_TABLE', null, {
              bidFlag,
              header,
              isSelectPass,
              custKey,
              custLoading,
              organizationId,
              sourceHeaderId,
              ds: this.PriceScoringElementDS,
              businessScoringElementDS: this.BusinessScoringElementDS,
              technologyScoringElementDS: this.TechnologyScoringElementDS,
              priceScoringElementDS: this.PriceScoringElementDS,
              fetchScoreDetail: this.fetchScoreDetail,
              that: this,
            })
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

  // 权重渲染默认值
  calcWeight(type = null, ds = {}) {
    if (type === 'BUSINESS_TECHNOLOGY') {
      return;
    }

    let weigthData = 50;
    const firstLineData = ds.find((item) => !item.isNew);

    if (!firstLineData) {
      return weigthData;
    }

    if (type === 'BUSINESS') {
      weigthData = firstLineData.get('businessWeight');
      weigthData = !valueIncorrect(weigthData) ? weigthData : 50;
    }
    if (type === 'TECHNOLOGY') {
      weigthData = firstLineData.get('technologyWeight');
      weigthData = !valueIncorrect(weigthData) ? weigthData : 50;
    }
    return weigthData;
  }

  // 改变权重
  @Bind()
  handleChangeScoreWeight(value = null, type = null) {
    const fieldWeight = type === 'BUSINESS' ? 'businessWeight' : 'technologyWeight';
    let newValue = value;
    if (value > 100) {
      newValue = 100;
    }
    if (value < 0) {
      newValue = 0;
    }

    this.setState({
      [fieldWeight]: newValue,
    });
  }

  // 变更数据记录
  updateAdjustFields = (record = {}, value = null, name = null) => {
    const oldFields = record.get('evaluateIndicAdjustFields') || '';
    let newFields = oldFields.split(',').filter(Boolean);

    const currentIndex = oldFields.indexOf(name);
    const currentValue = isObject(value) ? value[name] : value;
    const pristineValue = (record.get('sourceEvaluateIndic') || {})[name];
    // eslint-disable-next-line eqeqeq
    if (currentIndex > -1 && currentValue == pristineValue) {
      newFields.splice(currentIndex, 1);
    } else if (!newFields.includes(name)) {
      newFields.push(name);
    }

    newFields = newFields.join(',');
    record.set('evaluateIndicAdjustFields', newFields);
  };

  /**
   * 评分要素权重确认
   * @override 乐成教育继承二开
   */
  @Bind()
  sureScoreWeight(type = null) {
    const { remote, bidFlag } = this.props;
    const header = this.getBaseInfoHeader();

    const sureScoreWeightEvent = (props) => {
      const { businessWeight, technologyWeight, groupType } = props;

      let setRecordWeight = (ds = {}, businessWg = null, technologyWg = null) => {
        ds.forEach((record) => {
          if (isEmpty(record)) {
            return;
          }
          record.set('businessWeight', businessWg);
          record.set('technologyWeight', technologyWg);
          this.updateAdjustFields(record, businessWg, 'businessWeight');
          this.updateAdjustFields(record, technologyWg, 'technologyWeight');
        });
      };

      if (groupType === 'BUSINESS') {
        setRecordWeight(this.BusinessScoringElementDS, businessWeight, null);
        setRecordWeight(this.TechnologyScoringElementDS, null, 100 - businessWeight);
        this.setState({ technologyWeight: 100 - businessWeight });
      } else {
        setRecordWeight(this.TechnologyScoringElementDS, null, technologyWeight);
        setRecordWeight(this.BusinessScoringElementDS, 100 - technologyWeight, null);
        this.setState({ businessWeight: 100 - technologyWeight });
      }

      setRecordWeight = null;
      this.forceUpdate();
    };

    const { businessWeight, technologyWeight } = this.state;

    const eventProps = {
      bidFlag,
      header,
      groupType: type,
      businessWeight,
      technologyWeight,
      priceScoringElementDS: this.PriceScoringElementDS,
      current: this,
      sureScoreWeightEvent,
    };

    if (remote?.event) {
      remote.event.fireEvent('handleSaveScoreWeight', eventProps);
    } else {
      sureScoreWeightEvent(eventProps);
    }
  }

  // 评分要素权重弹窗
  @Bind()
  openWeightModal(type, ds) {
    let weightTitle =
      type === 'BUSINESS'
        ? intl.get(`ssrc.inquiryHall.model.inquiryHall.business`).d('商务')
        : intl.get(`ssrc.inquiryHall.model.inquiryHall.technology`).d('技术');
    weightTitle += intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重');
    const weight = this.calcWeight(type, ds);

    const modalKey = Modal.key();
    Modal.open({
      destroyOnClose: true,
      key: modalKey,
      title: weightTitle,
      children: (
        <Form labelLayout="float">
          <NumberField
            label={`${intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}%`}
            placeholder={intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}
            min={0}
            max={100}
            step={0.01}
            precision={2}
            defaultValue={weight}
            onChange={(value) => this.handleChangeScoreWeight(value, type)}
            destroyOnClose
          />
        </Form>
      ),
      style: { width: '380px' },
      drawer: true,
      onOk: () => this.sureScoreWeight(type),
      onCancel: () => {},
    });
  }

  // 评分要素工厂函数
  _renderScoreTableList = (title = null, type = null, ds = {}) => {
    const {
      // rfxInfoDS,
      header = {},
      organizationId,
      customizeTable,
      custLoading,
      custKey,
      bidFlag = false,
      isSelectPass = false,
      remote,
      customizeBtnGroup,
    } = this.props;
    const { rfxHeaderBaseInfoAdjustDTO = {} } = header || {};
    const {
      adjustRecordId,
      rfxHeaderAdjustId,
      rfxHeaderId,
      rfxStatus,
      existSecondOpenBidFlag,
      allOpenedFlag,
    } = rfxHeaderBaseInfoAdjustDTO || {};
    const newOpenedBidFlag =
      rfxStatus === 'OPEN_BID_PENDING' && existSecondOpenBidFlag && allOpenedFlag;
    const { businessWeight, technologyWeight } = this.state;
    const {
      rfxHeaderId: sourceHeaderId = null,
      templateScoreType = '',
      templateId,
    } = header?.rfxHeaderBaseInfoAdjustDTO;

    // const dataFlag = ds?.find((item = {}) => !item?.isNew);
    const dataFlag = (ds.toData() || []).length > 0;
    // const weight = this.calcWeight(type, ds);

    const importProps = {
      businessObjectTemplateCode: 'SRM_C_SRM_SSRC_EVALUATE_INDIC_ADJUST_RFQ',
      prefixPatch: SRM_SSRC,
      name: 'batchImportNew',
      args: {
        tenantId: organizationId,
        templateId,
        sourceHeaderId,
        templateCode: 'SRM_C_SRM_SSRC_EVALUATE_INDIC_ADJUST_RFQ',
        expertCategory: type,
        teamWeight: type === 'BUSINESS' || type === 'TECHNOLOGY' ? 50 : 100,
        sourceFrom: 'RFX',
        adjustRecordId,
        sourceHeaderAdjustId: rfxHeaderAdjustId,
        rfxHeaderId,
      },
      buttonText: intl.get('ssrc.inquiryHall.view.message.button.elementsImportNew').d('批量创建'),
      buttonProps: {
        icon: 'archive',
        funcType: 'flat',
        color: 'primary',
        disabled: !sourceHeaderId,
      },
      tenantId: organizationId,
      autoRefreshInterval: 5000,
      successCallBack: this.batchImportOk,
    };

    let ScoreProps = {
      remote,
      ds,
      type,
      importProps,
      bidFlag,
      custKey,
      isSelectPass,
      businessWeight,
      technologyWeight,
      newOpenedBidFlag,
      header: header?.rfxHeaderBaseInfoAdjustDTO,
      customizeTable,
      custLoading,
      organizationId,
      sourceHeaderId,
      fetchScoreDetail: this.fetchScoreDetail,
      businessScoringElementDS: this.BusinessScoringElementDS,
      technologyScoringElementDS: this.TechnologyScoringElementDS,
      priceScoringElementDS: this.PriceScoringElementDS, // 协鑫二开价格要素专用，勿动！！！
      allScoringElementDS: this.AllScoringElementDS,
      customizeBtnGroup,
    };

    ScoreProps = remote
      ? remote.process('SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_SCORE_ELEMENT_PROPS', ScoreProps, {
          that: this,
        })
      : ScoreProps;

    const weightButtonEditor = !newOpenedBidFlag ? (
      <img src={Editing} alt="" onClick={() => this.openWeightModal(type, ds)} />
    ) : null;

    const weightEditor = (
      <span style={{ marginLeft: '16px' }}>
        {/* ({`${weight} % `} */}
        <span style={{ marginRight: '4px' }}>(</span>
        {this.renderDiffWeight({
          currentDS: ds,
          type,
        })}
        {remote
          ? remote.render(
              'SSRC_QUOTATION_CONTROLLER_UPDATE_RENDER_SCORE_ELEMENT_WEIGHT_BUTTON_EDITOR',
              weightButtonEditor,
              {
                bidFlag,
              }
            )
          : weightButtonEditor}
        <span style={{ marginLeft: '4px' }}>)</span>
      </span>
    );

    const remoteProps = {
      type,
      bidFlag,
      templateScoreType,
      PriceScoringElementDS: this.PriceScoringElementDS,
      header,
    };

    return (
      <div>
        {title ? (
          <div className={classnames(styles['score-element-header'])}>
            {title}
            {type !== 'BUSINESS_TECHNOLOGY' && dataFlag && templateScoreType !== 'SCORE_NEW'
              ? remote
                ? remote.render(
                    'SSRC_QUOTATION_CONTROLLER_UPDATE_RENDER_SCORE_ELEMENT_WEIGHT_EDITOR',
                    weightEditor,
                    remoteProps
                  )
                : weightEditor
              : null}
          </div>
        ) : null}
        {this.renderScoringElementTable(ScoreProps)}
        <div className={styles['default-gap']} />
      </div>
    );
  };

  // 【屈臣氏】二开寻源过程控制-询价要求-评分要素-评分要素细项弹框
  renderScoringElementTable = (ScoreProps) => {
    return <ScoringElementTable {...ScoreProps} />;
  };

  // 批量导入确认后
  @Bind
  batchImportOk() {
    this.fetchScoreDetail();
    this.forceUpdate();
  }

  // 权重比较渲染
  renderDiffWeight = (data = {}) => {
    const { currentDS = {}, type = null } = data;
    const WeightField = type === 'BUSINESS' ? 'businessWeight' : 'technologyWeight';
    // const ExistRecord = currentDS.find((item = {}) => !item.isNew);

    return (
      <div style={{ display: 'inline-flex', marginRight: '4px' }}>
        {historyRenderPure(
          { dataSet: currentDS, record: currentDS?.current },
          'sourceEvaluateIndic',
          WeightField
        )}
        %
      </div>
    );
  };

  /**
   * 删除符合性检查
   */
  @Bind()
  async onDeleteReviewLine() {
    const selecteds = this.InitialReviewDS.selected || [];
    if (isEmpty(selecteds)) {
      return;
    }
    const remoteDelete = selecteds.filter((item) => (item.data || {}).evaluateIndicAdjustId);
    const localDelete = selecteds.filter((item) => !(item.data || {}).evaluateIndicAdjustId);

    if (!isEmpty(remoteDelete)) {
      try {
        await this.InitialReviewDS.delete(remoteDelete);
        this.InitialReviewDS.unSelectAll();
        this.fetchQueryReviewElements();
      } catch (e) {
        throw e;
      }
    } else {
      this.InitialReviewDS.remove(localDelete);
    }
  }

  /**
   * 创建符合性检查
   */
  @Bind()
  onCreateReviewLine() {
    const { organizationId, remote, bidFlag } = this.props;
    const header = this.getBaseInfoHeader();
    const { rfxHeaderId: sourceHeaderId = null, openBidOrder = '' } = header;
    const line = {
      evaluateIndicId: null,
      indicateId: null,
      indicateCode: null,
      indicateName: null,
      indicateType: 'PASS',
      // passFlag: 0,
      expertDistribute: null,
      indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
      sourceHeaderId,
      team: 'INITIAL_REVIEW',
      _status: 'create',
      tenantId: organizationId,
      indicateRemark: null,
      sourceFrom: 'RFX',
      openBidOrder: openBidOrder || 'BUSINESS_FIRST',
      organizationId,
      expertCategory: '',
      detailEnabledFlag: 0,
    };

    const newLine = remote
      ? remote.process('SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_CREATEREVIEWLINE_DATA', line, {
          bidFlag,
          that: this,
        })
      : line;
    if (!newLine) {
      return;
    }

    this.InitialReviewDS.create(newLine, 0);
  }

  /**
   * 保存符合性检查
   */
  @debounce(500)
  @Bind()
  async onSaveReviewLine() {
    const { organizationId } = this.props;
    const validateFlag = await this.InitialReviewDS.validate();
    const header = this.getBaseInfoHeader();
    const {
      adjustRecordId = null,
      rfxHeaderAdjustId: sourceHeaderAdjustId = null,
      rfxHeaderId: sourceHeaderId = null,
    } = header;
    if (!validateFlag) {
      return;
    }

    let newParams = this.InitialReviewDS.toData() || [];
    if (!newParams.length) {
      return;
    }
    this.setState({ isInitialLoading: true });
    newParams = newParams.map((item) => {
      return {
        ...item,
        organizationId,
        tenantId: organizationId,
        sourceFrom: 'RFX',
        team: 'INITIAL_REVIEW',
        sourceHeaderId,
        adjustRecordId,
        sourceHeaderAdjustId,
      };
    });

    saveControllerInitialReviewLines({
      organizationId,
      otherParams: newParams,
    })
      .then((res) => {
        this.setState({ isInitialLoading: false });
        if (getResponse(res)) {
          notification.success();
          this.fetchQueryReviewElements();
        }
      })
      .catch(() => {
        this.setState({ isInitialLoading: false });
      });
  }

  /**
   * 获取二开的显示隐藏标志
   * 首次埋点-使用项目：华创（ps：若后续加块内容，需要注意下二开埋点的此属性是否需要加上）
   */
  @Bind()
  getRemoteVisibleFlag(payload) {
    const { remote, header, bidFlag } = this.props;
    return remote
      ? remote.process('SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_RFX_DEMAND_VISIBLE_FLAG', true, {
          header,
          bidFlag,
          ...(payload || {}),
          that: this,
        })
      : true;
  }

  render() {
    const {
      header,
      match,
      custKey,
      organizationId,
      userId,
      handleSearch,
      rfxId,
      customizeForm,
      getTimeController = () => {},
      getPreQualification,
      custLoading,
      handleSave,
      isSection,
      quotationName,
      mergeType,
      prequalGroupHeaderId,
      sourceProjectId,
      tempSourceHeaderId,
      preQualificationRef,
      customizeTable,
      remote,
      biddingHallFlag,
      bidFlag,
    } = this.props;
    const baseHeader = this.getBaseInfoHeader();

    const {
      expertScoreType = null,
      evaluateAllowedChangeFlag = 0,
      initialReview = '',
      rfxHeaderId: sourceHeaderId = null,
      templateScoreType = null,
      bidRuleType = '',
      rfxStatus,
      existSecondOpenBidFlag,
      allOpenedFlag,
    } = baseHeader || {};

    const TimeControlProps = {
      header,
      match,
      rfxId,
      custKey,
      quotationName,
      organizationId,
      userId,
      custLoading,
      customizeForm,
      handleSearch,
      getTimeController,
      preQualificationRef,
      remote,
    };
    const PreQualificationPorps = {
      header,
      match,
      rfxId,
      custLoading,
      customizeForm,
      organizationId,
      getPreQualification,
      custKey,
    };

    const quotationApplyToOtherSectionProps = {
      rfxId,
      organizationId,
      handleSave,
      adjustType: 'RFX_QUOTATION',
    };

    const applyToOtherSectionProps = {
      rfxId,
      organizationId,
      handleSave,
      adjustType: 'RFX_PREQUAL',
      mergeType,
      prequalGroupHeaderId,
      sourceProjectId,
      tempSourceHeaderId,
    };

    const scoreSectionProps = {
      rfxId,
      organizationId,
      handleSave,
      adjustType: 'RFX_EXPERT_SCORE',
    };

    const reviewProps = {
      remote,
      bidFlag,
      ds: this.InitialReviewDS,
      organizationId,
      onDeleteReviewLine: this.onDeleteReviewLine,
      onCreateReviewLine: this.onCreateReviewLine,
      onSaveReviewLine: this.onSaveReviewLine,
      sourceHeaderId,
      isInitialLoading: this.state.isInitialLoading,
      custKey,
      header,
      customizeTable,
    };

    // 竞价大厅-竞价单标识
    const { rfxHeaderBaseInfoAdjustDTO = {} } = header || {};
    const { rfxHeaderBaseInfoDTO = {} } = rfxHeaderBaseInfoAdjustDTO || {};
    const { secondarySourceCategory, biddingFlag } = rfxHeaderBaseInfoDTO || {};
    const newBiddingFlag =
      !!biddingHallFlag &&
      secondarySourceCategory === 'RFA' &&
      (biddingFlag === 1 || biddingFlag === '1');

    const newOpenedBidFlag =
      rfxStatus === 'OPEN_BID_PENDING' && existSecondOpenBidFlag && allOpenedFlag;
    return (
      <div className={styles['rfx-quotation-controller-rfxDemand-wrapper']}>
        {header.rfxRequirePrequalHeaderAdjustDTO &&
          !isEmpty(header.rfxRequirePrequalHeaderAdjustDTO) &&
          this.getRemoteVisibleFlag({ key: 'preQualification' }) && (
            <div className={styles['rfx-quotation-controller-item-content']}>
              <h4 className={styles['rfx-card-item-title-level-two']}>
                <div className={styles['rfx-card-item-title-line']} />
                {intl.get('ssrc.inquiryHall.view.message.tab.preQualification').d('资格预审')}
              </h4>
              <PreQualification {...PreQualificationPorps} />
              {isSection && !newBiddingFlag && (
                <ApplyToPreQualification {...applyToOtherSectionProps} />
              )}
            </div>
          )}
        {!newBiddingFlag && this.getRemoteVisibleFlag({ key: 'quotationTime' }) && (
          <div className={styles['rfx-quotation-controller-item-content']}>
            <h4 className={styles['rfx-card-item-title-level-two']}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl
                .get(`ssrc.inquiryHall.view.title.commonRfxMaintaionQuotation`, { quotationName })
                .d('{quotationName}')}
            </h4>
            <TimeControl {...TimeControlProps} />
            {isSection && !newBiddingFlag ? (
              <ApplyToOtherSection {...quotationApplyToOtherSectionProps} />
            ) : (
              ''
            )}
          </div>
        )}
        {/* 竞价要求 */}
        {!!newBiddingFlag && this.getRemoteVisibleFlag({ key: 'biddingTime' }) && (
          <div className={styles['rfx-quotation-controller-item-content']}>
            <BiddingDemandForm {...TimeControlProps} />
          </div>
        )}
        {evaluateAllowedChangeFlag &&
        expertScoreType &&
        expertScoreType !== 'NONE' &&
        this.getRemoteVisibleFlag({ key: 'expertTable' }) ? (
          <div className={styles['rfx-quotation-controller-item-content']}>
            <h4 className={styles['rfx-card-item-title-level-two']}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get(`ssrc.inquiryHall.view.message.experts`).d('专家')}
            </h4>
            {this.renderExpertTable()}
          </div>
        ) : null}
        {evaluateAllowedChangeFlag &&
        expertScoreType &&
        expertScoreType !== 'NONE' &&
        initialReview === 'NEED' &&
        this.getRemoteVisibleFlag({ key: 'initialReview' }) ? (
          <div className={styles['rfx-quotation-controller-item-content']}>
            <h4 className={styles['rfx-card-item-title-level-two']}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get(`ssrc.inquiryHall.view.message.tab.complianceCheck`).d('符合性检查')}
            </h4>
            {!newOpenedBidFlag && (
              <Form
                labelLayout="float"
                columns={3}
                className={styles['rfx-card-item-form']}
                style={{ marginBottom: '16px' }}
                dataSet={this.ReferenceTemplateDS}
                useWidthPercent
              >
                <Lov
                  name="reviewTemplateLov"
                  funcType="flat"
                  noCache
                  clearButton={false}
                  icon="template_configuration"
                  onChange={(data) => this.selectScoreElementTemplate(data, 'review')}
                  dataSet={this.ReferenceTemplateDS}
                  tableProps={{
                    selectionMode: 'rowbox',
                  }}
                  queryParams={{
                    enabledFlag: 1,
                    scoreMode: bidRuleType,
                    templatePurpose: 'INITIAL_REVIEW',
                    scoreTemplateScoreType: templateScoreType,
                  }}
                  disabled={!sourceHeaderId || sourceHeaderId === 'null'}
                />
              </Form>
            )}
            <InitialReviewTable {...reviewProps} newOpenedBidFlag={newOpenedBidFlag} />
          </div>
        ) : null}
        {evaluateAllowedChangeFlag &&
        expertScoreType &&
        expertScoreType !== 'NONE' &&
        this.getRemoteVisibleFlag({ key: 'scoreElementTable' }) ? (
          <div className={styles['rfx-quotation-controller-item-content']}>
            {this.renderScoreDetailTabale()}
            {isSection && mergeType !== 'ALL' && !newBiddingFlag && (
              <ApplyToOtherSection {...scoreSectionProps} />
            )}
          </div>
        ) : null}
      </div>
    );
  }
}

const HOCComponent = (Com) => {
  return observer(Com);
};

export default HOCComponent(RfxDemandForm);
export { RfxDemandForm, HOCComponent };
