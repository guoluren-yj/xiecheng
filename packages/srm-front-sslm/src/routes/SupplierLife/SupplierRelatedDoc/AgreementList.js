/**
 * AgreementList - 协议列表
 * @date: 2020-12-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useState } from 'react';
import { Link } from 'dva/router';
import DiffViewer from 'react-diff-viewer';
import { Table, Modal, Tabs, Spin } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import { Button as PermissionButton } from 'components/Permission';
import { dateRender, yesOrNoRender, numberRender, dateTimeRender } from 'utils/renderer';
import { getCurrentUserId, getResponse, getCurrentOrganizationId, isUrl } from 'utils/utils';
import {
  fetchTextComparison,
  queryViewCertificateDeposit,
} from '@/services/supplierRelatedDocService';
import { renderStatus } from '@/routes/components/utils';

const { TabPane } = Tabs;

const AgreementList = props => {
  const {
    style,
    agreementDs,
    agreementStageDs,
    acceptDocumentDs,
    optionRecordDs,
    isPub,
    customizeCode = '',
    searchCode = '',
    customizeTable,
    contractWorkspace = false,
  } = props;
  const [spinning, setSpinning] = useState(false);

  // 协议阶段回调
  const onControlStageModal = record => {
    const { data: { pcHeaderId } = {} } = record;
    agreementStageDs.setQueryParameter('pcHeaderId', pcHeaderId);
    agreementStageDs.query();
    Modal.open({
      key: Modal.key(),
      closable: true,
      style: { width: 800 },
      title: intl.get(`spcm.common.view.message.title.contractStage`).d('协议阶段'),
      children: <Table dataSet={agreementStageDs} columns={agreementStageColumns} />,
      footer: null,
    });
  };

  // 协议验收单据回调
  const onControlAcceptDocModal = record => {
    const { data: { pcHeaderId, acceptType } = {} } = record;
    // none, 无需验收
    // target, 按标的验收
    // stage, 按阶段验收
    if (['target', 'stage'].includes(acceptType)) {
      acceptDocumentDs.setQueryParameter('pcHeaderId', pcHeaderId);
      acceptDocumentDs.setQueryParameter('acceptType', acceptType);
      acceptDocumentDs.query();
    }
    Modal.open({
      key: Modal.key(),
      closable: true,
      style: { width: 800 },
      title: intl.get('spcm.common.view.message.title.acceptListNum').d('验收单据'),
      children: <Table dataSet={acceptDocumentDs} columns={acceptDocumentColumns} />,
      footer: null,
    });
  };

  // 操作记录回调
  const optionRecord = record => {
    const { data: { pcHeaderId } = {} } = record;
    optionRecordDs.setQueryParameter('pcHeaderId', pcHeaderId);
    optionRecordDs.query();
    Modal.open({
      key: Modal.key(),
      closable: true,
      style: { width: 650 },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: <Table dataSet={optionRecordDs} columns={optionRecordColumns} />,
      footer: null,
    });
  };

  // 文本对比
  const onControlTextComparison = async record => {
    const { data: { pcHeaderId } = {} } = record;
    setSpinning(true);
    const firstComparisonList = await fetchTextComparison({ pcHeaderId, version: 'first' }).then(
      response => {
        const res = getResponse(response);
        if (res) {
          return res;
        }
      }
    );
    const lastComparisonList = await fetchTextComparison({ pcHeaderId, version: 'last' }).then(
      response => {
        const res = getResponse(response);
        if (res) {
          return res;
        }
      }
    );
    setSpinning(false);
    if (firstComparisonList && lastComparisonList) {
      Modal.open({
        key: Modal.key(),
        closable: true,
        fullScreen: true,
        title: intl.get('spcm.common.view.title.textComparison').d('文本对比'),
        children: (
          <Tabs animated={false} type="card">
            <TabPane
              key="firstVersion"
              style={{ overflowX: 'auto' }}
              tab={intl.get('spcm.common.view.title.firstVersion').d('初次版本')}
            >
              <DiffViewer
                oldValue={firstComparisonList[0].content}
                newValue={firstComparisonList[1].content}
                showDiffOnly={false}
              />
            </TabPane>
            <TabPane
              key="lastVersion"
              style={{ overflowX: 'auto' }}
              tab={intl.get('spcm.common.view.title.lastVersion').d('上次版本')}
            >
              <DiffViewer
                oldValue={lastComparisonList[0].content}
                newValue={lastComparisonList[1].content}
                showDiffOnly={false}
              />
            </TabPane>
          </Tabs>
        ),
        footer: null,
      });
    }
  };

  // 查看存证
  const handleJumpViewCertificateDeposit = record => {
    const tenantId = getCurrentOrganizationId();
    const { data: { sceneCertificateNo, pcHeaderId } = {} } = record;
    queryViewCertificateDeposit({ pcHeaderId, sceneCertificateNo, tenantId }).then(res => {
      const data = getResponse(res);
      if (isUrl(data)) {
        window.open(res);
      } else {
        notification.warning({
          message: intl.get('spcm.common.view.noQueryViewCertificateDeposit').d('暂未查询到数据！'),
        });
      }
    });
  };

  // 协议Columns
  const agreementColumns = [
    {
      name: 'pcStatusCodeMeaning',
      width: 100,
      renderer: renderStatus,
    },
    {
      name: 'operator',
      width: 200,
      renderer: ({ record }) => {
        const { data: { sceneCertificateNo } = {} } = record;
        return [
          <a onClick={() => optionRecord(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>,
          <PermissionButton
            style={{ padding: '0 8px' }}
            type="text"
            permissionList={[
              {
                code: 'srm.pc-admin.pc-purchaser.view.ps.text.comparison',
                type: 'button',
                meaning: '文本对比',
              },
            ]}
            onClick={() => onControlTextComparison(record)}
          >
            {intl.get('spcm.common.view.title.textComparison').d('文本对比')}
          </PermissionButton>,
          <a
            disabled={!sceneCertificateNo}
            onClick={() => handleJumpViewCertificateDeposit(record)}
          >
            {intl.get('spcm.common.view.title.viewCertificate').d('查看存证')}
          </a>,
        ];
      },
    },
    {
      name: 'version',
      width: 80,
    },
    {
      name: 'pcNum',
      width: 150,
      renderer: ({ value, record }) => {
        const { data: { pcHeaderId } = {} } = record;
        const newRouter = `/spcm/contract-workspace/view/${pcHeaderId}`;
        const oldRouter = `/spcm/purchase-contract-view/detail?pcHeaderId=${pcHeaderId}`;
        // 工作流页面不可点击链接跳转
        return isPub ? value : <Link to={contractWorkspace ? newRouter : oldRouter}>{value}</Link>;
      },
    },
    {
      name: 'pcName',
      width: 200,
    },
    {
      name: 'supplierCompanyName',
      width: 165,
    },
    {
      name: 'pcKindCodeMeaning',
      width: 100,
    },
    {
      name: 'pcTypeName',
      width: 140,
    },
    {
      name: 'companyName',
      width: 150,
    },
    {
      name: 'supplierCompanyNum',
      width: 150,
    },
    {
      name: 'globalFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'contractStage',
      width: 100,
      renderer: ({ record }) => (
        <a onClick={() => onControlStageModal(record)}>
          {intl.get('spcm.common.view.message.title.contractStage').d('协议阶段')}
        </a>
      ),
    },
    {
      name: 'taxIncludeAmount',
      width: 120,
      renderer: ({ value }) => numberRender(value, 2),
    },
    {
      name: 'executedAmount',
      width: 120,
      renderer: ({ value }) => numberRender(value, 2),
    },
    {
      name: 'toExecuteAmount',
      width: 120,
      renderer: ({ value }) => numberRender(value, 2),
    },
    {
      name: 'acceptStatusMeaning',
      width: 120,
    },
    {
      name: 'acceptListNum',
      width: 120,
      renderer: ({ record }) => (
        <a onClick={() => onControlAcceptDocModal(record)}>
          {intl.get('spcm.common.model.common.contractAcceptListNum').d('协议验收单据')}
        </a>
      ),
    },
    {
      name: 'ouName',
      width: 150,
    },
    {
      name: 'purchaseOrgName',
      width: 150,
    },
    {
      name: 'purchaseAgentName',
      width: 100,
    },
    {
      name: 'templateName',
      width: 120,
    },
    {
      name: 'createByRealName',
      width: 140,
    },
    {
      name: 'signDate',
      width: 120,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'startDateActive',
      width: 120,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'endDateActive',
      width: 120,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'remainDate',
      width: 120,
    },
    {
      name: 'creationDate',
      width: 120,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'pcSourceCodeMeaning',
      width: 100,
    },
    {
      name: 'mainPcNum',
      width: 100,
    },
    {
      name: 'archiveCode',
      width: 100,
    },
    {
      name: 'releaseDate',
      width: 170,
    },
    {
      name: 'archiveAttachmentUuid',
      width: 130,
      renderer: ({ record }) => {
        const {
          data: { pcStatusCode, archiveAttachmentUuid, enabledArchiveFlag, createdBy },
        } = record;
        if (pcStatusCode === 'ARCHIVE' || archiveAttachmentUuid) {
          return (
            <UploadModal
              viewOnly={enabledArchiveFlag !== 1 || createdBy !== getCurrentUserId()}
              attachmentUUID={archiveAttachmentUuid}
              icon={false}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="spcm-supplier"
            />
          );
        }
      },
    },
  ];

  // 协议阶段Columns
  const agreementStageColumns = [
    {
      name: 'stageCode',
      width: 165,
    },
    {
      name: 'stageName',
      width: 120,
    },
    {
      name: 'milestoneTime',
      width: 175,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'supplierCurrencyCode',
      width: 120,
    },
    {
      name: 'purchaseCurrencyCode',
      width: 120,
    },
    {
      name: 'exchangeRate',
      width: 160,
    },
    {
      name: 'costQuantity',
      width: 175,
      renderer: ({ value }) => numberRender(value, 2),
    },
    {
      name: 'purchaseCostQuantity',
      width: 150,
      renderer: ({ value }) => numberRender(value, 2),
    },
    {
      name: 'termName',
      width: 150,
    },
    {
      name: 'typeName',
      width: 150,
    },
    {
      name: 'remark',
      width: 175,
    },
    {
      name: 'acceptStatusMeaning',
      width: 100,
    },
    {
      name: 'acceptListNum',
      width: 150,
    },
  ];

  // 验收单据Columns
  const acceptDocumentColumns = [
    {
      name: 'lineNum',
      width: 80,
      renderer: ({ value }) => Number(value),
    },
    {
      name: 'statusCodeMeaning',
      width: 85,
    },
    {
      name: 'acceptListNum',
      width: 150,
    },
    {
      name: 'title',
      width: 150,
    },
    {
      name: 'acceptedQuantity',
      width: 150,
    },
    {
      name: 'acceptorNameList',
      width: 150,
      renderer: ({ value }) => value?.join(','),
    },
    {
      name: 'acceptDate',
      width: 100,
      renderer: ({ value }) => dateRender(value),
    },
  ];

  // 操作记录Columns
  const optionRecordColumns = [
    {
      name: 'processUserName',
      width: 140,
    },
    {
      width: 150,
      name: 'processedDate',
      renderer: ({ value }) => dateTimeRender(value),
    },
    {
      name: 'processTypeMeaning',
      width: 150,
    },
    {
      name: 'processRemark',
    },
  ];

  return (
    <Spin spinning={spinning}>
      {customizeTable(
        {
          code: customizeCode,
        },
        <SearchBarTable
          style={style}
          key={searchCode}
          dataSet={agreementDs}
          columns={agreementColumns}
          searchCode={searchCode}
        />
      )}
    </Spin>
  );
};

export default AgreementList;
