import React, { useCallback, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { throttle } from 'lodash';
import { Badge, Row, Col } from 'choerodon-ui';
import { Icon, Collapse, Spin } from 'hzero-ui';
import { Attachment, Form, useModal, Modal } from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';
import classnames from 'classnames';
import { Button } from 'components/Permission';
import IMChatDraggable from '_components/IMChatDraggable';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import arrow from '@/assets/connect.svg';
import { getJsonBlob, queryCommonDoubleUomConfig } from '@/routes/components/utils';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import {
  exportErp,
  exportToErp,
  exportToErpAgain,
  print,
  exportToChangeErp,
} from '@/services/sendOrderService';
import { handleRevoke } from '@/services/orderCancel';
import OrderHeaderForm from './OrderHeaderForm';
import DeliveryInformationHeader from './DeliveryInformationHeader';
import BillingInformation from './BillingInformation';
import List from './List';
import AssociatedInvoice from './AssociatedInvoice';
import { Store } from './stores';
import styles from './index.less';
import OperationRecord from './OperationRecord';
import Message from './Message';
import CancelCloseModal from './CancelCloseModal';
import PreviewModal from '@/routes/components/PreviewModal/PreviewModal';
import { getFileList } from '@/services/orderReleaseService';

// 设置sodr国际化前缀 - button
const buttonPrompt = 'sodr.sendOrder.view.button';
// 设置sodr国际化前缀 - message
const titlePrompt = 'sodr.sendOrder.view.title';
// 设置sodr国际化前缀 - common - message
const viewMessagePrompt = 'sodr.confirmOrder.view.message';
// 设置通用国际化前缀
const commonPrompt = 'hzero.common';

const { Panel } = Collapse;
const Detail = function Detail() {
  const {
    listDs,
    associateDs,
    otherDs,
    headerDs,
    backPath,
    isSettleLink,
    isDocFlowLink,
    sourceFromCancel,
    sourceFromPub,
    poSourcePlatform,
    sourceFromModal,
    radioGroupValue,
    customizeBtnGroup,
    poHeaderId,
    organizationId,
    source,
    history,
  } = useContext(Store);
  const { current } = headerDs;
  const {
    statusCode,
    displayPoNum,
    unreadCount,
    displaySyncFlag,
    deliverySyncStatus,
    approvedSyncStatus,
    createSyncFlag,
    filesNumber,
    electricSignFlag,
    electricSignUrl,
  } = current.get([
    'statusCode',
    'displayPoNum',
    'unreadCount',
    'displaySyncFlag',
    'deliverySyncStatus',
    'approvedSyncStatus',
    'createSyncFlag',
    'filesNumber',
    'electricSignFlag',
    'electricSignUrl',
  ]);
  const { changeSyncStatus } = current.toData();
  const [fileList, setFileList] = useState([]);
  const [loadings, setLoadings] = useState({});
  const [doubleUnitEnabled, setDoubleUnitEnabled] = useState(0);
  const [collapseKeys, setCollapseKeys] = useState([
    'orderHeaderInfo',
    'orderLineInfo',
    'deliveryInfo',
    'billingInfo',
  ]);
  const modal = useModal();
  const loading = (state = {}) => setLoadings((pre) => ({ ...pre, ...state }));
  const openCancelCloseModal = useCallback(
    (cancelCloseModalProps) => {
      modal.open({
        title:
          cancelCloseModalProps?.buttonType === 'cancel'
            ? intl.get(`sodr.common.model.common.cancelTitle`).d('取消')
            : intl.get(`hzero.common.button.close`).d('关闭'),
        children: <CancelCloseModal {...cancelCloseModalProps} />,
        style: {
          width: 620,
        },
        closable: true,
      });
    },
    [modal]
  );
  const handleCancel = useCallback(() => {
    openCancelCloseModal({
      buttonType: 'cancel',
      personalizedCoding: 'SODR.ORDER_PROCESS_CONTROL_DETAIL.CANCEL_MODEL',
    });
  }, [openCancelCloseModal]);
  const handleClose = useCallback(() => {
    openCancelCloseModal({
      buttonType: 'close',
    });
  }, [openCancelCloseModal]);

  const comfirmHandleRevoke = () => {
    Modal.confirm({
      title: intl.get('sodr.common.model.common.confirmRevoke').d('是否确认撤销变更'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: throttle(
        () => {
          loading({ revoke: true });
          handleRevoke({ poHeaderId }).then((res) => {
            loading({ revoke: false });
            if (!res?.failed) {
              history.push({
                pathname: backPath,
              });
              return;
            }
            notification.error({ message: res.message });
          });
        },
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  };

  const onCollapseChange = (collapses) => {
    setCollapseKeys(collapses);
  };
  const handleSave = useCallback(async () => {
    const validateList = [otherDs.validate(), associateDs.validate()];
    const validateRes = await Promise.all(validateList);
    if (validateRes.some((i) => !i)) return;
    await headerDs.submit();
  }, [headerDs]);
  const handlePrint = useCallback(() => {
    loading({ handlePrint: true });
    print(poHeaderId)
      .then((res) => {
        if (res && res.type !== 'application/json') {
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow) {
            printWindow.print();
          }
        } else if (res) {
          getJsonBlob(res)
            .then((response) => {
              notification.error({ message: response.message });
            })
            .catch((error) => {
              console.error('Error print:', error);
            });
        }
      })
      .finally(() => {
        loading({ handlePrint: false });
      });
  }, [organizationId, poHeaderId]);
  const openOperationRecord = useCallback(() => {
    modal.open({
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: <OperationRecord poHeaderId={poHeaderId} organizationId={organizationId} />,
      closable: true,
      footer: null,
      style: {
        width: 1200,
        maxHeight: 600,
      },
    });
  }, [modal, poHeaderId, organizationId]);
  const openMessageBoard = useCallback(() => {
    current.set('unreadCount', 0);
    modal.open({
      drawer: true,
      title: intl.get(`${viewMessagePrompt}.message`).d('留言板'),
      children: <Message poHeaderId={poHeaderId} organizationId={organizationId} />,
      style: {
        width: 450,
      },
      bodyStyle: {
        padding: 0,
      },
      okText: intl.get(`sodr.common.model.common.send`).d('发送'),
      cancelText: intl.get(`${commonPrompt}.button.close`).d('关闭'),
    });
  }, [modal, current, poHeaderId, organizationId]);
  const openUploadModal = useCallback(() => {
    modal.open({
      title: intl.get(`entity.attachment.tag`).d('附件'),
      children: (
        <Form columns={2} dataSet={headerDs}>
          <Attachment name="attachmentUuid" />
          <Attachment name="supplierAttachmentUuid" />
        </Form>
      ),
      style: {
        width: 1000,
      },
      closable: true,
      footer: null,
    });
  }, [modal, current, poHeaderId, organizationId]);
  const reImportERP = useCallback(async () => {
    loading({ reImportERP: true });
    const valid = await headerDs.validate();
    if (valid) {
      // 标识优先级 createSyncFlag 、changeSyncStatus、deliverySyncStatus 分别对应【创建重新同步】【变更同步】【交期同步】//  2022/08/27 逻辑梳理
      // 有createSyncFlag 调用sendOrder/exportErp
      // 有变更changeSyncStatus && changeSyncStatus === 'FAIL' 调用sendOrder/exportToChangeErp
      // 有deliverySyncStatus !== 'FAIL' && deliverySyncStatus !== 'SYNCHRONIZING'调用sendOrder/exportToErp，否则调用 exportToErpAgain
      // ps：changeSyncStatus 和 deliverySyncStatus需要对应前后依次调用。
      const deliveryDateCallback = () => {
        const exportData = deliverySyncStatus !== 'FAIL' ? [data] : data;
        return (deliverySyncStatus !== 'FAIL' && deliverySyncStatus !== 'SYNCHRONIZING'
          ? exportToErp(exportData)
          : exportToErpAgain(exportData)
        ).then((result) => {
          const res = getResponse(result);
          if (res) {
            notification.success({
              message: intl.get(`${titlePrompt}.synchronousSuccess`).d('同步成功'),
            });
            headerDs.query();
          }
        });
      };
      const data =
        createSyncFlag || deliverySyncStatus !== 'FAIL'
          ? (() => {
              const header = headerDs.toJSONData()[0];
              const { poLineDetailDTOs, $evaluationDs, ...poHeaderDetailDTO } = header;
              return {
                poHeaderDetailDTO: {
                  ...poHeaderDetailDTO,
                },
                poLineDetailDTOs,
              };
            })()
          : { poHeaderId, versionNum: headerDs.get('versionNum'), _token: headerDs.get('_token') };
      const changeCallback = (callback) => {
        if (changeSyncStatus && changeSyncStatus === 'FAIL') {
          return exportToChangeErp({ poHeaderId }).then((result) => {
            const res = getResponse(result);
            if (res === 'SUCCESS') {
              headerDs.query();
              if (callback) {
                callback();
              } else {
                notification.success({
                  message: intl.get(`hzero.common.notification.success.save`).d('保存成功'),
                });
              }
            }
            loading({ reImportERP: false });
          });
        } else if (callback) {
          callback().finally(() => {
            loading({ reImportERP: false });
          });
        }
      };
      if (createSyncFlag) {
        return exportErp(data).then((result) => {
          const res = getResponse(result);
          if (res) {
            notification.success({
              message: intl.get(`hzero.common.notification.success.save`).d('保存成功'),
            });
            headerDs.query();
            loading({ reImportERP: false });
          }
          changeCallback();
        });
      } else {
        changeCallback(deliveryDateCallback);
      }
    }
  }, [organizationId, headerDs, poHeaderId, createSyncFlag, deliverySyncStatus]);

  useEffect(() => {
    if (electricSignUrl) {
      getFileList([electricSignUrl]).then((v) => {
        if (getResponse(v)) {
          setFileList(v);
        }
      });
    }
  }, [electricSignUrl]);

  useEffect(() => {
    fetchDoubleUom();
    const handleEvent = (e) => {
      if (e.data?.type === 'QUERY_SEND_ORDER') {
        headerDs.query();
      }
    };
    window.addEventListener('message', handleEvent);
    return () => {
      window.removeEventListener('message', handleEvent);
    };
  }, []);

  const fetchDoubleUom = async () => {
    const result = await queryCommonDoubleUomConfig();
    setDoubleUnitEnabled(result);
  };

  useEffect(() => {
    [headerDs, listDs, associateDs, otherDs].map((i) => i.setState({ doubleUnitEnabled }));
  }, [headerDs, listDs, associateDs, otherDs, doubleUnitEnabled]);

  const previewModalProps = {
    fileList,
    btnText: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
    title: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
    btnProps: {
      icon: 'paper-clip',
    },
  };

  const getIMRequestBody = () => ({
    ...current.toData(),
    unreadCount:
      current.toData().unreadCount === null || current.toData().unreadCount === undefined
        ? 0
        : current.toData().unreadCount,
  });

  const fileNumButton = React.memo(({ children, ...btnProps }) => {
    return (
      <Button {...btnProps}>
        {children}
        {filesNumber || undefined}
      </Button>
    );
  });
  const viewOnlyHeader = <Header title={intl.get(`${titlePrompt}.orderDetail`).d('订单明细')} />;
  const headerBtnLoading =
    headerDs.status !== 'ready' ||
    listDs.status !== 'ready' ||
    loadings.reImportERP ||
    loadings.handlePrint ||
    loadings.revoke;
  const cancelButtons = [
    {
      name: 'cancel',
      child: intl.get(`hzero.common.button.cancel`).d('取消'),
      btnProps: {
        icon: 'return',
        type: 'primary',
        onClick: handleCancel,
        disabled: statusCode === 'CANCELED',
        loading: headerBtnLoading,
        hidden: !sourceFromCancel,
      },
    },
    {
      name: 'close',
      btnComp: Button,
      child: intl.get(`hzero.common.button.close`).d('关闭'),
      btnProps: {
        icon: 'close',
        type: 'primary',
        onClick: handleClose,
        loading: headerBtnLoading,
        // disabled: !singleSelectedRows.length && !cancelSelectedRows.length,
        permissionList: [
          {
            code: `srm.po-admin.po.cancel-order.ps.button.close`,
            type: 'button',
            meaning: '订单过程控制关闭按钮',
          },
        ],
        hidden: !sourceFromCancel,
      },
    },
    {
      name: 'revoke',
      btnComp: Button,
      child: intl.get(`sodr.common.model.common.revoke`).d('撤销变更'),
      btnProps: {
        icon: 'close',
        type: 'primary',
        onClick: comfirmHandleRevoke,
        loading: headerBtnLoading,
        // disabled: !singleSelectedRows.length && !cancelSelectedRows.length,
        permissionList: [
          {
            code: `srm.po-admin.po.cancel-order.ps.button.revoke`,
            type: 'button',
            meaning: '订单过程控制撤销变更按钮',
          },
        ],
        hidden: !(sourceFromCancel && statusCode === 'REJECTED' && changeSyncStatus === 'SUCCESS'),
      },
    },
    {
      name: 'reSync',
      btnComp: Button,
      child: intl.get(`${buttonPrompt}.resync`).d('重新同步'),
      btnProps: {
        icon: 'sync',
        onClick: reImportERP,
        hidden: !(
          displaySyncFlag ||
          deliverySyncStatus === 'FAIL' ||
          deliverySyncStatus === 'SYNCHRONIZING'
        ),
        disabled: !(
          approvedSyncStatus === 'SYNCHRONIZING' ||
          approvedSyncStatus === 'FAIL' ||
          deliverySyncStatus === 'FAIL' ||
          deliverySyncStatus === 'SYNCHRONIZING' ||
          changeSyncStatus === 'FAIL' ||
          createSyncFlag === 1
        ),
        loading: headerBtnLoading,
      },
    },
    {
      name: 'openOperationRecord',
      btnComp: Button,
      child: intl.get(`sodr.common.view.button.operationRecord`).d('操作记录'),
      btnProps: {
        icon: 'clock-circle-o',
        onClick: openOperationRecord,
      },
    },
    {
      name: 'outUuid',
      btnComp: fileNumButton,
      child:
        source !== 'maintain'
          ? intl.get('sodr.quotePurchase.view.message.outUuid').d('外部附件')
          : intl.get('entity.attachment.view').d('附件查看'),
      btnProps: {
        icon: 'paper-clip',
        onClick: openUploadModal,
      },
    },
  ];

  const getButtons = () => {
    if (isDocFlowLink || isSettleLink) {
      return (
        <>
          <Button data-name="outUuid" onClick={openUploadModal} icon="attach_file" type="c7n-pro">
            {source !== 'maintain'
              ? intl.get('sodr.quotePurchase.view.message.outUuid').d('外部附件')
              : intl.get('entity.attachment.view').d('附件查看')}{' '}
            {filesNumber || undefined}
          </Button>
          {source !== 'maintain' && (
            <Attachment
              data-name="upload"
              name="purchaserInnerAttachmentUuid"
              dataSet={headerDs}
              viewMode="popup"
              color="default"
              icon="attach_file"
              funcType="raised"
            >
              {intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件')}
            </Attachment>
          )}
          <Button
            data-name="openOperationRecord"
            icon="watch_later-o"
            type="c7n-pro"
            onClick={openOperationRecord}
          >
            {intl.get(`sodr.common.view.button.operationRecord`).d('操作记录')}
          </Button>
          {electricSignFlag === 1 && <PreviewModal {...previewModalProps} />}
        </>
      );
    }
    if (sourceFromCancel) {
      return (
        <>
          {customizeBtnGroup(
            { code: 'SODR.ORDER_PROCESS_CONTROL_DETAIL.BUTTONS', pro: true },
            <DynamicButtons buttons={cancelButtons} />
          )}
          {/* {visible && <Attachment {...attachmentProps} />}
          {source !== 'maintain' && <UploadModal {...uploadModalPropsLoad} />} */}
        </>
      );
    }
    if (!sourceFromCancel) {
      return (
        <>
          {customizeBtnGroup({ code: 'SODR.SEND_ORDER_DETAIL.HEADER_BUTTONS' }, [
            !sourceFromPub && (
              <Button
                wait={THROTTLE_TIME}
                data-name="save"
                icon="save"
                color="primary"
                type="c7n-pro"
                onClick={handleSave}
                loading={headerBtnLoading}
              >
                {intl.get(`hzero.common.button.save`).d('保存')}
              </Button>
            ),
            <Button data-name="outUuid" onClick={openUploadModal} icon="attach_file" type="c7n-pro">
              {source !== 'maintain'
                ? intl.get('sodr.quotePurchase.view.message.outUuid').d('外部附件')
                : intl.get('entity.attachment.view').d('附件查看')}{' '}
              {filesNumber || undefined}
            </Button>,
            source !== 'maintain' && (
              <Attachment
                data-name="upload"
                name="purchaserInnerAttachmentUuid"
                dataSet={headerDs}
                viewMode="popup"
                color="default"
                icon="attach_file"
                funcType="raised"
              >
                {intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件')}
              </Attachment>
            ),
            <Button
              data-name="openOperationRecord"
              icon="watch_later-o"
              type="c7n-pro"
              onClick={openOperationRecord}
            >
              {intl.get(`sodr.common.view.button.operationRecord`).d('操作记录')}
            </Button>,

            <Badge data-name="messageBoard" count={unreadCount || 0} overflowCount={99}>
              <Button icon="message_notification" type="c7n-pro" onClick={openMessageBoard}>
                {intl.get(`${buttonPrompt}.messageBoard`).d('留言板')}
              </Button>
            </Badge>,
            <Button
              wait={THROTTLE_TIME}
              data-name="print"
              style={{ marginRight: 8 }}
              icon="print-o"
              type="c7n-pro"
              onClick={handlePrint}
              loading={headerBtnLoading}
              permissionList={[
                {
                  code: `srm.po-admin.po.sended-order.ps.button.sendorderprint`,
                  type: 'button',
                  meaning: '我发出的订单-订单详情打印',
                },
              ]}
            >
              {intl.get(`${buttonPrompt}.print`).d('打印')}
            </Button>,
            displaySyncFlag ||
            deliverySyncStatus === 'FAIL' ||
            deliverySyncStatus === 'SYNCHRONIZING' ? (
              <Button
                data-name="reSync"
                disabled={
                  !(
                    approvedSyncStatus === 'SYNCHRONIZING' ||
                    approvedSyncStatus === 'FAIL' ||
                    deliverySyncStatus === 'FAIL' ||
                    deliverySyncStatus === 'SYNCHRONIZING' ||
                    changeSyncStatus === 'FAIL' ||
                    createSyncFlag === 1
                  )
                }
                loading={headerBtnLoading}
                icon="sync"
                wait={THROTTLE_TIME}
                type="c7n-pro"
                onClick={reImportERP}
              >
                {intl.get(`${buttonPrompt}.resync`).d('重新同步')}
              </Button>
            ) : null,
          ])}
          {electricSignFlag === 1 && <PreviewModal {...previewModalProps} />}
        </>
      );
    }
  };
  return (
    <>
      {sourceFromModal ? (
        viewOnlyHeader
      ) : (
        <Header
          title={
            [
              'PUBLISHED',
              'PART_FEED_BACK',
              'DELIVERY_DATE_REVIEW',
              'DELIVERY_DATE_REJECT',
            ].includes(statusCode) ? (
              // 已发布、部分反馈、订单反馈审核中、订单反馈审核拒绝的订单发送“订单确认卡片”
              <IMChatDraggable
                showDetail
                cardCode="PO_CONFIRM_DETAIL"
                icon="baseline-drag_indicator"
                tooltip=""
                requestBody={getIMRequestBody}
                dragText={`${intl.get('sodr.sendOrder.view.order').d('订单')}${displayPoNum}`}
              >
                {intl.get(`${titlePrompt}.orderDetail`).d('订单明细')}
              </IMChatDraggable>
            ) : (
              <IMChatDraggable
                showDetail
                cardCode="PO_RECEIVE_DETAIL"
                icon="baseline-drag_indicator"
                tooltip=""
                requestBody={getIMRequestBody}
                dragText={`${intl.get('sodr.sendOrder.view.order').d('订单')}${displayPoNum}`}
              >
                {intl.get(`${titlePrompt}.orderDetail`).d('订单明细')}
              </IMChatDraggable>
            )
          }
          backPath={backPath}
        >
          {getButtons()}
        </Header>
      )}
      <Content className={styles['sodr-send-order-new-detail']}>
        <Spin spinning={false} wrapperClassName={classnames(DETAIL_DEFAULT_CLASSNAME)}>
          <Collapse
            className="form-collapse"
            defaultActiveKey={collapseKeys}
            onChange={onCollapseChange}
          >
            <Panel
              showArrow={false}
              key="orderHeaderInfo"
              header={
                <>
                  <h3>{intl.get(`${titlePrompt}.orderHeaderInfo`).d('订单头信息')}</h3>
                  <a>
                    {collapseKeys.includes('orderHeaderInfo')
                      ? intl.get('hzero.common.button.up').d('收起')
                      : intl.get('hzero.common.button.expand').d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                </>
              }
            >
              <Row>
                <Col span={18}>
                  <OrderHeaderForm />
                </Col>
              </Row>
            </Panel>

            {(poSourcePlatform === 'E-COMMERCE' || poSourcePlatform === 'CATALOGUE') && (
              <Panel
                showArrow={false}
                key="deliveryInfo"
                header={
                  <>
                    <h3>{intl.get(`${titlePrompt}.deliveryInfo`).d('收货/收单信息')}</h3>
                    <a>
                      {collapseKeys.includes('deliveryInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('deliveryInfo') ? 'up' : 'down'} />
                  </>
                }
              >
                <DeliveryInformationHeader />
              </Panel>
            )}
            {poSourcePlatform === 'E-COMMERCE' && (
              <Panel
                showArrow={false}
                key="billingInfo"
                header={
                  <>
                    <h3>{intl.get(`${titlePrompt}.billingInformation`).d('开票信息')}</h3>
                    <a>
                      {collapseKeys.includes('billingInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('billingInfo') ? 'up' : 'down'} />
                  </>
                }
              >
                <BillingInformation />
              </Panel>
            )}
            {/* <Content>
          <div style={{ display: 'flex' }}>
            <div style={{ width: radioGroupValue === 'invoice' ? '41.66%' : '100%' }}>
              <List header={current} />
            </div>
            {radioGroupValue === 'invoice' && (
              <div className="right-table">
                <img src={arrow} alt="" className="arrow" />
                <div>
                  <AssociatedInvoice />
                </div>
              </div>
            )}
          </div>
        </Content> */}
            <Panel
              showArrow={false}
              key="orderLineInfo"
              header={
                <>
                  <h3>{intl.get(`${titlePrompt}.orderLineInfo`).d('订单行信息')}</h3>
                  <a>
                    {collapseKeys.includes('orderLineInfo')
                      ? intl.get('hzero.common.button.up').d('收起')
                      : intl.get('hzero.common.button.expand').d('展开')}
                  </a>
                  <Icon type={collapseKeys.includes('orderLineInfo') ? 'up' : 'down'} />
                </>
              }
            >
              <div style={{ display: 'flex' }}>
                <div style={{ width: radioGroupValue === 'invoice' ? '41.66%' : '100%' }}>
                  <List header={current} />
                </div>
                {radioGroupValue === 'invoice' && (
                  <div className="right-table">
                    <img src={arrow} alt="" className="arrow" />
                    <div>
                      <AssociatedInvoice />
                    </div>
                  </div>
                )}
              </div>
            </Panel>
          </Collapse>
        </Spin>
      </Content>
    </>
  );
};

export default observer(Detail);
