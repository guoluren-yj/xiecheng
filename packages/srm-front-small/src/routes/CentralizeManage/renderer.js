import React from 'react';
import { Tag } from 'choerodon-ui';
import { Dropdown, Menu, Icon, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import styles from './styles.less';

const mapColor = {
  PUBLISHED: 'green',
  COMPLETED: 'green',
  CANCEL: 'gray',
  NEW: 'yellow',
};

export function tagRender({ record, value }) {
  if (!record || !value) return '-';
  const { publishStatus, publishStatusMeaning } = record.get([
    'publishStatus',
    'publishStatusMeaning',
  ]);
  const color = mapColor[publishStatus] || 'gray';
  return (
    <Tag color={color} style={{ border: 'none', fontWeight: 500 }}>
      {publishStatusMeaning}
    </Tag>
  );
}

export function optionsRender(options = [], maxLength = 3) {
  const filterOpts = options.filter(f => f.show !== false);
  const isMore = filterOpts.length > maxLength;
  const optsStand = isMore ? filterOpts.slice(0, maxLength - 1) : filterOpts;
  const optsMore = filterOpts.slice(maxLength - 1);

  const commands = optsStand.map(m => (
    <Button funcType="link" color="primary" onClick={m.onClick} disabled={m.disabled}>
      {m.text}
    </Button>
  ));

  if (isMore) {
    commands.push(
      <Dropdown
        placement="bottomLeft"
        overlay={
          <Menu>
            {optsMore.map(m => (
              <Menu.Item key={m.text}>
                <a onClick={m.onClick} disabled={m.disabled}>
                  {m.text}
                </a>
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <Button funcType="link" color="primary">
          {intl.get('hzero.common.button.more').d('更多')}
          <Icon type="expand_more" style={{ fontSize: 14, marginTop: -2 }} />
        </Button>
      </Dropdown>
    );
  }

  return <span className={styles["action-link"]}>{commands}</span>;
}
