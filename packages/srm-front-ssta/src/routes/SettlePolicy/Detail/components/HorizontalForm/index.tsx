/*
 * @Description: 编辑态表单
 * @Date: 2022-09-21 23:20:21
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import type { CSSProperties } from 'react';
import React, { memo, createElement, useCallback } from 'react';
import { Row, Col } from 'choerodon-ui';
import { isObject } from 'lodash';
import classNames from 'classnames';
import type { DataSet } from 'choerodon-ui/pro';
import { Output, TextField, Tooltip, Icon } from 'choerodon-ui/pro';

import styles from './index.less';

const prefixCls = 'horizontal-form';

interface HorizontalFormProps {
  // 表单数据
  dataSet?: DataSet;
  // 表达是否为编辑态
  editorFlag?: boolean;
  // 表单字段
  editorColumns: any[];
  style?: CSSProperties;
  className?: string;
};

const HorizontalForm = memo((props: HorizontalFormProps) => {
  const {
    dataSet,
    editorFlag = false,
    editorColumns = [],
    style,
    className,
  } = props;

  const editorRender = useCallback((item: any) => {
    // 对象默认取editor（默认值为TextField）为组件
    const { editor, className, ...otherProps } = item as any;
    const { name: key } = otherProps;
    return createElement(editor || TextField, {
      key,
      dataSet,
      className: classNames(styles[`${prefixCls}-item`], className),
      ...otherProps,
    });
  }, [dataSet]);

  const outputRender = useCallback((item: any) => {
    // 对象默认取editor（默认值为Output）为组件
    const { className, ...otherProps } = item as any;
    const { name: key } = otherProps;
    delete otherProps.editor;
    return createElement(Output, {
      key,
      dataSet,
      className: classNames(styles[`${prefixCls}-item`], className),
      ...otherProps,
    });
  }, [dataSet]);

  const getFormItem = useCallback((item: any) => {
    if (isObject(item as any)) {
      const { name, help, visible = true, editorFlag: itemEditorFlag = editorFlag } = item || {};
      if (!name || !visible) return null;
      delete item.help;
      return (
        <Row key={name} className={styles[`${prefixCls}-row`]}>
          <Col span={4} className={styles[`${prefixCls}-label`]}>
            {dataSet?.getField(name)?.get('label')}
            {help && (
              <Tooltip title={help}>
                <Icon type="help" className={styles[`${prefixCls}-label-help`]} />
              </Tooltip>
            )}
            {':'}
          </Col>
          <Col span={20}>
            {itemEditorFlag ? editorRender(item) : outputRender(item)}
          </Col>
        </Row>
      );
    } else return null;
  }, [dataSet, editorFlag, editorRender, outputRender]);

  return (
    <div style={style} className={classNames(styles[prefixCls], className)}>
      {editorColumns.map((item) => getFormItem(item))}
    </div>
  );
});

export default HorizontalForm;