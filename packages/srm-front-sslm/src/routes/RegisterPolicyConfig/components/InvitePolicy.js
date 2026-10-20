/*
 * InvitePolicy - 邀约策略
 * @date: 2023/12/28 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Output, Select, CheckBox, Lov } from 'choerodon-ui/pro';
import { Card, Divider } from 'choerodon-ui';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import classnames from 'classnames';
import { yesOrNoRender } from 'utils/renderer';

import styles from '../index.less';

@observer
export default class InvitePolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { dataSet = {}, isEdit } = this.props;
    const { directCooperation, autoInvite, allowSupplierInvite } =
      (dataSet?.current &&
        dataSet?.current.get(['directCooperation', 'autoInvite', 'allowSupplierInvite'])) ||
      {};
    const hiddenDimenAndCompanyFlag =
      directCooperation === 0 && autoInvite === 0 && allowSupplierInvite === 0;
    return (
      <React.Fragment>
        <div className={styles['policy-content-card-title']}>
          {intl.get('sslm.registerPolicy.view.registerPolicy.invitePolicy').d('邀约策略')}
        </div>
        <Card
          bordered={false}
          title={intl.get('sslm.registerPolicy.view.registerPolicy.invite').d('邀约')}
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
                <CheckBox name="directCooperation" />
                <CheckBox name="autoInvite" hidden={!!directCooperation} />
                <CheckBox name="allowSupplierInvite" hidden={!!directCooperation || !!autoInvite} />
              </>
            ) : (
              <>
                <Output
                  name="directCooperation"
                  renderer={({ value }) => {
                    return yesOrNoRender(value);
                  }}
                />
                <Output
                  name="autoInvite"
                  hidden={!!directCooperation}
                  renderer={({ value }) => {
                    return yesOrNoRender(value);
                  }}
                />
                <Output
                  name="allowSupplierInvite"
                  hidden={!!directCooperation || !!autoInvite}
                  renderer={({ value }) => {
                    return yesOrNoRender(value);
                  }}
                />
              </>
            )}
          </Form>
        </Card>
        {!hiddenDimenAndCompanyFlag && (
          <Card
            className={styles['basic-policy-dimension-form']}
            bordered={false}
            title={intl
              .get('sslm.registerPolicy.view.registerPolicy.DimenAndCompany')
              .d('维度及公司')}
          >
            <Form
              autoValidationLocate={false}
              record={dataSet?.current}
              labelLayout={isEdit ? 'float' : 'vertical'}
              className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
              columns={3}
              useWidthPercent
            >
              {isEdit ? (
                <>
                  <Select name="dimensionCode" />
                  <Lov name="companyIdLov" />
                </>
              ) : (
                <>
                  <Output name="dimensionCode" />
                  <Output name="companyIdLovMeaning" />
                </>
              )}
            </Form>
          </Card>
        )}
        <Divider />
      </React.Fragment>
    );
  }
}
