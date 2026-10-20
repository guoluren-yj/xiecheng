/*
 * AffiliatePolicy - 管理企业
 * @date: 2023/12/28 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, CheckBox, Output } from 'choerodon-ui/pro';
import { Card, Divider } from 'choerodon-ui';
import intl from 'utils/intl';
import classnames from 'classnames';
import { yesOrNoRender } from 'utils/renderer';

import styles from '../index.less';

export default class AffiliatePolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { dataSet = {}, isEdit } = this.props;

    return (
      <React.Fragment>
        <div className={styles['policy-content-card-title']}>
          {intl.get('sslm.registerPolicy.view.registerPolicy.affiliate').d('关联企业')}
        </div>
        <Card
          bordered={false}
          title={intl
            .get('sslm.registerPolicy.view.registerPolicy.verificationMethod')
            .d('企业验证方式')}
        >
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
            {isEdit ? (
              <>
                <CheckBox name="emailValidationFlag" />
                <CheckBox name="moneyValidationFlag" />
                <CheckBox name="artificialValidationFlag" />
              </>
            ) : (
              <>
                <Output
                  name="emailValidationFlag"
                  renderer={({ value }) => {
                    return yesOrNoRender(value);
                  }}
                />
                <Output
                  name="moneyValidationFlag"
                  renderer={({ value }) => {
                    return yesOrNoRender(value);
                  }}
                />
                <Output
                  name="artificialValidationFlag"
                  renderer={({ value }) => {
                    return yesOrNoRender(value);
                  }}
                />
              </>
            )}
          </Form>
        </Card>
        <Divider />
      </React.Fragment>
    );
  }
}
