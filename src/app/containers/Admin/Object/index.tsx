import React, { useEffect, useState } from 'react';
import './style.scss';
import { useSelector, useDispatch } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import WarningIcon from '@material-ui/icons/Warning';
import AdminObjectTable from '../../../components/Admin/ObjectTable';
import { AlertTitle } from '@material-ui/lab';
import PageWrapper from '../../../components/Admin/ObjectPage/Wrapper';
import RedAlert from 'app/components/Admin/ObjectPage/RedAlert';
import CustomButton from 'app/components/Admin/CustomButton';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { useContext } from 'react';
import { DataContext } from 'app/containers/HomePage';
import { FeatureMember, RegistrationStatus } from 'app/model/FeatureMember';
import { Feature } from 'geojson';
import { SORT_STATUS } from 'app/components/Admin/ImportTable';
import {
  getParsedFeatureMember,
  LocalStorageProvider,
} from 'app/providers/LocalStorageProvider';
import { genId } from 'app/components/ActualMap';
import {
  AlterFeatureCollectionResponse,
  createFeatureMember,
  UpdateAction,
} from 'app/providers/DataProvider';
import { performAccessibilityAssessment } from 'app/accessiblity/accessibilityExecution';
import { useMediaQuery } from '@material-ui/core';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles';

interface Props {
  pageTitle?: any;
  changeIsSubMenuOnStatus?: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    btnContainer: {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      margin: 16,
      height: 36,
      justifyContent: 'space-between',
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        width: '100%',
        height: 80,
      },
    },
    objectBtn: {
      margin: '0px 5px',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        margin: '5px 0px',
      },
    },
  }),
);

