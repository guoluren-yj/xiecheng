/*
 * @Description: 外部寻源-utils
 * @Date: 2025-05-22 16:12:54
 * @Author: zuoxiangyu <xiangyu.zuo@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2025, Hand
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
// import { SRM_PLATFORM } from '_utils/config';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
// import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';

import { batchDelete } from '@/services/outsideProjectSetupService';
import CreatedBtn from './components/CreatedBtn';
// import { organizationId } from './utils';

const HeaderBtns = observer(
  ({ tabKey, loading, dispatch, mixObj, lineDataSet, setLoading, customizeBtnGroup }) => {
    // 删除回调
    const handleDelete = ds => {
      if (ds) {
        setLoading(true);
        const selectedRows = ds.selected.map(i => i.toData());
        return batchDelete(selectedRows)
          .then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              ds.query(ds.currentPage, null, false);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };

    const buttons = [
      {
        name: 'create',
        childFor: 'buttonText',
        btnComp: CreatedBtn,
        btnProps: {
          mixObj,
          tabKey,
          dispatch,
          loading,
          setLoading,
        },
      },
      {
        name: 'delete',
        child: name => name || intl.get('hzero.common.button.detele').d('删除'),
        hidden: tabKey !== 'waitPublish',
        btnProps: {
          funcType: 'flat',
          icon: 'delete',
          onClick: () => handleDelete(lineDataSet?.waitPublish),
          disabled: isEmpty(lineDataSet?.waitPublish?.selected),
        },
      },
      // {
      //   name: 'export',
      //   btnType: 'c7n-pro',
      //   btnComp: ExcelExportPro,
      //   childFor: 'buttonText',
      //   hidden: !['all'].includes(tabKey),
      //   child: name => name || intl.get('hzero.common.view.button.export').d('导出'),
      //   btnProps: {
      //     allBody: true,
      //     method: 'POST',
      //     templateCode: `SRM_C_SPFM_EXT_SOURCE_REQ_LIST_ALL`,
      //     queryParams: {
      //       ...filterNullValueObject({
      //         ...lineDataSet?.all?.queryDataSet?.current?.toData()[0],
      //       }),
      //     },
      //     requestUrl: `${SRM_PLATFORM}/v1/${organizationId}/ext-source-reqs/export`,
      //     buttonText: intl.get('hzero.common.view.button.export').d('导出'),
      //     otherButtonProps: {
      //       icon: 'unarchive',
      //       type: 'c7n-pro',
      //       funcType: 'flat',
      //     },
      //   },
      // },
    ].filter(i => !i.hidden);

    return customizeBtnGroup(
      { code: 'SSLM_OUTSIEDPROJECTSETUP.LIST.LIST_BTNS', pro: true },
      <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />
    );
  }
);

export default HeaderBtns;
