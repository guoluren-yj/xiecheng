import React from 'react';
import { Menu, Dropdown, Icon, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import style from './index.less';

export default function HistoryVersion(props) {
  const { dropdownProps = {}, buttonProps = {}, historyVersionList = [], beforeIconType } = props || {};
  const menu = (
    <Menu
      selectable={false}
      className={style['history-version-menu']}
      onClick={({key}) => {
        props.history.push({
          pathname: `/small/price-comparison-strategy-definition/${historyVersionList[key].compareRuleHeaderId}/1`,
        });
      }}
    >
      {historyVersionList?.map((version, key) => (
        <Menu.Item
          key={key}
        >
          <div className='version-item-header'>
            {intl.get(`small.comparePrice.model.model.version`).d('版本')}v{version.subVersion ? version.subVersion : ''}
          </div>
          <div className='version-item-footer'>
            <span>{version.createName}({version.createdBy})</span>
            <span className='version-item-date'>{dateTimeRender(version.creationDate)}</span>
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <Dropdown
      overlay={menu}
      {...dropdownProps}
    >
      <Button funcType='flat' className={style['history-version-btn']} {...buttonProps}>
        {beforeIconType && (
          <Icon
            type={beforeIconType}
            style={{
              marginRight: 4,
              marginTop: -3,
            }}
          />
        )}
        {intl.get('hzero.common.button.historyVersion').d('历史版本')}
        <Icon
          type='expand_more'
          style={{
            marginLeft: 4,
            marginTop: -2,
          }}
        />
      </Button>
    </Dropdown>
  );
}
