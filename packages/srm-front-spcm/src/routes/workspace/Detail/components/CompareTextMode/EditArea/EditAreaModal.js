/**
 * 选择编辑区域弹窗
 */
import React, { useEffect, useMemo } from 'react';
import { Select, Form, Modal, DataSet, Button } from 'choerodon-ui/pro';
import { isFunction } from 'lodash';
import intl from 'utils/intl';
import EditAreaDS from './EditAreaDS';
import styles from '../index.less';

const EditAreaModal = (props) => {
  const {
    headerInfo: { pcHeaderId },
    modal: { update, close },
    onConfirm = () => {},
    onlyEditReplaceWildcardBefore,
  } = props;
  const dataSet = useMemo(() => new DataSet(EditAreaDS(pcHeaderId)), [pcHeaderId]);

  useEffect(() => {
    // 创建初始数据
    dataSet.create({
      pcHeaderId,
      pcHeaderEditArea: onlyEditReplaceWildcardBefore === '1' ? '3' : '0',
      pcHeaderQueryArea: '1',
      firstConfirmEditArea: '1',
    });
    // 修改弹窗底部按钮
    update({
      footer: <div>{FooterBtns}</div>,
    });
  }, []);

  const handleConfirm = () => {
    dataSet.submit().then((res) => {
      if (res) {
        if (isFunction(onConfirm)) {
          onConfirm();
        }
        close();
      }
    });
  };

  const FooterBtns = useMemo(() => [
    <Button color="primary" onClick={handleConfirm}>
      {intl.get('hzero.common.button.confirm').d('确定')}
    </Button>,
    <Button onClick={close}>{intl.get('hzero.common.button.close').d('关闭')}</Button>,
  ]);

  return (
    <div className={styles.chooseEditArea}>
      <div className={styles.titleWrapper}>
        <div className={styles.title}>
          {/* {intl.get('spcm.workspace.view.card.leftPosition').d('左边区域（修改区域）')} */}
          {intl.get('spcm.workspace.view.card.selectFileForEdit').d('选择文件进行修改')}
        </div>
      </div>
      <Form labelLayout="float">
        <Select
          dataSet={dataSet}
          optionsFilter={(record) => {
            const value = record.get('value');
            if (onlyEditReplaceWildcardBefore === '1') {
              return !['0', '4'].includes(value);
            } else {
              return !['3', '4'].includes(value);
            }
          }}
          name="pcHeaderEditArea"
        />
      </Form>
      {/* <div className={styles.hintWrapper} onClick={handleConfirm}>
        <span className={styles.hint}>
          {intl
            .get('spcm.workspace.view.hint.editAreaHint')
            .d(
              '如文本中设置过替换页签，最新版本文件因替换页签已被完全替换再次被引用为文本后将无替换页签执行替换。'
            )}
        </span>
      </div> */}
      {/* <div className={styles.titleWrapper} style={{ marginTop: '32px' }}>
        <div className={styles.title}>
          {intl.get('spcm.workspace.view.card.rightPosition').d('右边区域（只读区域）')}
        </div>
      </div>
      <Form labelLayout="float">
        <Select dataSet={dataSet} name="pcHeaderQueryArea" />
      </Form> */}
    </div>
  );
};

const openEditArea = (props) => {
  const modalKey = Modal.key();
  Modal.open({
    destroyOnClose: true,
    closable: true,
    key: modalKey,
    drawer: true,
    title: intl.get('spcm.workspace.view.modal.title.ChooseEditArea').d('编辑区域选定'),
    children: <EditAreaModal {...props} />,
    style: { width: '380px' },
  });
};

export default openEditArea;
