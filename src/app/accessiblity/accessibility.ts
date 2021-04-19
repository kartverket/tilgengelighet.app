import * as accessibilityAssessments from './accessibilityAssessment';

export enum accessibilityType {
  Accessible,
  PartlyAccessible,
  NotAccessible,
  NotAssessed,
}

export default class Accessibility {
  static assessObject = (o: Object) => {
    let objectAccessibility = accessibilityType.NotAssessed;
    let isAccessible = true;
    let isAccessibleToilet = false;
    let isPartlyAccessible = false;
    let isNotAccessible = false;

    // Iterate each accessibility type
    Object.keys(o).forEach(key => {
      let groups = o[key];

      // Iterate each assessment
      for (const [entryKey, entryValue] of Object.entries(groups)) {
        if (key === 'accessible' && !entryValue) {
          isAccessible = false;
          break;
        }
        if (key === 'accessibleToilet' && entryValue) {
          // friluft toalett has to be evaluated differently
          isAccessibleToilet = true;
          break;
        }
        if (key === 'partlyAccessible' && entryValue) {
          isPartlyAccessible = true;
          break;
        }
        if (key === 'notAccessible' && entryValue) {
          isNotAccessible = true;
          break;
        }
      }
    });

    if (isAccessibleToilet) isAccessible = true;
    console.log('Accessible: ' + isAccessible);
    console.log('Accessible (Toilet): ' + isAccessibleToilet);
    console.log('Partly accessible: ' + isPartlyAccessible);
    console.log('Not accessible: ' + isNotAccessible);

    if (isNotAccessible) objectAccessibility = accessibilityType.NotAccessible;
    if (isPartlyAccessible && !isNotAccessible)
      objectAccessibility = accessibilityType.PartlyAccessible;
    if (isAccessible && !isNotAccessible)
      objectAccessibility = accessibilityType.Accessible;

    return objectAccessibility;
  };

  static assess = () => {
    console.clear();
    //console.log(Accessibility.assessObject(accessibilityAssessments.friluftpParkeringsOmraadeRullestol(100,10,"Jevnt", "Løst")));
    //console.log(Accessibility.assessObject(accessibilityAssessments.tettstedVeiRullestol(300, 2, 0, 1.5, "Jevnt", "Fast", "Asfalt", 0, "Gangfelt", 3, 3)));
    //console.log(Accessibility.assessObject(accessibilityAssessments.tettstedInngangByggRullestol(20, 10, 150, "Halvautomatisk", 90, 2, 2, 70)));
    //console.log(Accessibility.assessObject(accessibilityAssessments.tettstedHcParkeringsplassRullestol(450, 600, "Ja", "Ja", "Nei", "Nei")));
    //console.log("Result: " + Accessibility.assessObject(accessibilityAssessments.friluftToalett("Toalett/omkledning", "Tilgjengelig", "Ja", 10, 10, "Tilgjengelig", "Nei", 0, 160, 90, 0, 200)));

    console.log(
      Accessibility.assessObject(
        accessibilityAssessments.tettstedHcParkeringsplassRullestol(
          400,
          700,
          'Ja',
          'Ja',
          'Ja',
          'Ja',
          60,
        ),
      ),
    );
  };
}
