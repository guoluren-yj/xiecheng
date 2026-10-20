import React, { useState, useCallback } from "react";
import { Modal, Checkbox, Icon } from 'hzero-ui';
import { Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import { use } from "react";
import ToastImg from '../../assets/supplier-payment-bg.png';
import styles from './index.less';
import EmbedPage from "../EmbedPage";

const PAYMENT_URL = '/spfm/supplier-common-payment?prePayFlag=true';

export default function SupplierPaymentModal(props) {
  const { noticeId, title, content, priority, readNotice, cancel } = props;
  const currentOrganizationId = getCurrentOrganizationId();
  const [modalVisible, handleModalVisible] = useState(true);
  const [showPayment, handleShowPayment] = useState(false);
  const [unShowFlag, handleUnShowFlag] = useState(currentOrganizationId !== 0);
  const onChange = (e) => {
    handleUnShowFlag(e.target && e.target.checked);
  };

  const setUnShowFlag = () => {
    const { readNotice, cancel, noticeId } = props;
    if (readNotice) {
      readNotice(noticeId);
    }
    if (cancel) {
      cancel(noticeId).then((res) => {
        if (res) {
          handleModalVisible(false);
        }
      });
    }
  };

  const goDetail = useCallback(() => {
    getDvaApp()._store.dispatch(
      // routerRedux为window上的属性，如报错，请检查是否设置到window上
      // eslint-disable-next-line no-undef
      routerRedux.push({
        pathname: `/spfm/notices/previewOnly/${props.noticeId}`,
      })
    );
    if (unShowFlag) {
      setUnShowFlag(unShowFlag);
    } else {
      handleModalVisible(false);
    }
  }, [props.noticeId, unShowFlag]);

  const goPayment = useCallback(async() => {
    if (window.loadMicroModule) {
      await window.loadMicroModule({ pathname: PAYMENT_URL });
      handleShowPayment(true);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    handleModalVisible(false);
  }, []);

  const renderPayment = () => {
    const location = {
      hash: '',
      pathname: PAYMENT_URL.split('?')[0],
      search: PAYMENT_URL.split('?')[1],
    };
    const history = {
      ...(window.dvaApp?._history || {}),
      location,
    };
    return (
      <EmbedPage
        href={PAYMENT_URL}
        location={location}
        history={history}
        match={{
          params: {
            prePayFlag: 'true',
          },
          path: PAYMENT_URL.split('?')[0],
        }}
        contentStyle={{ height: '100%' }}
      />
    );
  };

  const renderNotice = () => (
    <>
      <div className="payment-modal-header">
        <img src={ToastImg} alt="" className="payment-modal-bg" />
        <div className="payment-modal-title">{title}</div>
        <Icon type='close' className="payment-modal-close" onClick={handleCloseModal} />
      </div>
      <div className="payment-modal-content">
        <div className="payment-modal-content-html" dangerouslySetInnerHTML={{ __html: props.content }} />
      </div>
      <div className="payment-modal-footer">
        <Checkbox value={unShowFlag} onChange={onChange}>
          {intl.get('hzero.common.systemNotification.message.checkbox').d('不再提示')}
        </Checkbox>
        <Button className="go-info" onClick={goDetail}>
          {intl.get('hzero.common.button.details').d('查看详情')}
        </Button>
        <Button
          className="go-info"
          onClick={() => {
            if (unShowFlag) {
              setUnShowFlag(unShowFlag);
            } else {
              handleModalVisible(false);
            }
          }}
        >
          {intl.get('hzero.common.systemNotification.modal.button').d('已读')}
        </Button>
        <Button
          color="primary"
          className="go-payment"
          onClick={goPayment}
        >
          {intl.get('hzero.common.systemNotification.modal.button.goPayment').d('前往缴费')}
        </Button>
      </div>
    </>
  );

  return (
    <Modal
      visible={modalVisible}
      wrapClassName={styles['payment-modal']}
      footer={null}
      width={800}
      closable={showPayment}
      zIndex={props.priority ? props.priority + 1000000 : 1000000}
      maskStyle={{ backgroundColor: 'rgba(0,0,0,.25)' }}
      onCancel={handleCloseModal}
    >
      {showPayment ? renderPayment() : renderNotice()}
    </Modal>
  );
}