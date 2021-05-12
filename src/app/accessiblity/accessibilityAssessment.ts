import { stubFalse } from 'lodash';

export const friluftParkeringsOmraadeRullestol = (
  kapasitetBiler: number,
  antallUU: number,
  dekke: string,
  dekketilstand: string,
): object => {
  const props = {
    accessible: {
      antallUU: (100 * antallUU) / kapasitetBiler >= 5,
      dekke: dekke === 'Jevnt',
      dekketilstand: dekketilstand === 'Fast',
    },
    partlyAccessible: {
      antallUU: antallUU >= 1 && (100 * antallUU) / kapasitetBiler < 5,
    },
    notAccessible: {
      antallUU: antallUU === 0,
      dekke: dekke === 'Ujevnt',
      dekketilstand: dekketilstand === 'Løst',
    },
  };
  return props;
};

export const friluftParkeringsOmraadeRullestolEl = (
  kapasitetBiler: number,
  antallUU: number,
  dekke: string,
  dekketilstand: string,
): object => {
  const props = {
    accessible: {
      antallUU: (100 * antallUU) / kapasitetBiler >= 5,
      dekke: dekke === 'Jevnt',
      dekketilstand: dekketilstand === 'Fast',
    },
    partlyAccessible: {
      antallUU: antallUU >= 1 && (100 * antallUU) / kapasitetBiler < 5,
    },
    notAccessible: {
      antallUU: antallUU === 0,
      dekke: dekke === 'Ujevnt',
      dekketilstand: dekketilstand === 'Løst',
    },
  };
  return props;
};

export const friluftHcParkeringsplassRullestol = (
  bredde: number,
  lengde: number,
  skiltet: string,
  merket: string,
  avgift: string,
  automatHoyde: number,
  tilgjengeligAutomat: string,
): object => {
  const props = {
    accessible: {
      eval1:
        avgift === 'Ja'
          ? tilgjengeligAutomat === 'Ja' &&
            bredde >= 450 &&
            lengde >= 600 &&
            skiltet === 'Ja' &&
            merket === 'Ja'
          : true,
      eval2:
        avgift === 'Nei'
          ? bredde >= 450 &&
            lengde >= 600 &&
            skiltet === 'Ja' &&
            merket === 'Ja'
          : true,
    },
    partlyAccessible: {
      automatHoyde:
        avgift === 'Ja' && automatHoyde >= 110 && automatHoyde <= 130,
      bredde: bredde >= 380 && bredde <= 449,
      lengde: lengde >= 500 && lengde <= 599,
    },
    notAccessible: {
      bredde: bredde < 380,
      lengde: lengde < 500,
      skiltet: skiltet === 'Nei',
      merket: merket === 'Nei',
      avgift: avgift === 'Ja' && tilgjengeligAutomat === 'Nei',
    },
  };
  return props;
};

export const friluftTurveiRullestol = (
  bredde: number,
  antallMoteplassTilstrekkelig: string,
  stigning: number,
  tverrfall: number,
  dekketilstand: string,
  dekke: string,
  plankeAvstand: number,
  sperrebom: string,
  sperreBomTilgjengelig: string,
  moteplass: string,
): object => {
  const props = {
    accessible: {
      eval1:
        moteplass === 'Ja' && antallMoteplassTilstrekkelig === 'Ja'
          ? ((sperrebom === 'Ja' && sperreBomTilgjengelig === 'Ja') ||
              sperrebom === 'Nei' ||
              sperrebom == undefined) &&
            bredde >= 120 &&
            tverrfall <= 2.9 &&
            stigning < 3.8 &&
            dekketilstand === 'Jevnt' &&
            dekke === 'Fast' &&
            (plankeAvstand <= 1 || plankeAvstand == undefined)
          : true,
      eval2:
        (moteplass === 'Ja' && antallMoteplassTilstrekkelig === 'Nei') ||
        moteplass === 'Nei' ||
        moteplass == undefined
          ? ((sperrebom === 'Ja' && sperreBomTilgjengelig === 'Ja') ||
              sperrebom === 'Nei' ||
              sperrebom == undefined) &&
            bredde >= 180 &&
            tverrfall <= 2.9 &&
            stigning < 3.8 &&
            dekketilstand === 'Jevnt' &&
            dekke === 'Fast' &&
            (plankeAvstand <= 1 || plankeAvstand == undefined)
          : true,
    },
    partlyAccessible: {
      stigning: stigning <= 4.9,
      tverrfall: tverrfall <= 1.9,
      bredde: bredde >= 140,
      moteplass:
        moteplass === 'Ja' &&
        antallMoteplassTilstrekkelig === 'Nei' &&
        bredde >= 120 &&
        bredde <= 180,
    },
    notAccessible: {
      moteplass:
        moteplass === 'Ja' &&
        antallMoteplassTilstrekkelig === 'Nei' &&
        bredde < 120,
      stigning: stigning > 4.9,
      tverrfall: tverrfall > 4.9,
      dekkeTilstand: dekketilstand === 'Ujevnt',
      dekke: dekke === 'Løst',
      plankeAvstand: plankeAvstand > 1,
      bredde: bredde < 140,
      sperreBom: sperrebom === 'Ja' && sperreBomTilgjengelig === 'Nei',
    },
  };
  return props;
};

