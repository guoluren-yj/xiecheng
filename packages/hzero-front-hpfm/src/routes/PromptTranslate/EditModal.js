import React, { useCallback } from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import Lov from 'components/Lov';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

const isTenant = isTenantRoleLevel();

function EditModal(props) {
  const { form, onOk, currentRecord, loading, modalVisible, languageInfo, handleModal } = props;
  const addFlag = isEmpty(currentRecord);
  const handleOk = () => {
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue, currentRecord);
      }
    });
  };
  const { getFieldDecorator } = form;

  const changeTenant = useCallback((_, record) => {
    form.setFieldsValue({ tenantName: record.tenantName, tenantId: record.tenantId });
  }, [form]);
  return (
    <Modal
      destroyOnClose
      title={intl.get('spfm.promptTranslate.view.title.modal').d('多语言维护')}
      visible={modalVisible}
      confirmLoading={loading}
      onCancel={() => {
        handleModal({}, false);
      }}
      onOk={handleOk}
      {...otherProps}
    >
      <Form>
        <FormItem
          {...formLayout}
          label={intl.get('hpfm.prompt.model.prompt.promptKey').d('模板代码')}
        >
          {getFieldDecorator('promptKey', {
            initialValue: currentRecord.promptKey,
            rules: [
              {
                required: true,
              },
            ],
          })(<Input style={{ width: '100%' }} disabled={!addFlag} autocomplete="off" />)}
        </FormItem>
        <FormItem {...formLayout} label={intl.get('hpfm.prompt.model.prompt.promptCode').d('代码')}>
          {getFieldDecorator('promptCode', {
            initialValue: currentRecord.promptCode,
            rules: [
              {
                required: true,
              },
            ],
          })(<Input style={{ width: '100%' }} disabled={!addFlag} autocomplete="off" />)}
        </FormItem>
        {!isTenant && (
          <>
            <FormItem {...formLayout} label={intl.get('entity.tenant.code').d('租户编码')}>
              {getFieldDecorator("tenantId", {initialValue: currentRecord.tenantId})}
              {getFieldDecorator('tenantNum', {
                initialValue: currentRecord.tenantNum,
                rules: [
                  {
                    required: !isTenant,
                  },
                ],
              })(<Lov disabled={!addFlag} code="HPFM.TENANT" lovOptions={{valueField: "tenantNum", displayField: "tenantNum"}} onChange={changeTenant} textValue={currentRecord.tenantNum} />)}
            </FormItem>
            <FormItem {...formLayout} label={intl.get('entity.tenant.name').d('租户名称')}>
              {getFieldDecorator('tenantName', {
                initialValue: currentRecord.tenantName,
              })(<Input style={{ width: '100%' }} disabled autocomplete="off" />)}
            </FormItem>
          </>
        )}
        {languageInfo.length > 0 &&
          languageInfo.map((info) => {
            return (
              <FormItem {...formLayout} label={info.description}>
                {getFieldDecorator(info.code, {
                  initialValue: currentRecord[info.code],
                  rules: [
                    {
                      required: (isTenant ? ['zh_CN'] : ['zh_CN', 'en_US']).includes(info.code),
                    },
                  ],
                })(<Input style={{ width: '100%' }} autocomplete="off" />)}
              </FormItem>
            );
          })}
      </Form>
    </Modal>
  );
}

export default Form.create()(EditModal);
