import React from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import { noop } from 'lodash';
import intl from 'utils/intl';

import ExchangeEditModal from './ExchangeEditModal';
import QuoteExchangeMainDateModal from './QuoteExchangeMainDateModal';

const useModal = () => {
  const openModal = (props) => {
    const { dataSet, modalDs, editModalOk = noop, quoEditModalOk = noop, ...otherProps } = props;
    const modalProps = {
      dataSet,
      ...otherProps,
    };

    if (!dataSet || !modalDs) {
      return null;
    }

    // 引用汇率主数据
    const handleQuoExchangeData = () => {
      Modal.open({
        key: 'ssrc-quo-exchange-edit-modal',
        title: intl.get('ssrc.inquiryHall.view.button.quoExchangeData').d('引用汇率主数据'),
        children: <QuoteExchangeMainDateModal dataSet={modalDs} />,
        closable: true,
        onOk: async () => {
          const res = await quoEditModalOk();
          if (!res) {
            return false;
          }
        },
        afterClose: () => {
          modalDs.reset();
        },
      });
    };

    const modal = Modal.open({
      key: 'ssrc-exchange-edit-modal',
      title: intl.get('ssrc.inquiryHall.view.button.exchangeEdit').d('汇率编辑'),
      children: <ExchangeEditModal {...modalProps} />,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      okText: intl.get('hzero.common.btn.save').d('保存'),
      okProps: {
        disabled: dataSet.length === 0,
      },
      onOk: async () => {
        const res = await editModalOk();
        if (!res) {
          return false;
        }
      },
      afterClose: () => {
        dataSet.reset();
      },
      footer: (okButton) => {
        return (
          <>
            {okButton}
            <Button disabled={dataSet.length === 0} onClick={handleQuoExchangeData}>
              {intl.get('ssrc.inquiryHall.view.button.quoExchangeData').d('引用汇率主数据')}
            </Button>
          </>
        );
      },
    });
    return modal;
  };
  return {
    openModal,
  };
};

export default useModal;
