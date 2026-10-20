/* eslint-disable no-param-reassign */
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import intl from 'utils/intl';
import _ from 'lodash';
import notification from 'utils/notification';
import {
  DataSet,
  CheckBox,
  NumberField,
  Tooltip,
  Form,
  Dropdown,
  Menu,
  Icon,
  Range,
  Modal,
  Button,
} from 'choerodon-ui/pro';
import { Spin, Tag } from 'choerodon-ui';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import uuid from 'uuid/v4';

import {
  fetchSavePlanConfig,
  fetchDetailConfig,
} from '@/services/riskScanConfig/monitorConfigService';

import CompanyAddModal from './CompanyAddModal';
import { RatioFormDS } from '../../stores/schemaConfigDS';
import styles from './index.less';

let selectAllMap = {};
let scoreMap = {};
let dataMap = {};
let dsMap = {};
let allMonitorItems = [];

const ScanProject = forwardRef((props, ref) => {
  const {
    localId,
    monitorWorkbench = {},
    onFetch = () => {},
    dispatch,
    businessListDS,
    businessAddDS,
  } = props;
  const { monitorConfigDetail = {} } = monitorWorkbench || {};

  const [resultList, setResultList] = useState([]);
  const [treeList, setTreeList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      selectAllMap = {};
      scoreMap = {};
      dataMap = {};
      dsMap = {};
      allMonitorItems = [];
    };
  }, []);

  useEffect(() => {
    if (localId && localId !== 'create') {
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

      allMonitorItems = [...rtnList];
      setResultList(rtnList);
      setTreeList(originList);
    }
  };

  const handleAddKey = (arr = []) => {
    const originList = [...arr];
    const rtnList = [];

    const lowArray = [
      'EnterpriseNameChange',
      'EnterpriseAddressChange',
      'BusinessScopeChange',
      'CourtAnnouncementPlaintiff',
      'CourtsAnnouncementPlaintiff',
      'DeliverynoticePlaintiff',
      'FilingInformationPPAA',
      'Spotcheckandinspection',
      'Doublerandominspection',
      'QualificationCertificate',
    ]; // 低风险

    const highArray = [
      'ShareholderInformationChange',
      'MainPersonnelChange',
      'CourtAnnouncementDefendant',
      'CourtsAnnouncementDefendant',
      'DeliverynoticeDefendant',
      'FilingInformationADE',
      'Restrictionseverificat',
      'RestrictingHighConsumption',
      'ExecutedEnterprise',
      'DishonestExecutedEnterprise',
      'BankruptcyAnnouncement',
      'JudicialAuction',
      'EquityFreeze',
      'TaxArrearsInformation',
      'MajorTaxViolations',
      'Cancelfiling',
      'AbnormalOperation',
      'Sharepledge',
      'Simplifiedcancellation',
      'SeriousViolationofTheLaw',
      'Externalblacklist',
    ]; // 高风险

    const getLevelValue = code => {
      if (lowArray.includes(code)) {
        return 1;
      } else if (highArray.includes(code)) {
        return 3;
      } else {
        return 2;
      }
    };

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
            item.riskLevel = item?.riskLevel ?? getLevelValue(item.itemCode);
          }

          if (item.children && item.children.length) {
            loopList(item.children); // 从顶级向下兼容 业务风险，顶层为 true，下级均为 true
          } else {
            rtnList.push({
              ...item,
              riskLevel: item?.riskLevel ?? getLevelValue(item.itemCode),
              itemScore: item?.itemScore ?? 0,
              enabledFlag: item?.enabledFlag ?? 0,
              tenantId: getCurrentOrganizationId(),
              planContentType: 'item',
              planType: 'MONITOR',
            });
          }
        });
      }
    };

    loopList(originList);
    return {
      rtnList,
      originList,
    };
  };

  useImperativeHandle(ref, () => ({
    handleSave: () => {
      return handleSave();
    },
  }));

  /**
   * 保存操作
   */
  const handleSave = async () => {
    if (resultList.length) {
      const validRequire = handleValidRequire(resultList);
      if (!validRequire) {
        notification.error({
          message: intl
            .get('sdat.riskScanConfig.view.message.validRequireMsg')
            .d('启用的风险项分数范围，风险分不能为空'),
        });
        return false;
      }

      const rtnList = [...resultList];

      if (rtnList.length) {
        const enabledList =
          rtnList && rtnList.length
            ? rtnList.filter(item => [1, '1'].includes(item.enabledFlag))
            : [];
        if (!(enabledList && enabledList.length)) {
          notification.error({
            message: intl
              .get('sdat.riskScanConfig.view.message.lessThenOneMonitor')
              .d('请至少启用一条风险项'),
          });
          return false;
        }

        rtnList.forEach(item => {
          if ([1, '1'].includes(item.enabledFlag) && !item.itemStrategy) {
            item.itemStrategy =
              item.dsMatchType === 'BETWEEN'
                ? `${item.itemCode} >= ${item?.equal ?? 0} && ${
                    item.itemCode
                  } <= ${item?.lessThan ?? 0}`
                : '1 == 1';
          }
        });
      }

      const params = {
        ...monitorConfigDetail,
        riskPlanItemTreeList: null,
        planType: 'PREDEFINE', // 扫描方案
        riskPlanItemList: rtnList.filter(item => item._isChange),
        tenantObj: null,
      };

      const res = await fetchSavePlanConfig({
        ...params,
        planContentType: 'item',
        planType: 'MONITOR',
        code: '',
        message: '',
      });

      if (getResponse(res)) {
        notification.success();
        handleQueryDetail();
        dispatch({
          type: 'monitorWorkbench/updateState',
          payload: {
            monitorConfigDetail: { ...res },
          },
        });
        return res;
      }
    }
  };

  /**
   * 判断是否有必输字段未填写
   * @param {array} arr
   */
  const handleValidRequire = (arr = []) => {
    const enabledList = arr && arr.length ? arr.filter(item => item.enabledFlag === 1) : [];
    let valid = true;

    if (enabledList.length) {
      enabledList.forEach(item => {
        if (
          _.isNil(item.riskLevel) ||
          (item?.dsMatchType === 'BETWEEN' && (_.isNil(item.equal) || _.isNil(item.lessThan)))
        ) {
          valid = false;
        }
      });
    }

    return valid;
  };

  const updateConfigDetail = async (obj = {}) => {
    dispatch({
      type: 'monitorWorkbench/updateState',
      payload: {
        monitorConfigDetail: { ...obj },
      },
    });
  };

  /**
   * 添加监控对象
   * @param {*} item
   */
  const handleAddMonitorEnterprise = item => {
    let modal = null;

    const handleCloseModal = async () => {
      businessAddDS.data = [];
      businessAddDS.reset();
      const detail = await fetchDetailConfig({
        riskPlanId: localId,
        planContentType: 'object',
        planType: 'MONITOR',
      });
      updateConfigDetail({ ...detail });
      modal.close();
    };

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.button.addMonitorEnterprise').d('添加监控对象'),
      children: (
        <CompanyAddModal
          businessListDS={businessListDS}
          businessAddDS={businessAddDS}
          monitorConfigDetail={monitorConfigDetail}
          itemCode={item?.itemCode}
          riskPlanId={localId}
        />
      ),
      closable: true,
      drawer: true,
      mask: false,
      destroyOnClose: true,
      style: { width: '800px' },
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
          <div className={styles['level-define-card-title']}>
            <Tooltip title={item?.itemName ?? ''}>{item?.itemName ?? ''}</Tooltip>
            <div>
              <a
                style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}
                onClick={() => handleAddMonitorEnterprise(item)}
              >
                <Icon type="add" style={{ marginRight: '4px' }} />
                {intl.get('sdat.riskScanConfig.view.button.addMonitorEnterprise').d('添加监控对象')}
              </a>
            </div>
          </div>
          <>{drawSecondLevel(item?.children ?? [])}</>
        </div>
      );
    });
  };

  // const getSelectedList = list => {
  //   return list.filter(item => item.enabledFlag);
  // };

  const drawSecondLevel = list => {
    return (list || []).map(item => {
      // endFlag 为 0 非末级，绘制 title，为 1 绘制风险项及上级全选按钮
      const endFlag = item?.endFlag ?? 0;
      // const checkList = [1, '1'].includes(endFlag) ? getSelectedList(item?.children ?? []) : [];

      return [1, '1'].includes(endFlag) ? (
        <div key={item._uuid}>
          <div className={styles['level-define-card-second-level']}>
            <div className={styles['card-second-title']}>
              <Tooltip title={item?.itemName ?? ''}>{item?.itemName ?? ''}</Tooltip>
            </div>
            <div className={styles['card-second-btn-group']}>
              <a
                disabled={selectAllMap[item._uuid]}
                onClick={() => handleSelectAll(item, 'select')}
              >
                {intl.get('sdat.riskScanConfig.view.button.selectAll').d('全选')}
              </a>
              <a onClick={() => handleSelectAll(item, 'clear')}>
                {intl.get('sdat.riskScanConfig.view.button.clear').d('清空')}
              </a>
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
   * 全选操作
   */
  const handleSelectAll = (obj, type) => {
    // 修改节点属性的通用函数
    const modifyItem = (item, typeVal) => {
      item.enabledFlag = typeVal === 'select' ? 1 : 0;
      item._isChange = true;
      if (item.children && item.children.length) {
        item.children.forEach(child => modifyItem(child, typeVal)); // 递归修改子节点
      }
    };

    const newResultList = JSON.parse(JSON.stringify(resultList));
    // 更新 resultList
    for (const item of newResultList) {
      if (obj.children?.find(child => child._uuid === item._uuid)) {
        modifyItem(item, type); // 找到目标节点并修改
      }
    }

    for (const item of allMonitorItems) {
      if (obj.children?.find(child => child._uuid === item._uuid)) {
        modifyItem(item, type); // 找到目标节点并修改
      }
    }

    // 更新 selectAllMap
    selectAllMap[obj._uuid] = type === 'select';

    // 更新 treeList
    setResultList(newResultList);
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
        item._isChange = true;
      } else if (type === 'value') {
        item.itemScore = parseInt(val, 10);
        item._isChange = true;
      } else if (type === 'level') {
        item.riskLevel = val;
        item._isChange = true;
      }
    };

    // 遍历树形结构的递归函数
    const loopList = (list, source, type, val) => {
      for (const item of list) {
        if (item._uuid === source._uuid) {
          modifyItem(item, type, val); // 找到目标节点并修改
          return true; // 提前终止遍历
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

    loopList(allMonitorItems, obj, typeVal, value);
    // const localList = JSON.parse(JSON.stringify(treeList));

    const localList = [...treeList];
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
      // const value = item.riskLevel;
      // const { enabledFlag = false } = item || {};
      const { enabledFlag = false, equal, lessThan, _uuid, riskLevel } =
        allMonitorItems?.filter(child => child._uuid === item._uuid)?.[0] ?? {};
      const value = riskLevel;

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

      let ds = null;
      if (dsMap && !dsMap[_uuid]) {
        ds = new DataSet({ ...RatioFormDS() });
        ds.current.set('equal', equal);
        ds.current.set('lessThan', lessThan);
        dsMap[_uuid] = ds;
      } else {
        ds = dsMap[_uuid];
      }

      const equal1 = ds?.current?.get('equal') ?? 0;
      const lessThan1 = ds?.current?.get('lessThan') ?? 100;

      const defaultValue = [parseInt(equal1, 10), parseInt(lessThan1, 10)];

      const rangeFlag = item?.dsMatchType === 'BETWEEN';

      return rangeFlag ? (
        <div key={item._uuid} className={styles['card-range-item']}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '22px',
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex' }}>
              <CheckBox checked={enabledFlag} onChange={e => handleChange(e, item, 'check')}>
                {item.itemName}
              </CheckBox>
            </div>
            <Dropdown overlay={() => menu(item)} trigger={['click']}>
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
                <Icon type="expand_more" style={{ fontSize: '14px' }} />
              </span>
            </Dropdown>
          </div>
          <div style={{ margin: '8px 0 0' }}>
            <Form dataSet={ds} columns={2} labelLayout="float">
              <NumberField
                name="equal"
                // suffix="%"
                onInput={e => handleChangeEqual(e, item)}
              />
              <NumberField
                name="lessThan"
                // suffix="%"
                onInput={e => handleChangeLessThan(e, item)}
              />
            </Form>
          </div>
          <div
            style={{
              height: '12px',
              marginTop: '16px',
            }}
          >
            <Range
              min={0}
              max={100}
              step={1}
              tooltipVisible={false}
              range
              value={defaultValue}
              onChange={e => handleChangeRange(e, item)}
            />
          </div>
        </div>
      ) : (
        <div key={item._uuid} className={styles['card-level-item']}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CheckBox checked={enabledFlag} onChange={e => handleChange(e, item, 'check')} />
            <div className={styles['card-level-item-title']}>
              <Tooltip title={item?.itemName ?? ''}>
                <span className={styles['card-level-item-title-name']}>{item?.itemName ?? ''}</span>
              </Tooltip>
            </div>
          </div>
          <Dropdown overlay={() => menu(item)} trigger={['click']}>
            <span
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {text ? (
                <Tag className={classNames} style={{ margin: '0 4px' }}>
                  {text}
                </Tag>
              ) : null}
              <Icon type="expand_more" style={{ fontSize: '14px' }} />
            </span>
          </Dropdown>
        </div>
      );
    });
  };

  /**
   * 改变滑块内容
   * @param {*} e
   * @param {*} item
   */
  const handleChangeRange = (e, item) => {
    // 解析 equal 和 lessThan
    const equal = e && e.length ? parseInt(e[0], 10) : 0;
    const lessThan = e && e.length > 1 ? parseInt(e[1], 10) : 100;

    // 修改节点属性的通用函数
    const modifyRecord = (record, value1, value2, obj) => {
      record.equal = value1;
      record.lessThan = value2;
      record._isChange = true;
      record.itemStrategy = `${obj.itemCode} >= ${value1} && ${obj.itemCode} <= ${value2}`;
    };

    // 遍历 resultList 并修改目标节点
    for (const record of resultList) {
      if (record._uuid === item._uuid) {
        modifyRecord(record, equal, lessThan, item);
        break; // 找到目标节点后提前终止
      }
    }

    // 遍历树形结构的递归函数
    const loopArr = (arr, target, value1, value2) => {
      for (const record of arr) {
        if (record._uuid === target._uuid) {
          modifyRecord(record, value1, value2, item); // 找到目标节点并修改
          return true; // 提前终止遍历
        }
      }
      return false; // 未找到目标节点
    };

    // 深拷贝 treeList 以避免直接修改原始数据
    const localList = JSON.parse(JSON.stringify(treeList));
    // loopArr(localList, item, equal, lessThan);
    loopArr(allMonitorItems, item, equal, lessThan);

    // 更新 dsMap
    const ds = dsMap[item._uuid] || '';
    if (ds && ds.current) {
      ds.current.set('equal', equal);
      ds.current.set('lessThan', lessThan);
    }

    // 更新 treeList
    setTreeList(localList);
  };

  /**
   * 改变 equal
   * @param {*} e
   * @param {*} item
   */
  const handleChangeEqual = (event, item) => {
    const e = Number(event?.target?.value ?? 0);
    // 修改节点属性的通用函数
    const modifyRecord = (record, value, obj) => {
      record.equal = parseInt(value, 10);
      record._isChange = true;
      record.itemStrategy = `${obj.itemCode} >= ${parseInt(value, 10)} && ${
        obj.itemCode
      } <= ${record.lessThan || obj.lessThan || 1000}`;
    };

    // 遍历 resultList 并修改目标节点
    for (const record of resultList) {
      if (record._uuid === item._uuid) {
        modifyRecord(record, e, item);
        break; // 找到目标节点后提前终止
      }
    }

    // 遍历树形结构的递归函数
    const loopArr = (arr, target, value) => {
      for (const record of arr) {
        if (record._uuid === target._uuid) {
          modifyRecord(record, value, item); // 找到目标节点并修改
          return true; // 提前终止遍历
        }
        if (record.children && record.children.length) {
          const found = loopArr(record.children, target, value);
          if (found) return true; // 如果子节点中找到目标，提前终止
        }
      }
      return false; // 未找到目标节点
    };

    // 深拷贝 treeList 以避免直接修改原始数据
    const localList = JSON.parse(JSON.stringify(treeList));
    // loopArr(localList, item, e);
    loopArr(allMonitorItems, item, e);

    // 更新 treeList
    setTreeList(localList);
  };

  /**
   * 改变 lessThan
   * @param {*} e
   * @param {*} item
   */
  const handleChangeLessThan = (event, item) => {
    const e = Number(event?.target?.value ?? 0);
    // 修改节点属性的通用函数
    const modifyRecord = (record, value, obj) => {
      record.lessThan = parseInt(value, 10);
      record._isChange = true;
      // 使用record.equal而不是obj.equal，确保使用最新的值
      record.itemStrategy = `${obj.itemCode} >= ${record.equal || obj.equal || 0} && ${
        obj.itemCode
      } <= ${parseInt(value, 10)}`;
    };

    // 遍历 resultList 并修改目标节点
    for (const record of resultList) {
      if (record._uuid === item._uuid) {
        modifyRecord(record, e, item);
        break; // 找到目标节点后提前终止
      }
    }

    // 遍历树形结构的递归函数
    const loopArr = (arr, target, value) => {
      for (const record of arr) {
        if (record._uuid === target._uuid) {
          modifyRecord(record, value, item); // 找到目标节点并修改
          return true; // 提前终止遍历
        }
        if (record.children && record.children.length) {
          const found = loopArr(record.children, target, value);
          if (found) return true; // 如果子节点中找到目标，提前终止
        }
      }
      return false; // 未找到目标节点
    };

    // 深拷贝 treeList 以避免直接修改原始数据
    const localList = JSON.parse(JSON.stringify(treeList));
    // loopArr(localList, item, e);
    loopArr(allMonitorItems, item, e);

    // 更新 treeList
    setTreeList(localList);
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
