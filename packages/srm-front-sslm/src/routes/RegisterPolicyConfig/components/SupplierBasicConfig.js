/*
 * SupplierBasicConfig - 供应商主数据配置
 * @date: 2022/06/06 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { isNil } from 'lodash';

import {
  Form,
  Table,
  CheckBox,
  NumberField,
  TextField,
  Output,
  Tooltip,
  Icon,
  Select,
} from 'choerodon-ui/pro';
import { Card, Alert } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import classnames from 'classnames';

import { renderEnable } from '@/routes/components/utils';

import styles from '../index.less';

export default class SupplierBasicConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  getColumns() {
    const { isEdit } = this.props;
    const columns = [
      {
        name: 'visualFlag',
        title: isEdit
          ? intl.get('sslm.registerPolicy.modal.registerPolicy.enable').d('启用')
          : intl.get('hzero.common.button.status').d('状态'),
        editor: record => {
          const { fieldCode, readOnlyFlag } = record.get(['fieldCode', 'readOnlyFlag']);
          // 联系人-移动电话， 邮箱不可配置启用
          const disabledFlag =
            fieldCode === 'mobilephone' || fieldCode === 'invoice_header' || fieldCode === 'mail';
          return !disabledFlag && readOnlyFlag !== 1 && isEdit;
        },
        renderer: isEdit ? null : ({ value }) => renderEnable({ value }),
      },
      {
        name: 'fieldCode',
      },
      {
        name: 'fieldDescription',
      },
      {
        name: 'requiredFlag',
        editor: record => {
          const { fieldCode, readOnlyFlag } = record.get(['fieldCode', 'readOnlyFlag']);
          return fieldCode !== 'invoice_header' && readOnlyFlag !== 1 && isEdit;
        },
        renderer: isEdit ? null : ({ value }) => yesOrNoRender(value),
      },
    ];
    return columns;
  }

  // 渲染表单
  @Bind()
  renderForm(params = {}) {
    const { isEdit } = this.props;
    const { dataSet, formFlag = false, key } = params;
    const registerHidden = ['registerIn', 'registerOut'].includes(key);
    const dataStatusHidden = !['contacts', 'address', 'bank'].includes(key);
    return (
      <Form
        autoValidationLocate={false}
        dataSet={dataSet}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={classnames(styles['standard-config-form'], {
          'c7n-pro-vertical-form-display': !isEdit,
        })}
        columns={3}
        useWidthPercent
      >
        {isEdit ? (
          <>
            <CheckBox name="visualFlag" hidden={registerHidden} />
            <div hidden={registerHidden} />
            <div hidden={registerHidden} />
            <NumberField name="atLeastFlag" hidden={formFlag || registerHidden} />
            <TextField name="remark" />
            <NumberField name="orderSeq" hidden={registerHidden} />
            <Select name="restrictDataStatus" hidden={dataStatusHidden} />
          </>
        ) : (
          <>
            <Output
              name="visualFlag"
              hidden={registerHidden}
              renderer={({ value }) => (isNil(value) ? '-' : yesOrNoRender(value))}
            />
            <div hidden={registerHidden} />
            <div hidden={registerHidden} />
            <Output name="atLeastFlag" hidden={formFlag || registerHidden} />
            <Output name="remark" />
            <Output name="orderSeq" hidden={registerHidden} />
            <Output name="restrictDataStatus" hidden={dataStatusHidden} />
          </>
        )}
      </Form>
    );
  }

  render() {
    const {
      registerInHeaderDs,
      registerInTableDs,
      registerOutHeaderDs,
      registerOutTableDs,
      bussinessHeaderDs,
      bussinessTableDs,
      bankHeaderDs,
      bankTableDs,
      contactHeaderDs,
      contactTableDs,
      addressHeaderDs,
      addressTableDs,
      invoiceHeaderDs,
      invoiceTableDs,
      financeHeaderDs,
      financeTableDs,
      attachmentHeaderDs,
      attachmentTableDs,
      otherInfoHeaderDs,
      isEdit,
    } = this.props;

    return (
      <React.Fragment>
        <Content
          className={classnames(
            styles['policy-content-card'],
            isEdit ? '' : styles['policy-content-card-view']
          )}
        >
          {isEdit ? (
            <Alert
              banner
              showIcon
              closable
              type="info"
              iconType="help"
              message={intl
                .get('sslm.registerPolicy.view.registerPolicy.standardTips')
                .d(
                  '可以选择是否在次要信息中显示以下页签。如果关联的调查表模板内有与标准页面重合的页签，则优先以调查表的配置为准进行校验，供应商认证通过时以调查表填写的内容为准生成主数据。'
                )}
              className={styles['card-title-tips']}
            />
          ) : null}
          <div className={styles['card-standard-tab']}>
            <Card
              bordered={false}
              title={intl
                .get('sslm.registerPolicy.view.registerPolicy.registerIn')
                .d('登记信息（中国内地）')}
            >
              {this.renderForm({
                dataSet: registerInHeaderDs,
                formFlag: true,
                key: 'registerIn',
              })}
              <Table
                dataSet={registerInTableDs}
                columns={this.getColumns()}
                customizedCode="sslm-register-policy-config-register-in"
              />
            </Card>
            <Card
              bordered={false}
              title={intl
                .get('sslm.registerPolicy.view.registerPolicy.registerOut')
                .d('登记信息（境外及港澳台）')}
            >
              {this.renderForm({
                dataSet: registerOutHeaderDs,
                formFlag: true,
                key: 'registerOut',
              })}
              <Table
                dataSet={registerOutTableDs}
                columns={this.getColumns()}
                customizedCode="sslm-register-policy-config-register-out"
              />
            </Card>
            <Card
              bordered={false}
              title={intl
                .get('sslm.registerPolicy.view.registerPolicy.bussinessInfo')
                .d('基础业务信息')}
            >
              {this.renderForm({
                dataSet: bussinessHeaderDs,
                formFlag: true,
              })}
              <Table
                dataSet={bussinessTableDs}
                columns={this.getColumns()}
                customizedCode="sslm-register-policy-config-bussiness-info"
              />
            </Card>
            <Card
              bordered={false}
              title={intl
                .get('sslm.registerPolicy.view.registerPolicy.contactsInfo')
                .d('联系人信息')}
            >
              {this.renderForm({
                dataSet: contactHeaderDs,
                key: 'contacts',
              })}
              <Table
                dataSet={contactTableDs}
                columns={this.getColumns()}
                customizedCode="sslm-register-policy-config-contact-info"
              />
            </Card>
            <Card
              bordered={false}
              title={intl.get('sslm.registerPolicy.view.registerPolicy.addressInfo').d('地址信息')}
            >
              {this.renderForm({
                dataSet: addressHeaderDs,
                key: 'address',
              })}
              <Table
                dataSet={addressTableDs}
                columns={this.getColumns()}
                customizedCode="sslm-register-policy-config-address-info"
              />
            </Card>
            <Card
              bordered={false}
              title={intl.get('sslm.registerPolicy.view.registerPolicy.bankInfo').d('银行信息')}
            >
              {this.renderForm({
                dataSet: bankHeaderDs,
                key: 'bank',
              })}
              <Table
                dataSet={bankTableDs}
                columns={this.getColumns()}
                customizedCode="sslm-register-policy-config-bank-info"
              />
            </Card>
            <Card
              bordered={false}
              title={intl.get('sslm.registerPolicy.view.registerPolicy.invoiceInfo').d('开票信息')}
            >
              {this.renderForm({
                dataSet: invoiceHeaderDs,
                formFlag: true,
              })}
              <Table
                dataSet={invoiceTableDs}
                columns={this.getColumns()}
                customizedCode="sslm-register-policy-config-invoice-info"
              />
            </Card>
            <Card
              bordered={false}
              title={intl.get('sslm.registerPolicy.view.registerPolicy.financeInfo').d('财务信息')}
            >
              {this.renderForm({
                dataSet: financeHeaderDs,
              })}
              <Table
                dataSet={financeTableDs}
                columns={this.getColumns()}
                customizedCode="sslm-register-policy-config-finance-info"
              />
            </Card>
            <Card
              bordered={false}
              title={intl
                .get('sslm.registerPolicy.view.registerPolicy.attachmentInfo')
                .d('附件信息')}
            >
              {this.renderForm({
                dataSet: attachmentHeaderDs,
              })}
              <Table
                dataSet={attachmentTableDs}
                columns={this.getColumns()}
                customizedCode="sslm-register-policy-config-attachment-info"
              />
            </Card>
            <Card
              bordered={false}
              title={
                <span>
                  {intl.get('sslm.registerPolicy.view.registerPolicy.otherInfo').d('其他信息')}
                  <Tooltip
                    placement="top"
                    title={intl
                      .get('sslm.registerPolicy.view.registerPolicy.otherInfoTips')
                      .d(
                        '其他信息页签内无预定义字段，如有需要可在页面个性化的"企业认证"单元中配置拓展字段。仅支持配置页签的排序。'
                      )}
                  >
                    <Icon
                      type="help"
                      style={{ fontSize: 14, color: '#868d9c', marginLeft: 8, marginTop: -3 }}
                    />
                  </Tooltip>
                </span>
              }
            >
              {this.renderForm({
                dataSet: otherInfoHeaderDs,
                formFlag: true,
              })}
            </Card>
          </div>
        </Content>
      </React.Fragment>
    );
  }
}
