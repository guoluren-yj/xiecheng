/**
 * tenants - 租户维护Modal
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, InputNumber } from 'hzero-ui';
import { Tag } from 'choerodon-ui';

import Switch from 'components/Switch';
import ModalForm from 'components/Modal/ModalForm';
import TLEditor from 'components/TLEditor';
import intl from 'utils/intl';
import { CODE } from 'utils/regExp';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getResponse } from 'hzero-front/lib/utils/utils';

import styles from './index.less';

const statusColorMap = {
  EFFECTIVE: 'green',
  INVALID: 'orange',
  ILLEGAL: 'orange',
  LIMIT: 'red',
};
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
  className: styles['edit-form'],
};
/**
 * 组织信息模态框表单
 * @extends {ModalForm} - React.ModalForm
 * @reactProps {Function} handleAdd - 表单提交
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class TenantForm extends ModalForm {
  state = {
    status: {},
  };

  componentDidMount() {
    queryMapIdpValue({ status: 'HIAM.TENANT.SUBSCRIPTION.STATUS' }).then((res) => {
      if (getResponse(res)) {
        const statusObj = {};
        (res.status || []).forEach((item) => {
          statusObj[item.value] = item.meaning;
        });
        this.setState({ status: statusObj });
      }
    });
  }

  renderForm() {
    const { status } = this.state;
    const { data = {}, form = {}, defaultValue, tenantId } = this.props;
    const { tenantExtend } = data || {};
    const {
      customerNum,
      weworkApprovalNumber,
      psmNum,
      subsLimitDate,
      subsStartDate,
      subsEndDate,
      subsStatus,
      userDateFormatPreferFlag,
    } = tenantExtend || {};
    const { getFieldDecorator = (e) => e, getFieldValue } = form;
    const isEdit = tenantId !== undefined;
    return (
      <>
        <Form.Item label={intl.get('entity.tenant.code').d('租户编码')} {...formLayout}>
          {getFieldDecorator('tenantNum', {
            initialValue: data.tenantNum,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('entity.tenant.code').d('租户编码'),
                }),
              },
              {
                pattern: CODE,
                message: intl
                  .get('hzero.common.validation.code')
                  .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input trim inputChinese={false} disabled={data.tenantId !== undefined} />)}
        </Form.Item>
        <Form.Item label={intl.get('entity.tenant.name').d('租户名称')} {...formLayout}>
          {getFieldDecorator('tenantName', {
            initialValue: data.tenantName,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('entity.tenant.name').d('租户名称'),
                }),
              },
              {
                max: 300,
                message: intl.get('hzero.common.validation.max', {
                  max: 300,
                }),
              },
            ],
          })(
            <TLEditor
              label={intl.get('entity.tenant.name').d('租户名称')}
              field="tenantName"
              token={data._token}
            />
          )}
        </Form.Item>
        <Form.Item
          {...formLayout}
          label={intl.get('hiam.tenants.model.tenant.limitUserQty').d('限制用户数')}
        >
          {getFieldDecorator('limitUserQty', {
            initialValue: data.limitUserQty,
          })(<InputNumber precision={0} min={0} />)}
        </Form.Item>
        <Form.Item
          label={intl.get('hiam.tenants.model.messageThreshold').d('消息发送阈值设置')}
          {...formLayout}
        >
          {getFieldDecorator('messageThreshold', {
            initialValue: data.messageThreshold,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.tenants.model.messageThreshold').d('消息发送阈值设置'),
                }),
              },
            ],
          })(<InputNumber style={{ width: '100%' }} min={0} step={1} />)}
        </Form.Item>
        <Form.Item
          label={intl.get('hzero.common.status.small.language.enable').d('商城是否启用多语言')}
          {...formLayout}
        >
          {getFieldDecorator('smallEnableMultiLanguage', {
            initialValue:
              data.smallEnableMultiLanguage === undefined ? 1 : data.smallEnableMultiLanguage,
          })(<Switch />)}
        </Form.Item>
        <Form.Item
          label={intl.get('hiam.menuConfig.default.menu.temp').d('默认目录组模板')}
          {...formLayout}
        >
          {getFieldDecorator('functionGroupTemplate', {
            initialValue:
              data.tenantId !== undefined ? data.functionGroupTemplate || '' : defaultValue,
          })(<Input trim disabled />)}
        </Form.Item>
        <Form.Item
          label={intl
            .get('hiam.tenants.model.userDateFormatPreferFlag')
            .d('按用户偏好展示日期格式')}
          {...formLayout}
        >
          {getFieldDecorator('tenantExtend.userDateFormatPreferFlag', {
            initialValue: userDateFormatPreferFlag,
          })(<Switch />)}
        </Form.Item>
        <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
          {getFieldDecorator('enabledFlag', {
            initialValue: data.enabledFlag,
          })(<Switch />)}
        </Form.Item>
        <div className={styles['tenant-modal-title']}>
          {intl.get('hiam.tenants.title.tenantBaseInfo').d('租户基本信息')}
        </div>
        <Form.Item
          label={intl.get('hiam.tenants.model.coreEnterprise').d('核心企业')}
          {...formLayout}
        >
          {getFieldDecorator('coreEnterprise', {
            initialValue: data.coreEnterprise || 0,
          })(<Switch checkedValue={1} unCheckedValue={0} disabled={data.tenantId !== undefined} />)}
        </Form.Item>
        <Form.Item label={intl.get('hiam.tenants.model.mail').d('负责人邮箱')} {...formLayout}>
          {getFieldDecorator('adminEmail', {
            initialValue: data.adminEmail,
            rules: [
              {
                required: !!getFieldValue('coreEnterprise'),
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.tenants.model.mail').d('负责人邮箱'),
                }),
              },
            ],
          })(<Input trim inputChinese={false} />)}
        </Form.Item>
        <Form.Item
          label={intl.get('hiam.tenants.model.phoneNumber').d('负责人手机号码')}
          {...formLayout}
        >
          {getFieldDecorator('adminPhone', {
            initialValue: data.adminPhone,
            rules: [
              {
                required: !!getFieldValue('coreEnterprise'),
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hzero.common.model.phoneNumber').d('负责人手机号码'),
                }),
              },
            ],
          })(<Input trim inputChinese={false} />)}
        </Form.Item>
        <Form.Item
          label={intl.get('hiam.tenants.model.tenantAdmin').d('项目负责人')}
          {...formLayout}
        >
          {getFieldDecorator('tenantAdmin', {
            initialValue: data.tenantAdmin,
            rules: [
              {
                required: !!getFieldValue('coreEnterprise'),
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hiam.tenants.model.tenantAdmin').d('项目负责人'),
                }),
              },
            ],
          })(<Input trim />)}
        </Form.Item>
        {isEdit && (
          <>
            <Form.Item
              label={intl.get('hiam.tenants.model.oaCustomerInfo').d('OA客户信息')}
              {...formLayout}
            >
              {customerNum}
            </Form.Item>
            <Form.Item label={intl.get('hiam.tenants.model.pmsCode').d('PMS编码')} {...formLayout}>
              {psmNum}
            </Form.Item>
            <Form.Item
              label={intl.get('hiam.tenants.model.weworkApprovalNum').d('企微申请编码')}
              {...formLayout}
            >
              {weworkApprovalNumber}
            </Form.Item>
            <div className={styles['tenant-modal-title']}>
              {intl.get('hiam.tenants.title.tenantPurchaseInfo').d('租户订阅信息')}
            </div>
            <Form.Item
              label={intl.get('hiam.tenants.model.subsStatus').d('订阅状态')}
              {...formLayout}
            >
              <Tag color={statusColorMap[subsStatus] || 'green'} style={{ border: 'none' }}>
                {status[subsStatus] || ''}
              </Tag>
            </Form.Item>
            <Form.Item
              label={intl.get('hiam.tenants.model.subsStartAndEndDate').d('订阅有效期')}
              {...formLayout}
            >
              {subsStartDate || '-'}&nbsp;~&nbsp;{subsEndDate || '-'}
            </Form.Item>
            <Form.Item
              label={intl.get('hiam.tenants.model.subsLimitDate').d('截止使用时间')}
              {...formLayout}
            >
              {subsLimitDate}
            </Form.Item>
          </>
        )}
      </>
    );
  }
}
