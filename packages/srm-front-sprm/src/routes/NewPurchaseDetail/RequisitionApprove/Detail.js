/*
 * @Descripttion: 采购申请工作台-审批明细
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 17:04:30
 * @LastEditors: yanglin
 * @LastEditTime: 2023-11-22 11:26:43
 */
import React, { useContext, useState } from 'react';

import intl from 'utils/intl';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';

import { Collapse } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
// import { Button } from 'components/Permission';
import { Content, Header } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import { Modal, Spin, Form, TextArea } from 'choerodon-ui/pro';
import { isFunction } from 'lodash';

import OperationNewRecord from '@/routes/components/OperationHistory';
import {
  approvalApprovalList,
  rejectApprovalList,
} from '@/services/purchaseRequisitionApprovalService';
import Anchor from '../components/Anchor';
import BaseInfo from '../components/BaseInfo';
import BillingInfo from '../components/BillingInfo';
import DeliveryInfo from '../components/DeliveryInfo';
import AttachmentInfo from '../components/AttachmentInfo';
import PurchaseOrgInfo from '../components/PurchaseOrgInfo';
import PurchaseLineInfo from '../components/PurchaseLineInfo';

import { Store } from '../stores';
import styles from '../index.less';
import { THROTTLE_TIME } from '@/routes/utils';

const { Panel } = Collapse;

const defaultActiveKey = [
  'baseInfo',
  'purchaseOrgInfo',
  'deliveryInfo',
  'billingInfo',
  'attachmentInfo',
  'editTable',
];
const HeaderButtons = observer(() => {
  const {
    customizeBtnGroup,
    history,
    headerDs,
    listDs,
    prHeaderId,
    handleBackPath,
    handleRenderCuxOperation,
  } = useContext(Store);
  const backCuxHeader = isFunction(handleBackPath) ? handleBackPath({ location }) : {};

  const { current } = headerDs;
  const [appproveLoading, setLoading] = useState(false);

  // 打开操作记录
  const handleActHistory = () => {
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: (
        <OperationNewRecord
          prHeaderId={prHeaderId}
          handleRenderCuxOperation={handleRenderCuxOperation}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  // 审批通过
  const handleApprove = () => {
    const { approvedRemark, approvalPendingStatus, ...other } = current ? current.toData() : {};
    Modal.confirm({
      bodyStyle: { padding: '20px' },
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: (
        <p>
          {intl
            .get(`sprm.purchaseRequisitionApproval.view.message.confirmApprove`)
            .d('是否确认审批通过需求')}
        </p>
      ),
      onOk: () => {
        setLoading(true);
        approvalApprovalList({
          approvalPendingStatus,
          prHeaderList: [
            {
              ...other,
              approvalPendingStatus,
              approvedRemark,
            },
          ],
        })
          .then((result) => {
            const res = getResponse(result);
            if (res && !res.failed) {
              notification.success();
              setLoading(false);
              history.push({
                pathname: `/sprm/purchase-requisition-approval/list`,
              });
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  };

  // 审批拒绝
  const handleReject = () => {
    const { approvedRemark, approvalPendingStatus, ...other } = current ? current.toData() : {};
    if (
      !approvedRemark &&
      !(approvalPendingStatus === 'CANCELLEDING' || approvalPendingStatus === 'CLOSEDING')
    ) {
      notification.error({
        message: intl
          .get('hzero.common.validation.notNull', {
            name: intl
              .get(`sprm.purchaseRequisitionApproval.model.common.approvedRemark`)
              .d('审批意见'),
          })
          .d(`${intl.get(`sprm.purchaseRequisitionApproval.model.common.approvedRemark`)}`),
      });
    } else {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <p>
            {intl
              .get(`sprm.purchaseRequisitionApproval.view.message.confirmReject`)
              .d('是否确认审批拒绝需求')}
          </p>
        ),
        onOk: () => {
          setLoading(true);
          rejectApprovalList({
            approvalPendingStatus,
            prHeaderList: [
              {
                ...other,
                approvalPendingStatus,
                approvedRemark,
              },
            ],
          }).then((res) => {
            if (res && !res.failed) {
              setLoading(false);
              notification.success();
              history.push({
                pathname: `/sprm/purchase-requisition-approval/list`,
              });
            } else if (res && res.failed) {
              setLoading(false);
              notification.error({ message: res.message });
            }
          });
        },
      });
    }
  };

  const headerBtn = () => {
    const headerButtons = [
      // 操作记录
      {
        name: 'operation',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.operationRecords').d('操作记录'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'assignment',
          onClick: handleActHistory,
        },
      },
      {
        name: 'approval',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.approvalAdopt').d('审批通过'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'check',
          onClick: handleApprove,
          wait: THROTTLE_TIME,
          loading:
            headerDs.status !== 'ready' ||
            listDs.status !== 'ready' ||
            appproveLoading ||
            !current?.get('prHeaderId'),
        },
      },
      {
        name: 'reject',
        btnType: 'c7n-pro',
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'close',
          onClick: handleReject,
          wait: THROTTLE_TIME,
          loading:
            headerDs.status !== 'ready' ||
            listDs.status !== 'ready' ||
            appproveLoading ||
            !current?.get('prHeaderId'),
        },
        child: intl.get('hzero.common.button.approvalRefuse').d('审批拒绝'),
      },
    ];

    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.BTNS',
            pro: true,
          },
          <DynamicButtons buttons={headerButtons} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </>
    );
  };

  return (
    <Header
      backPath={
        backCuxHeader?.backCuxPath
          ? backCuxHeader.backCuxPath
          : '/sprm/purchase-requisition-approval/list'
      }
      title={
        backCuxHeader?.backCuxName
          ? backCuxHeader.backCuxName
          : intl.get('sprm.common.title.requisitionApprove').d('采购申请审批')
      }
    >
      {headerBtn()}
    </Header>
  );
});