export const friluftTurveiRullestolEl = (
  bredde: number,
  antallMoteplassTilstrekkelig: string,
  stigning: number,
  tverrfall: number,
  dekketilstand: string,
  dekke: string,
  plankeAvstand: number,
  sperrebom: string,
  sperreBomTilgjengelig: string,
  moteplass: string,
): object => {
  const props = {
    accessible: {
      eval1:
        moteplass === 'Ja' && antallMoteplassTilstrekkelig === 'Ja'
          ? ((sperrebom === 'Ja' && sperreBomTilgjengelig === 'Ja') ||
              sperrebom === 'Nei') &&
            bredde >= 120 &&
            tverrfall <= 2.9 &&
            stigning < 10 &&
            dekketilstand === 'Jevnt' &&
            dekke === 'Fast' &&
            (plankeAvstand <= 1 || plankeAvstand == undefined)
          : true,
      eval2:
        (moteplass === 'Ja' && antallMoteplassTilstrekkelig === 'Nei') ||
        moteplass === 'Nei' ||
        moteplass == undefined
          ? ((sperrebom === 'Ja' && sperreBomTilgjengelig === 'Ja') ||
              sperrebom === 'Nei' ||
              sperrebom == undefined) &&
            bredde >= 180 &&
            tverrfall <= 2.9 &&
            stigning < 10 &&
            dekketilstand === 'Jevnt' &&
            dekke === 'Fast' &&
            (plankeAvstand <= 1 || plankeAvstand == undefined)
          : true,
    },
    partlyAccessible: {
      tverrfall: tverrfall <= 4.9,
      bredde: bredde >= 130,
      moteplass:
        moteplass === 'Ja' &&
        antallMoteplassTilstrekkelig === 'Nei' &&
        bredde >= 120 &&
        bredde <= 180,
    },
    notAccessible: {
      moteplass:
        moteplass === 'Ja' &&
        antallMoteplassTilstrekkelig === 'Nei' &&
        bredde < 120,
      stigning: stigning > 10,
      tverrfall: tverrfall > 4.9,
      dekkeTilstand: dekketilstand === 'Ujevnt',
      dekke: dekke === 'Løst',
      plankeAvstand: plankeAvstand > 1,
      sperreBom: sperrebom === 'Ja' && sperreBomTilgjengelig === 'Nei',
    },
  };
  return props;
};

export const friluftSitteGruppeHvilebenkRullestol = (
  atkomstTilgjengelig: string,
  dekketilstand: string,
  dekke: string,
  helning: number,
  benkHoyde: number,
  bordFriHoyde: number,
  bordUtstikk: number,
): object => {
  const props = {
    accessible: {
      atkomstTilgjengelig: atkomstTilgjengelig === 'Ja',
      dekketilstand: dekketilstand === 'Jevnt',
      dekke: dekke === 'Fast',
      helning: helning <= 2.9,
      benkHoyde: benkHoyde >= 45 && benkHoyde <= 50,
      bordFriHoyde: bordFriHoyde >= 67 && bordFriHoyde <= 75,
      bordUtstikk: bordUtstikk >= 50,
    },
    partlyAccessible: {
      helning: helning > 2.9 && helning <= 4.9,
      benkHoyde: benkHoyde < 45 || benkHoyde > 50,
      bordFriHoyde: bordFriHoyde < 67 || bordFriHoyde > 75,
      bordUtstikk: bordUtstikk < 50,
    },
    notAccessible: {
      atkomstTilgjengelig: atkomstTilgjengelig === 'Nei',
      dekketilstand: dekketilstand === 'Ujevnt',
      dekke: dekke === 'Løst',
      helning: helning > 4.9,
    },
  };
  return props;
};

