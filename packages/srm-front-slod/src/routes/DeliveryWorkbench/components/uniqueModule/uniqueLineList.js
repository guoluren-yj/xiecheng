/*
 * @Description: 发货工作台
 * @Date: 2021-12-09 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import request from 'hzero-front/lib/utils/request';
import { SRM_SLOD } from '_utils/config';

import { uniquelineListDataSet } from './uniqueLineListDS';
import { showBigNumber } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

const UniqueLineList = forwardRef((props, ref) => {
  const {
    headerId,
    lineId,
    lineDs,
    modalFlag,
    campKey,
    tplInfo = {},
    customizeCode,
    modalType = false,
    customizeTable = (e) => e,
  } = props;
  const nodeTypeCode = (customizeCode && customizeCode?.slice(-1)) || null;
  const lableLineDs = useMemo(() => new DataSet(uniquelineListDataSet(lineId)), [headerId]);
  useEffect(() => {
    const params = isEmpty(tplInfo)
      ? {}
      : {
          ...tplInfo,
          cuszTplTemplateCode: tplInfo.templateCode,
          cuszTplVersion: tplInfo.templateVersion,
        };
    lableLineDs.setQueryParameter('params', {
      customizeUnitCode: `SLOD.DELIVERY__WORKBENCH_UNIQUE_LABEL_${nodeTypeCode || 'A'}.${
        !modalType ? 'LIST' : 'DETAIL'
      }_UNLBBEL`,
      labelHeaderId: headerId,
      labelLineId: lineId,
      campKey,
      ...params,
    });
    lableLineDs.query();
  }, [headerId]);

  useImperativeHandle(ref, () => ({
    ref: ref.current,
    lableLineDs,
  }));

  const lineDelete = (dataSet, ds) => {
    const lineList = dataSet.selected.map((item) => item.toJSONData());
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
      children: (
        <div>
          <p>{intl.get('slod.deliveryWorkbench.view.message.orderDel').d(`确认删除选中行？`)}</p>
        </div>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: async () => {
        const res = await request(
          `${SRM_SLOD}/v1/${organizationId}/delivery/unique-label?campKey=${campKey}`,
          {
            method: 'DELETE',
            body: lineList,
          }
        );
        if (getResponse(res)) {
          try {
            (ds || lineDs).query();
          } catch (e) {
            throw e;
          } finally {
            dataSet.query();
          }
        }
      },
    });
  };

  const LineBtn = observer(({ dataSet }) => {
    return (
      <>
        <Button
          type="c7n-pro"
          funcType="flat"
          color="primary"
          icon="delete_sweep"
          disabled={isEmpty(dataSet?.selected)}
          onClick={() => lineDelete(dataSet, lineDs)}
        >
          {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
        </Button>
      </>
    );
  });

  const columns = [
    {
      name: 'uniqueLabelNum',
      width: 160,
    },
    {
      name: 'lineExtNum',
      width: 160,
    },
    {
      name: 'itemCode',
      width: 160,
    },
    {
      name: 'itemName',
      width: 160,
    },
    {
      name: 'unitPackageQuantity',
      width: 160,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'volumeLength',
      width: 160,
    },
    {
      name: 'volumeWidth',
      width: 160,
    },
    {
      name: 'volumeHeight',
      width: 160,
    },
    {
      name: 'netWeight',
      width: 160,
    },
    {
      name: 'grossWeight',
      width: 160,
    },
  ];

  return (
    <Fragment>
      <div style={{ height: modalFlag ? 'calc(100vh - 155px)' : 'none' }}>
        {customizeTable(
          {
            code: `SLOD.DELIVERY__WORKBENCH_UNIQUE_LABEL_${nodeTypeCode || 'A'}.${
              !modalType ? 'LIST' : 'DETAIL'
            }_UNLBBEL`,
            __force_record_to_update__: true,
            readOnly: modalFlag,
          },
          <Table
            virtual
            dataSet={lableLineDs}
            columns={columns}
            pagination={{
              pageSizeOptions: ['10', '20', '50', '100', '200'],
              pageSize: 20,
            }}
            style={modalFlag ? { maxHeight: `calc(100% - 22px)` } : { maxHeight: 370 }}
            virtualCell
            buttons={[!modalFlag && <LineBtn dataSet={lableLineDs} />]}
          />
        )}
      </div>
    </Fragment>
  );
});

export default UniqueLineList;
