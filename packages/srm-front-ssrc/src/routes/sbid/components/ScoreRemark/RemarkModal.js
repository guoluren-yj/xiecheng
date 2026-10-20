import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, Select, Col, Row, InputNumber } from 'hzero-ui';
import { SEARCH_FORM_CLASSNAME } from 'utils/constants';
import { Bind } from 'lodash-decorators';
import { isNumber } from 'lodash';
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
@connect(({ score, loading }) => ({
  score,
  loading: loading.effects['score/fetchElementsDetailLine'],
  save: loading.effects['score/saveElementsDetail'],
}))
@Form.create({ fieldNameProp: null })
export default class RemarkModal extends PureComponent {
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

  /**
   * 弹框-保存
   */
  @Bind()
  handleSaveRemark() {
    const { form = {}, record = {}, onChangeRemarkModal } = this.props;
    const { evaluateIndicDetail = {} } = record;
    // 先验证头，再验证行
    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      const newData = {
        ...evaluateIndicDetail,
        ...values,
        tenantId: organizationId,
      };
      const saveData = { ...record, evaluateIndicDetail: newData };

      if (!err) {
        onChangeRemarkModal(saveData);
        this.props.onHideModal();
      }
    });
  }

  /**
   * 修改基准价计算方法
   */
  @Bind()
  changeBPriceMethod(e) {
    if (e === 'AVG_DOWN') {
      this.props.form.setFieldsValue({
        // formula: 'TWO_DIRECT_SLOPE',
        formula: 'BROKEN_LINE_SLOPE', // 平均价下浮，默认值为折线斜率法, 两直线暂未实现
      });
    }
  }

  /**
   * 关闭modal
   */
  @Bind()
  handleModalHide() {
    this.props.onHideModal();
  }

  render() {
    const {
      visible,
      record = {},
      save,
      form = {},
      benchmarkPriceMethod = [],
      formula = [],
    } = this.props;
    const { evaluateIndicDetail = {} } = record;
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
          <Form className={SEARCH_FORM_CLASSNAME}>
            <Row>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get('ssrc.score.model.score.bPEmethod').d('基准价计算方法')}
                >
                  {form.getFieldDecorator('benchmarkPriceMethod', {
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
                {form.getFieldValue('benchmarkPriceMethod') === 'LOWEST_PRICE' && (
                  <div style={{ marginTop: '11px' }}>
                    {intl.get('ssrc.score.model.score.basePrice').d('基准价=有效最低价')}
                  </div>
                )}
                {form.getFieldValue('benchmarkPriceMethod') === 'AVG_DOWN' && (
                  <Row style={{ marginLeft: '5px' }}>
                    <Col span={9} style={{ width: '160px', marginTop: '10px' }}>
                      {intl.get('ssrc.score.model.score.aVTP').d('基准价=有效投标价格平均值*')}
                    </Col>
                    <Col span={15}>
                      <Form.Item>
                        {form.getFieldDecorator('benchmarkPriceFactor', {
                          initialValue:
                            evaluateIndicDetail && evaluateIndicDetail.benchmarkPriceFactor,
                          rules: [
                            {
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl.get('ssrc.score.model.score.percent').d('百分比'),
                              }),
                            },
                          ],
                        })(<InputNumber precision={2} min={0} style={{ width: '60px' }} trim />)}
                        {intl.get('ssrc.score.model.score.percentSign').d('%')}
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get('ssrc.score.model.score.priceCFormula').d('价格计算公式')}
                >
                  {form.getFieldDecorator('formula', {
                    initialValue:
                      (evaluateIndicDetail && evaluateIndicDetail.formula) || 'DIRECT_SLOPE',
                  })(
                    <Select>
                      {formula &&
                        formula.map((item) => (
                          <Select.Option
                            value={item.value}
                            key={item.value}
                            disabled={
                              form.getFieldValue('benchmarkPriceMethod') === 'AVG_DOWN' &&
                              item.value === 'DIRECT_SLOPE'
                            }
                          >
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            {form.getFieldValue('formula') === 'DIRECT_SLOPE' && (
              <Row>
                <Col span={9} style={{ width: '250px', marginLeft: '100px', marginTop: '10px' }}>
                  {intl
                    .get('ssrc.score.model.score.tSBP')
                    .d('以基准价为最高分，报价每高于基准价1%时扣')}
                </Col>
                <Col span={2}>
                  <Form.Item>
                    {form.getFieldDecorator('aboveFactor', {
                      initialValue: evaluateIndicDetail && evaluateIndicDetail.aboveFactor,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`ssrc.score.model.score.score`).d('分'),
                          }),
                        },
                      ],
                    })(<InputNumber precision={0} min={0} style={{ width: '60px' }} trim />)}
                  </Form.Item>
                </Col>
                <Col span={3} style={{ width: '75px', marginLeft: '8px', marginTop: '10px' }}>
                  {intl.get('ssrc.score.model.score.leastS').d('分，最低扣至')}
                </Col>
                <Col span={2}>
                  <Form.Item>
                    {form.getFieldDecorator('lowestScore', {
                      initialValue: evaluateIndicDetail && evaluateIndicDetail.lowestScore,
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
                  {intl.get('ssrc.score.model.score.score').d('分')}
                </Col>
              </Row>
            )}
            {form.getFieldValue('formula') === 'PROPORTION' && (
              <React.Fragment>
                <Row>
                  <Col span={20} style={{ marginLeft: '100px', marginTop: '10px' }}>
                    {intl
                      .get('ssrc.score.model.score.propDes')
                      .d(
                        '以基准价为分子，供应商有效投标价为分母，供应商投标价得分 =（基准价/供应商投标价）*100 ，最低分为'
                      )}
                  </Col>
                </Row>
                <Row>
                  <Col span={2} style={{ marginLeft: '100px' }}>
                    <Form.Item>
                      {form.getFieldDecorator('lowestScore', {
                        initialValue: evaluateIndicDetail && evaluateIndicDetail.lowestScore,
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
                    {intl.get('ssrc.score.model.score.score').d('分')}
                  </Col>
                </Row>
              </React.Fragment>
            )}
            {form.getFieldValue('formula') !== 'DIRECT_SLOPE' &&
              form.getFieldValue('formula') !== 'PROPORTION' && (
                <React.Fragment>
                  <Row>
                    {form.getFieldValue('formula') === 'TWO_DIRECT_SLOPE' ? (
                      <Col
                        span={9}
                        style={{ width: '250px', marginLeft: '100px', marginTop: '10px' }}
                      >
                        {intl
                          .get('ssrc.score.model.score.tSBP')
                          .d('以基准价为最高分，报价每高于基准价1%时扣')}
                      </Col>
                    ) : (
                      <div>
                        <Col
                          span={2}
                          style={{ width: '60px', marginLeft: '100px', marginTop: '10px' }}
                        >
                          {intl.get('ssrc.score.model.score.tBasePrice').d('以基准价为')}
                        </Col>
                        <Col span={2}>
                          <Form.Item>
                            {form.getFieldDecorator('benchmarkScore', {
                              initialValue:
                                evaluateIndicDetail && evaluateIndicDetail.benchmarkScore,
                              rules: [
                                {
                                  required: true,
                                  message: intl.get('hzero.common.validation.notNull', {
                                    name: intl.get(`ssrc.score.model.score.score`).d('分'),
                                  }),
                                },
                              ],
                            })(
                              <InputNumber precision={0} min={0} style={{ width: '60px' }} trim />
                            )}
                          </Form.Item>
                        </Col>
                        <Col
                          span={5}
                          style={{ width: '168px', marginLeft: '4px', marginTop: '10px' }}
                        >
                          {intl.get('ssrc.score.model.score.dABP').d('分，报价每高于基准价1%时扣')}
                        </Col>
                      </div>
                    )}
                    <Col span={2}>
                      <Form.Item>
                        {form.getFieldDecorator('aboveFactor', {
                          initialValue: evaluateIndicDetail && evaluateIndicDetail.aboveFactor,
                          rules: [
                            {
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl.get(`ssrc.score.model.score.score`).d('分'),
                              }),
                            },
                          ],
                        })(<InputNumber precision={0} min={0} style={{ width: '60px' }} trim />)}
                      </Form.Item>
                    </Col>
                    <Col span={5} style={{ width: '150px', marginLeft: '5px', marginTop: '10px' }}>
                      {intl.get('ssrc.score.model.score.sQDetail').d('分，报价每低于基准价1%加')}
                    </Col>
                    <Col span={2}>
                      <Form.Item>
                        {form.getFieldDecorator('belowFactor', {
                          initialValue: evaluateIndicDetail && evaluateIndicDetail.belowFactor,
                          rules: [
                            {
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl.get(`ssrc.score.model.score.score`).d('分'),
                              }),
                            },
                          ],
                        })(<InputNumber precision={0} style={{ width: '60px' }} min={0} trim />)}
                      </Form.Item>
                    </Col>
                    <Col span={1} style={{ marginLeft: '7px', marginTop: '10px' }}>
                      {intl.get('ssrc.score.model.score.score').d('分')}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={2} style={{ width: '50px', marginLeft: '100px', marginTop: '10px' }}>
                      {intl.get('ssrc.score.model.score.minimumDT').d('最低扣至')}
                    </Col>
                    <Col span={2}>
                      <Form.Item>
                        {form.getFieldDecorator('lowestScore', {
                          initialValue: evaluateIndicDetail && evaluateIndicDetail.lowestScore,
                          rules: [
                            {
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl.get(`ssrc.score.model.score.score`).d('分'),
                              }),
                            },
                          ],
                        })(<InputNumber precision={0} min={0} style={{ width: '60px' }} trim />)}
                      </Form.Item>
                    </Col>
                    <Col span={1} style={{ marginLeft: '7px', marginTop: '10px' }}>
                      {intl.get('ssrc.score.model.score.score').d('分')}
                    </Col>
                  </Row>
                </React.Fragment>
              )}
            <Row>
              <div style={{ marginLeft: '100px', marginTop: '40px' }}>
                {intl
                  .get('ssrc.score.model.score.PAC')
                  .d('注：以百分制扣分，若评分要素非百分制，折算后扣分。')}
              </div>
            </Row>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}
