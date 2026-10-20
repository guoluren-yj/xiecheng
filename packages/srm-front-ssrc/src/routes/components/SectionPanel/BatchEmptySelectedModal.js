// BatchEmptySelectedModal 批量操作时候为勾选数据弹窗

import React, { Component } from 'react';
import { Modal, Form, Row } from 'hzero-ui';

import Checkbox from 'components/Checkbox';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUserId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { changeRfxDetailLayout as changeUserConfig } from '@/services/inquiryHallService';

import styles from './index.less';

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
      case 'supplierQuotation':
        message = intl
          .get('ssrc.common.view.message.onCurrentSubmitBatchSure')
          .d('是否确认只提交当前标段，若要批量提交，请先点击“选择标段”后，再点击“提交”按钮？');
        break;
      case 'checkPrice':
        message = intl
          .get('ssrc.common.view.message.CheckPricePageCurrentInBat')
          .d('是否确认只提交当前标段，若要批量提交，请先点击“选择标段”后，再点击“提交按钮”？');
        break;
      case 'barginPirceStart': // 发起议价
        message = intl
          .get('ssrc.common.view.message.barginPricePageCurrentInBatStart')
          .d('是否确认只发起当前标段，若要批量发起，请先点击“选择标段”后，再点击“发起议价”按钮？');
        break;
      case 'barginPirceEnd': // 结束议价
        message = intl
          .get('ssrc.common.view.message.barginPricePageCurrentInBatStart')
          .d('是否确认只结束当前标段，若要批量结束，请先点击“选择标段”后，再点击“结束议价”按钮？');
        break;
      case 'barginPirceFinish': // 完成议价
        message = intl
          .get('ssrc.common.view.message.barginPricePageCurrentInBatStart')
          .d('是否确认只完成当前标段，若要批量完成，请先点击“选择标段”后，再点击“完成议价”按钮？');
        break;
      case 'supplierBiddingOfferSave':
        message = intl
          .get('ssrc.common.view.message.bidSectionSaveWarnSwitch')
          .d('若要批量提交多标段报价，请先勾选当前标段下需提交的报价行数据');
        break;
      case 'onlineSave':
        message = intl
          .get('ssrc.common.view.message.onlineSaveToStartEnd')
          .d('若要批量发起或结束议价，请先勾选当前标段下需提交的行数据');
        break;
      default:
        message = intl
          .get('ssrc.common.view.message.onCurrentSubmitBatchSure')
          .d('是否确认只提交当前标段，若要批量提交，请先点击“选择标段”后，再点击“提交”按钮？');
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

        <Form className={styles['batch-select-form']}>
          <Row gutter={48} className="read-row">
            <Form.Item>
              {getFieldDecorator('configValue', {
                initialValue: 0,
              })(
                <Checkbox checkedValue={1} unCheckedValue={0} onChange={this.setValue}>
                  {intl.get(`ssrc.common.view.nextOpenHide`).d('下次打开时候不显示')}
                </Checkbox>
              )}
            </Form.Item>
          </Row>
        </Form>
      </Modal>
    );
  }
}