export const friluftFiskeplassRullestol = (
  rampe: string,
  rampeTilgjengelig: string,
  diameter: number,
  plankeAvstand: number,
  dekkeMateriale: string,
  stoppkantHoyde: number,
  stoppkant: string,
  dekkeTilstand: string,
  dekkeFasthet: string,
): object => {
  const props = {
    accessible: {
      rampe:
        (rampe === 'Ja' && rampeTilgjengelig === 'Tilgjengelig') ||
        rampe === 'Nei',
      diameter: diameter >= 150,
      plankeavstand: dekkeMateriale === 'Tre' ? plankeAvstand <= 1 : true,
      dekkeTilstand: dekkeTilstand === 'Jevnt',
      dekkeFasthet: dekkeFasthet === 'Fast',
      stoppkantHoyde: stoppkantHoyde >= 10,
    },
    partlyAccessible: {
      rampe: rampe === 'Ja' && rampeTilgjengelig === 'Delvis tilgjengelig',
    },
    notAccessible: {
      rampe: rampe === 'Ja' && rampeTilgjengelig === 'Ikke tilgjengelig',
      diameter: diameter < 150,
      plankeavstand: dekkeMateriale === 'Tre' ? plankeAvstand > 1 : false,
      dekkeTilstand: dekkeTilstand === 'Ujevnt',
      dekkeFasthet: dekkeFasthet === 'Løst',
      stoppkantHoyde: stoppkantHoyde < 10,
      stoppkant: stoppkant === 'Nei',
    },
  };
  return props;
};

export const friluftFiskeplassRullestolEl = (
  rampe: string,
  rampeStigning: number,
  rampeTerskel: number,
  rampeBredde: number,
  diameter: number,
  plankeAvstand: number,
  stoppkantHoyde: number,
  stoppkant: string,
  dekkeTilstand: string,
  dekkeFasthet: string,
): object => {
  const props = {
    accessible: {
      rampe1:
        rampe === 'Ja'
          ? rampeStigning <= 10 &&
            rampeTerskel <= 2.5 &&
            rampeBredde >= 90 &&
            diameter >= 150 &&
            (plankeAvstand <= 1 || plankeAvstand == null) &&
            stoppkantHoyde >= 10 &&
            dekkeFasthet === 'Fast' &&
            dekkeTilstand === 'Jevnt'
          : true,
      rampe2:
        rampe === 'Nei'
          ? diameter >= 150 &&
            (plankeAvstand <= 1 || plankeAvstand == null) &&
            stoppkantHoyde >= 10 &&
            dekkeFasthet === 'Fast' &&
            dekkeTilstand === 'Jevnt'
          : true,
    },
    partlyAccessible: {
      rampe: rampe === 'Ja' && rampeTerskel >= 2.6 && rampeTerskel <= 10,
    },
    notAccessible: {
      diameter: diameter < 150,
      plankeavstand: plankeAvstand > 1,
      dekkeFasthet: dekkeFasthet === 'Løst',
      dekkeTilstand: dekkeTilstand === 'Ujevnt',
      stoppkanthoyde: stoppkantHoyde < 10,
      stoppkant: stoppkant === 'Nei',
      rampe:
        rampe === 'Ja' &&
        (rampeStigning > 10 || rampeTerskel > 10 || rampeBredde < 90),
    },
  };
  return props;
};

export const friluftGapahukHytteRullestol = (
  rampe: string,
  rampeTilgjengelig: string,
  breddeinngang: number,
  diameter: number,
  dekke: string,
  dekketilstand: string,
  terskelHoyde: number,
): object => {
  const props = {
    accessible: {
      rampe1:
        rampe === 'Ja'
          ? rampeTilgjengelig === 'Tilgjengelig' &&
            breddeinngang >= 86 &&
            diameter >= 150 &&
            dekke === 'Fast' &&
            dekketilstand === 'Jevnt' &&
            terskelHoyde <= 2.5
          : true,
      rampe2:
        rampe === 'Nei'
          ? breddeinngang >= 86 &&
            diameter >= 150 &&
            dekke === 'Fast' &&
            dekketilstand === 'Jevnt' &&
            terskelHoyde <= 2.5
          : true,
    },
    partlyAccessible: {
      rampe: rampe === 'Ja' && rampeTilgjengelig === 'Delvis tilgjengelig',
    },
    notAccessible: {
      rampe: rampe === 'Ja' && rampeTilgjengelig === 'Ikke tilgjengelig',
      breddeinngang: breddeinngang < 86,
      diameter: diameter < 150,
      dekke: dekke === 'Løst',
      dekketilstand: dekketilstand === 'Ujevnt',
      terskel: terskelHoyde > 2.5,
    },
  };
  return props;
};

