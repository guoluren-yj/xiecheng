/**
 * LogisticsForm - 送货单创建明细页面 - 物流信息Form
 * @date: 2018-10-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
import { Alert } from 'choerodon-ui';
import intl from 'utils/intl';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import Lov from 'components/Lov';
import styles from './list.less';

const FormItem = Form.Item;

/**
 * LogisticsForm - 送货单创建明细页面 - 物流信息Form
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class LogisticsForm extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) props.onRef(this);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form = {}, dataSource = {}, customizeForm, configSheetFlag = false } = this.props;
    const { getFieldDecorator = (e) => e, getFieldValue = (e) => e, setFields } = form;
    const {
      logisticsCompany,
      logisticsCompanyMeaning,
      logisticsStaff,
      logisticsContactInfo,
      expressNum,
      logisticsCost,
      logisticsPhoneNum,
      carNumber,
    } = dataSource;
    return (
      <>
        <Alert
          banner
          type="success"
          showIcon={false}
          message={
            <div className={styles['add-log-alert']}>
              <div className={styles['add-log-icon']} />
              <div>
                {intl
                  .get(`sinv.common.view.message.addLogistics.titleTooltip`)
                  .d(
                    '提示：为配合第三方物流公司升级查询服务，让您更精准地获取物流信息，建议您维护 “收件人手机号” 信息，感谢您的理解'
                  )}
              </div>
            </div>
          }
        />
        <div className={styles['add-log-form']}>
          {customizeForm(
            {
              form,
              dataSource,
              code: 'SINV.DELIVERY_CREATION_DETAIL.LOGISTICS',
            },
            <Form className={styles['logistics-form']}>
              <Row className="writable-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`sinv.common.model.common.logisticsCompany`).d('物流公司')}
                  >
                    {getFieldDecorator('logisticsCompany', {
                      initialValue: logisticsCompany,
                    })(
                      <Lov
                        code="SINV.ASN_SHIPPER_NAME"
                        textValue={logisticsCompanyMeaning}
                        onChange={() => {
                          setFields({
                            logisticsPhoneNum: {
                              value: getFieldValue('logisticsPhoneNum'),
                              errors: null,
                            },
                          });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row className="writable-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`sinv.common.model.common.logisticsStaff`).d('配送人员')}
                  >
                    {getFieldDecorator('logisticsStaff', {
                      initialValue: logisticsStaff,
                    })(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row className="writable-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`sinv.common.model.common.logisticsContactInfo`).d('联系方式')}
                  >
                    {getFieldDecorator('logisticsContactInfo', {
                      initialValue: logisticsContactInfo,
                    })(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row className="writable-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`sinv.common.model.common.logisticsCost`).d('物流费用')}
                  >
                    {getFieldDecorator('logisticsCost', {
                      initialValue: logisticsCost,
                    })(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row className="writable-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`sinv.common.model.common.expressNum`).d('快递单号')}
                  >
                    {getFieldDecorator('expressNum', {
                      initialValue: expressNum,
                    })(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row className="writable-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`sinv.common.model.common.logisticsPhoneNum`).d('收件人手机号')}
                  >
                    {getFieldDecorator('logisticsPhoneNum', {
                      initialValue: logisticsPhoneNum,
                      rules: [
                        {
                          required: configSheetFlag
                            ? getFieldValue('logisticsCompany') === 'SF'
                            : getFieldValue('logisticsCompany') || getFieldValue('expressNum'),
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`sinv.common.model.common.logisticsPhoneNum`)
                              .d('收件人手机号'),
                          }),
                        },
                        {
                          pattern: /^134[0-8]\d{7}$|^13[^4]\d{8}$|^14[5-9]\d{8}$|^15[^4]\d{8}$|^16[6]\d{8}$|^17[0-8]\d{8}$|^18[\d]{9}$|^19[8,9]\d{8}$/,
                          message: intl
                            .get(`sinv.common.model.common.phoneErrMsg`)
                            .d('手机号格式不正确'),
                        },
                      ],
                    })(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row className="writable-row">
                <Col {...FORM_COL_3_LAYOUT}>
                  <FormItem
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`sinv.common.model.common.carNumber`).d('车牌号')}
                  >
                    {getFieldDecorator('carNumber', {
                      initialValue: carNumber,
                      rules: [
                        {
                          max: 20,
                          message: intl.get('hzero.common.validation.max', { max: 20 }),
                        },
                      ],
                    })(<Input trimAll />)}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          )}
        </div>
      </>
    );
  }
}
