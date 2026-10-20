import React, { Component } from 'react';
import { Form, Input, Modal, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
import Switch from 'components/Switch';

import intl from 'utils/intl';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class EditForm extends Component {
  @Bind()
  handleOk() {
    const { form, onOk, initData } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk({ ...initData, ...fieldsValue });
      }
    });
  }

  render() {
    const {
      form,
      initData,
      title,
      modalVisible,
      onCancel,
      loading,
      isEdit,
      customizeForm,
    } = this.props;
    const {
      ouId,
      ouName,
      _token,
      enabledFlag,
      companyName,
      companyNum,
      companyId,
      costCode,
      costName,
      tenantId,
      sourceCode,
    } = initData;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    const formLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
    };

    return (
      <Modal
        destroyOnClose
        title={title}
        width={600}
        visible={modalVisible}
        confirmLoading={loading}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        onCancel={onCancel}
        onOk={this.handleOk}
      >
        {customizeForm(
          {
            code: 'SMDM.COSTCENTER.EDIT',
            form,
            dataSource: initData,
          },
          <Form>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`smdm.common.model.costCenter.code`).d('成本中心编码')}
                >
                  {getFieldDecorator('costCode', {
                    initialValue: costCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`smdm.common.model.costCenter.code`).d('成本中心编码'),
                        }),
                      },
                      {
                        max: 24,
                        message: intl.get('hzero.common.validation.max', {
                          max: 24,
                        }),
                      },
                    ],
                  })(<Input trim inputChinese={false} typeCase="upper" disabled={isEdit} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.common.model.costCenter.name').d('成本中心名称')}
                >
                  {getFieldDecorator('costName', {
                    initialValue: costName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`smdm.common.model.costCenter.name`).d('成本中心名称'),
                        }),
                      },
                      {
                        max: 120,
                        message: intl.get('hzero.common.validation.max', {
                          max: 120,
                        }),
                      },
                    ],
                  })(
                    <TLEditor
                      label={intl.get(`smdm.common.model.costCenter.name`).d('成本中心名称')}
                      field="costName"
                      token={_token}
                      trim
                      typeCase="upper"
                      disabled={isEdit && sourceCode !== 'SRM'}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.common.model.project.companyNum').d('公司编码')}
                >
                  {getFieldDecorator('companyId', {
                    initialValue: companyId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`smdm.common.model.project.companyNum`).d('公司编码'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      disabled={isEdit}
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      textValue={companyNum}
                      lovOptions={{ displayField: 'companyNum' }}
                      onChange={(_, record) => {
                        setFieldsValue({ ouId: null, companyName: record.companyName });
                      }}
                      queryParams={{ tenantId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.common.model.wbs.companyName').d('公司名称')}
                >
                  {getFieldDecorator('companyName', {
                    initialValue: companyName,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.common.model.project.ouId').d('业务实体')}
                >
                  {getFieldDecorator('ouId', {
                    initialValue: ouId,
                  })(
                    <Lov
                      disabled={isEdit || !getFieldValue('companyId')}
                      code="SPRM.OU"
                      textValue={ouName}
                      queryParams={{ tenantId, companyId: getFieldValue('companyId') }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.common.model.project.sourceFromSystem').d('来源系统')}
                >
                  {getFieldDecorator('sourceCode', {
                    initialValue: sourceCode,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem {...formLayout} label={intl.get('hzero.common.status').d('状态')}>
                  {getFieldDecorator('enabledFlag', {
                    initialValue: enabledFlag,
                    valuePropName: 'checked',
                  })(<Switch />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
