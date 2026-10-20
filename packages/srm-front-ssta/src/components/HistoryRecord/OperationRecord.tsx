import type { ReactNode } from 'react';
import React, { useMemo, useCallback, createElement } from 'react';
import moment from 'moment';
import { isFunction } from 'lodash';
import { observer } from 'mobx-react';
import { Timeline } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { Output } from 'choerodon-ui/pro';
import { Spin, Icon, Tooltip } from 'choerodon-ui/pro';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import type { OutputProps } from 'choerodon-ui/pro/lib/output/Output';
import type { TransportType } from 'choerodon-ui/dataset/data-set/Transport';

import intl from 'utils/intl';

import styles from './index.less';

// 操作人 | 操作阵营 | 操作编码 | 操作名称 | 操作时间 | 租户名称 | 操作备注
export type FieldName = 'userName' | 'camp' | 'typeCode' | 'typeName' | 'time' | 'tenantName' | 'remark';
export type AreaRender = (record: DSRecord, defaultRender?: () => ReactNode) => ReactNode
export type FieldRendererProps = {
  value?: any;
  text?: ReactNode;
  record?: DSRecord | null;
  name?: string;
  dataSet?: DataSet | null;
}
export type FieldRenderer = (props: FieldRendererProps, defaultRender?: FieldRenderer) => ReactNode
export type FieldConfig = {
  alias?: string,
  renderer?: FieldRenderer,
}
export type FieldsConfig<T = FieldConfig> = {
  [key in FieldName]?: T;
}
export interface OperationRecordProps {
  // 操作记录数据的主键字段名，用于数据排序。
  primaryKey: string;
  // 默认排序，默认不启用
  autoSort?: boolean;
  // 操作类型的枚举，用于显示操作记录的图标和颜色。
  actionEnum?: Record<string, { [key in 'color' | 'icon']?: string }>;
  // 文档名称，显示在操作记录中，用于标识操作所属文档。
  documentName: string;
  // 字段配置，用于自定义渲染字段样式和内容。
  fieldsConfig?: FieldsConfig;
  // 查询请求的 axios 配置或 url 字符串
  readTransport?: TransportType,
  // 数据加载前的回调函数，用于自定义数据加载前的操作。
  onBeforeLoad?: ({ dataSet, data }: { dataSet: DataSet, data: any }) => void;
  // 自定义渲染操作记录行的基本信息部分。
  basicRender?: AreaRender;
  // 自定义渲染操作记录行的额外信息部分。
  extraRender?: AreaRender;
  // 自定义渲染操作记录行的时间信息。
  timeRender?: AreaRender;
  // 自定义渲染操作记录条目的完整内容。
  contentRender?: AreaRender;
}
const { Item: TimeItem } = Timeline;
const itemPreCls = 'operation-item';

