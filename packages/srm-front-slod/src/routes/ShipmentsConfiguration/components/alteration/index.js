import React, { Fragment, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { compose, isEmpty } from 'lodash';
import { getResponse, getUserOrganizationId } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
// import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import {
  saveAlterModal,
  handleLineDel,
  handleReference,
} from '@/services/ShipmentsConfigurationService';
import { indexDS } from './indexDS';

const tenantId = getUserOrganizationId();

const AlterationIndex = forwardRef((props, ref) => {
  const { urlFlag, classify, strategyLineId = null, nodeTemplateCode = null, _record } = props;
  const indexDs = useMemo(() => new DataSet(indexDS(nodeTemplateCode, _record)), [strategyLineId]);
  // indexDs.bind(chartsDs, 'chartsDs');

  useEffect(() => {
    indexDs.forEach((record) => {
      Object.assign(record, { _record });
    });
    indexDs.setQueryParameter('params', {
      strategyLineId,
      nodeTemplateCode,
    });
    indexDs.query();
  }, []);
  useImperativeHandle(ref, () => ({
    ref: ref.current,
    saveOnChange,
  }));

  const saveOnChange = async () => {
    const data = indexDs.toData();
    const params = { strategyLineId, data };
    const flag = await indexDs.validate();
    if (flag) {
      const res = await saveAlterModal(params);
      if (getResponse(res)) {
        notification.success();
        indexDs.query(indexDs.currentPage);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const lineDelete = (select, dataSet) => {
    const selectedData = select.map((item) => item.toJSONData());
    const deleteFlag = selectedData.some((i) => i.changeFieldId);
    const data = selectedData.filter((i) => i.changeFieldId);
    if (deleteFlag) {
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
          const res = await handleLineDel({ data });
          if (getResponse(res)) {
            dataSet.query(dataSet.currentPage);
          }
        },
      });
    } else {
      dataSet.remove(select);
    }
  };

  const onReference = async (dataSet) => {
    const res = await handleReference({ strategyLineId, nodeTemplateCode });
    if (getResponse(res)) {
      dataSet.query();
    }
  };

  const lineAdd = (dataSet) => {
    const dataList = {
      tenantId,
      strategyLineId,
    };
    dataSet.create(dataList, 0);
  };

  const columns = [
    {
      name: 'fieldType',
      width: 120,
      editor: !classify,
    },
    {
      name: 'fieldLocation',
      width: 140,
      editor: !classify,
    },
    {
      name: 'fieldAll',
      width: 140,
      editor: !classify,
    },
    {
      name: 'changeVersion',
      width: 140,
      editor: !classify,
    },
    {
      name: 'purchaserFlag',
      width: 140,
      editor: !classify,
    },
    {
      name: 'changeApprovalFlag',
      width: 140,
      editor: !classify,
    },
    {
      name: 'supplierConfirmFlag',
      width: 140,
      editor: !classify,
    },
    {
      name: 'supplierFlag',
      width: 140,
      editor: !classify,
    },
    {
      name: 'purchaserApprovalFlag',
      width: 140,
      editor: !classify,
    },
    {
      name: 'purchaserConfirmFlag',
      width: 140,
      editor: !classify,
    },
    {
      name: 'exportEsFlag',
      width: 140,
      editor: !classify,
    },
  ];

  const LineBtn = observer(({ dataSet }) => {
    if (urlFlag) {
      return;
    }
    return (
      <>
        <Button
          type="c7n-pro"
          funcType="flat"
          color="primary"
          icon="playlist_add"
          onClick={() => lineAdd(dataSet)}
          disabled={window.classify === 'history'}
        >
          {intl.get(`hzero.common.button.add`).d('新增')}
        </Button>
        <Button
          type="c7n-pro"
          funcType="flat"
          color="primary"
          icon="delete_sweep"
          disabled={isEmpty(dataSet?.selected) || window.classify === 'history'}
          onClick={() => lineDelete(dataSet.selected, dataSet)}
        >
          {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
        </Button>
        <Button
          type="c7n-pro"
          funcType="flat"
          color="primary"
          icon="application_allocation"
          onClick={() => onReference(dataSet)}
          disabled={window.classify === 'history'}
        >
          {intl.get(`slod.deliveryWorkbench.view.message.reference`).d('一键引用')}
        </Button>
      </>
    );
  });

  return (
    <Fragment>
      <div style={{ height: 'calc(100vh - 200px)' }}>
        <FilterBarTable
          boxSizing="wrapper"
          customizedCode="node-codes"
          style={{ maxHeight: `calc(100% - 22px)` }}
          columns={columns}
          dataSet={indexDs}
          selectionMode={window.classify !== 'history' ? 'rowbox' : 'none'}
          buttons={[<LineBtn dataSet={indexDs} />]}
          filterBarConfig={{
            expandable: true,
            collpaseble: true,
            defaultCollpase: true,
            expand: true,
            fields: [
              {
                name: 'fieldName',
                label: intl.get('slod.deliveryWorkbench.model.common.fieldCode').d('字段编码'),
                display: true,
                merge: true,
              },
            ],
          }}
        />
      </div>
    </Fragment>
  );
});

export default compose(
  WithCustomize({
    unitCode: ['SLOD.SHIPMENTS_CONFIGURATION.SEARCH'],
    queryMethod: 'POST',
  })
)(AlterationIndex);
