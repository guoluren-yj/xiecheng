import React from 'react';
import intl from 'utils/intl';
import color from 'color';
import { changeThemeColor } from 'hzero-boot/lib/utils/theme';
import uuid from 'uuid/v4';

function getClassName(...paths) {
  return `srm-layout-${paths.join('-')}`;
}

function renderMenuTitle(menu, _searchText, commonMenusCode) {

  const searchText = _searchText === 0 ? '0' : (_searchText || "").replace(/$\s*/, "").replace(/\s*$/, "")
  const { name, functionMenuCode, quickIndex } = menu;
  const menuTitle = (name && intl.get(name));
  if (searchText) {
    if (menuTitle) {
      const index = menuTitle.toLowerCase().indexOf(searchText.toLowerCase());
      if (index !== -1) {
        return [
          [
            menuTitle.slice(0, index),
            <span className={getClassName('search-mark')}>{menuTitle.slice(index, index + searchText.length)}</span>,
            menuTitle.slice(index + searchText.length),
          ],
          true,
        ];
      }
      if (quickIndex && quickIndex.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
        return [menuTitle, true];
      }
    }
  }
  if (menuTitle && commonMenusCode) {
    return [menuTitle, commonMenusCode.includes(functionMenuCode)];
  }
  return [menuTitle || '...', !searchText];
}

function isActiveMenu(menu, activeKey) {
  if (activeKey) {
    const { path, type } = menu;
    if (path) {
      if (type === 'link' || type === 'inner-link') {
        return `/link/${menu.id}` === activeKey;
      }
      if (type !== 'window') {
        return path === activeKey;
      }
    }
  }
  return false;
}

const fontMap = new Map();
const colorMap = new Map();

const componentsCodeMap = {
  ANCHOR: ['anchor-primary-color', 'anchor-primary-hover-color'],
  BUTTON: ['btn-primary-bg'],
  DATE: ['date-primary-color', 'date-primary-hover-color'],
  INPUT: ['input-primary-color', 'input-hover-border-color'],
  LINK: ['link-color'],
  SELECT: ['select-primary-color'],
  SWITCH: ['switch-checked-color'],
  TAB: ['tabs-primary-color'],
  TREE: ['tree-primary-color'],
};

async function loadFonts(family, source) {
  if (typeof FontFace !== 'undefined' && !fontMap.has(family)) {
    let fontLoader = fontMap.get(family);
    if (!fontLoader) {
      fontLoader = new FontFace(family, `url(${source})`).load();
      fontMap.set(family, fontLoader);
    }
    if (fontLoader.status !== 'loaded') {
      const font = await fontLoader;
      if (!document.fonts.has(font)) {
        document.fonts.add(font);
        const style = document.createElement('style');
        style.innerText = `body, button, input, optgroup, select, textarea, pre { font-family: ${family} !important;}`;
        style.id = family;
        document.body.appendChild(style);
      }
    }
  }
}

function getComponentsThemeColor(components, colorCode) {
  if (components && components.length) {
    return components.reduce((obj, com = {}) => {
      let { componentCode, componentColor = colorCode } = com;
      componentColor = componentColor ? componentColor.substring(0, 7) : '';
      if (componentCode && componentsCodeMap[componentCode]) {
        const currentCom = componentsCodeMap[componentCode];
        obj[currentCom[0]] = componentColor;
        if (currentCom[1]) {
          obj[currentCom[1]] = color(componentColor).alpha(0.7).toString();
        }
      }
      return obj;
    }, {});
  }
  return getComponentsThemeColor(Object.keys(componentsCodeMap).map(componentCode => ({ componentCode })), colorCode);
}

function changeTheme(themeConfigVO = {}) {
  let { enableThemeConfig, colorCode, fileUrl, componentColorList } = themeConfigVO;
  const fontFileId = uuid();
  if (enableThemeConfig) {
    const promise = [];
    if (colorCode) {
      colorCode = colorCode.substring(0, 7);
      let colorPromise = colorMap.get(colorCode);
      if (!colorPromise) {
        const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
        colorPromise = changeThemeColor({
          'primary-color': colorCode,
          'hzero-primary-color': colorCode,
          'hzero-primary-color-2': colorCode,
          'hzero-primary-color-2-hover': colorCode,
          'primary-1': color(colorCode).alpha(0.1).toString(),
          'primary-3': color(colorCode).alpha(0.15).toString(),
          'primary-4': color(colorCode).alpha(0.35).toString(),
          ...componentsColor,
          'hzero-btn-primary-color': componentsColor['btn-primary-bg'],
          'btn-primary-flat-color': componentsColor['link-color'],
          'btn-primary-focus-bg': componentsColor['btn-primary-bg'],
          'select-primary-hover-color': color(componentsColor['select-primary-color']).alpha(0.15).toString(),
          'switch-color': color(componentsColor['switch-checked-color']).alpha(0.3).toString(),
          'tree-node-selected-bg': color(componentsColor['tree-primary-color']).alpha(0.2).toString(),
        });
        colorMap.set(colorCode, colorPromise);
      }
      promise.push(colorPromise);
    }
    if (fontFileId && fileUrl) {
      promise.push(loadFonts(`font-${fontFileId}`, fileUrl));
    }
    if (promise.length) {
      return Promise.all(promise);
    }
  }
  return Promise.resolve();
}

export { getClassName, renderMenuTitle, isActiveMenu, changeTheme, getComponentsThemeColor };
