/**
 * 卡片详情
 */
import React, { useEffect } from 'react';
import intl from 'utils/intl';
import { Form, Table, Output, Row, Col } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';

import SortSelector from '@/components/SortSelector';

import styles from './index.less';

const TemplateDetail = (props) => {
  const { localRecord = '', templateDetailDS, historyDS } = props;

  useEffect(() => {
    if (localRecord) {
      historyDS.setQueryParameter('cardId', localRecord.get('cardId'));
      historyDS.setQueryParameter('bizType', 'CARD_MANAGE');
      historyDS.query();
      templateDetailDS.setQueryParameter('cardId', localRecord.get('cardId'));
      templateDetailDS.query();
    }
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
      label: intl.get(`sdat.templateManage.model.operateDate`).d('操作时间'),
    },
  ];

  const handleQuerySort = (sortFieldCode, sortType) => {
    historyDS.setQueryParameter('sort', `${sortFieldCode},${sortType?.toLowerCase() ?? ''}`);
    historyDS.query();
  };

  return (
    <>
      <div className={styles['card-manage-detail-vertical']}>
        <Form dataSet={templateDetailDS} columns={3} layout="none" labelLayout="vertical">
          <Row gutter={16}>
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
          <Row gutter={16}>
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
                          ? intl.get('sdat.templateManage.status.hasAbled').d('已启用')
                          : intl.get('sdat.templateManage.status.hasEnabled').d('已禁用')}
                      </span>
                    );
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
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
          {intl.get('sdat.templateManage.view.message.operationHistory').d('操作历史')}
        </div>
        <div style={{ position: 'absolute', right: '10px', top: '15px' }}>
          <SortSelector sortFieldCode="operateTime" onSortQuery={handleQuerySort} fields={fields} />
        </div>
      </div>

      <Table dataSet={historyDS} columns={columns()} queryBar="none" />
    </>
  );
};

export default TemplateDetail;
