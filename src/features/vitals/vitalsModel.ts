// Vitals Risk Screening Model for MomCare
// Exact decision tree (tree_depth4 | threshold: 0.35) trained on 451 records (112 high risk)

export interface VitalsInput {
  Age: number; // years
  SystolicBP: number; // mmHg
  DiastolicBP: number; // mmHg
  BS: number; // blood sugar (mmol/L)
  BodyTemp: number; // Fahrenheit (°F)
  HeartRate: number; // bpm
}

export const HIGH_RISK_THRESHOLD = 0.35;

/**
 * EXACT function as specified. DO NOT CHANGE.
 * Winner for the app: tree_depth4 | threshold: 0.35
 */
export function highRiskScore(v: VitalsInput): number {
  if (v.BS <= 7.9500) {
    if (v.SystolicBP <= 132.5000) {
      if (v.BodyTemp <= 99.5000) {
        if (v.Age <= 33.5000) {
          return 0.0144;
        } else {
          return 0.2458;
        }
      } else {
        if (v.Age <= 17.5000) {
          return 0.6566;
        } else {
          return 0.2664;
        }
      }
    } else {
      if (v.BS <= 6.7500) {
        return 0.0000;
      } else {
        if (v.HeartRate <= 68.0000) {
          return 1.0000;
        } else {
          return 1.0000;
        }
      }
    }
  } else {
    if (v.BS <= 9.5000) {
      if (v.DiastolicBP <= 95.0000) {
        if (v.DiastolicBP <= 72.5000) {
          return 0.8289;
        } else {
          return 0.3353;
        }
      } else {
        return 1.0000;
      }
    } else {
      if (v.Age <= 41.0000) {
        if (v.Age <= 38.5000) {
          return 1.0000;
        } else {
          return 0.9549;
        }
      } else {
        if (v.SystolicBP <= 135.0000) {
          return 0.7974;
        } else {
          return 1.0000;
        }
      }
    }
  }
}

export interface RedFlagResult {
  isRedFlag: boolean;
  title: string;
  reasons: string[];
}

/**
 * Rule 3: Red-flag emergency rules ALWAYS run first and override this feature.
 * Evaluates physiological clinical emergency red-lines in pregnancy
 * (ACOG / RCOG obstetric emergency guidelines for hypertensive crisis, severe sepsis/hyperpyrexia, hemodynamic instability).
 */
export function evaluateRedFlagVitals(v: VitalsInput): RedFlagResult {
  const reasons: string[] = [];

  // Severe hypertension / hypertensive crisis in pregnancy (ACOG threshold: >= 160 or >= 110)
  if (v.SystolicBP >= 160 || v.DiastolicBP >= 110) {
    reasons.push(
      `Severe Blood Pressure (Systolic: ${v.SystolicBP} mmHg, Diastolic: ${v.DiastolicBP} mmHg) exceeds obstetric hypertensive crisis threshold (≥160/110 mmHg). Immediate risk for severe preeclampsia or eclampsia.`
    );
  } else if (v.SystolicBP < 85 || v.DiastolicBP < 45) {
    reasons.push(
      `Severe Hypotension (Systolic: ${v.SystolicBP} mmHg, Diastolic: ${v.DiastolicBP} mmHg) indicates possible shock, hemorrhage, or severe dehydration.`
    );
  }

  // Severe high fever / systemic hyperpyrexia
  if (v.BodyTemp >= 101.0) {
    const tempC = ((v.BodyTemp - 32) * (5 / 9)).toFixed(1);
    reasons.push(
      `High fever (${v.BodyTemp.toFixed(1)}°F / ${tempC}°C) exceeds maternal infection threshold (≥101.0°F). Risk of chorioamnionitis or severe maternal sepsis.`
    );
  } else if (v.BodyTemp < 95.0) {
    reasons.push(
      `Hypothermia (${v.BodyTemp.toFixed(1)}°F) requires urgent medical warming and clinical assessment.`
    );
  }

  // Severe tachycardia / bradycardia at rest
  if (v.HeartRate >= 120) {
    reasons.push(
      `Severe maternal tachycardia (${v.HeartRate} bpm at rest) can signal hemodynamic compromise, severe anemia, pulmonary embolism, or infection.`
    );
  } else if (v.HeartRate < 50) {
    reasons.push(
      `Marked maternal bradycardia (${v.HeartRate} bpm) requires prompt physician evaluation.`
    );
  }

  // Extreme glycemic crisis
  if (v.BS >= 15.0) {
    const mgDl = (v.BS * 18).toFixed(0);
    reasons.push(
      `Extreme hyperglycemia (${v.BS.toFixed(1)} mmol/L ≈ ${mgDl} mg/dL) carries risk of ketoacidosis or acute hyperosmolar state.`
    );
  } else if (v.BS < 3.5) {
    const mgDl = (v.BS * 18).toFixed(0);
    reasons.push(
      `Severe hypoglycemia (${v.BS.toFixed(1)} mmol/L ≈ ${mgDl} mg/dL) requires immediate fast-acting carbohydrates and emergency triage.`
    );
  }

  return {
    isRedFlag: reasons.length > 0,
    title: '🔴 Urgent Red-Flag Vitals Alert',
    reasons,
  };
}

