import React, { useEffect, useState } from 'react';
import { Timeline, Icon, Spin } from 'choerodon-ui';
import { isEmpty, isArray } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { ReactComponent as NoRecord } from '@/assets/noRecord.svg';
import { fetchEditReocrd } from '@/services/budgetService';

import styles from './index.less';

const commonPrompt = 'sbdm.common.model.common';

const { Item } = Timeline;
const OperationHistory = ({ budgetLineId }) => {
  const [classifiedData, setClassified] = useState([]);
  const [dataKey, setDataKey] = useState([]);
  const [operaLoading, setOperaLoading] = useState(false);
  useEffect(() => {
    // 调整记录
    setOperaLoading(true);
    fetchEditReocrd(budgetLineId)
      .then(res => {
        if (res && isArray(res)) {
          const currentItem = [];
          const batchNoArray = Array.from(
            new Set(
              res.map(ele => {
                if (ele.batchNo) {
                  return ele.batchNo;
                } else {
                  return ele.creationDate;
                }
              })
            )
          );
          batchNoArray.forEach(item => {
            currentItem.push(res.filter(ele => ele.batchNo === item || ele.creationDate === item));
          });
          const classified = currentItem.map((ele, index) => {
            dataKey[index] = 'off';

            const { processType, processTypeMeaning } = ele[0] || {};
            const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
            return {
              processType: ele[0]?.processType,
              creationDate: ele[0]?.creationDate,
              processUserName: ele[0]?.processUserName,
              // lineNum: ele[0].lineNum,
              reason: ele[0]?.reason,
              icon: 'mode_edit',
              ...iconAndProcessMeaning,
              list: ele,
            };
          });
          setClassified(classified);
        }
      })
      .finally(() => setOperaLoading(false));
  }, [budgetLineId]);

  const currentStatus = (type, processTypeMeaning) => {
    const icon = 'mode_edit';
    switch (true) {
      // case ['CANCEL'].includes(type):
      //   icon = 'cancel';
      //   break;
      default:
        break;
    }
    return { icon, processTypeMeaning };
  };

  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <NoRecord />
        <span style={{ marginTop: '16px', color: '#868D9C' }}>
          {intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}
        </span>
      </div>
    );
  };

  const renderOperateHistory = () => {
    return (
      <Spin spinning={operaLoading}>
        <Timeline className="operating-timeline">
          {classifiedData.map((item, index) => (
            <Item
              color={item.color || '#E5E5E5'}
              onClick={() => {
                const [...current] = dataKey;
                current[index] = current[index] === 'on' ? 'off' : 'on';
                setDataKey(current);
              }}
            >
              <Icon type={item.icon} style={{ fontSize: 14 }} />
              <div className="operating-timeline-info">
                <span className="operator">{item.processUserName}</span>
                <span className="status gray">{item.processTypeMeaning}</span>
                <span className="result">
                  {intl.get(`${commonPrompt}.BudgetTitle`).d('预算编制')}
                </span>
                {!isEmpty(item.list) && (
                  <Icon
                    type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'}
                    style={{ fontSize: 14 }}
                  />
                )}
                {item.list &&
                  dataKey[index] === 'on' &&
                  item.list.map(ele => {
                    if (ele.processType === 'EDIT' || ele.processType === 'SUBMIT_EDIT') {
                      return (
                        <div className="date">
                          <span className="status gray">{ele.processUserName}</span>
                          <span className="status gray">
                            {intl.get(`${commonPrompt}.jiang`).d('将')}
                          </span>
                          {['SUBMIT_EDIT', 'EDIT'].includes(item.processType) && (
                            <span className="status gray">
                              {intl.get(`${commonPrompt}.lineNum`).d('行号')}【{ele.lineNum}】
                              {intl.get(`${commonPrompt}.of`).d('的')}
                            </span>
                          )}
                          <span className="status gray">【{ele.processRemark}】</span>
                          {intl.get(`${commonPrompt}.you`).d('由')}
                          <span className="status gray">【{ele.oldValue}】</span>
                          {intl.get(`${commonPrompt}.edit`).d('修改为')}
                          <span className="status gray">【{ele.newValue}】</span>
                        </div>
                      );
                    } else {
                      return null;
                    }
                  })}
                <div className="date gray">{dateTimeRender(item.creationDate)}</div>
              </div>
            </Item>
          ))}
        </Timeline>
      </Spin>
    );
  };

  return (
    <div className={styles.operating}>
      {!classifiedData.length && handleNoData()}
      {!!classifiedData.length && (
        <div className={styles['scroll-content']}>{renderOperateHistory()}</div>
      )}
    </div>
  );
};

export default formatterCollections({
  code: ['hzero.common', 'srpm.common'],
})(OperationHistory);
