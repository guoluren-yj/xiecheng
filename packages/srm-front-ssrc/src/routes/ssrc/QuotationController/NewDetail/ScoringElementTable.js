// 评分要素table

import React, { PureComponent } from 'react';
import {
  DataSet,
  Modal,
  TextField,
  Table,
  Icon,
  Select,
  NumberField,
  TextArea,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { Tooltip } from 'choerodon-ui';
import { Bind, Debounce } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import { isEmpty, isObject, noop } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import CommonImportNew from 'hzero-front/lib/components/Import';
import DynamicButtons from '_components/DynamicButtons';

import { valueMapMeaning } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { ScoreDetailDoubleFields } from '@/routes/ssrc/InquiryHallNew/Update/Components';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import { scoreFormulaRender } from '@/utils/renderer';
import {
  assignExpertScoreDetailOfQuotationController,
  updateScoreDetailOfQuotationController,
} from '@/services/inquiryHallNewService';
import { ExpertModalDS } from './ScoringElementTableDS';
import ScoreEleDetailModal from './ScoreEleDetailModal';
import BidScoreEleDetailModal from './BidScoreEleDetailModal';
import RemarkModal from './RemarkModal';
import AssignExperts from '../../components/AssignExperts';

import { historyRenderPure, ComponentDiffRender } from './utils';
import styles from './index.less';

function ExpertAssignModal(props) {
  const { expertModalDS, customizeTable, custKey, newOpenedBidFlag } = props || {};
  const expertColumns = [
    {
      name: 'loginName',
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

  return customizeTable(
    {
      code: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN`,
    },
    <Table
      border
      dataSet={expertModalDS}
      columns={expertColumns}
      rowKey="indicAssginAdjustId"
      editMode={!newOpenedBidFlag ? 'cell' : 'inline'}
      selectionMode={!newOpenedBidFlag ? 'rowbox' : 'none'}
    />
  );
}

class ScoringElementTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      detailModalVisible: false, // 评分要素细项弹框
      elementRecord: {}, // 评分要素
      lovBringOutFlag: {}, // lov带出flag
      changeLovFlag: {}, // 真实数据，是否改变lov
      remarkVisible: false, // 评分细则modal visible
      remarkRecord: {}, // 评分行数据
      currentLineRecord: {}, // 当前编辑行record
      code: {}, // 值集code
      isLoading: false, // 保存按钮loading
    };
  }

  ExpertModalDS = new DataSet(
    this.props.remote
      ? this.props.remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_ASSIGN_EXPERT_MODAL_DS',
          ExpertModalDS(this.props.custKey),
          { header: this.props.header, bidFlag: this.props.bidFlag }
        )
      : ExpertModalDS(this.props?.custKey)
  );

  componentDidMount() {
    this.initLovCode();
  }

  async initLovCode() {
    const code = {
      benchmarkPriceMethod: 'SSRC.BENCHMARK_PRICE_METHOD', // 基准价计算方法
      formula: 'SSRC.INDIC_FORMULA', // 价格计算公式
    };

    try {
      let result = await queryMapIdpValue(code);
      result = getResponse(result);
      if (!result) {
        return;
      }
      this.setState({
        code: result || {},
      });
    } catch (e) {
      throw e;
    }
  }

  initExpertAssignDS(record = {}) {
    const { organizationId, header = {} } = this.props;
    const { adjustRecordId = null, rfxHeaderAdjustId: sourceHeaderAdjustId = null } = header;

    const evaluateIndicAdjustId = record.get('evaluateIndicAdjustId');
    const evaluateIndicId = record.get('evaluateIndicId');
    const team = record.get('team');
    const sourceHeaderId = record.get('sourceHeaderId');
    if (!evaluateIndicAdjustId) {
      return;
    }
    this.ExpertModalDS.setQueryParameter('commonData', {
      organizationId,
      evaluateIndicAdjustId,
      evaluateIndicCategory: team,
      sourceHeaderId,
      adjustRecordId,
      sourceHeaderAdjustId,
      evaluateIndicId,
    });
  }

  // 分配专家modal
  @Bind()
  openAssignExpertModal(record = {}) {
    const { customizeTable, header, organizationId, custKey, newOpenedBidFlag } = this.props;
    this.initExpertAssignDS(record);
    this.ExpertModalDS.query();

    const Props = {
      customizeTable,
      organizationId,
      header,
      custKey,
      newOpenedBidFlag,
      expertModalDS: this.ExpertModalDS,
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      key: modalKey,
      drawer: true,
      title: newOpenedBidFlag
        ? intl.get(`ssrc.inquiryHall.view.message.title.viewExpert`).d('查看专家')
        : intl.get(`ssrc.inquiryHall.model.inquiryHall.assignExpert`).d('分配专家'),
      children: <ExpertAssignModal {...Props} />,
      style: { width: '742px' },
      onOk: () => (newOpenedBidFlag ? true : this.saveScoringAssignExpert()),
      onCancel: () => {},
    });
  }

  /**
   * 评分要素-专家分配 保存
   */
  @Bind()
  async saveScoringAssignExpert() {
    const { organizationId, ds, custKey } = this.props;
    let data = this.ExpertModalDS.toData();

    data = data.map((item) => {
      return {
        ...item,
      };
    });

    await assignExpertScoreDetailOfQuotationController({
      data,
      organizationId,
      queryParams: {
        customizeUnitCode: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN`,
      },
    }).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        notification.success();
        ds.query();
      }
    });
    Modal.destroyAll();
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

  // 启用评分要素细项
  @Bind()
  changeDetailEnabledFlag(checked, record) {
    record.set('detailEnabledFlag', checked ? 1 : 0);
    this.forceUpdate();
  }

  // 打开评分要素细项modal
  @Bind()
  async handleDetailModalShow(records = {}) {
    const { sourceHeaderId = null } = this.props;
    if (!sourceHeaderId) {
      return;
    }

    const { lovBringOutFlag, changeLovFlag } = this.state;
    const lineData = records.toData() || {};
    const { evaluateIndicAdjustFields = null } = lineData;

    const { evaluateIndicAdjustId, lovChangeFlag } = lineData;
    const id = evaluateIndicAdjustId || uuidv4();
    const enableFlag = await records.validate();

    if (enableFlag) {
      this.setState({
        detailModalVisible: true,
        elementRecord: {
          ...lineData,
          evaluateIndicAdjustFields,
          evaluateIndicAdjustId: id,
          _status: evaluateIndicAdjustId ? 'update' : 'create',
        },
        lovBringOutFlag: {
          ...lovBringOutFlag,
          [evaluateIndicAdjustId]: !!evaluateIndicAdjustId,
        },
        changeLovFlag: {
          ...changeLovFlag,
          [id]: lovChangeFlag,
        },
      });
    } else {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.view.notification.openDetail.fails`)
          .d('存在校验不通过，打开评分要素细项弹框失败！'),
      });
    }
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
      currentLineRecord: null,
      remarkRecord: {},
    });
  }

  toolTipRender({ text }) {
    return <Tooltip title={text}>{text}</Tooltip>;
  }

  renderScoreFormulaRender(evaluateIndicDetail) {
    const { remote, header } = this.props;
    let value;
    const scoreFormula = (params = {}) => {
      const { customizeRenderFn = noop, ...otherParams } = params || {};
      value = customizeRenderFn(otherParams);
    };
    const eventProps = {
      header,
      evaluateIndicDetail,
      scoreFormula,
      customizeRenderFn: scoreFormulaRender,
    };
    if (remote?.event) {
      remote.event.fireEvent('handleScoreFormulaRender', eventProps);
      return value;
    } else {
      return scoreFormulaRender(evaluateIndicDetail);
    }
  }

  // 保存Modal信息
  @Bind()
  onChangeRemarkModal(record = {}) {
    const { remote } = this.props;
    const {
      code: { benchmarkPriceMethod = [], formula = [] },
      currentLineRecord,
    } = this.state;
    const { evaluateIndicDetail = {} } = record || {};

    const priceDesc = `${intl
      .get('ssrc.score.model.score.bPEmethod')
      .d('基准价计算方法')}:${valueMapMeaning(
      benchmarkPriceMethod,
      evaluateIndicDetail.benchmarkPriceMethod
    )}, ${
      evaluateIndicDetail.benchmarkPriceMethod === 'LOWEST_PRICE'
        ? `${intl.get('ssrc.score.model.score.basePrice').d('基准价=有效最低价')}`
        : evaluateIndicDetail.benchmarkPriceMethod === 'HIGH_PRICE'
        ? intl.get('ssrc.score.model.score.baseHighPrice').d('基准价=有效最高价')
        : `${intl.get('ssrc.score.model.score.aVTP').d('基准价=有效投标价格平均值*')}${
            evaluateIndicDetail?.benchmarkPriceFactor ||
            evaluateIndicDetail?.benchmarkPriceFactor === 0
              ? evaluateIndicDetail?.benchmarkPriceFactor
              : 100
          }%`
    }`;
    const benchmarkPriceDetail = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_BENCH_MARK_PRICE_DESC',
          priceDesc,
          {
            record,
            valueMapMeaning,
            evaluateIndicDetail,
            benchmarkPriceMethod,
          }
        )
      : priceDesc;
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

    // 价格计算公式描述
    const calculateRuleDesc = `${intl
      .get('ssrc.score.model.score.priceCFormula')
      .d('价格计算公式')}:${valueMapMeaning(formula, evaluateIndicDetail.formula)}`;
    const formulaDetail = `${calculateRuleDesc}, ${
      this.renderScoreFormulaRender(evaluateIndicDetail) || ''
    }`;

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
    const calcMinScoreFlag = record.scoreType === 'PRICE' && maxScore;
    const _minScore = calcMinScoreFlag
      ? (evaluateIndicDetail.lowestScore * maxScore) / 100
      : record.minScore || null;
    const minScore = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_REMARK_MODAL_LINE_MIN_SCORE',
          _minScore,
          { calcMinScoreFlag, evaluateIndicDetail }
        )
      : _minScore;
    currentLineRecord.set('indicateRemark', indicateRemark);
    currentLineRecord.set('minScore', minScore);
    currentLineRecord.set('evaluateIndicDetail', evaluateIndicDetail);

    this.forceUpdate();
  }

  /**
   * 如果维护了评细则，当最高分改变的时候实时计算
   * @param {Object} record
   * @param {Number} value
   */
  @Bind()
  maxScoreChange(record, value) {
    const { remote, bidFlag = false } = this.props;
    record.set('maxScore', value);
    const recordData = record.toData() || {};
    const { calculateType = null, evaluateIndicDetail = {} } = recordData;
    if (calculateType === 'AUTO') {
      const expressions = !isEmpty(evaluateIndicDetail);

      const flag = remote
        ? remote.process(
            'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_MAX_SCORE_CHANGE_FLAG',
            expressions,
            {
              bidFlag,
              record,
            }
          )
        : expressions;

      const remarkRecord = {
        ...recordData,
        evaluateIndicDetail: { ...evaluateIndicDetail, indicId: undefined },
      };
      this.setState(
        {
          currentLineRecord: record,
          remarkRecord,
        },
        flag ? () => this.onChangeRemarkModal(remarkRecord) : () => {}
      );
    }
  }

  // 评分细则改变输入
  @Bind()
  handleIndicateRemarkChange(values = null, record = {}) {
    record.set('indicateRemark', values);
  }

  // record field of adjust
  recordAdjustField = ({ value = null, name = '', record = {}, fields = [] }) => {
    if (record.status === 'add') {
      return;
    }

    const oldFields = record.get('evaluateIndicAdjustFields') || '';
    let newFields = oldFields.split(',').filter(Boolean);

    fields.forEach((field) => {
      const currentIndex = oldFields.indexOf(field);
      const currentValue = isObject(value) ? value[name] : value;
      const pristineValue = (record.get('sourceEvaluateIndic') || {})[name];
      // eslint-disable-next-line eqeqeq
      if (currentIndex > -1 && currentValue == pristineValue) {
        newFields.splice(currentIndex, 1);
      } else if (!newFields.includes(field)) {
        newFields.push(field);
      }
    });

    newFields = newFields.join(',');
    record.set('evaluateIndicAdjustFields', newFields);
  };

  // 评分方式
  renderCalculateType = () => {
    const { type = null } = this.props;

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

  // 要素类型变化回调
  handleSelectIndicateType = (record, value, oldValue) => {
    const { header = {} } = this.props;
    const { templateScoreType = null } = header || {};
    const clearObj = {
      calculateType: null,
      scoreType: null,
      weight: null,
      minScore: null,
      maxScore: null,
      detailEnabledFlag: 0,
      indicateRemark: null,
      evaluateIndicDetail: null,
    };
    if (value === 'PASS') {
      if (oldValue === 'SCORE') {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl
            .get('ssrc.inquiryHall.model.inquiryHall.passConfirm')
            .d('要素类型由打分制改为通过制后，系统将自动清空要素细项，是否继续？'),
          onOk: () => {
            const {
              calculateType,
              scoreType,
              weight,
              minScore,
              maxScore,
              detailEnabledFlag,
              indicateRemark,
              evaluateIndicDetail,
            } = record.get([
              'calculateType',
              'scoreType',
              'weight',
              'minScore',
              'maxScore',
              'detailEnabledFlag',
              'indicateRemark',
              'evaluateIndicDetail',
            ]);
            record.setState('scoreObj', {
              scoreType,
              weight,
              minScore,
              maxScore,
              calculateType,
              indicateRemark,
              detailEnabledFlag,
              evaluateIndicDetail,
            });
            this.setRecord(record, clearObj);
          },
          onCancel: () => {
            record.set('indicateType', 'SCORE');
          },
        });
      } else {
        this.setRecord(record, clearObj);
      }
    }

    if (value === 'SCORE' && oldValue === 'PASS') {
      const scoreObj = record.getState('scoreObj') || {};
      record.set('indicateRemark', null);
      this.setRecord(record, {
        ...scoreObj,
        minScore: ['SCORE', 'SCORE_NEW'].includes(templateScoreType)
          ? scoreObj.minScore
          : scoreObj.minScore ?? 0,
        maxScore: ['SCORE', 'SCORE_NEW'].includes(templateScoreType)
          ? scoreObj.maxScore
          : scoreObj.maxScore ?? 100,
      });
    }
  };

  // 设置record
  setRecord = (record, obj) => {
    Object.entries(obj).forEach(([key, value]) => {
      record.set(key, value);
    });
  };

  // table columns
  getColumns() {
    const {
      sourceHeaderId,
      header = {},
      type = null,
      isSelectPass = false,
      customizeTable,
      custKey,
      remote,
      bidFlag = false,
    } = this.props;
    const {
      templateScoreType = null,
      adjustRecordId = null,
      rfxHeaderAdjustId: sourceHeaderAdjustId = null,
      existSecondOpenBidFlag,
      rfxStatus,
      allOpenedFlag,
    } = header || {};
    const newOpenedBidFlag =
      rfxStatus === 'OPEN_BID_PENDING' && existSecondOpenBidFlag && allOpenedFlag;

    const columns = [
      {
        name: 'indicateLov',
        width: 150,
        editor: true,
        renderer: (props) => historyRenderPure(props, 'sourceEvaluateIndic', 'indicateCode'),
      },
      {
        name: 'indicateName',
        // width: 200,
        editor: true,
        renderer: (props) => historyRenderPure(props, 'sourceEvaluateIndic', 'indicateName'),
      },
      {
        name: 'indicateType',
        width: 150,
        renderer: ({ record }) => (
          <ComponentDiffRender record={record} historyDTO="sourceEvaluateIndic" name="indicateType">
            <Select
              record={record}
              clearButton={false}
              style={{ width: '100%' }}
              name="indicateType"
              optionsFilter={(curRecord) => {
                const currentOptionValue = curRecord.get('value') || null;

                return (!isSelectPass && currentOptionValue !== 'PASS') || isSelectPass;
              }}
              onChange={(value, oldValue) => this.handleSelectIndicateType(record, value, oldValue)}
            />
          </ComponentDiffRender>
        ),
      },
      {
        name: 'calculateType',
        width: 120,
        // editor: this.renderCalculateType,
        renderer: (props) =>
          historyRenderPure(props, 'sourceEvaluateIndic', 'calculateType', {
            optionsFilter: (curRecord = {}) => {
              const currentOptionValue = curRecord.get('value') || null;

              const flag =
                (type === 'TECHNOLOGY' && currentOptionValue !== 'AUTO') || type !== 'TECHNOLOGY';

              return remote
                ? remote.process('SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_SCORE_TABLE', flag, {
                    record: props.record,
                    bidFlag,
                    currentOptionValue,
                    header,
                  })
                : flag;
            },
          }),
      },
      {
        name: 'scoreType',
        width: 200,
        renderer: (props) => historyRenderPure(props, 'sourceEvaluateIndic', 'scoreType'),
      },
      {
        name: 'indicateRemark',
        width: 200,
        renderer: (data = {}) => {
          const { value = null, record = {} } = data;
          const calculateType = record.get('calculateType');
          const scoreType = record.get('scoreType');

          const renderRemarkDom = () => {
            return calculateType === 'AUTO' && scoreType === 'PRICE' ? (
              <TextField
                value={value}
                readOnly
                required
                name="indicateRemark"
                addonAfter={
                  <Icon
                    type="search"
                    onClick={() => (newOpenedBidFlag ? false : this.handleIndicateRemark(record))}
                    style={{ cursor: 'pointer' }}
                  />
                }
                record={record}
              />
            ) : (
              <ComponentDiffRender
                record={record}
                historyDTO="sourceEvaluateIndic"
                name="indicateRemark"
                // poverContent={value}
              >
                <TextArea
                  name="indicateRemark"
                  resize="both"
                  autoSize={{ maxRows: 5 }}
                  defaultValue={value}
                  value={value}
                  record={record}
                  disabled={newOpenedBidFlag}
                  onChange={(values) => this.handleIndicateRemarkChange(values, record)}
                />
              </ComponentDiffRender>
            );
          };

          if (!remote) return renderRemarkDom();
          return remote.render(
            'SSRC_QUOTATION_CONTROLLER_UPDATE_RENDER_ELEMENT_REMARK',
            renderRemarkDom(),
            {
              record,
              bidFlag,
              value,
            }
          );
        },
      },
      templateScoreType === 'WEIGHT'
        ? {
            name: 'weight',
            width: 120,
            editor: true,
            renderer: (props) => historyRenderPure(props, 'sourceEvaluateIndic', 'weight'),
          }
        : null,
      ['SCORE', 'SCORE_NEW'].includes(templateScoreType)
        ? {
            name: 'minScore',
            width: 100,
            editor: true,
            align: 'left',
            renderer: (props) => historyRenderPure(props, 'sourceEvaluateIndic', 'minScore'),
          }
        : null,
      ['SCORE', 'SCORE_NEW'].includes(templateScoreType)
        ? {
            name: 'maxScore',
            width: 100,
            align: 'left',
            renderer: ({ record }) => {
              return (
                <ComponentDiffRender
                  record={record}
                  historyDTO="sourceEvaluateIndic"
                  name="maxScore"
                >
                  <NumberField
                    name="maxScore"
                    record={record}
                    onChange={(value) => this.maxScoreChange(record, value)}
                  />
                </ComponentDiffRender>
              );
            },
          }
        : null,
      {
        name: 'detailEnabledFlag',
        width: 160,
        align: 'left',
        renderer: ({ value, record }) => {
          return (
            <ScoreDetailDoubleFields
              defaultChecked={value}
              value={value}
              name="detailEnabledFlag"
              disabled={
                newOpenedBidFlag ||
                !sourceHeaderId ||
                record.get('calculateType') === 'AUTO' ||
                record.get('indicateType') === 'PASS'
              }
              checked={value}
              onChange={(checked) => this.changeDetailEnabledFlag(checked, record)}
              style={{ marginRight: '4px' }}
            >
              {value && sourceHeaderId ? (
                <a onClick={() => this.handleDetailModalShow(record)}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.elements.detail`).d('评分要素细项')}
                </a>
              ) : null}
            </ScoreDetailDoubleFields>
          );
        },
      },
      {
        name: 'expertDistribute',
        width: 150,
        renderer: ({ record = {} }) => {
          const evaluateIndicAdjustId = record.get('evaluateIndicAdjustId');
          if (!evaluateIndicAdjustId || sourceHeaderId === 'null' || !sourceHeaderId) {
            return;
          }
          return (
            <a onClick={() => this.openAssignExpertModal(record)}>
              {newOpenedBidFlag
                ? intl.get(`ssrc.inquiryHall.view.message.button.view`).d('查看')
                : intl.get(`ssrc.inquiryHall.view.message.button.distribution`).d('分配')}
            </a>
          );
        },
      },
      {
        name: 'assignedExperts',
        width: 400,
        renderer: ({ record, name }) => {
          if (sourceHeaderId === 'null' || !sourceHeaderId) {
            return;
          }

          return (
            <AssignExperts
              fieldName={name}
              record={record}
              customizeTable={customizeTable}
              customizeCode={`SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_V2`}
              commonProps={{
                sourceHeaderId,
                adjustRecordId,
                sourceHeaderAdjustId,
                evaluateIndicAdjustId: record.get('evaluateIndicAdjustId'),
                evaluateIndicCategory: record.get('team'),
                customizeUnitCode: `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_V2`,
              }}
            />
          );
        },
      },
    ].filter(Boolean);

    return columns;
  }

  // 评分要素新建行
  @Bind()
  onCreateScoringElements(type = null) {
    const {
      organizationId,
      header = {},
      ds = {},
      sourceHeaderId = null,
      businessWeight = 50,
      technologyWeight = 50,
    } = this.props;
    const {
      templateId: sourceTemplateId = null,
      templateScoreType,
      openBidOrder,
      adjustRecordId = null,
      rfxHeaderAdjustId: sourceHeaderAdjustId = null,
    } = header;

    const evaluateIndicAdjustFields = [
      'indicateName',
      'indicateId',
      'indicateCode',
      'indicateType',
      'minScore',
      'maxScore',
      'mustApprovedFlag',
      'scoreType',
      'weight',
      'calculateType',
    ].join(',');
    const defaultData = {};
    let CurrentWeight = null;

    const getBusinessFirstLineWeight = (currentDS = {}) => {
      let weight = null;
      const data = currentDS.toData();
      const firstLineData = data.filter((item) => item._status !== 'create')[0] || {};

      if (isEmpty(firstLineData)) {
        weight = businessWeight;
      } else {
        const { businessWeight: lineBusinessWeight = null } = firstLineData;
        weight = lineBusinessWeight ?? businessWeight;
      }
      return weight;
    };

    const getTechnolofyFirstLineWeight = (currentDS = {}) => {
      let weight = null;
      const data = currentDS.toData();
      const firstLineData = data.filter((item) => item._status !== 'create')[0] || {};

      if (isEmpty(firstLineData)) {
        weight = technologyWeight;
      } else {
        const { technologyWeight: lineTechnologyWeight = null } = firstLineData;
        weight = lineTechnologyWeight ?? technologyWeight;
      }
      return weight;
    };

    if (type === 'BUSINESS') {
      CurrentWeight = getBusinessFirstLineWeight(ds);
      defaultData.businessWeight = CurrentWeight;
      defaultData.technologyWeight = null;
    } else if (type === 'TECHNOLOGY') {
      CurrentWeight = getTechnolofyFirstLineWeight(ds);
      defaultData.technologyWeight = CurrentWeight;
      defaultData.businessWeight = null;
    }

    let line = {
      evaluateIndicAdjustId: null,
      tenantId: organizationId,
      indicateId: null,
      indicateCode: null,
      indicateName: null,
      indicateType: null,
      indicateRemark: null,
      weight: ['SCORE', 'SCORE_NEW'].includes(templateScoreType) ? 100 : null,
      sourceFrom: 'RFX',
      openBidOrder: openBidOrder || 'BUSINESS_FIRST',
      organizationId,
      expertCategory: type,
      sourceHeaderId,
      indicStatus: 'SUBMITTED', // 查询提交后的评分要素数据
      team: type,
      detailEnabledFlag: 0,
      sourceTemplateId,
      evaluateIndicAdjustFields,
      adjustRecordId,
      sourceHeaderAdjustId,
      isNew: true,
      _status: 'create',
      createLineKey: uuidv4(), // 新建行唯一id 用来标记新建行
    };
    line = { ...line, ...defaultData };
    ds.create(line, 0);
    this.forceUpdate();
  }

  // 评分要素校验和数据整合
  validationAndIntegrationScoreData = async () => {
    const {
      organizationId,
      header = {},
      custKey,
      businessScoringElementDS = {},
      technologyScoringElementDS = {},
      allScoringElementDS = {},
      priceScoringElementDS = {},
      remote,
      bidFlag,
    } = this.props;
    const {
      adjustRecordId = null,
      rfxHeaderAdjustId: sourceHeaderAdjustId = null,
      rfxHeaderId: sourceHeaderId = null,
      bidRuleType = null,
      templateId: sourceTemplateId = null,
    } = header || {};

    if (!bidRuleType || !sourceHeaderId || !organizationId) {
      return;
    }

    let validateFlag = false;
    let newParams = [];
    let customizeUnitCode = '';

    if (bidRuleType === 'NONE') {
      validateFlag = await allScoringElementDS.validate();
      newParams = allScoringElementDS.toData() || [];
      customizeUnitCode = `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_NONE,SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_V2`;
    }

    if (bidRuleType === 'DIFF') {
      const busiessValidateFlag = await businessScoringElementDS.validate();
      const technologyValidateFlag = await technologyScoringElementDS.validate();
      const priceValidateFlag = await priceScoringElementDS.validate(); // 协鑫价格要素校验，勿动！！！
      validateFlag = remote
        ? await remote.process(
            'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_VALIDATE',
            busiessValidateFlag && technologyValidateFlag,
            {
              header,
              bidFlag,
              priceValidateFlag,
              that: this,
            }
          )
        : busiessValidateFlag && technologyValidateFlag;

      const businessData = businessScoringElementDS.toData() || [];
      const techData = technologyScoringElementDS.toData() || [];
      newParams = remote
        ? remote.process(
            'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_DATA_SOURCE',
            [...businessData, ...techData],
            {
              header,
              bidFlag,
              priceScoringElementDS,
              that: this,
            }
          )
        : [...businessData, ...techData];

      customizeUnitCode = `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_TECHNOLOFY,SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_NONE,SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN_V2`;
    }

    if (!validateFlag || !newParams.length) {
      return {};
    }

    newParams = newParams.map((item) => {
      const { evaluateIndicDetail = null } = item || {};

      return {
        ...item,
        evaluateIndicDetail: !evaluateIndicDetail
          ? null
          : { ...evaluateIndicDetail, adjustRecordId, sourceHeaderAdjustId },
        organizationId,
        tenantId: organizationId,
        sourceFrom: 'RFX',
        sourceHeaderId,
        sourceTemplateId,
        sourceHeaderAdjustId,
        adjustRecordId,
      };
    });

    return {
      validateFlag,
      data: newParams,
      queryParams: {
        customizeUnitCode,
        organizationId,
      },
    };
  };

  /**
   * 保存评分要素
   * 区分商务技术 - 两个表格保存
   *
   */
  @Bind()
  @Debounce(500)
  async onSaveScoringElements() {
    const { fetchScoreDetail = () => {} } = this.props;
    const { validateFlag = false, data = [], queryParams = {} } =
      (await this.validationAndIntegrationScoreData()) || {};
    if (!validateFlag || !data.length) {
      return {};
    }

    this.setState({ isLoading: true });
    updateScoreDetailOfQuotationController({
      otherParams: data,
      ...queryParams,
    })
      .then((res) => {
        const result = getResponse(res);
        this.setState({ isLoading: false });
        if (!result) {
          return;
        }
        notification.success();
        fetchScoreDetail();
      })
      .catch(() => {
        this.setState({ isLoading: false });
      });
  }

  // 评分要素删除
  @Bind()
  async deleteScoreElement(ds = {}) {
    const { fetchScoreDetail = () => {} } = this.props;
    const selecteds = ds.selected || [];
    if (isEmpty(selecteds)) {
      return;
    }
    const remoteDelete = selecteds.filter((item) => (item.data || {}).evaluateIndicAdjustId);
    const localDelete = selecteds.filter((item) => !(item.data || {}).evaluateIndicAdjustId);

    if (!isEmpty(remoteDelete)) {
      try {
        await ds.delete(remoteDelete);
      } catch (e) {
        throw e;
      }
      ds.unSelectAll();
      fetchScoreDetail();
    } else {
      ds.remove(localDelete);
    }
  }

  // 【屈臣氏】二开寻源过程控制-询价要求-评分要素-评分要素细项弹框
  @Bind()
  renderScoreEleDetailModal(detailModalProps) {
    return <ScoreEleDetailModal {...detailModalProps} />;
  }

  /**
   * 评分细则弹框
   * @protected （东方电缆，水滴二开，绝味重写）禁止修改、删除此方法名
   */
  @Bind()
  renderRemarkModal(remarkModalProps) {
    return <RemarkModal {...remarkModalProps} />;
  }

  @Bind()
  getButtons() {
    const {
      ds = {},
      sourceHeaderId,
      type = null,
      importProps = {},
      remote,
      header,
      bidFlag,
      newOpenedBidFlag,
    } = this.props;
    const { isLoading = false } = this.state;
    const buttons = !newOpenedBidFlag
      ? [
          {
            name: 'save',
            btnType: 'c7n-pro',
            btnProps: {
              icon: 'save',
              funcType: 'flat',
              loading: isLoading,
              onClick: this.onSaveScoringElements,
              disabled: !sourceHeaderId,
            },
            child: intl.get('hzero.common.button.save').d('保存'),
          },
          {
            name: 'add',
            btnType: 'c7n-pro',
            btnProps: {
              icon: 'add',
              funcType: 'flat',
              onClick: () => {
                this.onCreateScoringElements(type);
              },
            },
            child: intl.get('hzero.common.btn.add').d('新增'),
          },
          {
            name: 'delete',
            btnType: 'c7n-pro',
            btnComp: TooltipButtonPro,
            child: intl.get('hzero.common.btn.delete').d('删除'),
            btnProps: {
              icon: 'delete',
              funcType: 'flat',
              disabled: isEmpty(ds.selected),
              help: intl
                .get('ssrc.common.view.message.score-indicate-line.select.tip')
                .d('请先勾选评分要素'),
              onClick: () => {
                this.deleteScoreElement(ds);
              },
            },
          },
          {
            name: 'batchImportNew',
            btnComp: CommonImportNew,
            btnProps: {
              name: 'batchImportNew',
              ...importProps,
            },
          },
        ]
      : [];
    const remoteButtons = remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_SCORE_ELEMENT_TABLE_BUTTONS',
          buttons,
          { header, bidFlag }
        )
      : buttons;
    return remoteButtons;
  }

  render() {
    const {
      ds = {},
      bidFlag,
      custKey,
      sourceHeaderId,
      organizationId,
      type = null,
      customizeTable,
      newOpenedBidFlag,
      custLoading,
      header = {},
      fetchScoreDetail = () => {},
      remote,
      customizeBtnGroup,
    } = this.props;
    const {
      elementRecord = {},
      detailModalVisible = false,
      lovBringOutFlag = {},
      changeLovFlag = {},
      remarkVisible = false,
      remarkRecord = {},
      code = {},
    } = this.state;

    const { benchmarkPriceMethod = [], formula = [] } = code || {};

    console.log('newOpenedBidFlag11', newOpenedBidFlag);
    const detailModalProps = {
      remote,
      header,
      custKey,
      organizationId,
      lovBringOutFlag,
      changeLovFlag,
      elementRecord,
      sourceHeaderId,
      readonly: newOpenedBidFlag,
      visible: detailModalVisible,
      onHideModal: this.handleDetailModalHide,
      fetchScoring: fetchScoreDetail,
      closable: false, // 是否显示右上角的关闭按钮
    };

    const remarkModalProps = {
      remote,
      header,
      organizationId,
      visible: remarkVisible,
      record: remarkRecord,
      benchmarkPriceMethod,
      formula,
      onHideModal: this.closeRemarkModal,
      onChangeRemarkModal: this.onChangeRemarkModal,
    };

    return (
      <React.Fragment>
        <div className={styles['score-table']}>
          {customizeBtnGroup(
            {
              code:
                type === 'TECHNOLOGY'
                  ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_INDICS_TECHNOLOGY_BTN`
                  : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_INDICS_BTN`,
              pro: true,
            },
            <DynamicButtons buttons={this.getButtons()} />
          )}

          {customizeTable(
            {
              code:
                type === 'TECHNOLOGY'
                  ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_TECHNOLOFY`
                  : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.SCORE_NONE`,
            },
            <Table
              bordered
              custLoading={custLoading}
              // buttons={TableButtons}
              dataSet={ds}
              rowKey="evaluateIndicAdjustId"
              columns={this.getColumns()}
              editMode={!newOpenedBidFlag ? 'cell' : 'inline'}
              selectionMode={!newOpenedBidFlag ? 'rowbox' : 'none'}
              style={{
                maxHeight: '660px',
              }}
            />
          )}
        </div>
        {detailModalVisible &&
          (bidFlag ? (
            <BidScoreEleDetailModal {...detailModalProps} />
          ) : (
            this.renderScoreEleDetailModal(detailModalProps)
          ))}
        {remarkVisible && this.renderRemarkModal(remarkModalProps)}
      </React.Fragment>
    );
  }
}

export default observer(ScoringElementTable);
