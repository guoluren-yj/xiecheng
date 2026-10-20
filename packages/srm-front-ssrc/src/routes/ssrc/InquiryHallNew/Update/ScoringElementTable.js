// 评分要素table

import React, { PureComponent } from 'react';
import {
  DataSet,
  Modal,
  Button,
  TextField,
  TextArea,
  Table,
  Icon,
  Select,
  NumberField,
} from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, noop } from 'lodash';
import uuidv4 from 'uuid/v4';

import intl from 'utils/intl';
import notification from 'utils/notification';
import CommonImportNew from 'hzero-front/lib/components/Import';

import { saveEvaluateIndicAssign } from '@/services/bidHallService';

import { valueMapMeaning } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import ScoreEleDetailModal, {
  BidScoreEleDetailModal,
} from '@/routes/ssrc/InquiryHall/Update/ScoreEleDetailModal';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import RemarkModal, { BidRemarkModal } from '@/routes/ssrc/InquiryHall/Update/RemarkModal';
import { scoreFormulaRender } from '@/utils/renderer';
import AssignExperts from '../../components/AssignExperts';
import { ScoreDetailDoubleFields } from './Components';
import { ExpertModalDS } from './ScoringElementDS';
import './index.less';

function ExpertAssignModal(props) {
  const { expertModalDS, customizeTable, rfx = {}, remote } = props || {};
  const { sourceKey } = rfx;
  const expertColumns = [
    {
      name: 'loginName',
      width: 180,
    },
    {
      name: 'expertName',
    },
    {
      name: 'assignFlag',
      width: 120,
      editor: true,
    },
  ];

  return (
    <div>
      {remote &&
        remote.render('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SCORE_EXPERT_ASSIGN_MODAL', '', {
          ...props,
        })}
      {customizeTable(
        {
          code: `SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN`,
        },
        <Table border dataSet={expertModalDS} columns={expertColumns} rowKey="evaluateExpertId" />
      )}
    </div>
  );
}

