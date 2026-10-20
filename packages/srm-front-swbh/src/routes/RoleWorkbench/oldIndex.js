import React, { Component, Fragment } from 'react';
// import { Button, Row, Col } from 'choerodon-ui/pro';
import { Card, Icon } from 'hzero-ui';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import RGL from 'react-grid-layout';
// import request from 'utils/request';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import { connect } from 'dva';
// import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
// import CardsSetting from 'hzero-front/lib/routes/Dashboard/Workplace/CardsSetting';
// import Card from './components/SWBN_card';
import { dynamicWrapper } from '@/utils/router';
// import { DEBOUNCE_TIME } from 'utils/constants';
import { loadCardAsync, setCard } from 'hzero-front/lib/customize/cards';
// import { getCurrentOrganizationId } from 'utils/utils';

// import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import styles from 'hzero-front/lib/routes/Dashboard/Workplace/index.less';

import dynamic from 'dva/dynamic';
import { createElement } from 'react';
import cardStyles from './index.less';

const ReactGridLayout = RGL;

// 将一样的不会变化的样式 抽取出来 放在最外面

const pageContentStyle = {
  backgroundColor: 'rgb(243, 244, 245)',
  padding: '0 6px 0 6px',
};
const layoutContainerStyle = { position: 'relative' };

// const buttonStyle = { float: 'right', marginRight: '12px' };

// const setLayoutButtonStyle = {
//   // border: 'none',
//   float: 'right',
//   marginRight: '12px',
// };

const cardsConfig = [
  // FIXME: 直接使用了 window.dvaApp 需要注意
  {
    code: 'SWBH_card',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['swbhCards'], () => import('./components/SWBH_card/index'));
    },
  },

  {
    code: 'SWBH_documentList',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['swbhCards'], () => import('./components/SWBH_documentList/index'));
    },
  },

  {
    code: 'SWBH_businessCard',
    component: async () => {
      return dynamicWrapper(window.dvaApp, ['swbhCards'], () => import('./components/SWBH_businessCard/index'));
    },
  },
  {
    code: 'SRM_Message',
    // component: async () => {
    //   return dynamicWrapper(window.dvaApp, [() => import('srm-front-spfm/lib/models/srmCards')], () =>
    //     import('srm-front-spfm/lib/routes/Dashboard/SRM_Message')
    //   );
    // },
    component: async () => {
      return dynamic({
        app: window.dvaApp,
        models: [() => import('srm-front-spfm/lib/models/srmCards')],
        component: () => {
          // const component = () => import('srm-front-spfm/lib/routes/Dashboard/SRM_Message_new');
          const component = () => import('srm-front-spfm/lib/routes/Dashboard/SRM_Message');
          return component().then((raw) => {
            const Component = raw.default || raw;
            return (props) =>
              createElement(Component, {
                ...props,
              });
          });
        },
      });
    },
  },
];

// import // checkOrderRule,
// // lineCreate,
// // checkApplyToInquiry,
// // createApplyToInquiry,
// '@/services/purchaseRequisitionPoolService.js';

// const organizationId = getCurrentOrganizationId();

// @withCustomize({
//   // unitCode: ['SPRM.PURCHASE_REQUISITION_POLL.TAB'],
// })
@formatterCollections({
  code: ['swbh.common'],
})
@connect(({ roleWorkbench, swbhCards }) => ({
  roleWorkbench,
  swbhCards,
}))
export default class RoleWorkbench extends Component {
  initCards = {}; // 初始化的卡片, {[code: string]: card}; // 存储初始化的卡片

  constructor(props) {
    super(props);
    // props.onRef(this);
    // 存储进入设计状态之前的 layout
    this.state = {
      loading: true,
      currentCards: [], // 当前布局内卡片的原始数据
      setting: false, // 设计状态
      layout: [], // 现有的布局数据
    };

    this.originLayout = null;
    this.originCurrentCards = null;
    this.mounted = false; // 表示组件是否加载
    // const { cardsConfig = [] } = props;
    cardsConfig.forEach((cardConfig) => {
      setCard(cardConfig);
    });
  }

  componentDidMount() {
    // this.initTotalPage();
    this.initLayout();

    // this.mounted = true;
    // // debugger;
    // window.addEventListener('resize', this.handleWindowResize);
    // this.handleWindowResize();
  }

  // componentWillUnmount() {
  //   this.mounted = false;
  //   // 移除监听 windowResize
  //   window.removeEventListener('resize', this.handleWindowResize);
  //   this.handleWindowResize.cancel();
  // }

