/* eslint-disable no-unused-expressions */
import React, { Component, Fragment } from 'react';
import { Modal, Spin } from 'choerodon-ui/pro';
import { Row, Col, Card } from 'choerodon-ui';
import { connect } from 'dva';
import querystring from 'querystring';
import intl from 'utils/intl';
import { withRouter } from 'react-router-dom';
import formatterCollections from 'utils/intl/formatterCollections';
import { loadMicroModuleFromPathname } from 'hzero-boot/lib/entry/root/getMicroModuleRouters';
// import { chunk } from 'lodash';
import { config, getUrlHashParam } from '@/routes/utils';
import notification from 'utils/notification';
import SrmMessage from 'srm-front-spfm/lib/routes/Dashboard/SRM_Message_new';
// import SrmMessage from 'srm-front-spfm/lib/routes/Dashboard/SRM_Message';
import { getAccessToken } from 'utils/utils';
import { checkPermission } from 'services/api';
import injectGuide from 'srm-front-boot/lib/components/Guide/injectGuideList';
// import Guide from '_components/Guide';
// import 'driver.js/dist/driver.min.css';
import EmbedPage from 'srm-front-boot/lib/components/EmbedPage';
import webSocketManager from 'hzero-front/lib/utils/webSoket';
import { getResponse } from 'hzero-front/lib/utils/utils';
import SwbnBusinessCard from './components/SWBH_businessCard';
import SwbnCard from './components/SWBH_card';
import SwbnDocumentList from './components/SWBH_documentList';
import FocusModeBtn from '../components/FocusModeBtn';

import styles from './index.less';

@withRouter
@formatterCollections({
  code: ['swbh.common'],
})
@connect(({ roleWorkbench, swbhCards, loading, user, global }) => ({
  roleWorkbench,
  swbhCards,
  isShowReportCardsLoading: loading.effects['swbhCards/isShowReportCards'],
  // totalLoading: loading.effects['swbhCards/getDocTotal'],
  layoutLoading: loading.effects['swbhCards/getCardSetting'],
  user,
  global,
}))
export default class BusinessCard extends Component {
  constructor(props) {
    super(props);
    injectGuide('/swbh/role-workbench', config);
    this.state = {
      swbnCardVisible: true,
      swbhMode: 'common', // common 经典视图，focus：精简视图
      sdatPage: '', // 存放 riskConfig 风控工作台  cardConfig: 驾驶舱
      showReportCards: false,
      showGuide: false,
      totalLoading: true,
      riskLinkFlag: false,
    };

    this.socket = null;
    this.dragFlag = false;
  }

  getRiskLinkFlag = async () => {
    const flag = getResponse(await checkPermission(['risk-control-workbench.ps.default']));
    if (flag && flag[0]) {
      this.setState({ riskLinkFlag: flag[0].approve });
    }
  };

  componentDidMount() {
    this.getRiskLinkFlag();
    const urlParams = this.getQueryParams() || {};
    const { cardCode = null, documentListProps = null } = urlParams;
    this.getCardSetting((res, currentCarousel) => {
      const { allCard = [], cardList = [] } = res;
      const currentCardCode = cardCode || currentCarousel;
      this.setCurrentCardData(currentCardCode, allCard, cardList, () => {
        if (documentListProps) {
          this.documentList?.setCurrentQueryParams(documentListProps);
        }
      });
    });
    this.getDocTotal();
    this.initWebSocket();
    this.isShowReportCards();
  }

  componentDidUpdate(prevProps) {
    const { selfModalVisible: preSelfModalVisible } = prevProps.user;
    const { selfModalVisible, noSelfModal } = this.props.user;
    const { activeTabKey: preActiveTabKey } = prevProps.global;
    const { activeTabKey } = this.props.global;
    const { showGuide } = this.state;
    if (!showGuide && (noSelfModal || (selfModalVisible === null && selfModalVisible !== preSelfModalVisible))) {
      this.showGuide();
    }

    if (
      preActiveTabKey !== activeTabKey &&
      (preActiveTabKey === '/swbh/role-workbench' || activeTabKey === '/swbh/role-workbench')
    ) {
      if (preActiveTabKey === '/swbh/role-workbench') {
        this.closeSocket();
      } else if (activeTabKey === '/swbh/role-workbench') {
        this.initWebSocket();
      }
    }
  }

