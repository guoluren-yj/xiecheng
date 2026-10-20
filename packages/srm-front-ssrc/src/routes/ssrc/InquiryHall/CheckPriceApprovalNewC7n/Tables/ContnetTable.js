// 中标信息
import React, { useCallback, useState, useEffect, useContext } from 'react';
import { useDataSet, CheckBox, Spin } from 'choerodon-ui/pro';
import { Tabs, Divider } from 'choerodon-ui';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { useComputed } from 'mobx-react-lite';
import { Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import classnames from 'classnames';
import EmbedPage from '_components/EmbedPage';
import { INQUIRY } from '@/utils/globalVariable';
import { fetchSupplierData, fetchItemData } from '@/services/checkPriceOverviewServices';
import styles from './index.less';
import SectionListRender from './../components/ListPanel';
import ContentTitle from './../components/ContentTitle';
import ItemTable from './ItemTable';
import AttachmentForm from './AttachmentForm';
import { contentBasicDs } from './../store/storeDS';
import { StoreContext } from './../store/StoreProvider';

const { TabPane } = Tabs;

const ContnetTable = () => {
  const {
    commonDs: { supplierTableDs, itemTableDs, tableAttachmentDs, headerDs },
    isSection = false,
    customizeForm = () => {},
    customizeTable = () => {},
    headerInfo = {},
    rfxHeaderId = '',
    organizationId = '',
    customizeCommon = () => {},
    sourceKey = INQUIRY,
    doubleUnitFlag = false,
    bidFlag = false,
    templateInfo = {},
    remote,
    linktoPrNumDetail,
  } = useContext(StoreContext);
  const viewTypeHidden = useComputed(() => {
    return isSection || headerInfo.onlyAllowAllWinBids;
  }, [isSection, headerInfo]);

  const [viewType, setViewType] = useState('supplier');
  const [headerData, setHeaderData] = useState({});
  const [suggestedFlag, setFilterFlag] = useState(false);
  const [itemSuggestedFlag, setItemFilterFlag] = useState(false);
  const [queryLoading, setQueryLoading] = useState(true);
  let segData = [
    {
      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyName`).d('供应商'),
      key: 'supplier',
    },
    {
      name: intl.get(`ssrc.inquiryHall.model.inquiryHall.viewItemDetail`).d('物料'),
      key: 'item',
    },
  ];

  segData = remote
    ? remote.process('SSRC_CHECK_PRICE_APPROVAL_OVERVIEW_PROCESS_TOP_TABS', segData, {
        headerInfo,
        headerDs,
      })
    : segData;

  const basicDs = useDataSet(() => contentBasicDs(bidFlag), []);
  const itemBasicDs = useDataSet(() => contentBasicDs(bidFlag), []);

  useEffect(() => {
    supplierTableDs.setQueryParameter('rfxHeaderId', rfxHeaderId);
    itemTableDs.setQueryParameter('rfxHeaderId', rfxHeaderId);
    basicDs.setState('headerInfo', headerInfo);
    itemBasicDs.setState('headerInfo', headerInfo);
  }, [viewType, rfxHeaderId, headerInfo]);

  // cux event
  useEffect(() => {
    if (remote?.event) {
      remote.event.fireEvent('updateViewType', {
        headerInfo,
        updateViewType: (typeName) => {
          setViewType(typeName);
        },
      });
    }
  }, [headerInfo, headerDs]);

  const changeTab = useCallback(
    (key) => {
      if (viewType === key) {
        return;
      }
      setQueryLoading(true);
      setViewType(key);
    },
    [viewType]
  );

  const renderContentTitle = useCallback(() => {
    const titleParams = {
      viewType,
      customizeCommon,
      basicDs,
      itemBasicDs,
      headerInfo,
      sourceKey,
      remote,
    };
    return <ContentTitle {...titleParams} />;
  }, [viewType, headerInfo, remote]);

  const queryContent = useCallback(
    (id, currentViewType = 'supplier') => {
      setQueryLoading(true);
      // 头查询
      queryHeaderContent(id, currentViewType);
      // 表格查询
      if (currentViewType === 'supplier') {
        supplierTableDs.setQueryParameter('rfxLineSupplierId', id);
        supplierTableDs.query();
      } else {
        itemTableDs.setQueryParameter('rfxLineItemId', id);
        itemTableDs.query();
      }
    },
    [rfxHeaderId]
  );

  // 中间区域头查询
  const queryHeaderContent = useCallback(
    (sourceId = '', currentViewType = 'supplier') => {
      const params = {
        rfxHeaderId,
        [currentViewType === 'supplier' ? 'rfxLineSupplierId' : 'rfxLineItemId']: sourceId,
        customizeUnitCode:
          currentViewType === 'supplier'
            ? `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.SUPPLIER_AF_EXTRA,SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.TABLE_ATTACHMENT`
            : `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.ITEM_AF_EXTRA`,
        ...templateInfo,
      };
      const fetchHeaderContent = currentViewType === 'supplier' ? fetchSupplierData : fetchItemData;
      fetchHeaderContent(params).then((res) => {
        if (getResponse(res)) {
          tableAttachmentDs.loadData([res]);
          setHeaderData(res);
          basicDs.loadData([res]);
          itemBasicDs.loadData([res]);
          setQueryLoading(false);
        }
      });
    },
    [rfxHeaderId, templateInfo]
  );

  const renderContent = useCallback(() => {
    const tabelProps = {
      customizeTable,
      viewType,
      headerInfo,
      sourceKey,
      doubleUnitFlag,
      supplierTableDs,
      itemTableDs,
      linktoPrNumDetail,
    };
    return <ItemTable {...tabelProps} />;
  }, [viewType, doubleUnitFlag, headerInfo]);

  const renderAttachmentForm = useCallback(() => {
    const formProps = {
      customizeForm,
      sourceKey,
      tableAttachmentDs,
    };

    return <AttachmentForm {...formProps} />;
  }, [doubleUnitFlag, headerInfo]);

  const filterSupplierData = useCallback(
    (flag) => {
      setQueryLoading(true);
      setFilterFlag(flag);
    },
    [viewType]
  );

  const filterItemData = useCallback(
    (flag) => {
      setQueryLoading(true);
      setItemFilterFlag(flag);
    },
    [viewType]
  );

  const tabProps = {
    activeKey: viewType,
    type: 'second-level',
    onChange: changeTab,
    className: styles['content-table-tab'],
  };

  const sectionProps = {
    afterClick: queryContent,
    rfxHeaderId,
    organizationId,
    viewType,
    suggestedFlag,
    headerInfo,
    setQueryLoading,
    itemSuggestedFlag,
    isSection,
  };

  /**
   * @returns React.Element
   */
  const renderCheckbox = useCallback(() => {
    return <CheckBox checked={suggestedFlag} onChange={filterSupplierData} />;
  }, [suggestedFlag]);

  /**
   * @returns React.Element
   */
  const renderItemCheckbox = useCallback(() => {
    return <CheckBox checked={itemSuggestedFlag} onChange={filterItemData} />;
  }, [itemSuggestedFlag]);

  // 展示风险提示
  const renderRiskRelation = useCallback(() => {
    if (headerInfo) {
      const { rfxNum, secondarySourceCategory } = headerInfo || {};
      return (
        <EmbedPage
          href="/public/sdat/relation-troubleshoot"
          location={{
            search: `?businessNumber=${rfxNum}&businessType=${secondarySourceCategory}&organizationId=${organizationId}`,
          }}
        />
      );
    }
    return null;
  }, [headerInfo]);

  let MainContentNode = (
    <SectionListRender {...sectionProps}>
      <div className={styles['content-table-title']}>
        {viewType === 'supplier' ? headerData?.supplierCompanyName : headerData?.itemName}
      </div>
      {renderContentTitle()}
      <div className={styles['content-table-title-second']}>
        <div className={styles['content-table-title-line']} />
        {viewType === 'supplier'
          ? intl.get('ssrc.inquiryHall.view.title.itemDetail').d('物料详情')
          : intl.get('ssrc.inquiryHall.view.title.supplierDetail').d('中标供应商详情')}
      </div>
      {renderContent()}
      {viewType === 'supplier' && renderAttachmentForm()}
    </SectionListRender>
  );

  MainContentNode = remote
    ? remote.process(
        'SSRC_CHECK_PRICE_APPROVAL_OVERVIEW_PROCESS_MAINCONTENT_RENDER',
        MainContentNode,
        {
          headerInfo,
          headerDs,
          viewType,
          rfxHeaderId,
          bidFlag,
          setQueryLoading,
          setViewType,
          renderContentTitle,
        }
      )
    : MainContentNode;

  return (
    <div
      className={classnames(styles['content-table-content'], {
        [styles['content-table-content-section']]: isSection,
      })}
    >
      <Spin spinning={queryLoading}>
        <Content
          className={classnames(styles['content-table-header-content'], {
            [styles['content-table-header-content-section']]: isSection,
          })}
        >
          <div className={styles['content-table-title-content']}>
            <div className={styles['content-table-title']}>
              {sourceKey === INQUIRY
                ? intl.get('ssrc.inquiryHall.view.title.quoteDetailInfo').d('报价明细信息')
                : intl.get('ssrc.inquiryHall.view.title.bidDetailInfo').d('投标明细信息')}
            </div>

            <div className={styles['content-table-title-box']}>
              {viewType === 'supplier' ? (
                <div>
                  {renderCheckbox()}&nbsp;&nbsp;
                  {intl.get('ssrc.inquiryHall.view.title.viewDisSupplier').d('查看未选用供应商')}
                </div>
              ) : (
                ''
              )}
              {viewType === 'item' ? (
                <div>
                  {renderItemCheckbox()}&nbsp;&nbsp;
                  {intl
                    .get('ssrc.inquiryHall.view.title.viewDisItemOfSupplier')
                    .d('查看未选用供应商的物料')}
                </div>
              ) : (
                ''
              )}

              {!viewTypeHidden && <Divider type="vertical" />}
              {!viewTypeHidden && (
                <Tabs {...tabProps}>
                  {segData.map((item) => (
                    <TabPane tab={item.name} key={item.key} />
                  ))}
                </Tabs>
              )}
            </div>
          </div>
          {viewType === 'supplier' ? renderRiskRelation() : null}
        </Content>
        <Content className={styles['content-table-body-content']}>{MainContentNode}</Content>
      </Spin>
    </div>
  );
};

export default observer(ContnetTable);
