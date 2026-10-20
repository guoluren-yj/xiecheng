import React, {memo} from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';
import formatterCollections from 'utils/intl/formatterCollections';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { getResponse, getCurrentOrganizationId, getUserOrganizationId, getCurrentUser } from 'utils/utils';
import RenderChat from './methods';
import { fetchChatAPI } from './services';
import './index.less';

const currentUser = getCurrentUser();
const tenantId = getUserOrganizationId();
const organizationId = getCurrentOrganizationId();


interface ChatProps {
    id?: string;
    icon?: string;
    campKey?: string;
    btnText?: string;
    funcType?: FuncType;
    color?: ButtonColor;
    loading?: boolean;
    nodeConfigId?: string;
    nodeTemplateCode?: string;
    companyId?: string;
}

const ChatCmp = observer((props: ChatProps) => {
    const {
        id,
        campKey,
        icon = '',
        loading = false,
        nodeConfigId,
        nodeTemplateCode,
        companyId,
        funcType = FuncType.flat,
        color=ButtonColor.default,
        btnText = intl.get('sinv.receiptWorkbench.view.title.detail.onlineChat').d('在线沟通'),
    } = props;
    const template = nodeTemplateCode === 'UNIQUE_LABEL' ? 'LABEL'.toLowerCase() : nodeTemplateCode?.toLowerCase();
   async function openModal() {
       const res = await fetchChatAPI({campKey, headerId: id, nodeConfigId, nodeTemplateCode});
       if (getResponse(res)) {
        const chatModal = Modal.open({});
        chatModal.update({
            resizable: true,
            style: { width: 742 },
            bodyStyle: { padding: 0 },
            footer: null,
            header: null,
            drawer: true,
            children: (
              <ChatRoom
                contentClass='chatRoom'
                onClose={() => chatModal.close()}
                showClose
                roomParams={{
                            businessNo: id,
                            businessCode: template,
                            purchaseTenantId: organizationId,
                            currentUser: {
                            companyId,
                            tenantId,
                            userId: currentUser.id,
                            },
                    }}
              />
              ),
        });
       }
    }

    return (
      <Button
        wait={1000}
        icon={icon}
        color={color}
        funcType={funcType}
        onClick={openModal}
        loading={loading}
      >
        {btnText}
      </Button>
      );
});

export default formatterCollections({ code: ['hzero.common', 'sinv.receiptWorkbench'] })(memo(ChatCmp));

export { RenderChat };