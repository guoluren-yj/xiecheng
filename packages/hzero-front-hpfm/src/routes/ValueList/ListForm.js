import React from 'react';
import { Form, Input, Select, Switch, Icon, Tooltip } from 'hzero-ui';
import { Text } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isNil } from 'lodash';

import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
import SideBar from 'components/Modal/SideBar';

import intl from 'utils/intl';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import { CODE_UPPER } from 'utils/regExp';

const { Option } = Select;
const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
export default class CreateForm extends React.Component {
  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
  }

  render() {
    const { modalVisible, hideModal, confirmLoading = false, title, ...otherProps } = this.props;
    return (
      <SideBar
        title={title}
        visible={modalVisible}
        onCancel={hideModal}
        onOk={this.onOk}
        confirmLoading={confirmLoading}
        {...otherProps}
      >
        {this.renderForm()}
      </SideBar>
    );
  }

  resetForm() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  handleChangeType(type) {
    const { form } = this.props;
    if (!['URL', 'SQL'].includes(type)) {
      form.setFieldsValue({
        labelCode: undefined,
      });
    }
  }

  @Bind()
  onOk() {
    const { form, handleAdd } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue);
    });
  }

  renderForm() {
    const {
      form,
      lovType = [],
      labelType = [],
      requestMethods = [],
      onParentLovChange = (e) => e,
    } = this.props;
    const { getFieldValue } = form || {};
    const lovTypeCode = getFieldValue && getFieldValue('lovTypeCode');
    const currentTenantId = getCurrentOrganizationId();
    const selectedTenantId = form.getFieldValue('tenantId');
    const isTenantLevel = isTenantRoleLevel();
    // currentTenantId是数字，而selectedTenantId有可能是字符串，此处用==
    const showLimitCustomFlag =
      // eslint-disable-next-line eqeqeq
      !isTenantLevel && (isNil(selectedTenantId) || currentTenantId == selectedTenantId);
    return (
      <Form>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('hpfm.valueList.model.header.lovCode').d('值集编码')}
        >
          {form.getFieldDecorator('lovCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.valueList.model.header.lovCode').d('值集编码'),
                }),
              },
              {
                pattern: CODE_UPPER,
                message: intl
                  .get('hzero.common.validation.codeUpper')
                  .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
              },
              {
                max: 60,
                message: intl.get('hzero.common.validation.max', {
                  max: 60,
                }),
              },
            ],
          })(<Input trim typeCase="upper" inputChinese={false} />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('hpfm.valueList.model.header.lovName').d('值集名称')}
        >
          {form.getFieldDecorator('lovName', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.valueList.model.header.lovName').d('值集名称'),
                }),
              },
              {
                max: 240,
                message: intl.get('hzero.common.validation.max', {
                  max: 240,
                }),
              },
            ],
          })(
            <TLEditor
              label={intl.get('hpfm.valueList.model.header.lovName').d('值集名称')}
              field="lovName"
            />
          )}
        </Form.Item>
        {!isTenantLevel && (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 8 }}
            label={intl.get('hpfm.valueList.model.header.tenantId').d('所属租户')}
          >
            {form.getFieldDecorator('tenantId')(
              <Lov
                style={{ width: 200 }}
                code="HPFM.TENANT"
                onChange={() => {
                  form.resetFields('parentLovCode');
                }}
              />
            )}
          </Form.Item>
        )}
        {showLimitCustomFlag && (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 8 }}
            label={intl.get('hpfm.valueList.model.header.isStandardLov').d('是否标准值集')}
          >
            {form.getFieldDecorator('limitCustomFlag', {
              initialValue: 0,
            })(<Switch checkedValue={1} unCheckedValue={0} />)}
          </Form.Item>
        )}
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 8 }}
          label={intl.get('hpfm.valueList.model.header.lovTypeCode').d('值集类型')}
        >
          {form.getFieldDecorator('lovTypeCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.valueList.model.header.lovTypeCode').d('值集类型'),
                }),
              },
            ],
          })(
            <Select style={{ width: '100%' }} onChange={this.handleChangeType}>
              {lovType.map((item) => (
                <Option value={item.value} key={item.value}>
                  {item.meaning}
                </Option>
              ))}
            </Select>
          )}
        </Form.Item>
        {lovTypeCode === 'URL' || lovTypeCode === 'SQL' ? (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            label={intl.get('hpfm.valueList.model.header.routeName').d('目标路由名')}
          >
            {form.getFieldDecorator('routeName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.valueList.model.header.routeName').d('目标路由名'),
                  }),
                },
              ],
            })(
              <Lov
                style={{ width: '100%' }}
                code={isTenantLevel ? 'HADM.ROUTE.SERVICE_PATH.ORG' : 'HADM.ROUTE.SERVICE_PATH'}
              />
            )}
          </Form.Item>
        ) : null}
        {lovTypeCode === 'URL' ? (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            label={intl.get('hpfm.valueList.model.header.customUrl').d('查询 URL')}
          >
            {form.getFieldDecorator('customUrl', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.valueList.model.header.customUrl').d('查询 URL'),
                  }),
                },
              ],
            })(<Input />)}
          </Form.Item>
        ) : null}
        {lovTypeCode === 'URL' ? (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            label={intl.get('hpfm.valueList.model.header.requestMethod').d('请求方式')}
          >
            {form.getFieldDecorator('requestMethod', {
              initialValue: 'GET',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.valueList.model.header.requestMethod').d('请求方式'),
                  }),
                },
              ],
            })(
              <Select style={{ width: '100%' }}>
                {requestMethods.map((item) => (
                  <Option value={item.value} key={item.value}>
                    {item.meaning}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
        ) : null}
        {lovTypeCode === 'SQL' ? (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            label={intl.get('hpfm.valueList.model.header.customSql').d('查询 SQL')}
          >
            {form.getFieldDecorator('customSql', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.valueList.model.header.customSql').d('查询 SQL'),
                  }),
                },
              ],
            })(<TextArea rows={12} />)}
          </Form.Item>
        ) : null}
        {lovTypeCode === 'IDP' ? (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            label={intl.get('hpfm.valueList.model.header.parentLovCode').d('父级值集')}
          >
            {form.getFieldDecorator('parentLovCode')(
              <Lov
                style={{ width: '100%' }}
                code={isTenantLevel ? 'HPFM.LOV.LOV_DETAIL_CODE.ORG' : 'HPFM.LOV.LOV_DETAIL_CODE'}
                queryParams={{
                  lovQueryFlag: 1,
                  lovTypeCode: 'IDP',
                  // eslint-disable-next-line no-nested-ternary
                  tenantId: !isTenantLevel
                    ? form.getFieldValue('tenantId') !== undefined
                      ? form.getFieldValue('tenantId')
                      : ''
                    : '',
                }}
                onOk={onParentLovChange}
              />
            )}
          </Form.Item>
        ) : null}
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('hpfm.valueList.model.header.description').d('描述')}
        >
          {form.getFieldDecorator('description', {
            rules: [
              {
                max: 480,
                message: intl.get('hzero.common.validation.max', {
                  max: 480,
                }),
              },
            ],
          })(
            <TLEditor
              label={intl.get('hpfm.valueList.model.header.description').d('描述')}
              field="description"
            />
          )}
        </Form.Item>
        {['URL', 'SQL'].includes(lovTypeCode) && (
          <Form.Item
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            label={
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  maxWidth: 'calc(100% - 24px)',
                }}
              >
                <Text>{intl.get('hpfm.valueList.model.header.labelCode').d('值集使用方')}</Text>
                <Tooltip
                  title={intl
                    .get('hpfm.valueList.model.header.labelCode.tip')
                    .d(
                      '请根据实际值集使用方维护，采购方：内部用户(如采购员等)使用；供应方：供应商用户切换到当前租户下可使用的值集；全部：不限制，供应商和采购方都可用的模板'
                    )}
                  style={{ marginLeft: '2px' }}
                >
                  <Icon type="question-circle-o" />
                </Tooltip>
              </span>
            }
          >
            {form.getFieldDecorator('labelCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.valueList.model.header.labelCode').d('值集使用方'),
                  }),
                },
              ],
            })(
              <Select>
                {labelType && labelType.length
                  ? labelType.map((item) => (
                    <Select.Option value={item.value}>{item.meaning}</Select.Option>
                    ))
                  : null}
              </Select>
            )}
          </Form.Item>
        )}
      </Form>
    );
  }
}
