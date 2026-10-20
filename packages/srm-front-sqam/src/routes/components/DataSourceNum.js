import React, { useMemo, useCallback } from 'react';
import { Popover, Tooltip } from 'hzero-ui';
import { get8DDetailFromNum } from '@/services/common8DService';
import { getResponse } from 'utils/utils';

const style = {
  display: 'inline-block',
  width: '80%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
};

const DataSourceNum = ({ detail, camp, history, remoteProps }) => {
  const { dataSourceCode, dataSourceNum } = detail || {};

  const go8DDetail = useCallback(
    async (num) => {
      const res = getResponse(await get8DDetailFromNum({ problemNums: [num] }));
      if (res) {
        const detailInfo = res[0] || {};
        const { problemHeaderId } = detailInfo;
        const url =
          camp === 'PURCHASE'
            ? `/sqam/initiated8D/detail/${problemHeaderId}`
            : `/sqam/received8D/detail/${problemHeaderId}`;
        if (history) history.push(url);
      }
    },
    [camp, history]
  );

  const getContent = useMemo(() => {
    if (!dataSourceNum) return '';
    const list = dataSourceNum?.split(',') || [];
    return (
      <div>
        {list.map((item) => {
          return (
            <a
              onClick={() => go8DDetail(item)}
              style={{ padding: '4px 0', display: 'block' }}
              key={item}
            >
              {item}
            </a>
          );
        })}
      </div>
    );
  }, [dataSourceNum, go8DDetail]);

  const isSingleNum = useMemo(() => {
    const list = dataSourceNum?.split(',') || [];
    return list.length < 2;
  }, [dataSourceNum]);

  let dataSourceNumRender =
    dataSourceCode === '8D' ? (
      <Popover content={getContent}>
        <span style={style}>
          {isSingleNum ? (
            <a onClick={() => go8DDetail(dataSourceNum)}>{dataSourceNum}</a>
          ) : (
            dataSourceNum
          )}
        </span>
      </Popover>
    ) : (
      <Tooltip title={dataSourceNum}>
        <span style={style}>{dataSourceNum}</span>
      </Tooltip>
    );

  dataSourceNumRender = remoteProps
    ? remoteProps.render('SQAM_MY_CLAIM_FORM_DETAIL_CUX_DATASOURCENUM', dataSourceNumRender, {
        dataSourceCode,
        dataSourceNum,
        style,
        history,
        camp,
      })
    : dataSourceNumRender;

  return (
    <>
      {/* {dataSourceCode === '8D' ? (
        <Popover content={getContent}>
          <span style={style}>
            {isSingleNum ? (
              <a onClick={() => go8DDetail(dataSourceNum)}>{dataSourceNum}</a>
            ) : (
              dataSourceNum
            )}
          </span>
        </Popover>
      ) : (
        <Tooltip title={dataSourceNum}>
          <span style={style}>{dataSourceNum}</span>
        </Tooltip>
      )} */}
      {dataSourceNumRender}
    </>
  );
};

export default DataSourceNum;
