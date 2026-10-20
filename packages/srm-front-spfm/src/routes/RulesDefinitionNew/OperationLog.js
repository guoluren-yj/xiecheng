import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { Timeline, Icon, Spin, Collapse } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { SRM_PLATFORM } from '_utils/config';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import style from './index.less';

const { Item } = Timeline;
const { Panel } = Collapse;

const operateDs = data => ({
  autoCreate: false,
  autoQuery: false,
  paging: false,
  fields: [],
  transport: {
    read: {
      url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/cnf-action-historys`, // 获取历史版本数据接口名
      method: 'GET',
      data,
    },
  },
});

const Index = ({ fullpathCode }) => {
  const [loading, setLoading] = useState(false);
  const operateLineDs = new DataSet(operateDs({ fullpathCode }));
  const [actionData, setActionData] = useState([]);
  const operation = {
    update: {
      meaning: intl.get('spfm.rulesDefinition.model.update').d('更新了'),
      icon: 'mode_edit',
    }, // operationType: update,delete,update
    delete: { meaning: intl.get('spfm.rulesDefinition.model.delete').d('删除了'), icon: 'delete' },
    add: { meaning: intl.get('spfm.rulesDefinition.model.add').d('新增了'), icon: 'add' },
  };
  const updateValue = {
    actionName: intl.get('spfm.rulesDefinition.model.rulesDefinition.actionName').d('策略名称'),
    priority: intl.get('spfm.rulesDefinition.model.rulesDefinition.priority').d('优先级'),
    description: intl
      .get('spfm.rulesDefinition.model.rulesDefinition.actionDescription')
      .d('策略描述'),
    conditionExpression: intl.get('spfm.rulesDefinition.view.card.condition').d('条件规则'),
    value: intl.get('spfm.rulesDefinition.view.card.policyConfig').d('执行规则'),
  };
  useEffect(() => {
    setLoading(true);
    // NEW RELEASE  UNLOCK  UPDATE  NEWLINE  DELETE
    operateLineDs
      .query()
      .then(res => {
        setActionData(res);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fullpathCode]);

  //
  const handleNoData = () => {
    return (
      <div className={style.nodata_wrapper}>
        <span>{intl.get(`hzero.common.components.noticeIcon.null`).d('暂无数据')}</span>
      </div>
    );
  };

  const renderOperateHistory = () => {
    if (loading) {
      return <Spin spinning />;
    }
    if (!actionData || !actionData.length) {
      return handleNoData();
    }
    return (
      <Timeline className={style['rule-definition-operating-timeline']}>
        {actionData.map(ele => (
          <Item color="#e5e5e5">
            {ele?.operationType === 'update' ? (
              <Collapse
                ghost
                expandIconPosition="text-right"
                expandIcon={panelProps => (
                  <Icon type={panelProps?.isActive ? 'expand_less' : 'expand_more'} />
                )}
                trigger="text-icon"
              >
                <Panel
                  key={ele.actionHistoryId}
                  header={
                    <span>
                      <Icon type={operation.update?.icon} />
                      <span className="operating-timeline-padding">
                        {ele.createdByName} {operation.update?.meaning}{' '}
                        {intl.get('spfm.rulesDefinition.view.tab.policy').d('策略')}【
                        {ele.actionName}】
                      </span>
                    </span>
                  }
                >
                  {ele?.updateDetails?.map(item => (
                    <span className="gray">
                      {intl
                        .get('spfm.rulesDefinition.view.operateLog', {
                          updateKey: updateValue[item.filed],
                          oldValue: item?.oldValue,
                          newValue: item?.newValue,
                        })
                        .d(
                          `${updateValue[(item?.filed)]}由【${item?.oldValue}】改为【${
                            item?.newValue
                          }】`
                        )}
                    </span>
                  ))}
                </Panel>
              </Collapse>
            ) : (
              <span>
                <Icon type={operation[(ele?.operationType)]?.icon} />
                <span className="operating-timeline-padding">
                  {ele.createdByName} {operation[(ele?.operationType)]?.meaning}{' '}
                  {intl.get('spfm.rulesDefinition.view.tab.policy').d('策略')}【{ele.actionName}】
                </span>
              </span>
            )}

            <div className="operating-timeline-info">
              <div className="date">{dateTimeRender(ele.creationDate)}</div>
            </div>
          </Item>
        ))}
      </Timeline>
    );
  };

  return renderOperateHistory();
};

export default formatterCollections({
  code: ['sprm.forecastMgt'],
})(Index);
