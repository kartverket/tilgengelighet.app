/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FeatureCollection } from 'app/model/FeatureCollection';
import { MapActions } from '../MapActions/Loadable';
import {
  createFeatureMember,
  deleteFeatureMember,
  getFeatureMemberImages,
  UpdateAction,
} from 'app/providers/DataProvider';
import { AdminPage } from '../Admin';
import { ImportObjects } from '../ImportObjects';
import {
  FeatureMember,
  FeatureNode,
  RegistrationStatus,
} from 'app/model/FeatureMember';
import Auth from 'auth';
import { FavoriteFilter, ObjectFilter } from 'app/components/MapObjectFilter';
import { LocalStorageProvider } from 'app/providers/LocalStorageProvider';
import TooltipCard from 'app/components/TooltipCard';
import { LayerGroup } from 'leaflet';
import useWindowDimensions from 'app/utils/windowDimensions';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { Feature } from 'geojson';

export enum ShowObjectsByColorType {
  registration,
  accessibility,
}

export type ContextProps = {
  featureCollection?: FeatureCollection;
  importStandbyObjects?: (
    newFeatureCollection: FeatureCollection,
    includeImages: boolean,
  ) => void;
  setPage?: (index: number) => void;
  onImportClicked?: () => void;
  onAdminPageIndexChanged?: (index: number | undefined) => void;
  onInitReg?: (init: boolean) => void;
  renderedIds?: Map<string, string>;
  setRenderedIds?: (layers: any) => void;
  onCreateFeatureMember?: (featureMember: FeatureMember) => void;
  applyFilter?: (apply: boolean) => void;
  objectFilter?: ObjectFilter;
  setFilter?: (filter: ObjectFilter) => void;
  onFavoriteFilterChanged?: (favoriteFilters: FavoriteFilter[]) => void;
  onCleanCache?: () => void;
  mapLayerGroup?: LayerGroup | undefined;
  username?: string;
  onEditObject?: (id: string) => void;
  editObjectId?: string | undefined;
  resetEditObjectId?: () => void;
  hasUploadConnectionError?: boolean;
  setHasUploadConnectionError?: (connectionError: boolean) => void;
  saveData?: (featureMember?: FeatureMember) => void;
  setShowObjectsByColorType?: (show: ShowObjectsByColorType) => void;
  showObjectsByColorType?: ShowObjectsByColorType;
  demoModeActive?: boolean;
  setDemoMode?: (active: boolean) => void;
  onRebuildObjectLayer?: (id: any | undefined) => void;
  rebuildObjectLayerData?: any | undefined;
  onDeleteObject?: (feature: FeatureMember) => void;
};

export const DataContext = React.createContext<ContextProps>({});

