/**
 * InterfaceModal -接口定义modal 编辑页 --租户级
 * @date: 2018-9-13
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'hzero-ui';
import { isEmpty, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import Switch from 'components/Switch';
import { getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
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
 * @reactProps {Function} onHandleSaveInterface - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class InterfaceModal extends PureComponent {
  // 点击确认回调
  @Bind()
  onOk() {
    const { form, onHandleSaveInterface, tableRecord, tenantId } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleSaveInterface({
          ...tableRecord,
          ...values,
          tenantId,
          interfaceCategoryCode:
            values.interfaceCategoryCode === tableRecord.interfaceCategoryName
              ? tableRecord.interfaceCategoryCode
              : values.interfaceCategoryCode,
        });
      }
    });
  }

  render() {
    const {
      modalVisible,
      onCancel,
      anchor,
      tableRecord = {},
      loading,
      code,
      organizationRole,
    } = this.props;
    const tenantId = getCurrentOrganizationId();
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        destroyOnClose
        title={intl.get('sitf.interfaceDef.view.interfaceDef.interfaceDefEdit').d('接口定义维护')}
        width={520}
        onCancel={onCancel}
        onOk={this.onOk}
        visible={modalVisible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={loading}
      >
        <Form>
          <FormItem label={intl.get('entity.interface.type').d('接口类别')} {...formLayout}>
            {getFieldDecorator('interfaceCategoryCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.interface.type').d('接口类别'),
                  }),
                },
              ],
              initialValue: tableRecord.interfaceCategoryName,
            })(
              <Lov
                textValue={tableRecord.interfaceCategoryName}
                code={organizationRole ? 'SITF.INTERFACE_CATEGORY' : 'SIFC.INTERFACE_CATEGORY'}
              />
            )}
          </FormItem>
          <FormItem label={intl.get('entity.interface.code').d('接口代码')} {...formLayout}>
            {getFieldDecorator('interfaceCode', {
              rules: [
                {
                  max: 40,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 40,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.interface.code').d('接口代码'),
                  }),
                },
              ],
              initialValue: tableRecord.interfaceCode,
            })(
              <Input
                typeCase="upper"
                trim
                inputChinese={false}
                disabled={tableRecord.interfaceCode}
              />
            )}
          </FormItem>
          <FormItem label={intl.get('entity.interface.name').d('接口名称')} {...formLayout}>
            {getFieldDecorator('interfaceName', {
              rules: [
                {
                  max: 40,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`hzero.common.validation.max`, {
                      max: 40,
                    }),
                  }),
                },
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.interface.name').d('接口名称'),
                  }),
                },
              ],
              initialValue: tableRecord.interfaceName,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('entity.interface.type').d('接口类型')} {...formLayout}>
            {getFieldDecorator('interfaceType', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.interface.type').d('接口类型'),
                  }),
                },
              ],
              initialValue: tableRecord.interfaceType,
            })(
              <Select allowClear>
                {(code.interface || []).map((n) =>
                  (n || {}).value ? (
                    <Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Option>
                  ) : undefined
                )}
              </Select>
            )}
          </FormItem>
          <FormItem
            label={intl.get('entity.interface.handleFunction').d('接口处理方法')}
            {...formLayout}
          >
            {getFieldDecorator('handleFunction', {
              initialValue: tableRecord.handleFunction,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
            {getFieldDecorator('comments', {
              initialValue: tableRecord.comments,
            })(<Input />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.orderSeq').d('排序')} {...formLayout}>
            {getFieldDecorator('orderSeq', {
              initialValue: isNil(tableRecord.orderSeq) ? 1 : tableRecord.orderSeq,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('entity.interface.orderSeq').d('排序'),
                  }),
                },
              ],
            })(<InputNumber precision={0} />)}
          </FormItem>
          <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue:
                tableRecord.enabledFlag === undefined ? 1 : tableRecord.enabledFlag ? 1 : 0,
            })(<Switch />)}
          </FormItem>
          {organizationRole && (
            <FormItem
              label={intl.get('sitf.interfaceDef.model.interfaceDef.individualFlag').d('二开')}
              {...formLayout}
            >
              {getFieldDecorator('individualFlag', {
                initialValue:
                  tableRecord.individualFlag === undefined ? 1 : tableRecord.individualFlag ? 1 : 0,
              })(<Switch />)}
            </FormItem>
          )}
          {tenantId !== 0 && (
            <>
              <FormItem
                label={intl.get('hzero.common.status.rerunErrorFlag').d('错误重跑')}
                {...formLayout}
              >
                {getFieldDecorator('rerunErrorFlag', {
                  initialValue:
                    tableRecord.rerunErrorFlag === undefined
                      ? 0
                      : tableRecord.rerunErrorFlag
                      ? 1
                      : 0,
                })(<Switch />)}
              </FormItem>
              <FormItem
                label={intl.get('hzero.common.status.asyncFlag').d('异步标识')}
                {...formLayout}
              >
                {getFieldDecorator('asyncFlag', {
                  initialValue:
                    tableRecord.asyncFlag === undefined ? 0 : tableRecord.asyncFlag ? 1 : 0,
                })(<Switch />)}
              </FormItem>
              <FormItem
                label={intl.get('hzero.common.status.batchMaxCount').d('批次数量')}
                {...formLayout}
              >
                {getFieldDecorator('batchMaxCount', {
                  initialValue: tableRecord.batchMaxCount,
                })(<InputNumber />)}
              </FormItem>
            </>
          )}
          <FormItem
            label={intl.get('hzero.common.status.pushFlag').d('是否主动推送数据')}
            {...formLayout}
          >
            {getFieldDecorator('pushFlag', {
              initialValue: isNil(tableRecord.pushFlag) ? 1 : tableRecord.pushFlag,
            })(<Switch />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
