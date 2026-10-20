import React, { Component } from 'react';
import classnames from 'classnames';
import intl from 'utils/intl';
import { Button, Tooltip, Spin } from 'choerodon-ui/pro';
import { isElementOverflowed, hexToRGBA } from '@/utils/utils';
import { getCurrentUser } from 'utils/utils';
import ResizeObserver from 'resize-observer-polyfill';

import Dragview from '../DragView';
import RightClickMenu from '../RightClickMenu';
import styles from './index.less';
import '../../common/index.less';

export default class GroupMember extends Component {
  ref = React.createRef(null);

  timer = null;

  contextMenuRef = null;

  memberWithTooltip = {};

  resizeObserver = null; // 元素监听器

  componentDidMount() {
    this.memberWithTooltip = {};
    if (this.props.pageStyle !== 'cover') {
      this.setWidth(200);
    }
    const element = this.ref.current;
    // 创建 ResizeObserver 实例
    this.resizeObserver = new ResizeObserver(() => {
      this.onWidthChange();
    });
    // 开始监听元素的大小变化
    if (element) {
      this.resizeObserver.observe(element);
    }
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect();
  }

  onDragChange = (changeX) => {
    const current = this.ref?.current;
    if (!current) return;
    const widthStr = current.style.width;
    let width = Number(widthStr.replace(/px/g, ''));
    width += changeX;
    // 最小为 200
    if (width > 280) {
      width = 280;
    } else if (width < 200) {
      width = 200;
    }
    this.setWidth(width);
  };

  onWidthChange = () => {
    const current = this.ref?.current;
    clearTimeout(this.timer);
    if (!current) return;
    // 判断名称是否带有省略号 - 防抖
    this.timer = setTimeout(() => {
      const _memberWithTooltip = {};
      const groupNameDom = current.getElementsByClassName(
        styles['smbl-chat-room-group-member-tenant-name']
      );
      const memberDoms = current.getElementsByClassName(
        styles['smbl-chat-room-group-member-username']
      );
      const doms = [...(groupNameDom || []), ...(memberDoms || [])];
      let isUpdate = false; // 更新标记
      for (let i = 0; i < doms.length || 0; i++) {
        const dom = doms[i];
        const withTooltip = isElementOverflowed(dom);
        _memberWithTooltip[dom.id] = withTooltip;
        if (!!withTooltip !== !!this.memberWithTooltip[dom.id]) {
          isUpdate = true;
        }
      }
      this.memberWithTooltip = _memberWithTooltip;
      if (isUpdate) {
        this.forceUpdate();
      }
    }, 100);
  };

  setWidth = (width) => {
    const current = this.ref?.current;
    if (!current) return;
    current.style.width = `${width}px`;
  };

  onRightClick = (e, record) => {
    if (e.preventDefault) {
      e.preventDefault();
    }

    const menuList = [
      {
        key: 'download',
        title: `@${record?.displayName}`,
        icon: '',
        onClick: () => this.handleAtUser(record),
      },
    ];
    this.contextMenuRef.show(e, menuList);
  };

  handleAtUser = (record) => {
    const { onAtPeople } = this.props;
    if (onAtPeople && typeof onAtPeople === 'function') {
      onAtPeople(record);
    }
  };

  render() {
    const { pageStyle, onClose, roomInfo, memberLoading } = this.props;
    const currentUser = getCurrentUser();
    const { themeConfigVO = {} } = currentUser;
    const groupMemberClass = classnames(styles['smbl-chat-room-group-member'], {
      [styles['smbl-chat-room-group-member-cover']]: pageStyle === 'cover',
      [styles['smbl-chat-room-group-member-right']]: pageStyle !== 'cover',
      [styles['smbl-lum-scrollbar']]: true,
    });
    const TenantMember = ({ tenant, isPurchase = false }) => {
      return (
        <div className={styles['smbl-chat-room-group-member-tenant']}>
          <Tooltip
            placement="left"
            title={tenant.displayName}
            trigger={this.memberWithTooltip[tenant.companyId] ? 'hover' : 'false'}
          >
            <div
              id={tenant.companyId}
              className={styles['smbl-chat-room-group-member-tenant-name']}
            >
              {tenant.displayName}
            </div>
          </Tooltip>
          {(tenant.members || []).map((m) => {
            const tenantCls = classnames(styles['smbl-chat-room-group-member-tenant-member'], {
              [styles['smbl-chat-room-group-member-tenant-member-offline']]: !m.onlineFlag,
            });
            const domId = `_user_id_${m.id}`;
            return (
              <div className={tenantCls} key={m.id}>
                <div
                  className={
                    isPurchase
                      ? styles['smbl-chat-room-group-member-tag-purchase']
                      : styles['smbl-chat-room-group-member-tag-supplier']
                  }
                  style={
                    isPurchase
                      ? {
                          color: themeConfigVO.colorCode,
                          backgroundColor: hexToRGBA(themeConfigVO.colorCode, 0.1),
                        }
                      : {}
                  }
                >
                  {isPurchase
                    ? intl.get('smbl.chat.view.title.purchaseTag').d('采')
                    : intl.get('smbl.chat.view.title.supplierTag').d('供')}
                </div>
                <Tooltip
                  placement="left"
                  title={m.displayName}
                  trigger={this.memberWithTooltip[domId] ? 'hover' : 'false'}
                >
                  <div
                    id={domId}
                    className={styles['smbl-chat-room-group-member-username']}
                    onContextMenu={(e) => this.onRightClick(e, m)}
                  >
                    {m.displayName}
                  </div>
                </Tooltip>
              </div>
            );
          })}
        </div>
      );
    };
    return (
      <div className={groupMemberClass} ref={this.ref}>
        <Dragview
          className={styles['smbl-chat-room-group-member-drag-view']}
          direction="horizontal"
          onChange={this.onDragChange}
        />
        <Button
          icon="close"
          funcType="flat"
          className={styles['smbl-chat-room-group-member-close-btn']}
          onClick={onClose}
        />
        <div className={styles['smbl-chat-room-group-member-title']}>
          {intl.get('smbl.chat.view.title.members').d('人员')}
        </div>
        <Spin
          wrapperClassName={styles['smbl-chat-room-group-member-content']}
          spinning={memberLoading}
          size="small"
        >
          {roomInfo?.purchase && (
            <TenantMember tenant={roomInfo.purchase} isPurchase key={roomInfo.purchase.tenantId} />
          )}
          {(roomInfo?.suppliers || []).map((tenant) => (
            <TenantMember tenant={tenant} key={tenant.tenantId} />
          ))}
        </Spin>
        <RightClickMenu
          onRef={(ref) => {
            this.contextMenuRef = ref;
          }}
        />
      </div>
    );
  }
}
