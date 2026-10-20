import React, { PureComponent } from 'react';
import { DataSet, Modal, Button, Icon, Tooltip } from 'choerodon-ui/pro';
import { Button as HzeroButton } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import remotes from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { TagRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchTabList, getSupplierList } from './api';
import { listLineDS } from './store';
import Import from './Import';

const importModalKey = Modal.key();
const calibrateModalKey = Modal.key();

@remotes({
  code: 'SSRC_QUOTATION_DETAIL_OFFLINE_IMPORT',
  name: 'remote',
}, {
  events: {
    handleRemoteBeforeExcelDownload() { }, // cux
    handleRemoteMenuItemEventList() { }, // cux
  },
})
@formatterCollections({
  code: ['ssrc.quoDeImport', 'ssrc.common'],
})
export default class QuotationDetailImport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      supplierList: [],
      currentQuotationId: '',
      tabList: [],
    };
    this.tableDs = {};
    this.tableColumns = {};

    this.importModal = null;

    this.importCalibrateModal = null;
    this.importRef = null;
  }

  @Bind()
  fetchTabList(currentId) {
    const {
      remote,
      pageSource,
      rfxHeaderId = undefined,
      sourceFrom = 'RFX',
      sourceHeaderId = undefined,
      templateCode = 'SSRC.RFX_SUP_QUO_DETAIL',
      projectLineSectionId,
      operationType = undefined,
    } = this.props;
    const {
      supplierList = [],
      currentQuotationId = '',
    } = this.state;
    if(currentQuotationId === currentId) {
      return;
    }
    if (rfxHeaderId || sourceHeaderId) {
      fetchTabList({
        quotationHeaderId: currentId,
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
            remote,
            pageSource,
            quotationHeaderId: currentId,
            sourceHeaderId,
            sourceFrom,
            templateCode,
            projectLineSectionId,
            operationType,
            list: supplierList || [],
            fetchTabList: this.fetchTabList,
            rfxHeaderId,
            setList: this.setList,
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
          this.setState({
            currentQuotationId: currentId,
            tabList: tabList,
          });
        }
      });
    }
  }

  @Bind()
  setList(list = []){
    const {
      remote,
      pageSource,
      rfxHeaderId = undefined,
      sourceFrom = 'RFX',
      sourceHeaderId = undefined,
      templateCode = 'SSRC.RFX_SUP_QUO_DETAIL',
      projectLineSectionId,
      operationType = undefined,
    } = this.props;
    const {
      currentQuotationId = '',
      tabList = [],
    } = this.state;
    const importProps = {
      remote,
      pageSource,
      quotationHeaderId: currentQuotationId,
      sourceHeaderId,
      sourceFrom,
      templateCode,
      projectLineSectionId,
      operationType,
      list: list || [],
      fetchTabList: this.fetchTabList,
      rfxHeaderId,
      setList: this.setList,
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
    this.setState({
      supplierList: list || [],
    });
  }

  @Bind()
  openModal() {
    const {
      remote,
      pageSource,
      sourceFrom = 'RFX',
      title,
      onOk = () => {},
      onClose = () => {},
      onCancel = () => {},
      templateCode = 'SSRC.RFX_SUP_QUO_DETAIL',
      sourceHeaderId,
      projectLineSectionId,
      operationType = undefined,
      rfxHeaderId,
    } = this.props;

    getSupplierList({ rfxHeaderId }).then(res => {
      if(getResponse(res)){
        const currentQuotationId = res[0]?.quotationHeaderId || '';
        const importProps = {
          remote,
          pageSource,
          templateCode,
          quotationHeaderId: currentQuotationId,
          sourceFrom,
          sourceHeaderId,
          projectLineSectionId,
          operationType,
          list: res || [],
          fetchTabList: this.fetchTabList,
          rfxHeaderId,
          setList: this.setList,
          onRef: this.onImportRef,
        };

        this.closeImportModalFlag = 0;
        this.importModal = Modal.open({
          title,
          destroyOnClose: true,
          closable: true,
          key: importModalKey,
          children: <Import {...importProps} />,
          style: { width: '80%' },
          onOk,
          onClose: this.handleClose,
          onCancel,
          afterClose: () => {
            this.setState({
              currentQuotationId: '',
            });
          },
        });
        this.setState({
          supplierList: res || [],
        }, () => {
          this.fetchTabList(currentQuotationId);
        });
      }
    });
  }

  onImportRef = (ref) => {
    this.importRef = ref;
  }

  calibrateImportResult = async () => {
    const {
      calibrateImportFinishBeforeClose = 1, // 关闭弹窗前校验导入是否完成
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
            this.importModal.close();
          }
          onClose();
        },
        okProps: {
          waitType: 'throttle',
          wait: 1200,
        },
        onCancel: () => {},
      });

      const closeModalSymbol = this.importCalibrateModal === 'ok';
      return closeModalSymbol;
    }

    onClose();
  }

  render() {
    // isH0Btn 和当前页面的按钮风格保持一致
    const {
      isDisabled = false,
      isH0Btn = false,
      buttonProps = {},
      className,
      buttonText,
      existsQuotationDetailFlag = 0,
    } = this.props;
    return isH0Btn ? (
      <HzeroButton onClick={this.openModal} disabled={isDisabled} className={className}>
        <Icon
          type="vertical_align_bottom"
          style={{
            marginRight: '.05rem',
            fontWeight: 400,
            fontSize: '.14rem',
          }}
        />
        {buttonText ||
          intl.get('ssrc.quoDeImport.view.button.quotationDetailImport').d('报价明细导入')}
      </HzeroButton>
    ) : (
      <Tooltip title={existsQuotationDetailFlag !== 1 && intl.get('ssrc.offlineResultEntry.view.button.offlineDetailImportTooltip').d('暂无报价明细模板数据，请维护后再使用。')}>
        <Button
          icon="vertical_align_bottom"
          onClick={this.openModal}
          disabled={isDisabled}
          className={className}
          {...buttonProps}
        >
          {buttonText ||
            intl.get('ssrc.quoDeImport.view.button.quotationDetailImport').d('报价明细导入')}
        </Button>
      </Tooltip>
    );
  }
}
