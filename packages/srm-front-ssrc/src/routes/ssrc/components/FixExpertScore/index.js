import React, { Component } from 'react';
import {
  DataSet,
  Button,
  Table,
  Switch,
  Modal,
  TextField,
  Icon,
  Lov,
  NumberField,
  Select,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Bind, Debounce } from 'lodash-decorators';
// import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import queryString from 'querystring';

import { valueMapMeaning } from 'utils/renderer';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { openTab } from 'utils/menuTab';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import { saveAllScoringTemplate, saveEvaluateIndicAssign } from '@/services/bidHallService';
import { isEmpty, isNil } from 'lodash';
import RemarkModal from '@/routes/ssrc/InquiryHall/Update/RemarkModal';
import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import Editing from '@/assets/editing.svg';
import { scoreFormulaRender } from '@/utils/renderer';
import style from './index.less';
import DetailModal from './ScoreEleDetailModal';
import {
  technicalTableDS,
  expertModalDS,
  ScoreDetailReferenceTemplateDS,
} from './FixExpertScoreDS';

const promptCode = 'ssrc.inquiryHall';

const organizationId = getCurrentOrganizationId();

class FixExpertScore extends Component {
  state = {
    detailModalVisible: false, // 评分要素细项弹框
    elementRecord: {}, // 评分要素
    lovBringOutFlag: {}, // lov带出flag
    changeLovFlag: {}, // 真实数据，是否改变lov
    currentDS: {},
    remarkVisible: false, // 评分细则modal visible
    remarkRecord: {}, // 评分行数据
    currentLineRecord: {}, // 当前编辑行record
    technologyWeight: 50,
    businessWeight: 50,
  };

  technicalConfigs = {
    expertCategory: 'TECHNOLOGY',
    header: this.props.header,
    sourceHeaderId: this.props.match.params.rfxId,
  };

  businessTechnicalConfigs = {
    expertCategory: 'BUSINESS_TECHNOLOGY',
    header: this.props.header,
    sourceHeaderId: this.props.match.params.rfxId,
  };

  businessConfigs = {
    expertCategory: 'BUSINESS',
    header: this.props.header,
    sourceHeaderId: this.props.match.params.rfxId,
  };

  technicalTableDS = new DataSet(technicalTableDS(this.technicalConfigs));

  businessTableDS = new DataSet(technicalTableDS(this.businessConfigs));

  businessTechnicalTableDS = new DataSet(technicalTableDS(this.businessTechnicalConfigs));

  expertModalDS = new DataSet(expertModalDS());

  ScoreDetailReferenceTemplateDS = new DataSet(
    ScoreDetailReferenceTemplateDS(this.businessTechnicalConfigs)
  );

  componentDidMount() {
    const { header } = this.props;
    this.technicalTableDS.setQueryParameter('headers', header);
    this.businessTableDS.setQueryParameter('headers', header);
    this.businessTechnicalTableDS.setQueryParameter('headers', header);
    this.ScoreDetailReferenceTemplateDS.setQueryParameter('headers', header);
    if (header.bidRuleType === 'NONE') {
      this.businessTechnicalTableDS.query();
    } else {
      this.technicalTableDS.query();
      this.businessTableDS.query();
    }
  }

