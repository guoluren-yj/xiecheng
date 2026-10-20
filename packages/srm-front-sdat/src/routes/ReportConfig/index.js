/* eslint-disable eqeqeq */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Row, Col, Spin } from 'choerodon-ui';
import {
  IntlField,
  Button,
  Icon,
  Tooltip,
  DataSet,
  Form,
  Modal,
  TextField,
} from 'choerodon-ui/pro';
import { cloneDeep } from 'lodash';
import { queryIdpValue } from 'services/api';
import { Bind, Debounce } from 'lodash-decorators';
import { withRouter } from 'dva/router';
import intl from 'utils/intl';
import { getResponse, getCurrentTenant, getCurrentUser } from 'utils/utils';
import { Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEBOUNCE_TIME } from 'utils/constants';
import notification from 'utils/notification';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {
  fetchSaveHeader,
  getSheetList,
  getHeaderLayout,
  fetchReadyCards,
  getOrderStatus,
  fetchDeleteLayout,
} from '@/services/reportConfigService';

import { loadCardAsync } from './cards';
import CardScrollComp from './CardScrollComp';
import TargetBox from './TargetBox';
import { CardTypes } from './CardTypes';
import TemplateSelectModal from './TemplateSelectModal';

import styles from './index.less';

const noPermission = require('@/assets/noPermission.svg');
const noData = require('@/assets/nodata.svg');

const { themeConfigVO = {} } = getCurrentUser();

const {
  colorCode = '#29BECE', // 主题色
} = themeConfigVO;

const pageContentStyle = {
  padding: '1px 0',
  overflow: 'hidden',
  backgroundColor: 'rgb(243, 244, 245)',
};

const buttonStyle = { float: 'right', marginRight: '10px' };

const setLayoutButtonStyle = {
  float: 'right',
  marginRight: '12px',
};