  // // eslint-disable-next-line no-unused-vars
  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   if (this.props.collapsed !== prevProps.collapsed) {
  //     this.handleWindowResize();
  //   }
  // }

  @Bind()
  initLayout() {
    // const { dispatch } = this.props;

    // dispatch({
    //   type: 'roleWorkbench/fetchLayoutAndInit',
    // }).then(res1 => {
    // console.log('[init]', res1);
    const res = [
      {
        cardId: '__-bL7NF7DQ0CXge3UkDILpQw-__',
        cardParams: 'none',
        code: 'SWBH_card',
        // h: '112px',
        h: 10,
        initFlag: 0,
        name: '走马灯卡片',
        // w: '1400px',
        w: 90.5,
        x: 0,
        y: 0,
        // static: true,
      },
      {
        cardId: '__-M9FsfKVr93ey_TBGOXa6LA-__',
        cardParams: 'none',
        code: 'SWBH_documentList',
        // h: '112px',
        h: 10,
        initFlag: 0,
        name: '单据表格',
        w: 90.5,

        // w: '1400px',
        x: 0,
        y: 0,
        // static: true,
      },
      {
        cardId: '__-bL7NF7DQ0CXge3UkDILpQw-_12_',
        cardParams: 'none',
        code: 'SWBH_businessCard',
        h: 40,
        initFlag: 0,
        name: '业务卡片',
        w: 25,
        x: 90.5,
        y: 0,
        // static: true,
      },
      {
        cardId: '__-bL7NF7DQ0CXge3UkDILpQw-_1y_',
        cardParams: 'none',
        code: 'SRM_Message',
        h: 10,
        initFlag: 0,
        name: '系统消息公告',
        w: 25,
        x: 90.5,
        y: 20,
        // static: true,
      },
    ];
    if (res) {
      this.setState(
        {
          currentCards: res,
        },
        () => {
          this.loadCards(
            res.map((card) => {
              const { cardId, ...rest } = card;
              if (card.initFlag === 1) {
                this.initCards[String(cardId)] = card;
              }
              return { ...rest, i: String(cardId) };
            })
          );
        }
      );
    }
    // });
  }

  /**
   * window resize 后 重新设置宽度
   */
  // @Debounce(DEBOUNCE_TIME)
  // @Bind()
  // handleWindowResize() {
  //   if (!this.mounted) {
  //     // 如果组件没有在组件树中, 则不重新设置宽度
  //     return;
  //   }
  //   const {
  //     match: { path },
  //     activeTabKey,
  //   } = this.props;
  //   // 如果当前 tab 页 不是本页面, 则不更新 width, 但是要设置 标志, 在 DidUpdate 中更新
  //   if (path === activeTabKey) {
  //     setTimeout(() => {
  //       const dom = document.querySelectorAll('.page-content')?.[0];
  //       // eslint-disable-next-line
  //       const node = ReactDOM.findDOMNode(dom); // Flow casts this to Text | Element
  //       if (node instanceof HTMLElement) {
  //         this.setState({ width: node.offsetWidth });
  //       }
  //     }, 0.5);
  //   }
  // }

  /**
   * 加载单独的卡片组件, 失败返回 失败的Card
   * @param {string} cardCode - 卡片代码
   * @return {React.Component|null}
   */
  async importCard(cardCode) {
    let loadCard = null;
    try {
      loadCard = await loadCardAsync(cardCode);
    } catch (e) {
      loadCard = null;
    }
    return loadCard;
  }

  /**
   * 加载所有的卡片组件
   */
  async importCards(...cardCodes) {
    return Promise.all(cardCodes.map((cardCode) => this.importCard(cardCode)));
  }

  /**
   * 查找id相同的card
   * @param {string} i
   */
  @Bind()
  getCard(i, flag) {
    const { currentCards } = this.state;
    return !flag
      ? currentCards.find((n) => String(n.cardId) === i)
      : this.originCurrentCards.find((n) => String(n.cardId) === i);
  }

  /**
   * 将 卡片 加载成 layout
   */
  @Bind()
  loadCards(layouts = [], flag) {
    const layout = layouts;
    let cards = [];
    this.importCards(
      ...layout.map((c) => {
        return this.getCard(c.i, flag).code;
      })
    )
      .then((cmps) => {
        cards = layout.map((card, index) => {
          const data = this.getCard(card.i);
          const cmp = cmps[index];
          if (cmp) {
            if (cmp.__esModule) {
              const WorkplaceCard = cmp.default;
              return {
                name: card.i,
                code: card.code,
                component: <WorkplaceCard cardParams={data.cardParams} name={data.name} />,
              };
            }
            const WorkplaceCard = cmp;
            return {
              name: card.i,
              code: card.code,
              component: <WorkplaceCard cardParams={data.cardParams} name={data.name} />,
            };
          }
          return {
            name: card.i,
            code: card.code,
            component: <Card loading />,
          };
        });
      })
      .finally(() => {
        this.setState({
          loading: false,
          layout,
          cards,
        });
      });
  }

  /**
   * 开始设置布局
   */
  @Bind()
  startSettingLayout() {
    const { layout, currentCards } = this.state;
    this.setState(
      {
        setting: true,
      },
      () => {
        this.originLayout = layout;
        this.originCurrentCards = currentCards;
      }
    );
  }

  /**
   * 取消设置布局状态
   */
  @Bind()
  cancelSettingLayout() {
    this.loadCards(this.originLayout, true);
    this.setState({
      setting: false,
      currentCards: this.originCurrentCards,
    });
  }

  /**
   * layout 改变的回调
   */
  @Bind()
  onLayoutChange(layout) {
    // 现在错误的 卡片也会占一个位置了
    // if (layout.length === 1 && layout[0].name === 'error') return;
    this.setState({
      layout,
    });
  }

  /**
   * 是 初始化卡片
   * @param {string} cardId - 卡片Id
   */
  @Bind()
  isInitCard(cardId) {
    return !!this.initCards[cardId];
  }

  /**
   * 移除指定 id 的卡片
   */
  @Bind()
  handleRemoveCard(id) {
    const { layout = [], currentCards = [] } = this.state;
    const layouts = layout.filter((l) => l.i !== id);
    const cards = currentCards.filter((l) => l.cardId !== id);
    if (layouts.length === layout.length) {
      // 已经移除了 不要重复移除
      // FIXME: 是否在 CardsSetting 中判断
    }
    this.setState(
      {
        currentCards: cards,
      },
      () => {
        this.loadCards(layouts);
      }
    );
  }

  renderCard() {
    const { setting = false, cards = [] } = this.state;
    return cards.map((item) => {
      // TODO: GridItem need width
      if (setting === true) {
        return (
          <div key={item.name}>
            {item.component}
            <div className={`${styles.dragCard}`} />
            {!this.isInitCard(item.name) && (
              <Icon
                type="close"
                className={styles.closeBtn}
                onClick={() => {
                  this.handleRemoveCard(item.name);
                }}
              />
            )}
          </div>
        );
      }
      const cardName = item.code;
      return (
        <div key={item.name} className={`${styles.boxShadow} ${cardStyles[cardName]}`}>
          {item.component}
        </div>
      );
    });
  }

  render() {
    const { currentCarousel } = this.props.swbhCards;
    const { setting, loading, layout = [], width } = this.state;
    const allCards = this.renderCard();
    const reactGridLayoutProps = {};
    if (width) {
      reactGridLayoutProps.width = width;
    }
    reactGridLayoutProps.width = 1880;
    return (
      <Fragment>
        {/* <Header title={intl.get('swbh.common.view.title.roleWorkbench').d('角色工作台')}>
          {setting === true ? (
            <>
              <Button type="primary" icon="save" onClick={this.cancelSettingLayout}>
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button icon="minus-circle-o" onClick={this.cancelSettingLayout}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            </>
          ) : (
            <Button
              icon="settings"
              // style={setLayoutButtonStyle}
              onClick={this.startSettingLayout}
            >
              {intl.get('hzero.common.button.settingLayout').d('设置布局')}
            </Button>
          )}
        </Header> */}
        <Content noCard style={pageContentStyle}>
          {loading === true ? (
            <Card loading />
          ) : (
            <ReactGridLayout
              {...reactGridLayoutProps}
              style={layoutContainerStyle}
              layout={layout}
              className={`${styles.gridLayoutContainer} ${cardStyles.cardContainer} ${
                currentCarousel === 'ALL' ? cardStyles.carouselIsAll : ''
              }`}
              isDraggable={setting}
              isResizable={setting}
              cols={120}
              rowHeight={1}
              margin={[12, 12]}
              onLayoutChange={this.onLayoutChange}
            >
              {allCards}
            </ReactGridLayout>
          )}
        </Content>
      </Fragment>
    );
  }
}
