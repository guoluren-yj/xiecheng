import React, { cloneElement } from 'react';
import { isArray, isNil, isEqual, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Button, Dropdown, Menu, Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './index.less';

export default class Permission extends React.Component {
  state = {
    newDataSource: [],
  };

  // 在 render 之前检查权限
  // eslint-disable-next-line
  UNSAFE_componentWillMount() {
    this.check();
  }

  // 兼容显示状态同步
  // eslint-disable-next-line
  UNSAFE_componentWillUpdate(nextProps) {
    const newShowData = (nextProps.dataSource || []).map((item) => item.show);
    const oldShowdData = (this.props.dataSource || []).map((item) => item.show);
    // !isEqual(newShowData, oldShowdData)如果只判断show是否一致，会出现click事件中传入的
    if (newShowData && oldShowdData && !isEqual(nextProps.dataSource, this.props.dataSource)) {
      this.check(nextProps);
    }
  }

  /**
   * 调用 context 的 check
   * @param {object} props - 检查所需参数
   * @param {object} context - 上下文
   */
  @Bind()
  async check(nextProps) {
    const { dataSource, permsMap = new Map() } = nextProps || this.props;
    const newDataSource = [];
    dataSource.forEach((item) => {
      const { permissionCodeList } = item;
      if (!isNil(permissionCodeList) && isArray(permissionCodeList)) {
        permissionCodeList.some((code) => {
          if (permsMap.get(code)) {
            newDataSource.push(item);
            return true;
          } else {
            return false;
          }
        });
      } else {
        newDataSource.push(item);
      }
      this.setState({ newDataSource });
    });
  }

  render() {
    const { newDataSource } = this.state;
    const oprList = [];
    newDataSource.forEach((item) => {
      const {
        show = false, // 按钮展示逻辑
        main = false, // 是否为主按钮，默认只有一个
      } = item;
      if (show) {
        if (main) {
          oprList.unshift(item);
        } else {
          oprList.push(item);
        }
      }
    });
    if (isEmpty(oprList)) return <span>-</span>;
    const oprCount = oprList.length;
    const outComList = oprList.splice(0, oprCount > 3 ? 2 : 3);
    const moreList = oprList;
    return (
      <div className={styles['ssta-permission-dropdown-wrapper']}>
        {outComList.map((item) => {
          const { key, type, wait, title, btnComp, onClick } = item;
          const reallyKey = key || type;
          return btnComp ? (
            cloneElement(btnComp, { key: reallyKey })
          ) : (
            <Button funcType="link" color="primary" key={reallyKey} wait={wait} onClick={onClick}>
              {title}
            </Button>
          );
        })}
        {!isEmpty(moreList) && (
          <Dropdown
            overlay={
              <Menu className={styles['ssta-permission-dropdown-menu']}>
                {moreList.map((item) => {
                  const { key, type, title, btnComp, onClick } = item;
                  const reallyKey = key || type;
                  return (
                    <Menu.Item key={reallyKey} onClick={onClick}>
                      {btnComp || title}
                    </Menu.Item>
                  );
                })}
              </Menu>
            }
          >
            <Button funcType="link" color="primary" className="ssta-permission-dropdown-more">
              {intl.get('hzero.common.button.more').d('更多')}
              <Icon type="expand_more" className="ssta-permission-dropdown-more-icon" />
            </Button>
          </Dropdown>
        )}
      </div>
    );
  }
}
