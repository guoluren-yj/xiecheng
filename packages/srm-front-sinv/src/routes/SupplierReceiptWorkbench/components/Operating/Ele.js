import React from 'react';
// import {  } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { Icon, Timeline, Spin } from 'choerodon-ui';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';

const { Item } = Timeline;

const modelPrompt = 'sinv.receiptWorkbench.model.receipt';

const OPERATE_STATUS = {
  '10_NEW': {
    icon: 'add',
  },
  '20_SUBMITTED': {
    icon: 'check',
  },
  '30_REJECTED': {
    icon: 'authorize',
    color: '#F56349',
  },
  '40_FINISHED': {
    icon: 'check',
    color: '#47B881',
  },
  '50_DELETED': {
    icon: 'delete',
  },
  '60_WFL_SUBMIT': {
    icon: 'check',
  },
  '70_WFL_APPROVE': {
    icon: 'authorize',
  },
  '80_TRX_UPDATE': {
    icon: 'autorenew',
  },
  '90_TRANSFER': {
    icon: 'call_missed_outgoing',
  },
  WFL_BACK: {
    icon: 'reply',
  },
  OUT_APPROVE: {
    icon: 'authorize',
  },
  OUT_REJECTED: {
    icon: 'authorize',
    color: '#F56349',
  },
  OUT_BACK: {
    icon: 'reply',
  },
  '61_WFL_REJECTED': {
    icon: 'authorize',
    color: '#F56349',
  },
};

const Ele = (props) => {
  const { operateLoading, operateData, handleQuery, handlePush, operaTableDs } = props;

  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}</span>
      </div>
    );
  };

  return (
    <Spin spinning={operateLoading} dataSet={operaTableDs}>
      <FilterBar
        dataSet={[operaTableDs]}
        onQuery={handleQuery}
        onClear={handleQuery}
        autoQuery={false}
        expandable={false}
      />
      <Timeline className="operating-timeline">
        {operateData?.length > 0 &&
          !operateLoading &&
          operateData.map((t) => {
            const item = OPERATE_STATUS[t?.processStatus];
            if (
              t?.processStatus === '30_REJECTED' ||
              t?.processStatus === '61_WFL_REJECTED' ||
              t?.processStatus === 'OUT_REJECTED'
            ) {
              return (
                <Item color="#f56349">
                  <Icon type={item?.icon} />
                  <span
                    className="status gray reject"
                    style={{
                      cursor:
                        t?.processStatus === '61_WFL_REJECTED' || t?.processStatus === '30_REJECTED'
                          ? 'pointer'
                          : 'none',
                    }}
                    onClick={() => handlePush(t?.processStatus)}
                  >
                    {/* {intl.get(`${modelPrompt}.workflowApproval`).d('工作流审批')} */}
                    {t?.processStatusMeaning}
                  </span>
                  <div className="date gray">{dateTimeRender(t?.processDate)}</div>
                  <div className="line" />
                </Item>
              );
            } else if (
              t?.processStatus === '70_WFL_APPROVE' ||
              t?.processStatus === 'OUT_APPROVE'
            ) {
              return (
                <Item color="#47b881">
                  <Icon type={item?.icon} />
                  <span
                    className="status gray success"
                    style={{
                      cursor: t?.processStatus === '70_WFL_APPROVE' ? 'pointer' : 'none',
                    }}
                    onClick={() => handlePush(t?.processStatus)}
                  >
                    {/* {intl.get(`${modelPrompt}.workflow`).d('工作流')} */}
                    {t?.processStatusMeaning}
                  </span>
                  <div className="date gray">{dateTimeRender(t?.processDate)}</div>
                  <div className="line" />
                </Item>
              );
            } else {
              return (
                <Item color="#E5E5E5">
                  <Icon type={item?.icon || '/'} />
                  <span className="operator" onClick={() => handlePush(t?.processStatus)}>
                    {t?.processUserName}
                  </span>
                  <span className="status gray" onClick={() => handlePush(t?.processStatus)}>
                    {t?.processStatusMeaning}
                  </span>
                  <span className="result" onClick={() => handlePush(t?.processStatus)}>
                    {intl.get(`${modelPrompt}.TagTrxNum`).d('【收货单】')}
                  </span>
                  {t?.processRemark && (
                    <div className="remark gray">
                      <span className="status gray">{t?.processUserName}</span>
                      <span className="status gray">
                        {intl.get('sinv.common.model.common.remarked').d('备注了')}
                      </span>
                      <span className="status gray">{t?.processRemark}</span>
                    </div>
                  )}
                  <div className="date gray">{dateTimeRender(t?.processDate)}</div>
                  <div className="line" />
                </Item>
              );
            }
          })}
        {!operateData?.length && !operateLoading && handleNoData()}
      </Timeline>
    </Spin>
  );
};

export default Ele;
