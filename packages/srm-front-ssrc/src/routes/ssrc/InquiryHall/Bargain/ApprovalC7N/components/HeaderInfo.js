import React, { useContext, useMemo, useCallback } from 'react';
import { Text } from 'choerodon-ui';
import { Modal, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { noop, throttle } from 'lodash';

import { AFBasic } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { getQuotationName } from '@/utils/globalVariable';
import OperationRecord from '@/routes/ssrc/components/OperationRecordC7N';
import Iconfont from '@/routes/ssrc/components/Icons'; // 下载至本地的icon
import { HOCPriceComparison as PriceComparison } from '@/routes/ssrc/components/PriceComparison';
import BidPriceComparison from '@/routes/ssrc/components/PriceComparison/BidIndex';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

import { StoreContext } from '../store/StoreProvider';
import styles from '../index.less';

const HeaderInfo = () => {
  const {
    bidFlag = false,
    commonDs: { basicFormDs },
    customizeCommon = noop,
    customizeBtnGroup = noop,
    getCustomizeUnitCode = noop,
  } = useContext(StoreContext);

  // 基础卡片字段配置
  const afFieldsConfig = {
    rfxNumTitle: {
      render({ record }) {
        if (record) {
          const { rfxTitle, rfxNum } = record?.get(['rfxTitle', 'rfxNum']);
          return <Text style={{ maxWidth: '350px' }}>{`${rfxTitle}-${rfxNum}`}</Text>;
        }
        return '';
      },
    },
    quotationRounds: {
      render({ record }) {
        return (
          <Text style={{ maxWidth: '120px' }}>
            {intl
              .get(`ssrc.inquiryHall.view.message.commonQuotationRoundInfo`, {
                round: record?.get('quotationRoundNumber') || 1,
                quotationName: getQuotationName(bidFlag),
              })
              .d('第{round}轮{quotationName}')}
          </Text>
        );
      },
    },
    bargainTimes: {
      render({ value }) {
        return (
          <Text style={{ maxWidth: '120px' }}>
            {intl
              .get(`ssrc.common.theRoundBargainNum`, { bargainTimes: value || 1 })
              .d(`第{bargainTimes}次议价`)}
          </Text>
        );
      },
    },
  };

  // 操作记录
  const handleShowOperationRecordModal = useCallback(
    throttle(() => {
      const { current } = basicFormDs || {};
      const rfxHeaderId = current?.get('rfxHeaderId');

      Modal.open({
        key: 'ssrc-rfx-bargain-operation-record',
        title: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
        children: <OperationRecord rfxHeaderId={rfxHeaderId} />,
        destroyOnClose: true,
        closable: true,
        style: { width: '742px' },
        drawer: true,
        okButton: false,
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
        cancelProps: { color: 'primary' },
      });
    }, 500),
    [basicFormDs?.current]
  );

  // 打开比价助手
  const handleRenderPriceComparisonModal = () => {
    const { current } = basicFormDs || {};
    const { sourceCategory, diyLadderQuotationFlag, rfxHeaderId } = current?.get([
      'sourceCategory',
      'diyLadderQuotationFlag',
      'rfxHeaderId',
    ]);

    const priceComparisonProps = {
      item: {},
      sourceCategory,
      diyLadderQuotationFlag,
      rfxId: rfxHeaderId,
    };

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: 'ssrc-rfx-bargain-approval-price-comparison',
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: !bidFlag ? (
        <PriceComparison {...priceComparisonProps} />
      ) : (
        <BidPriceComparison {...priceComparisonProps} />
      ),
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
  };

  // 按钮组
  const getApprovalButtons = useMemo(() => {
    return [
      {
        name: 'operationRecord',
        btnType: 'c7n-pro',
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          onClick: handleShowOperationRecordModal,
          funcType: 'flat',
          style: { color: '#1d2129' },
        },
      },
      {
        name: 'priceComparisonAssistant',
        btnType: 'c7n-pro',
        child: (
          <>
            <Iconfont type="main-parity-assistant" style={{ marginRight: '8px' }} />
            {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
          </>
        ),
        btnProps: {
          type: 'default',
          funcType: 'flat',
          style: { color: '#1d2129' },
          onClick: handleRenderPriceComparisonModal,
        },
      },
      {
        name: 'viewAttachment',
        btnComp: Attachment,
        btnProps: {
          readOnly: true,
          funcType: 'flat',
          viewMode: 'popup',
          bucketName: PRIVATE_BUCKET,
          tenantId: getCurrentOrganizationId(),
          color: 'default',
          value: basicFormDs?.current?.get('bargainAttachmentUuid'),
          className: styles.viewAttachment,
          ...ChunkUploadProps,
        },
      },
    ];
  }, [basicFormDs?.current]);

  const renderApprovalHeaderButton = () => {
    return (
      <div className="content-bottom-render">
        {customizeBtnGroup(
          {
            code: getCustomizeUnitCode('buttons'),
            pro: true,
            btnType: 'c7n-pro',
          },
          <DynamicButtons buttons={getApprovalButtons} />
        )}
      </div>
    );
  };

  return (
    <React.Fragment>
      {customizeCommon(
        {
          code: getCustomizeUnitCode('headerInfo'),
          processUnitTag: 'AF-BASIC',
        },
        <AFBasic
          dataSet={basicFormDs}
          titleField="rfxNumTitle"
          tagFields={['quotationRounds', 'bargainTimes']}
          normalFields={['createdByName']}
          contentBottomRender={renderApprovalHeaderButton}
          fieldsConfig={afFieldsConfig}
        />
      )}
    </React.Fragment>
  );
};

export default observer(HeaderInfo);
