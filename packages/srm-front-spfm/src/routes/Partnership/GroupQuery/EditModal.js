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
 * @reactProps {Function} onHandleGoupSave - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class EditModal extends React.Component {
  // 点击确认回调
  @Bind()
  onOk() {
    const { form, tableRecord, onHandleGoupSave } = this.props;
    const { groupId, objectVersionNumber, sourceKey, tenantId, unitId } = tableRecord;
    form.validateFields((err, values) => {
      const { creationDate, ...otherVaule } = values;
      if (isEmpty(err)) {
        onHandleGoupSave({
          ...otherVaule,
          groupId,
          objectVersionNumber,
          sourceKey,
          tenantId,
          unitId,
        });
      }
    });
  }

  render() {
    const { visible, onCancel, anchor, tableRecord = {}, saving } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        title={intl.get('spfm.partnership.view.group.editTitle').d('集团编辑')}
        width={450}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={visible}
        confirmLoading={saving}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
      >
        <Form>
          <FormItem label={intl.get('entity.group.code').d('集团编码')} {...formLayout}>
            {getFieldDecorator('groupNum', {
              initialValue: tableRecord.groupNum,
            })(<Input typeCase="upper" trim inputChinese={false} disabled />)}
          </FormItem>
          <FormItem label={intl.get('entity.group.name').d('集团名称')} {...formLayout}>
            {getFieldDecorator('groupName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.group.name').d('集团名称'),
                  }),
                },
              ],
              initialValue: tableRecord.groupName,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl.get('spfm.partnership.model.group.creationDate').d('注册时间')}
            {...formLayout}
          >
            {getFieldDecorator('creationDate', {
              initialValue: tableRecord.creationDate,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl.get('spfm.partnership.model.group.coreFlag').d('核心企业')}
            {...formLayout}
          >
            {getFieldDecorator('coreFlag', {
              initialValue: tableRecord.coreFlag,
            })(<Switch disabled />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue: tableRecord.enabledFlag,
            })(<Switch disabled />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
