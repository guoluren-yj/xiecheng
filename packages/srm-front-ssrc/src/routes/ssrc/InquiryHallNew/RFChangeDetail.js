/*
 * @Descripttion: 询价工作台--变更详情
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-23 14:53:52
 * @LastEditors: yiping.liu
 */
import React, { useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import RFChangeDetailDS from './RFChangeDetailDS';
import style from './index.less';

const RFChangeDetail = () => {
  const RFChangeDetailDs = useMemo(() => new DataSet(RFChangeDetailDS()), []);

  useEffect(() => {}, []);

  /**
   * @description: 渲染操作列
   * @param {*}
   */
  const renderOperation = (type) => {
    const renderNode =
      type === 'pending' ? (
        <a>{intl.get('hzero.common.button.editor').d('编辑')}</a>
      ) : (
        <a>{intl.get('ssrc.inquiryHall.model.inquiryHall.approveDetail').d('审批详情')}</a>
      );
    return renderNode;
  };

  const getColumns = (type) => {
    const columns = [
      {
        name: 'adjustStatusMeaning',
        width: 100,
      },
      ['pending', 'approving'].includes(type)
        ? {
            name: 'operation',
            header: intl.get('hzero.common.button.action').d('操作'),
            renderer: () => renderOperation(type),
          }
        : null,
      {
        name: 'adjustNum',
        width: 120,
      },
      {
        name: 'adjustTypesMeaning',
        width: 150,
      },
      {
        name: 'approveDetail',
        width: 200,
      },
      {
        name: 'createdByName',
        width: 100,
      },
      {
        name: 'createdUnitName',
        width: 100,
      },
      {
        name: 'creationDate',
        width: 150,
      },
    ].filter(Boolean);
    return columns;
  };

  return (
    <React.Fragment>
      <div className={style.changeRecordContainer}>
        <div className="title">
          <div className="rfx-card-item-title-line" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.toDeal').d('待处理')}
        </div>
        <Table dataSet={RFChangeDetailDs} columns={getColumns('pending')} />
        <div className="title">
          <div className="rfx-card-item-title-line" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.approvaling').d('审批中')}
        </div>
        <Table dataSet={RFChangeDetailDs} columns={getColumns('approving')} />
        <div className="title">
          <div className="rfx-card-item-title-line" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.hadFinished').d('已完成')}
        </div>
        <Table dataSet={RFChangeDetailDs} columns={getColumns('finished')} />
      </div>
    </React.Fragment>
  );
};

export default RFChangeDetail;