export function HomePage() {
  const { t } = useTranslation();

  const [pageIndex, setPageIndex] = useState<number>(0);

  const [adminPageIndex, setAdminPageIndex] = useState<number | undefined>();

  const [initReg, setInitReg] = useState<boolean>(false);

  const { height, width } = useWindowDimensions();

  const [importObjects, setImportObjects] = useState<boolean>(false);

  const [localStorageErrorMsg, setLocalStorageErrorMsg] = useState<boolean>(
    false,
  );

  const [connectionErrorMsg, setConnectionErrorMsg] = useState<string>();

  const onImportObjects = async (
    newFeatureCollection: FeatureCollection,
    includeImages: boolean,
  ) => {
    if (!newFeatureCollection || newFeatureCollection.featureMembers.length < 1)
      throw 'documents not available';

    // Set imported FeatureCollection
    if (!data.featureCollection) {
      data.featureCollection = newFeatureCollection;

      // for (let member of newFeatureCollection.featureMembers) {
      //   if (includeImages && member.images.length > 0) {
      //     member.images = await getFeatureMemberImages(member.images);
      //   }
      // }

      setData({
        ...data,
        featureCollection: newFeatureCollection,
      });
    }

    // Else append the non exsistent objects to the current FeatureCollection
    else {
      const existingObjectIds: string[] = [];

      // Gather id's for duplicate check
      for (let member of data.featureCollection.featureMembers) {
        const id = member.localId;
        if (id) existingObjectIds.push(id);
      }

      // Check if object already is included if not add the object to current featureCollection
      for (let member of newFeatureCollection?.featureMembers) {
        const id = member.localId;

        if (id)
          if (!existingObjectIds.includes(id)) {
            data.featureCollection.featureMembers.push(member);
            if (includeImages && member.images.length > 0) {
              member.images = await getFeatureMemberImages(member.images);
            }
          }
      }
    }
    setData({
      ...data,
      featureCollection: data.featureCollection,
    });

    const error = await LocalStorageProvider.saveFeatureMembers(
      data.featureCollection.featureMembers,
    );
    if (error) setLocalStorageErrorMsg(true);
  };

  const handleOnMapRenderObjects = layers => {
    for (let layer of layers) {
      if (layer.feature) {
        const id = layer.feature.id;
        data.renderedIds!.set(id, id);
      }
    }
  };

  const handleOnSetFilter = (filter: ObjectFilter) => {
    data.objectFilter = filter;
    setData({ ...data, objectFilter: filter });

    if (filter.favoriteApplied == true) {
      saveFavoriteFilters(filter.favorites!);
    }
  };

  const saveFavoriteFilters = (favoriteFilters: FavoriteFilter[]) => {
    if (favoriteFilters == undefined)
      throw 'Favorite filters can not be undefined';

    const error = LocalStorageProvider.saveFavoriteFilters(favoriteFilters);
    if (error) setLocalStorageErrorMsg(true);
  };

  const [data, setData] = useState<ContextProps>({
    importStandbyObjects: (
      newFeatureCollection: FeatureCollection,
      includeImages: boolean,
    ) => onImportObjects(newFeatureCollection, includeImages),
    setPage: num => setPageIndex(num),
    onImportClicked: () => setImportObjects(true),
    onAdminPageIndexChanged: index => setAdminPageIndex(index),
    onInitReg: (init: boolean) => {
      setInitReg(init);
      setPageIndex(0);
    },
    setRenderedIds: layers => handleOnMapRenderObjects(layers),
    renderedIds: new Map(),
    onCreateFeatureMember: member => handleOnCreateFeatureMember(member),
    applyFilter: apply => {
      setData({
        ...data,
        objectFilter: {
          objects: data.objectFilter!.objects,
          apply: apply,
          favorites: data.objectFilter!.favorites,
          favoriteApplied: data.objectFilter!.favoriteApplied,
          appliedFavoriteFilter: data.objectFilter!.appliedFavoriteFilter,
          mapValueNotifier: data.objectFilter!.mapValueNotifier,
        },
      });
    },
    objectFilter: {
      objects: new Map(),
      apply: false,
      favoriteApplied: false,
      mapValueNotifier: [],
    },
    setFilter: filter => handleOnSetFilter(filter),
    onFavoriteFilterChanged: favoriteFilters =>
      saveFavoriteFilters(favoriteFilters),
    onCleanCache: () => cleanCache(),
    mapLayerGroup: new LayerGroup(),

    /// TODO: fetch real userName from auth
    username: 'nåværende_bruker',
    onEditObject: id => {
      setData({ ...data, editObjectId: id });
      setPageIndex(0);
    },
    resetEditObjectId: () => setData({ ...data, editObjectId: undefined }),
    setHasUploadConnectionError: () => (data.hasUploadConnectionError = true),
    saveData: feature => handleOnSaveData(feature),
    showObjectsByColorType: ShowObjectsByColorType.registration,
    setShowObjectsByColorType: type =>
      setData({ ...data, showObjectsByColorType: type }),
    setDemoMode: active => handleOnDemoModeStatusChange(active),
    onRebuildObjectLayer: objectData =>
      setData({ ...data, rebuildObjectLayerData: objectData }),
    onDeleteObject: feature => handleOnDeleteObject(feature),
  });

  const handleOnDeleteObject = (feature: FeatureMember) => {
    /// Delete from Database
    deleteFeatureMember(feature);
    /// Delete from cache
    data.featureCollection!.featureMembers! = data.featureCollection!.featureMembers!.filter(
      f => {
        if (f.localId == feature.localId) return false;
        else return true;
      },
    );

    handleOnSaveData();
  };

  const handleOnDemoModeStatusChange = active => {
    LocalStorageProvider.setDemoMode(active);

    let featureMembers: FeatureMember[] | undefined =
      data.featureCollection?.featureMembers;
    if (
      active == false &&
      featureMembers != undefined &&
      featureMembers?.length > 0
    ) {
      data.featureCollection.featureMembers = featureMembers.filter(
        f => f.isDemo != true,
      );
    }

    setData({
      ...data,
      demoModeActive: active,
      featureCollection: data.featureCollection,
    });

    handleOnSaveData();
  };
  const handleOnSaveData = (feature?: FeatureMember) => {
    if (data.featureCollection != undefined) {
      const features: FeatureMember[] = data.featureCollection.featureMembers;

      if (feature != undefined) {
        const correspondingFeatureMember = features.find(
          f => f.localId == feature.localId,
        )!;

        if (correspondingFeatureMember != undefined) {
          const indexOf = features.indexOf(correspondingFeatureMember);

          features.splice(indexOf, 1, feature);
        }
      }

      LocalStorageProvider.saveFeatureMembers(features);
    }
  };

  const cleanCache = () => {
    LocalStorageProvider.clean();
    data.featureCollection!.featureMembers = [];
    setData({ ...data, featureCollection: data.featureCollection });
  };

  const handleOnCreateFeatureMember = async (featureMember: FeatureMember) => {
    console.log(featureMember);
    data.renderedIds!.set(featureMember.localId!, featureMember.localId!);

    /// Assert has createdAtDate Before local storage save
    // if (featureMember.dbAction == UpdateAction.create) {
    //   if (
    //     featureMember.nodes.find(e => e.name == 'førsteDatafangstdato') ==
    //     undefined
    //   ) {
    //     featureMember.nodes.push({
    //       name: 'førsteDatafangstdato',
    //       valid: true,
    //       value: new Date(featureMember.getDateUploadFormatted()),
    //     });
    //   }
    // }
    // /// Assert has modifiedAtDate Before local storage save
    // else {
    //   const alteredAtDateNode = featureMember.nodes.find(
    //     e => e.name.toLowerCase() == 'datafangstdato',
    //   );

    //   if (alteredAtDateNode != undefined) {
    //     alteredAtDateNode!.value = new Date(alteredAtDateNode!.value);
    //   } else {
    //     const alteredAtNode = new FeatureNode(
    //       'datafangstdato',
    //       new Date(Date.now()),
    //       true,
    //     );

    //     featureMember.nodes.push(alteredAtNode);
    //   }
    // }

    if (data.featureCollection != undefined) {
      if (
        data.featureCollection.featureMembers.find(
          feature => feature.localId == featureMember.localId,
        ) == undefined
      ) {
        data.featureCollection!.featureMembers.push(featureMember);
      }
      setData({ ...data, featureCollection: data.featureCollection });
    } else {
      const collection = new FeatureCollection();
      collection.featureMembers.push(featureMember);
      onImportObjects(collection, false);
    }

    if (data.featureCollection != undefined) {
      const error = await LocalStorageProvider.saveFeatureMembers(
        data.featureCollection.featureMembers,
      );
      if (error) setLocalStorageErrorMsg(true);
    }
  };

  useEffect(() => {
    if (data.featureCollection == undefined) {
      setFeatureCollection();
    }
    if (data.objectFilter!.favorites == undefined) {
      setFavoriteFilters();
    }

    if (data.hasUploadConnectionError == undefined) {
      handleUploadConnectionError();
    }

    if (data.demoModeActive == undefined) {
      setDemoModeStatus();
    }
  });

  const setDemoModeStatus = () => {
    const demoMode = LocalStorageProvider.getDemoMode();

    setData({ ...data, demoModeActive: demoMode ?? false });
  };

  const handleUploadConnectionError = () => {
    /// TODO: Test when CRUD functionality is restored
    const error = LocalStorageProvider.getConnectionError();

    if (error == false) return;

    data.hasUploadConnectionError = error;

    if (error == true) {
      if (data.featureCollection?.featureMembers != undefined) {
        const featuresToUpload: FeatureMember[] = data.featureCollection.featureMembers.filter(
          feature =>
            feature.registrationStatus == RegistrationStatus.clientError,
        );

        if (featuresToUpload.length > 0) {
          if (navigator.onLine == false && error == true) {
            setConnectionErrorMsg(
              'Ingen internet-tilkobling, opplastning vil skje automatisk ved neste tilkobling',
            );
            return;
          }

          for (const feature of featuresToUpload) {
            createFeatureMember(feature).then(response => {
              if (response.statusCode == 200) {
                response.featureMember.dbAction = UpdateAction.replace;

                response.featureMember.editedByUser = false;

                setConnectionErrorMsg(
                  'Fullført!' +
                    ` ${featuresToUpload.length} objekter har blitt lastet opp`,
                );
                LocalStorageProvider.setConnectionError(false);
              } else if (response.statusCode == 999) {
                setConnectionErrorMsg(
                  'Ingen internet-tilkobling, opplastning vil skje automatisk ved neste tilkobling',
                );
              } else {
                setConnectionErrorMsg(
                  'En feil har oppstått, prøver igjen senere.',
                );
              }
              handleOnSaveData();
            });
          }
        }
      }
    }
  };

  const setFavoriteFilters = () => {
    const favFilters = LocalStorageProvider.getFavoriteFilters();

    data.objectFilter!.favorites = favFilters;
  };

  const setFeatureCollection = async () => {
    const featureCollection = new FeatureCollection();

    featureCollection.featureMembers = await LocalStorageProvider.getFeatureMembers();
    data.featureCollection = featureCollection;
    setData({ ...data, featureCollection: featureCollection });
  };

  const mapPage = <MapActions initRegistration={initReg}></MapActions>;

  const adminPage = <AdminPage currentPage={adminPageIndex}></AdminPage>;

  let content;

  if (importObjects == true)
    content = (
      <ImportObjects onPop={() => setImportObjects(false)}></ImportObjects>
    );
  else if (pageIndex == 0) {
    content = mapPage;
  } else {
    content = adminPage;
  }

  let demoDisplay;

  if (data.demoModeActive == true) {
    demoDisplay = (
      <div
        style={{
          height: '20px',
          width: width,
          position: 'absolute',
          backgroundColor: 'rgba(176, 0, 32, 0.7)',
          zIndex: 30000,
          textAlign: 'center',
          top: '0px',
          fontSize: '16px',
        }}>
        <text>{t(translations.demoActive)}</text>
      </div>
    );
  }

  /// TODO: Re-impl auth
  // if (Auth.isAuthenticated()) {
  return (
    <article>
      <Helmet>
        <title>Tilgjengelighet-Kartverket</title>
        <meta name="description" content="Tilgjengelighet" />
      </Helmet>
      <div>
        {demoDisplay}
        <div style={{ position: 'absolute', zIndex: 12000 }}>
          {localStorageErrorMsg == true ? (
            <TooltipCard
              title="Lokal lagring fullt!"
              content="Vennligst fjern andre objekter om du vil lagre lokalt."
              isToolTip={false}
              onPop={() => setLocalStorageErrorMsg(false)}></TooltipCard>
          ) : null}
        </div>
        <div style={{ position: 'absolute', zIndex: 12000 }}>
          {connectionErrorMsg != undefined ? (
            <TooltipCard
              title="Automatisk opplastning"
              content={connectionErrorMsg}
              isToolTip={false}
              onPop={() => setConnectionErrorMsg(undefined)}></TooltipCard>
          ) : null}
        </div>
        <DataContext.Provider value={data}>{content}</DataContext.Provider>
      </div>
    </article>
  );
  // } else {
  //   location.href = '/login';
  //   return null;
  // }
}
