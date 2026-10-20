/**
 * InviteInfo - 邀约信息
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import { yesOrNoRender } from 'utils/renderer';
import { isNil } from 'lodash';

import FormField from '@/routes/components/FormField';
import styles from '../../index.less';

export default class InviteInfo extends Component {
  render() {
    const { dataSet, isEdit, customizeForm } = this.props;
    return (
      <Content>
        <div className={styles['certification-title']} id="inviteInfo">
          {intl.get('spfm.enterpriseCertification.view.title.inviteInfo').d('邀约信息')}
        </div>
        {customizeForm(
          {
            code: 'SSLM.ENTERPRISE_CERTIFICATION.INVIT_INFO',
            readOnly: !isEdit,
          },
          <Form
            useWidthPercent
            dataSet={dataSet}
            columns={3}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
          >
            <FormField
              isEdit={isEdit}
              name="levelTypeFlag"
              componentType="SELECT"
              renderer={({ value }) => {
                return isNil(value) ? '-' : yesOrNoRender(Number(value) ? 1 : 0);
              }}
            />
            <FormField isEdit={isEdit} name="companyIds" componentType="LOV" />
            <FormField isEdit={isEdit} name="remark" componentType="TEXTAREA" newLine colSpan={2} />
          </Form>
        )}
      </Content>
    );
  }
}
