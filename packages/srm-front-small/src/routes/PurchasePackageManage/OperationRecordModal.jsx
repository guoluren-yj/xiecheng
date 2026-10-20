import React, { useMemo, useState } from 'react';
import intl from 'utils/intl';
import { Timeline, Icon, Divider, Tooltip } from 'choerodon-ui';
import { dateTimeRender } from 'utils/renderer';

const OperationRecordModal = (props) => {
  const { recordList } = props;

  const param = useMemo(() => {
    const data = {};
    recordList.forEach((item) => {
      if (item?.operationDescriptionList?.length > 0) {
        data[item.barHistoryId] = false;
      }
    });
    return data;
  }, []);

  const [flagList, setFlagList] = useState(param);

  /* 操作记录的icon */
  const showStatusIcon = (icon) => {
    switch (icon) {
      case 'CREATE':
        return 'add';
      case 'DELETE':
        return 'delete';
      case 'UPDATE':
        return 'mode_edit';
      case 'ENABLE':
        return 'finished';
      case 'UNENABLE':
        return 'not_interested';
      default:
        return 'mode_edit';
    }
  };

  /* 操作记录-操作类型 */
  const showStatusTitle = (type) => {
    switch (type) {
      case 'CREATE':
        return intl.get('small.packages.record.title.create').d('新建了');
      case 'DELETE':
        return intl.get('small.packages.record.title.delete').d('删除了');
      case 'UPDATE':
        return intl.get('small.packages.record.title.update').d('修改了');
      case 'ENABLE':
        return intl.get('small.packages.record.title.enable').d('启用了');
      case 'UNENABLE':
        return intl.get('small.packages.record.title.unenable').d('禁用了');
      default:
        return intl.get('small.packages.record.title.update').d('修改了');
    }
  };

  /* 时间线圆点颜色 */
  const showStatusCircleColor = (color) => {
    switch (color) {
      case 'ENABLE':
        return 'green';
      case 'UNENABLE':
        return 'red';
      default:
        return '#ebebeb';
    }
  };

  return (
    <Timeline>
      {recordList?.map((val) => {
        const { barHistoryId, operationType, operator, operationDescription, lastUpdateDate } = val;
        return (
          <Timeline.Item color={showStatusCircleColor(operationType)}>
            <div className="template-historys" style={{ display: 'flex' }}>
              <div className="left" style={{ marginRight: 10 }}>
                <Icon
                  type={showStatusIcon(operationType)}
                  style={{ fontSize: 13, color: 'rgba(0,0,0,.85)' }}
                />
              </div>
              <div className="right">
                <p key={barHistoryId}>
                  <span style={{ fontWeight: 'bold' }}>{`${operator}`}</span>
                  &nbsp;&nbsp;&nbsp;
                  <span>{showStatusTitle(operationType)}</span>
                  &nbsp;&nbsp;&nbsp;
                  <span style={{ fontWeight: 'bold' }}>
                    【{intl.get('small.packages.record.title.desc').d('采购套餐')}】
                  </span>
                  {operationDescription?.length > 0 && (
                    <Icon
                      style={{ marginLeft: 4 }}
                      type={
                        !flagList[val.barHistoryId] ? 'keyboard_arrow_down' : 'keyboard_arrow_up'
                      }
                      onClick={() =>
                        setFlagList({
                          ...flagList,
                          [val.barHistoryId]: !flagList[val.barHistoryId],
                        })
                      }
                    />
                  )}
                </p>
                {operationType !== ('ENABLE' && 'UNENABLE') && flagList[val.barHistoryId] && (
                  <Tooltip title={operationDescription} placement="bottomLeft">
                    <p style={{ color: 'rgba(0,0,0,.65)' }}>{`${operationDescription}`}</p>
                  </Tooltip>
                )}
                <p style={{ color: 'rgba(0,0,0,.65)' }}>{dateTimeRender(lastUpdateDate)}</p>
              </div>
            </div>
            <Divider style={{ margin: 0 }} />
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

export default OperationRecordModal;
