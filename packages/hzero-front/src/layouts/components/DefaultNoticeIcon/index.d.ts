import React from 'react';
import type { INoticeIconData } from './NoticeIconTab';
import type NoticeIconTab from './NoticeIconTab';

export interface INoticeIconProps {
  count?: number;
  icon?: string;
  className?: string;
  loading?: boolean;
  onClear?: (tableTile: string) => void;
  onItemClick?: (item: INoticeIconData, tabProps: INoticeIconProps) => void;
  onTabChange?: (tableTile: string) => void;
  popupAlign?: {
    points?: [string, string];
    offset?: [number, number];
    targetOffset?: [number, number];
    overflow?: any;
    useCssRight?: boolean;
    useCssBottom?: boolean;
    useCssTransform?: boolean;
  };
  style?: React.CSSProperties;
  onPopupVisibleChange?: (visible: boolean) => void;
  popupVisible?: boolean;
  locale?: { emptyText: string; clear: string };
  contentTitle?: string; // 标题
}

export default class NoticeIcon extends React.Component<INoticeIconProps, any> {
  public static Tab: typeof NoticeIconTab;
}
