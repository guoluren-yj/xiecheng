import * as React from 'react';
import { Modal, Button as C7NButton } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
// import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import { WrapperCommonImport } from './index';

const useModal = () => {
  /**
   *
   */
  const openModal = (props, modalProps?: any) => {
    const { getModal } = props;
    const { action = intl.get('hzero.common.button.import').d('导入') } = props;

    const modal = Modal.open({
      closable: true,
      movable: false,
      drawer: true,
      style: { width: 480 },
      className: 'srm-common-import-modal',
      destroyOnClose: true,
      title: action,
      children: <WrapperCommonImport {...props} modalProps={modalProps} />,
      modalFlag: true,
      bodyStyle: { padding: '0.2rem', overflowX: 'hidden' },
      footer: () => {
        return (
          <>
            <C7NButton
              color={ButtonColor.primary}
              onClick={() => {
                modal.close();
              }}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </C7NButton>
            <C7NButton>
              {intl.get('hzero.common.componenets.import.title.history').d('导入历史')}
            </C7NButton>
          </>
        );
      },
      ...modalProps,
    });
    if (typeof getModal === 'function') {
      getModal(modal);
    }
    return modal;
  };

  return {
    openModal,
  };
};
export default useModal;
