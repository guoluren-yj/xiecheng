import type { ReactNode } from 'react';
import React, { useCallback, createElement } from 'react';
import { observer } from 'mobx-react';
import { isFunction } from 'lodash';
import type { DataSet } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui/pro';
import { Output } from 'choerodon-ui/pro';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import type { OutputProps } from 'choerodon-ui/pro/lib/output/Output';
import classNames from 'classnames';

import styles from './index.less';

// 来源值 | 关联关系 | 目标值
export type FieldName = 'origin' | 'relation' | 'target';

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

export type AreaRender = (record: DSRecord, defaultRender?: (record: DSRecord) => ReactNode) => ReactNode

interface ViewerListProps {
  dataSet: DataSet;
  serialFlag?: boolean;
  fieldsConfig?: FieldsConfig;
  contentRender?: AreaRender;
  conditionCombination?: string;
  conditionTitle?: string;
}

const itemPreCls = 'viewer-item';

const tooltipRender: FieldRenderer = ({ text }) => <Tooltip title={text}>{text}</Tooltip>;

// 获取默认字段配置
const getDefaultFieldsConfig = (): FieldsConfig<OutputProps> => {
  return {
    origin: {
      className: styles[`${itemPreCls}-origin`],
      renderer: tooltipRender,
    },
    relation: {
      className: styles[`${itemPreCls}-relation`],
      renderer: tooltipRender,
    },
    target: {
      className: styles[`${itemPreCls}-target`],
      renderer: tooltipRender,
    },
  };
};

const ViewerList = observer((props: ViewerListProps) => {

  const {
    dataSet,
    serialFlag = true,
    fieldsConfig,
    contentRender,
    conditionCombination,
    conditionTitle,
  } = props;

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

  const getSerial = useCallback((record) => {
    if (serialFlag) {
      return (
        <Output
          value={`#${record.index + 1}`}
          className={styles[`${itemPreCls}-serial`]}
        />
      );
    } else {
      return null;
    }
  }, [serialFlag]);

  const getContent = useCallback((record) => {
    const defaultRender = () => {
      return (
        <div className={styles[itemPreCls]}>
          {getSerial(record)}
          {getField('origin', record)}
          {getField('relation', record)}
          {getField('target', record)}
        </div>
      );
    };
    if (isFunction(contentRender)) {
      return contentRender(record, defaultRender);
    } else {
      return defaultRender();
    }
  }, [getField, getSerial, contentRender]);

  return (
    <div className={styles[`viewer-list-wrapper`]}>
      <div className={styles[`viewer-list`]}>
        {dataSet.map(record => (
          <div className={styles[`${itemPreCls}-wrapper`]} key={record.key}>
            {getContent(record)}
          </div>
        ))}
        <div className={classNames(styles[`${itemPreCls}-wrapper`], styles[`${itemPreCls}-bottom`])}>
          <span className={styles['viewer-list-condition']}>{conditionTitle}：</span>{conditionCombination}
        </div>
      </div>
    </div>
  );
});

export default ViewerList;
