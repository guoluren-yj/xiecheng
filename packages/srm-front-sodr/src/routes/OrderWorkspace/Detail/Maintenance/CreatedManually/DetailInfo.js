/*
 * BasicInfo - 订单明细页-明细信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useCallback, useMemo } from 'react';
import {
  Modal,
  NumberField,
  Form,
  DatePicker,
  Lov,
  TextField,
  Select,
  Icon,
  CheckBox,
  TextArea,
  Table,
  TelField,
  Tooltip,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { stringify } from 'querystring';
import { isEmpty, throttle, isArray, omit } from 'lodash';
import DocFlow from '_components/DocFlow';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { Button } from 'components/Permission';
import { SRM_SPUC } from '_utils/config';
import SearchBarTable from '_components/SearchBarTable';
import DynamicButtons from '_components/DynamicButtons';
import CommonImport from 'hzero-front/lib/components/Import';
import TooltipButton from '@/routes/components/TooltipButton';
import CategoryLov from '@/routes/components/CategoryLov';
import ProjectTaskLov from '@/routes/components/ProjectTaskLov';
import { THROTTLE_TIME } from '@/routes/components/utils/constant';
import C7nPriceModal from '@/routes/components/C7nPriceModal';
import Bom from '@/routes/components/Bom';
import { clearPoItemBOM, priceUpdate, addDelete } from '@/services/orderWorkspaceService';
import {
  useUomRender,
  useDoubleUomRender,
  useLocalAmountRender,
} from '@/routes/OrderWorkspace/hooks';
import {
  handleBatchOk,
  handleBatchSplit,
  viewCostInformation,
  handleBatchAdd,
  getMaxPoLineNum,
} from '@/routes/components/utils';
import styles from '../../index.less';

const DetailInfo = (props) => {
  const {
    ds,
    remote,
    history,
    fetchDetailHeader = (e) => e,
    getValues = (e) => e,
    handleIncludedPriceFcous = (e) => e,
    loadings,
    loading,
    poHeaderId,
    setPrice,
    customizeTable,
    batchMaintenanceDs,
    priceUpdateList,
    isCreate,
    basicInfoDs,
    organizationInfoDs,
    customizeForm,
    customizeBtnGroup,
    displayDocAndDocFlow,
  } = props;
  // 一单到底新增行头字段必输校验
  const newLineRequiredFields = useMemo(
    () => ['companyId', 'ouId', 'poTypeId', ['supplierId', 'supplierCompanyId']],
    []
  );
  const basicCurrent = basicInfoDs?.current;
  const { summaryFlag, displayPoNum } = basicCurrent.get(['summaryFlag', 'displayPoNum']);
  const doubleUnitEnabled = ds.getState('doubleUnitEnabled');
  const priceModalParams = (record) => {
    const line = record.toJSONData();
    const { poHeaderDetailDTO = {} } = getValues();
    return { poHeaderDetailDTO, poLineDetailDTOs: [line] };
  };

  // 一单到底校验头必输字段是否完整
  const validateNewLineRequiredFields = useCallback(() => {
    const { poHeaderDetailDTO } = getValues();
    const validateRes = newLineRequiredFields.map((i) => {
      return isArray(i) ? i.some((n) => poHeaderDetailDTO[n]) : Boolean(poHeaderDetailDTO[i]);
    });
    const response = validateRes.every((i) => i);
    if (!response) {
      notification.warning({
        message: intl
          .get(`sodr.workspace.view.message.validateNewOrderLines`)
          .d(
            '【基础信息】/【交易方及采买组织信息】/【附件信息】填写不完整，请填写完整后，再填写订单明细信息。'
          ),
      });
    }
    return response;
  }, [getValues, newLineRequiredFields]);

  /**
   * 新增行
   * @param {Object} initData 新增行初始化数据
   * @param {Boolean} isBatch 是否是批量新增行
   */
  const handleCreate = async (initData = {}, isBatch = false) => {
    // 批量新增行自己在外面校验 这里就不重复调用了
    if (isBatch || validateNewLineRequiredFields()) {
      const originData = {
        invOrganizationId: ds.getState('defaultOrgId'),
        invOrganizationName: ds.getState('defaultOrgName'),
        currencyCode: basicCurrent.get('currencyCode')?.currencyCode,
        defaultPrecision: basicCurrent.get('defaultPrecision'),
        ...initData,
      };
      if (basicCurrent.get('outsourceOrderFlag') === 1) {
        Object.assign(originData, {
          projectCategory: ds.getState('defaultProjectCategory'),
          projectCategoryMeaning: ds.getState('defaultProjectCategoryMeaning'),
        });
      }
      const data = await remote.process('handleCreateData', originData, { basicInfoDs });
      ds.create(data, 0);
    }
  };

  const handleDelete = async () => {
    const { selected = [], totalCount } = ds;
    const selectData = selected.map((i) => i.toData());
    const { statusCode } = basicCurrent?.toJSONData() || {};
    const deleteFlag = selectData.some((i) => i.poLineLocationId);
    const { fundTermId } = basicInfoDs?.current?.get(['fundTermId']);
    if (deleteFlag) {
      if (
        selected.length >= totalCount + ds.filter((i) => i.status === 'add').length &&
        statusCode === 'REJECTED'
      ) {
        notification.warning({
          message: intl.get(`sodr.common.view.message.moreThanOne`).d('订单至少有一个订单行。'),
        });
        return;
      }
      const noSaveData = selectData.filter((i) => !i.poLineLocationId);
      ds.delete(selected, {
        title: intl.get('sodr.common.model.common.errorMessage').d('提示'),
        children: intl.get(`sodr.common.model.common.deltetLists`).d('是否删除数据？'),
      }).then(async (res) => {
        if (res && res.success) {
          if (fundTermId) {
            const result = await addDelete({
              poHeaderDetailDTO: basicInfoDs?.current?.toData(),
              poLineDetailDTOs: noSaveData,
            });
            getResponse(result);
          }
          ds.remove(selected, true);
          fetchDetailHeader(true);
        }
      });
    } else if (fundTermId) {
      const res = await addDelete({
        poHeaderDetailDTO: basicInfoDs?.current?.toData(),
        poLineDetailDTOs: selectData,
      });
      if (getResponse(res)) {
        ds.remove(selected);
      }
    } else {
      ds.remove(selected);
    }
  };

  const handleImport = () => {
    const option = {
      pathname: '/sodr/order-workspace/data-import/SPUC.PO_LINE_IMPORT',
      search: stringify({
        action: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
        backPath: `/sodr/order-workspace/detail/created-manually/${poHeaderId}`,
        args: JSON.stringify({
          poHeaderId,
          poWorkbenchFlag: 1,
        }),
      }),
    };
    history.push(option);
  };

  const handleBatchMaintenance = () => {
    const { benchmarkPriceType } = basicInfoDs.toJSONData()[0];
    const { selected } = ds;
    Modal.open({
      drawer: true,
      style: { width: 380 },
      bodyStyle: { overflowX: 'hidden' },
      title: intl.get(`sodr.workspace.view.button.batchEdit`).d('批量编辑'),
      children: (
        <Fragment>
          <Alert
            className={styles['order-top-title-alert']}
            border={false}
            message={
              <div>
                <Icon type="help" />
                {!isEmpty(selected)
                  ? intl
                      .get(`sodr.workspace.view.alert.batchAllMaintainData`, {
                        num: selected.length,
                      })
                      .d(`已勾选{num}条数据进行批量编辑`)
                  : intl
                      .get('sodr.workspace.view.alert.batchAllMaintain')
                      .d('针对全部数据进行批量编辑')}
              </div>
            }
            closable
          />
          {customizeForm(
            { code: 'SODR.WORKSPACE_CREATEDMANUALLY.BATCHEDIT', lovIgnore: false },
            <Form dataSet={batchMaintenanceDs} columns={1} labelLayout="float">
              <TextField name="itemName" />
              <CategoryLov
                name="categoryId"
                data={{
                  source: 'batchEdit',
                  ds: batchMaintenanceDs,
                  record: batchMaintenanceDs?.current,
                }}
              />
              <Lov name="invOrganizationId" />
              <Lov name="invInventoryId" />
              <Lov name="invLocationId" />
              <DatePicker name="needByDate" />
              <Lov name="taxId" />
              <Lov name="costId" />
              <Lov name="departmentId" />
              <Lov
                name="projectCategory"
                placeholder={intl.get('sodr.workspace.model.common.projectCategory').d('项目类别')}
              />
              <NumberField name="unitPriceBatch" />
              <TextField name="shipToThirdPartyAddress" />
              <TextField name="shipToThirdPartyContact" />
              <NumberField
                name="enteredTaxIncludedPrice"
                disabled={benchmarkPriceType === 'NET_PRICE'}
              />
              <NumberField
                name="unitPrice"
                disabled={
                  benchmarkPriceType === 'TAX_INCLUDED_PRICE' || benchmarkPriceType === undefined
                }
              />
              <Lov name="wbsCode" />
              <Select name="purchaseLineTypeId" />
              <Lov name="accountAssignTypeId" />
              <ProjectTaskLov
                name="projectTaskId"
                data={{
                  source: 'batchEdit',
                  ds: batchMaintenanceDs,
                  record: batchMaintenanceDs?.current,
                }}
              />
              <TextArea name="remark" />
              <NumberField name="receiveToleranceQuantity" />
              <Select name="receiveToleranceQuantityType" />
              <TelField name="receiveTelNum" />
            </Form>
          )}
        </Fragment>
      ),
      onOk: throttle(
        () =>
          handleBatchOk(batchMaintenanceDs, ds, {
            hasPriceLibrary: true,
            getValues,
            remote,
            remoteCode: 'SODR.WORKSPACE_MAINTENANCE_CREATEMANUALLY_PROCESS_BATCH_EDIT',
          }),
        THROTTLE_TIME,
        { trailing: false }
      ),
    });
  };

  const handleUpdatePrice = () => {
    loading({ updatePrice: true });
    priceUpdate({
      poHeaderId,
      query: {
        customizeUnitCode: `SODR.WORKSPACE_CREATEDMANUALLY.BASICINFO,SODR.WORKSPACE_CREATEDMANUALLY.ORGANIZATIONINFO,SODR.WORKSPACE_CREATEDMANUALLY.DETAILINFO`,
      },
    }).then((res) => {
      loading({ updatePrice: false });
      if (getResponse(res)) {
        fetchDetailHeader();
      }
    });
  };

  const getButtons = () => {
    const Buttons = observer(({ dataSet }) => {
      const { selected } = dataSet;
      const buttons = [
        {
          name: 'delete',
          btnComp: TooltipButton,
          childFor: 'buttonText',
          child: intl.get(`hzero.common.button.batchDelete`).d('批量删除'),
          btnProps: {
            tipTitle: intl
              .get(`sodr.common.view.message.deleteSelectedLine`)
              .d('仅可删除勾选的订单行'),
            btnProps: {
              icon: 'delete_sweep',
              color: 'primary',
              type: 'c7n-pro',
              funcType: 'flat',
              onClick: handleDelete,
              wait: THROTTLE_TIME,
              disabled: !dataSet.selected.length,
              loading: dataSet.status !== 'ready',
              permissionList: [
                {
                  code: 'srm.po-admin.po.order-workspace.ps.button.createdmanuallyline.delete',
                  type: 'c7n-pro',
                  meaning: '订单工作台-手工创建明细行-删除',
                },
              ],
            },
          },
        },
        {
          name: 'batchEdit',
          btnComp: TooltipButton,
          child: !isEmpty(selected)
            ? intl.get(`sodr.workspace.view.button.tickaBtchEdit`).d('勾选批量编辑')
            : intl.get(`sodr.workspace.view.button.batchEdit`).d('批量编辑'),
          childFor: 'buttonText',
          btnProps: {
            tipTitle: !isEmpty(selected)
              ? intl.get(`sodr.workspace.view.button.tickaBtchEdit`).d('勾选批量编辑')
              : intl.get('sodr.workspace.view.tooltip.batchAllMaintain').d('批量编辑全部数据'),
            btnProps: {
              funcType: 'flat',
              icon: 'mode_edit',
              color: 'primary',
              type: 'c7n-pro',
              disabled: dataSet.length === 0,
              onClick: handleBatchMaintenance,
              loading: dataSet.status !== 'ready',
              permissionList: [
                {
                  code: 'srm.po-admin.po.order-workspace.ps.button.createdmanually.batchedit',
                  type: 'c7n-pro',
                  meaning: '订单工作台-手工创建明细行-批量编辑',
                },
              ],
            },
          },
        },
        {
          name: 'newLineImport',
          btnComp: CommonImport,
          childFor: 'buttonText',
          child: intl.get(`hzero.common.button.batchImport`).d('批量导入'),
          btnProps: {
            businessObjectTemplateCode: 'SPUC.PO_LINE_IMPORT',
            prefixPatch: SRM_SPUC,
            refreshButton: true,
            args: {
              poHeaderId,
              poWorkbenchFlag: 1,
            }, // 上传参数
            successCallBack: () => {
              ds.query();
              fetchDetailHeader();
            },
            buttonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              color: 'primary',
              hidden: poHeaderId === 'new' || !poHeaderId,
              loading: dataSet.status !== 'ready',
              permissionList: [
                {
                  code: 'srm.po-admin.po.order-workspace.ps.button.createdmanually.newbatchimport',
                  type: 'c7n-pro',
                  meaning: '订单工作台-手工创建明细行-新版批量导入',
                },
              ],
            },
          },
        },
        {
          name: 'lineImport',
          btnComp: Button,
          child: intl.get('hzero.common.viewtitle.batchImport').d('批量导入'),
          btnProps: {
            icon: 'archive',
            color: 'primary',
            type: 'c7n-pro',
            funcType: 'flat',
            hidden: isCreate,
            onClick: handleImport,
            loading: dataSet.status !== 'ready',
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.ps.button.createdmanually.batchimport',
                type: 'c7n-pro',
                meaning: '订单工作台-手工创建明细行-批量导入',
              },
            ],
          },
        },
        {
          name: 'referPrice',
          btnComp: Button,
          child: intl.get(`sodr.workspace.view.button.quoteTheLatestPrice`).d('引用最新价格'),
          btnProps: {
            wait: THROTTLE_TIME,
            icon: 'root',
            color: 'primary',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: handleUpdatePrice,
            loading: loadings.updatePrice || dataSet.status !== 'ready',
            disabled: isEmpty(priceUpdateList),
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.ps.button.createdmanually.newprice',
                type: 'c7n-pro',
                meaning: '订单工作台-手工创建明细行-引用最新价格',
              },
            ],
          },
        },
        {
          name: 'create',
          btnComp: Button,
          child: intl.get(`hzero.common.button.increase`).d('新增'),
          btnProps: {
            icon: 'playlist_add',
            color: 'primary',
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: () => handleCreate(),
            loading: dataSet.status !== 'ready',
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.ps.button.createdmanuallyline.create',
                type: 'c7n-pro',
                meaning: '订单工作台-手工创建明细行-新增',
              },
            ],
          },
        },
        {
          name: 'batchSplit',
          btnComp: Button,
          child: dataSet.selected.length
            ? intl.get(`sodr.workspace.view.button.selectBatchSplit`).d('勾选批量拆分')
            : intl.get(`sodr.workspace.view.button.batchSplit`).d('批量拆分'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'add_road-o',
            type: 'c7n-pro',
            disabled: isCreate,
            loading: dataSet.status !== 'ready',
            help: intl
              .get('sodr.workspace.view.help.selectBatchSplit')
              .d('点击后，可批量拆分数量均为1的订单行'),
            onClick: () =>
              handleBatchSplit({ basicInfoDs, getValues, callback: fetchDetailHeader, ds }),
            wait: THROTTLE_TIME,
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.button.created_manually.batchSplit',
                meaning: '订单工作台-手工创建明细行-批量拆分',
              },
            ],
          },
        },
        {
          name: 'batchAdd',
          btnComp: Button,
          child: intl.get('sodr.workspace.view.button.batchAdd').d('批量新增'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            type: 'c7n-pro',
            icon: 'playlist_add',
            loading: dataSet.status !== 'ready',
            wait: THROTTLE_TIME,
            onClick: async () => {
              const { poHeaderDetailDTO } = getValues();
              const lineNum = getMaxPoLineNum(basicInfoDs, dataSet);
              const maxPoLineNum = lineNum || poHeaderDetailDTO.maxPoLineNum;
              await handleBatchAdd(
                { basicInfoDs, ds },
                {
                  poHeaderDetailDTO: {
                    ...poHeaderDetailDTO,
                    maxPoLineNum,
                  },
                  validateNewLineRequiredFields,
                  handleCreate,
                  customizeForm,
                  code: 'SODR.WORKSPACE_CREATEDMANUALLY.BATCHADDMODAL',
                }
              );
            },
            permissionList: [
              {
                code: 'srm.po-admin.po.order-workspace.button.created_manually.batchAdd',
                meaning: '订单工作台-手工创建明细行-批量新增',
              },
            ],
          },
        },
      ];
      return customizeBtnGroup(
        { code: 'SODR.WORKSPACE_CREATEDMANUALLY.DETAIL_LINE_BUTTONS', pro: true },
        <DynamicButtons buttons={remote.process('detailInfoGetButtons', buttons, { ds })} />
      );
    });
    return [<Buttons dataSet={ds} />];
  };

  const openC7nPriceModal = (record) => {
    const currentProps = {
      readOnly: false,
      customizeTable,
      summaryFlag,
      params: priceModalParams(record),
      code: 'SODR.WORKSPACE_CREATEDMANUALLY.REFERENCE_PRICE',
    };
    Modal.open({
      drawer: true,
      style: { width: 742 },
      title: intl.get('sodr.workspace.model.common.referPrice').d('参考价格'),
      children: (
        <C7nPriceModal
          {...remote.process('transformPriceModalProps', currentProps, { basicInfoDs, record })}
        />
      ),
      onOk: setPrice,
    });
  };

  const openBom = throttle(
    async (record) => {
      if (record.status === 'add') {
        Modal.info({
          children: intl
            .get('sodr.workspace.view.info.noSaveBomLine')
            .d('该订单行未保存，bom信息不能维护，请先保存！'),
        });
        return;
      }
      if (!record.get('quantity') > 0) {
        notification.error({
          description: intl
            .get('sodr.workspace.view.message.orderLineQuantityByBom')
            .d('请输入>0的订单数量信息'),
        });
        return;
      }
      if (record.get('saveBomItemId') !== record.get('itemId')?.itemId) {
        const res = await getResponse(clearPoItemBOM({ poLineId: record.get('poLineId') }));
        if (res) {
          record.set({ saveBomItemId: record.get('itemId')?.itemId });
        }
      }
      Modal.open({
        footer: (okBtn, cancelBtn) => cancelBtn,
        cancelText: intl.get('sodr.workspace.view.button.close').d('关闭'),
        cancelProps: { color: 'primary' },
        closable: true,
        drawer: true,
        style: { width: 742 },
        title: intl.get('sodr.workspace.view.title.bom').d('外协BOM'),
        children: (
          <Bom
            record={record}
            remote={remote}
            customizeTable={customizeTable}
            compatible={{
              queryPara: remote.process(
                'transformBomQueryPara',
                {
                  itemId: record.get('itemId')?.itemId,
                },
                { basicInfoDs, record }
              ),
              createDefault: remote.process(
                'transformBomCreateDefault',
                {
                  needByDate: record.get('needByDate'),
                  invOrganizationId: record.get('invOrganizationId')?.organizationId,
                  invOrganizationName: record.get('invOrganizationId')?.organizationName,
                  poHeaderId: record.get('poHeaderId'),
                  poLineId: record.get('poLineId'),
                  poLineLocationId: record.get('poLineLocationId'),
                },
                { basicInfoDs, record }
              ),
            }}
            code="SODR.WORKSPACE_CREATEDMANUALLY.BOM"
          />
        ),
      });
    },
    THROTTLE_TIME,
    { trailing: false }
  );
  const splitLine = (record) => {
    const fieldsMap = Object.keys(record.toData());
    const data = omit(record.get([...fieldsMap]), ['displayLineNum', 'lineNum']);
    const dataList = {
      ...data,
      poLineId: null,
      // displayLineNum: null,
      poLineLocationId: null,
    };
    const newRecord = ds.create({});
    newRecord.init(dataList);
  };
  const columns = () => {
    const lineColumns = [
      {
        name: 'translate',
        width: 70,
        renderer: ({ record }) => {
          return (
            <a disabled={record.status === 'add'} onClick={() => splitLine(record)}>
              {intl.get(`sodr.workspace.view.button.split`).d('拆分')}
            </a>
          );
        },
      },
      {
        name: 'displayLineNum',
        width: 70,
      },
      {
        name: 'displayLineLocationNum',
        width: 100,
      },
      {
        name: 'itemId',
        width: 150,
        editor: true,
      },
      {
        name: 'itemName',
        width: 150,
        editor: true,
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 150,
        editor: true,
      },
      doubleUnitEnabled && {
        name: 'secondaryUomId',
        width: 150,
        editor: true,
        renderer: useDoubleUomRender,
      },
      {
        name: 'quantity',
        width: 150,
        editor: true,
      },
      {
        name: 'uomId',
        width: 150,
        editor: true,
        renderer: useUomRender,
      },
      {
        name: 'needByDate',
        width: 150,
        editor: true,
      },
      {
        name: 'unitPrice',
        width: 150,
        editor: (record) => (
          <NumberField onFocus={() => handleIncludedPriceFcous(record, 'price')} />
        ),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        editor: (record) => (
          <NumberField onFocus={() => handleIncludedPriceFcous(record, 'price')} />
        ),
      },
      {
        name: 'taxId',
        width: 150,
        editor: true,
      },
      // {
      //   name: 'lastPurchasePrice',
      //   width: 150,
      //   renderer: ({ value }) => numberRender(value),
      // },
      {
        name: 'unitPriceBatch',
        width: 150,
        editor: true,
      },
      {
        name: 'currencyCode',
        width: 150,
        editor: true,
      },
      {
        name: 'referPrice',
        width: 150,
        renderer: ({ record }) => {
          // return <C7nPriceModal readOnly={false} params={priceModalParams(record)} onOk={setPrice} />;
          return (
            <a onClick={() => openC7nPriceModal(record)}>
              {intl.get('sodr.workspace.model.common.referPrice').d('参考价格')}
            </a>
          );
        },
      },
      {
        name: 'categoryId',
        width: 150,
        editor: (record) => <CategoryLov data={{ record, ds }} />,
      },
      {
        name: 'invOrganizationId',
        width: 150,
        editor: true,
      },
      {
        name: 'invInventoryId',
        width: 150,
        editor: true,
      },
      {
        name: 'invLocationId',
        width: 150,
        editor: true,
      },
      {
        name: 'shipToThirdPartyAddress',
        width: 150,
        editor: true,
      },
      {
        name: 'shipToThirdPartyContact',
        width: 150,
        editor: true,
      },
      {
        name: 'departmentId',
        width: 150,
        editor: true,
      },
      {
        name: 'costId',
        width: 150,
        editor: true,
      },
      {
        name: 'projectCategory',
        width: 150,
        editor: true,
      },
      {
        name: 'bom',
        width: 150,
        // renderer: ({ record }) => (
        //   <Bom
        //     record={record}
        //     disabled={record.get('projectCategory') !== 'L'}
        //     customizeTable={customizeTable}
        //     code="SODR.WORKSPACE_CREATEDMANUALLY.BOM"
        //   />
        // ),
        renderer: ({ record }) => (
          <a
            disabled={record.get('projectCategory')?.value !== 'L'}
            onClick={() => openBom(record)}
          >
            {intl.get('hzero.common.button.maintain').d('维护')}
          </a>
        ),
      },
      {
        name: 'freeFlag',
        align: 'left',
        width: 150,
        editor: true,
      },
      {
        name: 'returnedFlag',
        align: 'left',
        width: 150,
        editor: (record) => {
          return (
            <CheckBox
              checked={basicCurrent.get('returnOrderFlag') || record.get('returnedFlag')}
              onChange={(e) => record.set({ returnedFlag: e })}
            />
          );
        },
      },
      {
        name: 'fixedAssetsFlag',
        align: 'left',
        width: 150,
        editor: (record) => {
          return (
            <CheckBox
              checked={basicCurrent.get('fixedAssetsFlag') || record.get('fixedAssetsFlag')}
              onChange={(e) => record.set({ fixedAssetsFlag: e })}
            />
          );
        },
      },
      {
        name: 'remark',
        width: 150,
        editor: true,
      },
      {
        name: 'attachmentUuid',
        width: 150,
        editor: true,
      },
      // 默认隐藏字段
      {
        name: 'accountSubjectId',
        width: 150,
        editor: true,
      },
      {
        name: 'wbsCode',
        width: 150,
        editor: true,
      },
      {
        name: 'receiveTelNum',
        width: 400,
        editor: true,
        // editor: (record) => {
        //   return <TextField addonBefore={<Select record={record} name="internationalTelCode" />} />;
        // },
        // renderer: ({ record, text }) =>
        //   [record.get('internationalTelCode'), text].filter(Boolean).join('-'),
      },
      {
        name: 'commonName',
        width: 150,
      },
      {
        name: 'brand',
        width: 150,
        editor: true,
      },
      {
        name: 'specifications',
        width: 150,
        editor: true,
      },
      {
        name: 'model',
        width: 150,
        editor: true,
      },
      {
        name: 'accountAssignTypeId',
        width: 150,
        editor: true,
      },
      {
        name: 'domesticUnitPrice',
        width: 150,
      },
      {
        name: 'domesticLineAmount',
        width: 150,
        renderer: useLocalAmountRender(basicCurrent),
      },
      {
        name: 'domesticTaxIncludedPrice',
        width: 150,
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        width: 150,
        renderer: useLocalAmountRender(basicCurrent),
      },
      {
        name: 'budgetAccountId',
        width: 150,
        editor: true,
      },
      {
        name: 'receiveToleranceQuantityType',
        width: 150,
        editor: true,
      },
      {
        name: 'receiveToleranceQuantity',
        width: 150,
        editor: true,
      },
      {
        name: 'purchaseLineTypeId',
        width: 150,
        editor: true,
      },
      {
        name: 'priceSource',
        width: 150,
        renderer: ({ record }) => record.get('priceSourceMeaning'),
      },
      {
        name: 'priceSourceNum',
        width: 150,
      },
      {
        name: 'priceSourceLineNum',
        width: 150,
      },
      {
        name: 'docFlow',
        width: 100,
        hidden: displayDocAndDocFlow.displayDocFlow !== '1',
        renderer: ({ record }) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
        ),
      },
      {
        name: 'projectTaskId',
        width: 150,
        editor: (record) => <ProjectTaskLov data={{ record, ds }} />,
      },
      {
        name: 'subSupplierId',
        width: 150,
        editor: true,
      },
      {
        name: 'pcSubjectId',
        editor: (record) => {
          const pcHeaderIdLov = basicInfoDs.getField('pcHeaderIdLov');
          // 头上的关联采购协议不展示 && 行参考价格没有使用协议价
          return !pcHeaderIdLov.get('visible') && record.get('priceSource') !== 'CONTRACT';
        },
      },
      {
        name: 'costInformation',
        renderer: ({ record }) => {
          const isNewLine = record.status === 'add';
          return (
            <Tooltip
              title={
                isNewLine &&
                intl.get('sodr.workspace.model.costInformation.linkTooltip').d('请保存订单行')
              }
            >
              <Button
                type="c7n-pro"
                funcType="link"
                disabled={isNewLine}
                onClick={() =>
                  viewCostInformation({
                    record,
                    displayPoNum,
                    lineCode: 'SODR.WORKSPACE_CREATEDMANUALLY.COSTINFORMATION',
                  })
                }
              >
                {intl.get('sodr.workspace.model.costInformation.costInformation').d('费用信息')}
              </Button>
            </Tooltip>
          );
        },
      },
      {
        name: 'originalPoLineId',
        width: 150,
        renderer: ({ record }) => record.get('displayOriginalPoAndLineNum'),
      },
      {
        name: 'fundLineTermId',
        width: 150,
        renderer: ({ record }) => record.get('fundLineTermName'),
      },
    ];
    return remote?.process('processColumns', lineColumns, {
      handleIncludedPriceFcous,
      basicInfoDs,
      organizationInfoDs,
    });
  };
  const tableProps = {
    searchCode: 'SODR.WORKSPACE_CREATEDMANUALLY.DETAILINFO_FILTER',
    spin: { spinning: loadings.handleIncludedPriceFcous },
    dataSet: ds,
    columns: columns(),
    buttons: getButtons(),
    pagination: { pageSizeOptions: ['10', '20', '50', '100', '200'] },
    style: { maxHeight: `calc(100vh - 400px)` },
    virtual: true,
    virtualCell: true,
    searchBarConfig: {
      // autoQuery: false,
      checkDataSetStatus: false,
      closeFilterSelector: true,
    },
  };
  if (isCreate) {
    tableProps.pagination = false;
  }
  return (
    <Fragment>
      {/* {!isEmpty(priceUpdateList) && (
        <p className={styles['order-top-title']}>
          <span />
          {intl
            .get(`sodr.workspace.view.message.priceUpdate`)
            .d('价格库价格有更新，可点击下方左上角“引用最新价格”按钮获取最新价格')}
        </p>
      )} */}
      {!isEmpty(priceUpdateList) && (
        <Alert
          className={styles['order-top-title']}
          message={intl
            .get(`sodr.workspace.view.message.priceUpdate`)
            .d('价格库价格有更新，可点击下方左上角“引用最新价格”按钮获取最新价格')}
          type="info"
          showIcon
        />
      )}
      {customizeTable(
        {
          code: 'SODR.WORKSPACE_CREATEDMANUALLY.DETAILINFO',
          __force_record_to_update__: true,
          lovIgnore: false,
        },
        isCreate ? <Table {...tableProps} /> : <SearchBarTable {...tableProps} />
      )}
    </Fragment>
  );
};

export default DetailInfo;
