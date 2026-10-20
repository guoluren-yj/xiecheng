/**
 * 历史记录
 */
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { Timeline } from 'choerodon-ui';
import { constructQueryPointsRecordDataSet } from '@/routes/ScriptUtility/datasets/constructServicePointsDataSet';
import styles from './index.less';

const { Item } = Timeline;

export default function HistoricRecords({ data }) {
  const [list, setList] = useState([]);
  const queryPointsRecordDataSet = useMemo(() => {
    return constructQueryPointsRecordDataSet();
  }, []);

  useEffect(() => {
    queryPointsRecordDataSet.setQueryParameter('pointScriptId', data.pointScriptId);
    queryPointsRecordDataSet.query().then((res) => {
      setList(res.content);
    });
  }, []);

  return (
    <div className={styles['historic-records']}>
      <Timeline>
        {list.map((item: any) => (
          <Item key={item.id} className={styles['historic-records-item']}>
            <div className={styles['historic-records-title']}>
              <span className={styles['historic-records-time']}>{item.versionDatetime}</span>
              <span
                className={classnames({
                  [styles['historic-records-type']]: true,
                  [styles.script]: item.scriptTypeCode === 'SCRIPT',
                })}
              >
                {item.scriptTypeMeaning}
              </span>
            </div>
            <div className={styles['historic-records-name']}>{item.scriptName}</div>
            <div className={styles['historic-records-code']}>{item.scriptCode}</div>
            {item.scriptVersion && (
              <div
                className={classnames({
                  [styles['historic-records-version']]: true,
                  [styles.version]: true,
                })}
              >
                {`版本 ${item.scriptVersion}`}
              </div>
            )}
          </Item>
        ))}
      </Timeline>
    </div>
  );
}
