import React, { PureComponent } from 'react';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import remotes from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { TagRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchTabList } from './api';
import { listLineDS } from './store';
import Import from './Import';


const importModalKey = Modal.key();
const calibrateModalKey = Modal.key();

@remotes({
  code: 'SSRC_RFSUPPLIER_QUOTATION_DETAIL_IMPORT',
  name: 'remote',
}, {
  events: {
    handleRemoteBeforeExcelDownload() { }, // cux
    handleRemoteMenuItemEventList() { }, // cux
  },
})
@formatterCollections({
  code: ['ssrc.quoDeImport'],
})
export default class RFSupplierQuotationDetailImport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // tabList: [],
    };
    this.tableDs = {};
    this.tableColumns = {};

    this.importCalibrateModal = null;
    this.importRef = null;

    this.importModal = null;
    this.closeImportModalFlag = 0;
  }

  @Bind()
  fetchTabList() {
    const {
      quotationHeaderCurrentId = undefined,
      sourceFrom = 'RFX',
      sourceHeaderId = undefined,
      templateCode = 'SSRC.RFX_SUP_QUO_DETAIL',
      projectLineSectionId,
      operationType = undefined,
      remote,
    } = this.props;
    if (quotationHeaderCurrentId || sourceHeaderId) {
      fetchTabList({
        quotationHeaderCurrentId,
        sourceHeaderId, // 寻源项目工作台维护报价导入
        sourceFrom,
        projectLineSectionId,
      }).then((tabList = []) => {
        if (getResponse(tabList)) {
          if (!tabList) {
            return;
          }
          (tabList || []).forEach((item) => {
            const { detailTemplateDTOList = [] } = item;
            if (!detailTemplateDTOList) {
              return;
            }
            detailTemplateDTOList.forEach((n) => {
              const columnList = [
                {
                  name: '_dataStatus',
                  width: 120,
                  renderer: ({ value, record }) => {
                    const statusList = [
                      { status: 'NEW', color: 'blue' /* , text: 'Excel导入' */ },
                      { status: 'VALID_SUCCESS', color: 'green' /* , text: '验证成功' */ },
                      { status: 'VALID_FAILED', color: 'red' /* , text: '验证失败' */ },
                      { status: 'IMPORT_SUCCESS', color: 'green' /* , text: '导入成功' */ },
                      { status: 'IMPORT_FAILED', color: 'red' /* , text: '导入失败' */ },
                      { status: 'ERROR', color: 'red' /* , text: '数据异常' */ },
                    ];
                    return (
                      <div>{TagRender(value, statusList, record.toData()?._dataStatusMeaning)}</div>
                    );
                  },
                },
                {
                  name: '_info',
                  tooltip: 'overflow',
                },
                {
                  name: 'configCode',
                  width: 130,
                  tooltip: 'overflow',
                },
                {
                  name: 'configName',
                  width: 130,
                  tooltip: 'overflow',
                },
              ];
              const { quotationColumns = [] } = n;
              this.tableDs = {
                ...this.tableDs,
                [`${item.sheetIndex}#${n.templateNum}`]: new DataSet(listLineDS()),
              };
              quotationColumns.forEach((i) => {
                this.tableDs[`${item.sheetIndex}#${n.templateNum}`].addField(i.columnCode, {
                  name: i.columnCode,
                  label: i.columnName,
                });

                columnList.push({
                  name: i.columnCode,
                  width: 120,
                  tooltip: 'overflow',
                });
              });
              this.tableColumns = {
                ...this.tableColumns,
                [`${item.sheetIndex}#${n.templateNum}`]: columnList,
              };
            });
          });

          const importProps = {
            quotationHeaderCurrentId,
            sourceHeaderId,
            sourceFrom,
            templateCode,
            projectLineSectionId,
            operationType,
            remote,
          };
          // 更新弹框内容
          this.importModal.update({
            children: (
              <Import
                tabList={tabList}
                tableDs={this.tableDs}
                column={this.tableColumns}
                {...importProps}
              />
            ),
          });
        }
      });
    }
  }

  @Bind()
  async openModal() {
    const {
      quotationHeaderCurrentId = undefined,
      sourceFrom = 'RFX',
      title,
      onOk = () => {},
      onClose = () => {},
      onCancel = () => {},
      templateCode = 'SSRC.RFX_SUP_QUO_DETAIL',
      sourceHeaderId,
      projectLineSectionId,
      operationType = undefined,
      remote,
      // ...others
    } = this.props;

    const importProps = {
      templateCode,
      quotationHeaderCurrentId,
      sourceFrom,
      sourceHeaderId,
      projectLineSectionId,
      operationType,
      onRef: this.onImportRef,
      remote,
    };

    this.closeImportModalFlag = 0;
    this.importModal = Modal.open({
      title,
      destroyOnClose: true,
      closable: true,
      key: importModalKey,
      children: <Import {...importProps} />,
      style: { width: '80%', top: 30 },
      onOk,
      onClose: this.handleClose,
      onCancel,
    });

    this.fetchTabList();
  }

  onImportRef = (ref) => {
    this.importRef = ref;
  }

  calibrateImportResult = async () => {
    const {
      calibrateImportFinishBeforeClose = 0, // 关闭弹窗前校验导入是否完成
    } = this.props;

    const { getCurrentStatus } = this.importRef || {};

    let closeModal = true;
    if (!calibrateImportFinishBeforeClose) {
      return closeModal;
    }

    let statusRes = {};
    if (typeof getCurrentStatus === 'function') {
      statusRes = await getCurrentStatus();

      if (statusRes) {
        const { status } = statusRes || {};
        closeModal = status !== "IMPORTING";
        // closeModal = !status || status === "UPLOADED";
      }
    }

    return closeModal;
  }

  handleClose = async () => {
    const {
      onClose = () => {},
    } = this.props;

    if (this.closeImportModalFlag === 1) {
      return;
    }

    const closeModal = await this.calibrateImportResult();

    if (!closeModal) {
      this.importCalibrateModal = await Modal.confirm({
        key: calibrateModalKey,
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl.get('ssrc.quoDeImport.view.button.quotationDetailImportProcessWarningWait').d('数据未完全导入，请等待导入完成，如果此时提交，可能会导入失败，请问是否需要继续？')}
          </div>
        ),
        onOk: async () => {
          this.closeImportModalFlag = 1;

          if (this.importModal) {
            this.importModal.close(true);
          }

          onClose();
        },
        okProps: {
          waitType: 'throttle',
          wait: 1200,
        },
        onCancel: () => {
        },
      });

      const closeModalSymbol = this.importCalibrateModal === 'ok';
      return closeModalSymbol;
    }

    onClose();
  }

  render() {
    const { isDisabled = false, buttonProps = {}, buttonText } = this.props;

    return (
      <Button
        icon="vertical_align_bottom"
        onClick={this.openModal}
        disabled={isDisabled}
        {...buttonProps}
      >
        {buttonText ||
          intl.get('ssrc.quoDeImport.view.button.quotationDetailImport').d('报价明细导入')}
      </Button>
    );
  }
}
