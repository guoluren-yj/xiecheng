import React, { useMemo } from 'react';
import { connect } from 'dva';
import { compose } from 'lodash';
import { Upload, Icon, Spin, Tag } from 'choerodon-ui';
import { Button, Table, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';

import { PUBLIC_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import intl from 'utils/intl';
import request from 'utils/request';
import AttachmentItem from '@/components/AttachmentItem';
import tableds from './tableds';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

function EditUnitLogo({ modal, dispatch, mallHome: { purchase } }) {
  const tableDs = useMemo(() => {
    return new DataSet(tableds());
  }, []);

  modal.handleOk(() => {
    return handleSave();
  });

  async function handleSave() {
    const res = await tableDs.submit();
    fetchConfigDetail();
    return !!res;
  }

  function fetchConfigDetail(params = {}) {
    dispatch({
      type: 'mallHomeConfig/fetchDetail',
      payload: {
        unitId: params.unitId || purchase.unitId,
      },
    }).then((res) => {
      dispatch({
        type: 'mallHome/updateState',
        payload: {
          configDetail: res,
        },
      });
    });
  }

  const beforeUpload = (file) => {
    const fileSize = 1 * 1024 * 1024;
    const fileType = 'image/jpeg;image/jpg;image/png;';
    if (fileType.indexOf(file.type) === -1) {
      file.status = 'error'; // eslint-disable-line
      notification.warning({
        message: intl
          .get('small.mallHomeConfig.view.updateLoadFileTypeMustBeImg')
          .d('logo文件类型必须是: jpeg/jpg/png'),
      });
      return false;
    }
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      notification.warning({
        message: intl.get('small.mallHomeConfig.view.fileSizeLimit').d('上传大小不能超过1M'),
      });
      return false;
    }
    return true;
  };

  const handleChange = ({ file }) => {
    switch (file.status) {
      case 'error':
        notification.warning({
          message: intl.get(`hzero.common.upload.status.error`).d('上传失败'),
        });
        break;
      case 'done':
        tableDs.current.set('unitIconUrl', file.response);
        notification.success();
        break;
      default:
        break;
    }
  };

  const UploadButton = observer(({ dataSet }) => {
    return dataSet.get('unitIconUrl') ? (
      <AttachmentItem
        bucketName={PUBLIC_BUCKET}
        handleRemove={() => {
          dataSet.set('unitIconUrl', '');
        }}
        fileUrl={dataSet.get('unitIconUrl')}
      />
    ) : (
      <>
        <Upload
          name="file"
          accept="image/*"
          action={`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/multipart`}
          headers={{ Authorization: `bearer ${getAccessToken()}` }}
          data={(file) => ({
            bucketName: PUBLIC_BUCKET,
            fileName: file.name,
            directory: 'small-home-config',
          })}
          onChange={handleChange}
          beforeUpload={beforeUpload}
        >
          <Button style={{ color: '#333' }} funcType="flat">
            <Icon type="file_upload" />{' '}
            {intl.get(`small.common.model.attachment.upload`).d('附件上传')}
          </Button>
        </Upload>
      </>
    );
  });

  const columns = [
    {
      name: 'enableFlag',
      renderer: ({ record }) => {
        return record.get('enableFlag') ? (
          <Tag border={false} color="green">{intl.get('small.common.tag.enable').d('已启用')}</Tag>
        ) : (
          <Tag border={false} color="red">{intl.get('small.common.tag.disable').d('已禁用')}</Tag>
        );
      },
    },
    {
      name: 'unitCode',
    },
    {
      name: 'unitName',
      width: 200,
    },
    {
      name: 'unitIconUrl',
      renderer: ({ record }) => {
        return <UploadButton dataSet={record} />;
      },
    },
    {
      name: 'action',
      width: 80,
      renderer: ({ record }) => {
        return (
          <Button
            funcType="link"
            color="primary"
            onClick={() => {
              record.set('enableFlag', Number(!record.get('enableFlag')));
            }}
          >
            {record.get('enableFlag')
              ? intl.get('hzero.common.status.disable').d('禁用')
              : intl.get('hzero.common.enable').d('启用')}
          </Button>
        );
      },
    },
  ];

  function handleLoadData({ record, dataSet }) {
    const param = {
      unitId: record.get('unitId'),
      queryHasChildren: true,
      tenantId: organizationId,
    };
    const isAddChild = !record.children;
    if (isAddChild) {
      record.setState('loading', true);
      request(`/smal/v1/${organizationId}/page-icon-units/list`, {
        method: 'GET',
        query: param,
      })
        .then((res) => {
          const newList = res.map((r) => ({ ...r, parentUnitId: record.get('unitId') }));
          if (res.length) {
            dataSet.appendData(newList);
          }
        })
        .finally(() => {
          record.setState('loading', false);
        });
    }
  }

  function expandicon({ prefixCls, expanded, expandable, record, onExpand }) {
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    if (record.getState('loading') === true) {
      // 自定义状态渲染
      return <Spin tip="loading" delay={200} size="small" />;
    }

    return record.get('hasChild') ? (
      <Icon
        type="baseline-arrow_right"
        className={classString}
        onClick={onExpand}
        tabIndex={expandable ? 0 : -1}
      />
    ) : (
      <span style={{ display: 'inline-block', width: 20 }} />
    );
  }

  return (
    <div className={styles.content}>
      <Table
        customizedCode="EDIT_UNIT_LOGO_TABLE"
        selectionMode="none"
        dataSet={tableDs}
        columns={columns}
        treeLoadData={handleLoadData}
        expandIcon={expandicon}
        style={{maxHeight: `calc(100vh - 155px)`}}
      />
    </div>
  );
}

export default compose(
  connect(({ mallHome, mallHomeConfig }) => ({
    mallHome,
    mallHomeConfig,
  }))
)(EditUnitLogo);
