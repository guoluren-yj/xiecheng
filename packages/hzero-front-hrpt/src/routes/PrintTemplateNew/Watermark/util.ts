import uuid from 'uuid/v4';
import { getWatermarkFixParams } from '../utils';

export const DENISTY = {
  COMPACT:{ top: 20, left: 20 },
  STANDARD:{ top: 40, left: 40 },
  LOOSE:{ top: 60, left: 60 },
};

export const TEXT_SIZE = {
  SMALLER: 10,
  STANDARD: 12,
  BIGGER: 14,
};

export const IMAGE_SIZE = {
  SMALLER: 18,
  STANDARD: 24,
  BIGGER: 30,
};

export const ALPHA = {
  LIGHT: '10%',
  SOFT: '15%',
  TRANSLUCENT: '20%',
};

export const MarkClassName = "hrpt-sheet-water-mark";

export const MarkContentItemType = {
  FIX: 'fix', // 固定字符串
  VAR: 'var', // 变量
};

export const checkIsImgType = (type) => ['IMAGE', 'TILE_IMAGE'].includes(type); // 图片类型

export const checkIsSingleType = (type) => ['TEXT', 'IMAGE'].includes(type); // 单一不平铺

export const transformMarkContent = (content) => {
  if (!content || !content.length) {
    return [{
      key: uuid(),
      type: MarkContentItemType.FIX,
      value: undefined,
      meaning: undefined,
    }];
  }
  const result: any[] = [];
  content.forEach((item, index) => {
    if (index === 0 && item.type === MarkContentItemType.VAR) {
      result.push({
        key: uuid(),
        type: MarkContentItemType.FIX,
        value: undefined,
        meaning: undefined,
      });
    }
    result.push(item);
    if (content[index+1] && content[index+1].type === MarkContentItemType.VAR) {
      result.push({
        key: uuid(),
        type: MarkContentItemType.FIX,
        value: undefined,
        meaning: undefined,
      });
    }
    if (index === content.length - 1 && item.type === MarkContentItemType.VAR) {
      result.push({
        key: uuid(),
        type: MarkContentItemType.FIX,
        value: undefined,
        meaning: undefined,
      });
    }
  });
  return result;
};

export const createWatermarkItem = (options) => {
  const { type, content, density, size, alpha, position, direction, scale, imageRatio } = options;
  const isImg = checkIsImgType(type); // 图片类型
  const isSingle = checkIsSingleType(type); // 单一不平铺
  const mask_div: any = document.createElement(isImg ? 'img' : 'div');
  mask_div.className = MarkClassName;
  if (isImg) {
    mask_div.src = content;
    mask_div.style.width = `${IMAGE_SIZE[size] * imageRatio}px`;
    mask_div.style.height = `${IMAGE_SIZE[size]}px`;
  } else {
    mask_div.textContent = content;
    mask_div.style.width = 'auto';
    mask_div.style.height = 'auto';
    mask_div.style.fontSize = `${TEXT_SIZE[size]}px`;
    mask_div.style.whiteSpace = 'nowrap';
    mask_div.style.color = '#101319';
  }
  if (!isSingle) {
    mask_div.style.paddingTop = `${DENISTY[density].top * scale}px`;
    mask_div.style.paddingBottom = `${DENISTY[density].top * scale}px`;
    mask_div.style.paddingLeft = `${DENISTY[density].left * scale}px`;
    mask_div.style.paddingRight = `${DENISTY[density].left * scale}px`;
  }
  mask_div.style.opacity = ALPHA[alpha];
  mask_div.style.position = 'absolute';
  mask_div.style.boxSizing = 'content-box';
  if (isSingle) {
    switch (position) {
      case 'CENTER': {
        mask_div.style.top = '50%';
        mask_div.style.left = '50%';
        mask_div.style.transform = 'translate(-50%, -50%)';
        break;
      }
      case 'TOP': {
        mask_div.style.top = '0';
        mask_div.style.left = '50%';
        mask_div.style.transform = 'translateX(-50%)';
        break;
      }
      case 'BOTTOM': {
        mask_div.style.bottom = '0';
        mask_div.style.left = '50%';
        mask_div.style.transform = 'translateX(-50%)';
        break;
      }
      case 'LEFT': {
        mask_div.style.top = '50%';
        mask_div.style.left = '0';
        mask_div.style.transform = 'translateY(-50%)';
        break;
      }
      case 'RIGHT': {
        mask_div.style.top = '50%';
        mask_div.style.right = '0';
        mask_div.style.transform = 'translateY(-50%)';
        break;
      }
      default:
        break;
    }
  } else {
    mask_div.style.transform = `rotate(${direction === 'RIGHT_UP' ? -45 : 45}deg)`;
  }
  mask_div.style.transform += ` scale(${scale})`
  return mask_div;
};

export const createWatermark = (container, options) => {
  const { type, content } = options;
  if (!container) { return; }
  // 先清空
  container.querySelectorAll(`.${MarkClassName}`).forEach(el => {
    el.remove();
  });
  if (!content) {
    return;
  }
  const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();
  const isSingle = checkIsSingleType(type); // 单一不平铺
  const mask_div = createWatermarkItem(options);
  container.appendChild(mask_div);
  if (isSingle) {
    return;
  }
  // 先计算宽高
  mask_div.style.opacity = '0';
  container.appendChild(mask_div);
  const itemWidth = mask_div.offsetWidth;
  const itemHeight = mask_div.offsetHeight;
  const cols = Math.ceil(containerWidth / itemWidth);
  const rows = Math.ceil(containerHeight / itemHeight);
  mask_div.remove();
  for (let rowIndex = 0; rowIndex <= rows; rowIndex++) {
    for (let colIndex = 0; colIndex <= cols; colIndex++) {
      const item = createWatermarkItem(options);
      item.style.top = `${rowIndex * itemHeight}px`;
      item.style.left = `${colIndex * itemWidth}px`;
      container.appendChild(item);
    }
  } 
};

export const parseExpressionParams = (expression) => {
  const fixParams = getWatermarkFixParams();
  const params: any[] = [];
  let expressionStr = expression;
  // 去掉开头的CONCAT(
  if (expression.indexOf('CONCAT(') === 0) {
    expressionStr = expressionStr.substr(7);
  }
  // 去掉结尾的)
  if (expression.substr(expression.length -1) === ')') {
    expressionStr = expressionStr.substr(0, expressionStr.length -1);
  }
  const array =
    expressionStr
      .split(',')
      .map(item => {
        if (item === '""' || item === "''") {
          return undefined;
        }
        if (item.includes("'")) {
          return {
            key: uuid(),
            value: item,
            meaning: item,
            type: MarkContentItemType.FIX,
          };
        } else {
          return {
            key: uuid(),
            value: item,
            meaning: fixParams[item] && fixParams[item].meaning || item,
            type: MarkContentItemType.VAR,
          };
        }
      }).filter(Boolean);
  array.forEach((item, index) => {
    if (item.type === MarkContentItemType.FIX && index !== array.length -1 && array[index+1].type === MarkContentItemType.FIX) {
      array[index+1].value = item.value + ',' + array[index+1].value;
      return;
    }
    if ((item.value.startsWith("'") && item.value.endsWith("'")) || (item.value.startsWith('"') && item.value.endsWith('"'))) {
      item.value = item.value.slice(1, -1);
    }
    params.push(item);
  });
  return params;
};