export function ObjectPage(props: Props) {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    featureCollection,
    username,
    onInitReg,
    onEditObject,
    onCreateFeatureMember,
    setHasUploadConnectionError,
    saveData,
    demoModeActive,
    onDeleteObject,
  } = useContext(DataContext);

  const { pageTitle, changeIsSubMenuOnStatus } = props;
  const [selectedIds, setList] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);

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
    deselectAll();
    setPage(pageValue);
  };

  const [, updateState] = useState<any>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const [showUnPublished, toggleShowUnPublished] = useState<boolean>(false);

  const sortObjects = (status: SORT_STATUS) => {
    let inProgress = getWorkInProgressFeatureMembers();

    if (inProgress) {
      inProgress.sort((a, b) => {
        const dateA = a.nodes?.find(
          element => element?.name?.toLowerCase() == 'førstedatafangstdato',
        )?.value;
        const dateB = b.nodes?.find(
          element => element?.name?.toLowerCase() == 'førstedatafangstdato',
        )?.value;

        if (status == SORT_STATUS.DESC) {
          if (dateA > dateB) return -1;
          else return 1;
        } else {
          if (dateA < dateB) return -1;
          else return 1;
        }
      });
    }

    if (showUnPublished) {
      inProgress = inProgress.filter(
        feature =>
          feature.registrationStatus == RegistrationStatus.clientError ||
          feature.registrationStatus == RegistrationStatus.serverError,
      );
    }

    setFeatures(inProgress);
  };

  const getWorkInProgressFeatureMembers = (): FeatureMember[] => {
    const dateIsWithinBounds = (date: Date): boolean => {
      if (date instanceof Date) {
      } else {
        return false;
      }

      const _MS_PER_DAY = 1000 * 60 * 60 * 24;

      // a and b are javascript Date objects
      function dateDiffInDays(a, b) {
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
      }

      const difference = dateDiffInDays(date, new Date(Date.now()));

      if (difference <= 14) return true;
      else return false;
    };

    const inProgress:
      | FeatureMember[]
      | undefined = featureCollection?.featureMembers.filter(feature => {
      const origin = feature.nodes?.find(n => n?.name.toLowerCase() == 'opphav')
        ?.value;

      if (
        origin != undefined &&
        origin.toLowerCase() != username! &&
        origin.toLowerCase() != 'nåværende_bruker' &&
        feature.editedByUser != true
      ) {
        return false;
      }

      let createdAtDate;
      try {
        createdAtDate = feature.nodes?.find(
          n => n.name?.toLowerCase() == 'førstedatafangstdato',
        )!.value;
      } catch (e) {
        console.log(e);
      }

      const modifiedAtDate = feature.nodes.find(
        n => n.name?.toLowerCase() == 'datafangstdato',
      )?.value;

      if (modifiedAtDate != undefined) {
        if (dateIsWithinBounds(modifiedAtDate!) == true) {
          return true;
        } else {
          return false;
        }
      } else {
        if (dateIsWithinBounds(createdAtDate!) == true) {
          return true;
        } else {
          return false;
        }
      }
    });

    return inProgress != undefined ? inProgress : [];
  };

  /// TODO:
  const unPublishedLength = (
    getWorkInProgressFeatureMembers().filter(
      feature =>
        feature.registrationStatus == RegistrationStatus.clientError ||
        feature.registrationStatus == RegistrationStatus.serverError,
    ) ?? []
  ).length;

  useEffect(() => {
    setFeatures(getWorkInProgressFeatureMembers());
  }, [featureCollection?.featureMembers.length]);

  const [features, setFeatures] = useState<FeatureMember[]>(
    getWorkInProgressFeatureMembers(),
  );

  const getFeatureMembersForPage = (): FeatureMember[] => {
    const limit = (page - 1) * 10;

    return features.slice(limit, limit + 10)!;
  };

  const getPageCount = (): number => {
    const inProgress = getWorkInProgressFeatureMembers();

    if (inProgress.length < 1) return 0;
    const roughCount = inProgress.length! / 10;

    const roughCountAsFixed = Number(roughCount.toFixed(0));

    const test = roughCountAsFixed % roughCount;

    if (roughCount > roughCountAsFixed) {
      return roughCountAsFixed + 1;
    } else {
      return roughCountAsFixed;
    }
  };

  const handleDeleteItem = (feature: FeatureMember) => {
    featureCollection!.featureMembers! = featureCollection!.featureMembers!.filter(
      f => {
        if (f.localId == feature.localId!) return false;
        else return true;
      },
    );
    setFeatures(getWorkInProgressFeatureMembers());
    onDeleteObject!(feature);
  };

  const handleDuplicateFeature = (id: string) => {
    const duplicateFromFeature = featureCollection?.featureMembers.find(
      f => f.localId == id,
    )!;

    const parsedFeature = duplicateFromFeature.toLocalStorageFormatted(false);

    const duplicate = getParsedFeatureMember(parsedFeature);

    duplicate.id = undefined;
    duplicate.images = [];
    duplicate.localId = genId();
    duplicate.isDuplicate = true;
    duplicate.editedByUser = true;
    duplicate.dbAction = UpdateAction.create;

    if (demoModeActive == true) {
      duplicate.isDemo = true;
    }

    duplicate.nodes.find(
      n => n.name?.toLowerCase() == 'førstedatafangstdato',
    )!.value = new Date(Date.now());

    console.log(duplicate);
    onCreateFeatureMember!(duplicate);
  };

  const handleOnToggleUnpublished = (checked: boolean) => {
    if (checked) {
      setFeatures(
        getWorkInProgressFeatureMembers().filter(
          feature =>
            feature.registrationStatus == RegistrationStatus.clientError ||
            feature.registrationStatus == RegistrationStatus.serverError,
        ),
      );
    } else {
      setFeatures(getWorkInProgressFeatureMembers());
    }
    toggleShowUnPublished(checked);
  };

  const handleOnPublish = async (
    id: string,
    asUnpublished?: boolean,
  ): Promise<any> => {
    if (demoModeActive == true) return;
    const feature = featureCollection?.featureMembers.find(
      f => f.localId == id,
    )!;

    let inputIsValid: boolean = true;

    let fields = feature.nodes;

    if (feature.rampNode) {
      if (feature.rampNode.nodes[0].value == 'Ja')
        fields = fields.concat(feature.rampNode.nodes);
    }

    if (feature.stairNode) {
      if (feature.stairNode.nodes[0].value == 'Ja')
        fields = fields.concat(feature.stairNode.nodes);
    }

    for (let value of fields) {
      if (value.valid == false) {
        inputIsValid = false;
        break;
      }
    }

    if (inputIsValid) {
      performAccessibilityAssessment(feature);
      /// TODO: should be set after positive upload response from server

      const response: AlterFeatureCollectionResponse = await createFeatureMember(
        feature,
      );

      if (response.statusCode == 200) {
        response.featureMember.dbAction = UpdateAction.replace;
        response.featureMember.registrationStatus =
          RegistrationStatus.importedYTD;
        response.featureMember.editedByUser = false;

        saveData!();

        return {
          valid: true,
          msg: 'Godkjent!',
        };
      } else if (response.statusCode == 999) {
        response.featureMember.registrationStatus ==
          RegistrationStatus.clientError;
        setHasUploadConnectionError!(true);

        LocalStorageProvider.setConnectionError(true);

        saveData!();
        return {
          valid: false,
          msg:
            'Ingen internet-tilkobling, opplastning vil skje automatisk ved neste tilkobling',
        };
      } else {
        response.featureMember.registrationStatus ==
          RegistrationStatus.serverError;

        return {
          valid: false,
          msg: 'En feil har oppstått på serveren, prøv igjen senere.',
        };
      }

      return {
        valid: true,
        msg: 'Godkjent!',
      };
    } else {
      return {
        valid: false,
        msg: 'Validering ikke godkjent',
      };
    }
  };

  const handleOnPublishUnpublished = async () => {
    const unpublishedFeatures: FeatureMember[] = getWorkInProgressFeatureMembers().filter(
      feature =>
        feature.registrationStatus == RegistrationStatus.clientError ||
        feature.registrationStatus == RegistrationStatus.serverError,
    );

    for (const feature of unpublishedFeatures) {
      await handleOnPublish(feature.localId!, true);
    }
  };

  return (
    <PageWrapper className="px-0">
      <div className="row mt-4 mb-3">
        <div className={classes.btnContainer}>
          {!smallScreen ? (
            <h1
              style={{
                fontFamily: 'Meta Book',
                fontSize: 24,
                color: 'rgba(0,0,0,0,87)',
                margin: 0,
              }}>
              {t(translations.adminPage.myObject).toString()}
            </h1>
          ) : null}
          <div>
            {unPublishedLength > 0 ? (
              <CustomButton
                classes={{ root: classes.objectBtn }}
                onClick={() => handleOnPublishUnpublished()}
                custom_color="#1A589F"
                custom_text_transform="none"
                custom_border="1px solid rgba(0, 0, 0, 0.12)"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                color="primary">
                {t(translations.adminPage.objectPage.publishAllObject) +
                  ` (${unPublishedLength.toString()})`}
              </CustomButton>
            ) : null}
            <CustomButton
              classes={{ root: classes.objectBtn }}
              custom_color="white"
              custom_text_transform="none"
              custom_background_color="#1A589F"
              variant="contained"
              color="primary"
              onClick={() => onInitReg!(true)}>
              {t(translations.adminPage.objectPage.registerNewObject)}
            </CustomButton>
          </div>
        </div>
        <div
          style={{ display: 'flex', position: 'relative', paddingTop: '12px' }}>
          {unPublishedLength > 0 ? (
            <div className="col-lg-6">
              <RedAlert
                severity="error"
                icon={<WarningIcon fontSize="inherit" />}>
                <AlertTitle>
                  {t(translations.adminPage.objectPage.hasUnPublished)}
                </AlertTitle>
              </RedAlert>
            </div>
          ) : null}

          {/*{smallScreen ? (*/}
          {/*  <CustomButton*/}
          {/*    custom_color="white"*/}
          {/*    custom_text_transform="none"*/}
          {/*    custom_background_color="#1A589F"*/}
          {/*    className="ml-3"*/}
          {/*    variant="contained"*/}
          {/*    color="primary"*/}
          {/*    onClick={() => onInitReg!(true)}>*/}
          {/*    {t(translations.adminPage.objectPage.registerNewObject)}*/}
          {/*  </CustomButton>*/}
          {/*) : null}*/}
        </div>
      </div>
      <AdminObjectTable
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
        onlyShowUnPublished={showUnPublished}
        toggleShowOnlyUnPublished={selected =>
          handleOnToggleUnpublished(selected)
        }
        hasUnPublished={unPublishedLength > 0}
        changeIsSubMenuOnStatus={changeIsSubMenuOnStatus}
        onSort={status => sortObjects(status)}
        onDeleteItem={feature => handleDeleteItem(feature)}
        onOpenInMap={featureId => onEditObject!(featureId)}
        onDuplicate={featureId => handleDuplicateFeature(featureId)}
        onPublish={id => handleOnPublish(id)}></AdminObjectTable>
    </PageWrapper>
  );
}
