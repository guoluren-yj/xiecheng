import React from 'react';
import { Tag, } from 'choerodon-ui';

/**
 * ALLOCATED	已分配

  APPROVING	审批中

  REJECTED	审批拒绝

  FINISHED	完成
*/

const statusRender = (data) => {
  const {
    status,
    statusMeaning,
  } = data || {};

  if (!status) {
    return "";
  }

  let color = "green";

  if (status === "ALLOCATED") {
    color = "green";
  }

  if (status === "APPROVING") {
    color = "yellow";
  }

  if (status === "REJECTED") {
    color = "red";
  }

  if (status === "FINISHED") {
    color = "green";
  }


  return (
    <Tag color={color}>
      {statusMeaning}
    </Tag>
  );
};

export {
  statusRender,
};
