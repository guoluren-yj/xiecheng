import type { FunctionComponent } from 'react';
import React from 'react';
import type { TimeLineItemProps } from 'choerodon-ui/lib/timeline/TimelineItem';
import Timeline from 'choerodon-ui/lib/timeline';

const C7NTimelineItem = Timeline.Item;

export type {
  TimeLineItemProps,
};

const TimelineItem: FunctionComponent<TimeLineItemProps> = function TimelineItem(props) {
  return <C7NTimelineItem prefixCls="ant-timeline" {...props} />;
};

TimelineItem.displayName = 'TimelineItem<hzeoWithC7n>';

export default TimelineItem;
