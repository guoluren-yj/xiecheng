/*
 * @Description: 采购方结算单列表——明细筛选器
 * @Date: 2022-01-29 10:26:34
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, useCallback, memo, useRef, useEffect } from 'react';
import { Modal } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { stringify } from 'querystring';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

import { openTab } from 'utils/menuTab';
import DocFlow from '_components/DocFlow';

import styles from '@/routes/common.less';
import { statusTagRender } from '@/routes/Components/StatusTag';
import { formatNumber, dateRangeTransform } from '@/utils/utils';
import MultiTextFilter from '@/routes/Components/MultiTextFilter';
import PrePayWriteOffModal from '../components/PrePayWriteOffModal';
import { Store, detailTableUnitCodes, detailSearchUnitCodes } from '../StoreProvider';
import WriteOffRecordModal from './WriteOffRecordModal';
import MultiPrePayWriteOffModal from './MultiPrePayWriteOffModal';
import LineDetailDrawer from './LineDetailDrawer';
import LineSyncDetail from './LineSyncDetail';

const tenantId = getCurrentOrganizationId();
const noHightLightStatus = ['NEW', 'RETURN', 'INVOICE_EXCEPTION', 'INVOICE_FAILED'];

export default memo(({ type, modalOpen, onRecordInit }) => {
  const {
    dsMap,
    history,
    location,
    handleToDetail,
    customizeTable,
    isOpenClearCashed,
    setIsOpenClearCashed,
  } = useContext(Store);
  const tableDs = dsMap[type];
  const searchBarRef = useRef({});
  useEffect(() => {
    if (onRecordInit) onRecordInit(type);
  }, [onRecordInit, type]);
  const handleFieldChange = useCallback(({ value, name, record }) => {
    if (name === 'dateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  }, []);

  const handleViewLineDetail = useCallback(
    (record, lineType) => {
      Modal.open({
        drawer: true,
        key: Modal.key(),
        destroyOnClose: true,
        closable: true,
        title: intl.get('hzero.common.button.viewDetails').d('查看详情'),
        className: styles['ssta-detailDrawer-modal'],
        children: <LineDetailDrawer record={record} type={lineType} history={history} />,
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [history]
  );

  const handlePrePayWriteOff = useCallback(
    (record) => {
      modalOpen({
        editFlag: false,
        size: 'large',
        title: intl.get('ssta.purchaseSettle.button.prePayWriteOffRecord').d('预付款核销记录'),
        children: <PrePayWriteOffModal source="list" topRecord={record} isModalEdit={false} />,
      });
    },
    [modalOpen]
  );

  const handleWriteOffRecord = useCallback((prepaymentLineId) => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      title: intl.get('ssta.common.view.title.writeOffRecord').d('核销记录'),
      className: styles['ssta-medium-modal'],
      children: <WriteOffRecordModal prepaymentLineId={prepaymentLineId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, []);

  const handleMultiPrePayWriteOff = useCallback(
    (record) => {
      modalOpen({
        size: 'large',
        editFlag: false,
        title: intl
          .get('ssta.purchaseSettle.button.multPrePayWriteOffRecord')
          .d('多维度预付款核销记录'),
        children: <MultiPrePayWriteOffModal source="list" topRecord={record} isModalEdit={false} />,
      });
    },
    [modalOpen]
  );

  // 税额高亮显示
  const rateAmountShiledRenderAndHighLight = ({ record, text }) => {
    const { settleStatus, taxAmountLightFlag, originalTaxAmount, amountPrecision } = record.get([
      'settleStatus',
      'taxAmountLightFlag',
      'originalTaxAmount',
      'amountPrecision',
    ]);

    if (!noHightLightStatus.includes(settleStatus) && taxAmountLightFlag) {
      return (
        <Popover
          content={`${intl.get('ssta.common.view.message.beforeUpdate').d('更改前')}:${formatNumber(
            originalTaxAmount,
            amountPrecision
          )}`}
        >
          <span style={{ color: 'red' }}>{text}</span>
        </Popover>
      );
    } else {
      return text;
    }
  };

  const linkToDetail = (record) => {
    const {
      associateId,
      associateSourcePlatform,
      prepaymentType,
      jumpPoFlag,
      jumpPcFlag,
    } = record.toData();
    if (['PO_LINE', 'ORDER'].includes(prepaymentType)) {
      if (jumpPoFlag === 1) {
        openTab({
          key: `/sodr/send-order/detail/${associateId}`,
          title: intl.get('ssta.common.view.title.mySendOutOrder').d('我发出的订单'),
          search: stringify({
            poSourcePlatform: associateSourcePlatform,
            openFrom: 'settle',
            isBackFlag: 0,
          }),
        });
      } else {
        openTab({
          key: `/sodr/order-workspace/detail/all-orders/${associateId}`,
          title: intl.get('ssta.common.view.title.orderWorkspace').d('订单工作台'),
          search: stringify({
            poSourcePlatform: associateSourcePlatform,
            openFrom: 'settle',
            isBackFlag: 0,
          }),
        });
      }
    } else if (['CONTRACT', 'CONTRACT_STAGE', 'CONTRACT_SUBJECT'].includes(prepaymentType)) {
      if (jumpPcFlag === 1) {
        openTab({
          key: '/spcm/purchase-contract-view/detail',
          title: intl
            .get('spcm.purchaseContractView.view.message.PurchaseContractView')
            .d('我发起的协议'),
          search: stringify({
            pcHeaderId: associateId,
            backVoidPage: 'NO',
          }),
        });
      } else {
        openTab({
          key: `/spcm/contract-workspace/view/${associateId}`,
          title: intl.get('ssta.common.view.title.contractWorkSpace').d('协议工作台'),
          search: stringify({
            backVoidPage: 'NO',
          }),
        });
      }
    }
  };

  // 价格字段高亮显示
  const priceShiledRenderAndHighLight = ({ record, text, name }) => {
    const { orignPrice, settleStatus, priceLightFlag, settleBasePrice } = record.get([
      'orignPrice',
      'settleStatus',
      'priceLightFlag',
      'settleBasePrice',
    ]);
    const fieldName = settleBasePrice === 'NET_PRICE' ? 'netPrice' : 'taxIncludedPrice';

    if (!noHightLightStatus.includes(settleStatus) && name === fieldName && priceLightFlag) {
      return (
        <Popover
          content={`${intl.get('ssta.common.view.message.beforeUpdate').d('更改前')}:${formatNumber(
            orignPrice
          )}`}
        >
          <span style={{ color: 'red' }}>{text}</span>
        </Popover>
      );
    } else {
      return text;
    }
  };

  // 税率高亮显示
  const rateShiledRenderAndHighLight = ({ record, value }) => {
    const { settleStatus, rateLightFlag, settleTaxRate } = record.get([
      'settleStatus',
      'rateLightFlag',
      'settleTaxRate',
    ]);
    if (!noHightLightStatus.includes(settleStatus) && rateLightFlag) {
      return (
        <Popover
          content={`${intl
            .get('ssta.common.view.message.beforeUpdate')
            .d('更改前')}:${settleTaxRate}`}
        >
          <span style={{ color: 'red' }}>{value}</span>
        </Popover>
      );
    } else {
      return value;
    }
  };

  const handleOpenSyncDetail = useCallback(
    (topRecord) => {
      Modal.open({
        drawer: true,
        title: intl.get('ssta.common.message.title.syncStatusDetail').d('同步状态明细'),
        closable: true,
        key: Modal.key(),
        className: styles['ssta-large-modal'],
        children: <LineSyncDetail topListDs={tableDs} topRecord={topRecord} />,
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [tableDs]
  );

  const invoiceColumns = React.useMemo(() => {
    return [
      {
        name: 'settleStatusMeaning',
        width: 125,
        renderer: (rendererProps) => statusTagRender({ ...rendererProps, name: 'settleStatus' }),
      },
      {
        title: intl.get('ssta.common.model.common.settleNumAndLineNum').d('结算单编号-行号'),
        name: 'settleHeaderNum',
        width: 230,
        renderer: ({ record, value }) => {
          return (
            <a onClick={() => handleToDetail(record, 'all')}>
              {value}-{record.get('lineNum')}
            </a>
          );
        },
      },
      {
        width: 125,
        name: 'settleTypeMeaning',
      },
      {
        width: 180,
        name: 'settleNum',
      },
      {
        width: 230,
        name: 'sourceSettleNumAndLineNum',
      },
      {
        name: 'companyName',
        width: 250,
      },
      {
        name: 'supplierCompanyName',
        width: 250,
      },
      {
        name: 'currencyCode',
        width: 125,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        width: 150,
        name: 'uom',
      },
      {
        name: 'quantity',
        width: 120,
      },

      {
        width: 120,
        name: 'netPrice',
        renderer: ({ record, name, text }) => {
          return priceShiledRenderAndHighLight({ record, name, text });
        },
      },
      {
        name: 'unitPriceBatch',
        width: 150,
      },
      {
        width: 100,
        name: 'netAmount',
      },
      {
        width: 120,
        name: 'taxRate',
        renderer: rateShiledRenderAndHighLight,
      },
      {
        width: 120,
        name: 'taxAmount',
        renderer: ({ record, text }) => {
          return rateAmountShiledRenderAndHighLight({ record, text });
        },
      },
      {
        width: 120,
        name: 'taxIncludedPrice',
        renderer: ({ record, name, text }) => {
          return priceShiledRenderAndHighLight({ record, name, text });
        },
      },
      {
        width: 120,
        name: 'taxIncludedAmount',
      },
      {
        width: 150,
        name: 'settleMatchDimensionMeaning',
      },
      {
        width: 150,
        name: 'settleBasePriceMeaning',
      },
      {
        width: 150,
        name: 'settleModeMeaning',
      },
      {
        width: 120,
        name: 'enableQuantity',
      },
      {
        width: 120,
        name: 'orignPrice',
      },
      {
        name: 'enableAmount',
      },
      {
        name: 'invoicePayEnableFlag',
        width: 120,
        renderer: ({ record }) =>
          record.toData().invoicePayEnableFlag === '1'
            ? intl.get('hzero.common.button.yes').d('是')
            : intl.get('hzero.common.button.no').d('否'),
      },
      {
        width: 120,
        name: 'paymentAmount',
      },
      {
        width: 120,
        name: 'applyAmount',
      },
      {
        width: 120,
        name: 'invoicedAmount',
      },
      {
        width: 120,
        name: 'paidAmount',
      },
      {
        width: 150,
        name: 'trxDate',
      },
      {
        width: 200,
        name: 'poAndLineNum',
      },
      {
        width: 200,
        name: 'ecPoSubNum',
      },

      {
        name: 'sourceParentSettleNumAndLineNum',
        width: 150,
      },
      {
        width: 150,
        name: 'asnAndLineNum',
      },
      {
        name: 'orderType',
        width: 150,
      },
      {
        name: 'purOrganizationName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'purchaseAgentName',
        width: 150,
      },
      {
        name: 'trxTypeCodeMeaning',
        width: 150,
      },
      {
        name: 'dataSourceMeaning',
        width: 150,
      },
      {
        name: 'sourcePlatformCodeMeaning',
        width: 150,
      },
      {
        name: 'settleHeaderCreationDate',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 150,
      },
      {
        name: 'campMeaning',
        width: 150,
      },
      {
        name: 'supplierSiteCode',
        width: 150,
      },
      {
        name: 'prePaymentWriteOff',
        title: intl.get(`ssta.purchaseSettle.button.prePaymentWriteOff`).d('预付款核销'),
        width: 150,
        renderer: ({ record }) =>
          record.get('taxIncludedAmount') > 0 && record.get('invoicePayEnableFlag') === '1' ? (
            <a onClick={() => handlePrePayWriteOff(record)}>
              {intl.get('ssta.purchaseSettle.button.prePayWriteOffRecord').d('预付款核销记录')}
            </a>
          ) : null,
      },
      {
        name: 'multiDealTrxNum',
        width: 200,
      },
      {
        name: 'multiDealTrxLineNum',
        width: 200,
      },
      {
        name: 'multiDealPoNum',
        width: 200,
      },
      {
        name: 'multiDealPoLineNum',
        width: 200,
      },
      {
        title: intl.get('hzero.common.button.docFlow').d('单据流'),
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="ssta_settle_line" tablePk={record.get('settleLineId')} />
        ),
      },
      {
        name: 'thirdSkuCode',
        width: 200,
      },
      {
        name: 'thirdSkuName',
        width: 200,
      },
      {
        name: 'orderTypeName',
        width: 200,
      },
      {
        name: 'poCreateName',
        width: 200,
      },
      {
        name: 'unitName',
        width: 200,
      },
      {
        name: 'lineRemark',
        width: 200,
      },
      {
        name: 'syncStatus',
        width: 150,
        renderer: (rendererProps) => {
          const { value, record } = rendererProps;
          const partProps =
            value === 'WITHOUT_SYNC'
              ? {}
              : { icon: 'wysiwyg', onClick: () => handleOpenSyncDetail(record) };
          return statusTagRender({ ...rendererProps, ...partProps });
        },
      },
      {
        name: 'operation',
        title: intl.get('hzero.common.button.operator').d('操作'),
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => handleViewLineDetail(record, 'C')}>
            {intl.get('hzero.common.button.viewDetail').d('查看详情')}
          </a>
        ),
      },
    ];
  }, [handleToDetail, handleViewLineDetail, handlePrePayWriteOff, handleOpenSyncDetail]);

  const paymentColumns = React.useMemo(() => {
    return [
      {
        name: 'settleStatusMeaning',
        width: 120,
        renderer: (rendererProps) => statusTagRender({ ...rendererProps, name: 'settleStatus' }),
      },

      {
        title: intl.get('ssta.common.model.common.settleNumAndLineNum').d('结算单编号-行号'),
        name: 'settleHeaderNum',
        width: 230,
        renderer: ({ record, value }) => {
          return (
            <a onClick={() => handleToDetail(record, 'all')}>
              {value}-{record.get('lineNum')}
            </a>
          );
        },
      },
      {
        width: 150,
        name: 'settleTypeMeaning',
      },
      {
        name: 'settleNum',
        width: 180,
      },
      {
        name: 'sourceSettleNumAndLineNum',
        width: 230,
      },
      {
        name: 'companyName',
        width: 250,
      },
      {
        name: 'supplierCompanyName',
        width: 250,
      },
      {
        name: 'currencyCode',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        width: 150,
        name: 'uom',
      },
      {
        width: 150,
        name: 'sourceSettleHeaderNum',
      },

      {
        width: 120,
        name: 'paymentAmount',
      },
      {
        width: 120,
        name: 'applyAmount',
      },
      {
        width: 120,
        name: 'invoicedAmount',
      },
      {
        width: 120,
        name: 'paidAmount',
      },
      {
        width: 150,
        name: 'settleMatchDimensionMeaning',
      },
      {
        width: 120,
        name: 'settleBasePriceMeaning',
      },
      {
        width: 150,
        name: 'settleModeMeaning',
        // lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        width: 150,
        name: 'trxDate',
      },
      {
        width: 200,
        name: 'poAndLineNum',
      },
      {
        width: 150,
        name: 'ecPoSubNum',
      },

      {
        name: 'sourceParentSettleNumAndLineNum',
        width: 150,
      },
      {
        width: 150,
        name: 'asnAndLineNum',
      },
      {
        name: 'orderType',
        width: 150,
      },
      {
        name: 'purOrganizationName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'purchaseAgentName',
        width: 150,
      },
      {
        name: 'trxTypeCodeMeaning',
        width: 150,
      },
      {
        name: 'dataSourceMeaning',
        width: 150,
      },
      {
        name: 'sourcePlatformCodeMeaning',
        width: 150,
      },
      {
        name: 'settleHeaderCreationDate',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 150,
      },
      {
        name: 'campMeaning',
        width: 150,
      },
      {
        name: 'supplierSiteCode',
        width: 150,
      },
      {
        name: 'prePaymentWriteOff',
        title: intl.get(`ssta.purchaseSettle.button.prePaymentWriteOff`).d('预付款核销'),
        width: 150,
        renderer: ({ record }) =>
          record.get('invoicedAmount') > 0 ? (
            <a onClick={() => handlePrePayWriteOff(record)}>
              {intl.get('ssta.purchaseSettle.button.prePayWriteOffRecord').d('预付款核销记录')}
            </a>
          ) : null,
      },
      {
        title: intl.get('hzero.common.button.docFlow').d('单据流'),
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="ssta_settle_line" tablePk={record.get('settleLineId')} />
        ),
      },
      {
        name: 'operation',
        title: intl.get('hzero.common.button.operator').d('操作'),
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => handleViewLineDetail(record, 'D')}>
            {intl.get('hzero.common.button.viewDetail').d('查看详情')}
          </a>
        ),
      },
      {
        name: 'multiDealTrxNum',
        width: 200,
      },
      {
        name: 'multiDealTrxLineNum',
        width: 200,
      },
      {
        name: 'multiDealPoNum',
        width: 200,
      },
      {
        name: 'multiDealPoLineNum',
        width: 200,
      },
      {
        name: 'lineRemark',
        width: 200,
      },
      {
        name: 'syncStatus',
        width: 150,
        renderer: (rendererProps) => {
          const { value, record } = rendererProps;
          const partProps =
            value === 'WITHOUT_SYNC'
              ? {}
              : { icon: 'wysiwyg', onClick: () => handleOpenSyncDetail(record) };
          return statusTagRender({ ...rendererProps, ...partProps });
        },
      },
    ];
  }, [handleToDetail, handleViewLineDetail, handlePrePayWriteOff, handleOpenSyncDetail]);
  const prepaymentColumns = React.useMemo(() => {
    return [
      {
        name: 'settleStatusMeaning',
        width: 120,
        renderer: (rendererProps) => statusTagRender({ ...rendererProps, name: 'settleStatus' }),
      },

      {
        title: intl.get('ssta.common.model.common.settleNumAndLineNum').d('结算单编号-行号'),
        name: 'settleHeaderNum',
        width: 230,
        renderer: ({ record, value }) => {
          return (
            <a onClick={() => handleToDetail(record, 'NUM')}>
              {value}-{record.get('lineNum')}
            </a>
          );
        },
      },
      {
        width: 150,
        name: 'settleTypeMeaning',
      },

      {
        name: 'companyName',
        width: 250,
      },
      {
        name: 'supplierCompanyName',
        width: 250,
      },
      {
        name: 'currencyCode',
        width: 150,
      },
      {
        width: 150,
        name: 'prepaymentTypeMeaning',
      },
      {
        width: 150,
        name: 'paymentTypeName',
      },

      {
        width: 150,
        name: 'paymentTermName',
      },
      {
        width: 150,
        name: 'expectPaymentDate',
      },
      {
        name: 'associateNum',
        width: 150,
        renderer: ({ record }) => {
          const {
            prepaymentType,
            jumpPoFlag,
            jumpPcFlag,
            associateNum,
            associateLineNum,
          } = record.toData();
          if (!associateNum) {
            return '--';
          }
          if (
            ['ORDER', 'CONTRACT', 'PO_LINE', 'CONTRACT_STAGE', 'CONTRACT_SUBJECT'].includes(
              prepaymentType
            )
          ) {
            if (
              (['ORDER', 'PO_LINE'].includes(prepaymentType) && jumpPoFlag) ||
              (['CONTRACT', 'CONTRACT_STAGE', 'CONTRACT_SUBJECT'].includes(prepaymentType) &&
                jumpPcFlag)
            ) {
              return (
                <a onClick={() => linkToDetail(record)}>
                  {associateNum}
                  {associateLineNum ? `-${associateLineNum}` : ''}
                </a>
              );
            } else {
              return `${associateNum}${associateLineNum ? `-${associateLineNum}` : ''}`;
            }
          } else {
            return `${associateNum}${associateLineNum ? `-${associateLineNum}` : ''}`;
          }
        },
      },
      {
        width: 120,
        name: 'associateAmount',
      },
      {
        width: 120,
        name: 'prepaymentAmount',
      },
      {
        width: 120,
        name: 'prepaymentApplyAmount',
      },
      {
        name: 'settleHeaderCreationDate',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 150,
      },
      {
        name: 'campMeaning',
        width: 150,
      },
      {
        name: 'syncStatus',
        width: 150,
        renderer: (rendererProps) => {
          const { value, record } = rendererProps;
          const partProps =
            value === 'WITHOUT_SYNC'
              ? {}
              : { icon: 'wysiwyg', onClick: () => handleOpenSyncDetail(record) };
          return statusTagRender({ ...rendererProps, ...partProps });
        },
      },
      {
        name: 'operation',
        width: 150,
        title: intl.get('hzero.common.button.action').d('操作'),
        renderer: ({ record }) =>
          record.get('lineNum') ? (
            <a onClick={() => handleWriteOffRecord(record.get('prepaymentLineId'))}>
              {intl.get('ssta.common.view.title.writeOffRecord').d('核销记录')}
            </a>
          ) : null,
      },
      {
        title: intl.get('hzero.common.button.docFlow').d('单据流'),
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) =>
          ['PO_LINE', 'CONTRACT_SUBJECT', 'ORDER', 'CONTRACT', 'CONTRACT_STAGE'].includes(
            record?.get('prepaymentType')
          ) ? (
            <DocFlow tableName="ssta_prepayment_line" tablePk={record.get('prepaymentLineId')} />
          ) : null,
      },
    ];
  }, [handleToDetail, handleWriteOffRecord, handleOpenSyncDetail]);

  const demensionColumns = React.useMemo(() => {
    return [
      {
        name: 'settleStatusMeaning',
        width: 125,
        renderer: (rendererProps) => statusTagRender({ ...rendererProps, name: 'settleStatus' }),
      },
      {
        name: 'settleHeaderNum',
        width: 230,
        renderer: ({ record, value }) => {
          return <a onClick={() => handleToDetail(record, 'all')}>{value}</a>;
        },
      },

      {
        width: 150,
        name: 'settleTypeMeaning',
      },

      {
        name: 'companyName',
        width: 250,
      },
      {
        name: 'supplierCompanyName',
        width: 250,
      },
      {
        name: 'currencyCode',
        width: 150,
      },

      {
        name: 'paymentDimensionMeaning',
        width: 150,
      },

      {
        width: 150,
        name: 'documentNum',
      },

      {
        width: 120,
        name: 'invoicedTaxIncludedAmount',
      },
      {
        name: 'remainingPaymentAmount',
        width: 120,
      },

      {
        width: 120,
        name: 'paymentAmount',
      },
      {
        width: 120,
        name: 'applyAmount',
      },
      {
        name: 'paymentSpliteRuleMeaning',
        width: 150,
      },
      {
        name: 'settleHeaderCreationDate',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 150,
      },
      {
        name: 'campMeaning',
        width: 150,
      },
      {
        name: 'prePaymentWriteOff',
        title: intl.get(`ssta.purchaseSettle.button.prePaymentWriteOff`).d('预付款核销'),
        width: 150,
        renderer: ({ record }) =>
          record.get('invoicedTaxIncludedAmount') > 0 ? (
            <a onClick={() => handleMultiPrePayWriteOff(record)}>
              {intl.get('ssta.purchaseSettle.button.prePayWriteOffRecord').d('预付款核销记录')}
            </a>
          ) : null,
      },
    ];
  }, [handleToDetail, handleMultiPrePayWriteOff]);

  const detailColumnsObj = {
    invoice: invoiceColumns,
    payment: paymentColumns,
    prepayment: prepaymentColumns,
    demension: demensionColumns,
  };

  /**
   * 筛选器查询回调
   */
  const handleQuery = useCallback(
    ({ params }) => {
      tableDs.queryDataSet.loadData([params]);
      const { _back } = location.state || {};
      if (_back && isOpenClearCashed) {
        if (_back !== -1) tableDs.batchUnSelect(tableDs.selected);
        setIsOpenClearCashed(false);
        tableDs.query(tableDs.currentPage);
      } else {
        tableDs.query();
      }
    },
    [location, tableDs, isOpenClearCashed, setIsOpenClearCashed]
  );

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        {
          code: detailTableUnitCodes[type],
        },
        <SearchBarTable
          virtual
          virtualCell
          cacheState
          dataSet={dsMap[type]}
          columns={detailColumnsObj[type]}
          searchCode={detailSearchUnitCodes[type]}
          searchBarRef={(ref) => {
            searchBarRef.current = ref;
          }}
          searchBarConfig={{
            onQuery: handleQuery,
            onFieldChange: handleFieldChange,
            fieldProps: {
              companyId: { lovPara: { tenantId } },
              supplierCompanyId: { lovPara: { tenantId } },
              settleConfigNum: { lovPara: { tenantId } },
              sourceSupplierCompanyId: { lovPara: { tenantId } },
              currencyCode: { lovPara: { tenantId } },
              supplierSiteId: {
                dynamicProps: {
                  // 适配多选和供应商值集编码 SSLM.SUPPLIER_CHOOSE
                  disabled: ({ record }) => {
                    const supplierLovData = record.get('supplierCompanyId');
                    if (supplierLovData?.length) {
                      return supplierLovData.length > 1
                        ? true
                        : !supplierLovData[0]?.extSupplierIds;
                    }
                    return !supplierLovData?.extSupplierIds;
                  },
                  lovPara: ({ record }) => {
                    const supplierLovData = record.get('supplierCompanyId');
                    const { extSupplierIds: supplierId } =
                      (supplierLovData?.length ? supplierLovData[0] : supplierLovData) || {};
                    return {
                      supplierId,
                      tenantId,
                    };
                  },
                },
              },
              creationDate: {
                defaultValue: ({ record }) => dateRangeTransform(record.get('dateRange'), true),
                dynamicProps: {
                  disabled: ({ record }) =>
                    record.get('dateRange') && record.get('dateRange') !== 'ALL TIME',
                },
              },
            },
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="settleNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('ssta.supplySettle.modal.settleNum')
                    .d('请输入结算单编号查询')}
                />
              ),
            },
          }}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );
});
