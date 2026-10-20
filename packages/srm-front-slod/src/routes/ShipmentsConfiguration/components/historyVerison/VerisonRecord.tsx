import type { ReactNode } from 'react';
import React, { useCallback, useMemo, createElement } from 'react';
import { observer } from 'mobx-react';
import { DataSet, Output } from 'choerodon-ui/pro';
import { isEmpty, isFunction, remove } from 'lodash';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import type { OutputProps } from 'choerodon-ui/pro/lib/output/Output';
import type { TransportType } from 'choerodon-ui/dataset/data-set/Transport';
import formatterCollections from 'utils/intl/formatterCollections';
import { 
	dateTimeRender, // 日期时间格式化
} from 'hzero-front/lib/utils/renderer';
import intl from 'utils/intl';
import styles from './index.less';

// 版本号 | 发布人 | 发布时间 | 登录名
export type FieldName = 'dataVersion'| 'versionNumber' | 'userName' | 'time' | 'loginName';
export type AreaRender = (record: DSRecord, defaultRender?: (record: DSRecord) => ReactNode) => ReactNode
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

interface VersionRecordProps {
  // 历史版本记录数据的主键字段名
  primaryKey: string;
  // 当前历史版本记录数据的主键字段
  currentKey?: string | number;
  // 字段配置，用于自定义渲染字段样式和内容。
  fieldsConfig?: FieldsConfig;
  // 历史版本条目点击事件
  onClick?: ({ dataSet, record }: { dataSet: DataSet, record: DSRecord }) => void;
  // 数据加载前的回调函数，用于自定义数据加载前的操作。
  onBeforeLoad?: ({ dataSet, data }: { dataSet: DataSet, data: any }) => void;
  // 查询请求的 axios 配置或 url 字符串
  readTransport?: TransportType,
  // 自定义渲染历史版本条目的完整内容。
  contentRender?: AreaRender;
}
const itemPreCls = 'version-item';

// 默认数据加载前处理函数
const defaultBeforeload = ({ dataSet, data, currentKey, onBeforeLoad }) => {
  if (data) {
    if (currentKey) {
      const { primaryKey } = dataSet.props || {};
      remove(data, (item: any) => String(item[primaryKey]) === String(currentKey));
    }
    if (isFunction(onBeforeLoad)) onBeforeLoad({ dataSet, data });
  }
};

// 获取默认字段配置
const getDefaultFieldsConfig = (): FieldsConfig<OutputProps> => {
  return {
    versionNumber: {
      className: styles[`${itemPreCls}-versionNumber`],
      renderer: ({ text }) => intl.get('ssta.common.view.message.versionVNumber', { versionNumber: text }).d('版本v{versionNumber}'),
    },
    userName: {
      className: styles[`${itemPreCls}-userName`],
      renderer: ({ text, record }) => {
        const loginName = record?.get('loginName');
        return loginName ? `${text}(${loginName})` : text;
      },
    },
    time: {
      className: styles[`${itemPreCls}-userName`],
      renderer: ({ text }) => {
        const val = dateTimeRender(text);
        return  val;
      },
    }
  };
};

const VersionCmp = observer((props: VersionRecordProps) => {

  const {
    onClick,
    primaryKey,
    currentKey,
    fieldsConfig,
    onBeforeLoad,
    readTransport,
    contentRender,
  } = props;

  const dataSet = useMemo(() => {
    return new DataSet({
      primaryKey,
      paging: false,
      autoQuery: true,
      fields: fieldsConfig
        ? Object.keys(fieldsConfig).map(fieldName => ({
          name: fieldName,
          bind: fieldsConfig[fieldName]?.alias || undefined,
        })) : [],
      queryParameter: { size: 0 },
      events: { beforeLoad: eventProps => defaultBeforeload({ ...eventProps, currentKey, onBeforeLoad }) },
      transport: {
        read: readTransport,
      },
    });
  }, [
    primaryKey,
    currentKey,
    fieldsConfig,
    onBeforeLoad,
    readTransport,
  ]);

  const handleClick = useCallback((record) => {
    if (isFunction(onClick)) onClick({ dataSet, record });
  }, [dataSet, onClick]);

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

  const getContent = useCallback((record: DSRecord) => {
    const defaultRender = () => {
      return (
        <div className={styles[`${itemPreCls}-content`]}>
          {getField('versionNumber', record)}
          <div className={styles[`${itemPreCls}-extra`]}>
            {getField('userName', record)}
            {getField('time', record)}
          </div>
        </div>
      );
    };
    if (isFunction(contentRender)) {
      return contentRender(record, defaultRender);
    } else {
      return defaultRender();
    }
  }, [getField, contentRender]);

  if (dataSet.status !== 'ready') return null;

  return (
    <div className={styles['version-wrapper']}>
      {isEmpty(dataSet) ? (
        <div className={styles[`empty-version-wrapper`]}>
          {intl.get('ssta.common.view.message.noHistoricalVersionInfo').d('暂无历史版本信息')}
        </div>
      ) : (
        dataSet.map((record) => (
          <div className={styles[itemPreCls]} key={record.key} onClick={() => handleClick(record)}>
            <div className={styles[`${itemPreCls}-wrapper`]}>
              {getContent(record)}
            </div>
          </div>
        ))
      )}
    </div>
  );
});

export default formatterCollections({
  code: ['hzero.common', 'ssta.common', 'slod.common'],
})(VersionCmp);