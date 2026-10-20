import { stringify } from 'querystring';
import React, { Fragment, useContext, useCallback, useMemo, useRef, useState } from 'react';
import { Tabs, Button } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import notification from 'utils/notification';

import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import QuoteOrder from './components/QuoteOrder';
import QuoteOrderLine from './components/QuotePoLine';
import QuoteContract from './components/QuoteContract';
import QuotePcStage from './components/QuotePcStage';
import QuotePcSubject from './components/QuotePcSubject';
import { ActiveKey, ListTabsCustCode } from './utils/type';
import commonStyles from '../../../common.less';
import { getCustomValidationResponse } from '../../../../components/CustomValidation';

const { TabPane, TabGroup } = Tabs;

const List = observer(() => {

  const {
    modal,
    history,
    listDsMap,
    permissionMap,
    defaultActiveKey,
    customizeTabPane,
    remote,
  } = useContext<StoreValueType>(Store);
  const initKeysMap = useRef({});
  const [activeKey, setActiveKey] = useState<ActiveKey>(defaultActiveKey);
  const currentListDs = useMemo(() => listDsMap[activeKey], [listDsMap, activeKey]);
  // 暂挂查询条件
  const pendingFlag = currentListDs?.queryDataSet?.current?.get('pendingFlag');

  const handleCollectInitKey = useCallback((key) => {
    initKeysMap.current[key] = true;
  }, []);

  const handleTabChange = useCallback((newActiveKey) => {
    setActiveKey(newActiveKey);
    const currentTableDs = listDsMap[newActiveKey];
    if (initKeysMap.current[newActiveKey]) currentTableDs.query(currentTableDs.currentPage);
  }, [listDsMap]);

  const handleCreate = useCallback(async () => {
    const onNext = async () => {
      const res = await currentListDs.setState('submitType', 'create').submit();
      const settleListRes = res && res.content;
      if (!settleListRes || isEmpty(settleListRes)) return;
      notification.success({});
      const settleList = settleListRes.map(({ settleHeader: { settleNum, settleHeaderId } }) => ({ settleNum, settleHeaderId }));
      const { settleHeaderId } = settleList[0];
      if (!settleHeaderId) return;
      const baseSearch = {
        settleHeaderId,
        type: 'UPDATE',
        source: 'detail',
        documentType: 'PREPAYMENT',
      };
      if (settleList.length > 1) Object.assign(baseSearch, { list: JSON.stringify(settleList) });
      history.push({
        pathname: '/ssta/new-purchase-settle/pre-payment',
        search: stringify(baseSearch),
      });
    };
    if (remote && remote.event) {
      // 埋点处理
      const beforeValidateRes = await remote.event.fireEvent('onLoadCreateValidateCux', { currentListDs, activeKey });
      if (beforeValidateRes === false) return false;
    }
    const res = await currentListDs.setState('submitType', 'createValidate').submit();
    if (!res) return;
    return getCustomValidationResponse(res.content[0], onNext);
  }, [history, currentListDs, remote, activeKey]);

  // 处理协议 暂挂/撤销暂挂
  const handleHodle = useCallback(async () => {
    const res = await currentListDs.setState('submitType', 'hodle').submit();
    if (!res) return;
    notification.success({});
    currentListDs.query(undefined, undefined, false);
  }, [currentListDs]);

  return (
    <Fragment>
      {customizeTabPane(
        {
          code: ListTabsCustCode,
          cascade: true,
        },
        <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
          <TabGroup tab={intl.get(`ssta.common.view.title.wholeTab`).d('整单')} key="whole">
            <TabPane
              tab={intl.get(`ssta.common.view.title.quotePurchaseOrder`).d('引用采购订单')}
              key={ActiveKey.Order}
            >
              <QuoteOrder onInit={handleCollectInitKey} />
            </TabPane>
            <TabPane
              tab={intl.get(`ssta.common.view.title.quotePurchaseContract`).d('引用采购协议')}
              key={ActiveKey.Contract}
            >
              <QuoteContract onInit={handleCollectInitKey} />
            </TabPane>
          </TabGroup>
          <TabGroup tab={intl.get(`ssta.common.view.title.detailTab`).d('明细')} key="detail">
            <TabPane
              tab={intl.get(`ssta.common.view.title.quotePurchaseOrder`).d('引用采购订单')}
              key={ActiveKey.PoLine}
            >
              <QuoteOrderLine onInit={handleCollectInitKey} />
            </TabPane>
            <TabPane
              tab={intl.get(`ssta.common.view.title.quotePcStage`).d('引用采购协议阶段')}
              key={ActiveKey.PcStage}
            >
              <QuotePcStage onInit={handleCollectInitKey} />
            </TabPane>
            <TabPane
              tab={intl.get(`ssta.common.view.title.quotePcSubject`).d('引用采购协议标的')}
              key={ActiveKey.PcSubject}
            >
              <QuotePcSubject onInit={handleCollectInitKey} />
            </TabPane>
          </TabGroup>
        </Tabs>
      )}
      <div className={commonStyles['ssta-body-footer']}>
        <Button color={ButtonColor.primary} disabled={isEmpty(currentListDs.selected)} onClick={handleCreate}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        {permissionMap?.get('preSourceHold') && pendingFlag === '0' && (
          <Button disabled={isEmpty(currentListDs.selected)} onClick={handleHodle}>
            {intl.get('ssta.prePayment.view.button.suspend').d('暂挂')}
          </Button>
        )}
        {permissionMap?.get('preSourceUnhold') && pendingFlag === '1' && (
          <Button disabled={isEmpty(currentListDs.selected)} onClick={handleHodle}>
            {intl.get('ssta.prePayment.view.button.unsuspend').d('撤销暂挂')}
          </Button>
        )}
        <Button onClick={modal.close}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>
      </div>
    </Fragment>
  );


});


const QuoteCreatePrePay = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default QuoteCreatePrePay;