export const friluftGapahukHytteRullestolEl = (
  rampe: string,
  rampeStigning: number,
  rampeBredde: number,
  rampeTerskel: number,
  breddeinngang: number,
  diameter: number,
  dekke: string,
  dekketilstand: string,
  terskelHoyde: number,
): object => {
  const props = {
    accessible: {
      rampe1:
        rampe === 'Ja'
          ? rampeStigning <= 10 &&
            rampeTerskel <= 2.5 &&
            rampeBredde >= 90 &&
            breddeinngang >= 86 &&
            diameter >= 150 &&
            dekke === 'Fast' &&
            dekketilstand === 'Jevnt' &&
            terskelHoyde <= 2.5
          : true,
      rampe2:
        rampe === 'Nei'
          ? breddeinngang >= 86 &&
            diameter >= 150 &&
            dekke === 'Fast' &&
            dekketilstand === 'Jevnt' &&
            terskelHoyde <= 2.5
          : true,
    },
    partlyAccessible: {
      rampeTerskel: rampe === 'Ja' && rampeTerskel >= 2.6 && rampeTerskel <= 10,
      terskel: terskelHoyde >= 2.6 && terskelHoyde <= 10,
    },
    notAccessible: {
      breddeinngang: breddeinngang < 86,
      diameter: diameter < 150,
      dekke: dekke === 'Løst',
      dekketilstand: dekketilstand === 'Ujevnt',
      terskel: terskelHoyde > 10,
      rampe:
        rampe === 'Ja' &&
        (rampeStigning > 10 || rampeTerskel > 10 || rampeBredde < 90),
    },
  };
  return props;
};

export const friluftGrillBaal = (
  helning: number,
  dekke: string,
  dekketilstand: string,
): object => {
  const props = {
    accessible: {
      helning: helning <= 2.9,
      dekketilstand: dekketilstand === 'Jevnt',
      dekke: dekke === 'Fast',
    },
    partlyAccessible: {
      helning: helning <= 4.9,
    },
    notAccessible: {
      helning: helning > 4.9,
      dekketilstand: dekketilstand === 'Ujevnt',
      dekke: dekke === 'Løst',
    },
  };
  return props;
};

export const tettstedParkeringsOmraadeRullestol = (
  kapasitetBiler: number,
  antallUU: number,
  dekke: string,
  dekkeTilstand: string,
): object => {
  const props = {
    accessible: {
      antallUU: (100 * antallUU) / kapasitetBiler >= 5,
      dekke: dekke === 'Fast',
      dekkeTilstand: dekkeTilstand == 'Jevnt',
    },
    partlyAccessible: {
      antallUU: antallUU >= 1 && (100 * antallUU) / kapasitetBiler < 5,
    },
    notAccessible: {
      antallUU: antallUU === 0,
      dekke: dekke === 'Løst',
      dekkeTilstand: dekkeTilstand === 'Ujevnt',
    },
  };
  return props;
};

export const tettstedParkeringsOmraadeRullestolEl = (
  kapasitetBiler: number,
  antallUU: number,
  dekke: string,
  dekkeTilstand: string,
): object => {
  const props = {
    accessible: {
      antallUU: (100 * antallUU) / kapasitetBiler >= 5,
      dekke: dekke === 'Fast',
      dekkeTilstand: dekkeTilstand === 'Jevnt',
    },
    partlyAccessible: {
      antallUU: antallUU >= 1 && (100 * antallUU) / kapasitetBiler < 5,
    },
    notAccessible: {
      antallUU: antallUU === 0,
      dekke: dekke === 'Løst',
      dekkeTilstand: dekkeTilstand === 'Ujevnt',
    },
  };
  return props;
};

export const tettstedHcParkeringsplassRullestol = (
  bredde: number,
  lengde: number,
  skiltet: string,
  merket: string,
  avgift: string,
  tilgjengeligAutomat: string,
  brukbartBetjeningsareal: number,
): object => {
  const props = {
    accessible: {
      bredde:
        bredde +
          (brukbartBetjeningsareal != undefined
            ? brukbartBetjeningsareal
            : 0) >=
        450,
      lengde: lengde >= 600,
      skiltet: skiltet === 'Ja',
      merket: merket === 'Ja',
      tilgjengeligAutomat:
        avgift === 'Ja' ? tilgjengeligAutomat === 'Ja' : true,
    },
    partlyAccessible: {
      bredde:
        bredde +
          (brukbartBetjeningsareal != undefined
            ? brukbartBetjeningsareal
            : 0) >=
          380 &&
        bredde +
          (brukbartBetjeningsareal != undefined
            ? brukbartBetjeningsareal
            : 0) <=
          449,
      lengde: lengde >= 500 && lengde <= 599,
    },
    notAccessible: {
      bredde:
        bredde +
          (brukbartBetjeningsareal != undefined ? brukbartBetjeningsareal : 0) <
        380,
      lengde: lengde < 500,
      skiltet: skiltet === 'Nei',
      merket: merket === 'Nei',
      tilgjengeligAutomat:
        avgift === 'Ja' ? tilgjengeligAutomat === 'Nei' : false,
    },
  };
  return props;
};

