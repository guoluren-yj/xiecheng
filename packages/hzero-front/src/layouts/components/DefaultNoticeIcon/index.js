/**
 * @reactProps {!function} fetchCount - 获取消息数量
 * @reactProps {!function} gotoTab - 消息点击事件出发的页面跳转
 * @reactProps {!function} fetchNotices - 获取消息
 */
import React from 'react';
import { Badge as H0Badge, Button, Popover, Spin, Tabs, Tooltip } from 'hzero-ui';
import { Badge as C7NBadge, Icon } from 'choerodon-ui';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import monent from 'moment';
import classNames from 'classnames';
import { routerRedux } from 'dva/router';

import intl from 'utils/intl';
import remote from 'utils/remote';
import { getResponse } from 'utils/utils';
import { timeZone2UTC } from 'utils/renderer';
import {
  allRead,
  deleteAll,
  queryAnnounces,
  queryExports,
  queryImports,
  queryNotices,
} from '../../../services/api';
import emptyMessageIcon from '../../../assets/empty-message.png';
import { ReactComponent as EmptyImport } from '@/assets/import.svg';
import { ReactComponent as EmptyExport } from '@/assets/export.svg';
import { ReactComponent as EmptyMessage } from '@/assets/message.svg';

import List from './NoticeList';
import styles from './index.less';

const { TabPane } = Tabs;
const noCountOffset = [-2, 0];
const countLt10Offset = [18, 2];
const countGt10Offset = [18, 4];

@remote({
  code: 'LAYOUT_NOTICE_ICON',
  name: 'processRemote',
})
class DefaultNoticeIcon extends React.PureComponent {
  static defaultProps = {
    emptyImage: emptyMessageIcon,
  };

  constructor(props) {
    super(props);
    const { title, processRemote } = props;
    this.state = {
      visible: false,
      currentTab: 'NOTICE', // 当前tab页
      showCount: processRemote && processRemote.process ?
        processRemote.process(
          'LAYOUT_NOTICE_ICON_SHOWCOUNT',
          true,
          {}
        ) : true,
    };
    if (title) {
      this.state.tabType = title;
    }
  }

  // componentDidMount() {
    // const { fetchCount } = this.props;
    // fetchCount();
  // }

  render() {
    const { className, count, icon } = this.props;
    const { showCount } = this.state;
    const noticeButtonClass = classNames({
      [className]: true,
      [styles.noticeButton]: !icon && true,
      [styles.hasCount]: !icon && count > 0,
    });
    let offset = noCountOffset;
    if (count > 9) {
      offset = countGt10Offset;
    } else if (count > 0) {
      offset = countLt10Offset;
    }
    const notificationBox = this.getNotificationBox();
    const { visible } = this.state;
    const bellIconClass = visible
      ? `${styles['icon-active']} ${styles['notification-icon']}`
      : styles['notification-icon'];
    const Badge = icon ? C7NBadge : H0Badge;
    const trigger = (
      <span className={noticeButtonClass}>
        <Badge
          size={icon && 'small'}
          count={showCount ? count : undefined}
          className={icon ? undefined : styles.badge}
          offset={offset}
        >
          <Icon className={icon ? undefined : bellIconClass} type={icon} />
        </Badge>
      </span>
    );
    if (!notificationBox) {
      return trigger;
    }
    return (
      <Popover
        placement="bottomRight"
        content={notificationBox}
        popupClassName={styles.popover}
        trigger="click"
        arrowPointAtCenter
        onVisibleChange={this.handleNoticeVisibleChange}
        visible={visible}
      >
        {trigger}
      </Popover>
    );
  }

  /**
   * 点击查看更多跳转页面
   */
  @Bind()
  handleNoticeList(e) {
    const { gotoTab } = this.props;
    gotoTab({ pathname: `/hmsg/user-message/list`, search: `?tabKey=${e}` });
    this.setState({ visible: false });
  }

