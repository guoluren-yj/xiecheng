/* eslint-disable no-param-reassign */
import React, { useState, useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import { Header } from 'components/Page';
import notification from 'utils/notification';
import { Button, CheckBox, NumberField, DataSet, Tooltip } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import uuid from 'uuid/v4';

import { getRealUrlParam } from '@/utils/utils';
import {
  fetchDefineDetail,
  fetchSaveDetail,
  fetchScopeList,
} from '@/services/riskLevel/levelDefineService';

import { LevelTableDS } from './stores/riskLevelDS';
import LevelTable from './LevelTable';
import styles from './index.less';

let selectAllMap = {};
let scoreMap = {};
let dataMap = {};

const RiskLevelDefine = ({ location }) => {
  const { tenantId = '' } = getRealUrlParam(location?.search);

  const tableDS = useMemo(() => new DataSet({ ...LevelTableDS() }), []);

  const [resultList, setResultList] = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    handleQueryDetail();
    handleQueryScopeList();
    return () => {
      selectAllMap = {};
      scoreMap = {};
      dataMap = {};
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const handleQueryScopeList = () => {
    fetchScopeList({ tenantId }).then(res => {
      if (getResponse(res)) {
        if (Array.isArray(res) && res.length) {
          res.forEach(item => {
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

        setRefresh(true);
      }
    });
  };

  const handleQueryDetail = () => {
    fetchDefineDetail({ tenantId }).then(res => {
      if ((getResponse(res) && Array.isArray(res)) || res.length) {
        const list = handleAddKey(res);
        setResultList(list);
      }
    });
  };

  const handleAddKey = (arr = []) => {
    const rtnList = [...arr];
    const loopList = (list = []) => {
      if (list.length) {
        list.forEach(item => {
          if (!item._uuid) {
            item._uuid = uuid();
          }

          if (item.childList && item.childList.length) {
            loopList(item.childList);
          }
        });
      }
    };

    loopList(rtnList);
    return rtnList;
  };

  /**
   * 保存操作
   */
  const handleSave = async () => {
    if (resultList.length) {
      const { isValid, rtnList } = handleValidate(resultList);

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

      const scopeList = tableDS.map(rcd => {
        const param = rcd?.toData() ?? {};
        const obj = param?.scoreRange ?? {};

        return {
          level: param?.riskLevel ?? '',
          ...param,
          _tls: param?._tls,
          startScore: obj?.startScore,
          endScore: obj?.endScore,
        };
      });

      const levelMap = {};
      scopeList.forEach(item => {
        levelMap[item.level] = {
          startScore: item.startScore,
          endScore: item.endScore,
        };
      });

      const sum = scopeList
        .map(item => parseInt(item.endScore, 10) - parseInt(item.startScore, 10) + 1)
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

      const res = await fetchSaveDetail({
        params: {
          configList: rtnList,
          scopeList: scopeList.filter(item => item.level),
        },
        tenantId,
      });

      if (getResponse(res)) {
        notification.success();
        handleQueryDetail();
        handleQueryScopeList();
      }
    }
  };

  const handleValidate = (arr = []) => {
    let isValid = true;
    const rtnList = [];

    const loopList = (list = []) => {
      if (list.length) {
        list.forEach(item => {
          if ((item.score || item.score === 0) && !item.childList) {
            if (parseInt(item.score, 10) < 0 || parseInt(item.score, 10) > 100) {
              isValid = false;
            } else {
              rtnList.push({ ...item });
            }
          }

          if (item.childList && item.childList.length) {
            loopList(item.childList);
          }
        });
      }
    };

    loopList(arr);
    return {
      rtnList,
      isValid,
    };
  };

  const drawCardList = (list = []) => {
    return (list || []).map(item => {
      return (
        <div key={item._uuid} className={styles['level-define-card-panel']}>
          <div className={styles['level-define-card-title']}>
            <Tooltip title={item?.riskTheme ?? ''}>{item?.riskTheme ?? ''}</Tooltip>
          </div>
          <>{drawSecondLevel(item?.childList ?? [])}</>
        </div>
      );
    });
  };

  const getSelectedList = list => {
    return list.filter(item => item.choose);
  };

  const drawSecondLevel = list => {
    return (list || []).map(item => {
      const checkList = getSelectedList(item?.childList ?? []);

      return (
        <div key={item._uuid}>
          <div className={styles['level-define-card-second-level']}>
            <div className={styles['card-second-title']}>
              <Tooltip title={item?.riskGroup ?? ''}>{item?.riskGroup ?? ''}</Tooltip>
            </div>
            <div className={styles['card-second-btn-group']}>
              <a
                disabled={selectAllMap[item._uuid]}
                onClick={() => handleSelectAll(item, 'select')}
              >
                {intl.get('sdat.riskLevelDefine.view.button.selectAll').d('全选')}
              </a>
              <a disabled={!checkList.length} onClick={() => handleSelectAll(item, 'clear')}>
                {intl.get('sdat.riskLevelDefine.view.button.clear').d('清空')}
              </a>
            </div>
          </div>
          <div className={styles['level-third-panel']}>{drawThirdLevel(item?.childList ?? [])}</div>
        </div>
      );
    });
  };

  /**
   * 全选操作
   */
  const handleSelectAll = (obj, type) => {
    const loopList = (list = []) => {
      if (list.length) {
        list.forEach(item => {
          if (item._uuid === obj._uuid) {
            if (item.childList && item.childList.length) {
              item.childList.forEach(a => {
                a.choose = type === 'select' ? 1 : 0;
              });
            }
          } else if (item.childList && item.childList.length) {
            loopList(item.childList);
          }
        });
      }
    };

    loopList(resultList);
    selectAllMap[obj._uuid] = type === 'select';
    setRefresh(true);
  };

  /**
   * 修改选中状态或分数值
   * @param {*} event
   * @param {*} item
   * @param {*} type
   */
  const handleChange = (event, item, type) => {
    const value = type === 'check' ? event : event?.target?.value ?? 0;

    if (type === 'check') {
      changeItem(item, 'check', value);
    } else if (type === 'value') {
      changeItem(item, 'value', value);
    }
  };

  const changeItem = (obj, typeVal, value) => {
    const loopList = (list = [], source, type) => {
      if (list.length) {
        list.forEach(item => {
          if (item._uuid === source._uuid) {
            if (type === 'check') {
              item.choose = value ? 1 : 0;
            } else if (type === 'value') {
              item.score = parseInt(value, 10);
            }
          } else if (item.childList && item.childList.length) {
            loopList(item.childList, source, type);
          }
        });
      }
    };

    loopList(resultList, obj, typeVal);
    setRefresh(true);
  };

  const drawThirdLevel = list => {
    return (list || []).map(item => {
      return (
        <div key={item._uuid} className={styles['card-level-item']}>
          <CheckBox checked={item.choose} onChange={e => handleChange(e, item, 'check')} />
          <div className={styles['card-level-item-title']}>
            <Tooltip title={item?.riskName ?? ''}>{item?.riskName ?? ''}</Tooltip>
          </div>
          <NumberField
            value={item.score}
            style={{ width: '100px' }}
            onInput={e => handleChange(e, item, 'value')}
            min={0}
            max={100}
            step={1}
          />
        </div>
      );
    });
  };

  const drawSpan = () => {
    const selectedList = [];

    const loopList = (list = []) => {
      if (list.length) {
        list.forEach(item => {
          if (item.choose && item.score >= 0 && !(item.childList && item.childList.length)) {
            selectedList.push(parseInt(item.score, 10));
          } else if (item.childList && item.childList.length) {
            loopList(item.childList);
          }
        });
      }
    };
    loopList(resultList);

    if (!selectedList.length) return '0';

    let str = '';

    str = selectedList
      .map(item => {
        return `${item}+`;
      })
      .join('');

    const val = (selectedList.reduce((a, b) => a + b) / selectedList.length).toFixed(2);

    return `(${str?.substring(0, str.length - 1)}) / ${selectedList.length} = ${val}`;
  };

  return (
    <>
      <Header
        title={intl.get('sdat.riskLevelDefine.view.title.riskLevelDefine').d('风险等级定义')}
        backPath="/sdat/monitor-org-management/list"
      >
        <Button icon="save" color="primary" onClick={handleSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </Header>

      <div className={styles['level-define-card-list']}>
        <div className={styles['level-define-card-panel']}>
          <div className={styles['level-define-level-panel']}>
            <div
              style={{ fontWeight: '600', fontSize: '16px', color: '#1D2129', lineHeight: '24px' }}
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

          <LevelTable tableDS={tableDS} />
        </div>

        {drawCardList(resultList)}
      </div>

      <div className={styles['level-define-card-panel']}>
        <div className={styles['level-define-card-panel-str']}>
          <div>{intl.get('sdat.riskLevelDefine.view.title.riskScore').d('评分')}：</div>
          <div
            style={{ fontSize: '16px', color: '#1D2129', lineHeight: '24px', fontWeight: '600' }}
          >
            {drawSpan()}
          </div>
        </div>
      </div>
    </>
  );
};

export default formatterCollections({
  code: ['sdat.riskLevelDefine', 'sdat.riskScanScore'],
})(RiskLevelDefine);
