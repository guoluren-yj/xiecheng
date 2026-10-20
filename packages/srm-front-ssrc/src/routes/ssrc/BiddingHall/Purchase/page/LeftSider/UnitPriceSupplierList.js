import React, { useCallback, useEffect, useRef } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { DataSet, useModal, Tooltip, Modal } from 'choerodon-ui/pro';
import { Icon, Dropdown, Menu, Text } from 'choerodon-ui';
import { getResponse } from 'utils/utils';

import { AutoSizer, List as VList } from 'react-virtualized';
import 'react-virtualized/styles.css';

import { TooltipEllipsis } from '../../../components';
import { BanQuotation, banQuotationDS } from './UnitPriceBanQuotation';

import './index.less';

const signInSvg = require('@/assets/biddingHall/sign-in.svg');
const forbidQuotationSvg = require('@/assets/biddingHall/forbid-quotation.svg');
const abnormalIp = require('@/assets/biddingHall/abnormal-ip.svg');
const greenIp = require('@/assets/biddingHall/ipgreen.svg');
const noSupplierSvg = require('@/assets/biddingHall/supplier-position-placeholder.svg');

// 左侧供应商列表
const UnitPriceSupplierList = observer((props = {}) => {
  const ModalPro = useModal();
  const {
    supplierListDataSet,
    header = {},
    itemLineListDS,
    toggleLoading,
    useNewRateFlag = 0,
    remote,
  } = props || {};

  const {
    biddingStatus,
    biddingAnonymousQuotesFlag, // 是否匿名报价
    allowProhibitQuotation, // 允许操作禁止报价
  } = header || {};

  const {
    supplierCount, // 供应商总数
    onlineSupplierCount, // 在线供应商数
    supplierLineInfoDTOS = [],
  } =
    supplierListDataSet?.current?.get([
      'supplierCount',
      'onlineSupplierCount',
      'supplierLineInfoDTOS',
    ]) || {};

  const unitPriceTimerRef = useRef(null);

  useEffect(() => {
    openUnitPriceTimer();
    return () => {
      clearUnitPriceTimer();
    };
  }, [supplierLineInfoDTOS, openUnitPriceTimer]);

  // 开启单价竞价供应商列表定时器
  const openUnitPriceTimer = useCallback(() => {
    // 如果是完成、关闭的单子，不开启轮询
    if (['BIDDING_CLOSED', 'BIDDING_END'].includes(biddingStatus)) {
      clearUnitPriceTimer();
      return;
    }
    // 没有开启供应商列表轮询，则开启
    if (!unitPriceTimerRef.current) {
      unitPriceTimerRef.current = setInterval(() => {
        supplierListDataSet.query();
      }, 15000);
    }
  }, [unitPriceTimerRef?.current, supplierListDataSet, biddingStatus]);

  // 清除单价竞价供应商列表定时器
  const clearUnitPriceTimer = useCallback(() => {
    if (unitPriceTimerRef?.current) {
      clearInterval(unitPriceTimerRef.current);
      unitPriceTimerRef.current = null;
    }
  }, [unitPriceTimerRef?.current]);

  // 菜单点击
  const handleMenuClick = useCallback(
    (e, supplier) => {
      const { rfxLineSupplierId } = supplier || {};
      const commonProps = supplierListDataSet.getQueryParameter('commonProps');
      if (e.key === 'banQuotation') {
        const content = intl
          .get('ssrc.biddingHall.view.title.confirmProhibition', {
            supplierCompanyName: supplier.displaySupplierName,
          })
          .d('是否确认禁止{supplierCompanyName}报价？');
        Modal.confirm({
          key: rfxLineSupplierId,
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: content,
          destroyOnClose: true,
          onOk() {
            const formDS = new DataSet(banQuotationDS({ ...commonProps, rfxLineSupplierId }));
            return ModalPro.open({
              drawer: true,
              destroyOnClose: true,
              closable: true,
              title: intl.get('ssrc.biddingHall.view.button.banQuotation').d('禁止报价'),
              children: <BanQuotation formDS={formDS} />,
              style: { width: '380px' },
              okProps: {
                wait: 2000,
                waitType: 'throttle',
              },
              onOk: async () => {
                toggleLoading(true);
                const validate = await formDS.validate();
                if (!validate) {
                  toggleLoading(false);
                  return false;
                }
                try {
                  const res = await formDS.submit();
                  toggleLoading(false);
                  if (getResponse(res)) {
                    supplierListDataSet.query();
                    itemLineListDS.query();
                    return true;
                  }
                } catch (err) {
                  toggleLoading(false);
                  throw err;
                }
              },
            });
          },
        });
      }
    },
    [toggleLoading, supplierListDataSet, itemLineListDS]
  );

  // 菜单
  const getMenu = useCallback((payload) => {
    const { item = {} } = payload || {};
    return (
      <Menu onClick={(e) => handleMenuClick(e, item)}>
        {/* 禁止报价显示逻辑 单据状态为报价中&该供应商的报价单头-禁止报价标识为0 */}
        {!item.prohibitQuotationFlag && (
          <Menu.Item key="banQuotation">
            {intl.get('ssrc.biddingHall.view.button.banQuotation').d('禁止报价')}
          </Menu.Item>
        )}
        {/* 删除最新报价显示逻辑 单据状态为报价中&供应商对目前行状态为进行中的物料有过报价记录时展示按钮(单价竞价时) */}
        {/* {item.quoted && (
          <Menu.Item key="deleteNewQuotation">
            {intl.get('ssrc.biddingHall.view.button.deleteNewQuotation').d('删除最新报价')}
          </Menu.Item>
        )} */}
      </Menu>
    );
  }, []);

  // 虚拟滚动rowRender
  const rowRenderer = useCallback(
    ({ key, index, style }) => {
      const item = supplierLineInfoDTOS[index];

      let supplierExtraInfo = !biddingAnonymousQuotesFlag ? ( // 匿名报价不显示这块内容
        <TooltipEllipsis
          title={`${item.contactName ?? ''} ${item.contactMobilephone ?? ''} ${
            item.contactMail ?? ''
          }`}
        >
          <div className="pur-left-sider-bottom-virtual-list-item-contact">
            <span>{item.contactName ?? ''}</span>
            <span>{item.contactMobilephone ?? ''}</span>
            <span>{item.contactMail ?? ''}</span>
          </div>
        </TooltipEllipsis>
      ) : (
        ''
      );
      supplierExtraInfo = remote
        ? remote.process(
            'SSRC_PURCHASE_BIDDING_HALL_PROCESS_UNIT_PRICE_SUPPLIER_LIST_ADDITION_INFO',
            supplierExtraInfo,
            { key, index, supplierLineInfoDTOS, item, pageProps: props }
          )
        : supplierExtraInfo;

      // 不显示禁止报价和最新报价操作标识
      const showDropdownFlag = !item.prohibitQuotationFlag && biddingStatus !== 'BIDDING_END';
      return (
        <div className="pur-left-sider-bottom-virtual-list-item" key={key} style={style}>
          <div className="pur-left-sider-bottom-virtual-list-item-supplier">
            <span className="pur-left-sider-bottom-virtual-list-item-supplier-info">
              <span className="pur-left-sider-bottom-virtual-list-item-supplier-name">
                <Text>{item.displaySupplierName}</Text>
              </span>
              {/* 在线 ｜ 离线 */}
              {item.onlineFlag ? (
                <span className="pur-left-sider-bottom-virtual-list-item-online">
                  <Text>{intl.get('ssrc.biddingHall.view.tag.online').d('在线')}</Text>
                </span>
              ) : (
                <span className="pur-left-sider-bottom-virtual-list-item-offline">
                  <Text>{intl.get('ssrc.biddingHall.view.tag.offline').d('离线')}</Text>
                </span>
              )}
              {/* 签到  */}
              {!!item.signInFlag && (
                <Tooltip title={intl.get('ssrc.biddingHall.view.message.signedIn').d('已签到')}>
                  <img alt="" src={signInSvg} />
                </Tooltip>
              )}
              {/* 禁止报价 */}
              {!!item.prohibitQuotationFlag && (
                <Tooltip
                  title={intl.get('ssrc.biddingHall.view.button.banQuotation').d('禁止报价')}
                >
                  <img alt="" src={forbidQuotationSvg} />
                </Tooltip>
              )}
              {useNewRateFlag ? (
                item.repeatIpFlag ? (
                  <Tooltip
                    title={intl.get('ssrc.biddingHall.view.button.abnormalIp').d('报价IP异常')}
                  >
                    <img alt="" src={abnormalIp} />
                  </Tooltip>
                ) : (
                  <img alt="" src={greenIp} />
                )
              ) : (
                !!item.repeatIpFlag && (
                  <Tooltip
                    title={intl.get('ssrc.biddingHall.view.button.abnormalIp').d('报价IP异常')}
                  >
                    <img alt="" src={abnormalIp} />
                  </Tooltip>
                )
              )}
            </span>
            {showDropdownFlag && ['BIDDING'].includes(biddingStatus) && allowProhibitQuotation ? (
              <Dropdown overlay={getMenu({ item, index })} trigger="hover">
                <Icon type="more_horiz" style={{ cursor: 'pointer' }} />
              </Dropdown>
            ) : null}
          </div>
          {supplierExtraInfo}
        </div>
      );
    },
    [supplierLineInfoDTOS, biddingStatus, allowProhibitQuotation]
  );

  return (
    <>
      <h3 className="pur-left-sider-bottom-virtual-header">
        {intl.get('ssrc.biddingHall.view.title.biddingSupplier').d('供应商')}
        <span>
          ({onlineSupplierCount}/{supplierCount})
        </span>
      </h3>
      <div className="pur-left-sider-bottom-virtual-list">
        <AutoSizer>
          {({ width, height }) => (
            <VList
              height={height}
              rowCount={supplierLineInfoDTOS?.length || 0}
              rowHeight={55} // 高度是item-name的css高度
              rowRenderer={(p) => rowRenderer(p)}
              width={width}
            />
          )}
        </AutoSizer>
        {!supplierLineInfoDTOS?.length && (
          <div className="list-empty-supplier-occupied">
            <img alt="" src={noSupplierSvg} />
            <div className="list-empty-supplier-occupied-text">
              {intl.get('ssrc.biddingHall.view.message.emptySupplier').d('暂无供应商')}
            </div>
          </div>
        )}
      </div>
    </>
  );
});

export default UnitPriceSupplierList;
