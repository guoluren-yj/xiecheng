import React from 'react';
import { Col, Row, Tag } from 'choerodon-ui';
import { dateTimeRender } from 'utils/renderer';

import intl from '@/utils/intl';

const ApproveItem = (props) => {
  const { detail = {} } = props;
  const name = `${detail.startUserName ? `${detail.startUserName}(${detail.startUserId})` : ''}`;

  return (
    <>
      <Row style={{ marginBottom: '16px', maxWidth: '900px' }}>
        <Col span={8}>
          <div style={{ color: '#999' }}>
            {intl.get('hzero.common.model.process.name').d('流程名称')}:
          </div>
          <div style={{ fontWeight: '600' }}>{detail.processName}</div>
        </Col>
        <Col span={8}>
          <div style={{ color: '#999' }}>
            {intl.get('hzero.common.model.process.ID').d('流程标识')}:
          </div>
          <div style={{ fontWeight: '600' }}>{detail.id}</div>
        </Col>
        <Col span={8}>
          <div style={{ color: '#999' }}>
            {intl.get('hzero.common.model.apply.owner').d('申请人')}:
          </div>
          <div style={{ fontWeight: '600' }}>
            {name}
            {detail.employeeResign && (
              <Tag
                color="#f50"
                style={{
                  lineHeight: '18px',
                  height: '18px',
                  border: 'none',
                  padding: '0 4px',
                  cursor: 'default',
                  marginLeft: '4px',
                  marginRight: 0,
                }}
              >
                {intl.get('hzero.common.organization.model.position.leave').d('离职')}
              </Tag>
            )}
          </div>
        </Col>
      </Row>
      <Row style={{ maxWidth: '900px' }}>
        <Col span={8}>
          <div style={{ color: '#999' }}>
            {intl.get('hzero.common.model.apply.time').d('申请时间')}:
          </div>
          <div style={{ fontWeight: '600' }}>{dateTimeRender(detail.startTime)}</div>
        </Col>
        <Col span={16}>
          <div style={{ color: '#999' }}>
            {intl.get('hzero.common.model.process.description').d('流程描述')}:
          </div>
          <div style={{ fontWeight: '600' }}>{detail.description}</div>
        </Col>
      </Row>
    </>
  );
};

export default ApproveItem;
