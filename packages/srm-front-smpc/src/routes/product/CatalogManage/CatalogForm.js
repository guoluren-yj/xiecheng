import React, { useMemo } from 'react';
import {
  Form,
  Button,
  Output,
  Icon,
  Lov,
  TextField,
  IntlField,
  NumberField,
  // Modal,
  DataSet,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import openImgCropModal from '@/modals/ImgCrop';
import { formDs } from './CatalogList/ds';
import { saveCatalog } from './api';
import styles from './index.less';

export default function CatalogForm(props) {
  const { data, level, modal, parentCatalogId, customizeForm, successCallback = (e) => e } = props;
  const dataSet = useMemo(() => {
    const ds = new DataSet(formDs(!data));
    if (data) {
      ds.loadData([data]);
    } else {
      // 新增顶级目录｜新增下级目录
      ds.create({ level, enabledFlag: 1, parentCatalogId });
    }
    return ds;
  }, []);

  modal.handleOk(async () => {
    if (!dataSet.dirty) {
      return true;
    }
    const flag = await dataSet.validate();
    if (flag) {
      const params = dataSet.current.toJSONData();
      const result = getResponse(await saveCatalog({ ...params }));
      if (result) {
        notification.success();
        successCallback();
      } else return false;
    }
    return flag;
  });

  const uploadSuccess = (file = { url: '' }) => {
    const { url } = file;
    if (url) {
      dataSet.current.set('iconUrl', url);
    }
  };

  const renderIconUpload = ({ record, value }) => {
    return (
      <div>
        <Button
          onClick={() => {
            openImgCropModal({
              title: intl.get('smpc.product.model.mobileIconPath').d('移动端icon'),
              maxSize: {
                storageSize: 5,
                storageUnit: 'MB',
              },
              successCallback: uploadSuccess,
            });
          }}
        >
          <Icon type="insert_drive_file" />
          {intl.get('smpc.product.button.chooseFile').d('选择文件')}
        </Button>
        {value && (
          <p className="icon-preview">
            <img src={value} alt="" width={56} height={56} />
            <Icon type="close" onClick={() => record.set('iconUrl', null)} />
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={styles['catalog-form-wrapper']}>
      {customizeForm(
        { code: 'SMPC.CATALOG_MANAGE.MATAIN.FORM' },
        <Form dataSet={dataSet} labelLayout="float" columns={1}>
          <TextField name="catalogCode" />
          <IntlField name="catalogName" />
          {data && data.level > 1 && <Lov name="parentCatalogLov" />}
          <NumberField name="orderSeq" />
        </Form>
      )}
      {level === 3 && (
        <Form dataSet={dataSet} columns={1} labelAlign="left" labelWidth={95}>
          <Output
            name="iconUrl"
            align="left"
            renderer={renderIconUpload}
            help={intl
              .get('smpc.catalogManage.view.uploadCatalogLogoSize')
              .d('上传格式：*.png;*.jpeg;*jpg;*tif;*tiff，上传大小：56x56px')}
          />
        </Form>
      )}
    </div>
  );
}
