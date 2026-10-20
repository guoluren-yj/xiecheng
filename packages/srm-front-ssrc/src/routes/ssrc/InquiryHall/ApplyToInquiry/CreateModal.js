import React, { Component } from 'react';
import { Modal, Form, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import { fetchInitTemplate } from '@/services/inquiryHallNewService';
import { getResponse } from 'utils/utils';

const FormItem = Form.Item;

class CreateModalComponent extends Component {
  componentDidMount() {
    this.getInitTemplate();
    this.handleCuxFunction();
  }

  /**
   * 模板数据初始化
   * @protected 此方法被 [永祥] 二开, 禁止修改方法名, 谨慎修改逻辑
   */
  @Bind()
  getInitTemplate() {
    const {
      form: { setFieldsValue },
      bidFlag = false,
    } = this.props;
    const params = {
      sourceFrom: 'DEMAND_POOL',
    };
    if (bidFlag) return;
    fetchInitTemplate(params).then((res) => {
      if (getResponse(res)) {
        setFieldsValue({
          templateId: res.templateId,
          templateName: res.templateName,
        });
      }
    });
  }

  handleCuxFunction = () => {
    const { remote, purchaseRequestDS } = this.props;
    if (remote.event) {
      remote.event.fireEvent('handleCuxFunctionCreateModal', {
        that: this,
        purchaseRequestDS,
      });
    }
  };

  @Bind()
  changeTemplateId(val, record) {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({
      templateId: record.templateId,
    });
  }

  @Bind()
  onClickSubmit() {
    const {
      createInquiry,
      form: { validateFields },
    } = this.props;
    validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      await createInquiry(values);
    });
  }

  /**
   * Lov请求参数
   * @protected (【山鹰、玛格】二开)禁止修改、删除此方法名
   */
  getLovParams = (bidFlag) => {
    const { remote, state, form } = this.props;
    const params = {
      sourceCategory: 'RFX',
      secondarySourceCategory: bidFlag ? 'NEW_BID' : null,
    };
    if (remote) {
      return remote.process('SSRC_APPLY_TO_INQUIRY_PROCESS_CREATE_MODAL_LOV_PARAMS', params, {
        state,
        bidFlag,
        form,
      });
    }
    return params;
  };

  // render form
  renderFormContent = () => {
    const {
      remote,
      bidFlag,
      form,
      form: { getFieldDecorator },
    } = this.props;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };

    const fields = [
      <FormItem
        label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板')}
        {...formLayout}
      >
        {getFieldDecorator('templateId', {
          rules: [
            {
              required: true,
              message: intl.get('hzero.common.validation.notNull', {
                name: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
              }),
            },
          ],
        })(
          <Lov
            code="SSRC.TEMPLATE_NAME"
            queryParams={this.getLovParams(bidFlag)}
            textField="templateName"
            onChange={(val, record) => this.changeTemplateId(val, record)}
          />
        )}
      </FormItem>,
    ];

    const formFields = remote
      ? remote.process('SSRC_APPLY_TO_INQUIRY_PROCESS_CREATE_MODAL_FORM_FIELDS', fields, {
          getFieldDecorator,
          bidFlag,
          formLayout,
          FormItem,
          that: this,
          form,
        })
      : fields;

    return (
      <Form>
        {formFields}
        {/* <FormItem
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别')}
          {...formLayout}
        >
          {getFieldDecorator('sourcingCategory')(<Input trim maxLength={40} />)}
        </FormItem> */}
      </Form>
    );
  };

  render() {
    const { visible, onCancel, createLoading } = this.props;

    return (
      <Modal
        visible={visible}
        width={350}
        maskClosable
        destroyOnClose
        onCancel={onCancel}
        title={intl
          .get(`ssrc.inquiryHall.view.message.title.selectSourceTemplate`)
          .d('选择寻源模板')}
        footer={
          <Button type="primary" loading={createLoading} onClick={this.onClickSubmit}>
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
        }
      >
        {this.renderFormContent()}
      </Modal>
    );
  }
}

const HOCComponent = (Com) => {
  return Form.create({ fieldNameProp: null })(observer(Com));
};

export default HOCComponent(CreateModalComponent);
export { CreateModalComponent, HOCComponent };
