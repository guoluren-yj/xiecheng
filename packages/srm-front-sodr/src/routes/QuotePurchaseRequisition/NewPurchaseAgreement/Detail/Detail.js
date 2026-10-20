import React, { useCallback, useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Attachment, Modal, Row, Col } from 'choerodon-ui/pro';
import { Collapse, Spin, Icon } from 'hzero-ui';
import { Content, Header } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { isArray } from 'lodash';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import DynamicButtons from '_components/DynamicButtons';
import PurchaseRequestHeader from './PurchaseRequestHeader';
import PurchaseLineInfo from './PurchaseLineInfo';
import { handleBudgetVerification, showLineDsErrors } from '@/routes/components/utils';
import { Store } from './stores';
import styles from './index.less';
import { deleteSheetDelivery } from '@/services/quotePurchaseRequisitionService';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';

const HeaderButtons = observer(() => {
  const { sourcePath, header, headerDs, lineDs, history, customizeBtnGroup } = useContext(Store);
  const isPending = headerDs.status !== 'ready';
  const statusCode = header.get('statusCode');
  const handleSave = useCallback(async () => {
    headerDs.dataToJSON = 'all';
    // 全量校验
    lineDs.dataToJSON = 'all';
    if (await headerDs.validate()) {
      // 增量保存
      lineDs.dataToJSON = 'dirty';
      const warn = await headerDs.setState('submitType', 'save-warn').submit();
      const ras = isArray(warn) ? warn[0] : warn;
      if (ras) {
        if (ras.value) {
          const modalRes = await Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: ras?.message,
            okText: intl.get('hzero.common.button.sure').d('确定'),
            cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          });
          if (modalRes === 'ok') {
            const saveRes = await headerDs.setState('submitType', 'save').submit();
            if (saveRes) {
              // TODO  后端接口可优化为返回带有新 objectVersionNumber 和 poLineDetailDTOs 数据时，可以省略此步骤， ds 会自动回写数据。
              headerDs.query();
              lineDs.query();
              if (saveRes.maintainErrorMsg) {
                Modal.info({ title: saveRes.maintainErrorMsg });
              }
            }
          }
        } else {
          const saveRes = await headerDs.setState('submitType', 'save').submit();
          if (saveRes) {
            headerDs.query();
            lineDs.query();
            if (saveRes.maintainErrorMsg) {
              Modal.info({ title: saveRes.maintainErrorMsg });
            }
          }
        }
      }
    } else {
      showLineDsErrors(lineDs);
    }
  }, [headerDs, lineDs]);

  const handleSubmit = useCallback(async () => {
    headerDs.dataToJSON = 'all';
    lineDs.dataToJSON = 'all';
    const warnRes = await headerDs.setState('submitType', 'submit').submit();
    // ds将返回结果包装为一个array，做兼容处理
    const ras = isArray(warnRes) ? warnRes[0] : warnRes;
    if (ras) {
      if (ras.value) {
        const result = await Modal.confirm({
          title: ras.message,
          className: styles['batch-submit-modal'],
          okText: intl.get('hzero.common.button.sure').d('确定'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        });
        if (result !== 'ok') {
          return;
        }
      }
      const submit = async () => {
        const res = await headerDs.setState('submitType', 'done').submit();
        if (res) {
          if (res.minAmountInfo) {
            notification.warning({
              message: res.minAmountInfo,
            });
          }
          history.push({
            pathname: sourcePath,
          });
        }
      };
      const loading = (_, status) => {
        headerDs.status = status ? 'submitting' : 'ready';
      };
      const budgetVerificationData = headerDs.toJSONData()[0];
      budgetVerificationData.poLineExpVOList = budgetVerificationData.poLineDetailDTOs;
      budgetVerificationData.viewCode = 'PENDING_DETAIL_VIEW';
      delete budgetVerificationData.poLineDetailDTOs;
      await handleBudgetVerification([budgetVerificationData], submit, {
        loading,
        key: 'submitLoading',
      });
    }
  }, [headerDs, lineDs, history, sourcePath]);
  const handleDelete = useCallback(async () => {
    const result = await Modal.confirm(
      intl.get(`sodr.quotePurchaseRequisition.view.message.confirmDestroy`).d('是否确认删除订单')
    );
    if (result === 'ok') {
      headerDs.status = 'submitting';
      headerDs.dataToJSON = 'all-self';
      try {
        const res = getResponse(await deleteSheetDelivery(headerDs.toJSONData()));
        if (res) {
          history.push({
            pathname: sourcePath,
          });
        }
      } finally {
        headerDs.status = 'ready';
      }
    }
  }, [headerDs, history, sourcePath]);

  const headerBtnLoading = headerDs.status !== 'ready' || lineDs.status !== 'ready';

  const headerBtnsRender = [
    {
      name: 'save',
      btnType: 'c7n-pro',
      child: intl.get(`hzero.common.button.save`).d('保存'),
      btnProps: {
        wait: THROTTLE_TIME,
        onClick: handleSave,
        color: 'primary',
        icon: 'save',
        disabled: isPending,
        loading: headerBtnLoading,
      },
    },
    {
      name: 'submit',
      btnType: 'c7n-pro',
      child: intl.get(`hzero.common.button.submit`).d('提交'),
      btnProps: {
        wait: THROTTLE_TIME,
        disabled: isPending,
        icon: 'check',
        onClick: handleSubmit,
        loading: headerBtnLoading,
      },
    },
    {
      name: 'outUuid',
      btnComp: Attachment,
      child: intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件'),
      btnProps: {
        name: 'attachmentUuid',
        dataSet: headerDs,
        disabled: isPending,
        viewMode: 'popup',
        color: 'default',
        icon: 'attach_file',
        funcType: 'raised',
      },
    },
    {
      name: 'innerUuid',
      btnComp: Attachment,
      child: intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件'),
      btnProps: {
        name: 'purchaserInnerAttachmentUuid',
        dataSet: headerDs,
        disabled: isPending,
        viewMode: 'popup',
        color: 'default',
        icon: 'attach_file',
        funcType: 'raised',
      },
    },
    {
      name: 'delete',
      btnType: 'c7n-pro',
      hidden: statusCode === 'REJECTED',
      child: intl.get(`hzero.common.button.delete`).d('删除'),
      btnProps: {
        disabled: isPending,
        onClick: handleDelete,
        icon: 'delete',
        loading: headerBtnLoading,
      },
    },
  ];

  return (
    <Header
      title={intl.get(`sodr.quotePurchase.view.message.purchaseOrderMaintain`).d('订单维护')}
      backPath={sourcePath}
    >
      {customizeBtnGroup(
        { code: 'SODR.ORDER_CREATE_LINE_LIST.AGREEMENT_BTNS', pro: true },
        <DynamicButtons buttons={headerBtnsRender} />
      )}
      {/* <Button onClick={handleSave} color="primary" icon="save" disabled={isPending}>
        {intl.get(`hzero.common.button.save`).d('保存')}
      </Button>
      <Button icon="check" onClick={handleSubmit} disabled={isPending}>
        {intl.get(`hzero.common.button.submit`).d('提交')}
      </Button>
      <Attachment
        name="attachmentUuid"
        dataSet={headerDs}
        disabled={isPending}
        viewMode="popup"
        color="default"
        icon="attach_file"
        funcType="raised"
      >
        {intl.get(`sodr.quotePurchase.view.message.outUuid`).d('外部附件')}
      </Attachment>
      <Attachment
        name="purchaserInnerAttachmentUuid"
        dataSet={headerDs}
        disabled={isPending}
        viewMode="popup"
        color="default"
        icon="attach_file"
        funcType="raised"
      >
        {intl.get(`sodr.quotePurchase.view.message.innerUuid`).d('内部附件')}
      </Attachment>
      {statusCode !== 'REJECTED' && (
        <Button onClick={handleDelete} icon="delete" disabled={isPending}>
          {intl.get(`hzero.common.button.delete`).d('删除')}
        </Button>
      )} */}
    </Header>
  );
});

