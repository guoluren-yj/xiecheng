/* eslint-disable no-param-reassign */
/**
 * 业务风险步骤页面
 */
import React, { useState, useEffect, useMemo } from 'react';
import intl from 'utils/intl';
import { DataSet, Row, Col, Icon, Modal, Button, Table, Tooltip, Spin } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import { getResponse } from '@/utils/utils';
import { fetchRiskDetail, fetchRiskDefault } from '@/services/riskDefinitionService';

import { AccountViewListDS } from '../../stores/riskDefinitionDS';
import styles from './index.less';

export default function BusinessRiskStep(props) {
  const { defineId, scope, groupCode, tenantId } = props;

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
        themeCode: 'businessRisk',
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
            formatArray(commonArr || [], 'edit');
          } else {
            const defaultArr = await fetchRiskDefault({
              tenantId,
              themeCode: 'businessRisk',
              defineId: id,
              scope,
            });

            commonArr = Array.isArray(defaultArr) && defaultArr.length ? [...defaultArr] : [];
            formatArray(commonArr || [], 'create');
          }

          setList(commonArr || []);
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
    viewPeopleModal(record);
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
                      }}
                      type="help"
                    />
                  </Tooltip>
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
                lineHeight: '18px',
              }}
            >
              <span style={{ color: '#868D9C' }}>{item.strategyName}</span>
              &nbsp;&nbsp;
              <Tag className={classNames}>{text}</Tag>
            </div>
            <div style={{ margin: '4px 0 0', color: '#1D2129' }}>
              {`${item.equal} <= ${item.themeName} <= ${item.lessThan}`}
            </div>
          </Col>
        );
      }

      return null;
    });
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
