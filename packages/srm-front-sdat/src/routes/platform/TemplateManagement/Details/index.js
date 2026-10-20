/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Row, Col, Spin } from 'choerodon-ui';
import { DataSet, Form, Button, Icon, IntlField } from 'choerodon-ui/pro';
import { cloneDeep } from 'lodash';
import { queryIdpValue } from 'services/api';
import { Bind, Debounce } from 'lodash-decorators';
import { withRouter } from 'dva/router';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEBOUNCE_TIME } from 'utils/constants';
import notification from 'utils/notification';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import html2canvas from 'html2canvas';

import {
  fetchSaveHeader,
  fetchReadyCards,
  getTemplateLayout, // 获取模板配置详情
  fetchUpdate, // 更新模板
  getTemplateDetail,
} from '@/services/templateManageService';

import { loadCardAsync } from './cards';
import CardScrollComp from './CardScrollComp';
import TargetBox from './TargetBox';
import { CardTypes } from './CardTypes';

import styles from './index.less';

const noPermission = require('@/assets/noPermission.svg');

const pageContentStyle = {
  padding: '1px 0',
  overflow: 'hidden',
  backgroundColor: 'rgb(243, 244, 245)',
};

const buttonStyle = { float: 'right', marginRight: '12px' };

let drawPanelWidth = 0;
let originalList = []; // 存储接口返回的原始数据，用于匹配卡片是新增、更新还是删除

@connect(({ dragReport, global = {} }) => ({
  dragReport,
  activeTabKey: global.activeTabKey,
  collapsed: global.collapsed,
}))
@withRouter
@formatterCollections({ code: ['sdat.reportConfig'] })
export default class ReportConfig extends React.Component {
  static defaultProps = {
    className: styles.gridLayoutContainer,
    cols: 4,
    rowHeight: 28,
  };

  initCards = {}; // 初始化的卡片, {[code: string]: card}; // 存储初始化的卡片

  ds2 = new DataSet({
    primaryKey: 'pk',
    fields: [
      {
        name: 'cockpitName',
        type: 'intl',
      },
    ],
  });

  constructor(props) {
    super(props);

    const pageType = props?.match?.params?.type ?? '';
    const localRecord = props?.location?.state?.localRecord ?? {};

    // 存储进入设计状态之前的 layout
    this.state = {
      loading: true, //
      setting: pageType === 'edit', // 设计状态
      layout: [], // 现有的布局数据
      cards: [], // 现有的布局 对应的 组件
      currentCards: [], // 当前布局内卡片的原始数据
      storageList: [],
      titleContext: localRecord?.name ?? '',
      headerId: localRecord?.cockpitHeaderId ?? '',
      headerObj: {},
      groupList: [],
      readCards: [],
    };

    this.originLayout = null;
    this.originCurrentCards = null;
    this.mounted = false; // 表示组件是否加载
    this.localRecord = localRecord;
    this.pageType = pageType;
    this.ds2.data = [{ cockpitName: localRecord?.name ?? '' }];
  }

  async componentDidMount() {
    const { headerId } = this.state;
    this.mounted = true;
    // 监听 windowResize
    window.addEventListener('resize', this.handleWindowResize);

    if (this.pageType === 'edit') {
      this.querySetList();
      this.queryCardTextList('');
    }

    if (headerId) {
      this.getLayoutList(headerId); // 查询卡片列表
    } else {
      getTemplateDetail({ templateId: this.localRecord.templateId }).then((res) => {
        const obj = res && res.content && res.content.length ? res.content[0] : {};
        if (obj.cockpitHeaderId) {
          this.getLayoutList(obj.cockpitHeaderId); // 查询卡片列表
        } else {
          this.setState({
            loading: false,
          });
        }
      });
    }

    drawPanelWidth =
      document.getElementById('platform-template-manage-report-config')?.offsetWidth ?? 0; // 获取画板宽度
    this.forceUpdate();
  }

