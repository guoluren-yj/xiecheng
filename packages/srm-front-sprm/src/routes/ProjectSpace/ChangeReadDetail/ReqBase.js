/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext } from 'react';
import { Output, Form, Row, Col, Table, useDataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Divider } from 'choerodon-ui';
import { SRM_SIEC } from '_utils/config';
import { Store } from '../commonDetail/sotreProvider';
import { colorTagRender } from '../commonDetail/util';
import './../ReadDetail/index.less';

const BaseInfo = function BaseInfo() {
  const { detailReqDs, projectReqHeaderId, organizationId } = useContext(Store);
  const tableDs = useDataSet(
    () => ({
      autoQuery: true,
      selection: false,
      paging: false,
      fields: [
        {
          name: 'processTab',
          label: intl.get('sprm.project.model.common.changeTab').d('变更页签'),
        },
        {
          name: 'changeDetail',
          label: intl.get(`sprm.project.model.common..changeDetail`).d('变更内容'),
        },
      ],
      transport: {
        read: () => {
          if (projectReqHeaderId) {
            return {
              url: `${SRM_SIEC}/v1/${organizationId}/project-req/change-content/${projectReqHeaderId}`,
              method: 'GET',
            };
          }
        },
      },
    }),
    [projectReqHeaderId]
  );

  // useEffect(() => {
  //   tableDs.query();
  // }, [projectReqHeaderId]);

  return (
    <div>
      <div className="content-padding">
        <h3 className="content-title">
          {intl.get('sprm.purchaseRequest.title.baseinfo').d('基本信息')}
        </h3>
        <Row>
          <Col span={18}>
            <Form
              dataSet={detailReqDs}
              showLines={6}
              columns={3}
              useColon={false}
              labelLayout="vertical"
              className="c7n-pro-vertical-form-display"
              style={{ height: '100%' }}
            >
              <Output name="reqNum" />
              <Output name="reqType" />
              <Output name="createdByName" />
              <Output name="creationDate" />
              <Output name="reqStatus" renderer={colorTagRender} />
              <Output name="reqReason" />
            </Form>
          </Col>
        </Row>
      </div>
      <Divider style={{ margin: 0 }} />
      <div className="content-padding">
        <h3 className="content-title">
          {intl.get('sprm.purchaseRequest.title.changeInfo').d('变更信息')}
        </h3>
        <Table
          style={{ maxHeight: 'calc(100vh - 340px)' }}
          dataSet={tableDs}
          border
          columns={[
            {
              name: 'changeDetail',
              renderer: ({ record }) => {
                const key = {
                  TASK: intl.get('sprm.project.model.common.taskNum').d('任务编号'),
                  PURCHASE_ITEM: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
                  SUPPLIER: intl.get(`entity.supplier.supplierCompanyNum`).d('供应商编码'),
                };
                const {
                  processType,
                  processTab,
                  processFieldMeaning,
                  oldValue = '',
                  newValue = '',
                  processTabUniqueDesc,
                  processTypeMeaning,
                } = record.get([
                  'processType',
                  'processTab',
                  'processTabMeaning',
                  'processTypeMeaning',
                  'processFieldMeaning',
                  'oldValue',
                  'newValue',
                  'processTabUniqueDesc',
                ]);
                if (processType === 'UPDATE' && key[processTab]) {
                  return (
                    <p>
                      {`${key[processTab]}【${processTabUniqueDesc}】${intl
                        .get('sprm.project.common.changeDetail', {
                          key: processFieldMeaning,
                          oldValue,
                          newValue,
                        })
                        .d(`【${processFieldMeaning}】由【${oldValue}】改为【${newValue}】`)}`}
                    </p>
                  );
                } else if (key[processTab]) {
                  return (
                    <p>{`${processTypeMeaning}${key[processTab]}【${processTabUniqueDesc}】`}</p>
                  );
                } else if (processType === 'UPDATE') {
                  return <p>{`【${processFieldMeaning}】由【${oldValue}】改为【${newValue}】`}</p>;
                } else {
                  return (
                    <p>
                      {intl
                        .get('sprm.project.common.changeDetail', {
                          key: processFieldMeaning,
                          oldValue,
                          newValue,
                        })
                        .d(`【${processFieldMeaning}】由【${oldValue}】改为【${newValue}】`)}
                    </p>
                  );
                }
              },
            },
          ]}
          groups={[
            {
              name: 'processTab',
              type: 'column',
              columnProps: {
                width: '150px',
                header: ({ title }) => <span>{title}</span>,
                renderer: ({ record }) => <span>{record.get('processTabMeaning')}</span>,
              },
            },
          ]}
        />
      </div>
    </div>
  );
};

export default BaseInfo;
