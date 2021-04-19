import * as React from 'react';
import Logo from '../../images/Kartverket_liggende_web.svg';
import SidebarContainer from './SidebarContainer';
import LogoContainer from './LogoContainer';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import MapIcon from '@material-ui/icons/Map';
import SettingsIcon from '@material-ui/icons/Settings';
import {Link} from 'react-router-dom';

import {makeStyles} from '@material-ui/core';
import {useContext} from 'react';
import {DataContext} from 'app/containers/HomePage';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';

const useStyles = makeStyles({
  logo: {
    width: '119px',
    height: '40px',
  },
  ul: {
    padding: '0 28px',
    borderBottom: '1px solid #E5E5E5',
    paddingBottom: '18px',
  },
  li: {
    display: 'inline-flex',
    alignItems: 'center',
    width: '100%',
    padding: '18px 0',
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: '15px',
    fontFamily: 'Arial',
    lineHeight: '20px',
    letterSpacing: '0.25px',
    textDecoration: 'none',
    '&:hover': {
      color: '#3f51b5;',
      textDecoration: 'none',
    },
  },
  icon: {
    marginRight: '30px',
  },
  active: {
    color: '#3f51b5;',
    textDecoration: 'none',
  },
  backdrop: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.32)',
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: 500,
  },
});

export interface Props {
  menuIndex: number;
  onBackdropPressed?: any;
}

function _Sidebar (props: Props) {
  const {setPage, onInitReg} = useContext(DataContext);

  const style = useStyles();
  const { t } = useTranslation();
  return (
    <div>
      <SidebarContainer>
        <nav>
          <LogoContainer>
            <Link to="" onClick={() => setPage!(0)}>
              <img className={style.logo} src={Logo} alt="Kartverket - Logo" />
            </Link>
          </LogoContainer>
          <ul className={style.ul}>
            <Link to="" onClick={() => {
              props.onBackdropPressed();
              onInitReg!(true);
            }}>
              <li className={style.li}>
                <AddCircleOutlineIcon className={style.icon} />
                {t(translations.sidebar.registration)}
              </li>
            </Link>
            <Link to="" onClick={() => setPage!(0)}>
              <li
                className={`${style.li}${props.menuIndex === 1 ? style.active : ''
                  }`}
              >
                <MapIcon className={style.icon} />
                {t(translations.sidebar.map)}
              </li>
            </Link>
          </ul>
          <ul className={style.ul}>
            <Link to="" onClick={() => setPage!(1)}>
              <li
                className={`${style.li}${props.menuIndex === 2 ? style.active : ''
                  }`}
              >
                <SettingsIcon className={style.icon} />
                {t(translations.sidebar.administration)}
              </li>
            </Link>
          </ul>
        </nav>
      </SidebarContainer>
      <div className={style.backdrop} onClick={props.onBackdropPressed}></div>
    </div>
  );
}

export const Sidebar = React.memo(_Sidebar);
