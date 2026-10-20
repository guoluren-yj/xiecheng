/**
 * EditModal -集团查询编辑模态框
 * @date: 2018-8-8
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Switch from 'components/Switch';

const FormItem = Form.Item;
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onCompanyDateSave - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditModal extends React.Component {
  /**
   * 确认后执行保存
   */
  @Bind()
  onOk() {
    const { form, tableRecord = {}, onCompanyDateSave } = this.props;
    const { companyId, objectVersionNumber } = tableRecord;
    form.validateFields((err, values) => {
      const { companyName, ...otherValues } = values;
      if (isEmpty(err)) {
        onCompanyDateSave({
          ...otherValues,
          companyId,
          companyName,
          objectVersionNumber,
        });
      }
    });
  }

  render() {
    const { visible, onCancel, anchor, tableRecord, saving } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        title={intl.get('spfm.partnership.view.company.edit').d('企业编辑')}
        width={450}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={visible}
        confirmLoading={saving}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
      >
        <Form>
          <FormItem label={intl.get('entity.company.code').d('公司编码')} {...formLayout}>
            {getFieldDecorator('companyNum', {
              initialValue: tableRecord.companyNum,
            })(<Input typeCase="upper" trim inputChinese={false} disabled />)}
          </FormItem>
          <FormItem label={intl.get('entity.company.name').d('公司名称')} {...formLayout}>
            {getFieldDecorator('companyName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.company.name').d('公司名称'),
                  }),
                },
              ],
              initialValue: tableRecord.companyName,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl.get('spfm.partnership.model.company.groupName').d('所属集团')}
            {...formLayout}
          >
            {getFieldDecorator('groupName', {
              initialValue: tableRecord.groupName,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl
              .get('spfm.partnership.model.company.unifiedSocialCode')
              .d('统一社会信用代码')}
            {...formLayout}
          >
            {getFieldDecorator('unifiedSocialCode', {
              initialValue: tableRecord.unifiedSocialCode,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl
              .get('spfm.partnership.model.company.organizingInstitutionCode')
              .d('组织机构代码')}
            {...formLayout}
          >
            {getFieldDecorator('organizingInstitutionCode', {
              initialValue: tableRecord.organizingInstitutionCode,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl.get('spfm.partnership.model.company.dunsCode').d('邓白氏编码')}
            {...formLayout}
          >
            {getFieldDecorator('dunsCode', {
              initialValue: tableRecord.dunsCode,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl
              .get('spfm.partnership.model.company.businessRegistrationNumber')
              .d('商业注册登记号/税号')}
            {...formLayout}
          >
            {getFieldDecorator('businessRegistrationNumber', {
              initialValue: tableRecord.businessRegistrationNumber,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl.get('spfm.partnership.model.company.creationDate').d('注册时间')}
            {...formLayout}
          >
            {getFieldDecorator('creationDate', {
              initialValue: tableRecord.creationDate,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl.get('spfm.partnership.model.company.telephone').d('默认联系人手机')}
            {...formLayout}
          >
            {getFieldDecorator('mobilephone', {
              initialValue: tableRecord.mobilephone,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl.get('spfm.partnership.model.company.mail').d('默认联系人邮箱')}
            {...formLayout}
          >
            {getFieldDecorator('mail', {
              initialValue: tableRecord.mail,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl.get('spfm.partnership.model.company.sourceCode').d('来源方式')}
            {...formLayout}
          >
            {getFieldDecorator('sourceCodeMeaning', {
              initialValue: tableRecord.sourceCodeMeaning,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl.get('spfm.partnership.model.company.certificationStatus').d('企业认证')}
            {...formLayout}
          >
            {getFieldDecorator('certificationStatusMeaning', {
              initialValue: tableRecord.certificationStatusMeaning,
            })(<Input disabled />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue: tableRecord.enabledFlag,
            })(<Switch />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
