import React from 'react';
import { Form, Input, Select, Col } from 'hzero-ui';
import Lov from 'components/Lov';
import ModalForm from 'components/Modal/ModalForm';
import Switch from 'components/Switch';

import intl from 'utils/intl';
import { isEmpty } from 'lodash';
// import SubAccount from './SubAccount';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
export default class PortalAssignForm extends ModalForm {
  constructor(props) {
    super(props);
    const {
      initData: { sendMessageFlag },
    } = this.props;
    this.state = {
      companyQuery: {},
      displayFlag: !!sendMessageFlag,
    };
  }

  renderForm() {
    const {
      isCreate,
      form,
      initData,
      templateData,
      // subUserData,
      // querySubUserData
    } = this.props;
    const { templateId } = initData;
    const { getFieldDecorator } = form;
    const { groupId, webUrl, groupName, groupNum } = initData;
    // const { displayFlag } = this.state;
    getFieldDecorator('userNameList', {
      initialValue: initData.userNameList === undefined ? [] : initData.userNameList,
    });
    getFieldDecorator('tenantId', {
      initialValue: initData.tenantId,
    });
    return (
      <React.Fragment width={600}>
        <FormItem {...formItemLayout} label={intl.get('entity.group.code').d('集团编码')}>
          {getFieldDecorator('groupNum', {
            initialValue: groupNum,
          })(<Input disabled />)}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get('entity.group.name').d('集团名称')}>
          {getFieldDecorator('groupId', {
            initialValue: groupId,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('entity.group.name').d('集团名称'),
                }),
              },
            ],
          })(
            <Lov
              textValue={groupName}
              disabled={!isCreate}
              code="HPFM.GROUP"
              onChange={(text, record) => {
                this.setState(
                  {
                    companyQuery: { tenantId: record.tenantId, groupId: record.groupId },
                  },
                  () => {
                    form.setFieldsValue({
                      companyId: '',
                      groupNum: record.groupNum,
                      tenantId: record.tenantId,
                    });
                  }
                );
              }}
              queryParams={{ enabledFlag: 1 }}
            />
          )}
        </FormItem>
        {/* <FormItem {...formItemLayout} label={intl.get('entity.company.code').d('公司编码')}>
          {getFieldDecorator('companyNum', {
            initialValue: companyNum,
          })(<Input disabled />)}
        </FormItem>
        <FormItem {...formItemLayout} label={intl.get('entity.company.name').d('公司名称')}>
          {getFieldDecorator('companyId', {
            initialValue: companyId,
          })(
            <Lov
              textValue={companyName}
              disabled={!isCreate || form.getFieldValue('groupId') === undefined}
              code="HPFM.COMPANY"
              queryParams={{
                enabledFlag: 1,
                tenantId: initData.tenantId,
                groupId: initData.groupId,
                ...this.state.companyQuery,
              }}
              onChange={(text, record) => {
                form.setFieldsValue({
                  companyNum: record.companyNum,
                });
              }}
            />
          )}
        </FormItem> */}
        <FormItem
          {...formItemLayout}
          label={intl.get('spfm.portalAssign.model.portalAssign.webUrl').d('企业门户域名')}
        >
          {getFieldDecorator('webUrl', {
            initialValue: webUrl,
            rules: [
              {
                type: 'string',
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('spfm.portalAssign.model.portalAssign.webUrl').d('企业门户域名'),
                }),
              },
              // {
              //   max: 20,
              //   message: intl.get('hzero.common.validation.max', {
              //     max: 20,
              //   }),
              // },
            ],
          })(
            <Input
              onChange={(e) => form.setFieldsValue({ webUrl2: `${e.target.value}.going-link.com` })}
            />
          )}
        </FormItem>
        {/* <FormItem
          {...formItemLayout}
          label={intl.get('hptl.portalAssign.model.portalAssign.webUrlLink').d('二级域名地址')}
        >
          {getFieldDecorator('webUrl2', {
            initialValue: (webUrl && `${webUrl}.going-link.com`) || '',
          })(<Input disabled />)}
        </FormItem> */}
        {/* {isEmpty(initData) && ( */}
        {
          <FormItem
            {...formItemLayout}
            label={intl.get('hmsg.portalTemplate.model.portalTemplate.templateName').d('模板名称')}
          >
            {getFieldDecorator('templateId', {
              initialValue: !isEmpty(initData) ? templateId : '',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get('hmsg.portalTemplate.model.portalTemplate.templateName')
                      .d('模板名称'),
                  }),
                },
              ],
            })(
              <Select allowClear style={{ width: '100%' }}>
                {templateData.map((item) => (
                  <Select.Option key={item.templateId} value={item.templateId}>
                    {item.templateName}
                  </Select.Option>
                ))}
              </Select>
            )}
          </FormItem>
        }
        <FormItem {...formItemLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
          {getFieldDecorator('enabledFlag', {
            initialValue: initData.enabledFlag === undefined ? 1 : initData.enabledFlag,
          })(<Switch />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl
            .get('hptl.portalAssign.model.portalAssign.interBusinessShield')
            .d('默认企业间屏蔽')}
        >
          {getFieldDecorator('interBusinessShield', {
            initialValue:
              initData.interBusinessShield === undefined ? 0 : initData.interBusinessShield,
          })(<Switch />)}
        </FormItem>
        <Col span={24} style={{ fontSize: '12px', color: '#999', marginTop: '-14px' }}>
          {intl
            .get('hptl.portalAssign.model.portalAssign.interMessage')
            .d('开启后，通过该企业门户域名注册的供应商默认无法被其他企业发现。')}
        </Col>
        <FormItem
          {...formItemLayout}
          label={intl.get('hptl.portalAssign.model.portalAssign.tenantApproval').d('租户级审批')}
        >
          {getFieldDecorator('tenantApproval', {
            initialValue: initData.tenantApproval === undefined ? 0 : initData.tenantApproval,
          })(<Switch />)}
        </FormItem>
        <Col span={24} style={{ fontSize: '12px', color: '#999', marginTop: '-14px' }}>
          {intl
            .get('hptl.portalAssign.model.portalAssign.tenantMessage')
            .d('启用后，供应商经过二级域名审批后，不再经过平台级，而是在租户管理员功能下进行审批')}
        </Col>
        {/* <FormItem
          {...formItemLayout}
          label={intl.get('hptl.portalAssign.model.portalAssign.sendMessageFlag').d('邮件提醒')}
        >
          {getFieldDecorator('sendMessageFlag', {
            initialValue: initData.sendMessageFlag === undefined ? 0 : initData.sendMessageFlag,
          })(
            <Switch
              onChange={(e) => {
                this.setState({
                  displayFlag: !!e,
                });
              }}
            />
          )}
        </FormItem>
        <Col span={24} style={{ fontSize: '12px', color: '#999', marginTop: '-14px' }}>
          {intl
            .get('hptl.portalAssign.model.portalAssign.sendMessage')
            .d('启用后，维护接受者子账户，通过该域名注册的供应商，采购方子账户将接受到邮件提醒')}
        </Col>
        {displayFlag ? (
          <FormItem
            {...formItemLayout}
            label={intl.get('hptl.portalAssign.model.portalAssign.userIdList').d('接收者子账户')}
          >
            {getFieldDecorator('userIdList', {
              initialValue: initData.userIdList === undefined ? [] : initData.userIdList,
            })(
              <SubAccount
                onQueryInviterData={querySubUserData}
                queryParams={{ tenantId: form.getFieldValue('tenantId') }}
                inviterData={subUserData}
              />
            )}
          </FormItem>
        ) : null} */}
      </React.Fragment>
    );
  }
}