  @Bind()
  async handleDetailModalShow(records, DS) {
    let lovBringOutFlag = {};
    let changeLovFlag = {};
    const obj = this.getDS(DS);
    this.setState({
      currentDS: obj,
    });
    obj.forEach((record) => {
      lovBringOutFlag = {
        ...lovBringOutFlag,
        [record.get('evaluateIndicId')]: record.get('lovBringOutFlag'),
      };
      changeLovFlag = {
        ...changeLovFlag,
        [record.get('evaluateIndicId')]: record.get('changeLovFlag'),
      };
      record.set('status', 'update');
    });
    const enableFlag = await obj.validate();
    if (enableFlag) {
      this.setState({
        detailModalVisible: true,
        elementRecord: records.toData(),
        lovBringOutFlag,
        changeLovFlag,
      });
    } else {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.view.notification.openDetail.failsAndChange`)
          .d('存在字段未校验通过，请修改后点击！'),
      });
    }
  }

  @Bind()
  changeDetailEnabledFlag(checked, record) {
    record.set('detailEnabledFlag', checked ? 1 : 0);
  }

  /**
   * 要素细项-显隐
   * 保存后关闭弹框，需要重置lovBringOutFlag，changeLovFlag
   */
  @Bind()
  handleDetailModalHide(saveFlag) {
    this.setState({ detailModalVisible: false, elementRecord: {} });
    if (saveFlag) {
      this.setState({ lovBringOutFlag: {}, changeLovFlag: {} });
    }
  }

  @Bind()
  openAssignExpertModal(record) {
    const { customizeTable } = this.props;
    this.expertModalDS.setQueryParameter('params', {
      evaluateIndicId: record.get('evaluateIndicId') || '',
      evaluateIndicCategory: record.get('team') || '',
      sourceHeaderId: record.get('sourceHeaderId'),
      customizeUnitCode: 'SSRC.INQUIRY_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN',
    });
    this.expertModalDS.query();
    const expertColumns = [
      {
        name: 'loginName',
        width: 150,
      },
      {
        name: 'expertName',
        width: 150,
      },
      {
        name: 'assignFlag',
        width: 120,
        editor: true,
      },
    ];
    const modalKey = Modal.key();
    Modal.open({
      key: modalKey,
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.assignExpert`).d('分配专家')}</span>
          <div style={{ paddingRight: '24px' }}>
            <Button key="create" type="primary" onClick={this.saveScoringAssignExpert}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </div>
        </div>
      ),
      children: customizeTable(
        {
          code: 'SSRC.INQUIRY_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN',
        },
        <Table bordered columns={expertColumns} dataSet={this.expertModalDS} selectionMode="none" />
      ),
      footer: null,
      closable: true,
    });
  }

  /**
   * 评分要素-专家分配 保存
   *
   * @memberof Update
   */
  @Bind()
  async saveScoringAssignExpert() {
    const newParams = this.expertModalDS.toData();
    const response = getResponse(
      await saveEvaluateIndicAssign({
        newParams,
        organizationId: getCurrentOrganizationId(),
        customizeUnitCode: 'SSRC.INQUIRY_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN',
      })
    );

    if (response) {
      notification.success();
      Modal.destroyAll();
    }
  }

  @Bind()
  getDS(DS) {
    let obj = {};
    if (DS === 'technicalTableDS') {
      obj = this.technicalTableDS;
    } else if (DS === 'businessTableDS') {
      obj = this.businessTableDS;
    } else {
      obj = this.businessTechnicalTableDS;
    }
    return obj;
  }

  // 评分细项编辑
  @Bind()
  handleIndicateRemark(record = {}) {
    const recordData = record.toData() || {};
    const { calculateType = null, evaluateIndicDetail = {} } = recordData;
    if (calculateType === 'AUTO') {
      this.setState({
        remarkVisible: true,
        currentLineRecord: record,
        remarkRecord: {
          ...recordData,
          evaluateIndicDetail: { ...evaluateIndicDetail, indicId: undefined },
        },
      });
    }
  }

  // 关闭评分信则
  @Bind()
  closeRemarkModal() {
    this.setState({
      remarkVisible: false,
      remarkRecord: {},
    });
  }

  // 保存Modal信息
  @Bind()
  onChangeRemarkModal(record = {}) {
    const {
      code: { benchmarkPriceMethod = [], formula = [] },
    } = this.props;
    const { currentLineRecord } = this.state;
    const { evaluateIndicDetail = {} } = record || {};
    const benchmarkPriceDetail = `${intl
      .get('ssrc.score.model.score.bPEmethod')
      .d('基准价计算方法')}:${valueMapMeaning(
      benchmarkPriceMethod,
      evaluateIndicDetail.benchmarkPriceMethod
    )}, ${
      evaluateIndicDetail.benchmarkPriceMethod === 'LOWEST_PRICE'
        ? `${intl.get('ssrc.score.model.score.basePrice').d('基准价=有效最低价')}`
        : `${intl.get('ssrc.score.model.score.aVTP').d('基准价=有效投标价格平均值*')}${
            evaluateIndicDetail.benchmarkPriceFactor
          }%`
    }`;

    // 价格计算公式描述
    const calculateRuleDesc = `${intl
      .get('ssrc.score.model.score.priceCFormula')
      .d('价格计算公式')}:${valueMapMeaning(formula, evaluateIndicDetail.formula)}`;
    const formulaDetail = `${calculateRuleDesc}, ${this.renderScoreFormulaRender(
      evaluateIndicDetail
    )}`;
    // 有效报价供应商≥ []家时，去除最低/最高报价计算投标价格平均值
    const enableRemoveExtremesDesc = evaluateIndicDetail.enableRemoveExtremes
      ? intl
          .get('ssrc.score.model.score.enableRemoveExtremesDesc', {
            limitSupplierQuantity: evaluateIndicDetail.limitSupplierQuantity,
          })
          .d(
            '（有效报价供应商 ≥ {limitSupplierQuantity}家时，去除最低/最高报价计算投标价格平均值），'
          )
      : '';

    // 线性映射法计算方式
    const linearMappingNotice = `${intl
      .get('ssrc.score.model.score.linearMapping.calculateHelp')
      .d(
        '供应商报价得分=最低分+[(最高价-供应商报价)/(最高价-最低价)]*(最高分-最低分)'
      )}，${intl
      .get('ssrc.score.model.score.linearMapping.note')
      .d(
        '注：最高分、最低分取自单据中要素行上维护的分数。当评分方式=权重法时，最低分默认为0，最高分默认为100。'
      )}`;
    // 评分细则行文本显示
    const scoreRuleDesc =
      evaluateIndicDetail.formula === 'LINEAR_MAPPING'
        ? `${calculateRuleDesc}, ${linearMappingNotice}`
        : `${benchmarkPriceDetail}${enableRemoveExtremesDesc}${formulaDetail}`;

    const indicateRemark =
      record.calculateType === 'AUTO' ? scoreRuleDesc : `${evaluateIndicDetail.remark}`;

    const maxScore = record.maxScore || null;
    let minScore = record.minScore || null;
    if (record.scoreType === 'PRICE' && maxScore) {
      minScore = (evaluateIndicDetail.lowestScore * maxScore) / 100;
    }
    currentLineRecord.set('indicateRemark', indicateRemark);
    currentLineRecord.set('minScore', minScore);
    currentLineRecord.set('evaluateIndicDetail', evaluateIndicDetail);
    this.forceUpdate();
  }

  renderScoreFormulaRender(evaluateIndicDetail) {
    return scoreFormulaRender(evaluateIndicDetail);
  }

  // 评分细则改变输入
  @Bind()
  handleIndicateRemarkChange(values = null, record = {}) {
    record.set('indicateRemark', values);
  }

  // 评分方式
  renderCalculateType = (type = '') => {
    return (
      <Select
        name="calculateType"
        optionsFilter={(curRecord) => {
          const currentOptionValue = curRecord.get('value') || null;

          return (type === 'TECHNOLOGY' && currentOptionValue !== 'AUTO') || type !== 'TECHNOLOGY';
        }}
      />
    );
  };

  /**
   * 获取Columns
   * @param {*} DS 组别类型
   */
  @Bind()
  getColumns(DS, type = null) {
    const { header = {} } = this.props;
    const columns = [
      {
        name: 'indicateLov',
        width: 150,
        editor: true,
      },
      {
        name: 'indicateName',
        width: 150,
        editor: true,
      },
      {
        name: 'calculateType',
        width: 150,
        editor: () => this.renderCalculateType(type),
      },
      {
        name: 'scoreType',
        width: 150,
        editor: true,
      },
      {
        name: 'indicateRemark',
        width: 180,
        renderer: ({ record, value }) => {
          const calculateType = record.get('calculateType');
          const scoreType = record.get('scoreType');
          return (
            <React.Fragment>
              {calculateType === 'AUTO' && scoreType === 'PRICE' ? (
                <TextField
                  value={value}
                  readOnly
                  required
                  name="indicateRemark"
                  suffix={
                    <Icon
                      type="search"
                      onClick={() => this.handleIndicateRemark(record)}
                      style={{ cursor: 'pointer' }}
                    />
                  }
                  record={record}
                />
              ) : (
                <TextField
                  name="indicateRemark"
                  value={value}
                  onChange={(values) => this.handleIndicateRemarkChange(values, record)}
                  record={record}
                />
              )}
            </React.Fragment>
          );
        },
      },
      header.templateScoreType !== 'SCORE'
        ? {
            name: 'weight',
            width: 120,
            editor: true,
          }
        : null,
      {
        name: 'minScore',
        width: 100,
        editor: true,
      },
      {
        name: 'maxScore',
        width: 100,
        editor: true,
      },
      {
        name: 'detailEnabledFlag',
        width: 160,
        renderer: ({ value, record }) => {
          return (
            <div>
              <Switch
                defaultChecked={!!value}
                checked={!!value}
                onChange={(checked) => this.changeDetailEnabledFlag(checked, record)}
                style={{ marginRight: '4px' }}
                disabled={
                  record.get('lovBringOutFlag') ||
                  (record.get('indicateType') === 'SCORE' && record.get('calculateType') === 'AUTO')
                }
              />
              {value ? (
                <a onClick={() => this.handleDetailModalShow(record, DS)}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.elements.detail`).d('评分要素细项')}
                </a>
              ) : null}
            </div>
          );
        },
      },
      {
        name: 'expertDistribute',
        width: 150,
        renderer: ({ record }) => (
          <a onClick={() => this.openAssignExpertModal(record)}>
            {intl.get(`ssrc.inquiryHall.view.message.button.distribution`).d('分配')}
          </a>
        ),
      },
    ].filter(Boolean);
    return columns;
  }

  @Debounce(500)
  @Bind()
  businessTechnicalSave() {
    this.businessTechnicalTableDS.submit();
  }

  @Debounce(500)
  @Bind()
  technicalTableSave() {
    this.technicalTableDS.submit();
  }

  @Debounce(500)
  @Bind()
  businessTableSave() {
    this.businessTableDS.submit();
  }

  /**
   * 批量导入评分要素
   * @param {*} types
   * @returns
   * @memberof import
   */
  @Bind()
  onImportScoringElements(params) {
    const { header = {} } = this.props;
    const { rfxHeaderId, templateId } = header;
    openTab({
      key: '/ssrc/inquiry-hall/rfx-update/comment-import/SSRC.RFX_EVALUATE_INDIC',
      search: queryString.stringify({
        key: '/ssrc/inquiry-hall/rfx-update/comment-import/SSRC.RFX_EVALUATE_INDIC',
        title: 'hzero.common.title.batchImport',
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
        backPath: `/ssrc/inquiry-hall/rfx-update/${rfxHeaderId}`,
        args: JSON.stringify({
          sourceHeaderId: rfxHeaderId,
          tenantId: organizationId,
          templateId,
          expertCategory: params,
          teamWeight: params === 'BUSINESS' || params === 'TECHNOLOGY' ? 50 : 100,
          areaFrom: 'CONTROL',
          sourceFrom: 'RFX',
        }),
      }),
    });
  }

  // 评分要素参考模板
  @Bind()
  async selectScoreElementTemplate(record = {}) {
    const { header = {} } = this.props;
    const { rfxHeaderId = null, bidRuleType } = header || {};
    const { templateId = null } = record;

    if (!rfxHeaderId || !templateId) {
      return;
    }

    try {
      let result = await saveAllScoringTemplate({
        organizationId: getCurrentOrganizationId(),
        sourceHeaderId: rfxHeaderId,
        sourceFrom: 'RFX',
        templateId,
        indicStatus: 'SUBMITTED',
        templatePurpose: record.templatePurpose,
      });
      result = getResponse(result);
      if (!result) {
        return;
      }
      notification.success();
      if (bidRuleType === 'NONE') {
        this.businessTechnicalTableDS.query();
      } else {
        this.technicalTableDS.query();
        this.businessTableDS.query();
      }
    } catch (e) {
      throw e;
    }
  }

  // 权重渲染默认值
  calcWeight(type = null, ds = {}) {
    if (type === 'BUSINESS_TECHNOLOGY') {
      return;
    }

    const { header = {} } = this.props;

    let weigthData = 50;
    if (!ds?.length) {
      if (type === 'BUSINESS') {
        return header?.businessWeight ?? weigthData;
      }
      if (type === 'TECHNOLOGY') {
        return header?.technologyWeight ?? weigthData;
      }
      return weigthData;
    }

    const oldData = ds.find((record) => record.status !== 'add');

    const firstLineData = !isEmpty(oldData) ? oldData.toData() : {};
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

  // 改变权重
  @Bind()
  handleChangeScoreWeight(value = null, type = null) {
    const fieldWeight = type === 'BUSINESS' ? 'businessWeight' : 'technologyWeight';
    this.setState({
      [fieldWeight]: value,
    });
  }

  // 评分要素权重确认
  @Bind()
  sureScoreWeight(ds, type) {
    const { businessWeight, technologyWeight } = this.state;
    let field = 'businessWeight';
    let fieldValue = businessWeight;
    if (type !== 'BUSINESS') {
      field = 'technologyWeight';
      fieldValue = technologyWeight;
    }

    ds.forEach((record) => {
      record.set(field, fieldValue);
    });
    this.forceUpdate();
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
        <div>
          <NumberField
            label={`${intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}%`}
            placeholder={intl.get(`ssrc.inquiryHall.model.inquiryHall.weight`).d('权重')}
            min={0}
            max={100}
            step={0.01}
            defaultValue={weight}
            onChange={(value) => this.handleChangeScoreWeight(value, type)}
            destroyOnClose
          />
        </div>
      ),
      style: { width: '400px' },
      onOk: () => this.sureScoreWeight(ds, type),
      onCancel: () => {},
    });
  }

  // 东方电缆二开
  @Bind()
  renderRemarkModal(remarkModalProps) {
    return <RemarkModal {...remarkModalProps} />;
  }

  // 新建要素
  onCreateScoringElements = (type) => {
    const { header = {} } = this.props;
    let ds = null;
    const defaultData = {};
    let CurrentWeight = 50;
    if (!header || !type) {
      return;
    }

    const getBusinessFirstLineWeight = (currentDS = {}) => {
      let weight = null;
      const data = currentDS.toData();
      const firstLineData = data.filter((item) => item._status !== 'create')[0] || {};

      if (isEmpty(firstLineData)) {
        const headBusinessWeight = header?.businessWeight;
        weight = !isNil(headBusinessWeight) ? headBusinessWeight : CurrentWeight;
      } else {
        const { businessWeight = null } = firstLineData || {};
        weight = businessWeight ?? CurrentWeight;
      }
      return weight;
    };

    const getTechnolofyFirstLineWeight = (currentDS = {}) => {
      let weight = null;
      const data = currentDS.toData();
      const firstLineData = data.filter((item) => item._status !== 'create')[0] || {};

      if (isEmpty(firstLineData)) {
        const headTechWeight = header?.technologyWeight;
        weight = !isNil(headTechWeight) ? headTechWeight : CurrentWeight;
      } else {
        weight = firstLineData?.technologyWeight ?? CurrentWeight;
      }
      return weight;
    };

    if (type === 'BUSINESS') {
      ds = this.businessTableDS;
      CurrentWeight = getBusinessFirstLineWeight(ds);
      defaultData.businessWeight = CurrentWeight;
      defaultData.technologyWeight = null;
    }
    if (type === 'TECHNOLOGY') {
      ds = this.technicalTableDS;
      CurrentWeight = getTechnolofyFirstLineWeight(ds);
      defaultData.technologyWeight = CurrentWeight;
      defaultData.businessWeight = null;
    }

    const tenantId = getCurrentOrganizationId();
    const {
      templateId: sourceTemplateId = null,
      templateScoreType,
      openBidOrder,
      rfxHeaderId,
    } = header;

    let line = {
      weight: templateScoreType === 'SCORE' ? 100 : null,
      sourceFrom: 'RFX',
      tenantId,
      openBidOrder: openBidOrder || 'BUSINESS_FIRST',
      organizationId: tenantId,
      expertCategory: type,
      rfxHeaderId,
      sourceHeaderId: rfxHeaderId,
      indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
      team: type,
      sourceTemplateId,
      _status: 'create',
    };
    line = { ...line, ...defaultData };

    if (ds) {
      ds.create(line, 0);
    }
  };

  render() {
    const {
      elementRecord = {},
      detailModalVisible = false,
      lovBringOutFlag = {},
      changeLovFlag = {},
      remarkVisible = false,
      remarkRecord = {},
    } = this.state;
    const { header = {}, code = {}, customizeTable = () => {}, customLoading } = this.props;

    const detailModalProps = {
      header,
      lovBringOutFlag,
      changeLovFlag,
      elementRecord,
      sourceHeaderId: this.props.match.params.rfxId,
      visible: detailModalVisible,
      onHideModal: this.handleDetailModalHide,
      ds: this.state.currentDS,
    };

    const { benchmarkPriceMethod = [], formula = [] } = code || {};
    const remarkModalProps = {
      visible: remarkVisible,
      record: remarkRecord,
      benchmarkPriceMethod,
      formula,
      onHideModal: this.closeRemarkModal,
      onChangeRemarkModal: this.onChangeRemarkModal,
    };

    const businessWeight = this.calcWeight('BUSINESS', this.businessTableDS);
    const technologyWeight = this.calcWeight('TECHNOLOGY', this.technicalTableDS);

    return (
      <React.Fragment>
        <h3 className={styles['m-t-m']}>
          <span style={{ marginRight: '16px' }}>
            {intl.get(`ssrc.inquiryHall.view.message.tab.scoringElements`).d('评分要素')}
          </span>
          <Lov
            name="scoreTemplateLov"
            mode="button"
            noCache
            clearButton={false}
            icon="check"
            onChange={(data) => this.selectScoreElementTemplate(data)}
            dataSet={this.ScoreDetailReferenceTemplateDS}
            // tableProps={{
            //   alwaysShowRowBox: true,
            // }}
          >
            {intl.get(`ssrc.inquiryHall.view.button.referTemplate`).d('参考模板')}
          </Lov>
        </h3>

        {header.bidRuleType === 'NONE' ? (
          customizeTable(
            {
              code: 'SSRC.QUOTATION_CONTROLLER.SCORE_INDICS',
            },
            <Table
              dataSet={this.businessTechnicalTableDS}
              columns={this.getColumns('businessTechnicalTableDS', 'BUSINESS_TECHNOLOGY')}
              buttons={[
                'delete',
                <Button icon="save" onClick={this.businessTechnicalSave} key="save">
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>,
                <Button
                  icon="playlist_add"
                  onClick={() => this.onImportScoringElements('BUSINESS_TECHNOLOGY')}
                  key="add"
                >
                  {intl.get('ssrc.inquiryHall.view.button.allCreate').d('批量创建')}
                </Button>,
              ]}
            />
          )
        ) : (
          <>
            <div className={style.tableHeader}>
              <div className={style.title}>
                {intl.get(`${promptCode}.model.inquiryHall.technologyTeam`).d('技术组')}
                {(this.technicalTableDS.toData() || []).length ? (
                  <span style={{ marginLeft: '16px' }}>
                    ({`${technologyWeight} % `}
                    <img
                      src={Editing}
                      alt=""
                      onClick={() => this.openWeightModal('TECHNOLOGY', this.technicalTableDS)}
                    />
                    )
                  </span>
                ) : null}
              </div>
            </div>
            {customizeTable(
              {
                code: 'SSRC.QUOTATION_CONTROLLER.SCORE_INDICS_TECH',
              },
              <Table
                customLoading={customLoading}
                dataSet={this.technicalTableDS}
                columns={this.getColumns('technicalTableDS', 'TECHNOLOGY')}
                buttons={[
                  <Button
                    name="add"
                    icon="playlist_add"
                    onClick={() => this.onCreateScoringElements('TECHNOLOGY')}
                  >
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>,
                  'delete',
                  <Button icon="save" onClick={this.technicalTableSave} key="save">
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>,
                  <Button
                    icon="playlist_add"
                    onClick={() => this.onImportScoringElements('TECHNOLOGY')}
                    key="add"
                  >
                    {intl.get('ssrc.inquiryHall.view.button.allCreate').d('批量创建')}
                  </Button>,
                ]}
              />
            )}
            <div className={style.tableHeader}>
              <div className={style.title}>
                {intl.get(`${promptCode}.model.inquiryHall.bussinessGroup`).d('商务组')}
                {(this.businessTableDS.toData() || []).length ? (
                  <span style={{ marginLeft: '16px' }}>
                    ({`${businessWeight} % `}
                    <img
                      src={Editing}
                      alt=""
                      onClick={() => this.openWeightModal('BUSINESS', this.businessTableDS)}
                    />
                    )
                  </span>
                ) : null}
              </div>
            </div>
            {customizeTable(
              {
                code: 'SSRC.QUOTATION_CONTROLLER.SCORE_INDICS',
              },
              <Table
                customLoading={customLoading}
                dataSet={this.businessTableDS}
                columns={this.getColumns('businessTableDS', 'BUSINESS')}
                buttons={[
                  <Button
                    name="add"
                    icon="playlist_add"
                    onClick={() => this.onCreateScoringElements('BUSINESS', this.businessTableDS)}
                  >
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>,
                  'delete',
                  <Button icon="save" onClick={this.businessTableSave} key="save">
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>,
                  <Button
                    icon="playlist_add"
                    onClick={() => this.onImportScoringElements('BUSINESS')}
                    key="add"
                  >
                    {intl.get('ssrc.inquiryHall.view.button.allCreate').d('批量创建')}
                  </Button>,
                ]}
              />
            )}
          </>
        )}
        <DetailModal {...detailModalProps} />
        {remarkVisible && this.renderRemarkModal(remarkModalProps)}
      </React.Fragment>
    );
  }
}

const hocFixExpertScore = (NewComponent) => {
  return WithCustomizeC7N({
    unitCode: [
      'SSRC.QUOTATION_CONTROLLER.SCORE_INDICS', // 询价要求-评分要素
      'SSRC.QUOTATION_CONTROLLER.SCORE_INDICS_TECH', // 询价要求-评分要素-技术
      'SSRC.INQUIRY_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN', // 评分要素-分配
    ],
  })(observer(NewComponent));
};

export default hocFixExpertScore(FixExpertScore);
export { hocFixExpertScore, FixExpertScore };
