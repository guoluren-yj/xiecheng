import React, { useContext } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { Lov, Modal } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import DynamicButtons from '_components/DynamicButtons';
import { Store } from './index';
import {
  delLineInventory,
  handleUpdateInventory,
  handleGetInventory,
  handleSaveDetailAll,
} from '@/services/PurchaseCollaborativeWorkbenchService';
import { showBigNumber } from '@/routes/components/utils';
import { useInventoryModal, useTable } from '../hooks';

function BaseInfo() {
  const {
    baseInfoDs,
    customizeTable,
    editFlag,
    processFactory,
    activeKey,
    HeaderDs,
    loading,
    sourceCode,
    handleQueryInfo,
    attachmentDs,
    getUnitCode,
    customizeBtnGroup,
    remote,
  } = useContext(Store);
  const SRMFlag = sourceCode === 'SRM';
  const differenceFlag = processFactory === '1';
  const isDetailOnly = activeKey !== 'all' && activeKey !== 'affirm';
  const isEditor = !editFlag;
  const handleCateChange = (id, name, uomPrecision, record) => {
    if (id) {
      record.set('itemName', name);
      record.set('uomIdLov', { ...record.toData()?.itemIdLov });
      record.set('uomName', record.toData()?.itemIdLov?.uomName);
      record.set('uomPrecision', uomPrecision);
    } else {
      record.set('itemName', null);
      record.set('uomId', null);
    }
  };
  const preColumns = [
    {
      name: 'invLineNum',
      align: 'left',
      width: 140,
    },
    {
      name: 'invOrganizationId',
      width: 140,
      editor: isEditor && SRMFlag && isDetailOnly,
    },
    {
      name: 'itemIdLov',
      width: 110,
      fixed: 'left',
      editor: (record) =>
        isEditor &&
        SRMFlag &&
        isDetailOnly &&
        !record.get('internalAddQuantity') &&
        !record.get('internalReduceQuantity') ? (
          <Lov
            onChange={(lovRecord) => {
              const item = lovRecord || {};
              handleCateChange(item.uomId, item.itemName, item.uomPrecision, record);
            }}
          />
        ) : (
          false
        ),
    },
    {
      name: 'itemName',
      align: 'left',
      width: 140,
      fixed: 'left',
    },
    {
      name: 'uomIdLov',
      width: 140,
    },
    differenceFlag && {
      name: 'inspectQuantity',
      width: 140,
      editor: isEditor && ['affirm', 'submit'].includes(activeKey),
      renderer: ({ value }) => showBigNumber(value),
    },
    differenceFlag && {
      name: 'theoryQuantity',
      width: 140,
    },
    processFactory === '2' && {
      name: 'sourceNum',
      width: 150,
    },
    {
      name: 'quantity',
      width: 150,
      editor: isEditor && isDetailOnly,
      renderer: ({ value }) =>
        processFactory === '1' ? <span>{value}</span> : showBigNumber(value),
    },
    (activeKey === 'affirm' || activeKey === 'all') &&
      !differenceFlag && {
        name: 'affirmQuantity',
        width: 150,
        editor: activeKey !== 'all',
        renderer: ({ value }) => showBigNumber(value),
      },
    differenceFlag && {
      name: 'internalAddQuantity',
      width: 150,
    },
    differenceFlag && {
      name: 'internalReduceQuantity',
      width: 150,
    },
    {
      name: 'inventoryId',
      align: 'left',
      width: 130,
      editor: isEditor && isDetailOnly,
    },
    {
      name: 'locationId',
      width: 110,
      align: 'left',
      editor: isEditor && isDetailOnly,
    },
    {
      name: 'lotNum',
      width: 150,
      editor: isEditor && isDetailOnly,
    },
    {
      name: 'lineAttachmentUuid',
      width: 130,
      editor: isEditor && isDetailOnly,
    },

    differenceFlag && {
      name: 'action',
      width: 130,
      renderer: useInventoryModal(HeaderDs),
    },
    {
      name: 'purchaseAgentId',
      width: 130,
      editor: isEditor && SRMFlag && isDetailOnly,
    },
  ];

  const columns = remote
    ? remote.process(
        'SINV_SUPPLIERCOLLABORATIVEWORKBENCH_REMOTE_PROCESS_DETAIL_COLUMN',
        preColumns,
        { isEditor, SRMFlag, isDetailOnly }
      )
    : preColumns;

  const handleDel = () => {
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('sinv.inventoryBench.model.view.help').d('提示'),
      children: (
        <div>
          <p>{intl.get('sinv.inventory.model.view.orderDelete').d(`确认删除选中行？`)}</p>
        </div>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        const params = baseInfoDs.selected.map((i) => i.toJSONData()).filter((i) => i.invLineNum);
        if (params.length > 0) {
          delLineInventory({ params, activeKey }).then((res) => {
            if (getResponse(res)) {
              baseInfoDs.query();
              baseInfoDs.remove(baseInfoDs.selected, true);
            }
          });
        } else {
          baseInfoDs.remove(baseInfoDs.selected, true);
        }
      },
    });
  };

  const handleRefresh = async () => {
    const headerFlag = await HeaderDs.validate();
    const baseInfoFlag = await baseInfoDs.validate();
    const attachmentFlag = await attachmentDs.validate();
    const prevSave = baseInfoDs.selected.map((i) => i.toJSONData()).filter((i) => !i.invLineNum);
    if (headerFlag && baseInfoFlag && attachmentFlag) {
      if (prevSave?.length) {
        return notification.warning({
          message: intl
            .get('slod.deliveryWorkbench.model.view.orderSvaTip')
            .d(`请先执行【保存】操作，后重新触发逻辑操作`),
        });
      }
      const params = {
        activeKey,
        ...HeaderDs.map((i) => i.toJSONData())[0],
        stockOutInvLineList: baseInfoDs.map((i) => i.toJSONData()),
        headerAttachmentUuid: attachmentDs?.current?.toJSONData()?.headerAttachmentUuid,
      };
      handleSaveDetailAll(params).then((res) => {
        if (getResponse(res)) {
          const param = {
            activeKey,
            ...HeaderDs.map((i) => i.toJSONData())[0],
            stockOutInvLineList: baseInfoDs.selected.map((i) => i.toJSONData()),
            ...attachmentDs?.current?.toJSONData(),
          };
          handleUpdateInventory([param]).then((res2) => {
            if (getResponse(res2)) {
              notification.success();
            }
            handleQueryInfo();
          });
        }
      });
    }
  };

  const handleGetData = async () => {
    const headerFlag = await HeaderDs.validate();
    const baseInfoFlag = await baseInfoDs.validate();
    const attachmentFlag = await attachmentDs.validate();
    const prevSave = baseInfoDs.selected.map((i) => i.toJSONData()).filter((i) => !i.invLineNum);
    if (headerFlag && baseInfoFlag && attachmentFlag) {
      if (prevSave?.length) {
        return notification.warning({
          message: intl
            .get('slod.deliveryWorkbench.model.view.orderSvaTip')
            .d(`请先执行【保存】操作，后重新触发逻辑操作`),
        });
      }
      const params = {
        activeKey,
        ...HeaderDs.map((i) => i.toJSONData())[0],
        stockOutInvLineList: baseInfoDs.map((i) => i.toJSONData()),
        headerAttachmentUuid: attachmentDs?.current?.toJSONData()?.headerAttachmentUuid,
      };
      handleSaveDetailAll(params).then((res) => {
        if (getResponse(res)) {
          const param = baseInfoDs.selected.map((i) => i.toJSONData());
          handleGetInventory({ param, activeKey }).then((res2) => {
            if (getResponse(res2)) {
              notification.success();
            }
            handleQueryInfo();
          });
        }
      });
    }
  };

  const handleAdd = () => {
    baseInfoDs.create({}, 0);
  };

  const getButtons = () => {
    const Buttons = observer(({ dataSet }) => {
      const preBtns = [
        activeKey === 'submit' && {
          name: 'add',
          btnType: 'c7n-pro',
          child: intl.get('hzero.common.button.add').d('新增'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'playlist_add',
            onClick: handleAdd,
          },
        },
        activeKey === 'submit' && {
          name: 'delete',
          btnType: 'c7n-pro',
          child: intl.get('hzero.common.button.batchdelete').d('批量删除'),
          btnProps: {
            funcType: 'flat',
            color: 'primary',
            icon: 'delete_sweep',
            onClick: handleDel,
            disabled: isEmpty(dataSet?.selected),
          },
        },
        differenceFlag && {
          name: 'getRefresh',
          btnType: 'c7n-pro',
          child: intl.get('hzero.common.button.addInventory').d('获取库存现有量'),
          btnProps: {
            funcType: 'flat',
            icon: 'refresh',
            onClick: handleGetData,
            disabled: isEmpty(dataSet?.selected),
          },
        },
        differenceFlag && {
          name: 'refresh',
          btnType: 'c7n-pro',
          child: intl.get('hzero.common.button.updateInventory').d('更新周期发料/消耗'),
          btnProps: {
            funcType: 'flat',
            icon: 'refresh',
            onClick: handleRefresh,
            disabled: isEmpty(dataSet?.selected),
          },
        },
      ];

      const btns = remote
        ? remote.process(
            'SINV_SUPPLIERCOLLABORATIVEWORKBENCH_REMOTE_PROCESS_DETAIL_BTNS',
            preBtns,
            { HeaderDs, baseInfoDs }
          )
        : preBtns;
      return activeKey === 'submit'
        ? customizeBtnGroup(
            { code: `SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIIL.BTNS`, pro: true },
            <DynamicButtons buttons={btns.filter(Boolean)} />
          )
        : null;
    });

    return [<Buttons dataSet={baseInfoDs} />];
  };

  return useTable(baseInfoDs, columns, {
    customizeTable,
    code: getUnitCode(processFactory).units[1],
    isEditor,
    buttons: getButtons(),
    loading,
    editFlag,
  });
}

export default BaseInfo;
