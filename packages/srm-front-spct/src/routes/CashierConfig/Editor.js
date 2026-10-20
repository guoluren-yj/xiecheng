/* eslint-disable no-unused-expressions */
import React, { useMemo, useState, useEffect } from 'react';
import {
  Icon,
  DataSet,
  Form,
  TextField,
  Table,
  Button,
  Select,
  NumberField,
  IntlField,
} from 'choerodon-ui/pro';
import { Upload, Modal } from 'choerodon-ui';
import uuid from 'uuid/v4';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { API_HOST } from 'utils/config';
import { getAccessToken, getResponse, getCurrentOrganizationId } from 'utils/utils';
import { PUBLIC_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { fetchData, updateData, searchUuidImage } from '@/services/paymentCashierService';
import style from './index.less';

import HeadLine from './HeadLine';
import { editDs, tableDs } from './ds';

const organizationId = getCurrentOrganizationId();
const action = `${API_HOST}/hfle/v1/${organizationId}/files/attachment/multipart-with-info`;

function Editor(props) {
  const [UUID, setUUID] = useState(uuid());
  const [fileList, setFileList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const editDS = useMemo(() => new DataSet(editDs()), []);
  const tableDS = useMemo(() => new DataSet(tableDs()), []);
  const ObserBtn = observer(({ dataSet }) => (
    <Button
      color="primary"
      funcType="flat"
      icon="playlist_add"
      disabled={dataSet.length >= 5}
      onClick={() => dataSet.create({ _status: 'add' }, 0)}
    >
      {intl.get('spct.cashierConfig.view.add').d('新增')}
    </Button>
  ));

  useEffect(() => {
    if (props.cashierConfigId) {
      fetchInitData(props.cashierConfigId);
    } else {
      editDS.create({
        cashierConfigTitle: intl.get('spct.paymentOrder.view.cashier').d('收银台'),
        cashierConfigTips: intl
          .get('spct.cashierConfig.view.paymentTips')
          .d('请选择支付方式，尽快完成支付'),
      });
    }
  }, []);

  useEffect(() => {
    props.onRef(dealData);
  }, [fileList]);

  async function fetchInitData(cashierConfigId) {
    const res = await fetchData(cashierConfigId);
    if (res) {
      setUUID(res.attachmentUuid);
      searchUuidImage(res.attachmentUuid, PUBLIC_BUCKET).then((result) => {
        const newlist = result?.map((i, index) => ({
          uid: index - 1,
          name: i.fileName,
          status: 'done',
          url: i.fileUrl,
        }));
        setFileList(newlist);
      });
      editDS.loadData([res]);
      tableDS.loadData(res.cashierConfigLinks);
    }
  }

  async function dealData() {
    const flag = await editDS.validate();
    const fg = await tableDS.validate();
    if (fileList.length === 0) {
      notification.warning({
        message: intl.get('spct.cashierConfig.view.uploadLogo').d('请上传企业Logo'),
      });
      return false;
    }
    if (props.cashierConfigId) {
      const result = await fetchData(props.cashierConfigId);
      if (flag && fg && result) {
        const editData = editDS?.current?.toData();
        const tableData = tableDS
          .toData()
          ?.filter((i) => !!i)
          .map((x, y) => ({ ...x, linkNum: y + 1, _status: null }));
        const param = {
          ...result,
          ...editData,
          attachmentUuid: UUID || result.attachmentUuid,
          cashierConfigLinks: tableData,
        };
        delete param.cashierConfigSourceMeaning;
        const res = getResponse(await updateData(param));
        if (res && !res.failed) {
          notification.success();
          props.initDs?.query();
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else if (flag && fg) {
      const editData = editDS?.current?.toData();
      delete editData.cashierConfigSourceMeaning;
      const tableData = tableDS
        .toData()
        ?.filter((i) => !!i)
        .map((x, y) => ({ ...x, linkNum: y + 1, _status: null }));
      const param = {
        ...editData,
        attachmentUuid: UUID,
        cashierConfigLinks: tableData,
      };
      const res = getResponse(await updateData(param));
      if (res && !res.failed) {
        notification.success();
        props.initDs?.query();
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  async function handleDelete(dataSet) {
    if (dataSet.selected.some((s) => !s.get('_status'))) {
      const res = await dataSet.delete(dataSet.selected || []);
      if (res) {
        fetchInitData(props.cashierConfigId);
      }
    } else {
      dataSet.remove(dataSet.selected || []);
    }
  }

  const columns = useMemo(
    () => [
      { name: 'linkTitle', editor: true },
      { name: 'linkUrl', editor: true },
    ],
    []
  );

  const DeleteBtn = observer(({ dataSet }) => (
    <Button
      disabled={!dataSet.selected.length}
      funcType="flat"
      color="primary"
      icon="delete_sweep"
      onClick={() => {
        handleDelete(dataSet);
      }}
    >
      {intl.get('spct.cashierConfig.model.batchDelete').d('批量删除')}
    </Button>
  ));

  const buttons = [<ObserBtn dataSet={tableDS} />, <DeleteBtn dataSet={tableDS} />];

  function handleChange(fileObj, file) {
    setFileList([{ uid: file.uid, url: fileObj.url, name: fileObj.fileName, status: 'done' }]);
  }

  function handleRemove() {
    setFileList([]);
    setUUID(uuid);
  }

  return (
    <React.Fragment>
      <HeadLine title={intl.get('spct.cashierConfig.view.baseInfo').d('基本信息')} />
      <Form labelLayout="float" columns={2} dataSet={editDS}>
        <TextField name="cashierConfigCode" disabled />
        <IntlField name="cashierConfigName" />
        <Select name="cashierConfigSourceMeaning" />
        <NumberField name="priorityLevel" />
        <IntlField name="cashierConfigDescribe" type="multipleLine" colSpan={2} />
      </Form>
      {/* <CheckBox
        style={{ marginTop: 16, marginLeft: 4 }}
        dataSet={editDS}
        name="cashierConfigEnabled"
      >
        {intl.get('spct.cashierConfig.view.using').d('启用')}
      </CheckBox> */}
      <HeadLine
        title={intl.get('spct.cashierConfig.view.logo').d('企业Logo')}
        style={{ marginTop: '32px', marginBottom: '16px' }}
      >
        &nbsp;<span style={{ color: '#F56349' }}>*</span>
      </HeadLine>
      <div style={{ color: 'rgba(0,0,0,0.65)', paddingLeft: '3px' }}>
        {intl
          .get('spct.cashierConfig.view.uploadTips')
          .d('图片支持PNG、JPG、JPEG格式，且不能大于1M')}
      </div>
      <div className={fileList?.length < 1 ? '' : style['hidden-upload']}>
        <Upload
          name="file"
          action={action}
          accept="image/*"
          listType="picture-card"
          fileList={fileList}
          onSuccess={handleChange}
          headers={{ Authorization: `bearer ${getAccessToken()}` }}
          data={{ bucketName: PUBLIC_BUCKET, directory: 'smpc/sku/media', attachmentUUID: UUID }}
          disabled={fileList?.length >= 1}
          onRemove={(file) => {
            handleRemove(file, UUID);
          }}
          onPreview={(file) => {
            setPreviewUrl(file.url || file.thumbUrl);
            setVisible(true);
          }}
        >
          <div>
            <Icon type="add" />
            <div className="c7n-upload-text">
              {intl.get('spct.cashierConfig.button.uploadPic').d('上传图片')}
              <div>0/1</div>
            </div>
          </div>
        </Upload>
      </div>
      <HeadLine
        title={intl.get('spct.cashierConfig.view.themeColor').d('主题色')}
        style={{ marginTop: '32px', marginBottom: '16px' }}
      />
      <Select
        dataSet={editDS}
        labelLayout="float"
        name="cashierConfigColor"
        style={{ width: '340px' }}
      />
      <HeadLine
        title={intl.get('spct.cashierConfig.view.pageInfo').d('页面信息')}
        style={{ marginTop: '32px', marginBottom: '16px' }}
      />
      <Form labelLayout="float" columns={2} dataSet={editDS}>
        <IntlField name="cashierConfigTitle" />
        <IntlField name="cashierConfigTips" />
      </Form>
      <HeadLine
        title={intl.get('spct.cashierConfig.view.quickLink').d('快速链接')}
        style={{ marginTop: '32px', marginBottom: '16px' }}
      />
      <Table
        buttons={buttons}
        columns={columns}
        dataSet={tableDS}
        rowDraggable
        dragColumnAlign="left"
        customizedCode="SPCT.CASHIER.CONFIG.LINK_TABLE"
      />
      <Modal visible={visible} footer={null} onCancel={() => setVisible(false)}>
        <img alt="" style={{ width: '100%' }} src={previewUrl} />
      </Modal>
    </React.Fragment>
  );
}

export default Editor;
