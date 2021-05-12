import React, { useContext, useEffect, useState } from 'react';
import AdminImportTable, {
  SORT_STATUS,
} from '../../../components/Admin/ImportTable';
import { Tooltip, makeStyles, Button, Typography } from '@material-ui/core';
import CloudDownloadIcon from '@material-ui/icons/CloudDownloadOutlined';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import { Router, Link } from 'react-router-dom';
import CustomButton from 'app/components/Admin/CustomButton';
import FixedBottomPaperWrapper from '../../../components/Admin/FixedButtomPaperWrapper';
import CustomPaper from 'app/components/Admin/CustomPaper';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { DataContext } from 'app/containers/HomePage';
import { FeatureMember } from 'app/model/FeatureMember';
import { DarkToolTip } from '../../../components/CustomToolTip';
import { ToolTipContext } from '../../../../store/ToolTipStore';
import { LocalStorageProvider } from 'app/providers/LocalStorageProvider';
import { AddAPhotoOutlined } from '@material-ui/icons';
import { parseSosiFile } from 'sosi/sosi';

const useStyles = makeStyles({
  buttonFilled: {
    borderRadius: '20px',
    backgroundColor: '#1A589F',
    fontWeight: 700,
    fontFamily: 'Arial',
    fontSize: '14.26px',
    textTransform: 'capitalize',
    letterSpacing: 1.25,
    padding: '10px 15px',
    lineHeight: '16px',
  },

  buttonOutlined: {
    borderRadius: '20px',
    fontWeight: 700,
    padding: '10px 15px',
    fontFamily: 'Arial',
    fontSize: '14.26px',
    color: '#1A589F',
    textTransform: 'capitalize',
    letterSpacing: 1.25,
    lineHeight: '16px',
    marginLeft: '10px',
    borderColor: 'rgba(0, 0, 0, 0.12)',
  },
  h6: {
    fontFamily: 'Arial',
    fontWeight: 500,
    display: 'inline-block',
    paddingRight: '20px',
    letterSpacing: 0.25,
    opacity: '87%',
  },
  hidden: {
    display: 'none',
  },
});

interface Props {
  pageTitle?: any;
  dbButton: any;
}

