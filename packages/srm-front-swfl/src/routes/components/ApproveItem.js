import React, { useEffect, useState } from 'react';
import { Col, Row, Tag } from 'hzero-ui';

import intl from 'utils/intl';
import { processStatusRender } from '@/utils/util';

const ApproveItem = (props) => {
  const { detail = {}, processStatus = [] } = props;
  const name = `${detail.startUserName ? `${detail.startUserName}` : ''}`;
  const [processStatusObj, setProcessStatusObj] = useState({});

  useEffect(() => {
    const processStatusArr = {};
    processStatus.forEach((item) => {
      processStatusArr[item.value] = item.meaning;
    });
    setProcessStatusObj(processStatusArr);
  }, [processStatus]);

  return (
    <>
      <Row
        style={{ borderBottom: '1px dashed #dcdcdc', paddingBottom: 4, marginBottom: 20 }}
        type="flex"
        justify="space-between"
        align="bottom"
      >
        <Col md={8}>
          <Row>
            <Col md={6} style={{ color: '#999' }}>
              {intl.get('hwfp.common.model.process.name').d('流程名称')}:
            </Col>
            <Col md={16}>
              <span style={{ marginRight: '0.06rem' }}>{detail.processName}</span>
              {processStatusRender(processStatusObj, detail.deleteReason)}
            </Col>
          </Row>
        </Col>
        <Col md={8}>
          <Row>
            <Col md={6} style={{ color: '#999' }}>
              {intl.get('hwfp.common.model.process.ID').d('流程标识')}:
            </Col>
            <Col md={16}> {detail.id}</Col>
          </Row>
        </Col>
        <Col md={8}>
          <Row>
            <Col md={6} style={{ color: '#999' }}>
              {intl.get('hwfp.common.model.apply.owner').d('申请人')}:
            </Col>
            <Col md={16}>
              {name}
              {detail.employeeResign && (
                <Tag
                  color="#E5E7EC"
                  style={{
                    lineHeight: '18px',
                    height: '18px',
                    border: 'none',
                    padding: '0 4px',
                    cursor: 'default',
                    marginLeft: '4px',
                    marginRight: 0,
                    transform: 'scale(0.84)',
                    color: '#4E5769',
                  }}
                >
                  {intl.get('hpfm.organization.model.position.leave').d('离职')}
                </Tag>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
      <Row
        style={{ borderBottom: '1px dashed #dcdcdc', paddingBottom: 4, marginBottom: 40 }}
        type="flex"
        justify="flex-start"
        align="bottom"
      >
        <Col md={8}>
          <Row>
            <Col md={6} style={{ color: '#999' }}>
              {intl.get('hwfp.common.model.apply.time').d('申请时间')}:
            </Col>
            <Col md={16}> {detail.startTime}</Col>
          </Row>
        </Col>
        <Col md={8}>
          <Row>
            <Col md={6} style={{ color: '#999' }}>
              {intl.get('hwfp.common.model.process.description').d('流程描述')}:
            </Col>
            <Col md={16}> {detail.description}</Col>
          </Row>
        </Col>
        <Col span={8}>
          <Row>
            <Col md={6} style={{ color: '#999' }}>
              {intl.get('hwfp.common.model.process.department').d('部门')}:
            </Col>
            <Col md={16}> {detail.unitName}</Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default ApproveItem;
