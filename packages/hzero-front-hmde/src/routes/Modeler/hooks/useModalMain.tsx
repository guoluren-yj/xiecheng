import React, { useMemo, useRef } from 'react';
// import { getResponse } from 'utils/utils';
// import notification from 'utils/notification';
// import { DataSet } from 'choerodon-ui/pro';
import Modal from '@/components/LowcodeModal';
import { ModalProps } from 'choerodon-ui/pro/lib/modal/Modal';
import { TagsManager, TagsDistribution } from './tags';
import { ITagsDistribution } from './tags/TagsDistribution';

import styles from './tags/index.less';

interface IGlobalState {
  tagsManagerModal: ModalProps;
  tagsDistributionModal: ModalProps;
  createNewTagModal: ModalProps;
}
export interface IData {
  name: string;
  type?: string;
  code: string;
  id?: string;
}

const tagsManagerModalKey: string = Modal.key();
const tagsDistributionModalKey: string = Modal.key();

const useModalMain = () => {
  const globalState = useMemo<IGlobalState>(() => ({} as IGlobalState), []);
  const tagsDistributionRef = useRef<any>(undefined);

  /**
   * 标签管理
   */
  const openTagsManagerModal = (props) => {
    globalState.tagsManagerModal = Modal.open({
      key: tagsManagerModalKey,
      lowcodeSize: 'big',
      className: styles['tags-manager-modal'],
      title: '标签管理',
      closable: true,
      style: { top: 125 },
      children: <TagsManager {...props} />,
      okCancel: false,
      okText: '关闭',
    });
  };

  /**
   * 标签分配
   */
  const openTagsDistributionModal = (props: ITagsDistribution) => {
    globalState.tagsDistributionModal = Modal.open({
      key: tagsDistributionModalKey,
      lowcodeSize: 'bigger',
      className: styles['tags-manager-modal'],
      title: '标签分配',
      closable: true,
      children: <TagsDistribution ref={tagsDistributionRef} {...props} />,
      onOk: () => {
        if (tagsDistributionRef?.current) {
          return tagsDistributionRef.current.submit();
        }
      },
    });
  };

  return {
    openTagsManagerModal,
    openTagsDistributionModal,
  };
};

export default useModalMain;
