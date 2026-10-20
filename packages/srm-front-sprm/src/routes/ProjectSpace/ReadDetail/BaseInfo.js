/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2024-06-03 17:32:53
 */
import React, { useContext } from 'react';
import { Output, Attachment, Form, Row, Col } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { Divider } from 'choerodon-ui';
import { colorTagRender } from '../commonDetail/util';
import { Store } from '../commonDetail/sotreProvider';
import './index.less';

const BaseInfo = function BaseInfo({ baseCode, attachCode }) {
  const { headerDs, projectId, projectReqHeaderId, customizeForm } = useContext(Store);

  return (
    <div style={{ overflowY: 'auto', height: '100%' }}>
      <div className="content-padding">
        <h3 className="content-title">
          {intl.get('sprm.purchaseRequest.title.baseinfo').d('基本信息')}
        </h3>
        <Row>
          <Col span={18}>
            {customizeForm(
              {
                code: baseCode || 'SIEC.PROJECT_READ.BASE', // 必传，和unitCode一一对应
                dataSet: headerDs,
              },
              <Form
                dataSet={headerDs}
                showLines={6}
                columns={3}
                useColon={false}
                labelLayout="vertical"
                className="c7n-pro-vertical-form-display"
                style={{ height: '100%' }}
              >
                <Output name="projectNum" />
                <Output name="projectName" />
                <Output name="companyId" />
                <Output name="ouId" />
                <Output name="purchaseOrgId" />
                <Output name="departmentId" />
                <Output name="projectTypeId" />
                <Output name="currencyCode" />
                <Output name="budgetAmount" />
                <Output name="principalUserId" />
                <Output name="projectTeamUserList" />
                <Output name="creationDate" />
                <Output name="projectStatus" renderer={colorTagRender} />
                <Output name="sourcePlatform" />
                <Output name="createdByName" />
                <Output name="projectExplanation" />
                <Output name="sourceDocument" disabled />
              </Form>
            )}
          </Col>
        </Row>
      </div>
      {(projectId || projectReqHeaderId) && <Divider style={{ margin: 0 }} />}
      <div className="content-padding">
        <h3 className="content-title">
          {intl.get('sprm.purchaseRequest.title.attachment').d('附件')}
        </h3>
        <div className="project-workspace-attachment">
          <div className="attachment-content">
            {customizeForm(
              {
                code: attachCode || 'SIEC.PROJECT_READ.ATTACHMENT', // 必传，和unitCode一一对应
                dataSet: headerDs,
              },
              <Form columns={2} dataSet={headerDs} labelLayout="float" useWidthPercent>
                <Attachment
                  showHistory
                  labelLayout="float"
                  name="attachmentUuid"
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="sprm"
                />
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseInfo;
