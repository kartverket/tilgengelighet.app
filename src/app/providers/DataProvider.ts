import { Dataset, DatasetImpl } from './Dataset';
import { FeatureCollection } from 'app/model/FeatureCollection';
import { FeatureMember, ImageElement } from 'app/model/FeatureMember';
import { GeoType } from 'app/containers/MapActions';
import { Update } from '@material-ui/icons';
import { FeatureMemberFilter } from 'app/components/MapObjectFilter/FeatureMemberFilterView';

const api = 'https://openapi-test.kartverket.no/v1/';

function getFeatureCollectionParams(params?: FeatureQuery) {
  const limit = 'limit=10000';

  const geoSystem = '&crs_EPSG=25832';

  let bbox = '';

  if (params) {
    if (params.bbox.length > 0) {
      if (params.bbox.length !== 4) throw 'bbox is missing values';

      let values: string = '';

      for (var param of params.bbox) {
        values = values + param.toString();
        if (params.bbox[params.bbox.length - 1] !== param)
          values = values + ',';
      }
      console.log(values);
      bbox = '&bbox=' + values;
    }
  }

  return '?' + limit + geoSystem + bbox;
}

function appendAuthHeaders(headers: Headers) {
  headers.append(
    'Authorization',
    'Basic bmV0cG93ZXJfdWxyaWs6bmV0cG93ZXJfdWxyaWtfdGVzdA==',
  );
}

function headersAlterCollection() {
  const myHeaders = new Headers();

  myHeaders.append(
    'Authorization',
    'Basic bmV0cG93ZXJfdWxyaWs6bmV0cG93ZXJfdWxyaWtfdGVzdA==',
  );

  myHeaders.append(
    'Content-Type',
    'application/vnd.kartverket.sosi+json; version=1.0',
  );

  // myHeaders.append(
  //   'X-Client-Product-Version',
  //   'ExampleApp 10.0.0 (Build 54321)',
  // );

  return myHeaders;
}

export async function getFeatureCollection(
  parameters: FeatureQuery,
): Promise<FeatureCollection | string> {
  const url =
    api +
    `datasets/${parameters.datasetId}/features` +
    getFeatureCollectionParams(parameters);

  const headers: Headers = new Headers();

  appendAuthHeaders(headers);

  console.log(url);

  const response = await fetch(url, {
    headers: headers,
    method: 'GET',
    redirect: 'follow',
  });
  const result: string = await response.text();
  if (response.status !== 200) {
    console.log(response.statusText);

    const errorMessage = response?.statusText;

    return 'Server respons: ' + (errorMessage ?? 'Ugyldig forespørsel');
  }

  return new FeatureCollection(result);
}

export type FeatureQuery = {
  bbox: number[];
  datasetId: String;
  includeImages: boolean;
};

export enum UpdateAction {
  create = 'Create',
  replace = 'Replace',
  erase = 'Erase',
}

export type AlterFeatureCollectionResponse = {
  statusCode: number;
  responseText: string;
  featureMember: FeatureMember;
};

const handleOnLockingError = async (feature: FeatureMember): Promise<any> => {
  const response = await deleteAllLocks('4fe98cda-09cb-483d-bbe0-7d9f229fb5d7');

  const result: string = await response.text();

  if (response == 200) {
    return await createFeatureMember(feature, undefined, true);
  } else {
    return {
      statusCode: 998,
      responseText: 'En feil har oppstått, prøv igjen senere.',
      featureMember: feature,
    };
  }
};

export async function createFeatureMember(
  featureMember: FeatureMember,
  datasetId?: string,
  recursive?: boolean,
): Promise<AlterFeatureCollectionResponse> {
  let response;

  try {
    if (
      featureMember.dbAction == UpdateAction.create ||
      featureMember.dbAction == UpdateAction.replace
    ) {
      const formattedCreateFeature = formatFeatureMember(featureMember);

      let replaceURLParam = '';

      console.log(formattedCreateFeature);

      if (featureMember.dbAction == UpdateAction.replace) {
        replaceURLParam = '&locking_type=user_lock&references=none';

        response = await fetchObjectWithLock(
          featureMember.localId!,
          featureMember.geometry?.type == GeoType.polygon,
        );

        const result: string = await response.text();

        /// Locking error (too many locks on current user), fall back to recursive
        if (
          result.toLowerCase().includes('more than one ticket found') &&
          recursive != true
        ) {
          return await handleOnLockingError(featureMember);
        }

        if (response.status !== 200) {
          console.log(result);
          console.log(response.statusText);

          return {
            statusCode: 998,
            responseText: 'En feil har oppstått, prøv igjen senere.',
            featureMember: featureMember,
          };
        }
      }

      response = await fetch(
        api +
          `datasets/${'4fe98cda-09cb-483d-bbe0-7d9f229fb5d7'}/features?crs_EPSG=4326` +
          replaceURLParam,
        {
          headers: headersAlterCollection(),
          method: 'POST',
          redirect: 'follow',
          body: formattedCreateFeature,
        },
      );
    }

    /// TODO: REMOVE
    else throw 'DB ACTION UNACCAPTED HERE';
  } catch (e) {
    if (navigator.onLine == false) {
      return {
        statusCode: 999,
        responseText: '',
        featureMember: featureMember,
      };
    } else {
      return {
        statusCode: 998,
        responseText: 'En feil har oppstått, prøv igjen senere.',
        featureMember: featureMember,
      };
    }
  }

  const result: string = await response.text();

  /// TODO: handle error in ui
  if (response.status !== 200) {
    console.log(result);
    console.log(response.statusText);
    console.log(response.text);
    return {
      statusCode: response.status,
      responseText: response.statusText,
      featureMember: featureMember ?? [],
    };
    // throw Error(response.statusText);
  }

  /// Image handling
  /// TODO: Assert that duplicates are not creating upload conflicts
  if (featureMember.images.length > 0) handleImageUpload(featureMember);

  console.log(result);

  return {
    statusCode: response.status,
    responseText: result,
    featureMember: featureMember ?? undefined,
  };
}

