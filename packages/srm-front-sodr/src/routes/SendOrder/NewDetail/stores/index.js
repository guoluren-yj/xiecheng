import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import querystring from 'querystring';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { getCurrentOrganizationId } from 'utils/utils';
import { fetchAssociatedConfigFlag } from '@/services/sendOrderService';
import { ModalProvider, Spin, useDataSet } from 'choerodon-ui/pro';
import Exception from 'components/Exception';
import HeaderDs from './HeaderDs';
import ListDs from './ListDs';
import SettingsDs from './SettingsDs';
import PartnerDs from './PartnerDs';
import EvaluationDs from './EvaluationDs';
import DscDs from './DscDs';
import AsnDs from './AsnDs';
import RcvDs from './RcvDs';
import BillDs from './BillDs';
import InvoiceDs from './InvoiceDs';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const {
    match: { params, path },
    location: { search, state = {} },
    history,
    children,
    customizeBtnGroup,
    customizeForm,
    customizeTable,
    customizeTabPane,
  } = props;
  const { backPath } = state;
  const sourceFromCancel = path.includes('order-cancel');
  const sourceFromPub = path.includes('pub');
  const { id } = params;
  const organizationId = getCurrentOrganizationId();
  const query = useMemo(() => querystring.parse(search.substr(1)), [search]);
  const { sourceFlag, source, openFrom, poSourcePlatform, isBackFlag = 1 } = query;
  const [associatedConfigFlag, setAssociatedConfigFlag] = useState(true);
  const [radioGroupValue, setRadioGroupValue] = useState('basic');
  const computedBackPath = useMemo(() => {
    if (sourceFromPub || Number(isBackFlag) !== 1) {
      return false;
    }
    if (backPath) {
      return backPath;
    }
    switch (sourceFlag) {
      case 'supplier-deduction-query': // 返回供应商查询页面
        return '/sfin/supplier-deduction-query/list';
      case 'supplier-deduction-approval': // 返回供应商审批页面
        return '/sfin/supplier-deduction-approval/list';
      default:
        return path.indexOf('/sodr/order-cancel/detail') === 0
          ? '/sodr/order-cancel/list'
          : '/sodr/send-order/list';
    }
  }, [sourceFromPub, backPath, path, sourceFlag]);
  const evaluationDs = useDataSet(
    () =>
      EvaluationDs({
        organizationId,
        poHeaderId: id,
        sourceFromCancel,
      }),
    [id, sourceFromCancel, organizationId]
  );
  const dscDs = useDataSet(
    () =>
      DscDs({
        organizationId,
      }),
    [organizationId]
  );
  const asnDs = useDataSet(
    () =>
      AsnDs({
        organizationId,
      }),
    [organizationId]
  );
  const rcvDs = useDataSet(
    () =>
      RcvDs({
        organizationId,
      }),
    [organizationId]
  );
  const billDs = useDataSet(
    () =>
      BillDs({
        organizationId,
        associatedConfigFlag,
      }),
    [organizationId, associatedConfigFlag]
  );
  const invoiceDs = useDataSet(
    () =>
      InvoiceDs({
        organizationId,
        associatedConfigFlag,
      }),
    [organizationId, associatedConfigFlag]
  );
  const associateDs = useDataSet(
    () =>
      ListDs({
        organizationId,
        poHeaderId: id,
        sourceFromCancel,
        dscDs,
        asnDs,
        rcvDs,
        billDs,
        invoiceDs,
        type: 'associate',
      }),
    [id, sourceFromCancel, organizationId, dscDs, asnDs, rcvDs, billDs, invoiceDs]
  );
  const otherDs = useDataSet(
    () =>
      ListDs({
        organizationId,
        poHeaderId: id,
        sourceFromCancel,
        dscDs,
        asnDs,
        rcvDs,
        billDs,
        invoiceDs,
        type: 'other',
      }),
    [id, sourceFromCancel, organizationId, dscDs, asnDs, rcvDs, billDs, invoiceDs]
  );

  const listDs = useDataSet(
    () =>
      ListDs({
        organizationId,
        poHeaderId: id,
        sourceFromCancel,
        dscDs,
        asnDs,
        rcvDs,
        billDs,
        invoiceDs,
        otherDs,
        associateDs,
      }),
    [
      id,
      sourceFromCancel,
      organizationId,
      dscDs,
      asnDs,
      rcvDs,
      billDs,
      invoiceDs,
      otherDs,
      associateDs,
    ]
  );
  const headerDs = useDataSet(
    () =>
      HeaderDs({
        organizationId,
        poHeaderId: id,
        sourceFromCancel,
        evaluationDs,
        listDs,
        otherDs,
        associateDs,
      }),
    [id, sourceFromCancel, organizationId, evaluationDs, listDs, otherDs, associateDs]
  );
  const partnerDs = useDataSet(
    () =>
      PartnerDs({
        organizationId,
        poHeaderId: id,
      }),
    [id, organizationId]
  );
  const settingsDs = useDataSet(() => SettingsDs({ organizationId }), [organizationId]);
  const handleToDetail = useCallback((record) => {
    const { lineNum, displayPoNum } = record.get(['lineNum', 'displayPoNum']);
    history.push({
      pathname: `/sodr/purchase-schedule-sheet-confirm/list`,
      search: `lineNum=${lineNum}&displayPoNum=${displayPoNum}`,
    });
  }, []);
  const handRadioGroupValueChange = useCallback(
    action((newRadioGroupValue) => {
      setRadioGroupValue(newRadioGroupValue);
      // 用于关联单据级联查询
      if (newRadioGroupValue === 'invoice' && !associateDs.current) {
        associateDs.current = associateDs.get(0);
      }
    }),
    [associateDs]
  );

  const value = useMemo(() => {
    return {
      poHeaderId: id,
      organizationId,
      sourceFlag,
      source,
      poSourcePlatform,
      sourceFromPub,
      sourceFromCancel,
      isDocFlowLink: openFrom === 'docFlow',
      isSettleLink: openFrom === 'settle',
      sourceFromModal: openFrom === 'modal',
      backPath: computedBackPath,
      associatedConfigFlag,
      radioGroupValue,
      handRadioGroupValueChange,
      headerDs,
      listDs,
      otherDs,
      associateDs,
      partnerDs,
      evaluationDs,
      settingsDs,
      dscDs,
      asnDs,
      rcvDs,
      billDs,
      invoiceDs,
      handleToDetail,
      customizeBtnGroup,
      customizeForm,
      customizeTable,
      customizeTabPane,
      history,
    };
  }, [
    id,
    organizationId,
    sourceFlag,
    source,
    openFrom,
    poSourcePlatform,
    sourceFromPub,
    sourceFromCancel,
    computedBackPath,
    associatedConfigFlag,
    radioGroupValue,
    handRadioGroupValueChange,
    headerDs,
    listDs,
    partnerDs,
    evaluationDs,
    settingsDs,
    dscDs,
    asnDs,
    rcvDs,
    billDs,
    invoiceDs,
    handleToDetail,
    customizeBtnGroup,
    customizeForm,
    customizeTable,
    customizeTabPane,
  ]);

  useEffect(() => {
    fetchAssociatedConfigFlag().then((res) => setAssociatedConfigFlag(res === 1));
  }, []);
  const { current } = headerDs;

  useEffect(() => {
    if (current) {
      const displayPoNum = associatedConfigFlag ? current.get('displayPoNum') : undefined;
      billDs.setQueryParameter('displayPoNum', displayPoNum);
      invoiceDs.setQueryParameter('displayPoNum', displayPoNum);
    }
  }, [associatedConfigFlag, current, billDs, invoiceDs]);

  if (!current) {
    if (headerDs.status !== 'ready') {
      return <Spin />;
    }
    return <Exception type="500" />;
  }

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default observer(StoreProvider);
