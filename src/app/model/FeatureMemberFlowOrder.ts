import { XsdComplexTypeElement } from 'sosi/xsd';
type OrderAndElements = {
  elements: XsdComplexTypeElement[];
  order: string[];
};

export function orderFeatureMemberElements(
  elements: XsdComplexTypeElement[],
  featureType: string,
): OrderAndElements {
  if (featureType == undefined || elements == undefined || elements.length < 1)
    throw 'FEATURETYPE  TYPE CAN NOT BE UNDEFINED';

  switch (featureType) {
    case 'FriluftParkeringsområde': {
      return orderFriluftParkeringsmråde(elements);
    }
    case 'TettstedParkeringsområde': {
      return orderTettstedParkeringsområde(elements);
    }
    case 'FriluftHCparkering': {
      return orderFriluftHCparkering(elements);
    }
    case 'TettstedHCparkering': {
      return orderTettstedHCparkering(elements);
    }
    case 'FriluftBaderampe': {
      return orderFriluftBaderampe(elements);
    }
    case 'FriluftFiskeplassBrygge': {
      return orderFriluftFiskeplassBrygge(elements);
    }
    case 'FriluftFriluftsområde': {
      return orderFriluftFriluftsområde(elements);
    }
    case 'FriluftGrillBålplass': {
      return orderFriluftGrillBålplass(elements);
    }
    case 'FriluftGapahuk': {
      return orderFriluftGapahuk(elements);
    }
    case 'FriluftToalett': {
      return orderFriluftToalett(elements);
    }
    case 'FriluftTurvei': {
      return orderFriluftTurvei(elements);
    }
    case 'TettstedVei': {
      return orderTettstedVei(elements);
    }
    case 'FriluftSkiløype': {
      return orderFriluftSkiløype(elements);
    }
    case 'Sittegruppe': {
      return orderSittegruppe(elements);
    }
    case 'TettstedInngangBygg': {
      return orderTettstedInngangBygg(elements);
    }
    case 'FriluftHytterTilrettelagt': {
      return orderFriluftHytterTilrettelagt(elements);
    }
    case 'FriluftStSikrFriluftomr': {
      return orderFriluftStSikrFriluftomr(elements);
    }
  }
  return { elements: [], order: [] };
}

