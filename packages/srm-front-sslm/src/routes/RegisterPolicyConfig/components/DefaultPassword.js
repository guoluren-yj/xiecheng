/*
 * DefaultPassword - 密码默认填充
 * @date: 2023/12/28 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import intl from 'utils/intl';
import classnames from 'classnames';
import { yesOrNoRender } from 'utils/renderer';

import FormField from '@/routes/components/FormField';
import styles from '../index.less';

export default class DefaultPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { dataSet = {}, isEdit } = this.props;

    return (
      <React.Fragment>
        <div className={styles['policy-content-card-title']}>
          {intl.get('sslm.registerPolicy.view.title.defaultPassword').d('密码默认填充')}
        </div>
        <Card bordered={false}>
          <Form
            record={dataSet?.current}
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
              isEdit={isEdit}
              componentType="CHECKBOX"
              name="passwordDefaultFlag"
              renderer={({ value }) => yesOrNoRender(value)}
            />
          </Form>
        </Card>
      </React.Fragment>
    );
  }
}
