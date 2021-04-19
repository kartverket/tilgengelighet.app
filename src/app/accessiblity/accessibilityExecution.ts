import {
  FeatureMember,
  getFeatureNodeValueWithDataType,
} from 'app/model/FeatureMember';
import Accessibility, { accessibilityType } from './accessibility';
import {
  friluftBaderampeRullestol,
  friluftFiskeplassRullestol,
  friluftFiskeplassRullestolEl,
  friluftGapahukHytteRullestol,
  friluftGapahukHytteRullestolEl,
  friluftGrillBaal,
  friluftHcParkeringsplassRullestol,
  friluftParkeringsOmraadeRullestol,
  friluftParkeringsOmraadeRullestolEl,
  friluftSitteGruppeHvilebenkRullestol,
  friluftToalettRullestol,
  friluftToalettRullestolEl,
  friluftTurveiRullestol,
  friluftTurveiRullestolEl,
  tettstedHcParkeringsplassGatelangsRullestol,
  tettstedHcParkeringsplassRullestol,
  tettstedInngangByggRullestol,
  tettstedInngangByggRullestolEl,
  tettstedParkeringsOmraadeRullestol,
  tettstedParkeringsOmraadeRullestolEl,
  tettstedVeiRullestol,
  tettstedVeiRullestolEl,
} from './accessibilityAssessment';

