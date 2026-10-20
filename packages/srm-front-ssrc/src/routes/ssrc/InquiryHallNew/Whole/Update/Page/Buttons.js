import React, { useCallback } from 'react';
import { noop } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';

import DynamicButtons from '_components/DynamicButtons';

const Buttons = (props = {}) => {
  const {
    offlineEntryRemote = noop,
    getCustomizeUnitCode = noop,
    customizeBtnGroup = noop,
    loading,
    submit = noop,
    save = noop,
    cancel = noop,
    rfxId,
    path,
    organizationId,
    basicFormDS,
  } = props;

  const getHeaderButtons = useCallback(() => {
    const standardArr = [
      {
        name: 'cancel',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'cancel',
          funcType: 'flat',
          loading,
          onClick: cancel,
        },
        child: intl.get('hzero.common.button.cancel').d('取消'),
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'save',
          funcType: 'flat',
          loading,
          onClick: save,
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      {
        name: 'submit',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'check',
          color: 'primary',
          loading,
          onClick: () => submit(),
        },
        child: intl.get('hzero.common.button.submit').d('提交'),
      },
    ].filter(Boolean);
    const buttons = offlineEntryRemote
      ? offlineEntryRemote.process(
          'SSRC_WHOLE_OFFLINE_ENTRY_UPDATE_HEAD_BUTTONS',
          standardArr,
          props
        )
      : standardArr;
    return buttons;
  }, [save, cancel, submit, loading, rfxId, organizationId, path, offlineEntryRemote]);

  // header button render
  const renderButton = useCallback(() => {
    return basicFormDS?.current ? (
      <>
        {customizeBtnGroup(
          {
            code: getCustomizeUnitCode('buttons'),
            pro: true,
          },
          <DynamicButtons trigger="hover" buttons={getHeaderButtons()} />
        )}
      </>
    ) : (
      ''
    );
  }, [getCustomizeUnitCode, getHeaderButtons, rfxId]);

  return renderButton();
};

export default observer(Buttons);
