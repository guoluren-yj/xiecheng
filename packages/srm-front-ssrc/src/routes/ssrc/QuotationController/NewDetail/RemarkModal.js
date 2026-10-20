import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, Select, Col, Row, InputNumber, Popover, Checkbox } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Text } from 'choerodon-ui';

import { SEARCH_FORM_CLASSNAME } from 'utils/constants';
import { Bind } from 'lodash-decorators';
import { isNumber, isEmpty } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import intl from 'utils/intl';

const formLayout = {
  labelCol: { span: 11 },
  wrapperCol: { span: 13 },
};
const longFormLayout = {
  labelCol: { span: 16 },
  wrapperCol: { span: 8 },
};
const organizationId = getCurrentOrganizationId();

/**
 *评分细则模态框form
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
class RemarkModal extends PureComponent {
  constructor(props) {
    super(props);
    const { onBindSearch } = props;
    if (onBindSearch) onBindSearch(this.fetchElementsDetailLine);
  }

  componentDidMount() {
    this.fetchRemarkDetail();
  }

  /**
   * 评分要素-行-查询
   * @param {Object} page
   */
  @Bind()
  fetchRemarkDetail() {
    const { dispatch, record } = this.props;
    dispatch({
      type: 'score/fetchRemarksDetailLine',
      payload: {
        parentIndicateId: record.indicateId,
        indicateLevel: 'TWO',
        templateEleDetailFlag: 1, // 模板评分要素下的评分要素细项标志
        sourceType: isNumber(record.tmplAssignId) ? 'TEMPLATE_MANUAL' : 'TEMPLATE', // 存在tmplAssignId 即TEMPLATE_MANUAL
      },
    });
  }

  // 记录变更数据
  integrationAdjustField = (formData = {}) => {
    const { record = {} } = this.props;
    const { sourceEvaluateIndic = {} } = record;
    const { evaluateIndicDetail: sourceDetail = {} } = sourceEvaluateIndic || {};
    let adjustFields = [];
    const formDataKey = Object.keys(formData);

    if (isEmpty(sourceEvaluateIndic) || isEmpty(sourceDetail)) {
      adjustFields = formDataKey; // 页面新建要素处理 // 页面非新建要素，但评分细项在历史中不存在处理
    } else {
      formDataKey.forEach((key) => {
        const currentKeyValue = formData[key];
        const sourceKeyValue = (sourceDetail || {})[key];
        if (currentKeyValue !== sourceKeyValue) {
          adjustFields.push(key);
        }
      });
    }

    adjustFields = adjustFields.join(',');
    return adjustFields;
  };

  /**
   * 弹框-保存
   */
  @Bind()
  handleSaveRemark() {
    const { form = {}, record = {}, onChangeRemarkModal, onHideModal } = this.props;
    const { evaluateIndicDetail = {} } = record;

    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      const { benchmarkPriceMethod, benchmarkPriceFactor } = values || {};
      if (err) {
        return;
      }

      let resetFields = {};
      if (values.formula === 'LINEAR_MAPPING') {
        // 如果是线性映射法，则重置下面字段
        resetFields = {
          benchmarkPriceFactor: null,
          enableRemoveExtremes: null,
          limitSupplierQuantity: null,
          benchmarkPriceMethod: null,
          benchmarkPriceMethodMeaning: null,
          benchmarkScore: null,
          lowestScore: null,
          aboveFactor: null,
          belowFactor: null,
        };
      }

      const evaluateIndicDtlAdjustFields = this.integrationAdjustField(values); // 变更数据
      const newData = {
        ...evaluateIndicDetail,
        ...resetFields,
        ...values,
        evaluateIndicDtlAdjustFields,
        tenantId: organizationId,
        benchmarkPriceFactor:
          benchmarkPriceMethod === 'AVG_DOWN'
            ? benchmarkPriceFactor || benchmarkPriceFactor === 0
              ? benchmarkPriceFactor
              : 100
            : benchmarkPriceFactor,
      };

      const saveData = { ...record, evaluateIndicDetail: newData };

      onChangeRemarkModal(saveData);
      onHideModal();
    });
  }

  /**
   * 修改基准价计算方法
   */
  @Bind()
  changeBPriceMethod(e) {
    const { remote } = this.props;
    if (e === 'AVG_DOWN') {
      this.props.form.setFieldsValue({
        formula: 'BROKEN_LINE_SLOPE', // 平均价下浮，默认值为折线斜率法, 两直线暂未实现
      });
    }
    if (e === 'HIGH_PRICE') {
      this.props.form.setFieldsValue({
        formula: 'PROPORTION',
      });
    }
    if (e !== 'AVG_DOWN') {
      // 如果不是平均价下浮，则重置下面字段内容
      this.props.form.setFieldsValue({
        enableRemoveExtremes: null,
        limitSupplierQuantity: null,
      });
    }
    if (remote?.event) {
      remote.event.fireEvent('handleBPriceMethodOnChange', { that: this, option: e });
    }
  }

  @Bind()
  setSelectValue(e) {
    this.props.form.setFieldsValue({
      formula: e,
    });
    if (e !== 'BROKEN_LINE_SLOPE') {
      // 如果不是折线斜率法，则重置下面字段内容
      this.props.form.setFieldsValue({
        enableRemoveExtremes: null,
        limitSupplierQuantity: null,
      });
    }
  }

  @Bind()
  renderFormulaField(form, formula) {
    const { remote, sourceKey, header } = this.props;
    const that = this;
    const selection = (
      <Select onChange={this.setSelectValue}>
        {formula &&
          formula.map((item) => (
            <Select.Option
              value={item.value}
              key={item.value}
              disabled={
                (form.getFieldValue('benchmarkPriceMethod') === 'AVG_DOWN' &&
                  item.value === 'DIRECT_SLOPE') ||
                (form.getFieldValue('benchmarkPriceMethod') === 'HIGH_PRICE' &&
                  !['PROPORTION', 'LINEAR_MAPPING'].includes(item.value))
              }
            >
              {item.meaning}
            </Select.Option>
          ))}
      </Select>
    );
    const values = remote
      ? remote.process('SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_FORM_FIELD_FORMULA', selection, {
          that,
          form,
          formula,
          sourceKey,
          header,
        })
      : selection;
    return values;
  }

  /**
   * 关闭modal
   */
  @Bind()
  handleModalHide() {
    this.props.onHideModal();
  }

  // 东方电缆二开
  @Bind()
  cuxAboveFactor() {
    return intl.get('ssrc.score.model.score.tSBP').d('以基准价为最高分，报价每高于基准价1%时扣');
  }

  @Bind()
  cuxFormulaField() {
    const { record = {}, form = {}, remote } = this.props;
    const { evaluateIndicDetail = {} } = record;
    return remote
      ? remote.process('SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_REMARK_SCORE_FORMULA', null, {
          form,
          evaluateIndicDetail,
          that: this,
        })
      : null;
  }

  // 切换 投标价格平均值去除最低/最高报价
  @Bind()
  handleEnableRemoveExtremes(e) {
    if (!e.target.checked) {
      this.props.form.setFieldsValue({
        limitSupplierQuantity: null,
      });
    }
  }

  // 获取 折线斜率法 - 报价每低于基准价1%时加分 输入框最小值
  @Bind()
  getBrokenLineSlopeMin() {
    const { form } = this.props;
    if (!form) return 0;
    // 基准价计算方法为平均价下浮法&价格计算公式为折线斜率法
    const avgDownAndBrokenLineSlopeFlag =
      form.getFieldValue('benchmarkPriceMethod') === 'AVG_DOWN' &&
      form.getFieldValue('formula') === 'BROKEN_LINE_SLOPE';
    // 折线斜率法 - 报价每低于基准价1%时加分【基准价计算方法为平均价下浮法&价格计算公式为折线斜率法可维护负数，否则不可】
    return avgDownAndBrokenLineSlopeFlag ? -Infinity : 0;
  }

  cuxRenderFields = () => {
    const { record = {}, form = {}, remote } = this.props;
    const { evaluateIndicDetail = {} } = record || {};
    return remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_REMARK_SCORE_FORMULA_FORM_HEADER',
          null,
          {
            form,
            evaluateIndicDetail,
            that: this,
          }
        )
      : null;
  };

  showBrokenLineSlopFlag = () => {
    const { record = {}, form = {}, remote } = this.props;
    const { evaluateIndicDetail = {} } = record || {};
    const remoteFlag =
      form.getFieldValue('benchmarkPriceMethod') === 'AVG_DOWN' &&
      (form.getFieldValue('formula') || evaluateIndicDetail?.formula) === 'BROKEN_LINE_SLOPE';

    return remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_REMARK_SCORE_SHOW_BROKEN_LINE_SLOPE_FLAG',
          remoteFlag,
          {
            form,
            evaluateIndicDetail,
            that: this,
          }
        )
      : remoteFlag;
  };

  enableRemoveExtremesRender = () => {
    const { record = {}, form = {}, remote } = this.props;
    const { evaluateIndicDetail = {} } = record || {};
    const brokenLineSlopRender = (
      <Checkbox
        disabled={
          form.getFieldValue('benchmarkPriceMethod') !== 'AVG_DOWN' ||
          (form.getFieldValue('formula') || evaluateIndicDetail?.formula) !== 'BROKEN_LINE_SLOPE'
        }
        onChange={this.handleEnableRemoveExtremes}
        checkedValue={1}
        unCheckedValue={0}
      />
    );

    return remote
      ? remote.process(
          'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_PROCESS_REMARK_SCORE_BROKEN_LINE_SLOPE_CHECKBOX_RENDER',
          brokenLineSlopRender,
          {
            form,
            evaluateIndicDetail,
            that: this,
          }
        )
      : brokenLineSlopRender;
  };

  /**
   *  此方法被 [绝味] 重写
   * @protected
   */
  @Bind()
  renderContent() {
    const {
      record = {},
      form = {},
      benchmarkPriceMethod = [],
      formula = [],
      customizeForm = () => {},
      header,
      remote,
    } = this.props;
    const { evaluateIndicDetail = {} } = record;
    const { getFieldDecorator } = form;

    const benchmarkPriceMethodRender =
      form.getFieldValue('benchmarkPriceMethod') === 'AVG_DOWN' ? (
        <InputNumber precision={2} min={0} trim style={{ width: '85%' }} />
      ) : (
        <span />
      );

    const benchmarkPriceFactorLabel =
      form.getFieldValue('benchmarkPriceMethod') === 'LOWEST_PRICE'
        ? intl.get('ssrc.score.model.score.basePrice').d('基准价=有效最低价')
        : form.getFieldValue('benchmarkPriceMethod') === 'HIGH_PRICE'
        ? intl.get('ssrc.score.model.score.baseHighPrice').d('基准价=有效最高价')
        : intl.get('ssrc.score.model.score.aVTP').d('基准价=有效投标价格平均值*');

    const lowestScoreHelp =
      form.getFieldValue('benchmarkPriceMethod') !== 'HIGH_PRICE'
        ? intl
            .get('ssrc.score.model.score.propDes')
            .d(
              '以基准价为分子，供应商有效投标价为分母，供应商投标价得分 =（基准价/供应商投标价）*100 ，最低分为'
            )
        : intl
            .get('ssrc.score.model.score.propHighDes')
            .d(
              '以供应商有效投标价为分子，基准价为分母，供应商投标得分 = （供应商投标价/基准价）*100，最低分为'
            );
    const help = remote
      ? remote.process(
          'SSRC_INQUIRYHALLNEW_UPDATE_RENDER_SCORE_FORMULA_PROPORTION_HELP',
          lowestScoreHelp,
          {
            form,
            header,
            benchmarkPriceMethod: form.getFieldValue('benchmarkPriceMethod'),
          }
        )
      : lowestScoreHelp;
    return customizeForm(
      {
        code: 'SSRC.QUOTATION_CONTROLLER_DETAIL.SCORING_RUBRIC',
        form: this.props.form,
        dataSource: evaluateIndicDetail,
      },
      <Form className={SEARCH_FORM_CLASSNAME}>
        {(form.getFieldValue('formula') || evaluateIndicDetail?.formula) !== 'LINEAR_MAPPING' && (
          <Row style={{ marginTop: '15px' }}>
            <Col span={8}>
              <Form.Item
                {...formLayout}
                label={intl.get('ssrc.score.model.score.bPEmethod').d('基准价计算方法')}
              >
                {getFieldDecorator('benchmarkPriceMethod', {
                  initialValue:
                    (evaluateIndicDetail && evaluateIndicDetail.benchmarkPriceMethod) ||
                    'LOWEST_PRICE',
                })(
                  <Select onChange={this.changeBPriceMethod}>
                    {benchmarkPriceMethod &&
                      benchmarkPriceMethod.map((item) => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label={
                  remote
                    ? remote.process(
                        'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_FORM_FIELD_LABEL_BENCHMARK_PRICE_FACTOR',
                        benchmarkPriceFactorLabel,
                        { form }
                      )
                    : benchmarkPriceFactorLabel
                }
                {...longFormLayout}
                colon={false}
              >
                {getFieldDecorator('benchmarkPriceFactor', {
                  initialValue:
                    evaluateIndicDetail?.benchmarkPriceFactor ||
                    evaluateIndicDetail?.benchmarkPriceFactor === 0
                      ? evaluateIndicDetail?.benchmarkPriceFactor
                      : 100,
                })(
                  remote
                    ? remote.process(
                        'SSRC_QUOTATION_CONTROLLER_UPDATE_PROCESS_FORM_FIELD_BENCHMARK_PRICE_FACTOR',
                        benchmarkPriceMethodRender,
                        { form }
                      )
                    : benchmarkPriceMethodRender
                )}
                {!['LOWEST_PRICE', 'HIGH_PRICE'].includes(
                  form.getFieldValue('benchmarkPriceMethod')
                ) && (
                  <span style={{ marginLeft: '10px' }}>
                    {intl.get('ssrc.score.model.score.percentSign').d('%')}
                  </span>
                )}
              </Form.Item>
            </Col>
          </Row>
        )}
        {this.showBrokenLineSlopFlag() && (
          <Row style={{ marginTop: '15px' }}>
            <Col span={12}>
              <Form.Item
                {...formLayout}
                colon={false}
                label={intl
                  .get('ssrc.score.model.score.enableRemoveExtremes')
                  .d('投标价格平均值去除最低/最高报价')}
              >
                <Popover
                  content={intl
                    .get('ssrc.score.model.score.enableRemoveExtremesHelp')
                    .d(
                      '开启后，基准价中有效投标价格平均值将排除最低/最高报价，剩余报价计算平均值。注：当有多个相同的最低/最高报价时，仅去除一个。'
                    )}
                >
                  {getFieldDecorator('enableRemoveExtremes', {
                    initialValue: evaluateIndicDetail && evaluateIndicDetail.enableRemoveExtremes,
                  })(this.enableRemoveExtremesRender())}
                </Popover>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                {...formLayout}
                colon={false}
                label={intl
                  .get('ssrc.score.model.score.validSupplierQuantity')
                  .d('有效报价供应商≥')}
              >
                {getFieldDecorator('limitSupplierQuantity', {
                  initialValue: evaluateIndicDetail && evaluateIndicDetail.limitSupplierQuantity,
                  rules: [
                    {
                      required: form.getFieldValue('enableRemoveExtremes'),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('ssrc.score.model.score.validSupplierQuantity')
                          .d('有效报价供应商'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    disabled={!form.getFieldValue('enableRemoveExtremes')}
                    min={3}
                    precision={0}
                    trim
                    style={{ width: '100px' }}
                  />
                )}
                <span style={{ marginLeft: '8px' }}>
                  {intl.get('ssrc.score.model.score.removalLowestAndHighestPrice').d('家时去除')}
                </span>
              </Form.Item>
            </Col>
          </Row>
        )}
        {this.cuxRenderFields()}
        <Row style={{ marginTop: '15px' }}>
          <Col span={24}>
            <Form.Item
              {...formLayout}
              label={intl.get('ssrc.score.model.score.priceCFormula').d('价格计算公式')}
            >
              {getFieldDecorator('formula', {
                initialValue:
                  (evaluateIndicDetail && evaluateIndicDetail.formula) || formula[0]?.value,
              })(this.renderFormulaField(form, formula))}
            </Form.Item>
          </Col>
        </Row>
        {form.getFieldValue('formula') === 'DIRECT_SLOPE' && (
          <Row style={{ marginTop: '15px' }}>
            <Col span={12}>
              <Form.Item label={this.cuxAboveFactor()} colon={false}>
                {getFieldDecorator('aboveFactor', {
                  initialValue: evaluateIndicDetail && evaluateIndicDetail.aboveFactor,
                  rules: [
                    {
                      required: form.getFieldValue('formula') === 'DIRECT_SLOPE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.score.model.score.score`).d('分'),
                      }),
                    },
                  ],
                })(<InputNumber precision={2} min={0} trim style={{ width: '85%' }} />)}
                <span style={{ marginLeft: '10px' }}>
                  {intl.get('ssrc.score.model.score.score').d('分')}
                </span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get('ssrc.score.model.score.minimumDT').d('最低扣至')}
                colon={false}
              >
                {getFieldDecorator('lowestScore', {
                  initialValue: evaluateIndicDetail && evaluateIndicDetail.lowestScore,
                  rules: [
                    {
                      required: form.getFieldValue('formula') === 'DIRECT_SLOPE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.score.model.score.score`).d('分'),
                      }),
                    },
                  ],
                })(<InputNumber precision={2} min={0} trim style={{ width: '85%' }} />)}
                <span style={{ marginLeft: '10px' }}>
                  {intl.get('ssrc.score.model.score.score').d('分')}
                </span>
              </Form.Item>
            </Col>
          </Row>
        )}
        {this.cuxFormulaField()}
        {form.getFieldValue('formula') === 'PROPORTION' && (
          <Row style={{ marginTop: '15px' }}>
            <Col span={24}>
              <Form.Item
                help={help}
                label={intl.get('ssrc.score.model.score.minScore').d('最低分')}
                colon={false}
              >
                {getFieldDecorator('lowestScore', {
                  initialValue: evaluateIndicDetail && evaluateIndicDetail.lowestScore,
                  rules: [
                    {
                      required: form.getFieldValue('formula') === 'PROPORTION',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.score.model.score.score`).d('分'),
                      }),
                    },
                  ],
                })(<InputNumber precision={2} min={0} trim style={{ width: '85%' }} />)}
                <span style={{ marginLeft: '10px' }}>
                  {intl.get('ssrc.score.model.score.score').d('分')}
                </span>
              </Form.Item>
            </Col>
          </Row>
        )}
        {(form.getFieldValue('formula') === 'TWO_DIRECT_SLOPE' ||
          form.getFieldValue('formula') === 'BROKEN_LINE_SLOPE') && (
          <Row style={{ marginTop: '15px' }}>
            <Col span={6}>
              <Form.Item
                label={
                  form.getFieldValue('formula') === 'TWO_DIRECT_SLOPE'
                    ? intl
                        .get('ssrc.score.model.score.tSBP')
                        .d('以基准价为最高分，报价每高于基准价1%时扣')
                    : intl.get('ssrc.score.model.score.tBasePrice').d('以基准价为')
                }
                colon={false}
              >
                {getFieldDecorator('benchmarkScore', {
                  initialValue: evaluateIndicDetail && evaluateIndicDetail.benchmarkScore,
                  rules: [
                    {
                      required:
                        form.getFieldValue('formula') === 'TWO_DIRECT_SLOPE' ||
                        form.getFieldValue('formula') === 'BROKEN_LINE_SLOPE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.score.model.score.score`).d('分'),
                      }),
                    },
                  ],
                })(
                  form.getFieldValue('formula') !== 'TWO_DIRECT_SLOPE' ? (
                    <InputNumber precision={2} min={0} trim style={{ width: '85%' }} />
                  ) : (
                    <div />
                  )
                )}
                {form.getFieldValue('formula') !== 'TWO_DIRECT_SLOPE' && (
                  <span style={{ marginLeft: '10px' }}>
                    {intl.get('ssrc.score.model.score.score').d('分')}
                  </span>
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('ssrc.score.model.score.dABPNotScore').d('报价每高于基准价1%时扣')}
                colon={false}
              >
                {getFieldDecorator('aboveFactor', {
                  initialValue: evaluateIndicDetail && evaluateIndicDetail.aboveFactor,
                  rules: [
                    {
                      required:
                        form.getFieldValue('formula') === 'TWO_DIRECT_SLOPE' ||
                        form.getFieldValue('formula') === 'BROKEN_LINE_SLOPE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.score.model.score.score`).d('分'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    precision={2}
                    min={
                      remote
                        ? remote.process(
                            'SSRC_QUOTATION_CONTROLLER_UPDATE_RENDER_INPUT_NUMBER_ABOVE_FACTOR',
                            0,
                            {
                              benchmarkPriceMethod: form.getFieldValue('benchmarkPriceMethod'),
                            }
                          )
                        : 0
                    }
                    style={{ width: '85%' }}
                    trim
                  />
                )}
                <span style={{ marginLeft: '10px' }}>
                  {intl.get('ssrc.score.model.score.score').d('分')}
                </span>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={
                  remote
                    ? remote.render(
                        'SSRC_QUOTATION_CONTROLLER_UPDATE_RENDER_SCORING_REMARK_BELOW_FACTOR_LABEL',
                        intl
                          .get('ssrc.score.model.score.sQDetailNotScore')
                          .d('报价每低于基准价1%加'),
                        {
                          benchmarkPriceMethod: form.getFieldValue('benchmarkPriceMethod'),
                        }
                      )
                    : intl.get('ssrc.score.model.score.sQDetailNotScore').d('报价每低于基准价1%加')
                }
                colon={false}
              >
                {getFieldDecorator('belowFactor', {
                  initialValue: evaluateIndicDetail && evaluateIndicDetail.belowFactor,
                  rules: [
                    {
                      required:
                        form.getFieldValue('formula') === 'TWO_DIRECT_SLOPE' ||
                        form.getFieldValue('formula') === 'BROKEN_LINE_SLOPE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.score.model.score.score`).d('分'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    precision={2}
                    min={
                      remote
                        ? remote.process(
                            'SSRC_QUOTATION_CONTROLLER_UPDATE_RENDER_INPUT_NUMBER',
                            this.getBrokenLineSlopeMin(),
                            {
                              benchmarkPriceMethod: form.getFieldValue('benchmarkPriceMethod'),
                            }
                          )
                        : this.getBrokenLineSlopeMin()
                    }
                    trim
                    style={{ width: '85%' }}
                  />
                )}
                <span style={{ marginLeft: '10px' }}>
                  {intl.get('ssrc.score.model.score.score').d('分')}
                </span>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get('ssrc.score.model.score.minimumDT').d('最低扣至')}
                colon={false}
              >
                {getFieldDecorator('lowestScore', {
                  initialValue: evaluateIndicDetail && evaluateIndicDetail.lowestScore,
                  rules: [
                    {
                      required:
                        form.getFieldValue('formula') === 'TWO_DIRECT_SLOPE' ||
                        form.getFieldValue('formula') === 'BROKEN_LINE_SLOPE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.score.model.score.score`).d('分'),
                      }),
                    },
                  ],
                })(<InputNumber precision={2} min={0} trim style={{ width: '85%' }} />)}
                <span style={{ marginLeft: '10px' }}>
                  {intl.get('ssrc.score.model.score.score').d('分')}
                </span>
              </Form.Item>
            </Col>
          </Row>
        )}
        {form.getFieldValue('formula') === 'LINEAR_MAPPING' ? (
          <Row style={{ marginTop: '15px' }}>
            <Col span={24} style={{ width: '100%' }}>
              <Form.Item label="" colon={false} labelCol={{ span: 12 }} wrapperCol={{ span: 12 }}>
                {form.getFieldDecorator('linearMappingNotice', {
                  initialValue: `${intl
                    .get('ssrc.score.model.score.linearMapping.calculateHelp')
                    .d(
                      '供应商报价得分=最低分+[(最高价-供应商报价)/(最高价-最低价)]*(最高分-最低分)'
                    )}，${intl
                    .get('ssrc.score.model.score.linearMapping.note')
                    .d(
                      '注：最高分、最低分取自单据中要素行上维护的分数。当评分方式=权重法时，最低分默认为0，最高分默认为100。'
                    )}`,
                })(
                  <div style={{ width: '200%' }}>
                    <Text>
                      {intl
                        .get('ssrc.score.model.score.linearMapping.calculateHelp')
                        .d(
                          '供应商报价得分=最低分+[(最高价-供应商报价)/(最高价-最低价)]*(最高分-最低分)'
                        )}
                    </Text>
                    <Text>
                      {intl
                        .get('ssrc.score.model.score.linearMapping.note')
                        .d(
                          '注：最高分、最低分取自单据中要素行上维护的分数。当评分方式=权重法时，最低分默认为0，最高分默认为100。'
                        )}
                    </Text>
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>
        ) : (
          <Row style={{ marginTop: '15px' }}>
            <Col span={12}>
              <Form.Item
                label={
                  remote
                    ? remote.process(
                        'SSRC_INQUIRYHALLNEW_UPDATE_RENDER_SCORE_NOTICE_THING',
                        intl
                          .get('ssrc.score.model.score.PAC')
                          .d('注：以百分制扣分，若评分要素非百分制，折算后扣分。'),
                        {
                          form,
                          header,
                          benchmarkPriceMethod: form.getFieldValue('benchmarkPriceMethod'),
                        }
                      )
                    : intl
                        .get('ssrc.score.model.score.PAC')
                        .d('注：以百分制扣分，若评分要素非百分制，折算后扣分。')
                }
                colon={false}
              >
                {getFieldDecorator('noticeThing', {})(<div />)}
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    );
  }

  render() {
    const { visible, save } = this.props;
    return (
      <React.Fragment>
        <Modal
          destroyOnClose
          width={1050}
          visible={visible}
          onOk={this.handleSaveRemark}
          onCancel={this.handleModalHide}
          confirmLoading={save}
          title={intl.get('ssrc.score.view.title.remarkDetail').d('评分细项')}
          okText={intl.get('hzero.common.button.save').d('保存')}
        >
          {this.renderContent()}
        </Modal>
      </React.Fragment>
    );
  }
}

const hocRemarkModal = (NewComponent) => {
  return connect(({ score, loading }) => ({
    score,
    loading: loading.effects['score/fetchElementsDetailLine'],
    save: loading.effects['score/saveElementsDetail'],
  }))(
    Form.create({ fieldNameProp: null })(
      withCustomize({
        unitCode: [
          'SSRC.QUOTATION_CONTROLLER_DETAIL.SCORING_RUBRIC', // 寻源过程控制(新)-询价要求-评分要素-评分细则
        ],
      })(formatterCollections({ code: ['ssrc.score', 'hzero.common'] })(NewComponent))
    )
  );
};

export { hocRemarkModal, RemarkModal };
export default hocRemarkModal(RemarkModal);
