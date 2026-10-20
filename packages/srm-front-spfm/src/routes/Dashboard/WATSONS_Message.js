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
import { Col, Tabs, Row, Icon, Spin } from 'hzero-ui';
import { valueMapMeaning } from 'utils/renderer';
import InfiniteScroll from 'react-infinite-scroller';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './Cards.less';
// import temporarily from '../../assets/dashboard/temporarily-no-data.svg';
import noticeNoData from '../../assets/dashboard/notice-no-data.svg';
import winningImg from '../../assets/dashboard/winning-notice.svg';
import businessImg from '../../assets/dashboard/business-friend.svg';
import industryImg from '../../assets/dashboard/industry-news.svg';
import companyImg from '../../assets/dashboard/company-notice.svg';
import otherImg from '../../assets/dashboard/other.svg';
import newsImg from '../../assets/dashboard/news.svg';
import platformImg from '../../assets/dashboard/platform-bulletin.svg';

@connect(({ srmCards }) => ({ srmCards }))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class Message extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabBar: 'announcement',
      messageList: [], // 存储系统消息数据
      announcementList: [], // 存储企业公告数据
      PlatformNoticeList: [], // 存储平台公告数据
      isAnnouncement: true, // 判断企业公告是否还有数据
      isPlatform: true, // 判断平台公告是否还有数据
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/init',
    });
    this.handleAnnouncementList();
    this.handlePlatformNoticeList();
  }

  /**
   * 查询企业公告
   */
  @Bind()
  handleAnnouncementList(currentPage = 0) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryAnnouncement',
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
        type: 'srmCards/updateState',
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
      type: 'srmCards/queryCompanyNotice',
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
        type: 'srmCards/updateState',
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
      type: 'srmCards/updateState',
      payload: { messageLoading: true },
    });
    dispatch({
      type: 'srmCards/changeRead',
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
   * 公告刷新
   */
  @Bind()
  handleAnnouncementSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/updateState',
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
      type: 'srmCards/updateState',
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

  render() {
    const {
      srmCards: { noticeLoading, PlatformNoticeLoading, noticeCategory = [] } = {},
    } = this.props;
    const { tabBar, isAnnouncement, announcementList, PlatformNoticeList, isPlatform } = this.state;
    const operations = (
      <div style={{ paddingTop: '13px', paddingRight: '24px' }}>
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
        defaultActiveKey="announcement"
      >
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
                        {platform !== -1 && (
                          <img alt="" src={platformImg} className={styles['notice-img']} />
                        )}
                        {news !== -1 && (
                          <img alt="" src={newsImg} className={styles['notice-img']} />
                        )}
                        {tender !== -1 && (
                          <img alt="" src={winningImg} className={styles['notice-img']} />
                        )}
                        {circle !== -1 && (
                          <img alt="" src={businessImg} className={styles['notice-img']} />
                        )}
                        {industry !== -1 && (
                          <img alt="" src={industryImg} className={styles['notice-img']} />
                        )}
                        {other !== -1 && (
                          <img alt="" src={otherImg} className={styles['notice-img']} />
                        )}
                        {notices !== -1 && (
                          <img alt="" src={companyImg} className={styles['notice-img']} />
                        )}
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
                            <a onClick={() => this.changeDetail(item)}>
                              {this.handleStr(item.title, 25)}
                            </a>
                          </Col>
                          <Col span={8} className={styles['notice-time']}>
                            {item.startDate}
                          </Col>
                        </Row>
                        {item && item.noticeBody && (
                          <Col className={styles['notice-list']}>
                            {this.handleStr(item.noticeBody, null, true)}
                          </Col>
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
                        {platform !== -1 && (
                          <img alt="" src={platformImg} className={styles['notice-img']} />
                        )}
                        {news !== -1 && (
                          <img alt="" src={newsImg} className={styles['notice-img']} />
                        )}
                        {tender !== -1 && (
                          <img alt="" src={winningImg} className={styles['notice-img']} />
                        )}
                        {item.noticeTypeMeaning.length === 3 && (
                          <div className={styles['notice-typeNameThree']}>
                            {item.noticeTypeMeaning}
                          </div>
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
                            <a onClick={() => this.changeDetail(item)}>
                              {this.handleStr(item.title, 25)}
                            </a>
                          </Col>
                          <Col span={8} className={styles['notice-time']}>
                            {item.startDate}
                          </Col>
                        </Row>
                        {item && item.noticeBody && (
                          <Col className={styles['notice-list']}>
                            {this.handleStr(item.noticeBody, null, true)}
                          </Col>
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
