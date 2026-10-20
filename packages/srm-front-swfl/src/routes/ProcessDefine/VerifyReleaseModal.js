import React from 'react';
import { Modal, Alert } from 'hzero-ui';
import intl from 'utils/intl';

import styles from './index.less';

export default class VerifyReleaseModal extends React.PureComponent {
  state = {};

  render() {
    const { verifyVisible, value, verifyRecord, onCancel, onOk } = this.props;

    return (
      <Modal
        title={intl.get('hwfp.processDefine.view.release.info').d('常见易错配置提示')}
        width={720}
        destroyOnClose
        visible={verifyVisible}
        onOk={() => {
          onOk(verifyRecord);
        }}
        okButtonProps={{
          disabled: value.ERROR && value.ERROR.length > 0,
        }}
        onCancel={onCancel}
        okText={intl.get('hwfp.processDefine.view.continue.release').d('继续部署')}
      >
        {value.ERROR && value.ERROR.length > 0 && (
          <>
            <Alert
              message={intl.get('hzero.common.status.mistake').d('错误')}
              type="warning"
              showIcon
              className={styles['alert-title']}
              style={{ marginBottom: '12px' }}
            />
            {value.ERROR.map((item, index) => (
              <p>
                {index + 1}.{item}
              </p>
            ))}
          </>
        )}
        {value.WARN && value.WARN.length > 0 && (
          <>
            <Alert
              message={intl.get('hzero.common.warn').d('错误')}
              type="error"
              showIcon
              className={styles['alert-title']}
              style={{ marginBottom: '12px' }}
            />
            {value.WARN.map((item, index) => (
              <p>
                {index + 1}.{item}
              </p>
            ))}
          </>
        )}
      </Modal>
    );
  }
}
