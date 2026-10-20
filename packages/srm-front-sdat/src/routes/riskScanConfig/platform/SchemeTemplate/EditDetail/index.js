/* eslint-disable no-param-reassign */
/*
 * @Description: 风险扫描方案模板管理
 * @Author: lqx(qingxiang.luo@going-link.com)
 * @Date: 2025-01-02 16:23:11
 * @Last Modified by: lqx(qingxiang.luo@going-link.com)
 * @Last Modified time: 2025-05-19 10:30:31
 */

import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
import _ from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header } from 'components/Page';
import {
  DataSet,
  Button,
  CheckBox,
  NumberField,
  Tooltip,
  Form,
  TextField,
  Lov,
  Dropdown,
  Menu,
  Icon,
  IntlField,
  Range,
} from 'choerodon-ui/pro';
import { Spin, Tag } from 'choerodon-ui';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import uuid from 'uuid/v4';

import {
  fetchDetailConfig,
  fetchSaveDetail,
} from '@/services/riskScanConfig/schemeTemplateService';

import { LevelTableDS, BasicInfoDS, RatioFormDS } from '../stores/schemeTemplateDS';
import LevelTable from './LevelTable';

import styles from './index.less';

let selectAllMap = {};
let scoreMap = {};
let dataMap = {};
let dsMap = {};
let changedList = [];

