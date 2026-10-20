import React from 'react';
import { Menu, Dropdown, Icon, Button } from 'choerodon-ui/pro';
import getLang from '@/langs/commonLang';

const { Item: MenuItem } = Menu;

class MenuButton extends React.Component {
  render() {
    const { events = [] } = this.props;

    const menu = (
      <Menu>
        {events
          .filter((item) => item.show)
          .map((item) => {
            const { key, title, action } = item;
            return (
              <MenuItem key={key}>
                <a onClick={action}>{title}</a>
              </MenuItem>
            );
          })}
      </Menu>
    );
    return (
      <Dropdown overlay={menu}>
        <Button>
          {getLang('IMPORT')}
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>
    );
  }
}
export default MenuButton;
