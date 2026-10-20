import React from 'react';
import C7NTimeline from 'choerodon-ui/lib/timeline';
import type { TimelineProps } from 'choerodon-ui/lib/timeline';
import TimelineItem from './TimelineItem';

export type { TimelineProps };

const Timeline = function Timeline(props) {
  return <C7NTimeline prefixCls="ant-timeline" spinPrefixCls="ant-spin" {...props} />;
};

Timeline.displayName = 'Timeline<hzeroWithC7n>';

type TimelineType = typeof Timeline & { Item: typeof TimelineItem };

(Timeline as TimelineType).Item = TimelineItem;

export default Timeline as TimelineType;
