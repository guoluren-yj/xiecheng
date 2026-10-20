/**
 * 会员管理 - 积分列表弹窗
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Table } from 'choerodon-ui/pro';

const unitCode = 'SIGL.MEMBER_MEMBERMANAGMENT.POINT_DETAIL';

const PointsModal = (props) => {
  const { dataSet, customizeTable } = props;

  const columns = () => {
    return [
      {
        name: 'creationDate',
        width: 180,
      },
      {
        name: 'operationType',
      },
      {
        name: 'pointsTypeName',
      },
      {
        name: 'operationIntegralTotal',
      },
      {
        name: 'remarksMeaning',
      },
    ];
  };

  return (
    <>
      {customizeTable(
        { code: unitCode },
        <Table
          dataSet={dataSet}
          columns={columns()}
          queryFieldsLimit={2}
          customizedCode="SIGL.MEMBER_MEMBERMANAGMENT.POINT_LOG"
          style={{ maxHeight: `calc(100vh - 264px)` }}
        />
      )}
    </>
  );
};

export default PointsModal;
