import React, { Component, Fragment } from 'react';
import { TextField, DataSet, Form, Button } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { notification } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { PHONE } from 'utils/regExp';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';
import { handleOnsite } from '@/services/onsiteNumberService';

@formatterCollections({
  code: ['spfm.onsiteNumber', 'hzero.common'],
})
export default class OnsiteNumber extends Component {
  formDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'verificationCode',
        type: 'string',
        label: intl.get('hzero.common.model.verifyCode').d('验证码'),
      },
      {
        name: 'phone',
        type: 'string',
        label: intl.get('hzero.common.cellphone').d('手机号'),
        pattern: PHONE,
      },
    ],
  });

  @Bind()
  async handleOnSite() {
    const data = this.formDs.toData()[0];
    const validFlag = await this.formDs.validate();
    if (validFlag) {
      const response = handleOnsite(data);
      response.then((res) => {
        if (res && !res.failed) {
          notification.success({
            message: intl
              .get('spfm.onsiteNumber.notification.message.successfullyNumber')
              .d('取号成功'),
            placement: 'bottomRight',
          });
          this.formDs.reset();
        } else {
          notification.warning({
            message: res.message,
            placement: 'bottomRight',
          });
        }
      });
    }
  }

  render() {
    return (
      <Fragment>
        <Header title={intl.get('spfm.onsiteNumber.notification.message.getNumber').d('取号')} />
        <Content>
          <div className={styles['onSite-dev']}>
            <Form dataSet={this.formDs} columns={3}>
              <TextField name="verificationCode" />
            </Form>
            <Form dataSet={this.formDs} columns={3}>
              <TextField name="phone" />
            </Form>
            <Button color="primary" onClick={this.handleOnSite}>
              {intl.get('spfm.onsiteNumber.button.confirmNumber').d('确认取号')}
            </Button>
            <p>
              {intl
                .get('spfm.onsiteNumber.content.notice')
                .d(
                  '注意：请录入预约时获取的验证码和对应手机号。同个验证码再次取号，则上个号自动作废'
                )}
            </p>
          </div>
        </Content>
      </Fragment>
    );
  }
}
