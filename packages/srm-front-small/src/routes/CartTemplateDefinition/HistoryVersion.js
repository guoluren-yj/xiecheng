import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Icon, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import { fetchHistoryListService } from '@/services/cartTemplateDefinitionService';
import style from './index.less';

export default function HistoryVersion(props) {
  const { dropdownProps = {}, buttonProps = {}, beforeIconType, templateStyle, isSubMenu = false } = props || {};
  const [size, setSize] = useState(20);
  const [hidden, setHidden] = useState(true);
  const [historyVersionData, setData] = useState({});

  useEffect(() => {
    fetchHistoryList();
  }, [size]);

  async function fetchHistoryList() {
    const params = {
      templateStyle,
      size,
    };
    const res = getResponse(await fetchHistoryListService(params));
    setData(res);
  }

  function handleMenuClick({key}) {
    if(key === 'viewMore') {
      setSize(s => s + 20);
      setHidden(false);
    } else {
      props.history.push({
        pathname: `/small/cart-template-definition/distribution/${key}/?readOnly=1`,
      });
    }
  }

  const menu = (
    <Menu selectable={false} className={style['history-version-menu']} onClick={handleMenuClick}>
      {historyVersionData.content?.map(version => (
        <Menu.Item key={version.templateId}>
          <div className="version-item-header">
            {intl.get(`small.common.model.model.version`).d('版本')}v
            {version.version ? version.version : ''}
          </div>
          <div className="version-item-footer">
            <span>
              {version.createName}({version.createdBy})
            </span>
            <span className="version-item-date">{dateTimeRender(version.creationDate)}</span>
          </div>
        </Menu.Item>
      ))}
      {historyVersionData.totalElements > 20 && (
        <Menu.Item className="action-link" key="viewMore">
          {intl.get('small.common.button.viewMore').d('查看更多')}
        </Menu.Item>
      )}
    </Menu>
  );
  return isSubMenu ? (
    menu
  ) : (
    <Dropdown
      overlay={menu}
      hidden={hidden}
      onHiddenBeforeChange={h => setHidden(h)}
      {...dropdownProps}
      placement='bottomLeft'
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
