import { createContext, useState } from 'react';

type MenuType = boolean;

type PropsMenuContext = {
  menuToogle: MenuType,
  setMenuToogle: React.Dispatch<React.SetStateAction<MenuType>>;
};

const DEFAULTVALUEMENU = {
  menuToogle: true,
  setMenuToogle: () => {},
};

const MenuContext = createContext<PropsMenuContext>(DEFAULTVALUEMENU);

export default MenuContext;
