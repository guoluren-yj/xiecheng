/*
 * Bom - 工作台Bom弹窗
 * @date: 2021/05/26 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Fragment, useMemo, useEffect } from 'react';
import { DataSet, Table, Output, Form, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { bom } from './store/bomDs';

const tenantId = getCurrentOrganizationId();

const Bom = (props) => {
  const { record, readOnly, customizeTable, code, sourcePage } = props;

  useEffect(() => {
    bomDs.query();
  }, []);

  const bomDs = useMemo(
    () =>
      new DataSet({
        ...bom({ sourcePage, customizeUnitCode: code }),
        selection: readOnly ? false : 'multiple',
        queryParameter:
          sourcePage === 'all'
            ? {
                poHeaderId: record.get('poHeaderId'),
                poLineId: record.get('poLineId'),
              }
            : {
                //  itemId: record.get('itemId'),
                poHeaderId: record.get('poHeaderId'),
                poLineId: record.get('poLineId'),
                splQuantity: record.get('quantity'),
                // creatFlag: 0,
              },
      }),
    []
  );
  const columns = useMemo(
    () => [
      {
        name: 'orderSeq',
      },
      {
        name: 'itemLov',
        editor: true,
      },
      {
        name: 'itemName',
        editor: true,
      },
      {
        name: 'categoryLov',
        editor: true,
      },
      {
        name: 'quantity',
        editor: true,
      },
      {
        name: 'uomLov',
        editor: true,
      },
      {
        name: 'invOrganizationLov',
        editor: true,
      },
      {
        name: 'needByDate',
        editor: true,
      },
    ],
    []
  );

  const handleCreate = () => {
    bomDs.create({
      tenantId,
      needByDate: record.get('needByDate'),
      invOrganizationId: record.get('invOrganizationId'),
      invOrganizationName: record.get('invOrganizationName'),
      poHeaderId: record.get('poHeaderId'),
      poLineId: record.get('poLineId'),
      poLineLocationId: record.get('poLineLocationId'),
    });
  };

  const renderChildren = () => {
    const addButton = (
      <Button icon="add" funcType="flat" onClick={handleCreate}>
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>
    );
    return (
      <Fragment>
        <Form
          columns={2}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          style={{ marginBottom: '16px' }}
        >
          <Output
            label={intl.get('slod.orderExecution.model.common.itemCode').d('物料编码')}
            value={record.get('itemCode')}
          />
          <Output
            label={intl.get('slod.orderExecution.model.common.itemName').d('物料名称')}
            value={record.get('itemName')}
          />
        </Form>
        {customizeTable(
          { code },
          <Table
            dataSet={bomDs}
            columns={columns}
            editMode={readOnly ? 'inline' : 'cell'}
            buttons={readOnly ? [] : [addButton, 'delete', 'save']}
            style={{ maxHeight: 'calc(100vh - 200px)' }}
            virtual
            virtualCell
          />
        )}
      </Fragment>
    );
  };

  // const handleModal = useCallback(async () => {
  //   const children = renderChildren();
  //   if (readOnly) {
  //     Modal.open({
  //       footer: null,
  //       closable: true,
  //       style: { width: 1000 },
  //       title: intl.get('slod.orderExecution.view.title.bom').d('外协BOM'),
  //       children,
  //     });
  //     bomDs.query();
  //   } else {
  //     if (record.status === 'add') {
  //       Modal.info({
  //         children: intl
  //           .get('slod.orderExecution.view.info.noSaveBomLine')
  //           .d('该订单行未保存，bom信息不能维护，请先保存！'),
  //       });
  //       return;
  //     }
  //     Modal.open({
  //       footer: null,
  //       closable: true,
  //       style: { width: 1000 },
  //       title: intl.get('slod.orderExecution.view.title.bom').d('外协BOM'),
  //       children,
  //     });
  // if (record.get('saveBomItemId') !== record.get('itemId')) {
  //   const res = await getResponse(clearPoItemBOM({ poLineId: record.get('poLineId') }));
  //   if (res) {
  //     record.set({ saveBomItemId: record.get('itemId') });
  //   }
  // } else {
  //   bomDs.query();
  // }
  //   }
  // }, []);
  // return readOnly ? (
  //   <a disabled={!!disabled} onClick={handleModal}>
  //     {intl.get('hzero.common.button.look').d('查看')}
  //   </a>
  // ) : (
  //   <a disabled={!!disabled} onClick={handleModal}>
  //     {intl.get('hzero.common.button.maintain').d('维护')}
  //   </a>
  // );
  return renderChildren();
};

export default Bom;
