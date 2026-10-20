/**
 * 卡片详情
 */
import React, { useEffect } from 'react';
import intl from 'utils/intl';
import { Form, Table, Output, Row, Col } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';

import SortSelector from '@/components/SortSelector';

import styles from './index.less';

const CardDetail = (props) => {
  const { localRecord, cardFormDS, historyDS } = props;

  useEffect(() => {
    historyDS.setQueryParameter('cardId', localRecord.get('cardId'));
    historyDS.setQueryParameter('bizType', 'CARD_DISTRIBUTION');
    historyDS.setQueryParameter('tenantId', localRecord.get('tenantId'));
    historyDS.query();
    cardFormDS.setQueryParameter('cardId', localRecord.get('cardId'));
    cardFormDS.query();

    return () => {
      historyDS.data = [];
      historyDS.reset();
      cardFormDS.data = [];
      cardFormDS.reset();
    };
  }, [localRecord]);

  const columns = () => {
    return [
      {
        name: 'operateType',
      },
      {
        name: 'operateTime',
      },
      {
        name: 'operateUserName',
      },
    ];
  };

  /**
   * 排序字段
   */
  const fields = [
    {
      name: 'operateTime',
      label: intl.get(`sdat.cardsDistribution.model.operateDate`).d('操作时间'),
    },
  ];

  const handleQuerySort = (sortFieldCode, sortType) => {
    historyDS.setQueryParameter('sort', `${sortFieldCode},${sortType?.toLowerCase() ?? ''}`);
    historyDS.query();
  };

  return (
    <>
      <div className={styles['card-manage-detail-vertical']}>
        <Form dataSet={cardFormDS} columns={3} layout="none" labelLayout="vertical">
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

      <div className={styles['card-manage-detail-history']}>
        <div className={styles['card-manage-detail-history-title']}>
          {intl.get('sdat.cardsManage.view.message.operationHistory').d('操作历史')}
        </div>
        <div style={{ position: 'absolute', right: '10px', top: '15px' }}>
          <SortSelector sortFieldCode="operateTime" onSortQuery={handleQuerySort} fields={fields} />
        </div>
      </div>

      <Table dataSet={historyDS} columns={columns()} queryBar="none" />
    </>
  );
};

export default CardDetail;
