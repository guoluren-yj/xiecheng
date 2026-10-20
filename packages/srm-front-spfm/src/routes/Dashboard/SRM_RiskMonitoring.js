/**
 * riskMonitoring -风险监控
 * @date: 2019-07-02
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Row, Col, Timeline, Tabs, Modal, Table, Spin, Popover } from 'hzero-ui';
import InfiniteScroll from 'react-infinite-scroller';
import moment from 'moment';

// import { getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { openTab } from 'utils/menuTab';
// import temporarily from '../../assets/dashboard/temporarily-no-data.svg';
import reportNoData from '../../assets/dashboard/report-no-data.svg';
import styles from './Cards.less';

@connect(({ srmCards, loading }) => ({
  srmCards,
  modalLoading: loading.effects['srmCards/queryRiskDailyModal'],
  dailyLoading: loading.effects['srmCards/queryRiskDaily'],
  detailLoading: loading.effects['srmCards/queryRiskDetail'],
}))
@formatterCollections({ code: ['spfm.dashboard'] })
export default class riskMonitoring extends React.Component {
  state = {
    isDaily: true,
    modalVisible: false,
    item: [],
    dailyList: [], // 存储全量监控日报数据
    detailList: [], // 存储全量监控详情数据
    isDailyMore: true, // 判断全量监控日报是否还有数据
    isDetailMore: true, // 判断全量监控详情是否还有数据
    activeKey: '0',
  };

  componentDidMount() {
    this.handleSearchDaily();
    this.handleSearchCategory();
  }

  /**
   * 风险监控日报
   */
  @Bind()
  handleSearchDaily(currentPage = 0) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryRiskDaily',
      payload: {
        page: currentPage,
        size: 10,
      },
    }).then((res) => {
      if (res && !res.empty) {
        const { dailyList = [] } = this.state;
        const data = dailyList.concat(res.content);
        this.setState({
          dailyList: data,
          isDailyMore: true,
        });
      } else {
        this.setState({
          isDailyMore: false,
        });
      }

      dispatch({
        type: 'srmCards/updateState',
        payload: { dailyLoading: false },
      });
    });
  }

  /**
   * 风险监控日报详情
   * @param {*} page
   */
  @Bind()
  handleSearchDailyModal(page = {}) {
    const { dispatch } = this.props;
    const { item } = this.state;
    dispatch({
      type: 'srmCards/queryRiskDailyModal',
      payload: {
        eventDate: item.eventDate,
        page,
      },
    });
  }

  /**
   * 风险监控详情分类
   */
  @Bind()
  handleSearchCategory() {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryRiskCategory',
    });
  }

  /**
   * 风险监控详情
   */
  @Bind()
  handleSearchDetail(currentPage = 0) {
    const { dispatch } = this.props;
    const { activeKey } = this.state;
    dispatch({
      type: 'srmCards/queryRiskDetail',
      payload: {
        riskCategoryId: activeKey === '0' ? null : activeKey,
        eventDate: moment().format(DEFAULT_DATETIME_FORMAT),
        page: currentPage,
        size: 10,
      },
    }).then((res) => {
      if (res && !res.empty) {
        const { detailList = [] } = this.state;
        const data = detailList.concat(res.content);
        this.setState({
          detailList: data,
          isDetailMore: true,
        });
      } else {
        this.setState({
          isDetailMore: false,
        });
      }

      dispatch({
        type: 'srmCards/updateState',
        payload: { detailLoading: false },
      });
    });
  }

  /**
   * 切换卡片 详情<->日报
   */
  @Bind()
  handleChangePanel() {
    const { isDaily } = this.state;
    this.setState({ isDaily: !isDaily, dailyList: [], detailList: [] }, () => {
      if (isDaily) {
        this.handleSearchDetail();
      } else {
        this.handleSearchDaily();
      }
    });
  }

  /**
   * 开关模态框
   */
  @Bind()
  handleControlModal(item) {
    const {
      srmCards: { riskDailyModalPagination = {} },
    } = this.props;
    const { modalVisible } = this.state;
    this.setState({ modalVisible: !modalVisible, item }, () => {
      if (!modalVisible) this.handleSearchDailyModal(riskDailyModalPagination);
    });
  }

  /**
   * tabs切换
   * @param {*} tabKey
   */
  @Bind()
  handleTabsChange(tabKey) {
    this.setState({ activeKey: tabKey, detailList: [] }, () => {
      this.handleSearchDetail(0);
    });
  }

  /**
   * 跳转内嵌页面
   */
  @Bind()
  handleJumpPage(companyName, flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'srmCards/queryEnterpriseRisk',
      payload: {
        enterpriseName: companyName,
      },
    }).then((url) => {
      if (url) {
        if (flag) {
          this.setState({ modalVisible: false }, () => {
            return openTab({
              title: intl.get(`spfm.dashboard.view.message.monitoringDetails`).d('监控详情'),
              key: `/sslm/risk-embed`,
              search: `urlParams=${encodeURIComponent(url)}`,
            });
          });
        } else {
          openTab({
            title: intl.get(`spfm.dashboard.view.message.monitoringDetails`).d('监控详情'),
            key: `/sslm/risk-embed`,
            search: `urlParams=${encodeURIComponent(url)}`,
          });
        }
        // window.open(url);
      }
    });
  }

  /**
   * 系统消息数据展示
   */
  @Bind()
  renderColor(item, key, cardContent) {
    const { isDaily } = this.state;
    const renderTimeLineItem = (color) => {
      if (cardContent === 'daily') {
        return (
          <Timeline.Item
            className={styles['timeline-item']}
            key={`system-item-${item.riskEventId}`}
            color={color}
          >
            <Row
              style={{ cursor: 'pointer' }}
              className={styles['message-row']}
              onClick={() => this.handleControlModal(item)}
            >
              <Col span={16} className={styles['message-title']}>
                {intl
                  .get(`spfm.dashboard.view.riskMonitoring.001messageTitle`)
                  .d('【动态监控】本监控周期内，')}
                {item.companyCount}
                {intl
                  .get(`spfm.dashboard.view.riskMonitoring.002messageTitle`)
                  .d('家企业有事件更新，请及时关注！')}
              </Col>
              <Col span={8} className={styles['message-time']}>
                {item.eventDate}
              </Col>
            </Row>
          </Timeline.Item>
        );
      } else {
        return (
          <Timeline.Item key={`system-item-${item.riskEventId}`} color={color}>
            <Row
              style={isDaily ? { cursor: 'pointer' } : {}}
              className={styles['message-row']}
              // onClick={this.handleControlModal}
            >
              <Col span={21} className={styles['message-title']}>
                {item.companyName} {item.eventDate}
              </Col>
              <Col span={3} style={{ textAlign: 'right' }}>
                <a onClick={() => this.handleJumpPage(item.companyName)}>
                  {intl.get(`spfm.dashboard.view.message.monitoringDetails`).d('监控详情')}
                </a>
              </Col>
              <Col span={24} className={styles['message-list']}>
                {item.dimensionName}
              </Col>
            </Row>
          </Timeline.Item>
        );
      }
    };
    if (item.readFlag === 1) {
      return renderTimeLineItem('#999');
    } else if (key % 4 === 0) {
      return renderTimeLineItem('#0687ff');
    } else if (key % 4 === 1) {
      return renderTimeLineItem('#cb38ad');
    } else if (key % 4 === 2) {
      return renderTimeLineItem('#ffbc00');
    } else if (key % 4 === 3) {
      return renderTimeLineItem('#f02b2b');
    }
  }

  renderModalTable() {
    const {
      modalLoading,
      srmCards: { riskDailyModalList = [], riskDailyModalPagination = {} },
    } = this.props;
    const { item } = this.state;
    const columns = [
      {
        title: intl.get(`spfm.dashboard.model.srmCards.companyNum`).d('企业编码'),
        dataIndex: 'companyNum',
        width: 200,
      },
      {
        title: intl.get(`spfm.dashboard.model.srmCards.companyName`).d('企业名称'),
        dataIndex: 'companyName',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`spfm.dashboard.model.srmCards.dimensionName`).d('事件更新'),
        dataIndex: 'dimensionName',
      },
      {
        title: intl.get(`spfm.dashboard.model.srmCards.dynamicRiskMonitoring`).d('风险动态监控'),
        dataIndex: 'dynamicRiskMonitoring',
        width: 120,
        render: (_, record) => (
          <a onClick={() => this.handleJumpPage(record.companyName, true)}>
            {intl.get(`hzero.common.button.view`).d('查看')}
          </a>
        ),
      },
    ];
    return (
      <React.Fragment>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 16, paddingRight: 24 }}>
            {intl.get(`spfm.dashboard.view.message.title.riskDaily`).d('风险动态监控日报')}
          </span>
          <span style={{ color: '#999' }}>{item.eventDate}</span>
        </div>
        <div style={{ marginBottom: 16, color: '#999' }}>
          {intl.get(`spfm.dashboard.view.message.riskDaily.monitoring`).d('本监控周期内，')}
          {item.companyCount}
          {intl
            .get(`spfm.dashboard.view.message.riskDaily.datails`)
            .d('家企业有事件更新，详情查看下表：')}
        </div>
        <Table
          rowKey="id"
          bordered
          loading={modalLoading}
          dataSource={riskDailyModalList}
          columns={columns}
          pagination={riskDailyModalPagination}
          onChange={this.handleSearchDailyModal}
        />
        <div style={{ marginTop: 16, color: '#999' }}>
          {intl.get(`spfm.dashboard.view.message.immediateAttention`).d('以上情况请及时关注！')}
        </div>
      </React.Fragment>
    );
  }

  render() {
    const {
      dailyLoading,
      detailLoading,
      srmCards: { categoryList = [] },
    } = this.props;
    const {
      isDaily,
      modalVisible,
      isDailyMore,
      dailyList,
      isDetailMore,
      detailList,
      activeKey,
    } = this.state;
    const allCategory = [
      {
        riskCategoryName: intl.get(`spfm.dashboard.view.message.all`).d('全部'),
        riskCategoryId: 0,
      },
    ];
    return (
      <div className={styles.riskMonitoring}>
        <Row className={styles['card-row']}>
          <div className={styles['card-img']}>
            <span className={styles['card-title']}>
              {isDaily
                ? intl.get(`spfm.dashboard.view.message.monitoringDaily`).d('风险监控日报')
                : intl.get(`spfm.dashboard.view.message.monitoringDetail`).d('风险监控详情')}
            </span>
            <a onClick={this.handleChangePanel} className={styles['card-icon']}>
              {isDaily
                ? intl.get(`spfm.dashboard.view.message.changeDetail`).d('切换详情')
                : intl.get(`spfm.dashboard.view.message.changeDaily`).d('切换日报')}
            </a>
          </div>
          <Spin spinning={false}>
            {isDaily ? (
              isEmpty(dailyList) ? (
                <div style={{ textAlign: 'center' }}>
                  <Spin spinning={dailyLoading}>
                    <img src={reportNoData} alt="" style={{ marginTop: '40px' }} />
                  </Spin>
                  <div className={styles.commonlyUsed}>
                    <div className={styles['common-dashboard-no-data']}>
                      {intl.get(`spfm.dashboard.model.common.riskNoData`).d('暂无风险日报监控')}
                    </div>
                  </div>
                </div>
              ) : (
                <Timeline
                  className={styles['message-overflow']}
                  style={{ padding: '10px 16px 10px 16px' }}
                >
                  <InfiniteScroll
                    hasMore={isDailyMore}
                    pageStart={0}
                    initialLoad={false}
                    useWindow={false}
                    loadMore={this.handleSearchDaily}
                  >
                    {dailyList.map((item, index) => this.renderColor(item, index, 'daily'))}
                  </InfiniteScroll>
                </Timeline>
              )
            ) : (
              <Tabs
                className={styles.height}
                onChange={this.handleTabsChange}
                defaultActiveKey={activeKey}
              >
                {[...allCategory, ...categoryList].map((c) => (
                  <Tabs.TabPane key={c.riskCategoryId} tab={c.riskCategoryName}>
                    {!isEmpty(detailList) && (
                      <Timeline
                        className={styles['message-overflow']}
                        style={{ padding: '10px 16px 10px 16px' }}
                      >
                        <InfiniteScroll
                          hasMore={isDetailMore}
                          pageStart={0}
                          initialLoad={false}
                          useWindow={false}
                          loadMore={this.handleSearchDetail}
                        >
                          {detailList.map((item, index) => this.renderColor(item, index, 'detail'))}
                        </InfiniteScroll>
                      </Timeline>
                    )}
                    {isEmpty(detailList) && (
                      <div style={{ textAlign: 'center' }}>
                        <Spin spinning={detailLoading}>
                          <img src={reportNoData} alt="" style={{ marginTop: '20px' }} />
                        </Spin>
                        <div className={styles.commonlyUsed}>
                          <div className={styles['common-dashboard-no-data']}>
                            {intl
                              .get(`spfm.dashboard.model.common.riskNoData`)
                              .d('暂无风险日报监控')}
                          </div>
                        </div>
                      </div>
                    )}
                  </Tabs.TabPane>
                ))}
              </Tabs>
            )}
          </Spin>
        </Row>
        <Modal
          title={intl.get(`spfm.dashboard.view.message.messageDetail`).d('消息详情')}
          width={1000}
          visible={modalVisible}
          onCancel={this.handleControlModal}
          footer={null}
        >
          {this.renderModalTable()}
          {/* {riskDailyList.map((item) => this.renderModalTable(item))} */}
        </Modal>
      </div>
    );
  }
}
