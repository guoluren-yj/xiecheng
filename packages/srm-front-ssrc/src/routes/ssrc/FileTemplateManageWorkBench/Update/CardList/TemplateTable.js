import React, { useContext, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Table,
  Button,
  Dropdown,
  Menu,
  Modal,
  Form,
  TextField,
  TextArea,
  Select,
  DataSet,
  Icon,
} from 'choerodon-ui/pro';

import DesignWord from 'hzero-front-hrpt/lib/routes/PrintTemplateNew/Content/TemplateConfig/DesignWord';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import {
  enableLineFileTemplate,
  saveWordUploadTemplate,
} from '@/services/fileTemplateManageService';
import { TooltipButtonPro } from '@/routes/components/TooltipButton';

import UploadTemplateFile from './UploadTemplateFile';
import { renderStatusTag } from '../../utils/renderer';
import { StoreContext } from '../store/StoreProvider';

import Style from '../index.less';

const HeaderInfo = observer(() => {
  const {
    commonDs: { headerDs, templateTableDs, editTempRecordFormDs } = {},
    pageSourceCategory,
  } = useContext(StoreContext);

  // disable or enable the file template
  const handleDisableOrEnableTemplate = ({ record } = {}) => {
    const { enabledFlag, fileTemplateId } = record.get(['enabledFlag', 'fileTemplateId']) || {};
    const fileManageId = headerDs?.current?.get('fileManageId');
    return enableLineFileTemplate({
      enabledFlag: enabledFlag ? 0 : 1,
      fileTemplateId,
      fileManageId,
    }).then((res) => {
      if (getResponse(res)) {
        templateTableDs.query();
      }
    });
  };

  // current operation
  const handleCurrentOperation = (record = {}, operateItem = {}) => {
    const { key: operation = '' } = operateItem || {};
    switch (operation) {
      case 'COPY': // copy
        // return handleCopy({ record }); // 先不做
        break;
      case 'ENABLE': // disable or enable
        return handleDisableOrEnableTemplate({ record });
      default:
        break;
    }
  };

  // show main actions
  const displayMainAction = (record = {}, list = []) => {
    return (
      <div className={Style.mainAction}>
        {list?.length > 0
          ? list.map((item) => {
              return (
                <div key={item.key} className={Style['display-main-action']}>
                  {item.type === 'component' ? (
                    item.component
                  ) : (
                    <Button
                      funcType="link"
                      disabled={item.controllerType === 'disabled'}
                      onClick={() => handleCurrentOperation(record, item)}
                    >
                      {item.operationMeaning}
                    </Button>
                  )}
                </div>
              );
            })
          : '-'}
      </div>
    );
  };

  // show more actions
  const displayMoreAction = (record = {}, list = []) => {
    return (
      <Menu>
        {list?.length &&
          list.map((item) => {
            return (
              <Menu.Item
                key={item.key}
                className={Style.dropdownMoreOperate}
                onClick={() => handleCurrentOperation(record, item)}
                disabled={item.controllerType === 'disabled'}
              >
                {item.type === 'component' ? (
                  item.component
                ) : (
                  <Button funcType="link">{item.operationMeaning}</Button>
                )}
              </Menu.Item>
            );
          })}
      </Menu>
    );
  };

  // display describe of more button
  const renderMoreLink = () => {
    return (
      <Button funcType="link" className={Style['quick-inquiry-more-link']}>
        {intl.get('ssrc.quickInquiry.model.quickInquiry.moreAction').d('更多')}
        <Icon type="expand_more" />
      </Button>
    );
  };

  // refresh template list after edit doc on line
  const refreshReport = () => {
    templateTableDs.query();
  };

  // edit doc on line component
  const getOnLineDOcComponent = ({ record } = {}) => {
    const { templateId, reportId, datasetId } = record.get(['templateId', 'reportId', 'datasetId']);
    return Modal.open({
      key: Modal.key(),
      fullScreen: true,
      className: Style['report-desgin-model'],
      children: (
        <DesignWord
          templateId={templateId} // line template id
          reportId={reportId} // 头id
          datasetId={datasetId} // 头里面的数据集id
          refreshReport={refreshReport} // 用于添加字段后刷新数据集
          isPredefined={false} // 是否是预定义
        />
      ),
      footer: null,
    });
  };

  // save upload file
  const handleSaveWordTemplate = useCallback(
    async ({ formRecord, templateId }) => {
      try {
        const flag = await formRecord.validate();
        if (!flag) {
          return false;
        }
        const attachmentUuid = formRecord.get('templateUrl');
        const attachments = formRecord.getField('templateUrl').getAttachments();
        const file = attachments && attachments[0] ? attachments[0] : undefined;
        if (file) {
          const res = await saveWordUploadTemplate({
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            attachmentUUID: attachmentUuid,
            templateId,
          });
          if (getResponse(res)) {
            notification.success();
            templateTableDs.query();
            // if (modal && modal.close) {
            //   modal.close();
            // }
          }
        }
      } catch (err) {
        throw err;
      }
    },
    [templateTableDs]
  );

  // the template upload dialog box is displayed
  const handleUploadAttachment = ({ record }) => {
    const templateId = record.get('templateId');
    const uploadFormDs = new DataSet({
      fields: [
        {
          name: 'templateUrl',
          label: intl
            .get('ssrc.fileTemplateManage.view.label.uploadTemplateFile')
            .d('模板文件上传'),
          type: 'attachment',
          required: true,
          multiple: false,
          defaultValidationMessages: {
            valueMissing: intl
              .get('ssrc.fileTemplateManage.view.message.uploadTemplate')
              .d('请上传模板文件'),
          },
        },
      ],
    });
    const uploadFormRecord = uploadFormDs.create();
    return Modal.open({
      title: intl.get('ssrc.fileTemplateManage.view.title.uploadTemplate').d('模板上传'),
      drawer: true,
      destroyOnClose: true,
      style: { width: '480px' },
      children: <UploadTemplateFile record={uploadFormRecord} />,
      onOk: () => handleSaveWordTemplate({ formRecord: uploadFormRecord, templateId }),
    });
  };

  // get template design button
  const getOnLineDocButton = ({ record }) => (
    <Button funcType="link" onClick={() => getOnLineDOcComponent({ record })}>
      {intl.get('ssrc.fileTemplateManage.view.button.templateDesigned').d('模板设计')}
    </Button>
  );

  // edit template button
  const getEditTemplateComponent = ({ record }) => {
    if (!record.get('canUploadFlag')) {
      return getOnLineDocButton({ record });
    }
    return (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item className={Style['dropdown-menu-item-btn']}>
              {getOnLineDocButton({ record })}
            </Menu.Item>
            <Menu.Item className={Style['dropdown-menu-item-btn']}>
              <Button
                funcType="link"
                onClick={() => handleUploadAttachment({ record })}
                wait={1200}
              >
                {intl.get('ssrc.fileTemplateManage.view.button.uploadTemplate').d('模板上传')}
              </Button>
            </Menu.Item>
          </Menu>
        }
        trigger={['click', 'hover']}
        placement="bottomLeft"
      >
        <Button funcType="link">
          <span>{intl.get('ssrc.fileTemplateManage.view.button.editTemplate').d('编辑模板')}</span>
          <Icon type="expand_more" />
        </Button>
      </Dropdown>
    );
  };

  // operate
  const renderOperation = ({ record }) => {
    const buttons = [
      {
        key: 'TEMPLATE_DESIGN',
        type: 'component',
        component: getEditTemplateComponent({ record }),
      },
      // {
      //   key: 'COPY',
      //   type: 'button',
      //   operationMeaning: intl.get('ssrc.fileTemplateManage.view.button.copy').d('复制'),
      // },
      {
        key: 'ENABLE',
        type: 'button',
        operationMeaning: record.get('enabledFlag')
          ? intl.get('hzero.common.button.disable').d('禁用')
          : intl.get('hzero.common.status.enable').d('启用'),
      },
    ];
    let mainActions = [];
    let moreActions = [];
    if (buttons.length > 3) {
      mainActions = buttons.splice(0, 2);
      moreActions = buttons.splice(2);
    } else {
      mainActions = buttons;
    }
    return (
      <div className={Style.action}>
        <div> {displayMainAction(record, mainActions)} </div>
        {moreActions?.length ? (
          <Dropdown
            overlay={displayMoreAction(record, moreActions)}
            trigger={['click', 'hover']}
            placement="bottomLeft"
          >
            {renderMoreLink(record)}
          </Dropdown>
        ) : null}
      </div>
    );
  };

  // edit template record
  const handleEditTemplate = ({ record, createFlag }) => {
    if (createFlag) {
      editTempRecordFormDs.create();
    } else {
      editTempRecordFormDs.create(record?.toData() || {});
    }
    return Modal.open({
      key: Modal.key(),
      title: createFlag
        ? intl.get('hzero.common.btn.add').d('新增')
        : intl.get('hzero.common.button.edit').d('编辑'),
      drawer: true,
      closable: true,
      style: { width: '380px' },
      children: (
        <Form dataSet={editTempRecordFormDs} labelLayout="float" columns={1}>
          <TextField name="fileTemplateName" />
          <Select
            name="fileTemplateLang"
            clearButton={false}
            optionsFilter={(option) => {
              if (option && templateTableDs.records.length > 0) {
                return templateTableDs.every(
                  (r) => r.get('fileTemplateLang') !== option.get('value')
                );
              }
              return true;
            }}
          />
          <TextArea name="remark" resize="vertical" />
        </Form>
      ),
      onOk: async () => {
        try {
          const flag = await editTempRecordFormDs.validate();
          if (!flag) {
            return false;
          }

          return editTempRecordFormDs.submit().then((res) => {
            if (getResponse(res)) {
              templateTableDs.query();
            }
          });
        } catch (err) {
          throw err;
        }
      },
    });
  };

  // table columns
  const columns = useMemo(() => {
    return [
      {
        name: 'enabledFlag',
        renderer: ({ value }) => renderStatusTag(value),
      },
      {
        name: 'operate',
        renderer: renderOperation,
      },
      {
        name: 'fileTemplateName',
        renderer: ({ value, record }) => {
          return (
            <Button funcType="link" onClick={() => handleEditTemplate({ record })}>
              {value}
            </Button>
          );
        },
      },
      {
        name: 'fileTemplateLang',
      },
      {
        name: 'remark',
      },
    ];
  }, []);

  // table buttons
  const tableButtons = useMemo(() => {
    return [
      <TooltipButtonPro
        name="add"
        icon="playlist_add"
        funcType="flat"
        disabled={pageSourceCategory === 'create'}
        onClick={() => handleEditTemplate({ createFlag: true })}
        help={intl.get('ssrc.fileTemplateManage.view.message.saveTemplateTip').d('请先保存模板')}
      >
        {intl.get('hzero.common.btn.add').d('新增')}
      </TooltipButtonPro>,
    ];
  }, []);

  return (
    <Table
      dataSet={templateTableDs}
      columns={columns}
      buttons={tableButtons}
      customizedCode="SSRC.BID_FILE_TEMPLATE.UPDATE.TEMPLATE_TABLE"
    />
  );
});

export default HeaderInfo;