export function ImportPage(props: Props) {
  const { t } = useTranslation();

  const { featureCollection, onImportClicked } = useContext(DataContext);

  const tooltip = {
    fromDatabase: t(translations.adminPage.importedPage.dbToolTip),
    fromLocal: t(translations.adminPage.importedPage.localToolTip),
  };
  const { pageTitle } = props;
  const style = useStyles();
  const [selectedIds, setList] = React.useState<string[]>([]);
  const [page, setPage] = React.useState<number>(1);
  let { showToolTips, setShowToolTips } = React.useContext(ToolTipContext);

  const addList = id => {
    const currentList = [...selectedIds];
    currentList.push(id);
    setList(currentList);
  };

  const removeList = id => {
    setList(selectedIds.filter(item => item !== id));
  };

  const check = (event, id) => {
    if (event.target.checked) {
      addList(id);
    } else removeList(id);
  };

  const selectAll = () =>
    setList(featureCollection?.featureMembers.map(item => item.localId!)!);
  const deselectAll = () => setList([]);
  const changePage = pageValue => {
    // selectedData = fullData[pageValue - 1];
    deselectAll();
    setPage(pageValue);
  };

  const [, updateState] = React.useState<any>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [dbButton, showdbButton] = useState(true);
  console.log(dbButton);
  useEffect(() => {
    showdbButton(props.dbButton);
  }, [props.dbButton]);

  const getFeatureMembersForPage = (): FeatureMember[] => {
    const limit = (page - 1) * 10;

    return featureCollection?.featureMembers.slice(limit, limit + 10)!;
  };

  const getPageCount = (): number => {
    if (!featureCollection?.featureMembers) return 0;
    const roughCount = featureCollection?.featureMembers.length! / 10;

    const roughCountAsFixed = Number(roughCount.toFixed(0));

    if (roughCountAsFixed % roughCount > 0) return roughCountAsFixed;
    else return roughCount;
  };

  const sortObjects = (status: SORT_STATUS) => {
    const featuresWithOutCreatedAtDate = featureCollection?.featureMembers.filter(
      f =>
        f.nodes.find(
          element => element.name?.toLowerCase() == 'førstedatafangstdato',
        )?.value == undefined,
    );

    if (featuresWithOutCreatedAtDate)
      for (const feature of featuresWithOutCreatedAtDate) {
        const indexOf = featureCollection?.featureMembers.indexOf(feature);
        if (indexOf) delete featureCollection?.featureMembers[indexOf];
      }

    if (featureCollection?.featureMembers) {
      featureCollection?.featureMembers.sort((a, b) => {
        const dateA = a.nodes.find(
          element => element.name?.toLowerCase() == 'førstedatafangstdato',
        )?.value;
        const dateB = b.nodes.find(
          element => element.name?.toLowerCase() == 'førstedatafangstdato',
        )?.value;

        // if (!dateA && !dateB) return 0;

        // if (!dateA) return -1;

        // if (!dateB) return 1;

        if (status == SORT_STATUS.DESC) {
          if (dateA > dateB) return -1;
          else return 1;
        } else {
          if (dateA < dateB) return -1;
          else return 1;
        }
      });

      featureCollection.featureMembers = featureCollection.featureMembers.concat(
        featuresWithOutCreatedAtDate ?? [],
      );

      // let indexOfLastWithoutDate;

      // for (
      //   let index = 0;
      //   index < featureCollection?.featureMembers.length;
      //   index++
      // ) {
      //   const date = featureCollection.featureMembers[index].nodes.find(
      //     element => element.name?.toLowerCase() == 'førstedatafangstdato',
      //   )?.value;
      //   if (index == 0 && date) break;
      //   if (date) indexOfLastWithoutDate = index - 1;
      // }
      // if (indexOfLastWithoutDate)
      //   featureCollection.featureMembers.concat(
      //     featureCollection.featureMembers.splice(0, indexOfLastWithoutDate),
      //   );
    }
    forceUpdate();
  };

  const deleteSelectedItems = () => {
    featureCollection!.featureMembers! = featureCollection!.featureMembers!.filter(
      feature => {
        if (selectedIds.includes(feature.localId!)) return false;
        else return true;
      },
    );
    setList([]);
    LocalStorageProvider.saveFeatureMembers(featureCollection!.featureMembers!);
  };

  const deleteObject = (id: string) => {
    featureCollection!.featureMembers! = featureCollection!.featureMembers!.filter(
      feature => {
        if (feature.localId == id) return false;
        else return true;
      },
    );
    LocalStorageProvider.saveFeatureMembers(featureCollection!.featureMembers!);
    forceUpdate();
  };

  const inputId = 'sosi-import';

  const handleUploadFile = ({ target }) => {
    const fileReader = new FileReader();

    if (target.files.length) {
      const file = target.files[0];
      fileReader.readAsText(file, "UTF8");


      fileReader.onload = e => {
        // console.log(e.target?.result);

        parseSosiFile(e.target?.result);
      };
    }
    target.value = '';
  };

  return (
    <div className="table-wrapper px-0">
      <div className="row mt-5 mb-3 d-none d-lg-flex">
        <div className="col-4">
          <div className="container pl-0">
            <h2>{pageTitle}</h2>
          </div>
        </div>

        <div className="col-8">
          <div className="container text-right pr-0">
            <h6 className={style.h6}>
              {t(translations.adminPage.importedPage.importNew)}
            </h6>

            <DarkToolTip arrow title={tooltip.fromDatabase}>
              <CustomButton
                style={{ borderRadius: '4px', textTransform: 'none' }}
                className={style.buttonFilled}
                custom_background_color="#1A589F"
                custom_color="white"
                custom_text_transform="none"
                is_bold_text={1}
                variant="contained"
                color="primary"
                startIcon={<CloudDownloadIcon />}
                onClick={() => onImportClicked!()}>
                {t(translations.adminPage.importedPage.fromDatabase)}
              </CustomButton>
            </DarkToolTip>
            <input
              color="primary"
              accept=".sos"
              type="file"
              onChange={event => handleUploadFile(event)}
              id={inputId}
              style={{ display: 'none' }}
            />
            <label
              htmlFor={inputId}
              style={{
                paddingRight: '12px',
              }}>
              <DarkToolTip arrow title={tooltip.fromLocal}>
                <Button
                  component="span"
                  className={style.buttonOutlined}
                  style={{
                    borderRadius: '4px',
                    textTransform: 'none',
                  }}
                  fullWidth={true}
                  variant={'outlined'}
                  startIcon={<SaveAltIcon />}
                  onClick={() => {}}>
                  <Typography
                    style={{
                      fontWeight: 'bold',
                      letterSpacing: 1.25,
                      fontSize: '14.26px',
                    }}>
                    {t(translations.adminPage.importedPage.fromLocal)}
                  </Typography>
                </Button>
              </DarkToolTip>
            </label>
            {/* <CustomButton
                  style={{ borderRadius: '4px', textTransform: 'none' }}
                  className={style.buttonOutlined}
                  custom_color="#1A589F"
                  custom_border="1px solid rgba(0, 0, 0, 0.12)"
                  custom_background_color_hover="rgb(33, 137, 214,0.04)"
                  custom_text_transform="none"
                  is_bold_text={1}
                  variant="outlined"
                  startIcon={<SaveAltIcon />}
                  color="primary">
                  {t(translations.adminPage.importedPage.fromLocal)} */}
            {/* </CustomButton> */}
          </div>
        </div>
      </div>
      <AdminImportTable
        hasSelectElement
        hasSelectAll
        selectedList={selectedIds}
        checkSelect={check}
        data={getFeatureMembersForPage()}
        totalPage={getPageCount()}
        changePage={changePage}
        page={page}
        selectAll={selectAll}
        deselectAll={deselectAll}
        onDeleteSelected={() => deleteSelectedItems()}
        onDeleteObject={id => deleteObject(id)}
        onSort={status => sortObjects(status)}></AdminImportTable>
      <div
        className="bufferForSmallScreens"
        style={{ height: '200px', position: 'relative' }}>
        <FixedBottomPaperWrapper className="row d-lg-none">
          <div className="col-12">
            <CustomPaper
              custom_radius="8px"
              className="mt-5 p-3 text-left"
              elevation={3}>
              <div>
                <h5 className="font-weight-bold p-2">
                  {t(translations.adminPage.importedPage.importNew)}
                </h5>
                <CustomButton
                  className={style.buttonFilled}
                  custom_background_color="#1A589F"
                  custom_color="white"
                  custom_text_transform="none"
                  is_pill_button={1}
                  is_bold_text={1}
                  variant="contained"
                  color="primary"
                  startIcon={<CloudDownloadIcon />}
                  onClick={() => onImportClicked!()}>
                  {t(translations.adminPage.importedPage.database)}
                </CustomButton>

                <CustomButton
                  className={style.buttonOutlined}
                  custom_color="#1A589F"
                  custom_border="1px solid rgba(0, 0, 0, 0.12)"
                  custom_background_color_hover="rgb(33, 137, 214,0.04)"
                  custom_text_transform="none"
                  is_pill_button={1}
                  is_bold_text={1}
                  variant="outlined"
                  startIcon={<SaveAltIcon style={{ color: '#1A589F' }} />}
                  color="primary">
                  {t(translations.adminPage.importedPage.local)}
                </CustomButton>
              </div>
            </CustomPaper>
          </div>
        </FixedBottomPaperWrapper>
      </div>
    </div>
  );
}
