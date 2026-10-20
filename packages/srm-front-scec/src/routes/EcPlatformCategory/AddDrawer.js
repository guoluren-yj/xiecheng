/**
 * EcPlatformCategory -平台目录维护 -新增目录
 *
 * @date: 2019-2-2
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

const FormItem = Form.Item;
const modelPrompt = 'scec.ecPlatformCategory.model';

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
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
export default class AddDrawer extends PureComponent {
  @Bind()
  onOk() {
    const { form, onHandleSave, tableRecord = {} } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        if (isEmpty(tableRecord)) {
          onHandleSave({
            ...values,
            levelPath: 0,
            parentCatalogId: -1,
            catalogLevel: 1,
            orderSeq: 1,
            enabledFlag: 1,
            objectVersionNumber: tableRecord.objectVersionNumber || null,
          });
        } else {
          const levelPath = `${tableRecord.levelPath}.`;
          onHandleSave({
            ...values,
            levelPath,
            parentCatalogId: tableRecord.catalogId,
            catalogLevel: tableRecord.catalogLevel + 1,
            orderSeq: 1,
            enabledFlag: 1,
            objectVersionNumber: tableRecord.objectVersionNumber || null,
          });
        }
      }
    });
  }

  render() {
    const { form, saveLoading, visible, addMOdalTitle, anchor, onCancel } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        destroyOnClose
        title={addMOdalTitle}
        width={520}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={visible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={saveLoading}
      >
        <FormItem label={intl.get(`${modelPrompt}.catalogCode`).d('目录编码')} {...formLayout}>
          {getFieldDecorator('catalogCode', {
            rules: [
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${modelPrompt}.catalogCode`).d('目录编码'),
                }),
              },
            ],
          })(<Input inputChinese={false} trim typeCase="upper" />)}
        </FormItem>
        <FormItem label={intl.get(`${modelPrompt}.catalogName`).d('目录名称')} {...formLayout}>
          {getFieldDecorator('catalogName', {
            rules: [
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${modelPrompt}.catalogName`).d('目录名称'),
                }),
              },
            ],
          })(<Input />)}
        </FormItem>
      </Modal>
    );
  }
}
