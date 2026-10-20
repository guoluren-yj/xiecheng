/*
 * LogisticsInfoModal - 物流信息补录
 * @date: 2018/11/16 10:20:37
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Modal, Input, Row, Col, Select } from 'hzero-ui';
import { Alert } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { join } from 'lodash';

import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create({ fieldNameProp: null })
export default class LogisticsInfoModal extends PureComponent {
  /**
   * 物流信息补录
   */
  @Bind()
  handleSupplement() {
    const {
      form: { validateFields },
      onLogistics,
    } = this.props;
    validateFields((errs, values) => {
      if (!errs) {
        onLogistics(values);
      }
    });
  }

  /**
   * 渲染表单
   */
  @Bind()
  renderForm() {
    const {
      form = {},
      dataSource,
      enumMap = {},
      customizeForm = (e) => e,
      phone = [],
      configSheetFlag = false,
    } = this.props;
    const { getFieldDecorator = (e) => e, getFieldValue, setFields } = form;
    const { logicStatus = [] } = enumMap;
    const phoneError = form.getFieldError('logisticsPhoneNum');
    const samePhone = getFieldValue('logisticsPhoneNum') === dataSource?.logisticsPhoneNum;
    return customizeForm(
      {
        form,
        dataSource,
        code: 'SINV.SUPPLIER_DELIVERY.DETAIL.ADD_LOGISTICS',
      },
      <Form className={styles['add-logistics']}>
        <Row className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.logisticsCompany`).d('物流公司')}
            >
              {getFieldDecorator('logisticsCompany', {
                initialValue: dataSource?.logisticsCompany,
              })(
                <Lov
                  code="SINV.ASN_SHIPPER_NAME"
                  textValue={dataSource?.logisticsCompanyMeaning}
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
                initialValue: dataSource?.logisticsStaff,
                rules: [
                  {
                    max: 240,
                    message: intl
                      .get(`hzero.common.validation.max`, {
                        max: 240,
                      })
                      .d(`长度不能超过240个字符`),
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
              label={intl.get(`sinv.common.model.common.logisticsContactInfo`).d('联系方式')}
            >
              {getFieldDecorator('logisticsContactInfo', {
                initialValue: dataSource?.logisticsContactInfo,
                rules: [
                  {
                    max: 240,
                    message: intl
                      .get(`hzero.common.validation.max`, {
                        max: 240,
                      })
                      .d(`长度不能超过240个字符`),
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
              label={intl.get(`sinv.common.model.common.logisticsCost`).d('物流费用')}
            >
              {getFieldDecorator('logisticsCost', {
                initialValue: dataSource?.logisticsCost,
                rules: [
                  {
                    max: 240,
                    message: intl
                      .get(`hzero.common.validation.max`, {
                        max: 240,
                      })
                      .d(`长度不能超过240个字符`),
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
              label={intl.get(`sinv.common.model.common.expressNum`).d('快递单号')}
            >
              {getFieldDecorator('expressNum', {
                initialValue: dataSource?.expressNum,
                rules: [
                  {
                    max: 150,
                    message: intl
                      .get(`hzero.common.validation.max`, {
                        max: 150,
                      })
                      .d(`长度不能超过150个字符`),
                  },
                ],
              })(<Input trimAll />)}
            </FormItem>
          </Col>
        </Row>
        <Row className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.logisticsPhoneNum`).d('收件人手机号')}
              hasFeedback
              help={phoneError ? join(phoneError) : ''}
              validateStatus={phoneError ? 'error' : samePhone ? 'success' : 'warning'}
            >
              {getFieldDecorator('logisticsPhoneNum', {
                initialValue: dataSource.logisticsPhoneNum,
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
                  // {
                  //   pattern: /^134[0-8]\d{7}$|^13[^4]\d{8}$|^14[5-9]\d{8}$|^15[^4]\d{8}$|^16[6]\d{8}$|^17[0-8]\d{8}$|^18[\d]{9}$|^19[8,9]\d{8}$/,
                  //   message: intl.get(`sinv.common.model.common.phoneErrMsg`).d('手机号格式不正确'),
                  // },
                  {
                    // pattern: this.getPhoneNumRule(currentLanguange),
                    pattern:
                      getFieldValue('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
                    message: intl.get(`sinv.common.model.common.phoneErrMsg`).d('手机号格式不正确'),
                  },
                ],
              })(
                <Input
                  addonBefore={getFieldDecorator('internationalTelCode', {
                    initialValue:
                      dataSource?.internationalTelCode || (phone[0] && phone[0].value) || '+86',
                  })(
                    <Select>
                      {phone?.map((n) => (
                        <Select.Option key={n?.value} value={n?.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`sinv.common.model.common.logisticsReceiptStatus`).d('物流签收状态')}
            >
              {getFieldDecorator('logisticsReceiptStatus', {
                initialValue: dataSource?.logisticsReceiptStatus,
              })(
                <Select allowClear>
                  {logicStatus?.map((n) => (
                    <Option key={n?.value} value={n?.value}>
                      {n?.meaning}
                    </Option>
                  ))}
                </Select>
              )}
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
                initialValue: dataSource?.carNumber,
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
    );
  }

  render() {
    const { hideModal, visible = false, loading } = this.props;
    return (
      <Modal
        title={intl.get(`sinv.supplierDelivery.view.message.addLogistics.title`).d('物流信息补录')}
        width={520}
        confirmLoading={loading}
        visible={visible}
        bodyStyle={{
          maxHeight: '600px',
          overflow: 'auto',
          paddingTop: 0,
          paddingLeft: 0,
          paddingRight: 0,
        }}
        onCancel={hideModal}
        onOk={this.handleSupplement}
      >
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
        <div className={styles['add-log-form']}>{this.renderForm()}</div>
      </Modal>
    );
  }
}
