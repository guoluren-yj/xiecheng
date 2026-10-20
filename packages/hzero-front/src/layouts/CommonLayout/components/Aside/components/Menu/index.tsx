/**
 * @email WY <yang.wang06@hand-china.com>
 * @creationDate 2019/12/19
 * @copyright HAND ® 2019
 */
import { connect } from 'dva';
import React from 'react';
import { Spin } from 'hzero-ui';
import { Size } from 'choerodon-ui/lib/_util/enum';

import { getClassName as getCommonLayoutClassName } from '../../../../utils';

import MainMenu from './MainMenu';
import SideMask from './SideMask';

import { useMenu as commonLayoutUseMenu } from './hooks';
import type { MenuItem } from './types';

interface MenuProps<OriginMenu = any> {
  components: {};
  getClassName?: (cls: string) => string;
  useMenu?: (
    menus: OriginMenu[]
  ) => {
    mainMenus: MenuItem[];
    activeMenu?: MenuItem;
  };
  menus?: OriginMenu[];
  menuLoad: Boolean;
  menuQuickIndex: string;
  activeTabKey?: string;
  className?: string;
  menuLineWrap?,
}

const Menu: React.FC<MenuProps> = ({
  getClassName = getCommonLayoutClassName,
  useMenu = commonLayoutUseMenu,
  menus = [],
  activeTabKey,
  menuLoad,
  menuQuickIndex,
  menuLineWrap,
}) => {
  const { mainMenus, activeMenu } = useMenu(menus, activeTabKey, menuQuickIndex);
  const [currentMenu, setCurrentMenu] = React.useState<MenuItem>();

  // 遮罩 取消后 设置
  const handleMaskTrigger = React.useCallback(() => {
    setCurrentMenu(undefined);
  }, [setCurrentMenu]);

  return (
    <>
      {menuLoad ? (
        <div className={[getClassName('menu-wrap'), menuLineWrap && "menu-line-wrap"].filter(Boolean).join(" ")}>
          <div className={getClassName('menu')}>
            {mainMenus.map((mainMenu) => {
              return (
                <MainMenu
                  key={mainMenu.key}
                  menu={mainMenu}
                  activeMenu={activeMenu}
                  currentMenu={currentMenu}
                  setCurrentMenu={setCurrentMenu}
                  menuLineWrap={menuLineWrap}
                />
              );
            })}

            {currentMenu && <SideMask onTrigger={handleMaskTrigger} />}
          </div>
        </div>
      ) : (
        <Spin spinning size={Size.large} className={getClassName('spin')} />
      )}
    </>
  );
};

export default connect(
  ({
    global = { menu: Array, menuLoad: Boolean, menuQuickIndex: String, activeTabKey: String },
  }) => ({
    menus: global.menu,
    menuLoad: global.menuLoad, // 菜单
    menuQuickIndex: global.menuQuickIndex, // 菜单
    activeTabKey: global.activeTabKey,
  })
)(Menu);
