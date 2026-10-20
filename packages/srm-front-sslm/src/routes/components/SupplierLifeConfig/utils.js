/*
 * utils - 通用工具类
 * @Date: 2022-11-04 16:55:35
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import G6 from '@antv/g6';
import { isEmpty } from 'lodash';

import deleteIcon from '@/assets/lifeConfig/delete.svg';
import arrowRightGrayIcon from '@/assets/lifeConfig/arrow-right-gray.svg';
import {
  startNodeHeight,
  nodeWidth,
  nodeHeight,
  nodeYPadding,
  addImgWidth,
  addImgHeight,
  nodePadding,
  getNodeConfig,
} from './NodeComponent/utils';
import './style.less';

export const isFirefox = /Firefox\/(\S+)/.test(window.navigator.userAgent);

// 矩形
export const getRectShape = ({ group, name, isShadow, width = 160, height = 50, ...style }) => {
  const rectConfig = {
    width,
    height,
    lineWidth: 1,
    radius: 6,
    fill: '#fff',
    stroke: 'transparent',
    cursor: 'pointer',
  };
  const shadowStyle = isShadow
    ? {
        shadowColor: 'rgba(0, 0, 0, 0.12)',
        shadowBlur: 20,
        shadowOffsetX: 4,
        shadowOffsetY: 4,
      }
    : {};
  const nodeOrigin = {
    x: -rectConfig.width / 2,
    y: -rectConfig.height / 2,
  };
  const rect = group.addShape('rect', {
    attrs: {
      x: nodeOrigin.x,
      y: nodeOrigin.y,
      ...rectConfig,
      ...shadowStyle,
      ...style,
    },
    name,
  });
  return rect;
};

// 删除icon
export const getDelIcon = ({ group, name, rectBBox }) => {
  const { width, height, x, y } = rectBBox;
  const imgWidth = 12;
  const imgHeight = 14;
  const delIcon = group.addShape('image', {
    attrs: {
      x: x + width - imgWidth - 16,
      y: y + height / 2 - imgHeight / 2,
      width: imgWidth,
      height: imgHeight,
      img: deleteIcon,
      cursor: 'pointer',
      stroke: '#47B881',
      opacity: 0,
    },
    name,
  });
  return delIcon;
};

// 文本超出显示...
export const fittingString = (str = '', maxWidth, fontSize) => {
  const ellipsis = '...';
  const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSize)[0];
  let currentWidth = 0;
  let res = str;
  const pattern = new RegExp('[\u4E00-\u9FA5]+'); // 区分汉字和字母
  str.split('').forEach((letter, i) => {
    if (currentWidth > maxWidth - ellipsisLength) return;
    if (pattern.test(letter)) {
      currentWidth += fontSize;
    } else {
      currentWidth += G6.Util.getLetterWidth(letter, fontSize);
    }
    if (currentWidth > maxWidth - ellipsisLength) {
      res = `${str.substr(0, i)}${ellipsis}`;
    }
  });
  return res;
};

// 文本
export const getText = ({ group, label, name, fontMaxWidth = 90, ...style }) => {
  const fontSize = 18;
  const textStr = fittingString(label, fontMaxWidth, fontSize);
  const text = group.addShape('text', {
    attrs: {
      text: textStr,
      textAlign: 'center',
      textBaseline: 'middle',
      fontSize,
      fontWeight: 500,
      fill: '#1D2129',
      cursor: 'pointer',
      ...style,
    },
    name,
  });
  return text;
};

// 带新建icon的边
export const getAddEdge = ({ cfg, group, name }) => {
  const { startPoint, endPoint } = cfg;
  const keyShape = group.addShape('path', {
    attrs: {
      stroke: '#868D9C',
      endArrow: {
        path: G6.Arrow.triangle(6, 6, 26),
        d: 26,
        fill: '#868D9C',
        stroke: '#868D9C',
      },
      path: [['M', startPoint.x, startPoint.y], ['L', endPoint.x, endPoint.y]],
    },
    name,
  });
  const midPoint = keyShape.getPoint(0.5);
  const rect = group.addShape('rect', {
    attrs: {
      x: midPoint.x - 9,
      y: midPoint.y - 12,
      width: 18,
      height: 18,
      radius: 4,
      fill: '#fff',
      cursor: 'pointer',
      shadowColor: 'rgba(0, 0, 0, 0.12)',
      shadowBlur: 20,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      stroke: 'transparent',
    },
    name: `${name}-rect`,
  });
  const rectBBox = rect.getBBox();
  const { x, y } = rectBBox;
  group.addShape('text', {
    attrs: {
      x: x + 4,
      y: isFirefox ? y + 19 : y + 16,
      text: '+',
      fontSize: 18,
      fontWeight: 500,
      fill: '#868D9C',
      cursor: 'pointer',
    },
    name: `${name}-text`,
  });
  return keyShape;
};

// 获取tooltip的展示文本
const getTooltipText = e => {
  const data = e.item.getModel();
  const {
    stageDescription,
    config: { conditionDesc, nodeDesc, stageDescription: configStageDescription } = {},
  } = data || {};
  return conditionDesc || nodeDesc || configStageDescription || stageDescription || '';
};

/**
 * g6 tooltip插件
 * fontMaxWidth 字体最大宽度
 * fontSize 字体大小
 */
