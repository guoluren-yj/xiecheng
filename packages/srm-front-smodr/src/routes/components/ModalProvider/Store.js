import React, { createContext, useState } from 'react';
import { ModalProvider } from 'choerodon-ui/pro';

const Store = createContext({});
export default Store;

export function StoreProvider(props) {
  const Modal = ModalProvider.useModal();
  const [modalValue, setModalValue] = useState('');

  // useEffect(() => {
  //   handleClose();
  // }, [window.location.pathname]);

  const openModal = (modalObj) => {
    if (modalValue) {
      modalValue.update(modalObj);
      return modalValue;
    }
    const modal = Modal.open(modalObj);
    setModalValue(modal);
    return modal;
  };

  const handleClose = () => {
    if (modalValue) {
      modalValue.close();
    }
    setModalValue('');
  };

  const value = { openModal, handleClose, setModalValue };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
