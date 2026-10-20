/* eslint-disable react/jsx-indent */
import React from 'react';
import { Form, DataSet, Button, Table, Modal, Attachment } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';
import { Spin } from 'choerodon-ui';
import queryString from 'querystring';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { compose, isEmpty } from 'lodash';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { openTab, getActiveTabKey, updateTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import Import from 'components/Import';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import { operatorRender } from 'utils/renderer';
import { btnsFormat } from '@/utils/utils';
// import UploadModal from 'components/Upload/index';

import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import { confirmModal } from '@/routes/Components/ConfirmModal';
import { hxDS } from '@/routes/pubDS/hxDS';
// import RectificationAnchor from '../../Components/RectificationAnchor';
import { decimalPointAccuracy } from '@/routes/utils';
import { settleActionFlagger } from '@/utils/amountConfig';
import { FormItem, SettlementSheet, getPermissions } from '@/routes/Components';
import {
  cancelPrepaymentSup,
  submitPrepayment,
  returnPrepaymentSup,
  confirmPrepaymentSup,
  savePreSup,
  addLines,
  getPreHeader,
  prepaymentPrint,
  syncPrintData,
  getBankInfo,
  getDefaultPaymentInfo,
  getPrePaymentDetail,
  // cancelLines,
  // batchSavePrepaymentLine,
} from '@/services/settlePoolServices';

import Styles from '@/routes/common.less';
import FilledInfoModal from './FilledInfoModal';
import AddModal from './AddModal';
import {
  prePaymentHeaderDS as headerDs,
  prePaymentLineDS as lineDs,
  currencyDS as currencyDs,
} from '../../../stores/SupplySettleDS';

const prefix = 'ssta.supplySettle';
const permPrefix = `srm.settle-account.jsd.supply.ps`;
const organizationId = getCurrentOrganizationId();

const unitCodes = [
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_BASIC',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRADINGPARTY',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_INFO',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTIONDETAIL',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_OTHER_INFO',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_CONFIRM',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_RETURN',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_CANCEL',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_OTHER_WORKFLOW',
].join();

const unitCodesHeader = [
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_BASIC',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_INFO',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRADINGPARTY',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_OTHER_INFO',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_OTHER_WORKFLOW',
].join();

const Detail = (props) => {
  const {
    location: { search, pathname, state },
    history,
    customizeForm,
    customizeTable,
    custLoading,
    customizeBtnGroup,
    custConfig,
  } = props;

  const notPub = pathname.split('/')[1] !== 'pub';

  const [select, setSelect] = React.useState([]);

  const { source, settleHeaderId, type = 'ALL' } = queryString.parse(search.substring(1));

  const [proxyDsCreate, setProxyDsCreate] = React.useState({});

  const [settleStatus, setSettleStatus] = React.useState();
  // 按钮loading
  const [allLoading, setAllLoading] = React.useState(true);

  const [prepaymentType, setPrePaymentType] = React.useState();

  const headerDS = React.useMemo(() => new DataSet(headerDs()), []);
  const currencyDS = React.useMemo(() => new DataSet(currencyDs()), []);
  const [createPermsMap, setCreatePermsMap] = React.useState(props.createPermsMap || new Map());

  const [supplierSiteId, setSupplierSiteId] = React.useState(null);

  const lineDS = React.useMemo(
    () =>
      new DataSet({
        ...lineDs(),
        events: {
          select: () => handleSelect(),
          unSelect: () => handleSelect(),
          selectAll: () => handleSelect(),
          unSelectAll: () => handleSelect(),
          update: ({ record, name, value }) => handleUpdateLine({ record, name, value }),
        },
      }),
    []
  );

  const [updateFlag, approveFlag, cancelFlag, readOnlyFlag] = [
    type === 'UPDATE',
    type === 'APPROVE',
    type === 'CANCEL',
    ['ALL', 'NUM'].includes(type) && source !== 'create',
  ];

  const [updateBtn, approveBtn, cancelBtn] = React.useMemo(
    () => settleActionFlagger(headerDS.current, 'supplier', ['UPDATE', 'APPROVE', 'CANCEL']),
    [headerDS.current]
  );

  React.useEffect(() => {
    setProxyDsCreate({ createNow: true });
  }, [custLoading]);

  React.useEffect(() => {
    headerDS.setQueryParameter('customizeUnitCode', unitCodesHeader);
    if (source === 'detail') {
      headerDS.setQueryParameter('settleHeaderId', settleHeaderId);
      lineDS.setQueryParameter('settleHeaderId', settleHeaderId);
      headerDS
        .query()
        .then((res) => {
          if (res) {
            if (res.supplierSiteEnableFlag === 1) {
              headerDS.current.set('supplierSiteId', res.supplierSiteId);
              setSupplierSiteId(res.supplierSiteId);
            }
            lineDS.prepaymentType = res.prepaymentType;
            currencyDS.setQueryParameter('currencyCode', res.currencyCode);
            currencyDS.query();
            setSettleStatus(res.settleStatus);
            setPrePaymentType(res.prepaymentType);
          }
          setAllLoading(false);
        })
        .catch(() => {
          setAllLoading(false);
        });
      lineDS.query();
    }
    if (source === 'create') {
      getDefaultPaymentInfo().then((res) => {
        if (res && headerDS.current) {
          runInAction(() => {
            if (res.paymentTermId) {
              headerDS.current.set('paymentTermId', res.paymentTermId);
              headerDS.current.set('termCode', res.termCode);
              headerDS.current.set('paymentTermName', res.paymentTermName);
            }
            if (res.paymentTypeId) {
              headerDS.current.set('paymentTypeId', res.paymentTypeId);
              headerDS.current.set('paymentTypeCode', res.paymentTypeCode);
              headerDS.current.set('paymentTypeName', res.paymentTypeName);
            }
          });
        }
      });
      setAllLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchPermissions();
  }, []);

  /**
   * 手动查询权限集
   */
  const fetchPermissions = async () => {
    const res = getResponse(
      await getPermissions([
        `${permPrefix}.radio.button.update`,
        `${permPrefix}.radio.button.audit`,
        `${permPrefix}.radio.button.cancel`,
        `${permPrefix}.detail.pay.newimport`,
        `${permPrefix}.detail.pay.newexport`,
      ])
    );
    if (res) {
      setCreatePermsMap(res);
    }
  };

  const linkToDetail = (record) => {
    const { associateId, associateSourcePlatform } = record.toData();
    if (['PO_LINE', 'ORDER'].includes(prepaymentType)) {
      openTab({
        key: `/sodr/received-order/detail/${associateId}`,
        title: intl.get('ssta.common.view.title.myReceivedOrder').d('我收到的订单'),
        search: queryString.stringify({
          poSourcePlatform: associateSourcePlatform,
        }),
      });
    } else if (['CONTRACT', 'CONTRACT_STAGE', 'CONTRACT_SUBJECT'].includes(prepaymentType)) {
      openTab({
        key: '/spcm/supplier-contract-view/detail',
        title: intl.get('ssta.common.view.title.myReceivedContract').d('我收到的协议'),
        search: queryString.stringify({
          pcHeaderId: associateId,
        }),
      });
    }
  };

  const columns = React.useMemo(() => {
    return [
      {
        width: 150,
        name: 'lineNum',
      },
      {
        width: 200,
        name: 'prepaymentAmount',
        editor: updateFlag,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      !['PO_LINE', 'CONTRACT_STAGE', 'CONTRACT_SUBJECT'].includes(prepaymentType) && {
        name: 'associateNumLov',
        editor: false,
        renderer: ({ record }) => {
          const { jumpPoFlag, jumpPcFlag, prepaymentType: advancePaymentType } =
            headerDS.current?.toData() || {};
          if (
            (advancePaymentType === 'ORDER' && jumpPoFlag) ||
            (advancePaymentType === 'CONTRACT' && jumpPcFlag)
          ) {
            return <a onClick={() => linkToDetail(record)}>{record.get('associateNum')}</a>;
          } else {
            return record.get('associateNum');
          }
        },
      },
      ['PO_LINE', 'CONTRACT_STAGE', 'CONTRACT_SUBJECT'].includes(prepaymentType) && {
        width: 200,
        name: 'associateNumAndLineNum',
        renderer: ({ record }) => {
          const { jumpPoFlag, jumpPcFlag, prepaymentType: advancePaymentType } =
            headerDS.current?.get(['jumpPoFlag', 'jumpPcFlag', 'prepaymentType']) || {};
          const jumpFlag =
            (advancePaymentType === 'PO_LINE' && jumpPoFlag) ||
            (['CONTRACT_STAGE', 'CONTRACT_SUBJECT'].includes(advancePaymentType) && jumpPcFlag);
          const text = `${record.get('associateNum')}-${record.get('associateLineNum')}`;
          return jumpFlag ? <a onClick={() => linkToDetail(record)}>{text}</a> : text;
        },
      },
      {
        width: 250,
        name: 'associateAmount',
        align: 'right',
        editor: false,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        width: 250,
        name: 'prepaymentApplyAmount',
        align: 'right',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'itemName',
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'quantity',
        align: 'right',
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'taxIncludedLineAmount',
        align: 'right',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'lineAmount',
        align: 'right',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'categoryName',
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'poCreatedName',
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'poCreationDate',
      },
      settleStatus !== 'NEW' && {
        name: 'operate',
        header: intl.get('hzero.common.button.operating').d('操作记录'),
        align: 'left',
        width: 200,
        renderer: ({ record }) => {
          const actions = [];
          actions.push(
            record.get('lineNum') && {
              ele: (
                <a onClick={() => handleViewDetail(record)}>
                  {intl.get('ssta.common.view.title.writeOffRecord').d('核销记录')}
                </a>
              ),
              key: 'maintain',
              len: 4,
            }
          );
          return operatorRender(actions);
        },
      },
    ];
  }, [search, headerDS.toData()]);

  const hxDs = React.useMemo(
    () =>
      new DataSet(
        hxDS({
          url: `/ssta/v1/${getCurrentOrganizationId()}/pre-payment-lines/write/off/record/`,
          pk: 'prepaymentLineId',
          urlPramas: true,
        })
      ),
    []
  );

  const handleViewDetail = (record) => {
    const { prepaymentLineId } = record.data;
    hxDs.setQueryParameter('prepaymentLineId', prepaymentLineId);

    hxDs.query();

    const hxColumns = [
      {
        name: 'settleTransactionNum', // 结算事务编号
        width: 150,
      },
      {
        name: 'settleNum', // 关联结算单号
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'settleStatusMeaning', // 关联结算单号
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'lineNum', // 关联结算行号
        width: 100,
      },
      {
        name: 'applyAmount', //  核销金额
        width: 120,
        tooltip: 'overflow',
        renderer: ({ value, record: currentRecord }) => {
          return decimalPointAccuracy(value, currentRecord?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
    ];
    Modal.open({
      // mask: false,
      drawer: true,
      key: Modal.key(),
      closable: true,
      title: intl.get('ssta.common.view.title.writeOffRecord').d('核销记录'),
      className: Styles['ssta-medium-modal'],
      children: <Table dataSet={hxDs} columns={hxColumns} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const handleSelect = () => {
    setSelect(lineDS.selected);
  };

  const getSaveSendData = async () => {
    const headerValidateFlag = await headerDS.validate();
    const linesValidateFlag = await lineDS.validate();
    if (headerValidateFlag && linesValidateFlag) {
      const headerData = headerDS.toData()[0] ? headerDS.toData()[0] : {};
      const lineData = lineDS.toData() ? lineDS.toData() : [];
      const { settleHeaderId: settleHeaderId1 } = headerData;
      const sendData = {
        customizeUnitCode: unitCodes,
        settleHeader: { ...headerData },
        prePaymentLineList: lineData.map((item) => ({ ...item, settleHeaderId: settleHeaderId1 })),
      };
      return sendData;
    } else {
      return false;
    }
  };
  /**
   * 预付款打印
   */
  const handlePrint = () => {
    const headerData = headerDS.toData();
    const selectData = [headerData[0]];
    prepaymentPrint({ settleHeaderId }).then((res) => {
      if (res) {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result;
          try {
            const failedInfo = JSON.parse(content);
            notification.error({
              description: failedInfo.message,
            });
          } catch (e) {
            const file = new Blob([res], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
            syncPrintData(selectData).then((res1) => {
              if (getResponse(res1)) {
                headerDS.current.set('objectVersionNumber', res1[0].objectVersionNumber);
              }
            });
          }
        };
        reader.readAsText(res);
      }
    });
  };
  /**
   * 提交
   */
  const handleSubmit = async () => {
    const sendData = await getSaveSendData();
    if (sendData) {
      setAllLoading(true);
      const res = getResponse(await submitPrepayment(sendData));
      if (res) {
        notification.success();
        // history.push('/ssta/supply-settle');
        history.push({
          pathname: '/ssta/supply-settle/list',
          state: { _back: 1 },
        });
      }
      setAllLoading(false);
    } else {
      notification.error({
        description: intl.get('hzero.common.view.message.notPassValidate').d('数据校验不通过'),
      });
    }

    // if (sendData) {
    //   submitPrepayment(sendData)
    //     .then((res) => {
    //       if (res && res.failed) {
    //         notification.error({
    //           message: res.message,
    //         });
    //       } else {
    //         notification.success();
    //         history.push('/ssta/supply-settle');
    //       }
    //     })
    //     .catch((err) => {
    //       notification.error({
    //         message: err.message,
    //       });
    //     });
    // } else {
    //   notification.error({
    //     description: intl.get('hzero.common.view.message.notPassValidate').d('数据校验不通过'),
    //   });
    // }
  };

  const toLastDetailPage = React.useCallback((key) => {
    updateTab({
      key: getActiveTabKey(),
      search: queryString.stringify({
        source: 'detail',
        settleHeaderId,
        type: key,
      }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
    history.push({
      pathname: '/ssta/supply-settle/pre-payment',
      search: queryString.stringify({
        source: 'detail',
        settleHeaderId,
        type: key,
      }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  });

  /**
   * 头行一起保存
   */
  const handleSave = async () => {
    const sendData = await getSaveSendData();
    if (sendData) {
      setAllLoading(true);
      const res = getResponse(await savePreSup(sendData));
      if (res && res.settleHeader) {
        if (source === 'create') {
          history.push({
            pathname: `/ssta/supply-settle/pre-payment`,
            search: queryString.stringify({
              source: 'detail',
              settleHeaderId: res.settleHeader.settleHeaderId,
              type: 'UPDATE',
            }),
          });
          setAllLoading(false);
        } else if (source === 'detail') {
          headerDS.setQueryParameter('settleHeaderId', settleHeaderId);
          lineDS.setQueryParameter('settleHeaderId', settleHeaderId);
          notification.success();
          headerDS.query().then((res1) => {
            if (res1) {
              lineDS.prepaymentType = res1.prepaymentType;
            }
          });
          lineDS.query(undefined, undefined, false);
          setAllLoading(false);
        }
      }
      setAllLoading(false);
    } else {
      notification.error({
        description: intl.get('hzero.common.view.message.notPassValidate').d('数据校验不通过'),
      });
      setAllLoading(false);
    }
  };

  /**
   * 行导出接口
   * @returns
   */
  const requestNewUrl = () => {
    const customizeUnitCode =
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTIONDETAIL,SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTION_DETAIL_SEARCH';
    return `/ssta/v1/${organizationId}/pre-payment-lines/supplier/export/new?customizeUnitCode=${customizeUnitCode}`;
  };

  /**
   * 导出参数
   */
  const getExportParams = () => {
    const { settleNum } = headerDS.current?.toData() || {};
    const prepaymentLineIdList = lineDS.selected.map((item) => item.get('prepaymentLineId'));
    const queryData = lineDS.queryDataSet.current?.toData() || {};
    if (lineDS.selected?.length > 0) {
      return filterNullValueObject({ prepaymentLineIdList, settleNums: [settleNum] });
    } else {
      return filterNullValueObject({ ...queryData, settleNums: [settleNum] });
    }
  };

  const readOnlyButtons = [
    createPermsMap.get(`${permPrefix}.detail.pay.newexport`) && (
      <ExcelExportPro
        buttonText={
          !isEmpty(lineDS.selected)
            ? intl.get('ssta.common.button.newLineTickExport').d('(新)行勾选导出')
            : intl.get('ssta.common.button.newLineExport').d('(新)行导出')
        }
        templateCode="SSTA_SETTLE_HEADER_PREMENT_LINE_SUPPLIER__EXPORT"
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          color: 'primary',
          icon: 'unarchive',
        }}
        requestUrl={requestNewUrl()}
        queryParams={getExportParams}
        method="POST"
        allBody
      />
    ),
  ];

  const buttons = [
    <Button
      icon="playlist_add"
      onClick={() => handleAdd()}
      key="add"
      disabled={
        headerDS.current?.get('supplierSiteEnableFlag') === 1
          ? !(headerDS.current?.get('supplierSiteEnableFlag') && supplierSiteId)
          : false
      }
    >
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
    <Button
      icon="delete"
      key="cancel"
      disabled={select && select.length === 0}
      onClick={() => operateBeforeConfirm('CANCELSETTLELINE')}
    >
      {intl.get('hzero.common.button.delete').d('删除')}
    </Button>,
    createPermsMap.get(`${permPrefix}.detail.pay.newexport`) && (
      <ExcelExportPro
        buttonText={
          !isEmpty(lineDS.selected)
            ? intl.get('ssta.common.button.newLineTickExport').d('(新)行勾选导出')
            : intl.get('ssta.common.button.newLineExport').d('(新)行导出')
        }
        templateCode="SSTA_SETTLE_HEADER_PREMENT_LINE_SUPPLIER__EXPORT"
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          color: 'primary',
          icon: 'unarchive',
        }}
        requestUrl={requestNewUrl()}
        queryParams={getExportParams}
        method="POST"
        allBody
      />
    ),
    createPermsMap.get(`${permPrefix}.detail.pay.newimport`) && (
      <Import
        buttonText={intl.get('ssta.common.button.newBatchUpdate').d('(新)批量编辑')}
        businessObjectTemplateCode="SSTA.PREPAYMENT_LINE_BATCH_UPDATE"
        buttonProps={{
          funcType: 'flat',
          color: 'primary',
          icon: 'archive',
        }}
        prefixPatch="/ssta"
        args={{
          tenantId: organizationId,
          templateCode: 'SSTA.PREPAYMENT_LINE_BATCH_UPDATE',
          settleHeaderId,
        }}
        successCallBack={async () => {
          const res = getResponse(await getPrePaymentDetail(settleHeaderId));
          if (res) {
            headerDS.current.set({
              prepaymentAmount: res.prepaymentAmount,
              objectVersionNumber: res.objectVersionNumber,
              ...Object.fromEntries(
                (res.customizeRefreshFields || []).map((item) => [item, res[item]])
              ),
            });
          }
          lineDS.query();
        }}
      />
    ),
  ];

  const handleCancelLines = () => {
    lineDS
      .delete(select, false)
      .then(async (res) => {
        setSelect([]);
        if (res) {
          if (source === 'create') {
            history.push({
              pathname: `/ssta/purchase-settle/pre-payment`,
              search: queryString.stringify({
                source: 'detail',
                settleHeaderId,
                type: 'UPDATE',
              }),
            });
          } else if (source === 'detail') {
            headerDS.setQueryParameter('settleHeaderId', settleHeaderId);
            lineDS.setQueryParameter('settleHeaderId', settleHeaderId);
            await lineDS.query();
            lineDS.clearCachedSelected();
            const res1 = getResponse(await getPrePaymentDetail(settleHeaderId));
            if (res1) {
              headerDS.current.set({
                prepaymentAmount: res1.prepaymentAmount,
                objectVersionNumber: res1.objectVersionNumber,
                ...Object.fromEntries(
                  (res1.customizeRefreshFields || []).map((item) => [item, res1[item]])
                ),
              });
            }
          }
        }
      })
      .catch((err) => {
        notification.error({
          message: err.message,
        });
      });
  };

  // 自定义行内 新建
  const handleAdd = () => {
    if (prepaymentType === 'SUPPLIER') {
      lineDS.create({}, 0);
    } else {
      Modal.open({
        drawer: true,
        className: Styles['ssta-large-modal'],
        title: intl.get('ssta.prePayment.view.title.add').d('新增'),
        key: Modal.key(),
        children: <AddModal addLine={handleAddLine} headerDs={headerDS} />,
        footer: null,
      });
    }
  };

  const handleAddLine = (data, onClose) => {
    return addLines({
      list: data,
      settleHeaderId,
    })
      .then((res) => {
        if (getResponse(res)) {
          onClose();
          if (source === 'create') {
            history.push({
              pathname: `/ssta/purchase-settle/pre-payment`,
              search: queryString.stringify({
                source: 'detail',
                settleHeaderId,
                type: 'UPDATE',
              }),
            });
          } else if (source === 'detail') {
            headerDS.setQueryParameter('settleHeaderId', settleHeaderId);
            lineDS.setQueryParameter('settleHeaderId', settleHeaderId);
            getResponse(getPreHeader(settleHeaderId, unitCodes)).then((res1) => {
              if (res1) {
                headerDS.current.set({
                  objectVersionNumber: res1.objectVersionNumber,
                  ...Object.fromEntries(
                    (res1.customizeRefreshFields || []).map((item) => [item, res1[item]])
                  ),
                });
              }
            });
            lineDS.query();
          }
        }
      })
      .catch((err) => {
        notification.error({
          message: err.message,
        });
      });
  };

  // /**
  //  * 行保存
  //  */
  // const handleLineSave = () => {
  //   return lineDS.submit();
  // };
  // 在做取消回退相关操作之前先弹框确认
  const operateBeforeConfirm = (actionType) => {
    const settleTypeMeaning = `${headerDS.current.get('settleTypeMeaning')}${intl
      .get('ssta.purchaseSettle.view.message.bill')
      .d('结算单')}`;
    const info = {
      action: actionType,
      bills: `${settleTypeMeaning}${headerDS.current.get('settleNum')}`,
      billType: settleTypeMeaning,
    };
    if (actionType === 'CANCEL') {
      confirmModal(info, handleCancel);
    } else if (actionType === 'CANCELSETTLELINE') {
      confirmModal(
        {
          action: actionType,
          bills: select
            .map((item) => item.get('lineNum'))
            .filter((item) => item)
            .join(','),
          billType: '',
        },
        handleCancelLines
      );
    }
  };

  /**
   * 取消
   */
  const handleCancel = async (filledData) => {
    setAllLoading(true);
    const headerData = type === 'CANCEL' ? filledData : headerDS.current.toData();
    const res = getResponse(
      await cancelPrepaymentSup({
        body: [headerData],
        customizeUnitCode: unitCodes,
      })
    );
    if (res) {
      notification.success();
      // history.push('/ssta/supply-settle');
      history.push({
        pathname: '/ssta/supply-settle/list',
        state: { _back: 1 },
      });
    }
    setAllLoading(false);
    // cancelPrepaymentSup(headerData)
    //   .then((res) => {
    //     if (res && res.failed) {
    //       notification.error({
    //         message: res.message,
    //       });
    //     } else {
    //       notification.success();
    //       history.push('/ssta/supply-settle');
    //     }
    //   })
    //   .catch((err) => {
    //     notification.error({
    //       message: err.message,
    //     });
    //   });
  };

  /**
   * 退回
   */
  const handleReturn = async (headerData) => {
    setAllLoading(true);
    const res = getResponse(
      await returnPrepaymentSup({
        body: [headerData],
        customizeUnitCode: unitCodes,
      })
    );
    if (res) {
      notification.success();
      // history.push('/ssta/supply-settle');
      history.push({
        pathname: '/ssta/supply-settle/list',
        state: { _back: 1 },
      });
    }
    setAllLoading(false);
  };

  /**
   * 确认
   */

  const handleConfirm = async (headerData) => {
    setAllLoading(true);
    const res = getResponse(
      await confirmPrepaymentSup({
        body: [headerData],
        customizeUnitCode: unitCodes,
      })
    );
    if (res) {
      notification.success();
      // history.push('/ssta/supply-settle');
      history.push({
        pathname: '/ssta/supply-settle/list',
        state: { _back: 1 },
      });
    }
    setAllLoading(false);
  };

  const handleFilledInfo = (action, onOk) => {
    Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-small-modal'],
      title: approveFlag
        ? intl.get(`${prefix}.view.title.approveInfo`).d('审核信息')
        : cancelFlag && intl.get(`${prefix}.view.title.cancelInfo`).d('取消信息'),
      children: (
        <FilledInfoModal
          onOk={onOk}
          action={action}
          headerDS={headerDS}
          custConfig={custConfig}
          customizeForm={customizeForm}
        />
      ),
    });
  };
  /**
   * 操作记录
   */
  const handleRecord = () => {
    const recordModal = Modal.open({
      title: intl.get(`${prefix}.view.title.operationHistory`).d('操作记录'),
      // mask: false,
      drawer: true,
      destroyOnClose: true,
      className: Styles['ssta-medium-modal'],
      // style: { width: 800 },
      children: <SettlementSheet settleHeaderId={settleHeaderId} />,
      footer: () => (
        <div className="footerContainer">
          <div className="close">
            <Button onClick={() => recordModal.close()} color="primary">
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </div>
          {/* <div className="flowSheet">
            <Icon type="branch" />
            {intl.get('ssta.costSheet.model.costSheet.flowSheet').d('流程图')}
          </div> */}
        </div>
      ),
    });
  };
  const companyNumLovChange = () => {
    headerDS.current.set('supplierCompanyNumLov', null);
    headerDS.current.set('bankIdLov', null);
  };
  const supplierCompanyNumLovChange = (record) => {
    const params = {
      companyId: headerDS.current.get('companyId'),
      supplierId: record?.supplierId,
      supplierCompanyId: record?.companyId,
    };
    getBankInfo(params).then((res) => {
      if (!res) return;
      if (!res.bankId && !res.associationAccountId) {
        headerDS.current.set('bankIdLov', null);
      } else {
        const bankInfoLov = {
          bankId: res.bankId,
          bankName: res.bankName,
          bankBranchName: res.bankBranchName,
          bankAccountNum: res.bankAccountNum,
          bankAccountName: res.bankAccountName,
          associationAccountId: res.associationAccountId,
          associationSystem: res.associationSystem,
          bankFirm: res.bankFirm,
        };
        headerDS.current.set('bankIdLov', bankInfoLov);
      }
    });
  };

  const handleUpdateLine = ({ record, name, value }) => {
    const amountPer = currencyDS.current && currencyDS.current.get('amount');
    if (name === 'prepaymentAmount') {
      record.set('prepaymentAmount', math.toFixed(value, Number(amountPer)));
    }
    // const pricePer = currencyDS.current.get('price');
  };

  const editFlag = !updateFlag && source === 'detail';

  const titleObj = {
    ALL: intl.get(`${prefix}.view.title.settleView`).d('结算单查看'),
    UPDATE: intl.get(`${prefix}.view.title.settleUpdate`).d('结算单维护'),
    APPROVE: intl.get(`${prefix}.view.title.settleApprove`).d('结算单审核'),
    CANCEL: intl.get(`${prefix}.view.title.settleCancel`).d('结算单取消'),
    NUM: intl.get(`${prefix}.view.title.settleDetail`).d('结算单详情'),
    CREATE: intl.get(`${prefix}.view.title.settleCreate`).d('结算单创建'),
  };

  const supplierSiteChange = (record) => {
    const supplierSiteEnableFlag = headerDS.current.get('supplierSiteEnableFlag');
    if (supplierSiteEnableFlag === 1) {
      setSupplierSiteId(record?.supplierSiteId);
      headerDS.current.set('supplierSiteId', record?.supplierSiteId);
    }
  };

  const detailTabPaneRender = () => {
    const { supplierSiteEnableFlag } = headerDS.current?.toData() || {};
    return (
      <Spin spinning={allLoading}>
        <Content>
          <h3 className="ssta-form-title" id="header">
            {intl.get(`${prefix}.view.title.basicInfo`).d('基本信息')}
          </h3>

          {customizeForm(
            {
              code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_BASIC',
              readOnly: readOnlyFlag,
            },
            <Form
              dataSet={headerDS}
              columns={3}
              useColon={false}
              labelLayout={updateFlag || source === 'create' ? 'float' : 'vertical'}
            >
              <FormItem
                name="settleNum"
                editor="textfield"
                editable={updateFlag || source === 'create'}
                disabled
              />
              <FormItem
                name="settleStatus"
                editor="select"
                disabled
                editable={updateFlag || source === 'create'}
              />
              <FormItem
                name="campMeaning"
                disabled
                editor="textfield"
                editable={updateFlag || source === 'create'}
              />
              <FormItem
                name="creationDate"
                disabled
                editor="datepicker"
                editable={updateFlag || source === 'create'}
              />
              <FormItem
                name="createdUserName"
                disabled
                editor="textfield"
                editable={updateFlag || source === 'create'}
              />
              <FormItem
                name="settleTypeMeaning"
                disabled
                editable={updateFlag || source === 'create'}
              />
            </Form>
          )}
        </Content>

        <Content>
          <h3 className="ssta-form-title" id="header">
            {intl.get(`${prefix}.view.title.transactionParty`).d('交易方信息')}
          </h3>
          {customizeForm(
            {
              code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRADINGPARTY',
              readOnly: readOnlyFlag,
            },
            <Form
              dataSet={headerDS}
              columns={3}
              useColon={false}
              labelLayout={updateFlag || source === 'create' ? 'float' : 'vertical'}
            >
              <FormItem name="companyNum" disabled={updateFlag || source === 'create'} />
              <FormItem
                name="companyNumLov"
                editor="lov"
                editable={updateFlag || source === 'create'}
                onChange={companyNumLovChange}
                disabled={updateFlag}
              />
              <FormItem
                editor="lov"
                editable={updateFlag || source === 'create'}
                name="currencyCodeLov"
                disabled={updateFlag}
              />

              <FormItem
                name="supplierCompanyNum"
                disabled={updateFlag || source === 'create'}
                renderer={({ record }) =>
                  source === 'create'
                    ? record?.get('supplierCompanyNumLov')?.displaySupplierNum
                    : record?.get('supplierCompanyNum')
                }
              />

              <FormItem
                editor="lov"
                editable={updateFlag || source === 'create'}
                onChange={supplierCompanyNumLovChange}
                disabled={updateFlag}
                name="supplierCompanyNumLov"
                renderer={({ record, value }) =>
                  source === 'create' ? value?.displayValue : record?.get('supplierCompanyName')
                }
              />
              <FormItem
                editor="lov"
                editable={type === 'UPDATE' || source === 'create'}
                disabled={type === 'UPDATE'}
                name="ouIdLov"
              />
              {supplierSiteEnableFlag === 1 && (
                <FormItem
                  name="supplierSiteLov"
                  editor="lov"
                  disabled={!updateFlag}
                  editable={updateFlag}
                  onChange={supplierSiteChange}
                />
              )}
              <FormItem name="unitName" disabled={updateFlag || source === 'create'} />
            </Form>
          )}
        </Content>

        <Content>
          <h3 className="ssta-form-title" id="header">
            {intl.get(`${prefix}.view.title.collectionInfo`).d('收款信息')}
          </h3>
          {customizeForm(
            {
              code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_INFO',
              readOnly: readOnlyFlag,
              proxyDsCreate,
            },
            <Form
              dataSet={headerDS}
              columns={3}
              useColon={false}
              labelLayout={updateFlag || source === 'create' ? 'float' : 'vertical'}
            >
              <FormItem
                name="prepaymentType"
                editor="select"
                editable={updateFlag || source === 'create'}
                disabled={updateFlag}
              />
              <FormItem
                name="prepaymentAmount"
                disabled={updateFlag || source === 'create'}
                editor="numberfield"
              />
              <FormItem
                name="bankIdLov"
                editor="lov"
                editable={updateFlag || source === 'create'}
              />
              <FormItem name="bankBranchName" disabled={updateFlag || source === 'create'} />
              <FormItem name="bankAccountNum" disabled={updateFlag || source === 'create'} />
              <FormItem name="bankAccountName" disabled={updateFlag || source === 'create'} />
              <FormItem
                name="paymentMethodLov"
                editor="lov"
                editable={updateFlag || source === 'create'}
              />
              <FormItem
                name="paymentCondition"
                editor="lov"
                editable={updateFlag || source === 'create'}
              />
              <FormItem
                name="expectPaymentDate"
                editor="datepicker"
                editable={updateFlag || source === 'create'}
              />
            </Form>
          )}
        </Content>

        {source === 'detail' && (
          <Content>
            <h3 className="ssta-form-title" id="header">
              {intl.get(`${prefix}.view.title.transactionAmount`).d('交易金额信息')}
            </h3>
            {customizeTable(
              {
                code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTIONDETAIL',
                readOnly: editFlag,
              },
              <SearchBarTable
                searchCode="SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTION_DETAIL_SEARCH"
                dataSet={lineDS}
                columns={columns}
                queryBar="none"
                selectionMode={!(!updateFlag && source === 'detail') ? 'rowbox' : 'click'}
                buttons={
                  readOnlyFlag || (!updateFlag && source === 'detail') ? readOnlyButtons : buttons
                }
                searchBarConfig={{
                  closeFilterSelector: true,
                }}
              />
            )}
          </Content>
        )}

        <Content>
          <h3 className="ssta-form-title" id="header">
            {intl.get(`${prefix}.view.title.otherInfo`).d('其他信息')}
          </h3>
          {customizeForm(
            { code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_OTHER_INFO', readOnly: readOnlyFlag },
            <Form
              dataSet={headerDS}
              columns={3}
              useColon={false}
              labelLayout={updateFlag || source === 'create' ? 'float' : 'vertical'}
            >
              <FormItem
                name="confirmCollaborativeModeMeaning"
                disabled={updateFlag || source === 'create'}
              />
              <FormItem
                name="confirmApproveMethodMeaning"
                disabled={updateFlag || source === 'create'}
              />
              <FormItem
                name="cancelCollaborativeModeMeaning"
                disabled={updateFlag || source === 'create'}
              />
              <FormItem
                name="cancelApproveMethodMeaning"
                disabled={updateFlag || source === 'create'}
              />
              <FormItem
                name="remark"
                newLine
                colSpan={2}
                editor="textarea"
                editable={updateFlag || source === 'create'}
              />
              {!cancelFlag && !['NEW', 'SUBMITED'].includes(settleStatus) && (
                <FormItem
                  name="canceledReason"
                  editor="textarea"
                  newLine
                  colSpan={2}
                  disabled={updateFlag || source === 'create'}
                />
              )}
              {settleStatus !== 'NEW' &&
                (!['SUBMITED', 'SUBMITED_APPROVING', 'WAIT_SUPPLIER_CONFIRM'].includes(
                  settleStatus
                ) ||
                  readOnlyFlag) && (
                  <FormItem
                    name="approvedRemark"
                    newLine
                    colSpan={2}
                    editor="textarea"
                    disabled={updateFlag || source === 'create'}
                  />
                )}
              {!['NEW', 'SUBMITED', 'SUBMITED_APPROVING'].includes(settleStatus) &&
                (!['CANCELING', 'CANCEL_APPROVING', 'WAIT_SUPPLIER_CANCEL'].includes(
                  settleStatus
                ) ||
                  readOnlyFlag) && (
                  <FormItem
                    name="canceledRemark"
                    newLine
                    colSpan={2}
                    editor="textarea"
                    disabled={updateFlag || source === 'create'}
                  />
                )}
            </Form>
          )}
          {!notPub &&
            customizeForm(
              {
                code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_OTHER_WORKFLOW',
                readOnly: readOnlyFlag,
              },
              <Form
                dataSet={headerDS}
                columns={3}
                useColon={false}
                style={{ marginTop: '16px' }}
                labelLayout={updateFlag || source === 'create' ? 'float' : 'vertical'}
              />
            )}
        </Content>
        {source === 'detail' && (
          <Content wrapperClassName="ssta-last-page-content-wrapper">
            <h3 className="ssta-form-title" id="header">
              {intl.get(`${prefix}.view.message.panel.attachment`).d('附件')}
            </h3>
            {customizeForm(
              {
                code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_OTHER_ENCLOSURE',
              },
              <Form
                dataSet={headerDS}
                columns={3}
                useColon={false}
                labelLayout={updateFlag || source === 'create' ? 'float' : 'vertical'}
                className="ssta-form-form"
              >
                <Attachment
                  name="attachmentUuid"
                  showHistory={!updateFlag}
                  labelLayout="float"
                  readOnly={!updateFlag}
                  bucketDirectory="ssta-prepayment"
                />
              </Form>
            )}
          </Content>
        )}
      </Spin>
    );
  };

  const headerBtns = () => {
    let allBtns = [];
    if (type === 'NUM') {
      allBtns = [
        updateBtn &&
          createPermsMap.get(`${permPrefix}.radio.button.update`) && {
            name: 'readOnlyEdit',
            child: intl.get('hzero.common.button.edit').d('编辑'),
            btnProps: {
              type: 'c7n-pro',
              icon: 'mode_edit',
              onClick: () => toLastDetailPage('UPDATE'),
            },
          },
        approveBtn &&
          createPermsMap.get(`${permPrefix}.radio.button.audit`) && {
            name: 'readOnlyApprove',
            child: intl.get('ssta.common.button.approve').d('审核'),
            btnProps: {
              type: 'c7n-pro',
              icon: 'authorize',
              onClick: () => toLastDetailPage('APPROVE'),
            },
          },
        cancelBtn &&
          createPermsMap.get(`${permPrefix}.radio.button.cancel`) && {
            name: 'readOnlyCancel',
            child: intl.get('hzero.common.button.cancel').d('取消'),
            btnProps: {
              type: 'c7n-pro',
              icon: 'cancel',
              onClick: () => toLastDetailPage('CANCEL'),
            },
          },
        {
          name: 'print',
          child: intl.get('hzero.common.button.print').d('打印'),
          btnProps: {
            icon: 'print',
            onClick: handlePrint,
            loading: allLoading,
            funcType: 'flat',
            color: 'default',
          },
        },
        {
          name: 'readOnlyOperating',
          child: intl.get('hzero.common.button.operating').d('操作记录'),
          btnProps: {
            icon: 'operation_service_request',
            onClick: handleRecord,
            loading: allLoading,
            funcType: 'flat',
            color: 'default',
          },
        },
      ];
    } else {
      allBtns = [
        updateFlag &&
          source === 'detail' && {
            name: 'submit',
            child: intl.get('hzero.common.button.submit').d('提交'),
            btnProps: {
              icon: 'check_circle',
              onClick: handleSubmit,
              loading: allLoading,
              disabled: allLoading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        (source === 'create' || (updateFlag && source === 'detail')) && {
          name: 'save',
          child: intl.get('hzero.common.button.save').d('保存'),
          btnProps: {
            icon: 'save',
            onClick: handleSave,
            loading: allLoading,
            disabled: allLoading,
            wait: 1500,
            waitType: 'throttle',
          },
        },
        source === 'detail' &&
          (updateFlag || cancelFlag) && {
            name: 'cancel',
            child: intl.get('hzero.common.button.cancel').d('取消'),
            btnProps: {
              icon: 'cancel',
              onClick: () => {
                if (updateFlag) {
                  return operateBeforeConfirm('CANCEL');
                }
                if (cancelFlag) {
                  return handleFilledInfo('CANCEL', handleCancel);
                }
              },
              loading: allLoading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        approveFlag &&
          source === 'detail' && {
            name: 'confirm',
            child: intl.get('hzero.common.button.confirm').d('确认'),
            btnProps: {
              icon: 'check',
              onClick: () => handleFilledInfo('CONFIRM', handleConfirm),
              loading: allLoading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        approveFlag &&
          source === 'detail' && {
            name: 'return',
            child: intl.get('hzero.common.button.return').d('退回'),
            btnProps: {
              icon: 'reply',
              onClick: () => handleFilledInfo('RETURN', handleReturn),
              loading: allLoading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        source === 'detail' && {
          name: 'print',
          child: intl.get('hzero.common.button.print').d('打印'),
          btnProps: {
            icon: 'print',
            onClick: handlePrint,
            loading: allLoading,
            funcType: 'flat',
            color: 'default',
          },
        },
        source === 'detail' && {
          name: 'operating',
          child: intl.get('hzero.common.button.operating').d('操作记录'),
          btnProps: {
            icon: 'operation_service_request',
            onClick: handleRecord,
            loading: allLoading,
            funcType: 'flat',
            color: 'default',
          },
        },
      ];
    }
    return btnsFormat(allBtns);
  };
  return (
    <>
      <Header
        title={notPub ? (source === 'create' ? titleObj.CREATE : titleObj[type]) : ''}
        backPath={notPub ? state?.backPath || '/ssta/supply-settle/list' : null}
        onBack={() => {
          if (notPub && state?.backPath) {
            updateTab({
              key: getActiveTabKey(),
              search: state?.backPath.split('?')[1],
              state: null,
            });
          }
        }}
      >
        {customizeBtnGroup(
          {
            code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_HEAD_BTNS',
            pro: true,
          },
          <DynamicButtons buttons={headerBtns()} />
        )}
      </Header>
      <div className={Styles['ssta-detail-content']} id="ssta-detail-content">
        {detailTabPaneRender()}
      </div>
    </>
  );
};

export default compose(
  formatterCollections({
    code: ['ssta.prePayment', 'ssta.supplySettle', 'entity.attachment', 'ssta.purchaseSettle'],
  }),
  withCustomize({
    unitCode: [
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_BASIC',
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRADINGPARTY',
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_INFO',
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTIONDETAIL',
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_OTHER_INFO',
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_OTHER_ENCLOSURE',
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_CONFIRM',
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_RETURN',
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_CANCEL',
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_HEAD_BTNS',
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_OTHER_WORKFLOW',
    ],
  })
)(Detail);
