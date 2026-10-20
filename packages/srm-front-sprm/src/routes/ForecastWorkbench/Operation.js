/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-08-01 17:51:45
 * @LastEditors: yanglin
 * @LastEditTime: 2024-04-02 17:40:33
 */
import React, { useEffect, useState, useCallback } from 'react';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { Timeline, Icon, Spin } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { SRM_SPRM } from '_utils/config';

import { getCurrentOrganizationId } from 'utils/utils';

import style from './index.less';

const { Item } = Timeline;

const Index = ({ fcstHeaderId, operateLineDs, modal }) => {
  const [loading, setLoading] = useState(false);
  const [actionData, setActionData] = useState([]);

  useEffect(() => {
    handleQuery({});
  }, [handleQuery]);

  useEffect(() => {
    handleUpdateFooterBtn();
  }, [handleUpdateFooterBtn]);

  const getQueryParams = useCallback(() => {
    return {
      ...(operateLineDs.getState('queryParams')),
      fcstHeaderId,
    };
  }, [fcstHeaderId, operateLineDs]);

  const handleUpdateFooterBtn =useCallback(() => {
    if (modal) {
      modal.update({
        footer: (okBtn) => [
          okBtn,
          <ExcelExportPro
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            templateCode='SPRM_FCST_ACTION_EXPORT' // 导出模板编码
            exportAsync
            otherButtonProps={{
              type: 'c7n-pro',
            }}
            requestUrl={`${SRM_SPRM}/v1/${getCurrentOrganizationId()}/fcst-actions/record/export`}
            queryParams={() => getQueryParams()}
            allBody
            method="POST"
          />,
        ],
      });
    }
  }, [modal, getQueryParams]);

  const handleQuery = useCallback((params) => {
    const { processedDateRange, ...other } = params?.params || {};
    const [createDateStr, createDateEnd] = processedDateRange?.split(',') || [];
    const queryParams = { createDateStr, createDateEnd, ...other };
    operateLineDs.setState({ queryParams });
    setLoading(true);
    // NEW RELEASE  UNLOCK  UPDATE  NEWLINE  DELETE
    operateLineDs.query(0, queryParams).then(res => {
      setActionData(res);
      setLoading(false);
    });
  }, [operateLineDs]);

  //
  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get(`hzero.common.components.noticeIcon.null`).d('暂无数据')}</span>
      </div>
    );
  };

  const renderOperateHistory = () => {
    return (
      <Spin spinning={loading}>
        {actionData.length > 0 && (
          <Timeline className="operating-timeline">
            {actionData?.map(ele => (
              <Item color="#e5e5e5">
                <Icon type="publish2" style={{ fontSize: 14, marginTop: '2px' }} />
                <div className="operating-timeline-info">
                  <span className="operator">{ele.processUserName}</span>
                  <span className="status gray">
                    {ele.processTypeCode === 'RELEASE'
                      ? intl.get('sprm.forecastMgt.model.common.release').d('发布了')
                      : ele.processTypeCodeMeaning}
                  </span>
                  {ele.processTypeCode === 'RELEASE' ? (
                    <span className="result">
                      {`${ele.version}`
                        ? `${intl.get('sprm.forecastMgt.model.common.forecastBill').d('预测单')}-${
                            ele.version
                          }`
                        : `${intl.get('sprm.forecastMgt.model.common.forecastBill').d('预测单')}`}
                    </span>
                  ) : (
                    <span className="result">
                      {`${intl.get('sprm.forecastMgt.model.common.forecastBill').d('预测单')}`}
                    </span>
                  )}
                  {ele.processTypeCode === 'REJECTED' && (
                    <span className="status gray" style={{ marginLeft: '4px' }}>
                      {`${intl
                        .get('sprm.forecastMgt.model.common.rejectReason')
                        .d('审批拒绝原因')}：${ele.processRemark || ''}`}
                    </span>
                  )}
                  <div className="date gray">{dateTimeRender(ele.processDate)}</div>
                </div>
              </Item>
            ))}
          </Timeline>
        )}
        {!actionData?.length && handleNoData()}
      </Spin>
    );
  };

  return (
    <div className={style.operating}>
      <FilterBar
        dataSet={[operateLineDs]}
        onQuery={handleQuery}
        autoQuery={false}
        expandable={false}
      />
      {renderOperateHistory()}
    </div>
);
};

export default formatterCollections({
  code: ['sprm.forecastMgt'],
})(Index);