/**
 * Tracing helper for the "Why am I seeing this?" modal:
 * Explains which branches in the decision tree were taken based on the user's values.
 */
export function explainDecisionPath(v: VitalsInput, score: number): string[] {
  const steps: string[] = [];

  if (v.BS <= 7.9500) {
    steps.push(`Blood Sugar (${v.BS.toFixed(2)} mmol/L) is ≤ 7.95 mmol/L`);
    if (v.SystolicBP <= 132.5000) {
      steps.push(`Systolic BP (${v.SystolicBP} mmHg) is ≤ 132.5 mmHg`);
      if (v.BodyTemp <= 99.5000) {
        steps.push(`Body Temp (${v.BodyTemp.toFixed(1)}°F) is ≤ 99.5°F`);
        if (v.Age <= 33.5000) {
          steps.push(`Age (${v.Age} yrs) is ≤ 33.5 yrs → Leaf Score: 0.0144 (1.4%)`);
        } else {
          steps.push(`Age (${v.Age} yrs) is > 33.5 yrs → Leaf Score: 0.2458 (24.6%)`);
        }
      } else {
        steps.push(`Body Temp (${v.BodyTemp.toFixed(1)}°F) is > 99.5°F`);
        if (v.Age <= 17.5000) {
          steps.push(`Age (${v.Age} yrs) is ≤ 17.5 yrs → Leaf Score: 0.6566 (65.7%)`);
        } else {
          steps.push(`Age (${v.Age} yrs) is > 17.5 yrs → Leaf Score: 0.2664 (26.6%)`);
        }
      }
    } else {
      steps.push(`Systolic BP (${v.SystolicBP} mmHg) is > 132.5 mmHg`);
      if (v.BS <= 6.7500) {
        steps.push(`Blood Sugar (${v.BS.toFixed(2)} mmol/L) is ≤ 6.75 mmol/L → Leaf Score: 0.0000 (0.0%)`);
      } else {
        steps.push(`Blood Sugar (${v.BS.toFixed(2)} mmol/L) is > 6.75 mmol/L`);
        if (v.HeartRate <= 68.0000) {
          steps.push(`Heart Rate (${v.HeartRate} bpm) is ≤ 68 bpm → Leaf Score: 1.0000 (100.0%)`);
        } else {
          steps.push(`Heart Rate (${v.HeartRate} bpm) is > 68 bpm → Leaf Score: 1.0000 (100.0%)`);
        }
      }
    }
  } else {
    steps.push(`Blood Sugar (${v.BS.toFixed(2)} mmol/L) is > 7.95 mmol/L`);
    if (v.BS <= 9.5000) {
      steps.push(`Blood Sugar (${v.BS.toFixed(2)} mmol/L) is ≤ 9.50 mmol/L`);
      if (v.DiastolicBP <= 95.0000) {
        steps.push(`Diastolic BP (${v.DiastolicBP} mmHg) is ≤ 95.0 mmHg`);
        if (v.DiastolicBP <= 72.5000) {
          steps.push(`Diastolic BP (${v.DiastolicBP} mmHg) is ≤ 72.5 mmHg → Leaf Score: 0.8289 (82.9%)`);
        } else {
          steps.push(`Diastolic BP (${v.DiastolicBP} mmHg) is > 72.5 mmHg → Leaf Score: 0.3353 (33.5%)`);
        }
      } else {
        steps.push(`Diastolic BP (${v.DiastolicBP} mmHg) is > 95.0 mmHg → Leaf Score: 1.0000 (100.0%)`);
      }
    } else {
      steps.push(`Blood Sugar (${v.BS.toFixed(2)} mmol/L) is > 9.50 mmol/L`);
      if (v.Age <= 41.0000) {
        steps.push(`Age (${v.Age} yrs) is ≤ 41.0 yrs`);
        if (v.Age <= 38.5000) {
          steps.push(`Age (${v.Age} yrs) is ≤ 38.5 yrs → Leaf Score: 1.0000 (100.0%)`);
        } else {
          steps.push(`Age (${v.Age} yrs) is > 38.5 yrs → Leaf Score: 0.9549 (95.5%)`);
        }
      } else {
        steps.push(`Age (${v.Age} yrs) is > 41.0 yrs`);
        if (v.SystolicBP <= 135.0000) {
          steps.push(`Systolic BP (${v.SystolicBP} mmHg) is ≤ 135.0 mmHg → Leaf Score: 0.7974 (79.7%)`);
        } else {
          steps.push(`Systolic BP (${v.SystolicBP} mmHg) is > 135.0 mmHg → Leaf Score: 1.0000 (100.0%)`);
        }
      }
    }
  }

  return steps;
}
