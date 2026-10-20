/**
 * supplierRecord - 开标弹框
 * @date: 2019 1/2
 * @author: zili.hou@hand-china
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Input, Form, Row, Col, Button } from 'hzero-ui';
import intl from 'utils/intl';
import style from './OpeningBid.less';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
@Form.create({ fieldNameProp: null })
export default class supplierRecord extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator },
      visible,
      hideModal,
      confirmOpeningBid,
      resendPassword,
      openingBidLoading,
      resendPasswordLoading,
    } = this.props;
    const modalProps = {
      visible,
      width: 400,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '650px', overflow: 'auto' },
      // title: intl.get(`ssrc.inquiryHall.view.message.title.openingBidInter`).d('开标界面'),
      title: (
        <React.Fragment>
          <div className={style['open-bid']}>
            <Form layout="inline">
              <span style={{ position: 'absolute', left: '24px' }}>
                {intl.get(`ssrc.inquiryHall.view.message.title.openBidPage`).d('开标界面')}
              </span>
              <Button
                type="primary"
                loading={openingBidLoading}
                style={{ marginRight: 20 }}
                onClick={confirmOpeningBid}
              >
                {intl.get(`ssrc.inquiryHall.view.message.button.confirmOpeningBid`).d('确认开标')}
              </Button>
              <Button
                type="primary"
                loading={resendPasswordLoading}
                style={{ marginLeft: 8 }}
                onClick={resendPassword}
              >
                {intl.get(`ssrc.inquiryHall.view.message.button.resendPassword`).d('重发密码')}
              </Button>
            </Form>
          </div>
        </React.Fragment>
      ),
    };
    return (
      <React.Fragment>
        <Modal {...modalProps}>
          <Form>
            <Row>
              <Col span={22}>
                <Row>
                  <Col span={22} style={{ marginTop: 20 }}>
                    <FormItem
                      label={intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.inputBidPassword`)
                        .d('输入开标密码')}
                      {...formLayout}
                    >
                      {getFieldDecorator('openPassword', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`ssrc.inquiryHall.model.inquiryHall.openingBidPassword`)
                                .d('开标密码'),
                            }),
                          },
                          {
                            max: 10,
                            message: intl.get('hzero.common.validation.max', {
                              max: 10,
                            }),
                          },
                        ],
                      })(<Input trim inputChinese={false} style={{ marginLeft: 5 }} />)}
                    </FormItem>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}