export const tettstedHcParkeringsplassGatelangsRullestol = (
  bredde: number,
  lengde: number,
  skiltet: string,
  merket: string,
  avgift: string,
  tilgjengeligAutomat: string,
  brukbartBetjeningsareal: number,
): object => {
  const props = {
    accessible: {
      bredde:
        bredde +
          (brukbartBetjeningsareal != undefined
            ? brukbartBetjeningsareal
            : 0) >=
        450,
      lengde: lengde >= 800,
      skiltet: skiltet === 'Ja',
      merket: merket === 'Ja',
      tilgjengeligAutomat:
        avgift === 'Ja' ? tilgjengeligAutomat === 'Ja' : true,
    },
    partlyAccessible: {
      bredde:
        bredde +
          (brukbartBetjeningsareal != undefined
            ? brukbartBetjeningsareal
            : 0) >=
          380 &&
        bredde +
          (brukbartBetjeningsareal != undefined
            ? brukbartBetjeningsareal
            : 0) <=
          449,
      lengde: lengde >= 750 && lengde <= 799,
    },
    notAccessible: {
      bredde:
        bredde +
          (brukbartBetjeningsareal != undefined ? brukbartBetjeningsareal : 0) <
        380,
      lengde: lengde < 750,
      skiltet: skiltet === 'Nei',
      merket: merket === 'Nei',
      tilgjengeligAutomat:
        avgift === 'Ja' ? tilgjengeligAutomat === 'Nei' : false,
    },
  };
  return props;
};

export const tettstedVeiRullestol = (
  trapp: string,
  bredde: number,
  stigning: number,
  tverrfall: number,
  dekketilstand: string,
  dekkeFasthet: string,
  dekkeMateriale: string,
  plankeAvstand: number,
  gateType: string,
  nedsenk1: number,
  nedsenk2: number,
) => {
  const props = {
    accessible: {
      gateType1:
        gateType === 'Gangfelt'
          ? bredde >= 180 &&
            stigning <= 3.8 &&
            tverrfall <= 1.2 &&
            dekketilstand === 'Jevnt' &&
            nedsenk1 <= 2.5 &&
            nedsenk2 <= 2.5
          : true,
      gatetype2:
        gateType !== 'Gangfelt'
          ? trapp === 'Nei' &&
            bredde >= 180 &&
            stigning <= 3.8 &&
            tverrfall <= 1.2 &&
            dekketilstand === 'Jevnt' &&
            (plankeAvstand <= 1 || plankeAvstand == undefined)
          : true,
    },
    partlyAccessible: {
      bredde: bredde >= 140 && bredde < 180,
      stigning: stigning >= 3.9 && stigning <= 4.9,
      tverrfall: tverrfall >= 1.3 && tverrfall <= 1.9,
    },
    notAccessible: {
      bredde: bredde < 140,
      stigning: stigning > 4.9,
      tverrfall: tverrfall > 1.9,
      dekketilstand: dekketilstand === 'Ujevnt',
      dekkeFasthet: dekkeFasthet === 'Løst',
      plankeAvstand: dekkeMateriale === 'Tre' ? plankeAvstand > 1 : false,
      gateType: gateType === 'Gangfelt' && (nedsenk1 > 2.5 || nedsenk2 > 2.5),
      trapp: trapp === 'Ja',
    },
  };
  return props;
};

export const tettstedVeiRullestolEl = (
  trapp: string,
  bredde: number,
  stigning: number,
  tverrfall: number,
  dekketilstand: string,
  dekkeFasthet: string,
  dekkeMateriale: string,
  plankeAvstand: number,
  gateType: string,
  nedsenk1: number,
  nedsenk2: number,
) => {
  const props = {
    accessible: {
      gateType1:
        gateType === 'Gangfelt'
          ? bredde >= 180 &&
            stigning <= 10 &&
            tverrfall <= 1.9 &&
            dekketilstand === 'Jevnt' &&
            nedsenk1 <= 2.5 &&
            nedsenk2 <= 2.5
          : true,
      gatetype2:
        gateType !== 'Gangfelt'
          ? trapp === 'Nei' &&
            bredde >= 180 &&
            stigning <= 10 &&
            tverrfall <= 1.9 &&
            dekketilstand === 'Jevnt' &&
            (plankeAvstand <= 1 || plankeAvstand == undefined)
          : true,
    },
    partlyAccessible: {
      bredde: bredde >= 140 && bredde <= 179,
      tverrfall: tverrfall >= 2 && tverrfall <= 3,
      gateType: gateType === 'Gangfelt' && (nedsenk1 <= 10 || nedsenk2 <= 10),
    },
    notAccessible: {
      bredde: bredde < 140,
      stigning: stigning > 10,
      tverrfall: tverrfall > 3,
      dekketilstand: dekketilstand === 'Ujevnt',
      dekkeFasthet: dekkeFasthet === 'Løst',
      plankeAvstand: dekkeMateriale === 'Tre' ? plankeAvstand > 1 : false,
      gateType: gateType === 'Gangfelt' && (nedsenk1 > 10 || nedsenk2 > 10),
      trapp: trapp === 'Ja',
    },
  };
  return props;
};

