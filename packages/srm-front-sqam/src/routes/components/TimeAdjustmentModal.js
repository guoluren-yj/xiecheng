/**
 *@Author: jiwei.liu01@hand-china.com
 * @Date: 2021-05-13 16:29:01
 * @Last Modified time: 2021-05-13 16:29:01
 * @copyright : { Copyright (c) 2021, Hand}
 */
import React, { PureComponent } from 'react';
import { isFunction } from 'lodash';
import { Modal, Row, Col, DatePicker, Button, Input, Form } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import styles from './TimeAdjustmentModal.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const prefix = `sqam.common.model.timeAdjustment`;
@Form.create({ fieldNameProp: null })
export default class TimeAdjustmentModal extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this, 'basicInfo');
    }
  }

  /**
   * 确认回调
   */
  @Bind()
  handleOk() {
    const {
      onOk,
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        if (onOk) {
          onOk(values);
          this.handleCancel();
        }
      }
    });
  }

  @Bind()
  handleCancel() {
    const {
      onClose,
      form: { resetFields },
    } = this.props;
    resetFields();
    onClose();
  }

  render() {
    const { form = {}, basicInfo, dateTimeLoading, timeAdjustmentVisible } = this.props;
    const { getFieldDecorator = (e) => e, getFieldValue } = form;
    const formLayout = {
      labelCol: { span: 6, offset: 0 },
      wrapperCol: { span: 18 },
    };
    return (
      <Modal
        visible={timeAdjustmentVisible}
        onCancel={this.handleCancel}
        width={600}
        title={intl.get(`entity.attachment.timeAdjustment`).d('时间调整')}
        footer={[
          <Button key="ok" type="primary" onClick={this.handleOk} loading={dateTimeLoading}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>,
          <Button key="cancel" onClick={this.handleCancel}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>,
        ]}
        className={styles['purchase-application']}
      >
        <Form>
          <Row gutter={16}>
            <Col span={24}>
              <FormItem
                label={intl.get(`${prefix}.icaDemandDate`).d('ICA要求时间')}
                {...formLayout}
              >
                {getFieldDecorator('icaDemandDate', {
                  initialValue: basicInfo.icaDemandDate && moment(basicInfo.icaDemandDate),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prefix}.icaDemandDate`).d('ICA要求时间'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    disabled={!['PUBLISHED'].includes(basicInfo.problemStatus)}
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder=""
                    // disabledDate={(date) =>
                    //   getFieldValue('icaDemandDate') &&
                    //   moment(getFieldValue('icaDemandDate')).isAfter(date, 'second')
                    // }
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <FormItem
                label={intl.get(`${prefix}.pcaDemandDate`).d('PCA要求日期')}
                {...formLayout}
              >
                {getFieldDecorator('pcaDemandDate', {
                  initialValue: basicInfo.pcaDemandDate && moment(basicInfo.pcaDemandDate),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prefix}.pcaDemandDate`).d('PCA要求日期'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    disabled={
                      !['PUBLISHED', 'ICA_SUBMITTED', 'ICA_REJECTED', 'PCA_FEEDBACKING'].includes(
                        basicInfo.problemStatus
                      )
                    }
                    format="YYYY-MM-DD"
                    placeholder=""
                    disabledDate={(date) =>
                      getFieldValue('icaDemandDate') &&
                      moment(getFieldValue('icaDemandDate')).isAfter(date, 'second')
                    }
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <FormItem
                label={intl.get(`${prefix}.adjustmentRemark`).d('调整说明')}
                {...formLayout}
              >
                {getFieldDecorator('adjustmentRemark', {
                  initialValue: basicInfo.adjustmentRemark,
                  rules: [
                    {
                      required: true,
                      // max: 120,
                      message: intl.get(`${prefix}.adjustmentRemark`).d('调整说明'),
                    },
                  ],
                })(<TextArea rows={3} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
