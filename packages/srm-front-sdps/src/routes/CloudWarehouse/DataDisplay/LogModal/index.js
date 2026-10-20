/**
 * 日志弹窗
 * @Author qingxiang.luo@going-link.com
 * @Date 2022-02-11
 */
import React from 'react';
import { Modal, Badge } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro'; // CodeArea
import intl from 'utils/intl';
import classNames from 'classnames';

import styles from './index.less';

const { Sidebar } = Modal;

const InvoiceInfoModal = (props) => {
  const { visible, localRecord, onCancel = () => {} } = props;

  return (
    <Sidebar
      title={intl.get('sdps.cloudWarehouse.model.syncLog').d('同步日志')}
      visible={visible}
      closable
      destroyOnClose
      maskClosable={false}
      onCancel={onCancel}
      className={classNames(styles['points-modal-footer'])}
      width={520}
      footer={
        <div>
          <Button color="primary" onClick={onCancel}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
        </div>
      }
    >
      <div>
        {localRecord && (localRecord.get('errorMsg') || localRecord.get('error_msg')) ? (
          <span>
            <Badge status="error" />
            {intl.get('hzero.common.status.failure').d('失败')}
          </span>
        ) : (
          <span>
            <Badge status="success" />
            {intl.get('hzero.common.status.success').d('成功')}
          </span>
        )}
        &nbsp;&nbsp;
        {localRecord?.get('endSyncTs') ?? ''}
      </div>
      <div className="code-area-footer">
        {localRecord && (localRecord.get('errorMsg') || localRecord.get('error_msg')) && (
          <div
            style={{
              height: '665px',
              padding: '0 10px',
              marginTop: '8px',
              border: '1px solid #ccc',
              wordWrap: 'break-word',
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
            }}
          >
            {localRecord?.get('errorMsg') ?? localRecord?.get('error_msg') ?? ''}
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default InvoiceInfoModal;
