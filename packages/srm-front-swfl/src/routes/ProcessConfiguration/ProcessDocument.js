/**
 * ProcessDocument
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useEffect, useContext, useMemo, useState } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { Tag, Tabs } from 'choerodon-ui';

import intl from 'utils/intl';

import { Context } from './store';
import ProcessVariable from './ProcessVariable';
import ProcessForm from './ProcessForm';
import EmailApproveForm from './EmailApproveForm';
import ApprovalGroup from './ApprovalGroup';

const { TabPane } = Tabs;

export default function ProcessDocument(props = {}) {
  const { currentNode = {} } = props;
  const { documentId, tenantId, documentCode } = currentNode;
  const { documentInfoDs } = useContext(Context);
  const [cuszDocCode, seCuszDocCode] = useState();

  useEffect(() => {
    documentInfoDs.setQueryParameter('documentId', documentId);
    documentInfoDs.query().then((res) => {
      seCuszDocCode(res && res.cuszDocCode);
    });
  }, [currentNode]);

  const disabled = useMemo(() => {
    // 判断是预定义
    return tenantId === 0;
  }, [tenantId]);

  return (
    <div>
      <div className="basic-document-info">
        <div className="basic-document-info-title">
          {intl.get('hwfp.documents.view.title.info').d('流程单据基础信息')}
        </div>
        <Form
          dataSet={documentInfoDs}
          columns={2}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          <Output name="documentCode" />
          <Output name="sourceParentName" />
          <Output name="description" />
          <Output name="model" />
          <Output name="cuszDoc" />
          <Output
            name="source"
            renderer={() => {
              return tenantId === 0 ? (
                <Tag color="gold">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
              ) : (
                <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
              );
            }}
          />
          <Output name="orderSeq" />
          <Output
            name="enabledFlag"
            renderer={({ value }) =>
              value === 1 ? (
                <Tag color="green">{intl.get('hzero.common.status.yes').d('是')}</Tag>
              ) : (
                <Tag color="gold">{intl.get('hzero.common.status.no').d('否')}</Tag>
              )
            }
          />
        </Form>
      </div>
      <div className="basic-document-config">
        <Tabs defaultActiveKey="basic-info">
          <TabPane
            tab={intl.get(`hwfp.common.view.message.title.basicInformation`).d('基本信息')}
            key="basic-info"
          >
            <ProcessVariable
              documentId={documentId}
              disabled={disabled}
              documentCode={currentNode.documentCode}
              modelCode={currentNode.modelCode}
            />
            <ProcessForm
              documentId={documentId}
              disabled={disabled}
              documentCode={documentCode}
              cuszDocCode={cuszDocCode}
            />
            <EmailApproveForm documentId={documentId} disabled={disabled} />
          </TabPane>
          {!disabled && (
            <TabPane
              tab={intl.get('hwfp.documents.table.title.approvalGroup').d('审批组')}
              key="approve-group"
            >
              <ApprovalGroup documentId={documentId} disabled={disabled} />
            </TabPane>
          )}
        </Tabs>
      </div>
    </div>
  );
}
