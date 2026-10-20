/**
 * index.js 收货管理配置-新
 * @date: 2022-11-14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'srm-front-boot/lib/utils/intl/index.js';
import ReturnCard from '@/routes/NewReceiptManageConfig/components/ReturnCard';

import styles from "./index.less";

 export default function Card(props) {
   const { handleCeckBoxChange = e => e, type, checkoutBoxFlag=false } = props;
     return (
       <div className={styles.card}>
         <div className={styles['card-left']}><div className={styles['card-img']}><ReturnCard /></div></div>
         <div className={styles['card-right']}>
           <p className={styles['card-right-title']}>
             {
               type === 'node' ?
                 intl.get(`sinv.receiptManage.view.title.noReturnOpen`).d('暂未启用退货') :
               intl.get(`sinv.receiptManage.view.title.noHaveCreateNode`).d('暂未创建节点')
               }
           </p>
           <p className={styles['card-right-text']}>
             {
               type === 'node' ?
                 checkoutBoxFlag ?
                   intl.get(`sinv.receiptManage.view.title.returnDeliveryASN`)
               .d('送货单（单据类型）节点不可维护退货类型。'):
               intl.get(`sinv.receiptManage.view.title.returnDeliveryOpen`)
                   .d('退货支持维护不同系统来源的退货类型编码及描述，如果没有退货，则无需维护。如有，则请启用退货服务。') :
                   intl.get(`sinv.receiptManage.view.title.clicnkButtomcreateNode`).d('点击下方按钮，创建一个策略节点。')
              }
           </p>
           {!checkoutBoxFlag && (
             <div className={styles['card-right-btn']}>
               <Button
                 color={ButtonColor.primary}
                 onClick={() => handleCeckBoxChange(true)}
               >
                 {
                 type === 'node' ?
                   intl.get(`sinv.receiptManage.view.title.nowOpen`).d('立即启用') :
                   intl.get(`sinv.receiptManage.view.title.nowCreate`).d('立即创建')
               }
               </Button>
             </div>
           )}
         </div>
       </div>
     );
}
