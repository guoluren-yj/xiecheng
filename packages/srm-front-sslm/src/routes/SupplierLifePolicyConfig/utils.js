/*
 * @Date: 2022-11-14 15:46:08
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import G6 from '@antv/g6';
import { getRectShape, getDelIcon, getText } from '@/routes/components/SupplierLifeConfig/utils';

// 注册阶段节点
export const registerStageNode = ({ primaryColor, isEdit = true }) => {
  G6.registerNode('stage-node', {
    draw(cfg, group) {
      const { stageDescription = '', _local } = cfg;
      const keyShapeStyle = _local
        ? { isShadow: false, lineDash: [4, 4], stroke: primaryColor }
        : {};
      const keyShape = getRectShape({
        group,
        isShadow: true,
        name: 'stage-rect',
        ...keyShapeStyle,
      });
      const rectBBox = keyShape.getBBox();
      if (isEdit) {
        getDelIcon({ group, rectBBox, name: 'stage-delete-icon' });
      }
      const textStyle = _local ? { fill: '#868D9C' } : {};
      getText({
        group,
        label: stageDescription,
        name: 'stage-text',
        fontWeight: _local ? 400 : 500,
        ...textStyle,
      });
      return keyShape;
    },
    setState(name, value, node) {
      if (name === 'hover') {
        const group = node.getContainer();
        const keyShape = group.find(element => element.get('name') === 'stage-rect');
        const delImg = group.find(element => element.get('name') === 'stage-delete-icon');
        const nodeData = node.getModel();
        const strokeColor = value ? primaryColor : '#fff';
        const delImgOpacity = value ? 1 : 0;
        if (!nodeData._local) {
          // 新建阶段，hover时不允许变更边框色
          keyShape.attr({ stroke: strokeColor, lineWidth: value ? 1 : 0 });
        }
        if (delImg) {
          delImg.attr({ opacity: delImgOpacity });
        }
      } else if (name === 'active') {
        const group = node.getContainer();
        const nodeData = node.getModel();
        const phaseText = group.find(element => element.get('name') === 'stage-text');
        const textFill = value ? primaryColor : nodeData._local ? '#868D9C' : '#1D2129';
        phaseText.attr({ fill: textFill });
      }
    },
  });
};
