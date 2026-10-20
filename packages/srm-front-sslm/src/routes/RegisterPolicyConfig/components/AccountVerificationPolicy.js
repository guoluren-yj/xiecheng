/*
 * AccountVerificationPolicy - 子账户生成时验证方式策略
 * @date: 2023/12/28 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import { Card, Divider } from 'choerodon-ui';
import intl from 'utils/intl';
import classnames from 'classnames';
import { yesOrNoRender } from 'utils/renderer';

import FormField from '@/routes/components/FormField';

import styles from '../index.less';

export default class AccountVerificationPolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { dataSet = {}, isEdit } = this.props;

    return (
      <React.Fragment>
        <div className={styles['policy-content-card-title']}>
          {intl.get('sslm.registerPolicy.view.registerPolicy.accountRegistration').d('账号注册')}
        </div>
        <Card
          bordered={false}
          title={intl
            .get('sslm.registerPolicy.view.registerPolicy.validateMethod')
            .d('获取验证码方式')}
        >
          <Form
            dataSet={dataSet}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={classnames(
              {
                [styles['basic-policy-radio-form']]: isEdit,
              },
              {
                'c7n-pro-vertical-form-display': !isEdit,
              }
            )}
            columns={3}
            useWidthPercent
          >
            <FormField
              name="phoneReceiveFlag"
              isEdit={isEdit}
              componentType="CheckBox"
              renderer={({ value }) => {
                return yesOrNoRender(Number(value));
              }}
            />
            <FormField
              name="emailReceiveFlag"
              isEdit={isEdit}
              componentType="CheckBox"
              renderer={({ value }) => {
                return yesOrNoRender(Number(value));
              }}
            />
            <FormField
              name="defaultReceiveCodeType"
              isEdit={isEdit}
              componentType="SELECT"
              clearButton={false}
            />
          </Form>
        </Card>
        <Divider />
      </React.Fragment>
    );
  }
}