const Detail = function Detail() {
  const [collapseKeys, setcollapseKeys] = useState(['orderHeaderInfo', 'orderLineInfo']);
  return (
    <>
      <HeaderButtons />
      <div className={styles['sodr-purchase-agreement-new-detail']}>
        <Content>
          <Spin spinning={false} wrapperClassName={DETAIL_DEFAULT_CLASSNAME}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={(e) => setcollapseKeys(e)}
            >
              <Collapse.Panel
                showArrow={false}
                header={
                  <>
                    <h3>
                      {intl.get(`sodr.quotePurchase.view.message.orderHeaderInfo`).d('订单头信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('orderHeaderInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderHeaderInfo') ? 'up' : 'down'} />
                  </>
                }
                key="orderHeaderInfo"
              >
                <Row>
                  <Col span={18}>
                    <PurchaseRequestHeader />
                  </Col>
                </Row>
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                header={
                  <>
                    <h3>
                      {intl
                        .get(`sodr.quotePurchaseRequisition.view.message.orderLineInfo`)
                        .d('订单行信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('orderLineInfo')
                        ? intl.get('hzero.common.button.up').d('收起')
                        : intl.get('hzero.common.button.expand').d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('orderLineInfo') ? 'up' : 'down'} />
                  </>
                }
                key="orderLineInfo"
              >
                <PurchaseLineInfo />
              </Collapse.Panel>
            </Collapse>
          </Spin>
        </Content>
      </div>
    </>
  );
};

export default observer(Detail);
