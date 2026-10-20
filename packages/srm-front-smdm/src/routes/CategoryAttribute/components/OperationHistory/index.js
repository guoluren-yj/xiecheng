/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-09-20 10:52:14
 * @LastEditors: yanglin
 * @LastEditTime: 2022-09-21 17:40:24
 */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { Timeline, Icon, Spin } from 'choerodon-ui';
import { isEmpty, isArray } from 'lodash';
// import MoreAndLess from './MoreAndLess';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryAction } from '@/services/categoryAttributeService';

import style from './index.less';

const { Item } = Timeline;
const commonPrompt = 'smdm.common.model.common';

const Index = ({ templateId }) => {
  const [classifiedData, setClassified] = useState([]);
  const [dataKey, setDataKey] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const currentStatus = (type, processTypeMeaning) => {
    let icon = 'person_pin_circle';
    switch (true) {
      case ['NEW', 'NEW_PROPERTY'].includes(type):
        icon = 'add';
        break;
      case ['DELETE', 'DELETE_PROPERTY'].includes(type):
        icon = 'delete';
        break;
      case ['EDIT', 'EDIT_PROPERTY', 'EDIT_PROPERTY_ASSIGN', 'EDIT_CATEGORY_ASSIGN'].includes(type):
        icon = 'mode_edit';
        break;
      default:
        break;
    }
    return { icon, processTypeMeaning };
  };

  useEffect(() => {
    setActionLoading(true);
    queryAction(templateId)
      .then((res) => {
        if (getResponse(res)) {
          if (isArray(res)) {
            const currentItem = [];
            const batchNoArray = Array.from(
              new Set(
                res.map((ele) => {
                  if (ele.batchNo) {
                    return ele.batchNo;
                  } else {
                    return ele.creationDate;
                  }
                })
              )
            );
            batchNoArray.forEach((item) => {
              currentItem.push(
                res.filter((ele) => ele.batchNo === item || ele.creationDate === item)
              );
            });
            const classified = currentItem.map((ele, index) => {
              dataKey[index] = 'off';
              // 只会展示1行动作的, 新建 ,审批通过,审批拒绝,删除,取消,撤回
              if (ele.length === 1 && ['NEW', 'DELETE'].includes(ele[0].processType)) {
                const { processType, processTypeMeaning } = ele[0];
                const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
                return {
                  ...ele[0],
                  ...iconAndProcessMeaning,
                  list: [],
                };
                // 'UPDATE', 'UPDATE_LINE', 'DELETE_LINE', 'NEW_PROPERTY', 'CANCEL_LINE'
                // 会展示多行 更新、更新行、变更 新增行 删除行
              } else {
                const { processType, processTypeMeaning } = ele[0];
                const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
                return {
                  processType: ele[0].processType,
                  creationDate: ele[0].creationDate,
                  processUserName: ele[0].processUserName,
                  // lineNum: ele[0].lineNum,
                  cancelRemark: '',
                  icon: 'mode_edit',
                  ...iconAndProcessMeaning,
                  list: ele,
                };
              }
            });
            setClassified(classified);
          }
        }
      })
      .finally(() => {
        setActionLoading(false);
      });
  }, [templateId]);

  return (
    <div className={style.operating}>
      <Spin spinning={actionLoading}>
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
                  {`【${intl.get(`${commonPrompt}.templateAttribute`).d('模版属性')}】`}
                </span>
                {!isEmpty(item.list) && (
                  <Icon type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'} />
                )}
                {item.list &&
                  dataKey[index] === 'on' &&
                  item.list.map((ele) => {
                    if (
                      [
                        'EDIT_PROPERTY_ASSIGN',
                        'EDIT_CATEGORY_ASSIGN',
                        'EDIT',
                        'EDIT_PROPERTY',
                      ].includes(ele.processType)
                    ) {
                      return (
                        <div className="date">
                          <span className="status gray">{ele.processUserName}</span>
                          <span className="status gray">
                            {intl.get(`${commonPrompt}.jiang`).d('将')}
                          </span>
                          <span className="status gray">
                            {ele.processType === 'EDIT_PROPERTY_ASSIGN'
                              ? `${intl
                                  .get(`${commonPrompt}.contactAttributeValue`)
                                  .d('关联属性值')}`
                              : ele.processType === 'EDIT_CATEGORY_ASSIGN'
                              ? `${intl.get(`${commonPrompt}.contactCategory`).d('关联品类')}`
                              : `【${ele.processFieldMeaning}】`}
                          </span>
                          {intl.get(`${commonPrompt}.you`).d('由')}
                          <span className="status gray">{`【${ele.oldValue}】`}</span>
                          {intl.get(`${commonPrompt}.change`).d('改成')}
                          <span className="status gray">{`【${ele.newValue}】,`}</span>

                          {['EDIT_PROPERTY', 'EDIT_PROPERTY_ASSIGN'].includes(item.processType) && (
                            <span className="status gray">
                              {intl.get(`${commonPrompt}.attributeCode`).d('属性编码')}
                              <span className="status gray">【{ele.attributeCode}】</span>
                            </span>
                          )}
                        </div>
                      );
                    } else if (['NEW_PROPERTY', 'DELETE_PROPERTY'].includes(ele.processType)) {
                      return (
                        <div className="date">
                          <span className="status gray">
                            {`${ele.processUserName} ${ele.processTypeMeaning}【${ele.attributeCode}】`}
                          </span>
                        </div>
                      );
                    } else {
                      return <div />;
                    }
                  })}
                <div className="date gray">{dateTimeRender(item.creationDate)}</div>
              </div>
            </Item>
          ))}
        </Timeline>
      </Spin>
    </div>
  );
};

export default formatterCollections({
  code: ['hwfp.common', 'hwfp.task', 'hwfp.monitor', 'hpfm.organization'],
})(Index);
