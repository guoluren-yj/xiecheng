import React, { createContext } from 'react';

/**
 * @type {React.Context<Promise>}
 */
const UserStatusContext = createContext({});
UserStatusContext.displayName = 'UserStatusContext';
export default UserStatusContext;
