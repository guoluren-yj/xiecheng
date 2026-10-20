import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import { isFunction } from 'lodash';

import type { DynamicAlertProps } from '.';
import DynamicAlert from '.';
import styles from './index.less';

interface DynamicAlertItemProps extends Omit<DynamicAlertProps, 'name'>
{
  name: string,
  showFlag?: boolean,
}

interface DynamicAlertListProps
{
  dataSource: DynamicAlertItemProps[],
  onDisplayChange?: (data: Record<string, any>) => any,
}

const DynamicAlertList = memo((props: DynamicAlertListProps) =>
{

  const { dataSource = [], onDisplayChange } = props;
  const alertListRef = useRef<any>({});
  const [initedChildNameSet, setInitedChildNameSet] = useState(new Set());
  const newDataSource = dataSource.filter(item =>
  {
    const { showFlag = true } = item || {};
    return showFlag;
  });
  const totalChildLength = newDataSource.length;

  const onChildLoad = useCallback((name) =>
  {
    if (name)
    {
      setInitedChildNameSet(prevSet =>
      {
        const newSet = new Set(prevSet);
        newSet.add(name);
        return newSet;
      });
    }
  }, []);

  const onChildDisplayChange = useCallback(() =>
  {
    if (isFunction(onDisplayChange))
    {
      onDisplayChange({ height: alertListRef.current?.offsetHeight || 0 });
    }
  }, [onDisplayChange]);

  useEffect(() =>
  {
    if (initedChildNameSet.size === totalChildLength)
    {
      onChildDisplayChange();
    }
  }, [initedChildNameSet, totalChildLength, onChildDisplayChange]);

  return (
    <div ref={alertListRef} className={styles['ssta-alert-list']}>
      {newDataSource.map((item, index) =>
      {
        return (
          <DynamicAlert key={item.name || index} {...item} onLoad={onChildLoad} onDisplayChange={onChildDisplayChange} />
        );
      })}
    </div>
  );
});

export default DynamicAlertList;