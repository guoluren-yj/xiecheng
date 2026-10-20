/**
 * Drawer -收单地址Modal编辑页
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select, Button } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;

const modelPrompt = 'spfm.oauthConfig.model';
const viewPrompt = 'spfm.oauthConfig.view';

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
 * @reactProps {Function} onHandleSave - 编辑确定后回调函数以保存数据
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} visible - 控制模态框显影
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@connect(({ loading, oauthConfig }) => ({
  oauthConfig,
  loading: loading.effects['oauthConfig/getPublicKey'],
}))
export default class Drawer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      firstKey: '',
    };
  }

  @Bind()
  onOk() {
    const { form, onHandleSave, tableRecord = {} } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleSave({
          ...tableRecord,
          ...values,
        });
      }
    });
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.visible === false) {
      return {
        firstKey: '',
      };
    }
  }

  @Bind()
  handleChangeTenant(record = {}) {
    if (isEmpty(record)) {
      this.props.form.setFieldsValue({ webUrl: undefined });
    }
  }

  @Bind()
  getPublicKey(keySize) {
    const { dispatch, form } = this.props;
    const { setFieldsValue } = form;
    dispatch({
      type: 'oauthConfig/getPublicKey',
      payload: { keySize },
    }).then((res) => {
      if (res) {
        this.setState({
          firstKey: res.first,
        });
        setFieldsValue({ publicKey: res.second });
      }
    });
  }

  render() {
    const {
      form,
      saveLoading,
      addLoading,
      anchor,
      tableRecord = {},
      onCancel,
      fetchLoading,
      loading,
      loginTypeOptions = [],
      supplierLoginOptions = [],
    } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    const { firstKey } = this.state;
    let disabled = false;
    if (getFieldValue('publicKey') === undefined) {
      disabled = !!tableRecord.publicKey;
    } else {
      disabled = !!getFieldValue('publicKey');
    }
    return (
      <Modal
        destroyOnClose
        title={intl.get(`${viewPrompt}.title`).d('免密登录配置')}
        width={700}
        onCancel={onCancel}
        onOk={this.onOk}
        visible
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={saveLoading || addLoading || fetchLoading || loading}
      >
        <FormItem label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
          {getFieldDecorator('appliedTenantId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('entity.tenant.tag').d('租户'),
                }),
              },
            ],
            initialValue: tableRecord.appliedTenantId,
          })(
            <Lov
              textValue={tableRecord.tenantName}
              code="HPFM.TENANT"
              disabled={tableRecord.configId !== undefined}
              onChange={(_, record) => this.handleChangeTenant(record)}
            />
          )}
        </FormItem>
        <FormItem label={intl.get(`${modelPrompt}.webUrl`).d('应用域名')} {...formLayout}>
          {getFieldDecorator('webUrl', {
            initialValue: tableRecord.webUrl,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${modelPrompt}.webUrl`).d('应用域名'),
                }),
              },
            ],
          })(
            <Lov
              textValue={tableRecord.webUrlMeaning}
              disabled={!getFieldValue('appliedTenantId')}
              code="SPFM.TOKEN_FETCH_WEB_URL"
              queryParams={{ applyTenantId: getFieldValue('appliedTenantId') }}
            />
          )}
        </FormItem>
        <FormItem label={intl.get(`${modelPrompt}.encryptMethod`).d('加密方式')} {...formLayout}>
          {getFieldDecorator('encryptMethod', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${modelPrompt}.encryptMethod`).d('加密方式'),
                }),
              },
            ],
            initialValue: tableRecord.encryptMethod,
          })(
            <Select
              style={{ width: '100%' }}
              onChange={(e) => {
                setFieldsValue({ encryptMethod: e });
              }}
              disabled={tableRecord.configId !== undefined}
            >
              <Option key="RSA" value="RSA">
                RSA
              </Option>
              <Option key="RSA" value="ADAPTOR">
                {intl.get(`${modelPrompt}.adaptor`).d('适配器')}
              </Option>
            </Select>
          )}
        </FormItem>
        {(tableRecord.encryptMethod === 'CUSTOMIZE' ||
          getFieldValue('encryptMethod') === 'CUSTOMIZE') && (
          <FormItem
            label={intl.get(`${modelPrompt}.customizeMethod`).d('自定义加密方式')}
            {...formLayout}
          >
            {getFieldDecorator('customEncryptClasspath', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${modelPrompt}.customizeMethod`).d('自定义加密方式'),
                  }),
                },
              ],
              initialValue: tableRecord.customEncryptClasspath,
            })(<Input.TextArea rows={4} inputChinese={false} />)}
          </FormItem>
        )}
        <FormItem
          label={intl.get(`${modelPrompt}.defaultLoginUrl`).d('默认登陆地址')}
          {...formLayout}
        >
          {getFieldDecorator('defaultLoginUrl', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${modelPrompt}.defaultLoginUrl`).d('默认登陆地址'),
                }),
              },
            ],
            initialValue: tableRecord.defaultLoginUrl || '/oauth',
          })(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem
          label={intl.get(`${modelPrompt}.defaultLogoutUrl`).d('默认登出地址')}
          {...formLayout}
        >
          {getFieldDecorator('defaultLogoutUrl', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${modelPrompt}.defaultLogoutUrl`).d('默认登出地址'),
                }),
              },
            ],
            initialValue: tableRecord.defaultLogoutUrl || '/oauth',
          })(<Input inputChinese={false} />)}
        </FormItem>
        {(tableRecord.encryptMethod === 'RSA' || getFieldValue('encryptMethod') === 'RSA') && (
          <FormItem
            label={intl.get(`${modelPrompt}.createPublicKey`).d('密钥生成')}
            {...formLayout}
          >
            <Button type="primary" disabled={disabled} onClick={() => this.getPublicKey(512)}>
              512
            </Button>
            <Button
              style={{ marginLeft: '12px' }}
              type="primary"
              disabled={disabled}
              onClick={() => this.getPublicKey(1024)}
            >
              1024
            </Button>
          </FormItem>
        )}
        {firstKey &&
          (tableRecord.encryptMethod === 'RSA' || getFieldValue('encryptMethod') === 'RSA') && (
            <FormItem label={intl.get(`${modelPrompt}.privatePublicKey`).d('私钥')} {...formLayout}>
              <Input.TextArea disabled rows={6} inputChinese={false} value={firstKey} />
            </FormItem>
          )}
        {tableRecord.encryptMethod !== 'ADAPTOR' && getFieldValue('encryptMethod') !== 'ADAPTOR' && (
          <FormItem label={intl.get(`${modelPrompt}.publicKey`).d('密钥')} {...formLayout}>
            {getFieldDecorator('publicKey', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${modelPrompt}.publicKey`).d('密钥'),
                  }),
                },
              ],
              initialValue: tableRecord.publicKey,
            })(<Input.TextArea rows={6} inputChinese={false} />)}
          </FormItem>
        )}
        <FormItem
          label={intl.get(`${modelPrompt}.ssoServerRedirectUrl`).d('SSO Server重定向地址')}
          {...formLayout}
        >
          {getFieldDecorator('ssoServerRedirectUrl', {
            initialValue: tableRecord.ssoServerRedirectUrl || '/oauth',
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${modelPrompt}.ssoServerRedirectUrl`).d('SSO Server重定向地址'),
                }),
              },
            ],
          })(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get(`${modelPrompt}.mobileUrl`).d('移动端主页地址')} {...formLayout}>
          {getFieldDecorator('mobileUrl', {
            initialValue: tableRecord.mobileUrl,
          })(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get(`${modelPrompt}.errorUrl`).d('失败跳转地址')} {...formLayout}>
          {getFieldDecorator('errorUrl', {
            initialValue: tableRecord.errorUrl,
          })(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem
          label={intl.get(`${modelPrompt}.mobileErrorUrl`).d('移动端失败跳转地址')}
          {...formLayout}
        >
          {getFieldDecorator('mobileErrorUrl', {
            initialValue: tableRecord.mobileErrorUrl,
          })(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem
          label={intl.get(`${modelPrompt}.loginType`).d('员工登录关联方式')}
          {...formLayout}
        >
          {getFieldDecorator('loginType', {
            initialValue: tableRecord.loginType || '1',
          })(
            <Select style={{ width: '100%' }}>
              {loginTypeOptions.map((item) => (
                <Select.Option value={item.value}>{item.meaning}</Select.Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem
          label={intl.get(`${modelPrompt}.supplierLogin`).d('供应商登陆方式')}
          {...formLayout}
        >
          {getFieldDecorator('supplierLogin', {
            initialValue: tableRecord.supplierLogin || 'FORBBIDON',
          })(
            <Select style={{ width: '100%' }}>
              {supplierLoginOptions.map((item) => (
                <Select.Option value={item.value}>{item.meaning}</Select.Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem {...formLayout} label={intl.get(`${modelPrompt}.redirectAllFlg`).d('全局重定向')}>
          {getFieldDecorator('redirectAllFlg', {
            initialValue: tableRecord.redirectAllFlg === 1 ? 1 : 0,
          })(<Switch />)}
        </FormItem>
        <FormItem {...formLayout} label={intl.get(`hzero.common.status.enable`).d('启用')}>
          {getFieldDecorator('enabledFlg', {
            initialValue: tableRecord.enabledFlg === 0 ? 0 : 1,
          })(<Switch />)}
        </FormItem>
      </Modal>
    );
  }
}
