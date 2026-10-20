// /*
//  * @Descripttion: 批量编辑弹窗
//  * @version:
//  * @Author: xiaopeng
//  * @Date: 2022-03-16 21:25:38
//  * @LastEditors: xiaopeng
//  * @LastEditTime: 2022-03-16 23:23:35
//  */
import React, { Component } from 'react';
import { Alert } from 'choerodon-ui';
import { DatePicker, Lov, Icon, Form, TextArea } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import styles from './index.less';

export default class BatchModal extends Component {
  render() {
    const { ds, length, customizeForm } = this.props;
    const alertMessage =
      length > 0
        ? intl
            .get('sprm.common.view.alert.batchTickMaintain', {
              value: length,
            })
            .d(`已勾选${length}条数据进行批量编辑`)
        : intl.get('sprm.common.view.alert.batchAllMaintain').d('针对全部数据进行批量编辑');
    return (
      <div>
        <Alert
          className={styles['batch-all-edit-alert']}
          border={false}
          message={
            <div className={styles['batch-all-edit-alert-message']}>
              <Icon type="help" /> {alertMessage}
            </div>
          }
          closable
        />
        {customizeForm(
          {
            code: 'SRPM.RP_PLATFORM_CREATE.BATCH_EDIT',
            __force_record_to_update__: true,
            dataSet: ds,
          },
          <Form
            dataSet={ds}
            labelLayout="float"
            useColon={false}
            className="srpm-batchedit-modal"
            columns={1}
          >
            <Lov name="invOrganizationId" />
            <DatePicker name="neededDate" />
            <TextArea name="remark" resize="vertical" />
          </Form>
        )}
      </div>
    );
  }
}