  /**
   * 点击查看更多跳转页面
   */
  @Bind()
  handleNoticeItem(e) {
    e.preventDefault();
    this.setState({ visible: false });
  }

  /**
   * 点击每一行跳转到详情界面
   */
  handleItemClick = (item) => {
    const { gotoTab } = this.props;
    switch (item.userMessageTypeCode) {
      case 'NOTICE':
        gotoTab({ pathname: `/hmsg/user-message/detail/notice/${item.id}` });
        break;
      case 'ANNOUNCE':
        gotoTab({ pathname: `/hmsg/user-message/detail/announce/${item.id}` });
        break;
      case 'MSG':
        gotoTab({ pathname: `/hmsg/user-message/detail/message/${item.id}` });
        break;
      default:
        // should throw error, unKnow message type,
        break;
    }
    this.setState({ visible: false });
  };

  handleAnnounceItemClick = (item) => {
    const { gotoTab } = this.props;
    gotoTab({ pathname: `/hmsg/user-message/detail/announce/${item.id}` });
  };

  handleNoticeVisibleChange = (visible) => {
    this.setState({ visible });
    if (visible) {
      this.fetchNotices();
    }
  };

  onTabChange = (tabType) => {
    this.setState({ tabType });
    this.props.onTabChange(tabType);
  };

  @Bind()
  handleChangeTab(type) {
    this.setState({ currentTab: type });
    switch (type) {
      case 'NOTICE':
        this.fetchNotices();
        break;
      case 'ANNOUNCE':
        this.fetchAnnounces();
        break;
      case 'IMPORT':
        this.fetchImports();
        break;
      case 'EXPORT':
        this.fetchExports();
        break;
      default:
    }
  }

  /**
   * 清除全部消息
   */
  @Bind()
  async handleDeleteAll() {
    getResponse(await deleteAll());
    await this.fetchNotices();
  }

  /**
   * 获取公告数据
   */
  @Bind()
  fetchAnnounces() {
    this.setState({
      fetchingAnnounces: true,
    });
    queryAnnounces({ previewCount: 3 })
      .then((res) => {
        const data = getResponse(res);
        this.setState({
          announces: data,
        });
      })
      .finally(() => {
        this.setState({
          fetchingAnnounces: false,
        });
      });
  }

  /**
   * 获取消息数据
   */
  @Bind()
  fetchNotices() {
    this.setState({
      fetchingNotices: true,
    });
    queryNotices({ previewMessageCount: 3, readFlag: 0 })
      .then((res) => {
        const data = getResponse(res);
        this.setState({
          notices: data,
        });
      })
      .finally(() => {
        this.setState({
          fetchingNotices: false,
        });
      });
  }

  /**
   * 获取导入记录
   */
  @Bind()
  fetchImports() {
    this.setState({
      fetchingImports: true,
    });
    queryImports({ previewCount: 3 })
      .then((res) => {
        const data = getResponse(res);
        this.setState({
          imports: data,
        });
      })
      .finally(() => {
        this.setState({
          fetchingImports: false,
        });
      });
  }

  /**
   * 获取导出记录
   */
  @Bind()
  fetchExports() {
    this.setState({
      fetchingExports: true,
    });
    queryExports({ previewCount: 3 })
      .then((res) => {
        const data = getResponse(res);
        this.setState({
          exports: data,
        });
      })
      .finally(() => {
        this.setState({
          fetchingExports: false,
        });
      });
  }

  /**
   * 已读全部消息
   */
  @Bind()
  async handleAllRead() {
    // const { allRead } = this.props;
    getResponse(await allRead({ readAll: 1 }));
    await this.fetchNotices();
  }

