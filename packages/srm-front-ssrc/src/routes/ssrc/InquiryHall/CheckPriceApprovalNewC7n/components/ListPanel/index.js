import React, { useEffect, useCallback, useState, useRef } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { useVirtualList } from 'ahooks';
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import { fetchSupplierLine, fetchItemLine } from '@/services/checkPriceOverviewServices';
import SectionItem from './SectionItem';
import NochildComp from './../NochildComp';
import SupplierList from './../SupplierList';
import styles from './index.less';

const SectionListRender = (props = {}) => {
  const {
    children,
    rfxHeaderId = '',
    organizationId = '',
    afterClick = () => {},
    viewType = 'supplier',
    suggestedFlag = false,
    headerInfo = {},
    setQueryLoading = () => {},
    itemSuggestedFlag = false,
    isSection = false,
  } = props;

  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  const [dataList, setDataList] = useState([]);
  const [sourceId, setSourceId] = useState('');

  useEffect(() => {
    if (viewType === 'supplier') {
      querySupplierData();
    } else {
      queryItemData();
    }
  }, [rfxHeaderId, viewType, suggestedFlag, itemSuggestedFlag]);

  const [list] = useVirtualList(dataList, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 80,
    overscan: 10,
  });

  const querySupplierData = useCallback(() => {
    const params = {
      rfxHeaderId,
      organizationId,
      suggestedFlag: suggestedFlag ? null : 1,
    };
    fetchSupplierLine(params).then((res) => {
      if (getResponse(res)) {
        if (!isEmpty(res)) {
          setDataList(res);
          afterClick(res[0]?.rfxLineSupplierId, viewType);
          setSourceId(res[0]?.rfxLineSupplierId);
        } else {
          setDataList([]);
          setQueryLoading(false);
        }
      }
    });
  }, [suggestedFlag, viewType, rfxHeaderId]);

  const queryItemData = useCallback(() => {
    const params = {
      rfxHeaderId,
      organizationId,
      suggestedFlag: itemSuggestedFlag ? null : 1,
    };
    fetchItemLine(params).then((res) => {
      if (getResponse(res)) {
        setDataList(res);
        afterClick(res[0]?.rfxLineItemId, viewType);
        setSourceId(res[0]?.rfxLineItemId);
      }
    });
  }, [viewType, rfxHeaderId, itemSuggestedFlag]);

  const changeData = useCallback(
    (nextId = '') => {
      if (nextId === sourceId) {
        return;
      }
      setSourceId(nextId);
      afterClick(nextId, viewType);
    },
    [sourceId, viewType]
  );

  const itemProps = {
    afterClick: changeData,
    sourceId,
    viewType,
    headerInfo,
  };

  const listProps = {
    dataSource: dataList,
  };

  return (
    <div className={styles['section-content']} style={{ marginTop: isSection && '-10px' }}>
      {dataList.length > 1 && !isSection && (
        <div className={styles['section-left']}>
          <div className={styles['section-item-top']}>
            <div className={styles['section-item-supplier-name-top']}>
              {viewType === 'supplier'
                ? intl.get(`ssrc.inquiryHall.view.message.tab.vendorList`).d('供应商列表')
                : intl.get(`ssrc.inquiryHall.view.message.tab.itemOfList`).d('物料列表')}
            </div>
            <div className={styles['section-item-supplier-price']}>
              <div
                className={styles['section-item-supplier-price-left']}
                style={{ color: '#868D9C' }}
              >
                {intl.get(`ssrc.inquiryHall.view.message.tab.switchQuickly`).d('可以快速切换')}
                {viewType === 'supplier'
                  ? intl.get('ssrc.common.supplier').d('供应商')
                  : intl.get(`ssrc.inquiryHall.model.inquiryHall.viewItemDetail`).d('物料')}
              </div>
              <div className={styles['section-item-supplier-price-right']} />
            </div>
          </div>
          <div
            className={styles['section-item-content']}
            ref={containerRef}
            style={{ height: viewType === 'supplier' ? '620px' : '460px' }}
          >
            <div ref={wrapperRef}>
              {list.map((item) => (
                <SectionItem data={item.data} {...itemProps} />
              ))}
            </div>
          </div>
        </div>
      )}
      {dataList.length === 0 ? (
        <div className={styles['section-right-nochild']}>
          <NochildComp />
        </div>
      ) : !isSection ? (
        <div
          className={styles['section-right']}
          style={{
            maxWidth: dataList.length > 1 ? 'calc(100% - 260px)' : '100%',
          }}
        >
          {children}
        </div>
      ) : (
        <div
          className={styles['section-right']}
          style={{
            maxWidth: '100%',
            paddingRight: 0,
          }}
        >
          <SupplierList {...listProps} />
        </div>
      )}
    </div>
  );
};

export default observer(SectionListRender);
