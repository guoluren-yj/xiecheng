// 询价要求form

import React, { Component, Fragment } from 'react';
import {
  DataSet,
  TextField,
  Lov,
  NumberField,
  Select,
  DateTimePicker,
  CheckBox,
  Modal,
  Output,
  Button,
  Form,
} from 'choerodon-ui/pro';
import { isEmpty, noop, isNil, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import CollapseForm from '_components/CollapseForm';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import intl from 'utils/intl';
import { SRM_SSRC } from 'srm-front-boot/lib/utils/config';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';
import { getResponse } from 'utils/utils';
import ExpertTable from '@/routes/ssrc/InquiryHallNew/Update/ExpertTable';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import MatterDetail from '@/routes/components/MatterDetail/EditMatterDetail';
import RenderBiddingNodes from '@/routes/ssrc/components/BiddingNodes/RenderBiddingNodes.js';
import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import { checkPermission } from '@/services/inquiryHallNewService';
import { transformDayHourMinute } from '@/utils/transform.js';

import ScoringElementTable from './ScoringElementTable';
import InitialReviewTable from './InitialReviewTable';
import {
  RoundQuotationDurationFields,
  BiddingPriceRunningFields,
  NewStarDurationFields,
  StartTimeWrapper,
  EndTimeWrapper,
  QuotationRange,
  TimeBiddingDurationFields,
} from './Components';
import { RunningTimerDS } from './DSCollections';

import PrequalContainer from './Prequal';
import { renderpretialMemberLovTooltip } from './utils/renderer';

// import Editing from '@/assets/editing.svg';

class RfxDemandFormComponent extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      technologyWeight: null,
      businessWeight: null,
      currentQuotationRounds: [], // 当前的报价轮次list
      businessWeightFlag: 0, // 商务权重维护标识
      technologyWeightFlag: 0, // 技术权重维护标识
      permissionListMap: {}, // 专家和评分要素的权限
    };
  }

  RunningTimerDS = new DataSet(RunningTimerDS());

  @Bind()
  prepareFields() {
    const Fields = [
      <Select name={this.props.bidFlag ? 'secondarySourceCategory' : 'sourceCategory'} />,
    ];
    return Fields.filter(Boolean);
  }

  async componentDidMount() {
    await this.fetchLineCheckPermission();
  }

  async fetchLineCheckPermission() {
    const { permissionListMap } = this.state;
    const { rfx: { sourceKey = 'INQUIRY' } = {} } = this.props;
    const prefix = sourceKey === 'INQUIRY' ? '' : 'ssrc.new-bid-hall.';
    const permissionList = [`${prefix}expert.view`, `${prefix}score.elements`];
    const result = getResponse(await checkPermission(permissionList));
    if (result && !result.failed) {
      if (result.length > 0) {
        // 因为返回的result顺序不一定，故写成此种方式
        result.forEach((item) => {
          const { code = null } = item;
          if (!code) {
            return;
          }
          let newCode = code;
          newCode = newCode.substr(code.lastIndexOf('.', code.lastIndexOf('.') - 1) + 1);
          permissionListMap[newCode] = item;
        });
        this.setState({
          permissionListMap,
        });
      }
    }
  }

  /**
   * 渲染初步评审容器
   */
  renderInitialReviewWrapper() {
    const {
      rfxInfoDS,
      bidRuleType,
      customizeForm,
      sourceHeaderId,
      afterCustomizeDs,
      templateScoreType,
      selectScoreElementTemplate,
      rfx: { sourceKey = 'INQUIRY' } = {},
    } = this.props;
    return (
      <div className={styles['m-t-xlg']}>
        <h4 id="rfxComplianceCheck" className={classnames(styles['rfx-card-item-title-level-two'])}>
          <div className={styles['rfx-card-item-title-line']} />
          <span>
            {intl.get(`ssrc.inquiryHall.view.message.tab.complianceCheck`).d('符合性检查')}
          </span>
        </h4>
        {customizeForm(
          {
            code: `SSRC.${sourceKey}_HALL.NEW_EDIT.INITIAL_REVIEW_FORM`,
            dataSet: rfxInfoDS,
            afterCustomizeDs,
            enableEmpty: true,
          },
          <Form
            labelLayout="float"
            columns={3}
            style={{ marginBottom: '16px' }}
            dataSet={rfxInfoDS}
            useWidthPercent
          >
            <Lov
              name="reviewTemplateLov"
              funcType="flat"
              noCache
              clearButton={false}
              icon="template_configuration"
              onChange={(data) => selectScoreElementTemplate(data, 'review')}
              dataSet={rfxInfoDS}
              queryParams={{
                enabledFlag: 1,
                // expertCategory: type,
                scoreMode: bidRuleType,
                templatePurpose: 'INITIAL_REVIEW',
                scoreTemplateScoreType: templateScoreType,
              }}
              disabled={!sourceHeaderId || sourceHeaderId === 'null'}
            />
          </Form>
        )}
        {this.renderInitialReviewTable()}
      </div>
    );
  }

  /**
   * 渲染初步评审表格
   */
  renderInitialReviewTable() {
    const {
      rfxInfoDS,
      customizeTable,
      initialReviewDS,
      onDeleteReviewLine,
      onCreateReviewLine,
      onSaveReviewLine,
      sourceHeaderId,
      organizationId,
      deleteScoreElement,
      isInitialLoading = false,
      operationType,
      rfx: { sourceKey = 'INQUIRY' } = {},
      fetchQueryReviewElements,
    } = this.props;

    // const infoHeader = rfxInfoDS.current.toData() || {};

    const reviewProps = {
      rfxInfoDS,
      sourceKey,
      customizeTable,
      ds: initialReviewDS,
      // header: infoHeader,
      organizationId,
      onDeleteReviewLine,
      onCreateReviewLine,
      onSaveReviewLine,
      sourceHeaderId,
      deleteScoreElement,
      isInitialLoading,
      operationType,
      fetchQueryReviewElements,
    };
    return <InitialReviewTable {...reviewProps} />;
  }

  renderScoreDetailTabale() {
    const {
      businessScoringElementDS,
      technologyScoringElementDS,
      allScoringElementDS,
      rfxInfoDS = {},
      sourceHeaderId = null,
      selectScoreElementTemplate,
      remote,
      bidFlag,
      priceScoringElementDS,
      deleteScoreElement,
      onSaveScoringElements,
      isScoringLoading = false,
      customizeForm = noop,
      afterCustomizeDs = noop,
      rfx,
      templateFormRef,
    } = this.props;
    const { sourceKey = 'INQUIRY' } = rfx;

    const bidRuleType = rfxInfoDS.current.get('bidRuleType');
    const templateScoreType = rfxInfoDS.current.get('templateScoreType');

    if (!bidRuleType) {
      return null;
    }

    return (
      <div className={styles['m-t-xlg']}>
        <h4 id="rfxScoringElements" className={classnames(styles['rfx-card-item-title-level-two'])}>
          <div className={styles['rfx-card-item-title-line']} />
          <span>{intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')}</span>
          {remote
            ? remote.render('SSRC_INQUIRYHALLNEW_UPDATE_RENDER_EXPAND_ELEMENT_NODE', null, {
                sourceHeaderId,
              })
            : null}
        </h4>
        {customizeForm(
          {
            code: `SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE_DETAIL_TEMPLATE_FORM`,
            dataSet: rfxInfoDS,
            afterCustomizeDs,
            enableEmpty: true,
          },
          <Form
            ref={(vnode) => isFunction(templateFormRef) && templateFormRef(vnode)}
            labelLayout="float"
            columns={3}
            className={styles['rfx-card-item-form']}
            style={{ marginBottom: '16px' }}
            dataSet={rfxInfoDS}
            useWidthPercent
          >
            <Lov
              name="templateLov"
              noCache
              clearButton={false}
              onChange={(data) => selectScoreElementTemplate(data, 'score')}
              // dataSet={rfxInfoDS}
              tableProps={{
                selectionMode: 'rowbox',
                // alwaysShowRowBox: true,
              }}
              queryParams={{
                enabledFlag: 1,
                // expertCategory: type,
                scoreMode: bidRuleType,
                templatePurpose: 'EXPERT_SCORE',
                scoreTemplateScoreType: templateScoreType,
              }}
              disabled={!sourceHeaderId || sourceHeaderId === 'null'}
            />
          </Form>
        )}

        {bidRuleType === 'NONE' &&
          this._renderScoreTableList('', 'BUSINESS_TECHNOLOGY', allScoringElementDS)}
        {remote
          ? remote.render('SSRC_INQUIRYHALLNEW_UPDATE_RENDER_PRICE_SCORE_ELEMENT', null, {
              remote,
              bidFlag,
              rfxInfoDS,
              sourceHeaderId,
              isScoringLoading,
              priceScoringElementDS,
              deleteScoreElement,
              onSaveScoringElements,
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
        <div className={styles['default-gap']} />

        <CollapseForm
          dataSet={rfxInfoDS}
          showLines={0}
          labelLayout="float"
          columns={3}
          useWidthPercent
        >
          {this.expandFields()}
        </CollapseForm>
      </div>
    );
  }

  // 权重渲染默认值
  calcWeight(type = null, ds = {}) {
    if (type === 'BUSINESS_TECHNOLOGY') {
      return;
    }

    const { rfxInfoDS = {} } = this.props;
    const CurrentWeight =
      type === 'BUSINESS'
        ? rfxInfoDS.current.get('businessWeight')
        : rfxInfoDS.current.get('technologyWeight');

    let weigthData = 50;
    const firstLineData = ds.find((item) => !item.isNew);

    if (!firstLineData) {
      return CurrentWeight ?? weigthData;
    }

    if (type === 'BUSINESS') {
      weigthData = firstLineData.get('businessWeight');
      weigthData = weigthData || weigthData === 0 ? weigthData : 50;
    }
    if (type === 'TECHNOLOGY') {
      weigthData = firstLineData.get('technologyWeight');
      weigthData = weigthData || weigthData === 0 ? weigthData : 50;
    }
    return weigthData;
  }

  // 改变权重
  @Bind()
  handleChangeScoreWeight(params) {
    const { value = null, type = null } = params;
    const fieldWeight = type === 'BUSINESS' ? 'businessWeight' : 'technologyWeight';
    this.setState({
      [fieldWeight]: Number(value) > 100 ? 100 : Number(value),
    });
  }

  // 权重渲染
  @Bind()
  changeScoreWeightFlag({ type = null, weightFlag }) {
    const fieldWeightFlag = type === 'BUSINESS' ? 'businessWeightFlag' : 'technologyWeightFlag';
    this.setState({
      [fieldWeightFlag]: !weightFlag,
    });
  }

  /**
   * 评分要素权重确认
   * @override 乐成教育继承二开
   */
  @Bind()
  sureScoreWeight(params) {
    const sureScoreWeightEvent = (props) => {
      const {
        type = null,
        event,
        weightFlag,
        businessScoringElementDS,
        technologyScoringElementDS,
        rfxInfoDS,
      } = props;
      let businessWeight = 0;
      let technologyWeight = 0;
      const iptValue = event.target.value;
      if (type === 'BUSINESS') {
        businessWeight = Number(iptValue) > 100 ? 100 : Number(iptValue);
      } else {
        technologyWeight = Number(iptValue) > 100 ? 100 : Number(iptValue);
      }

      let setRecordWeight = (ds = {}, businessWg = null, technologyWg = null) => {
        ds.forEach((record) => {
          if (isEmpty(record)) {
            return;
          }
          record.set('businessWeight', businessWg);
          record.set('technologyWeight', technologyWg);
        });
      };

      if (type === 'BUSINESS') {
        technologyWeight = Math.round((100 - businessWeight) * 100) / 100;
        setRecordWeight(businessScoringElementDS, businessWeight, null);
        setRecordWeight(technologyScoringElementDS, null, technologyWeight);
        rfxInfoDS.current.set('businessWeight', businessWeight);
        rfxInfoDS.current.set('technologyWeight', technologyWeight);
        this.setState({ technologyWeight, businessWeightFlag: !weightFlag });
      } else {
        businessWeight = Math.round((100 - technologyWeight) * 100) / 100;
        setRecordWeight(technologyScoringElementDS, null, technologyWeight);
        setRecordWeight(businessScoringElementDS, businessWeight, null);
        rfxInfoDS.current.set('technologyWeight', technologyWeight);
        rfxInfoDS.current.set('businessWeight', businessWeight);
        this.setState({ businessWeight, technologyWeightFlag: !weightFlag });
      }

      setRecordWeight = null;
      this.forceUpdate();
    };

    const {
      businessScoringElementDS,
      technologyScoringElementDS,
      rfxInfoDS,
      remote,
      bidFlag,
      priceScoringElementDS,
    } = this.props;

    const eventProps = {
      ...(params || {}),
      businessScoringElementDS,
      technologyScoringElementDS,
      rfxInfoDS,
      current: this,
      bidFlag,
      /** ********* 协鑫二开新增价格要素-勿动!!! *********** */
      priceScoringElementDS,
      sureScoreWeightEvent,
    };
    if (remote?.event) {
      remote.event.fireEvent('handleSaveScoreWeight', eventProps);
    } else {
      sureScoreWeightEvent(eventProps);
    }
  }

  // 评分要素权重输入框
  @Bind()
  openWeightNumField({ type, weight } = {}) {
    const { remote, bidFlag = false } = this.props;
    const { businessWeightFlag, technologyWeightFlag } = this.state;
    const weightFlag = type === 'BUSINESS' ? businessWeightFlag : technologyWeightFlag;

    const weightButtonEditor = (
      <Button
        color="primary"
        funcType="flat"
        icon="mode_edit"
        size="small"
        onClick={() =>
          this.changeScoreWeightFlag({
            type,
            weightFlag: type === 'BUSINESS' ? businessWeightFlag : technologyWeightFlag,
          })
        }
      />
    );

    return (
      <>
        （{intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}
        {(type === 'BUSINESS' && businessWeightFlag) ||
        (type === 'TECHNOLOGY' && technologyWeightFlag) ? (
          <NumberField
            value={weight}
            min={0}
            step={0.01}
            max={100}
            precision={2}
            size="small"
            style={{ width: '80px', margin: '0 6px' }}
            onChange={(value) =>
              this.handleChangeScoreWeight({
                value,
                type,
                weightFlag,
              })
            }
            onBlur={(event) =>
              this.sureScoreWeight({
                type,
                event,
                weightFlag,
              })
            }
          />
        ) : (
          <Fragment>
            <Output style={{ marginLeft: '2px' }} value={weight} />%
            {remote
              ? remote.render(
                  'SSRC_INQUIRYHALLNEW_UPDATE_RENDER_SCORE_ELEMENT_WEIGHT_BUTTON_EDITOR',
                  weightButtonEditor,
                  {
                    bidFlag,
                  }
                )
              : weightButtonEditor}
          </Fragment>
        )}
        ）
      </>
    );
  }

  /**
   * 评分要素工厂函数
   * @param {Object} ScoreProps
   * @protected 东方电缆二开、九坤二开、水滴二开
   */
  @Bind()
  renderScoringElementTable(ScoreProps) {
    return <ScoringElementTable {...ScoreProps} />;
  }

  // 评分要素批量导入
  @Bind()
  onImportScoringElements(type) {
    const { sourceHeaderId, organizationId, rfxInfoDS, operationType = '' } = this.props;
    if (!sourceHeaderId || sourceHeaderId === 'null') {
      return;
    }
    const code = 'SSRC.RFX_EVALUATE_INDIC';
    const templateId = rfxInfoDS.current.get('templateId') || null;

    const Props = {
      code,
      organizationId,
      prefixPatch: SRM_SSRC,
      args: JSON.stringify({
        tenantId: organizationId,
        templateId,
        sourceHeaderId,
        templateCode: code,
        expertCategory: type,
        teamWeight: type === 'BUSINESS' || type === 'TECHNOLOGY' ? 50 : 100,
        sourceFrom: 'RFX',
        operationType,
      }),
      autoRefreshInterval: 5000,
      tenantId: organizationId,
      action: 'hzero.common.title.batchImport',
      key: '/ssrc/inquiry-hall/rfx-update/comment-import/SSRC.RFX_EVALUATE_INDIC',
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素'),
      children: <CommonImport {...Props} />,
      style: { width: '80%' },
      onOk: this.batchImportOk,
    });
  }

  // 批量导入确认后
  @Bind
  batchImportOk() {
    const { fetchScoring = () => {} } = this.props;
    fetchScoring();
    this.forceUpdate();
  }

  // 报价次序
  changeQuotationOrderType = (value, record) => {
    const { secondarySourceCategory } = record.get(['secondarySourceCategory']);
    record.set('quotationOrderType', value);

    if (secondarySourceCategory === 'RFA') {
      if (value === 'STAGGER' || value === 'SEQUENCE') {
        record.set('quotationScope', 'PART_QUOTATION');
      }
      if (value === 'PARALLEL') {
        record.set('quotationInterval', null);
        // 截止时间显示 清除运行时间值
        if (record.get('quotationRunningDurationFlag')) {
          record.set({
            biddingRunnintDay: null,
            biddingRunnintHour: null,
            biddingRunnintMinute: null,
            quotationRunningDuration: null,
          });
        }
      }
    }
  };

  // 报价范围
  triggleQuotationScope = (value = null, record) => {
    const { secondarySourceCategory, quotationOrderType } = record.get([
      'secondarySourceCategory',
      'quotationOrderType',
    ]);
    record.set('quotationScope', value);

    if (secondarySourceCategory === 'RFA' && quotationOrderType !== 'PARALLEL') {
      if (value === 'PART_QUOTATION') {
        record.set('quotationOrderType', null);
      }
    }
  };

  // 报价方式 selection option filter
  triggerQuotationTypeFilter(optionRecord, record) {
    const option = optionRecord.get('value');
    const sourceCategory = record.get('sourceCategory');

    return !((option === 'ON_OFF' || option === 'OFFLINE') && sourceCategory === 'RFA');
  }

  /**
   * 报价范围字段筛选 select option filter
   * 竞价-并行支持全部报价&部分报价，交错/序列只支持部分报价
   * */
  triggerQuotaitonScopeTypeFilter(optionRecord, record) {
    const { newQuotationFlag = 0 } = this.props;
    const option = optionRecord.get('value');
    const { secondarySourceCategory, quotationOrderType } = record.get([
      'secondarySourceCategory',
      'quotationOrderType',
    ]);

    const rfaSelectionFlag =
      secondarySourceCategory === 'RFA' &&
      newQuotationFlag &&
      (quotationOrderType === 'PARALLEL' ||
        !quotationOrderType ||
        ((quotationOrderType === 'STAGGER' || quotationOrderType === 'SEQUENCE') &&
          option === 'PART_QUOTATION'));
    const flag =
      secondarySourceCategory !== 'RFA' ||
      (secondarySourceCategory === 'RFA' && !newQuotationFlag && option === 'PART_QUOTATION') ||
      rfaSelectionFlag;

    return flag;
  }

  MatterDetail = {}; // 寻源事项说明ref

  // 寻源事项须知
  handleMatterDetail = (value = '', record) => {
    const detail = record.get('matterDetail');
    const MatterDetailProps = {
      matterDetail: value ?? detail ?? '',
      onRef: (ref = {}) => {
        this.MatterDetail = ref;
      },
      callback: this.changeMatterDetail,
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      closable: true,
      drawer: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.tab.matterDetailNotice`).d('寻源事项须知'),
      children: <MatterDetail {...MatterDetailProps} />,
      style: { width: '1090px' },
    });
  };

  // 寻源事项须指改变
  changeMatterDetail = (value = '') => {
    const { rfxInfoDS } = this.props;
    rfxInfoDS.current.set('matterDetail', value);
  };

  // 修改评分要素 权重维护
  setTechWeightFlag = () => {
    const { techWeightFlag } = this.state;
    this.setState({
      techWeightFlag: !techWeightFlag,
    });
  };

  // 评分要素工厂函数
  _renderScoreTableList(title = null, type = null, ds = {}) {
    const {
      rfxInfoDS,
      createScoreElement,
      onSaveScoringElements,
      onCreateScoringElements,
      sourceHeaderId,
      organizationId,
      deleteScoreElement,
      customizeTable,
      custLoading,
      fetchScoring,
      rfx = {},
      isScoringLoading = false,
      operationType = '',
      isSelectPass = false,
      customizeBtnGroup,
      remote,
      bidFlag = false,
    } = this.props;
    const { businessWeight, technologyWeight } = this.state;
    const dataFlag = ds.length > 0;
    let weight = this.calcWeight(type, ds);
    const CurrentWeight = type === 'BUSINESS' ? businessWeight : technologyWeight;
    weight = CurrentWeight || CurrentWeight === 0 ? CurrentWeight : weight;

    const importProps = {
      businessObjectTemplateCode: 'SSRC.RFX_EVALUATE_INDIC',
      prefixPatch: SRM_SSRC,
      name: 'batchImportNew',
      args: {
        tenantId: organizationId,
        templateId: rfxInfoDS.current.get('templateId') || null,
        sourceHeaderId,
        templateCode: 'RFX_EVALUATE_INDIC',
        expertCategory: type,
        teamWeight: type === 'BUSINESS' || type === 'TECHNOLOGY' ? 50 : 100,
        sourceFrom: 'RFX',
      },
      buttonTooltip: !sourceHeaderId
        ? intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据')
        : null,
      buttonText: intl.get('ssrc.inquiryHall.view.button.import').d('导入'),
      buttonProps: {
        icon: 'archive',
        funcType: 'flat',
        color: 'primary',
        disabled: !sourceHeaderId,
        permissionList: [
          {
            code: `ssrc.new-inquiry-hall.rfx-update-new.button.batch-import-new`,
            type: 'button',
            meaning:
              intl.get(`ssrc.inquiryHall.view.message.title.inquiryHall`).d('询价工作台') -
              intl.get('ssrc.inquiryHall.view.button.allCreateNew').d('(新)批量新增'),
          },
        ],
      },
      tenantId: organizationId,
      autoRefreshInterval: 5000,
      successCallBack: this.batchImportOk,
    };

    const ScoreProps = {
      remote,
      ds,
      type,
      importProps,
      templateScoreType: rfxInfoDS.current.get('templateScoreType'),
      customizeTable,
      custLoading,
      organizationId,
      createScoreElement,
      onSaveScoringElements,
      onCreateScoringElements,
      onImportScoringElements: this.onImportScoringElements,
      sourceHeaderId,
      deleteScoreElement,
      fetchScoring,
      rfx,
      isScoringLoading,
      operationType,
      isSelectPass,
      customizeBtnGroup,
      current: rfxInfoDS?.current,
      bachDeleteDisabled: !ds || !ds.selected.length || (!ds.length && !ds.cachedRecords?.length),
    };

    const weightEditor = (
      <span style={{ marginLeft: '16px' }}>{this.openWeightNumField({ type, ds, weight })}</span>
    );

    const templateScoreType = rfxInfoDS.current?.get('templateScoreType');

    const remoteProps = {
      bidFlag,
      templateScoreType,
    };

    return (
      <div>
        {title ? (
          <div className={classnames(styles['score-element-header'])}>
            {title}
            {type !== 'BUSINESS_TECHNOLOGY' && dataFlag && templateScoreType !== 'SCORE_NEW'
              ? remote
                ? remote.render(
                    'SSRC_INQUIRYHALLNEW_UPDATE_RENDER_SCORE_ELEMENT_WEIGHT_EDITOR',
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
  }

  // 启用开标密码
  // @Bind()
  // changePasswordFlag(value = false) {
  //   const { rfxInfoDS } = this.props;
  //   rfxInfoDS.current.set('passwordFlag', value);
  //   this.forceUpdate();
  // }

  // 公开规则
  renderOpenRule(optionRecord, record) {
    const optionValue = optionRecord.get('value') || null;
    const auctionRule = record.get('auctionRule');

    return (
      !auctionRule ||
      (auctionRule === 'TOP_ALL' &&
        optionValue !== 'HIDE_IDENTITY_HIDE_QUOTE' &&
        optionValue !== 'OPEN_IDENTITY_HIDE_QUOTE') ||
      auctionRule !== 'TOP_ALL'
    );
  }

  // 渲染是/否
  yesOrNoRenderer(value = null) {
    return value
      ? intl.get('hzero.common.status.yes').d('是')
      : intl.get('hzero.common.status.no').d('否');
  }

  /**
   * 报价开始时间框
   * @param {Object} params
   * @protected 跟谁学二开
   */
  renderQuotationStartDate(params) {
    const { prequalHeaderDsMap, rfxInfoDS, remote, setCurrentTimeValue = noop } = this.props;
    const { startFlag, autoRoundQuotationFlag } = params;
    const prequalEndDate =
      Object.values(prequalHeaderDsMap)?.[0]?.current.get('prequalEndDate') || null;
    const quotationStartDate = rfxInfoDS.getField('quotationStartDate');
    const preQualificationFlag = rfxInfoDS.current.get('preQualificationFlag');
    if (preQualificationFlag) {
      quotationStartDate.set('min', prequalEndDate || new Date());
    } else {
      quotationStartDate.set('min', new Date());
    }
    return !startFlag && !autoRoundQuotationFlag ? (
      <DateTimePicker
        name="quotationStartDate"
        onChange={() => {
          if (isFunction(setCurrentTimeValue)) {
            setCurrentTimeValue();
          }
        }}
        defaultTime={
          remote
            ? remote.process(
                'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_QUOTATION_START_DEF_TIME',
                undefined
              )
            : undefined
        }
      />
    ) : null;
  }

  /**
   * 报价截止时间框
   * @param {Object} params
   * @protected 跟谁学二开
   */
  renderQuotationEndDate(params) {
    const { remote } = this.props;
    const { quotationEndDateFlag, biddingPriceFlag, startFlag, autoRoundQuotationFlag } = params;
    const showFlag =
      quotationEndDateFlag && !biddingPriceFlag && !startFlag && !autoRoundQuotationFlag;
    return showFlag ? (
      <DateTimePicker
        name="quotationEndDate"
        defaultTime={
          remote
            ? remote.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_QUOTATION_END_DEF_TIME', undefined)
            : undefined
        }
      />
    ) : null;
  }

  quotationFields(autoRoundQuotationFlag) {
    const {
      rfxInfoDS,
      // changeSealedQuotationFlag,
      changeOpenBidLov,
      changeStartFlag,
      changeQuotationDuration,
      changeBiddingRunningTime,
      rfx,
      serviceChargeFlag = false,
      remote,
      isNewTemplateConfigFlag,
    } = this.props;

    const record = rfxInfoDS.current || null;
    if (!record) {
      return [];
    }
    const { quotationName = '' } = rfx;

    const openerFlag = (rfxInfoDS.current && rfxInfoDS.current.get('openerFlag')) || 0;
    const sealedQuotationFlag =
      (rfxInfoDS.current && rfxInfoDS.current.get('sealedQuotationFlag')) || 0; // 密封报价
    const preQualificationFlag = rfxInfoDS.current.get('preQualificationFlag'); // 资格预审
    const biddingPriceFlag = record.get('sourceCategory') === 'RFA'; // 竞价标识
    const startFlag = record.get('startFlag') || 0;
    const quotationEndDateFlag = record.get('quotationEndDateFlag') || 0;
    const matterRequireFlag = record.get('matterRequireFlag') || 0;
    const quotationOrderType = record.get('quotationOrderType') || '';
    const tenderFeeFlag = record.get('tenderFeeFlag') || 0;
    const bidBondFlag = record.get('bidBondFlag') || 0;
    const bidBond = record.get('bidBond') || 0;
    const Fields = [
      !preQualificationFlag && !autoRoundQuotationFlag ? (
        <CheckBox name="startFlag" onChange={(value) => changeStartFlag(value)} />
      ) : null,
      !preQualificationFlag && !autoRoundQuotationFlag ? (
        <div name="quotationField_1_2" fieldClassName="td-no-visible" />
      ) : null, // 个性化占位符,为了保持布局，startFlag保持相同的条件
      !preQualificationFlag && !autoRoundQuotationFlag ? (
        <div name="quotationField_1_3" fieldClassName="td-no-visible" />
      ) : null,
      !preQualificationFlag && startFlag && !biddingPriceFlag && !autoRoundQuotationFlag ? (
        <NewStarDurationFields
          name="quotationDay"
          label={intl
            .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotRunningDuration`, { quotationName })
            .d('{quotationName}运行时间')}
          changeQuotationDuration={changeQuotationDuration}
          quotationName={quotationName}
          record={record}
          biddingPriceFlag={biddingPriceFlag}
          remote={remote}
        />
      ) : null,
      this.renderQuotationStartDate({ startFlag, autoRoundQuotationFlag }),
      this.renderQuotationEndDate({
        quotationEndDateFlag,
        biddingPriceFlag,
        startFlag,
        autoRoundQuotationFlag,
      }),
      biddingPriceFlag ? (
        startFlag && quotationOrderType === 'PARALLEL' ? (
          <NewStarDurationFields
            name="biddingRunnintDay"
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.biddingRunningTime`)
              .d('竞价运行时间')}
            changeBiddingRunningTime={changeBiddingRunningTime}
            quotationName={quotationName}
            record={record}
            biddingPriceFlag={biddingPriceFlag}
            remote={remote}
          />
        ) : (
          <BiddingPriceRunningFields
            name="biddingRunnintDay"
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.biddingRunningTime`)
              .d('竞价运行时间')}
            changeBiddingRunningTime={changeBiddingRunningTime}
          />
        )
      ) : null,
      biddingPriceFlag ? (
        <NumberField
          name="quotationInterval"
          placeholder={
            intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationInterval`).d('报价间隔时间') +
            intl
              .get('ssrc.inquiryHall.view.inquiryHall.quotationIntervalUnitMinutes')
              .d('(单位:分钟)')
          }
        />
      ) : null,
      biddingPriceFlag ? (
        <Select
          name="quotationOrderType"
          onChange={(value) => this.changeQuotationOrderType(value, record)}
        />
      ) : null,
      biddingPriceFlag ? <Select name="auctionRule" /> : null,
      biddingPriceFlag ? (
        <Select
          name="openRule"
          optionsFilter={(optionRecord) => this.renderOpenRule(optionRecord, record)}
        />
      ) : null,
      biddingPriceFlag ? <Select name="rankRule" /> : null,
      biddingPriceFlag ? <CheckBox name="autoDeferFlag" disabled /> : null,
      biddingPriceFlag ? (
        <NumberField
          name="autoDeferDuration"
          placeholder={intl.get(`ssrc.inquiryHall.model.inquiryHall.unit.minutes`).d('单位：分钟')}
        />
      ) : null,
      biddingPriceFlag ? <Select name="autoDeferType" /> : null,
      biddingPriceFlag ? <NumberField name="autoDeferPeriod" /> : null,
      biddingPriceFlag ? <NumberField name="maxDeferCount" /> : null,
      <Select
        name="sealedQuotationFlag"
        // onChange={(value) => changeSealedQuotationFlag(value)}
        disabled={autoRoundQuotationFlag}
      />,
      sealedQuotationFlag === '1' && openerFlag ? <CheckBox name="passwordFlag" /> : null,
      openerFlag && sealedQuotationFlag === '1' ? (
        <Lov
          name="openBidLov"
          onChange={(value) => changeOpenBidLov(value)}
          renderer={({ value }) => renderpretialMemberLovTooltip(value)}
          modalProps={{
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.openBidder`).d('开标员'),
          }}
        />
      ) : null,
      <Select
        name="quotationType"
        optionsFilter={(optionRecord) => this.triggerQuotationTypeFilter(optionRecord, record)}
      />,
      <Lov name="currencyLov" />,
      <CheckBox name="multiCurrencyFlag" />,
      <Select
        name="quotationScope"
        optionsFilter={(optionRecord) => this.triggerQuotaitonScopeTypeFilter(optionRecord, record)}
        onChange={(value) => this.triggleQuotationScope(value, record)}
      />,
      <Lov name="paymentTypeLov" />,
      <Lov name="paymentTermLov" />,
      !isNewTemplateConfigFlag ? <CheckBox name="paymentTermFlag" /> : null,
      tenderFeeFlag && (
        <C7nPrecisionInputNumber
          name="bidFileExpense"
          record={rfxInfoDS.current}
          dataSet={rfxInfoDS}
          financial="currencyCode"
          renderer={(value) => this.rendererBidBond(value)}
        />
      ),
      serviceChargeFlag && tenderFeeFlag === 1 && <Select name="bidFileDownloadNode" />,
      serviceChargeFlag && bidBond && bidBond > 0 && <CheckBox name="serviceExpenseChargeFlag" />,
      bidBondFlag && (
        <C7nPrecisionInputNumber
          name="bidBond"
          record={rfxInfoDS.current}
          dataSet={rfxInfoDS}
          financial="currencyCode"
          renderer={(value) => this.rendererBidBond(value)}
        />
      ),
      <NumberField name="minQuotedSupplier" />,
      <CheckBox name="centralPurchaseFlag" />,

      !isNewTemplateConfigFlag ? (
        <TextField name="taxChangeFlag" renderer={({ value }) => this.yesOrNoRenderer(value)} />
      ) : null,
      <TextField
        name="continuousQuotationFlag"
        renderer={({ value }) => this.yesOrNoRenderer(value)}
      />,
      !isNewTemplateConfigFlag ? (
        <TextField
          name="quantityChangeFlag"
          renderer={({ value }) => this.yesOrNoRenderer(value)}
        />
      ) : null,
      <TextField
        name="diyLadderQuotationFlag"
        renderer={({ value }) => this.yesOrNoRenderer(value)}
      />,
      matterRequireFlag ? (
        <Output
          name="matterDetail"
          className={styles['rfx-matter-detail-notice']}
          renderer={({ value }) => (
            <a onClick={() => this.handleMatterDetail(value, record)}>
              {/* <Icon type="record_test" style={{ paddingRight: '3px' }} />
              <span style={{ height: '18px', verticalAlign: 'middle' }}>
                {intl.get(`ssrc.inquiryHall.view.message.tab.matterDetailNotice`).d('寻源事项须知')}
              </span> */}
              {intl.get(`hzero.common.view.button.edit`).d('编辑')}
            </a>
          )}
        />
      ) : null,
      <DateTimePicker name="clarifyEndDate" />,
    ];

    return Fields.filter(Boolean);
  }

  /**
   * 多轮
   */
  roundQuotationFields() {
    const { rfxInfoDS, changeRoundStartFlag, changeRoundQuotationDuration, rfx = {} } = this.props;
    const { quotationName = '' } = rfx;
    const { currentQuotationRounds } = this.state;
    const records = rfxInfoDS.current || null;
    if (!records) {
      return [];
    }

    const quotationRounds = rfxInfoDS.current && rfxInfoDS.current.get('quotationRounds');
    const StartFlag = records.get('startFlag');

    const addRoundQuotaionFields = (value) => {
      const currentQuotationRoundsList = [];
      for (let i = 1; i < value + 1; i++) {
        currentQuotationRoundsList.push(i);
      }
      if (
        !currentQuotationRounds.length ||
        value > currentQuotationRounds[currentQuotationRounds.length - 1]
      ) {
        const currentStartFlag = records.get('startFlag');
        currentQuotationRoundsList.forEach((item) => {
          const roundHour = records.get(`roundHour${item}`) || 0;
          const roundMinute = records.get(`roundMinute${item}`) || 0;
          const roundDay = records.get(`roundDay${item}`) || 0;
          const count = roundHour + roundMinute + roundDay;
          rfxInfoDS.addField(`roundQuotationRunningDuration${item}`, {
            name: `roundQuotationRunningDuration${item}`,
            type: 'number',
          });
          rfxInfoDS.addField(`roundDay${item}`, {
            name: `roundDay${item}`,
            type: 'number',
            placeholder: intl.get('hzero.common.date.unit.day').d('天'),
            labelWidth: 146,
            min: 0,
            step: 1,
            required: currentStartFlag && !count > 0,
            disabled: !currentStartFlag,
            defaultValidationMessages: { valueMissingNoLabel: '' },
          });
          rfxInfoDS.addField(`roundHour${item}`, {
            name: `roundHour${item}`,
            type: 'number',
            min: 0,
            step: 1,
            required: currentStartFlag && !count > 0,
            disabled: !currentStartFlag,
            defaultValidationMessages: { valueMissingNoLabel: '' },
          });
          rfxInfoDS.addField(`roundMinute${item}`, {
            name: `roundMinute${item}`,
            type: 'number',
            min: 0,
            step: 1,
            required: currentStartFlag && !count > 0,
            disabled: !currentStartFlag,
          });
          rfxInfoDS.addField(`quotationTime${item}`, {
            name: `quotationTime${item}`,
            type: 'date',
            format: DEFAULT_DATETIME_FORMAT,
            range: [`quotationStartTime${item}`, `quotationEndTime${item}`],
            required: !currentStartFlag,
            disabled: currentStartFlag,
          });
        });
        this.setState({
          currentQuotationRounds: currentQuotationRoundsList,
        });
      } else {
        this.setState({
          currentQuotationRounds: currentQuotationRoundsList,
        });
      }
    };

    const Fields = [
      !records.get('preQualificationFlag') ? (
        <CheckBox name="startFlag" onChange={(value) => changeRoundStartFlag(value)} />
      ) : null,
      <NumberField
        name="quotationRounds"
        defaultValue={quotationRounds}
        onChange={addRoundQuotaionFields}
        min={2}
        max={10}
      />,
      StartFlag
        ? currentQuotationRounds.map((item) => (
          <RoundQuotationDurationFields
            name={`roundMinute${item}`}
            label={`${
                intl.get('ssrc.common.the').d('第') +
                item +
                intl
                  .get('ssrc.common.roundRunningTimeRFX', { quotationName })
                  .d(`轮{quotationName}运行时间`)
              }`}
            round={item}
            changeRoundQuotationDuration={changeRoundQuotationDuration}
          />
          ))
        : currentQuotationRounds.map((item) => (
          <DateTimePicker
            name={`quotationTime${item}`}
            label={`${
                intl.get('ssrc.common.the').d('第') +
                item +
                intl.get('ssrc.common.roundQuotationTime').d(`报价时间`)
              }`}
          />
          )),
    ];

    return Fields.filter(Boolean);
  }

  // 保证金
  rendererBidBond({ value = null }) {
    console.log(value);
    if (!value) {
      return intl.get('ssrc.common.view.gratis').d('免费');
    }

    return value;
  }

  renderNoRestrictions({ value = null }) {
    if (isNil(value)) {
      return intl.get('ssrc.common.view.noRestrictions').d('不限制');
    }

    return value;
  }

  // 其它
  expandFields() {
    const Fields = [
      <TextField name="openBidOrderMeaning" />,
      <TextField name="bidRuleTypeMeaning" />,
    ];

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
    const {
      onSaveExpert,
      customizeTable,
      sourceHeaderId,
      deleteExpertLines,
      rfxInfoDS = {},
      proxyDsCreate = {},
      rfx = {},
      isLoading = false,
      fetchExpert,
      businessScoringElementDS,
      technologyScoringElementDS,
      allScoringElementDS,
      fetchScoring = noop,
      priceScoringElementDS,
    } = this.props;
    const bidRuleType = rfxInfoDS.current.get('bidRuleType') || null;
    const expertSource = rfxInfoDS.current.get('expertSource') || null;
    const ExpertProps = {
      ds,
      type,
      bidRuleType,
      expertSource,
      sourceHeaderId,
      onSaveExpert,
      customizeTable,
      deleteExpertLines,
      proxyDsCreate,
      rfx,
      isLoading,
      rfxInfoDS,
      fetchExpert,
      businessScoringElementDS,
      technologyScoringElementDS,
      allScoringElementDS,
      fetchScoring,
      priceScoringElementDS,
    };

    return (
      <>
        <h4
          id="rfxExperts"
          className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}
        >
          <div className={styles['rfx-card-item-title-line']} />
          {intl.get(`ssrc.inquiryHall.view.message.experts`).d('专家')}
        </h4>
        <div>
          {title}
          {this.renderExpertTablePureComponent(ExpertProps)}
        </div>
      </>
    );
  }

  /**
   * 渲染专家表格
   * @param {*} ExpertProps
   * @protected 九坤二开
   */
  renderExpertTablePureComponent(ExpertProps) {
    return <ExpertTable {...ExpertProps} />;
  }

  // 公开规则过滤字段
  filterOpenRuleOption = (optionRecord, record) => {
    const optionValue = optionRecord.get('value') || null;
    // 出价策略低于最低价、高于最高价，公开规则隐藏【隐藏身份隐藏报价、公开身份隐藏报价】
    if (
      ['BELOW_THE_LOWEST_PRICE', 'ABOVE_MAXIMUM_PRICE'].includes(record?.get('biddingStrategy'))
    ) {
      return !['HIDE_IDENTITY_HIDE_QUOTE', 'OPEN_IDENTITY_HIDE_QUOTE'].includes(optionValue);
    }
    return optionValue;
  };

  // 密封报价字段过滤
  filterSealedQuotationFlagOption = (optionRecord, record) => {
    const optionValue = optionRecord.get('value') || null;
    // 是否启用了开标，若启用开标，则必须是密封报价
    const openerFlag = record?.get('openerFlag');
    if (openerFlag) {
      if (optionValue === '0') {
        return false;
      }
    }

    return true;
  };

  // 竞价规则过滤字段
  // filterAuctionRuleOption = (optionRecord, record) => {
  //   const optionValue = optionRecord.get('value') || null;
  //   // 出价策略低于最低价、高于最高价，竞价规则隐藏【所有排名允许报相同价格、前三名不允许报相同价格】
  //   if (
  //     ['BELOW_THE_LOWEST_PRICE', 'ABOVE_MAXIMUM_PRICE'].includes(record?.get('biddingStrategy'))
  //   ) {
  //     return !['NONE', 'TOP_THREE'].includes(optionValue);
  //   }
  //   return optionValue;
  // };

  // 出价策略字段过滤
  filterBiddingStrategyOption = (optionRecord, record) => {
    const optionValue = optionRecord.get('value') || null;
    // biddingQuotationMethod - 竞价方式：竞价（BIDDING）｜ 拍卖（AUCTION）
    const { biddingQuotationMethod } = record?.get(['biddingQuotationMethod']) || {};
    if (biddingQuotationMethod === 'BIDDING') {
      // 竞价方式为竞价
      return ['BELOW_THE_LOWEST_PRICE', 'LOWER_THAN_LAST_QUOTE'].includes(optionValue);
    } else if (biddingQuotationMethod === 'AUCTION') {
      // 竞价方式为拍卖
      return ['ABOVE_MAXIMUM_PRICE', 'ABOVE_THAN_LAST_QUOTE'].includes(optionValue);
    }
    return optionValue;
  };

  // 报价次序字段过滤
  filterQuotationOrderTypeOption = (optionRecord, record) => {
    const optionValue = optionRecord.get('value') || null;
    // 延时竞价
    const autoDeferFlag = record?.get('autoDeferFlag');
    if (autoDeferFlag) {
      return optionValue !== 'SEQUENCE';
    }
    return optionValue;
  };

  // 切换出价策略
  handleChangeBiddingStrategy = (value, record) => {
    // 如果选择了低于最低价或者高于最高价, 清空竞价规则、公开规则
    if (['BELOW_THE_LOWEST_PRICE', 'ABOVE_MAXIMUM_PRICE'].includes(value)) {
      // eslint-disable-next-line no-unused-expressions
      record?.set({
        auctionRule: null,
        openRule: null,
      });
    }
  };

  changeBiddingAutoDeferFlag = () => {
    const { rfxInfoDS } = this.props;
    const record = rfxInfoDS.current || null;
    if (!record) {
      return;
    }

    record.set({
      quotationOrderType: 'PARALLEL',
    });
  };

  changeBiddingOnlineSignInFlag = (value) => {
    const { rfxInfoDS } = this.props;
    const record = rfxInfoDS.current || null;
    if (!record) {
      return;
    }

    if (value) {
      return;
    }

    const { preQualificationFlag, biddingTrialBiddingFlag } = record.get([
      'preQualificationFlag',
      'biddingTrialBiddingFlag',
    ]);

    if (preQualificationFlag) {
      if (biddingTrialBiddingFlag) {
        record.set('startingTrialBiddingStartFlag', 0);
      } else {
        record.set('startFlag', 0);
      }
    }
  };

  changeBiddingTrialBiddingFlag = (value) => {
    const { rfxInfoDS } = this.props;
    const record = rfxInfoDS.current || null;

    if (!record) {
      return;
    }

    if (value) {
      return;
    }

    const { preQualificationFlag } = record.get(['preQualificationFlag']);

    if (preQualificationFlag) {
      record.set('startFlag', 0);
    }
  };

  /**
   * 清空补充单价时间
   */
  clearBiddingSupplementPriceField = () => {
    const { rfxInfoDS } = this.props;
    const record = rfxInfoDS.current || null;
    if (!record) return;
    record.set({
      biddingSupplementPriceStartDate: null,
      biddingSupplementPriceEndDate: null,
      biddingSupplementPriceRunnintDay: null,
      biddingSupplementPriceRunnintHour: null,
      biddingSupplementPriceRunnintMinute: null,
      // biddingUnitPriceRule: null,
    });
  };

  // 竞价单为序列时的提示语
  getMinuteOptions = (payload = {}) => {
    const {
      intlName = intl.get(`ssrc.inquiryHall.model.inquiryHall.startingBidding`).d(`竞价`),
      quotationOrderType,
    } = payload || {};
    // 如果报价次序为序列
    let minuteOptions = {};
    if (quotationOrderType === 'SEQUENCE') {
      minuteOptions = {
        help: intl
          .get('ssrc.inquiryHall.model.inquiryHall.quotationRunningTooltip', {
            stageName: intlName,
          })
          .d('当前报价次序为序列，需注意当前维护的是每一个物料的{stageName}运行时间'),
        showHelp: 'tooltip',
      };
    }
    return minuteOptions;
  };

  changeBiddingIntervalDuration = () => {
    const { rfxInfoDS } = this.props;
    const record = rfxInfoDS.current || null;
    if (!record) {
      return;
    }

    const {
      biddingIntervalDurationDay,
      biddingIntervalDurationHour,
      biddingIntervalDurationMinute,
    } =
      record?.get([
        'biddingIntervalDurationDay',
        'biddingIntervalDurationHour',
        'biddingIntervalDurationMinute',
      ]) || {};

    const time = transformDayHourMinute({
      days: biddingIntervalDurationDay,
      hours: biddingIntervalDurationHour,
      minutes: biddingIntervalDurationMinute,
    });

    record.set('biddingIntervalDuration', time || 0);
  };

  // 竞价时间
  renderBiddingTimeForm = () => {
    const { rfxInfoDS, itemLineTableDS, japOrDutchBiddingTotalPrice } = this.props;
    const record = rfxInfoDS.current || null;
    if (!record) {
      return [];
    }

    const {
      preQualificationFlag,
      sourceCategory,
      biddingOnlineSignInFlag, // 签到开始标识
      biddingTrialBiddingFlag, // 试竞价标识
      quotationOrderType, // 报价次序
      biddingMode,
      biddingFlag,
      autoDeferFlag,
      biddingTotalPricePrinciple, // 总价竞价原则
      biddingTarget, // 竞价对象
    } =
      record?.get([
        'preQualificationFlag',
        'sourceCategory',
        'biddingOnlineSignInFlag',
        'biddingTrialBiddingFlag',
        'quotationOrderType',
        'biddingMode', // 竞价模式
        'biddingFlag', // 1-竞价大厅
        'autoDeferFlag', // 是否启用自动延时
        'biddingTotalPricePrinciple', // 总价竞价原则
        'biddingTarget', // 竞价对象
      ]) || {};

    // 竞价大厅
    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    // 是否启用自动延时
    const resumeAutoDeferFlag = newBiddingFlag && autoDeferFlag;

    // 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【启用自动延时】为【启用】时展示，任一不满足时隐藏
    const timerToTriggerFlag = resumeAutoDeferFlag && biddingMode === 'BRITISH_BIDDING';

    // 总价竞价且总价竞价原则为总价必输
    const totalPriceFlag =
      biddingTarget === 'TOTAL_PRICE' && biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';

    // 正式竞价开始时间下拉框
    const optionsObj = {
      defaultOption: {
        value: 0,
        text: intl.get('ssrc.common.view.selectCustomDateTime').d('自定义时间'),
      },
      value1: {
        value: 1,
        text: intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始'),
      },
      value2: {
        value: 1,
        text: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startAfterPreQualificationEnd`)
          .d('资格预审截止即开始'),
      },
      value3: {
        value: 1,
        text: intl.get(`ssrc.inquiryHall.model.inquiryHall.startAfterSignIn`).d('签到截止即开始'),
      },
      value4: {
        value: 1,
        text: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startAfterTrialBiddingEnd`)
          .d('试竞价截止即开始'),
      },
      value5: {
        value: 1,
        text: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startAfterQuotationEnd`)
          .d('竞价截止即开始'),
      },
    };

    // 竞价选项
    let biddingOptions = [optionsObj.defaultOption];
    if (biddingTrialBiddingFlag) {
      biddingOptions = [optionsObj.value4, ...biddingOptions];
    } else if (biddingOnlineSignInFlag) {
      biddingOptions = [optionsObj.value3, ...biddingOptions];
    } else if (!preQualificationFlag) {
      biddingOptions = [optionsObj.value1, ...biddingOptions];
    }

    // 签到字段
    const signInFields = biddingOnlineSignInFlag
      ? [
        <StartTimeWrapper
          name="signInStartDate"
          flagField="signInStartFlag"
          startField="signInStartDate"
          record={record}
          hidden={!biddingOnlineSignInFlag}
          selectionOptions={[
              preQualificationFlag ? null : optionsObj.value1,
              optionsObj.defaultOption,
            ].filter(Boolean)}
        />,
        <EndTimeWrapper
          title={intl.get(`ssrc.inquiryHall.model.inquiryHall.signIn`).d(`签到`)}
          name="signInEndDate"
          flagField="signInRunningDurationFlag"
          timeField="signInEndDate"
          durationField="signInRunningDuration"
          dayField="signInRunningDay"
          hourField="signInRunningHour"
          minuteField="signInRunningMinute"
          startField="signInStartDate"
          record={record}
          hidden={!biddingOnlineSignInFlag}
        />,
          /* 占位符 */
        <div name="signInEndDateField_1_3" fieldClassName="td-no-visible" />,
        ]
      : [];

    // 试竞价字段
    const trailBiddingFields = biddingTrialBiddingFlag
      ? [
        <StartTimeWrapper
          hidden={!biddingTrialBiddingFlag}
          name="startingTrialBiddingStartDate"
          flagField="startingTrialBiddingStartFlag"
          startField="startingTrialBiddingStartDate"
          record={record}
          selectionOptions={[
              // 签到存在
              biddingOnlineSignInFlag ? optionsObj.value3 : null,
              // 签到不存在且资格预审不存在
              !preQualificationFlag && !biddingOnlineSignInFlag ? optionsObj.value1 : null,
              optionsObj.defaultOption,
            ].filter(Boolean)}
        />,
        <EndTimeWrapper
          title={intl.get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBidding`).d(`试竞价`)}
          name="startingTrialBiddingEndDate"
          flagField="startingTrialBiddingRunningDurationFlag"
          timeField="startingTrialBiddingEndDate"
          durationField="startingTrialBiddingRunningDuration"
          dayField="startingBiddingRunningDay"
          hourField="startingBiddingRunningHour"
          minuteField="startingBiddingRunningMinute"
          startField="startingTrialBiddingStartDate"
          record={record}
          hidden={!biddingTrialBiddingFlag}
          hiddenEndDate={quotationOrderType === 'SEQUENCE'} // 如果竞价次序为序列 隐藏截止时间
          minuteOptions={this.getMinuteOptions({
              intlName: intl
                .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBidding`)
                .d(`试竞价`),
              quotationOrderType,
            })}
        />,
          /* 占位符 */
        <div name="startingTrialBiddingEndDateField_2_3" fieldClassName="td-no-visible" />,
        ]
      : [];

    // 正式竞价字段
    const biddingFields = [
      <StartTimeWrapper
        name="quotationStartDate"
        flagField="startFlag"
        startField="quotationStartDate"
        record={record}
        selectionOptions={biddingOptions}
      />,
      <EndTimeWrapper
        title={intl.get(`ssrc.inquiryHall.model.inquiryHall.startingBidding`).d(`竞价`)}
        name="quotationEndDate"
        flagField="startingBiddingRunningDurationFlag"
        timeField="quotationEndDate"
        durationField="quotationRunningDuration"
        dayField="biddingRunnintDay"
        hourField="biddingRunnintHour"
        minuteField="biddingRunnintMinute"
        record={record}
        startField="quotationStartDate"
        hiddenEndDate={quotationOrderType === 'SEQUENCE'} // 如果竞价次序为序列 隐藏截止时间
        hiddenRunningOptions={japOrDutchBiddingTotalPrice()}
        minuteOptions={this.getMinuteOptions({
          intlName: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingBidding`).d(`竞价`),
          quotationOrderType,
        })}
      />,
      /* 占位符 */
      <div name="quotationEndDateField_3_3" fieldClassName="td-no-visible" />,
    ];
    // 补充单价字段
    const biddingSupplementPriceFields = totalPriceFlag
      ? [
        <StartTimeWrapper
          name="biddingSupplementPriceStartDate"
          flagField="biddingSupplementPriceStartFlag"
          startField="biddingSupplementPriceStartDate"
          record={record}
          selectionOptions={
              resumeAutoDeferFlag
                ? [optionsObj.value5]
                : [optionsObj.value5, optionsObj.defaultOption]
            }
        />,
        <EndTimeWrapper
          title={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPrice`)
              .d(`补充单价`)}
          name="biddingSupplementPriceEndDate"
          flagField="biddingSupplementPriceRunningDurationFlag"
          timeField="biddingSupplementPriceEndDate"
          durationField="biddingSupplementPriceRunningDuration"
          dayField="biddingSupplementPriceRunnintDay"
          hourField="biddingSupplementPriceRunnintHour"
          minuteField="biddingSupplementPriceRunnintMinute"
          record={record}
          startField="biddingSupplementPriceStartDate"
          hiddenEndDate={resumeAutoDeferFlag}
        />,
          /* 占位符 */
        <div name="biddingSupplementPriceEndDateField_4_3" fieldClassName="td-no-visible" />,
        ]
      : [];

    // 延时触发相关字段
    const timerToTriggerFields = [
      <NumberField
        hidden={!timerToTriggerFlag}
        name="autoDeferDuration"
        addonAfter={intl
          .get('ssrc.inquiryHall.model.biddingDate.autoDeferPeriod.lastMinute')
          .d('分钟')}
      />,
      // <NumberField name="maxDeferCount" renderer={this.renderNoRestrictions} />,
    ];

    const Fields = [
      ...signInFields,
      ...trailBiddingFields,
      ...biddingFields,
      ...biddingSupplementPriceFields,
      ...timerToTriggerFields,
      // 占位符
      <div colSpan={3} name="biddingTime_7_1" fieldClassName="td-no-visible" />,
      /* 竞价节点 */
      <RenderBiddingNodes
        colSpan={3}
        name="biddingTimeNode"
        itemLineTableDS={itemLineTableDS}
        rfxInfoDS={rfxInfoDS}
      />,
    ];

    return Fields;
  };

  // 竞价规则
  renderBiddingRuleForm = () => {
    const {
      rfxInfoDS,
      // japOrDutchBiddingTotalPrice = noop,
      japanBiddingTotalPrice = noop,
      // britishBidding = noop,
      dutchBiddingTotalPrice = noop,
    } = this.props;
    const record = rfxInfoDS.current || null;
    if (!record) {
      return [];
    }

    const {
      biddingMode,
      biddingFlag,
      sourceCategory,
      quotationOrderType,
      biddingTarget,
      quotationType,
      autoDeferFlag,
      biddingTotalPricePrinciple,
      isBritishBidTrafficLight,
      biddingTrialBiddingFlag,
      biddingStageChangeableFlag,
      floatType,
    } =
      record?.get([
        'biddingMode', // 竞价模式
        'biddingFlag', // 1-竞价大厅
        'sourceCategory',
        'quotationOrderType', // 报价次序
        'biddingTarget', // 竞价对象
        'quotationType',
        'autoDeferFlag', // 是否启用自动延时
        'biddingTotalPricePrinciple', // 总价竞价规则
        'isBritishBidTrafficLight',
        'biddingTrialBiddingFlag',
        'biddingStageChangeableFlag',
        'floatType',
      ]) || {};

    // 竞价大厅
    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
    // 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】时展示，任一不为时隐藏
    const britishBiddingFlag = !!newBiddingFlag && biddingMode === 'BRITISH_BIDDING';

    const currentTotalPriceFlag = biddingTarget === 'TOTAL_PRICE' && newBiddingFlag;

    const japanBiddingTotalPriceFlag = japanBiddingTotalPrice();

    const japanTotalBiddingFlag = japanBiddingTotalPriceFlag && currentTotalPriceFlag;

    const dutchBiddingFlag = dutchBiddingTotalPrice();

    const dutchTotalBiddingFlag = dutchBiddingFlag && currentTotalPriceFlag;

    // const japOrDutchBiddingFlag = japanBiddingTotalPriceFlag || dutchBiddingFlag;

    const japOrDutchTotalBiddingFlag = japanTotalBiddingFlag || dutchTotalBiddingFlag;

    // 报价次序 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】且【报价方式】为【线上报价】时展示，任一不满足时隐藏
    const biddingQuotationOrderFlag =
      biddingMode === 'BRITISH_BIDDING' &&
      biddingTarget === 'UNIT_PRICE' &&
      quotationType === 'ONLINE'; // BRITISH_BIDDING 英式竞价
    // 报价间隔时间 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】且【报价次序】为【序列】时展示，任一不满足时隐藏
    const quotationIntervalFlag =
      biddingMode === 'BRITISH_BIDDING' &&
      biddingTarget === 'UNIT_PRICE' &&
      quotationOrderType === 'SEQUENCE';

    // 总价竞价显示的字段flag 【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【总价竞价】，任一不满足时隐藏
    const biddingTotalPriceFlag = britishBiddingFlag && biddingTarget === 'TOTAL_PRICE';

    // 【竞价对象】是单价，【报价次序】是并行时，显示【单价竞价规则】，否则不显示
    const unitBiddingRuleVisibleFlag =
      biddingTarget === 'UNIT_PRICE' && quotationOrderType === 'PARALLEL';

    // 是否启用自动延时
    const resumeAutoDeferFlag = newBiddingFlag && autoDeferFlag;

    // 总价 - 总价必输
    const totalRequiredFlag =
      biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED' && biddingTarget === 'TOTAL_PRICE';

    // 总价竞价-启用红绿灯
    const totalPriceTrafficLight =
      biddingTotalPriceFlag && isBritishBidTrafficLight && britishBiddingFlag;

    // 总价竞价 - 试竞价 - 启用红绿灯
    const trialTotalPriceTrafficLight = totalPriceTrafficLight && biddingTrialBiddingFlag;

    // 竞价 允许调整节点
    const allowAdjustBiddingStage = newBiddingFlag && biddingStageChangeableFlag === 1;

    const Fields = [
      <Select
        name="biddingTarget"
        onChange={() => {
          this.dealBiddingSupplementPriceField(record);
          // 切换单价模板时，floatType没有默认值，此时需要给一个默认值
          if (!record.get('floatType')) {
            record.set('floatType', 'money');
          }
        }}
      />,
      biddingQuotationOrderFlag && (
        <Select
          name="quotationOrderType"
          optionsFilter={(optionRecord) =>
            this.filterQuotationOrderTypeOption(optionRecord, record)
          }
          onChange={(value) => {
            if (value === 'SEQUENCE') {
              // 改为序列时，如果竞价运行时间有值，则需要清空原本维护值
              record.set({
                quotationRunningDuration: null,
                biddingRunnintDay: null,
                biddingRunnintMinute: null,
                biddingRunnintHour: null,
                quotationEndDate: null,
                startingBiddingRunningDurationFlag: 1,
                startingBiddingRunningDuration: null,
                startingBiddingRunningDay: null,
                startingBiddingRunningHour: null,
                startingBiddingRunningMinute: null,
                startingTrialBiddingEndDate: null,
                startingTrialBiddingRunningDurationFlag: 1,
              });
            }
          }}
        />
      ),
      quotationIntervalFlag && (
        <NumberField
          name="quotationInterval"
          precision={0}
          placeholder={
            intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationInterval`).d('报价间隔时间') +
            intl
              .get('ssrc.inquiryHall.view.inquiryHall.quotationIntervalUnitMinutes')
              .d('(单位:分钟)')
          }
        />
      ),
      // britishBiddingFlag && (
      //   <Select
      //     name="auctionRule"
      //     optionsFilter={(optionRecord) => this.filterAuctionRuleOption(optionRecord, record)}
      //   />
      // ),
      britishBiddingFlag && (
        <Select
          name="biddingStrategy"
          onChange={(value) => this.handleChangeBiddingStrategy(value, record)}
          optionsFilter={(optionRecord) => this.filterBiddingStrategyOption(optionRecord, record)}
        />
      ),
      (biddingTotalPriceFlag && isBritishBidTrafficLight !== 1) || japOrDutchTotalBiddingFlag ? (
        <C7nPrecisionInputNumber
          name="startingBiddingPrice"
          record={record}
          dataSet={rfxInfoDS}
          financial="currencyCode"
          omitZeroFlag
        />
      ) : null,
      // 【寻源类别】为【竞价】且【竞价模式】为【日式/荷兰式竞价】且【报价类型】是【总价竞价】，且启用试竞价阶段时，满足上述所有条件时显示
      japOrDutchTotalBiddingFlag && biddingTrialBiddingFlag ? (
        <C7nPrecisionInputNumber
          name="trialStartingBiddingPrice"
          record={record}
          dataSet={rfxInfoDS}
          financial="currencyCode"
          omitZeroFlag
        />
      ) : null,
      currentTotalPriceFlag && (
        <QuotationRange name="quotationRange" record={record} ds={rfxInfoDS} type="totalPrice" />
      ),
      japOrDutchTotalBiddingFlag && biddingTrialBiddingFlag ? (
        <NumberField
          name="biddingTrialQuotationRange"
          addonAfter={floatType === 'ratio' ? '%' : null}
        />
      ) : null,
      britishBiddingFlag ? (
        <C7nPrecisionInputNumber
          name="safePrice"
          record={record}
          dataSet={rfxInfoDS}
          financial="currencyCode"
          omitZeroFlag
        />
      ) : null,
      britishBiddingFlag && (
        <NumberField
          name="biddingAllowedQuotationCount"
          placeholder={
            intl
              .get(`ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountFormalBidding`)
              .d('允许报价次数(正式竞价)') +
            intl.get('ssrc.inquiryHall.view.biddingRules.biddingAllowedQuotationCount').d('(次)')
          }
          renderer={this.renderNoRestrictions}
        />
      ),
      britishBiddingFlag && resumeAutoDeferFlag && (
        <NumberField
          name="deferBiddingAllowedQuotationCount"
          placeholder={
            intl
              .get(`ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountDeferBidding`)
              .d('允许报价次数(延时竞价)') +
            intl.get('ssrc.inquiryHall.view.biddingRules.biddingAllowedQuotationCount').d('(次)')
          }
          renderer={this.renderNoRestrictions}
        />
      ),
      britishBiddingFlag && <Select name="rankRule" />,
      <Select
        name="openRule"
        optionsFilter={(optionRecord) => this.filterOpenRuleOption(optionRecord, record)}
      />,
      <Select
        name="sealedQuotationFlag"
        optionsFilter={(optionRecord) => this.filterSealedQuotationFlagOption(optionRecord, record)}
      />,
      currentTotalPriceFlag && ( // 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】以及【竞价对象】为【总价竞价】时展示，不为时隐藏
        <Select
          name="biddingTotalPricePrinciple"
          onChange={() => {
            this.dealBiddingSupplementPriceField(record);
          }}
        />
      ),
      unitBiddingRuleVisibleFlag ? <Select name="biddingUnitPriceRule" /> : '',
      totalRequiredFlag && (
        <C7nPrecisionInputNumber
          name="biddingSpreadPrice"
          record={record}
          dataSet={rfxInfoDS}
          financial="currencyCode"
          omitZeroFlag
        />
      ),
      britishBiddingFlag && resumeAutoDeferFlag ? <Select name="autoDeferType" /> : null,
      britishBiddingFlag ? <CheckBox name="isBritishBidTrafficLight" /> : null,
      isBritishBidTrafficLight === 1 ? <CheckBox name="isBritishBidLowestPriceGreen" /> : null,
      totalPriceTrafficLight ? (
        <C7nPrecisionInputNumber
          name="targetPriceLowerLimit"
          record={record}
          dataSet={rfxInfoDS}
          financial="currencyCode"
          omitZeroFlag
        />
      ) : null,
      totalPriceTrafficLight ? (
        <C7nPrecisionInputNumber
          name="targetPriceUpperLimit"
          record={record}
          dataSet={rfxInfoDS}
          financial="currencyCode"
          omitZeroFlag
        />
      ) : null,
      trialTotalPriceTrafficLight ? (
        <C7nPrecisionInputNumber
          name="trialTargetPriceLowerLimit"
          record={record}
          dataSet={rfxInfoDS}
          financial="currencyCode"
          omitZeroFlag
        />
      ) : null,
      trialTotalPriceTrafficLight ? (
        <C7nPrecisionInputNumber
          name="trialTargetPriceUpperLimit"
          record={record}
          dataSet={rfxInfoDS}
          financial="currencyCode"
          omitZeroFlag
        />
      ) : null,
      allowAdjustBiddingStage ? (
        <CheckBox name="biddingOnlineSignInFlag" onChange={this.changeBiddingOnlineSignInFlag} />
      ) : null,
      allowAdjustBiddingStage ? (
        <CheckBox name="biddingTrialBiddingFlag" onChange={this.changeBiddingTrialBiddingFlag} />
      ) : null,
      allowAdjustBiddingStage && britishBiddingFlag ? (
        <CheckBox name="autoDeferFlag" onChange={this.changeBiddingAutoDeferFlag} />
      ) : null,
      japOrDutchTotalBiddingFlag ? (
        <TimeBiddingDurationFields
          name="biddingIntervalDurationDay"
          dayOverProps={{
            label: intl.get(`ssrc.common.model.template.biddingIntervalDuration`).d('叫价间隔时长'),
            style: {
              width: '49%',
            },
            name: 'biddingIntervalDurationDay',
          }}
          hourOverProps={{
            style: {
              width: '25%',
            },
            name: 'biddingIntervalDurationHour',
          }}
          minuteOverProps={{
            style: {
              width: '25%',
            },
            name: 'biddingIntervalDurationMinute',
          }}
          record={record}
          changeBiddingRunningTime={this.changeBiddingIntervalDuration}
        />
      ) : null,
      japOrDutchTotalBiddingFlag ? (
        <C7nPrecisionInputNumber
          name="biddingDisclosePrice"
          record={record}
          dataSet={rfxInfoDS}
          financial="currencyCode"
          omitZeroFlag
        />
      ) : null,
      japOrDutchTotalBiddingFlag && biddingTrialBiddingFlag ? (
        <C7nPrecisionInputNumber
          name="biddingTrialDisclosePrice"
          record={record}
          dataSet={rfxInfoDS}
          financial="currencyCode"
          omitZeroFlag
        />
      ) : null,
      japanTotalBiddingFlag ? <Select name="biddingEliminateRoundNumber" /> : null,
      japanTotalBiddingFlag ? <NumberField name="biddingMinShortlistedSupplierNumber" /> : null,
      japOrDutchTotalBiddingFlag ? <Select name="biddingEndType" /> : null,
      japOrDutchTotalBiddingFlag ? <NumberField name="biddingEstimatedRoundNumber" /> : null,
      japOrDutchTotalBiddingFlag && biddingTrialBiddingFlag ? (
        <NumberField name="biddingEstimatedTrialRoundNumber" />
      ) : null,
    ].filter(Boolean);

    return Fields;
  };

  // 特殊处理补充单价字段显示情况
  dealBiddingSupplementPriceField = (record) => {
    if (!record) return;
    const {
      biddingTarget,
      biddingTotalPricePrinciple,
      autoDeferFlag, // 是否启用自动延时
    } = record.get(['biddingTarget', 'biddingTotalPricePrinciple', 'autoDeferFlag']);
    // 总价竞价 & 总价竞价原则为总价必输
    if (biddingTarget === 'TOTAL_PRICE' && biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED') {
      record.set({
        biddingSupplementPriceStartFlag: autoDeferFlag ? 1 : 0,
        biddingSupplementPriceRunningDurationFlag: autoDeferFlag ? 1 : 0,
      });
    }
    this.clearBiddingSupplementPriceField();
  };

  render() {
    const { permissionListMap } = this.state;
    const {
      organizationId,
      sourceHeaderId,
      rfxInfoDS = {},
      quotationFormRef,
      roundQuotationFormRef,
      customizeCollapseForm,
      prequalScoreElementDS,
      preQualificationFormRef,
      prequalMergeTypes = [],
      prequalHeaderDsMap = {},
      prequalScoreElementDsMap = {},
      changeEnableScoreFalg = noop,
      onRefreshPrequalGroup = noop,
      refreshRfxHeaderAndPrequalGroup = noop,
      proxyDsCreate = {},
      rfx = {},
      afterCustomizeDs,
      mergeTypeEditorFlag = false,
      operationType = '',
      quotationFormRefControl = true,
      biddingTimerRef,
      biddingRuleRef,
      setRfxPrepareFormRef = noop,
      remote,
    } = this.props;
    const { quotationName = '', sourceKey = 'INQUIRY' } = rfx;
    if (!rfxInfoDS.current) {
      return null;
    }

    const { sourceCategory, biddingFlag } =
      rfxInfoDS?.current?.get(['sourceCategory', 'biddingFlag']) || {};

    // 资格审查标识
    const preQualificationFlag = rfxInfoDS.current.get('preQualificationFlag');
    const roundQuotationRule = rfxInfoDS.current.get('roundQuotationRule');
    const initialReview = rfxInfoDS.current.get('initialReview');
    const autoRoundQuotationFlag =
      roundQuotationRule === 'AUTO' ||
      roundQuotationRule === 'AUTO_CHECK' ||
      roundQuotationRule === 'AUTO_SCORE';
    const prequalProps = {
      rfx,
      rfxInfoDS,
      organizationId,
      sourceHeaderId,
      prequalMergeTypes,
      customizeCollapseForm,
      preQualificationFormRef,
      prequalScoreElementDS,
      prequalHeaderDsMap,
      prequalScoreElementDsMap,
      changeEnableScoreFalg,
      onRefreshPrequalGroup,
      refreshRfxHeaderAndPrequalGroup,
      mergeTypeEditorFlag,
      operationType,
    }; // 预审props
    const mergeType = rfxInfoDS?.current?.get('mergeType'); // 资格预审-副标题

    // 竞价大厅
    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');

    let showExpertCardFlag = permissionListMap['expert.view']?.approve;
    showExpertCardFlag = remote
      ? remote.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SHOW_EXPERT_CARD_FLAG',
          showExpertCardFlag,
          {
            that: this,
          }
        )
      : showExpertCardFlag;

    let showScoreCardFlag = permissionListMap['score.elements']?.approve;
    showScoreCardFlag = remote
      ? remote.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SHOW_SCORE_CARD_FLAG',
          showScoreCardFlag,
          {
            that: this,
          }
        )
      : showScoreCardFlag;

    return (
      <div>
        <div>
          <h4 id="rfxPrepare" className={styles['rfx-card-item-title-level-two']}>
            <div className={styles['rfx-card-item-title-line']} />
            {intl.get('ssrc.inquiryHall.view.inquiryHall.rfxPrepare').d('寻源准备')}
          </h4>
          {customizeCollapseForm(
            {
              code: `SSRC.${sourceKey}_HALL.NEW_EDIT.RFXPREPARE`,
              dataSet: rfxInfoDS,
              labelLayout: 'vertical',
              afterCustomizeDs,
              proxyDsCreate,
            },
            <CollapseForm
              dataSet={rfxInfoDS}
              labelLayout="float"
              columns={3}
              useWidthPercent
              formRef={setRfxPrepareFormRef}
            >
              {this.prepareFields()}
            </CollapseForm>
          )}
        </div>
        {/* 资格预审 (mergeType || !isEmpty(prequalHeaderDsMap))判断为了不出现空标签 */}
        {!!preQualificationFlag && (mergeType || !isEmpty(prequalHeaderDsMap)) && (
          <PrequalContainer {...prequalProps} />
        )}
        {!newBiddingFlag && (
          <div>
            <h4
              id="rfxMaintaionQuotation"
              className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}
            >
              <div className={styles['rfx-card-item-title-line']} />
              {intl
                .get(`ssrc.inquiryHall.view.title.rfxMaintaionQuotationRFX`, { quotationName })
                .d(`{quotationName}`)}
            </h4>
            {autoRoundQuotationFlag ? (
              <div className={classnames(styles['m-b-m'])}>
                <CollapseForm
                  formRef={roundQuotationFormRef}
                  dataSet={rfxInfoDS}
                  showLines={6}
                  columns={3}
                  labelLayout="float"
                  useWidthPercent
                  className={styles['rfx-card-common-form']}
                >
                  {this.roundQuotationFields()}
                </CollapseForm>
              </div>
            ) : null}
            {quotationFormRefControl
              ? customizeCollapseForm(
                  {
                    code: `SSRC.${sourceKey}_HALL.NEW_EDIT.RFX_DEM_QUOTE_V2`,
                    dataSet: rfxInfoDS,
                    proxyDsCreate,
                    afterCustomizeDs,
                  },
                <CollapseForm
                  formRef={quotationFormRef}
                  dataSet={rfxInfoDS}
                  showLines={4}
                  labelLayout="float"
                  columns={3}
                  useWidthPercent
                  className={styles['rfx-card-common-form']}
                >
                  {this.quotationFields(autoRoundQuotationFlag)}
                </CollapseForm>
                )
              : null}
          </div>
        )}
        {!!newBiddingFlag && (
          <div>
            <div>
              <h4
                id="rfxDemandSide"
                className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}
              >
                <div className={styles['rfx-card-item-title-line']} />
                {intl.get('ssrc.inquiryHall.view.inquiryHall.biddingRule').d('竞价规则')}
              </h4>
              {customizeCollapseForm(
                {
                  code: `SSRC.${sourceKey}_HALL.NEW_EDIT.BIDDING_RULE`,
                  dataSet: rfxInfoDS,
                  proxyDsCreate,
                  afterCustomizeDs,
                },
                <CollapseForm
                  dataSet={rfxInfoDS}
                  showLines={12}
                  labelLayout="float"
                  columns={3}
                  formRef={biddingRuleRef}
                  firstShowFields={[]}
                  useWidthPercent
                >
                  {this.renderBiddingRuleForm()}
                </CollapseForm>
              )}
            </div>
            <div>
              <h4
                id="rfxDemandSide"
                className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}
              >
                <div className={styles['rfx-card-item-title-line']} />
                {intl.get('ssrc.inquiryHall.view.inquiryHall.biddingTimer').d('竞价时间')}
              </h4>
              {customizeCollapseForm(
                {
                  code: `SSRC.${sourceKey}_HALL.NEW_EDIT.BIDDING_TIME`,
                  dataSet: rfxInfoDS,
                  proxyDsCreate,
                  afterCustomizeDs,
                },
                <CollapseForm
                  dataSet={rfxInfoDS}
                  showLines={8}
                  columns={3}
                  labelLayout="float"
                  formRef={biddingTimerRef}
                  firstShowFields={[]}
                  useWidthPercent
                  className={styles['rfx-card-common-form']}
                >
                  {this.renderBiddingTimeForm()}
                </CollapseForm>
              )}
            </div>
          </div>
        )}
        {rfxInfoDS.current.get('expertScoreType') &&
        rfxInfoDS.current.get('expertScoreType') !== 'NONE' ? (
          <div>
            {showExpertCardFlag && this.renderExpertTable()}
            {initialReview === 'NEED' ? this.renderInitialReviewWrapper() : null}
            {showScoreCardFlag && this.renderScoreDetailTabale()}
          </div>
        ) : null}
      </div>
    );
  }
}

// hoc function
const hocRfxDemandFormComponent = (NewComponent) => {
  return observer(NewComponent);
};

const RfxDemandForm = observer(RfxDemandFormComponent);

export default RfxDemandForm;

export { hocRfxDemandFormComponent, RfxDemandFormComponent };
