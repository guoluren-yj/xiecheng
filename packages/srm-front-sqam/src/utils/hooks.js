import { useCallback } from 'react';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from '@/routes/common.less';

export const useModalOpen = (modal) => {
  return useCallback(
    ({ editFlag, size, ...props }) =>
      modal.open({
        drawer: true,
        closable: true,
        key: Modal.key(),
        className: styles[`sqam-${size}-modal`],
        cancelProps: editFlag ? {} : { color: 'primary' },
        cancelText: editFlag
          ? intl.get('hzero.common.button.cancel').d('取消')
          : intl.get('hzero.common.button.close').d('关闭'),
        footer: (okBtn, cancelBtn) => (editFlag ? [okBtn, cancelBtn] : cancelBtn),
        ...props,
      }),
    [modal]
  );
};
