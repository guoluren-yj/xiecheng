/*
 * SupplierLifeCycle - 供应商生命周期
 * @Date: 2023-08-16 13:55:38
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Icon } from 'choerodon-ui/pro';
import React, { Fragment, useEffect, useState } from 'react';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';

import { getTooltipShow } from '@/routes/components/utils';
import { handleMenuPermissions, handleToDetail } from '@/routes/components/utils/utils';
import { ReactComponent as DegradedIcon } from '@/assets/360Query/degraded.svg';
import { ReactComponent as UpgradeIcon } from '@/assets/360Query/upgrade.svg';

import styles from './index.less';

// 需跳转详情的动作
const needJumpList = [
  'MANUALLY',
  'SITE_APPROVE',
  'INVESTG_APPROVE',
  'SAMPLE_SEND_CONFIRM',
  'KPI_APPROVE',
  'SITE_REPORT_APPROVE',
  'LIFE_CYCLE_DUE',
  'STRATEGY_NDAYNOORDER',
  'STRATEGY_RULE',
];
// 生命周期触发的自动升降级集合
const lifeCycleList = ['LIFE_CYCLE_DUE', 'STRATEGY_NDAYNOORDER', 'STRATEGY_RULE', 'MANUALLY'];

const Index = ({ dispatch, dataSource, wrapStyle = {} }) => {
  const [menuPermission, setMenuPermission] = useState({});

  useEffect(() => {
    queryMenuPermissions();
  }, []);

  // 查询菜单权限集
  const queryMenuPermissions = async () => {
    const permissions = await handleMenuPermissions();
    setMenuPermission(permissions);
  };

  // 处理【单据】渲染
  const renderRelationNumber = (data = {}) => {
    const { relationNumber, documentFrom } = data;
    if (relationNumber) {
      // documentFrom为null,表示手动新建的单据
      if (!documentFrom || needJumpList.includes(documentFrom)) {
        const documentType =
          !documentFrom || lifeCycleList.includes(documentFrom) ? 'LIFE_CYCLE' : documentFrom;
        return (
          <a onClick={() => handleToDetail({ data, dispatch, documentType, menuPermission })}>
            {relationNumber}
          </a>
        );
      } else {
        return relationNumber;
      }
    } else {
      return intl.get('sslm.common.view.message.without').d('无');
    }
  };

  return (
    <div className={styles['life-cycle-wrap-one']} style={wrapStyle}>
      <div className="life-cycle-wrap-two">
        <div className="life-cycle-container">
          <div className="life-cycle-card">
            {dataSource.map(data => (
              <Fragment>
                <div className="life-cycle-card-divider" />
                <div className="life-cycle-card-wrap">
                  <div className="life-cycle-card-content">
                    <div className="life-cycle-card-content-head">
                      <div className="life-cycle-card-content-head-left">
                        <Icon type="date_range" />
                        {dateRender(data.reqProcessDate) ||
                          intl
                            .get('sslm.common.model.promotionAndDemotion.current')
                            .d('本次升降级')}
                      </div>
                      <div className="life-cycle-card-content-head-right">
                        {data.gradeCode && data.fromStageDesc && (
                          <Fragment>
                            <span className="ife-cycle-stage">
                              {getTooltipShow(data.fromStageDesc, 12, 48)}
                            </span>
                            {data.gradeCode === 'DEGRADE' ? <DegradedIcon /> : <UpgradeIcon />}
                          </Fragment>
                        )}
                        <span className="ife-cycle-stage">
                          {getTooltipShow(data.toStageDesc, 12, 48)}
                        </span>
                      </div>
                    </div>
                    <div className="life-cycle-card-content-footer">
                      <div>
                        <span>{intl.get('sslm.common.model.title.action').d('动作')}</span>
                        {getTooltipShow(
                          data.documentFromMeaning ||
                            intl.get('sslm.common.model.type.manualInitiation').d('手工发起升降级'),
                          12,
                          176
                        )}
                      </div>
                      <div>
                        <span>{intl.get('sslm.common.model.title.receipts').d('单据')}</span>
                        <span>{renderRelationNumber(data)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
