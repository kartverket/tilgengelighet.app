import React, { useState } from 'react';
import {
  MenuItem,
  IconButton,
  Typography,
  ListItemIcon,
  Button,
  CircularProgress,
} from '@material-ui/core';

import MoreVert from '@material-ui/icons/MoreVert';
import MapIcon from '@material-ui/icons/MapOutlined';
import EditIcon from '@material-ui/icons/Edit';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import DeleteIcon from '@material-ui/icons/Delete';
import Pagination from '@material-ui/lab/Pagination';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import WarningIcon from '@material-ui/icons/Warning';

import styled from 'styled-components';
import screens from '../../../utils/screens';

import './style.scss';
import ExpandMenu from './ExpandMenu';
import CustomColorCheckbox from '../CustomColorCheckbox';
import CustomButton from '../CustomButton';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { FeatureMember, RegistrationStatus } from 'app/model/FeatureMember';
import { formatSubcatName } from 'app/components/ObjectSelector/ObjectListItem';
import municipalities from '../../../../config/municipalities.json';
import { performAccessibilityAssessment } from 'app/accessiblity/accessibilityExecution';
import { UpdateAction } from 'app/providers/DataProvider';

enum SORT_STATUS {
  NONE,
  DESC,
  ASC,

  LENGTH, // this is to count the number of SORT_STATUS, please add status before this
}

interface Props {
  hasSelectAll?: boolean;
  hasSelectElement?: boolean;
  selectedList: string[];
  data: FeatureMember[];
  checkSelect?: any;
  totalPage?: number;
  changePage?: any;
  page?: number;
  selectAll?: any;
  deselectAll?: any;
  title?: any;
  onlyShowUnPublished: boolean;
  toggleShowOnlyUnPublished: any;
  hasUnPublished: boolean;
  changeIsSubMenuOnStatus?: any;
  onSort: (status: SORT_STATUS) => void;
  onDeleteItem: (feature: FeatureMember) => void;
  onOpenInMap: (id: string) => void;
  onDuplicate: (id: string) => void;
  onPublish: (id: string) => Promise<any>;
}

const TableWrapper = styled.div`
  @media ${screens['md-down']} {
    padding-left: 0;
    padding-right: 0;
  }
`;

const GraySmall = styled.small`
  color: rgba(0, 0, 0, 0.6);
`;

const CustomExpandMenu = styled(ExpandMenu)`
  .MuiMenu-paper {
    @media ${screens['md-up']} {
      min-width: 280px;
    }
  }
  .MuiMenuItem-root {
    min-height: 48px;
  }
`;