// 默认数据加载前处理函数
const defaultBeforeload = ({ dataSet, data, autoSort, actionEnum, onBeforeLoad }) => {
  if (data) {
    if (autoSort) {
      const timeName = dataSet?.getField('time')?.get('bind') || 'time';
      data.sort((a, b) => moment(a[timeName]).isBefore(b[timeName]) ? 0 : -1);
    }
    // 注入 icon 和 color
    data.forEach(item => {
      const typeCodeName = dataSet?.getField('typeCode')?.get('bind') || 'typeCode';
      const typeCode = item[typeCodeName];
      const { color, icon = 'authorize' } = actionEnum?.[typeCode] || {};
      Object.assign(item, { icon, color });
    });
    if (isFunction(onBeforeLoad)) onBeforeLoad({ dataSet, data });
  }
};
// 获取默认字段配置
const getDefaultFieldsConfig = (): FieldsConfig<OutputProps> => {
  return {
    userName: {
      className: styles[`${itemPreCls}-userName`],
      renderer: ({ text, record }) => {
        const tenantName = record?.get('tenantName');
        return (
          <Tooltip placement="topLeft" title={tenantName}>{text}</Tooltip>
        );
      },
    },
    typeName: {
      className: styles[`${itemPreCls}-typeName`],
      renderer: ({ text }) => {
        return intl.get('ssta.common.view.message.alreadyOperated', { operationName: text }).d('{operationName}了');
      },
    },
    remark: {
      className: styles[`${itemPreCls}-remark`],
    },
    time: {
      className: styles[`${itemPreCls}-time`],
    },
  };
};
// 操作记录组件
const OperationRecord = observer((props: OperationRecordProps) => {

  const {
    autoSort,
    primaryKey,
    actionEnum,
    documentName,
    fieldsConfig,
    readTransport,
    contentRender,
    basicRender,
    extraRender,
    timeRender,
    onBeforeLoad,
  } = props;

  const dataSet = useMemo(() => new DataSet({
    primaryKey,
    paging: false,
    autoQuery: true,
    fields: fieldsConfig
      ? Object.keys(fieldsConfig).map(fieldName => ({
        name: fieldName,
        bind: fieldsConfig[fieldName]?.alias || undefined,
      })) : [],
    queryParameter: { size: 0 },
    events: { beforeLoad: eventProps => defaultBeforeload({ ...eventProps, autoSort, actionEnum, onBeforeLoad }) },
    transport: {
      read: readTransport,
    },
  }), [
    autoSort,
    primaryKey,
    actionEnum,
    onBeforeLoad,
    fieldsConfig,
    readTransport,
  ]);

  // 获取字段渲染函数
  const getField = useCallback((fieldName: FieldName, record: DSRecord) => {
    const {
      className,
      renderer: defaultRenderer = (rendererProps) => rendererProps?.text,
    } = getDefaultFieldsConfig()[fieldName] || {};
    const {
      alias,
      renderer: customRenderer,
    } = fieldsConfig?.[fieldName] || {};
    const name = alias || fieldName;
    const renderer = isFunction(customRenderer)
      ? (rendererProps) => customRenderer(rendererProps, defaultRenderer)
      : defaultRenderer;
    return createElement(Output, { name, record, className, renderer });
  }, [fieldsConfig]);

  // 获取基本信息
  const getBasic = useCallback((record: DSRecord) => {
    const defaultRender = () => {
      const camp = record.get('camp');
      return (
        <div className={styles[`${itemPreCls}-basic`]}>
          {getField('userName', record)}
          {camp === 'supplier' && (
            <span className={styles[`${itemPreCls}-camp`]}>
              {intl.get('ssta.common.view.message.sup').d('供')}
            </span>
          )}
          {getField('typeName', record)}
          <span className={styles[`${itemPreCls}-documment`]}>
            【{documentName}】
          </span>
        </div>
      );
    };
    if (isFunction(basicRender)) {
      return basicRender(record, defaultRender);
    } else {
      return defaultRender();
    }
  }, [getField, basicRender, documentName]);

  // 获取额外信息
  const getExtra = useCallback((record: DSRecord) => {
    const defaultRender = () => {
      const remark = record.get('remark');
      return remark && (
        <div className={styles[`${itemPreCls}-extra`]}>
          {getField('userName', record)}
          <span className={styles[`${itemPreCls}-action`]}>
            {intl.get('ssta.common.view.message.alreadyOperated', {
              operationName: intl.get('ssta.common.view.message.add').d('添加'),
            }).d('{operationName}了')}
          </span>
          {getField('remark', record)}
        </div>
      );
    };
    if (isFunction(extraRender)) {
      return extraRender(record, defaultRender);
    } else {
      return defaultRender();
    }
  }, [getField, extraRender]);

  // 获取时间信息
  const getTime = useCallback((record: DSRecord) => {
    const defaultRender = () => {
      return getField('time', record);
    };
    if (isFunction(timeRender)) {
      return timeRender(record, defaultRender);
    } else {
      return defaultRender();
    }
  }, [getField, timeRender]);

  // 获取内容信息
  const getContent = useCallback((record: DSRecord) => {
    const defaultRender = () => {
      return (
        <div className={styles[`${itemPreCls}-content`]}>
          {getBasic(record)}
          {getExtra(record)}
          {getTime(record)}
        </div>
      );
    };
    if (isFunction(contentRender)) {
      return contentRender(record, defaultRender);
    } else {
      return defaultRender();
    }
  }, [getBasic, getExtra, getTime, contentRender]);

  if (dataSet.status !== 'ready') return <Spin />;

  return (
    <div className={styles['operation-wrapper']}>
      {dataSet.length < 1 ? (
        <div className={styles['empty-operation-wrapper']}>
          <span>{intl.get('ssta.common.view.message.noData').d('暂无数据')}</span>
        </div>
      ) : (
        <Timeline>
          {
            dataSet.map((record) => {
              const { color, icon = 'authorize' } = record?.get(['color', 'icon']) || {};
              return (
                <TimeItem key={record.key} color={color || '#E5E5E5'} className={styles[itemPreCls]}>
                  <Icon type={icon} className={styles[`${itemPreCls}-icon`]} />
                  <div className={styles[`${itemPreCls}-wrapper`]}>
                    {getContent(record)}
                  </div>
                </TimeItem>
              );
            })
          }
        </Timeline>
      )}
    </div>
  );
});

export default OperationRecord;