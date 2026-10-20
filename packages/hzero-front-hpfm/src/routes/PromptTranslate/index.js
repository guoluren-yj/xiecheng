import React, { useEffect, useState, useRef } from 'react';
import { isEmpty } from 'lodash';
import { Upload, Button } from 'hzero-ui';
import { connect } from 'dva';
import { Content, Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  filterNullValueObject,
  getAccessToken,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { HZERO_PLATFORM, API_HOST } from 'utils/config';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import Search from './Search';
import List from './List';
import EditModal from './EditModal';

const tenantId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();
const param = isTenant ? `/${tenantId}` : '';

function PromptTranslate(props = {}) {
  const { dispatch } = props;
  const searchForm = useRef({});
  const [modalVisible, handleModalVisible] = useState(false);
  const [currentRecord, handleCurrentRecord] = useState({});
  const [exportLoading, handleExportLoading] = useState(false);
  const [importLoading, handleImportLoading] = useState(false);

  const fetchLanguageData = (page = {}) => {
    const filterValues = !searchForm.current
      ? {}
      : filterNullValueObject(searchForm.current.getFieldsValue());
    dispatch({
      type: 'promptTranslate/fetchLanguageData',
      payload: {
        page,
        ...filterValues,
      },
    });
  };

  const handleModal = (record = {}, flag) => {
    handleModalVisible(flag);
    handleCurrentRecord(record);
  };

  const handleSave = (fieldsValue = {}, record = {}) => {
    const {
      promptTranslate: { promptLanguageList = [], languageInfo = [] },
    } = props;
    const editedRecord = promptLanguageList.find((li) => li.tempId === record.tempId) || {};
    const promptDetailConfig = {};
    // 组装保存数据
    languageInfo.forEach((info) => {
      promptDetailConfig[info.code] = {
        ...(editedRecord.promptDetailConfig && editedRecord.promptDetailConfig[info.code]),
        lang: info.code,
        description: fieldsValue[info.code] || '',
      };
    });
    const tenantId2 = !isEmpty(record) ? editedRecord.tenantId : tenantId;
    const extraParams = {};
    if (!isTenant) {
      extraParams.tenantId = (record && record.tenantId) || fieldsValue.tenantId;
      extraParams.isPlatformCreate = isEmpty(record);
    }
    dispatch({
      type: isEmpty(record)
        ? 'promptTranslate/createLanguageTranslate'
        : 'promptTranslate/saveLanguageTranslate',
      payload:
        isTenant || isEmpty(record)
          ? {
              ...fieldsValue,
              promptDetailConfig,
              tenantId: tenantId2, // 编辑传入tenantId
              ...extraParams,
            }
          : [
              {
                ...editedRecord,
                promptDetailConfig,
              },
            ],
    }).then((res) => {
      if (res) {
        notification.success();
        handleModal({}, false);
        fetchLanguageData();
      }
    });
  };

  const exprotFile = () => {
    const requestUrl = `${HZERO_PLATFORM}/v1${param}/prompt-translate/prompt-export`;
    const filterValues = !searchForm.current
      ? {}
      : filterNullValueObject(searchForm.current.getFieldsValue());
    const params = [];
    if (filterValues) {
      for (const key of Object.keys(filterValues)) {
        if (filterValues[key] !== undefined) {
          params.push({ name: key, value: filterValues[key] });
        }
      }
    }
    return new Promise((resolve, reject) => {
      downloadFileByAxios({ requestUrl, queryParams: params, method: 'GET' })
        .then((res) => {
          if (res) {
            resolve(res);
          }
        })
        .catch((err) => reject(err));
    });
  };

  const exportTranslate = () => {
    handleExportLoading(true);
    exprotFile().then((res) => {
      if (res) {
        handleExportLoading(false);
      }
    });
  };

  const showErrorMessage = (file) => {
    notification.error({
      message: intl.get('hzero.common.upload.status.error').d('上传失败'),
      description: file.response && file.response.message,
    });
  };

  const onUploadSuccess = ({ file }) => {
    const { response } = file;
    if (file.status === 'done') {
      if (response && response.failed === true) {
        showErrorMessage(file);
        handleImportLoading(false);
      } else {
        notification.success();
        handleImportLoading(false);
        fetchLanguageData();
      }
    } else if (file.status !== 'uploading') {
      showErrorMessage(file);
      handleImportLoading(false);
    }
  };

  const beforeUpload = () => {
    handleImportLoading(true);
  };

  useEffect(() => {
    dispatch({
      type: 'promptTranslate/fetchLanguageInfo',
      payload: {},
    }).then((res) => {
      if (res) {
        const {
          location: { state: { _back } = {} },
          promptTranslate: { pagination = {} },
        } = props;
        if (_back === -1) {
          fetchLanguageData(pagination);
        } else {
          fetchLanguageData();
        }
      }
    });
  }, []);

  const {
    promptTranslate: { languageInfo = [], promptLanguageList = [], pagination = {} },
    languageInfoLoading = false,
    languageDetailLoading = false,
    saveLanguageLoading = false,
  } = props;
  const promptTranslateList = {
    languageInfo,
    pagination,
    handleModal,
    loading: languageInfoLoading || languageDetailLoading,
    handleSearch: fetchLanguageData,
    dataList: promptLanguageList,
  };
  const editModalProps = {
    modalVisible,
    currentRecord,
    languageInfo,
    handleModal,
    onOk: handleSave,
    loading: saveLanguageLoading,
  };

  const accessToken = getAccessToken();
  const headers = {};
  if (accessToken) {
    headers.Authorization = `bearer ${accessToken}`;
  }
  const importOptions = {
    beforeUpload,
    headers,
    onChange: onUploadSuccess,
    showUploadList: false,
    action: `${API_HOST}${HZERO_PLATFORM}/v1${param}/prompt-translate/prompt-import`,
    accept: '.xls,.xlsx',
    style: { marginLeft: '8px' },
    name: 'promptFile',
  };

  return (
    <React.Fragment>
      <Header title={intl.get(`spfm.promptTranslate.view.message.title`).d('多语言翻译')}>
        <Button type="primary" onClick={() => handleModal({}, true)} icon="plus">
          {intl.get('hzero.common.button.newCreate').d('新建')}
        </Button>
        <Upload {...importOptions}>
          <Button type="primary" loading={importLoading} icon="upload">
            {intl.get('hzero.common.button.import').d('导入')}
          </Button>
        </Upload>
        <Button onClick={() => exportTranslate()} icon="export" loading={exportLoading}>
          {intl.get('hzero.common.button.export').d('导出')}
        </Button>
      </Header>
      <Content>
        <div className="table-list-search">
          <Search ref={searchForm} languageInfo={languageInfo} onFilterChange={fetchLanguageData} />
        </div>
        <List {...promptTranslateList} />
        <EditModal {...editModalProps} />
      </Content>
    </React.Fragment>
  );
}

export default connect(({ loading, promptTranslate }) => ({
  promptTranslate,
  languageInfoLoading: loading.effects['promptTranslate/fetchLanguageInfo'],
  languageDetailLoading: loading.effects['promptTranslate/fetchLanguageData'],
  saveLanguageLoading: loading.effects['promptTranslate/saveLanguageTranslate'],
}))(
  formatterCollections({
    code: ['spfm.promptTranslate', 'hpfm.prompt'],
  })(PromptTranslate)
);
