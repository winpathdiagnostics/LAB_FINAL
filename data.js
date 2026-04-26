// =====================================================================
// 1. HEALTH PACKAGES
// =====================================================================
const healthPackages = [
    // --- LIFESTYLE & GENERAL WELLNESS ---
    { id: 'p-1', name: "Master Health Checkup", mrp: "8,500", price: "5,999", isPackage: true, desc: "Our gold-standard clinical audit.", importance: "A complete clinical audit of major organ systems. Highly recommended once a year for proactive health management of heart, liver, kidney, and metabolic status.", params: "CBC, LFT, RFT, Lipid, HbA1c, Vitamin D, Vitamin B12, Urine Routine, Thyroid, Fasting Sugar", category: { package: 'LifeStyle' } },
    { id: 'p-2', name: "Full Body Checkup", mrp: "3,500", price: "1,999", isPackage: true, desc: "Essential baseline organ health screen.", importance: "Perfect for routine monitoring of metabolic health, liver, and kidney functions at an accessible price for the entire family.", params: "CBC, Sugar, Lipid Profile, LFT, RFT, Urine Routine", category: { package: 'LifeStyle' } },
    
    // --- GENDER SPECIFIC ---
    { id: 'p-3', name: "Women's Health Package", mrp: "4,000", price: "2,499", isPackage: true, desc: "Hormonal & nutritional focus.", importance: "Specifically designed for women to monitor reproductive health, hormonal balance, bone density markers, and iron levels.", params: "CBC, Thyroid Profile, Iron, Calcium, Vitamin D", category: { package: 'Women' } },
    { id: 'p-4', name: "Men's Health Package", mrp: "4,000", price: "2,499", isPackage: true, desc: "Heart risk & prostate focus.", importance: "Targeted screening for cardiac risks, liver function, and age-related markers including prostate health indicators.", params: "CBC, Lipid Profile, LFT, PSA Total, Vitamin B12", category: { package: 'Men' } },
    
    // --- SENIORS & SPECIALIZED ---
    { id: 'p-5', name: "Seniors Health Screen", mrp: "5,500", price: "3,499", isPackage: true, desc: "Age-related chronic monitoring.", importance: "Targets age-related risks including chronic inflammation, blood sugar stability, renal filtration, and bone mineral loss.", params: "CBC, HbA1c, Cardiac Profile, RFT, Vitamin D", category: { package: 'Senior' } },
    { id: 'p-6', name: "PCOS Screen", mrp: "4,500", price: "2,999", isPackage: true, desc: "Reproductive hormonal panel.", importance: "Clinical evaluation of hormonal imbalance and insulin resistance associated with PCOS symptoms.", params: "FSH, LH, Prolactin, Insulin (F), Testosterone", category: { package: 'Women' } }
];