function orderFriluftParkeringsmråde(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'kapasitetPersonbiler',
    'antallUU',
    'årstidsbruk',
    'dekkeMateriale',
    'dekkeFasthet',
    'dekkeTilstand',
    'kommentar',
    'forbedringsforslag',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderTettstedParkeringsområde(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'byggingPågår',
    'kapasitetPersonbiler',
    'antallUU',
    'overbygg',
    'dekkeMateriale',
    'dekkeFasthet',
    'dekkeTilstand',
    'kommentar',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderFriluftHCparkering(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'skiltet',
    'merket',
    'avstandFasilitet',
    'avgift',
    'kommentar',
    'forbedringsforslag',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderTettstedHCparkering(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'byggingPågår',
    'overbygg',
    'avstandServicebygg',
    'gatelangsParkering',
    'skiltet',
    'merket',
    'tryggOvergang',
    'avgift',
    'kommentar',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderFriluftBaderampe(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = ['objektNr', 'rampe', 'kommentar', 'forbedringsforslag'];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderFriluftFiskeplassBrygge(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'flytebrygge',
    'rampe',
    'dekkeMateriale',
    'plankeavstand',
    'dekkeFasthet',
    'dekkeTilstand',
    'diameter',
    'rekkverk',
    'stoppkant',
    'stoppkantHøyde',
    'kommentar',
    'forbedringsforslag',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderFriluftFriluftsområde(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'navn',
    'naturbaseId',
    'parkeringsområde',
    'hcParkeringsplass',
    'toalett',
    'turvei',
    'baderampe',
    'fiskeplass',
    'grillBålplass',
    'sittegruppe',
    'gapahuk',
    'informasjon',
    'annen',
    'kommentar',
    'forbedringsforslag',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderFriluftGrillBålplass(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'plasstype',
    'dekkeMateriale',
    'dekkeFasthet',
    'dekkeTilstand',
    'helning',
    'kommentar',
    'forbedringsforslag',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderFriluftGapahuk(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'rampe',
    'breddeInngang',
    'høydeInngang',
    'terskelhøyde',
    'kontrastInngang',
    'diameter',
    'dekkeMateriale',
    // 'plankeavstand',
    'dekkeFasthet',
    'dekkeTilstand',
    'kommentar',
    'forbedringsforslag',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderFriluftToalett(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'byggtype',
    'servantTilgjengelig',
    'wcTilgjengelig',
    'omkledningTilgjengelig',
    'rampe',
    'trapp',
    'horisontalFelt',
    'dørtype',
    'døråpner',
    'manøverknappHøyde',
    'breddeInngang',
    'kontrastInngang',
    'terskelhøyde',
    'diameter',
    'belysningInne',
    'kommentar',
    'forbedringsforslag',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderFriluftTurvei(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'veitype',
    'spesialFotrutetype',
    'årstidsbruk',
    'sperrebom',
    'sperrebomTilgjengelig',
    'dekkeMateriale',
    'plankeavstand',
    'dekkeFasthet',
    'dekkeTilstand',
    'møteHvileplass',
    'antallTilstrekkelig',
    'belysning',
    'bredde',
    'stigning',
    'tverrfall',
    'friHøyde',
    'ledelinje',
    'ledelinjeKontrast',
    'kommentar',
    'forbedringsforslag',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderTettstedVei(elements: XsdComplexTypeElement[]): OrderAndElements {
  const order = [
    'objektNr',
    'byggingpågår',
    'gatetype',
    'nedsenk1',
    'nedsenk2',
    'lydsignal',
    'lyssignal',
    'trapp',
    'belysning',
    'dekkeMateriale',
    'plankeavstand',
    'dekkeFasthet',
    'dekkeTilstand',
    'bredde',
    'stigning',
    'tverrfall',
    'møteplass',
    'varmekabel',
    'ledelinje',
    'ledelinjeKontrast',
    'kommentar',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderFriluftSkiløype(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'avstandHC',
    'sperrebom',
    'sperrebomTilgjengelig',
    'dobbelSpor',
    'belysning',
    'bredde',
    'stigning',
    'tverrfall',
    'friHøyde',
    'kommentar',
    'forbedringsforslag',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderSittegruppe(elements: XsdComplexTypeElement[]): OrderAndElements {
  const order = [
    'objektNr',
    'adkomstKant',
    'adkomstTilgjengelig',
    'dekkeMateriale',
    'dekkeFasthet',
    'dekkeTilstand',
    'helning',
    'høydeBenk',
    'armlene',
    'ryggstøtte',
    'høydeBord',
    'utstikkBord',
    'kommentar',
    'forbedringsforslag',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderTettstedInngangBygg(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'byggingPågår',
    'byggningsfunksjon',
    'avstandVanligParkering',
    'avstandHC',
    'rampe',
    'trapp',
    'stigningAdkomstvei',
    'horisontalFelt',
    'dørtype',
    'døråpner',
    'manøverknappHøyde',
    'ringeklokke',
    'ringeklokkeHøyde',
    'breddeInngang',
    'terskelHøyde',
    'kontrastInngang',
    'kommentar',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderFriluftHytterTilrettelagt(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'navn',
    'eier',
    'lenke',
    'tilrettelagt',
    'forbedringsforslag',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}

function orderFriluftStSikrFriluftomr(
  elements: XsdComplexTypeElement[],
): OrderAndElements {
  const order = [
    'objektNr',
    'navn',
    'naturbaseNr',
    'linkBilde',
    'linkSkjema',
    'forbedringsforslag',
  ];

  const sortedElementList: XsdComplexTypeElement[] = [];

  for (var i = 0; i < order.length; i++) {
    const element = elements.find(e => e.name == order[i])!;

    if (element != undefined) sortedElementList.push(element);
  }

  return {
    elements: sortedElementList,
    order: order,
  };
}
