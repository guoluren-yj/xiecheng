/**
 * index.js
 * 单据转交定义
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useCallback, useState, useEffect } from 'react';
import { routerRedux } from 'dva/router';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import { Timeline, Badge, Tag, Tabs, Icon, Collapse } from 'choerodon-ui';
import PermissionButton from 'components/PermissionButton';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { map } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { queryTransferRecord, tenantAutoDeliverEnable } from '@/services/docTransferService';
import { docListDSConfig, docAgentListDSConfig } from './store/listDS';
import DocForm from './DocForm';
import styles from './index.less';

const { TabPane } = Tabs;
const { Panel } = Collapse;
function DocTransfer(props = {}) {
  const { docListDS, docAgentListDS } = props.valueDs;
  const [autoDeliverEnabled, setAutoDeliverEnabled] = useState(false);

  useEffect(() => {
    getResponse(tenantAutoDeliverEnable()).then((res) => {
      if (res) {
        setAutoDeliverEnabled(true);
      }
    });
  }, []);

  const handleDetailsModal = (record, isAgent) => {
    Modal.open({
      closable: true,
      drawer: true,
      keyboardClosable: true,
      key: Modal.key(),
      style: {
        width: 742,
      },
      title: intl.get('spfm.docTransfer.view.header.list').d('单据转交'),
      children: (
        <DocForm
          dataRecord={record}
          userId={isAgent ? record.get('purchaseAgentId') : record.get('id')}
          isAgent={isAgent}
        />
      ),
      footer: okBtn => okBtn,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const handleRecordModal = async (record, isAgent) => {
    let recordList = [];
    const name = isAgent ? record.get('purchaseAgentName') : record.get('loginName');
    Modal.open({
      closable: true,
      drawer: true,
      keyboardClosable: true,
      key: Modal.key(),
      style: {
        width: 742,
      },
      title: intl
        .get('spfm.docTransfer.view.header.transferUserRecord', {
          loginName: name,
        })
        .d(`用户"${name}"的转交记录`),
      children: (
        <div className={styles['transfer-record-list']}>
          <Timeline>
            {
              ((recordList = getResponse(
                await queryTransferRecord({
                  userId: isAgent ? record.get('purchaseAgentId') : record.get('id'),
                  deliverType: isAgent ? 'AGENT' : 'USER',
                })
              )),
                map(recordList && recordList.reverse(), data => {
                  return (
                    <Timeline.Item color="green">
                      <Collapse
                        defaultActiveKey="1"
                        bordered={false}
                        expandIcon={({ isActive }) => (
                          <Icon
                            style={{ fontSize: '14px', position: 'relative', top: '-1px' }}
                            type={isActive ? 'expand_more' : 'navigate_next'}
                          />
                        )}
                        expandIconPosition="text-right"
                      >
                        <Panel
                          key="1"
                          header={
                            <span>
                              <Icon type="send" style={{ fontSize: '14px', fontWeight: 500 }} />
                              <span style={{ fontWeight: 500, marginLeft: '16px' }}>
                                {data.deliverFromName}({data.deliverFrom})
                              </span>
                              <span style={{ margin: '0 8px', color: 'rgba(0,0,0,0.65)' }}>
                                {intl.get('spfm.docTransfer.view.modal.take').d('将')}
                              </span>
                              <span style={{ fontWeight: 500 }}>{data.docName}</span>
                              <span style={{ margin: '0 8px', color: 'rgba(0,0,0,0.65)' }}>
                                {intl.get('spfm.docTransfer.view.modal.transferTo').d('转交给')}
                              </span>
                              <span style={{ fontWeight: 500 }}>
                                {data.deliverToName}({data.deliverTo})
                              </span>
                            </span>
                          }
                        >
                          <div className={styles['list-item']}>
                            <span className={styles['list-label']}>
                              {intl
                                .get('spfm.docTransfer.view.modal.transferDimension')
                                .d('转交维度')}
                              :
                            </span>
                            <span className={styles['list-value']}>
                              {data.conditionDimensionMeaing}
                            </span>
                          </div>
                          <div className={styles['list-item']}>
                            <span className={styles['list-label']}>
                              {intl.get('spfm.docTransfer.view.modal.documentNumber').d('单据数量')}:
                            </span>
                            <span className={styles['list-value']}>{data.docCount}</span>
                          </div>
                          <div className={styles['list-item']}>
                            <span className={styles['list-label']}>
                              {intl.get('spfm.docTransfer.view.modal.transferResult').d('转交结果')}:
                            </span>
                            <span className={styles['list-value']}>
                              <Tag
                                color={data.deliverStatus === 'SUCCESS' ? 'green' : 'red'}
                                border={false}
                              >
                                {data.deliverStatusMeaning}
                              </Tag>
                            </span>
                          </div>
                          <div style={{ color: 'rgba(0,0,0,0.45)', marginTop: '8px' }}>
                            {data.creationDate}
                          </div>
                        </Panel>
                      </Collapse>
                    </Timeline.Item>
                  );
                }))
            }
          </Timeline>
        </div>
      ),
      footer: okBtn => okBtn,
      okText: intl.get(`hzero.common.button.close`).d('关闭'),
    });
  };

  const subAccountColumns = [
    {
      name: 'loginName',
    },
    {
      name: 'realName',
    },
    {
      name: 'email',
    },
    {
      name: 'phone',
    },
    {
      name: 'enabled',
      width: 120,
      renderer: data => {
        return (
          <Badge
            status={!data.value ? 'error' : 'success'}
            text={
              !data.value
                ? intl.get('hzero.common.status.yes').d('是')
                : intl.get('hzero.common.status.no').d('否')
            }
          />
        );
      },
    },
    {
      name: 'locked',
      width: 120,
      renderer: data => {
        return (
          <Badge
            status={data.value ? 'error' : 'success'}
            text={
              data.value
                ? intl.get('hzero.common.status.yes').d('是')
                : intl.get('hzero.common.status.no').d('否')
            }
          />
        );
      },
    },
    {
      name: 'action',
      width: 180,
      renderer: ({ record }) => (
        <span className="action-link">
          <a onClick={() => handleDetailsModal(record)}>
            {intl.get('spfm.docTransfer.model.view.docDetails').d('单据明细')}
          </a>
          <a onClick={() => goAutoTransfer(record, 'USER')} hidden={!autoDeliverEnabled}>
            {intl.get('spfm.docTransfer.view.autoTransfer').d('自动转交')}
          </a>
          <a onClick={() => handleRecordModal(record)}>
            {intl.get('spfm.docTransfer.view.header.transferRecord').d('转交记录')}
          </a>
        </span>
      ),
    },
  ];

  const agentColumns = [
    { name: 'purchaseAgentCode' },
    { name: 'purchaseAgentName' },
    { name: 'sourceCode' },
    { name: 'externalSystemCode' },
    {
      name: 'enabledFlag',
      width: 120,
      align: 'left',
      renderer: data => {
        return (
          <Badge
            status={data.value ? 'success' : 'error'}
            text={
              data.value
                ? intl.get('hzero.common.status.yes').d('是')
                : intl.get('hzero.common.status.no').d('否')
            }
          />
        );
      },
    },
    {
      header: intl.get('spfm.docTransfer.model.view.action').d('操作'),
      width: 180,
      renderer: ({ record }) => (
        <span className="action-link">
          <a onClick={() => handleDetailsModal(record, true)}>
            {intl.get('spfm.docTransfer.model.view.docDetails').d('单据明细')}
          </a>
          <a onClick={() => goAutoTransfer(record, 'AGENT')} hidden={!autoDeliverEnabled}>
            {intl.get('spfm.docTransfer.view.autoTransfer').d('自动转交')}
          </a>
          <a onClick={() => handleRecordModal(record, true)}>
            {intl.get('spfm.docTransfer.view.header.transferRecord').d('转交记录')}
          </a>
        </span>
      ),
    },
  ];

  const goTransferSummary = useCallback(() => {
    props.dispatch(
      routerRedux.push({
        pathname: '/spfm/doc-transfer/transfer-summary',
      })
    );
  }, []);

  const goAutoTransfer = useCallback((record, deliverType) => {
    const deliverFromId = deliverType === 'USER' ? record.get('id') : record.get('purchaseAgentId');
    props.dispatch(
      routerRedux.push({
        pathname: '/spfm/doc-transfer/auto-transfer',
        search: `?deliverFromId=${deliverFromId}&deliverType=${deliverType}`,
      })
    );
  }, []);

  const handleQuery = ({ params, currentPage }) => {
    const { enabled } = params;
    docListDS.queryDataSet.loadData([
      {
        ...params,
        enabled: enabled === undefined || enabled === null ? enabled : !+enabled,
      },
    ]);
    docListDS.query(currentPage);
  };

  return (
    <React.Fragment>
      <Header title={intl.get('spfm.docTransfer.view.header.title').d('单据转交')}>
        <PermissionButton
          onClick={goTransferSummary}
          type="c7n-pro"
          funcType="flat"
          color="default"
          icon="operation_service_request"
          permissionList={[
            {
              code: `hzero.sys.user-manage.doc-deliver.button.transferSummary`,
              type: 'button',
              meaning: '转交记录汇总',
            },
          ]}
        >
          {intl.get('spfm.docTransfer.common.transferSummary').d('转交记录汇总')}
        </PermissionButton>
      </Header>
      <Content wrapperClassName={styles['content-wrapper']}>
        <Tabs flex style={{ height: '100%' }}>
          <TabPane
            key="subAccount"
            tab={intl.get('spfm.docTransfer.view.title.subAccount').d('子账户')}
          >
            <FilterBarTable
              style={{ height: `calc(100% - 10px)` }}
              dataSet={docListDS}
              columns={subAccountColumns}
              filterBarConfig={{
                onQuery: handleQuery,
              }}
              customizable
              customizedCode="SPFM.DOC_TRANSFER.SUBACCOUNT.TABLE"
            />
          </TabPane>
          <TabPane
            key="purchaser"
            tab={intl.get('spfm.docTransfer.view.title.purchaser').d('采购员')}
          >
            <FilterBarTable
              style={{ height: `calc(100% - 10px)` }}
              dataSet={docAgentListDS}
              columns={agentColumns}
              customizable
              customizedCode="SPFM.DOC_TRANSFER.PURCHASER.TABLE"
            />
          </TabPane>
        </Tabs>
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.docTransfer', 'hzero.common', 'spfm.rulesDefinition'],
})(
  withProps(
    () => {
      const docListDS = new DataSet(docListDSConfig());
      const docAgentListDS = new DataSet(docAgentListDSConfig());
      const valueDs = {
        docListDS,
        docAgentListDS,
      };
      return { valueDs };
    },
    // { cacheState: true }
    { cacheState: false }
  )(DocTransfer)
);
