import React from 'react';
import classNames from 'classnames';
import { Button, Icon, Input, Pagination, Popover } from 'hzero-ui';

import { getEnvConfig } from 'utils/iocUtils';

import Icons from '../Icons';
import styles from './index.less';

const icons = [
  "view_in_ar",
  "Development-monitoring",
  "file_copy-o",
  "test",
  "archive-o",
  "aim_port",
  "manage_search",
  "microservice",
  "spa",
  "database",
  "kubernetes",
  "mail_set",
  "manage_organization",
  "payment",
  "price_change",
  "report_overview",
  "bar_chart",
  "open_with",
  "post_add",
  "settings",
  "framework",
  "account_tree-o",
  "build-o",
  "inventory_2-o",
  "work_log",
  "collections_bookmark-o",
  "description",
  "project",
  "my_location",
  "monetization_on-o1",
  "widgets_line",
  "domain_list",
  "account_balance_wallet-o",
  "dashboard-o",
  "sync_user",
  "domain",
  "saga_define",
  "calculate",
  "archive",
  "local_shipping",
  "integration_instructions-o",
  "storefront-o",
  "store-o",
  "library_books-o",
  "phone_android",
  "supervised_user_circle",
  "assignment_turned_in",
  "extension",
  "dns-o",
  "category-o",
  "assignment",
  "travel_explore",
  "add_business-o",
  "apartment-o",
  "dashboard_customize-o",
  "fiber_new",
  "drive_file_move-o",
  "attach_money",
  "calculate",
  "Development-monitoring",
  "settings_input_component-o",
  "smart_toy-o",
  "business_center-o",
  "stars-o",
  "security",
  "radar",
  "price_change",
  "travel_explore",
  "book1",
  "swap_vertical_circle",
]

export default class IconsPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIcon: props.value,
      pickerVisible: false,
      icons: icons.slice(0, 30),
      totalIcons: icons,
      defaultPageSize: 30,
    };
    this.config = getEnvConfig();
  }

  handlePickerVisible(visible) {
    this.setState({ pickerVisible: visible });
  }

  selectIcon(icon) {
    const { form, field: fieldName } = this.props;
    const { totalIcons = [] } = this.state;
    if (form && fieldName) {
      form.setFieldsValue({ [fieldName]: icon });
    }
    this.setState({ selectedIcon: icon, pickerVisible: false, totalIcons });
  }

  handleChange({ target: { value } }) {
    const { totalIcons = [], defaultPageSize } = this.state;
    const size = defaultPageSize < totalIcons.length ? defaultPageSize : totalIcons.length;
    if (value) {
      const filterList = totalIcons.filter((icon) => icon.includes(value));
      this.setState({ icons: filterList, selectedIcon: value });
    } else {
      this.setState({ icons: totalIcons.slice(0, size), selectedIcon: '' });
    }
  }

  handleClear() {
    const { form, field: fieldName } = this.props;
    const { totalIcons = [], icons = [], defaultPageSize } = this.state;
    const size = defaultPageSize < icons.length ? defaultPageSize : icons.length;
    if (form && fieldName) {
      form.setFieldsValue({ [fieldName]: '' });
    }
    this.setState({ pickerVisible: false, selectedIcon: '', icons: totalIcons.slice(0, size) });
  }

  handlePagination(page, pageSize) {
    const { totalIcons = [] } = this.state;
    const size = pageSize * (page - 1);
    const pagIcons =
      size + pageSize >= totalIcons.length
        ? totalIcons.slice(size, totalIcons.length)
        : totalIcons.slice(size, size + pageSize);
    this.setState({ icons: pagIcons });
  }

  render() {
    const { isButton = false, allowClear = false } = this.props;
    const {
      selectedIcon,
      pickerVisible,
      totalIcons = [],
      icons = [],
      defaultPageSize,
    } = this.state;

    const suffix = (
      <>
        {allowClear && selectedIcon && (
          <Icon type="close" className="icons-picker-clear" onClick={this.handleClear.bind(this)} />
        )}
        <Icon type="scan" />
      </>
    );

    return (
      <>
        <Popover
          visible={pickerVisible}
          onVisibleChange={this.handlePickerVisible.bind(this)}
          trigger="click"
          placement="bottom"
          content={
            <>
              <div
                className={classNames({
                  [styles['icons-picker-wrapper']]: true,
                })}
              >
                {icons.map((icon) => (
                  <div
                    className={classNames({
                      [styles.icons]: true,
                    })}
                    key={icon}
                  >
                    <Icons type={icon} size={18} onClick={this.selectIcon.bind(this, icon)} />
                  </div>
                ))}
              </div>
              <Pagination
                simple
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '10px',
                }}
                defaultPageSize={defaultPageSize}
                defaultCurrent={1}
                total={totalIcons.length}
                onChange={this.handlePagination.bind(this)}
              />
            </>
          }
        >
          {isButton ? (
            <Button className={styles['icon-picker-button']}>
              {selectedIcon ? (
                <Icons type={selectedIcon} size={18} />
              ) : (
                <Icon type="scan" style={{ fontSize: '18px' }} />
              )}
            </Button>
          ) : (
            <Input
              clearButton
              className={styles['icon-picker']}
              value={selectedIcon}
              prefix={selectedIcon && <Icons type={selectedIcon} size={18} />}
              suffix={suffix}
              onChange={this.handleChange.bind(this)}
            />
          )}
        </Popover>
      </>
    );
  }
}
