// BatchEmptySelectedModal 批量操作时候为勾选数据弹窗

import React, { Component } from 'react';
import { Modal, Form, Row, Col } from 'hzero-ui';

import Checkbox from 'components/Checkbox';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUserId, getResponse } from 'utils/utils';
import { FORM_COL_2_3_LAYOUT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';

import { changeRfxDetailLayout as changeUserConfig } from '@/services/inquiryHallService';

const formLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 12 },
};

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['ssrc.inquiryHall', 'ssrc.common'],
})
export default class BatchEmptySelectedModal extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
  }

  messageDirection = () => {
    const { parentPage = {} } = this.props;
    const { name = null } = parentPage;

    let message = null;
    switch (name) {
      case 'participation': // 参与
        message = intl
          .get('ssrc.common.view.message.onParticipageCurrentInBat')
          .d('是否确认只参与当前标段，若要批量参与，请先点击“选择标段”后，再点击“参与”按钮？');
        break;
      case 'checkPrice': // 核价
        message = intl
          .get('ssrc.common.view.message.CheckPricePageCurrentInBat')
          .d('是否确认只提交当前标段，若要批量提交，请先点击“选择标段”后，再点击“提交按钮”？');
        break;
      case 'startRoundQuotation': // 发起多轮报价
        message = intl
          .get('ssrc.common.view.message.startRoundQuotationCurrentInBat')
          .d(
            '是否确认只发起当前标段的多轮报价，若要批量发起，请先点击“选择标段”后，再点击“发起多轮报价”？'
          );
        break;
      case 'newRoundQuotation': // 发起新一轮多轮报价
        message = intl
          .get('ssrc.common.view.message.newRoundQuotationCurrentInBat')
          .d(
            '是否确认只发起当前标段，若要批量发起，请先点击“选择标段”后，再点击“发起新一轮报价”按钮？'
          );
        break;
      case 'sureRoundQuotation': // 确定最终多轮报价
        message = intl
          .get('ssrc.common.view.message.sureRoundQuotationCurrentInBat')
          .d(
            '是否确认只当前标段终轮结束，若要批量确认，请先点击“选择标段”后，再点击“确认终轮报价结束”按钮？'
          );
        break;
      default:
        break;
    }

    return message;
  };

  componentDidMount() {}

  // 保存
  saveUserConfigBatch = async (config = {}) => {
    const configValue = this.getFormData();

    try {
      let data = await changeUserConfig({
        organizationId: getCurrentOrganizationId(),
        userId: getCurrentUserId(),
        enabledFlag: 1,
        ...config,
        configValue: configValue ? 'hide' : 'display',
      });
      data = getResponse(data);
      if (!data) {
        return;
      }
    } catch (e) {
      throw e;
    }
  };

  // form data
  getFormData = () => {
    const { form } = this.props;
    const { configValue = 0 } = form.getFieldsValue();
    return configValue;
  };

  setValue = (e = {}) => {
    const { form } = this.props;

    if (e.target.checked === 1) {
      form.setFieldsValue({
        abandonedFlag: 1,
      });
    }
  };

  render() {
    const {
      visible = false,
      form: { getFieldDecorator },
      handleOk = () => {},
      handleCancel = () => {},
    } = this.props;
    const message = this.messageDirection();

    return (
      <Modal
        visible={visible}
        closable
        maskClosable
        destroyOnClose
        title={intl.get(`ssrc.common.view.message.`).d('是否确认')}
        onCancel={handleCancel}
        onOk={handleOk}
      >
        <div style={{ marginBottom: '16px' }}>{message}</div>
        <Form>
          <Row gutter={48} className="read-row">
            <Col {...FORM_COL_2_3_LAYOUT}>
              <Form.Item
                label={intl.get(`ssrc.common.view.nextOpenHide`).d('下次打开时候不显示')}
                {...formLayout}
              >
                {getFieldDecorator('configValue', {
                  initialValue: 0,
                })(<Checkbox checkedValue={1} unCheckedValue={0} onChange={this.setValue} />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
