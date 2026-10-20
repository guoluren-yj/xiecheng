import React, { useMemo, useCallback, createElement, useEffect, useImperativeHandle } from 'react';
import moment from 'moment';
import { isFunction } from 'lodash';
import { observer } from 'mobx-react';
import { Timeline } from 'choerodon-ui';
import { DataSet, Output, Spin, Icon, Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './index.less';

const { Item: TimeItem } = Timeline;
const itemPreCls = 'operation-item';

// 默认数据加载前处理函数
const defaultBeforeload = ({ dataSet, data, autoSort, actionEnum, onBeforeLoad }) => {
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
      Object.assign(item, { icon, color, documentName });
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
        const { tenantName, loginName } = record?.get(['tenantName', 'loginName']);
        return (
          <Tooltip placement="topLeft" title={tenantName}>
            {`${text}(${loginName})`}
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
    FilterComp,
    handleOperationRef = React.createRef,
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
            defaultBeforeload({ ...eventProps, autoSort, actionEnum, onBeforeLoad }),
        },
        transport: {
          read: readTransport,
        },
      }),
    [autoSort, primaryKey, actionEnum, onBeforeLoad, fieldsConfig, readTransport]
  );

  // 暴露子组件的api给父组件使用
  useImperativeHandle(
    handleOperationRef,
    () => ({
      dataSet,
      getFilterParams,
    }),
    [dataSet]
  );

  const getFilterParams = () => {
    const filterParams = dataSet?.getQueryParameter('filterParams') || {};

    return filterParams;
  };

  useEffect(() => {
    dataSet.query();
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
        const { camp, documentName: selfDocumentName } = record.get(['camp', 'documentName']);
        return (
          <div className={styles[`${itemPreCls}-basic`]}>
            {getField('userName', record)}
            {camp === 'SUPPLIER' && (
              <span className={styles[`${itemPreCls}-camp`]}>
                {intl.get('ssrc.quickInquiry.quickReply.view.message.sup').d('供')}
              </span>
            )}
            {getField('typeName', record)}
            <span className={styles[`${itemPreCls}-documment`]}>
              【{documentName || selfDocumentName}】
            </span>
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
            <div className={styles[`${itemPreCls}-extra`]}>
              <div className={styles[`${itemPreCls}-action`]}>
                {intl
                  .get('ssrc.quickInquiry.quickReply.view.message.reQuoteRemark')
                  .d('重新报价理由')}
                :
              </div>
              {getField('remark', record)}
            </div>
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

  return (
    <Spin spinning={dataSet.status !== 'ready'}>
      <div className={styles['operation-wrapper']}>
        {isFunction(FilterComp) && FilterComp(dataSet)}
        {dataSet.length < 1 ? (
          <div className={styles['empty-operation-wrapper']}>
            <span>
              {intl.get('ssrc.quickInquiry.quickReply.view.message.noData').d('暂无数据')}
            </span>
          </div>
        ) : (
          <Timeline>
            {dataSet.map((record) => {
              const { color, icon = 'authorize' } = record?.get(['color', 'icon']) || {};
              return (
                <TimeItem
                  key={record.key}
                  color={color || '#E5E5E5'}
                  className={styles[itemPreCls]}
                >
                  <Icon type={icon} className={styles[`${itemPreCls}-icon`]} />
                  <div className={styles[`${itemPreCls}-wrapper`]}>{getContent(record)}</div>
                </TimeItem>
              );
            })}
          </Timeline>
        )}
      </div>
    </Spin>
  );
});

export default OperationRecord;
