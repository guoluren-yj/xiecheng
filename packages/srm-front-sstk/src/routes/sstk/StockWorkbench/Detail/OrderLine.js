import React, { useMemo, useEffect, useRef } from 'react';
import { Button, Lov } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import ImportButton from 'components/Import';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { DropdownBtn, DropdownMenuBtns } from '@/components/CommonButtons';

import QueryField from '../QueryField';
import { importCode, getLineSearchbarCode } from './custoCode';

export default observer(function OrderLine(props) {
  const {
    readOnly,
    orderLineDs,
    operateType = 'IN',
    baseInfoDs,
    customizeTable,
    customizeCode,
    inOutHeaderId,
    remote,
  } = props;

  const queryRef = useRef();

  const statusCode = baseInfoDs.current.get('statusCode');
  const info = baseInfoDs.current.get([
    'outInventoryId',
    'inInventoryId',
    'inCompanyId',
    'outCompanyId',
    'inInvOrganizationId',
    'outInvOrganizationId',
  ]);

  useEffect(() => {
    if (operateType === 'TRANSFER') {
      orderLineDs.records.forEach((r) => {
        r.set('customHeaderInfo', info);
      });
    }
  }, [orderLineDs.length]);

  const handleDelete = () => {
    const selectData = orderLineDs.selected;
    if (selectData.length > 0) {
      orderLineDs.delete(selectData, {
        title: <span>{intl.get('hzero.common.message.confirm.title').d('提示')}</span>,
        children: <span>{intl.get('sagm.common.modal.confirm.content').d('是否确定删除?')}</span>,
      });
    }
  };

  const handleItemChange = (record, lovData) => {
    if (!lovData) {
      record.set('currentStock', null);
    }
    const item = lovData || {};
    record.set('uomLov', {
      uomId: item.uomId,
      uomName: item.uomName,
    });
  };

  const locationChange = (record, lovData) => {
    if (!lovData) {
      record.set('currentStock', null);
    }
  };

  const handleNewCreate = () => {
    const cuxData = remote.process(
      'STOCK_WORKBENCH_LINE_CREATE_PROCESS',
      {},
      {
        operateType,
        baseInfoDs,
      }
    );
    orderLineDs.create(cuxData, 0);
    // 头行联动
    if (operateType === 'TRANSFER') {
      orderLineDs.records.forEach((r) => {
        r.set('customHeaderInfo', info);
      });
    }
  };

  const columns = useMemo(() => {
    const isTransfer = operateType === 'TRANSFER';
    const prefix = operateType === 'IN' ? 'in' : 'out';
    // 埋点: 优品道
    return remote
      .process(
        'LINE_COLUMNS',
        [
          {
            name: 'lineNum',
            width: 100,
          },
          {
            name: `${prefix}CompanyLov`,
            // width: 150,
            editor: !readOnly,
            show: !isTransfer,
          },
          {
            name: `${prefix}InvOrganizationLov`,
            width: 130,
            editor: !readOnly,
            show: !isTransfer,
          },
          {
            name: `${prefix}InventoryLov`,
            width: 120,
            editor: !readOnly,
            show: !isTransfer,
          },
          {
            name: 'itemLov',
            // width: 120,
            editor: (record) =>
              readOnly ? false : <Lov onChange={(lov) => handleItemChange(record, lov)} />,
          },
          {
            name: 'itemName',
            // width: 120,
            editor: !readOnly,
          },
          {
            name: 'uomLov',
            // width: 120,
            editor: !readOnly,
          },
          {
            name: 'batchNum',
            editor: !readOnly,
            show: operateType === 'IN',
          },
          {
            name: 'batchNumLov',
            editor: !readOnly,
            show: operateType !== 'IN',
          },
          {
            name: 'locationLov',
            // width: 120,
            editor: (record) =>
              readOnly ? false : <Lov onChange={(lov) => locationChange(record, lov)} />,
            show: !isTransfer,
          },
          {
            name: 'outLocationLov',
            editor: (record) =>
              readOnly ? false : <Lov onChange={(lov) => locationChange(record, lov)} />,
            show: isTransfer,
          },
          {
            name: 'inLocationLov',
            // width: 120,
            editor: !readOnly,
            show: isTransfer,
          },
          {
            name: 'modifiedNum',
            // width: 110,
            editor: !readOnly,
          },
          {
            name: 'currentStock',
            width: 110,
            show: operateType !== 'IN' && ['NEW', 'REJECTED'].includes(statusCode),
          },
        ],
        {
          operateType,
          statusCode,
          orderLineDs,
        }
      )
      .filter((f) => f.show !== false);
  }, [readOnly, operateType, statusCode, orderLineDs.getState('cuxFillFieldsEdit')]);

  const buttons = useMemo(() => [
    <DropdownMenuBtns
      width={120}
      menus={[
        {
          text: intl.get('sagm.common.button.manualCreate').d('手工新增'),
          onClick: handleNewCreate,
          funcType: 'link',
        },
        {
          childRef: (
            <ImportButton
              businessObjectTemplateCode={importCode[operateType]}
              refreshButton
              buttonText={intl.get('smpc.product.button.importNew').d('(新)导入')}
              prefixPatch="/stck"
              successCallBack={() => orderLineDs.query()}
              buttonProps={{
                icon: '',
                funcType: 'link',
                permissionList: [
                  {
                    code: 'sta.srm.mall.stock.stock_change.workbench.button.stock.import-new',
                    type: 'button',
                    meaning: '库存单据行导入（新）',
                  },
                ],
              }}
              args={{ inOutHeaderId }}
            />
          ),
        },
      ]}
    >
      <DropdownBtn
        text={intl.get('hzero.common.button.add').d('新增')}
        icon="playlist_add"
        funcType="flat"
      />
    </DropdownMenuBtns>,
    // <Button icon="playlist_add" funcType="flat" onClick={handleNewCreate}>
    //   {intl.get('hzero.common.btn.add').d('新增')}
    // </Button>,
    <Button
      funcType="flat"
      icon="delete_sweep"
      disabled={orderLineDs.selected.length === 0}
      onClick={handleDelete}
    >
      {intl.get('sstk.common.button.batchDelete').d('批量删除')}
    </Button>,
    // <ImportButton
    //   businessObjectTemplateCode={importCode[operateType]}
    //   refreshButton
    //   buttonText={intl.get('smpc.product.button.importNew').d('(新)导入')}
    //   prefixPatch='/stck'
    //   successCallBack={() => orderLineDs.query()}
    //   buttonProps={{
    //     icon: 'archive',
    //     funcType: 'flat',
    //     permissionList: [{
    //       code: 'sta.srm.mall.stock.stock_change.workbench.button.stock.import-new',
    //       type: 'button',
    //       meaning: '库存单据行导入（新）',
    //     }],
    //   }}
    //   args={{ inOutHeaderId }}
    // />,
  ]);
  return customizeTable(
    {
      code: customizeCode,
      readOnly,
    },
    <SearchBarTable
      dataSet={orderLineDs}
      searchCode={getLineSearchbarCode(operateType)}
      buttons={readOnly ? [] : buttons}
      columns={columns}
      searchBarConfig={{
        expandable: !readOnly,
        closeFilterSelector: true,
        left: {
          render: () => (
            <QueryField
              name="itemCodes"
              dataSet={orderLineDs}
              onRef={(ref) => {
                queryRef.current = ref;
              }}
              placeholder={intl
                .get('sstk.stockWorkbench.view.queryMsg.itemCode')
                .d('请输入物料编码查询')}
            />
          ),
        },
        onReset: () => {
          if (queryRef.current.handleClear) queryRef.current.handleClear();
        },
        onClear: () => {
          if (queryRef.current.handleClear) {
            queryRef.current.handleClear();
          }
        },
      }}
      style={{ maxHeight: 432 }}
    />
  );
});
