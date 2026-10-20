import React, { useMemo } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import styles from '../styles.less';

const CheckList = props => {
  const { checkList } = props;

  const dataSet = useMemo(
    () =>
      new DataSet({
        selection: false,
        paging: false,
        data: checkList,
      }),
    []
  );

  const columns = useMemo(
    () => [
      {
        name: 'productName',
        width: 140,
        header: intl.get(`small.common.model.common.ecProductName`).d('商品名称'),
      },
      {
        name: 'templateName',
        header: intl.get(`small.common.model.common.repeatTips`).d('重复提示'),
        renderer: ({ value }) => {
          return (
            <span style={{ color: '#E64322' }}>
              {intl.get('small.centralize.view.checkErrMsg1', { value }).d(`已在【${value}】中`)}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: '16px', padding: '24px 0 16px' }}>
        {intl.get('small.common.view.tips').d('提示')}
      </div>
      <div style={{ marginBottom: 16 }}>
        {intl
          .get('small.centralize.view.repeatSkuMsg')
          .d(
            '以下商品已存在其他已发布的拼单活动中，故无法加入此活动，如需添加请删除其他拼单活动中的该商品后再添加。'
          )}
      </div>
      <Table dataSet={dataSet} columns={columns} style={{ maxHeight: 'calc(100vh - 360px)' }} />
    </div>
  );
};

export default function openRepeatList(props) {
  return Modal.open({
    header: null,
    bodyStyle: { paddingTop: 0 },
    style: { width: 520 },
    className: styles['publish-confirm-modal'],
    border: false,
    autoCenter: true,
    closable: true,
    cancelButton: false,
    children: <CheckList {...props} />,
  });
}
