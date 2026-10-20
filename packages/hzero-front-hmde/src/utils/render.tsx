import React, { useState } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import { Badge } from 'hzero-ui';
import { Menu, Dropdown } from 'choerodon-ui/pro';
import { Tag, Icon } from 'choerodon-ui';

import { PublishStatus } from '@/businessGlobalData/common';

export function enableRender(v) {
  return (
    <div className="bo-enable-render">
      {React.createElement(Badge, {
        status: v ? 'success' : 'error',
        text: v
          ? intl.get('hzero.common.enable').d('启用')
          : intl.get('hzero.common.disable').d('禁用'),
      })}
    </div>
  );
}

// 发布render
export function publishRender(v) {
  return (
    <div className="bo-enable-render">
      {React.createElement(Badge, {
        status: v ? 'success' : 'error',
        text: v
          ? intl.get('hzero.common.published').d('已发布')
          : intl.get('hzero.common.unPublished').d('未发布'),
      })}
    </div>
  );
}

export function statusRender(...args) {
  const statusList = args.length > 1 && args[1] !== undefined ? args[1] : [];
  const value = args[0];
  const text = args.length > 2 && args[2] !== undefined ? args[2] : '';
  if (value === '' || value === undefined || value === null) return '';
  const currentStatus =
    statusList.find((item) => {
      return item.value === value;
    }) ||
    statusList.find((item) => {
      return item.status === 'default';
    }) ||
    {};

  return (
    <div className="bo-enable-render">
      {React.createElement(Badge, {
        status: currentStatus.status || 'default',
        text: text || currentStatus.text,
      })}
    </div>
  );
}

export function statusTagRender(status) {
  const statusMap = {
    [PublishStatus.PUBLISHED]: {
      color: 'green',
      text: intl.get('hmde.common.status.published').d('已发布'),
    },
    [PublishStatus.MODIFIED]: {
      color: 'orange',
      text: intl.get('hmde.common.status.modified').d('已修改'),
    },
    [PublishStatus.UNPUBLISHED]: {
      color: 'gray',
      text: intl.get('hmde.common.status.unpublished').d('未发布'),
    },
  };
  const { color, text } = statusMap[status] || statusMap[PublishStatus.UNPUBLISHED];
  return <Tag {...{ border: false} as any} color={color}>{text}</Tag>;
}

// 示例:
// {
//   name: 'publishStatus',
//   renderer: ({ value }) => {
//     const statusList = [
//       {
//         value: PublishStatus.PUBLISHED,
//         status: 'success',
//         text: intl.get('hzero.common.status.published').d('已发布'),
//       },
//       {
//         value: PublishStatus.MODIFIED,
//         status: 'warning',
//         text: intl.get('hzero.common.status.modified').d('已修改'),
//       },
//       {
//         value: PublishStatus.UNPUBLISHED,
//         status: 'default',
//         text: intl.get('hzero.common.status.unpublished').d('未发布'),
//       },
//     ];
//     return statusRender(value.toUpperCase(), statusList);
//   },
// },

export function TagRender(status, statusList: any[] = [], text: string = '', fontColor?: string) {
  if (status === '' || status === undefined || status === null) return '';
  const currentStatus =
    statusList.find((item) => item.status === status) ||
    statusList.find((item) => item.status === 'default') ||
    {};
  return (
    <Tag style={{ color: fontColor }} color={currentStatus.color || ''} {...{ border: false } as any}>
      {text || currentStatus.text}
    </Tag>
  );
}

export function OperatorRender({ actions = [], options = {}, domRef }: { actions: any[], options: any, domRef?: any }) {
  const {
    limit = 3,
    label = intl.get('hzero.common.button.action').d('操作'),
  } = options;
  const [visible, setVisible] = useState(false);
  const newActions = actions;
  if (newActions.length <= limit) {
    return (
      <span className="action-link">
        {newActions}
      </span>
    );
  }
  const sliceIndex = limit > 0 ? limit - 1 : 0;
  const opts = newActions.slice(0, sliceIndex);
  const moreOpts = newActions.slice(sliceIndex);
  const menu = visible ? (
    <Menu>
      {moreOpts.map((action) => {
        return <Menu.Item>{action}</Menu.Item>;
      })}
    </Menu>
  ) : undefined;

  const handleVisibleChange = (value) => {
    setVisible(value);
  };

  return (
    <span className="action-link">
      {opts.map((action) => action)}
      <Dropdown
        overlay={menu}
        visible={visible}
        onVisibleChange={handleVisibleChange}
        getPopupContainer={() => domRef}
      >
        <a className="action-link-operation" style={{ verticalAlign: 'baseline' }}>
          {label}
          <Icon type="expand_more" />
        </a>
      </Dropdown>
    </span>
  );
}