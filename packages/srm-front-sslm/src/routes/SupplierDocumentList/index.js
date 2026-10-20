import React, { Fragment, useState, useMemo } from 'react';
import querystring from 'querystring';
import { DataSet, Tabs, Spin } from 'choerodon-ui/pro';
import { isEmpty, isUndefined, isNil, forIn, isFunction, compose, groupBy } from 'lodash';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import remote from 'utils/remote';
import { dateRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import C7NUpload from '_components/C7NUpload';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';

import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';
import { batchDownloadAttachments } from '@/services/supplierDocumentListService';
import { getIndexDS } from './stores/indexDS';
import { tableHeight, tableMaxHeight, isJSON } from '../components/utils';

import styles from './index.less';
import { getTabPaneList } from './utils';
import HeaderBtn from './HeaderBtn';

const tenantId = getCurrentOrganizationId();
const { TabPane } = Tabs;

const Index = ({
  location,
  custLoading,
  attachmentDs,
  aptitudeDs,
  registerDs,
  customizeTable,
  customizeTabPane,
  supplierDocumentRemote,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState('attachment');

  const dataSetObj = {
    attachment: attachmentDs,
    auth: aptitudeDs,
    licence: registerDs,
  };
  const currentDs = useMemo(() => dataSetObj[activeKey], [activeKey]);

  // 获取导出参数
  const handleParams = () => {
    const queryData = isUndefined(currentDs.queryDataSet?.current)
      ? {}
      : currentDs.queryDataSet.current.toData();
    const { __dirty, ...otherParams } = queryData;
    // 勾选行
    const chooseIds = currentDs.toJSONData().map(n => n.investgHeaderIdType);
    return filterNullValueObject({ ...otherParams, chooseIds, type: activeKey });
  };

  // 图片预览、下载
  const handlePreview = record => {
    const {
      data: { attachmentDesc, licenceUrl },
    } = record;
    const isPreview = isReview(attachmentDesc);
    if (isPreview) {
      reviewFile(attachmentDesc, licenceUrl);
    } else {
      downLoadFile({ tenantId, attachmentUrl: licenceUrl });
    }
  };

  const handleBatchDownload = (dataSet, downloadType = 'all') => {
    // 获取下载参数
    const payload = getDownloadParamByType(dataSet, downloadType);
    if (!isEmpty(payload)) {
      setLoading(true);
      batchDownloadAttachments(payload)
        .then(res => {
          const flag = isJSON(res);
          let resp = res;
          if (flag) {
            // 转json
            resp = JSON.parse(res);
          }
          // 先转json再调用getResponse，是因为如果接口报错报错信息被转化为了字符串（responseType: 'text'），这里在转化回json
          const result = getResponse(resp);
          if (result) {
            window.open(res);
          }
        })
        .finally(() => {
          dataSet.unSelectAll();
          dataSet.clearCachedSelected();
          setLoading(false);
        });
    }
  };

  const getDownloadParamByType = (ds, downloadType) => {
    let payload = {};
    const tabName = (tabPaneList.find(i => i.key === activeKey) || {}).tab;

    const zipFileName = `${tabName || ''}${intl
      .get('sslm.common.view.message.downloadAttachments')
      .d('下载附件')}`;
    const selectedData = ds.toJSONData();
    const fileParams = handleFileParams(selectedData) || {};

    payload = {
      directory: zipFileName,
      ...fileParams,
    };
    if (downloadType === 'classifyPack') {
      const levelListData = handleGroupDataBykey(selectedData, 'companyId');
      payload = {
        ...payload,
        lowerDirectory: levelListData,
        urls: [],
        uuids: [],
      };
    }
    return payload;
  };

  // 分组数据
  const handleGroupDataBykey = (list = [], key = '') => {
    const groupObj = groupBy(list, key);
    const newList = Object.keys(groupObj).map(item => {
      // 分组后的行数据
      const groupLineData = groupObj[item];
      // 获取分组后的第一条数据
      const firstRecord = !isEmpty(groupLineData) ? groupLineData[0] : {};
      let payload = {
        urls: [],
        uuids: [],
      };
      if (key === 'attachmentType') {
        // 获取附件uuid参数
        const fileParams = handleFileParams(groupLineData) || {};
        return {
          ...payload,
          ...fileParams,
          lowerDirectory: [],
          directory: (firstRecord.attachmentType || '-').replace(/\//g, '|'),
        };
      } else if (key === 'supplierId') {
        const lowerDirectory = handleGroupDataBykey(groupLineData, 'attachmentType');
        payload = {
          ...payload,
          lowerDirectory,
          directory: (firstRecord.supplierName || '-').replace(/\//g, '|'),
        };
      } else {
        const lowerDirectory = handleGroupDataBykey(groupLineData, 'supplierId');
        payload = {
          ...payload,
          lowerDirectory,
          directory: (firstRecord.companyName || '-').replace(/\//g, '|'),
        };
      }
      return payload;
    });
    return newList;
  };

  const handleFileParams = (listData = []) => {
    const urls = [];
    const uuids = [];
    (listData || []).forEach(record => {
      const { type, licenceUrl, supplierAttachmentUuid } = record;
      if (type === 'licence' && !isNil(licenceUrl)) {
        urls.push(licenceUrl);
      }
      if (type !== 'licence' && !isNil(supplierAttachmentUuid)) {
        uuids.push(supplierAttachmentUuid);
      }
    });
    return { urls, uuids };
  };

  // 处理筛选器字段ds属性
  const getFieldProps = () => {
    const routerParams = querystring.parse(location?.search.substr(1));
    const {
      supplierCompanyId,
      supplierCompanyName,
      companyId,
      companyName,
      stageId,
      stageDescription,
      purchaseAgentId,
      purchaseAgentName,
      ...rest
    } = routerParams;
    const fieldProps = {};
    fieldProps.partnerCompanyId = {
      lovPara: { asyncCountFlag: 'Y' },
      defaultValue: () => ({ supplierCompanyId, supplierCompanyName }),
    };
    fieldProps.companyId = {
      defaultValue: () => ({ companyId, companyName }),
    };
    fieldProps.stageId = {
      defaultValue: () => ({ stageId, stageDescription }),
    };
    fieldProps.purchaseAgentId = {
      defaultValue: () => ({ purchaseAgentId, purchaseAgentName }),
    };
    forIn(fieldProps, (value, key) => {
      const { defaultValue } = value || {};
      if (defaultValue && isFunction(defaultValue)) {
        // 只处理默认值是对象的，如果是其他的类型标准会失效
        const filterNullDefaultValue = filterNullValueObject(defaultValue());
        if (isEmpty(filterNullDefaultValue) && fieldProps[key]) {
          delete fieldProps[key].defaultValue;
        }
      }
    });
    // 兼容个性化字段
    forIn(rest, (value, key) => {
      fieldProps[key] = {
        defaultValue: () => value,
      };
    });
    return fieldProps;
  };

  const handleTabChange = key => {
    setActiveKey(key);
  };

  const tabPaneList = getTabPaneList();

  const headerBtnProps = {
    activeKey,
    dataSetObj,
  };

  const columns = [
    {
      name: 'supplierNum',
      width: 120,
    },
    {
      name: 'supplierName',
      width: 200,
    },
    {
      name: 'dimensionCodeMeaning',
      width: 120,
    },
    {
      name: 'stageDescription',
      width: 100,
    },
    {
      name: 'companyName',
      width: 200,
    },
    {
      name: 'attachmentType',
      width: 150,
    },
    {
      name: 'attachmentDesc',
      width: 150,
    },
    {
      name: 'expirationDate',
      width: 100,
      renderer: ({ value, record }) =>
        record.data.type === 'licence'
          ? record.data.longEffectiveFlag && record.data.licenceUrl
            ? intl.get('sslm.supplierDoc.model.supplierDoc.longEffective').d('长期')
            : record.data.licenceUrl && value
            ? dateRender(value)
            : '-'
          : record.data.longEffectiveFlag
          ? intl.get('sslm.supplierDoc.model.supplierDoc.longEffective').d('长期')
          : dateRender(value),
    },
    {
      name: 'remnantDays',
      width: 100,
      renderer: ({ value, record }) =>
        record.data.type === 'licence'
          ? record.data.longEffectiveFlag && record.data.licenceUrl
            ? intl.get('sslm.supplierDoc.model.supplierDoc.longEffective').d('长期')
            : record.data.licenceUrl && (value || value === 0)
            ? value
            : '-'
          : record.data.longEffectiveFlag
          ? intl.get('sslm.supplierDoc.model.supplierDoc.longEffective').d('长期')
          : value,
    },
    {
      name: 'lastUploadDate',
      width: 120,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'supplierAttachmentUuid',
      width: 140,
      renderer: ({ record }) =>
        record.data.type === 'licence' ? (
          <a onClick={() => handlePreview(record)}>{record.data.attachmentDesc}</a>
        ) : (
          <C7NUpload
            viewOnly
            filePreview
            record={record}
            bucketName={PRIVATE_BUCKET}
            name="supplierAttachmentUuid"
            fileSize={500 * 1024 * 1024}
            fileStatusRenderer={() => null}
          />
        ),
    },
    {
      name: 'uploadFlagMeaning',
      width: 100,
    },
    {
      name: 'ynFlagMeaning',
      width: 100,
    },
    {
      name: 'freezeControlFlagMeaning',
      width: 150,
    },
  ];
  return (
    <Fragment>
      <Header title={intl.get('sslm.supplierDoc.view.title.supplierDocument').d('供应商文档清单')}>
        <HeaderBtn
          key={activeKey}
          loading={loading}
          dataSet={currentDs}
          activeKey={activeKey}
          remote={supplierDocumentRemote}
          queryParams={handleParams}
          onBatchDownload={handleBatchDownload}
        />
        {supplierDocumentRemote.render('SUPPLIER_DOCUMENT_LIST_HEADER_BTN', null, headerBtnProps)}
      </Header>
      <Content>
        <Spin spinning={loading}>
          {customizeTabPane(
            {
              code: 'SSLM.SUPPLIER_DOCUMENT.LIST.TABS',
              custDefaultActive: key => handleTabChange(key || activeKey),
            },
            <Tabs activeKey={activeKey} onChange={handleTabChange}>
              {tabPaneList.map(item => (
                <TabPane key={item.key} tab={item.tab}>
                  <div style={{ height: tableHeight.hasTab }}>
                    {customizeTable(
                      {
                        code: item.tableCode,
                      },
                      <SearchBarTable
                        cacheState
                        columns={columns}
                        custLoading={custLoading}
                        searchCode={item.searchCode}
                        dataSet={dataSetObj[item.key]}
                        style={{ maxHeight: tableMaxHeight.hasTab }}
                        onRow={({ record }) => {
                          return record.data.remainFlag
                            ? {
                                className: styles.rowStyle,
                              }
                            : {};
                        }}
                        searchBarConfig={{
                          fieldProps: getFieldProps(),
                        }}
                      />
                    )}
                  </div>
                </TabPane>
              ))}
            </Tabs>
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({ code: ['sslm.supplierDoc', 'sslm.common', 'sslm.supplierInform'] }),
  WithCustomize({
    unitCode: [
      'SSLM.SUPPLIER_DOCUMENT.LIST.TABS',
      'SSLM.SUPPLIER_DOCUMENT.LIST.APTITUDE_LIST',
      'SSLM.SUPPLIER_DOCUMENT.LIST.REGISTER_LIST',
      'SSLM.SUPPLIER_DOCUMENT.LIST.SEARCH_BAR_TABLE',
    ],
  }),
  withProps(
    () => {
      const attachmentDs = new DataSet(getIndexDS({ type: 'attachment' }));
      const aptitudeDs = new DataSet(getIndexDS({ type: 'auth' }));
      const registerDs = new DataSet(getIndexDS({ type: 'licence' }));
      return { attachmentDs, aptitudeDs, registerDs };
    },
    { cacheState: true }
  ),
  remote({
    code: 'SUPPLIER_DOCUMENT_LIST',
    name: 'supplierDocumentRemote',
  })
)(Index);
