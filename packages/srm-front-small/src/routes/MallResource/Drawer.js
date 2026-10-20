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
// import { Bind } from 'lodash-decorators';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@Form.create({ fieldNameProp: null })
export default class Drawer extends Component {
  save = () => {
    const { onHandleSave, tableRecord } = this.props;
    this.props.form.validateFields((err, value) => {
      if (!err) {
        onHandleSave({
          ...tableRecord,
          ...value,
          // companyId,
          // companyNum,
          tenantId: value.ownerTenantId || tableRecord.tenantId,
        });
      }
    });
  };

  cancle = () => {
    // 关闭弹窗重置tenantId状态
    const { form, onCancel = (e) => e } = this.props;
    form.resetFields('ownerTenantId');
    onCancel();
  };

  render() {
    const { form, visible, tableRecord, anchor, confirmLoading } = this.props;
    const {
      groupId,
      ownerTenantId,
      groupNum,
      groupName,
      companyNum,
      companyName,
      webUrl,
      enabledFlag,
      companyId,
      srmUrl,
      localSrmUrl,
    } = tableRecord;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    getFieldDecorator('ownerTenantId', { initialValue: ownerTenantId });
    return (
      <Modal
        destroyOnClose
        title={intl.get(`small.mallResource.view.addOrUpdateCompany`).d('添加修改公司')}
        width={520}
        onCancel={this.cancle}
        visible={visible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        onOk={this.save}
        confirmLoading={confirmLoading}
      >
        <Form>
          <FormItem {...formLayout} label={intl.get(`small.common.view.groupNum`).d('集团编码')}>
            {getFieldDecorator('groupNum', {
              initialValue: groupNum,
            })(<Input disabled />)}
          </FormItem>
          <FormItem label={intl.get(`small.common.view.groupName`).d('集团名称')} {...formLayout}>
            {getFieldDecorator('groupId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`small.common.view.groupName`).d('集团名称'),
                  }),
                },
              ],
              initialValue: groupId,
            })(
              <Lov
                textValue={groupName}
                code="SMAL.GROUP"
                onChange={(_, record) => {
                  setFieldsValue({
                    companyId: null,
                    companyNum: null,
                    groupNum: record.groupNum,
                    ownerTenantId: record.tenantId,
                  });
                }}
                queryParams={{ enabledFlag: 1 }}
              />
            )}
          </FormItem>
          <FormItem label={intl.get(`small.common.view.companyCode`).d('公司编码')} {...formLayout}>
            {getFieldDecorator('companyNum', {
              initialValue: companyNum,
            })(<Input disabled />)}
          </FormItem>
          <FormItem label={intl.get(`small.common.view.companyName`).d('公司名称')} {...formLayout}>
            {getFieldDecorator('companyId', {
              initialValue: companyId,
            })(
              <Lov
                textValue={companyName}
                disabled={typeof getFieldValue('groupId') !== 'number'}
                code="HPFM.COMPANY"
                queryParams={{
                  enabledFlag: 1,
                  tenantId: getFieldValue('ownerTenantId'),
                  groupId: getFieldValue('groupId'),
                }}
                onChange={(_, record) => {
                  setFieldsValue({
                    companyNum: record.companyNum,
                  });
                }}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get(`small.mallResource.view.webUrl`).d('二级页面域名')}
            {...formLayout}
          >
            {getFieldDecorator('webUrl', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`small.mallResource.view.webUrl`).d('二级页面域名'),
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
          <FormItem label={intl.get(`small.mallResource.view.SRMUrl`).d('SRM域名')} {...formLayout}>
            {getFieldDecorator('srmUrl', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`small.mallResource.view.SRMUrl`).d('SRM域名'),
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
          <FormItem
            label={intl.get(`small.mallResource.view.local.SRMUrl`).d('本地SRM域名')}
            {...formLayout}
          >
            {getFieldDecorator('localSrmUrl', {
              rules: [
                {
                  pattern: STRICT_URL,
                  message: intl
                    .get('hzero.common.validation.httpUrl')
                    .d('请输入以“http/https”开头的正确网址'),
                },
              ],
              initialValue: localSrmUrl,
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