export const tettstedInngangByggRullestol = (
  rampe: string,
  rampeTilgjengelig: string,
  rampeBredde: number,
  rampeStigning: number,
  rampeTerskel: number,
  avstandHC: number,
  avstandvanligparkering: number,
  horisontaltFelt: number,
  dorapner: string,
  inngangBredde: number,
  terskelHoyde: number,
  atkomstveiStigning: number,
  manoverknapphoyde: number,
) => {
  const props = {
    accessible: {
      rampe: rampe === 'Ja' ? rampeTilgjengelig === 'Tilgjengelig' : true,
      avstandHC:
        (avstandHC <= 50 && avstandHC <= avstandvanligparkering) ||
        (avstandvanligparkering == undefined && avstandHC <= 50),
      horisontaltFelt: horisontaltFelt >= 150,
      dorapner:
        dorapner === 'Automatisk' ||
        (dorapner === 'Halvautomatisk' &&
          manoverknapphoyde >= 80 &&
          manoverknapphoyde <= 120),
      inngangBredde: inngangBredde >= 86,
      terskelHoyde: terskelHoyde <= 2.5,
      atkomstveiStigning: atkomstveiStigning <= 4.9,
    },
    partlyAccessible: {
      avstandHC:
        avstandHC >= 50 || (avstandHC ?? 0) > (avstandvanligparkering ?? 0),
      dorapner: dorapner === 'Manuell',
      dorapner1: dorapner === 'Halvautomatisk' && manoverknapphoyde <= 130,
      atkomstveiStigning:
        atkomstveiStigning >= 4.9 && atkomstveiStigning <= 5.7,
      rampe: rampe === 'Ja' && rampeTilgjengelig === 'Delvis tilgjengelig',
      rampeStigning: rampeStigning > 3.8 && rampeStigning <= 4.9,
    },
    notAccessible: {
      horisontaltFelt: horisontaltFelt < 150,
      manoverknapphoyde:
        dorapner === 'Halvautomatisk' && manoverknapphoyde > 130,
      inngangBredde: inngangBredde < 86,
      terskelHoyde: terskelHoyde > 2.5,
      atkomstveiStigning: atkomstveiStigning > 5.7,
      rampe:
        (rampe === 'Ja' && rampeTilgjengelig === 'Ikke tilgjengelig') ||
        rampeBredde < 90 ||
        rampeStigning > 10 ||
        rampeTerskel > 10,
    },
  };
  return props;
};

export const tettstedInngangByggRullestolEl = (
  horisontaltFelt: number,
  dorapner: string,
  dorapnerHoyde: number,
  inngangBredde: number,
  terskelHoyde: number,
  atkomstveiStigning: number,
  rampe: string,
  rampeBredde: number,
  rampeStigning: number,
  rampeTerskel: number,
) => {
  const props = {
    accessible: {
      rampe:
        rampe === 'Ja'
          ? rampeBredde >= 90 && rampeStigning <= 10 && rampeTerskel <= 2.5
          : true,
      horisontaltFelt: horisontaltFelt >= 150,
      dorapner:
        dorapner === 'Automatisk' ||
        (dorapner === 'Halvautomatisk' &&
          dorapnerHoyde >= 80 &&
          dorapnerHoyde <= 120),
      inngangBredde: inngangBredde >= 86,
      terskelHoyde: terskelHoyde <= 2.5,
      atkomstveiStigning: atkomstveiStigning < 10,
    },
    partlyAccessible: {
      dorapner: dorapner === 'Manuell',
      dorapner1: dorapner === 'Halvautomatisk' && dorapnerHoyde <= 130,
      dorapnerHoyde:
        dorapnerHoyde < 80 || (dorapnerHoyde >= 121 && dorapnerHoyde <= 130),
      atkomstveiStigning:
        atkomstveiStigning >= 4.9 && atkomstveiStigning <= 5.7,
      terskelHoyde: terskelHoyde >= 2.6 && terskelHoyde <= 10,
    },
    notAccessible: {
      horisontaltFelt: horisontaltFelt < 150,
      dorapnerHoyde: dorapner === 'Halvautomatisk' && dorapnerHoyde > 130,
      inngangBredde: inngangBredde < 86,
      terskelHoyde: terskelHoyde > 10,
      atkomstveiStigning: atkomstveiStigning >= 10,
      rampe:
        rampe === 'Ja' &&
        (rampeBredde < 90 || rampeStigning > 10 || rampeTerskel > 10),
    },
  };
  return props;
};

