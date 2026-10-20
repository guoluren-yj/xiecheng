import React, { Fragment, useContext, useMemo, useCallback } from 'react';
import { Table, Button, Modal, Upload } from 'choerodon-ui/pro';
import type { ColumnProps, TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { SelectionMode, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import type Record from 'choerodon-ui/dataset/data-set/Record';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import Styles from '../../common.less';
import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import DimensionAddModal from './DimensionAddModal';
import { DimensionType } from '../utils/type';
import { handleDimensionEnable, exportApplyApi, ApplyFileUrls } from '../utils/api';
import StatusTag from '../../Components/StatusTag';
import { getAttachmentUrlWithToken, parseFileError } from '../../../utils/utils';


const DimensionApplyConfig = observer(() =>
{
  const { dimensionDs, handleEnable, cumulativeDimensionDs } = useContext<StoreValueType>(Store);

  const onOk = useCallback(() =>
  {
    dimensionDs.query();
    dimensionDs.setState('isEditFlag', true);
    cumulativeDimensionDs.query();


  }, [dimensionDs, cumulativeDimensionDs]);

  // 新增
  const handleAdd = useCallback(
    () =>
    {
      Modal.open({
        title: intl.get('spfp.basicConfiguration.title.addApplyDimensionConfig').d('新增适用维度配置'),
        drawer: true,
        destroyOnClose: true,
        className: Styles['spfp-small-modal'],
        children: <DimensionAddModal type='create' dimensionType={DimensionType.apply} onOk={onOk} />,

      });

    },
    [onOk],
  );

  const handleEdit = useCallback(
    (record) =>
    {
      Modal.open({
        title: intl.get('spfp.basicConfiguration.title.editApplyDimensionConfig').d('编辑适用维度配置'),
        drawer: true,
        destroyOnClose: true,
        className: Styles['spfp-small-modal'],
        okText: intl.get('hzero.common.button.save').d('保存'),
        children: <DimensionAddModal type='update' data={record?.toData() || {}} dimensionType={DimensionType.apply} onOk={onOk} />,

      });

    },
    [onOk],
  );

  const uploadProps = useMemo(() =>
  {
    return {
      accept: ['.json', '.JSON'],
      fileList: [],
      name: 'file',
      action: ApplyFileUrls.IMPORT,
      showUploadList: false,
      onUploadSuccess: (response, file) =>
      {
        parseFileError(file.response, onOk);
      },
    };
  }, [onOk]);

  const handleExportJsonFile = useCallback(async () =>
  {
    // const ids = selected.map((item) => item?.get('dimensionConfigId'));
    const res = getResponse(await exportApplyApi());
    if (res)
    {
      getAttachmentUrlWithToken(res.fileUrl);
    }
  }, []);
  const buttons = useMemo(
    () => [
      [TableButtonType.add, { onClick: handleAdd }] as [TableButtonType, TableButtonProps],
      <Button
        funcType={FuncType.flat}
        icon="unarchive"
        disabled={dimensionDs.length === 0}
        onClick={() => handleExportJsonFile()}>
        {intl.get(`spfp.common.view.button.exportDimensionJSONFile`).d('导出维度配置（适用+累计）JSON文件')}
      </Button>,
      <span className={Styles['spfp-btn-import']}>
        <Upload {...uploadProps} >
          <Button funcType={FuncType.flat} icon='archive' disabled={dimensionDs.length === 0} >
            {intl.get(`spfp.common.view.button.importDimensionJSONFile`).d('导入维度配置（适用+累计）JSON文件')}
          </Button>
        </Upload>
      </span >,
    ],
    [handleAdd, handleExportJsonFile, uploadProps, dimensionDs.length]
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
              onClick={() => handleEnable(record as Record, handleDimensionEnable, DimensionType.apply)}
            >
              {record?.get('enableFlag') === 1
                ? intl.get('hzero.common.status.disabled').d('禁用')
                : intl.get(`hzero.common.enable`).d('启用')
              }
            </Button>
          </Fragment>
        ),
      },
      { name: 'ruleType', width: 150 },
      { name: 'documentCodeLov', width: 300 },
      { name: 'dimensionName', width: 250 },
      { name: 'dimensionDefCombinationMeaning' },
    ];

  }, [handleEnable, handleEdit]);


  return (
    <Table
      dataSet={dimensionDs}
      columns={columns}
      buttons={buttons}
      selectionMode={SelectionMode.none}
    />
  );
});

export default DimensionApplyConfig;