import React, {memo} from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';
import formatterCollections from 'utils/intl/formatterCollections';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { getResponse, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import RenderChat from './methods';
import { fetchChatAPI } from './services';
import './index.less';

const currentUser = getCurrentUser();
const organizationId = getCurrentOrganizationId();


interface ChatProps {
    id?: string;
    icon?: string;
    camp?: string;
    btnText?: string;
    funcType?: FuncType;
    color?: ButtonColor;
    loading?: boolean;
    companyId?: string;
}

const ChatCmp = (props: ChatProps) => {
    const {
        id,
        camp,
        icon = '',
        loading = false,
        companyId,
        funcType = FuncType.flat,
        color=ButtonColor.default,
        btnText = intl.get('sinv.receiptWorkbench.view.title.detail.onlineChat').d('在线沟通'),
    } = props;

   async function openModal() {
       const res = await fetchChatAPI({camp, rcvHeaderId: id});
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
                            businessCode: 'rcv',
                            purchaseTenantId: organizationId,
                            currentUser: {
                            companyId,
                            tenantId: organizationId,
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
};

export default formatterCollections({ code: ['hzero.common', 'sinv.receiptWorkbench'] })(memo(ChatCmp));

export { RenderChat };