/**
 * PrivacyPolicies.js
 * 隐私政策条款
 * @date: 2021-10-25
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useState, useRef, useContext } from 'react';
import { connect } from 'dva';
import { Modal, Button } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getResponse,
  getCurrentOrganizationId,
  getCurrentLanguage,
  getUserOrganizationId,
} from 'utils/utils';
import request from 'utils/request';
import intl from 'utils/intl';
import { HZERO_IAM, HZERO_PLATFORM } from 'utils/config';
import TimerButton from './TimerButton';
import UserStatusContext from '../LeadLink/UserStatusContext';
import styles from './index.less';

const modalKey = Modal.key();

function PrivacyPolicies(props = {}) {
  const currentOrganizationId = getCurrentOrganizationId();
  const currentLang = getCurrentLanguage(); // 获取当前用户的语言信息
  const modalRef = useRef(); // 保存当前的modal

  const [privacyPoliciesModalFlag, handleFlag] = useState(false); // 控制展示modal
  const [privacyPoliciesContent, setPrivacyPoliciesContent] = useState({}); // 展示内容
  const [useStatus, setUserStatus] = useState({});

  const userStatus = useContext(UserStatusContext);

  useEffect(() => {
    if (userStatus) {
      userStatus.then((res) => {
        if (res) {
          setUserStatus(res);
          const { informationSecurityCurrentUserPrivacyTermVersion } =
            (props &&
              props.user &&
              props.user.currentUser &&
              props.user.currentUser.additionInfo) ||
            {};
          if (
            Number(res.userPrivacyTermAgreedVersion) <
            Number(informationSecurityCurrentUserPrivacyTermVersion)
          ) {
            getPrivacyPoliciesContent().then((info) => {
              setPrivacyPoliciesContent(info);
              handleFlag(true);
            });
          } else if (props.lock) {
            props.lock.resolve();
          }
        }
      });
    }
    return () => {
      handleFlag(false);
      changeZIndex(false);
    };
  }, [userStatus]);

  /**
   * 获取隐私描述内容
   * @returns Object 内容数据
   */
  const getPrivacyPoliciesContent = async () => {
    const headerInfo = await request(
      `${HZERO_PLATFORM}/v1/${currentOrganizationId}/static-texts/text/by-code?lang=${currentLang}&textCode=SRM.IAM.USER.PRIVACY.TERM.HEAD`
    );
    const detailInfo = await request(
      `${HZERO_PLATFORM}/v1/${currentOrganizationId}/static-texts/text/by-code?lang=${currentLang}&textCode=SRM.IAM.USER.PRIVACY.TERM`
    );
    return {
      header: headerInfo ? headerInfo.text : undefined,
      detail: detailInfo ? detailInfo.text : undefined,
    };
  };

  /**
   * 退出
   */
  const logout = () => {
    const { dispatch } = props;
    dispatch({
      type: 'login/logout',
    });
  };

  /**
   * 点击同意，改变用户的状态
   */
  const changeUserStatus = () => {
    // 隐私政策同意传递user接口中的 informationSecurityCurrentUserPrivacyTermVersion 字段数据
    const { informationSecurityCurrentUserPrivacyTermVersion } =
      (props && props.user && props.user.currentUser && props.user.currentUser.additionInfo) || {};
    request(
      `${HZERO_IAM}/v1/${currentOrganizationId}/user-status?userEnd=SRM-PC&&statusCode=userPrivacyTermAgreedVersion&fromValue=${useStatus.userPrivacyTermAgreedVersion}&toValue=${informationSecurityCurrentUserPrivacyTermVersion}`,
      {
        method: 'POST',
        body: {},
      }
    ).then((res) => {
      if (getResponse(res)) {
        handleFlag(false);
        modalRef.current.close();
        changeZIndex(false);
        if (props.lock) {
          props.lock.resolve();
        }
      }
    });
  };

  /**
   * 改变c7n-pro-modal-container的z-index 让弹框在最上层
   * @param {Boolean} flag 改变状态标记
   */
  const changeZIndex = (flag) => {
    const c7nModalContainer = document.querySelector('.c7n-pro-modal-container');
    if (c7nModalContainer) {
      c7nModalContainer.style.zIndex = flag ? 1100000 : 1000;
    }
  };

  /**
   * 弹框
   * @returns void
   */
  const showPrivacyPoliciesModal = () => {
    // Fix: 修复可能弹多次的问题
    if (!modalRef.current) {
      changeZIndex(true);
      modalRef.current = Modal.open({
        closeOnLocationChange: false,
        key: modalKey,
        title: (
          <div className="privacy-policies-title">
            <div className="title">
              {intl.get('spfm.privacyPolicies.view.modal.title').d('甄采云隐私政策声明')}
            </div>
            <div
              className="content"
              dangerouslySetInnerHTML={{ __html: privacyPoliciesContent.header }}
            />
          </div>
        ),
        className: styles.privacyPolicies,
        closable: false,
        keyboardClosable: false,
        children: (
          <div
            className="privacy-policies-content"
            dangerouslySetInnerHTML={{ __html: privacyPoliciesContent.detail }}
          />
        ),
        footer: [
          <TimerButton onClick={changeUserStatus} />,
          <Button onClick={logout}>
            {intl.get('spfm.privacyPolicies.view.button.disagree').d('不同意')}
          </Button>,
        ],
        movable: false,
        style: {
          width: 800,
          zIndex: 1100000,
        },
      });
    }
    return <div />;
  };
  return privacyPoliciesModalFlag && showPrivacyPoliciesModal();
}

export default formatterCollections({ code: 'spfm.privacyPolicies' })(
  connect(({ global, user }) => ({
    global,
    user,
  }))(PrivacyPolicies)
);
