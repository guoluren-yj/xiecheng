/* eslint-disable no-unused-expressions */
import React, { createContext, useEffect, useCallback, useState } from 'react';
import { useDataSet, Button, Modal } from 'choerodon-ui/pro';
import { compose, debounce } from 'lodash';
import notification from 'utils/notification';
import qs from 'querystring';
import cuxRemote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from 'hzero-front/lib/components/Import';
import { Header } from 'components/Page';
import { SRM_SPUC } from '_utils/config';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  delInventoryLine,
  submitInventoryList,
  handleSaveDetail,
  approveInventoryList,
  handleRetryInventory,
  getCuszTemplate,
  cancelInventoryList,
} from '@/services/PurchaseCollaborativeWorkbenchService';
import SrmOperationRecord from '_components/SrmOperationRecord';
import AttachmentList from './Attachment';
import HeaderInfo from './HeaderInfo';
import baseInfoDataSet from './store/baseInfoDs';
import attachmentDataSet from './store/attachmentDs';
import HeaderDataSet from './store/headerDs';
import { useSetState } from '@/routes/Hooks';
import { getUnitCode } from '../utils';
import styles from '../index.less';
import BaseInfo from './BaseInfo';

export const Store = createContext();

const Index = (props) => {
  const {
    remote,
    match: { params = {} },
    history,
  } = props;

  const { cuxconfirmBtnsChange } = remote?.props?.process || {};
  const { invHeaderId } = params; // activeKey submit新建明细  affirm确认明细  all全部明细  // processFactory 调拨单0 盘点1 普通2
  const { processFactory = '0', activeKey = 'submit', strategyName = '' } = qs.parse(
    props?.location?.search.substr(1)
  );
  const { customizeBtnGroup, customizeForm, customizeTable } = props;
  const [sourceCode, setSourceCode] = useState('SRM');
  const [invStatus, setInvStatus] = useState('');
  const sureSupplier = props?.location?.pathname.indexOf('supplier') !== -1;
  const [templateInfo, setTemplateInfo] = useState({ stageCode: null, pageCode: null });

  const HeaderDs = useDataSet(
    () =>
      remote
        ? remote.process(
            'SINV_SUPPLIERCOLLABORATIVEWORKBENCH_REMOTE_PROCESS_HEADER_DS',
            HeaderDataSet({ processFactory, baseInfoDs, sureSupplier, activeKey }),
            { invHeaderId }
          )
        : HeaderDataSet({ processFactory, baseInfoDs, sureSupplier, activeKey }),
    []
  );

  const baseInfoDs = useDataSet(
    () =>
      remote
        ? remote.process(
            'SINV_SUPPLIERCOLLABORATIVEWORKBENCH_REMOTE_PROCESS_BASE_INFO_DS',
            baseInfoDataSet({ processFactory, HeaderDs, activeKey, invHeaderId, sureSupplier }),
            { HeaderDs }
          )
        : baseInfoDataSet({ processFactory, HeaderDs, activeKey, invHeaderId, sureSupplier }),
    [HeaderDs]
  );
  const attachmentDs = useDataSet(() => attachmentDataSet(HeaderDs), [HeaderDs]);
  const [init, setInit] = useState(false);
  const [state, setState] = useSetState({
    loading: false,
    editFlag: true,
  });

  const queryCuszFunc = (templateInfoRes) => {
    const { templateCode, templateVersion, useTemplateCusz = false } = templateInfoRes;
    if (useTemplateCusz) {
      const newTemplateInfo = {
        cuszTplTemplateCode: templateCode,
        cuszTplVersion: templateVersion,
        cuszTplStageCode: getUnitCode(processFactory).cuszTplStageCode,
        cuszTplPageCode: getUnitCode(processFactory).cuszTplPageCode,
      };
      return props
        .queryTemplateConfig(
          {
            templateVersion,
            templateCode,
          },
          {
            stageCode: newTemplateInfo.cuszTplStageCode,
            pageCode: newTemplateInfo.cuszTplPageCode,
          }
        )
        .then(() => {
          setInit(false);
          const data = Object.assign(
            {},
            {
              ...newTemplateInfo,
              stageCode: newTemplateInfo.cuszTplStageCode,
              pageCode: newTemplateInfo.cuszTplPageCode,
            }
          );
          setTemplateInfo(data);
          handleQueryInfo(data);
        });
    } else {
      props.queryUnitConfig(undefined, undefined, getUnitCode(processFactory).units).then(() => {
        setTemplateInfo({});
        setInit(false);
        setState({ loading: false });
      });
      handleQueryInfo(null);
    }
  };

  // 初始化模版
  const initCustomizeTemplate = () => {
    setInit(true);
    setState({ loading: true });
    getCuszTemplate({
      templateCuszMethodCode: 'SPUC_SINV_INV_WORKBENCH_LINE_DETAIL',
      businessParam: { invHeaderId },
    }).then((templateInfoRes) => {
      if (getResponse(templateInfoRes)) {
        queryCuszFunc(templateInfoRes);
      } else {
        setInit(false);
        setState({ loading: false });
      }
    });
  };

  useEffect(() => {
    initCustomizeTemplate();
    HeaderDs.setState('lineDs', baseInfoDs);
  }, []);

  useEffect(() => {
    if (activeKey !== 'all') {
      setState({ editFlag: false });
    }
  }, [activeKey]);

  const HeaderTip = () => {
    const ep = [
      `${intl.get(`sinv.inventoryBench.model.view.createOrder`).d('新建')}${strategyName}`,
      `${intl.get(`sinv.inventoryBench.model.view.affirmOrder`).d('确认')}${strategyName}`,
      `${strategyName}${intl.get(`sinv.inventoryBench.model.view.OrderDetails`).d('明细')}`,
    ];
    return activeKey === 'submit' ? ep[0] : activeKey === 'affirm' ? ep[1] : ep[2];
  };

  const handleQueryInfo = useCallback(
    async (data) => {
      setState({ loading: true });
      HeaderDs.setQueryParameter('params', {
        invHeaderId,
        ...templateInfo,
        ...data,
        customizeUnitCode: getUnitCode(processFactory).units[0],
      });
      baseInfoDs.setQueryParameter('params', {
        invHeaderId,
        ...templateInfo,
        ...data,
        customizeUnitCode: getUnitCode(processFactory).units[1],
      });
      Promise.all([
        baseInfoDs.query(),
        HeaderDs.query()
          .then((res = {}) => {
            if (getResponse(res) && Reflect.ownKeys(res).length) {
              if (res?.cycleDimension?.length) {
                res?.cycleDimension?.split(',')?.forEach((i) => baseInfoDs.setState(i, true));
              }
              setSourceCode(res.sourceCode);
              setInvStatus(res.invStatus);
              attachmentDs.loadData([res]);
              setState({ loading: false });
            }
          })
          .finally(() => {
            setState({ loading: false });
          }),
      ]);
    },
    [state.loading, invStatus]
  );

  const handleDelete = debounce(() => {
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('sinv.inventoryBench.model.view.help').d('提示'),
      children: (
        <div>
          <p>{intl.get('sinv.inventoryBench.model.view.orderDel').d(`确认删除此单据吗?`)}</p>
        </div>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        setState({ loading: true });
        const param = HeaderDs.map((i) => i.toJSONData());
        const res = await delInventoryLine({ param, activeKey });
        if (getResponse(res)) {
          notification.success();
          setState({ loading: false });
          sureSupplier
            ? history.push(`/sinv/supplier-collaborative-workbench/list`)
            : history.push(`/sinv/purchaser-collaborative-workbench/list`);
        } else {
          setState({ loading: false });
        }
      },
    });
  }, 300);

  const handleSave = debounce(async () => {
    const headerFlag = await HeaderDs.validate();
    const baseInfoFlag = await baseInfoDs.validate();
    const attachmentFlag = await attachmentDs.validate();
    if (headerFlag && baseInfoFlag && attachmentFlag) {
      if (
        processFactory === '0' &&
        HeaderDs?.current.get('supplierId') === HeaderDs?.current.get('inSupplierId') &&
        HeaderDs?.current.get('supplierCompanyId') === HeaderDs?.current.get('inSupplierCompanyId')
      ) {
        return notification.warning({
          message: intl
            .get('sinv.inventoryBench.model.view.saveOrderTip')
            .d(`【调入供应商】和【调出供应商】不能重复，请检查后重新输入`),
        });
      }
      setState({ loading: true });
      const param = {
        sureSupplier,
        query: {
          ...templateInfo,
          activeKey,
          customizeUnitCode: getUnitCode(processFactory).units.join(),
        },
        body: {
          ...HeaderDs.map((i) => i.toJSONData())[0],
          activeKey,
          stockOutInvLineList: baseInfoDs.toJSONData(),
          headerAttachmentUuid: attachmentDs?.current?.toJSONData()?.headerAttachmentUuid,
        },
      };
      const res = await handleSaveDetail(param);
      if (getResponse(res)) {
        notification.success();
        setState({ loading: false });
        handleQueryInfo(null, true);
        if (activeKey === 'all') setState(() => ({ editFlag: !state.editFlag }));
      } else {
        setState({ loading: false });
      }
    }
  }, 300);

  const handleRefuse = debounce(async () => {
    const headerFlag = await HeaderDs.validate();
    const baseInfoFlag = await baseInfoDs.validate();
    const attachmentFlag = await attachmentDs.validate();
    const { headerAttachmentUuid = '' } = attachmentDs?.current?.toJSONData();
    if (headerFlag && baseInfoFlag && attachmentFlag) {
      setState({ loading: true });
      const param = {
        sureSupplier,
        query: {
          ...templateInfo,
          activeKey,
          customizeUnitCode: getUnitCode(processFactory).units.join(),
        },
        body: {
          customizeUnitCode: getUnitCode(processFactory).units.join(),
          ...HeaderDs.map((i) => i.toJSONData())[0],
          stockOutInvLineList: baseInfoDs.toJSONData(),
          approveFlag: 0,
          headerAttachmentUuid,
        },
      };
      const res = await approveInventoryList(param);
      if (getResponse(res)) {
        notification.success();
        setState({ loading: false });
        sureSupplier
          ? history.push(`/sinv/supplier-collaborative-workbench/list`)
          : history.push(`/sinv/purchaser-collaborative-workbench/list`);
      } else {
        setState({ loading: false });
      }
    }
  }, 300);

  const handleAffirm = debounce(async () => {
    const headerFlag = await HeaderDs.validate();
    const baseInfoFlag = await baseInfoDs.validate();
    const attachmentFlag = await attachmentDs.validate();
    if (headerFlag && baseInfoFlag && attachmentFlag) {
      setState({ loading: true });
      const param = {
        isLine: false,
        sureSupplier,
        query: {
          ...templateInfo,
          activeKey,
          customizeUnitCode: getUnitCode(processFactory).units.join(),
        },
        body: {
          ...HeaderDs.map((i) => i.toJSONData())[0],
          stockOutInvLineList: baseInfoDs.toJSONData(),
          approveFlag: 1,
          headerAttachmentUuid: attachmentDs?.current?.toJSONData()?.headerAttachmentUuid,
        },
      };
      // 绿联埋点
      if (typeof cuxconfirmBtnsChange === 'function' && sureSupplier) {
        const data = HeaderDs.current.toData();
        await cuxconfirmBtnsChange({ params: param, data, callback: setState({ loading: false }) });
        return;
      }
      const res = await approveInventoryList(param);
      if (getResponse(res)) {
        notification.success();
        setState({ loading: false });
        sureSupplier
          ? history.push(`/sinv/supplier-collaborative-workbench/list`)
          : history.push(`/sinv/purchaser-collaborative-workbench/list`);
      } else {
        setState({ loading: false });
      }
    }
  }, 300);

  const handleSubmit = debounce(async () => {
    const headerFlag = await HeaderDs.validate();
    const baseInfoFlag = await baseInfoDs.validate();
    const attachmentFlag = await attachmentDs.validate();
    if (headerFlag && baseInfoFlag && attachmentFlag) {
      if (
        processFactory === '0' &&
        HeaderDs?.current.get('supplierId') === HeaderDs?.current.get('inSupplierId') &&
        HeaderDs?.current.get('supplierCompanyId') === HeaderDs?.current.get('inSupplierCompanyId')
      ) {
        return notification.warning({
          message: intl
            .get('sinv.inventoryBench.model.view.saveOrderTip')
            .d(`【调入供应商】和【调出供应商】不能重复，请检查后重新输入`),
        });
      }
      const onSubmit = async () => {
        setState({ loading: true });
        const param = {
          sureSupplier,
          query: {
            ...templateInfo,
            activeKey,
            customizeUnitCode: getUnitCode(processFactory).units.join(),
          },
          body: {
            ...HeaderDs.map((i) => i.toJSONData())[0],
            stockOutInvLineList: baseInfoDs.toJSONData(),
            headerAttachmentUuid: attachmentDs?.current?.toJSONData()?.headerAttachmentUuid,
            approveFlag: 1,
          },
        };
        const res = await submitInventoryList(param);
        if (getResponse(res)) {
          notification.success();
          setState({ loading: false });
          sureSupplier
            ? history.push(`/sinv/supplier-collaborative-workbench/list`)
            : history.push(`/sinv/purchaser-collaborative-workbench/list`);
        } else {
          setState({ loading: false });
        }
      };

      if (remote?.event) {
        await remote.event.fireEvent('cuxOnSubmit', { props, onSubmit });
      } else {
        await onSubmit();
      }
    }
  }, 300);

  const handleCancel = async () => {
    if (invStatus === 'NEW') {
      return notification.warning({
        message: intl
          .get('sinv.inventoryBench.model.view.cancelOrderTip')
          .d('单据【编号】状态为【新建】，不支持取消操作，可通过【待提交】页签下执行单据删除。'),
      });
    }
    const headerFlag = await HeaderDs.validate();
    const baseInfoFlag = await baseInfoDs.validate();
    const attachmentFlag = await attachmentDs.validate();
    if (headerFlag && baseInfoFlag && attachmentFlag) {
      setState({ loading: true });
      const param = {
        sureSupplier,
        query: {
          activeKey,
          ...templateInfo,
          customizeUnitCode: getUnitCode(processFactory).units.join(),
        },
        body: {
          ...HeaderDs.map((i) => i.toJSONData())[0],
          stockOutInvLineList: baseInfoDs.toJSONData(),
          approveFlag: 1,
          headerAttachmentUuid: attachmentDs?.current?.toJSONData()?.headerAttachmentUuid,
        },
      };
      cancelInventoryList(param)
        .then((res) => {
          if (getResponse(res)) {
            notification.success();
            sureSupplier
              ? history.push(`/sinv/supplier-collaborative-workbench/list`)
              : history.push(`/sinv/purchaser-collaborative-workbench/list`);
          }
        })
        .finally(() => {
          setState({ loading: false });
        });
    } else {
      setState({ loading: false });
    }
  };

  const handleRetry = debounce(async () => {
    setState({ loading: true });
    const param = HeaderDs.map((i) => i.toJSONData());
    handleRetryInventory({ param, activeKey })
      .then((res) => {
        if (getResponse(res)) {
          setState({ loading: false });
          notification.success();
        }
      })
      .finally(() => {
        setState({ loading: false });
      });
  }, 300);

  const headerButtons = () => {
    const { loading, editFlag } = state;

    const BtnOptionBd = (item) => {
      return (
        <SrmOperationRecord
          loading={loading}
          btnType="button"
          funcType={item?.inMenuItem ? 'link' : 'flat'}
          btnText={item?.buttonText}
          icon={!item?.inMenuItem && 'assignment'}
          url={`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/stockout/inv/header/operate-records`}
          operationParams={{
            headerId: invHeaderId,
          }}
          lovParams={{ headerId: invHeaderId }}
          exportParams={{ headerId: invHeaderId }}
          lookupCode="SPUC_STOCKOUT_RECORD_TYPE"
          templateCode="SRM_C_SINV_OUTSOURCE_INV_RECORD_EXPORT"
          exportUrl={`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/stockout/inv/header/operate-records/export`}
        />
      );
    };
    const btns = {
      submit: [
        {
          name: 'submit',
          btnType: 'c7n-pro',
          child: intl.get('hzero.common.button.submit').d('提交'),
          btnProps: {
            loading,
            icon: 'done',
            type: 'c7n-pro',
            color: 'primary',
            onClick: handleSubmit,
          },
        },
        {
          name: 'save',
          btnType: 'c7n-pro',
          child: intl.get(`sinv.inventoryBench.view.button.save`).d('保存'),
          btnProps: {
            loading,
            icon: 'save',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: handleSave,
          },
        },
        {
          name: 'delete',
          btnType: 'c7n-pro',
          child: intl.get(`sinv.inventoryBench.model.view.button.delete`).d('删除'),
          btnProps: {
            loading,
            icon: 'delete',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: handleDelete,
          },
        },
        {
          name: 'operation',
          childFor: 'buttonText',
          child: (name) => name,
          btnComp: BtnOptionBd,
        },
      ],
      affirm: [
        {
          name: 'affirm',
          btnType: 'c7n-pro',
          child: intl.get(`sinv.inventoryBench.view.button.affirm`).d('确认'),
          btnProps: {
            loading,
            icon: 'done',
            type: 'c7n-pro',
            color: 'primary',
            onClick: handleAffirm,
          },
        },
        {
          name: 'refuse',
          btnType: 'c7n-pro',
          child: intl.get(`sinv.inventoryBench.model.view.button.refuse`).d('拒绝'),
          btnProps: {
            loading,
            icon: 'close',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: handleRefuse,
          },
        },
        {
          name: 'newExport',
          btnComp: ExcelExportPro,
          child: (name) =>
            name || intl.get(`sinv.inventoryBench.view.button.newExport`).d('新版导出'),
          childFor: 'buttonText',
          btnProps: {
            allBody: true,
            method: 'POST',
            templateCode: sureSupplier
              ? 'SINV_OUTSOURCE_INV_HEADER_SUPPLIER_LINE_DETAIL'
              : 'SINV_OUTSOURCE_INV_HEADER_PURCHASE_LINE_DETAIL',
            requestUrl: sureSupplier
              ? `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/stockout/inv/header/export/line/${invHeaderId}/supplier-detail`
              : `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/stockout/inv/header/export/line/${invHeaderId}/detail`,
            buttonText: intl.get(`sinv.inventoryBench.view.button.newExport`).d('新版导出'),
            otherButtonProps: {
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
              loading,
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
              invHeaderId,
              campCode: sureSupplier ? 'SUPPLIER' : 'PURCHASER',
              tenantId: getCurrentOrganizationId(),
            },
            buttonText: intl.get(`slod.deliveryWorkbench.model.common.newImport`).d('新版导入'),
            businessObjectTemplateCode: sureSupplier
              ? 'SRM_C_SINV_OUTSOURCE_INV_LINE_SUPPLIER_IMPORT'
              : 'SRM_C_SINV_OUTSOURCE_INV_LINE_IMPORT',
            successCallBack: () => handleQueryInfo(null, true),
          },
        },
        {
          name: 'operation',
          childFor: 'buttonText',
          child: (name) => name,
          btnComp: BtnOptionBd,
        },
      ],

      all: [
        !editFlag && {
          name: 'save',
          btnType: 'c7n-pro',
          child: intl.get(`sinv.inventoryBench.view.button.save`).d('保存'),
          btnProps: {
            loading,
            icon: 'save',
            type: 'c7n-pro',
            onClick: handleSave,
            color: 'primary',
          },
        },
        invStatus === 'FINISHED' &&
          editFlag && {
            name: 'edit',
            btnType: 'c7n-pro',
            child: intl.get('hzero.common.status.edit').d('编辑'),
            btnProps: {
              loading,
              icon: 'mode_edit',
              type: 'c7n-pro',
              funcType: 'flat',
              onClick: () => setState(() => ({ editFlag: !state.editFlag })),
            },
          },
        !editFlag && {
          name: 'editCancel',
          btnType: 'c7n-pro',
          child: intl.get('sinv.inventoryBench.model.receipt.cancel').d('取消编辑'),
          btnProps: {
            loading,
            icon: 'cancel',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: () => {
              handleQueryInfo();
              setState(() => ({ editFlag: !state.editFlag }));
            },
          },
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
            },
            requestUrl: `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/stockout/inv/header/export/batch-print-token`,
            method: 'POST',
            data: [HeaderDs.map((i) => i.toJSONData())[0]],
            buttonText: intl.get('hzero.common.button.print').d('打印'),
          },
        },

        {
          name: 'retry',
          group: true,
          child: (
            <>
              <Button icon="replay" onClick={handleRetry} loading={loading} funcType="flat">
                {intl.get('hzero.common.button.retry').d('重新同步')}
              </Button>
            </>
          ),
        },
        {
          name: 'operation',
          childFor: 'buttonText',
          child: (name) => name,
          btnComp: BtnOptionBd,
        },
        !sureSupplier && {
          name: 'cancel',
          btnType: 'c7n-pro',
          child: intl.get(`sinv.inventoryBench.model.view.button.cancel`).d('取消'),
          btnProps: {
            loading,
            icon: 'cancel',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: handleCancel,
          },
        },
      ],
    };
    if (activeKey === 'submit') {
      return customizeBtnGroup(
        { code: `SINV.PURCHASER.COLLABORATIVE.WORKBENCH.SUBMITDETAIL.BTNS`, pro: true },
        <DynamicButtons buttons={btns[activeKey]} maxNum={5} defaultBtnType="c7n-pro" />
      );
    }

    if (activeKey === 'affirm') {
      return customizeBtnGroup(
        { code: `SINV.PURCHASER.COLLABORATIVE.WORKBENCH.AFFIRMDETAIL.BTNS`, pro: true },
        <DynamicButtons buttons={btns[activeKey]} maxNum={5} defaultBtnType="c7n-pro" />
      );
    }
    if (activeKey === 'all') {
      return customizeBtnGroup(
        { code: `SINV.PURCHASER.COLLABORATIVE.WORKBENCH.ALLDETAIL.BTNS`, pro: true },
        <DynamicButtons buttons={btns[activeKey]} maxNum={5} defaultBtnType="c7n-pro" />
      );
    }
  };

  const value = {
    customizeForm,
    customizeTable,
    baseInfoDs,
    HeaderDs,
    invHeaderId,
    loading: state.loading,
    processFactory,
    activeKey,
    editFlag: state.editFlag,
    sourceCode,
    handleQueryInfo,
    attachmentDs,
    getUnitCode,
    init,
    customizeBtnGroup,
    sureSupplier,
    remote,
  };

  return (
    <>
      <Header
        title={HeaderTip()}
        backPath={
          sureSupplier
            ? '/sinv/supplier-collaborative-workbench/list'
            : '/sinv/purchaser-collaborative-workbench/list'
        }
      >
        {headerButtons()}
      </Header>

      <div style={{ overflowY: 'auto' }} className={styles.pageWrapper}>
        <div className={styles.pageWrapperOne}>
          <div className={styles.pageWrap}>
            <h3 className={styles.pageTitle} id="supplier-delivery-shipInfo">
              {intl.get(`sinv.inventoryBench.model.view.title.baseInfo`).d('基本信息')}
            </h3>
          </div>
          <Store.Provider value={value}>
            <HeaderInfo />
          </Store.Provider>
        </div>

        <div className={styles.pageWrapperTwo}>
          <div className={styles.pageWrap}>
            <h3 className={styles.pageTitle} id="supplier-delivery-receiveInfo">
              {intl.get(`sinv.inventoryBench.model.view.title.inventoryDetail`).d('明细信息')}
            </h3>
          </div>
          <Store.Provider value={value}>
            <BaseInfo />
          </Store.Provider>
        </div>

        <div className={styles.pageWrapperThree}>
          <div>
            <h3 className={styles.pageTitle} id="supplier-delivery-attachInfo">
              {intl.get('sinv.inventoryBench.attachment.uploadAttachment').d('附件')}
            </h3>
          </div>
          <AttachmentList
            attachmentDs={attachmentDs}
            activeKey={activeKey}
            loading={state.loading}
          />
        </div>
      </div>
    </>
  );
};

export default compose(
  WithCustomize({ isTemplate: true }),
  formatterCollections({
    code: [
      'sinv.inventoryBench',
      'hzero.common',
      'sinv.common',
      'sinv.inventory',
      'slod.deliveryWorkbench',
    ],
  }),
  cuxRemote(
    {
      code: 'SINV_SUPPLIERCOLLABORATIVEWORKBENCH_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        cuxconfirmBtnsChange: undefined,
      },
      events: {
        cuxOnSubmit: async (eventProps) => {
          const { onSubmit } = eventProps || {};
          if (onSubmit) await onSubmit();
        },
      },
    }
  )
)(Index);
