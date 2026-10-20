/* eslint-disable no-param-reassign */
import React, { useState, useEffect, forwardRef } from 'react';
import intl from 'utils/intl';
import { Tooltip, Icon, CheckBox, Output } from 'choerodon-ui/pro';
import { Spin, Tag } from 'choerodon-ui';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import uuid from 'uuid/v4';

import { fetchDetailConfig } from '@/services/riskScanConfig/schemaConfigService';
import styles from './index.less';

const ScanProject = forwardRef((props, ref) => {
  const { remote, localId, scanWorkbench = {}, onFetch = () => {} } = props;
  const { scanConfigDetail = {} } = scanWorkbench || {};
  const { autoFlag } = scanConfigDetail || {};

  const [treeList, setTreeList] = useState([]);
  const [dataDetail, setDetail] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localId) {
      handleQueryDetail();
    }
  }, [localId]);

  const handleQueryDetail = async () => {
    setLoading(true);
    onFetch(true);
    const detail = await fetchDetailConfig({
      riskPlanId: localId,
      planContentType: 'item',
      planType: 'SCAN',
    });

    onFetch(false);
    setLoading(false);
    if (getResponse(detail)) {
      const treeData = detail?.riskPlanItemTreeList ?? [];
      const scanTreeData = detail?.riskPlanScanItemTreeList ?? [];

      const { originList } = handleAddKey([...scanTreeData, ...treeData]);

      setDetail(detail);
      setTreeList(originList);
    }
  };

  const handleAddKey = (arr = []) => {
    const originList = [...arr];
    const rtnList = [];

    const loopList = (list = []) => {
      if (list.length) {
        list.forEach(item => {
          const str = item && item.itemStrategy ? item.itemStrategy : '';
          // 提取 >= 和 <= 后面的数字
          const greaterEqualMatch = str.match(/>= *(\d+)/);
          const lessEqualMatch = str.match(/<= *(\d+)/);
          const matches = [
            greaterEqualMatch ? greaterEqualMatch[1] : '0',
            lessEqualMatch ? lessEqualMatch[1] : '0',
          ];

          if (!item._uuid) {
            item._uuid = uuid();
            item.equal = matches.length ? parseInt(matches[0], 10) : 0;
            item.lessThan = matches.length > 1 ? parseInt(matches[1], 10) : 0;
          }

          if (item.children && item.children.length) {
            loopList(item.children); // 从顶级向下兼容 业务风险，顶层为 true，下级均为 true
          } else {
            rtnList.push({
              ...item,
              riskLevel: item?.riskLevel ?? 1,
              itemScore: item?.itemScore ?? 0,
              enabledFlag: item?.enabledFlag ?? 0,
              tenantId: getCurrentOrganizationId(),
            });
          }
        });
      }
    };

    loopList(originList, false);
    return {
      rtnList,
      originList,
    };
  };

  const renderTooltip = text => <Tooltip title={text ?? ''}>{text ?? ''}</Tooltip>;

  const drawCardList = (list = []) => {
    return (list || []).map(item => {
      return remote.render(
        'RISKSCAN_SCHEMA_CONFIG_RENDER_DRAW_CARD_LIST_VIEW_RENDER',
        <div key={item._uuid} className={styles['level-define-card-panel']}>
          <div className={styles['level-define-card-title']}>{renderTooltip(item?.itemName)}</div>
          <>{item?.children?.length > 0 && item.scanFlag === 0 && drawSecondLevel(item.children)}</>
          <div className={styles['level-third-panel']}>
            {item?.children?.length > 0 && item.scanFlag === 1 && drawThirdLevel(item.children)}
          </div>
        </div>,
        { item, renderTooltip, drawSecondLevel, drawThirdLevel }
      );
    });
  };

  const drawSecondLevel = list => {
    return (list || []).map(item => {
      // endFlag 为 0 非末级，绘制 title，为 1 绘制风险项及上级全选按钮
      const endFlag = item?.endFlag ?? 0;

      return remote.render(
        'RISKSCAN_SCHEMA_CONFIG_RENDER_DRAW_SECOND_LEVEL_VIEW_RENDER',
        <>
          {[1, '1'].includes(endFlag) ? (
            <div key={item._uuid}>
              <div className={styles['level-define-card-second-level']}>
                <div className={styles['card-second-title']}>
                  <Tooltip title={item?.itemName ?? ''}>{item?.itemName ?? ''}</Tooltip>
                </div>
              </div>
              <div className={styles['level-third-panel']}>
                {drawThirdLevel(item?.children ?? [])}
              </div>
            </div>
          ) : (
            <div
              key={item._uuid}
              className={styles['level-define-card-panel']}
              style={{ border: '1px solid #e5e7ec', borderRadius: '2px' }}
            >
              <div className={styles['level-define-card-title']}>
                <Tooltip title={item?.itemName ?? ''}>{item?.itemName ?? ''}</Tooltip>
              </div>
              <>{drawSecondLevel(item?.children ?? [])}</>
            </div>
          )}
        </>,
        { endFlag, item, drawThirdLevel, drawSecondLevel, renderTooltip }
      );
    });
  };

  const drawThirdLevel = list => {
    return (list || []).map(item => {
      const value = item.riskLevel;
      const { enabledFlag = false } = item || {};

      const classNames = [3, '3'].includes(value)
        ? styles['risk-high-level-tag']
        : [2, '2'].includes(value)
        ? styles['risk-middle-level-tag']
        : styles['risk-low-level-tag'];

      const text = value
        ? [3, '3'].includes(value)
          ? intl.get('hzero.common.priority.high').d('高')
          : [2, '2'].includes(value)
          ? intl.get('hzero.common.priority.medium').d('中')
          : intl.get('hzero.common.priority.low').d('低')
        : '';

      const rangeFlag = item?.dsMatchType === 'BETWEEN';

      return rangeFlag ? (
        <div key={item._uuid} className={styles['card-range-item']}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '22px',
            }}
          >
            <div style={{ display: 'flex' }}>
              <CheckBox disabled checked={enabledFlag}>
                <Tooltip title={item?.itemName ?? ''}>
                  <span className={styles['card-level-item-title-name']}>
                    {item?.itemName ?? ''}
                  </span>
                </Tooltip>
              </CheckBox>
              {item.scanFlag === 0 && !(item?.dsType != 'BIZ' && !item?.scriptCode) ? (
                <span
                  style={{
                    padding: '1px 2px',
                    color: '#f06200',
                    background: 'rgba(242, 128, 26, 0.15)',
                    borderRadius: '2px',
                  }}
                >
                  {intl.get('hzero.common.custom').d('自定义')}
                </span>
              ) : null}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {item.scanFlag === 0 ? (
                <span
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: '16px',
                  }}
                >
                  {text ? (
                    <Tag className={classNames} style={{ margin: '0 4px' }}>
                      {text}
                    </Tag>
                  ) : null}
                </span>
              ) : null}
              {item.scanFlag === 0 ? (
                <Output
                  value={item.itemScore}
                  style={{ width: '90px' }}
                  min={0}
                  max={100}
                  step={1}
                />
              ) : null}
            </div>
          </div>
          <div style={{ margin: '8px 0 0', color: '#1D2129' }}>
            {`${item.equal} <= ${item.itemName} <= ${item.lessThan}`}
          </div>
        </div>
      ) : (
        <div key={item._uuid} className={styles['card-level-item']}>
          <div className={styles['card-level-item-title']}>
            <CheckBox disabled checked={enabledFlag}>
              <Tooltip title={item?.itemName ?? ''}>
                <span className={styles['card-level-item-title-name']}>{item?.itemName ?? ''}</span>
              </Tooltip>
            </CheckBox>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {item.scanFlag === 0 ? (
              <span
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '16px',
                }}
              >
                {text ? (
                  <Tag className={classNames} style={{ margin: '0 4px' }}>
                    {text}
                  </Tag>
                ) : null}
              </span>
            ) : null}
            {item.scanFlag === 0 ? <div style={{ width: '90px' }}>{item.itemScore}</div> : null}
          </div>
        </div>
      );
    });
  };

  return (
    <Spin spinning={loading}>
      <div ref={ref} className={styles['scan-project-basic']}>
        {remote.render(
          'RISKSCAN_SCHEMA_CONFIG_RENDER_SCAN_PLAN_PRECOMPUTE_VIEW_CARD',
          <>
            <div
              className={styles['level-define-card-list']}
              style={{
                flex: [1, '1'].includes(autoFlag) ? 1 : 0,
                paddingBottom: [1, '1'].includes(autoFlag) ? '80px' : 0,
              }}
            >
              {treeList && treeList.length ? drawCardList(treeList) : null}
            </div>

            <div className={styles['level-define-card-panel-bottom']}>
              {[1, '1'].includes(autoFlag) ? (
                <div className={styles['content-top-card-points']}>
                  <div className={styles['content-top-card-points-item']}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Icon type="database" />
                      <div style={{ marginLeft: '8px' }}>
                        {intl
                          .get('sdat.riskScanConfig.view.title.expectedQuota')
                          .d('此方案预计每年消耗额度')}
                      </div>
                    </div>
                    <span>{dataDetail?.scanCostTotal ?? 0}</span>
                  </div>

                  <Icon
                    type="drag_handle"
                    style={{
                      margin: '0 8px',
                      color: '#1D2129',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  />
                  <div className={styles['content-top-card-points-item']}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Icon type="date_range-o" style={{ color: '#3BB346' }} />
                      <div style={{ marginLeft: '8px' }}>
                        {intl.get('sdat.riskScanConfig.view.title.scanFrequency').d('扫描频率')}
                      </div>
                    </div>
                    <span>{dataDetail?.scanFrequencyTotal ?? 0}</span>
                  </div>

                  <Icon
                    type="close"
                    style={{
                      margin: '0 8px',
                      color: '#1D2129',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  />
                  <div className={styles['content-top-card-points-item']}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Icon type="corporate_fare" style={{ color: '#00B8CC' }} />
                      <div style={{ marginLeft: '8px' }}>
                        {intl.get('sdat.riskScanConfig.view.title.scanCompany').d('扫描企业')}
                      </div>
                    </div>
                    <span>{dataDetail?.scanCompanyTotal ?? 0}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </>,
          {
            dataDetail,
            autoFlag,
            treeList,
            drawCardList,
          }
        )}
      </div>
    </Spin>
  );
});

export default ScanProject;
