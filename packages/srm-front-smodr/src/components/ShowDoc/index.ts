import { useState, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { fetchDocPermissionApi } from '@/services/oms/orderLineManageService';
import { getResponse } from 'utils/utils';

type DocPermissionStr = {
    displayDoc: String,
    displayDocFlow: String
}

type DocPermissionNum = {
    displayDoc: Number,
    displayDocFlow: Number
}

// 默认
const defaultPermission: DocPermissionNum = {
    displayDoc: 0,
    displayDocFlow: 1,
};
const calcPermissionRes = (permissionRes:DocPermissionStr) => {
    const newRes: DocPermissionStr = getResponse(permissionRes);
    const transfromNum = (obj: DocPermissionStr)=>({
        displayDoc: Number(obj.displayDoc),
        displayDocFlow: Number(obj.displayDocFlow),
    });
   return isEmpty(newRes) ? defaultPermission : transfromNum(newRes);
};

export async function getShowDoc(){
    const permissionRes = await fetchDocPermissionApi();
    return calcPermissionRes(permissionRes);
}

export function useShowDoc(){
    const [docPermissionObj, setDocPermissionObj] = useState({});
    const getPermission = async () => {
        const permissionRes = await fetchDocPermissionApi();
        setDocPermissionObj(calcPermissionRes(permissionRes));
    };

    useEffect(()=>{
        getPermission();
    }, []);

    return docPermissionObj;
}

// const getDocPermission = (() => {
//   let permission = {};
//   let isLoading = false;
//   const loadingList = [];
//   const defaultPermission = {
//     // 默认
//     displayDoc: '0',
//     displayDocFlow: '1',
//   };
//   return async () => {
//     if (!isEmpty(permission) && !isLoading) {
//       return permission;
//     } else if (isLoading) {
//       return new Promise((reslove) => {
//         loadingList.push(reslove);
//       });
//     } else {
//       isLoading = true;
//       const res = await fetchDocPermissionApi();
//       isLoading = false;
//       if (res) {
//         permission = res;
//       } else {
//         permission = defaultPermission;
//       }
//       if (loadingList.length) {
//         loadingList.forEach((reslove) => reslove(permission));
//         loadingList.length = 0;
//       }
//       return permission;
//     }
//   };
// })();

// export default function ShowDoc(props) {
//   const { type = 'displayDoc', children, visibleNode } = props || {};
//   const [docPermissionObj, setDocPermissionObj] = useState({});

//   useEffect(() => {
//     getPermission();
//   }, [type]);

//   const getPermission = async () => {
//     const permissionRes = await getDocPermission();
//     setDocPermissionObj(permissionRes);
//   };

//   return docPermissionObj[type] === '1' ? children : visibleNode || '';
// }