  componentWillUnmount() {
    this.closeSocket();
  }

  showGuide = () => {
    this.setState({ showGuide: true });
  };

  getQueryParams = () => {
    const isFromSSO = getUrlHashParam('from_sso');

    const { search } = this?.props?.location;
    const {
      linkType = null,
      cardCode = 'ALL',
      tab = 'TODO',
      docType = null,
      businessCode = null,
      searchValue = null,
      businessType = null,
      customizeFilterFields = null,
    } = querystring.parse(search?.substr(1)) ?? {};

    // if (!isFromSSO || !linkType || linkType !== 'roleWorkbench') return null;
    if (!linkType || linkType !== 'roleWorkbench') return null;

    const { dispatch } = this.props;
    dispatch({
      type: 'swbhCards/updateState',
      payload: { currentCarousel: cardCode },
    });

    const documentListProps = {
      tab,
      docType,
      businessCode,
      searchValue,
      businessType,
      customizeFilterFields,
    };

    return {
      cardCode,
      documentListProps,
    };
  };

  /**
   * 建立webSocket链接
   * @returns {*}
   */
  initWebSocket() {
    console.log('[socket open]');
    // webSocketManager.addListener('srm-workbench', data => {
    //   console.log('[srm-workbench]', data);
    //   this.setWsInfo(data);
    // });
    webSocketManager.addListener('srm-workbench', this.setWsInfo);
    // const AccessToken = getAccessToken();
    // const host = window.$$env?.API_HOST?.substring(8);
    // this.socket = new WebSocket(`wss://${host}/swbh/websocket?access_token=${AccessToken}`);
    // let num = 1;
    // const _this = this;
    // const heartCheck = {
    //   interval: 45000, // 45s
    //   intervalObj: null,
    //   reset() {
    //     clearInterval(this.intervalObj);
    //     this.start();
    //   },
    //   start() {
    //     this.intervalObj = setInterval(() => {
    //       _this.socket.send(JSON.stringify({ content: 'hi', messageType: '0' }));
    //     }, this.interval);
    //   },
    //   remove() {
    //     clearInterval(this.intervalObj);
    //   },
    // };
    // this.socket.addEventListener('open', () => {
    //   heartCheck.start();
    //   console.log('[socket open]');
    // });
    // this.socket.addEventListener('close', () => {
    //   this.setWsInfo();
    //   heartCheck.remove();
    //   console.log('[socket close]');
    // });
    // this.socket.addEventListener('error', () => {
    //   this.setWsInfo();
    //   if (num < 6) {
    //     num += 1;
    //     heartCheck.reset();
    //   } else {
    //     this.closeSocket();
    //   }
    //   console.log('[socket error]');
    // });
    // this.socket.addEventListener('message', ({ data }) => {
    //   let msgData = {};
    //   const { currentData = {} } = this.state;
    //   try {
    //     msgData = JSON.parse(data);
    //   } catch (e) {
    //     console.log(e);
    //   }
    //   if (msgData) {
    //     console.log('[socket  data]', data, '[timestamp]', Date.parse(new Date()));
    //     this.setWsInfo(msgData);
    //   }
    // });
  }

