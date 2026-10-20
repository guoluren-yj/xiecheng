import React from 'react';
import { Tooltip, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

import { getAttachmentUrlWithToken } from '@/utils/utils';
import OperationRecord from '@/components/HistoryRecord/OperationRecord';
import styles from './index.less';

const actionEnum = {
  IMPORT_SUCCESS: {
    icon: 'check_circle',
    color: 'green',
  },
  IMPORT_ERROR: {
    icon: 'cancel',
    color: 'red',
  },
};

const fieldsConfig = {
  typeCode: { alias: 'status' },
  typeName: { alias: 'statusMeaning' },
  userName: { alias: 'processUser' },
  remark: { alias: 'errorMsg' },
  time: { alias: 'creationDate' },
};

const extraRender = (record) => {
  const remark = record.get('remark');
  return (
    <div
      className={styles['import-record-item-remark']}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: remark }}
    />
  );
};

const timeRender = (record, defaultRender) => {
  const fileUrl = record.get('fileUrl');
  return (
    <div>
      {defaultRender()}
      {fileUrl && (
        <Tooltip
          placement="top"
          title={intl.get(`ssta.settleStrategy.model.operate.downloadFile`).d('下载导入文件')}
        >
          <Icon
            type="get_app"
            onClick={() => {
              getAttachmentUrlWithToken(fileUrl);
            }}
            style={{ color: '#29BECD', margin: '-2px 0 0 10px' }}
          />
        </Tooltip>
      )}
    </div>
  );
};

const ImportRecord = () => {
  return (
    <OperationRecord
      autoSort
      primaryKey="importId"
      actionEnum={actionEnum}
      documentName={intl.get(`ssta.settleStrategy.view.settleStrategy`).d('结算策略')}
      fieldsConfig={fieldsConfig}
      timeRender={timeRender}
      extraRender={extraRender}
      readTransport={{
        url: `${SRM_SSTA}/v1/${
          isTenantRoleLevel() ? getCurrentOrganizationId() : 'site'
        }/settle-config-actions`,
        method: 'GET',
      }}
    />
  );
};

export default ImportRecord;
