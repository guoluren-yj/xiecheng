import { useCallback, useReducer } from 'react';
import { isNil, isEmpty } from 'lodash';

import intl from 'utils/intl';
import styles from '@/routes/common.less';

export const useModalOpen = (modal) => {
  return useCallback(
    ({ editFlag, size, ...props }) =>
      modal.open({
        drawer: true,
        closable: true,
        className: styles[`ssta-${size}-modal`],
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

export const useErrIndex = (activeKey) => {
  const reducer = useCallback(
    (state, action) => {
      switch (action.type) {
        case 'next':
          return { ...state, [activeKey]: state[activeKey] + 1 };
        case 'prev':
          return { ...state, [activeKey]: state[activeKey] - 1 };
        case 'init':
          return {
            base: 0,
            affair: 0,
            bill: 0,
            invoice: 0,
            payment: 0,
          };
        default:
          throw new Error();
      }
    },
    [activeKey]
  );
  return useReducer(reducer, {
    base: 0,
    affair: 0,
    bill: 0,
    invoice: 0,
    payment: 0,
  });
};

export const setErrorsMap = (errors) => {
  return isNil(errors) || isEmpty(errors)
    ? { base: [], affair: [], bill: [], invoice: [], payment: [] }
    : errors;
};

export const useErrorsMap = (emitErrIndex) => {
  const reducer = useCallback(
    (state, action) => {
      const { bill, invoice, payment, ...otherState } = state;
      switch (action.type) {
        case 'filterBill':
          return { invoice, payment, ...otherState };
        case 'filterSettle':
          return { bill, ...otherState };
        case 'filterPayment':
          return { bill, invoice, ...otherState };
        case 'init':
          emitErrIndex({ type: 'init' });
          return setErrorsMap();
        case 'set':
          emitErrIndex({ type: 'init' });
          return setErrorsMap(action.payload);
        default:
          throw new Error();
      }
    },
    [emitErrIndex]
  );
  return useReducer(reducer, setErrorsMap(), setErrorsMap);
};