export default class ScoringElementTable extends PureComponent {
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
    };
  }

  ExpertModalDS = new DataSet(ExpertModalDS());

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
    const { organizationId, rfx = {} } = this.props;
    const { sourceKey } = rfx;

    const evaluateIndicId = record.get('evaluateIndicId');
    const team = record.get('team');
    const sourceHeaderId = record.get('sourceHeaderId');
    if (!evaluateIndicId) {
      return;
    }
    this.ExpertModalDS.setQueryParameter('commonProps', {
      organizationId,
      evaluateIndicId,
      evaluateIndicCategory: team,
      sourceHeaderId,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN`,
    });
  }

  // 分配专家modal
  @Bind()
  async openAssignExpertModal(record = {}) {
    const { customizeTable, rfx, remote } = this.props;
    this.initExpertAssignDS(record);
    await this.ExpertModalDS.query(); // 避免在弹框取不到DS数据
    const Props = {
      customizeTable,
      rfx,
      expertModalDS: this.ExpertModalDS,
      remote,
    };
    const modalKey = Modal.key();

    Modal.open({
      destroyOnClose: true,
      key: modalKey,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.assignExpert`).d('分配专家'),
      children: <ExpertAssignModal {...Props} />,
      style: { width: '800px' },
      onOk: () => this.saveScoringAssignExpert(record),
      onCancel: () => {},
    });
  }

  /**
   * 评分要素-专家分配 保存
   *
   * @memberof Update
   * @protected 九坤二开 不要加@Bind()
   */
  async saveScoringAssignExpert(record) {
    const { organizationId, rfx = {}, operationType } = this.props;
    const { sourceKey } = rfx;
    record.set('expertDistribute', 1);
    const newParams = this.ExpertModalDS.toData();
    await saveEvaluateIndicAssign({
      newParams,
      organizationId,
      customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN`,
      operationType,
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        notification.success();
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
    const { evaluateIndicId, lovChangeFlag } = lineData;
    const id = evaluateIndicId || uuidv4();
    const enableFlag = await records.validate();

    if (enableFlag) {
      records.set('detailEnabledFlag', 1);
      this.setState({
        detailModalVisible: true,
        elementRecord: {
          ...lineData,
          evaluateIndicId: id,
          _status: evaluateIndicId ? 'update' : 'create',
        },
        lovBringOutFlag: {
          ...lovBringOutFlag,
          [evaluateIndicId]: !!evaluateIndicId,
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
    const { remote, rfx = {} } = this.props;
    let value;
    const scoreFormula = (params = {}) => {
      const { customizeRenderFn = noop, ...otherParams } = params || {};
      value = customizeRenderFn(otherParams);
    };
    const eventProps = {
      header: rfx,
      evaluateIndicDetail,
      customizeRenderFn: scoreFormulaRender,
      scoreFormula,
    };
    if (remote?.event) {
      remote.event.fireEvent('handleScoreFormulaRender', eventProps);
      return value;
    } else {
      return scoreFormulaRender(evaluateIndicDetail);
    }
  }

  /** 保存Modal信息
   *  此方法被 [绝味] 重写
   * @protected
   */
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
      ? remote.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_BENCH_MARK_PRICE_DESC', priceDesc, {
          record,
          valueMapMeaning,
          evaluateIndicDetail,
          benchmarkPriceMethod,
        })
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
          'SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_REMARK_MODAL_LINE_MIN_SCORE',
          _minScore,
          { calcMinScoreFlag, evaluateIndicDetail }
        )
      : _minScore;

    currentLineRecord.set('indicateRemark', indicateRemark);
    currentLineRecord.set('minScore', minScore);
    currentLineRecord.set('evaluateIndicDetail', evaluateIndicDetail);
    if (remote?.event) {
      remote.event.fireEvent('remoteChangeRemarkModal', { record, _this: this });
    }
    this.forceUpdate();
  }

  /**
   * 如果维护了评细则，当最高分改变的时候实时计算
   * @param {Object} record
   * @param {Number} value
   */
  @Bind()
  maxScoreChange(record, value) {
    const { remote, rfx = {} } = this.props;
    record.set('maxScore', value);
    const recordData = record.toData() || {};
    const { calculateType = null, evaluateIndicDetail = {} } = recordData;
    if (calculateType === 'AUTO') {
      const remarkRecord = {
        ...recordData,
        evaluateIndicDetail: { ...evaluateIndicDetail, indicId: undefined },
      };

      const expressions = !isEmpty(evaluateIndicDetail);

      const flag = remote
        ? remote.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_MAX_SCORE_CHANGE_FLAG', expressions, {
            rfx,
            record,
          })
        : expressions;

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

  // 评分方式
  renderCalculateType = (record) => {
    const { type = null, remote, rfx = {}, current } = this.props;

    return (
      <Select
        name="calculateType"
        optionsFilter={(curRecord) => {
          const currentOptionValue = curRecord.get('value') || null;
          const flag =
            (type === 'TECHNOLOGY' && currentOptionValue !== 'AUTO') || type !== 'TECHNOLOGY';

          return remote
            ? remote.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_SCORE_TABLE', flag, {
                record,
                rfx,
                currentOptionValue,
                openBidOrder: current?.get('openBidOrder'),
                rfxInfoDsCurrent: current,
              })
            : flag;
        }}
      />
    );
  };

  // 要素类型变化回调
  handleSelectIndicateType = (record, value, oldValue) => {
    const { templateScoreType } = this.props;
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
            // record.set('calculateType', null);
            // record.set('scoreType', null);
            // record.set('weight', null);
            // record.set('minScore', null);
            // record.set('maxScore', null);
            // record.set('detailEnabledFlag', 0);
            // record.set('indicateRemark', null);
            // record.set('evaluateIndicDetail', null);
          },
          onCancel: () => {
            record.set('indicateType', 'SCORE');
          },
        });
      } else {
        this.setRecord(record, clearObj);
        // record.set('calculateType', null);
        // record.set('scoreType', null);
        // record.set('weight', null);
        // record.set('minScore', null);
        // record.set('maxScore', null);
        // record.set('detailEnabledFlag', 0);
        // record.set('indicateRemark', null);
        // record.set('evaluateIndicDetail', null);
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
      // record.set('calculateType', scoreObj.calculateType || null);
      // record.set('scoreType', scoreObj.scoreType || null);
      // record.set('weight', scoreObj.weight || null);
      // record.set('minScore', scoreObj.minScore || null);
      // record.set('maxScore', scoreObj.maxScore || null);
      // record.set('detailEnabledFlag', scoreObj.detailEnabledFlag || 0);
      // record.set('indicateRemark', scoreObj.indicateRemark || null);
      // record.set('evaluateIndicDetail', scoreObj.evaluateIndicDetail || null);
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
      templateScoreType,
      isSelectPass = false,
      customizeTable,
      rfx = {},
      remote,
    } = this.props;
    const { sourceKey, bidFlag } = rfx;

    const columns = [
      {
        name: 'indicateLov',
        width: 150,
        editor: true,
      },
      {
        name: 'indicateName',
        width: 200,
        editor: true,
        tooltip: 'overflow',
      },
      {
        name: 'indicateType',
        width: 150,
        editor: (record) => (
          <Select
            clearButton={false}
            name="indicateType"
            optionsFilter={(curRecord) => {
              const currentOptionValue = curRecord.get('value') || null;

              return (!isSelectPass && currentOptionValue !== 'PASS') || isSelectPass;
            }}
            onChange={(value, oldValue) => this.handleSelectIndicateType(record, value, oldValue)}
          />
        ),
      },
      {
        name: 'calculateType',
        width: 120,
        editor: this.renderCalculateType,
      },
      {
        name: 'scoreType',
        // width: 120,
        editor: true,
      },
      {
        name: 'indicateRemark',
        // className: 'indicateRemarkClass',
        width: 250,
        tooltip: 'none',
        renderer: ({ record, value }) => {
          const calculateType = record.get('calculateType');
          const scoreType = record.get('scoreType');
          const renderRemarkDom = () => {
            return calculateType === 'AUTO' && scoreType === 'PRICE' ? (
              <TextField
                style={{ height: 'inherit' }}
                value={value}
                readOnly
                required
                name="indicateRemark"
                addonAfter={
                  <Icon
                    type="search"
                    onClick={() => this.handleIndicateRemark(record)}
                    style={{ cursor: 'pointer' }}
                  />
                }
                record={record}
              />
            ) : (
              <TextArea
                className="indicateRemark-textArea"
                name="indicateRemark"
                resize="both"
                // autoSize={{ minRows: 1, maxRows: 3 }}
                rows={3}
                defaultValue={value}
                value={value}
                record={record}
                onChange={(values) => this.handleIndicateRemarkChange(values, record)}
              />
            );
          };

          if (!remote) return renderRemarkDom();
          return remote.render(
            'SSRC_INQUIRYHALLNEW_UPDATE_RENDER_ELEMENT_REMARK',
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
          }
        : null,
      ['SCORE', 'SCORE_NEW'].includes(templateScoreType)
        ? {
            name: 'minScore',
            width: 100,
            editor: true,
            align: 'left',
          }
        : null,
      ['SCORE', 'SCORE_NEW'].includes(templateScoreType)
        ? {
            name: 'maxScore',
            width: 100,
            align: 'left',
            editor: (record) => {
              return <NumberField onChange={(value) => this.maxScoreChange(record, value)} />;
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
              disabled={
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
          const evaluateIndicId = record.get('evaluateIndicId');
          if (!evaluateIndicId || sourceHeaderId === 'null' || !sourceHeaderId) {
            return;
          }
          return (
            <a onClick={() => this.openAssignExpertModal(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.distribution`).d('分配')}
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
              customizeCode={`SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN_V2`}
              commonProps={{
                sourceHeaderId,
                evaluateIndicId: record.get('evaluateIndicId'),
                evaluateIndicCategory: record.get('team'),
                customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN_V2`,
              }}
            />
          );
        },
      },
    ].filter(Boolean);

    return columns;
  }

  /**
   * 评分细则弹框
   * @protected （东方电缆，水滴二开）禁止修改、删除此方法名
   */
  @Bind()
  renderRemarkModal(remarkModalProps) {
    return <RemarkModal {...remarkModalProps} />;
  }

  /**
   *  此方法被 [绝味] 重写
   * @protected
   */
  @Bind()
  renderBidRemarkModal(remarkModalProps) {
    return <BidRemarkModal {...remarkModalProps} />;
  }

  render() {
    const {
      ds = {},
      sourceHeaderId,
      type = null,
      onSaveScoringElements,
      onCreateScoringElements,
      deleteScoreElement,
      customizeTable,
      custLoading,
      templateScoreType,
      onImportScoringElements,
      fetchScoring = noop,
      rfx = {},
      isScoringLoading = false,
      operationType,
      customizeBtnGroup,
      importProps = {},
      remote,
      bachDeleteDisabled,
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
    const { sourceKey = null, bidFlag } = rfx;
    const { benchmarkPriceMethod = [], formula = [] } = code || {};

    const detailModalProps = {
      templateScoreType,
      lovBringOutFlag,
      changeLovFlag,
      elementRecord,
      sourceHeaderId,
      visible: detailModalVisible,
      onHideModal: this.handleDetailModalHide,
      fetchScoring,
      rfx: { unitCodeSymbol: sourceKey === 'BID' ? 'BID_HALL' : 'INQUIRY_HALL', bidFlag },
      closable: false, // 是否显示右上角的关闭按钮
      operationType,
      detailFlag: false,
    };

    const remarkModalProps = {
      remote,
      sourceKey,
      visible: remarkVisible,
      record: remarkRecord,
      benchmarkPriceMethod,
      formula,
      onHideModal: this.closeRemarkModal,
      onChangeRemarkModal: this.onChangeRemarkModal,
    };

    const buttonCommonProps = {
      color: 'primary',
      funcType: 'flat',
    };

    const TableButtons = [
      <Button
        name="add"
        icon="playlist_add"
        onClick={() => onCreateScoringElements(type)}
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.button.increase').d('新增')}
      </Button>,
      <TooltipButtonPro
        onClick={() => deleteScoreElement(ds)}
        icon="delete_sweep"
        name="delete"
        disabled={bachDeleteDisabled}
        help={intl
          .get('ssrc.common.view.message.score-indicate-line.select.tip')
          .d('请先勾选评分要素')}
        {...buttonCommonProps}
      >
        {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
      </TooltipButtonPro>,
      <TooltipButtonPro
        name="save"
        icon="save"
        onClick={onSaveScoringElements}
        disabled={!sourceHeaderId}
        loading={isScoringLoading}
        help={intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据')}
        {...buttonCommonProps}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </TooltipButtonPro>,
      <CommonImportNew {...importProps} />,
      <TooltipButtonPro
        name="batchAdd"
        icon="playlist_add"
        disabled={!sourceHeaderId}
        onClick={() => onImportScoringElements(type)}
        help={intl.get('ssrc.common.view.message.document.save.tip').d('请先保存单据')}
        {...buttonCommonProps}
      >
        {intl.get('ssrc.inquiryHall.view.button.allCreate').d('批量创建')}
      </TooltipButtonPro>,
    ];

    return (
      <React.Fragment>
        {customizeBtnGroup(
          {
            code:
              type === 'TECHNOLOGY'
                ? `SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE_INDICS_TECHNOLOGY_BTN`
                : `SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE_INDICS_BTN`,
          },
          TableButtons
        )}
        <div style={{ maxHeight: '450px' }}>
          {customizeTable(
            {
              code:
                type === 'TECHNOLOGY'
                  ? `SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY`
                  : `SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS`,
            },
            <Table
              bordered
              custLoading={custLoading}
              // buttons={TableButtons}
              dataSet={ds}
              rowKey="evaluateIndicId"
              columns={this.getColumns()}
              rowHeight="auto"
              autoHeight={{ type: 'maxHeight', diff: 20 }}
              style={{
                marginTop: '4px',
                // maxHeight: '450px',
              }}
            />
          )}
        </div>
        {detailModalVisible && sourceKey === 'INQUIRY' && (
          <ScoreEleDetailModal {...detailModalProps} />
        )}
        {detailModalVisible && sourceKey === 'BID' && (
          <BidScoreEleDetailModal {...detailModalProps} />
        )}
        {remarkVisible && sourceKey === 'INQUIRY' && this.renderRemarkModal(remarkModalProps)}
        {remarkVisible && sourceKey === 'BID' && this.renderBidRemarkModal(remarkModalProps)}
      </React.Fragment>
    );
  }
}