// =====================================================================
// 2. STANDALONE CLINICAL INVESTIGATIONS 
// =====================================================================
let investigations = [
    // --- HEMATOLOGY & COAGULATION ---
    { id: 'i-1', name: "Complete Blood Count (CBC)", mrp: "650", price: "450", params: "Hb, WBC, Platelets, DC, Indices", category: { risk: 'General' } },
    { id: 'i-2', name: "Erythrocyte Sedimentation Rate (ESR)", mrp: "300", price: "200", params: "ESR", category: { condition: 'Fever' } },
    { id: 'i-3', name: "Blood Grouping & Rh Factor", mrp: "350", price: "250", params: "ABO, Rh Type", category: { risk: 'General' } },
    { id: 'i-4', name: "Peripheral Blood Smear", mrp: "500", price: "350", params: "Morphology Analysis", category: { risk: 'General' } },
    { id: 'i-5', name: "Reticulocyte Count", mrp: "650", price: "450", params: "Retic Count", category: { risk: 'General' } },
    { id: 'i-6', name: "Prothrombin Time (PT/INR)", mrp: "900", price: "650", params: "PT, INR", category: { risk: 'Heart' } },
    { id: 'i-7', name: "APTT", mrp: "1000", price: "750", params: "Activated Partial Thromboplastin Time", category: { risk: 'Heart' } },
    { id: 'i-8', name: "Fibrinogen", mrp: "1200", price: "850", params: "Plasma Fibrinogen", category: { risk: 'Heart' } },
    { id: 'i-9', name: "D-Dimer", mrp: "2500", price: "1800", params: "D-Dimer Quantitative", category: { risk: 'Lungs' } },
    { id: 'i-10', name: "AEC (Absolute Eosinophil Count)", mrp: "350", price: "250", params: "Eosinophil Count", category: { risk: 'Lungs' } },

    // --- DIABETES & METABOLIC ---
    { id: 'i-11', name: "Glucose Fasting (FBS)", mrp: "250", price: "150", params: "Sugar (F)", category: { risk: 'Diabetes', condition: 'Diabetes' } },
    { id: 'i-12', name: "Glucose Post Prandial (PPBS)", mrp: "250", price: "150", params: "Sugar (PP)", category: { risk: 'Diabetes', condition: 'Diabetes' } },
    { id: 'i-13', name: "Glucose Random (RBS)", mrp: "250", price: "150", params: "Sugar (Random)", category: { risk: 'Diabetes', condition: 'Diabetes' } },
    { id: 'i-14', name: "HbA1c", mrp: "850", price: "600", params: "Glycated Hemoglobin", category: { risk: 'Diabetes', condition: 'Diabetes' } },
    { id: 'i-15', name: "Insulin Fasting", mrp: "1400", price: "950", params: "Fasting Insulin", category: { risk: 'Diabetes', condition: 'Obesity' } },
    { id: 'i-16', name: "Insulin PP", mrp: "1400", price: "950", params: "Post Prandial Insulin", category: { risk: 'Diabetes', condition: 'Obesity' } },
    { id: 'i-17', name: "C-Peptide", mrp: "1800", price: "1200", params: "C-Peptide Fasting", category: { risk: 'Diabetes' } },
    { id: 'i-18', name: "Glucose Tolerance Test (GTT)", mrp: "900", price: "600", params: "GTT (3 Samples)", category: { risk: 'Diabetes' } },

    // --- CARDIAC & LIPIDS ---
    { id: 'i-19', name: "Lipid Profile", mrp: "1200", price: "850", params: "Cholesterol, Triglycerides, HDL, LDL, VLDL", category: { risk: 'Heart', condition: 'Cardiovascular' } },
    { id: 'i-20', name: "Cholesterol (Total)", mrp: "350", price: "250", params: "Total Cholesterol", category: { risk: 'Heart' } },
    { id: 'i-21', name: "Triglycerides", mrp: "500", price: "350", params: "Serum Triglycerides", category: { risk: 'Heart' } },
    { id: 'i-22', name: "CRP (High Sensitivity)", mrp: "1400", price: "950", params: "hs-CRP", category: { risk: 'Heart', condition: 'Cardiovascular' } },
    { id: 'i-23', name: "Troponin I", mrp: "2500", price: "1800", params: "hs-Troponin I", category: { risk: 'Heart' } },
    { id: 'i-24', name: "Troponin T", mrp: "2500", price: "1800", params: "hs-Troponin T", category: { risk: 'Heart' } },
    { id: 'i-25', name: "CPK Total", mrp: "950", price: "650", params: "Creatine Phosphokinase", category: { risk: 'Heart' } },
    { id: 'i-26', name: "CPK-MB", mrp: "1200", price: "850", params: "CPK-MB Isoenzyme", category: { risk: 'Heart' } },
    { id: 'i-27', name: "Homocysteine", mrp: "2200", price: "1500", params: "Homocysteine Levels", category: { risk: 'Heart' } },

    // --- LIVER FUNCTION (HEPATIC) ---
    { id: 'i-28', name: "Liver Function Test (LFT)", mrp: "1400", price: "950", params: "SGOT, SGPT, Bilirubin, ALP, Proteins", category: { risk: 'Liver', condition: 'Gut Health' } },
    { id: 'i-29', name: "Bilirubin Total & Direct", mrp: "500", price: "350", params: "Total, Direct, Indirect Bilirubin", category: { risk: 'Liver' } },
    { id: 'i-30', name: "SGOT (AST)", mrp: "350", price: "250", params: "AST", category: { risk: 'Liver' } },
    { id: 'i-31', name: "SGPT (ALT)", mrp: "350", price: "250", params: "ALT", category: { risk: 'Liver' } },
    { id: 'i-32', name: "Alkaline Phosphatase (ALP)", mrp: "450", price: "300", params: "Serum ALP", category: { risk: 'Liver' } },
    { id: 'i-33', name: "GGT", mrp: "800", price: "550", params: "Gamma GT", category: { risk: 'Liver', condition: 'Alcohol' } },
    { id: 'i-34', name: "Total Protein & A/G Ratio", mrp: "500", price: "350", params: "Protein, Albumin, Globulin", category: { risk: 'Liver', condition: 'Nutrition' } },

    // --- RENAL FUNCTION (KIDNEY) & ELECTROLYTES ---
    { id: 'i-35', name: "Renal Function Test (RFT)", mrp: "1400", price: "950", params: "Creatinine, Urea, Uric Acid, BUN, Electrolytes", category: { risk: 'Kidney', condition: 'Hypertension' } },
    { id: 'i-36', name: "Serum Creatinine", mrp: "350", price: "250", params: "Creatinine", category: { risk: 'Kidney' } },
    { id: 'i-37', name: "Blood Urea Nitrogen (BUN)", mrp: "450", price: "300", params: "BUN", category: { risk: 'Kidney' } },
    { id: 'i-38', name: "Uric Acid", mrp: "350", price: "250", params: "Uric Acid", category: { risk: 'Kidney' } },
    { id: 'i-39', name: "Serum Electrolytes", mrp: "900", price: "650", params: "Sodium, Potassium, Chloride", category: { risk: 'Kidney' } },
    { id: 'i-40', name: "Calcium (Total)", mrp: "450", price: "300", params: "Serum Calcium", category: { condition: 'Bone Health' } },
    { id: 'i-41', name: "Phosphorus", mrp: "450", price: "300", params: "Inorganic Phosphorus", category: { condition: 'Bone Health' } },
    { id: 'i-42', name: "Magnesium", mrp: "800", price: "550", params: "Serum Magnesium", category: { risk: 'Kidney' } },
    { id: 'i-43', name: "Creatinine Clearance", mrp: "1800", price: "1200", params: "Blood & 24H Urine Creatinine", category: { risk: 'Kidney' } },

    // --- THYROID & ENDOCRINOLOGY ---
    { id: 'i-44', name: "Thyroid Profile (Total)", mrp: "1100", price: "750", params: "T3, T4, TSH", category: { risk: 'Thyroid' } },
    { id: 'i-45', name: "Thyroid Profile (Free)", mrp: "1600", price: "1100", params: "FT3, FT4, TSH", category: { risk: 'Thyroid' } },
    { id: 'i-46', name: "TSH (Ultrasensitive)", mrp: "650", price: "450", params: "Thyroid Stimulating Hormone", category: { risk: 'Thyroid' } },
    { id: 'i-47', name: "Anti-TPO Antibodies", mrp: "2400", price: "1600", params: "Microsomal Antibody", category: { risk: 'Thyroid' } },
    { id: 'i-48', name: "Anti-Thyroglobulin (Anti-Tg)", mrp: "2400", price: "1600", params: "Anti-Tg", category: { risk: 'Thyroid' } },
    { id: 'i-49', name: "Prolactin", mrp: "1100", price: "750", params: "Serum Prolactin", category: { risk: 'Infertility', condition: 'Sexual Wellness' } },
    { id: 'i-50', name: "FSH", mrp: "1000", price: "700", params: "Follicle Stimulating Hormone", category: { risk: 'Infertility' } },
    { id: 'i-51', name: "LH", mrp: "1000", price: "700", params: "Luteinizing Hormone", category: { risk: 'Infertility' } },
    { id: 'i-52', name: "Testosterone (Total)", mrp: "1400", price: "950", params: "Total Testosterone", category: { risk: 'Infertility', condition: 'Sexual Wellness' } },
    { id: 'i-53', name: "Testosterone (Free)", mrp: "2000", price: "1400", params: "Free Testosterone", category: { risk: 'Infertility' } },
    { id: 'i-54', name: "Cortisol (Morning)", mrp: "1200", price: "850", params: "8 AM Cortisol", category: { condition: 'Sleep Disorder' } },
    { id: 'i-55', name: "Cortisol (Evening)", mrp: "1200", price: "850", params: "4 PM Cortisol", category: { condition: 'Sleep Disorder' } },
    { id: 'i-56', name: "Beta HCG (Quantitative)", mrp: "1400", price: "950", params: "Serum Beta HCG", category: { risk: 'General' } },

    // --- VITAMINS & NUTRITION ---
    { id: 'i-57', name: "Vitamin D (25-Hydroxy)", mrp: "2200", price: "1450", params: "25-OH Vitamin D", category: { condition: 'Bone Health' } },
    { id: 'i-58', name: "Vitamin B12", mrp: "1800", price: "1200", params: "Cyanocobalamin", category: { condition: 'Nutrition' } },
    { id: 'i-59', name: "Vitamin B9 (Folic Acid)", mrp: "1800", price: "1200", params: "Folate Levels", category: { condition: 'Nutrition' } },
    { id: 'i-60', name: "Iron Profile", mrp: "1600", price: "1100", params: "Iron, TIBC, UIBC, Transferrin Saturation", category: { condition: 'Nutrition' } },
    { id: 'i-61', name: "Ferritin", mrp: "1200", price: "850", params: "Serum Ferritin", category: { condition: 'Nutrition' } },
    { id: 'i-62', name: "Transferrin", mrp: "1400", price: "950", params: "Serum Transferrin", category: { condition: 'Nutrition' } },

    // --- IMMUNOLOGY, ARTHRITIS & INFLAMMATION ---
    { id: 'i-63', name: "CRP (Standard)", mrp: "800", price: "550", params: "C-Reactive Protein", category: { condition: 'Fever' } },
    { id: 'i-64', name: "RA Factor (Quantitative)", mrp: "900", price: "650", params: "Rheumatoid Factor", category: { condition: 'Bone Health' } },
    { id: 'i-65', name: "Anti-CCP", mrp: "2200", price: "1500", params: "Cyclic Citrullinated Peptide", category: { condition: 'Bone Health' } },
    { id: 'i-66', name: "ANA (Anti-Nuclear Antibody)", mrp: "1600", price: "1100", params: "ANA IFA Method", category: { risk: 'General' } },
    { id: 'i-67', name: "ANA Profile (Immunoblot)", mrp: "5000", price: "3500", params: "17 Antigen Panel", category: { risk: 'General' } },
    { id: 'i-68', name: "ASO Titre", mrp: "900", price: "650", params: "Anti-Streptolysin O", category: { risk: 'Heart' } },
    { id: 'i-69', name: "HLA-B27", mrp: "2800", price: "1800", params: "HLA-B27 Antigen", category: { condition: 'Bone Health' } },

    // --- INFECTIOUS DISEASES & SEROLOGY ---
    { id: 'i-70', name: "Dengue NS1 Antigen", mrp: "1200", price: "850", params: "NS1 Ag", category: { condition: 'Fever' } },
    { id: 'i-71', name: "Dengue IgM/IgG Antibodies", mrp: "1600", price: "1100", params: "Dengue Serology", category: { condition: 'Fever' } },
    { id: 'i-72', name: "Malaria Antigen (Rapid)", mrp: "600", price: "400", params: "Pf/Pv Antigen", category: { condition: 'Fever' } },
    { id: 'i-73', name: "Widal Test", mrp: "500", price: "350", params: "Typhoid Screen", category: { condition: 'Fever' } },
    { id: 'i-74', name: "Typhidot (IgM/IgG)", mrp: "950", price: "650", params: "Salmonella Antibodies", category: { condition: 'Fever' } },
    { id: 'i-75', name: "HBsAg (Hepatitis B)", mrp: "650", price: "450", params: "Hepatitis B Surface Antigen", category: { risk: 'Liver' } },
    { id: 'i-76', name: "Anti-HCV (Hepatitis C)", mrp: "1200", price: "850", params: "HCV Antibodies", category: { risk: 'Liver' } },
    { id: 'i-77', name: "HIV 1&2 Antibody", mrp: "950", price: "650", params: "4th Generation Screen", category: { condition: 'Sexual Wellness' } },
    { id: 'i-78', name: "VDRL / RPR", mrp: "500", price: "350", params: "Syphilis Screen", category: { condition: 'Sexual Wellness' } },
    { id: 'i-79', name: "H. Pylori IgG", mrp: "1400", price: "950", params: "Helicobacter Pylori Ab", category: { condition: 'Gut Health' } },
    { id: 'i-80', name: "Mantoux Test", mrp: "500", price: "350", params: "TB Skin Test (Requires 48H reading)", category: { risk: 'Lungs' } },
    { id: 'i-81', name: "Chikungunya IgM", mrp: "1400", price: "950", params: "Chikungunya Antibodies", category: { condition: 'Fever' } },
    { id: 'i-82', name: "Leptospira IgM", mrp: "1200", price: "850", params: "Leptospirosis Screen", category: { condition: 'Fever' } },
    { id: 'i-83', name: "Microfilaria Screen", mrp: "650", price: "450", params: "Filaria Smear (Night Sample)", category: { condition: 'Fever' } },

    // --- ONCOLOGY (TUMOR MARKERS) ---
    { id: 'i-84', name: "PSA Total", mrp: "1800", price: "1200", params: "Prostate Antigen", category: { risk: 'Cancer' } },
    { id: 'i-85', name: "CEA", mrp: "1600", price: "1100", params: "Carcinoembryonic Antigen", category: { risk: 'Cancer', condition: 'Gut Health' } },
    { id: 'i-86', name: "CA-125", mrp: "2200", price: "1450", params: "Ovarian Cancer Marker", category: { risk: 'Cancer' } },
    { id: 'i-87', name: "CA-15.3", mrp: "2200", price: "1450", params: "Breast Cancer Marker", category: { risk: 'Cancer' } },
    { id: 'i-88', name: "CA-19.9", mrp: "2200", price: "1450", params: "Pancreatic Cancer Marker", category: { risk: 'Cancer', condition: 'Gut Health' } },
    { id: 'i-89', name: "Alpha Fetoprotein (AFP)", mrp: "1600", price: "1100", params: "Liver/Germ Cell Marker", category: { risk: 'Cancer', risk: 'Liver' } },

    // --- CLINICAL PATHOLOGY (URINE & STOOL) ---
    { id: 'i-90', name: "Urine Routine & Microscopic", mrp: "350", price: "250", params: "Physical, Chemical & Microscopic Exam", category: { risk: 'Kidney' } },
    { id: 'i-91', name: "Urine Microalbumin", mrp: "1100", price: "750", params: "ACR Ratio", category: { risk: 'Kidney', condition: 'Hypertension' } },
    { id: 'i-92', name: "24-Hour Urine Protein", mrp: "1200", price: "850", params: "Total Protein Excretion", category: { risk: 'Kidney' } },
    { id: 'i-93', name: "Urine Culture & Sensitivity", mrp: "1200", price: "850", params: "Bacterial Culture", category: { risk: 'Kidney' } },
    { id: 'i-94', name: "Stool Routine", mrp: "350", price: "250", params: "Ova, Cyst, Microscopy", category: { condition: 'Gut Health' } },
    { id: 'i-95', name: "Stool Occult Blood", mrp: "500", price: "350", params: "Hidden Blood Detection", category: { condition: 'Gut Health' } },
    { id: 'i-96', name: "Stool Hanging Drop", mrp: "500", price: "350", params: "Cholera Screen", category: { condition: 'Gut Health' } },
    { id: 'i-97', name: "Semen Analysis", mrp: "1200", price: "850", params: "Count, Motility, Morphology", category: { risk: 'Infertility', condition: 'Sexual Wellness' } },

    // --- SPECIALIZED BIOCHEMISTRY & DRUGS ---
    { id: 'i-98', name: "Amylase", mrp: "1100", price: "750", params: "Serum Amylase", category: { condition: 'Gut Health' } },
    { id: 'i-99', name: "Lipase", mrp: "1400", price: "950", params: "Serum Lipase", category: { condition: 'Gut Health' } },
    { id: 'i-100', name: "LDH (Lactate Dehydrogenase)", mrp: "950", price: "650", params: "Total LDH", category: { risk: 'Lungs' } },
    { id: 'i-101', name: "G6PD", mrp: "1200", price: "850", params: "Glucose-6-Phosphate Dehydrogenase", category: { risk: 'General' } },
    { id: 'i-102', name: "Serum Copper", mrp: "1800", price: "1200", params: "Copper Levels", category: { risk: 'General' } },
    { id: 'i-103', name: "Serum Zinc", mrp: "1800", price: "1200", params: "Zinc Levels", category: { risk: 'General' } },
    { id: 'i-104', name: "Ceruloplasmin", mrp: "2200", price: "1500", params: "Wilson's Disease Screen", category: { risk: 'Liver' } },
    { id: 'i-105', name: "Phenytoin Level", mrp: "1800", price: "1200", params: "Drug Monitoring", category: { risk: 'General' } },
    { id: 'i-106', name: "Valproic Acid Level", mrp: "1800", price: "1200", params: "Drug Monitoring", category: { risk: 'General' } },
    { id: 'i-107', name: "Lithium Level", mrp: "1200", price: "850", params: "Drug Monitoring", category: { risk: 'General' } },
    { id: 'i-108', name: "Digoxin Level", mrp: "2500", price: "1800", params: "Drug Monitoring", category: { risk: 'Heart' } }
];

// =====================================================================
// 3. STRATEGIC ROADMAP GOALS
// =====================================================================
const roadmapGoals = [
    { year: "2026", title: "Foundation of Winpath", desc: "Established Winpath Diagnostics with a vision for delivering precision pathology directly to patients.", status: "completed" },
    { year: "2026", title: "NABL M(EL)T Labs Accreditation", desc: "Achieved strict global quality standards, ensuring flawless precision in all our clinical reporting.", status: "upcoming" },
    { year: "2026", title: "Digital Integration", desc: "Launched seamless WhatsApp bookings, at-home collections, and rapid 24H digital report delivery.", status: "upcoming" },
];
