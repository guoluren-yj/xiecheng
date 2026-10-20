/* eslint-disable no-param-reassign */
/**
 * PortalConfig - 门户配置
 * @date: 2021-06-23
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import React, { useContext, useMemo, useState, useRef, useEffect } from 'react';
import { Form, TextField, Icon, DataSet, ModalProvider, Spin, Select } from 'choerodon-ui/pro';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import {
  getResponse,
  getCurrentOrganizationId,
  getPlatformVersionApi,
  isTenantRoleLevel,
  setSession,
} from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
import { WidthProvider, Responsive } from 'react-grid-layout';
import { setSecureCookie } from 'srm-front-boot/lib/utils/utils';
import '../PortalManage/index.less';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Store } from './store';
import styles from './index.less';
import HeaderBtns from './HeaderBtns';
import { updateLayoutConfig } from '../../services/portalService';
import CardSettingDrawer from './components/CardSettingDrawer';
import LayoutSettingDrawer from './components/LayoutSettingDrawer';

const isTenant = isTenantRoleLevel();

const ReactGridLayout = WidthProvider(Responsive);
function PortalConfig() {
  const {
    match,
    location,
    layoutId,
    layoutInfo,
    setLayoutInfo,
    layoutFromDs,
    getGlobalLayout,
    cardSettingDsObject,
    diyCardList = [],
    loadCard,
    layout,
    setLayout,
    handleRemoveCard,
    layoutSettingDs,
    isEdit,
    isPreview,
    isGetPreview,
    isPublic,
    cardData,
    setCardData,
    loading,
    logo,
    setLogo,
    languageList,
    autoSave,
  } = useContext(Store);
  const Modal = ModalProvider.useModal();
  const { type } = querystring.parse(location.search.substr(1));
  const [celHeight, setCelHeight] = useState(1);
  const isStatic = useMemo(() => isPreview || isPublic || isGetPreview, [
    isPreview,
    isPublic,
    isGetPreview,
  ]);
  const [operateLoading, setOperateLoading] = useState(false);
  const [contentClass, setContentClass] = useState('portal-config-content');
  const [tenantId] = useState(getCurrentOrganizationId());
  const settingrRules = useMemo(() => tenantId === layoutInfo.tenantId && type !== 'view', [
    type,
    tenantId,
    layoutInfo,
  ]); // 是否有操作权限
  const [dragOrResize, setDragOrResize] = useState(false); // 区分图拽动作和点击动作
  const layoutLovCode = isTenant ? 'SPFM.PORTAL.LAYPUT.ORG.VIEW' : 'SPFM.PORTAL.LAYOUT.VIEW';
  const layoutOptionDs = useMemo(
    () =>
      new DataSet({
        // selection: 'single',
        autoQuery: !!isEdit,
        paging: true,
        pageSize: 100,
        primaryKey: 'layoutId',
        fields: [
          {
            name: 'layoutId',
            transformResponse: (_, object) => {
              return object.id;
            },
          },
        ],
        transport: {
          read() {
            return {
              url: `${SRM_PLATFORM}/v1/${getPlatformVersionApi('portal-layouts')}`,
              method: 'get',
              data: {
                lovCode: layoutLovCode,
                enabledFlag: 1,
              },
            };
          },
        },
      }),
    [isEdit]
  );

  /**
   * 页面横向溢出隐藏
   */
  const containerRef = useRef();
  useEffect(() => {
    if (containerRef && containerRef.current) {
      containerRef.current.parentNode.parentNode.parentNode.style.overflowX = 'hidden';
    }
  });

  useEffect(() => {
    if (autoSave) {
      handleSave();
    }
  }, [autoSave]);

  const onCancel = () => {
    loadCard([...diyCardList]);
    // 恢复上一次设置的logo
    const navData = diyCardList.filter(item => item.cardCategory === 'Nav')[0];
    if (navData && navData.cardContent.logo) {
      setLogo(navData.cardContent.logo);
    }
    return true;
  };

  /**
   * @function copyTemplateFromModal - 弹窗-引用模板
   */
  const copyTemplateFromModal = () => {
    Modal.open({
      drawer: true,
      title: intl.get('hptl.portalAssign.model.filed.referTemp').d('引用模板'),
      // key: Modal.key(),
      style: {
        width: 380,
      },
      children: (
        <Form record={layoutFromDs} labelLayout="float">
          <TextField name="layoutCode" />
          <TextField name="layoutName" />
          {/* <Lov name="layoutObject" /> */}
          <Select name="layoutObject" searchable options={layoutOptionDs} />
        </Form>
      ),
      onOk: async () => {
        // 校验模板设置
        const id = layoutFromDs.get('id');
        if (id) {
          getGlobalLayout(id);
        }
      },
      onCancel: () => {
        layoutFromDs.set('layoutObject', {});
      },
    });
  };

  /**
   * @function layoutSettingModal - 弹窗-模板设置
   */
  const layoutSettingModal = () => {
    Modal.open({
      title: intl.get('hptl.portalAssign.action.button.template.setting').d('模板设置'),
      // key: Modal.key(),
      drawer: true,
      style: {
        width: 742,
      },
      children: <LayoutSettingDrawer />,
      onCancel,
      onOk: async () => {
        // 校验模板设置
        const status = await layoutSettingDs.validate();
        return status;
      },
    });
  };

  /**
   * @function openCardSettingModal - 弹窗-卡片设置
   */
  const openCardSettingModal = () => {
    Modal.open({
      title: intl.get('hptl.portalAssign.model.title.cardsSetting').d('卡片设置'),
      // key: Modal.key(),
      drawer: true,
      style: {
        width: cardData.cardCategory === 'login' ? 380 : 742,
      },
      // children: props.children[1],
      children: <CardSettingDrawer />,
      onOk: updateCard,
      onCancel,
    });
  };

  /**
   * @function updateCard - 修改卡片 TODO:待整理
   */
  const updateCard = () => {
    const {
      cardCategory,
      cardCode,
      x,
      y,
      w,
      h,
      navLinkDs,
      bannerDs,
      loginDs,
      loginTypeDs,
      footerDs,
      title,
      icon,
      // languagePosition,
      defaultLanguage,
      useBrowserLanguage,
      backgroundColor,
      richText,
      footerRemarks,
      richTextObject,
      _tls,
      cardTitleStatus,
      cardContent,
      registerEnabledFlag,
      registerLink,
      accountLoginEnabledFlag,
      phoneLoginEnabledFlag,
      defaultLoginType,
      cardContentType,
      link,
    } = cardSettingDsObject.toData()[0];
    if (loginDs.length > 4) {
      notification.error({
        message: intl.get('hptl.portalAssign.model.login.link.max').d('链接配置最多4条'),
      });
      return false;
    }
    const newCard = {
      cardCategory,
      cardCode,
      i: cardCode,
      x,
      y,
      w,
      h,
      initFlag: 0,
      cardContent: {
        cardCode,
        title,
        icon,
        // languagePosition,
        defaultLanguage,
        useBrowserLanguage,
        logo,
        navList: navLinkDs,
        bannerList: bannerDs,
        loginList: loginDs,
        loginTypeList: loginTypeDs,
        footerList: footerDs,
        backgroundColor,
        content: richText,
        footerRemarks,
        richTextObject,
        _tls,
        cardTitleStatus,
        isStandardCard: cardContent.isStandardCard || false,
        languageList,
        registerEnabledFlag,
        registerLink,
        accountLoginEnabledFlag,
        phoneLoginEnabledFlag,
        defaultLoginType,
        cardContentType,
        link,
      },
    };
    const newList = diyCardList.map(item => {
      if (newCard.cardCategory === 'Login' && item.cardContent) {
        item.cardContent.registerEnabledFlag = registerEnabledFlag;
      }
      if (item.i === cardCode) {
        return newCard;
      } else {
        return item;
      }
    });
    loadCard([...newList]);
  };

  /**
   * @function getLayout 整合最新card文本配置 + 布局配置
   */
  const getLayout = () => {
    return diyCardList.map(item => {
      const { component, ...orther } = item;
      const card = layout.find(n => String(n.i) === item.i);
      const { x, y, w, h, i } = card;
      return {
        ...orther,
        cardCode: i,
        x,
        y,
        w,
        h,
      };
    });
  };

  /**
   * @function handleSave 保存布局
   */
  const handleSave = () => {
    const layoutParams = getLayout();
    const { _tls } = layoutSettingDs.toJSONData();
    const layoutName = layoutSettingDs.get('layoutName');
    const description = layoutSettingDs.get('description');
    const enabledFlag = layoutSettingDs.get('enabledFlag');
    const pageTitle = layoutSettingDs.get('pageTitle');
    const favicon = layoutSettingDs.get('pageFavicon');
    const params = {
      id: layoutId,
      objectVersionNumber: layoutInfo.objectVersionNumber,
      dataJson: JSON.stringify([...layoutParams]),
      layoutName,
      description,
      enabledFlag,
      pageTitle,
      favicon: (favicon && favicon.url) || '',
      logoUrl: (logo && logo.url) || '',
      _tls,
      // dataJson: layoutParams,
    };
    const data = tenantId === layoutInfo.tenantId ? { ...params, id: layoutId } : params;
    // 租户修改平台级模板时，无须传入模板ID
    setOperateLoading(true);
    updateLayoutConfig(data)
      .then(res => {
        if (getResponse(res)) {
          notification.success();
          setLayoutInfo({ ...layoutInfo, ...res });
          if (layoutParams && layoutParams.length) {
            const navConfig = layoutParams.find(item => item.cardCategory === 'Nav');
            if (navConfig) {
              const expires = new Date();
              expires.setTime(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
              setSecureCookie(
                'language',
                (navConfig.cardContent || {}).defaultLanguage || 'zh_CN',
                {
                  path: '/',
                  expires,
                }
              );
            }
          }
          getGlobalLayout();
        }
      })
      .finally(() => {
        setOperateLoading(false);
      });
  };

  /**
   * @function handlePreview 预览
   */
  const handlePreview = () => {
    const pubDiyCardList = getLayout();
    setSession('portalManagePreview', { layoutInfo, diyCardList: pubDiyCardList });
    window.open(`${window.$$env.BASE_PATH || '/'}pub/home`);
  };

  /**
   * 渲染卡片
   */
  const renderCard = useMemo(() => {
    return diyCardList.map(item => {
      // 页头页尾宽度放满
      const minW = item.cardCategory === 'Nav' || item.cardCategory === 'Footer' ? 24 : 1;
      const minH = item.cardCategory === 'Footer' ? 2 : 1;
      const grid = { x: item.x, y: item.y, w: item.w, h: item.h, minW, minH };
      if (isStatic || !settingrRules) {
        const blockStyle =
          isEdit && !settingrRules ? { pointerEvents: 'none', cursor: 'default' } : {};
        return (
          <div
            key={item.i}
            data-grid={grid}
            style={blockStyle}
            className={`item${item.cardCategory}`}
          >
            {item.component}
          </div>
        );
      }
      return (
        <div
          key={item.i}
          data-grid={grid}
          onClick={() => {
            // 是否为拖拽动作
            if (dragOrResize) {
              setDragOrResize(false);
              return;
            }
            setCardData(item);
            openCardSettingModal();
          }}
        >
          {item.component}
          <div className="index-dragCard" />
          {item.cardCategory !== 'Login' && (
            <Icon
              type="remove"
              className="remove-iconCard"
              onClick={e => {
                e.stopPropagation();
                handleRemoveCard(item.i);
              }}
            />
          )}
          <Icon type="settings" className="settings-iconCard" />
        </div>
      );
    });
  }, [layout, diyCardList, dragOrResize]);

  /**
   * 头部
   */
  const renderHeader = () => {
    const backPath =
      match.path === '/spfm/portal-layout/edit/:layoutId'
        ? '/spfm/portal-layout/list'
        : '/spfm/portal-manage/list';
    return (
      <Header
        backPath={backPath}
        title={
          settingrRules
            ? intl.get('hptl.portalAssign.view.option.setting').d('配置布局')
            : intl.get('hptl.portalAssign.view.option.checkLayout').d('查看布局')
        }
      >
        <HeaderBtns
          loadCard={loadCard}
          layoutId={layoutId}
          onSave={handleSave}
          loading={operateLoading}
          onPreview={handlePreview}
          settingrRules={settingrRules}
          onCopy={copyTemplateFromModal}
          getGlobalLayout={getGlobalLayout}
          onLayoutSetting={layoutSettingModal}
        />
      </Header>
    );
  };

  if (loading) {
    return <Spin spinning={loading} />;
  }

  return (
    <>
      {!isStatic && renderHeader()}
      <Content className={styles[contentClass]}>
        <div ref={containerRef}>
          <ReactGridLayout
            className={isStatic ? 'preview-layout' : ''}
            style={isStatic ? { position: 'inherit' } : {}}
            layouts={layout} // 布局数组-包含每个卡片的位置信息
            isDraggable={!isStatic && settingrRules} // 是否可拖拽
            autoSize={false} // 禁止容器高度自适应内容高度
            isResizable={!isStatic && settingrRules} // 是否可调整
            cols={{ lg: 24, md: 24, sm: 24, xs: 24, xxs: 24 }} // 当前布局分为多少列
            margin={[12, 12]} // 块之间的margin
            useCSSTransforms // 使用CSS3动画代替定位
            rowHeight={celHeight} // 每行静态高度
            verticalCompact // 垂直排列
            onLayoutChange={setLayout} // 拖动动作
            onDragStop={() => setDragOrResize(true)}
            // 隐藏滚动条
            onResizeStart={() => {
              setContentClass('portal-config-content-hidden');
            }}
            // 恢复滚动条
            onResizeStop={() => {
              setDragOrResize(true);
              setContentClass('portal-config-content');
            }}
            // 页面宽度变化时重新计算静态高度单位
            onWidthChange={containerWidth => {
              setCelHeight(containerWidth / 24 - 12);
            }}
          >
            {renderCard}
          </ReactGridLayout>
        </div>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['hptl.portalAssign', 'hzero.c7nProUI', 'hptl.common', 'srm.oauth'],
})(PortalConfig);
