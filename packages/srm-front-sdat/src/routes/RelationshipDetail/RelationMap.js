/* eslint-disable eqeqeq */
/**
 * 关系路径绘图
 * @date: 2022-12-05
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Output, Tooltip } from 'choerodon-ui/pro';

import style from './index.less';

export default function RelationMap(props) {
  const { detailList = [{}, {}, {}] } = props;

  const renderArrow = (direction) =>
    direction == '1' ? (
      <div className={style['arrow-left']} />
    ) : direction == '2' ? (
      <div className={style['arrow-right']} />
    ) : null;

  const renderOrg = (name) => (
    <Tooltip title={name}>
      <Output
        value={name}
        style={{
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      />
    </Tooltip>
  );

  return (
    <div className={style['path-box']}>
      {detailList[0]?.name && renderOrg(detailList[0]?.name)}
      {detailList[0]?.content && (
        <span className={style['arrow-box']}>
          <span>{detailList[0]?.content}</span>
          {renderArrow(detailList[0]?.arrowType)}
        </span>
      )}
      {detailList[1]?.name && renderOrg(detailList[1]?.name)}
      {detailList[1]?.content && (
        <span className={style['arrow-box']}>
          <span>{detailList[1]?.content}</span>
          {renderArrow(detailList[1]?.arrowType)}
        </span>
      )}
      {detailList[2]?.name && renderOrg(detailList[2]?.name)}
    </div>
  );
}
