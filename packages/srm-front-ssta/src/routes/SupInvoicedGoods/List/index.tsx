/*
 * @Description: 供应商开票商品信息-列表页入口
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2023-03-22 09:56:26
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { Fragment, useContext, useCallback, useMemo } from 'react';
import { Tabs, Modal, Icon } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import DynamicButtons from '_components/DynamicButtons';

import intl from 'utils/intl';
import Import from 'components/Import';
import { SRM_SSTA } from '_utils/config';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId } from 'utils/utils';

import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import { ActiveKey, GridCustCode, ListTabsCustCode, SearchCustCode, ListBtnsCustCode } from '../utils/type';
import InfoTable from './components/InfoTable';
import MappingTable from './components/MappingTable';
import commonStyles from '../../common.less';
import InitGoodsInfo from './components/InitGoodsInfo';
import ManaulGoodsMapping from './components/ManualGoodsMapping';
import DynamicBtn from '../../../components/DynamicBtn';
import ManaulGoodsInfo from './components/ManualGoodsInfo';

const { TabPane } = Tabs;
const tenantId = getCurrentOrganizationId();

// 列表页导入组件模板编码
const ListImportTempCode: Record<ActiveKey, string> = {
  [ActiveKey.Info]: `SDIM_COMMODITY_PUR_IMPORT`,
  [ActiveKey.Mapping]: `SDIM_COMMODITY_MAPPING_PUR_IMPORT`,
};
// 列表页导出组件模板编码
const ListExportTempCode: Record<ActiveKey, string> = {
  [ActiveKey.Info]: `SDIM_COMMODITY_PUR_EXPORT`,
  [ActiveKey.Mapping]: `SDIM_COMMODITY_MAPPING_PUR_EXPORT`,
};
// 列表页导出组件requestUrl
const ListExportUrl: Record<ActiveKey, string> = {
  [ActiveKey.Info]: `${SRM_SSTA}/v1/${tenantId}/direct-commoditys/purchaser-excel-export`,
  [ActiveKey.Mapping]: `${SRM_SSTA}/v1/${tenantId}/direct-commodity-mappings/purchaser-excel-export`,
};

const List = observer(() => {

  const {
    activeKey,
    infoTableDs,
    permissionMap,
    mappingTableDs,
    currentTableDs,
    handleTabChange,
    customizeTabPane,
    getTotalCount,
    infoSearchRef,
    customizeBtnGroup,
  } = useContext<StoreValueType>(Store);

  const { selected } = currentTableDs;
  const loading = currentTableDs.status !== 'ready';

  const exportParams = useMemo(() => {
    const customizeUnitCode = [GridCustCode[activeKey], SearchCustCode[activeKey]].join();
    if (isEmpty(selected)) {
      const queryData = currentTableDs.queryDataSet?.current?.toData() || {};
      return { ...queryData, customizeUnitCode };
    } else {
      const primaryKey = activeKey === ActiveKey.Info ? 'commodityId' : 'mappingId';
      const idListName = activeKey === ActiveKey.Info ? 'commodityIdList' : 'mappingIdList';
      const idListValue = selected.map(item => item.get(primaryKey)).join();
      return ({ [idListName]: idListValue, customizeUnitCode });
    }
  }, [activeKey, selected, currentTableDs]);

  const onOk = useCallback(() => {
    currentTableDs.query();
    getTotalCount();

  }, [currentTableDs, getTotalCount]);

  // 初始化商品信息
  const handleInitGoodsInfo = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-small-modal'],
      title: intl.get('ssta.goodsInfo.view.button.initGoodsInfo').d('初始化商品信息'),
      children: <InitGoodsInfo onOk={onOk} infoSearchRef={infoSearchRef} />,
      okText: intl.get('ssta.goodsInfo.view.button.initGoodsInfo').d('初始化商品信息'),
    });
  }, [onOk, infoSearchRef]);


  // 新建商品映射
  const handleCreateGoodsMapping = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-small-modal'],
      title: intl.get(`ssta.common.button.createManually`).d('手工新建'),
      children: <ManaulGoodsMapping action="create" onOk={onOk} />,
    });
  }, [onOk]);

  // 新建商品信息
  const handleCreateGoodsInfo = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      key: Modal.key(),
      className: commonStyles['ssta-small-modal'],
      title: intl.get(`ssta.common.button.createManually`).d('手工新建'),
      children: <ManaulGoodsInfo action="create" onOk={onOk} />,
    });
  }, [onOk]);

  const allBtns: any = useMemo(() => {
    const btns = [
      activeKey === ActiveKey.Info && {
        name: 'initGoodRelate',
        group: true,
        child: (...customChildArgs) => (
          <DynamicBtn
            icon="add"
            loading={loading}
            customChildArgs={customChildArgs}
            extra={<Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />}
            text={intl.get('ssta.goodsInfo.view.button.initGoodRelate').d('录入商品信息')}
            color={ButtonColor.primary}
          />
        ),
        children: [
          {
            name: 'infoAdd',
            child: intl.get(`ssta.common.button.createManually`).d('手工新建'),
            btnProps: {
              loading,
              icon: '',
              funcType: 'flat',
              onClick: handleCreateGoodsInfo,
            },
          },
          {
            name: 'initGoodsInfo',
            child: intl.get('ssta.goodsInfo.view.button.initGoodsInfo').d('初始化商品信息'),
            btnProps: {
              loading,
              icon: '',
              funcType: 'flat',
              onClick: handleInitGoodsInfo,
            },
          },
          {
            name: 'goodsInfoImport',
            btnComp: Import,
            btnProps: {
              businessObjectTemplateCode: ListImportTempCode[activeKey],
              prefixPatch: '/ssta',
              buttonText: intl.get('hzero.common.button.addExcel').d('Excel导入'),
              successCallBack: onOk,
              args: { tenantId, templateCode: ListImportTempCode[activeKey] },
              buttonProps: {
                type: 'c7n-pro',
                icon: '',
                funcType: 'flat',
                loading,
                style: {
                  width: '100%',
                  margin: '0 0',
                  display: 'block',
                  borderRadius: 0,
                  height: '0.4rem',
                  lineHeight: '0.4rem',
                  padding: '0 0.16rem',
                  textAlign: 'left',
                },
              },
            },
          },
        ],
      },
      activeKey === ActiveKey.Mapping && {
        name: 'updateMappingRelate',
        group: true,
        child: (...customChildArgs) => (
          <DynamicBtn
            icon="add"
            loading={loading}
            customChildArgs={customChildArgs}
            extra={<Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />}
            text={intl.get('ssta.goodsInfo.view.button.updateMappingRelate').d('维护商品映射关系')}
            color={ButtonColor.primary}
          />
        ),
        children: [
          {
            name: 'mappingAdd',
            child: intl.get(`ssta.common.button.createManually`).d('手工新建'),
            btnProps: {
              loading,
              icon: '',
              funcType: 'flat',
              onClick: handleCreateGoodsMapping,
            },
          },
          {
            name: 'mappingInfoImport',
            btnComp: Import,
            btnProps: {
              businessObjectTemplateCode: ListImportTempCode[activeKey],
              prefixPatch: '/ssta',
              buttonText: intl.get('hzero.common.button.addExcel').d('Excel导入'),
              successCallBack: onOk,
              args: { tenantId, templateCode: ListImportTempCode[activeKey] },
              buttonProps: {
                type: 'c7n-pro',
                icon: '',
                funcType: 'flat',
                loading,
                style: {
                  width: '100%',
                  margin: '0 0',
                  display: 'block',
                  borderRadius: 0,
                  height: '0.4rem',
                  lineHeight: '0.4rem',
                  padding: '0 0.16rem',
                  textAlign: 'left',
                },
              },
            },
          },
        ],
      },
      {
        name: 'export',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: isEmpty(selected)
        ? intl.get(`ssta.common.button.export`).d('导出')
        : intl.get(`ssta.common.button.selectedExport`).d('勾选导出'),
        btnProps: {
          templateCode: ListExportTempCode[activeKey],
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          requestUrl: ListExportUrl[activeKey],
          queryParams: exportParams,
        },
      },
    ];
    return btns;
  }, [loading, handleInitGoodsInfo, onOk, selected, exportParams, activeKey, handleCreateGoodsMapping, tenantId, handleCreateGoodsInfo]);

  return (
    <Fragment>
      <Header title={intl.get('ssta.goodsInfo.view.title.supInvedGoodsInfo').d('供应商开票商品信息')}>
        {customizeBtnGroup(
          {
            code: ListBtnsCustCode,
            pro: true,
          },
          <DynamicButtons
            maxNum={5}
            defaultBtnType="c7n-pro"
            buttons={allBtns}
          />
        )}
      </Header>
      <Content>
        {customizeTabPane(
          { code: ListTabsCustCode },
          <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
            {permissionMap?.get('tabInfo') && (
              <TabPane
                key={ActiveKey.Info}
                tab={intl.get('ssta.goodsInfo.view.title.supTaxGoodsInfo').d('供应商税收商品信息')}
                count={infoTableDs.getState('totalCount')}
              >
                <InfoTable />
              </TabPane>
            )}
            {permissionMap?.get('tabMapping') && (
              <TabPane
                key={ActiveKey.Mapping}
                tab={intl.get('ssta.goodsInfo.view.title.taxGoodsMapping').d('税收商品映射')}
                count={mappingTableDs.getState('totalCount')}
              >
                <MappingTable />
              </TabPane>
            )}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
});

const SupInvoicedGoodsList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default SupInvoicedGoodsList;
