import React, { Fragment, useContext, useMemo, useCallback } from 'react';
import { Table, Button, Modal, Upload } from 'choerodon-ui/pro';
import type { ColumnProps, TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableButtonType, SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type Record from 'choerodon-ui/dataset/data-set/Record';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import Styles from '../../common.less';
import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import BillDefinitionAddModal from './BillDefinitionAddModal';
import StatusTag from '../../Components/StatusTag';
import { handleBillEnable } from '../utils/api';
import { BillFileUrls, exportBillApi } from '../utils/api';
import { getAttachmentUrlWithToken, parseFileError } from '../../../utils/utils';

const BillDefinition = observer(() =>
{

  const { billDs, handleEnable } = useContext<StoreValueType>(Store);


  const onOk = useCallback(
    () =>
    {
      billDs.query();
      billDs.setState('isEditFlag', true);
    },
    [billDs],
  );

  // 新增
  const handleAdd = useCallback(() =>
  {
    Modal.open({
      title: intl.get('spfp.basicConfiguration.title.addBillDefinition').d('新增单据定义'),
      drawer: true,
      destroyOnClose: true,
      className: Styles['spfp-small-modal'],
      children: <BillDefinitionAddModal type="create" onOk={onOk} billDs={billDs} />,

    });
  }, [onOk, billDs]);

  // 编辑
  const handleEdit = useCallback((record) =>
  {
    Modal.open({
      title: intl.get('spfp.basicConfiguration.title.editBillDefinition').d('编辑单据定义'),
      drawer: true,
      destroyOnClose: true,
      className: Styles['spfp-small-modal'],
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <BillDefinitionAddModal type="update" data={record?.toData() || {}} onOk={onOk} billDs={billDs} />,

    });
  }, [onOk, billDs]);

  const uploadProps = useMemo(() =>
  {
    return {
      accept: ['.json', '.JSON'],
      fileList: [],
      name: 'file',
      action: BillFileUrls.IMPORT,
      showUploadList: false,
      onUploadSuccess: (response, file) =>
      {
        parseFileError(file.response, onOk);
      },
    };
  }, [onOk]);


  const handleExportJsonFile = useCallback(async () =>
  {
    const res = getResponse(await exportBillApi());
    if (res)
    {
      getAttachmentUrlWithToken(res.fileUrl);
    }
  }, []);


  const buttons = useMemo(
    () => [
      [TableButtonType.add, { onClick: handleAdd }] as [TableButtonType, TableButtonProps],
      <Button funcType={FuncType.flat} icon="unarchive" onClick={() => handleExportJsonFile()} disabled={billDs.length === 0}>
        {intl.get(`spfp.common.view.button.exportJSONFile`).d('导出JSON文件')}
      </Button>,
      <span className={Styles['spfp-btn-import']}>
        <Upload {...uploadProps} >
          <Button funcType={FuncType.flat} icon='archive' disabled={billDs.length === 0} >
            {intl.get(`spfp.common.view.button.importJSONFile`).d('导入JSON文件')}
          </Button>
        </Upload>
      </span >,

    ],
    [handleAdd, uploadProps, handleExportJsonFile, billDs.length]
  );


  const columns: ColumnProps[] = useMemo(() =>
  {
    return [
      {
        name: 'enableFlag',
        width: 150,
        renderer: ({ value }) => (
          <StatusTag
            value={value}
            text={value === 1
              ? intl.get(`hzero.common.enable`).d('启用')
              : intl.get('hzero.common.status.disabled').d('禁用')}
            color={value === 1 ? 'success' : 'error'}
          />
        ),
      },
      {
        name: 'action',
        width: 150,
        renderer: ({ record }) => (
          <Fragment>
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleEdit(record)}
            >
              {intl.get(`hzero.common.button.editable`).d('编辑')}
            </Button>
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => handleEnable(record as Record, handleBillEnable)}

            >
              {record?.get('enableFlag') === 1
                ? intl.get('hzero.common.status.disabled').d('禁用')
                : intl.get(`hzero.common.enable`).d('启用')
              }
            </Button>
          </Fragment>
        ),
      },
      {
        name: 'combineBusinessObjectName',
        width: 150,
      },
      {
        name: 'documentCodeLov',
        width: 150,
      },
      {
        name: 'fieldCode',
        width: 180,
      },
      {
        name: 'displayFieldName',
        width: 250,
      },
      {
        name: 'fieldLabel',
      },
    ];

  }, [handleEnable, handleEdit]);


  return (
    <Table
      dataSet={billDs}
      columns={columns}
      buttons={buttons}
      selectionMode={SelectionMode.none}
    />
  );
});

export default BillDefinition;