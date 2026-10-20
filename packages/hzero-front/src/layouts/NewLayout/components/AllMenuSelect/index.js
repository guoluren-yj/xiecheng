import React, { forwardRef, useCallback, useEffect } from 'react';
import { Icon, Menu } from 'choerodon-ui';
import { useModal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import AllMenu from '../AllMenu';
import { getClassName } from '../../utils';

const AllMenuSelect = function (props, modalRef) {
  const {
    itemRenderer, recentlyVisited, collapsed, onRecentlyVisitedChange, onModalClose, onSearchActiveChange, onCommonMenusChange,
    menuLineWrap,
  } = props;
  const Modal = useModal();
  const { current } = modalRef;
  const handleMouseEnter = useCallback(() => {
    const { modal, animating } = current;
    if (current.modalCloseDefer) {
      window.clearTimeout(current.modalCloseDefer);
      current.modalCloseDefer = null;
    }
    if (!modal) {
      current.willModal = true;
      Promise.resolve(animating && animating.promise).then(() => {
        current.collapsed = collapsed;
        current.animating = null;
        current.willModal = null;
        const handleSearchActiveChange = (active) => {
          onSearchActiveChange(active);
          current.searchActive = active;
          if (!active && current.deferClose && current.modal) {
            current.modal.close();
            delete current.deferClose;
          }
        };
        current.modal = Modal.open({
          drawer: true,
          header: null,
          footer: null,
          drawerTransitionName: 'slide-left',
          maskClosable: true,
          style: {
            width: 880,
          },
          className: collapsed && getClassName('all-menu', 'modal', 'collapsed'),
          children: (
            <AllMenu
              itemRenderer={itemRenderer}
              recentlyVisited={recentlyVisited}
              onRecentlyVisitedChange={onRecentlyVisitedChange}
              onSearchActiveChange={handleSearchActiveChange}
              onCommonMenusChange={onCommonMenusChange}
              menuLineWrap={menuLineWrap}
            />
          ),
          afterClose() {
            current.modal = null;
            onModalClose();
          },
          // onMouseEnter() {
          //   if (current.modalCloseDefer) {
          //     window.clearTimeout(current.modalCloseDefer);
          //     current.modalCloseDefer = null;
          //   }
          //   delete current.deferClose;
          // },
          // onMouseLeave() {
          //   if (current.modal) {
          //     current.modalCloseDefer = setTimeout(() => {
          //       if (current.modal) {
          //         if (current.searchActive) {
          //           current.deferClose = true;
          //         } else {
          //           current.modal.close();
          //         }
          //       }
          //     }, 300);
          //   }
          // },
        });
      });
    }
  }, [Modal, collapsed, menuLineWrap]);

  useEffect(() => {
    if (current.collapsed !== collapsed) {
      current.collapsed = collapsed;
      if (current.modal) {
        current.modal.update({
          className: collapsed && getClassName('all-menu', 'modal', 'collapsed'),
        });
      }
    }
  }, [collapsed]);

  useEffect(() => () => {
    current.modal = null;
    onModalClose();
  }, []);

  return (
    <Menu mode="vertical" inlineIndent={0} onMouseEnter={handleMouseEnter}>
      <Menu.SubMenu title={
        <>
          <Icon type="menu" />
          <span>{intl.get('hzero.common.basicLayout.allMenu').d('全部菜单')}</span>
        </>
      } />
    </Menu>
  );
};

export default forwardRef(AllMenuSelect);
