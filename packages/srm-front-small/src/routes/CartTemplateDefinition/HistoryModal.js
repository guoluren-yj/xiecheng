import React, { useState, useMemo } from 'react';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { Timeline, Icon, Divider } from 'choerodon-ui';
import { dateTimeRender } from 'utils/renderer';

import styles from './index.less';

const HistoryModal = (props) => {
  const { content } = props;

  const param = useMemo(() => {
    const data = {};
    content.forEach((item) => {
      if (item?.records?.length > 0) {
        data[item.historyId] = false;
      }
    });
    return data;
  }, []);

  const [flagList, setFlagList] = useState(param);

  /* 操作记录的icon */
  const showStatusIcon = (icon) => {
    let type;
    switch (icon.operationType) {
      case 'CREATE':
        type = 'add';
        break;
      case 'UNLOCK':
        type = 'unlock';
        break;
      case 'PUBLISH':
        type = 'send';
        break;
      case 'UPDATE':
        type = 'mode_edit';
        break;
      case 'COPY':
        type = 'baseline-file_copy';
        break;
      case 'DISABLE':
        type = 'not_interested';
        break;
      case 'ENABLE':
        type = 'finished';
        break;
      default:
        type = 'mode_edit';
        break;
    }
    return <Icon type={type} style={{ fontSize: 14 }} />;
  };

  const showTimelinCircle = (i) => {
    switch (i.operationType) {
      case 'ENABLE':
        return '#3AB344';
      case 'DISABLE':
        return '#f05434';
      default:
        return '#E5E7EC';
    }
  };

  return (
    <Timeline>
      {content.map((val) => (
        <Timeline.Item className={styles['template-history-item']} color={showTimelinCircle(val)}>
          <div className="template-historys" style={{ display: 'flex' }}>
            <div className="left" style={{ marginLeft: 8, marginRight: 16 }}>
              {showStatusIcon(val)}
            </div>
            <div className="right" style={{ flex: "1 0 calc(100% - 38px)" }}>
              <div className='operator' key={val.templateId} style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 'bold' }}>{val.operator}</span>
                &nbsp;&nbsp;&nbsp;
                <span className='action'>
                  {val.operationType === 'ENABLE' &&
                    intl.get('small.common.handle.record.title.enable').d('启用了')}
                  {val.operationType === 'DISABLE' &&
                    intl.get('small.common.handle.record.title.disable').d('禁用了')}
                  {val.operationType !== 'DISABLE' &&
                    val.operationType !== 'ENABLE' &&
                    val.operationTypeMeaning}
                </span>
                &nbsp;&nbsp;&nbsp;
                <span className='operationObject' style={{ fontWeight: 'bold' }}>【{val.operationObject}】</span>
                {val.operationType === 'UNLOCK' && (
                  <span style={{ marginLeft: 8 }}>
                    <span className='action'>{intl.get('small.common.template.history.version').d('版本提升为')}</span>
                    <span style={{ marginLeft: 8, fontWeight: 'bold' }}>
                      【{val?.displayVersion}】
                    </span>
                  </span>
                )}
                {!['UNLOCK', 'CREATE', 'PUBLISH', 'DELETE', 'DISABLE', 'ENABLE'].includes(
                  val.operationType
                ) &&
                  !isEmpty(val.operationDescription) && (
                    <Icon
                      style={{ marginLeft: 4 }}
                      type={!flagList[val.historyId] ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
                      onClick={() =>
                        setFlagList({ ...flagList, [val.historyId]: !flagList[val.historyId] })
                      }
                    />
                  )}
              </div>
              {!['UNLOCK', 'CREATE', 'PUBLISH', 'DELETE', 'DISABLE', 'ENABLE'].includes(
                val.operationType
              ) &&
                !isEmpty(val.operationDescription) &&
                flagList[val.historyId] && (
                  <div className='action' style={{ marginBottom: 8 }}>
                    {/* <span style={{ marginRight: 4 }}>{val.operator}</span> */}
                    <span dangerouslySetInnerHTML={{ __html: val.operationDescription}} />
                  </div>
                )}
              <p className='history-date'>{dateTimeRender(val.lastUpdateDate)}</p>
              <Divider style={{ margin: 0, backgroundColor: '#E5E7EC'}} />
            </div>
          </div>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default HistoryModal;
