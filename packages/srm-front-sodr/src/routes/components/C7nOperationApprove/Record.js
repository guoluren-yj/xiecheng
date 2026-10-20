/**
 * @Description:
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2021-09-06
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';

import intl from 'utils/intl';
import { DataSet } from 'choerodon-ui/pro';
import { Timeline, Spin } from 'choerodon-ui';
import { noop, isArray, isEmpty } from 'lodash';
import classnames from 'classnames';
import { getResponse } from 'utils/utils';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';

import { line } from './store/lineDs';
import { getComputedColor } from './OperationStatus';
import OperationRecordItem from './OperationRecordItem';
import CuxExcelExportPro from './utils';
import Styles from './index.less';

const { Item } = Timeline;

const Record = (props) => {
  const { poHeaderId, onViewDetail = noop, modal, remote } = props;
  const [loading, setLoading] = useState(true);
  const [operateData, setoperateData] = useState([]);
  const lineDs = useMemo(() => new DataSet(line(poHeaderId)), []);

  useEffect(() => {
    const container = document?.getElementsByClassName('c7n-pro-modal-drawer-body')[0];
    // eslint-disable-next-line no-unused-expressions
    container?.addEventListener('scroll', appendData, true);
    return () => {
      // eslint-disable-next-line no-unused-expressions
      container?.removeEventListener('scroll', appendData, true);
    };
  }, [operateData, loading]);

  useEffect(() => {
    lineDs
      .query()
      .then((res) => {
        setLoading(true);
        if (getResponse(res) && isArray(res.content)) {
          formatAndSetoperateData(res);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    modal.update({
      footer: (okBtn) => {
        return (
          <>
            {okBtn}
            <CuxExcelExportPro modal={modal} dataSet={lineDs} poHeaderId={poHeaderId} />
          </>
        );
      },
    });
  }, [lineDs]);

  const formatAndSetoperateData = useCallback(
    (res) => {
      const formatData = operateData.concat(res.content || []).map((i) => {
        if (i.children) {
          const children = i.children.map((n) => {
            return {
              ...n,
              newValue: n.priceShieldFlag ? '******' : n.newValue,
              oldValue: n.priceShieldFlag ? '******' : n.oldValue,
            };
          });
          Object.assign(i, { children });
        }
        return {
          ...i,
          newValue: i.priceShieldFlag ? '******' : i.newValue,
          oldValue: i.priceShieldFlag ? '******' : i.oldValue,
        };
      });
      setoperateData(formatData);
    },
    [operateData, setoperateData]
  );
  const appendData = useCallback(
    (e) => {
      if (e.target.clientHeight + e.target.scrollTop + 1 >= e.target.scrollHeight && !loading) {
        setLoading(true);
        lineDs
          .queryMore(lineDs.currentPage + 1)
          .then((res) => {
            formatAndSetoperateData(res);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    },
    [formatAndSetoperateData, lineDs, loading]
  );

  const handleQuery = ({ params }) => {
    try {
      setLoading(true);
      // eslint-disable-next-line no-unused-expressions
      lineDs?.queryDataSet?.current?.set({
        processTypeCode: null,
        processedDateRange: null,
        ...params,
      });

      lineDs.query().then((res) => {
        const data = (res?.content || []).map((i) => {
          if (i.children) {
            const children = i.children.map((n) => {
              return {
                ...n,
                newValue: n.priceShieldFlag ? '******' : n.newValue,
                oldValue: n.priceShieldFlag ? '******' : n.oldValue,
              };
            });
            Object.assign(i, { children });
          }
          return {
            ...i,
            newValue: i.priceShieldFlag ? '******' : i.newValue,
            oldValue: i.priceShieldFlag ? '******' : i.oldValue,
          };
        });
        setoperateData(data);
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs?.queryDataSet?.current
      ? lineDs?.queryDataSet?.current?.reset()
      : lineDs?.queryDataSet?.loadData([{}]);
    lineDs
      .query()
      .then((res) => {
        setLoading(true);
        if (getResponse(res) && isArray(res.content)) {
          formatAndSetoperateData(res);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get('sodr.workspace.model.common.emptyData').d('暂无数据')}</span>
      </div>
    );
  };

  const ContentList = (
    <Timeline className={Styles['operating-timeline']}>
      {!isEmpty(operateData) &&
        (operateData || []).map((item, index) => {
          return (
            <>
              <Item color={getComputedColor(item.processTypeCode)}>
                <OperationRecordItem
                  item={item}
                  index={index}
                  onViewDetail={onViewDetail}
                  remote={remote}
                />
              </Item>
            </>
          );
        })}
      {isEmpty(operateData) && handleNoData()}
    </Timeline>
  );

  return (
    <Spin spinning={loading} dataSet={lineDs}>
      <div className={classnames(Styles['common-list-wrap'], Styles['operation-list-wrap'])}>
        <FilterBar
          dataSet={[lineDs]}
          onQuery={handleQuery}
          onClear={handleClear}
          autoQuery={false}
          expandable={false}
        />
        {ContentList}
      </div>
    </Spin>
  );
};
export default Record;
