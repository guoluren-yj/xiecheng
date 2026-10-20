import React, { useMemo, useCallback, createElement, useEffect } from 'react';
import moment from 'moment';
import { isEmpty, isFunction } from 'lodash';
import { observer } from 'mobx-react';
import { Timeline } from 'choerodon-ui';
import { DataSet, Output, Spin, Icon, Tooltip } from 'choerodon-ui/pro';

import NoData from '@/routes/spc/components/OperationRecord/NoData';
import styles from './index.less';

const { Item: TimeItem } = Timeline;
const itemPreCls = 'operation-item';

// 默认数据加载前处理函数
const defaultBeforeload = ({
  dataSet,
  data,
  autoSort,
  actionEnum,
  onBeforeLoad,
  operationType,
}) => {
  if (data) {
    if (autoSort) {
      const timeName = dataSet?.getField('time')?.get('bind') || 'time';
      data.sort((a, b) => (moment(a[timeName]).isBefore(b[timeName]) ? 0 : -1));
    }
    // 注入 icon 和 color
    data.forEach((item) => {
      const typeCodeName = dataSet?.getField('typeCode')?.get('bind') || 'typeCode';
      const typeCode = item[typeCodeName];
      const { color, icon = 'authorize', documentName } = actionEnum?.[typeCode] || {};
      Object.assign(item, { icon, color, documentName, operationType });
    });
    if (isFunction(onBeforeLoad)) onBeforeLoad({ dataSet, data });
  }
};
// 获取默认字段配置
const getDefaultFieldsConfig = () => {
  return {
    userName: {
      className: styles[`${itemPreCls}-userName`],
      renderer: ({ text, record }) => {
        const { tenantName } = record?.get(['tenantName', 'loginName']);
        return (
          <Tooltip placement="topLeft" title={tenantName}>
            {`${text}`}
          </Tooltip>
        );
      },
    },
    typeName: {
      className: styles[`${itemPreCls}-typeName`],
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
const OperationRecord = observer((props) => {
  const {
    autoSort,
    handleRef = () => {},
    primaryKey,
    operationType, // 操作记录类型比如：策略/配置
    actionEnum,
    documentName,
    fieldsConfig,
    readTransport,
    contentRender,
    basicRender,
    extraRender,
    timeRender,
    onBeforeLoad,
    setHasData = () => {},
  } = props;

  const dataSet = useMemo(
    () =>
      new DataSet({
        primaryKey,
        paging: false,
        // autoQuery: true,
        fields: fieldsConfig
          ? Object.keys(fieldsConfig).map((fieldName) => ({
              name: fieldName,
              bind: fieldsConfig[fieldName]?.alias || undefined,
            }))
          : [],
        queryParameter: { size: 0 },
        events: {
          beforeLoad: (eventProps) =>
            defaultBeforeload({ ...eventProps, autoSort, actionEnum, onBeforeLoad, operationType }),
        },
        transport: {
          read: (transportProps) => {
            const { data } = transportProps;
            const { queryParams, ...rest } = data;
            const newReadTransport = isFunction(readTransport)
              ? readTransport(transportProps)
              : readTransport;
            return {
              ...newReadTransport,
              data: {
                ...newReadTransport?.data,
                ...queryParams,
                ...rest,
              },
            };
          },
        },
      }),
    [autoSort, primaryKey, actionEnum, onBeforeLoad, fieldsConfig, readTransport]
  );

  useEffect(() => {
    handleRef({
      dataSet,
    });
    dataSet.query().then((response) => {
      if (response && !isEmpty(response.content)) {
        setHasData(true);
      }
    });
  }, [dataSet]);

  // 获取字段渲染函数
  const getField = useCallback(
    (fieldName, record) => {
      const { className, renderer: defaultRenderer = (rendererProps) => rendererProps?.text } =
        getDefaultFieldsConfig()[fieldName] || {};
      const { alias, renderer: customRenderer } = fieldsConfig?.[fieldName] || {};
      const name = alias || fieldName;
      const renderer = isFunction(customRenderer)
        ? (rendererProps) => customRenderer(rendererProps, defaultRenderer)
        : defaultRenderer;
      return createElement(Output, { name, record, className, renderer });
    },
    [fieldsConfig]
  );

  // 获取基本信息
  const getBasic = useCallback(
    (record) => {
      const defaultRender = () => {
        return (
          <div className={styles[`${itemPreCls}-basic`]}>
            {getField('userName', record)}
            {getField('typeName', record)}
            <span>【{getField('operationType', record)}】</span>
          </div>
        );
      };
      if (isFunction(basicRender)) {
        return basicRender(record, defaultRender);
      } else {
        return defaultRender();
      }
    },
    [getField, basicRender, documentName]
  );

  // 获取额外信息
  const getExtra = useCallback(
    (record) => {
      const defaultRender = () => {
        const remark = record.get('remark');
        return (
          remark && (
            <div className={styles[`${itemPreCls}-extra`]}>{getField('remark', record)}</div>
          )
        );
      };
      if (isFunction(extraRender)) {
        return extraRender(record, defaultRender);
      } else {
        return defaultRender();
      }
    },
    [getField, extraRender]
  );

  // 获取时间信息
  const getTime = useCallback(
    (record) => {
      const defaultRender = () => {
        return getField('time', record);
      };
      if (isFunction(timeRender)) {
        return timeRender(record, defaultRender);
      } else {
        return defaultRender();
      }
    },
    [getField, timeRender]
  );

  // 获取内容信息
  const getContent = useCallback(
    (record) => {
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
    },
    [getBasic, getExtra, getTime, contentRender]
  );

  if (dataSet.status !== 'ready') return <Spin />;

  return (
    <div className={styles['operation-wrapper']}>
      {dataSet.length < 1 ? (
        <NoData />
      ) : (
        <Timeline>
          {dataSet.map((record) => {
            const { color, icon = 'authorize' } = record?.get(['color', 'icon']) || {};
            return (
              <TimeItem key={record.key} color={color || '#E5E5E5'} className={styles[itemPreCls]}>
                <Icon type={icon} className={styles[`${itemPreCls}-icon`]} />
                <div className={styles[`${itemPreCls}-wrapper`]}>{getContent(record)}</div>
              </TimeItem>
            );
          })}
        </Timeline>
      )}
    </div>
  );
});

export default OperationRecord;