  getNotificationBox() {
    const { locale, count, timeZone, icon, ...childProps } = this.props;
    const { showCount } = this.state;
    if (isEmpty(childProps)) {
      return null;
    }
    const { emptyImage, title } = childProps;
    const {
      currentTab,
      announces = [],
      notices = [],
      imports = [],
      exports = [],
      fetchingNotices = false,
      fetchingAnnounces = false,
      fetchingImports = false,
      fetchingExports = false,
    } = this.state;
    const Badge = icon ? C7NBadge : H0Badge;
    // TODO: 需要之后审查下为什么这里需要自己转化一下数据结构
    const newNotices =
      notices &&
      notices.map((item) => {
        const utc = timeZone2UTC(timeZone) || 8;
        return {
          id: item.userMessageId,
          key: `${item.userMessageTypeCode}_${item.userMessageId}`,
          title: item.subject,
          datetime: monent(`${item.creationDate}`).fromNow(),
          userMessageTypeMeaning: item.userMessageTypeMeaning,
          userMessageTypeCode: item.userMessageTypeCode,
        };
      });

    const newAnnounces = Array.isArray(announces)
      ? announces.map((item) => {
          const utc = timeZone2UTC(timeZone) || 8;
          return {
            id: item.noticeId,
            key: `${item.receiverTypeCode}_${item.noticeId}`,
            title: item.title,
            datetime: monent(`${item.publishedDate}`).fromNow(),
            userMessageTypeMeaning: item.receiverTypeMeaning,
            userMessageTypeCode: item.noticeTypeCode,
          };
        })
      : [];

    const newImports = Array.isArray(imports)
      ? imports.map((item) => {
          const utc = timeZone2UTC(timeZone) || 8;
          return {
            id: item.importTaskId,
            key: `${item.templateCode}_${item.importTaskId}`,
            title: item.fileName,
            datetime: monent(`${item.creationDate}`).fromNow(),
            importStatus: item.status,
            importStatusMeaning: item.statusMeaning,
          };
        })
      : [];

    const newExports = Array.isArray(exports)
      ? exports.map((item) => {
          const utc = timeZone2UTC(timeZone) || 8;
          return {
            id: item.taskId,
            key: `${item.taskCode}_${item.taskId}`,
            title: item.taskName,
            datetime: monent(`${item.creationDate}`).fromNow(),
            exportStatus: item.state,
            exportStatusMeaning: item.stateMeaning,
          };
        })
      : [];

    const panes = (
      <List
        data={newNotices}
        onClick={this.handleItemClick}
        onClear={() => this.props.onClear(title)}
        onMore={this.handleNoticeList}
        locale={locale}
        // 以下为item的内容
        title={title}
        emptyContent={
          <div className={styles['no-content']}>
            <div className={styles['no-content-pic']}>
              <EmptyMessage />
            </div>
            <div className={styles['no-content-text']}>
              {intl.get('hzero.common.view.message.noUnredMessage').d('暂无未读消息')}
            </div>
          </div>
        }
        emptyImage={emptyImage}
        contentItemAction={this.handleNoticeItem}
        contentTitleAction={
          <a onClick={() => this.handleNoticeList('message')}>
            {intl.get('hzero.common.basicLayout.gotoUserMessage').d('进入消息中心')}
          </a>
        }
      />
    );

    const announcePanes = (
      <List
        data={newAnnounces}
        onClick={this.handleAnnounceItemClick}
        locale={locale}
        // 以下为item的内容
        title={title}
        emptyImage={emptyImage}
        contentItemAction={this.handleNoticeItem}
        contentTitleAction={
          <a onClick={() => this.handleNoticeList('announce')}>
            {intl.get('hzero.common.basicLayout.gotoUserMessage').d('进入消息中心')}
          </a>
        }
      />
    );

    const importPanes = (
      <List
        data={newImports}
        locale={locale}
        // 以下为item的内容
        title={title}
        emptyImage={emptyImage}
        emptyContent={
          <div className={styles['no-content']}>
            <div className={styles['no-content-pic']}>
              <EmptyImport />
            </div>
            <div className={styles['no-content-text']}>
              {intl.get('hzero.common.view.message.noImportRecord').d('暂无导入记录')}
            </div>
          </div>
        }
        contentItemAction={() => {}}
        contentTitleAction={
          <a onClick={() => this.handleNoticeList('importHistory')}>
            {intl.get('hzero.common.basicLayout.gotoUserMessage').d('进入消息中心')}
          </a>
        }
      />
    );

    const exportPanes = (
      <List
        data={newExports}
        locale={locale}
        // 以下为item的内容
        title={title}
        emptyImage={emptyImage}
        emptyContent={
          <div className={styles['no-content']}>
            <div className={styles['no-content-pic']}>
              <EmptyExport />
            </div>
            <div className={styles['no-content-text']}>
              {intl.get('hzero.common.view.message.noExportRecord').d('暂无导出记录')}
            </div>
          </div>
        }
        contentItemAction={() => {}}
        contentTitleAction={
          <a onClick={() => this.handleNoticeList('exportHistory')}>
            {intl.get('hzero.common.basicLayout.gotoUserMessage').d('进入消息中心')}
          </a>
        }
      />
    );

    const operations = (
      <div className={styles['icon-btns']}>
        <Tooltip title={intl.get('hzero.common.basicLayout.option.allRead').d('全部已读')}>
          <Button shape="circle" className={styles['icon-button']} onClick={this.handleAllRead}>
            <Icon type="email-o" style={{ fontSize: 16 }} />
          </Button>
        </Tooltip>
        <Tooltip title={intl.get('hzero.common.basicLayout.option.deleteAll').d('全部清除')}>
          <Button shape="circle" className={styles['icon-button']} onClick={this.handleDeleteAll}>
            <Icon type="delete" style={{ fontSize: 16 }} />
          </Button>
        </Tooltip>
      </div>
    );

    return (
      <Tabs
        defaultActiveKey="NOTICE"
        animated={false}
        onChange={this.handleChangeTab}
        tabBarExtraContent={currentTab === 'NOTICE' ? operations : ''}
        className={styles['layout-tabs']}
      >
        <TabPane
          tab={
            <Badge size={icon && 'small'} count={showCount ? count : undefined} style={{ marginLeft: '16px' }}>
              {intl.get('hzero.common.view.title.tabNotice').d('消息')}
            </Badge>
          }
          key="NOTICE"
        >
          <Spin spinning={fetchingNotices} delay={0}>
            {fetchingNotices ? <div style={{ height: '258px' }} /> : panes}
          </Spin>
        </TabPane>
        <TabPane
          tab={
            <Badge size={icon && 'small'}>
              {intl.get('hzero.common.view.title.tabImport').d('导入记录')}
            </Badge>
          }
          tab={<Badge>{intl.get('hzero.common.view.title.tabImport').d('导入记录')}</Badge>}
          key="IMPORT"
        >
          <Spin spinning={fetchingImports} delay={0}>
            {fetchingImports ? <div style={{ height: '258px' }} /> : importPanes}
          </Spin>
        </TabPane>
        <TabPane
          tab={
            <Badge size={icon && 'small'}>
              {intl.get('hzero.common.view.title.tabExport').d('导出记录')}
            </Badge>
          }
          key="EXPORT"
        >
          <Spin spinning={fetchingExports} delay={0}>
            {fetchingExports ? <div style={{ height: '258px' }} /> : exportPanes}
          </Spin>
        </TabPane>
      </Tabs>
    );
  }
}

export default connect(
  ({ global = {}, user = {} }) => ({
    count: global.count,
    timeZone: user.currentUser.timeZone,
  }),
  (dispatch) => ({
    // 跳转到页面
    gotoTab: (location, state) => dispatch(routerRedux.push(location, state)),
    // 获取消息数量
    fetchCount: () =>
      dispatch({
        type: 'global/fetchCount',
      }),
    deleteAll: () =>
      dispatch({
        type: 'global/deleteAll',
      }),
    allRead: (payload) =>
      dispatch({
        type: 'global/allRead',
        payload,
      }),
  })
)(DefaultNoticeIcon);
