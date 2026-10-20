import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';

import Switch from 'components/Switch';
import Lov from 'components/Lov';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { CODE_UPPER } from 'utils/regExp';

import GroupsOrUnit from './GroupsOrUnit';

/**
 * 接收者类型维护-数据修改滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 接收者类型
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      typeModeCodeChange: false,
    };
  }
  
  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'left',
    title: '',
    visible: false,
    onOk: (e) => e,
    onCancel: (e) => e,
  };

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, onOk, tableRecord } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          // 校验通过，进行保存操作
          onOk({ ...tableRecord, ...values }, this.state.typeModeCodeChange);
        }
      });
    }
  }

  /**
   * 更新表格数据
   * @param {*} data
   */
  @Bind()
  handleUpdateState(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'receiverType/updateState',
      payload: {
        assignDataSource: data,
      },
    });
  }

  @Bind()
  handleTypeModeCodeChange() {
    this.setState({
      typeModeCodeChange: true,
    });
    notification.info({
      message: intl.get('hmsg.receiverType.view.message.saveTip').d('接收组模式后已修改，先点击确定保存'),
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      path,
      anchor,
      title,
      visible,
      form,
      tableRecord,
      onCancel,
      saveLoading,
      typeModes = [],
      // 接收者行数据 model
      queryAssignedListLoading,
      queryAssignedList,
      assignListToReceiverTypeLoading,
      assignListToReceiverType,
      removeReceiverTypeListLoading,
      removeReceiverTypeList,
      queryNoAssignUnitListLoading,
      queryNoAssignUnitList,
      queryNoAssignUserGroupListLoading,
      queryNoAssignUserGroupList,
      queryNoAssignPositionList,
      queryNoAssignPositionListLoading,
      queryNoAssignRoleList,
      queryNoAssignRoleListLoading,
      extTypeList = [],
      dispatch,
      assignDataSource = [],
      assignPagination = {},
      receiverType = {},
    } = this.props;
    const { getFieldDecorator } = form;
    const { typeModeCodeChange } = this.state;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const typeModeCode = form.getFieldValue('typeModeCode');
    return (
      <Modal
        destroyOnClose
        title={title}
        width={700}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        confirmLoading={saveLoading}
        onOk={this.saveBtn}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        <Form>
          {!isTenantRoleLevel() && (
            <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
              {getFieldDecorator('tenantId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.tenant.tag').d('租户'),
                    }),
                  },
                ],
                initialValue: tableRecord.tenantId,
              })(
                <Lov
                  disabled={!isUndefined(tableRecord.tenantId)}
                  code="HPFM.TENANT"
                  textValue={tableRecord.tenantName}
                />
              )}
            </Form.Item>
          )}
          <Form.Item
            label={intl.get('hmsg.receiverType.model.receiverType.typeCode').d('接收组编码')}
            {...formLayout}
          >
            {getFieldDecorator('typeCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hmsg.receiverType.model.receiverType.typeCode').d('接收组编码'),
                  }),
                },
                {
                  pattern: CODE_UPPER,
                  message: intl
                    .get('hzero.common.validation.codeUpper')
                    .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                },
                {
                  max: 30,
                  message: intl.get('hzero.common.validation.max', { max: 30 }),
                },
              ],
              initialValue: tableRecord.typeCode,
            })(
              <Input
                trim
                typeCase="upper"
                inputChinese={false}
                disabled={!isUndefined(tableRecord.typeCode)}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hmsg.receiverType.model.receiverType.typeMode').d('接收组模式')}
            {...formLayout}
          >
            {getFieldDecorator('typeModeCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hmsg.receiverType.model.receiverType.typeMode')
                      .d('接收组模式'),
                  }),
                },
              ],
              initialValue: tableRecord.typeModeCode,
            })(
              <Select onChange={this.handleTypeModeCodeChange}>
                {typeModes.map((item) => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hmsg.receiverType.model.receiverType.typeName').d('描述')}
            {...formLayout}
          >
            {getFieldDecorator('typeName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hmsg.receiverType.model.receiverType.typeName').d('描述'),
                  }),
                },
                {
                  max: 40,
                  message: intl.get('hzero.common.validation.max', { max: 40 }),
                },
              ],
              initialValue: tableRecord.typeName,
            })(<Input />)}
          </Form.Item>
          {form.getFieldValue('typeModeCode') === 'URL' && (
            <>
              <Form.Item
                label={intl.get('hmsg.receiverType.model.recieverType.routeName').d('服务')}
                {...formLayout}
              >
                {getFieldDecorator('routeName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hmsg.receiverType.model.recieverType.routeName').d('服务'),
                      }),
                    },
                  ],
                  initialValue: tableRecord.routeName,
                })(
                  <Lov
                    code={
                      isTenantRoleLevel()
                        ? 'HADM.ROUTE.SERVICE_CODE.ORG'
                        : 'HADM.ROUTE.SERVICE_CODE'
                    }
                    textValue={tableRecord.routeName}
                  />
                )}
              </Form.Item>
              <Form.Item
                label={intl.get('hmsg.receiverType.model.recieverType.apiUrl').d('URL')}
                {...formLayout}
              >
                {getFieldDecorator('apiUrl', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hmsg.receiverType.model.recieverType.apiUrl').d('URL'),
                      }),
                    },
                    {
                      max: 160,
                      message: intl.get('hzero.common.validation.max', { max: 160 }),
                    },
                  ],
                  initialValue: tableRecord.apiUrl,
                })(<Input />)}
              </Form.Item>
            </>
          )}
          <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue: isUndefined(tableRecord.enabledFlag) ? 1 : tableRecord.enabledFlag,
            })(<Switch />)}
          </Form.Item>
          {form.getFieldValue('typeModeCode') === 'URL' && (
            <Form.Item label={intl.get('hmsg.receiverType.model.recieverType.useStrictFlag').d('严格根据URL参数传参')} {...formLayout}>
              {getFieldDecorator('useStrictFlag', {
                initialValue: tableRecord.useStrictFlag || 0,
              })(<Switch />)}
            </Form.Item>
          )}
          {!typeModeCodeChange && !isUndefined(tableRecord.receiverTypeId) &&
            !(form.getFieldValue('typeModeCode') === 'URL') && (
              <GroupsOrUnit
                path={path}
                tenantId={
                  isTenantRoleLevel() ? getCurrentOrganizationId() : form.getFieldValue('tenantId')
                }
                typeModeCode={typeModeCode}
                receiverTypeId={tableRecord.receiverTypeId}
                queryAssignedListLoading={queryAssignedListLoading}
                queryAssignedList={queryAssignedList}
                assignListToReceiverTypeLoading={assignListToReceiverTypeLoading}
                assignListToReceiverType={assignListToReceiverType}
                removeReceiverTypeListLoading={removeReceiverTypeListLoading}
                removeReceiverTypeList={removeReceiverTypeList}
                queryNoAssignUnitListLoading={queryNoAssignUnitListLoading}
                queryNoAssignUnitList={queryNoAssignUnitList}
                queryNoAssignUserGroupListLoading={queryNoAssignUserGroupListLoading}
                queryNoAssignUserGroupList={queryNoAssignUserGroupList}
                queryNoAssignPositionList={queryNoAssignPositionList}
                queryNoAssignPositionListLoading={queryNoAssignPositionListLoading}
                queryNoAssignRoleList={queryNoAssignRoleList}
                queryNoAssignRoleListLoading={queryNoAssignRoleListLoading}
                extTypeList={extTypeList}
                dispatch={dispatch}
                dataSource={assignDataSource}
                pagination={assignPagination}
                receiverType={receiverType}
                updateState={this.handleUpdateState}
              />
            )}
        </Form>
      </Modal>
    );
  }
}
