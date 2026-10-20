/**
 * 成本备注表单
 * @date: 2021-07-07
 * @author: Goku<xu.pan01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, ZhenYun
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Input } from 'hzero-ui';
// import classnames from 'classnames';
import { isFunction } from 'lodash';

import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import { INQUIRY, getCheckPriceName } from '@/utils/globalVariable';

const { TextArea } = Input;
const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class CostRemarkForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    // eslint-disable-next-line no-unused-expressions
    isFunction(onRef) && onRef(this, 'costRemarkFormRef');
  }

  render() {
    const {
      header,
      sectionFlag,
      customizeForm,
      projectTotalPrice,
      form = {},
      sourceKey = INQUIRY,
    } = this.props;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.COST`,
        form,
        dataSource: header,
      },
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.totalCost`).d('总成本')}
              {...formLayout}
            >
              {getFieldDecorator('totalCost', {
                initialValue: header.totalCost,
              })(
                <PrecisionInputNumber
                  type="hzero"
                  financial={header.currencyCode}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          {sectionFlag ? (
            <Col span={8}>
              <FormItem
                label={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.projectAllPrice`)
                  .d('寻源项目总金额')}
                {...formLayout}
              >
                {getFieldDecorator('projectTotalPrice', {
                  initialValue: projectTotalPrice,
                })(<span> {projectTotalPrice || '-'} </span>)}
              </FormItem>
            </Col>
          ) : null}
          <Col span={8}>
            <FormItem
              label={
                sectionFlag
                  ? intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionTotalPrice`).d('标段总金额')
                  : intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.commomTotalPrice`, {
                        checkPriceName: getCheckPriceName(sourceKey === 'NEW_BID'),
                      })
                      .d('{checkPriceName}总金额')
              }
              {...formLayout}
            >
              {getFieldDecorator('totalPrice', {
                initialValue: header.totalPrice,
              })(
                <PrecisionInputNumber
                  financial={header.currencyCode}
                  disabled
                  type="hzero"
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostFlag`).d('是否超成本')}
              {...formLayout}
            >
              {getFieldDecorator('overCostFlag', {
                initialValue: header.overCostFlag,
              })(<span>{yesOrNoRender(header.overCostFlag)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostPrice`).d('超成本金额')}
              {...formLayout}
            >
              {getFieldDecorator('overCostPrice', {
                initialValue: header.overCostPrice,
              })(
                <PrecisionInputNumber
                  financial={header.currencyCode}
                  disabled
                  type="hzero"
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostScale`).d('超成本百分比')}
              {...formLayout}
            >
              {getFieldDecorator('overCostScale', {
                initialValue: header.overCostScale,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={12}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.costRemark`).d('成本备注')}
            >
              {getFieldDecorator('costRemark', {
                initialValue: header.costRemark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(<TextArea rows={2} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
