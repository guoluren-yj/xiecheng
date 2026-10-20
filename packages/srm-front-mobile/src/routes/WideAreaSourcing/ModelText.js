import React from 'react';
import intl from 'utils/intl';
import { ModalProvider } from 'choerodon-ui/pro';
import CompanyDetail from './CompanyDetail';

const ModelText = (props) => {
  const { companyId = '', companyArea = '', text = '', modal, setModalValue } = props;

  const Modal = ModalProvider.useModal();

  const openModal = () => {
    if (modal) {
      modal.update({ children: <CompanyDetail companyId={companyId} companyArea={companyArea} /> });
      return;
    }
    const newModel = Modal.open({
      style: {
        width: '742px',
      },
      closable: true,
      mask: false,
      drawer: true,
      okCancel: false,
      maskClosable: true,
      okText: intl.get('hzero.common.model.button.close').d('关闭'),
      title: intl.get('smbl.wideAreaSourcing.view.title.wideAreaDetail').d('供应商详情'),
      children: <CompanyDetail companyId={companyId} companyArea={companyArea} />,
      onOk: () => {
        setModalValue(null);
      },
      onClose: () => {
        setModalValue(null);
      },
    });
    setModalValue(newModel);
  };
  return <a onClick={() => openModal()}>{text}</a>;
};

export default ModelText;
