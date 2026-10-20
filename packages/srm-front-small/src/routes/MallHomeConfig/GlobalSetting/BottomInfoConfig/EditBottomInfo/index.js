import React, { useLayoutEffect, useState } from 'react';
import { Upload, Icon, Modal } from 'choerodon-ui';
import { compose, isEmpty } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import { DataSet, IntlField, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import notification from 'utils/notification';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import { PUBLIC_BUCKET } from '_utils/config';
import { tabds, tableds } from './tabds';
import ComContent from '../../../common/ComContent';
import { deleteCofirmModal } from '../../../common/modals';

import { DeleteButton } from '../../../common/buttons';
import styles from './index.less';

const { Column } = Table;


const AddLine = observer(({ dataSet }) => {
  return [
    <Button
      disabled={dataSet.toData()?.length >= 4}
      color="primary"
      funcType="flat"
      icon="playlist_add"
      onClick={() => dataSet.create({}, 0)}
    >
      {intl.get('hzero.common.button.add').d('新增')}
    </Button>,
  ];
});

function EditBottomInfo(props) {
  const {
    mallHomeConfig: { bottomType, pageBottomList },
    dispatch,
    modal,
  } = props;

  const [visible, setVisible] = useState(false);
  const [erfileList, setErfileList] = useState(() => {
    const qrData = pageBottomList.filter((p) => p.bottomType === 1);
    if (bottomType === 1 && qrData?.[0]?.pageBottomLineList?.[0]?.linkUrl) {
      return [
        {
          uid: -1,
          name: 'img',
          status: 'done',
          url: qrData?.[0].pageBottomLineList?.[0]?.linkUrl,
          response: qrData?.[0].pageBottomLineList?.[0]?.linkUrl,
        },
      ];
    } else {
      return [];
    }
  });

  modal.handleOk(() => {
    return handleSave();
  });

  async function handleSave() {
    const arr = [];
    pageBottomList.forEach((p) => {
      arr.push(p?.headerDs?.validate(), p?.tableDs?.validate());
    });
    const flag = await Promise.all(arr.filter((p) => !!p));
    if (flag.every((p) => !!p)) {
      const newList = pageBottomList.map((p) => {
        return {
          ...p,
          ...p.headerDs.current.toData(),
          pageBottomLineList:
            p.bottomType === 1
              ? [{ linkUrl: erfileList?.[0]?.response, description: ' ' }]
              : p.tableDs?.toData(),
        };
      });
      dispatch({
        type: 'mallHomeConfig/updateState',
        payload: {
          pageBottomList: newList,
        },
      });
    }
    return flag.every((p) => !!p);
  }

  useLayoutEffect(() => {
    let arr = [];
    if (isEmpty(pageBottomList)) {
      if (bottomType === 1) {
        const qrcodeDs = new DataSet(tabds());
        arr.push({ bottomTitle: '', pageBottomLineList: [], bottomType: 1, headerDs: qrcodeDs });
      }
      const headerDs = new DataSet(tabds());
      const tableDs = new DataSet(tableds());
      arr.push({ bottomTitle: '', pageBottomLineList: [], bottomType: 0, headerDs, tableDs });
    } else {
      arr = pageBottomList.map((p) => {
        const headerDs = new DataSet(tabds());
        headerDs.loadData([p]);
        const tableDs = new DataSet(tableds());
        tableDs.loadData(p?.pageBottomLineList);
        return { ...p, headerDs, tableDs };
      });
      if (bottomType === 1 && !arr.some((p) => p.bottomType === 1)) {
        const headerDs = new DataSet(tabds());
        arr.unshift({ bottomType: 1, headerDs });
      }
    }
    dispatch({
      type: 'mallHomeConfig/updateState',
      payload: {
        pageBottomList: arr,
      },
    });
  }, []);

  const addForm = () => {
    if (pageBottomList?.length < 4) {
      const arr = [...pageBottomList];
      const headerDs = new DataSet(tabds());
      const tableDs = new DataSet(tableds());
      arr.push({
        bottomTitle: '',
        pageBottomLineList: [],
        bottomType: 0,
        headerDs,
        tableDs,
        uuid: uuid(),
      });
      dispatch({
        type: 'mallHomeConfig/updateState',
        payload: {
          pageBottomList: arr,
        },
      });
    }
  };

  const uploadButton = (
    <div>
      <Icon type="add" />
      <div className={styles["c7n-upload-text"]}>{intl.get('small.common.upload.desc').d('上传图片')}</div>
      <div className={styles["c7n-upload-max"]}>{erfileList?.length || 0}/1</div>
    </div>
  );

  const handleChange = ({ file }) => {
    setErfileList([file]);
    switch (file.status) {
      case 'error':
        notification.warning({
          message: intl.get(`hzero.common.upload.status.error`).d('上传失败'),
        });
        break;
      case 'done':
        notification.success();
        break;
      default:
        break;
    }
  };

  const handleRemove = (url) => {
    dispatch({
      type: 'mallHomeConfig/deleteImgUrl',
      payload: {
        urls: [url],
      },
    }).then((res) => {
      if (res) {
        setErfileList([]);
      }
    });
  };

  function handleDeleteItem(p) {
    deleteCofirmModal({
      onOk: () => {
        const newList = [...pageBottomList].filter(i => {
          return (p.bottomId || p.uuid) !== (i.bottomId || i.uuid);
        });
        dispatch({
          type: 'mallHomeConfig/updateState',
          payload: {
            pageBottomList: newList,
          },
        });
      },
    });
  }

  return (
    <>
      <ComContent
        title={intl.get('small.mallHomeConfig.edit.word.template.header').d('文字模板')}
        style={{ padding: '16px 20px', marginBottom: 0 }}
      >
        {bottomType === 1
          ? intl
              .get('small.mallHomeConfig.edit.word.templateTitle2')
              .d(
                '该模板最多可配置3个文字信息栏以及1个二维码信息栏，文字信息栏最多配置4个用于与企业相关的跳转链接或服务，二维码信息栏可上传企业微信公众号二维码、APP二维码等。'
              )
          : intl
              .get('small.mallHomeConfig.edit.word.templateTitle1')
              .d('每个信息栏最多配置4个用于与企业相关的跳转链接或服务，最多可配置3个信息栏。')}
      </ComContent>
      <div
        className="bottom"
        style={{
          background: 'rgba(0,0,0,.03)',
          padding: 20,
          minHeight: 'calc(100% - 82px)',
        }}
      >
        {bottomType === 1 &&
          pageBottomList
            .filter(p => p.bottomType === 1)
            .map(p => {
              return (
                <div style={{ background: '#fff', marginBottom: 16 }}>
                  <p
                    style={{
                      padding: '0 16px',
                      borderBottom: '1px solid rgba(0,0,0,.08)',
                      lineHeight: '42px',
                      fontWeight: 600,
                    }}
                  >
                    {intl.get('small.mallHomeConfig.edit.qrcode.info').d('二维码信息栏')}
                  </p>
                  <div className="info-tab" style={{ paddingLeft: 16 }}>
                    {p.headerDs && (
                      <IntlField
                        placeholder={intl
                          .get('small.mallHomeConfig.edit.qrcode.info')
                          .d('二维码信息栏')}
                        dataSet={p.headerDs}
                        name="bottomTitle"
                        style={{ width: 340 }}
                      />
                    )}
                  </div>
                  <div className="info-tab" style={{ padding: 16 }}>
                    <span style={{ fontSize: 12, color: 'rgba(0,0,0,.65)' }}>
                      {intl
                        .get('small.common.bottom.edit.info')
                        .d('图片支持PNG、JPG、JPEG格式，且不能大于5M')}
                    </span>
                    <div style={{ display: 'flex' }}>
                      <Upload
                        name="file"
                        accept="image/*"
                        listType="picture-card"
                        className="mall-home-config-upload"
                        fileList={erfileList}
                        action={`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/multipart`}
                        headers={{ Authorization: `bearer ${getAccessToken()}` }}
                        data={file => ({
                        bucketName: PUBLIC_BUCKET,
                        fileName: file.name,
                        directory: 'small-home-config',
                      })}
                        onChange={handleChange}
                        onRemove={file => {
                        handleRemove(file.url);
                      }}
                        onPreview={() => setVisible(true)}
                      >
                        {erfileList?.length >= 1 ? null : uploadButton}
                      </Upload>
                    </div>
                    <Modal visible={visible} footer={null} onCancel={() => setVisible(false)}>
                      <img
                        alt="example"
                        style={{ width: '100%' }}
                        src={erfileList?.[0]?.response}
                      />
                    </Modal>
                  </div>
                </div>
              );
            })}
        {pageBottomList
          .filter(p => p.bottomType !== 1)
          .map(p => {
            const tableDataSet = p?.tableDs;
            return (
              <div style={{ background: '#fff', marginBottom: 16 }}>
                <div
                  style={{
                    padding: '0 16px',
                    borderBottom: '1px solid rgba(0,0,0,.08)',
                    lineHeight: '42px',
                    fontWeight: 600,
                    marginBottom: 16,
                    fontSize: 14,
                  }}
                >
                  {intl.get('small.mallHomeConfig.edit.word.info').d('文字信息栏')}
                  <Button
                    color='dark'
                    style={{
                      float: 'right',
                      marginTop: 8,
                    }}
                    size="small"
                    funcType='flat'
                    icon='delete'
                    onClick={() => handleDeleteItem(p)}
                  />
                </div>
                <div className="info-tab" style={{ padding: '0 16px' }}>
                  {p?.headerDs && (
                    <IntlField
                      placeholder={intl.get('small.mallHomeConfig.edit.word.info').d('文字信息栏')}
                      dataSet={p?.headerDs}
                      name="bottomTitle"
                      style={{ width: 340 }}
                    />
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  {tableDataSet && (
                    <Table
                      customizedCode='EDIT_BOTTOM_INFO_TABLE'
                      selection="multiple"
                      dataSet={tableDataSet}
                      pagination={false}
                      buttons={[
                        <AddLine dataSet={tableDataSet} />,
                        <DeleteButton dataSet={tableDataSet} onClick={() => tableDataSet.remove(tableDataSet.selected, true)} />,
                      ]}
                    >
                      <Column name="description" editor>
                        <IntlField />
                      </Column>
                      <Column name="linkUrl" editor />
                    </Table>
                  )}
                </div>
              </div>
            );
          })}

        <div style={{ marginTop: 16, fontWeight: 600 }}>
          <Button
            color="primary"
            funcType="flat"
            icon="add"
            onClick={() => {
              addForm();
            }}
            disabled={pageBottomList?.length >= 3}
          >
            {intl.get('small.mallHomeConfig.create.word.tab').d('新建文字信息栏')}
          </Button>
        </div>
      </div>
    </>
  );
}

export default compose(
  connect(({ mallHomeConfig }) => ({
    mallHomeConfig,
  }))
)(EditBottomInfo);
