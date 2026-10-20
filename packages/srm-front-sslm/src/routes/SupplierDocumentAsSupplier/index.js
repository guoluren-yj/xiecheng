import React, { Component, Fragment } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined, isNil } from 'lodash';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { dateRender } from 'utils/renderer';
import { SRM_SSLM, PRIVATE_BUCKET } from '_utils/config';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import C7NUpload from '_components/C7NUpload';
import ExcelExportPro from 'components/ExcelExportPro';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';

import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';
import { batchDownloadAttachments } from '@/services/supplierDocumentListService';
import { getIndexDS } from './stores/indexDS';
import { tableHeight, tableMaxHeight } from '../components/utils';

import styles from './index.less';

const tenantId = getCurrentOrganizationId();

@formatterCollections({ code: ['sslm.supplierDoc', 'sslm.common'] })
@withProps(
  () => {
    const indexDs = new DataSet(getIndexDS());
    return { indexDs };
  },
  { cacheState: true }
)
@WithCustomize({
  unitCode: ['SSLM.DOCUMENT_AS_SUPPLIER.LIST.TABLE'],
})
export default class SupplierDocumentAsSupplier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      batchDownloadAttachmentsLoading: false,
    };
  }

  // 获取导出参数
  @Bind()
  handleParams() {
    const { indexDs } = this.props;
    const queryData = isUndefined(indexDs.queryDataSet?.current)
      ? {}
      : indexDs.queryDataSet.current.toData();
    const { __dirty, ...otherParams } = queryData;
    // 勾选行
    const chooseIds = indexDs.toJSONData().map(n => n.investgHeaderIdType);
    return filterNullValueObject({ ...otherParams, chooseIds });
  }

  // 图片预览、下载
  @Bind()
  handlePreview = record => {
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

  /**
   * 判断是否是json
   * @param {String} str
   * @returns
   */
  @Bind()
  isJSON(str) {
    if (typeof str === 'string') {
      try {
        const obj = JSON.parse(str);
        if (typeof obj === 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  }

  @Bind()
  handleBatchDownloadAttachments(dataSet) {
    this.setState({ batchDownloadAttachmentsLoading: true });

    const urls = [];
    const uuids = [];

    dataSet.selected.forEach(record => {
      const {
        data: { type, licenceUrl, supplierAttachmentUuid },
      } = record;
      if (type === 'licence' && !isNil(licenceUrl)) {
        urls.push(licenceUrl);
      }
      if (type !== 'licence' && !isNil(supplierAttachmentUuid)) {
        uuids.push(supplierAttachmentUuid);
      }
    });

    batchDownloadAttachments({ urls, uuids })
      .then(res => {
        const flag = this.isJSON(res);
        let resp = res;
        if (flag) {
          // 转json
          resp = JSON.parse(res);
        }
        const result = getResponse(resp);
        if (result) {
          window.open(res);
        }
      })
      .finally(() => {
        dataSet.unSelectAll();
        dataSet.clearCachedSelected();
        this.setState({ batchDownloadAttachmentsLoading: false });
      });
  }

  render() {
    const { indexDs, custLoading, customizeTable } = this.props;

    const { batchDownloadAttachmentsLoading } = this.state;

    const columns = [
      {
        name: 'companyNum',
        width: 120,
      },
      {
        name: 'companyName',
        width: 200,
      },
      {
        name: 'supplierNum',
        width: 100,
      },
      {
        name: 'supplierName',
        width: 200,
      },
      {
        name: 'typeMeaning',
        width: 100,
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
            <a onClick={() => this.handlePreview(record)}>{record.data.attachmentDesc}</a>
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
    ];

    const OperationButtons = observer(props => {
      const isSelect = isEmpty(props.dataSet.selected);
      return (
        <Fragment>
          <ExcelExportPro
            requestUrl={`${SRM_SSLM}/v1/${tenantId}/investigate-attachments-report/supplier/export`}
            queryParams={this.handleParams()}
            otherButtonProps={{
              type: 'c7n-pro',
              icon: 'unarchive',
              funcType: 'flat',
            }}
            buttonText={
              isSelect
                ? intl.get('hzero.common.export.new').d('(新)导出')
                : intl.get('sslm.common.button.newSelectedExport').d('(新)导出勾选')
            }
            templateCode="SRM_C_SRM_SSLM_SUPPLIER_ATTACHMENT_SUPPLIER_EXPORT"
          />
          <Button
            icon="file_download_black-o"
            funcType="flat"
            loading={batchDownloadAttachmentsLoading}
            onClick={() => this.handleBatchDownloadAttachments(props.dataSet)}
            disabled={isSelect}
            wait={500}
            waitType="throttle"
          >
            {intl.get('sslm.supplierDoc.view.title.batchDownloadAttachments').d('批量下载附件')}
          </Button>
        </Fragment>
      );
    });

    return (
      <Fragment>
        <Header
          title={intl
            .get('sslm.supplierDoc.view.title.documentAsSupplier')
            .d('供应商文档清单（供）')}
        >
          <OperationButtons dataSet={indexDs} />
        </Header>
        <Content>
          <div style={{ height: tableHeight.fixedHeight }}>
            {customizeTable(
              {
                code: 'SSLM.DOCUMENT_AS_SUPPLIER.LIST.TABLE',
              },
              <SearchBarTable
                cacheState
                dataSet={indexDs}
                columns={columns}
                custLoading={custLoading}
                style={{ maxHeight: tableMaxHeight.fixedHeight }}
                searchCode="SSLM.DOCUMENT_AS_SUPPLIER.LIST.SEARCH_BAR"
                onRow={({ record }) => {
                  return record.data.remainFlag
                    ? {
                        className: styles.rowStyle,
                      }
                    : {};
                }}
              />
            )}
          </div>
        </Content>
      </Fragment>
    );
  }
}
