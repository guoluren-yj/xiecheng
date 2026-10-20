import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { DataSet, Button, Icon, Modal } from 'choerodon-ui/pro';
import { SRM_SPUC } from '_utils/config';
import { isEmpty, isNil, debounce } from 'lodash';
import { stringify } from 'querystring';
import notification from 'utils/notification';
import { Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'utils/utils';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import intl from 'utils/intl';
import CommonImport from 'hzero-front/lib/components/Import';
import DynamicButtons from '_components/DynamicButtons';
import SubmitList from './List/Submit';
import AffirmList from './List/Affirm';
import AllList from './List/All';
import DetailAllList from './List/DetailAll';
import DetailAffirm from './List/DetailAffirm';
import styles from './index.less';

import { CreateModal, bomDataSet } from './components/CreateModal';
import {
  delInventoryLine,
  submitInventoryListAll,
  handleCreateInventory,
  approveInventoryListAll,
  cancelInventoryListAll,
  queryInventoryTotal,
} from '@/services/PurchaseCollaborativeWorkbenchService';
import { handleCommonFunc } from './utils';
import { c7nModal } from './hooks';

const { TabPane } = Tabs;
const { TabGroup } = Tabs;
const tenantId = getCurrentOrganizationId();

export function Index(props) {
  const {
    remote,
    customizeTable,
    history,
    cacheTab,
    customizeBtnGroup,
    customizeTabPane,
    sureSupplier,
    submitDs,
    affirmDs,
    allDs,
    detailallDs,
    detailAffirmDs,
  } = props;
  const { cuxPageSizeOptions, cuxConfirmLineBtnsChange } = remote?.props?.process || {};
  const [activeKey, setActiveKey] = useState(
    cacheTab.get('key') || (sureSupplier ? 'affirm' : 'submit')
  );
  const bomDs = useMemo(() => new DataSet(bomDataSet(sureSupplier)), []);
  const [loading, setLoading] = useState(false);
  const [tabTotal, setTabTotal] = useState({
    oneTotal: 0,
    twoTotal: 0,
    threeTotal: 0,
    fourTotal: 0,
    fiveTotal: 0,
  });

  const getCurrentDs = {
    submit: submitDs,
    affirm: affirmDs,
    detailAffirm: detailAffirmDs,
    all: allDs,
    detailAll: detailallDs,
  };
  const currentDs = getCurrentDs[activeKey];
  const { state: { _back } = {} } = history?.location;

  useEffect(() => {
    // setLoading(true);
    if (_back === -1) {
      currentDs.query(currentDs.currentPage);
    } else {
      currentDs.query();
    }
    queryInventoryTotal(sureSupplier)
      .then((res = {}) => {
        setTabTotal({
          oneTotal: res?.waitQuantity || '0',
          twoTotal: res?.confirmQuantity || '0',
          threeTotal: res?.completeQuantity || '0',
          fourTotal: res.confirmLineQuantity || '0',
          fiveTotal: res.completeLineQuantity || '0',
        });
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 新建
  const handleCreate = debounce(() => {
    c7nModal({
      style: { width: 742 },
      onOk: async () => {
        if (bomDs?.selected.length === 0) {
          notification.warning({
            message: intl
              .get(`sinv.inventoryBench.view.title.createDetailStatus`)
              .d('请勾选一条数据新建'),
          });
          return false;
        }
        setLoading(true);
        const params = bomDs?.selected.map((i) => i.toJSONData())?.[0];
        const res =
          (await handleCreateInventory({ ...params, tenantId, sureSupplier, activeKey })) || {};
        if (getResponse(res)) {
          notification.success();
          if (isNil(params.strategyHeaderId)) return false;
          history.push({
            pathname: sureSupplier
              ? `/sinv/supplier-collaborative-workbench/${res.invHeaderId}`
              : `/sinv/purchaser-collaborative-workbench/${res.invHeaderId}`,
            search: stringify({
              processFactory: params.processFactory,
              activeKey: 'submit',
              strategyName: res.strategyName,
            }),
          });
          setLoading(false);
          return true;
        } else {
          setLoading(false);
        }
      },
      title: intl.get(`sinv.inventoryBench.view.title.detailStatus`).d('手工新建'),
      children: <CreateModal bomDs={bomDs} />,
    });
  }, 100);

  // 提交
  const handleSubmit = debounce(() => {
    setLoading(true);
    const params = currentDs.selected
      .map((i) => i.toJSONData())
      .map((i) => ({ ...i, approveFlag: 1, sureSupplier }));
    handleCommonFunc(submitInventoryListAll, { params, activeKey }, currentDs, () =>
      setLoading(false)
    );
  }, 400);

  // 删除
  const handleDelete = debounce(() => {
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('sinv.inventoryBench.model.view.help').d('提示'),
      children: (
        <div>
          <p>{intl.get('sinv.inventoryBench.model.view.orderDelete').d(`确认删除选中行？`)}</p>
        </div>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        setLoading(true);
        const param = currentDs.selected.map((i) => i.toJSONData());
        handleCommonFunc(delInventoryLine, { param, activeKey }, currentDs, () =>
          setLoading(false)
        );
      },
    });
  }, 400);

  // 确认
  const handleAffirm = debounce(async () => {
    setLoading(true);
    const params = currentDs.selected
      .map((i) => i.toJSONData())
      .map((i) => ({ ...i, approveFlag: 1, sureSupplier }));
    if (typeof cuxConfirmLineBtnsChange === 'function' && sureSupplier) {
      const param = {
        isLine: true,
        lineDs: currentDs,
        body: params,
      };
      await cuxConfirmLineBtnsChange({
        params: param,
        data: params,
        callback: () =>
          handleCommonFunc(approveInventoryListAll, { params, activeKey }, currentDs, () =>
            setLoading(false)
          ),
        setLoading: () => setLoading(false),
      });
      return;
    }
    handleCommonFunc(approveInventoryListAll, { params, activeKey }, currentDs, () =>
      setLoading(false)
    );
  }, 400);

  // 拒绝
  const handleRefuse = debounce(() => {
    setLoading(true);
    const params = currentDs.selected
      .map((i) => i.toJSONData())
      .map((i) => ({ ...i, approveFlag: 0, sureSupplier }));
    handleCommonFunc(approveInventoryListAll, { params, activeKey }, currentDs, () =>
      setLoading(false)
    );
  }, 400);

  // 切换tab
  const handleChangeKey = useCallback((key) => {
    setActiveKey(key);
    cacheTab.set('key', key);
    switch (key) {
      case 'submit':
        if (submitDs.getState('queryStatus') === 'ready') {
          submitDs.query(submitDs.currentPage);
        }
        break;
      case 'affirm':
        if (affirmDs.getState('queryStatus') === 'ready') {
          affirmDs.query(affirmDs.currentPage);
        }
        break;
      case 'all':
        if (allDs.getState('queryStatus') === 'ready') {
          allDs.query(allDs.currentPage);
        }
        break;
      case 'detailAffirm':
        if (detailAffirmDs.getState('queryStatus') === 'ready') {
          detailAffirmDs.query(detailAffirmDs.currentPage);
        }
        break;
      case 'detailAll':
        if (detailallDs.getState('queryStatus') === 'ready') {
          detailallDs.query(detailallDs.currentPage);
        }
        break;
      default:
        break;
    }
  }, []);

  const getPrintProData = (dataSet) => {
    if (isEmpty(dataSet?.selected)) {
      return [];
    }
    const params = currentDs.selected.map((i) => i.toJSONData());
    return params;
  };

  // 取消
  const handleCancel = () => {
    setLoading(true);
    const params = currentDs.selected
      .map((i) => i.toJSONData())
      .map((i) => ({ ...i, approveFlag: 1, sureSupplier }));
    handleCommonFunc(cancelInventoryListAll, { params, activeKey }, currentDs, () =>
      setLoading(false)
    );
  };

  const HeaderBtns = observer(({ dataSet }) => {
    const listQueryCondition = filterNullValueObject({
      ...dataSet?.queryParameter.params,
      ...dataSet?.queryParameter, // 初始参数
      ...dataSet?.queryDataSet?.toData()[0], // 个性化条件参数
    });
    const invHeaderIdList = dataSet?.selected
      .map((item) => item.toJSONData())
      .map((n) => n?.invHeaderId);
    const invLineIdList = dataSet?.selected
      .map((item) => item.toJSONData())
      .map((n) => n?.invLineId);
    const buttons = {
      submit: [
        {
          name: 'submit',
          group: true,
          child: (name) => (
            <Button
              style={{ marginLeft: 8 }}
              onClick={handleSubmit}
              loading={loading}
              disabled={isEmpty(dataSet?.selected)}
              icon="check"
              color="primary"
            >
              {name || intl.get('hzero.common.button.submit').d('提交')}
              <Icon type="question-circle-o" />
            </Button>
          ),
        },
        {
          name: 'create',
          group: true,
          child: (name) => (
            <Button icon="add" onClick={handleCreate} loading={loading} funcType="flat">
              {name || intl.get('hzero.common.button.create').d('新建')}
            </Button>
          ),
        },
        {
          name: 'delete',
          group: true,
          child: (name) => (
            <Button
              icon="delete_sweep"
              onClick={handleDelete}
              loading={loading}
              disabled={isEmpty(dataSet?.selected)}
              funcType="flat"
            >
              {name || intl.get('hzero.common.button.batchdelete').d('批量删除')}
            </Button>
          ),
        },
        {
          name: 'newExport',
          group: true,
          child: (name) => (
            <ExcelExportPro
              allBody
              method="POST"
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                funcType: 'flat',
                loading,
              }}
              buttonText={
                isEmpty(dataSet?.selected)
                  ? name || intl.get(`sinv.inventoryBench.view.button.newExport`).d('新版导出')
                  : name ||
                    intl.get(`sinv.inventoryBench.view.button.newCheckExport`).d('新版勾选导出')
              }
              requestUrl={
                sureSupplier
                  ? `${SRM_SPUC}/v1/${tenantId}/stockout/inv/header/export/supplier-waiting`
                  : `${SRM_SPUC}/v1/${tenantId}/stockout/inv/header/export/purchase-waiting`
              }
              queryParams={isEmpty(dataSet?.selected) ? listQueryCondition : { invHeaderIdList }}
              templateCode={
                sureSupplier
                  ? 'SINV_OUTSOURCE_INV_HEADER_SUPPLIER_WAITING'
                  : 'SINV_OUTSOURCE_INV_HEADER_PURCHASE_WAITING'
              }
            />
          ),
        },
      ],
      affirm: [
        {
          name: 'affirm',
          group: true,
          child: (name) => (
            <Button
              icon="done"
              onClick={handleAffirm}
              loading={loading}
              disabled={isEmpty(dataSet?.selected)}
              color="primary"
            >
              {name || intl.get('hzero.common.button.affirm').d('确认')}
            </Button>
          ),
        },
        {
          name: 'refuse',
          group: true,
          child: (name) => (
            <Button
              icon="close"
              onClick={handleRefuse}
              loading={loading}
              disabled={isEmpty(dataSet?.selected)}
              funcType="flat"
            >
              {name || intl.get('hzero.common.button.refuse').d('拒绝')}
            </Button>
          ),
        },
        !sureSupplier && {
          name: 'create',
          group: true,
          child: (name) => (
            <>
              <Button icon="add" onClick={handleCreate} loading={loading} funcType="flat">
                {name || intl.get('hzero.common.button.create').d('新建')}
              </Button>
            </>
          ),
        },
        {
          name: 'newExport',
          group: true,
          child: (name) => (
            <ExcelExportPro
              allBody
              method="POST"
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                funcType: 'flat',
                loading,
              }}
              buttonText={
                isEmpty(dataSet?.selected)
                  ? name || intl.get(`sinv.inventoryBench.view.button.newExport`).d('新版导出')
                  : name ||
                    intl.get(`sinv.inventoryBench.view.button.newCheckExport`).d('新版勾选导出')
              }
              requestUrl={
                sureSupplier
                  ? `${SRM_SPUC}/v1/${tenantId}/stockout/inv/header/export/supplier-confirm`
                  : `${SRM_SPUC}/v1/${tenantId}/stockout/inv/header/export/purchase-confirm`
              }
              queryParams={isEmpty(dataSet?.selected) ? listQueryCondition : { invHeaderIdList }}
              templateCode={
                sureSupplier
                  ? 'SINV_OUTSOURCE_INV_HEADER_SUPPLIER_CONFIRM'
                  : 'SINV_OUTSOURCE_INV_HEADER_PURCHASE_CONFIRM'
              }
            />
          ),
        },
      ],
      all: [
        !sureSupplier && {
          name: 'create',
          group: true,
          child: (name) => (
            <Button icon="add" loading={loading} color="primary" onClick={handleCreate}>
              {name || intl.get('hzero.common.button.create').d('新建')}
            </Button>
          ),
        },
        {
          name: 'print',
          child: intl.get('hzero.common.button.print').d('打印'),
          btnComp: PrintProButton,
          btnProps: {
            loading,
            buttonProps: {
              loading,
              icon: 'print',
              type: 'c7n-pro',
              funcType: 'flat',
              disabled: isEmpty(dataSet?.selected),
            },
            requestUrl: `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/stockout/inv/header/export/batch-print-token`,
            method: 'POST',
            data: getPrintProData(dataSet),
            buttonText: intl.get('hzero.common.button.print').d('打印'),
          },
        },

        {
          name: 'newExport',
          group: true,
          child: (name) => (
            <ExcelExportPro
              allBody
              method="POST"
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                funcType: 'flat',
                loading,
              }}
              buttonText={
                isEmpty(dataSet?.selected)
                  ? name || intl.get(`sinv.inventoryBench.view.button.newExport`).d('新版导出')
                  : name ||
                    intl.get(`sinv.inventoryBench.view.button.newCheckExport`).d('新版勾选导出')
              }
              requestUrl={
                sureSupplier
                  ? `${SRM_SPUC}/v1/${tenantId}/stockout/inv/header/export/supplier-all`
                  : `${SRM_SPUC}/v1/${tenantId}/stockout/inv/header/export/purchase-all`
              }
              queryParams={isEmpty(dataSet?.selected) ? listQueryCondition : { invHeaderIdList }}
              templateCode={
                sureSupplier
                  ? 'SINV_OUTSOURCE_INV_HEADER_SUPPLIER_ALL'
                  : 'SINV_OUTSOURCE_INV_HEADER_PURCHASE_ALL'
              }
            />
          ),
        },
        !sureSupplier && {
          name: 'cancel',
          group: true,
          child: (name) => (
            <Button
              icon="cancel"
              onClick={handleCancel}
              disabled={isEmpty(dataSet?.selected)}
              funcType="flat"
              loading={loading}
            >
              {name || intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          ),
        },
      ],
      detailAffirm: [
        {
          name: 'newExport',
          btnComp: ExcelExportPro,
          child: (name) =>
            isEmpty(dataSet?.selected)
              ? name || intl.get(`sinv.inventoryBench.view.button.newExport`).d('新版导出')
              : name ||
                intl.get(`sinv.inventoryBench.view.button.newCheckExport`).d('新版勾选导出'),
          childFor: 'buttonText',
          btnProps: {
            allBody: true,
            method: 'POST',
            templateCode: sureSupplier
              ? 'SINV_OUTSOURCE_INV_HEADER_SUPPLIER_LINE_CONFIRM'
              : 'SINV_OUTSOURCE_INV_HEADER_PURCHASE_LINE_CONFIRM',
            queryParams: isEmpty(dataSet?.selected) ? listQueryCondition : { invLineIdList },
            requestUrl: sureSupplier
              ? `${SRM_SPUC}/v1/${tenantId}/stockout/inv/header/export/line/supplier-confirm`
              : `${SRM_SPUC}/v1/${tenantId}/stockout/inv/header/export/line/purchase-confirm`,
            buttonText: isEmpty(dataSet?.selected)
              ? intl.get(`sinv.inventoryBench.view.button.newExport`).d('新版导出')
              : intl.get(`sinv.inventoryBench.view.button.newCheckExport`).d('新版勾选导出'),
            otherButtonProps: {
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
            },
          },
        },
        {
          name: 'commonImport',
          child: (name) =>
            name || intl.get(`slod.deliveryWorkbench.model.common.newImport`).d('新版导入'),
          childFor: 'buttonText',
          btnComp: CommonImport,
          btnProps: {
            buttonProps: {
              icon: 'archive',
              type: 'c7n-pro',
              funcType: 'flat',
              loading,
            },
            refreshButton: true,
            prefixPatch: SRM_SPUC,
            args: {
              campCode: sureSupplier ? 'SUPPLIER' : 'PURCHASER',
              tenantId,
            },
            buttonText: intl.get(`slod.deliveryWorkbench.model.common.newImport`).d('新版导入'),
            businessObjectTemplateCode: sureSupplier
              ? 'SRM_C_SINV_OUTSOURCE_INV_LINE_SUPPLIER_IMPORT'
              : 'SRM_C_SINV_OUTSOURCE_INV_LINE_IMPORT',
            successCallBack: () => dataSet.query(),
          },
        },
      ],
      detailAll: [
        {
          name: 'newExport',
          group: true,
          child: (name) => (
            <ExcelExportPro
              allBody
              method="POST"
              otherButtonProps={{
                icon: 'unarchive',
                type: 'c7n-pro',
                funcType: 'flat',
                loading,
              }}
              buttonText={
                isEmpty(dataSet?.selected)
                  ? name || intl.get(`sinv.inventoryBench.view.button.newExport`).d('新版导出')
                  : name ||
                    intl.get(`sinv.inventoryBench.view.button.newCheckExport`).d('新版勾选导出')
              }
              requestUrl={
                sureSupplier
                  ? `${SRM_SPUC}/v1/${tenantId}/stockout/inv/header/export/line/supplier-all`
                  : `${SRM_SPUC}/v1/${tenantId}/stockout/inv/header/export/line/purchase-all`
              }
              queryParams={isEmpty(dataSet?.selected) ? listQueryCondition : { invLineIdList }}
              templateCode={
                sureSupplier
                  ? 'SINV_OUTSOURCE_INV_HEADER_SUPPLIER_LINE_ALL'
                  : 'SINV_OUTSOURCE_INV_HEADER_PURCHASE_LINE_ALL'
              }
            />
          ),
        },
      ],
    };

    if (activeKey === 'all') {
      return customizeBtnGroup(
        {
          code: sureSupplier
            ? 'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.ALL.LIST.BTNS'
            : `SINV.PURCHASER.COLLABORATIVE.WORKBENCH.ALL.LIST.BTNS`,
          pro: true,
        },
        <DynamicButtons buttons={buttons.all} />
      );
    }
    if (activeKey === 'affirm') {
      return customizeBtnGroup(
        {
          code: sureSupplier
            ? 'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.AFFIRM.LIST.BTNS'
            : `SINV.PURCHASER.COLLABORATIVE.WORKBENCH.AFFIRM.LIST.BTNS`,
          pro: true,
        },
        <DynamicButtons buttons={buttons.affirm} />
      );
    }
    if (activeKey === 'detailAffirm') {
      return customizeBtnGroup(
        {
          code: sureSupplier
            ? 'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.LIST.BTNS'
            : 'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.LIST.BTNS',
          pro: true,
        },
        <DynamicButtons buttons={buttons.detailAffirm} />
      );
    }

    if (activeKey === 'detailAll') {
      return customizeBtnGroup(
        {
          code: sureSupplier
            ? 'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.DETAIL.ALL.LIST.BTNS'
            : `SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.ALL.LIST.BTNS`,
          pro: true,
        },
        <DynamicButtons buttons={buttons.detailAll} />
      );
    }

    return customizeBtnGroup(
      {
        code: sureSupplier
          ? 'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.LIST.BTNS'
          : `SINV.PURCHASER.COLLABORATIVE.WORKBENCH.WAIT.LIST.BTNS`,
        pro: true,
      },
      <DynamicButtons buttons={buttons.submit} />
    );
  });

  const allProps = {
    affirmDs,
    submitDs,
    allDs,
    detailallDs,
    detailAffirmDs,
    customizeTable,
    history,
    activeKey,
    sureSupplier,
    location: history.location,
    cuxPageSizeOptions,
  };

  const changeTab = (key) => {
    setActiveKey(key || activeKey || (sureSupplier ? 'affirm' : 'submit'));
  };

  return (
    <div className={styles.myWrap}>
      <Header
        title={
          sureSupplier
            ? intl.get(`sinv.inventoryBench.model.view.supplierWorkbench`).d('销售方委外协同工作台')
            : intl.get(`sinv.inventoryBench.model.view.purchaseWorkbench`).d('采购方委外协同工作台')
        }
      >
        <HeaderBtns dataSet={currentDs} />
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: sureSupplier
              ? 'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.TAB'
              : 'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.TAB',
            cascade: true,
            custDefaultActive: (key) => {
              changeTab(key);
            },
          },
          <Tabs onChange={(key) => handleChangeKey(key)} activeKey={activeKey}>
            <TabGroup tab={intl.get(`sinv.inventoryBench.view.tab.whole`).d('整单')} key="whole">
              <TabPane
                tab={intl.get(`sinv.inventoryBench.view.tab.list`).d('待提交')}
                key="submit"
                count={() => tabTotal.oneTotal || 0}
              >
                <SubmitList {...allProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`sinv.inventoryBench.view.tab.detail`).d('待确认')}
                key="affirm"
                count={() => tabTotal.twoTotal || 0}
              >
                <AffirmList {...allProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`sinv.inventoryBench.view.tab.all`).d('全部')}
                key="all"
                count={() => tabTotal.threeTotal || 0}
              >
                <AllList {...allProps} />
              </TabPane>
            </TabGroup>
            <TabGroup tab={intl.get(`sinv.inventoryBench.view.tab.Detail`).d('明细')} key="detail">
              <TabPane
                tab={intl.get(`sinv.inventoryBench.view.tab.detail`).d('待确认')}
                key="detailAffirm"
                count={() => tabTotal.fourTotal || 0}
              >
                <DetailAffirm {...allProps} />
              </TabPane>
              <TabPane
                tab={intl.get(`sinv.inventoryBench.view.tab.all`).d('全部')}
                key="detailAll"
                count={() => tabTotal.fiveTotal || 0}
              >
                <DetailAllList {...allProps} />
              </TabPane>
            </TabGroup>
          </Tabs>
        )}
      </Content>
    </div>
  );
}
