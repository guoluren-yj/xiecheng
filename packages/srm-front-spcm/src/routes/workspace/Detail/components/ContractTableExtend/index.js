/*
 * @Description: 自定义行表
 * @Date: 2024-03-05 16:27:40
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { isEmpty } from 'lodash';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { observer } from 'mobx-react-lite';

import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';

const organizationId = getCurrentOrganizationId();

const ContractTableExtend = (props) => {
  const { tableExtendDs, editable, customizeTable, customizeBtnGroup, pcHeaderId, remoteWorkDetail } = props;

  const handleCreate = () => {
    tableExtendDs.create({}, 0);
  };

  const handleDelete = async () => {

    if (remoteWorkDetail) {
      const eventProps = {
        tableExtendDs,
      };
      const cuxResult = await remoteWorkDetail.event.fireEvent(
        'cuxHandleExtendTableDelete',
        eventProps
      );
      if (!cuxResult) {
        return;
      }
    }

    const msgFlag = tableExtendDs.selected?.some((item) => item.status !== 'add');
    // 删除线上数据
    tableExtendDs.delete(
      tableExtendDs.selected,
      msgFlag && {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      }
    );
  };

  const HeaderButtons = observer((props) => {
    const selectedRows = props.dataSet.selected || [];
    const buttonCommonProps = {
      color: 'primary',
      funcType: 'flat',
    };

    return customizeBtnGroup(
      {
        code: 'SPCM.WORKSPACE_DETAIL.TABLEEXTEND.BTN_GROUP',
        pro: true,
      },
      <DynamicButtons
        buttons={[
          {
            name: 'create',
            btnType: 'c7n-pro',
            btnProps: {
              ...buttonCommonProps,
              icon: 'playlist_add',
              onClick: handleCreate,
            },
            child: intl.get('hzero.common.btn.add').d('新增'),
          },
          {
            name: 'delete',
            btnType: 'c7n-pro',
            btnProps: {
              ...buttonCommonProps,
              icon: 'delete_sweep',
              disabled: isEmpty(selectedRows),
              onClick: handleDelete,
            },
            child: intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
          },
          {
            name: 'newImport',
            btnComp: CommonImport,
            btnProps: {
              businessObjectTemplateCode: 'SRM_PC_TABLE_EXTEND_IMPORT',
              prefixPatch: '/spcm',
              buttonText: intl.get('hzero.common.button.Import').d('导入'),
              args: {
                pcHeaderId,
                fromExport: true,
              },
              buttonProps: buttonCommonProps,
              successCallBack: () => {
                notification.success();
                tableExtendDs.query();
              },
            },
          },
          {
            name: 'newExport',
            btnComp: ExcelExportPro,
            btnType: 'c7n-pro',
            btnProps: {
              allBody: true,
              method: 'POST',
              templateCode: 'SRM_C_TABLE_EXTEND_EXPORT',
              otherButtonProps: {
                ...buttonCommonProps,
                icon: 'unarchive',
              },
              buttonText: isEmpty(selectedRows)
                ? intl.get(`spcm.common.button.newExport`).d('新版导出')
                : intl.get(`hzero.common.checkedExport`).d('勾选导出'),
              requestUrl: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchase-view/pc-table-extend/excel-export`,
              queryParams: isEmpty(selectedRows)
                ? {
                    pcHeaderId,
                  }
                : { pcTableExtendIds: selectedRows.map((row) => row.get('pcTableExtendId')) },
            },
          },
        ]}
      />
    );
  });

  return (
    <>
      {editable && <HeaderButtons dataSet={tableExtendDs} />}
      {customizeTable(
        {
          code: editable
            ? 'SPCM.WORKSPACE_DETAIL.TABLEEXTEND'
            : 'SPCM.WORKSPACE_DETAIL.TABLEEXTEND.READONLY',
        },
        <Table dataSet={tableExtendDs} style={{ maxHeight: 430 }} columns={[]} />
      )}
    </>
  );
};

export default ContractTableExtend;
