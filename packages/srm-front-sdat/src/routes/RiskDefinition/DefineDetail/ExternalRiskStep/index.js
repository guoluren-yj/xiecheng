/* eslint-disable no-param-reassign */
/**
 * 外部事件
 */
import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
import { Row, Col, Dropdown, Menu, Modal, Button, DataSet, Table, Spin } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import { getResponse } from '@/utils/utils';
import { fetchRiskDetail, fetchRiskDefault } from '@/services/riskDefinitionService';

import { AccountViewListDS } from '../../stores/riskDefinitionDS';

import styles from './index.less';

export default function ExternalRiskStep(props) {
  const { defineId, scope, groupCode, tenantId = '', riskFlag = '' } = props;

  const viewDS = useMemo(() => new DataSet({ ...AccountViewListDS() }), []);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    handleQuery(defineId);
  }, [defineId]);

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
      setLoading(true);
      fetchRiskDetail({
        tenantId,
        themeCode: riskFlag,
        defineId: id,
        groupCode: groupCode === 'selfCode' ? '' : groupCode,
        scope,
      }).then(async (res) => {
        setLoading(false);
        if (getResponse(res)) {
          let commonArr = [];
          const indexList = validIndexList(res); // 详情的指标列表

          if (indexList.length) {
            commonArr = [...res];
          } else {
            const defaultArr = await fetchRiskDefault({
              tenantId,
              themeCode: riskFlag,
              defineId: id,
              scope,
            });

            commonArr = Array.isArray(defaultArr) && defaultArr.length ? [...defaultArr] : [];
          }

          // 新建状态 缓存所有数据 保存时传给后端
          if (!indexList.length) {
            formatArray(commonArr || []);
          }

          setList(commonArr || []);
        }
      });
    }
  };

  const formatArray = (arr = []) => {
    if (arr.length) {
      arr.forEach((item) => {
        if (item.childList && item.childList.length) {
          formatArray(item.childList);
        }
      });
    }
  };

  /**
   * 选择风险经办人
   */
  const openSelectPeople = (record) => {
    viewPeopleModal(record);
  };

  const viewPeopleModal = (record) => {
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
      viewDS.setQueryParameter('tenantId', tenantId);
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

  /**
   * 渲染动态列表
   */
  const drawDynamicPanel = (dataList = []) => {
    return (dataList || []).map((item) => {
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

  const menu = () => {
    return (
      <Menu>
        <Menu.Item>
          <span className={styles['status-high-tag']}>
            {intl.get('hzero.common.priority.high').d('高')}
          </span>
        </Menu.Item>
        <Menu.Item>
          <span className={styles['status-middle-tag']}>
            {intl.get('hzero.common.priority.medium').d('中')}
          </span>
        </Menu.Item>
        <Menu.Item>
          <span className={styles['status-low-tag']}>
            {intl.get('hzero.common.priority.low').d('低')}
          </span>
        </Menu.Item>
      </Menu>
    );
  };

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
              <span style={{ color: 'rgba(0,0,0,0.85)' }}>{item.themeName}</span>
              <span style={{ zIndex: '2' }}>
                <a
                  style={{
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onClick={() => openSelectPeople({ ...item, defineId })}
                >
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
            <span>{item.ruleName}</span>

            <Dropdown
              disabled
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
              </span>
            </Dropdown>
          </Col>
        );
      }

      return null;
    });
  };

  return (
    <>
      {loading ? (
        <div
          style={{
            height: 'calc(100vh - 182px)',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Spin spinning={loading} />
        </div>
      ) : (
        <div className={styles['risk-definition-external-dynamic-panel']}>
          {drawDynamicPanel(list)}
        </div>
      )}
    </>
  );
}
