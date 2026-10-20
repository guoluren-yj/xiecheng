import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { Timeline, Icon, Spin, Collapse } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { SRM_SSLM } from '_utils/config';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import style from '../index.less';

const { Item } = Timeline;
const { Panel } = Collapse;

const operateDs = () => ({
  autoCreate: false,
  autoQuery: false,
  paging: false,
  fields: [],
  transport: {
    read: () => {
      return {
        url: `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/export-cf-records`,
        method: 'GET',
      };
    },
  },
});

const Index = (props = {}) => {
  const { recordData: { cfCode, cfCategory } = {} } = props || {};
  const [loading, setLoading] = useState(false);
  const operateLineDs = new DataSet(operateDs());
  operateLineDs.setQueryParameter('cfCode', cfCode);
  operateLineDs.setQueryParameter('cfCategory', cfCategory);
  const [actionData, setActionData] = useState([]);
  const operation = {
    update: {
      meaning: intl.get('sslm.common.view.message.update').d('更新了'),
      icon: 'mode_edit',
    },
    delete: { meaning: intl.get('sslm.common.view.message.delete').d('删除了'), icon: 'delete' },
    add: {
      meaning: intl.get(`hzero.common.button.create`).d('新建'),
      icon: 'add',
    },
  };
  const updateValue = {
    enableFlag: intl.get(`hzero.common.status.enableFlag`).d('启用'),
    syncErpFlag: intl
      .get(`sslm.supplierEventConfig.model.eventConfig.generateErp`)
      .d('生成erp供应商'),
    writeErpFlag: intl
      .get(`sslm.supplierEventConfig.model.eventConfig.writeErp`)
      .d('回写erp供应商数据'),
    documentLevelFlag: intl
      .get(`sslm.supplierEventConfig.model.eventConfig.documentLevel`)
      .d('集团级数据管控'),
    syncFlag: intl.get(`sslm.supplierEventConfig.model.eventConfig.asyncInterface`).d('异步接口'),
    targetSystem: intl
      .get(`sslm.supplierEventConfig.model.eventConfig.targetSystem`)
      .d('多方外部系统'),
    line: intl.get(`sslm.supplierEventConfig.model.supplierEventConfig.cfName`).d('数据项'),
    tactics: intl.get('sslm.supplierEventConfig.view.card.standardCondition').d('标准条件规则'),
    tacticsCustomize: intl
      .get('sslm.supplierEventConfig.view.card.expandCondition')
      .d('拓展条件规则'),
  };
  useEffect(() => {
    setLoading(true);
    operateLineDs
      .query()
      .then(res => {
        if (getResponse(res)) {
          setActionData(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cfCode, cfCategory]);

  const handleNoData = () => {
    return (
      <div className={style['nodata-wrapper']}>
        <span>{intl.get(`hzero.common.components.noticeIcon.null`).d('暂无数据')}</span>
      </div>
    );
  };

  const renderOperateHistory = () => {
    return (
      <Spin spinning={loading}>
        {actionData.length > 0 && (
          <Timeline className={style['supplier-event-operating-timeline']}>
            {actionData.map(ele => (
              <Item color="#e5e5e5">
                {ele.changeType === 'update' ? (
                  <Collapse
                    ghost
                    expandIconPosition="text-right"
                    expandIcon={panelProps => {
                      return (
                        <Icon type={(panelProps || {}).isActive ? 'expand_less' : 'expand_more'} />
                      );
                    }}
                    trigger="text-icon"
                  >
                    <Panel
                      key={ele.exportCfRecordId}
                      header={
                        <span>
                          <Icon type={(operation[ele.changeType] || {}).icon} />
                          <span className="operating-timeline-padding">
                            <span className={style['']}>{ele.createByName}</span>{' '}
                            {(operation[ele.changeType] || {}).meaning}{' '}
                            <span>【{ele.operationObjectDescription}】</span>
                          </span>
                        </span>
                      }
                    >
                      {(ele.updateDetails || []).map(item => (
                        <span className="gray">
                          {intl
                            .get('sslm.common.view.message.operateLog', {
                              updateKey: updateValue[item.filed] || item.filed,
                              oldValue: item.oldValue,
                              newValue: item.newValue,
                            })
                            .d(
                              `${updateValue[item.filed]}由【${item.oldValue}】改为【${
                                item.newValue
                              }】`
                            )}
                        </span>
                      ))}
                    </Panel>
                  </Collapse>
                ) : (
                  <span>
                    <Icon type={(operation[ele.changeType] || {}).icon} />
                    <span className="operating-timeline-padding">
                      <span>{ele.createByName}</span> {(operation[ele.changeType] || {}).meaning}{' '}
                      <span>【{ele.operationObjectDescription}】</span>
                    </span>
                  </span>
                )}
                <div className="operating-timeline-info">
                  <div className="date">{dateTimeRender(ele.creationDate)}</div>
                </div>
              </Item>
            ))}
          </Timeline>
        )}
        {!loading && !(actionData || []).length && handleNoData()}
      </Spin>
    );
  };

  return <div>{renderOperateHistory()}</div>;
};

export default Index;
