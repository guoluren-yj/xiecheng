import React, { PureComponent } from 'react';
import { Table, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import Drawer from './Drawer';
import styles from './OperationRecord.less';

export default class OperationRecord extends PureComponent {
  @Bind()
  cancel() {
    const { onCancel = e => e } = this.props;
    onCancel();
  }

  render() {
    const { dataSource = [], visible, onCancel, loading } = this.props;

    const drawerProps = {
      title: intl.get('spfm.certificationApproval.view.title.operationRecord').d('操作记录'),
      visible,
      anchor: 'right',
      onCancel,
      width: 600,
      footer: (
        <Button type="primary" onClick={this.cancel}>
          {intl.get('hzero.common.button.back').d('返回')}
        </Button>
      ),
    };
    const columns = [
      {
        title: intl.get('spfm.certificationApproval.model.operationRecord.UserName').d('操作人'),
        align: 'center',
        width: 120,
        dataIndex: 'processUserName',
      },
      {
        title: intl
          .get('spfm.certificationApproval.model.operationRecord.processDate')
          .d('操作日期'),
        width: 160,
        align: 'center',
        dataIndex: 'processDate',
      },
      {
        title: intl.get('spfm.certificationApproval.model.operationRecord.status').d('操作'),
        width: 90,
        align: 'center',
        dataIndex: 'processStatusMeaning',
      },
      {
        title: intl.get('spfm.certificationApproval.model.operationRecord.processMsg').d('说明'),
        dataIndex: 'processMsg',
        width: 180,
      },
    ];
    return (
      <Drawer {...drawerProps}>
        <div className={styles['spfm-Certification-approval-operation-record']}>
          <Content title="">
            <Table
              loading={loading}
              dataSource={dataSource}
              columns={columns}
              rowKey="companyActionId"
              pagination={false}
              bordered
            />
          </Content>
        </div>
      </Drawer>
    );
  }
}
