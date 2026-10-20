import React, { Component } from 'react';
import { Modal, Form, Col, Row, Input } from 'hzero-ui';
import Switch from 'components/Switch';
import TLEditor from 'components/TLEditor';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
@Form.create({ fieldNameProp: null })
export default class MaintainModel extends Component {
  @Bind()
  handleSupplement() {
    const {
      form: { validateFields },
      addItem,
      maintainObj,
    } = this.props;
    validateFields((errs, values) => {
      if (!errs) {
        const updateList = { ...maintainObj, ...values };
        addItem(updateList);
      }
    });
  }

  render() {
    const {
      visible,
      hideModal,
      form: { getFieldDecorator },
      updateFlag,
      maintainObj,
    } = this.props;
    return (
      <React.Fragment>
        <Modal
          title={
            updateFlag
              ? intl.get(`sinv.acceptanceSheetType.view.title.maintain`).d('验收单类型维护')
              : intl.get(`sinv.acceptanceSheetType.view.title.create`).d('验收单类型新建')
          }
          width={520}
          visible={visible}
          bodyStyle={{ maxHeight: '600px', overflow: 'auto' }}
          onCancel={hideModal}
          onOk={this.handleSupplement}
        >
          <Row>
            <Col>
              <FormItem
                label={intl
                  .get(`sinv.acceptanceSheetType.common.acceptListTypeCode`)
                  .d('验收单类型编码')}
                {...formItemLayout}
              >
                {getFieldDecorator('acceptListTypeCode', {
                  initialValue: maintainObj.acceptListTypeCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sinv.acceptanceSheetType.common.acceptListTypeCode`)
                          .d('验收单类型编码'),
                      }),
                    },
                    {
                      pattern: /^[a-zA-Z\d]+$/,
                      message: intl
                        .get(`sinv.acceptanceSheetType.common.acceptListTypeCodeCheck`)
                        .d('验收单类型编码只能由字母或数字组成'),
                    },
                  ],
                })(<Input disabled={updateFlag} />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <FormItem
                label={intl
                  .get(`sinv.acceptanceSheetType.common.acceptListTypeName`)
                  .d('验收单类型名称')}
                {...formItemLayout}
              >
                {getFieldDecorator('acceptListTypeName', {
                  initialValue: maintainObj.acceptListTypeName,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl
                          .get(`sinv.acceptanceSheetType.common.acceptListTypeName`)
                          .d('验收单类型名称'),
                      }),
                    },
                  ],
                })(
                  <TLEditor
                    label={intl
                      .get(`sinv.acceptanceSheetType.common.acceptListTypeName`)
                      .d('验收单类型名称')}
                    field="acceptListTypeName"
                    token={maintainObj._token}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item
                {...formItemLayout}
                label={intl.get(`hzero.common.status.enable`).d('启用')}
              >
                {getFieldDecorator('enabledFlag', {
                  initialValue: maintainObj.enabledFlag === 0 ? 0 : 1,
                })(<Switch />)}
              </Form.Item>
            </Col>
          </Row>
        </Modal>
      </React.Fragment>
    );
  }
}
