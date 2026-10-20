/*
 * @Date: 2023-03-10 09:53:40
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { sumBy, isEmpty } from 'lodash';
import { useObserver } from 'mobx-react-lite';
import React, { Fragment, useCallback } from 'react';
import { Select, useDataSet, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';

import Score from '../Score';
import { getScoreDs } from '../../stores/details';

const rowKey = 'respUserId';

const AssignGrader = ({ record, name, dataSource, averageFlag, newIsEdit, assessmentPanelDs }) => {
  const evalLineId = record.get('evalLineId');

  // 评分人表格ds
  const dataSet = useDataSet(() => getScoreDs({ averageFlag }), [averageFlag]);

  const handleRenderer = useCallback(
    ({ value }) => {
      if (value) {
        if (averageFlag) {
          // 平均式计算
          return <span>{value.realName}</span>;
        }
        return (
          <span
            style={{
              width: '85px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {`${value.realName}-${value.respWeight}%`}
          </span>
        );
      }
    },
    [averageFlag]
  );

  // 分配评分人
  const handleAssignGrader = useCallback(async () => {
    const validateFlag = await dataSet.validate();
    const selectedRows = dataSet.toJSONData();
    if (assessmentPanelDs.dirty) {
      notification.warning({
        message: intl
          .get('sslm.purchaserEvaluationDetail.view.message.assessmentPanelTooltip')
          .d('存在评估小组有数据未保存,请先保存评估小组数据'),
      });
    } else if (validateFlag) {
      const weightSum = sumBy(selectedRows, i => i.respWeight);
      if (!averageFlag && weightSum !== 100) {
        notification.warning({
          message: intl
            .get('sslm.purchaserEvaluationDetail.view.message.weightSum')
            .d('请维护权重之和等于100'),
        });
        return false;
      } else {
        const respUserIds = selectedRows.map(n => n[rowKey]);
        const newDataSource = dataSet.toData().map(data => {
          return {
            ...data,
            isSelect: respUserIds.includes(data[rowKey]) ? 1 : 0,
          };
        });
        const newData = selectedRows.map(data => {
          const { evalLineRespId, ...others } = data;
          return { ...others, evalLineId };
        });
        record.set({
          [name]: newData,
          siteEvalLineResps: newDataSource,
        });
      }
    }
  }, [record, averageFlag, dataSource, assessmentPanelDs]);

  // 下拉框内容
  const getPopupContent = () => {
    const isDisabled = useObserver(() => isEmpty(dataSet.selected));
    return (
      <Fragment>
        <Score
          dataSet={dataSet}
          record={record}
          dataSource={dataSource}
          newIsEdit={newIsEdit}
          averageFlag={averageFlag}
        />
        <div style={{ textAlign: 'right', padding: 12 }}>
          <Button color="primary" size="small" disabled={isDisabled} onClick={handleAssignGrader}>
            {intl.get('sslm.common.model.message.assign').d('分配')}
          </Button>
        </div>
      </Fragment>
    );
  };

  return (
    <Select
      multiple
      noCache
      name={name}
      record={record}
      dropdownMatchSelectWidth
      style={{ width: '100%' }}
      renderer={handleRenderer}
      popupContent={getPopupContent()}
      maxTagCount={3}
      maxTagPlaceholder={restValues => `+${restValues.length}...`}
    />
  );
};

export default AssignGrader;