export const stageTooltip = (fontMaxWidth = 90, fontSize = 18) => {
  return new G6.Tooltip({
    offsetX: 10,
    offsetY: 30,
    itemTypes: ['node'],
    className: 'stage-config-tooltip',
    getContent(e) {
      return getTooltipText(e);
    },
    shouldBegin: e => {
      const tooltipText = getTooltipText(e);
      const str = fittingString(tooltipText, fontMaxWidth, fontSize);
      if (str.includes('...')) {
        return true;
      }
    },
  });
};

// 流程设置-流程明细的节点
export const registerShape = ({ primaryColor = '#00B8CC', dataSource }) => {
  // 开始、结束节点
  G6.registerNode('process-stage-node', {
    draw(cfg, group) {
      const { stageDescription = '' } = cfg;
      const keyShape = getRectShape({ group, name: 'process-stage-node-rect', isShadow: true });
      getText({ group, name: 'process-stage-node-text', label: stageDescription });
      return keyShape;
    },
  });

  // 条件、节点
  G6.registerNode('condition-node', {
    draw(cfg, group) {
      const {
        nodeType = '',
        _local,
        stageDescription,
        config: {
          conditionDesc = '',
          nodeDesc = '',
          stageDescription: configStageDescription = '',
          orderSeq,
        } = {},
      } = cfg;
      const nodeConfig = getNodeConfig();
      const keyShape = getRectShape({
        group,
        isShadow: true,
        width: nodeWidth,
        height: nodeHeight,
        name: 'condition-node-rect',
        stroke: nodeConfig[nodeType]?.stroke,
        lineDash: _local ? [4, 4] : [],
      });
      const rectBBox = keyShape.getBBox();
      const { x, y, maxX } = rectBBox;
      group.addShape('image', {
        attrs: {
          x: x + 14,
          y: nodeType === 'action' ? y + 16 : y + 12,
          img: nodeConfig[nodeType]?.img,
          cursor: 'pointer',
          stroke: '#47B881',
          opacity: 1,
        },
        name: 'condition-con',
      });
      if (nodeType === 'condition') {
        // 必须定义在condition-del前面，不然click获取不到
        getText({
          group,
          opacity: 1,
          x: maxX - 16,
          y: y + 14,
          fontSize: 12,
          fontWeight: 400,
          textAlign: 'right',
          textBaseline: 'top',
          name: 'condition-orderSeq',
          fill: nodeConfig[nodeType]?.titleFill,
          label: orderSeq ? `${nodeConfig[nodeType].orderSeqTitle}${orderSeq}` : '',
        });
      }
      if (nodeType !== 'action') {
        group.addShape('image', {
          attrs: {
            x: maxX - 26,
            y: y + 12,
            width: 10,
            height: 14,
            img: deleteIcon,
            cursor: 'pointer',
            stroke: '#47B881',
            opacity: 0,
          },
          name: 'condition-del',
        });
      }
      // 编辑弹框包裹层
      group.addShape('rect', {
        attrs: {
          x,
          y: rectBBox.maxY - nodeHeight / 2,
          width: nodeWidth,
          height: nodeHeight / 2,
          fill: '#fff',
          stroke: '#fff',
          cursor: 'pointer',
          opacity: 0,
        },
        name: 'desc-rect',
      });
      getText({
        group,
        x: x + 32,
        y: y + 26,
        fontSize: 12,
        fontWeight: 400,
        textAlign: 'start',
        textBaseline: 'bottom',
        fill: nodeConfig[nodeType]?.titleFill,
        label: nodeConfig[nodeType]?.title,
        name: 'condition-title',
      });
      group.addShape('path', {
        attrs: {
          path: [['M', x + 12, y + 38], ['L', maxX - 12, y + 38]],
          lineWidth: 1,
          stroke: '#E5E7EC',
          cursor: 'pointer',
        },
        name: 'condition-path',
      });
      getText({
        group,
        x: x + 12,
        y: y + 45 + 20,
        fontSize: 14,
        fontWeight: 400,
        fontMaxWidth: 200,
        fill: '#868D9C',
        name: 'condition-content',
        textAlign: 'start',
        textBaseline: 'bottom',
        label: conditionDesc || nodeDesc || configStageDescription || stageDescription,
      });
      group.addShape('image', {
        attrs: {
          x: maxX - 26,
          y: y + 45 + 10,
          img: arrowRightGrayIcon,
          fillStyle: '#868D9C',
          cursor: 'pointer',
          width: 6,
          height: 8,
        },
        name: 'condition-content',
      });
      return keyShape;
    },
    setState(name, value, node) {
      if (name === 'hover') {
        const group = node.getContainer();
        const deleteImage = group.find(element => element.get('name') === 'condition-del');
        const orderSeqText = group.find(element => element.get('name') === 'condition-orderSeq');
        const opacity = value ? 1 : 0;
        const orderSeqOpacity = value ? 0 : 1;
        if (deleteImage) {
          deleteImage.attr('opacity', opacity);
        }
        if (orderSeqText) {
          orderSeqText.attr('opacity', orderSeqOpacity);
        }
      }
    },
  });

  // 新增分支节点
  G6.registerNode('add-branch-node', {
    draw(cfg, group) {
      const rect = group.addShape('rect', {
        attrs: {
          width: addImgWidth,
          height: addImgHeight,
          radius: 4,
          fill: '#fff',
          cursor: 'pointer',
          shadowColor: 'rgba(0, 0, 0, 0.12)',
          shadowBlur: 20,
          shadowOffsetX: 4,
          shadowOffsetY: 4,
          stroke: 'transparent',
        },
        name: `add-branch`,
      });
      const rectBBox = rect.getBBox();
      group.addShape('text', {
        attrs: {
          x: rectBBox.x + 4,
          y: isFirefox ? rectBBox.y + 19 : rectBBox.y + 16,
          text: '+',
          fontSize: 18,
          fontWeight: 500,
          fill: '#868D9C',
          cursor: 'pointer',
        },
        name: `add-branch-text`,
      });
      return rect;
    },
    setState(name, value, edge) {
      if (name === 'hover') {
        const group = edge.getContainer();
        const addImage = group.find(element => element.get('name') === 'add-branch-text');
        const textFill = value ? primaryColor : '#868D9C';
        addImage.attr({ fill: textFill });
      }
    },
  });

  // 带新建icon无箭头的边
  G6.registerEdge(
    'condition-edge',
    {
      afterDraw(cfg, group) {
        const {
          startPoint,
          endPoint,
          targetNodeType,
          edgeNodeType,
          childrenIndex,
          startNodeX,
        } = cfg;
        const { branches: { branchConfigs = [] } = {} } = dataSource;
        // 【判断条件】前的边，不需要可操作按钮
        if (branchConfigs.length > 1 && targetNodeType === 'condition') {
          return;
        }
        let x = startPoint.x - addImgWidth / 2;
        let y;
        if (isEmpty(branchConfigs) || branchConfigs.length === 1) {
          // 无节点配置时
          y = endPoint.y - nodeHeight / 2 - addImgWidth / 2 - nodeYPadding / 2; // startNodeHeight+nodeYPadding/2-addImgHeight/2;
        } else if (targetNodeType === 'action') {
          if (edgeNodeType === 'virtual') {
            x =
              startNodeX +
              ((childrenIndex + 1) * 2 - 1) * (nodePadding / 2 + nodeWidth / 2) -
              addImgHeight / 2;
            y =
              (endPoint.y - (nodeYPadding + nodeHeight / 2) - (startNodeHeight + nodeYPadding)) /
                2 +
              (startNodeHeight + nodeYPadding) -
              addImgHeight / 2;
          } else {
            y =
              (endPoint.y - nodeYPadding - nodeHeight / 2 - (startPoint.y + nodeHeight / 2)) / 2 +
              (startPoint.y + nodeHeight / 2) -
              addImgHeight / 2;
          }
        } else {
          x = endPoint.x - addImgWidth / 2;
          y = endPoint.y - nodeHeight / 2 - addImgWidth / 2 - nodeYPadding / 2;
        }

        const rect = group.addShape('rect', {
          attrs: {
            x,
            y,
            width: 18,
            height: 18,
            radius: 4,
            fill: '#fff',
            cursor: 'pointer',
            shadowColor: 'rgba(0, 0, 0, 0.12)',
            shadowBlur: 20,
            shadowOffsetX: 4,
            shadowOffsetY: 4,
            stroke: 'transparent',
          },
          name: `add-item-icon-rect`,
        });
        const rectBBox = rect.getBBox();
        group.addShape('text', {
          attrs: {
            x: rectBBox.x + 4,
            y: isFirefox ? rectBBox.y + 19 : rectBBox.y + 16,
            text: '+',
            fontSize: 18,
            fontWeight: 500,
            fill: '#868D9C',
            cursor: 'pointer',
          },
          name: `add-item-icon-text`,
        });
      },
      setState(name, value, edge) {
        if (name === 'hover') {
          const edgeData = edge.getModel();
          const group = edge.getContainer();
          const keyShape = group.getChildren()[0];
          const addImage = group.find(element => element.get('name') === 'add-item-icon-text');
          const textFill = value ? primaryColor : '#868D9C';
          if (addImage) {
            addImage.attr({ fill: textFill });
          }
          const strokeColor = value && edgeData.edgeNodeType === 'virtual' ? textFill : '#868D9C'; // 虚拟边才可删除
          keyShape.attr('stroke', strokeColor);
        }
      },
    },
    'polyline'
  );
};
