import React, { useMemo } from 'react';
import { Row, Col, Button, Table, DataSet, Icon } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { unAssignedTableDS, assignedTableDS } from './store';
import { deleteMaterial, addMaterial } from '@/services/quotationTemplateNewService';

const Material = ({ templateId, templateCode, templateStatus, templateDimension, pageReadonly }) => {
  const unAssignedTableDs = useMemo(
    () => new DataSet(unAssignedTableDS({ templateId, templateCode, templateStatus, pageReadonly, })),
    []
  );
  const assignedTableDs = useMemo(
    () => new DataSet(assignedTableDS({ templateId, templateStatus, pageReadonly, })),
    []
  );

  // 删除物料
  const handleDelete = () => {
    const { selected } = assignedTableDs;
    if (isEmpty(selected)) return;
    const params = selected.map((n) => ({ dimensionId: n.get('dimensionId') }));
    return deleteMaterial(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        // 清除缓存勾选项
        assignedTableDs.clearCachedSelected();
        assignedTableDs.unSelectAll();
        notification.success();
        unAssignedTableDs.query();
        assignedTableDs.query();
      }
    });
  };

  // 新增物料
  const handleAdd = () => {
    const { selected } = unAssignedTableDs;
    if (isEmpty(selected)) return;
    const params = {
      templateId,
      quotationDimensionType: templateDimension,
      quotationDimensionList: selected.map((n) => ({ itemCategoryId: n.get('itemCategoryId') })),
    };
    return addMaterial(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        // 清除缓存勾选项
        unAssignedTableDs.clearCachedSelected();
        unAssignedTableDs.unSelectAll();
        notification.success();
        unAssignedTableDs.query();
        assignedTableDs.query();
      }
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'itemCategoryCode',
      },
      {
        name: 'itemCategoryName',
      },
    ],
    []
  );

  return (
    <Row gutter={24} style={{ display: 'flex' }}>
      <Col span={11}>
        <Table dataSet={unAssignedTableDs} columns={columns} queryFieldsLimit={2} style={{ maxHeight: '500px', }} />
      </Col>
      <Col
        span={2}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button
          color="primary"
          icon="keyboard_arrow_left"
          disabled={templateStatus === 'RELEASED' || isEmpty(assignedTableDs.selected) || pageReadonly}
          onClick={handleDelete}
        >
          <Icon icon="keyboard_arrow_left" />
        </Button>
        <Button
          color="primary"
          icon="keyboard_arrow_right"
          disabled={templateStatus === 'RELEASED' || isEmpty(unAssignedTableDs.selected) || pageReadonly}
          onClick={handleAdd}
          style={{ marginLeft: 0 }}
        >
          <Icon icon="keyboard_arrow_right" />
        </Button>
      </Col>
      <Col span={11}>
        <Table dataSet={assignedTableDs} columns={columns} queryFieldsLimit={2} style={{ maxHeight: '500px', }} />
      </Col>
    </Row>
  );
};

export default observer(Material);
