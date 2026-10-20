import React, { FC, MutableRefObject, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { TooltipPlacement } from 'choerodon-ui/pro/lib/tooltip/Tooltip';
/**
 * SpringTooltip 弹性 Tooltip, 根据文字大小动态判断是否展示 Tooltip;
 * 使用方法
 * 1, 引入 import SpringTooltip from '@/components/SpringTooltip';
 * 2, 调用 (注意,传入一个方法, 而不是 ReactElement)
   <SpringTooltip title={rendererTitle}>
    {(stRef) => <div ref={stRef}>rendererTitle</div>}
   </SpringTooltip>
 * 注:ref赋值也可以这样写
 * 1, ref={(dom)=>{ref.current = dom;stRef.current = dom}}
 * 2, stRef.current = ref.current; ref={ref}
 * */

interface ISpringTooltipCom {
  children: (
    stRef: MutableRefObject<HTMLElement | undefined | null>
  ) => React.ReactElement | undefined | null;
  title: string;
  placement?: TooltipPlacement;
}
const SpringTooltip: FC<ISpringTooltipCom> = (props) => {
  const { title, placement = 'top', children } = props;
  const ref: MutableRefObject<HTMLElement | null> = useRef<HTMLElement | null>(null);
  // 获取ele的宽度
  const getWidth = (dom: HTMLElement) => {
    const rectObj = dom.getBoundingClientRect();
    return Math.abs(rectObj.width || rectObj.right - rectObj.left);
  };
  // 计算字符串像素值
  const pxWidth = (str: string | undefined = '', font: common.ObjectAny = {}): number => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = `${font?.fontSize || '12px'} ${font?.fontFamily || ''}`;
      const metrics = context.measureText(str);
      return metrics.width;
    }
    return 0;
  };
  const [state, setState] = useState<boolean>(true);
  useEffect(() => {
    if (ref.current) {
      const textNode = Array.from(ref.current.childNodes).find(
        ({ nodeValue, nodeName, nodeType }) => nodeValue && nodeName === '#text' && nodeType === 3
      );
      const domStyle = window.getComputedStyle(ref.current);
      const font = {
        fontSize: domStyle?.fontSize,
        fontFamily: domStyle?.fontFamily,
      };
      const width = getWidth(ref.current);
      const fontWidth = pxWidth(textNode?.nodeValue || '', font);
      if (fontWidth - 2 > width) {
        setState(true);
      } else {
        setState(false);
      }
    }
  }, [ref.current]);
  if (state) {
    return (
      <Tooltip title={title} placement={placement}>
        {children(ref)}
      </Tooltip>
    );
  } else {
    return <>{children(ref)}</>;
  }
};
export default SpringTooltip;
