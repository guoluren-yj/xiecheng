import React from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import intl from 'utils/intl';

const { TextArea } = Input;
const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class PackageRecommendationModel extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {};
  }

  render() {
    const {
      header = {},
      visible,
      hideModal,
      form: { getFieldDecorator },
      saveSuggestedRemark,
      confirmLoading,
      item,
      loadloading,
    } = this.props;

    const { onlyAllowAllWinBids = 0 } = header || {};

    return (
      <Modal
        visible={visible}
        width={700}
        onCancel={(e) => hideModal(e, item.rfxLineSupplierId, item.quotationHeaderId)}
        title={intl.get(`ssrc.inquiryHall.model.inquiryHall.distributionRatio`).d('分配比例')}
        onOk={saveSuggestedRemark}
        okText={intl.get('hzero.common.button.confirm').d('确认')}
        confirmLoading={loadloading || confirmLoading}
        destroyOnClose
      >
        <Form>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%')}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 10 }}
          >
            {getFieldDecorator('allottedRatio', {
              rules: [
                {
                  required: !!onlyAllowAllWinBids,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`)
                      .d('分配比例%'),
                  }),
                },
                {
                  pattern: /^(?:0|[1-9][0-9]?|100)$/,
                  message: intl
                    .get('ssrc.inquiryHall.model.inquiryHall.onlyNumber')
                    .d('只能输入0-100的数字'),
                },
              ],
              initialValue: item.allottedRatio,
            })(<Input />)}
          </FormItem>
          <FormItem
            label={intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由')}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
          >
            {getFieldDecorator('suggestedRemark', {
              initialValue: item.suggestedRemark,
            })(<TextArea rows={4} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
