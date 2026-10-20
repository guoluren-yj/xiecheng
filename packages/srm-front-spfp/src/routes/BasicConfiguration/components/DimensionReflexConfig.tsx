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
import AddDimensionReflexModal from './DimensionReflexAddModal';
import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import { handleDimensionReflexEnable, ReflexFileUrls, exportReflexApi } from '../utils/api';
import StatusTag from '../../Components/StatusTag';
import { getAttachmentUrlWithToken, parseFileError } from '../../../utils/utils';


const DimensionReflexConfig = observer(() =>
{
  // 页面初始化时，顺序自上而下

  const { reflexDimensionDs, handleEnable } = useContext<StoreValueType>(Store);

  const onOk = useCallback(() =>
  {
    reflexDimensionDs.query();
    reflexDimensionDs.setState('isEditFlag', true);

  }, [reflexDimensionDs]);

  // 新增
  const handleAdd = useCallback(
    () =>
    {
      Modal.open({
        title: intl.get('spfp.basicConfiguration.title.addReflexDimension').d('新建维度映射'),
        drawer: true,
        destroyOnClose: true,
        className: Styles['spfp-medium-modal'],
        children: <AddDimensionReflexModal type='create' onOk={onOk} />,

      });
    },
    [onOk],
  );

  // 编辑
  const handleEdit = useCallback(
    (record) =>
    {
      const dimensionDefinitionId = record.get('dimensionDefinitionId');
      Modal.open({
        title: intl.get('spfp.basicConfiguration.title.editReflexDimension').d('修改维度映射'),
        drawer: true,
        destroyOnClose: true,
        className: Styles['spfp-medium-modal'],
        okText: intl.get('hzero.common.button.save').d('保存'),
        children: <AddDimensionReflexModal type='update' dimensionDefinitionId={dimensionDefinitionId} onOk={onOk} />,

      });
    },
    [onOk],
  );

  const handleExportJsonFile = useCallback(async () =>
  {
    // const ids = selected.map((item) => item?.get('dimensionConfigId'));
    const res = getResponse(await exportReflexApi());
    if (res)
    {
      getAttachmentUrlWithToken(res.fileUrl);
    }
  }, []);

  const uploadProps = useMemo(() =>
  {
    return {
      accept: ['.json', '.JSON'],
      fileList: [],
      name: 'file',
      action: ReflexFileUrls.IMPORT,
      showUploadList: false,
      onUploadSuccess: (response, file) =>
      {
        parseFileError(file.response, onOk);
      },
    };
  }, [onOk]);

  const buttons = useMemo(
    () => [
      [TableButtonType.add, { onClick: handleAdd }] as [TableButtonType, TableButtonProps],
      <Button
        funcType={FuncType.flat}
        icon="unarchive"
        disabled={reflexDimensionDs.length === 0}
        onClick={() => handleExportJsonFile()}>
        {intl.get(`spfp.common.view.button.exportJSONFile`).d('导出JSON文件')}
      </Button>,
      <span className={Styles['spfp-btn-import']}>
        <Upload {...uploadProps} >
          <Button funcType={FuncType.flat} icon='archive' disabled={reflexDimensionDs.length === 0} >
            {intl.get(`spfp.common.view.button.importJSONFile`).d('导入JSON文件')}
          </Button>
        </Upload>
      </span >,
    ],
    [handleAdd, handleExportJsonFile, uploadProps, reflexDimensionDs.length]
  );

  const columns: ColumnProps[] = useMemo(() =>
  {
    return [
      {
        name: 'enableFlag',
        width: 150,
        renderer: ({ value }) =>
        {
          return (
            <StatusTag
              value={value}
              text={value === 1
                ? intl.get(`hzero.common.enable`).d('启用')
                : intl.get('hzero.common.status.disabled').d('禁用')}
              color={value === 1 ? 'success' : 'error'}
            />
          );
        },
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
              onClick={() => handleEnable(record as Record, handleDimensionReflexEnable)}
            >
              {record?.get('enableFlag') === 1
                ? intl.get('hzero.common.status.disabled').d('禁用')
                : intl.get(`hzero.common.enable`).d('启用')
              }
            </Button>
          </Fragment>
        ),
      } as any,
      { name: 'codeType', width: 250 },
      { name: 'dimensionCode', width: 250 },
      { name: 'dimensionName' },
    ].filter(item => item);

  }, [handleEnable, handleEdit]);

  return (
    <Table
      dataSet={reflexDimensionDs}
      columns={columns}
      buttons={buttons}
      selectionMode={SelectionMode.none}
    />
  );
});

export default DimensionReflexConfig;