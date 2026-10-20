import React, {useEffect, useState} from "react";
import { Button, Icon } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import {historyChange} from '@/services/ShipmentsConfigurationService';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

import './index.less';

interface ParamsProps {
    id?: string,
    menuClick?: any,
};

const Buttonv = observer((props: ParamsProps) => {
    const {id, menuClick} = props;
    const [historyList, useHistory] = useState([]);
    useEffect(() => {
        historyChangeList();
    }, [id]);


    const historyChangeList = async () => {
        const res = await historyChange({ strategyHeaderId: id });
        if (getResponse(res)) {
          useHistory(res);
        }
    };

    const content1 = (
      <div className='ver_dev'>
        {historyList.map((item: any) => {
            return (
              <div onClick={()=>menuClick(item?.dataVersion)} className='ver_dev_a'>
                <a className='ver_dev_v'>{`${intl.get('slod.shipmentsConfiguration.model.peizhiBanben').d('版本')}${"v"}${item?.dataVersion}`}</a>
                <div className='ver_dev_text'>
                  <span className='ver_dev_name'>{item?.createdName}</span>
                  <span className='ver_dev_data'>{item?.creationDate}</span>
                </div>
              </div>
            );
        })}
      </div>
    );
    const content2 = (
      <div>
        <div className='ver_dev_empty'>{intl.get(`hzero.common.button.historyEmpty`).d('暂无历史版本信息')}</div>
      </div>
    );

  const content = isEmpty(historyList) ? content2 : content1;
    return (
      <Popover style={{padding: "0px"}} placement="bottom" content={content} trigger="hover">
        <Button icon="schedule" funcType={FuncType.flat}>
          {intl.get(`slod.deliveryWorkbench.view.title.seeHistory`).d('历史版本')}
          <Icon type="expand_more" />
        </Button>
      </Popover>
    );
});

export default Buttonv;