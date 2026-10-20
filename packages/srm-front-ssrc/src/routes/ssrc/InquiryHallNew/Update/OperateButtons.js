// 询价单操作按钮
import React, { Component } from 'react';
import { Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import DynamicButtons from '_components/DynamicButtons';
import intl from 'utils/intl';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getCurrentOrganizationId } from 'utils/utils';

import { TooltipButtonPro } from '@/routes/components/TooltipButton';
import PreviewScoreManager from '@/routes/ssrc/components/PreviewScoreManager';

@observer
export default class OperateButtons extends Component {
  constructor(props) {
    super(props);
    props.onButtonsRef(this);

    this.state = {
      isLoading: false, // 按钮操作
    };
  }

  // 切换loading status
  @Bind()
  toggleButtonLoading(isLoading = false) {
    this.setState({
      isLoading,
    });
  }

  // 预览分权
  previewScoreManager = () => {
    const { rfxId, organizationId } = this.props;

    const modalProps = {
      rfxId,
      organizationId,
    };

    Modal.open({
      key: Modal.key(),
      closable: true,
      destroyOnClose: true,
      title: intl.get('ssrc.inquiryHall.view.button.previewSeperatePower').d('预览分权'),
      style: { width: '800px' },
      children: <PreviewScoreManager {...modalProps} />,
      footer: false,
    });
  };

  getButtons = () => {
    const {
      rfxId = null,
      RfxInfoDS = {},
      releaseInquiryHall,
      saveInquiryHallUpdate,
      cancelInquiryHallUpdate,
      inquiryHallLoading = false,
      remote,
      bidFlag = false,
      integrationPageData = () => {},
      organizationId,
      supplierListTableDS,
      itemLineTableDS,
      rfx = {},
    } = this.props;
    const { isLoading = false } = this.state;

    const NewRFXFlag = rfxId && rfxId !== 'null';
    const TemplateFlag = RfxInfoDS.current.get('templateId');

    const { sourceKey } = rfx;

    const buttons = [
      {
        name: 'scoreElementsExport',
        hidden: !NewRFXFlag, // 新建询价单状态不显示评分要素导出按钮
        btnComp: ExcelExportPro,
        btnProps: {
          templateCode: 'SRM_C_STANDARD_SSRC_EVALUATE_INDIC_EXPORT',
          name: 'scoreElementsExport',
          requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/evaluate-indics/export`,
          method: 'GET',
          buttonText: intl
            .get('ssrc.inquiryHall.view.button.export.scoreElements')
            .d('评分要素导出'),
          queryParams: {
            sourceHeaderId: rfxId,
            indicStatus: 'SUBMITTED',
            indicateLevel: 'ONE',
            sourceFrom: 'RFX',
            organizationId: getCurrentOrganizationId(),
            customizeUnitCode: `SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS,SSRC.${sourceKey}_HALL.NEW_EDIT.HEADER.SCORE_INDICS_TECHNOLOGY,SSRC.${sourceKey}_HALL.NEW_EDIT.SCORE.EXPERT_ASSIGN_V2`,
          },
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
          },
        },
      },
      NewRFXFlag && {
        name: 'preview',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'report_overview',
          funcType: 'flat',
          wait: 500,
          waitType: 'debounce',
          loading: isLoading,
          disabled: inquiryHallLoading,
          onClick: this.previewScoreManager,
        },
        child: intl.get('ssrc.inquiryHall.view.button.previewSeperatePower').d('预览分权'),
      },
      NewRFXFlag && {
        name: 'cancel',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'cancel',
          funcType: 'flat',
          wait: 500,
          waitType: 'debounce',
          loading: isLoading || inquiryHallLoading,
          onClick: cancelInquiryHallUpdate,
        },
        child: intl.get('hzero.common.button.cancel').d('取消'),
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        btnComp: TooltipButtonPro,
        btnProps: {
          icon: 'save',
          help: intl.get('ssrc.common.view.message.source-template.save.tip').d('请先维护寻源模板'),
          funcType: NewRFXFlag ? 'flat' : 'raised',
          // wait: 500,
          // waitType: 'debounce',
          loading: isLoading || inquiryHallLoading,
          onClick: saveInquiryHallUpdate,
          disabled: !TemplateFlag,
          color: !NewRFXFlag && 'primary',
        },
        child: intl.get('hzero.common.button.save').d('保存'),
      },
      NewRFXFlag && {
        name: 'release',
        btnType: 'c7n-pro',
        btnProps: {
          icon: 'publish2',
          color: 'primary',
          // wait: 500,
          // waitType: 'debounce',
          loading: isLoading || inquiryHallLoading,
          onClick: releaseInquiryHall,
          disabled: RfxInfoDS && RfxInfoDS.current && !TemplateFlag,
        },
        child: intl.get('hzero.common.button.release').d('发布'),
      },
    ].filter(Boolean);
    return remote
      ? remote.process('SSRC_INQUIRYHALLNEW_UPDATE_PROCESS_HEADER_BUTTONS', buttons, {
          bidFlag,
          NewRFXFlag,
          RfxInfoDS,
          integrationPageData,
          organizationId,
          toggleButtonLoading: this.toggleButtonLoading,
          isLoading,
          current: this,
          rfxId,
          supplierListTableDS,
          itemLineTableDS,
        })
      : buttons;
  };

  render() {
    const { RfxInfoDS = {}, customizeBtnGroup = () => {}, rfx = {} } = this.props;
    const { sourceKey } = rfx;

    if (!RfxInfoDS || !RfxInfoDS.current) {
      return null;
    }

    return (
      <React.Fragment>
        {customizeBtnGroup(
          { code: `SSRC.${sourceKey}_HALL.NEW_EDIT.BUTTON_GROUP`, pro: true },
          <DynamicButtons buttons={this.getButtons()} />
        )}
      </React.Fragment>
    );
  }
}
