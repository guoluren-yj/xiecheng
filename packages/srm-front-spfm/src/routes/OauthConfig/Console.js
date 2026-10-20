/**
 * Console -免密登录控制台
 * @date: 2021-08-17
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
// import RelTable from 'srm-front-boot/lib/components/RelTable';
import RelTable from '@/components/RelTable';
import ActionImg from '@/assets/action.png';
import { Menu } from 'choerodon-ui';
import EcAcquirerAddress from './index';
import styles from './index.less';

const ecAcquirerAddressNeed = {
  oauthConfig: { list: [], pagination: {} },
  loading: false,
  saveLoading: false,
  addLoading: false,
};
const ConsoleComponents = [
  {
    key: 'passwordFreeLogin',
    // 免密登录
    thisComponent: <EcAcquirerAddress {...ecAcquirerAddressNeed} />,
  },
  {
    key: 'oauthSamlBinding',
    // SAML用户关系
    thisComponent: (
      <RelTable
        tableCode="oauth_saml_binding"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
      />
    ),
  },
  {
    key: 'outboundWhitelist',
    // 跨域白名单
    thisComponent: (
      <RelTable
        tableCode="outbound_whitelist"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
      />
    ),
  },
  {
    key: 'spfmOutboundJumpLinks',
    // 外部跳转链接
    thisComponent: (
      <RelTable
        tableCode="spfm_outbound_jump_links"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
      />
    ),
  },
  {
    key: 'spfmOutboundJumpPublicKey',
    // 外部跳转秘钥配置
    thisComponent: (
      <RelTable
        tableCode="spfm_outbound_jump_public_key"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
      />
    ),
  },
  {
    key: 'unilink',
    // 短链接模板表
    thisComponent: (
      <RelTable
        tableCode="unilink"
        exportDataFlag={false}
        exportTemplateFlag={false}
        importDataFlag={false}
      />
    ),
  },
];

function Console() {
  const [currentPageKey, setCurrentPageKey] = useState('passwordFreeLogin');
  const [showMenu, setShowMenu] = useState(true);

  const switchMenu = (e) => {
    setCurrentPageKey(e.key);
  };

  const handleFoldTree = (value) => {
    setShowMenu(value);
  };

  const findObj = ConsoleComponents.find((res) => res.key === currentPageKey);
  const rightContent = findObj && findObj.thisComponent ? findObj.thisComponent : '';

  return (
    <>
      <div className={styles['content-container']}>
        {showMenu ? (
          <div className="content-container-left">
            <div className="content-container-left-fold">
              <div>
                <img src={ActionImg} alt="" onClick={() => handleFoldTree(false)} />
              </div>
            </div>
            <Menu
              onClick={switchMenu}
              className={styles['left-menu']}
              defaultOpenKeys={['configurationItem', 'reverseSingleSignOn']}
              defaultSelectedKeys={['passwordFreeLogin']}
              mode="inline"
            >
              <Menu.Item key="passwordFreeLogin">
                {intl.get('spfm.OauthConfigConsole.view.title.PasswordFreeLogin').d('免密登录')}
              </Menu.Item>
              <Menu.Item key="unilink">
                {intl.get('spfm.OauthConfigConsole.view.title.unilink').d('短链接模板表')}
              </Menu.Item>
              <Menu.Item key="spfmOutboundJumpLinks">
                {intl
                  .get('spfm.OauthConfigConsole.view.title.spfmOutboundJumpLinks')
                  .d('外部跳转链接')}
              </Menu.Item>
              <Menu.Item key="spfmOutboundJumpPublicKey">
                {intl
                  .get('spfm.OauthConfigConsole.view.title.spfmOutboundJumpPublicKey')
                  .d('外部跳转秘钥配置')}
              </Menu.Item>
              <Menu.Item key="oauthSamlBinding">
                {intl.get('spfm.OauthConfigConsole.view.title.oauthSamlBinding').d('SAML用户关系')}
              </Menu.Item>
            </Menu>
          </div>
        ) : null}
        <di className="content-container-right">
          {!showMenu ? (
            <div className="content-container-right-unfold">
              <div>
                <img
                  src={ActionImg}
                  alt=""
                  style={{ transform: 'rotateY(180deg)' }}
                  onClick={() => handleFoldTree(true)}
                />
              </div>
            </div>
          ) : null}
          <div style={{ width: '100%' }}>{rightContent}</div>
        </di>
      </div>
    </>
  );
}

export default formatterCollections({
  code: ['spfm.OauthConfigConsole', 'spfm.adaptorConsole'],
})(Console);
