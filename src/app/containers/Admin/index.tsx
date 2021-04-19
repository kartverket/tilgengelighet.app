import React, { useState, useEffect, useContext } from 'react';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import NoFlag from '../../images/no.svg';
import EnFlag from '../../images/en.svg';
import Logo from '../../images/Kartverket_liggende_web.svg';
import DataPage from './Data';
import {
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Menu,
  MenuItem,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import './style.scss';
import { Icon } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import ListAltIcon from '@material-ui/icons/ListAlt';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import DataUsageIcon from '@material-ui/icons/DataUsage';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import HelpPage from './Help';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

import screens, { down as screenBreakpointDown } from '../../utils/screens';
import styled from 'styled-components';
import useWindowDimensions from 'app/utils/windowDimensions';
import { Sidebar } from 'app/components/Sidebar';
import Img from 'app/components/Img';
import ActualMap from 'app/components/ActualMap';
import { ImportPage } from './Imported/Loadable';
import { ObjectPage } from './Object/Loadable';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { DataContext } from '../HomePage';
import Auth from 'auth';
import MapPage from './Map';
import i18next from 'i18next';
import moment from "moment";

const CustomBackgroundWrapper = styled.div`
  @media ${screens['md-down']} {
    background-color: rgb(245, 245, 245);
  }
`;

const DropdownButton = styled(IconButton)`
  @media ${screens['md-down']} {
    padding-left: 0;
  }
`;

const OverlayDiv = styled.div`
  @media ${screens['md-down']} {
    position: fixed; /* Sit on top of the page content */
    min-width: 100vw; /* Full width (cover the whole page) */
    min-height: 100vh; /* Full height (cover the whole page) */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5); /* Black background with opacity */
    z-index: 1101; /* Specify a stack order in case you're using a different order for other elements */
  }
  display: none;
`;

interface Props {
  currentPage?: number;
}

export function AdminPage(props: Props) {
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [currentLanguage, setSelectedLanguage] = React.useState({
    language: 'hei',
    flag: NoFlag,
  });
  const changeLanguage = lng => {
    i18next.changeLanguage(lng);
  };

  const getLanguage = () => {
    return (
      i18next.language ||
      (typeof window !== 'undefined' && window.localStorage.i18nextLng) ||
      'en'
    );
  };
  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  React.useEffect(() => {
    switch (getLanguage()) {
      case 'no':
        setSelectedLanguage({
          language: t(translations.adminPage.norwegian).toString(),
          flag: NoFlag,
        });
        break;
      case 'en':
        setSelectedLanguage({
          language: t(translations.adminPage.english).toString(),
          flag: EnFlag,
        });
        break;
    }
  }, []);
  const menuItems = [
    {
      key: 'my-object',
      icon: <ListAltIcon />,
      text: t(translations.adminPage.myObject).toString(),
      link: 'object',
      endIcon: <ChevronRightIcon htmlColor="#757575" />,
    },
    {
      key: 'map',
      icon: <SaveAltIcon />,
      text: t(translations.adminPage.map).toString(),
      link: 'map',
      endIcon: <ChevronRightIcon htmlColor="#757575" />,
    },
    {
      key: 'data',
      icon: <DataUsageIcon />,
      text: t(translations.adminPage.dataImport).toString(),
      link: 'import-data',
      endIcon: <ChevronRightIcon htmlColor="#757575" />,
    },
    {
      key: 'help',
      icon: <HelpOutlineIcon />,
      text: t(translations.adminPage.assist).toString(),
      link: 'help',
    },
  ];
  const pathname = '/admin';
  const [isLeftMenuOpen, setLeftMenuStatus] = useState(
    props.currentPage == undefined ? true : false,
  ); // --> this is local state, if you want to make global state, search for "useInjectReducer" below and follow it
  const prefix = '/admin';

  const { onAdminPageIndexChanged, onEditObject } = useContext(DataContext);

  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
  const { height, width } = useWindowDimensions();

  const [currentPage, setCurrentPage] = useState<number>(
    props.currentPage ?? 0,
  );

  const currentMenuChosen = menuItems[currentPage].text;

  useEffect(() => {
    const sizeChange = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', sizeChange);

    const cleanup = () => {
      window.removeEventListener('resize', sizeChange);
    };
    return cleanup;
  }, [screenWidth]);

  const [isSubMenuOn, setSubMenuStatus] = useState<boolean>(false);

  const renderMenuIcon = () => {
    if (screenWidth < screenBreakpointDown['md-down']) {
      if (!isLeftMenuOpen) return <ArrowBackIcon htmlColor="black" />;
    }
    return <MenuIcon />;
  };

  const handleLogout = () => {
    Auth.logout();
  };

  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen(!open);

  let pageContent;

  switch (currentPage) {
    case 0:
      pageContent = (
        <ObjectPage changeIsSubMenuOnStatus={setSubMenuStatus}></ObjectPage>
      );
      break;
    case 1:
      pageContent = <MapPage />;
      break;
    case 2:
      pageContent = (
        <div>
          <DataPage />

          <ImportPage dbButton={false} />
        </div>
      );
      break;
    case 3:
      pageContent = <HelpPage></HelpPage>;
      break;
  }

  React.useEffect(() => {
    if(i18next.language === "no") {
      moment.updateLocale('no', {
        relativeTime: {
          future: 'til %s',
          past: '%s siden',
          s: 'noen få sekunder',
          ss: '%d sekunder',
          m: '1 minutt',
          mm: '%d minutter',
          h: '1 time',
          hh: '%d timer',
          d: '1 dag',
          dd: '%d dager',
          M: '1 måned',
          MM: '%d måneder',
          y: '1 år',
          yy: '%d år'
        }
      });
    } else {
      moment.locale('en')
    }
  }, [])

  return (
    <>
      <OverlayDiv className={`${isSubMenuOn ? 'd-block' : ''}`} />
      <article>
        {open ? (
          <Sidebar menuIndex={2} onBackdropPressed={() => setOpen(false)} />
        ) : null}
        <div
          style={{
            height: height,
            backgroundColor:
              screenWidth >= screenBreakpointDown['md-down']
                ? 'white'
                : '#F5F5F5',
          }}
          onClick={open ? toggle : () => null}>
          <AppBar
            position="fixed"
            style={{ color: 'black', backgroundColor: 'white' }}>
            <Toolbar>
              <div className="title-wrapper">
                <DropdownButton
                  edge="end"
                  onClick={() => {
                    if (screenWidth > screenBreakpointDown['md-down']) toggle();
                    else if (!open && isLeftMenuOpen) {
                      toggle();
                    } else {
                      setLeftMenuStatus(!isLeftMenuOpen);
                      onAdminPageIndexChanged!(undefined);
                    }
                  }}>
                  {renderMenuIcon()}
                </DropdownButton>
                <div className="title d-sm-flex d-xs-flex d-md-flex d-lg-none">
                  {isLeftMenuOpen
                    ? t(translations.adminPage.title)
                    : currentMenuChosen}
                </div>
                <div className="title d-none d-lg-flex">
                  {t(translations.adminPage.title)}
                </div>
              </div>
              <Img src={Logo} className="app-bar-logo d-none d-lg-block" />
              <Button
                startIcon={
                  <img
                    src={currentLanguage.flag}
                    style={{ width: 25, height: 20 }}
                  />
                }
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}>
                {currentLanguage.language}
              </Button>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    setSelectedLanguage({
                      language: t(translations.adminPage.norwegian).toString(),
                      flag: NoFlag,
                    });
                    changeLanguage('no');
                    moment.updateLocale('no', {
                      relativeTime: {
                        future: 'til %s',
                        past: '%s siden',
                        s: 'noen få sekunder',
                        ss: '%d sekunder',
                        m: '1 minutt',
                        mm: '%d minutter',
                        h: '1 time',
                        hh: '%d timer',
                        d: '1 dag',
                        dd: '%d dager',
                        M: '1 måned',
                        MM: '%d måneder',
                        y: '1 år',
                        yy: '%d år'
                      }
                    });
                  }}>
                  <img
                    src={NoFlag}
                    style={{ width: 25, height: 20, marginRight: 10 }}
                  />
                  {t(translations.adminPage.norwegian).toString()}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    setSelectedLanguage({
                      language: t(translations.adminPage.english).toString(),
                      flag: EnFlag,
                    });
                    changeLanguage('en');
                    moment.locale('en')
                  }}>
                  <img
                    src={EnFlag}
                    style={{ width: 25, height: 25, marginRight: 10 }}
                  />
                  {t(translations.adminPage.english).toString()}
                </MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>

          <div className="container-fluid" style={{ paddingTop: '56px' }}>
            <div className="row">
              <div
                style={{marginTop: 20}}
                className={`left-menu-wrapper col-md-12 col-lg-3 ${
                  !isLeftMenuOpen ? 'd-none d-lg-block' : 'd-lg-block'
                }`}>
                <List
                  style={{ backgroundColor: 'white', paddingBottom: '0px' }}>
                  {menuItems.map((item, index) => {
                    const to = `${prefix}/${item.link}`;
                    return (
                      <Link
                        to={''}
                        className="left-menu-link"
                        key={item.key}
                        onClick={() => {
                          setLeftMenuStatus(false);
                          setCurrentPage(index);
                          onAdminPageIndexChanged!(index);
                        }}>
                        <ListItem
                          style={{
                            height: '64px',
                            justifyContent: 'space-between',
                          }}
                          button
                          selected={
                            currentPage === index
                          }
                          divider={
                            screenWidth < screenBreakpointDown['md-down']
                              ? true
                              : undefined
                          }>
                          <div className="d-flex">
                            <ListItemIcon style={{ paddingLeft: '12px', alignItems: 'center' }}>
                              {item.icon}
                            </ListItemIcon>
                            <ListItemText className="ml-3">
                              {item.text}
                            </ListItemText>
                          </div>
                          <div
                            className={`${
                              screenWidth >= screenBreakpointDown['md-down']
                                ? 'd-none'
                                : 'd-flex'
                            }`}>
                            {item.endIcon}
                          </div>
                        </ListItem>
                      </Link>
                    );
                  })}

                  <ListItem className="left-menu-link" onClick={handleLogout}>
                    <div className="d-flex">
                      <ListItemIcon style={{ paddingLeft: '12px', alignItems: 'center' }}>
                        <ExitToAppIcon></ExitToAppIcon>
                      </ListItemIcon>
                      <ListItemText className="ml-3">
                        {t(translations.adminPage.logout).toString()}
                      </ListItemText>
                    </div>
                  </ListItem>
                </List>
              </div>
              <CustomBackgroundWrapper
                className={`col-lg-9 col-md-12 ${
                  isLeftMenuOpen &&
                  screenWidth < screenBreakpointDown['md-down']
                    ? 'd-none'
                    : ''
                }`}>
                {pageContent}
              </CustomBackgroundWrapper>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