let drawPanelWidth = 0;
let originalList = []; // 存储接口返回的原始行数据，用于匹配卡片是新增、更新还是删除
let cacheLayouts = []; // 引用模板布局时 存储当前布局列表
let cacheHeaderObj = {}; // 引用模板布局时 存储当前布局头信息
let saveKey = true; // 保存限制key
let mouseEventMap = {}; // 鼠标上移事件
let sheetEditMap = {}; // sheet 页编辑态控制
let queryCardId = ''; // 查询可拖拽卡片列表的id，选择模板后变更为选择模板

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

  col5Ref = null;

  ds2 = new DataSet({
    primaryKey: 'pk',
    data: [
      {
        cockpitName: intl.get('sdat.reportConfig.view.title.customView').d('未命名驾驶舱'),
      },
    ],
    fields: [
      {
        name: 'cockpitName',
        type: 'intl',
      },
    ],
  });

  constructor(props) {
    super(props);
    // 存储进入设计状态之前的 layout
    this.state = {
      loading: true, //
      setting: false, // 设计状态
      layout: [], // 现有的布局数据
      cards: [], // 现有的布局 对应的 组件
      currentCards: [], // 当前布局内卡片的原始数据
      storageList: [],
      titleContext: intl.get('sdat.reportConfig.view.title.customView').d('未命名驾驶舱'),
      headerId: '',
      headerObj: {},
      groupList: [],
      readCards: [],
      sheetMax: 0,
      sheetList: [],
      activeTab: 0, // 当前激活的sheet页 默认第一个
      showModal: false,
      refresh: false,
      startDrag: false,
      sheetName: '',
    };

    this.originLayout = null;
    this.originCurrentCards = null;
    this.mounted = false; // 表示组件是否加载
  }

  async componentDidMount() {
    this.mounted = true;
    // 监听 windowResize
    window.addEventListener('resize', this.handleWindowResize);
    const res = await getOrderStatus();
    const { tenantNum = '' } = getCurrentTenant();

    queryIdpValue('SDAT.TENANT_COCKPIT_MAX').then((result) => {
      if (getResponse(result) && result.length) {
        let sheetSum = 3;
        result.forEach((item) => {
          if (item.value === tenantNum) {
            sheetSum = parseInt(item.meaning, 10);
          }
        });

        this.setState({
          sheetMax: sheetSum,
        });
      }
    });

    if (res && typeof res === 'boolean') {
      this.querySetList();
      this.querySheetList('');
    } else {
      this.querySetList();
      this.querySheetList('');
      notification.warning({
        message: intl.get('hzero.common.notification.failed').d('操作失败'),
        description: intl
          .get('sdat.reportConfig.view.message.notOpenOrder')
          .d('您未开通驾驶舱服务或服务已过期，请联系管理员。'),
      });
      this.setState({
        loading: false,
      });
    }
    drawPanelWidth = document.getElementById('menu-card-report-config-container')?.offsetWidth ?? 0; // 获取画板宽度
  }

  componentWillUnmount() {
    drawPanelWidth = 0;
    this.mounted = false;
    originalList = [];
    cacheLayouts = [];
    cacheHeaderObj = {};
    mouseEventMap = {};
    sheetEditMap = {};
    queryCardId = '';

    // 移除监听 windowResize
    window.removeEventListener('resize', this.handleWindowResize);
    this.handleWindowResize.cancel();
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.collapsed?.collapsed !== prevProps.collapsed?.collapsed) {
      this.handleWindowResize();
    }
  }

  @Bind()
  handleDragStart(flag) {
    this.setState({
      startDrag: flag,
    });
  }

  // 二分查找算法

  @Bind()
  querySheetList(activeKey) {
    getSheetList().then((result) => {
      if (getResponse(result)) {
        const data = result?.content ?? [];
        this.setState({
          sheetList: data,
          setting: false,
          showModal: false,
          activeTab: activeKey ? activeKey : data.length ? data[0].headerId : '',
        });
        this.queryLayoutList(activeKey ? activeKey : data.length ? data[0].headerId : '');
      }
    });
  }

  @Bind()
  deleteQuerySheet() {
    getSheetList().then((result) => {
      if (getResponse(result)) {
        const data = result?.content ?? [];
        this.setState({
          sheetList: data,
          activeTab: data.length ? data[0].headerId : '',
        });
        this.queryLayoutList(data.length ? data[0].headerId : '');
      }
    });
  }

  /**
   * 查询不加详情
   */
  @Bind()
  queryLayoutList(id) {
    const { setting } = this.state;

    if (setting) {
      this.queryCardTextList('', id);
    }
    this.getLayoutList(id); // 查询卡片列表
  }

  @Bind()
  queryTempLayoutList(id, type) {
    this.setState(
      {
        readCards: [],
      },
      () => {
        if (type === 'edit') {
          queryCardId = id;
          this.queryCardTextList('', id);
        }
      }
    );
  }

  querySetList = () => {
    queryIdpValue('SDAT.REPORT_CARD_GROUP').then((res) => {
      if (getResponse(res)) {
        this.setState({ groupList: res || [] });
      }
    });
  };

  /**
   * 右侧可选的布局列表
   * @param {*} text
   */
  queryCardTextList = (text, id) => {
    fetchReadyCards({
      name: text,
      cockpitHeaderId: !id ? '' : queryCardId ?? id,
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({ readCards: res?.content ?? [] });
      }
    });
  };

  /**
   * 当前模板配置的卡片列表
   * @returns
   */
  @Bind()
  async getTempLayoutList(id) {
    const { titleContext } = this.state;
    let list = [];

    if (!id && id !== 0) {
      this.setState(
        {
          loading: false,
          layout: [],
          currentCards: [],
          cards: [],
          headerObj: {},
          headerId: '',
        },
        () => {
          drawPanelWidth =
            document.getElementById('menu-card-report-config-container')?.offsetWidth ?? 0; // 获取画板宽度
        }
      );
      return;
    }

    if (id == 0) return false;

    // 查询但sheet详情信息
    const res = await getHeaderLayout({ headerId: id });
    queryCardId = res.headerId;

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
          drawPanelWidth =
            document.getElementById('menu-card-report-config-container')?.offsetWidth ?? 0; // 获取画板宽度
          this.forceUpdate();
        }
      );
    } else {
      this.setState({
        currentCards: [],
        storageList: [],
        titleContext:
          titleContext || intl.get('sdat.reportConfig.view.title.customView').d('未命名驾驶舱'),
        headerId: id,
        headerObj: { headerId: id },
      });
    }
  }

  /**
   * 当前配置的卡片列表
   * @returns
   */
  @Bind()
  async getLayoutList(id) {
    const { titleContext } = this.state;
    let list = [];

    if (!id && id !== 0) {
      this.setState(
        {
          loading: false,
          layout: [],
          currentCards: [],
          cards: [],
          headerObj: {},
          headerId: '',
        },
        () => {
          drawPanelWidth =
            document.getElementById('menu-card-report-config-container')?.offsetWidth ?? 0; // 获取画板宽度
          this.forceUpdate();
        }
      );
      return;
    }

    if (id == 0) return false;

    // 查询但sheet详情信息
    const res = await getHeaderLayout({ headerId: id });
    queryCardId = res.headerId;
    cacheLayouts = [];

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
          drawPanelWidth =
            document.getElementById('menu-card-report-config-container')?.offsetWidth ?? 0; // 获取画板宽度
          this.forceUpdate();
        }
      );
    } else {
      this.setState({
        currentCards: [],
        storageList: [],
        titleContext:
          titleContext || intl.get('sdat.reportConfig.view.title.customView').d('未命名驾驶舱'),
        headerId: id,
        headerObj: { headerId: id },
      });
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
    const { layout, currentCards, headerObj, sheetName } = this.state;

    if (!saveKey) {
      return;
    }

    const continueSaveLayout = async () => {
      if (layout) {
        saveKey = false;
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

        const para =
          headerObj.ownerUserId < 0
            ? {
                ...cacheHeaderObj,
                cockpitName: '',
              }
            : { ...headerObj };

        if (saveParams.length) {
          saveParams.forEach((item) => {
            item.height = item.h;
            item.width = item.w;
            item.cockpitHeaderId = para?.headerId ?? '';
            item.recordStatus = 'create';
            item.objectVersionNumber =
              item.recordStatus === 'create' || headerObj.ownerUserId < 0
                ? null
                : _self.getCardField(item.cardId, 'objectVersionNumber');
            item.initSize = `${item.w}#${item.h}`;
            item.lineId =
              item.recordStatus === 'create' || headerObj.ownerUserId < 0
                ? null
                : _self.getCardField(item.cardId, 'lineId');
            item._token =
              item.recordStatus === 'create' || headerObj.ownerUserId < 0
                ? null
                : _self.getCardField(item.cardId, '_token');
            item.updateby =
              headerObj.ownerUserId < 0 ? '' : _self.getCardField(item.cardId, 'updateby');
            item.lastUpdateDate =
              headerObj.ownerUserId < 0 ? '' : _self.getCardField(item.cardId, 'lastUpdateDate');
            item.tenantId =
              headerObj.ownerUserId < 0 ? '' : _self.getCardField(item.cardId, 'tenantId');
          });
        }
        // const saveIds = saveParams.map((item) => item.cardId);
        const deleteList = [...originalList];
        // const copyList = cloneDeep(originalList);

        // if (copyList.length) {
        //   deleteList = copyList.filter((item) => !saveIds.includes(item.cardId)); // 删除的数据
        // }

        if (deleteList.length) {
          deleteList.forEach((item) => {
            item.recordStatus = 'delete';
          });
        }

        const dsList = this.ds2.toData();
        const obj = dsList.length ? dsList[0] : {};

        const tls = {
          cockpitName: {
            zh_CN:
              obj.cockpitName ||
              intl.get('sdat.reportConfig.view.title.customView').d('未命名驾驶舱'),
            en_US: '',
            vi_VN: '',
            ja_JP: '',
            ru_RU: '',
            th_TH: '',
          },
        };

        if (cacheLayouts.length) {
          cacheLayouts.forEach((item) => {
            item.recordStatus = 'delete';
          });
        }

        const saveList = [...saveParams, ...deleteList, ...cacheLayouts];
        // 去重数据
        const uniqueList = this.uniqueSaveList(saveList);

        if (para && para.headerId == 0) return false;

        // 获取最新的版本号
        const lastHeader = await getHeaderLayout({ headerId: para.headerId });
        const localSheetName = lastHeader.sheetName
          ? lastHeader.sheetName
          : sheetName || intl.get('sdat.reportConfig.view.title.defaultSheetName').d('新建驾驶舱');

        fetchSaveHeader({
          ...para,
          cockpitName: '',
          sheetName: ['新建驾驶舱', ''].includes(localSheetName)
            ? tls?.cockpitName?.zh_CN ?? ''
            : localSheetName,
          headerId: para.headerId || '',
          objectVersionNumber:
            lastHeader && lastHeader.objectVersionNumber
              ? lastHeader.objectVersionNumber
              : para.objectVersionNumber,
          _token: lastHeader && lastHeader._token ? lastHeader._token : para._token,
          lastUpdateDate:
            lastHeader && lastHeader.lastUpdateDate
              ? lastHeader.lastUpdateDate
              : para.lastUpdateDate,
          lines: uniqueList,
          _tls: obj._tls ? obj._tls : tls,
        })
          .then((res) => {
            saveKey = true;
            if (getResponse(res)) {
              notification.success();
              cacheLayouts = [];
              _self.originLayout = layout;
              _self.originCurrentCards = currentCards;
              this.querySheetList(res?.headerId ?? '');
              _self.setState(
                {
                  setting: false,
                  showModal: false,
                },
                () => {
                  drawPanelWidth =
                    document.getElementById('menu-card-report-config-container')?.offsetWidth ?? 0; // 获取画板宽度
                  _self.forceUpdate();
                }
              );
              this.loadCards(this.originLayout);
            }
          })
          .catch(() => {
            saveKey = true;
            this.loadCards(this.originLayout);
          });
      }
    };

    if (cacheLayouts && cacheLayouts.length) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl
              .get('sdat.reportConfig.view.selectTemp.cover')
              .d('模板内容保存后会替换当前驾驶舱所选卡片，请确认是否保存?')}
          </div>
        ),
      }).then((button) => {
        if (button === 'ok') {
          continueSaveLayout();
        }
      });
    } else {
      continueSaveLayout();
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
   * 校验数据是否发生改变
   *
   * @return {boolean} 不相同返回 true
   */
  @Bind()
  checkDataIsChange() {
    const { headerObj, layout } = this.state;
    const localHeader = this.ds2?.toData()[0] ?? {};

    if (
      headerObj.headerId !== localHeader.headerId ||
      headerObj.cockpitName !== localHeader.cockpitName
    ) {
      return true; // 头发生更改
    }

    return this.checkBothArray(originalList, layout);
  }

  /**
   * 比较两个数组是否相同
   * @param {*} original 原始数据
   * @param {*} local 当前数据
   *
   * @return {boolean} 不相同返回 true
   */
  @Bind()
  checkBothArray(original, local) {
    if (original.length !== local.length) {
      return true;
    }

    if (original.length && local.length) {
      original.forEach((item) => {
        let isContained = false; // 原始 id 是否在当前数据里面存在，不存在即数据发生改变
        local.forEach((item2) => {
          if (item.cardId === item2.i) {
            if (
              item.w === item2.w &&
              item.h === item2.h &&
              item.x === item2.x &&
              item.y === item2.y
            ) {
              isContained = true;
            }
          }
        });

        if (!isContained) {
          return true;
        }
      });
    }

    return false;
  }

  /**
   * 编辑sheet页名称
   */
  @Bind()
  handleEditTab(e, headerId, text = '') {
    e.stopPropagation();
    e.preventDefault();

    const { activeTab } = this.state;
    sheetEditMap[headerId] = true;
    const keyMap = Object.keys(sheetEditMap);

    if (keyMap.length) {
      keyMap.forEach((item) => {
        sheetEditMap[item] = item === headerId;
      });
    }

    this.setState(
      {
        refresh: this.state.refresh,
      },
      () => {
        this.setState({
          sheetName:
            text || intl.get('sdat.reportConfig.view.title.defaultSheetName').d('新建驾驶舱'),
        });

        if (headerId === activeTab) return;
        this.handleSelectTab(headerId);
      }
    );
  }

  @Bind()
  inputSheetName(e) {
    this.setState({
      sheetName: e?.target?.value ?? '',
    });
  }

  @Bind()
  async handleSaveSheetName(headerId) {
    const { headerObj } = this.state;
    const keyMap = Object.keys(sheetEditMap);
    if (keyMap.length) {
      keyMap.forEach((item) => {
        sheetEditMap[item] = false;
      });
    }
    this.setState({
      refresh: this.state.refresh,
    });

    const dsList = this.ds2.toData();
    const obj = dsList.length ? dsList[0] : {};

    const tls = {
      cockpitName: {
        zh_CN:
          obj.cockpitName || intl.get('sdat.reportConfig.view.title.customView').d('未命名驾驶舱'),
        en_US: '',
        vi_VN: '',
        ja_JP: '',
        ru_RU: '',
        th_TH: '',
      },
    };

    if (headerId == 0) return false;

    // 获取最新的版本号
    const lastHeader = await getHeaderLayout({ headerId });

    fetchSaveHeader({
      ...headerObj,
      cockpitName: '',
      sheetName: this.state.sheetName,
      headerId: headerId || '',
      lines: [],
      objectVersionNumber:
        lastHeader && lastHeader.objectVersionNumber
          ? lastHeader.objectVersionNumber
          : headerObj.objectVersionNumber,
      _token: lastHeader && lastHeader._token ? lastHeader._token : headerObj._token,
      lastUpdateDate:
        lastHeader && lastHeader.lastUpdateDate
          ? lastHeader.lastUpdateDate
          : headerObj.lastUpdateDate,
      _tls: obj._tls ? obj._tls : tls,
    }).then((res) => {
      if (getResponse(res)) {
        this.setState(
          {
            sheetName: '',
          },
          () => {
            getSheetList().then((result) => {
              if (getResponse(result)) {
                const data = result?.content ?? [];
                this.setState({
                  sheetList: data,
                });
              }
            });
          }
        );
      }
    });
  }

  /**
   * 切换sheet页
   * @param {*} headerId
   * @param {*} index
   * @returns
   */
  @Bind()
  handleSelectTab(headerId) {
    const { activeTab, setting } = this.state;

    if (headerId === activeTab) return;

    const keyMap = Object.keys(sheetEditMap);
    if (keyMap.length) {
      keyMap.forEach((item) => {
        sheetEditMap[item] = false;
      });
    }
    this.setState({
      refresh: this.state.refresh,
    });

    const continueToggle = () => {
      this.setState(
        {
          showModal: false,
          activeTab: headerId,
        },
        () => {
          this.queryLayoutList(headerId);
        }
      );
    };

    if (setting) {
      const isChange = this.checkDataIsChange();
      if (isChange) {
        // 发生改变
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <div>
              {intl
                .get('sdat.reportConfig.view.message.saveConfirm')
                .d('检测到当前数据已改动，请确认是否保存当前数据？')}
            </div>
          ),
        }).then((button) => {
          if (button === 'ok') {
            this.changeTabSaveLayout('', headerId, 'change'); // 切换tab保存当前数据
          } else {
            continueToggle();
          }
        });
      } else {
        continueToggle();
      }
    } else {
      continueToggle();
    }
  }

  /**
   * 保存布局
   */
  @Bind()
  async changeTabSaveLayout(newTab, activeId, type) {
    const _self = this;
    const { layout, currentCards, headerObj, sheetName } = this.state;

    if (!saveKey) {
      return;
    }

    const continueSave = async () => {
      if (layout) {
        saveKey = false;
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

        const para =
          headerObj.ownerUserId < 0
            ? {
                ...cacheHeaderObj,
                cockpitName: '',
              }
            : { ...headerObj };

        if (saveParams.length) {
          saveParams.forEach((item) => {
            item.height = item.h;
            item.width = item.w;
            item.cockpitHeaderId = para?.headerId ?? '';
            item.recordStatus = 'create';
            item.objectVersionNumber =
              item.recordStatus === 'create' || headerObj.ownerUserId < 0
                ? null
                : _self.getCardField(item.cardId, 'objectVersionNumber');
            item.initSize = `${item.w}#${item.h}`;
            item.lineId =
              item.recordStatus === 'create' || headerObj.ownerUserId < 0
                ? null
                : _self.getCardField(item.cardId, 'lineId');
            item._token =
              item.recordStatus === 'create' || headerObj.ownerUserId < 0
                ? null
                : _self.getCardField(item.cardId, '_token');
            item.updateby =
              headerObj.ownerUserId < 0 ? '' : _self.getCardField(item.cardId, 'updateby');
            item.lastUpdateDate =
              headerObj.ownerUserId < 0 ? '' : _self.getCardField(item.cardId, 'lastUpdateDate');
            item.tenantId =
              headerObj.ownerUserId < 0 ? '' : _self.getCardField(item.cardId, 'tenantId');
          });
        }

        // const saveIds = saveParams.map((item) => item.cardId);
        const deleteList = [...originalList];
        // const copyList = cloneDeep(originalList);
        // if (copyList.length) {
        //   deleteList = copyList.filter((item) => !saveIds.includes(item.cardId)); // 删除的数据
        // }

        if (deleteList.length) {
          deleteList.forEach((item) => {
            item.recordStatus = 'delete';
          });
        }

        const dsList = this.ds2.toData();
        const obj = dsList.length ? dsList[0] : {};

        const tls = {
          cockpitName: {
            zh_CN:
              obj.cockpitName ||
              intl.get('sdat.reportConfig.view.title.customView').d('未命名驾驶舱'),
            en_US: '',
            vi_VN: '',
            ja_JP: '',
            ru_RU: '',
            th_TH: '',
          },
        };

        if (cacheLayouts.length) {
          cacheLayouts.forEach((item) => {
            item.recordStatus = 'delete';
          });
        }

        const saveList = [...saveParams, ...deleteList, ...cacheLayouts];
        // 去重数据

        const uniqueList = this.uniqueSaveList(saveList);

        if (para && para.headerId == 0) return false;

        // 获取最新的版本号
        const lastHeader = await getHeaderLayout({ headerId: para.headerId });
        const localSheetName = lastHeader.sheetName
          ? lastHeader.sheetName
          : sheetName || intl.get('sdat.reportConfig.view.title.defaultSheetName').d('新建驾驶舱');

        fetchSaveHeader({
          ...para,
          cockpitName: '',
          sheetName: ['新建驾驶舱', ''].includes(localSheetName)
            ? tls?.cockpitName?.zh_CN ?? ''
            : localSheetName,
          headerId: para.headerId || '',
          lines: uniqueList,
          objectVersionNumber:
            lastHeader && lastHeader.objectVersionNumber
              ? lastHeader.objectVersionNumber
              : para.objectVersionNumber,
          _token: lastHeader && lastHeader._token ? lastHeader._token : para._token,
          lastUpdateDate:
            lastHeader && lastHeader.lastUpdateDate
              ? lastHeader.lastUpdateDate
              : para.lastUpdateDate,
          _tls: obj._tls ? obj._tls : tls,
        })
          .then((res) => {
            saveKey = true;
            if (getResponse(res)) {
              if (type === 'change') {
                this.setState(
                  {
                    showModal: false,
                    activeTab: newTab ? newTab : activeId,
                  },
                  () => {
                    // 从新建页面切换 重新查询 sheet 页列表
                    getSheetList().then((result) => {
                      if (getResponse(result)) {
                        const data = result?.content ?? [];
                        this.setState(
                          {
                            sheetList: data,
                          },
                          () => {
                            this.queryLayoutList(newTab ? newTab : activeId);
                          }
                        );
                      }
                    });
                  }
                );
              }

              // 新增tab页， 保存当前tab页内容，重新查询sheet列表，在新增前端sheet页
              if (type === 'create') {
                this.createNewTab();
              }
            }
          })
          .catch(() => {
            saveKey = true;
            this.loadCards(this.originLayout);
          });
      }
    };

    if (cacheLayouts && cacheLayouts.length) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl
              .get('sdat.reportConfig.view.selectTemp.cover')
              .d('模板内容保存后会替换当前驾驶舱所选卡片，请确认是否保存?')}
          </div>
        ),
      }).then((button) => {
        if (button === 'ok') {
          continueSave();
        }
      });
    } else {
      continueSave();
    }
  }

  /**
   * 选择模板
   */
  @Bind()
  handleSelectTemp(id, type) {
    if (!id) return;
    this.handleDragStart(true);
    this.getTempLayoutList(id); // 查询卡片列表
    this.setState(
      {
        showModal: type === 'view',
        layout: [],
        currentCards: [],
        cards: [],
        headerObj: {},
        headerId: '',
      },
      () => {
        this.queryTempLayoutList(id, type);
      }
    );
  }

  /**
   * 编辑对应的模板 设置不加
   */
  @Bind()
  async startSettingLayout(e, headerId) {
    const res = await getOrderStatus();
    if (res && typeof res === 'boolean') {
      this.setState(
        {
          setting: true,
        },
        () => {
          drawPanelWidth =
            document.getElementById('menu-card-report-config-container')?.offsetWidth ?? 0; // 获取画板宽度
          this.queryLayoutList(headerId);
        }
      );
    } else {
      notification.warning({
        message: intl.get('hzero.common.notification.failed').d('操作失败'),
        description: intl
          .get('sdat.reportConfig.view.message.notOpenOrder')
          .d('您未开通驾驶舱服务或服务已过期，请联系管理员。'),
      });
      return false;
    }
  }

  /**
   * 取消设置布局状态
   */
  @Bind()
  cancelSettingLayout(headerId) {
    this.setState(
      {
        showModal: false,
        setting: false,
        headerObj: {},
        headerId: '',
        layout: [],
        currentCards: [],
        cards: [],
        titleContext: '',
        startDrag: false,
      },
      () => {
        this.ds2.data = [];
        this.querySheetList('');
        this.queryLayoutList(headerId);
      }
    );
  }

  /**
   * 删除视图
   * @param {*} headerId
   */
  @Bind()
  deleteTempLayout(headerId) {
    const { headerObj } = this.state;

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <div>
          {intl.get('sdat.reportConfig.view.message.deleteViewConfirm').d('是否确认删除当前视图')}
        </div>
      ),
    }).then((button) => {
      if (button === 'ok') {
        fetchDeleteLayout({
          headerId,
          ...headerObj,
        }).then((res) => {
          if (getResponse(res)) {
            this.deleteQuerySheet();
          }
        });
      }
    });
  }

  /**
   * 打开模板选择弹窗
   */
  @Bind()
  openTempListModal() {
    const { layout, headerObj } = this.state;
    cacheLayouts = [...layout];
    cacheHeaderObj = { ...headerObj };

    this.setState({
      showModal: true,
    });
  }

  @Bind()
  handleCloseModal() {
    this.setState({
      showModal: false,
    });
    this.queryCardTextList('', queryCardId);
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
   * 将 卡片 加载成 layout
   */
  @Bind()
  loadCards(layouts = []) {
    const layout = [].concat(layouts);
    let cards = [];

    cards = layout.map((card) => {
      if (!card) {
        return null;
      }

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
                loading="lazy"
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
          x: pos.x || 0,
          y: pos.y || 0,
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

  /**
   * 新建操作先保存一个新tab页
   */
  @Bind()
  createNewTab() {
    const tls = {
      cockpitName: {
        zh_CN: intl.get('sdat.reportConfig.view.title.customView').d('未命名驾驶舱'),
        en_US: '',
        vi_VN: '',
        ja_JP: '',
        ru_RU: '',
        th_TH: '',
      },
    };

    fetchSaveHeader({
      cockpitName: intl.get('sdat.reportConfig.view.title.customView').d('未命名驾驶舱'),
      sheetName: intl.get('sdat.reportConfig.view.title.defaultSheetName').d('新建驾驶舱'),
      headerId: '',
      lines: [],
      _tls: tls,
    })
      .then((res) => {
        if (getResponse(res)) {
          queryCardId = '';
          cacheLayouts = [];
          this.setState(
            {
              activeTab: res?.headerId ?? '',
              setting: true,
              showModal: false,
              layout: [],
              cards: [],
              currentCards: [],
              storageList: [],
              titleContext: '',
              headerObj: {},
            },
            () => {
              drawPanelWidth =
                document.getElementById('menu-card-report-config-container')?.offsetWidth ?? 0; // 获取画板宽度
              this.queryCardTextList('', res?.headerId ?? '');
              getSheetList().then((result) => {
                if (getResponse(result)) {
                  const data = result?.content ?? [];
                  this.setState({
                    sheetList: data,
                  });
                  this.queryLayoutList(res?.headerId ?? '');
                }
              });
            }
          );
          this.loadCards([]);
        }
      })
      .catch(() => {
        this.loadCards([]);
      });
  }

  /**
   * 新增 tab 页
   * 置为编辑状态、清空headerId、清空布局数据
   */
  @Bind()
  async handleCreateTab() {
    const { activeTab, setting } = this.state;

    const res = await getOrderStatus();
    if (typeof res === 'boolean' && !res) {
      notification.warning({
        message: intl.get('hzero.common.notification.failed').d('操作失败'),
        description: intl
          .get('sdat.reportConfig.view.message.notOpenOrder')
          .d('您未开通驾驶舱服务或服务已过期，请联系管理员。'),
      });
      return false;
    }

    const continueToggle = () => {
      this.createNewTab();
    };

    if (setting) {
      const isChange = this.checkDataIsChange();

      if (isChange) {
        // 发生改变
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <div>
              {intl
                .get('sdat.reportConfig.view.message.saveConfirm')
                .d('检测到当前数据已改动，请确认是否保存当前数据？')}
            </div>
          ),
        }).then((button) => {
          if (button === 'ok') {
            // 切换tab保存当前数据
            this.changeTabSaveLayout('', activeTab, 'create');
          } else {
            continueToggle();
          }
        });
      } else {
        continueToggle();
      }
    } else {
      continueToggle();
    }
  }

  /**
   * 鼠标上移
   * @param {*} headerId
   */
  @Bind()
  sheetMouseEnter(headerId) {
    mouseEventMap[headerId] = true;
    this.setState({ refresh: !this.state.refresh });
  }

  /**
   * 鼠标移出
   * @param {*} headerId
   */
  @Bind()
  sheetMouseLeave(headerId) {
    mouseEventMap[headerId] = false;
    this.setState({ refresh: !this.state.refresh });
  }

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
      sheetList,
      activeTab,
      sheetMax,
      showModal,
      headerObj,
      startDrag,
      sheetName,
    } = this.state;

    const modalWidth = document.getElementById('menu-card-select-col-5')?.clientWidth ?? 306;

    return (
      <Spin spinning={loading}>
        <div
          style={{
            position: 'relative',
            height: 'calc(100vh - 89px)',
            overflow: 'hidden',
          }}
        >
          <div className={styles['report-config-header']}>
            {setting || showModal ? (
              <span className={styles['page-header-back-btn']}>
                <span className={styles['page-header-back-btn-icon']}>
                  <Tooltip title={intl.get('hzero.common.button.back').d('返回')}>
                    <Icon type="arrow_back" onClick={() => this.cancelSettingLayout(activeTab)} />
                  </Tooltip>
                </span>
                <span style={{ marginLeft: '10px' }}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </span>
              </span>
            ) : null}

            <div
              style={{
                textAlign: 'center',
                lineHeight: '44px',
              }}
            >
              {setting ? (
                <Form
                  dataSet={this.ds2}
                  columns={1}
                  style={{
                    width: '420px',
                    margin: '0 auto',
                    display: 'inline-block',
                    verticalAlign: 'middle',
                  }}
                >
                  <IntlField
                    name="cockpitName"
                    placeholder={intl
                      .get('sdat.reportConfig.view.title.customView')
                      .d('自定义看板')}
                  />
                </Form>
              ) : (
                <span
                  style={{
                    fontSize: '18px',
                    color: '#1D2129',
                    fontWeight: '500',
                  }}
                >
                  {titleContext}
                </span>
              )}
            </div>

            {loading !== true && (headerId || setting) && (
              <div
                style={{
                  display: 'inline-block',
                  position: 'absolute',
                  right: '1px',
                  top: '8px',
                }}
              >
                {setting || showModal ? (
                  <>
                    <Button
                      color="primary"
                      icon="save"
                      // funcType="flat"
                      style={{
                        ...buttonStyle,
                        border: 'none',
                      }}
                      onClick={this.saveLayout}
                    >
                      {intl.get('hzero.common.button.save').d('保存')}
                    </Button>
                    {showModal ? (
                      <Button
                        color="default"
                        style={{
                          ...buttonStyle,
                          border: 'none',
                        }}
                        icon="return"
                        onClick={this.handleCloseModal}
                      >
                        {intl.get('sdat.reportConfig.view.button.rtnSelectCard').d('返回选择卡片')}
                      </Button>
                    ) : (
                      <Button
                        style={{
                          ...buttonStyle,
                          border: 'none',
                        }}
                        color="default"
                        icon="auto_awesome_mosaic-2"
                        onClick={this.openTempListModal}
                      >
                        {intl.get('sdat.reportConfig.button.referenceTemplate').d('选择模板')}
                      </Button>
                    )}
                    <Button
                      style={{ float: 'right', border: 'none' }}
                      color="default"
                      icon="close"
                      disabled={
                        !(
                          headerId &&
                          headerObj.tenantId &&
                          headerObj.tenantId !== 0 &&
                          sheetList.length > 1
                        )
                      }
                      onClick={() => this.deleteTempLayout(activeTab)}
                    >
                      {intl.get('sdat.reportConfig.button.deleteView').d('删除')}
                    </Button>
                  </>
                ) : (
                  <Button
                    icon="drive_file_rename_outline-o"
                    color="default"
                    style={{
                      ...setLayoutButtonStyle,
                      border: 'none',
                    }}
                    onClick={(e) => this.startSettingLayout(e, activeTab)}
                  >
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </Button>
                )}
              </div>
            )}
          </div>
          <Content
            noCard
            style={{
              ...pageContentStyle,
              position: 'relative',
            }}
            ref={(ref) => {
              this.col5Ref = ref;
            }}
            className={styles['select-temp-col-5-modal-panel']}
          >
            <DndProvider backend={HTML5Backend}>
              <Row>
                <Col
                  span={setting || showModal ? 19 : 24}
                  id="menu-card-report-config-container"
                  style={{ paddingBottom: '10px' }}
                >
                  {!layout.length && setting && !showModal && !startDrag && (
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#868D9C',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 'calc(100vh - 140px)',
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <img src={noData} alt="noData" style={{ marginLeft: '35px' }} />
                      </div>
                      <div style={{ lineHeight: '22px', marginTop: '12px' }}>
                        {intl.get('sdat.reportConfig.view.title.canFast').d('您可以快速')}
                        <a onClick={this.openTempListModal}>
                          {intl.get('sdat.reportConfig.view.title.useTempLayout').d('选择模板')}
                        </a>
                      </div>
                      <div style={{ lineHeight: '22px' }}>
                        {intl
                          .get('sdat.reportConfig.view.title.selectTempToAdd')
                          .d('也可以拖拽右侧卡片添加至面板')}
                      </div>
                    </div>
                  )}
                  {!layout.length && !setting && !showModal && (
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#1D2129',
                        fontWeight: '500',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 'calc(100vh - 140px)',
                      }}
                    >
                      {intl
                        .get('sdat.reportConfig.view.title.firstAddCardMessage')
                        .d('您还没有添加任何卡片，请先点击下方“卡片配置”自定义驾驶舱吧～')}
                      <p style={{ marginTop: '24px' }}>
                        <Button
                          color="primary"
                          onClick={(e) => this.startSettingLayout(e, activeTab)}
                        >
                          {intl.get('sdat.reportConfig.view.button.reportConfig').d('卡片配置')}
                        </Button>
                      </p>
                    </div>
                  )}

                  {!layout.length && setting && showModal && (
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#868D9C',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 'calc(100vh - 140px)',
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <img src={noData} alt="noData" style={{ marginLeft: '35px' }} />
                      </div>
                      <div style={{ lineHeight: '22px', marginTop: '12px' }}>
                        {intl
                          .get('sdat.reportConfig.view.title.selectOrView')
                          .d('请在右侧选择模板')}
                      </div>
                      <div style={{ height: '22px', width: '1px' }} />
                    </div>
                  )}

                  {(layout.length || setting || showModal) &&
                    !(!layout.length && (setting || showModal) && !startDrag) && (
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
                  <Col span={5} id="menu-card-select-col-5">
                    <CardScrollComp
                      setting={setting}
                      headerId={queryCardId}
                      basicGroupList={groupList}
                      readCards={readCards}
                      onDragStart={this.handleDragStart}
                      queryCardTextList={this.queryCardTextList}
                    />
                  </Col>
                ) : null}
              </Row>
            </DndProvider>
            {setting && showModal && (
              <Modal
                title={intl.get('sdat.reportConfig.view.title.useTempLayout').d('选择模板')}
                drawer
                closable
                visible={showModal}
                footer={null}
                getContainer={this.col5Ref}
                onCancel={this.handleCloseModal}
                style={{
                  width: `${modalWidth}px`,
                  height: 'calc(100vh - 138px)',
                }}
              >
                <div className={styles['select-temp-panel']}>
                  <TemplateSelectModal
                    headerId={headerId}
                    cacheLayouts={cacheLayouts}
                    onSelectTemp={this.handleSelectTemp}
                  />
                </div>
              </Modal>
            )}
          </Content>
          <div
            style={{
              position: 'absolute',
              bottom: '0px',
              left: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {sheetList.map((item) => {
              return (
                <span
                  key={item.headerId}
                  className={styles['report-card-layout-tab']}
                  style={{
                    border:
                      activeTab === item.headerId
                        ? `1px solid ${colorCode || '#29BECE'}`
                        : '1px solid rgba(0, 0, 0, 0.08)',
                    color: activeTab === item.headerId ? `${colorCode || '#29BECE'}` : '#000',
                  }}
                  onClick={() => this.handleSelectTab(item.headerId)}
                  onMouseEnter={() => this.sheetMouseEnter(item.headerId)}
                  onMouseLeave={() => this.sheetMouseLeave(item.headerId)}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      maxWidth: '80px',
                      height: '30px',
                      lineHeight: '30px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      margin: setting ? '0 5px 0 12px' : '0 12px',
                    }}
                  >
                    {sheetEditMap[item.headerId] ? (
                      <>
                        <TextField
                          isFlat
                          autoFocus
                          border={false}
                          value={sheetName}
                          onInput={this.inputSheetName}
                          onBlur={() => this.handleSaveSheetName(item.headerId)}
                        />
                        <span
                          style={{
                            width: '28px',
                            display: 'inline-block',
                          }}
                        />
                      </>
                    ) : (
                      <Tooltip
                        title={
                          item.sheetName ||
                          intl.get('sdat.reportConfig.view.title.defaultSheetName').d('新建驾驶舱')
                        }
                      >
                        <span
                          style={{
                            height: '30px',
                            lineHeight: '30px',
                            display: 'inline-block',
                            maxWidth: '80px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            wordBreak: 'break-all',
                          }}
                        >
                          {item.sheetName ||
                            intl
                              .get('sdat.reportConfig.view.title.defaultSheetName')
                              .d('新建驾驶舱')}
                        </span>
                      </Tooltip>
                    )}
                  </span>

                  {setting ? (
                    <span>
                      {mouseEventMap[item.headerId] &&
                      !sheetEditMap[item.headerId] &&
                      activeTab === item.headerId ? (
                        <Icon
                          type="drive_file_rename_outline-o"
                          style={{ width: '23px', fontSize: '14px', marginLeft: '5px' }}
                          onClick={(e) => this.handleEditTab(e, item.headerId, item.sheetName)}
                        />
                      ) : (
                        <span
                          style={{
                            width: '28px',
                            display: sheetEditMap[item.headerId] ? 'none' : 'inline-block',
                          }}
                        />
                      )}
                    </span>
                  ) : null}
                </span>
              );
            })}
            {sheetList.length < sheetMax ? (
              <span
                className={styles['report-card-layout-tab-add']}
                onClick={(e) => this.handleCreateTab(e)}
              >
                <Tooltip title={intl.get('sdat.reportConfig.view.tooltip.addTab').d('添加驾驶舱')}>
                  <Icon type="add" key="add" />
                </Tooltip>
              </span>
            ) : null}
          </div>
        </div>
      </Spin>
    );
  }
}
