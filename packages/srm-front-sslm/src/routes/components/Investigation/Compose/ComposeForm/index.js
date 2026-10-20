/*
 * @Date: 2022-06-09 15:03:23
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { Fragment, useEffect } from 'react';
import { Alert } from 'choerodon-ui';
import { Form, Spin, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// import { aiApproveResultRender } from '@/routes/components/utils/render';
import { getComponentType, getComponentProps, useReaction } from '../../utils';

import styles from '../../index.less';

const Index = observer(({ dataSet, columns, remark, editable, // configName,
  // aiApproveFlag,
  referenceRangeMessage, _status, reactionFields = {}, context }) => {
  const renderComponent = column => {
    const { componentType, fieldCode } = column;
    const ComponentType = editable ? getComponentType(componentType) : Output;
    const componentProps = getComponentProps(componentType, column, context, dataSet);
    const name = ['Lov', 'TransferLov'].includes(componentType) ? `${fieldCode}Lov` : fieldCode;
    return React.createElement(ComponentType, Object.assign({ name }, componentProps));
  };

  useEffect(() => {
    const cacheDefaultValues = new Map();
    return useReaction(dataSet, columns, reactionFields, cacheDefaultValues);
  }, [dataSet, columns, reactionFields, editable]);

  // const newColumns = [
  //   ...columns,
  //   aiApproveFlag && {
  //     fieldCode: 'aiApproveResult',
  //     renderer: props => aiApproveResultRender({ ...props, configName, documentCode: 'INVESTG' }),
  //   },
  // ].filter(Boolean);

  return (
    <Spin dataSet={dataSet}>
      {remark && (
        <Alert
          showIcon
          type="info"
          message={remark}
          style={{ marginBottom: 16, border: 0 }}
          className={styles['investigation-tab-alert-info']}
        />
      )}
      {!isEmpty(referenceRangeMessage) && !editable && (
        <Alert
          showIcon
          type={_status === 'approval' ? 'error' : 'info'}
          style={{ marginBottom: 16, border: 0 }}
          message={
            <Fragment>
              {referenceRangeMessage.map(n => (
                <div>{n}</div>
              ))}
            </Fragment>
          }
          className={
            _status === 'approval'
              ? styles['investigation-tab-alert-error']
              : styles['investigation-tab-alert-info']
          }
        />
      )}
      <Form
        dataSet={dataSet}
        columns={3}
        useWidthPercent
        labelLayout={editable ? 'float' : 'vertical'}
        className={editable ? '' : 'c7n-pro-vertical-form-display'}
      >
        {columns.map(column => renderComponent(column))}
      </Form>
    </Spin>
  );
});

export default Index;
