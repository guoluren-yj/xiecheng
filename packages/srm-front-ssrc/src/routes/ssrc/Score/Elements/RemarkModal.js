import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, Select, Col, Row, InputNumber, Popover, Checkbox } from 'hzero-ui';
import { Text } from 'choerodon-ui';
import { SEARCH_FORM_CLASSNAME } from 'utils/constants';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';

import intl from 'utils/intl';

const formLayout = {
  labelCol: { span: 11 },
  wrapperCol: { span: 13 },
};
const organizationId = getCurrentOrganizationId();

/**
 *评分细则模态框form
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */

class RemarkModal extends PureComponent {
  // constructor(props) {
  //   super(props);
  // }

  /**
   * 弹框-保存
   */
  @Bind()
  handleSaveRemark() {
    const { form = {}, record = {}, onChangeRemarkModal, onHideModal } = this.props;
    const { scoreIndicDetail = {} } = record;
    // 先验证头，再验证行
    form.validateFieldsAndScroll({ force: true }, (err, values) => {
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
      const newData = {
        ...scoreIndicDetail,
        ...resetFields,
        ...values,
        tenantId: organizationId,
      };
      const saveData = { ...record, scoreIndicDetail: newData };
      if (!err) {
        onChangeRemarkModal(saveData);
        onHideModal();
      }
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

  // 东方电缆二开
  @Bind()
  WidthToAboveFactor() {
    return '250px';
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
  renderScoreRemark() {
    const { form = {}, remote } = this.props;
    const standard = intl
      .get('ssrc.score.model.score.PAC')
      .d('注：以百分制扣分，若评分要素非百分制，折算后扣分。');
    return remote
      ? remote.process('SSRC_SCORE_ELEMENTS_REMARK_RENDER_SCORE_NOTICE_THING', standard, {
          form,
          that: this,
        })
      : standard;
  }

  @Bind()
  renderFormulaField(form, formula) {
    const { remote } = this.props;
    const that = this;
    /* 平均价下浮: 直线斜率法禁选
     *  最高价: 非比例法禁选
     */
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
      ? remote.process('SSRC_SCORE_ELEMENTS_REMARK_PROCESS_FORM_FIELD_FORMULA', selection, {
          that,
          form,
          formula,
          benchmarkPriceMethod: form.getFieldValue('benchmarkPriceMethod'),
        })
      : selection;
    return values;
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
    const { scoreIndicDetail = {} } = record || {};
    return remote
      ? remote.process(
          'SSRC_SCORE_ELEMENTS_REMARK_PROCESS_REMARK_SCORE_FORMULA_FORM_HEADER',
          null,
          {
            form,
            scoreIndicDetail,
            that: this,
            record,
          }
        )
      : null;
  };

  @Bind()
  renderFormulaRow() {
    const { record = {}, form = {}, remote } = this.props;
    const { scoreIndicDetail = {} } = record;
    // 解决 formula 为二开类型时，无法跳过 aboveFactor 必输校验问题
    const cuxDom = remote?.process('SSRC_SCORE_ELEMENTS_REMARK_PROCESS_SCORE_FORMULA', null, {
      form,
      that: this,
      scoreIndicDetail,
    });
    if (cuxDom) return cuxDom;
    return (
      (form.getFieldValue('formula') === 'TWO_DIRECT_SLOPE' ||
        form.getFieldValue('formula') === 'BROKEN_LINE_SLOPE') && (
        <React.Fragment>
          <Row>
            {form.getFieldValue('formula') === 'TWO_DIRECT_SLOPE' ? (
              <Col span={9} style={{ width: '250px', marginLeft: '100px', marginTop: '10px' }}>
                <Text>
                  {intl
                    .get('ssrc.score.model.score.tSBP')
                    .d('以基准价为最高分，报价每高于基准价1%时扣')}
                </Text>
              </Col>
            ) : (
              <div>
                <Col span={2} style={{ width: '60px', marginLeft: '100px', marginTop: '10px' }}>
                  <Text>{intl.get('ssrc.score.model.score.tBasePrice').d('以基准价为')}</Text>
                </Col>
                <Col span={2}>
                  <Form.Item>
                    {form.getFieldDecorator('benchmarkScore', {
                      initialValue: scoreIndicDetail && scoreIndicDetail.benchmarkScore,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`ssrc.score.model.score.score`).d('分'),
                          }),
                        },
                      ],
                    })(<InputNumber precision={2} min={0} style={{ width: '60px' }} trim />)}
                  </Form.Item>
                </Col>
                <Col span={5} style={{ width: '168px', marginLeft: '4px', marginTop: '10px' }}>
                  <Text>
                    {intl.get('ssrc.score.model.score.dABPrice').d('分，报价每高于基准价1%时扣')}
                  </Text>
                </Col>
              </div>
            )}
            <Col span={2}>
              <Form.Item>
                {form.getFieldDecorator('aboveFactor', {
                  initialValue: scoreIndicDetail && scoreIndicDetail.aboveFactor,
                  rules: [
                    {
                      required: true,
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
                            'SSRC_SCORE_ELEMENTS_REMARK_RENDER_INPUT_NUMBER_ABOVE_FACTOR',
                            0,
                            {
                              benchmarkPriceMethod: form.getFieldValue('benchmarkPriceMethod'),
                            }
                          )
                        : 0
                    }
                    style={{ width: '60px' }}
                    trim
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={5} style={{ width: '150px', marginLeft: '5px', marginTop: '10px' }}>
              <Text>
                {remote
                  ? remote.render(
                      'SSRC_SCORE_ELEMENTS_REMARK_RENDER_BELOW_FACTOR_LABEL',
                      intl.get('ssrc.score.model.score.sQDetail').d('分，报价每低于基准价1%加'),
                      {
                        benchmarkPriceMethod: form.getFieldValue('benchmarkPriceMethod'),
                      }
                    )
                  : intl.get('ssrc.score.model.score.sQDetail').d('分，报价每低于基准价1%加')}
              </Text>
            </Col>
            <Col span={2}>
              <Form.Item>
                {form.getFieldDecorator('belowFactor', {
                  initialValue: scoreIndicDetail && scoreIndicDetail.belowFactor,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.score.model.score.score`).d('分'),
                      }),
                    },
                  ],
                })(
                  <InputNumber
                    precision={2}
                    style={{ width: '60px' }}
                    min={
                      remote
                        ? remote.process(
                            'SSRC_SCORE_ELEMENTS_REMARK_RENDER_INPUT_NUMBER',
                            this.getBrokenLineSlopeMin(),
                            {
                              benchmarkPriceMethod: form.getFieldValue('benchmarkPriceMethod'),
                            }
                          )
                        : this.getBrokenLineSlopeMin()
                    }
                    trim
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={1} style={{ marginLeft: '7px', marginTop: '10px' }}>
              <Text>{intl.get('ssrc.score.model.score.score').d('分')}</Text>
            </Col>
          </Row>
          <Row>
            <Col span={2} style={{ width: '50px', marginLeft: '100px', marginTop: '10px' }}>
              <Text>{intl.get('ssrc.score.model.score.minimumDT').d('最低扣至')}</Text>
            </Col>
            <Col span={2}>
              <Form.Item>
                {form.getFieldDecorator('lowestScore', {
                  initialValue: scoreIndicDetail && scoreIndicDetail.lowestScore,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.score.model.score.score`).d('分'),
                      }),
                    },
                  ],
                })(<InputNumber precision={2} min={0} style={{ width: '60px' }} trim />)}
              </Form.Item>
            </Col>
            <Col span={1} style={{ marginLeft: '7px', marginTop: '10px' }}>
              <Text>{intl.get('ssrc.score.model.score.score').d('分')}</Text>
            </Col>
          </Row>
          {remote
            ? remote.render('SSRC_SCORE_ELEMENTS_REMARK_RENDER_CUX_NODE', null, { _this: this })
            : null}
        </React.Fragment>
      )
    );
  }

  /**
   *  此方法被 [绝味] 重写
   * @protected
   */
  @Bind()
  renderContent() {
    const { record = {}, form = {}, score = {}, remote } = this.props;
    const { scoreIndicDetail = {} } = record;
    const {
      scoreCode: { benchmarkPriceMethod = [], formula = [] },
    } = score;
    return (
      <Form className={SEARCH_FORM_CLASSNAME}>
        {(form.getFieldValue('formula') || scoreIndicDetail?.formula) !== 'LINEAR_MAPPING' && (
          <Row>
            <Col span={8}>
              <Form.Item
                {...formLayout}
                label={intl.get('ssrc.score.model.score.bPEmethod').d('基准价计算方法')}
              >
                {form.getFieldDecorator('benchmarkPriceMethod', {
                  initialValue:
                    (scoreIndicDetail && scoreIndicDetail.benchmarkPriceMethod) || 'LOWEST_PRICE',
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
              {form.getFieldValue('benchmarkPriceMethod') === 'LOWEST_PRICE' && (
                <div style={{ marginTop: '11px' }}>
                  <Text>{intl.get('ssrc.score.model.score.basePrice').d('基准价=有效最低价')}</Text>
                </div>
              )}
              {form.getFieldValue('benchmarkPriceMethod') === 'HIGH_PRICE' && (
                <div style={{ marginTop: '11px' }}>
                  <Text>
                    {intl.get('ssrc.score.model.score.baseHighPrice').d('基准价=有效最高价')}
                  </Text>
                </div>
              )}
              {form.getFieldValue('benchmarkPriceMethod') === 'AVG_DOWN' && (
                <div style={{ marginTop: '5px', marginLeft: '5px' }}>
                  <Text>
                    {intl.get('ssrc.score.model.score.aVTP').d('基准价=有效投标价格平均值*')}
                  </Text>
                  {form.getFieldDecorator('benchmarkPriceFactor', {
                    initialValue:
                      scoreIndicDetail?.benchmarkPriceFactor ||
                      scoreIndicDetail?.benchmarkPriceFactor === 0
                        ? scoreIndicDetail?.benchmarkPriceFactor
                        : 100,
                  })(<InputNumber precision={2} min={0} style={{ width: '60px' }} trim />)}
                  {intl.get('ssrc.score.model.score.percentSign').d('%')}
                </div>
              )}
              {remote
                ? remote.process(
                    'SSRC_SCORE_ELEMENTS_REMARK_PROCESS_FORM_FIELD_BENCHMARK_PRICE_FACTOR',
                    null,
                    { form, scoreIndicDetail }
                  )
                : null}
            </Col>
          </Row>
        )}
        {form.getFieldValue('benchmarkPriceMethod') === 'AVG_DOWN' &&
          (form.getFieldValue('formula') || scoreIndicDetail?.formula) === 'BROKEN_LINE_SLOPE' && (
            <Row style={{ marginTop: '15px' }}>
              <Col span={8}>
                <Form.Item
                  labelCol={{ span: 21 }}
                  wrapperCol={{ span: 3 }}
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
                    {form.getFieldDecorator('enableRemoveExtremes', {
                      initialValue: scoreIndicDetail && scoreIndicDetail.enableRemoveExtremes,
                    })(
                      <Checkbox
                        disabled={
                          form.getFieldValue('benchmarkPriceMethod') !== 'AVG_DOWN' ||
                          (form.getFieldValue('formula') || scoreIndicDetail?.formula) !==
                            'BROKEN_LINE_SLOPE'
                        }
                        onChange={this.handleEnableRemoveExtremes}
                        checkedValue={1}
                        unCheckedValue={0}
                      />
                    )}
                  </Popover>
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  {...formLayout}
                  colon={false}
                  label={intl
                    .get('ssrc.score.model.score.validSupplierQuantity')
                    .d('有效报价供应商≥')}
                >
                  {form.getFieldDecorator('limitSupplierQuantity', {
                    initialValue: scoreIndicDetail && scoreIndicDetail.limitSupplierQuantity,
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
                  <Text style={{ marginLeft: '8px' }}>
                    {intl.get('ssrc.score.model.score.removalLowestAndHighestPrice').d('家时去除')}
                  </Text>
                </Form.Item>
              </Col>
            </Row>
          )}
        {this.cuxRenderFields()}
        <Row>
          <Col span={8}>
            <Form.Item
              {...formLayout}
              label={intl.get('ssrc.score.model.score.priceCFormula').d('价格计算公式')}
            >
              {form.getFieldDecorator('formula', {
                initialValue: (scoreIndicDetail && scoreIndicDetail.formula) || 'DIRECT_SLOPE',
              })(this.renderFormulaField(form, formula))}
            </Form.Item>
          </Col>
        </Row>
        {form.getFieldValue('formula') === 'DIRECT_SLOPE' && (
          <Row>
            <Col
              span={9}
              style={{
                width: this.WidthToAboveFactor(),
                marginLeft: '100px',
                marginTop: '10px',
              }}
            >
              <Text>{this.cuxAboveFactor()}</Text>
            </Col>
            <Col span={2}>
              <Form.Item>
                {form.getFieldDecorator('aboveFactor', {
                  initialValue: scoreIndicDetail && scoreIndicDetail.aboveFactor,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.score.model.score.score`).d('分'),
                      }),
                    },
                  ],
                })(<InputNumber precision={2} min={0} style={{ width: '60px' }} trim />)}
              </Form.Item>
            </Col>
            <Col span={3} style={{ width: '75px', marginLeft: '8px', marginTop: '10px' }}>
              <Text>{intl.get('ssrc.score.model.score.leastS').d('分，最低扣至')}</Text>
            </Col>
            <Col span={2}>
              <Form.Item>
                {form.getFieldDecorator('lowestScore', {
                  initialValue: scoreIndicDetail && scoreIndicDetail.lowestScore,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`ssrc.score.model.score.score`).d('分'),
                      }),
                    },
                  ],
                })(<InputNumber precision={2} min={0} style={{ width: '60px' }} trim />)}
              </Form.Item>
            </Col>
            <Col span={1} style={{ marginLeft: '7px', marginTop: '10px' }}>
              <Text>{intl.get('ssrc.score.model.score.score').d('分')}</Text>
            </Col>
          </Row>
        )}
        {form.getFieldValue('formula') === 'PROPORTION' && (
          <React.Fragment>
            <Row>
              <Col span={20} style={{ marginLeft: '100px', marginTop: '10px' }}>
                <Text>
                  {form.getFieldValue('benchmarkPriceMethod') !== 'HIGH_PRICE' &&
                    intl
                      .get('ssrc.score.model.score.propDes')
                      .d(
                        '以基准价为分子，供应商有效投标价为分母，供应商投标价得分 =（基准价/供应商投标价）*100 ，最低分为'
                      )}
                  {form.getFieldValue('benchmarkPriceMethod') === 'HIGH_PRICE' &&
                    intl
                      .get('ssrc.score.model.score.propHighDes')
                      .d(
                        '以供应商有效投标价为分子，基准价为分母，供应商投标得分 = （供应商投标价/基准价）*100，最低分为'
                      )}
                </Text>
              </Col>
            </Row>
            <Row>
              <Col span={2} style={{ marginLeft: '100px' }}>
                <Form.Item>
                  {form.getFieldDecorator('lowestScore', {
                    initialValue: scoreIndicDetail && scoreIndicDetail.lowestScore,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.score.model.score.score`).d('分'),
                        }),
                      },
                    ],
                  })(<InputNumber precision={2} min={0} style={{ width: '60px' }} trim />)}
                </Form.Item>
              </Col>
              <Col span={1} style={{ marginLeft: '8px', marginTop: '10px' }}>
                <Text>{intl.get('ssrc.score.model.score.score').d('分')}</Text>
              </Col>
            </Row>
          </React.Fragment>
        )}
        {this.renderFormulaRow()}
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
          <Row>
            <div style={{ marginLeft: '100px', marginTop: '40px' }}>
              <Text>{this.renderScoreRemark()}</Text>
            </div>
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
          width={750}
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
  }))(Form.create({ fieldNameProp: null })(NewComponent));
};

export { hocRemarkModal, RemarkModal };
export default hocRemarkModal(RemarkModal);
