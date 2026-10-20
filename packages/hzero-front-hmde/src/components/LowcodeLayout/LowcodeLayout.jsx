/* eslint-disable react/jsx-curly-brace-presence */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable import/order */
import React, { useState, forwardRef, useImperativeHandle, useEffect, useCallback } from 'react';
import { Spin, Menu, Dropdown } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';

import { deleteCookie } from '@/utils/common';

import styles from './LowcodeLayout.less';
// import MenuFrame from '../PageMenu';

// images
import logo from '@/assets/logoM9.svg';
import menuMark from '@/assets/menuicons/menu_mark@3x.png';
import noPermissionImg from '@/assets/no-authority@3x.png';
import { useHlodMenu } from './hooks';

// 覆盖hzero布局样式
export default forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    setShowMenuFrame, // 控制展现层列表是否关闭
  }));
  const { children = null, sharedFlag, viewSourceFlag } = props;
  const [showMenuFrame, setShowMenuFrame] = useState(false); // 控制展现层列表是否关闭

  const [hlodMenus, { loading, hasError }] = useHlodMenu(sharedFlag);
  function getActiveMenu() {
    let target;
    hlodMenus.forEach((m) => {
      if (window.location.href.indexOf(m.url) > -1) {
        target = m;
      } else if (m.children) {
        m.children.forEach((cm) => {
          if (window.location.href.indexOf(cm.url) > -1) {
            target = cm;
          }
        });
      }
    });

    return target;
  }

  const [activeMenu, setActiveMenu] = useState({
    url: (getActiveMenu() || {}).url,
  });

  // 正常情况下
  useEffect(() => {
    setActiveMenu({
      url: (getActiveMenu() || {}).url,
    });
  }, [hlodMenus]);
  // 不正常情况下
  // function tick() {
  //   setTimeout(() => {
  //     const menu = getActiveMenu() || {};
  //     if (menu.url && menu.url !== activeMenu.url) {
  //       console.log('setActiveMenu');
  //       setActiveMenu({
  //         url: menu.url,
  //       });
  //     }
  //     tick();
  //   }, 300);
  // }
  // tick();

  const noPermission = hasError || (!loading && hlodMenus.length === 0);

  // eslint-disable-next-line
  function onClickMenu(menu) {
    setActiveMenu(menu);
  }

  function renderMenus(menus = []) {
    const renderMenuTitle = (val) => {
      const TitleMap = {
        // PAGE_DESIGNER: '应用设计',
        // PUBLISHED_PAGE: '应用查看',
        APP_MODELER: '应用模型',
        MODELER_MANAGER: '应用模型',
        // EVENT_LIST: '事件管理',
        // APP_ASSIGN: '权限管理',
      };
      return TitleMap[val];
    };
    return menus.map((menu) => {
      const isActive =
        (menu.url && activeMenu.url === menu.url) ||
        (menu.children || []).find((cm) => cm.url === activeMenu.url);

      const submenu = (
        // selectedKeys = [] 路由跳转下 选中样式有误 故取消选中的样式
        <Menu className="hlod-routes-model" selectedKeys={[]}>
          {(menu.children || []).map((m) => (
            <Menu.Item key={m.code}>
              <a
                onClick={() => {
                  if (props && props.history && props.history.push) {
                    onClickMenu(m);
                    props.history.push(`${m.url}`);
                  }
                }}
                target="_self"
                rel="noopener noreferrer"
              >
                {m.name}
              </a>
            </Menu.Item>
          ))}
        </Menu>
      );

      return (
        <Dropdown overlay={submenu} trigger={['click']}>
          <Tooltip placement="right" title={renderMenuTitle(menu.permissionCode)}>
            <div
              key={menu.name}
              className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
              onClick={() => {
                if (menu.name === 'page') {
                  onClickMenu(menu);
                  // 是否跳转到展现页面
                  const presentationPathArr = [
                    '/pub/hlod/render/page-designer/canvas',
                    '/pub/hlod/render/page-designer',
                  ];
                  if (
                    presentationPathArr.some((path) => history.location.pathname.includes(path))
                  ) {
                    // 在展现层
                    setShowMenuFrame(!showMenuFrame);
                  } else {
                    // 不在展现层
                    history.push(`/pub/hlod/render/page-designer/canvas`);
                  }
                } else if (menu.url) {
                  onClickMenu(menu);
                  // 菜单和并后 需要跳转
                  if (props && props.history && props.history.push) {
                    props.history.push(`${menu.url}`);
                  }
                }
              }}
            >
              <div className={styles.bgColor} />
              <div className={styles.bgBar} />
              <img src={isActive ? menu.iconSelected : menu.icon} alt="" />

              {(menu.children || []).length ? (
                <img
                  src={menuMark}
                  className={styles.menumark}
                  style={{ width: 4, height: 4 }}
                  alt=""
                />
              ) : null}
            </div>
          </Tooltip>
        </Dropdown>
      );
    });
  }

  const renderMenuCallback = useCallback(renderMenus, [hlodMenus, activeMenu]);

  return (
    <Spin wrapperClassName={styles.layoutSpin} spinning={loading} style={{ height: '100%' }}>
      <div className={`hmde ${styles.lowcodeLayout} ${props.className || ''}`}>
        {
          <>
            {!props.hideNav && (
              <div
                className={styles.navbar}
                style={{ borderRight: viewSourceFlag ? 'none' : '1px solid #ddd' }}
              >
                <Tooltip placement="right" title="返回模型首页">
                  <div
                    className={styles.logo}
                    onClick={() => {
                      deleteCookie('appInfo');
                      sessionStorage.removeItem('appInfo');
                      sessionStorage.setItem(
                        'activeMenu',
                        JSON.stringify({ title: '应用搭建', key: 'appBuildKey' })
                      );
                      window.location = `${window.location.protocol}//${window.location.host}${window.$$env.BASE_PATH}pub/hmde/authority/authority-manage`;
                    }}
                  >
                    <img src={logo} alt="" />
                  </div>
                </Tooltip>
                {!viewSourceFlag ? (
                  <React.Fragment>
                    <section className={styles.menus}>{renderMenuCallback(hlodMenus)}</section>
                    <section style={{ flex: 1 }} />
                  </React.Fragment>
                ) : (
                  <></>
                )}
              </div>
            )}
            <div className={`${styles.lowcodePageContainer} page-container ant-layout-content`}>
              {noPermission ? (
                <div className={styles['no-permission']}>
                  <img src={noPermissionImg} alt="没有权限" />
                  <span>暂无权限，请联系平台管理员~</span>
                </div>
              ) : (
                children
              )}
            </div>
            {/* {showMenuFrame && <MenuFrame {...props} setShowMenuFrame={setShowMenuFrame} />} */}
          </>
        }
      </div>
    </Spin>
  );
});
