import { displayPartLabel } from "./model-hierarchy";

export type PartExplainer = {
  title: string;
  role: string;
  summary: string;
};

type Entry = { role: string; summary: string };

const LOOKUP: Record<string, Entry> = {
  "aortic arch": {
    role: "Great vessel",
    summary:
      "The aortic arch is the curved segment of the aorta as it leaves the left ventricle. It gives off the brachiocephalic trunk, left common carotid, and left subclavian arteries to the head, neck, and arms.",
  },
  brachiocephalic: {
    role: "Arterial branch",
    summary:
      "The brachiocephalic trunk is the first and largest branch of the aortic arch. It splits into the right common carotid and right subclavian arteries, supplying the right side of the head, neck, and arm.",
  },
  "left coronary artery": {
    role: "Coronary vessel",
    summary:
      "The left coronary artery arises from the aortic root and supplies most of the left ventricle and interventricular septum. Its main branches are the left anterior descending and circumflex arteries.",
  },
  "right coronary artery": {
    role: "Coronary vessel",
    summary:
      "The right coronary artery runs in the atrioventricular groove and supplies the right atrium, right ventricle, and usually the sinoatrial and atrioventricular nodes.",
  },
  "coronary sinus": {
    role: "Venous return",
    summary:
      "The coronary sinus is the main vein of the heart. It collects deoxygenated blood from cardiac veins and empties into the right atrium near the inferior vena cava.",
  },
  "middle cardiac vein": {
    role: "Cardiac vein",
    summary:
      "The middle cardiac vein runs with the posterior interventricular artery in the posterior interventricular groove and drains into the coronary sinus.",
  },
  "great cardiac vein": {
    role: "Cardiac vein",
    summary:
      "The great cardiac vein accompanies the left anterior descending artery, then turns in the atrioventricular groove to become the coronary sinus.",
  },
  "small cardiac vein": {
    role: "Cardiac vein",
    summary:
      "The small cardiac vein travels with the right coronary artery in the right atrioventricular groove and typically drains into the coronary sinus.",
  },
  "left ventricle": {
    role: "Cardiac chamber",
    summary:
      "The left ventricle pumps oxygenated blood into the aorta for the whole body. Its wall is thicker than the right ventricle because systemic pressure is much higher than pulmonary pressure.",
  },
  "right ventricle": {
    role: "Cardiac chamber",
    summary:
      "The right ventricle pumps deoxygenated blood into the pulmonary trunk toward the lungs. Its wall is thinner than the left ventricle because the pulmonary circuit is a low-pressure system.",
  },
  "left atrium": {
    role: "Cardiac chamber",
    summary:
      "The left atrium receives oxygenated blood from the pulmonary veins and passes it through the mitral valve into the left ventricle.",
  },
  "right atrium": {
    role: "Cardiac chamber",
    summary:
      "The right atrium receives deoxygenated blood from the superior and inferior venae cavae and the coronary sinus, then sends it through the tricuspid valve into the right ventricle.",
  },
  "pulmonary trunk": {
    role: "Great vessel",
    summary:
      "The pulmonary trunk leaves the right ventricle and splits into left and right pulmonary arteries, carrying deoxygenated blood to the lungs.",
  },
  "pulmonary artery": {
    role: "Pulmonary vessel",
    summary:
      "Pulmonary arteries carry deoxygenated blood from the right ventricle to the lungs. Unlike most arteries, they run in a low-pressure circuit.",
  },
  "pulmonary vein": {
    role: "Pulmonary vessel",
    summary:
      "Pulmonary veins return oxygenated blood from the lungs to the left atrium, completing the pulmonary circuit.",
  },
  aorta: {
    role: "Great vessel",
    summary:
      "The aorta is the body's main artery. It receives blood from the left ventricle and distributes it through the systemic circulation.",
  },
  "superior vena cava": {
    role: "Systemic vein",
    summary:
      "The superior vena cava drains deoxygenated blood from the head, neck, and upper limbs into the right atrium.",
  },
  "inferior vena cava": {
    role: "Systemic vein",
    summary:
      "The inferior vena cava returns deoxygenated blood from the abdomen, pelvis, and lower limbs to the right atrium.",
  },
  mitral: {
    role: "Atrioventricular valve",
    summary:
      "The mitral (bicuspid) valve sits between the left atrium and left ventricle. It opens in diastole and closes in systole to stop blood flowing back into the atrium.",
  },
  tricuspid: {
    role: "Atrioventricular valve",
    summary:
      "The tricuspid valve sits between the right atrium and right ventricle. Its three cusps prevent backflow when the ventricle contracts.",
  },
  "aortic valve": {
    role: "Semilunar valve",
    summary:
      "The aortic valve opens when left-ventricular pressure exceeds aortic pressure, then closes to keep systemic blood from flowing back into the ventricle.",
  },
  "pulmonary valve": {
    role: "Semilunar valve",
    summary:
      "The pulmonary valve guards the outflow from the right ventricle into the pulmonary trunk and prevents backflow during diastole.",
  },
  myocardium: {
    role: "Heart wall",
    summary:
      "Myocardium is the contractile muscle of the heart. Thickness varies by chamber: thickest in the left ventricle, thinnest in the atria.",
  },
  pericardium: {
    role: "Heart covering",
    summary:
      "The pericardium is the fibroserous sac around the heart. It anchors the organ, reduces friction, and limits overfilling.",
  },
  femur: {
    role: "Long bone",
    summary:
      "The femur is the thigh bone and the longest bone in the body. It transmits body weight from the hip to the knee.",
  },
  tibia: {
    role: "Long bone",
    summary:
      "The tibia is the main weight-bearing bone of the leg, running from the knee to the ankle on the medial side.",
  },
  fibula: {
    role: "Long bone",
    summary:
      "The fibula is the slender lateral bone of the leg. It does not bear much weight but is important for ankle stability and muscle attachment.",
  },
  humerus: {
    role: "Long bone",
    summary:
      "The humerus is the bone of the arm, spanning shoulder to elbow. Its head articulates with the scapula at the glenoid cavity.",
  },
  scapula: {
    role: "Pectoral girdle",
    summary:
      "The scapula (shoulder blade) is a flat triangular bone that articulates with the humerus and clavicle, giving the upper limb a wide range of motion.",
  },
  clavicle: {
    role: "Pectoral girdle",
    summary:
      "The clavicle (collarbone) struts the scapula away from the sternum so the arm can swing freely.",
  },
  pelvis: {
    role: "Pelvic girdle",
    summary:
      "The pelvis transfers weight from the spine to the lower limbs and protects pelvic organs. It is more stable and less mobile than the shoulder girdle.",
  },
  vertebra: {
    role: "Axial skeleton",
    summary:
      "Vertebrae stack to form the spinal column, protecting the spinal cord while allowing flexion, extension, and rotation.",
  },
  skull: {
    role: "Axial skeleton",
    summary:
      "The skull encases the brain and houses the sense organs of the face. Cranial bones are joined by sutures; the mandible is the movable exception.",
  },
  rib: {
    role: "Thoracic cage",
    summary:
      "Ribs form a protective cage around the heart and lungs and move during breathing to change thoracic volume.",
  },
  sternum: {
    role: "Thoracic cage",
    summary:
      "The sternum is the breastbone. It anchors the ribs and clavicles and protects the mediastinum.",
  },
  oesophagus: {
    role: "GI organ",
    summary:
      "The oesophagus is the muscular tube from the pharynx to the stomach. Peristalsis pushes the swallowed bolus through the thorax into the abdomen.",
  },
  pharynx: {
    role: "Shared passage",
    summary:
      "The pharynx is the shared corridor for air and food, divided into nasopharynx, oropharynx and laryngopharynx.",
  },
  jejunum: {
    role: "Small intestine",
    summary:
      "The jejunum is the middle small intestine, where most nutrient absorption happens. It forms the long coiled mass in the centre of the abdomen.",
  },
  appendix: {
    role: "Large intestine",
    summary:
      "The vermiform appendix is a narrow pouch off the caecum. It is a useful surgical landmark in the right lower quadrant.",
  },
  omentum: {
    role: "Peritoneal fold",
    summary:
      "The omenta are peritoneal folds. The greater omentum hangs from the stomach like an apron; the lesser omentum links stomach to liver.",
  },
  peritoneum: {
    role: "Abdominal lining",
    summary:
      "The peritoneum is the serous membrane lining the abdominal cavity and covering abdominal organs, reducing friction as they move.",
  },
  stomach: {
    role: "GI organ",
    summary:
      "The stomach stores and mixes ingested food, begins protein digestion, and empties chyme through the pylorus into the duodenum.",
  },
  liver: {
    role: "Accessory gland",
    summary:
      "The liver sits in the right upper abdomen. It processes nutrients, makes bile, and handles many metabolic and detoxification tasks.",
  },
  gallbladder: {
    role: "Accessory gland",
    summary:
      "The gallbladder stores and concentrates bile from the liver, then releases it into the duodenum to help digest fats.",
  },
  pancreas: {
    role: "Accessory gland",
    summary:
      "The pancreas secretes digestive enzymes into the duodenum and hormones such as insulin into the blood.",
  },
  intestine: {
    role: "GI organ",
    summary:
      "The intestines continue digestion and absorb nutrients (small intestine) then water and electrolytes (large intestine).",
  },
  duodenum: {
    role: "Small intestine",
    summary:
      "The duodenum is the first part of the small intestine. Bile and pancreatic juice enter here to continue chemical digestion.",
  },
  colon: {
    role: "Large intestine",
    summary:
      "The colon absorbs water and electrolytes from remaining chyme and forms feces for elimination.",
  },
  lung: {
    role: "Respiratory organ",
    summary:
      "The lungs exchange oxygen and carbon dioxide. The right lung has three lobes; the left has two and a cardiac notch for the heart.",
  },
  trachea: {
    role: "Airway",
    summary:
      "The trachea is the windpipe. C-shaped cartilages keep it open as it carries air from the larynx to the main bronchi.",
  },
  bronchus: {
    role: "Airway",
    summary:
      "Bronchi branch from the tracheal bifurcation into each lung, then divide into lobar and segmental airways.",
  },
  larynx: {
    role: "Airway",
    summary:
      "The larynx sits between the pharynx and trachea. It protects the airway during swallowing and houses the vocal folds.",
  },
  kidney: {
    role: "Urinary organ",
    summary:
      "The kidneys filter blood, regulate fluid and electrolytes, and produce urine. They sit retroperitoneal on the posterior abdominal wall.",
  },
  ureter: {
    role: "Urinary tract",
    summary:
      "Each ureter is a muscular tube that carries urine from the renal pelvis down to the bladder.",
  },
  bladder: {
    role: "Urinary organ",
    summary:
      "The bladder stores urine in the pelvis until the urethra opens and it can empty.",
  },
  thyroid: {
    role: "Endocrine gland",
    summary:
      "The thyroid wraps the upper trachea in the neck and secretes hormones that set basal metabolic rate.",
  },
  pituitary: {
    role: "Endocrine gland",
    summary:
      "The pituitary sits in the sella turcica and controls many other glands through tropic hormones, as well as ADH and oxytocin.",
  },
  adrenal: {
    role: "Endocrine gland",
    summary:
      "The adrenal (suprarenal) glands cap each kidney and secrete cortisol, aldosterone, and catecholamines.",
  },
  brain: {
    role: "Central nervous system",
    summary:
      "The brain is the control centre of the nervous system, integrating sensation, movement, cognition, and autonomic function.",
  },
  "spinal cord": {
    role: "Central nervous system",
    summary:
      "The spinal cord runs in the vertebral canal. It relays signals between brain and body and houses reflex circuits.",
  },
  nerve: {
    role: "Peripheral nerve",
    summary:
      "Peripheral nerves carry motor, sensory, and autonomic fibres between the central nervous system and the rest of the body.",
  },
};

function normalize(name: string) {
  return name
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function explainPart(rawName: string): PartExplainer {
  const title = displayPartLabel(rawName);
  const haystack = normalize(rawName);
  let bestKey = "";
  let best: Entry | undefined;

  for (const [key, entry] of Object.entries(LOOKUP)) {
    if (haystack.includes(key) && key.length > bestKey.length) {
      bestKey = key;
      best = entry;
    }
  }

  if (!best) {
    return {
      title,
      role: "Anatomical structure",
      summary: `${title} is a labeled region on this model. Hide neighbouring parts in the list to see it more clearly, or ask the AI assistant for a deeper explanation.`,
    };
  }

  return { title, role: best.role, summary: best.summary };
}