export const performAccessibilityAssessment = (
  featureMember: FeatureMember,
) => {
  const elChairNode = featureMember.nodes.find(
    n =>
      n.name.toLowerCase() == 'tilgjengvurderingelrull' ||
      n.name.toLowerCase() == 'tilgjengvurderingelrullestol',
  );
  const primitiveChairNode = featureMember.nodes.find(
    n => n.name.toLowerCase() == 'tilgjengvurderingrulleauto',
  );

  const sosiElement = featureMember.sosiElement;

  /// TODO: Add to features that contains rampNode
  const rampAccessiblityNode = featureMember.rampNode?.nodes.find(
    n => n.name.toLowerCase() == 'rampetilgjengelig',
  );

  const rampExistsNode = featureMember.rampNode?.nodes.find(
    n => n.name.toLowerCase() == 'rampe',
  );

  const rampNode = featureMember.rampNode;

  const getRampNodeValue = (nodeName: string) => {
    if (rampNode == undefined) {
      return undefined;
    } else if (
      rampExistsNode != undefined &&
      rampExistsNode.value?.toLowerCase() == 'nei'
    ) {
      if (nodeName == 'rampe') return 'Nei';
      else return undefined;
    } else {
      return getFeatureNodeValueWithDataType(
        rampNode.nodes.find(
          n => n.name.toLowerCase() == nodeName.toLowerCase(),
        )!,
        sosiElement,
      );
    }
  };

  switch (featureMember.type!) {
    case 'FriluftGapahuk': {
      if (primitiveChairNode != undefined) {
        primitiveChairNode.value = getAccessibilityValue(
          Accessibility.assessObject(
            friluftGapahukHytteRullestol(
              getRampNodeValue('rampe'),
              getRampNodeValue('rampetilgjengelig'),

              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'breddeinngang',
                )!,
                sosiElement,
              ),
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'diameter',
                )!,
                sosiElement,
              ),
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'dekkefasthet',
              )?.value,
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'dekketilstand',
              )?.value,

              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'terskelhøyde',
                )!,
                sosiElement,
              ),
            ),
          ),
        );
      }
      if (elChairNode != undefined) {
        elChairNode.value = getAccessibilityValue(
          Accessibility.assessObject(
            friluftGapahukHytteRullestolEl(
              getRampNodeValue('rampe'),
              getRampNodeValue('rampestigning'),
              getRampNodeValue('rampebredde'),
              getRampNodeValue('rampeterskel'),
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'breddeinngang',
                )!,
                sosiElement,
              ),
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'diameter',
                )!,
                sosiElement,
              ),
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'dekkefasthet',
              )?.value,
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'dekketilstand',
              )?.value,

              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'terskelhøyde',
                )!,
                sosiElement,
              ),
            ),
          ),
        );
      }

      break;
    }
    case 'FriluftParkeringsområde': {
      if (primitiveChairNode != undefined) {
        primitiveChairNode.value = getAccessibilityValue(
          Accessibility.assessObject(
            friluftParkeringsOmraadeRullestol(
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'kapasitetpersonbiler',
                )!,
                sosiElement,
              ),
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'antalluu',
                )!,
                sosiElement,
              ),
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'dekketilstand',
              )?.value,
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'dekkefasthet',
              )?.value,
            ),
          ),
        );
      }
      if (elChairNode != undefined) {
        elChairNode.value = getAccessibilityValue(
          Accessibility.assessObject(
            friluftParkeringsOmraadeRullestolEl(
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'kapasitetpersonbiler',
                )!,
                sosiElement,
              ),
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'antalluu',
                )!,
                sosiElement,
              ),
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'dekketilstand',
              )?.value,
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'dekkefasthet',
              )?.value,
            ),
          ),
        );
      }
      break;
    }
    case 'FriluftHCparkering': {
      if (primitiveChairNode != undefined) {
        primitiveChairNode.value = getAccessibilityValue(
          Accessibility.assessObject(
            friluftHcParkeringsplassRullestol(
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'bredde',
                )!,
                sosiElement,
              ),
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'lengde',
                )!,
                sosiElement,
              ),
              /// String datattype doesn't have to be proccessed
              featureMember.nodes.find(n => n.name.toLowerCase() == 'skiltet')
                ?.value,
              featureMember.nodes.find(n => n.name.toLowerCase() == 'merket')
                ?.value,
              featureMember.nodes.find(n => n.name.toLowerCase() == 'avgift')
                ?.value,
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'automathøyde',
                )!,
                sosiElement,
              ),
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'tilgjengeligautomat',
              )?.value,
            ),
          ),
        );
      }
      if (elChairNode != undefined) {
        elChairNode.value = getAccessibilityValue(
          Accessibility.assessObject(
            friluftHcParkeringsplassRullestol(
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'bredde',
                )!,
                sosiElement,
              ),
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'lengde',
                )!,
                sosiElement,
              ),
              /// String datattype doesn't have to be proccessed
              featureMember.nodes.find(n => n.name.toLowerCase() == 'skiltet')
                ?.value,
              featureMember.nodes.find(n => n.name.toLowerCase() == 'merket')
                ?.value,
              featureMember.nodes.find(n => n.name.toLowerCase() == 'avgift')
                ?.value,
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'automathøyde',
                )!,
                sosiElement,
              ),
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'tilgjengeligautomat',
              )?.value,
            ),
          ),
        );
      }
      break;
    }
    case 'FriluftTurvei': {
      const møteHvilePlassValue =
        featureMember.nodes
          .find(n => n.name.toLowerCase() == 'møtehvileplass')
          ?.value.toLowerCase() ?? undefined;

      let friHøydeValue;

      const friHøydeNode = featureMember.nodes.find(
        n => n.name.toLowerCase() == 'frihøyde',
      )!;

      if (friHøydeNode.value == '>225 cm') {
        friHøydeValue = 226;
      } else if (friHøydeNode.value == '<225 cm') {
        friHøydeValue = 224;
      }
      primitiveChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          friluftTurveiRullestol(
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(n => n.name.toLowerCase() == 'bredde')!,
              sosiElement,
            )!,

            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'antalltilstrekkelig',
            )?.value,

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'stigning',
              )!,
              sosiElement,
            ),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'tverrfall',
              )!,
              sosiElement,
            ),
            /// String datattype doesn't have to be proccessed
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekketilstand',
            )?.value,
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekkefasthet',
            )?.value,
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'plankeavstand',
              )!,
              sosiElement,
            ),
            featureMember.nodes.find(n => n.name.toLowerCase() == 'sperrebom')
              ?.value,
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'sperrebomtilgjengelig',
            )?.value,

            møteHvilePlassValue,
          ),
        ),
      );

      elChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          friluftTurveiRullestolEl(
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(n => n.name.toLowerCase() == 'bredde')!,
              sosiElement,
            )!,

            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'antalltilstrekkelig',
            )?.value,

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'stigning',
              )!,
              sosiElement,
            ),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'tverrfall',
              )!,
              sosiElement,
            ),
            /// String datattype doesn't have to be proccessed
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekketilstand',
            )?.value,
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekkefasthet',
            )?.value,
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'plankeavstand',
              )!,
              sosiElement,
            ),
            featureMember.nodes.find(n => n.name.toLowerCase() == 'sperrebom')
              ?.value,
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'sperrebomtilgjengelig',
            )?.value,

            møteHvilePlassValue,
          ),
        ),
      );
      break;
    }
    case 'FriluftToalett': {
      primitiveChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          friluftToalettRullestol(
            featureMember.nodes.find(n => n.name.toLowerCase() == 'byggtype')
              ?.value,
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'wctilgjengelig',
            )?.value,

            getRampNodeValue('rampetilgjengelig'),

            getRampNodeValue('rampestigning'),
            getRampNodeValue('rampebredde'),

            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'omkledningtilgjengelig',
            )?.value,

            getRampNodeValue('rampe'),
            getRampNodeValue('rampeterskel'),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'horisontalfelt',
              )!,
              sosiElement,
            )!,
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'breddeinngang',
              )!,
              sosiElement,
            ),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'terskelhøyde',
              )!,
              sosiElement,
            ) ?? 0,

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'diameter',
              )!,
              sosiElement,
            ),
          ),
        ),
      );

      elChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          friluftToalettRullestolEl(
            featureMember.nodes.find(n => n.name.toLowerCase() == 'byggtype')
              ?.value,
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'wctilgjengelig',
            )?.value,

            getRampNodeValue('rampestigning'),
            getRampNodeValue('rampebredde'),

            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'omkledningtilgjengelig',
            )?.value,

            getRampNodeValue('rampe'),
            getRampNodeValue('rampeterskel'),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'horisontalfelt',
              )!,
              sosiElement,
            )!,
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'breddeinngang',
              )!,
              sosiElement,
            ),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'terskelhøyde',
              )!,
              sosiElement,
            ) ?? 0,

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'diameter',
              )!,
              sosiElement,
            ),
          ),
        ),
      );
      break;
    }
    case 'FriluftGrillBålplass': {
      primitiveChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          friluftGrillBaal(
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(n => n.name.toLowerCase() == 'helning')!,
              sosiElement,
            ),
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekkefasthet',
            )?.value,

            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekketilstand',
            )?.value,
          ),
        ),
      );
      break;
    }
    case 'Sittegruppe': {
      primitiveChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          friluftSitteGruppeHvilebenkRullestol(
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'adkomsttilgjengelig',
            )?.value,

            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekketilstand',
            )?.value,

            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekkefasthet',
            )?.value,

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(n => n.name.toLowerCase() == 'helning')!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'høydebenk',
              )!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'høydebord',
              )!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'utstikkbord',
              )!,
              sosiElement,
            ),
          ),
        ),
      );
      break;
    }
    case 'FriluftFiskeplassBrygge': {
      primitiveChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          friluftFiskeplassRullestol(
            getRampNodeValue('rampe'),
            getRampNodeValue('rampetilgjengelig'),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'diameter',
              )!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'plankeavstand',
              )!,
              sosiElement,
            ),
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekkemateriale',
            )?.value,
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'stoppkanthøyde',
              )!,
              sosiElement,
            ),
            featureMember.nodes.find(n => n.name.toLowerCase() == 'stoppkant')
              ?.value,
          ),
        ),
      );
      if (elChairNode != undefined)
        elChairNode!.value = getAccessibilityValue(
          Accessibility.assessObject(
            friluftFiskeplassRullestolEl(
              getRampNodeValue('rampe'),
              getRampNodeValue('rampestigning'),
              getRampNodeValue('rampeterskel'),
              getRampNodeValue('rampebredde'),

              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'diameter',
                )!,
                sosiElement,
              ),
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'plankeavstand',
                )!,
                sosiElement,
              ),

              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'stoppkanthøyde',
                )!,
                sosiElement,
              ),
              featureMember.nodes.find(n => n.name.toLowerCase() == 'stoppkant')
                ?.value,
            ),
          ),
        );
      break;
    }
    case 'TettstedParkeringsområde': {
      primitiveChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          tettstedParkeringsOmraadeRullestol(
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'kapasitetpersonbiler',
              )!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'antalluu',
              )!,
              sosiElement,
            ),
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekkefasthet',
            )?.value,
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekketilstand',
            )?.value,
          ),
        ),
      );

      if (elChairNode != undefined) {
        elChairNode!.value = getAccessibilityValue(
          Accessibility.assessObject(
            tettstedParkeringsOmraadeRullestolEl(
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'kapasitetpersonbiler',
                )!,
                sosiElement,
              ),
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'antalluu',
                )!,
                sosiElement,
              ),
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'dekkefasthet',
              )?.value,
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'dekketilstand',
              )?.value,
            ),
          ),
        );
      }

      break;
    }
    case 'TettstedHCparkering': {
      const isStreet =
        featureMember.nodes.find(
          n => n.name.toLowerCase() == 'gatelangsparkering',
        )?.value == 'Ja';

      if (isStreet == true) {
        if (primitiveChairNode != undefined) {
          primitiveChairNode!.value = getAccessibilityValue(
            Accessibility.assessObject(
              tettstedHcParkeringsplassGatelangsRullestol(
                getFeatureNodeValueWithDataType(
                  featureMember.nodes.find(
                    n => n.name.toLowerCase() == 'bredde',
                  )!,
                  sosiElement,
                ),
                getFeatureNodeValueWithDataType(
                  featureMember.nodes.find(
                    n => n.name.toLowerCase() == 'lengde',
                  )!,
                  sosiElement,
                ),
                featureMember.nodes.find(n => n.name.toLowerCase() == 'skiltet')
                  ?.value,
                featureMember.nodes.find(n => n.name.toLowerCase() == 'merket')
                  ?.value,
                featureMember.nodes.find(n => n.name.toLowerCase() == 'avgift')
                  ?.value,
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'tilgjengeligautomat',
                )?.value,
                getFeatureNodeValueWithDataType(
                  featureMember.nodes.find(
                    n => n.name.toLowerCase() == 'brukbartbetjeningsareal',
                  )!,
                  sosiElement,
                ),
              ),
            ),
          );
        }
        if (elChairNode != undefined) {
          elChairNode!.value = getAccessibilityValue(
            Accessibility.assessObject(
              tettstedHcParkeringsplassGatelangsRullestol(
                getFeatureNodeValueWithDataType(
                  featureMember.nodes.find(
                    n => n.name.toLowerCase() == 'bredde',
                  )!,
                  sosiElement,
                ),
                getFeatureNodeValueWithDataType(
                  featureMember.nodes.find(
                    n => n.name.toLowerCase() == 'lengde',
                  )!,
                  sosiElement,
                ),
                featureMember.nodes.find(n => n.name.toLowerCase() == 'skiltet')
                  ?.value,
                featureMember.nodes.find(n => n.name.toLowerCase() == 'merket')
                  ?.value,
                featureMember.nodes.find(n => n.name.toLowerCase() == 'avgift')
                  ?.value,
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'tilgjengeligautomat',
                )?.value,
                getFeatureNodeValueWithDataType(
                  featureMember.nodes.find(
                    n => n.name.toLowerCase() == 'brukbartbetjeningsareal',
                  )!,
                  sosiElement,
                ),
              ),
            ),
          );
        }
      } else {
        primitiveChairNode!.value = getAccessibilityValue(
          Accessibility.assessObject(
            tettstedHcParkeringsplassRullestol(
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'bredde',
                )!,
                sosiElement,
              ),
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'lengde',
                )!,
                sosiElement,
              ),
              featureMember.nodes.find(n => n.name.toLowerCase() == 'skiltet')
                ?.value,
              featureMember.nodes.find(n => n.name.toLowerCase() == 'merket')
                ?.value,
              featureMember.nodes.find(n => n.name.toLowerCase() == 'avgift')
                ?.value,
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'tilgjengeligautomat',
              )?.value,
              getFeatureNodeValueWithDataType(
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'brukbartbetjeningsareal',
                )!,
                sosiElement,
              ),
            ),
          ),
        );
        if (elChairNode != undefined) {
          elChairNode!.value = getAccessibilityValue(
            Accessibility.assessObject(
              tettstedHcParkeringsplassRullestol(
                getFeatureNodeValueWithDataType(
                  featureMember.nodes.find(
                    n => n.name.toLowerCase() == 'bredde',
                  )!,
                  sosiElement,
                ),
                getFeatureNodeValueWithDataType(
                  featureMember.nodes.find(
                    n => n.name.toLowerCase() == 'lengde',
                  )!,
                  sosiElement,
                ),
                featureMember.nodes.find(n => n.name.toLowerCase() == 'skiltet')
                  ?.value,
                featureMember.nodes.find(n => n.name.toLowerCase() == 'merket')
                  ?.value,
                featureMember.nodes.find(n => n.name.toLowerCase() == 'avgift')
                  ?.value,
                featureMember.nodes.find(
                  n => n.name.toLowerCase() == 'tilgjengeligautomat',
                )?.value,
                getFeatureNodeValueWithDataType(
                  featureMember.nodes.find(
                    n => n.name.toLowerCase() == 'brukbartbetjeningsareal',
                  )!,
                  sosiElement,
                ),
              ),
            ),
          );
        }
      }

      break;
    }
    case 'TettstedVei': {
      const møtePlassValue =
        featureMember.nodes
          .find(n => n.name.toLowerCase() == 'møtehvileplass')
          ?.value?.toLowerCase() ?? undefined;

      primitiveChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          tettstedVeiRullestol(
            featureMember.stairNode?.nodes.find(
              n => n.name.toLowerCase() == 'trapp',
            )?.value,
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(n => n.name.toLowerCase() == 'bredde')!,
              sosiElement,
            ),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'stigning',
              )!,
              sosiElement,
            ),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'tverrfall',
              )!,
              sosiElement,
            ),
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekketilstand',
            )?.value,
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekkefasthet',
            )?.value,
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekkemateriale',
            )?.value,
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'plankeavstand',
              )!,
              sosiElement,
            ),
            featureMember.nodes.find(n => n.name.toLowerCase() == 'gatetype')
              ?.value,

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'nedsenk1',
              )!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'nedsenk2',
              )!,
              sosiElement,
            ),
          ),
        ),
      );
      elChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          tettstedVeiRullestolEl(
            featureMember.stairNode?.nodes.find(
              n => n.name.toLowerCase() == 'trapp',
            )?.value,
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(n => n.name.toLowerCase() == 'bredde')!,
              sosiElement,
            ),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'stigning',
              )!,
              sosiElement,
            ),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'tverrfall',
              )!,
              sosiElement,
            ),
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekketilstand',
            )?.value,
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekkefasthet',
            )?.value,
            featureMember.nodes.find(
              n => n.name.toLowerCase() == 'dekkemateriale',
            )?.value,
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'plankeavstand',
              )!,
              sosiElement,
            ),
            featureMember.nodes.find(n => n.name.toLowerCase() == 'gatetype')
              ?.value,

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'nedsenk1',
              )!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'nedsenk2',
              )!,
              sosiElement,
            ),
          ),
        ),
      );
      break;
    }
    case 'TettstedInngangBygg': {
      primitiveChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          tettstedInngangByggRullestol(
            getRampNodeValue('rampe'),
            getRampNodeValue('rampetilgjengelig'),
            getRampNodeValue('rampebredde'),
            getRampNodeValue('rampestigning'),
            getRampNodeValue('rampeterskel'),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'avstandhc',
              )!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'avstandvanligparkering',
              )!,
              sosiElement,
            ),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'horisontalfelt',
              )!,
              sosiElement,
            ),
            featureMember.nodes.find(n => n.name.toLowerCase() == 'døråpner')
              ?.value,
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'breddeinngang',
              )!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'terskelhøyde',
              )!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'stigningadkomstvei',
              )!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'manøverknapphøyde',
              )!,
              sosiElement,
            ),
          ),
        ),
      );
      elChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          tettstedInngangByggRullestolEl(
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'horisontalfelt',
              )!,
              sosiElement,
            ),
            featureMember.nodes.find(n => n.name.toLowerCase() == 'døråpner')
              ?.value,
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'manøverknapphøyde',
              )!,
              sosiElement,
            ),

            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'breddeinngang',
              )!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'terskelhøyde',
              )!,
              sosiElement,
            ),
            getFeatureNodeValueWithDataType(
              featureMember.nodes.find(
                n => n.name.toLowerCase() == 'stigningadkomstvei',
              )!,
              sosiElement,
            ),
            getRampNodeValue('rampe'),
            getRampNodeValue('rampebredde'),
            getRampNodeValue('rampestigning'),
            getRampNodeValue('rampeterskel'),
          ),
        ),
      );
      break;
    }
    case 'FriluftBaderampe': {
      primitiveChairNode!.value = getAccessibilityValue(
        Accessibility.assessObject(
          friluftBaderampeRullestol(
            getRampNodeValue('rampe'),
            getRampNodeValue('rampetilgjengelig'),
            getRampNodeValue('rampestigning'),
            getRampNodeValue('rampebredde'),
            getRampNodeValue('rampeterskel'),
            getRampNodeValue('håndlist'),
          ),
        ),
      );

      break;
    }
    default:
      if (primitiveChairNode != undefined) {
        primitiveChairNode.value = 'Ikke vurdert';
      }
      break;
  }
};

const getAccessibilityValue = (accessibility: accessibilityType): string => {
  switch (accessibility) {
    case accessibilityType.Accessible:
      return 'Tilgjengelig';
    case accessibilityType.PartlyAccessible:
      return 'Delvis tilgjengelig';
    case accessibilityType.NotAccessible:
      return 'Ikke tilgjengelig';
    case accessibilityType.NotAssessed:
      return 'Ikke vurdert';
  }

  throw 'Accessibility can not be undefined';
};