const Detail = function Detail() {
  const { prSourcePlatform, headerDs, listDs, customizeCollapse } = useContext(Store);

  return (
    <>
      <HeaderButtons />
      <Spin spinning={headerDs.status !== 'ready' || listDs.status !== 'ready'}>
        <Anchor prSourcePlatform={prSourcePlatform} />
        <div className={styles.sprm_fixed_header}>
          <Content
            className={classnames(styles['sprm-new-detail-content'], 'sprm-detail')}
            style={{ overflowY: 'auto' }}
          >
            <Content>
              <h3 id="sprm-workSpace-detail-content-basicInfo" className="content-title">
                {intl.get('sprm.common.title.approveRemark').d('审批意见')}
              </h3>
              <Form dataSet={headerDs} columns={1} labelLayout="horizontal" useColon={false}>
                <TextArea name="approvedRemark" resize="vertical" />
              </Form>
            </Content>
            {customizeCollapse(
              {
                code: 'SPRM.PURCHASE_PLAFORM_QUERY.SECTION',
              },

              <Collapse
                ghost
                expandIconPosition="text-right"
                defaultActiveKey={defaultActiveKey}
                trigger="text-icon"
              >
                <Panel
                  key="baseInfo"
                  id="sprm-workSpace-detail-content-basicInfo"
                  header={intl.get('sprm.common.title.baseInfo').d('申请基础信息')}
                >
                  <BaseInfo code="SPRM.PURCHASE_PLAFORM_QUERY.BASE_HEADER" />
                </Panel>
                {prSourcePlatform !== 'ERP' && (
                  <Panel
                    key="purchaseOrgInfo"
                    id="sprm-workSpace-detail-content-organizationInfo"
                    header={intl.get('sprm.common.title.purchaseOrgInfo').d('采购方及采买组织信息')}
                  >
                    <PurchaseOrgInfo code="SPRM.PURCHASE_PLAFORM_QUERY.PURCHASEORGINFO" />
                  </Panel>
                )}
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    key="deliveryInfo"
                    id="sprm-workSpace-detail-content-deliveryInfo"
                    header={intl.get('sprm.common.title.deliveryInfo').d('收货/收单信息')}
                  >
                    <DeliveryInfo code="SPRM.PURCHASE_PLAFORM_QUERY.DELIVERYINFO" />
                  </Panel>
                )}
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    key="billingInfo"
                    id="sprm-workSpace-detail-content-billingInfo"
                    header={intl.get('sprm.common.title.BillingInfo').d('开票信息')}
                  >
                    <BillingInfo code="SPRM.PURCHASE_PLAFORM_QUERY.BILLINGINFO" />
                  </Panel>
                )}
                <Panel
                  key="editTable"
                  id="sprm-workSpace-detail-content-detailInfo"
                  header={intl.get('sprm.common.title.detailLineInfo').d('申请明细信息')}
                >
                  <PurchaseLineInfo code="SPRM.PURCHASE_PLAFORM_QUERY.PURCHASELINE" />
                </Panel>
                <Panel
                  key="attachmentInfo"
                  id="sprm-workSpace-detail-content-attachmentInfo"
                  header={intl.get('hzero.common.upload.modal.title').d('附件')}
                >
                  <AttachmentInfo
                    code="SPRM.PURCHASE_PLAFORM_QUERY.ATTACHMENT"
                    readOnly
                    showChangeAttach
                    changeReadOnly
                  />
                </Panel>
              </Collapse>
            )}
          </Content>
        </div>
      </Spin>
    </>
  );
};

export default observer(Detail);