const fetchObjectWithLock = async (
  id: string,
  includeAllReferences?: boolean,
): Promise<Response> => {
  const references = includeAllReferences == true ? 'all' : 'none';

  const url =
    api +
    `datasets/4fe98cda-09cb-483d-bbe0-7d9f229fb5d7/features/${id}?crs_EPSG=4326&locking_type=user_lock&references=${references}`;

  const headers: Headers = new Headers();

  appendAuthHeaders(headers);

  console.log(url);

  return await fetch(url, {
    headers: headers,
    method: 'GET',
    redirect: 'follow',
  });
};

export async function deleteFeatureMember(
  featureMember: FeatureMember,
): Promise<string> {
  const response = await fetchObjectWithLock(featureMember.localId!);

  const result: string = await response.text();

  console.log(result);

  if (response.status !== 200) {
    console.log(response.statusText);

    const errorMessage = response?.statusText;

    return 'Server respons: ' + (errorMessage ?? 'Ugyldig forespørsel');
  } else {
    if (featureMember.geometry?.type == GeoType.polygon) {
      const borderObjectId = featureMember.getNodeInstance('borderObjectId')
        ?.value;

      if (!borderObjectId) throw 'BORDER OBJECT ID CAN NOT BE UNDEFINED';

      await fetchObjectWithLock(borderObjectId);
    }

    featureMember.dbAction = UpdateAction.erase;

    const formattedCreateFeature = formatFeatureMember(featureMember);

    console.log(formattedCreateFeature);

    const eraseResponse = await fetch(
      api +
        `datasets/${'4fe98cda-09cb-483d-bbe0-7d9f229fb5d7'}/features?crs_EPSG=4326&locking_type=user_lock`,
      {
        headers: headersAlterCollection(),
        method: 'POST',
        redirect: 'follow',
        body: formattedCreateFeature,
      },
    );

    const responseConclusion: string = await eraseResponse.text();

    console.log(responseConclusion);
  }

  return 'Success';
}

const deleteAllLocks = async (datasetId: string): Promise<any> => {
  const url = api + `datasets/${datasetId}/locks?locking_type=user_lock`;

  const headers: Headers = new Headers();

  appendAuthHeaders(headers);

  console.log(url);

  const response = await fetch(url, {
    headers: headers,
    method: 'DELETE',
    redirect: 'follow',
  });

  const result: string = await response.text();

  return response.status;
};

export function formatFeatureMember(featureMember: FeatureMember): string {
  let finalFormattedList: any[] = [];

  const formattedFeature = featureMember.toUploadFormatted();

  // if (featureMember.dbAction == UpdateAction.replace) {
  //   return JSON.stringify(formattedFeature);
  // }

  if (Array.isArray(formattedFeature)) {
    for (const obj of formattedFeature) {
      finalFormattedList.push(obj);
    }
  } else {
    finalFormattedList.push(formattedFeature);
  }

  return JSON.stringify({
    type: 'FeatureCollection',
    crs: {
      type: 'name',
      properties: {
        name: 'EPSG:25832',
      },
    },
    features: finalFormattedList,
  });
}

// TODO: Test properly
function handleImageUpload(featureMember: FeatureMember) {
  for (const imageElement of featureMember.images) {
    if (
      imageElement.url?.includes('data.kartverket.no') ||
      imageElement.isUploaded == true
    )
      continue;

    var data = new FormData();
    data.append('file', imageElement.imageFile);

    const myHeaders = new Headers();

    myHeaders.append('id', imageElement.id);

    fetch(`/featuremember/upload`, {
      method: 'POST',
      body: data,
      headers: myHeaders,
    })
      .then(res => {
        if (res.status == 200) {
          imageElement.isUploaded = true;
        }
      })
      .catch(error => {
        console.log(error.toString());
      });
  }
}

export async function getFeatureMemberImages(
  imageElements: ImageElement[],
): Promise<ImageElement[]> {
  const images: ImageElement[] = [];

  for (let element of imageElements) {
    const headers = new Headers();

    headers.append('id', element.id);

    const response = await fetch('/featuremember/image', {
      method: 'GET',
      redirect: 'follow',
      headers: headers,
    });

    if (response.status === 200) {
      const image = await response.blob();
      images.push({
        url: URL.createObjectURL(image),
        imageFile: image,
        id: element.id,
        isUploaded: true,
      });
    } else {
      console.log(response.status);
    }
  }

  return images;
}