  componentWillUnmount() {
    drawPanelWidth = 0;
    this.mounted = false;
    originalList = [];

    // 移除监听 windowResize
    window.removeEventListener('resize', this.handleWindowResize);
    this.handleWindowResize.cancel();
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.collapsed !== prevProps.collapsed) {
      this.handleWindowResize();
    }
  }

  querySetList = () => {
    queryIdpValue('SDAT.REPORT_CARD_GROUP').then((res) => {
      if (getResponse(res)) {
        this.setState({ groupList: res || [] });
      }
    });
  };

  queryCardTextList = (text) => {
    const { headerId } = this.state;
    fetchReadyCards({
      name: text,
      cockpitHeaderId: headerId || '',
      loginName: this.localRecord?.previewLoginName ?? '',
      templateId: this.localRecord?.templateId ?? '',
      level: this.localRecord?.level ?? '',
      tenantId: this.localRecord?.tenantId ?? '',
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({ readCards: res?.content ?? [] });
      }
    });
  };

  @Bind()
  async getLayoutList(headerId) {
    let list = [];

    const res = await getTemplateLayout({
      cockpitHeaderId: headerId,
      previewLoginName: this.localRecord?.previewLoginName ?? '',
    });
    this.setState({
      loading: false,
    });

    if (getResponse(res)) {
      const localTabData = res ?? {};
      list = localTabData?.lines ?? [];
      this.ds2.data = [{ ...res }];

      if (list.length) {
        list.forEach((item) => {
          item.h = item.height;
          item.w = item.width;
          item.dragType = CardTypes.REPORT_CARD;
        });
      }

      originalList = cloneDeep(localTabData?.lines ?? []);

      this.setState(
        {
          currentCards: list,
          storageList: list,
          titleContext: localTabData?.cockpitName ?? '',
          headerId: localTabData?.headerId ?? '',
          headerObj: localTabData || {},
        },
        () => {
          this.loadCards(
            list.map((card) => {
              const { cardId, ...rest } = card;
              if (card.initFlag === 1) {
                this.initCards[String(cardId)] = card;
              }
              return { ...rest, i: String(cardId) };
            })
          );
          this.handleWindowResize();
          drawPanelWidth =
            document.getElementById('platform-template-manage-report-config')?.offsetWidth ?? 0; // 获取画板宽度
          this.forceUpdate();
        }
      );
    }
  }

  /**
   * window resize 后 重新设置宽度
   */
  @Debounce(DEBOUNCE_TIME)
  @Bind()
  handleWindowResize() {
    if (!this.mounted) {
      // 如果组件没有在组件树中, 则不重新设置宽度
      return;
    }
    const {
      match: { path },
      activeTabKey,
    } = this.props;
    // 如果当前 tab 页 不是本页面, 则不更新 width, 但是要设置 标志, 在 DidUpdate 中更新
    if (path === activeTabKey) {
      setTimeout(() => {
        const dom = document.querySelectorAll('.page-content')?.[0];
        // eslint-disable-next-line
        const node = ReactDOM.findDOMNode(dom); // Flow casts this to Text | Element
        if (node instanceof HTMLElement) {
          this.setState({ width: node.offsetWidth });
        }
      }, 0.5);
    }
  }

  /**
   * 数组去重
   */
  @Bind()
  uniqueSaveList(data = []) {
    // 新增的列表
    const createList = data.filter((item) => item.recordStatus === 'created');
    const othersList = data.filter((item) => item.recordStatus !== 'created');

    const cardIdMap = {};
    const uniqueArr = []; // 去重后的数据
    if (createList.length) {
      createList.forEach((item) => {
        if (item.cardId && !cardIdMap[item.cardId]) {
          cardIdMap[item.cardId] = item;
        }
      });

      Object.keys(uniqueArr).forEach((item) => {
        uniqueArr.push({ ...item });
      });
    }

    return [...uniqueArr, ...othersList];
  }

  /**
   * 保存布局
   */
  @Bind()
  async saveLayout() {
    const _self = this;
    const { layout, currentCards, headerObj } = this.state;

    if (layout) {
      const newLayout = cloneDeep(layout);
      const saveParams = newLayout.map((item) => {
        const { i, ...rest } = item;
        const card = currentCards.find((n) => String(n.cardId) === i);

        const {
          cardId,
          code,
          name,
          dragType,
          reportUrl,
          previewPictureUrl,
          enabledFlag,
          orderSeq,
        } = card;

        return {
          ...rest,
          cardId,
          code,
          name,
          dragType,
          reportUrl,
          previewPictureUrl,
          enabledFlag,
          orderSeq,
        };
      });

      const para = { ...headerObj };

      if (saveParams.length) {
        saveParams.forEach((item) => {
          item.height = item.h;
          item.width = item.w;
          item.cockpitHeaderId = para?.headerId ?? '';
          item.recordStatus = !headerObj.headerId ? 'create' : _self.getCardStatus(item.cardId);
          item.objectVersionNumber =
            item.recordStatus === 'create' || !headerObj.headerId
              ? null
              : _self.getCardField(item.cardId, 'objectVersionNumber');
          item.initSize = `${item.w}#${item.h}`;
          item.lineId =
            item.recordStatus === 'create' || !headerObj.headerId
              ? null
              : _self.getCardField(item.cardId, 'lineId');
          item._token =
            item.recordStatus === 'create' || !headerObj.headerId
              ? null
              : _self.getCardField(item.cardId, '_token');
          item.updateby = !headerObj.headerId ? '' : _self.getCardField(item.cardId, 'updateby');
          item.tenantId = !headerObj.headerId ? '' : _self.getCardField(item.cardId, 'tenantId');
        });
      }
      const saveIds = saveParams.map((item) => item.cardId);
      let deleteList = [];
      const copyList = cloneDeep(originalList);
      if (copyList.length) {
        deleteList = copyList.filter((item) => !saveIds.includes(item.cardId)); // 删除的数据
      }

      if (deleteList.length) {
        deleteList.forEach((item) => {
          item.recordStatus = 'delete';
        });
      }

      const dsList = this.ds2.toData();
      const obj = dsList.length ? dsList[0] : {};

      const tls = {
        cockpitName: {
          zh_CN: obj.cockpitName || (this.localRecord?.name ?? ''),
          en_US: '',
          vi_VN: '',
          ja_JP: '',
          ru_RU: '',
          th_TH: '',
        },
      };

      const saveList = [...saveParams, ...deleteList];
      // 去重数据

      const uniqueList = this.uniqueSaveList(saveList);

      fetchSaveHeader({
        ...para,
        cockpitName: obj.cockpitName || (this.localRecord?.name ?? ''),
        loginName: this.localRecord?.previewLoginName ?? '',
        templateId: this.localRecord?.templateId ?? '',
        lines: uniqueList,
        _tls: obj._tls ? obj._tls : tls,
      })
        .then((res) => {
          if (getResponse(res)) {
            notification.success();
            if (!this.localRecord.cockpitHeaderId) {
              fetchUpdate({
                ...this.localRecord,
                cockpitHeaderId: res?.headerId ?? '',
              });
            }
            _self.originLayout = layout;
            _self.originCurrentCards = currentCards;
            this.getLayoutList(res?.headerId ?? '');
          }
        })
        .catch(() => {
          this.loadCards(this.originLayout);
        });
    }
  }

  @Bind()
  getCardField(id = '', fieldName = '') {
    if (!originalList.length) {
      return null;
    }

    let text = '';
    originalList.forEach((item) => {
      if (item.cardId === id) {
        text = item[fieldName];
      }
    });

    return text;
  }

  /**
   * 判断卡片是新增还是更新
   * @param {*} cardId
   * @returns
   */
  @Bind()
  getCardStatus(cardId = '') {
    const list = cloneDeep(originalList);

    if (!list.length) {
      return 'create';
    }

    let isIncloud = false;
    list.forEach((item) => {
      if (item.cardId === cardId) {
        isIncloud = true;
      }
    });

    if (isIncloud) {
      return 'update';
    }
    return 'create';
  }

  /**
   * 取消设置布局状态
   */
  @Bind()
  cancelSettingLayout() {
    this.props.history.goBack();
  }

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
   * 加载所有的卡片组件
   */
  async importCards(...cardCodes) {
    return Promise.all(cardCodes.map((cardCode) => this.importCard(cardCode)));
  }

  @Bind()
  reloadCard(card) {
    const { layout } = this.state;
    const layouts = [...layout];

    if (layouts.length) {
      layouts.forEach((item) => {
        if (item.cardId === card.cardId) {
          item.enabledFlag = card.enabledFlag;
        }
      });
    }
    this.setState(
      {
        layout: layouts,
      },
      () => {
        this.loadCards(layouts);
      }
    );
  }

  /**
   * 将 卡片 加载成 layout
   */
  @Bind()
  loadCards(layouts = []) {
    const layout = [].concat(layouts);
    let cards = [];

    cards = layout.map((card) => {
      return {
        name: card.i,
        component: (
          <div style={{ width: '100%', height: '100%' }}>
            {card.enabledFlag === '1' || card.enabledFlag === 1 ? (
              <iframe
                src={card.reportUrl}
                title={card.name}
                frameBorder={0}
                height="100%"
                width="100%"
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'center',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <img src={noPermission} alt="noPermission" style={{ width: '50px' }} />
                </div>
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  {intl
                    .get('sdat.reportConfig.view.title.cardHasDisabled')
                    .d('卡片加载失败，您可以尝试刷新或联系管理员确认卡片权限')}
                </div>
              </div>
            )}
          </div>
        ),
      };
    });

    this.setState({
      loading: false,
      layout,
      cards,
    });
  }

  /**
   * 移除指定 id 的卡片
   */
  @Bind()
  handleRemoveCard(id) {
    const { currentCards = [], layout = [], readCards } = this.state;

    const list = [...readCards];

    const layouts = layout.filter((l) => l.i !== id);
    const cards = currentCards.filter((l) => l.cardId !== id);
    const card = currentCards.filter((l) => l.cardId === id);

    if (card.length) {
      list.push({ ...card[0] });
    }

    this.setState(
      {
        currentCards: cards,
        readCards: list,
      },
      () => {
        this.loadCards(layouts);
      }
    );
  }

  @Bind()
  handleAddCard(card = {}, pos = {}) {
    const { layout = [], currentCards = [], readCards } = this.state;
    const { cardId, previewPictureUrl = '' } = card;

    const list = [...readCards];

    if (layout.some((l) => l.i === String(cardId))) {
      // 已经添加了 不要重复添加
      return;
    }

    const img = new Image();
    let w = 0;
    let h = 0;
    img.src = previewPictureUrl;
    img.onload = () => {
      w = img.naturalWidth;
      h = img.naturalHeight;

      const colWidth = drawPanelWidth; // 内容区实际宽度

      const width = ((w / 1700) * colWidth) / (colWidth / 12); // 宽度栅格数
      const height = ((h / 1700) * colWidth) / (colWidth / 12); // 高度栅格数

      const layouts = [
        ...layout,
        {
          ...card,
          x: pos?.x ?? 0,
          y: pos?.y ?? 0,
          w: Math.round(width),
          h: Math.round(height),
          i: String(cardId),
        },
      ];
      currentCards.push(card);

      if (list.length) {
        list.forEach((item, index) => {
          if (String(item.cardId) === String(card.cardId)) {
            list.splice(index, 1);
          }
        });
      }

      this.setState(
        {
          currentCards,
          readCards: list,
        },
        () => {
          this.loadCards(layouts);
        }
      );
    };
  }

  @Bind()
  handleChangeState(param = {}) {
    this.setState(param);
  }

  @Bind()
  handleCreateImg() {
    const dom = document.getElementById('test-thumbnail-area');
    const heightCount = dom.scrollHeight;

    const cloneDom = dom.cloneNode(true); // 截取克隆的dom节点，避免滚动轴看不到的内容截取不到
    cloneDom.style.cssText = `height: ${heightCount}px; position: 'absolute'; top: 0; z-index: -1;`;
    document.body.appendChild(cloneDom);

    html2canvas(cloneDom, {
      allowTaint: true, // 不允许跨源图像污染画布
      useCORS: true, // 支持跨域图片的截取，不然图片截取不出来
      // 图片服务器配置 Access-Control-Allow-Origin: *
      scrollY: 0, // 解决 DOM 截图不完整的问题
      scrollX: 0, // 解决 DOM 截图不完整的问题
    }).then((canvas) => {
      const link = document.createElement('a'); // 建立一个超连接对象实例
      const event = new MouseEvent('click'); // 建立一个鼠标事件的实例
      link.download = 'thumbnail.png'; // 设置要下载的图片的名称
      link.href = canvas.toDataURL(); // 将图片的 URL 设置到超连接的href中
      link.dispatchEvent(event); // 触发超连接的点击事件
      document.body.removeChild(cloneDom);
    });
  }

  handleBackPath = () => {
    this.props.history.push('/sdat/template-management/list');
  };

  render() {
    const {
      setting = false,
      layout = [],
      loading = true,
      width,
      storageList = [],
      cards,
      currentCards,
      titleContext,
      headerId,
      groupList,
      readCards,
    } = this.state;

    return (
      <Spin spinning={loading}>
        <div className={styles['report-config-header']}>
          <span className={styles['report-config-header-backPath']}>
            <Icon type="navigate_before" onClick={this.handleBackPath} />
          </span>

          <span>
            {setting ? (
              <Form
                dataSet={this.ds2}
                columns={1}
                style={{ width: '420px', margin: '0 auto', display: 'inline-block' }}
              >
                <IntlField
                  name="cockpitName"
                  placeholder={intl.get('sdat.reportConfig.view.title.customView').d('自定义看板')}
                />
              </Form>
            ) : (
              <span style={{ fontSize: '18px', color: '#1D2129', fontWeight: '500' }}>
                {titleContext}
              </span>
            )}
          </span>

          {loading !== true && (headerId || setting) && (
            <div
              style={{
                display: 'inline-block',
                float: 'right',
                marginTop: '8px',
              }}
            >
              {setting ? (
                <>
                  <Button
                    color="primary"
                    icon="save"
                    funcType="flat"
                    style={buttonStyle}
                    onClick={this.saveLayout}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>
                </>
              ) : (
                <span />
              )}
            </div>
          )}
        </div>

        <Content noCard style={{ ...pageContentStyle }}>
          <DndProvider backend={HTML5Backend}>
            <Row>
              <Col span={setting ? 19 : 24} id="platform-template-manage-report-config">
                {(layout.length || setting) && (
                  <TargetBox
                    dragList={storageList}
                    layout={layout}
                    width={drawPanelWidth >= 0 ? drawPanelWidth : width}
                    cards={cards}
                    currentCards={currentCards}
                    setting={setting}
                    initCards={this.initCards}
                    match={this.props.match}
                    onChangeState={this.handleChangeState}
                    onDropAddCard={this.handleAddCard}
                    onRemoveCard={this.handleRemoveCard}
                  />
                )}
              </Col>
              {setting ? (
                <Col span={5} style={{ borderTop: '1px solid rgba(201,205,212,1)' }}>
                  <CardScrollComp
                    setting={setting}
                    headerId={headerId}
                    basicGroupList={groupList}
                    readCards={readCards}
                    queryCardTextList={this.queryCardTextList}
                  />
                </Col>
              ) : null}
            </Row>
          </DndProvider>
        </Content>
      </Spin>
    );
  }
}