const MonitorBusiness = (props) => {
  const { match } = props;

  const tableDS = useMemo(() => new DataSet({ ...LevelTableDS() }), []);
  const basicInfoDS = useMemo(() => new DataSet({ ...BasicInfoDS() }), []);

  const [treeList, setTreeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const localId = match?.params?.id ?? ''; // 区分第一步是编辑还是新建 id值/add
  const pageType = match?.params?.type ?? ''; // 页面编辑状态，edit 编辑，view 查看
  const tenantName = match?.params?.tenantName ?? ''; // 租户名称

  useEffect(() => {
    handleQueryDetail();
    return () => {
      selectAllMap = {};
      scoreMap = {};
      dataMap = {};
      dsMap = {};
      changedList = [];
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const handleQueryDetail = async () => {
    if (!localId) return;

    changedList = [];
    setLoading(true);
    const res = await fetchDetailConfig({ riskPlanId: localId });
    setLoading(false);

    if (getResponse(res)) {
      const treeData = res?.riskPlanItemTreeList ?? [];
      const configList = res?.wb2LevelConfigList ?? [];
      basicInfoDS.data = [
        {
          ...res,
          tenantName,
        },
      ];

      if (Array.isArray(configList) && configList.length) {
        configList.forEach((item) => {
          scoreMap[item.level] = {
            startScore: item.startScore,
            endScore: item.endScore,
          };
          dataMap[item.level] = { ...item };
        });
      }

      tableDS.data = [
        {
          id: 3,
          riskLevel: 3,
          ...dataMap['3'],
          scoreRange: {
            startScore: scoreMap['3']?.startScore ?? 0,
            endScore: scoreMap['3']?.endScore ?? 0,
          },
        },
        {
          id: 2,
          riskLevel: 2,
          ...dataMap['2'],
          scoreRange: {
            startScore: scoreMap['2']?.startScore ?? 0,
            endScore: scoreMap['2']?.endScore ?? 0,
          },
        },
        {
          id: 1,
          riskLevel: 1,
          ...dataMap['1'],
          scoreRange: {
            startScore: scoreMap['1']?.startScore ?? 0,
            endScore: scoreMap['1']?.endScore ?? 0,
          },
        },
      ];
      const { originList } = handleAddKey(treeData);
      setTreeList(originList);
    }
  };

  const handleAddKey = (arr = []) => {
    const originList = [...arr];
    const rtnList = [];

    const loopList = (list = []) => {
      if (list.length) {
        list.forEach((item) => {
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
              equal: matches.length ? parseInt(matches[0], 10) : 0,
              lessThan: matches.length > 1 ? parseInt(matches[1], 10) : 0,
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

  /**
   * 保存操作
   */
  const handleSave = async () => {
    const validRequire = handleValidRequire(changedList);
    if (!validRequire) {
      notification.error({
        message: intl
          .get('sdat.riskLevelDefine.view.message.validRequireMsg')
          .d('启用的风险项分数范围，风险分不能为空'),
      });
      return false;
    }

    const { isValid, rtnList } = handleValidate(changedList);

    if (!isValid) {
      notification.error({
        message: intl
          .get('sdat.riskLevelDefine.view.message.validMoreRange')
          .d('存在不符合分数区间的数据，分数只能在 0 - 100 之间'),
      });
      return false;
    }

    const validScope = await tableDS.validate();
    if (!validScope) return false;

    const validBasic = await basicInfoDS.validate();
    if (!validBasic) return false;

    const scopeList = tableDS
      // .filter(rcd => rcd.status === 'add' || rcd.status === 'update')
      .map((rcd) => {
        const param = rcd?.toData() ?? {};
        const obj = param?.scoreRange ?? {};
        const level = param?.riskLevel ?? 0;

        delete param.scoreRange;
        delete param.riskLevel;

        return {
          level: Number(level),
          ...param,
          _tls: param?._tls ?? {
            levelDescription: {
              en_US: param?.levelDescription ?? '',
              zh_CN: param?.levelDescription ?? '',
              ja_JP: param?.levelDescription ?? '',
            },
          },
          startScore: obj?.startScore,
          endScore: obj?.endScore,
        };
      });

    const levelMap = {};
    scopeList.forEach((item) => {
      levelMap[item.level] = {
        startScore: item.startScore,
        endScore: item.endScore,
      };
    });

    const sum = scopeList
      .map((item) => parseInt(item.endScore, 10) - parseInt(item.startScore, 10) + 1)
      .reduce((a, b) => a + b);

    if (
      levelMap['1'].endScore > levelMap['2'].startScore ||
      levelMap['2'].endScore > levelMap['3'].startScore ||
      levelMap['1'].endScore > levelMap['3'].startScore ||
      sum - 1 !== 100
    ) {
      notification.error({
        message: intl
          .get('sdat.riskLevelDefine.view.message.scoreHasOver')
          .d('分数设定区间存在重合的范围，且范围和必须为 100'),
      });
      return false;
    }

    const basicInfo = basicInfoDS?.toData()[0] ?? {};

    if (rtnList.length) {
      rtnList.forEach((item) => {
        if (!item.itemStrategy) {
          item.itemStrategy =
            item.dsMatchType === 'BETWEEN'
              ? `${item.itemCode} >= ${item?.equal ?? 0} && ${item.itemCode} <= ${
                  item?.lessThan ?? 0
                }`
              : '1 == 1';
        }
      });
    }
    const params = {
      ...basicInfo,
      riskPlanItemTreeList: null,
      planType: 'PREDEFINE', // 扫描方案
      wb2LevelConfigList: scopeList,
      riskPlanItemList: rtnList,
      scanScope: 1,
      tenantObj: null,
    };

    const res = await fetchSaveDetail({ ...params });

    if (getResponse(res)) {
      notification.success();
      handleQueryDetail();
      return res;
    }
  };

  /**
   * 判断是否有必输字段未填写
   * @param {array} arr
   */
  const handleValidRequire = (arr = []) => {
    const enabledList = arr && arr.length ? arr.filter((item) => item.enabledFlag === 1) : [];
    let valid = true;

    if (enabledList.length) {
      enabledList.forEach((item) => {
        if (
          _.isNil(item.itemScore) ||
          _.isNil(item.riskLevel) ||
          (item?.dsMatchType === 'BETWEEN' && (_.isNil(item.equal) || _.isNil(item.lessThan)))
        ) {
          valid = false;
        }
      });
    }

    return valid;
  };

  const handleValidate = (arr = []) => {
    let isValid = true;
    const originList = [...arr];

    const loopList = (list = []) => {
      if (list.length) {
        list.forEach((item) => {
          if (
            (item.itemScore || item.itemScore === 0) &&
            !(item.children && item.children.length)
          ) {
            if (parseInt(item.itemScore, 10) < 0 || parseInt(item.itemScore, 10) > 100) {
              isValid = false;
            }
          }

          delete item.itemId;
          delete item.itemName;
          delete item.parentId;
          delete item.children;
          delete item.sortNum;
          delete item.endFlag;
        });
      }
    };

    loopList(originList);
    return {
      rtnList: originList,
      isValid,
    };
  };

  const drawCardList = (list = []) => {
    return (list || []).map((item) => {
      return (
        <div key={item._uuid} className={styles['level-define-card-panel']}>
          <div className={styles['level-define-card-title']}>
            <Tooltip title={item?.itemName ?? ''}>{item?.itemName ?? ''}</Tooltip>
          </div>
          <>{item?.children?.length > 0 && drawSecondLevel(item.children)}</>
        </div>
      );
    });
  };

  const getSelectedList = (list) => {
    return list.filter((item) => item.enabledFlag);
  };

  const drawSecondLevel = (list) => {
    return (list || []).map((item) => {
      // endFlag 为 0 非末级，绘制 title，为 1 绘制风险项及上级全选按钮
      const endFlag = item?.endFlag ?? 0;
      const checkList = [1, '1'].includes(endFlag) ? getSelectedList(item?.children ?? []) : [];

      return [1, '1'].includes(endFlag) ? (
        <div key={item._uuid}>
          <div className={styles['level-define-card-second-level']}>
            <div className={styles['card-second-title']}>
              <Tooltip title={item?.itemName ?? ''}>{item?.itemName ?? ''}</Tooltip>
            </div>
            <div className={styles['card-second-btn-group']}>
              <a
                disabled={selectAllMap[item._uuid] || pageType === 'view'}
                onClick={() => handleSelectAll(item, 'select')}
              >
                {intl.get('sdat.riskLevelDefine.view.button.selectAll').d('全选')}
              </a>
              <a
                disabled={!checkList.length || pageType === 'view'}
                onClick={() => handleSelectAll(item, 'clear')}
              >
                {intl.get('sdat.riskLevelDefine.view.button.clear').d('清空')}
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
    const children = obj?.children ?? [];

    // 修改节点属性的通用函数
    const modifyItem = (item, typeVal) => {
      item.enabledFlag = typeVal === 'select' ? 1 : 0;
      if (item.children && item.children.length) {
        item.children.forEach((child) => modifyItem(child, typeVal)); // 递归修改子节点
      }
    };

    // 更新 changedList
    children.forEach((item) => {
      const targetItem = changedList.find((item2) => item2._uuid === item._uuid);
      if (targetItem) {
        modifyItem(targetItem, type); // 更新已存在的记录
      } else {
        const newItem = { ...item };
        modifyItem(newItem, type); // 修改新记录
        changedList.push(newItem); // 添加新记录
      }
    });

    // 遍历树形结构的递归函数
    const loopList = (list) => {
      for (const item of list) {
        if (item._uuid === obj._uuid) {
          if (item.children && item.children.length) {
            item.children.forEach((child) => modifyItem(child, type)); // 修改子节点
          }
          return true; // 提前终止遍历
        }
        if (item.children && item.children.length) {
          const found = loopList(item.children);
          if (found) return true; // 如果子节点中找到目标，提前终止
        }
      }
      return false; // 未找到目标节点
    };

    // 深拷贝 treeList 以避免直接修改原始数据
    const localList = JSON.parse(JSON.stringify(treeList));
    loopList(localList);

    // 更新 selectAllMap
    selectAllMap[obj._uuid] = type === 'select';

    // 触发刷新
    setTreeList(localList);
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

    // 更新 changedList
    const targetItem = changedList.find((item) => item._uuid === obj._uuid);
    if (targetItem) {
      modifyItem(targetItem, typeVal, value); // 更新已存在的记录
    } else {
      const newItem = { ...obj };
      modifyItem(newItem, typeVal, value); // 修改新记录
      changedList.push(newItem); // 添加新记录
    }

    // 遍历树形结构的递归函数
    const loopList = (list, target, type, val) => {
      for (const item of list) {
        if (item._uuid === target._uuid) {
          modifyItem(item, type, val); // 找到目标节点并修改
          return true; // 提前终止遍历
        }
        if (item.children && item.children.length) {
          const found = loopList(item.children, target, type, val);
          if (found) return true; // 如果子节点中找到目标，提前终止
        }
      }
      return false; // 未找到目标节点
    };

    // 深拷贝 treeList 以避免直接修改原始数据
    const localList = JSON.parse(JSON.stringify(treeList));
    loopList(localList, obj, typeVal, value);

    setTreeList(localList);
  };

  const menu = (item) => {
    return (
      <Menu>
        <Menu.Item onClick={() => handleChange(3, item, 'level')}>
          <span className={styles['status-high-tag']}>
            {intl.get('hzero.common.priority.high').d('高')}
          </span>
        </Menu.Item>
        <Menu.Item onClick={() => handleChange(2, item, 'level')}>
          <span className={styles['status-middle-tag']}>
            {intl.get('hzero.common.priority.medium').d('中')}
          </span>
        </Menu.Item>
        <Menu.Item onClick={() => handleChange(1, item, 'level')}>
          <span className={styles['status-low-tag']}>
            {intl.get('hzero.common.priority.low').d('低')}
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  const drawThirdLevel = (list) => {
    return (list || []).map((item) => {
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

      let ds = null;
      if (dsMap && !dsMap[item._uuid]) {
        ds = new DataSet({ ...RatioFormDS() });
        ds.current.set('equal', item.equal);
        ds.current.set('lessThan', item.lessThan);
        dsMap[item._uuid] = ds;
      } else {
        ds = dsMap[item._uuid];
      }

      const equal = ds?.current?.get('equal') ?? 0;
      const lessThan = ds?.current?.get('lessThan') ?? 100;

      const defaultValue = [parseInt(equal, 10), parseInt(lessThan, 10)];

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
              <CheckBox
                disabled={pageType === 'view'}
                checked={enabledFlag}
                onChange={(e) => handleChange(e, item, 'check')}
              >
                {item.itemName}
              </CheckBox>
              <Dropdown
                disabled={pageType === 'view'}
                overlay={() => menu(item)}
                trigger={['click']}
              >
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

            <NumberField
              value={item.itemScore}
              style={{ width: '80px' }}
              disabled={pageType === 'view'}
              onChange={(e) => handleChange(e, item, 'value')}
              min={0}
              max={100}
              step={1}
            />
          </div>
          <div style={{ margin: '8px 0 0' }}>
            <Form dataSet={ds} columns={2} labelLayout="float">
              <NumberField
                name="equal"
                // suffix="%"
                disabled={pageType === 'view'}
                onInput={(e) => handleChangeEqual(e, item)}
              />
              <NumberField
                name="lessThan"
                // suffix="%"
                disabled={pageType === 'view'}
                onInput={(e) => handleChangeLessThan(e, item)}
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
              disabled={pageType === 'view'}
              range
              value={defaultValue}
              onChange={(e) => handleChangeRange(e, item)}
            />
          </div>
        </div>
      ) : (
        <div key={item._uuid} className={styles['card-level-item']}>
          <CheckBox
            checked={enabledFlag}
            onChange={(e) => handleChange(e, item, 'check')}
            disabled={pageType === 'view'}
          />
          <div className={styles['card-level-item-title']}>
            <Tooltip title={item?.itemName ?? ''}>
              <span className={styles['card-level-item-title-name']}>{item?.itemName ?? ''}</span>
            </Tooltip>
            <Dropdown disabled={pageType === 'view'} overlay={() => menu(item)} trigger={['click']}>
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

          <NumberField
            value={item.itemScore}
            disabled={pageType === 'view'}
            style={{ width: '80px' }}
            onChange={(e) => handleChange(e, item, 'value')}
            min={0}
            max={100}
            step={1}
          />
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
      record.itemStrategy = `${obj.itemCode} >= ${value1} && ${obj.itemCode} <= ${value2}`;
    };

    // 更新 changedList
    const targetRecord = changedList.find((record) => record._uuid === item._uuid);
    if (targetRecord) {
      modifyRecord(targetRecord, equal, lessThan, item); // 更新已存在的记录
    } else {
      changedList.push({
        ...item,
        equal,
        lessThan,
        itemStrategy: `${item.itemCode} >= ${equal} && ${item.itemCode} <= ${lessThan}`,
      }); // 添加新记录
    }

    // 遍历树形结构的递归函数
    const loopArr = (arr, target, value1, value2) => {
      for (const record of arr) {
        if (record._uuid === target._uuid) {
          modifyRecord(record, value1, value2, item); // 找到目标节点并修改
          return true; // 提前终止遍历
        }
        if (record.children && record.children.length) {
          const found = loopArr(record.children, target, value1, value2);
          if (found) return true; // 如果子节点中找到目标，提前终止
        }
      }
      return false; // 未找到目标节点
    };

    // 深拷贝 treeList 以避免直接修改原始数据
    const localList = JSON.parse(JSON.stringify(treeList));
    loopArr(localList, item, equal, lessThan);

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
    // 解析 equal 值
    const equal = parseInt(e, 10);

    // 修改节点属性的通用函数
    const modifyRecord = (record, value1, obj) => {
      record.equal = value1;
      // record.itemStrategy = `${item.itemCode} >= ${value1} && ${obj.itemCode} <= ${obj.lessThan}`;
      record.itemStrategy = `${obj.itemCode} >= ${parseInt(value1, 10)} && ${obj.itemCode} <= ${
        record.lessThan || obj.lessThan || 1000
      }`;
    };

    // 更新 changedList
    const targetRecord = changedList.find((record) => record._uuid === item._uuid);
    if (targetRecord) {
      modifyRecord(targetRecord, equal, item); // 更新已存在的记录
    } else {
      changedList.push({
        ...item,
        equal,
        itemStrategy: `${item.itemCode} >= ${equal} && ${item.itemCode} <= ${item.lessThan}`,
      }); // 添加新记录
    }

    // 遍历树形结构的递归函数
    const loopArr = (arr, target, value1) => {
      for (const record of arr) {
        if (record._uuid === target._uuid) {
          modifyRecord(record, value1, item); // 找到目标节点并修改
          return true; // 提前终止遍历
        }
        if (record.children && record.children.length) {
          const found = loopArr(record.children, target, value1);
          if (found) return true; // 如果子节点中找到目标，提前终止
        }
      }
      return false; // 未找到目标节点
    };

    // 深拷贝 treeList 以避免直接修改原始数据
    const localList = JSON.parse(JSON.stringify(treeList));
    loopArr(localList, item, equal);

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
    // 解析 lessThan 值
    const lessThan = parseInt(e, 10);

    // 修改节点属性的通用函数
    const modifyRecord = (record, value1, obj) => {
      record.lessThan = value1;
      // record.itemStrategy = `${obj.itemCode} >= ${obj.equal} && ${obj.itemCode} <= ${value1}`;
      record.itemStrategy = `${obj.itemCode} >= ${record.equal || obj.equal || 0} && ${
        obj.itemCode
      } <= ${parseInt(value1, 10)}`;
    };

    // 更新 changedList
    const targetRecord = changedList.find((record) => record._uuid === item._uuid);
    if (targetRecord) {
      modifyRecord(targetRecord, lessThan, item); // 更新已存在的记录
    } else {
      changedList.push({
        ...item,
        lessThan,
        itemStrategy: `${item.itemCode} >= ${item.equal} && ${item.itemCode} <= ${lessThan}`,
      }); // 添加新记录
    }

    // 遍历树形结构的递归函数
    const loopArr = (arr, target, value1) => {
      for (const record of arr) {
        if (record._uuid === target._uuid) {
          modifyRecord(record, value1, item); // 找到目标节点并修改
          return true; // 提前终止遍历
        }
        if (record.children && record.children.length) {
          const found = loopArr(record.children, target, value1);
          if (found) return true; // 如果子节点中找到目标，提前终止
        }
      }
      return false; // 未找到目标节点
    };

    // 深拷贝 treeList 以避免直接修改原始数据
    const localList = JSON.parse(JSON.stringify(treeList));
    loopArr(localList, item, lessThan);

    // 更新 treeList
    setTreeList(localList);
  };

  const title =
    pageType === 'view'
      ? intl.get('sdat.schemeTemplate.view.title.viewRiskSchemeTemplate').d('查看风险扫描方案模板')
      : intl.get('sdat.schemeTemplate.view.title.editRiskSchemeTemplate').d('编辑风险扫描方案模板');

  return (
    <Spin spinning={loading}>
      <div className={styles['monitor-business-basic']}>
        <Header title={title} backPath="/sdat/platform/risk-scheme-template/list">
          {pageType === 'view' ? null : (
            <Button
              icon="check"
              funcType="flat"
              color="primary"
              onClick={handleSave}
              style={{ color: '#fff' }}
            >
              {intl.get('hzero.common.btn.save').d('保存')}
            </Button>
          )}
        </Header>
        <div className={styles['scan-project-basic']}>
          <div className={styles['level-define-basic-card']}>
            <Form dataSet={basicInfoDS} columns={3} labelLayout="float">
              <Lov name="tenantObj" disabled={pageType === 'view'} />
              <TextField name="planNumber" disabled />
              <IntlField name="planName" disabled={pageType === 'view'} />
            </Form>
          </div>

          <div className={styles['level-define-card-list']}>
            <div className={styles['level-define-card-panel']}>
              <div className={styles['level-define-level-panel']}>
                <div
                  style={{
                    fontWeight: '600',
                    fontSize: '16px',
                    color: '#1D2129',
                    lineHeight: '24px',
                  }}
                >
                  {intl.get('sdat.riskLevelDefine.view.title.riskLevel').d('风险等级')}
                </div>
                <div className={styles['level-panel-tips']}>
                  {intl
                    .get('sdat.riskLevelDefine.view.title.riskLevelTips')
                    .d(
                      '每项特征的分值由用户根据自身风险偏好进行定义，系统根据设定的分值进行计算，并给出企业风险等级'
                    )}
                </div>
              </div>

              <LevelTable tableDS={tableDS} pageType={pageType} />
            </div>

            {treeList && treeList.length ? drawCardList(treeList) : null}
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default formatterCollections({
  code: ['sdat.schemeTemplate', 'sdat.riskLevelDefine'],
})(MonitorBusiness);