export const friluftBaderampeRullestol = (
  rampe: string,
  rampeTilgjengelig: string,
  rampeStigning: number,
  rampeBredde: number,
  rampeTerskel: number,
  handlist: string,
) => {
  const props = {
    accessible: {
      rampe: rampe == 'Ja' ? rampeTilgjengelig === 'Tilgjengelig' : true,
      rampeStigning: rampeStigning <= 3.8,
      rampeBredde: rampeBredde >= 90,
      rampeTerskel: rampeTerskel <= 2.5,
      handlist: handlist === 'Begge sider',
    },
    partlyAccessible: {
      rampe:
        (rampe === 'Ja' && rampeTilgjengelig === 'Delvis tilgjengelig') ||
        (rampeStigning > 3.8 && rampeStigning <= 4.9) ||
        handlist === 'Venstre side' ||
        handlist === 'Høyre side',
    },
    notAccessible: {
      rampeStigning: rampeStigning > 4.9,
      rampeBredde: rampeBredde < 90,
      rampeTerskel: rampeTerskel > 2.5,
      handlist: handlist === 'Mangler',
      rampe: rampe === 'Ja' ? rampeTilgjengelig === 'Ikke tilgjengelig' : false,
    },
  };
  return props;
};

export const friluftToalettRullestol = (
  byggtype: string,
  wcTilgjengelig: string,
  rampeTilgjengelig: string,
  rampeStigning: number,
  rampeBredde: number,
  omkledningTilgjengelig: string,
  rampe: string,
  rampeTerskel: number,
  horisontalFelt: number,
  breddeInngang: number,
  terskelHoyde: number,
  diameter: number,
) => {
  const props = {
    accessible: {
      value: false,
    },
    accessibleToilet: {
      // this object is named different since it has to be evaluated differently in the assessObject function.
      // On of the lines must be true for this to be accessible
      eval1:
        rampe === 'Nei' &&
        byggtype === 'Toalett/omkledning' &&
        breddeInngang >= 86 &&
        terskelHoyde <= 2.5 &&
        horisontalFelt >= 150 &&
        diameter >= 150 &&
        omkledningTilgjengelig === 'Tilgjengelig' &&
        wcTilgjengelig === 'Tilgjengelig',
      eval2:
        rampe === 'Nei' &&
        byggtype === 'Toalett' &&
        breddeInngang >= 86 &&
        terskelHoyde <= 2.5 &&
        horisontalFelt >= 150 &&
        diameter >= 150 &&
        wcTilgjengelig === 'Tilgjengelig',
      eval3:
        rampe === 'Nei' &&
        byggtype === 'Omkledning' &&
        breddeInngang >= 86 &&
        terskelHoyde <= 2.5 &&
        horisontalFelt >= 150 &&
        diameter >= 150 &&
        omkledningTilgjengelig === 'Tilgjengelig',
      eval4:
        rampe === 'Ja' &&
        rampeTilgjengelig === 'Tilgjengelig' &&
        byggtype === 'Toalett/omkledning' &&
        breddeInngang >= 86 &&
        terskelHoyde <= 2.5 &&
        horisontalFelt >= 150 &&
        diameter >= 150 &&
        omkledningTilgjengelig === 'Tilgjengelig' &&
        wcTilgjengelig === 'Tilgjengelig',
      eval5:
        rampe === 'Ja' &&
        rampeTilgjengelig === 'Tilgjengelig' &&
        byggtype === 'Toalett' &&
        breddeInngang >= 86 &&
        terskelHoyde <= 2.5 &&
        horisontalFelt >= 150 &&
        diameter >= 150 &&
        wcTilgjengelig === 'Tilgjengelig',
      eval6:
        rampe === 'Ja' &&
        rampeTilgjengelig === 'Tilgjengelig' &&
        byggtype === 'Omkledning' &&
        breddeInngang >= 86 &&
        terskelHoyde <= 2.5 &&
        horisontalFelt >= 150 &&
        diameter >= 150 &&
        omkledningTilgjengelig === 'Tilgjengelig',
    },
    partlyAccessible: {
      terskelHoyde: terskelHoyde >= 2.6 && terskelHoyde <= 10,
      byggtype1:
        byggtype === 'Toalett/omkledning' &&
        (wcTilgjengelig === 'Delvis tilgjengelig' ||
          omkledningTilgjengelig === 'Delvis tilgjengelig'),
      byggtype2:
        byggtype === 'Toalett' && wcTilgjengelig === 'Delvis tilgjengelig',
      byggtype3:
        byggtype === 'Omkledning' &&
        omkledningTilgjengelig === 'Delvis tilgjengelig',
      rampe: rampe === 'Ja' && rampeTilgjengelig === 'Delvis tilgjengelig',
    },
    notAccessible: {
      rampe: rampe === 'Ja' && rampeTilgjengelig === 'Ikke tilgjengelig',
      //rampe: rampe === 'Ja' && (rampeStigning >= 10 && rampeTerskel >= 10 && rampeBredde <= 90),
      breddeInngang: breddeInngang < 86,
      terskelHoyde: terskelHoyde > 2.5,
      horisontalFelt: horisontalFelt < 150,
      diameter: diameter < 150,
      wcTilgjengelig: wcTilgjengelig === 'Ikke tilgjengelig',
      omkledningTilgjengelig: omkledningTilgjengelig === 'Ikke tilgjengelig',
      rampeBredde: rampeBredde < 90,
    },
  };
  return props;
};

