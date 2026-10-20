/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2024-05-21 14:20:36
 */
import React, { useContext } from 'react';
import {
  TextField,
  DatePicker,
  Select,
  Form,
  Lov,
  NumberField,
  TextArea,
  Attachment,
  Row,
  Col,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { Divider } from 'choerodon-ui';

import { Store } from '../commonDetail/sotreProvider';
import './index.less';

const BaseInfo = function BaseInfo({ baseCode, attachCode }) {
  const { headerDs, projectId, customizeForm, projectReqHeaderId } = useContext(Store);
  return (
    <div style={{ overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="content-padding">
        <h3 className="content-title">
          {intl.get('sprm.purchaseRequest.title.baseinfo').d('基本信息')}
        </h3>
        <Row>
          <Col span={18}>
            {customizeForm(
              {
                code: baseCode || 'SIEC.PROJECT_EDIT.BASE', // 必传，和unitCode一一对应
                dataSet: headerDs,
              },
              <Form
                dataSet={headerDs}
                showLines={6}
                columns={3}
                labelLayout="float"
                useColon={false}
                style={{ height: '100%' }}
              >
                <TextField name="projectNum" disabled />
                <TextField name="projectName" />
                <Lov name="companyId" />
                <Lov name="ouId" />
                <Lov name="purchaseOrgId" />
                <Lov name="departmentId" />
                <Lov name="projectTypeId" />
                <Lov name="currencyCode" />
                <NumberField name="budgetAmount" />
                <Lov name="principalUserId" />
                <Lov name="projectTeamUserList" />
                <DatePicker name="creationDate" disabled />
                <Select name="projectStatus" disabled />
                <TextField name="sourcePlatform" disabled />
                <TextField name="createdByName" disabled />
                <TextField name="sourceDocument" disabled />
                <TextArea name="projectExplanation" resize="vertical" />
              </Form>
            )}
          </Col>
        </Row>
      </div>
      {(projectId || projectReqHeaderId) && <Divider />}
      <div
        className="content-padding"
        style={{ marginTop: projectId || projectReqHeaderId ? 0 : '8px', flexGrow: 1 }}
      >
        <h3 className="content-title">
          {intl.get('sprm.purchaseRequest.title.attachment').d('附件')}
        </h3>
        <div className="project-workspace-attachment">
          <div className="attachment-content">
            {customizeForm(
              {
                code: attachCode || 'SIEC.PROJECT_EDIT.ATTACHMENT', // 必传，和unitCode一一对应
                dataSet: headerDs,
              },
              <Form
                dataSet={headerDs}
                labelLayout="float"
                columns={2}
                useWidthPercent
                useColon={false}
              >
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
