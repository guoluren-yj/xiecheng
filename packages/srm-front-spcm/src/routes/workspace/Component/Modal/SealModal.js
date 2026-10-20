import React, { useState, useEffect, useRef } from 'react';
import { Modal, Spin } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
// import { Icon } from 'hzero-ui';
import intl from 'utils/intl';
import {
  querySealType,
  querySealPictures,
  fetchVerifyPhoneNum,
  confirmChapter,
} from '@/services/workspaceService';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { openTab } from 'utils/menuTab';

import { checkOrderSignContract } from '@/utils/commonCheck';

import styles from './SealModal.less';
import { useValidateModal } from './ValidateModal';

const commonViewMessage = 'spcm.common.view.message.title';

const organizationId = getCurrentOrganizationId();

const SealModal = (props) => {
  const {
    sealType: type,
    picDataSource: initData,
    menuLeafNode,
    headerInfo,
    modal,
    refreshHeader,
    handleMobileRefresh,
  } = props;
  const { update } = modal;
  const [loading, setLoading] = useState(false);
  const [picDataSource, setPicDataSource] = useState(initData);
  const [focusStatus, setFocusStatus] = useState(-1);
  const sealMenuFlag = menuLeafNode.some((item) => {
    return item.path === '/spfm/seal-mange';
  });
  const sealModalRef = useRef({ sealType: type });

  useEffect(() => {
    initModal();
    update({
      onOk: () => handleClickSeal(sealModalRef),
      okProps: {
        disabled: !sealModalRef.current.sealId,
      },
    });
  }, []);

  const initModal = async () => {
    if (type && picDataSource.length) return '';
    const { supplierTenantId, pcHeaderId, companyId } = headerInfo;
    setLoading(true);
    const response = getResponse(
      await querySealType({
        supplierTenantId,
        pcHeaderId,
      })
    );
    Object.assign(sealModalRef.current, { sealType: response?.sealType || undefined });
    if (response?.sealType) {
      const resPictures = getResponse(
        await querySealPictures({
          lovCode: 'SPFM.COMPANY_SEAL',
          companyId,
          tenantId: organizationId,
          sealType: response?.sealType,
        })
      );
      const picData = resPictures.filter((item) => {
        return item.sealFileUrl !== null && item.enabledFlag !== 0;
      });
      setLoading(false);
      setPicDataSource(picData);
    }
  };

  /**
   * handleClickImg 印章点击样式改变
   * @param {string} index
   */
  const onHandleClickImg = (index) => {
    setFocusStatus(focusStatus === index + 1 ? '' : index + 1);
    update({
      okProps: {
        disabled: focusStatus === index + 1,
      },
    });
    const newPicDataSource = focusStatus === index + 1 ? {} : picDataSource[index];
    sealModalRef.current = { ...newPicDataSource, sealType: sealModalRef.current.sealType };
  };

  /**
   * handleClickSeal 点击用章 非手机验证签章
   */
  const handleClickSeal = async (ref) => {
    const { mobileVerifyFlag, supplierCompanyId, companyId, pcHeaderId } = headerInfo;
    const { sealId, sealPictureUrl, signatureId, sealType } = ref.current;
    if (mobileVerifyFlag && sealType === 'ESIGN') {
      update({ okProps: { loading: true } });
      const res = await fetchVerifyPhoneNum({
        authType: sealType,
        companyId,
        supplierCompanyId,
      });
      update({ okProps: { loading: false } });
      if (getResponse(res)) {
        useValidateModal({
          ...headerInfo,
          ...ref.current,
          verifyPhoneNum: res.phone,
          refreshHeader,
          handleMobileRefresh,
          onCloseModal: () => modal.close(),
          ...props,
        });
      }
      return false;
    } else {
      update({ okProps: { loading: true } });
      const res = await confirmChapter({
        pcHeaderId,
        sealPictureUrl,
        sealId,
        signatureId,
        companyId,
        authType: sealType,
      });
      update({ okProps: { loading: false } });
      if (getResponse(res)) {
        handleMobileRefresh(getResponse(res));
        return true;
      }
      return false;
    }
  };

  /**
   * 跳转到印章管理
   */
  const onSkipToSealManage = () => {
    openTab({
      key: '/spfm/seal-mange',
      title: 'srm.bg.manager.seal.manage',
    });
  };

  return (
    <Spin spinning={loading}>
      {picDataSource.length > 0 ? (
        <div className={styles.sealModal}>
          {picDataSource.map((el, index) => (
            <div
              key={el.sealId}
              className={focusStatus === index + 1 && styles.active}
              style={{ height: 160, width: 160, marginBottom: '16px' }}
            >
              <img
                src={el.sealFileUrl}
                title={el.sealName}
                alt={el.sealName}
                onClick={() => onHandleClickImg(index)}
              />
              <Icon
                type="check_circle"
                style={{
                  display: focusStatus === index + 1 ? 'block' : 'none',
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noSealImg}>
          <p>
            {intl.get(`${commonViewMessage}.goChapter`).d('您尚未设置印章，请前往')}
            {sealMenuFlag ? (
              <strong onClick={onSkipToSealManage}>
                {intl.get(`${commonViewMessage}.companyChapter`).d('集团管理-印章管理')}
              </strong>
            ) : (
              <span>{intl.get(`${commonViewMessage}.companyChapter`).d('集团管理-印章管理')}</span>
            )}
            {intl.get(`${commonViewMessage}.setChapter`).d('功能设置您的签署印章。')}
          </p>
        </div>
      )}
    </Spin>
  );
};

const useSealModal = (props, modalProps = {}) => {
  const { headerInfo } = props || {};
  const notAllowedFlag = checkOrderSignContract(headerInfo);
  if (notAllowedFlag) {
    return;
  }
  const modal = Modal.open({
    key: Modal.key(),
    title: intl.get(`spcm.contractChapter.view.common.title.sealPicture`).d('印章图片'),
    children: <SealModal modal {...props} />,
    style: { width: '380px' },
    drawer: true,
    closable: true,
    ...modalProps,
  });
  return modal;
};

export { useSealModal, SealModal };
