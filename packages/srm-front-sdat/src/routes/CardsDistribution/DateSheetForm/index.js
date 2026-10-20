/* eslint-disable no-param-reassign */
/**
 * 数据表 数据详情页面
 */
import React, { useEffect, useState } from 'react';
import { Form, DataSet, Output, Button, Row, Col } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { fetchAllocateTenants } from '@/services/cardsDistributionService';

import { TenantSubscripDS } from '../stores/commonDS';

import TabsPanel from './TabsPanel';
import TenantLovModal from './TenantLovModal';
import styles from './index.less';

const tenantSubscriDS = new DataSet({ ...TenantSubscripDS() });

let lastFilterVal = null;
let continueKey = 1;

const DateSheetForm = (props) => {
  const { localRecord = null, lovDS, formDS, standarDS, subHistoryDS, topicLovDS } = props;

  const [radioValue, setValue] = useState('');
  const [isCanEdit, setEditFlag] = useState(false);
  const [showLov, setShow] = useState(false);

  useEffect(() => {
    setEditFlag(false);
    if (localRecord && localRecord.cardId) {
      formDS.queryParameter = { cardId: localRecord.cardId || '' };
      tenantSubscriDS.queryParameter = {
        cardId: localRecord.cardId || '',
      };
      subHistoryDS.queryParameter = {
        cardId: localRecord.cardId || '',
        // sort: 'submitDate,desc',
        bizType: 'CARD_DISTRIBUTION',
      };

      formDS.query().then(() => {
        if (formDS.current) {
          formDS.current.set('topicName', lastFilterVal?.topicName ?? '');
          formDS.current.set('dataSourceType', 'MySQL');
        }
      });
      subHistoryDS.query();
      tenantSubscriDS.query();
    }

    return () => {
      formDS.data = [];
      standarDS.data = [];
      subHistoryDS.data = [];
      tenantSubscriDS.data = [];
      lovDS.data = [];
      setValue('');
      lastFilterVal = {};
      continueKey = 1;
    };
  }, [localRecord]);

  /**
   * 批量分发数据
   */
  const handleDistrib = (params) => {
    if (params.length && continueKey) {
      continueKey = 0;
      const list = [];
      params.forEach((record) => {
        list.push({
          ...localRecord,
          tenantId: record.tenantId,
        });
      });

      fetchAllocateTenants(list).then((res) => {
        continueKey = 1;
        if (getResponse(res)) {
          notification.success();
          tenantSubscriDS.query();
          subHistoryDS.query();
          lovDS.data = [];
          lovDS.reset();
          setShow(false);
        } else {
          lovDS.queryParameter = {
            cardId: localRecord.cardId,
          };
          lovDS.query();
          return false;
        }
      });
    } else {
      return false;
    }
  };

  const handleOpenDistribLov = async () => {
    setShow(true);
  };

  const tenantProps = {
    lovDS,
    visible: showLov,
    onSelect: handleDistrib,
    localRecord,
    onCancel: () => {
      setShow(false);
    },
  };

  return (
    <>
      <div className={styles['card-title-header']}>
        <div className={styles['header-title']}>
          {intl.get('sdat.cardsDistribution.view.title.cardDetail').d('卡片详情')}
        </div>
        {localRecord && localRecord.cardId && (
          <div className={styles['header-btn-group']}>
            {!isCanEdit ? (
              <Button color="primary" onClick={handleOpenDistribLov}>
                {intl.get('sdat.cardsDistribution.view.btn.distribution').d('分发')}
              </Button>
            ) : null}
          </div>
        )}
      </div>
      <div className={styles['card-scroll-panel']}>
        <div style={{ marginTop: '16px' }} className={styles['card-manage-detail-vertical']}>
          <Form dataSet={formDS} columns={3} layout="none" labelLayout="vertical">
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item>
                  <Output name="code" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item>
                  <Output name="name" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item>
                  <Output name="type" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item>
                  <Output name="groupCode" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item>
                  <Output name="reportId" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item>
                  <Output name="projectId" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item>
                  <Output name="initSize" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item>
                  <Output name="orderSeq" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item>
                  <Output
                    name="enabledFlag"
                    renderer={({ record }) => {
                      return (
                        <span>
                          <Badge
                            dot
                            style={{
                              background: record && record.get('enabledFlag') > 0 ? '#52c41a' : '',
                            }}
                          />
                          &nbsp;
                          {record && record.get('enabledFlag') > 0
                            ? intl.get('sdat.cardsManage.status.hasAbled').d('已启用')
                            : intl.get('sdat.cardsManage.status.hasEnabled').d('已禁用')}
                        </span>
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item>
                  <Output name="uriVariables" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item>
                  <Output name="remark" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>

        <div style={{ marginTop: '32px' }}>
          <TabsPanel
            localRecord={localRecord}
            tenantSubscriDS={tenantSubscriDS}
            subHistoryDS={subHistoryDS}
            radioValue={radioValue}
            topicLovDS={topicLovDS}
          />
        </div>

        {showLov && <TenantLovModal {...tenantProps} />}
      </div>
    </>
  );
};

export default DateSheetForm;
