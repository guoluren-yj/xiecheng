/* eslint-disable no-param-reassign */
/**
 * 业务风险步骤页面
 */
import React, { useState, useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import {
  DataSet,
  Row,
  Col,
  CheckBox,
  Icon,
  Modal,
  Button,
  Form,
  NumberField,
  Range,
  Table,
  Spin,
  Tooltip,
} from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import { uniqueFunc, getResponse } from '@/utils/utils';
import {
  fetchRiskDetail,
  fetchRiskDefault,
  fetchPersonList,
  fetchSavePerson,
} from '@/services/riskDefinitionService';

import { RatioFormDS, RatioDayFormDS, AccountViewListDS } from '../../stores/riskDefinitionDS';
import RiskManagerModal from '../RiskManagerModal';
import styles from './index.less';

let dsMap = {};
let changedList = [];
let cacheBusinessPersonList = [];

export default function BusinessRiskStep(props) {
  const {
    // editType,
    defineId,
    scope,
    // pageType,
    // history,
    groupCode,
    accountListDS,
    enabledFlag,
    // viewFlag,
    onChangeBusinessList = () => {},
    onCacheAllIndex = () => {},
    onChangeSaveType = () => {},
  } = props;

  const viewDS = useMemo(() => new DataSet({ ...AccountViewListDS() }), []);

  const [list, setList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      dsMap = {};
      return () => {
        changedList = [];
        cacheBusinessPersonList = [];
        onChangeBusinessList([]);
      };
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

    const loopArr = (arr) => {
      if (arr.length) {
        arr.forEach((item) => {
          if (item.themeLevel === 3 && item.childList && item.childList.length) {
            item.childList.forEach((item2) => {
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

  const handleQuery = (id) => {
    if (id && id !== 'add') {
      changedList = [];
      setLoading(true);
      fetchRiskDetail({
        tenantId: getCurrentOrganizationId(),
        themeCode: 'businessRisk',
        defineId: id,
        groupCode: groupCode === 'selfCode' ? '' : groupCode,
        scope,
      }).then(async (res) => {
        if (getResponse(res)) {
          let commonArr = [];
          const indexList = validIndexList(res); // 详情的指标列表

          if (indexList.length) {
            commonArr = [...res];
            onChangeSaveType('edit');
            formatArray(commonArr || [], 'edit');
          } else {
            const defaultArr = await fetchRiskDefault({
              tenantId: getCurrentOrganizationId(),
              themeCode: 'businessRisk',
              defineId: id,
              scope,
            });

            commonArr = Array.isArray(defaultArr) && defaultArr.length ? [...defaultArr] : [];
            onChangeSaveType('create');
            formatArray(commonArr || [], 'create');
          }
          setLoading(false);

          // 新建状态 缓存所有数据 保存时传给后端
          // if (!indexList.length) {
          //   changedList = [...commonArr];
          // }

          setList(commonArr || []);
          onCacheAllIndex(commonArr || []);
          onChangeBusinessList(changedList);
        } else {
          setLoading(false);
        }
      });
    }
  };

  const formatArray = (arr = [], type) => {
    if (arr.length) {
      arr.forEach((item) => {
        if (item.themeLevel === 4) {
          const str = item?.conditionExpression ?? '';
          const leftStartIndex = str ? str.indexOf('>') : -1;
          const leftEndIndex = str ? str.indexOf('&') : -1;

          const rightStartIndex = str ? str.indexOf('<') : -1;
          const rightEndIndex = str ? str.length : -1;

          const equal =
            leftStartIndex > 0 && leftEndIndex > 0
              ? parseInt(str.slice(leftStartIndex + 2, leftEndIndex - 1), 10)
              : 0;
          const lessThan =
            rightStartIndex > 0 && rightEndIndex > 0
              ? parseInt(str.slice(rightStartIndex + 2, rightEndIndex), 10)
              : 0;

          item.equal = equal;
          item.lessThan = lessThan;

          if (type === 'create' || (type === 'edit' && item.groupCode === 'GROUP0000000000')) {
            changedList.push({
              ...item,
              // strategyChoose: 1,
              // ruleChoose: 1,
            });
          }
        } else if (item.childList && item.childList.length) {
          formatArray(item.childList, type);
        }
      });
    }
  };

  /**
   * 选择风险经办人
   */
  const openSelectPeople = async (record) => {
    if ([1, '1'].includes(enabledFlag)) {
      viewPeopleModal(record);
    } else {
      editPeopleModal(record);
    }
  };

  const viewPeopleModal = async (record) => {
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

  const editPeopleModal = async (record) => {
    let modal = null;

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    const handleChangeCache = (data = []) => {
      cacheBusinessPersonList = [...data];
    };

    const result = await fetchPersonList({
      defineId,
      tenantId: getCurrentOrganizationId(),
      themeCode: record?.themeCode ?? '',
    });

    // 默认选中的数据
    let defaultArr = [];

    if (getResponse(result) && result.length) {
      defaultArr = result.map((item) => {
        return {
          ...item,
          id: item.personId,
          realName: item.personName,
          loginName: item.loginName,
        };
      });
    }

    /**
     * 选择经办人确定操作
     */
    const handleSubmit = async () => {
      const selectList = accountListDS.selected.map((rcd) => rcd.toData());
      const mixList = [...selectList, ...cacheBusinessPersonList];

      const uniList = uniqueFunc(mixList, 'id');

      const res = await fetchSavePerson({
        ...record,
        defineId,
        tenantId: getCurrentOrganizationId(),
        personList: uniList.map((item) => item.id),
      });

      if (getResponse(res)) {
        // 更新树形数据 重新渲染
        const loopArr = (arr, rcd, data) => {
          arr.forEach((item2) => {
            if (rcd.themeId === item2.themeId) {
              item2.personCount = [...data].length;
            } else if (item2.childList && item2.childList.length) {
              loopArr(item2.childList, rcd, data);
            }
          });
        };
        const localList = [...list];

        loopArr(localList, record, uniList);
        onChangeBusinessList(changedList);
        onCacheAllIndex(localList);
        setList(localList);
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
        cacheBusinessPersonList = [];
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
   * 修改选择状态
   */
  const changeDimension = (e, value) => {
    if (changedList.length) {
      let hasNo = true;
      changedList.forEach((record) => {
        if (record.ruleStrategyId === value.ruleStrategyId) {
          hasNo = false;
          record.strategyChoose = e ? 1 : 0;
          record.ruleChoose = e ? 1 : 0;
        }
      });

      if (hasNo) {
        // 无此条数据
        changedList.push({
          ...value,
          strategyChoose: e ? 1 : 0,
          ruleChoose: e ? 1 : 0,
        });
      }
    } else {
      changedList.push({
        ...value,
        strategyChoose: e ? 1 : 0,
        ruleChoose: e ? 1 : 0,
      });
    }

    const loopArr = (arr, item, status) => {
      arr.forEach((item2) => {
        if (item.ruleStrategyId === item2.ruleStrategyId) {
          item2.strategyChoose = status;
          item2.ruleChoose = status;
        } else if (item2.childList && item2.childList.length) {
          loopArr(item2.childList, item, status);
        }
      });
    };
    const localList = [...list];

    loopArr(localList, value, e);
    onChangeBusinessList(changedList);
    onCacheAllIndex(localList);
    setList(localList);
  };

  /**
   * 全选操作
   * @param {*} arr
   */
  const handleSelectAll = (record, flag) => {
    const arr = record?.childList ?? [];

    if (arr.length) {
      arr.forEach((item) => {
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
      itemArr.forEach((item2) => {
        if (item2.themeId === item.themeId) {
          if (item2.childList && item2.childList.length) {
            item2.childList.forEach((item3) => {
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
    onChangeBusinessList(changedList);
    onCacheAllIndex(localList);
    setList(localList);
  };

  /**
   * 渲染动态字段
   * @param {*} dataList
   * @returns
   */
  const drawDynamicItem = (dataList = []) => {
    return (dataList || []).map((item) => {
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
              padding: '16px 20px',
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
                  onClick={() => openSelectPeople(item)}
                >
                  {[1, '1'].includes(enabledFlag) ? null : <Icon type="add" />}
                  <span>
                    {`${intl.get('sdat.riskDefinition.view.button.riskManager').d('风险经办人')}(${
                      item?.personCount ?? 0
                    })`}
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

              {item.description ? (
                <span style={{ marginLeft: '4px' }}>
                  <Tooltip title={item.description}>
                    <Icon
                      style={{
                        fontSize: '14px',
                        verticalAlign: 'bottom',
                        cursor: 'pointer',
                        color: '#868D9C',
                      }}
                      type="help"
                    />
                  </Tooltip>
                </span>
              ) : null}

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

      if (item.themeLevel === 4 && item.ruleCode !== 'invoicingDelayDays') {
        let ds = null;
        if (dsMap && !dsMap[item.ruleStrategyId]) {
          ds = new DataSet({ ...RatioFormDS() });
          ds.current.set('equal', item.equal);
          ds.current.set('lessThan', item.lessThan);
          dsMap[item.ruleStrategyId] = ds;
        } else {
          ds = dsMap[item.ruleStrategyId];
        }

        const equal = ds?.current?.get('equal') ?? 0;
        const lessThan = ds?.current?.get('lessThan') ?? 100;

        const defaultValue = [parseInt(equal, 10), parseInt(lessThan, 10)];

        return (
          <Col
            key={item.ruleStrategyId}
            span={8}
            style={{
              display: 'flex',
              flexDirection: 'column',
              paddingRight: '40px',
              paddingTop: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '22px',
                marginBottom: '8px',
              }}
            >
              <CheckBox
                disabled={[1, '1'].includes(enabledFlag)}
                checked={item.strategyChoose}
                onChange={(e) => changeDimension(e, item)}
              >
                {item.strategyName}
              </CheckBox>
              <Tag className={classNames}>{text}</Tag>
            </div>
            <div style={{ margin: '8px 0 0' }}>
              <Form dataSet={ds} columns={2} labelLayout="float">
                <NumberField
                  name="equal"
                  suffix="%"
                  disabled={[1, '1'].includes(enabledFlag)}
                  onChange={(e) => handleChangeEqual(e, item)}
                />
                <NumberField
                  name="lessThan"
                  suffix="%"
                  disabled={[1, '1'].includes(enabledFlag)}
                  onChange={(e) => handleChangeLessThan(e, item)}
                />
              </Form>
            </div>
            {![1, '1'].includes(enabledFlag) ? (
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
                  disabled={[1, '1'].includes(enabledFlag)}
                  range
                  value={defaultValue}
                  onChange={(e) => handleChangeRange(e, item)}
                />
              </div>
            ) : null}
          </Col>
        );
      }

      if (item.themeLevel === 4 && item.ruleCode === 'invoicingDelayDays') {
        let ds = null;
        if (dsMap && !dsMap[item.ruleStrategyId]) {
          ds = new DataSet({ ...RatioDayFormDS() });
          ds.current.set('equal', item.equal);
          ds.current.set('lessThan', item.lessThan);
          dsMap[item.ruleStrategyId] = ds;
        } else {
          ds = dsMap[item.ruleStrategyId];
        }

        const equal = ds?.current?.get('equal') ?? 0;
        const lessThan = ds?.current?.get('lessThan') ?? 0;

        const defaultValue = [parseInt(equal, 10), parseInt(lessThan, 10)];

        return (
          <Col
            key={item.ruleStrategyId}
            span={8}
            style={{
              display: 'flex',
              flexDirection: 'column',
              paddingRight: '40px',
              paddingTop: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '22px',
                marginBottom: '8px',
              }}
            >
              <CheckBox
                disabled={[1, '1'].includes(enabledFlag)}
                checked={item.strategyChoose}
                onChange={(e) => changeDimension(e, item)}
              >
                {item.strategyName}
              </CheckBox>
              <Tag className={classNames}>{text}</Tag>
            </div>
            <div style={{ margin: '8px 0 0' }}>
              <Form dataSet={ds} columns={2} labelLayout="float">
                <NumberField
                  name="equal"
                  // suffix="%"
                  disabled={[1, '1'].includes(enabledFlag)}
                  onChange={(e) => handleChangeEqual(e, item)}
                />
                <NumberField
                  name="lessThan"
                  // suffix="%"
                  disabled={[1, '1'].includes(enabledFlag)}
                  onChange={(e) => handleChangeLessThan(e, item)}
                />
              </Form>
            </div>
            {![1, '1'].includes(enabledFlag) ? (
              <div
                style={{
                  height: '12px',
                  marginTop: '16px',
                }}
              >
                <Range
                  min={0}
                  max={9999}
                  step={1}
                  tooltipVisible={false}
                  disabled={[1, '1'].includes(enabledFlag)}
                  range
                  value={defaultValue}
                  onChange={(e) => handleChangeRange(e, item)}
                />
              </div>
            ) : null}
          </Col>
        );
      }

      return null;
    });
  };

  /**
   * 改变滑块内容
   * @param {*} e
   * @param {*} item
   */
  const handleChangeRange = (e, item) => {
    const equal = e && e.length ? e[0] : 0;
    const lessThan = e && e.length > 1 ? e[1] : 100;

    if (changedList.length) {
      let hasNo = true;
      changedList.forEach((record) => {
        if (record.ruleStrategyId === item.ruleStrategyId) {
          hasNo = false;
          record.equal = parseInt(equal, 10);
          record.lessThan = parseInt(lessThan, 10);
        }
      });

      if (hasNo) {
        // 无此条数据
        changedList.push({
          ...item,
          equal: parseInt(equal, 10),
          lessThan: parseInt(lessThan, 10),
        });
      }
    } else {
      changedList.push({
        ...item,
        equal: parseInt(equal, 10),
        lessThan: parseInt(lessThan, 10),
      });
    }

    const loopArr = (arr, record, equ, less) => {
      arr.forEach((item2) => {
        if (record.ruleStrategyId === item2.ruleStrategyId) {
          item2.equal = equ;
          item2.lessThan = less;
        } else if (item2.childList && item2.childList.length) {
          loopArr(item2.childList, record, equ, less);
        }
      });
    };
    const localList = [...list];
    loopArr(localList, item, equal, lessThan);

    const ds = dsMap[item.ruleStrategyId] || '';
    if (ds && ds.current) {
      ds.current.set('equal', equal);
      ds.current.set('lessThan', lessThan);
    }

    onCacheAllIndex(localList);
    setList(localList);
  };

  /**
   * 改变 equal
   * @param {*} e
   * @param {*} item
   */
  const handleChangeEqual = (e, item) => {
    if (changedList.length) {
      let hasNo = true;
      changedList.forEach((record) => {
        if (record.ruleStrategyId === item.ruleStrategyId) {
          hasNo = false;
          record.equal = parseInt(e, 10);
        }
      });

      if (hasNo) {
        // 无此条数据
        changedList.push({
          ...item,
          equal: parseInt(e, 10),
        });
      }
    } else {
      changedList.push({
        ...item,
        equal: parseInt(e, 10),
      });
    }

    const loopArr = (arr, record, equ) => {
      arr.forEach((item2) => {
        if (record.ruleStrategyId === item2.ruleStrategyId) {
          item2.equal = parseInt(equ, 10);
        } else if (item2.childList && item2.childList.length) {
          loopArr(item2.childList, record, equ);
        }
      });
    };
    const localList = [...list];
    loopArr(localList, item, e);
    onChangeBusinessList(changedList);
    onCacheAllIndex(localList);
    setList(localList);
  };

  /**
   * 改变 lessThan
   * @param {*} e
   * @param {*} item
   */
  const handleChangeLessThan = (e, item) => {
    if (changedList.length) {
      let hasNo = true;
      changedList.forEach((record) => {
        if (record.ruleStrategyId === item.ruleStrategyId) {
          hasNo = false;
          record.lessThan = parseInt(e, 10);
        }
      });

      if (hasNo) {
        // 无此条数据
        changedList.push({
          ...item,
          lessThan: parseInt(e, 10),
        });
      }
    } else {
      changedList.push({
        ...item,
        lessThan: parseInt(e, 10),
      });
    }

    const loopArr = (arr, record, less) => {
      arr.forEach((item2) => {
        if (record.ruleStrategyId === item2.ruleStrategyId) {
          item2.lessThan = parseInt(less, 10);
        } else if (item2.childList && item2.childList.length) {
          loopArr(item2.childList, record, less);
        }
      });
    };
    const localList = [...list];
    loopArr(localList, item, e);
    onChangeBusinessList(changedList);
    onCacheAllIndex(localList);
    setList(localList);
  };

  /**
   * 渲染动态列表
   */
  const drawDynamicPanel = (dataList = []) => {
    return (dataList || []).map((item) => {
      return (
        <div key={item.ruleStrategyId} style={{ marginBottom: '16px' }}>
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

  return (
    <Spin spinning={loading}>
      <div className={styles['risk-definition-external-dynamic-panel']}>
        {drawDynamicPanel(list)}
      </div>
    </Spin>
  );
}
