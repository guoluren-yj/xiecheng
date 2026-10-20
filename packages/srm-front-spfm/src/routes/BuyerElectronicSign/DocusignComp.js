/* eslint-disable eqeqeq */
import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
// import notification from 'utils/notification';
import { Spin, Button, Modal, EmailField, Form, DataSet } from 'choerodon-ui/pro';

import { ReactComponent as NoAuth } from '@/assets/sign/no-auth.svg';
import { ReactComponent as Authing } from '@/assets/sign/authing.svg';
import { ReactComponent as AuthSuccess } from '@/assets/sign/auth-success.svg';
import { ReactComponent as AuthFail } from '@/assets/sign/auth-failed.svg';

import {
  fetchDocusignStatus,
  fetchAuth,
  fetchCancelDocusignAuth,
} from '@/services/electronicSignWorkplaceService';
import { getResponse } from 'utils/utils';

import styles from './DocusignComp.less';

function DocusignComp(props) {
  const { origin, pathname, tabKey } = props;
  const [authStatus, setAuthStatus] = useState('0');
  const [loading, setLoading] = useState(false);
  const [authEmail, setAuthEmail] = useState('');

  const authDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'email',
            label: intl.get(`spfm.buyerElectronicSign.view.docusign.email`).d('邮箱'),
            type: 'email',
            required: true,
          },
        ],
      }),
    []
  );

  useEffect(() => {
    handleInitStatus();
  }, []);

  const handleInitStatus = async () => {
    setLoading(true);
    try {
      const res = await fetchDocusignStatus();
      setLoading(false);
      if (getResponse(res)) {
        setAuthStatus(res?.authStatus);
        setAuthEmail(res?.email ?? '');
      }
      return getResponse(res);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    let modal = null;
    let authUrl = '';

    const res = await fetchAuth({
      email: '',
      redirectUrl: `${origin}${pathname}?activeTab=${tabKey}`,
    });
    if (getResponse(res)) {
      authDs.loadData([{ email: res?.email }]);
      setAuthEmail(res?.email);
      authUrl = res?.authUrl ?? '';
    }

    const closeModal = () => {
      if (modal) {
        modal.close();
      }
    };

    const handleSubmit = async () => {
      const isValid = await authDs.validate();

      if (isValid) {
        // const email = authDs?.current?.get('email') ?? '';
        // const res = await fetchAuth({
        //   email,
        //   redirectUrl: `${origin}${pathname}?activeTab=${tabKey}`,
        // });

        if (authUrl && authUrl.includes('http')) {
          window.open(authUrl, '_blank');
          closeModal();
          handleInitStatus();
        }
      }
    };

    modal = Modal.open({
      title: intl.get('spfm.buyerElectronicSign.view.docusign.authBtn').d('接口授权'),
      drawer: true,
      closable: false,
      destroyOnClose: true,
      style: {
        width: '380px',
      },
      children: (
        <Form dataSet={authDs} columns={1} labelLayout="float">
          <EmailField name="email" disabled />
        </Form>
      ),
      onCancel: closeModal,
      footer: () => (
        <>
          <Button color="primary" onClick={handleSubmit}>
            {intl.get('hzero.common.button.ok').d('确认')}
          </Button>
          <Button onClick={closeModal}>{intl.get('hzero.common.btn.cancel').d('取消')}</Button>
        </>
      ),
    });
  };

  const handleCancel = () => {
    fetchCancelDocusignAuth({
      authStatus: 0,
    }).then(res => {
      if (getResponse(res)) {
        handleInitStatus();
      }
    });
  };

  const handleRefresh = async () => {
    return handleInitStatus();
  };

  const statusMap = {
    0: {
      title: intl.get('spfm.buyerElectronicSign.view.docusign.noAuth').d('未授权'),
      desc: intl
        .get('spfm.buyerElectronicSign.view.docusign.noAuthDesc')
        .d('请点击接口授权按钮填写邮箱后前往Docusign官方进行接口授权'),
      alert1: intl.get('spfm.buyerElectronicSign.view.docusign.alert1').d('注意：'),
      alert2: intl
        .get('spfm.buyerElectronicSign.view.docusign.alert2')
        .d('1、授权时会默认带入租户配置的授权账号，若想更换请联系项目人员'),
      alert3: intl
        .get('spfm.buyerElectronicSign.view.docusign.alert3')
        .d('2、在Docusign官方进行授权时，请使用默认带入的账号，不要切换账号'),
      comp: <NoAuth />,
    },
    1: {
      title: intl.get('spfm.buyerElectronicSign.view.docusign.hasAuth').d('已授权'),
      desc: intl.get('spfm.buyerElectronicSign.view.docusign.hasAuthDesc').d('当前授权邮箱为'),
      email: authEmail,
      alert2: intl
        .get('spfm.buyerElectronicSign.view.docusign.authedAlert2')
        .d('若想更换授权邮箱，请先联系项目人员修改租户配置的授权账号，修改后再进行重新授权'),
      comp: <AuthSuccess />,
    },
    2: {
      title: intl.get('spfm.buyerElectronicSign.view.docusign.authing').d('授权中'),
      desc: intl
        .get('spfm.buyerElectronicSign.view.docusign.authingDesc')
        .d('请点击下方”刷新“按钮进入下一步，或点击”取消授权“按钮，重新跳转第三方页面操作授权'),
      comp: <Authing />,
    },
    3: {
      title: intl.get('spfm.buyerElectronicSign.view.docusign.authFail').d('授权失败'),
      desc: intl
        .get('spfm.buyerElectronicSign.view.docusign.authFailDesc')
        .d('请点击下方按钮重新授权'),
      comp: <AuthFail />,
    },
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['docusign-comp-basic']}>
        <div>{statusMap[authStatus]?.comp}</div>
        <div style={{ fontSize: '16px', color: '#1D2129', fontWeight: '600' }}>
          {statusMap[authStatus]?.title}
        </div>
        <div
          style={{
            marginTop: '8px',
            width: '100%',
            fontSize: '12px',
            color: '#4E5769',
            textAlign: 'left',
            fontWeight: '400',
          }}
        >
          {statusMap[authStatus]?.desc}
          {statusMap[authStatus]?.email ? <a href="">{statusMap[authStatus]?.email}</a> : null}
        </div>
        {statusMap[authStatus]?.alert1 ? (
          <div
            style={{
              marginTop: '4px',
              width: '100%',
              fontSize: '12px',
              color: '#4E5769',
              fontWeight: '400',
              textAlign: 'left',
            }}
          >
            {statusMap[authStatus]?.alert1}
          </div>
        ) : null}
        {statusMap[authStatus]?.alert2 ? (
          <div
            style={{
              marginTop: '4px',
              width: '100%',
              fontSize: '12px',
              color: '#4E5769',
              fontWeight: '400',
              textAlign: 'left',
            }}
          >
            {statusMap[authStatus]?.alert2}
          </div>
        ) : null}
        {statusMap[authStatus]?.alert3 ? (
          <div
            style={{
              marginTop: '4px',
              width: '100%',
              fontSize: '12px',
              color: '#4E5769',
              fontWeight: '400',
              textAlign: 'left',
            }}
          >
            {statusMap[authStatus]?.alert3}
          </div>
        ) : null}
        <div style={{ marginTop: '16px' }}>
          {authStatus == '0' ? (
            <Button color="primary" onClick={handleAuth}>
              {intl.get('spfm.buyerElectronicSign.view.docusign.authBtn').d('接口授权')}
            </Button>
          ) : null}
          {authStatus == '1' || authStatus == '3' ? (
            <Button color="primary" onClick={handleAuth}>
              {intl.get('spfm.buyerElectronicSign.view.docusign.reAuthBtn').d('重新授权')}
            </Button>
          ) : null}
          {authStatus == '2' ? (
            <>
              <Button onClick={handleCancel}>
                {intl.get('spfm.buyerElectronicSign.view.docusign.cancelAuth').d('取消授权')}
              </Button>
              <Button color="primary" onClick={handleRefresh}>
                {intl.get('spfm.buyerElectronicSign.view.docusign.refresh').d('刷新')}
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </Spin>
  );
}

export default DocusignComp;
