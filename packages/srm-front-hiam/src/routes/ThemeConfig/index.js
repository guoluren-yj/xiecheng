/**
 * 主题配置
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @since: 2022-05-11 14:23:03
 * @description: 主题配置
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Icon, message, Spin } from 'choerodon-ui';
import { Button, ColorPicker, Form, ModalProvider, Tabs } from 'choerodon-ui/pro';
import chunk from 'lodash/chunk';
import { Header } from 'components/Page';
import request from 'utils/request';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, getPlatformVersionApi, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { SRM_HPFM } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import ThemePreview from './Preview';
import HistorysModal from './HistorysModal';
import AdvancedSetup from './AdvancedSetup';
import {
  computeColor,
  getIndex,
  DEFAULT_BACKGROUND,
  addIntlColor,
  initComponentColorList,
} from './util';

import styles from './index.less';

export const getIntlHtml = (data = '', separator, label) => {
  const result = data.split(separator);
  return (
    <span>
      {result[0]}
      {label}
      {result[1]}
    </span>
  );
};

export default formatterCollections({
  code: ['hiam.theme', 'theme.config'],
})(() => {
  const colorRgbaReg = /^[rR][gG][Bb][Aa]?\((\s*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)\s*,){2}\s*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)\s*,?\s*(0?\.\d{1,2}|1|0)?\s*\){1}$/;
  const colorHexReg = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3}|[0-9a-fA-F]{8})$/;
  const [tenantId] = useState(getCurrentOrganizationId());
  const [loading, setLoading] = useState(true);
  const [themeConfigInfo, setThemeConfigInfo] = useState({});
  const [themeFlag, setThemeFlag] = useState();
  const [densityType, setDensityType] = useState();
  const [lineWrap, setLineWrap] = useState();
  const [searchBarMode, setSearchBarMode] = useState();
  const [padType, setPadType] = useState();
  const [tempColor, setTempColor] = useState({});
  const [uuid, setUuid] = useState('');
  const [tempTheme, setTempTheme] = useState({});
  const [componentsEnum, setComponentsEnum] = useState([]);
  const ModalPro = ModalProvider.useModal();

  const {
    themeColorDTOList = [],
    colorCode = '',
    fileUrl = '',
    navColor = DEFAULT_BACKGROUND,
    themeComponentColorList = [],
  } = themeConfigInfo;

  useEffect(() => {
    // 获取uuid
    try {
      request(`${HZERO_FILE}/v1/${getPlatformVersionApi('files/uuid')}`, {
        method: 'POST',
      }).then(async (res) => {
        if (getResponse(res)) {
          const componentsRes = await getComponents();
          setUuid(res.content);
          setComponentsEnum(componentsRes);
          getThemeConfig(res.content, componentsRes);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  // 监听修改主题的弹窗的变化
  useEffect(() => {
    const { colorCode: code, oldCode, hidden } = tempTheme;
    if (code && hidden && isSameColor(code)) {
      setTempTheme({});
      const result = [];
      themeColorDTOList.forEach((item) => {
        result.push({
          ...item,
          colorCode: item.colorCode === oldCode ? code : item.colorCode,
        });
      });

      setThemeConfigInfo((preState) => ({
        ...preState,
        themeColorDTOList: result,
        colorCode: code,
      }));
      autoContrast(code, true);
    }
  }, [tempTheme, themeColorDTOList]);

  // 监听添加主题弹窗的变化
  useEffect(() => {
    const { colorCode: code, hidden } = tempColor;
    if (code && hidden && isSameColor(code)) {
      addTheme(tempColor);
      autoContrast(code, true);
      setTempColor({});
    }
  }, [tempColor, tenantId, themeColorDTOList]);

  const isSameColor = (code) => {
    const index = getIndex(code, themeColorDTOList);
    if (index !== -1) {
      const result = themeColorDTOList[index];
      setThemeConfigInfo((preState) => ({
        ...preState,
        colorCode: result.colorCode,
        themeColorId: result.themeColorId,
      }));
    }
    return true;
  };

  // 保存组件自定义颜色
  const saveComponentColorList = (type, color, newColor) => {
    setThemeConfigInfo((preState) => ({
      ...preState,
      themeComponentColorList: preState.themeComponentColorList.map((com) => {
        const data = { ...com };
        if (com.componentCode === type) {
          data.componentColor = color;
        }
        if (newColor && com.componentColor === color) {
          data.componentColor = newColor;
        }
        return data;
      }),
    }));
  };

  // 颜色差异度对比
  const autoContrast = (color, needAlternative) => {
    const { newColor, alternative } = computeColor(color);
    if (alternative && needAlternative) {
      openAlternativeModal(color, newColor);
    }
  };

  // 获取可配置组件
  const getComponents = async () => {
    try {
      const res = await request(
        `${SRM_HPFM}/v1/${getPlatformVersionApi('lovs/data?lovCode=HPFM.THEME.COMPONENT_COLOR')}`
      );
      if (getResponse(res)) {
        return res;
      }
      return [];
    } catch (error) {
      return [];
    }
  };

  // 获取租户配置信息
  const getThemeConfig = (uid, comEnum = []) => {
    try {
      request(`${SRM_HPFM}/v1/${getPlatformVersionApi('theme-config')}`).then((res) => {
        if (getResponse(res)) {
          const {
            navColor: nav,
            enableThemeConfig,
            pageStyleFormLayout,
            pageStyleTableDensity,
            pageStyleLineFeed,
            themeComponentColorList: comList,
            colorCode: color,
            fileUrl: file,
            searchbarDelayFlag,
          } = res;
          setThemeFlag(enableThemeConfig);
          setPadType(pageStyleFormLayout);
          setDensityType(pageStyleTableDensity);
          setLineWrap(pageStyleLineFeed);
          setSearchBarMode(searchbarDelayFlag || 0);
          setThemeConfigInfo({
            ...res,
            navColor: nav || DEFAULT_BACKGROUND,
            themeComponentColorList: initComponentColorList(comList, color, comEnum),
            fileList:
              file && uid
                ? [
                    {
                      uid,
                      name: file.split('@').slice(-1)[0],
                      url: file,
                    },
                  ]
                : [],
          });
        }
      });
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const addTheme = useCallback(
    ({ colorCode: value }) => {
      if (value) {
        if (!(colorRgbaReg.test(value) || colorHexReg.test(value))) {
          // setTempColor({});
          setThemeConfigInfo((preState) => ({
            ...preState,
            colorCode: '',
          }));
          notification.warning({
            message: intl
              .get('hiam.theme.view.color.validate.error')
              .d('色值不符合规范，请重新选择'),
          });
          return;
        }
        if (getIndex(value, themeColorDTOList) !== -1) {
          return;
        }
        setThemeConfigInfo((preState) => ({
          ...preState,
          themeColorDTOList: [...preState.themeColorDTOList, { tenantId, colorCode: value }],
        }));
      }
    },
    [tenantId, themeColorDTOList]
  );

  const removeTheme = useCallback(
    (e, data) => {
      if (e) {
        e.stopPropagation();
      }
      let enableColor = '';
      let enableColorId = 0;
      const enableList = [];
      themeColorDTOList.forEach((item) => {
        // 删除选中的自定义颜色时，去选中SRM默认颜色
        if (item.enableDefaultColor && colorCode === data) {
          enableColor = item.colorCode;
          enableColorId = item.themeColorId;
        }
        if (item.colorCode === data) {
          if (item.themeColorId) {
            enableList.push({ ...item, enableDeleteFlag: 1 });
          }
        } else {
          enableList.push({ ...item });
        }
      });
      setThemeConfigInfo((preState) => ({
        ...preState,
        colorCode: enableColor || colorCode,
        themeColorId: enableColorId || preState.themeColorId,
        themeColorDTOList: enableList,
      }));
    },
    [themeColorDTOList, colorCode]
  );

  const updateTheme = useCallback(
    (value, data) => {
      if (value) {
        if (!(colorRgbaReg.test(value) || colorHexReg.test(value))) {
          // 校验不通过，移除该颜色
          removeTheme('', data.colorCode);
          notification.warning({
            message: intl
              .get('hiam.theme.view.color.validate.error')
              .d('色值不符合规范，请重新选择'),
          });
          return;
        }
        const index = getIndex(value, themeColorDTOList);
        if (index !== -1) {
          setTempTheme((preState) => ({
            ...preState,
            colorCode: value,
            themeColorId: themeColorDTOList[index].themeColorId,
          }));
          return;
        }
        setTempTheme((preState) => ({
          ...data,
          colorCode: value,
          oldCode: preState.oldCode || data.colorCode,
          hidden: false,
        }));
      }
    },
    [themeColorDTOList]
  );

  const updateActiveTheme = useCallback(
    (e, data, needAlternative) => {
      e.stopPropagation();
      const { colorCode: code, themeColorId: id } = data;
      setThemeConfigInfo((preState) => ({ ...preState, colorCode: code, themeColorId: id }));
      saveComponentColorList(null, colorCode, code);
      if (colorCode !== code) {
        autoContrast(code, needAlternative);
      }
    },
    [colorCode]
  );

  const onAddHiddenChange = useCallback(
    (hidden) => {
      setTempColor((preState) => ({ ...preState, hidden }));
    },
    [tempColor]
  );

  const onCustomHiddenChange = useCallback(
    (hidden) => {
      setTempTheme((preState) => ({ ...preState, hidden }));
    },
    [themeColorDTOList, tempTheme]
  );

  const saveTempValue = useCallback((value) => {
    setTempColor((preState) => ({ ...preState, colorCode: value }));
    setThemeConfigInfo((preState) => ({
      ...preState,
      colorCode: value,
      themeColorId: null,
    }));
    return value;
  }, []);

  const onSave = (isClear = false) => {
    setLoading(true);
    try {
      let data = {};
      if (isClear) {
        let activeInfo = {};
        const customList = [];
        themeColorDTOList.forEach((item) => {
          if (item.enableDefaultColor) {
            activeInfo = item;
          }
          if (item.themeColorId) {
            customList.push({
              ...item,
              enableDeleteFlag: Number(!!item.tenantId),
            });
          }
        });

        data = {
          ...themeConfigInfo,

          enableThemeConfig: 1,
          pageStyleLineFeed: 0,
          pageStyleFormLayout: 75,
          pageStyleTableDensity: 'default',
          navApplicationThemeColor: 0,
          fileUrl: '',
          fontFileId: null,
          themeColorDTOList: customList.filter((item) => item.tenantId),
          colorCode: activeInfo.colorCode,
          themeColorId: activeInfo.themeColorId,
          enableResetFlag: 1,
          navColor: DEFAULT_BACKGROUND,
          themeComponentColorList: [],
          searchbarDelayFlag: searchBarMode || 0,
        };
      } else {
        data = {
          ...themeConfigInfo,
          enableThemeConfig: themeFlag,
          pageStyleFormLayout: padType,
          pageStyleTableDensity: densityType,
          pageStyleLineFeed: lineWrap,
          searchbarDelayFlag: searchBarMode || 0,
          themeColorDTOList: themeColorDTOList.filter((item) => item.tenantId),
        };
      }
      delete data.fileList;
      request(`${SRM_HPFM}/v1/${getPlatformVersionApi('theme-config')}`, {
        method: 'POST',
        body: data,
      }).then((res) => {
        if (getResponse(res)) {
          message.success(
            getIntlHtml(
              intl.get('hiam.theme.view.message.success.save').d('主题保存成功，请{refresh}查看'),
              '{refresh}',
              <a href={window.location.href}>{intl.get('hzero.common.button.refresh').d('刷新')}</a>
            ),
            undefined,
            undefined,
            'top'
          );
          getThemeConfig(uuid, componentsEnum);
        }
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
    }
  };

  const onReset = () => {
    ModalPro.open({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      bodyStyle: {
        padding: '0.1rem 0.24rem 0.4rem',
      },
      children: (
        <span>{intl.get('hzero.common.message.confirm.resetData').d('确定重置数据')}?</span>
      ),
      onOk: () => onSave(true),
      border: false,
    });
  };

  const openHistoryModal = () => {
    ModalPro.open({
      title: intl.get('hzero.common.status.history').d('操作记录'),
      className: styles['theme-config-history'],
      children: <HistorysModal />,
      drawer: true,
      okText: intl.get('hzero.common.btn.close').d('关闭'),
      cancelButton: false,
    });
  };

  const openAlternativeModal = (color, alternativeColor) => {
    const childrenIntl = intl
      .get('theme.config.message.confirm.alternative.content', {
        color: `__${color}__`,
        alternativeColor: `__${alternativeColor}__`,
      })
      .d(
        `该主题色__${color}__在界面表现对比度较低，不利于阅读；系统自动提升了该色值的对比度，生成了接近的色值__${alternativeColor}__， 是否替换？`
      );
    ModalPro.open({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      autoCenter: true,
      children: addIntlColor(childrenIntl),
      border: false,
      onOk: () => {
        setThemeConfigInfo((preState) => ({
          ...preState,
          colorCode: alternativeColor,
          themeColorDTOList: preState.themeColorDTOList.map((item) => {
            const data = { ...item };
            if (item.colorCode === color) {
              data.colorCode = alternativeColor;
            }
            return data;
          }),
        }));
      },
      okText: intl.get('theme.config.view.button.replace').d('替换'),
      cancelText: intl.get('theme.config.view.button.insist').d('使用当前主题'),
    });
  };

  const previewProps = useMemo(() => {
    const theme = tempTheme.colorCode || colorCode;
    let buttonColor = theme;
    let linkColor = theme;
    let tabColor = theme;
    themeComponentColorList.forEach((item) => {
      if (item.componentCode === 'BUTTON') {
        buttonColor = item.componentColor;
      }
      if (item.componentCode === 'LINK') {
        linkColor = item.componentColor;
      }
      if (item.componentCode === 'TAB') {
        tabColor = item.componentColor;
      }
    });
    return {
      themeFlag,
      padType,
      densityType,
      theme,
      navColor,
      buttonColor,
      linkColor,
      tabColor,
      fileUrl,
      lineWrap,
    };
  }, [
    tempTheme,
    colorCode,
    navColor,
    fileUrl,
    themeComponentColorList,
    themeFlag,
    padType,
    densityType,
    lineWrap,
  ]);

  const advancedSetupProps = useMemo(
    () => ({
      setThemeConfigInfo,
      themeConfigInfo,
      tempTheme,
      uuid,
      themeComponentColorList,
      saveComponentColorList,
    }),
    [themeConfigInfo, tempTheme, uuid, themeComponentColorList]
  );
  const themeConfigPaneProps = {
    themeColorDTOList,
    colorCode,
    tempColor,
    tempTheme,
    onAddHiddenChange,
    saveTempValue,
    updateActiveTheme,
    updateTheme,
    removeTheme,
    onCustomHiddenChange,
    advancedSetupProps,
  };
  let activeBorder = { borderColor: colorCode };
  if (!themeFlag) activeBorder = {};
  return (
    <Spin spinning={loading} wrapperClassName={styles['theme-config-spin']}>
      <Header title={intl.get('hiam.theme.view.title.header').d('主题与页面布局')}>
        <Button
          icon="save"
          color="primary"
          onClick={() => {
            onSave(false);
          }}
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Button icon="sync" funcType="flat" onClick={onReset}>
          {intl.get('hiam.theme.view.button.restore.default').d('恢复默认')}
        </Button>
        <Button icon="access_time_filled" funcType="flat" onClick={openHistoryModal}>
          {intl.get('hzero.common.status.history').d('操作记录')}
        </Button>
      </Header>
      <div className={styles['theme-container']}>
        <ThemePreview {...previewProps} />
        <div style={{ backgroundColor: 'white', padding: '20px', width: '280px' }}>
          <Tabs style={{ height: '100%' }} animated={false}>
            <Tabs.TabPane key="theme" tab={intl.get('hiam.theme.view.title.theme').d('主题')}>
              <div className="svg-pic-switcher">
                <div className="switcher-item" onClick={() => setThemeFlag(0)}>
                  <div
                    className={`switcher-item-pic old-theme-svg${themeFlag === 0 ? ' active' : ''}`}
                  />
                  <div className="switcher-item-text">
                    {intl.get('hiam.theme.view.title.oldTheme').d('老主题')}
                  </div>
                </div>
                <div className="switcher-item" onClick={() => setThemeFlag(1)}>
                  <div
                    className={`switcher-item-pic new-theme-svg${themeFlag === 1 ? ' active' : ''}`}
                    style={(themeFlag && activeBorder) || {}}
                  />
                  <div className="switcher-item-text">
                    {intl.get('hiam.theme.view.title.newTheme').d('新主题(推荐)')}
                  </div>
                </div>
              </div>
              {!!themeFlag && <ThemeConfigPane {...themeConfigPaneProps} />}
            </Tabs.TabPane>
            <Tabs.TabPane
              key="layout"
              tab={intl.get('hiam.theme.view.title.pageLayout').d('页面布局')}
            >
              <div className="setup-title" style={{ marginTop: 0 }}>
                {intl.get('hiam.theme.view.title.formLayout').d('表单布局')}
              </div>
              <div className="svg-pic-switcher">
                <div className="switcher-item" onClick={() => setPadType(100)}>
                  <div
                    className={`switcher-item-pic pad-100${padType === 100 ? ' active' : ''}`}
                    style={(padType === 100 && activeBorder) || {}}
                  />
                  <div className="switcher-item-text">
                    {intl.get('hiam.theme.view.title.padType100').d('填充率100%')}
                  </div>
                </div>
                <div className="switcher-item" onClick={() => setPadType(75)}>
                  <div
                    className={`switcher-item-pic pad-75${padType === 75 ? ' active' : ''}`}
                    style={(padType === 75 && activeBorder) || {}}
                  />
                  <div className="switcher-item-text">
                    {intl.get('hiam.theme.view.title.padType75').d('填充率75%')}
                  </div>
                </div>
              </div>

              <div className="setup-title">
                {intl.get('hiam.theme.view.title.tableDensty').d('表格密度')}
              </div>
              <div className="svg-pic-switcher">
                <div className="switcher-item" onClick={() => setDensityType('default')}>
                  <div
                    className={`switcher-item-pic table-std-density${
                      densityType === 'default' ? ' active' : ''
                    }`}
                    style={(densityType === 'default' && activeBorder) || {}}
                  />
                  <div className="switcher-item-text">
                    {intl.get('hiam.theme.view.title.tableDenstyStd').d('标准')}
                  </div>
                </div>
                <div className="switcher-item" onClick={() => setDensityType('small')}>
                  <div
                    className={`switcher-item-pic table-high-density${
                      densityType === 'small' ? ' active' : ''
                    }`}
                    style={(densityType === 'small' && activeBorder) || {}}
                  />
                  <div className="switcher-item-text">
                    {intl.get('hiam.theme.view.title.tableDenstySmall').d('紧凑')}
                  </div>
                </div>
              </div>

              <div className="setup-title">
                {intl.get('hiam.theme.view.title.menuLineWrap').d('菜单换行')}
              </div>
              <div className="svg-pic-switcher">
                <div className="switcher-item" onClick={() => setLineWrap(0)}>
                  <div
                    className={`switcher-item-pic line-wrap-not${lineWrap === 0 ? ' active' : ''}`}
                    style={(lineWrap === 0 && activeBorder) || {}}
                  />
                  <div className="switcher-item-text">
                    {intl.get('hiam.theme.view.title.lineWrapNot').d('省略显示')}
                  </div>
                </div>
                <div className="switcher-item" onClick={() => setLineWrap(1)}>
                  <div
                    className={`switcher-item-pic line-wrap${lineWrap === 1 ? ' active' : ''}`}
                    style={(lineWrap === 1 && activeBorder) || {}}
                  />
                  <div className="switcher-item-text">
                    {intl.get('hiam.theme.view.title.lineRwapIs').d('换行显示')}
                  </div>
                </div>
              </div>
              <div className="setup-title">
                {intl.get('hiam.theme.view.title.searchBar').d('筛选器')}
              </div>
              <div className="svg-pic-switcher">
                <div className="switcher-item" onClick={() => setSearchBarMode(0)}>
                  <div
                    className={`switcher-item-pic search-auto${
                      searchBarMode === 0 ? ' active' : ''
                    }`}
                    style={(searchBarMode === 0 && activeBorder) || {}}
                  />
                  <div className="switcher-item-text">
                    {intl.get('hiam.theme.view.title.autoQuery').d('即时筛选')}
                  </div>
                </div>
                <div className="switcher-item" onClick={() => setSearchBarMode(1)}>
                  <div
                    className={`switcher-item-pic search-manual${
                      searchBarMode === 1 ? ' active' : ''
                    }`}
                    style={(searchBarMode === 1 && activeBorder) || {}}
                  />
                  <div className="switcher-item-text">
                    {intl.get('hiam.theme.view.title.manualQuery').d('点击“查询”按钮筛选')}
                  </div>
                </div>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </Spin>
  );
});

function ThemeConfigPane(props) {
  const {
    themeColorDTOList,
    colorCode,
    tempColor,
    tempTheme,
    onAddHiddenChange,
    saveTempValue,
    updateActiveTheme,
    updateTheme,
    removeTheme,
    onCustomHiddenChange,
    advancedSetupProps,
  } = props;
  const themeChunk = chunk(
    [...themeColorDTOList.filter((item) => !item.enableDeleteFlag), { addItem: true }],
    7
  );

  return (
    <Form className={styles['theme-config']} labelLayout="float" layout="none">
      <div className="theme-config-content">
        <div className="setup-title">
          {intl.get('hiam.theme.view.title.config.theme.color').d('主题色')}
        </div>
        <div>
          {themeChunk.map((row) => (
            <div className="theme-row">
              {row.map((data) => {
                const { colorCode: color, tenantId: id, addItem } = data;
                const active = color === colorCode;
                if (addItem) {
                  return (
                    <div className="custom-col">
                      <ColorPicker
                        key="theme-add"
                        name="theme-add"
                        className="theme-col"
                        preset
                        mode="button"
                        renderer={() => <div className="theme-add" />}
                        onPopupHiddenChange={onAddHiddenChange}
                        onBeforeChange={saveTempValue}
                        popupCls={styles['theme-col-popup']}
                        noValidate
                      />
                      {tempColor.colorCode ? (
                        <span style={{ background: tempColor.colorCode }} className="temp-theme" />
                      ) : null}
                      {tempColor.colorCode === colorCode ? <Icon type="check" /> : null}
                    </div>
                  );
                }
                if (id) {
                  return (
                    <div className="custom-col" onClick={(e) => updateActiveTheme(e, data, false)}>
                      <ColorPicker
                        name="color"
                        key={color}
                        defaultValue={color}
                        className={`theme-col ${active ? 'active-col' : ''}`}
                        style={{ background: color }}
                        onBeforeChange={(value) => updateTheme(value, data)}
                        onPopupHiddenChange={(hidden) => onCustomHiddenChange(hidden)}
                        preset
                        mode="button"
                        popupCls={styles['theme-col-popup']}
                        noValidate
                      />
                      <Icon type="close" onClick={(e) => removeTheme(e, color)} />
                      {tempTheme.oldCode === color ? (
                        <span style={{ background: tempTheme.colorCode }} className="temp-theme" />
                      ) : null}
                      {active ? <Icon type="check" /> : null}
                    </div>
                  );
                }
                return (
                  <div
                    key={color}
                    className={`theme-col ${active ? 'active-col' : ''}`}
                    style={{ background: color }}
                    onClick={(e) => updateActiveTheme(e, data, false)}
                  >
                    {active && <Icon type="check" />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {colorCode ? <AdvancedSetup {...advancedSetupProps} /> : null}
      </div>
    </Form>
  );
}
