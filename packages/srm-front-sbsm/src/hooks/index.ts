import { useCallback, useState, useRef, useEffect } from 'react';
import { Modal } from 'choerodon-ui/pro';
import type { ModalContextValue } from 'choerodon-ui/pro/lib/modal-provider/ModalContext';

import intl from 'utils/intl';

import styles from '../common.less';

export const useModalOpen = (modal: ModalContextValue) => {
  return useCallback(
    ({ editFlag, size, ...props }) =>
      modal.open({
        drawer: true,
        closable: true,
        key: Modal.key(),
        className: styles[`sbsm-${size}-modal`],
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

interface UseSetStateFunc {
  <T extends Record<string, any>>(initialState: T): [T, (next: Partial<T> | ((prevState: T) => Partial<T>)) => void]
}
export const useSetState: UseSetStateFunc = (initialState) => {
  const [state, mergeState] = useState(initialState || {});
  const setState = useCallback((next) => {
    mergeState(prevState => {
      const nextState = typeof next === "function" ? next(prevState) : next;
      return ({ ...prevState, ...nextState });
    });
  }, []);
  return [state, setState];
};

export const usePrevious: <T = undefined>(value: T) => T | undefined = value => {
  const ref = useRef<typeof value>();
  // useEffect 是副作用，所以会先执行 return ，然后在执行 useEffect，ref.current 的值正好完了一步
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