export const friluftToalettRullestolEl = (
  byggtype: string,
  wcTilgjengelig: string,
  rampeStigning: number,
  rampeBredde: number,
  omkledningTilgjengelig: string,
  rampe: string,
  rampeTerskel: number,
  horisontalFelt: number,
  breddeInngang: number,
  terskelHoyde: number,
  diameter: number,
) => {
  const props = {
    accessible: {
      value: false,
    },
    accessibleToilet: {
      //this object is named different since it has to be evaluated differently in the assessObject function. On of the lines must be true for this to be accessible
      eval1:
        rampe === 'Nei' &&
        byggtype === 'Toalett/omkledning' &&
        breddeInngang >= 86 &&
        terskelHoyde <= 2.5 &&
        horisontalFelt >= 150 &&
        diameter >= 150 &&
        omkledningTilgjengelig === 'Tilgjengelig' &&
        wcTilgjengelig === 'Tilgjengelig',
      eval2:
        rampe === 'Nei' &&
        byggtype === 'Toalett' &&
        breddeInngang >= 86 &&
        terskelHoyde <= 2.5 &&
        horisontalFelt >= 150 &&
        diameter >= 150 &&
        wcTilgjengelig === 'Tilgjengelig',
      eval3:
        rampe === 'Nei' &&
        byggtype === 'Omkledning' &&
        breddeInngang >= 86 &&
        terskelHoyde <= 2.5 &&
        horisontalFelt >= 150 &&
        diameter >= 150 &&
        omkledningTilgjengelig === 'Tilgjengelig',
      eval4:
        rampe === 'Ja' &&
        rampeStigning <= 10 &&
        rampeTerskel <= 2.5 &&
        rampeBredde >= 90 &&
        byggtype === 'Toalett/omkledning' &&
        breddeInngang >= 86 &&
        terskelHoyde <= 2.5 &&
        horisontalFelt >= 150 &&
        diameter >= 150 &&
        omkledningTilgjengelig === 'Tilgjengelig' &&
        wcTilgjengelig === 'Tilgjengelig',
      eval5:
        rampe === 'Ja' &&
        rampeStigning <= 10 &&
        rampeTerskel <= 2.5 &&
        rampeBredde >= 90 &&
        byggtype === 'Toalett' &&
        breddeInngang >= 86 &&
        terskelHoyde <= 2.5 &&
        horisontalFelt >= 150 &&
        diameter >= 150 &&
        wcTilgjengelig === 'Tilgjengelig',
      eval6:
        rampe === 'Ja' &&
        rampeStigning <= 10 &&
        rampeTerskel <= 2.5 &&
        rampeBredde >= 90 &&
        byggtype === 'Omkledning' &&
        breddeInngang >= 86 &&
        terskelHoyde <= 2.5 &&
        horisontalFelt >= 150 &&
        diameter >= 150 &&
        omkledningTilgjengelig === 'Tilgjengelig',
    },
    partlyAccessible: {
      terskelHoyde: terskelHoyde >= 2.6 && terskelHoyde <= 10,
      byggtype1:
        byggtype === 'Toalett/omkledning' &&
        (wcTilgjengelig === 'Delvis tilgjengelig' ||
          omkledningTilgjengelig === 'Delvis tilgjengelig'),
      byggtype2:
        byggtype === 'Toalett' && wcTilgjengelig === 'Delvis tilgjengelig',
      byggtype3:
        byggtype === 'Omkledning' &&
        omkledningTilgjengelig === 'Delvis tilgjengelig',
      rampe: rampe === 'Ja' && rampeTerskel >= 2.6 && rampeTerskel <= 10,
    },
    notAccessible: {
      rampe:
        rampe === 'Ja' &&
        (rampeStigning > 10 || rampeTerskel > 10 || rampeBredde < 90),
      breddeInngang: breddeInngang < 86,
      terskelHoyde: terskelHoyde > 10,
      horisontalFelt: horisontalFelt < 150,
      diameter: diameter < 150,
      wcTilgjengelig: wcTilgjengelig === 'Ikke tilgjengelig',
      omkledningTilgjengelig: omkledningTilgjengelig === 'Ikke tilgjengelig',
    },
  };
  return props;
};
