/**
 * 编辑模式
 */
import React, { useCallback, useEffect } from 'react';
import { Row, Col } from 'choerodon-ui';
import querystring from 'querystring';
import { getEnvConfig } from 'utils/iocUtils';
import styles from '../index.less';

const { BASE_PATH } = getEnvConfig();

export default function EditMode(props) {
  const {
    isEditMode,
    isView,
    enableTemplateEdit,
    pcHeaderId,
    pcHeaderEditArea,
    // pcHeaderQueryArea,
    onRef,
    coordinatedFlag,
    hiddenRejectCompareTextFlag = false,
    createdTextFlag = false,
    showContractTextMode = false,
    refreshWpsFlag = false,
  } = props;

  useEffect(() => {
    // 编辑模式下，页面加载完成后
    if (isEditMode) {
      const editArea = document.getElementById('leftEditIframe');
      if (editArea) {
        onRef(editArea.contentWindow.frames);
      }
    }
  }, []);

  const renderContent = (position, contentProps) => {
    const { className, routerParams } = contentProps;
    // 截取浏览器/spcm部分，获取地址前缀
    const src = `${BASE_PATH}pub/spcm/contract-workspace/editor-online/${pcHeaderId}?${querystring.stringify(
      routerParams
    )}`;
    return (
      <Col
        span={24}
        className={className}
        style={{
          height: '100%',
        }}
      >
        <iframe
          title="position"
          id={position}
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          width="100%"
          // height="600px"
          height="100%"
          src={src}
        />
      </Col>
    );
  };

  const renderLeft = useCallback(() => {
    const showRejectFileFlag =
      hiddenRejectCompareTextFlag && !createdTextFlag && !showContractTextMode; // 隐藏文本对比并且是未创建文本不可编辑协议
    const contentProps = {
      className: styles.leftContent,
      routerParams: {
        pcHeaderWorkbenchPreTextFlag: '1',
        fileFlag: pcHeaderEditArea,
        // 允许模板可编辑，且不为只读模式
        permissionCode: showRejectFileFlag
          ? 'VIEW'
          : enableTemplateEdit === '1' && !isView && coordinatedFlag !== '1'
          ? 'EDIT'
          : 'VIEW',
        showRejectFileFlag, // true 展示拒绝文件，false 原标准逻辑
        refreshWpsFlag, // 此标识用来点击替换文件之后，改变iframe的地址来实现刷新wps文件
      },
    };
    return renderContent('leftEditIframe', contentProps);
  }, [
    pcHeaderEditArea,
    coordinatedFlag,
    hiddenRejectCompareTextFlag,
    createdTextFlag,
    showContractTextMode,
    refreshWpsFlag,
  ]);

  // const renderRight = useCallback(() => {
  //   const contentProps = {
  //     className: styles.rightContent,
  //     routerParams: {
  //       pcHeaderWorkbenchPreTextFlag: '1',
  //       fileFlag: pcHeaderQueryArea,
  //       permissionCode: 'VIEW',
  //     },
  //   };
  //   return renderContent('rightViewIframe', contentProps);
  // }, [pcHeaderQueryArea]);

  return (
    <Row className={styles.editMode} style={{ display: isEditMode ? 'block' : 'none' }}>
      {renderLeft()}
      {/* {renderRight()} */}
    </Row>
  );
}
