/**
 * QuestionForm - 流程配置
 * @date: 2018-11-23
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Select, Row, Col, Checkbox, Radio, Tooltip, InputNumber } from 'hzero-ui';
import intl from 'utils/intl';

const RadioGroup = Radio.Group;
const promptCode = 'ssrc.sourceTemplate';

export default class QuestionForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  setScoreValue = (e) => {
    const { form = {} } = this.props;
    const { setFieldsValue = () => {} } = form;

    if (e.target.checked === 1) {
      setFieldsValue({
        expertScoreType: 'NONE',
        expertExtractFlag: 0,
        expertReplyFlag: 0,
      });
    } else {
      setFieldsValue({
        openEliminateFlag: 0,
      });
    }
  };

  /**
   * setValue - onChange 子集信息
   * @description: 标书规则控制同步开标
   */
  setValue = (e) => {
    const { form } = this.props;
    if (e.target.value === 'NONE') {
      form.setFieldsValue({
        openBidOrder: 'SYNC',
      });
    } else {
      form.setFieldsValue({
        businessTechSee: null,
      });
    }
  };

  /**
   * setValue - onChange
   * @description: 寻源阶段控制专家评分和发起多轮报价规则以及标书规则的值
   */
  setDoubleValue = (e) => {
    const { form } = this.props;
    if (e === 'DOUBLE') {
      form.setFieldsValue({
        expertScoreType: 'ONLINE',
        bidRuleType: 'NONE',
        openBidOrder: 'SYNC',
        roundQuotationRule: 'CHECK',
        pretrialFlag: 0,
      });
    }
  };

  setQuotationRuleValue = (e) => {
    const { form, checkPriceUiIsNew, newScoreFlag = false } = this.props;
    if (e === 'NONE' && form.getFieldValue('roundQuotationRule') === 'SCORE') {
      form.setFieldsValue({
        roundQuotationRule: '',
      });
    }
    if (e === 'NONE') {
      form.setFieldsValue(
        Object.assign(
          {},
          {
            expertSource: null,
            templateScoreType: null,
            scoreIndicFlag: 0,
            noneExpertFlag: 0,
            noneIndicateFlag: 0,
            expertExtractFlag: 0,
            expertReplyFlag: 0,
            bidRuleType: 'NONE',
            openBidOrder: 'SYNC',
            initialReview: 'NONE',
          },
          checkPriceUiIsNew && {
            checkRecommendationStrategy: 'PRICE',
          }
        )
      );
    } else if (e === 'ONLINE') {
      form.setFieldsValue({
        expertSource: 'EXPERT_LIBRARY',
        templateScoreType: newScoreFlag ? 'SCORE_NEW' : 'SCORE',
      });
    }
  };

  questionForm = (type) => {
    let defaultTitle;
    let title;
    switch (type) {
      // 发布审批
      case 'releaseApproveType':
        defaultTitle = intl.get(`${promptCode}.model.template.releaseAT`).d('发布审批');
        title = intl
          .get(`${promptCode}.model.template.releaseATTitle`)
          .d(
            '用于配置寻源单据发布时的审批类型，包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）'
          );
        break;
      // 结果审批
      case 'resultApproveType':
        defaultTitle = intl.get(`${promptCode}.model.template.resultAT`).d('结果审批');
        title = intl
          .get(`${promptCode}.model.template.resultATTitle`)
          .d(
            '用于配置寻源结果提交时的审批类型，包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）'
          );
        break;
      case 'pretrialFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.newPretrialFlag`).d('寻源初审');
        title = intl
          .get(`${promptCode}.model.template.newPretrialFlagTitle`)
          .d(
            '用于配置寻源和竞价类别寻源是否经过初审这个流程。勾选则表示需要经过初审，不勾选则会跳过初审这个流程。'
          );
        break;
      // 资格审查
      case 'qualificationType':
        defaultTitle = intl.get(`${promptCode}.model.template.qualificationType`).d('资格审查');
        title = intl
          .get(`${promptCode}.model.template.qualiTTitle`)
          .d('用于配置寻源业务的资格审查类型，可选择资格预审、资格后审或者无需资格审查。');
        break;
      // 专家评分
      case 'expertEvaluation':
        defaultTitle = intl.get(`${promptCode}.model.template.expertEvaluation`).d('专家评分');
        title = intl
          .get(`${promptCode}.model.template.expertETTitle`)
          .d(
            '用于配置寻源业务的专家评分类型，可选择线上专家评分、线下进行专家评分或者无需专家评分。'
          );
        break;
      // 集中快速竞价
      case 'fastBidding':
        defaultTitle = intl
          .get(`${promptCode}.model.template.centralizedFastBidding`)
          .d('集中快速竞价');
        title = intl
          .get(`${promptCode}.model.template.centralizedFastBiddingETTitle`)
          .d(
            '为了在竞价前让采购员知道哪些供应商已经签到，哪些供应商还没签到，需要线下通知，当供应商参与后可以点击【开始竞价】按钮开始竞价'
          );
        break;
      case 'initialReview':
        defaultTitle = intl.get(`${promptCode}.model.template.complianceCheck`).d('符合性检查');
        title = intl
          .get(`${promptCode}.model.template.complianceCheckTitle`)
          .d('用于配置专家评分前是否进行符合性检查');
        break;
      case 'roundQuotationRankFlag':
        defaultTitle = intl
          .get('ssrc.inquiryHall.model.inquiryHall.showRoundQuotationRank')
          .d('显示多轮报价排名');
        title = intl
          .get(`${promptCode}.model.template.showRoundRank`)
          .d('该字段控制供应商在多轮报价每轮截止后是否可查看到之前轮次自己的排名');
        break;
      case 'roundQuotationRankRule':
        defaultTitle = intl
          .get('ssrc.inquiryHall.model.inquiryHall.RoundQuotationRule')
          .d('多轮报价排名规则');
        title = intl
          .get(`${promptCode}.model.template.showRankRules`)
          .d('该字段控制供应商在每轮报价截止后查看到的排名是按照什么价格排序');
        break;
      case 'bidRuleType':
        defaultTitle = intl.get(`${promptCode}.model.template.bidRuleType`).d('标书规则');
        title = intl
          .get(`${promptCode}.model.template.bidRuleTypeTooltip`)
          .d(
            '用来配置是否区分专家类型进行评分。专家评分为线上专家评分时可以修改。默认为不区分。不区分，寻源单创建时维护专家可以选择所有专家；分商务/技术，寻源单创建时维护专家只能选择对应类型的专家'
          );
        break;
      case 'openBidOrder':
        defaultTitle = intl.get(`${promptCode}.model.template.openBidOrder`).d('评标步制');
        title = intl
          .get(`${promptCode}.model.template.openBidOrderTooltip`)
          .d(
            '用来配置专家评分的流程。标书规则为分商务/技术时可以修改。同步评标时，全部专家评分后可以推荐成交候选人；先技术后商务时，先技术专家评分并确认汇总，后商务专家评分并确认汇总，最后推荐成交候选人；先商务后技术时，先商务专家评分并确认汇总，后技术专家评分并确认汇总，最后推荐成交候选人'
          );
        break;
      case 'sourcingStage':
        defaultTitle = intl.get(`${promptCode}.model.template.sourcingStage`).d('寻源阶段');
        title = intl
          .get(`${promptCode}.model.template.sourcingStageTooltip`)
          .d(
            '用来配置寻源是否需要先关注是否满足评分方案再关注报价。寻源阶段为两阶段时，专家评分为线上专家评分、标书规则为不区分、评标步制为同步评标、发起多轮报价规则为核价阶段发起多轮报价，且均不可编辑。为两阶段时，专家推荐成交候选人后在核价界面议价，只有成交候选人可以议价；常规时，无影响'
          );
        break;
      case 'preApproveType':
        defaultTitle = intl.get(`${promptCode}.model.template.preApproveType`).d('评审结果审批');
        title = intl
          .get(`${promptCode}.model.template.preApproveTypeTooltip`)
          .d(
            '来配置推荐成交候选人时审批工作流。寻源阶段为两阶段时，才可编辑。包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）'
          );
        break;
      case 'bargainRule':
        defaultTitle = intl.get(`${promptCode}.model.template.bargainRule`).d('议价规则');
        title = intl
          .get(`${promptCode}.model.template.bargainRuleTooltip`)
          .d(
            '用来配置在什么环节可以进行议价；发起议价后，可以部分物料发起（非密封）议价。为不允许发起议价时，没有议价；为核价阶段发起议价时，核价时可以发起议价；为评审阶段发起议价时，评分中和评分汇总时可以发起议价；为均允许发起议价时，核价、评分中和评分汇总时可以发起议价'
          );
        break;
      case 'bargainOfflineFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.bargainOfflineFlag`)
          .d('允许线下议价');
        title = intl
          .get(`${promptCode}.model.template.bargainOfflineFlagTooltip`)
          .d(
            '用来配置是否可以线下议价。当议价规则不为不允许发起议价时，可以勾选允许线下议价。勾选后，可以在对应的议价阶段线下报价；不勾选则不能线下议价'
          );
        break;
      case 'roundQuotationRule':
        defaultTitle = intl
          .get(`${promptCode}.model.template.roundQuotationRule`)
          .d('发起多轮报价规则');
        title = intl
          .get(`${promptCode}.model.template.newRoundQuotationRuleTooltip`)
          .d(
            '用来配置在什么环节可以进行多轮报价；发起多轮报价后，全部物料发起（密封）多轮报价。为自动发起多轮报价时，系统自动根据寻源单维护时设置的每个轮次的起止时间发起多轮报价;'
          );
        break;
      case 'quotationRounds':
        defaultTitle = intl
          .get(`${promptCode}.model.template.roundQuotationRoundNumber`)
          .d('多轮报价轮次');
        title = intl
          .get(`${promptCode}.model.template.roundQuotationRoundNumberTooltip`)
          .d('用来配置自动发起多轮报价的轮次;');
        break;
      case 'clarifyApproveType':
        defaultTitle = intl
          .get(`${promptCode}.model.template.clarifyApproval`)
          .d('澄清答疑澄清函发布审批');
        title = intl
          .get(`${promptCode}.model.template.clarifyApprovalTooltip`)
          .d(
            '用于配置澄清答疑澄清函发布时的审批类型，包括自审批（自动审批通过）、工作流审批（使用SRM系统工作流进行审批）、外部系统审批（与外部系统对接进行审批）。'
          );
        break;
      default:
        break;
    }
    return (
      <Tooltip title={title} placement="top">
        {defaultTitle}
      </Tooltip>
    );
  };

  onChangeRoundQuotation = (value) => {
    const options = ['AUTO', 'AUTO_CHECK', 'AUTO_SCORE'];
    if (value === 'NONE' || value === 'AUTO') {
      this.props.form.setFieldsValue({
        openEliminateFlag: 0,
      });
    }
    if (options.includes(value)) {
      this.props.form.setFieldsValue({
        sealedQuotationFlag: 1,
      });
    }
    if (value === 'NONE') {
      this.props.form.setFieldsValue({
        roundQuotationRankFlag: 0,
      });
    }
  };

  /**
   * roundQuotationRuleOption Disabled
   * ['eppen']
   * */
  roundQuotationRuleOptionDisabled = (item = {}) => {
    const { form, remote, isBid } = this.props;
    let disabledFlag = false;
    const { getFieldValue } = form || {};
    if (!getFieldValue) {
      return disabledFlag;
    }

    const NoneExpertScoreType = getFieldValue('expertScoreType') === 'NONE';
    const { value: currentOptionValue } = item || {};
    disabledFlag =
      (currentOptionValue === 'SCORE' || currentOptionValue === 'AUTO_SCORE') &&
      NoneExpertScoreType;

    disabledFlag = !remote
      ? disabledFlag
      : remote.process(
          'SSRC_SOURCE_TEMPLATE_QUESTIONFORM_ROUNDQUOTATIONRULE_OPTIONS_DISABLED',
          disabledFlag,
          { currentOptionValue, NoneExpertScoreType, isBid, form }
        );

    return disabledFlag;
  };

  // 切换符合性检查
  handleChangeInitialReview = () => {
    this.props.form.setFieldsValue({
      reviewHidePrice: 'NO_HIDE',
    });
  };

  render() {
    const {
      isNew,
      isBid,
      form = {},
      roundQuotationRule,
      bargainRule,
      sourceQualification,
      expertScore,
      sourceStage,
      openBid,
      bidRule,
      approve,
      dataSource,
      preApproveType,
      onChangeQualificationType,
      roundQuotationRankRules,
      initialReview, // 初步评审
      customizeForm,
      isHistory,
      releaseApprove,
      clarifyApprovalTypeList,
      remote,
    } = this.props;
    const { getFieldDecorator = (e) => e, getFieldValue } = form;
    const params = form.getFieldsValue();
    const formLayout = { labelCol: { span: 9 }, wrapperCol: { span: 15 } };

    let fields = [
      <Row gutter={48} className="writable-row">
        <Col span={8}>
          <Form.Item label={this.questionForm('pretrialFlag')} {...formLayout}>
            {getFieldDecorator('pretrialFlag', {
              initialValue: dataSource.pretrialFlag || 0,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                disabled={
                  getFieldValue('sourceStage') === 'DOUBLE' ||
                  (isBid
                    ? params.secondarySourceCategory === 'BID'
                    : params.sourceCategory === 'BID') ||
                  isHistory
                }
                onChange={this.setScoreValue}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={this.questionForm('releaseApproveType')} {...formLayout}>
            {getFieldDecorator('releaseApproveType', {
              initialValue: dataSource.releaseApproveType || 'SELF',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.template.releaseAT`).d('发布审批'),
                  }),
                },
              ],
            })(
              <Select allowClear disabled={isHistory}>
                {releaseApprove.map((item) => (
                  <Select.Option value={item.value} key={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={this.questionForm('resultApproveType')} {...formLayout}>
            {getFieldDecorator('resultApproveType', {
              initialValue: dataSource.resultApproveType || 'SELF',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.template.resultAT`).d('结果审批'),
                  }),
                },
              ],
            })(
              <Select allowClear disabled={isHistory}>
                {approve.map((item) => (
                  <Select.Option
                    value={item.value}
                    key={item.value}
                    disabled={
                      (item.value === 'WFL_ALLOW' || item.value === 'EXT_ALLOW') &&
                      (isBid
                        ? getFieldValue('secondarySourceCategory')
                        : getFieldValue('sourceCategory')) === 'BID'
                    }
                  >
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
      </Row>,
      <Row gutter={48} className="writable-row">
        {(isBid
          ? getFieldValue('secondarySourceCategory') !== 'BID'
          : getFieldValue('sourceCategory') !== 'BID') && (
          <Col span={8}>
            <Form.Item label={this.questionForm('clarifyApproveType')} {...formLayout}>
              {getFieldDecorator('clarifyApproveType', {
                initialValue: dataSource.clarifyApproveType || 'SELF',
              })(
                <Select allowClear disabled={isHistory}>
                  {clarifyApprovalTypeList.map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        )}
      </Row>,
      <Row gutter={48} className="writable-row">
        <Col span={8}>
          <Form.Item label={this.questionForm('bidRuleType')} {...formLayout}>
            {getFieldDecorator('bidRuleType', { initialValue: dataSource.bidRuleType || 'NONE' })(
              <RadioGroup
                disabled={
                  params.sourceStage === 'DOUBLE' ||
                  getFieldValue('expertScoreType') === 'NONE' ||
                  isHistory
                }
                onChange={this.setValue}
              >
                {bidRule.map((item) => (
                  <Radio value={item.value} key={item.value}>
                    {item.meaning}
                  </Radio>
                ))}
              </RadioGroup>
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={this.questionForm('qualificationType')} {...formLayout}>
            {getFieldDecorator('qualificationType', {
              initialValue: dataSource.qualificationType || 'NONE',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.template.qualificationType`).d('资格审查'),
                  }),
                },
              ],
            })(
              <Select
                allowClear
                onChange={(value) => onChangeQualificationType(value)}
                disabled={isHistory}
              >
                {sourceQualification.map((item) => (
                  <Select.Option value={item.value} key={String(item.value)}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={this.questionForm('expertEvaluation')} {...formLayout}>
            {getFieldDecorator('expertScoreType', {
              initialValue: dataSource.expertScoreType || 'NONE',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.template.expertEvaluation`).d('专家评分'),
                  }),
                },
              ],
            })(
              <Select
                allowClear
                onChange={this.setQuotationRuleValue}
                disabled={params.pretrialFlag === 1 || params.sourceStage === 'DOUBLE' || isHistory}
              >
                {expertScore.map((item) => (
                  <Select.Option value={item.value} key={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
      </Row>,
      <Row gutter={48} className="writable-row">
        <Col span={8}>
          <Form.Item label={this.questionForm('openBidOrder')} {...formLayout}>
            {getFieldDecorator('openBidOrder', {
              initialValue: dataSource.openBidOrder || 'SYNC',
            })(
              <Select
                disabled={
                  !params.bidRuleType || getFieldValue('expertScoreType') === 'NONE' || isHistory
                    ? true
                    : params.bidRuleType === 'NONE'
                }
                allowClear
              >
                {openBid.map((item) => (
                  <Select.Option value={item.value} key={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
        {isNew && (
          <Col span={8}>
            <Form.Item label={this.questionForm('initialReview')} {...formLayout}>
              {getFieldDecorator('initialReview', {
                initialValue: dataSource.initialReview || 'NONE',
              })(
                <Select
                  allowClear
                  disabled={
                    (isBid
                      ? getFieldValue('secondarySourceCategory')
                      : getFieldValue('sourceCategory')) === 'BID' ||
                    getFieldValue('expertScoreType') !== 'ONLINE' ||
                    isHistory
                  }
                  onChange={this.handleChangeInitialReview}
                >
                  {initialReview.map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        )}
        <Col span={8}>
          <Form.Item label={this.questionForm('sourcingStage')} {...formLayout}>
            {getFieldDecorator('sourceStage', {
              initialValue: dataSource.sourceStage || 'COMMON',
            })(
              <Select
                onChange={this.setDoubleValue}
                disabled={
                  (!isBid && params.sourceCategory === 'RFA') ||
                  (isBid && params.secondarySourceCategory === 'RFA') ||
                  isHistory
                }
                allowClear
              >
                {sourceStage.map((item) => (
                  <Select.Option value={item.value} key={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
      </Row>,
      <Row gutter={48} className="writable-row">
        <Col span={8}>
          <Form.Item label={this.questionForm('preApproveType')} {...formLayout}>
            {getFieldDecorator('preApproveType', {
              initialValue: dataSource.preApproveType || 'SELF',
            })(
              <Select
                disabled={
                  (getFieldValue('sourceStage') === 'DOUBLE' ||
                  getFieldValue('expertScoreType') === 'ONLINE'
                    ? false
                    : getFieldValue('preApproveType') === 'SELF') || isHistory
                }
                allowClear
              >
                {preApproveType.map((item) => (
                  <Select.Option value={item.value} key={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={this.questionForm('bargainRule')} {...formLayout}>
            {getFieldDecorator('bargainRule', {
              initialValue: dataSource.bargainRule || 'NONE',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.template.bargainRule`).d('议价规则'),
                  }),
                },
              ],
            })(
              <Select
                disabled={
                  (!['RFQ', 'RFA'].includes(params.sourceCategory) && !isBid) ||
                  (isBid && !['RFQ', 'NEW_BID', 'RFA'].includes(params.secondarySourceCategory)) ||
                  isHistory
                }
                allowClear
              >
                {bargainRule.map((item) => (
                  <Select.Option
                    value={item.value}
                    key={item.value}
                    disabled={
                      (getFieldValue('expertScoreType') === 'NONE' ||
                        getFieldValue('expertScoreType') === 'OFFLINE') &&
                      (item.value === 'SCORE' || item.value === 'ALL')
                    }
                  >
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={this.questionForm('bargainOfflineFlag')} {...formLayout}>
            {getFieldDecorator('bargainOfflineFlag', {
              initialValue: dataSource.bargainOfflineFlag || 0,
            })(
              <Checkbox
                disabled={
                  getFieldValue('bargainRule') === 'NONE' ||
                  (isBid
                    ? params.secondarySourceCategory === 'BID'
                    : params.sourceCategory === 'BID') ||
                  isHistory
                }
                checkedValue={1}
                unCheckedValue={0}
              />
            )}
          </Form.Item>
        </Col>
      </Row>,
      <Row gutter={48} className="writable-row">
        <Col span={8}>
          <Form.Item label={this.questionForm('roundQuotationRule')} {...formLayout}>
            {getFieldDecorator('roundQuotationRule', {
              initialValue: dataSource.roundQuotationRule || 'NONE',
              rules: [
                {
                  required:
                    (!isBid && getFieldValue('sourceCategory') === 'RFQ') ||
                    (isBid &&
                      ['RFQ', 'NEW_BID'].includes(getFieldValue('secondarySourceCategory'))),
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`${promptCode}.model.template.roundQuotationRule`)
                      .d('发起多轮报价规则'),
                  }),
                },
              ],
            })(
              <Select
                disabled={
                  params.sourceStage === 'DOUBLE' ||
                  (isBid
                    ? ['RFA', 'BID'].includes(params.secondarySourceCategory)
                    : ['RFA', 'BID'].includes(params.sourceCategory)) ||
                  isHistory
                }
                onChange={this.onChangeRoundQuotation}
                allowClear
              >
                {roundQuotationRule.map(
                  (item) =>
                    ((!isNew &&
                      item.value !== 'AUTO' &&
                      item.value !== 'AUTO_CHECK' &&
                      item.value !== 'AUTO_SCORE') ||
                      isNew) && (
                      <Select.Option
                        value={item.value}
                        key={item.value}
                        // disabled={
                        //   (item.value === 'SCORE' || item.value === 'AUTO_SCORE') &&
                        //   getFieldValue('expertScoreType') === 'NONE'
                        // }
                        // disabled={
                        //   () => {
                        //     let disabledFlag = false;
                        //     const currentExpertScoreType = getFieldValue('expertScoreType') === 'NONE';
                        //     const { currentOptionValue } = item || {};
                        //     disabledFlag = (currentOptionValue === 'SCORE' || currentOptionValue === 'AUTO_SCORE') && currentExpertScoreType;

                        //     return disabledFlag;
                        //   }
                        // }
                        disabled={this.roundQuotationRuleOptionDisabled(item)}
                      >
                        {item.meaning}
                      </Select.Option>
                    )
                )}
              </Select>
            )}
          </Form.Item>
        </Col>
        {(params.roundQuotationRule === 'AUTO' ||
          params.roundQuotationRule === 'AUTO_CHECK' ||
          params.roundQuotationRule === 'AUTO_SCORE') && (
          <Col span={8}>
            <Form.Item label={this.questionForm('quotationRounds')} {...formLayout}>
              {getFieldDecorator('quotationRounds', {
                initialValue: dataSource.quotationRounds || 2,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.roundQuotationRoundNumber`)
                        .d('多轮报价轮次'),
                    }),
                  },
                ],
              })(<InputNumber step={1} precision={0} min={2} disabled={isHistory} />)}
            </Form.Item>
          </Col>
        )}
        {params.roundQuotationRule !== 'NONE' && (
          <Col span={8}>
            <Form.Item label={this.questionForm('roundQuotationRankFlag')} {...formLayout}>
              {getFieldDecorator('roundQuotationRankFlag', {
                initialValue: dataSource.roundQuotationRankFlag || 0,
              })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
            </Form.Item>
          </Col>
        )}
        {
          <Col span={8}>
            <Form.Item label={this.questionForm('roundQuotationRankRule')} {...formLayout}>
              {getFieldDecorator('roundQuotationRankRule', {
                initialValue: dataSource.roundQuotationRankRule || 'BASE_PRICE',
              })(
                <Select allowClear disabled={isHistory}>
                  {roundQuotationRankRules.map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        }
        {((!isBid && params.sourceCategory === 'RFA') ||
          (isBid && params.secondarySourceCategory === 'RFA')) &&
          !isNew && (
            <Col span={8}>
              <Form.Item label={this.questionForm('fastBidding')} {...formLayout}>
                {getFieldDecorator('fastBidding', {
                  initialValue: dataSource.fastBidding || 0,
                })(<Checkbox checkedValue={1} unCheckedValue={0} disabled={isHistory} />)}
              </Form.Item>
            </Col>
          )}
      </Row>,
    ];
    fields = remote
      ? remote.process('SSRC_SOURCE_TEMPLATE_QUESTIONFORM_FIELDS', fields, {
          that: this,
          dataSource,
        })
      : fields;
    fields = fields || [];

    return customizeForm(
      {
        code: 'SOURCE.TEMPLATE.WORKFLOW_CONFIGURATION',
        form,
        dataSource,
        isCreate: true,
      },
      <Form>{fields}</Form>
    );
  }
}
