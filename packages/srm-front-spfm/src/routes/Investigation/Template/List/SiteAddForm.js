/*
 * SiteAddForm - 平台模板新增弹窗
 * @date: 2018/08/10 14:42:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, Select, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isFunction } from 'lodash';

import intl from 'utils/intl';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';

const { Option } = Select;
const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};
/**
 * 计量单位新增
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onHandleSelect // lov设置名称
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class SiteAddForm extends PureComponent {
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
    const { form, onHandleAdd } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleAdd(values);
      }
    });
  }

  render() {
    const {
      form,
      investigateTypes = [],
      title,
      anchor,
      visible,
      onCancel,
      confirmLoading,
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
        <Form>
          <Form.Item
            {...formLayout}
            label={intl
              .get(`spfm.investigation.model.investigation.templateCode`)
              .d('预置模板代码')}
          >
            {form.getFieldDecorator('templateCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`spfm.investigation.model.investigation.templateCode`)
                      .d('预置模板代码'),
                  }),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', {
                    max: 30,
                  }),
                },
              ],
            })(<Input typeCase="upper" inputChinese={false} />)}
          </Form.Item>
          <Form.Item
            {...formLayout}
            label={intl.get(`spfm.investigation.model.investigation.templateName`).d('模板名称')}
          >
            {form.getFieldDecorator('templateName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`spfm.investigation.model.investigation.templateName`)
                      .d('模板名称'),
                  }),
                },
                {
                  max: 255,
                  message: intl
                    .get(`spfm.investigation.view.message.nameMaxLength`)
                    .d('模板名称不能超过255位'),
                },
              ],
            })(
              <TLEditor
                label={intl
                  .get(`spfm.investigation.model.investigation.templateName`)
                  .d('模板名称')}
                field="templateName"
              />
            )}
          </Form.Item>
          <Form.Item
            {...formLayout}
            label={intl
              .get(`spfm.investigation.model.investigation.investigateType`)
              .d('调查表类型')}
          >
            {form.getFieldDecorator('investigateType', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`spfm.investigation.model.investigation.investigateType`)
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
          <Form.Item
            {...formLayout}
            label={intl.get(`spfm.investigation.model.investigation.industryId`).d('行业')}
          >
            {form.getFieldDecorator('industryId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfm.investigation.model.investigation.industryId`).d('行业'),
                  }),
                },
              ],
            })(<Lov code="SPFM.INDUSTRY" />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get(`hzero.common.remark`).d('备注')}>
            {form.getFieldDecorator('remark', {})(
              <TLEditor label={intl.get(`hzero.common.remark`).d('备注')} field="remark" />
            )}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
            {form.getFieldDecorator('enabledFlag', {
              initialValue: 1,
            })(<Switch />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
