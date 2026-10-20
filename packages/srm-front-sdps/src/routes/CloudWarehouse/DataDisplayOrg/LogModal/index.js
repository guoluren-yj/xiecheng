/**
 * 日志弹窗
 * @Author qingxiang.luo@going-link.com
 * @Date 2022-02-11
 */
import React from 'react';
import { Modal, Badge } from 'choerodon-ui';
import { Button, CodeArea } from 'choerodon-ui/pro';
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
      width={680}
      footer={
        <div>
          <Button color="primary" onClick={onCancel}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
        </div>
      }
    >
      <div>
        {localRecord && localRecord.get('errorMsg') ? (
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
      </div>
      <div>{localRecord?.get('endSyncTs') ?? ''}</div>
      <div>
        {localRecord && localRecord.get('errorMsg') && (
          <CodeArea
            value={localRecord?.get('errorMsg') ?? ''}
            style={{ height: '660px' }}
            disabled
          />
        )}
      </div>
    </Sidebar>
  );
};

export default InvoiceInfoModal;
