/**
 * 高级设置
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @since: 2022-09-13 14:23:03
 * @description: 高级设置
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { useMemo, useState, useRef } from 'react';
// import { observer } from 'mobx-react-lite';
import { Icon, Divider, Upload } from 'choerodon-ui';
import { Button, Form, ModalProvider, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getAccessToken, getPlatformVersionApi, getCurrentUser } from 'utils/utils';
import { PUBLIC_BUCKET } from '_utils/config';
import ProtocolModal from './ProtocolModal';
import CustomSelect from './CustomSelect';

import styles from './index.less';

const { Item } = Form;

export default formatterCollections({
  code: ['hiam.theme'],
})(
  ({
    setThemeConfigInfo,
    themeConfigInfo,
    tempTheme,
    uuid,
    themeComponentColorList,
    saveComponentColorList,
  }) => {
    const { fileList = [], colorCode } = themeConfigInfo;
    const uploadRef = useRef({});
    const ModalPro = ModalProvider.useModal();
    const [fileLoading, setFileLoading] = useState(false);
    const [moreSettingHidden, setMoreSettingHidden] = useState(true);

    const openProtocolModal = () => {
      const modal = ModalPro.open({
        className: styles['theme-config-protocol'],
        children: <ProtocolModal uploadRef={uploadRef} modal={modal} />,
        border: false,
        footer: false,
      });
    };

    const onBeforeUpload = (e) => {
      e.stopPropagation();
      const { additionInfo } = getCurrentUser() || {};
      if (additionInfo && additionInfo.relWechatWorkNum) {
        notification.error({
          message: intl
            .get('hiam.theme.view.message.unauthorized.zhenyun')
            .d('甄云内部员工账号无权上传字体包，请联系用户配置'),
        });
      } else {
        openProtocolModal();
      }
    };

    const updateMoreSetting = () => {
      setMoreSettingHidden(!moreSettingHidden);
    };

    const uploadProps = useMemo(() => {
      return {
        headers: { Authorization: `bearer ${getAccessToken()}` },
        name: 'file',
        action: `${HZERO_FILE}/v1/${getPlatformVersionApi('files/attachment/multipart-with-info')}`,
        accept: ['.ttf', '.woff', '.eot', '.svg'],
        fileList,
        data: (file) => {
          return {
            bucketName: PUBLIC_BUCKET,
            directory: 'hiam-theme-config',
            fileName: file.name,
            attachmentUUID: uuid,
          };
        },
        onSuccess(response, file) {
          const { fileUrl: url, fileId: id } = response;
          setFileLoading(false);
          setThemeConfigInfo((preState) => ({
            ...preState,
            fileUrl: url,
            fontFileId: id,
            fileList: [file],
          }));
        },
        onProgress() {
          setFileLoading(true);
        },
        onError(response) {
          setFileLoading(false);
          notification.error({
            message: response.message || '',
          });
        },
        onRemove() {
          setThemeConfigInfo((preState) => ({
            ...preState,
            fileUrl: '',
            fontFileId: null,
            fileList: [],
          }));
        },
      };
    }, [uuid, fileList, uploadRef]);

    const customSelectProps = useMemo(
      () => ({
        setThemeConfigInfo,
        colorCode,
        tempTheme,
      }),
      [colorCode, tempTheme]
    );

    return (
      <>
        <div className="setup-title" style={{ marginBottom: '23px' }}>
          {intl.get('hiam.theme.view.title.config.custom.component').d('组件自定义颜色')}
        </div>
        <Item>
          <CustomSelect
            {...customSelectProps}
            componentColor={themeConfigInfo.navColor}
            componentCode="navColor"
            label={intl.get('hiam.theme.view.modal.nav').d('顶部导航')}
          />
        </Item>
        {themeComponentColorList.map((com, index) => {
          const { componentCode, label, svg, componentColor } = com;
          if (!moreSettingHidden || (moreSettingHidden && index < 2)) {
            return (
              <Item>
                <CustomSelect
                  {...customSelectProps}
                  componentColor={componentColor}
                  componentCode={componentCode}
                  label={label}
                  svg={svg}
                  saveComponentColorList={saveComponentColorList}
                />
              </Item>
            );
          }
          return null;
        })}
        <Item>
          <Divider
            className={`more-${moreSettingHidden ? 'hidden' : 'show'}`}
            onClick={updateMoreSetting}
            dashed
          >
            {intl.get('hiam.theme.view.title.more.component').d('更多组件')}
            <Icon type="keyboard_arrow_down" />
          </Divider>
        </Item>
        <div className="setup-title" style={{ marginBottom: '8px' }}>{intl.get('hiam.theme.view.title.config.font').d('字体')}</div>
        <Item>
          <Upload {...uploadProps}>
            <Button
              funcType="link"
              color="primary"
              type="primary"
              loading={fileLoading}
              ref={uploadRef}
            >
              <Icon type="file_upload" />
              {intl.get('hiam.theme.view.button.upload.font').d('上传字体包')}
              <span className="upload-len">{Number(fileList.length)}/1</span>
              <div className="upload-mask" onClick={onBeforeUpload} />
            </Button>
          </Upload>
        </Item>
        <Item>
          <div className="theme-config-upload-tip">
            <p>
              1.
              {intl.get('hiam.theme.view.text.upload.tips1').d('请上传.ttf, .woff, .eot格式文件;')}
            </p>
            <p>
              2.
              {intl
                .get('hiam.theme.view.text.upload.tips2')
                .d('注意，自定义字体文件可能会出现不同浏览器兼容性问题;')}
            </p>
            <p>
              3.
              {intl.get('hiam.theme.view.text.upload.tips3').d('上传后请点击保存并刷新浏览器;')}
            </p>
          </div>
        </Item>
      </>
    );
  }
);
