import React from 'react';
import { IconButton, Button } from '@material-ui/core';
import MapIcon from '@material-ui/icons/Map';
import DeleteIcon from '@material-ui/icons/Delete';
import Pagination from '@material-ui/lab/Pagination';
import CloudDownloadIcon from '@material-ui/icons/CloudDownloadOutlined';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import './style.scss';
import TableWrapper from '../TableWrapper';
import CustomColorCheckbox from '../CustomColorCheckbox';
import CustomButton from '../CustomButton';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { FeatureMember } from 'app/model/FeatureMember';
import municipalities from '../../../../config/municipalities.json';
import { formatSubcatName } from 'app/components/ObjectSelector/ObjectListItem';

type Municipality = { id: string; name: string };

export enum SORT_STATUS {
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
  onSort: (status: SORT_STATUS) => void;
  onDeleteSelected: () => void;
  onDeleteObject: (id: string) => void;
}

export default function AdminImportTable(props: Props) {
  const { t } = useTranslation();
  const { selectedList: selectedIds, checkSelect } = props;

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

  const setMenuId = item => {
    if (item === null) return setCurrentInfo(null);
    if (currentInfo === null) return setCurrentInfo(item);
    if (item.id === currentInfo.id) return setCurrentInfo(null);
    return setCurrentInfo(item);
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

  const getTitle = (name: string): string | undefined => {
    let categoryName;

    if (name.toLowerCase().includes('friluft')) {
      categoryName = 'Friluft';
    } else if (name.toLowerCase().includes('tettsted')) {
      categoryName = 'Tettsted';
    } else {
      return 'Sittegruppe';
    }

    if (name == undefined || categoryName == undefined) return undefined;

    return categoryName + ' ' + formatSubcatName(name, categoryName);
  };

  return (
    <TableWrapper className="container-fluid">
      {sortedList?.length ? (
        <div className="row">
          <div
            style={{ backgroundColor: 'white' }}
            className="col-lg-12 table-responsive border rounded px-0">
            <table className="table mb-0">
              <thead>
                {props.hasSelectAll && (
                  <tr className="d-none d-lg-table-row">
                    <th className="no-border border-top-0 small-cell">
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
                        inputProps={{ 'aria-label': 'checkbox' }}
                      />
                    </th>
                    <th
                      className="no-border border-top-0"
                      style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)' }}>
                      {selectedIds?.length === 0
                        ? t(translations.adminPage.table.selectAll)
                        : ''}
                      {selectedIds?.length > 0 && (
                        <CustomButton
                          custom_color="rgba(0, 0, 0, 0.6)"
                          custom_text_transform="none"
                          className="head-delete-button"
                          variant="outlined"
                          color="default"
                          size="small"
                          onClick={() => props.onDeleteSelected()}
                          startIcon={<DeleteIcon htmlColor="#757575" />}>
                          {t(translations.adminPage.table.delete)}
                        </CustomButton>
                      )}
                    </th>
                  </tr>
                )}
                <tr className="d-none d-lg-table-row">
                  {props.hasSelectElement && (
                    <td className="small-cell border-top-0"></td>
                  )}

                  <td className="border-top-0">
                    {t(translations.adminPage.table.type)}
                  </td>
                  <td className="border-top-0">
                    {t(translations.adminPage.table.location)}
                  </td>
                  <td
                    className="border-top-0"
                    onClick={() => changeSortStatus()}
                    role="gridcell">
                    {t(translations.adminPage.table.createdAt)}

                    {renderSortComponent()}
                  </td>
                  <td className="action-cell border-top-0"></td>
                </tr>
              </thead>
              <tbody>
                {sortedList.map(member => (
                  <tr
                    key={member.localId}
                    className={`${
                      currentInfo !== null && currentInfo.id === member.localId
                        ? 'selected-row'
                        : ''
                    }`}>
                    {props.hasSelectElement && (
                      <td className="small-cell d-none d-lg-table-cell">
                        <CustomColorCheckbox
                          custom_color="#249446"
                          checked={selectedIds.includes(member.localId!)}
                          onChange={e => checkSelect(e, member.localId!)}
                          color="primary"
                          inputProps={{ 'aria-label': 'secondary checkbox' }}
                        />
                      </td>
                    )}
                    <td
                      className="font-weight-bold"
                      role="gridcell"
                      onClick={() => setMenuId(member)}>
                      {getTitle(member.sosiElement?.name ?? member.type!)}{' '}
                      <br />
                      <small
                        className="d-lg-none d-xl-none"
                        style={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                        12 objekter i grouppe
                      </small>
                    </td>
                    <td
                      className="d-none d-lg-table-cell"
                      role="gridcell"
                      onClick={() => setMenuId(member)}>
                      {getMunicipalitie(member)}
                    </td>
                    <td
                      className="d-none d-lg-table-cell"
                      role="gridcell"
                      onClick={() => setMenuId(member)}>
                      {member.getCreatedAtDate()}
                    </td>
                    <td className="action-cell">
                      {currentInfo !== null &&
                        currentInfo.id === member.localId && (
                          <Button
                            className="head-delete-button"
                            variant="outlined"
                            color="default"
                            size="small"
                            startIcon={<MapIcon htmlColor="#757575" />}>
                            {t(translations.adminPage.table.openInMap)}
                          </Button>
                        )}

                      <div className="download-button">
                        <IconButton>
                          <CloudDownloadIcon />
                        </IconButton>
                      </div>

                      <div className="delete-button d-inline-block">
                        <IconButton
                          onClick={() => props.onDeleteObject(member.localId!)}>
                          <DeleteIcon htmlColor="#757575" />
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
        </div>
      ) : null}
    </TableWrapper>
  );
}
