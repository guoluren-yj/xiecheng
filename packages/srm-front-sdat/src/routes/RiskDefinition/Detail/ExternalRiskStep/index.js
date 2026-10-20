/* eslint-disable no-param-reassign */
/**
 * 外部事件
 */
import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import {
  Row,
  Col,
  CheckBox,
  Dropdown,
  Menu,
  Icon,
  Modal,
  Button,
  DataSet,
  Table,
  Spin,
} from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import { uniqueFunc, getResponse } from '@/utils/utils';
import {
  fetchRiskDetail,
  fetchRiskDefault,
  fetchPersonList,
  fetchSavePerson,
} from '@/services/riskDefinitionService';

import { AccountViewListDS } from '../../stores/riskDefinitionDS';

import RiskManagerModal from '../RiskManagerModal';
import styles from './index.less';

let changedList = [];
let cachePersonList = [];

export default function ExternalRiskStep(props) {
  const {
    // pageType,
    defineId,
    scope,
    // editType,
    // history,
    groupCode,
    accountListDS,
    enabledFlag,
    // viewFlag,
    riskFlag = '',
    onChangeIndexList = () => {},
    onCacheAllIndex = () => {},
    onChangeNextFlag = () => {},
    onChangeSaveType = () => {},
  } = props;

  const viewDS = useMemo(() => new DataSet({ ...AccountViewListDS() }), []);

  const [list, setList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      changedList = [];
      cachePersonList = [];
      onChangeIndexList([]);
      onCacheAllIndex([]);
    };
  }, []);

  useEffect(() => {
    handleQuery(defineId);
  }, [defineId]);

  useEffect(() => {
    setRefresh(true);
  }, [enabledFlag]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  /**
   * 查询是否有指标列表
   */
  const validIndexList = (treeArr = []) => {
    const indexArr = [];

    const loopArr = arr => {
      if (arr.length) {
        arr.forEach(item => {
          if (item.themeLevel === 3 && item.childList && item.childList.length) {
            item.childList.forEach(item2 => {
              indexArr.push(item2);
            });
          } else if (item.childList && item.childList.length) {
            loopArr(item.childList);
          }
        });
      }
    };

    loopArr(treeArr);
    return indexArr;
  };

  const handleQuery = id => {
    if (id && id !== 'add') {
      changedList = [];
      onChangeNextFlag(false);
      setLoading(true);

      fetchRiskDetail({
        tenantId: getCurrentOrganizationId(),
        themeCode: riskFlag,
        defineId: id,
        groupCode: groupCode === 'selfCode' ? '' : groupCode,
        scope,
      }).then(async res => {
        if (getResponse(res)) {
          let commonArr = [];
          const indexList = validIndexList(res); // 详情的指标列表

          if (indexList.length) {
            commonArr = [...res];
            onChangeSaveType('edit');
          } else {
            const defaultArr = await fetchRiskDefault({
              tenantId: getCurrentOrganizationId(),
              themeCode: riskFlag,
              defineId: id,
              scope,
            });

            commonArr = Array.isArray(defaultArr) && defaultArr.length ? [...defaultArr] : [];
            onChangeSaveType('create');
          }

          onChangeNextFlag(true);
          setLoading(false);

          // 新建状态 缓存所有数据 保存时传给后端
          if (!indexList.length) {
            changedList = [];
            formatArray(commonArr || []);
          }

          setList(commonArr || []);
          onCacheAllIndex(commonArr || []);
          onChangeIndexList(changedList);
        } else {
          onChangeNextFlag(true);
          setLoading(false);
        }
      });
    }
  };

  const formatArray = (arr = []) => {
    if (arr.length) {
      arr.forEach(item => {
        if (item.themeLevel === 4) {
          changedList.push({ ...item });
        } else if (item.childList && item.childList.length) {
          formatArray(item.childList);
        }
      });
    }
  };

  /**
   * 选择风险经办人
   */
  const openSelectPeople = record => {
    if ([1, '1'].includes(enabledFlag)) {
      viewPeopleModal(record);
    } else {
      editPeopleModal(record);
    }
  };

  const viewPeopleModal = record => {
    let modal = null;

    const handleCloseModal = () => {
      if (modal) {
        viewDS.loadData([]);
        modal.close();
      }
    };

    const columns = () => {
      return [{ name: 'loginName' }, { name: 'personName' }];
    };

    if (viewDS) {
      viewDS.setQueryParameter('defineId', defineId);
      viewDS.setQueryParameter('tenantId', getCurrentOrganizationId());
      viewDS.setQueryParameter('themeCode', record?.themeCode ?? '');
      viewDS.query();
    }

    modal = Modal.open({
      title: null,
      children: (
        <div style={{ height: 'calc(100vh - 120px)' }}>
          <Table
            dataSet={viewDS}
            columns={columns()}
            queryFieldsLimit={2}
            autoHeight={{ type: 'maxHeight', diff: 20 }}
          />
        </div>
      ),
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '742px' },
      header: null,
      bodyStyle: { padding: '20px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      ),
    });
  };

  const editPeopleModal = async record => {
    let modal = null;

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    const handleChangeCache = (data = []) => {
      cachePersonList = [...data];
    };

    const result = await fetchPersonList({
      defineId,
      tenantId: getCurrentOrganizationId(),
      themeCode: record?.themeCode ?? '',
    });

    // 默认选中的数据
    let defaultArr = [];

    if (getResponse(result) && result.length) {
      defaultArr = result.map(item => {
        return {
          ...item,
          id: item.personId,
          realName: item.personName,
        };
      });
    }

    /**
     * 选择经办人确定操作
     */
    const handleSubmit = async () => {
      const selectList = accountListDS.selected.map(rcd => rcd.toData());
      const mixList = [...selectList, ...cachePersonList];

      const uniList = uniqueFunc(mixList, 'id');

      const res = await fetchSavePerson({
        ...record,
        defineId,
        tenantId: getCurrentOrganizationId(),
        personList: uniList.map(item => item.id),
      });

      if (getResponse(res)) {
        // 更新树形数据 重新渲染
        const loopArr = (arr, rcd, data) => {
          arr.forEach(item2 => {
            if (rcd.themeId === item2.themeId) {
              item2.personCount = [...data].length;
            } else if (item2.childList && item2.childList.length) {
              loopArr(item2.childList, rcd, data);
            }
          });
        };
        const localList = [...list];

        loopArr(localList, record, uniList);
        onChangeIndexList(changedList);
        setList(localList);
        onCacheAllIndex(localList);
        modal.close();
      }
    };

    modal = Modal.open({
      title: null,
      children: (
        <RiskManagerModal
          localRecord={record}
          defaultList={defaultArr}
          onChangeCache={handleChangeCache}
          accountListDS={accountListDS}
        />
      ),
      closable: false,
      drawer: true,
      mask: true,
      style: { width: '1000px' },
      header: null,
      bodyStyle: { padding: 0 },
      afterClose: () => {
        cachePersonList = [];
      },
      footer: (
        <div>
          <Button color="primary" onClick={handleSubmit}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * 渲染动态列表
   */
  const drawDynamicPanel = (dataList = []) => {
    return (dataList || []).map(item => {
      return (
        <div key={item.themeId} style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '500',
              lineHeight: '18px',
            }}
          >
            <span>{item.themeName}</span>
          </div>
          <div>
            {item.childList && item.childList.length ? drawDynamicItem(item.childList) : null}
          </div>
        </div>
      );
    });
  };

  /**
   * 切换级别
   * @param {*} record
   * @param {*} level
   */
  const changeStatus = (record, level) => {
    if (changedList.length) {
      let hasNo = true;
      changedList.forEach(item => {
        if (item.ruleStrategyId === record.ruleStrategyId) {
          hasNo = false;
          item.executeExpression = level;
        }
      });

      if (hasNo) {
        // 无此条数据
        changedList.push({
          ...record,
          executeExpression: level,
        });
      }
    } else {
      changedList.push({
        ...record,
        executeExpression: level,
      });
    }

    const loopArr = (arr, item, status) => {
      arr.forEach(item2 => {
        if (item.ruleStrategyId === item2.ruleStrategyId) {
          item2.executeExpression = status;
        } else if (item2.childList && item2.childList.length) {
          loopArr(item2.childList, item, status);
        }
      });
    };
    const localList = [...list];

    loopArr(localList, record, level);
    onChangeIndexList(changedList);
    onCacheAllIndex(localList);
    setList(localList);
  };

  const menu = item => {
    return (
      <Menu>
        <Menu.Item>
          <span className={styles['status-high-tag']} onClick={() => changeStatus(item, 3)}>
            {intl.get('hzero.common.priority.high').d('高')}
          </span>
        </Menu.Item>
        <Menu.Item>
          <span className={styles['status-middle-tag']} onClick={() => changeStatus(item, 2)}>
            {intl.get('hzero.common.priority.medium').d('中')}
          </span>
        </Menu.Item>
        <Menu.Item>
          <span className={styles['status-low-tag']} onClick={() => changeStatus(item, 1)}>
            {intl.get('hzero.common.priority.low').d('低')}
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  /**
   * 全选操作
   * @param {*} arr
   */
  const handleSelectAll = (record, flag) => {
    const arr = record?.childList ?? [];

    if (arr.length) {
      arr.forEach(item => {
        if (changedList.length) {
          let hasItem = false;
          for (let i = 0; i < changedList.length; i++) {
            if (
              String(changedList[i].parentThemeId) === String(item.themeId) ||
              String(changedList[i].themeId) === String(item.themeId)
            ) {
              hasItem = true;
              changedList[i].ruleChoose = flag;
              changedList[i].strategyChoose = flag;
            }
          }

          if (!hasItem) {
            changedList.push({
              ...item,
              ruleChoose: flag,
              strategyChoose: flag,
            });
          }
        } else {
          changedList.push({
            ...item,
            ruleChoose: flag,
            strategyChoose: flag,
          });
        }
      });
    }

    const loopArr = (itemArr, item, tag) => {
      itemArr.forEach(item2 => {
        if (item2.themeId === item.themeId) {
          if (item2.childList && item2.childList.length) {
            item2.childList.forEach(item3 => {
              item3.ruleChoose = tag;
              item3.strategyChoose = tag;
            });
          }
        } else if (item2.childList && item2.childList.length) {
          loopArr(item2.childList, item, tag);
        }
      });
    };
    const localList = [...list];

    loopArr(localList, record, flag);
    onChangeIndexList(changedList);
    onCacheAllIndex(localList);
    setList(localList);
  };

  const drawDynamicItem = (dataList = []) => {
    return (dataList || []).map(item => {
      const value = item.executeExpression;
      const classNames = [3, '3'].includes(value)
        ? styles['status-high-tag']
        : [2, '2'].includes(value)
        ? styles['status-middle-tag']
        : styles['status-low-tag'];

      const text = value
        ? [3, '3'].includes(value)
          ? intl.get('hzero.common.priority.high').d('高')
          : [2, '2'].includes(value)
          ? intl.get('hzero.common.priority.medium').d('中')
          : intl.get('hzero.common.priority.low').d('低')
        : '';

      if (item.themeLevel === 2) {
        return (
          <div
            key={item.themeId}
            style={{
              padding: '16px 20px 8px',
              border: '1px solid rgba(229,231,236,1)',
              borderRadius: '2px',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '-16px',
              }}
            >
              <span>{item.themeName}</span>
              <span style={{ zIndex: '2' }}>
                <a
                  style={{
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => openSelectPeople({ ...item, defineId })}
                >
                  {[1, '1'].includes(enabledFlag) ? null : <Icon type="add" />}
                  <span>
                    {`${intl
                      .get('sdat.riskDefinition.view.button.riskManager')
                      .d('风险经办人')}(${item?.personCount ?? 0})`}
                  </span>
                </a>
              </span>
            </div>
            <Row>
              {item.childList && item.childList.length ? drawDynamicItem(item.childList) : null}
            </Row>
          </div>
        );
      }

      if (item.themeLevel === 3) {
        return (
          <div key={item.themeId}>
            <div className={styles['dynamic-item-panel-title']} style={{ marginTop: '32px' }}>
              <span>{item.themeName}</span>

              {item.childList && item.childList.length && ![1, '1'].includes(enabledFlag) ? (
                <span style={{ marginLeft: '12px' }}>
                  <a onClick={() => handleSelectAll(item, 1)}>
                    {intl.get('hzero.common.button.selectAll').d('全选')}
                  </a>
                  <a style={{ marginLeft: '8px' }} onClick={() => handleSelectAll(item, 0)}>
                    {intl.get('hzero.common.button.clear').d('清空')}
                  </a>
                </span>
              ) : null}
            </div>
            <Row>
              {item.childList && item.childList.length ? drawDynamicItem(item.childList) : null}
            </Row>
          </div>
        );
      }

      if (item.themeLevel === 4) {
        return (
          <Col
            key={item.ruleStrategyId}
            span={6}
            style={{
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              margin: '8px 0',
            }}
          >
            <CheckBox
              disabled={[1, '1'].includes(enabledFlag)}
              checked={item.ruleChoose}
              onChange={e => changeDimension(e, item)}
            >
              {item.ruleName}
            </CheckBox>

            <Dropdown
              disabled={[1, '1'].includes(enabledFlag)}
              overlay={() => menu(item)}
              trigger={['click']}
              style={{ marginLeft: '8px' }}
            >
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {text ? (
                  <Tag className={classNames} style={{ margin: '0 4px' }}>
                    {text}
                  </Tag>
                ) : null}
                {[1, '1'].includes(enabledFlag) ? null : (
                  <Icon type="expand_more" style={{ fontSize: '14px' }} />
                )}
              </span>
            </Dropdown>
          </Col>
        );
      }

      return null;
    });
  };

  /**
   * 修改选择状态
   */
  const changeDimension = (e, value) => {
    if (changedList.length) {
      let hasNo = true;
      changedList.forEach(record => {
        if (record.ruleStrategyId === value.ruleStrategyId) {
          hasNo = false;
          record.ruleChoose = e ? 1 : 0;
          record.strategyChoose = e ? 1 : 0;
        }
      });

      if (hasNo) {
        // 无此条数据
        changedList.push({
          ...value,
          ruleChoose: e ? 1 : 0,
          strategyChoose: e ? 1 : 0,
        });
      }
    } else {
      changedList.push({
        ...value,
        ruleChoose: e ? 1 : 0,
        strategyChoose: e ? 1 : 0,
      });
    }

    const loopArr = (arr, item, status) => {
      arr.forEach(item2 => {
        if (item.ruleStrategyId === item2.ruleStrategyId) {
          item2.ruleChoose = status;
          item2.strategyChoose = status;
        } else if (item2.childList && item2.childList.length) {
          loopArr(item2.childList, item, status);
        }
      });
    };
    const localList = [...list];

    loopArr(localList, value, e);
    onChangeIndexList(changedList);
    onCacheAllIndex(localList);
    setList(localList);
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['risk-definition-external-dynamic-panel']}>
        {drawDynamicPanel(list)}
      </div>
    </Spin>
  );
}
