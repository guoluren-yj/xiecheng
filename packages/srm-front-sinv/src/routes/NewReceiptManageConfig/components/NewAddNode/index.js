import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { recursion } from '@/utils/utils';
import { addLineCharts } from '@/services/receiptManageConfigService';

const organizationId = getCurrentOrganizationId();

function NewAddNode(props, ref) {
  const {
    data,
    chartList,
    chartsId,
    useSpin = (e) => e,
    destroyModal = (e) => e,
    publicuFunction = (e) => e,
  } = props;

  useEffect(() => {
    props.tableDs.reset();
    props.tableDs.setQueryParameter('params', {
      asyncCountFlag: 'DEFAULT',
      tenantId: organizationId,
      // lovCode: 'SINV.NODE_CONFIG_STRATEGY_PC',
      lovCode: 'SINV.NODE_CONFIG_STRATEGY',
    });
    props.tableDs.query();
  }, []);

  useImperativeHandle(ref, () => ({
    handleSaveAddNode,
  }));

  const onRows = (record) => {
    return {
      onClick: () => props.tableDs.select(record),
      onDoubleClick: async () => {
        const newData = [];
        const nodeForm = record.data || {};
        if (isEmpty(chartList)) {
          newData.push({ ...nodeForm, lineSeq: 1, strategyHeaderId: chartsId });
        } else {
          const list = recursion([chartList], 'children', []);
          list.forEach((item, index) => {
            if (item.nodeConfigId === data.nodeConfigId) {
              list.splice(index + 1, 0, {
                ...nodeForm,
                lineSeq: index + 2,
                strategyHeaderId: chartsId,
              });
              newData.push(...list);
            }
          });
        }
        try {
          useSpin(true);
          const returnedValue = await addLineCharts({ newData, id: chartsId });
          const res = getResponse(returnedValue);
          if (getResponse(res)) {
            publicuFunction(res);
            destroyModal();
          }
        } catch (e) {
          throw e;
        } finally {
          useSpin(false);
        }
      },
    };
  };

  const handleSaveAddNode = async () => {
    const nodeData = props.tableDs?.selected.map((item) => item.toData())[0];
    if (!isEmpty(nodeData)) {
      const newData = [];
      if (isEmpty(chartList)) {
        newData.push({ ...nodeData, lineSeq: 1, strategyHeaderId: chartsId });
      } else {
        const list = recursion([chartList], 'children', []); // 调用递归后的数据
        list.forEach((item, index) => {
          if (item.nodeConfigId === data.nodeConfigId) {
            list.splice(index + 1, 0, {
              ...nodeData,
              lineSeq: index + 2,
              strategyHeaderId: chartsId,
            });
            newData.push(...list);
          }
        });
      }
      try {
        useSpin(true);
        const returnedValue = await addLineCharts({ newData, id: chartsId });
        const res = getResponse(returnedValue);
        if (getResponse(res)) {
          publicuFunction(res);
          destroyModal();
        }
      } catch (e) {
        throw e;
      } finally {
        useSpin(false);
      }
    } else {
      useSpin(false);
      notification.warning({
        message: intl
          .get(`slod.shipmentsConfiguration.view.message.nodeConfigId`)
          .d('请选择子节点'),
      });
      return false;
    }
  };

  const columns = [
    {
      name: 'nodeConfigName',
      with: 100,
    },
  ];

  return (
    <>
      <div style={{ height: 'calc(100vh - 280px)' }}>
        <Table
          onRow={({ record }) => onRows(record)}
          queryFieldsLimit={2}
          columns={columns}
          dataSet={props.tableDs}
          boxSizing="wrapper"
          style={{ maxHeight: `calc(100% - 40px)` }}
        />
      </div>
    </>
  );
}

export default forwardRef(NewAddNode);
