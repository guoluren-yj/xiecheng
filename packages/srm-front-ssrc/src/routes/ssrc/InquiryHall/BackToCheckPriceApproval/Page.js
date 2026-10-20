import React, { useCallback, useMemo, useContext } from 'react';
import { Spin, useModal, Output } from 'choerodon-ui/pro';
import { Text } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { throttle, noop } from 'lodash';
import { AFBasic, AFExtra } from 'srm-front-boot/lib/components/AFCards';
import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';
import { dateTimeRender } from 'utils/renderer';

import useOperationRecordModal from '@/routes/components/OperationRecord/useModal';
import { HOCPriceComparison as PriceComparison } from '@/routes/ssrc/components/PriceComparison';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import BidPriceComparison from '@/routes/ssrc/components/PriceComparison/BidIndex';

import { StoreContext } from './store/StoreProvider';
import ContentTable from './components/ContentTable';

import styles from './index.less';

const { openModal } = useOperationRecordModal();

const Page = () => {
  const {
    organizationId = '',
    rfxHeaderId = '',
    commonDs: { headerDs, basicDs, itemTableDs },
    customizeForm = noop,
    customizeTable = noop,
    customizeCommon = noop,
    customizeBtnGroup = noop,
    headerInfo = {},
    doubleUnitFlag = false,
    bidFlag = false,
    contentLoading = false,
    getCustomizeUnitCode = noop,
  } = useContext(StoreContext);

  const modal = useModal();

  const handleShowOperationRecordModal = useCallback(
    throttle(() => {
      openModal({
        rfxHeaderId,
      });
    }, 500),
    [rfxHeaderId]
  );

  // 比价助手
  const priceComparisonProps = {
    sourceCategory: headerInfo.sourceCategory,
    diyLadderQuotationFlag: headerInfo.diyLadderQuotationFlag,
    rfxId: rfxHeaderId,
  };

  const renderPriceComparisonModal = () => {
    modal.open({
      destroyOnClose: true,
      closable: true,
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      style: { width: '80%' },
      drawer: true,
      footer: null,
      children: !bidFlag ? (
        <PriceComparison {...priceComparisonProps} />
      ) : (
        <BidPriceComparison {...priceComparisonProps} />
      ),
    });
  };

  // 审批按钮组
  const getApprovalButtons = useMemo(() => {
    return [
      {
        name: 'priceComparisonAssistant',
        child: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
        btnType: 'c7n-pro',
        btnProps: {
          type: 'default',
          icon: 'manage_accounts',
          onClick: renderPriceComparisonModal,
          funcType: 'flat',
        },
      },
      {
        name: 'operationRecord',
        btnType: 'c7n-pro',
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          onClick: handleShowOperationRecordModal,
          funcType: 'flat',
        },
      },
    ];
  }, [rfxHeaderId]);

  const renderApprovalHeaderButton = useCallback(() => {
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
  }, [getApprovalButtons]);

  const SpinProps = {
    spinning: contentLoading,
  };

  const ContentProps = {
    customizeForm,
    customizeTable,
    customizeCommon,
    headerInfo,
    rfxHeaderId,
    organizationId,
    itemTableDs,
    doubleUnitFlag,
    bidFlag,
  };

  const basicConfig = {
    submitNameAndDate: {
      renderValue({ record }) {
        const { processDate } = record ? record.get([
          'processDate',
        ]) : {};
        if (record) {
          return `${record.get('processUserName') || '-'}/${dateTimeRender(processDate) || '-'}`;
        }
      },
    },
  };

  // 基础卡片字段配置
  const afFieldsConfig = {
    rfxTitle: {
      render({ record }) {
        if (record) {
          const { rfxTitle, rfxNum } = record?.get(['rfxTitle', 'rfxNum']);
          return <Text style={{ maxWidth: '350px' }}>{`${rfxTitle}-${rfxNum}`}</Text>;
        }
        return '';
      },
    },
    creationDate: {
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.creationDate.').d('创建时间'),
      useLabel: true,
      render: ({ value }) => {
        const fieldLabel = intl.get('ssrc.inquiryHall.model.inquiryHall.creationDate.').d('创建时间');

        return (
          <>
            {fieldLabel}：{dateTimeRender(value)}
          </>
        );
      },
    },
  };

  const renderBasicRight = useCallback(() => {
    return (
      <div className={styles['basic-box-right']}>
        <Output
          value={
            bidFlag
              ? intl.get(`ssrc.bidHall.model.bidHall.localTotalPrice`).d('本币定标总金额')
              : intl.get(`ssrc.inquiryHall.model.inquiryHall.localTotalPrice`).d('本币核价总金额')
          }
          className={styles['basic-box-right-total-price-label']}
        />
        <div className={styles['basic-box-right-total-price']}>
          <PrecisionInputNumber
            value={headerInfo?.totalPrice}
            financial={headerInfo?.currencyCode}
            type="c7n"
            readOnly
          />
          <div>&nbsp;{headerInfo?.currencyCode}</div>
        </div>
      </div>
    );
  }, [headerInfo, bidFlag]);

  return (
    <div className={styles['ssrc-back-to-check-price-wrapper']}>
      <Spin {...SpinProps}>
        <div className={styles['basic-box']}>
          {customizeCommon(
            {
              code: getCustomizeUnitCode('headerInfo'),
              processUnitTag: 'AF-BASIC',
            },
            <AFBasic
              dataSet={headerDs}
              titleField="rfxTitle"
              tagFields={[
                headerDs?.current?.get('secondarySourceCategoryMeaning')
                  ? 'secondarySourceCategoryMeaning'
                  : 'sourceCategoryMeaning',
                'sourceFromMeaning',
                'sourceMethodMeaning',
              ]}
              fieldsConfig={afFieldsConfig}
              normalFields={['createByName', 'creationDate', 'unitName']}
              contentRemainRender={renderBasicRight}
              contentRemainWidth="25%"
              contentBottomRender={renderApprovalHeaderButton}
            />
          )}
        </div>
        <div className={styles['basic-afextra']}>
          {customizeCommon(
            {
              code: getCustomizeUnitCode('basicInfo'),
              processUnitTag: 'AF-EXTRA',
            },
            <AFExtra
              dataSet={basicDs}
              fieldsConfig={basicConfig}
              fields={['submitNameAndDate', 'checkRollbackRemark']}
            />
          )}
        </div>
        <ContentTable {...ContentProps} />
      </Spin>
    </div>
  );
};

export default observer(Page);
