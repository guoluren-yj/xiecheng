/*
 * OrgAddForm - 租户模板新增弹窗
 * @date: 2018/08/10 14:42:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, Select, Modal, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isEmpty } from 'lodash';

import intl from 'utils/intl';
import Switch from 'components/Switch';
import TLEditor from 'components/TLEditor';
import Lov from 'components/Lov';

const { Option } = Select;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
/**
 * 计量单位新增
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onHandleSelect // lov设置名称
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class OrgAddForm extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) props.onRef(this);
  }

  /**
   * 选择Lov带出对应的名称
   * @param {String} rowKeys
   * @param {Object} record
   */
  @Bind()
  onHandleSelect(rowKeys, record) {
    this.props.form.setFieldsValue({ baseUomName: record.uomName });
  }

  // 保存
  @Bind()
  saveBtn() {
    const { form, onHandleAdd, onHandleEdit, orgChangeFlag, currentRow } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        if (orgChangeFlag === 1) {
          onHandleEdit({
            ...values,
            investigateTemplateId: currentRow.investigateTemplateId,
            objectVersionNumber: currentRow.objectVersionNumber,
            latestFlag: currentRow.latestFlag,
            versionNumber: currentRow.versionNumber,
            releaseFlag: currentRow.releaseFlag,
            _token: currentRow._token,
          });
        } else {
          onHandleAdd(values);
        }
      }
    });
  }

  render() {
    const {
      form,
      form: { getFieldDecorator },
      investigateTypes = [],
      title,
      anchor,
      visible,
      onCancel,
      confirmLoading,
      orgChangeFlag,
      currentRow,
      customizeForm = () => {},
    } = this.props;
    return (
      <Modal
        destroyOnClose
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.saveBtn}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        okText={intl.get('hzero.common.button.sure').d('确定')}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        {customizeForm(
          {
            code: 'SSLM.INVESTIGATION_TEMPLATE_LIST.FORM',
            form,
            dataSource: currentRow,
          },
          <Form layout="horizontal">
            <Row>
              <Col span={24}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`sslm.investDefOrg.model.investDefOrg.templateCode`)
                    .d('模板代码')}
                  style={{ marginBottom: '16px' }}
                >
                  {getFieldDecorator('templateCode', {
                    initialValue: currentRow.templateCode,
                    rules: [
                      {
                        pattern: /^[a-zA-Z0-9][a-zA-Z0-9-_./]*$/g,
                        message: intl
                          .get(`sslm.investDefOrg.model.investDefOrg.formatError`)
                          .d('代码格式不正确'),
                      },
                      {
                        max: 30,
                        message: intl.get('hzero.common.validation.max', {
                          max: 30,
                        }),
                      },
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sslm.investDefOrg.model.investDefOrg.templateCode`)
                            .d('模板代码'),
                        }),
                      },
                    ],
                  })(<Input typeCase="upper" disabled={orgChangeFlag} trim inputChinese={false} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`sslm.investDefOrg.model.investDefOrg.templateName`)
                    .d('模板名称')}
                  style={{ marginBottom: '16px' }}
                >
                  {getFieldDecorator('templateName', {
                    initialValue: currentRow.templateName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sslm.investDefOrg.model.investDefOrg.templateName`)
                            .d('模板名称'),
                        }),
                      },
                      {
                        max: 255,
                        message: intl.get('hzero.common.validation.max', {
                          max: 255,
                        }),
                      },
                    ],
                  })(
                    <TLEditor
                      label={intl
                        .get(`sslm.investDefOrg.model.investDefOrg.templateName`)
                        .d('模板名称')}
                      field="templateName"
                      token={currentRow._token}
                      dbc2sbc={false}
                      inputSize={{ zh: 500, en: 500 }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`sslm.investDefOrg.model.investDefOrg.investigateType`)
                    .d('调查表类型')}
                  style={{ marginBottom: '16px' }}
                >
                  {getFieldDecorator('investigateType', {
                    initialValue: currentRow.investigateType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`sslm.investDefOrg.model.investDefOrg.investigateType`)
                            .d('调查表类型'),
                        }),
                      },
                    ],
                  })(
                    <Select style={{ width: '100%' }} allowClear>
                      {investigateTypes.map(n =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : (
                          undefined
                        )
                      )}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`sslm.investDefOrg.model.investDefOrg.industryId`).d('行业')}
                  style={{ marginBottom: '16px' }}
                >
                  {getFieldDecorator('industryId', {
                    initialValue: currentRow.industryId,
                  })(<Lov code="SPFM.INDUSTRYS" textValue={currentRow.industryMeaning} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`hzero.common.remark`).d('备注')}
                  style={{ marginBottom: '16px' }}
                >
                  {getFieldDecorator('remark', {
                    initialValue: currentRow.remark,
                  })(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...formLayout}
                  label={intl.get('hzero.common.status.enable').d('启用')}
                  style={{ marginBottom: '16px' }}
                >
                  {getFieldDecorator('enabledFlag', {
                    initialValue: orgChangeFlag === 1 ? currentRow.enabledFlag : 1,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
