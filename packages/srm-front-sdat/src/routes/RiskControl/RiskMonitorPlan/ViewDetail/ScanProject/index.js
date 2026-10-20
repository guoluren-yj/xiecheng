/* eslint-disable no-param-reassign */
import React, { useState, useEffect, forwardRef } from 'react';
import intl from 'utils/intl';
import { Tooltip, Dropdown, Menu, CheckBox, Button, Modal } from 'choerodon-ui/pro';
import { Spin, Tag } from 'choerodon-ui';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import uuid from 'uuid/v4';

import { fetchDetailConfig } from '@/services/riskScanConfig/monitorConfigService';

import CompanyAddModal from './CompanyAddModal';
import styles from './index.less';

let scoreMap = {};
let dataMap = {};

const ScanProject = forwardRef((props, ref) => {
  const { localId, onFetch = () => {}, businessListDS } = props;

  const [resultList, setResultList] = useState([]);
  const [treeList, setTreeList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      scoreMap = {};
      dataMap = {};
    };
  }, []);

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
      planType: 'MONITOR',
    });

    onFetch(false);
    setLoading(false);
    if (getResponse(detail)) {
      const treeData = detail?.riskPlanItemTreeList ?? [];
      const configList = detail?.wb2LevelConfigList ?? [];

      if (Array.isArray(configList) && configList.length) {
        configList.forEach(item => {
          scoreMap[item.level] = {
            startScore: item.startScore,
            endScore: item.endScore,
          };
          dataMap[item.level] = { ...item };
        });
      }

      const { rtnList, originList } = handleAddKey(treeData);

      setResultList(rtnList);
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

  /**
   * 添加监控对象
   * @param {*} item
   */
  const handleAddMonitorEnterprise = item => {
    let modal = null;

    const handleCloseModal = () => {
      businessListDS.loadData([]);
      businessListDS.reset();
      modal.close();
    };

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.button.monitorObject').d('监控对象'),
      children: (
        <CompanyAddModal
          businessListDS={businessListDS}
          itemCode={item?.itemCode}
          riskPlanId={localId}
        />
      ),
      closable: true,
      drawer: true,
      mask: false,
      destroyOnClose: true,
      style: { width: '1000px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  const drawCardList = (list = []) => {
    return (list || []).map(item => {
      return (
        <div key={item._uuid} className={styles['level-define-card-panel']}>
          <div
            className={styles['level-define-card-title']}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>{renderTooltip(item?.itemName)}</div>
            <div>
              <a
                style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}
                onClick={() => handleAddMonitorEnterprise(item)}
              >
                {intl
                  .get('sdat.riskScanConfig.view.button.viewMonitorEnterprise')
                  .d('查看监控对象')}
              </a>
            </div>
          </div>
          <>{item?.children?.length > 0 && drawSecondLevel(item.children)}</>
        </div>
      );
    });
  };

  const drawSecondLevel = list => {
    return (list || []).map(item => {
      // endFlag 为 0 非末级，绘制 title，为 1 绘制风险项及上级全选按钮
      const endFlag = item?.endFlag ?? 0;

      return [1, '1'].includes(endFlag) ? (
        <div key={item._uuid}>
          <div className={styles['level-define-card-second-level']}>
            <div className={styles['card-second-title']}>
              <Tooltip title={item?.itemName ?? ''}>{item?.itemName ?? ''}</Tooltip>
            </div>
          </div>
          <div className={styles['level-third-panel']}>{drawThirdLevel(item?.children ?? [])}</div>
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
      );
    });
  };

  /**
   * 修改选中状态或分数值
   * @param {*} event
   * @param {*} item
   * @param {*} type
   */
  const handleChange = (event, item, type) => {
    const value = type === 'check' ? event : type === 'level' ? event : event ?? 0;

    if (type === 'check') {
      changeItem(item, 'check', value);
    } else if (type === 'value') {
      changeItem(item, 'value', value);
    } else if (type === 'level') {
      changeItem(item, 'level', value);
    }
  };

  const changeItem = (obj, typeVal, value) => {
    // 修改节点属性的通用函数
    const modifyItem = (item, type, val) => {
      if (type === 'check') {
        item.enabledFlag = val ? 1 : 0;
      } else if (type === 'value') {
        item.itemScore = parseInt(val, 10);
      } else if (type === 'level') {
        item.riskLevel = val;
      }
    };

    // 遍历树形结构的递归函数
    const loopList = (list, source, type, val) => {
      for (const item of list) {
        if (item._uuid === source._uuid) {
          modifyItem(item, type, val); // 找到目标节点并修改
          return true; // 提前终止遍历
        }
        if (item.children && item.children.length) {
          const found = loopList(item.children, source, type, val);
          if (found) return true; // 如果子节点中找到目标，提前终止
        }
      }
      return false; // 未找到目标节点
    };

    // 先遍历 resultList
    for (const item of resultList) {
      if (item._uuid === obj._uuid) {
        modifyItem(item, typeVal, value); // 找到目标节点并修改
        break; // 提前终止遍历
      }
    }

    const localList = JSON.parse(JSON.stringify(treeList));
    loopList(localList, obj, typeVal, value);

    setTreeList(localList);
  };

  const menu = item => {
    return (
      <Menu>
        <Menu.Item onClick={() => handleChange(3, item, 'level')}>
          <span className={styles['risk-high-level-tag']}>
            {intl.get('hzero.common.priority.high').d('高')}
          </span>
        </Menu.Item>
        <Menu.Item onClick={() => handleChange(2, item, 'level')}>
          <span className={styles['risk-middle-level-tag']}>
            {intl.get('hzero.common.priority.medium').d('中')}
          </span>
        </Menu.Item>
        <Menu.Item onClick={() => handleChange(1, item, 'level')}>
          <span className={styles['risk-low-level-tag']}>
            {intl.get('hzero.common.priority.low').d('低')}
          </span>
        </Menu.Item>
      </Menu>
    );
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
            </div>
            <Dropdown disabled overlay={() => menu(item)} trigger={['click']}>
              <span
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '8px',
                }}
              >
                {text ? (
                  <Tag className={classNames} style={{ margin: '0 4px' }}>
                    {text}
                  </Tag>
                ) : null}
              </span>
            </Dropdown>
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

          <Dropdown disabled overlay={() => menu(item)} trigger={['click']}>
            <span
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                marginLeft: '8px',
              }}
            >
              {text ? (
                <Tag className={classNames} style={{ margin: '0 4px' }}>
                  {text}
                </Tag>
              ) : null}
            </span>
          </Dropdown>
        </div>
      );
    });
  };

  return (
    <Spin spinning={loading}>
      <div ref={ref} className={styles['scan-project-basic']}>
        <div className={styles['level-define-card-list']}>
          {treeList && treeList.length ? drawCardList(treeList) : null}
        </div>
      </div>
    </Spin>
  );
});

export default ScanProject;
