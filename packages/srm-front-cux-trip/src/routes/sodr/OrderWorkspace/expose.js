import React from 'react';
import { Tabs } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';

import { Expose } from 'utils/remote';
import intl from 'utils/intl';

import {
  purchaseRequest,
  sourcingResults,
  purchaseAgreement,
} from './ReferenceDocument/store/referenceDocumentDs';
import HeaderButtons from './ReferenceDocument/HeaderButtons';
import {
  PurchaseRequest,
  SourcingResults,
  PurchaseAgreement,
} from './ReferenceDocument';

const { TabPane, TabGroup } = Tabs;

export default new Expose({
  process: {
    // 标签组
    'SODR.WORKSPACE_LIST_PROCESS_TAB_GROUP': (_, otherProps) => {
      const { cuxTabRefs, activeKey, props, displayDocAndDocFlow } = otherProps || {};
      const { cuxPurchaseRequestDsRef, cuxSourcingResultsDsRef, cuxPurchaseAgreementDsRef } =
        cuxTabRefs || {};
      const { cuxTableListDSObj } = props || {};
      const { cuxPurchaseRequestDs, cuxSourcingResultsDs, cuxPurchaseAgreementDs } =
        cuxTableListDSObj || {};
      if (!cuxPurchaseRequestDs || !cuxSourcingResultsDs || !cuxPurchaseAgreementDs) {
        return null;
      }
      return (
        <TabGroup
          tab={intl.get('scux.sodr.view.workspace.title.pendingOrder').d('待下单')}
          key="cuxPendingOrder"
          defaultActiveKey={activeKey}
        >
          <TabPane
            key="cuxPurchaseRequest"
            count={() => !cuxPurchaseRequestDs.counting && cuxPurchaseRequestDs.totalCount}
            tab={intl.get('sodr.workspace.view.tabPane.purchaseRequest').d('引用采购申请')}
          >
            <PurchaseRequest
              ds={cuxPurchaseRequestDs}
              cacheKey="cuxPurchaseRequest"
              displayDocAndDocFlow={displayDocAndDocFlow}
              searchBarRef={(root) => {
                if (cuxPurchaseRequestDsRef) {
                  cuxPurchaseRequestDsRef.current = root;
                }
              }}
            />
          </TabPane>
          <TabPane
            key="cuxSourcingResults"
            count={() => !cuxSourcingResultsDs.counting && cuxSourcingResultsDs.totalCount}
            tab={intl.get('sodr.workspace.view.tabPane.sourcingResults').d('引用寻源结果')}
          >
            <SourcingResults
              ds={cuxSourcingResultsDs}
              cacheKey="cuxSourcingResults"
              displayDocAndDocFlow={displayDocAndDocFlow}
              searchBarRef={(root) => {
                if (cuxSourcingResultsDsRef) {
                  cuxSourcingResultsDsRef.current = root;
                }
              }}
            />
          </TabPane>
          <TabPane
            key="cuxPurchaseAgreement"
            count={() => !cuxPurchaseAgreementDs.counting && cuxPurchaseAgreementDs.totalCount}
            tab={intl.get('sodr.workspace.view.tabPane.purchaseAgreement').d('引用采购协议')}
          >
            <PurchaseAgreement
              ds={cuxPurchaseAgreementDs}
              cacheKey="cuxPurchaseAgreement"
              displayDocAndDocFlow={displayDocAndDocFlow}
              searchBarRef={(root) => {
                if (cuxPurchaseAgreementDsRef) {
                  cuxPurchaseAgreementDsRef.current = root;
                }
              }}
            />
          </TabPane>
        </TabGroup>
      );
    },
    'SODR.WORKSPACE_LIST_PROCESS_TAB_REFS': () => {
      return {
        // 新加【待下单】标签组下表格的ref
        cuxPurchaseRequestDsRef: React.useRef(),
        cuxSourcingResultsDsRef: React.useRef(),
        cuxPurchaseAgreementDsRef: React.useRef(),
      };
    },
    'SODR.WORKSPACE_LIST_PROCESS_TABLE_LIST_DS_OBJ': () => {
      return {
        cuxPurchaseRequestDs: new DataSet(purchaseRequest()),
        cuxSourcingResultsDs: new DataSet(sourcingResults()),
        cuxPurchaseAgreementDs: new DataSet(purchaseAgreement()),
      };
    },
  },
  events: {
    cuxTabChange: (eventProps) => {
      const { key, props } = eventProps || {};
      const { dispatch } = props || {};
      if (
        dispatch &&
        key &&
        ['cuxPurchaseRequest', 'cuxSourcingResults', 'cuxPurchaseAgreement'].includes(key)
      ) {
        dispatch({
          type: 'orderWorkSpace/updateState',
          payload: { activeKey: key, redioKey: 'cuxPendingOrder' },
        });
      }
    },
  },
  render: {
    // 头按钮
    'SODR.WORKSPACE_LIST_RENDER_CUX_HEADER_BUTTON': (renderPayload) => {
      const { renderProps } = renderPayload || {};
      const { props, activeKey } = renderProps || {};
      const { history, cuxTableListDSObj } = props || {};
      const { cuxPurchaseRequestDs, cuxSourcingResultsDs, cuxPurchaseAgreementDs } =
        cuxTableListDSObj || {};
      const headerProps = {
        history,
        activeKey,
        purchaseRequestDs: cuxPurchaseRequestDs,
        sourcingResultsDs: cuxSourcingResultsDs,
        purchaseAgreementDs: cuxPurchaseAgreementDs,
      };
      if (!cuxPurchaseRequestDs || !cuxSourcingResultsDs || !cuxPurchaseAgreementDs) {
        return sourceBtns || null;
      }
      return <HeaderButtons {...headerProps} />;
    },
  },
});
