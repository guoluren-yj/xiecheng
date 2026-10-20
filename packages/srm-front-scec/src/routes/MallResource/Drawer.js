/**
 * Drawer -商城资源
 * @date: 2019-11-20
 * @author lzj <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Modal, Form, Input } from 'hzero-ui';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import Switch from 'components/Switch';
import { STRICT_URL } from 'utils/regExp';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const commonKey = 'scec.common';
const prompKey = 'scec.mallResource';
@Form.create({ fieldNameProp: null })
export default class Drawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      companyQuery: {},
    };
  }

  save = () => {
    const { onHandleSave, tableRecord } = this.props;
    this.props.form.validateFields((err, value) => {
      if (!err) {
        onHandleSave({
          ...tableRecord,
          ...value,
        });
      }
    });
  };

  render() {
    const { form, visible, tableRecord, anchor, onCancel, confirmLoading } = this.props;
    const {
      groupId,
      groupNum,
      groupName,
      companyNum,
      companyName,
      webUrl,
      enabledFlag,
      companyId,
      srmUrl,
    } = tableRecord;
    const { getFieldDecorator } = form;
    return (
      <Modal
        destroyOnClose
        title={intl.get(`${prompKey}.view.addOrUpdateCompany`).d('添加修改公司')}
        width={520}
        onCancel={onCancel}
        visible={visible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        onOk={this.save}
        confirmLoading={confirmLoading}
      >
        <Form>
          <FormItem {...formLayout} label={intl.get(`${commonKey}.view.groupNum`).d('集团编码')}>
            {getFieldDecorator('groupNum', {
              initialValue: groupNum,
            })(<Input disabled />)}
          </FormItem>
          <FormItem label={intl.get(`${commonKey}.view.groupName`).d('集团名称')} {...formLayout}>
            {getFieldDecorator('groupId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${commonKey}.view.groupName`).d('集团名称'),
                  }),
                },
              ],
              initialValue: groupId,
            })(
              <Lov
                textValue={groupName}
                code="HPFM.GROUP"
                onChange={(text, record) => {
                  this.setState(
                    {
                      companyQuery: { tenantId: record.tenantId, groupId: record.groupId },
                    },
                    () => {
                      form.setFieldsValue({ companyId: '', groupNum: record.groupNum });
                    }
                  );
                }}
                queryParams={{ enabledFlag: 1 }}
              />
            )}
          </FormItem>
          <FormItem label={intl.get(`${commonKey}.view.companyNum`).d('公司编码')} {...formLayout}>
            {getFieldDecorator('companyNum', {
              initialValue: companyNum,
            })(<Input disabled />)}
          </FormItem>
          <FormItem label={intl.get(`${commonKey}.view.companyName`).d('公司名称')} {...formLayout}>
            {getFieldDecorator('companyId', {
              initialValue: companyId,
            })(
              <Lov
                textValue={companyName}
                disabled={form.getFieldValue('groupId') === undefined}
                code="HPFM.COMPANY"
                queryParams={{
                  enabledFlag: 1,
                  tenantId: tableRecord.tenantId,
                  groupId: tableRecord.groupId,
                  ...this.state.companyQuery,
                }}
                onChange={(text, record) => {
                  form.setFieldsValue({
                    companyNum: record.companyNum,
                  });
                }}
              />
            )}
          </FormItem>
          <FormItem label={intl.get(`${commonKey}.view.webUrl`).d('二级页面域名')} {...formLayout}>
            {getFieldDecorator('webUrl', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${commonKey}.view.webUrl`).d('二级页面域名'),
                  }),
                },
                {
                  pattern: STRICT_URL,
                  message: intl
                    .get('hzero.common.validation.httpUrl')
                    .d('请输入以“http/https”开头的正确网址'),
                },
              ],
              initialValue: webUrl,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get(`${commonKey}.view.SRMUrl`).d('SRM域名')} {...formLayout}>
            {getFieldDecorator('srmUrl', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${commonKey}.view.SRMUrl`).d('SRM域名'),
                  }),
                },
                {
                  pattern: STRICT_URL,
                  message: intl
                    .get('hzero.common.validation.httpUrl')
                    .d('请输入以“http/https”开头的正确网址'),
                },
              ],
              initialValue: srmUrl,
            })(<Input />)}
          </FormItem>
          <FormItem {...formLayout} label={intl.get(`hzero.common.status.enable`).d('启用')}>
            {getFieldDecorator('enabledFlag', {
              initialValue: enabledFlag === undefined ? 1 : enabledFlag,
            })(<Switch />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