  setWsInfo = (wsInfo = null) => {
    console.log('[srm-workbench]', wsInfo);
    if (wsInfo) {
      const { message = {}, key } = wsInfo;
      if (key !== 'srm-workbench') {
        return;
      }
      wsInfo.message = JSON.parse(message);
      // this.getDocTotal('TODO');
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'swbhCards/updateState',
      payload: { wsInfo },
    });
  };

  /**
   * 关闭socket
   */
  closeSocket() {
    console.log('[close socket]');
    // this.socket.close();
    webSocketManager.removeListener('srm-workbench', this.setWsInfo);
    // webSocketManager.removeListener('srm-workbench', data => {
    //   this.setWsInfo(data);
    // });
  }

  isShowReportCards = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'swbhCards/isShowReportCards',
    }).then((res) => {
      if (res && !res.failed) {
        this.setState({ showReportCards: true }, () => this.initSwbhMode());
      } else {
        this.setState({ showReportCards: false }, () => this.initSwbhMode());
      }
    });
  };

  updateSize = () => {
    const mode = window.innerWidth <= 1440 ? 'focus' : 'common';
    this.changeMode(mode, true);
  };

  // 有点问题
  initSwbhMode = () => {
    const { showReportCards } = this.state;
    const swbhMode = localStorage?.getItem('SWBH_MODE');
    const sdatPage = localStorage?.getItem('SWBH_SDATPAGE');

    if (showReportCards) {
      if (!swbhMode && !sdatPage) {
        window.addEventListener('resize', this.updateSize);
      } else if (swbhMode) {
        this.changeMode(swbhMode, true);
      } else if (sdatPage) {
        // this.setState({ isSdatPage: true });
        this.changeMode(sdatPage, true);
      }
    } else {
      localStorage?.removeItem('SWBH_SDATPAGE');
      if (!swbhMode) {
        window.addEventListener('resize', this.updateSize);
      } else {
        this.changeMode(swbhMode, true);
      }
    }
  };

  changeMode = (mode, isInit = false) => {
    const { sdatPage, swbhMode } = this.state;
    if (
      !mode ||
      (mode === swbhMode && localStorage?.getItem('SWBH_MODE')) ||
      (mode === sdatPage && localStorage?.getItem('SWBH_SDATPAGE'))
    ) {
      return;
    }
    if (['common', 'focus'].includes(mode)) {
      localStorage?.removeItem('SWBH_SDATPAGE');
      localStorage.setItem('SWBH_MODE', mode);
      this.setState({ sdatPage: '', swbhMode: mode });
    } else if (['cardConfig', 'riskConfig'].includes(mode)) {
      localStorage?.removeItem('SWBH_MODE');
      localStorage?.setItem('SWBH_SDATPAGE', mode);
      this.setState({ sdatPage: mode });
    }

    // if (!isInit) {
    //   window.removeEventListener('resize', this.updateSize);
    //   localStorage.setItem('SWBH_MODE', mode);
    // }
  };

  handleIconMouseDown = () => {
    this.dragNode = document.getElementById('swbh-drag-btn');
    this.dragIconNode = document.getElementById('swbh-drag-icon');
    this.dragIconNode.style.opacity = 1;
    this.dragFlag = true;
    document.body.addEventListener('mousemove', this.handleIconMouseMove);
    document.body.addEventListener('mouseup', this.handleIconMouseUp);
    document.body.removeEventListener('mouseleave', this.handleIconMouseUp);
  };

  handleIconMouseMove = (e) => {
    const { height, right } = this.dragNode.getBoundingClientRect();
    if (!this.dragFlag) {
      return;
    }

    // this.dragNode.style.right = `${right}px`;
    if (window.innerHeight - e.clientY + 90 - height < 16) {
      // 滑到底部
      this.dragNode.style.bottom = '16px';
    } else if (e.clientY < 186) {
      // 滑到顶部
      this.dragNode.style.top = `90px`;
    } else {
      this.dragNode.style.bottom = `${window.innerHeight - e.clientY + 90 - height + 15}px`;
      this.dragNode.style.top = 'unset';
    }
  };

  handleIconMouseUp = (e) => {
    if (!this.dragFlag) {
      return;
    }
    this.dragIconNode.style.opacity = 0;
    this.dragFlag = false;
    document.body.removeEventListener('mousemove', this.handleIconMouseMove);
    document.body.removeEventListener('mouseup', this.handleIconMouseUp);
    document.body.removeEventListener('mouseleave', this.handleIconMouseUp);
  };

  getCardSetting = (cb = () => {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'swbhCards/getCardSetting',
    }).then((res) => {
      const { swbhCards: { currentCarousel } = {} } = this.props;
      if (res && !res.failed) {
        const { allCard = [], cardList = [] } = res;

        // this.setCurrentCardData(currentCarousel, allCard, cardList);
        dispatch({
          type: 'swbhCards/updateState',
          payload: { allCard, cardList },
        });

        if (cb) {
          cb(res, currentCarousel);
        }
      } else {
        notification.error({
          message: res?.message,
        });
      }
      dispatch({
        type: 'swbhCards/updateState',
        payload: { businessLoading: false },
      });
    });
  };

  getDocTotal = (todoFlag = null) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'swbhCards/getTransferTotalElements',
    });
    dispatch({
      type: 'swbhCards/getDocTotal',
      payload: { todoFlag },
    }).then((res) => {
      if (todoFlag !== null) {
        return;
      }
      this.setState({ totalLoading: false });
      const { swbhCards: { docTotal = {}, currentCarousel } = {} } = this.props;
      const {
        cardDataDocTypeDTOList = [],
        // allCard = {},
      } = docTotal;
      if (res && !res.failed) {
        let currentMenuData = {};
        if (currentCarousel === 'ALL') {
          currentMenuData = res?.allCard ?? {};
        } else {
          const menuDataArr = cardDataDocTypeDTOList?.filter((item) => item.cardCode === currentCarousel);
          currentMenuData = menuDataArr?.[0] ?? {};
        }

        const newcardDataEntryTypeDTOList = this.filterDraft(currentMenuData);
        currentMenuData.cardDataEntryTypeDTOList = newcardDataEntryTypeDTOList || [];

        dispatch({
          type: 'swbhCards/updateState',
          payload: { currentMenuData },
        });
      } else {
        notification.error({ message: res?.message });
      }
      dispatch({
        type: 'swbhCards/updateState',
        payload: { totalLoading: false },
      });
    });
  };

  setCurrentCardData = (value, allCardData = {}, cardListData = [], cb = () => {}) => {
    const {
      dispatch,
      swbhCards: { currentCarousel: currentSelect, allCard: propsAllCard, cardList: propsCardList } = {},
    } = this.props;
    const currentCarousel = value || currentSelect;
    const allCard = allCardData || propsAllCard;
    const cardList = cardListData || propsCardList;
    let currentCardData = {};
    if (currentCarousel === 'ALL') {
      currentCardData = allCard;
    } else {
      const filterDataArr = cardList.filter((item) => item.cardCode === currentCarousel);
      currentCardData = filterDataArr?.[0] ?? {};
    }
    const {
      cardDocFastDTOList = [],
      cardQuickLinkDTOList = [],
      docTypeSource = [],
      preloadingRouteList = [],
      cardName = '全部',
    } = currentCardData || {};

    dispatch({
      type: 'swbhCards/updateState',
      payload: { cardDocFastDTOList, cardQuickLinkDTOList, docTypeSource, currentDocName: cardName },
    });
    preloadingRouteList.forEach((item) => {
      if (item && !item.includes('spfm')) {
        loadMicroModuleFromPathname({ pathname: item });
      }
    });

    if (cb) {
      cb();
    }
  };

  filterDraft = (currentMenuData = {}) => {
    const { dispatch } = this.props;
    const { cardDataEntryTypeDTOList = [] } = currentMenuData;

    const draftNum = currentMenuData?.draftTotalElements ?? null;
    const newcardDataEntryTypeDTOList = cardDataEntryTypeDTOList.filter((item) => item?.typeCode !== 'DRAFT');
    dispatch({
      type: 'swbhCards/updateState',
      payload: { draftNum },
    });
    return newcardDataEntryTypeDTOList;
  };

  changeCurrentCarousel = (value, currentMenuData = {}) => {
    const menuData = currentMenuData;
    // const { dispatch } = this.props;
    const { dispatch, swbhCards: { allCard, cardList } = {} } = this.props;
    this.setCurrentCardData(value, allCard, cardList);
    const newcardDataEntryTypeDTOList = this.filterDraft(menuData);
    menuData.cardDataEntryTypeDTOList = newcardDataEntryTypeDTOList || [];
    dispatch({
      type: 'swbhCards/updateState',
      payload: { currentCarousel: value, currentDocName: currentMenuData?.cardName, currentMenuData: menuData },
    });
    if (window.collectEvent) {
      window.collectEvent('ClickButton', { text: `采购员工作台-卡片-${currentMenuData?.cardName}` });
    }
  };

  changeSwbnCardVisible = () => {
    // if (this.state.swbhMode === 'focus') {
    //   return;
    // }
    this.setState({ swbnCardVisible: !this.state.swbnCardVisible });
  };

  render() {
    const {
      swbhCards: { currentCarousel = 'ALL', cardDocFastDTOList, cardQuickLinkDTOList, draftNum = '-' } = {},
      isShowReportCardsLoading,
      // totalLoading,
      layoutLoading,
      dispatch,
    } = this.props;
    const { swbnCardVisible, swbhMode, sdatPage, showReportCards, showGuide, totalLoading, riskLinkFlag } = this.state;
    const path = sdatPage === 'cardConfig' ? '/sdat/report-cards-config' : '/sdat/risk-control-workbench/list';
    const search = sdatPage === 'cardConfig' ? '' : '?fromPage=roleControl';
    return (
      <div className={styles.main}>
        <Spin spinning={totalLoading || layoutLoading || isShowReportCardsLoading || false}>
          <>
            {/* <Guide /> */}

            <FocusModeBtn
              currentMode={swbhMode}
              riskLinkFlag={riskLinkFlag}
              dispatch={dispatch}
              changeMode={this.changeMode}
              setSdatPageShow={this.setSdatPageShow}
              sdatPage={sdatPage}
              handleIconMouseDown={this.handleIconMouseDown}
              showReportCards={showReportCards}
              loading={isShowReportCardsLoading}
              showGuide={showGuide}
            />

            {sdatPage ? (
              <EmbedPage
                href={path}
                path={path}
                location={{ hash: '', pathname: path, search }}
                match={{ params: {}, path }}
                history={{
                  ...window.dvaApp._history,
                  location: {
                    hash: '',
                    pathname: path,
                    search,
                  },
                }}
              />
            ) : (
              <div
                className={`${styles.swbhContainer} ${
                  currentCarousel === 'ALL' || cardQuickLinkDTOList.length === 0 ? styles.carouselIsAll : ''
                } ${swbhMode === 'focus' ? styles.focusMode : ''}`}
              >
                {/* <Spin spinning={totalLoading || layoutLoading || isShowReportCardsLoading || false}> */}
                <div className={styles.leftCard}>
                  <Card className={styles.card}>
                    <SwbnCard
                      changeCurrentCarousel={this.changeCurrentCarousel}
                      swbnCardVisible={swbnCardVisible}
                      swbhMode={swbhMode}
                      showGuide={showGuide}
                    />
                    <SwbnDocumentList
                      onRef={(node) => {
                        this.documentList = node;
                      }}
                      changeSwbnCardVisible={this.changeSwbnCardVisible}
                      swbnCardVisible={swbnCardVisible}
                      getDocTotal={this.getDocTotal}
                      swbhMode={swbhMode}
                      changeCurrentCarousel={this.changeCurrentCarousel}
                      showGuide={showGuide}
                    />
                  </Card>
                </div>

                <div className={styles.rightCard}>
                  <Card className={styles.card}>
                    <SwbnBusinessCard showGuide={showGuide} />
                  </Card>
                  <Card className={`${styles.card} ${styles.srmMessagehContainer}`}>
                    <SrmMessage />
                  </Card>
                </div>
                {/* </Spin> */}
              </div>
            )}
          </>
        </Spin>
      </div>
    );
  }
}
