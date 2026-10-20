import React, { useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Tabs } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { Content, Header } from 'components/Page';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { check } from '@/services/quotePurchaseRequisitionService';
import { throttle } from 'lodash';
import LineQuotation from './LineQuotation';
import WholeOrderQuotation from './WholeOrderQuotation';
import { Store } from './stores';
import { sourcePage } from '@/routes/components/utils';

import { THROTTLE_TIME } from '@/routes/components/utils/constant';

const { TabPane } = Tabs;

const CreationButton = observer(function CreationButton(props) {
  const { dataSet, onClick } = props;
  return (
    <Button
      icon="add"
      color="primary"
      onClick={onClick}
      // loading={checkLoading || createLoading}
      disabled={!dataSet.selected.length}
    >
      {intl.get('hzero.common.button.create').d('新建')}
    </Button>
  );
});

const pageSource = sourcePage();

const List = function List() {
  const {
    lineQuoteDs,
    wholeOrderQuoteDs,
    customizeBtnGroup,
    customizeTabPane,
    tabActiveKey,
    setTabActiveKey,
    history,
  } = useContext(Store);
  const handleToDetail = useCallback(
    (headerId, source) => {
      // 存放首次加载价格库查询标识
      const itemKey = `sodr.quotePurchaseRequisition.${Math.random()}`;
      window.sessionStorage.setItem(itemKey, 1);
      if (tabActiveKey === 'lineQuotation') {
        // 新版采购申请转订单页面跳转逻辑    sourcePage 来源于引用采购申请入口
        if (source === 'ERP' || source === 'SRM' || source === 'SHOP') {
          history.push({
            pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-newCreation`,
            search: `?poHeaderId=${headerId}&source=newRequisition&sourcePage=${pageSource.pageRequest}&poSourcePlatform=${source}`,
          });
        } else {
          // 旧版采购申请转订单页面跳转逻辑
          history.push({
            pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/line-creation`,
            search: `?poHeaderId=${headerId}&source=requisition&itemKey=${itemKey}`,
          });
        }
      } else {
        history.push({
          pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/sheet-creation`,
          search: `?poHeaderId=${headerId}&source=requisition`,
        });
      }
    },
    [tabActiveKey, history]
  );

  const handleCreate = useCallback(
    throttle(
      async () => {
        const { selected } = lineQuoteDs;
        if (selected.length > 0) {
          const result = getResponse(
            await check({
              sourceCode: 'PURCHASE_REQUEST',
            })
          );
          if (result !== undefined) {
            const prSourcePlatform = selected[0].get('prSourcePlatform');
            const data = await lineQuoteDs.submit();
            if (data && !data.failed) {
              const { content } = data;
              const poHeaderId = content.map((n) => n.poHeaderId);
              lineQuoteDs.clearCachedSelected();
              lineQuoteDs.unSelectAll();
              wholeOrderQuoteDs.clearCachedSelected();
              wholeOrderQuoteDs.unSelectAll();
              if (result === 1) {
                if (content.length > 1) {
                  history.push({
                    pathname: `/sodr/purchase-order-maintain/quote-purchase-requisition/tab-line-newCreation`,
                    search: `?poHeaderId=${poHeaderId}&cacheKey=${content[0].cacheKey}&source=newRequisition&sourcePage=${pageSource.pageRequest}`,
                  });
                } else if (content.length === 1) {
                  handleToDetail(poHeaderId, prSourcePlatform);
                }
              } else if (result === 0) {
                handleToDetail(poHeaderId, prSourcePlatform);
              }
            }
          }
        }
      },
      THROTTLE_TIME,
      { trailing: false }
    ),
    [lineQuoteDs, history, handleToDetail]
  );
  const handleWholeQuoteCreate = useCallback(
    throttle(
      () => {
        return wholeOrderQuoteDs.submit().then((data) => {
          if (data && !data.failed) {
            handleToDetail(data.content[0].poHeaderId);
          }
        });
      },
      THROTTLE_TIME,
      { trailing: false }
    ),
    [wholeOrderQuoteDs, handleToDetail]
  );

  const onHeaderBack = useCallback(() => {
    lineQuoteDs.clearCachedSelected();
    lineQuoteDs.unSelectAll();
    wholeOrderQuoteDs.clearCachedSelected();
    wholeOrderQuoteDs.unSelectAll();
  }, [lineQuoteDs, wholeOrderQuoteDs]);

  return (
    <>
      <Header
        title={intl.get(`sodr.quotePurchaseRequisition.view.message.title`).d('引用采购申请')}
        backPath="/sodr/purchase-order-maintain/list"
        onBack={onHeaderBack}
      >
        {tabActiveKey === 'lineQuotation' &&
          customizeBtnGroup({ code: 'SODR.PURCHASE_REQUISITION_LIST.BUTTONS' }, [
            <CreationButton
              data-name="lineQuotationCreate"
              dataSet={lineQuoteDs}
              onClick={handleCreate}
            />,
          ])}
        {tabActiveKey === 'orderQuotation' && (
          <CreationButton
            data-name="orderQuotationCreate"
            dataSet={wholeOrderQuoteDs}
            onClick={handleWholeQuoteCreate}
          />
        )}
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: 'SODR.PURCHASE_REQUISITION_LIST.TAB',
          },
          <Tabs activeKey={tabActiveKey} onChange={setTabActiveKey} animated={false}>
            <TabPane
              tab={intl
                .get(`sodr.quotePurchaseRequisition.view.message.lineQuotation`)
                .d('按行引用')}
              key="lineQuotation"
            >
              <LineQuotation dataSet={lineQuoteDs} />
            </TabPane>
            <TabPane
              tab={intl
                .get(`sodr.quotePurchaseRequisition.view.message.orderQuotation`)
                .d('整单引用')}
              key="orderQuotation"
            >
              <WholeOrderQuotation dataSet={wholeOrderQuoteDs} />
            </TabPane>
          </Tabs>
        )}
      </Content>
    </>
  );
};

export default observer(List);
