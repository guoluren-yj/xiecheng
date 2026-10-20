/**
 * @Description:
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2021-09-06
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import React, { useMemo, useEffect } from 'react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { DataSet } from 'choerodon-ui/pro';
import { Timeline, Spin } from 'choerodon-ui';
import { noop, isArray } from 'lodash';
import classnames from 'classnames';
import { line } from './store/lineDs';
import { getComputedColor } from './OperationStatus';
import OperationRecordItem from './OperationRecordItem';
import Styles from './index.less';

const { Item } = Timeline;

const Record = (props) => {
  const { poHeaderId, onViewDetail = noop } = props;
  const [loading, setLoading] = React.useState(true);
  const [operateData, setoperateData] = React.useState();
  const lineDs = useMemo(() => new DataSet(line(poHeaderId)), []);

  useEffect(() => {
    lineDs
      .query()
      .then((res) => {
        setLoading(true);
        if (getResponse(res) && isArray(res.content)) {
          const formatData = (res.content || []).reduce((prev, cur, index, arr) => {
            if (prev.find((i) => cur.poProcessActionId === i.poProcessActionId)) {
              return prev;
            } else {
              const children = arr.filter((i) => i.poProcessActionId === cur.poProcessActionId);
              return [
                ...prev,
                {
                  ...cur,
                  newValue: prev.priceShieldFlag ? '******' : prev.newValue,
                  oldValue: prev.priceShieldFlag ? '******' : prev.oldValue,
                  children: children.map((i) => ({
                    ...i,
                    newValue: i.priceShieldFlag ? '******' : i.newValue,
                    oldValue: i.priceShieldFlag ? '******' : i.oldValue,
                  })),
                },
              ];
            }
          }, []);
          setoperateData(formatData);
        }
      })
      .finally(() => setLoading(false));
  }, []);
  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get('slod.orderExecution.model.common.emptyData').d('暂无数据')}</span>
      </div>
    );
  };
  return (
    <Spin spinning={loading}>
      <div className={classnames(Styles['common-list-wrap'], Styles['operation-list-wrap'])}>
        <Timeline className={Styles['operating-timeline']}>
          {(operateData || []).map((item, index) => {
            return (
              <Item color={getComputedColor(item.processTypeCode)}>
                <OperationRecordItem item={item} index={index} onViewDetail={onViewDetail} />
              </Item>
            );
          })}
          {!operateData?.length && handleNoData()}
        </Timeline>
      </div>
    </Spin>
  );
};
export default Record;
