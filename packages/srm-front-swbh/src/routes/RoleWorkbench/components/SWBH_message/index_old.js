/**
 * Message -系统消息、平台公告
 * @date: 2019-02-19
 * @author YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty, size, pullAllBy } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Col, Tabs, Row, Icon, Timeline, Spin, Tooltip } from 'hzero-ui';
import { Link } from 'dva/router';
import { valueMapMeaning } from 'utils/renderer';
import InfiniteScroll from 'react-infinite-scroller';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
// import temporarily from '../../assets/dashboard/temporarily-no-data.svg';
import noticeNoData from '@/assets/dashboard/notice-no-data.svg';
import systemNoData from '@/assets/dashboard/system-no-data.svg';
import winningImg from '@/assets/dashboard/winning-notice.svg';
import businessImg from '@/assets/dashboard/business-friend.svg';
import industryImg from '@/assets/dashboard/industry-news.svg';
import companyImg from '@/assets/dashboard/company-notice.svg';
import otherImg from '@/assets/dashboard/other.svg';
import newsImg from '@/assets/dashboard/news.svg';
import platformImg from '@/assets/dashboard/platform-bulletin.svg';
import styles from '../card.less';

@connect(({ swbhCards }) => ({ swbhCards }))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class Message extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabBar: 'message',
      messageList: [], // 存储系统消息数据
      announcementList: [], // 存储企业公告数据
      PlatformNoticeList: [], // 存储平台公告数据
      isMessage: true, // 判断系统消息是否还有数据
      isAnnouncement: true, // 判断企业公告是否还有数据
      isPlatform: true, // 判断平台公告是否还有数据
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'swbhCards/init',
    });
    this.handleSystemMessage();
    this.handleAnnouncementList();
    this.handlePlatformNoticeList();
  }

  /**
   * 查询系统消息
   */
  @Bind()
  handleSystemMessage(currentPage = 0) {
    const { dispatch } = this.props;
    console.log('handleSystemMessage');
    // dispatch({
    //   type: 'swbhCards/querySystemMessage',
    //   payload: {
    //     // previewMessageCount: 999999,
    //     withContent: true,
    //     readFlag: 0,
    //     page: currentPage,
    //     size: 10,
    //   },
    // }).then(res => {
    //   const { messageList = [] } = this.state;
    //   if (res && res.totalElements > size(messageList)) {
    //     const data = messageList.concat(res.content);
    //     this.setState({
    //       messageList: data,
    //       isMessage: true,
    //     });
    //   } else {
    //     this.setState({
    //       isMessage: false,
    //     });
    //   }

    //   dispatch({
    //     type: 'swbhCards/updateState',
    //     payload: { messageLoading: false },
    //   });
    // });
  }

  /**
   * 查询企业公告
   */
  @Bind()
  handleAnnouncementList(currentPage = 0) {
    const { dispatch } = this.props;
    dispatch({
      type: 'swbhCards/queryAnnouncement',
      payload: {
        size: 10,
        page: currentPage,
        pageStatusCode: 'EXHIBITING',
      },
    }).then((res) => {
      const { announcementList = [] } = this.state;
      if (res && res.totalElements > size(announcementList)) {
        const data = announcementList.concat(res.content);
        this.setState({
          announcementList: data,
          isAnnouncement: true,
        });
      } else {
        this.setState({
          isAnnouncement: false,
        });
      }

      dispatch({
        type: 'swbhCards/updateState',
        payload: { noticeLoading: false },
      });
    });
  }

  /**
   * 查询企业公告
   */
  @Bind()
  handlePlatformNoticeList(currentPage = 0) {
    const { dispatch } = this.props;
    dispatch({
      type: 'swbhCards/queryCompanyNotice',
      payload: {
        size: 10,
        page: currentPage,
        pageStatusCode: 'EXHIBITING',
      },
    }).then((res) => {
      const { PlatformNoticeList = [] } = this.state;
      if (res && res.totalElements > size(PlatformNoticeList)) {
        const data = PlatformNoticeList.concat(res.content);
        this.setState({
          PlatformNoticeList: data,
          isPlatform: true,
        });
      } else {
        this.setState({
          isPlatform: false,
        });
      }

      dispatch({
        type: 'swbhCards/updateState',
        payload: { PlatformNoticeLoading: false },
      });
    });
  }

  /**
   * 标记已读
   * @param {*} number
   */
  @Bind()
  handleRead(number) {
    const { dispatch } = this.props;
    const { messageList = [] } = this.state;
    dispatch({
      type: 'swbhCards/updateState',
      payload: { messageLoading: true },
    });
    dispatch({
      type: 'swbhCards/changeRead',
      payload: {
        userMessageIdList: number,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          messageList: pullAllBy(messageList, [{ userMessageId: number }], 'userMessageId'),
        });
      }
    });
  }

  @Bind()
  changeDetail(record) {
    openTab({
      title: 'spfm.notice.view.message.title.preview',
      key: `/spfm/notices/previewOnly/${record.noticeId}`,
      path: `/spfm/notices/previewOnly/${record.noticeId}`,
      icon: 'eye-o',
      // search: `${record.noticeId}`,
      closable: true,
    });
  }

  /**
   * 系统消息刷新
   */
  @Bind()
  handleMessageSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'swbhCards/updateState',
      payload: { messageLoading: true },
    });
    this.setState({ messageList: [] }, () => {
      this.handleSystemMessage();
    });
  }

  /**
   * 公告刷新
   */
  @Bind()
  handleAnnouncementSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'swbhCards/updateState',
      payload: { noticeLoading: true },
    });
    this.setState({ announcementList: [] }, () => {
      this.handleAnnouncementList();
    });
  }

  /**
   * 公告刷新
   */
  @Bind()
  handlePlatformSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'swbhCards/updateState',
      payload: { PlatformNoticeLoading: true },
    });
    this.setState({ PlatformNoticeList: [] }, () => {
      this.handlePlatformNoticeList();
    });
  }

  /**
   * 标签栏附加内容的显示
   */
  @Bind()
  handleCallback(key) {
    this.setState({
      tabBar: key,
    });
  }

  @Bind()
  handleStr(str, showLength, isHTML) {
    if (isHTML) {
      const html = { __html: str };
      return <span dangerouslySetInnerHTML={html} />;
    } else {
      const strlength = str.length;
      if (strlength > showLength) {
        return `${str.substring(0, showLength - 1)}...`;
      } else {
        return str;
      }
    }
  }

  /**
   * 系统消息数据展示
   */
  @Bind()
  handleColor(item, key) {
    if (key % 4 === 0) {
      return (
        <Timeline.Item key={`system-item-${item.messageId}`} color="#0687ff">
          <Row className={styles['message-row']}>
            <Col span={16} className={styles['message-title']}>
              {item.subject}
            </Col>
            <Col span={7} className={styles['message-time']}>
              {item.creationDate}
            </Col>
            <Col span={1}>
              <a
                onClick={() => this.handleRead(item.userMessageId)}
                style={{ float: 'right' }}
                className={styles['message-close']}
              >
                <Tooltip title={intl.get('spfm.dashboard.view.message.read').d('标记已读')}>
                  <Icon type="close" />
                </Tooltip>
              </a>
            </Col>
            <Col span={23} className={styles['message-list']} dangerouslySetInnerHTML={{ __html: item.content }} />
          </Row>
        </Timeline.Item>
      );
    } else if (key % 4 === 1) {
      return (
        <Timeline.Item key={`system-item-${item.messageId}`} color="#cb38ad">
          <Row className={styles['message-row']}>
            <Col span={16} className={styles['message-title']}>
              {item.subject}
            </Col>
            <Col span={7} className={styles['message-time']}>
              {item.creationDate}
            </Col>
            <Col span={1}>
              <a
                onClick={() => this.handleRead(item.userMessageId)}
                style={{ float: 'right' }}
                className={styles['message-close']}
              >
                <Tooltip title={intl.get('spfm.dashboard.view.message.read').d('标记已读')}>
                  <Icon type="close" />
                </Tooltip>
              </a>
            </Col>
            <Col span={23} className={styles['message-list']} dangerouslySetInnerHTML={{ __html: item.content }} />
          </Row>
        </Timeline.Item>
      );
    } else if (key % 4 === 2) {
      return (
        <Timeline.Item key={`system-item-${item.messageId}`} color="#ffbc00">
          <Row className={styles['message-row']}>
            <Col span={16} className={styles['message-title']}>
              {item.subject}
            </Col>
            <Col span={7} className={styles['message-time']}>
              {item.creationDate}
            </Col>
            <Col span={1}>
              <a
                onClick={() => this.handleRead(item.userMessageId)}
                style={{ float: 'right' }}
                className={styles['message-close']}
              >
                <Tooltip title={intl.get('spfm.dashboard.view.message.read').d('标记已读')}>
                  <Icon type="close" />
                </Tooltip>
              </a>
            </Col>
            <Col span={23} className={styles['message-list']} dangerouslySetInnerHTML={{ __html: item.content }} />
          </Row>
        </Timeline.Item>
      );
    } else if (key % 4 === 3) {
      return (
        <Timeline.Item key={`system-item-${item.messageId}`} color="#f02b2b">
          <Row className={styles['message-row']}>
            <Col span={16} className={styles['message-title']}>
              {item.subject}
            </Col>
            <Col span={7} className={styles['message-time']}>
              {item.creationDate}
            </Col>
            <Col span={1}>
              <a
                onClick={() => this.handleRead(item.userMessageId)}
                style={{ float: 'right' }}
                className={styles['message-close']}
              >
                <Tooltip title={intl.get('spfm.dashboard.view.message.read').d('标记已读')}>
                  <Icon type="close" />
                </Tooltip>
              </a>
            </Col>
            <Col span={23} className={styles['message-list']} dangerouslySetInnerHTML={{ __html: item.content }} />
          </Row>
        </Timeline.Item>
      );
    }
  }

  render() {
    const {
      swbhCards: { noticeLoading, PlatformNoticeLoading, messageLoading, noticeCategory = [] } = {},
    } = this.props;
    const {
      tabBar,
      isMessage,
      messageList = [],
      isAnnouncement,
      announcementList,
      PlatformNoticeList,
      isPlatform,
    } = this.state;
    const operations = (
      <div style={{ paddingTop: '13px', paddingRight: '24px' }}>
        {tabBar === 'message' && (
          <div style={{ fontSize: '12px', lineHeight: '22px' }}>
            <Link to="/hmsg/user-message/list">
              {intl.get('spfm.dashboard.view.message.link.userMessage').d('消息中心')}
              <Icon type="double-right" />
            </Link>
            <a onClick={() => this.handleMessageSearch()} style={{ marginLeft: '16px' }}>
              {intl.get('spfm.dashboard.view.message.link.refresh').d('刷新')}
              <Icon type="reload" />
            </a>
          </div>
        )}
        {tabBar === 'announcement' && (
          <div style={{ fontSize: '12px', lineHeight: '22px' }}>
            <a onClick={() => this.handleAnnouncementSearch()}>
              {intl.get('spfm.dashboard.view.message.link.refresh').d('刷新')}
              <Icon type="reload" />
            </a>
          </div>
        )}
        {tabBar === 'PlatformNotice' && (
          <div style={{ fontSize: '12px', lineHeight: '22px' }}>
            <a onClick={() => this.handlePlatformSearch()}>
              {intl.get('spfm.dashboard.view.message.link.refresh').d('刷新')}
              <Icon type="reload" />
            </a>
          </div>
        )}
      </div>
    );
    return (
      <Tabs
        tabBarExtraContent={operations}
        size="large"
        tabBarGutter={0}
        onChange={this.handleCallback}
        className={styles.height}
        defaultActiveKey="message"
      >
        <Tabs.TabPane
          tab={intl.get('spfm.dashboard.view.message.tab.systemMessage').d('系统消息')}
          key="message"
          className={styles.message}
        >
          {!isEmpty(messageList) && (
            <Timeline className={styles['message-overflow']} style={{ padding: '10px 16px 10px 16px' }}>
              <InfiniteScroll
                hasMore={isMessage}
                pageStart={0}
                initialLoad={false}
                useWindow={false}
                loadMore={this.handleSystemMessage}
              >
                {messageList.map((item, index) => {
                  return this.handleColor(item, index);
                })}
              </InfiniteScroll>
            </Timeline>
          )}
          {isEmpty(messageList) && (
            <div style={{ textAlign: 'center' }}>
              <Spin spinning={messageLoading}>
                <img src={systemNoData} alt="" style={{ marginTop: '35px' }} />
                <div className={styles.commonlyUsed}>
                  <div className={styles['common-dashboard-no-data']}>
                    {intl.get(`spfm.dashboard.model.common.systemNoData`).d('暂无系统消息')}
                  </div>
                </div>
              </Spin>
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl.get('spfm.dashboard.view.message.tab.CompanyNotice').d('企业公告')}
          key="announcement"
          className={styles.notice}
        >
          {!isEmpty(announcementList) && (
            <div className={styles['notice-overflow']}>
              <InfiniteScroll
                hasMore={isAnnouncement}
                pageStart={0}
                initialLoad={false}
                useWindow={false}
                loadMore={this.handleAnnouncementList}
                style={{ backgroundColor: '#fff' }}
              >
                {announcementList.map((item) => {
                  const platform = ['PTGG'].indexOf(item.noticeTypeCode);
                  const news = ['XWDT'].indexOf(item.noticeTypeCode);
                  const tender = ['ZBXY'].indexOf(item.noticeTypeCode);
                  const circle = ['SYQ'].indexOf(item.noticeTypeCode);
                  const industry = ['HYZX'].indexOf(item.noticeTypeCode);
                  const other = ['QTGG'].indexOf(item.noticeTypeCode);
                  const notices = ['GSWD', 'GSTZ', 'GSZD'].indexOf(item.noticeTypeCode);
                  return (
                    <Row
                      key={`system-item-${item.noticeId}`}
                      type="flex"
                      justify="space-around"
                      align="middle"
                      className={styles['notice-row']}
                    >
                      <Col span={3} className={styles['notice-type']}>
                        {platform !== -1 && <img alt="" src={platformImg} className={styles['notice-img']} />}
                        {news !== -1 && <img alt="" src={newsImg} className={styles['notice-img']} />}
                        {tender !== -1 && <img alt="" src={winningImg} className={styles['notice-img']} />}
                        {circle !== -1 && <img alt="" src={businessImg} className={styles['notice-img']} />}
                        {industry !== -1 && <img alt="" src={industryImg} className={styles['notice-img']} />}
                        {other !== -1 && <img alt="" src={otherImg} className={styles['notice-img']} />}
                        {notices !== -1 && <img alt="" src={companyImg} className={styles['notice-img']} />}
                        {valueMapMeaning(noticeCategory, item.noticeTypeCode).length === 3 && (
                          <div className={styles['notice-typeNameThree']}>
                            {valueMapMeaning(noticeCategory, item.noticeTypeCode)}
                          </div>
                        )}
                        {valueMapMeaning(noticeCategory, item.noticeTypeCode).length !== 3 && (
                          <div className={styles['notice-typeName']}>
                            {valueMapMeaning(noticeCategory, item.noticeTypeCode)}
                          </div>
                        )}
                      </Col>
                      <Col span={21} className={styles['notice-content']}>
                        <Row style={{ marginBottom: '4px' }}>
                          <Col span={16} className={styles['notice-title']}>
                            <a onClick={() => this.changeDetail(item)}>{this.handleStr(item.title, 25)}</a>
                          </Col>
                          <Col span={8} className={styles['notice-time']}>
                            {item.startDate}
                          </Col>
                        </Row>
                        {item && item.noticeBody && (
                          <Col className={styles['notice-list']}>{this.handleStr(item.noticeBody, null, true)}</Col>
                        )}
                      </Col>
                    </Row>
                  );
                })}
              </InfiniteScroll>
            </div>
          )}
          {isEmpty(announcementList) && (
            <div style={{ textAlign: 'center' }}>
              <Spin spinning={noticeLoading}>
                <img src={noticeNoData} alt="" style={{ marginTop: '35px' }} />
                <div className={styles.commonlyUsed}>
                  <div className={styles['common-dashboard-no-data']}>
                    {intl.get(`spfm.dashboard.model.common.noticeNoData`).d('暂无相关公告')}
                  </div>
                </div>
              </Spin>
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl.get('spfm.dashboard.view.message.tab.PlatformNotice').d('平台公告')}
          key="PlatformNotice"
          className={styles.notice}
        >
          {!isEmpty(PlatformNoticeList) && (
            <div className={styles['notice-overflow']}>
              <InfiniteScroll
                hasMore={isPlatform}
                pageStart={0}
                initialLoad={false}
                useWindow={false}
                loadMore={this.handlePlatformNoticeList}
                style={{ backgroundColor: '#fff' }}
              >
                {PlatformNoticeList.map((item) => {
                  const platform = ['PTGG'].indexOf(item.noticeTypeCode);
                  const news = ['XWDT'].indexOf(item.noticeTypeCode);
                  const tender = ['ZBXY'].indexOf(item.noticeTypeCode);
                  return (
                    <Row
                      key={`system-item-${item.noticeId}`}
                      type="flex"
                      justify="space-around"
                      align="middle"
                      className={styles['notice-row']}
                    >
                      <Col span={3} className={styles['notice-type']}>
                        {platform !== -1 && <img alt="" src={platformImg} className={styles['notice-img']} />}
                        {news !== -1 && <img alt="" src={newsImg} className={styles['notice-img']} />}
                        {tender !== -1 && <img alt="" src={winningImg} className={styles['notice-img']} />}
                        {item.noticeTypeMeaning.length === 3 && (
                          <div className={styles['notice-typeNameThree']}>{item.noticeTypeMeaning}</div>
                        )}
                        {item.noticeTypeMeaning.length !== 3 && (
                          <div className={styles['notice-typeName']}>{item.noticeTypeMeaning}</div>
                        )}
                      </Col>
                      <Col span={21} className={styles['notice-content']}>
                        <Row style={{ marginBottom: '4px' }}>
                          <Col span={16} className={styles['notice-title']}>
                            {/* <Link
                               to={`/spfm/notices/previewOnly/${item.noticeId}`}
                               className={styles['workflow-list']}
                             >
                               {this.handleStr(item.title, 25)}
                             </Link> */}
                            <a onClick={() => this.changeDetail(item)}>{this.handleStr(item.title, 25)}</a>
                          </Col>
                          <Col span={8} className={styles['notice-time']}>
                            {item.startDate}
                          </Col>
                        </Row>
                        {item && item.noticeBody && (
                          <Col className={styles['notice-list']}>{this.handleStr(item.noticeBody, null, true)}</Col>
                        )}
                      </Col>
                    </Row>
                  );
                })}
              </InfiniteScroll>
            </div>
          )}
          {isEmpty(PlatformNoticeList) && (
            <div style={{ textAlign: 'center' }}>
              <Spin spinning={PlatformNoticeLoading}>
                <img src={noticeNoData} alt="" style={{ marginTop: '35px' }} />
                <div className={styles.commonlyUsed}>
                  <div className={styles['common-dashboard-no-data']}>
                    {intl.get(`spfm.dashboard.model.common.noticeNoData`).d('暂无相关公告')}
                  </div>
                </div>
              </Spin>
            </div>
          )}
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
