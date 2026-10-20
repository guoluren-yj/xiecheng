import React, { useMemo } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import styles from './styles.less';

const CheckList = props => {
  const { checkList, callback, modal } = props;

  const dataSet = useMemo(
    () =>
      new DataSet({
        paging: false,
        selection: false,
        data: checkList,
      }),
    []
  );

  // modal.handleOk(() =>
  //   callback(dataSet.map(m => ({ ...m.toData(), confirmFlag: m.isSelected ? 1 : 0 })))
  // );

  const columns = useMemo(
    () => [
      {
        name: 'productName',
        width: 140,
        header: intl.get(`small.common.model.common.ecProductName`).d('商品名称'),
      },
      {
        name: 'errorMessage',
        header: intl.get(`small.common.model.common.repeatTips`).d('重复提示'),
        renderer: ({ value, record }) => {
          return (
            <span style={{ color: '#E64322' }}>
              {record.get('existsFlag') === 1
                ? intl.get('small.centralize.view.checkErrMsg1', { value }).d(`已在【${value}】中`)
                : intl
                    .get('small.centralize.view.checkErrMsg2', { value })
                    .d(`已在【${value}】中，且已加入拼单篮`)}
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
          .get('small.centralize.view.confirmPublishMsg')
          .d(
            '以下商品已存在其他拼单活动中，请删除其他拼单活动中的或删除此次拼单活动中的重复商品后再发布。'
          )}
      </div>
      <Table dataSet={dataSet} columns={columns} style={{ maxHeight: 'calc(100vh - 360px)' }} />
    </div>
  );
};

export default function openCheckList(props) {
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
