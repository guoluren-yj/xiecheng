import React from 'react';
import { Tag } from 'choerodon-ui';
import {
    Modal,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';

// 渲染状态列
const StatusRender = (status, statusMeaning) => {
    let color = 'green';
    switch (status) {
        case 'HANDLING':
            color = 'yellow';
            break;
        case 'ERROR':
            color = 'red';
            break;
        default:
            break;
    }
    return (statusMeaning && (
    <Tag color={color} style={{ border: 'none' }}>
      {statusMeaning}
    </Tag>
    )
    );
};

// 通用打开弹窗，弹窗为不可编辑
const handleOpenCommonModal = (modalProps) => {
    const {
        title,
        width,
        children,
    } = modalProps;
    Modal.open({
        title,
        children,
        drawer: true,
        destroyOnClose: true,
        style: { width },
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
    });
};

const ViewLinkRender = (modalProps) => {
    return <a onClick={() => handleOpenCommonModal(modalProps)}>{intl.get(`hzero.common.button.view`).d('查看')}</a>;
};

export {
    StatusRender,
    ViewLinkRender,
    handleOpenCommonModal,
};
