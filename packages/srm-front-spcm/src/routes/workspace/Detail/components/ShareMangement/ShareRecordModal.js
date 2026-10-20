/**
 * 协议详情-共享记录
 */
import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import SearchBarTable from '_components/SearchBarTable';
import { Alert } from 'choerodon-ui';
import { compose } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import styles from './index.less';

const ShareRecordModal = (props) => {
  const { customizeTable, dataSet } = props;
  const [infoVisiable, setInfoVisiable] = useState(true);

  const columns = [
    {
      name: 'version',
      width: 100,
    },
    {
      name: 'shareType',
      width: 100,
    },
    {
      name: 'shareName',
      width: 120,
    },
    {
      name: 'roleName',
      width: 120,
    },
    {
      name: 'isShareContract',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(value === '1' ? 1 : 0),
    },
    {
      name: 'isFinish',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(value === '1' ? 1 : 0),
    },
    // {
    //   name: 'comment',
    //   width: 100,
    // },
    {
      name: 'createdName',
      width: 100,
    },
    {
      name: 'creationDate',
      width: 150,
    },
  ];

  const getTableRender = useCallback(() => {
    return customizeTable(
      {
        code: 'SPCM.WORKSPACE_DETAIL.SHARE_MANGEMENT.HISTORY',
        lovIgnore: false,
      },
      <SearchBarTable
        searchCode="SPCM.WORKSPACE_DETAIL.SHARE_MANGEMENT.HISTORY.FILTER"
        dataSet={dataSet}
        columns={columns}
        style={{ maxHeight: 'calc(100% - 100px)', padding: '20px' }}
        searchBarConfig={{
          closeFilterSelector: true,
        }}
      />
    );
  });

  return (
    <>
      {infoVisiable ? (
        <div className={styles['alert-wrapper']}>
          <Alert
            message={intl
              .get('spcm.workspace.view.alert.onlyVersionNum')
              .d('被清空版本仅保留版本号')}
            type="info"
            showIcon
            closable
            afterClose={() => {
              setInfoVisiable(false);
            }}
          />
        </div>
      ) : null}
      {getTableRender()}
    </>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SPCM.WORKSPACE_DETAIL.SHARE_MANGEMENT.HISTORY',
      'SPCM.WORKSPACE_DETAIL.SHARE_MANGEMENT.HISTORY.FILTER',
    ],
  }),
  observer
)(ShareRecordModal);