export default function AdminObjectTable(props: Props) {
  const { t } = useTranslation();

  const {
    selectedList: selectedIds,
    checkSelect,
    onlyShowUnPublished,
    toggleShowOnlyUnPublished,
    hasUnPublished,
    changeIsSubMenuOnStatus,
  } = props;

  const [sortedList, setSortedList] = React.useState<FeatureMember[]>([]);

  React.useEffect(() => {
    setSortedList(props.data);
  });

  const [currentInfo, setCurrentInfo] = React.useState<any | null>(null);

  const [currentSort, setCurrentSort] = React.useState<SORT_STATUS>(
    SORT_STATUS.NONE,
  );

  const changeSortStatus = () => {
    const status =
      currentSort == SORT_STATUS.DESC ? SORT_STATUS.ASC : SORT_STATUS.DESC;
    setCurrentSort(status);
    props.onSort(status);
  };

  const renderSortComponent = () => {
    switch (currentSort) {
      case SORT_STATUS.DESC:
        return (
          <IconButton
            size="small"
            className="py-0"
            onClick={() => changeSortStatus()}>
            <ArrowDropDownIcon />
          </IconButton>
        );
      case SORT_STATUS.ASC:
        return (
          <IconButton
            size="small"
            className="py-0"
            onClick={() => changeSortStatus()}>
            <ArrowDropUpIcon />
          </IconButton>
        );
      default:
        return <></>;
    }
  };

  const setMenuId = (item: FeatureMember) => {
    if (item === null) return setCurrentInfo(null);
    if (currentInfo === null) return setCurrentInfo(item);
    if (item.localId! === currentInfo.localId!) return setCurrentInfo(null);
    return setCurrentInfo(item);
  };
  const [
    featureMenuItem,
    setfeatureMenuItem,
  ] = React.useState<FeatureMember | null>(null);

  const [openMenu, setMenuElement] = React.useState<null | HTMLElement>(null);
  const openMenuHandler = (event, item) => {
    setfeatureMenuItem(item);
    setMenuElement(event.currentTarget);
    changeIsSubMenuOnStatus(true);
  };
  const closeMenuHandler = () => {
    setfeatureMenuItem(null);
    setMenuElement(null);
    changeIsSubMenuOnStatus(false);
  };

  const isPublished =
    featureMenuItem?.registrationStatus != RegistrationStatus.clientError &&
    featureMenuItem?.registrationStatus != RegistrationStatus.serverError;

  const [publishResponse, setPublishResponse] = useState<any>();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getTitle = (
    name: string,
    isDuplicate?: boolean,
  ): string | undefined => {
    let categoryName;

    const duplicate: string = isDuplicate == true ? ' (duplikat)' : '';

    if (name.toLowerCase().includes('friluft')) {
      categoryName = 'Friluft';
    } else if (name.toLowerCase().includes('tettsted')) {
      categoryName = 'Tettsted';
    } else {
      return 'Sittegruppe' + duplicate;
    }

    if (name == undefined || categoryName == undefined) return undefined;

    return (
      categoryName + ' ' + formatSubcatName(name, categoryName) + duplicate
    );
  };

  const getMunicipalitie = (member: FeatureMember): string => {
    const id =
      member.nodes.find(element => element.name.toLowerCase() === 'kommreel')
        ?.value ??
      member.nodes.find(element => element.name.toLowerCase() === 'kommune')
        ?.value;

    if (!id) return 'N/A';

    const name = municipalities.find(muni => muni.id == id)?.name;

    if (!name) return id;
    else return name;
  };

  const handleOnPublish = async () => {
    setIsLoading(true);
    if (isPublished == false) {
      const response = await props.onPublish(featureMenuItem?.localId!);

      setPublishResponse(response);
      setIsLoading(false);
    }
  };

  // const getLayerColor = (feature) => {
  //   switch (feature.registrationStatus) {
  //     case RegistrationStatus.imported: {
  //       return '#0F3C64';
  //     }
  //
  //     case RegistrationStatus.importedYTD: {
  //       return '#2189D6';
  //     }
  //
  //     case RegistrationStatus.edited: {
  //       return '#005824';
  //     }
  //
  //     case RegistrationStatus.invalid: {
  //       return '#BE0000';
  //     }
  //   }
  // }

  return (
    <TableWrapper style={{ padding: '0px 15px' }}>
      <div className="row">
        <div
          style={{ backgroundColor: 'white' }}
          className="col-lg-12 table-responsive mt-3 border rounded px-0">
          <table className="table mb-0">
            <thead>
              {props.hasSelectAll && (
                <tr className="">
                  <th className="no-border border-top-0 small-cell d-none d-lg-table-cell">
                    <CustomColorCheckbox
                      custom_color="#249446"
                      checked={selectedIds.length === sortedList.length}
                      indeterminate={
                        selectedIds &&
                        selectedIds.length &&
                        selectedIds.length !== props.data.length
                          ? true
                          : undefined
                      }
                      onChange={e => {
                        if (e.target.checked) {
                          if (!selectedIds.length) {
                            return props.selectAll();
                          }
                        }
                        return props.deselectAll();
                      }}
                      inputProps={{ 'aria-label': 'secondary checkbox' }}
                    />
                  </th>
                  <th
                    className="no-border border-top-0 d-none d-lg-table-cell"
                    style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)' }}>
                    {selectedIds?.length === 0
                      ? t(translations.adminPage.table.selectAll)
                      : ''}
                    {selectedIds?.length > 0 && (
                      <CustomButton
                        custom_color="rgba(0, 0, 0, 0.6)"
                        custom_text_transform="none"
                        variant="outlined"
                        color="default"
                        size="small"
                        startIcon={<DeleteIcon htmlColor="#757575" />}>
                        {t(translations.adminPage.table.delete)}
                      </CustomButton>
                    )}
                  </th>
                  <th
                    className="no-border border-top-0 text-right select-unpublished-box"
                    colSpan={4}>
                    <CustomColorCheckbox
                      custom_color="#249446"
                      checked={onlyShowUnPublished}
                      onChange={e =>
                        toggleShowOnlyUnPublished(e.target.checked)
                      }
                      color="primary"
                      inputProps={{ 'aria-label': 'secondary checkbox' }}
                      size="small"
                    />
                    <GraySmall className="font-weight-bold">
                      {t(translations.adminPage.table.selectUnPublished)}
                    </GraySmall>
                  </th>
                </tr>
              )}
              <tr className="d-none d-lg-table-row">
                {props.hasSelectElement && (
                  <td className="small-cell border-top-0"></td>
                )}
                <td className="border-top-0">
                  {t(translations.adminPage.table.objectType)}
                </td>
                <td className="border-top-0">
                  {' '}
                  {t(translations.adminPage.table.status)}
                </td>
                <td className="border-top-0">
                  {' '}
                  {t(translations.adminPage.table.location)}
                </td>
                <td
                  className="border-top-0"
                  onClick={() => changeSortStatus()}
                  role="gridcell">
                  {t(translations.adminPage.table.createdAt)}

                  {renderSortComponent()}
                </td>
                <td
                    className="border-top-0"
                    onClick={() => changeSortStatus()}
                    role="gridcell">
                  {t(translations.adminPage.table.modifiedAt)}

                  {renderSortComponent()}
                </td>
                <td className="action-cell border-top-0"></td>
              </tr>
            </thead>
            <tbody>
              {sortedList.map(feature => (
                <tr
                  key={feature.localId!}
                  className={`${
                    currentInfo !== null && currentInfo.id === feature.localId!
                      ? 'selected-row'
                      : ''
                  }`}>
                  {props.hasSelectElement && (
                    <td className="small-cell d-none d-lg-table-cell">
                      <CustomColorCheckbox
                        custom_color="#249446"
                        checked={selectedIds.includes(feature.localId!)}
                        onChange={e => checkSelect(e, feature.localId!)}
                        color="primary"
                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                      />
                    </td>
                  )}
                  <td
                    className="font-weight-bold"
                    role="gridcell"
                    onClick={() => setMenuId(feature)}>
                    {/*{getLayerColor(feature) !== undefined ? (*/}
                    {/*  <div style={{display: 'inline-block', width: 8, height: 11,padding: 8, margin: '0px 10px -2px 0px', backgroundColor: getLayerColor(feature), borderRadius: 4}}> </div>*/}
                    {/*) : null}*/}
                    {getTitle(
                      feature.sosiElement?.name ?? feature.type!,
                      feature.isDuplicate,
                    )}
                    <br />
                    <GraySmall className="d-lg-none">
                      {feature.getDate('førstedatafangstdato') +
                        ' ' +
                        feature.nodes.find(
                          n => n.name == 'tilgjengvurderingRulleAuto',
                        )?.value}
                    </GraySmall>
                  </td>
                  <td
                    className="d-none d-lg-table-cell"
                    role="gridcell"
                    onClick={() => setMenuId(feature)}>
                    {
                      feature.nodes.find(
                        n => n.name == 'tilgjengvurderingRulleAuto',
                      )?.value
                    }
                  </td>
                  <td
                    className="d-none d-lg-table-cell"
                    role="gridcell"
                    onClick={() => setMenuId(feature)}>
                    {getMunicipalitie(feature)}
                  </td>
                  <td
                    className="d-none d-lg-table-cell"
                    role="gridcell"
                    onClick={() => setMenuId(feature)}>
                    {feature.getDate('førstedatafangstdato')}
                  </td>
                  <td
                      className="d-none d-lg-table-cell"
                      role="gridcell"
                      onClick={() => setMenuId(feature)}>
                    {feature.getDate('datafangstdato')}
                  </td>
                  <td className="action-cell">
                    {currentInfo !== null &&
                      currentInfo.id === feature.localId! && (
                        <Button
                          className="head-delete-button"
                          variant="outlined"
                          color="default"
                          size="small"
                          startIcon={<MapIcon htmlColor="#757575" />}>
                          {t(translations.adminPage.table.openInMap)}
                        </Button>
                      )}

                    <div className="warning-button">
                      {feature.registrationStatus ==
                        RegistrationStatus.clientError ||
                      feature.registrationStatus ==
                        RegistrationStatus.serverError ? (
                        <WarningIcon htmlColor="#B00020"></WarningIcon>
                      ) : null}
                    </div>

                    <div className="more-button d-inline-block">
                      <IconButton
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        onClick={event => {
                          event.preventDefault();
                          openMenuHandler(event, feature);
                        }}>
                        <MoreVert />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-12">
          <Pagination
            count={props.totalPage}
            page={props.page}
            siblingCount={1}
            boundaryCount={1}
            onChange={(event, value) => {
              if (value !== props.page) return props.changePage(value);
              return null;
            }}
          />
        </div>
        <div>
          <CustomExpandMenu
            anchorEl={openMenu}
            keepMounted
            open={Boolean(openMenu)}
            onClose={() => {
              closeMenuHandler();
              setPublishResponse(undefined);
            }}>
            <div>
              <div className="container mt-2 d-lg-none d-xl-none">
                <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {featureMenuItem != null
                    ? getTitle(
                        featureMenuItem?.sosiElement?.name ??
                          featureMenuItem?.type!,
                        featureMenuItem.isDuplicate,
                      )
                    : null}
                </h4>
                <span style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>
                  {featureMenuItem != null
                    ? featureMenuItem?.getDate('førstedatafangstdato') +
                      ' ' +
                      featureMenuItem?.nodes.find(
                        n => n.name == 'tilgjengvurderingRulleAuto',
                      )?.value
                    : null}
                </span>
                <hr />
              </div>
            </div>
            <MenuItem
              className="action-item"
              onClick={() => props.onOpenInMap(featureMenuItem?.localId!)}>
              <Typography variant="inherit" noWrap>
                {t(translations.adminPage.table.openInMap)}
              </Typography>
              <ListItemIcon>
                <MapIcon fontSize="small" className="ml-auto" />
              </ListItemIcon>
            </MenuItem>
            <MenuItem
              className="action-item"
              style={isPublished ? { color: 'rgba(0, 0, 0, 0.3)' } : {}}
              onClick={async () => {
                if (isPublished == false) {
                  handleOnPublish();
                }
              }}>
              <Typography variant="inherit" noWrap>
                {isPublished == false
                  ? t(translations.adminPage.table.publishOne)
                  : t(translations.adminPage.table.isPublished)}
              </Typography>
              {publishResponse != undefined ? (
                <text
                  style={
                    publishResponse.valid == true
                      ? {
                          color: 'rgb(36, 148, 70)',
                          fontSize: '12.23px',
                          fontFamily: 'Arial',
                        }
                      : {
                          color: 'rgb(176, 0, 32)',
                          fontSize: '12.23px',
                          fontFamily: 'Arial',
                        }
                  }>
                  {' ' + publishResponse.msg}
                </text>
              ) : null}
              <ListItemIcon>
                {isLoading ? (
                  <CircularProgress
                    className="ml-auto"
                    size={20}
                    style={{ color: 'rgb(26, 88, 159)' }}
                  />
                ) : (
                  <CloudUploadIcon
                    style={isPublished ? { color: 'rgba(0, 0, 0, 0.3)' } : {}}
                    fontSize="small"
                    className="ml-auto"
                  />
                )}
              </ListItemIcon>
            </MenuItem>
            <MenuItem
              className="action-item"
              onClick={() => props.onOpenInMap(featureMenuItem?.localId!)}>
              <Typography variant="inherit" noWrap>
                {t(translations.adminPage.table.edit)}
              </Typography>
              <ListItemIcon>
                <EditIcon fontSize="small" className="ml-auto" />
              </ListItemIcon>
            </MenuItem>
            {/*<MenuItem*/}
            {/*  className="action-item"*/}
            {/*  onClick={() => {*/}
            {/*    setMenuElement(null);*/}
            {/*    closeMenuHandler();*/}

            {/*    props.onDuplicate(featureMenuItem?.localId!);*/}
            {/*  }}>*/}
            {/*  <Typography variant="inherit" noWrap>*/}
            {/*    {t(translations.adminPage.table.duplicate)}*/}
            {/*  </Typography>*/}
            {/*  <ListItemIcon>*/}
            {/*    <FileCopyIcon fontSize="small" className="ml-auto" />*/}
            {/*  </ListItemIcon>*/}
            {/*</MenuItem>*/}
            <MenuItem
              className="action-item"
              onClick={() => {
                setMenuElement(null);
                closeMenuHandler();

                props.onDeleteItem(featureMenuItem!);
              }}>
              <Typography variant="inherit" noWrap>
                {t(translations.adminPage.table.delete)}
              </Typography>
              <ListItemIcon>
                <DeleteIcon fontSize="small" className="ml-auto" />
              </ListItemIcon>
            </MenuItem>
          </CustomExpandMenu>
        </div>
      </div>
    </TableWrapper>
  );
}
