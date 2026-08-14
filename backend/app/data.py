PROFILE = {
    "display_name": "Aria Sen",
    "programme": "BioScience · Year 2",
    "initials": "AS",
}

CONVERSATIONS = [
    {"id": "c1", "title": "Why the left ventricle is thicker", "time": "Heart"},
    {"id": "c2", "title": "Compact vs spongy bone", "time": "Skeleton"},
    {"id": "c3", "title": "How does the stomach empty into the duodenum?", "time": "Digestive"},
    {"id": "c4", "title": "CNS versus PNS", "time": "Nervous system"},
]

TUTOR_PROMPTS = [
    "Explain this simply",
    "Give me an analogy",
    "Quiz me",
    "Point to the 3D model",
    "What should I inspect next?",
]

TUTOR_SEED = [
    {"role": "user", "text": "Why does the left ventricle have thicker walls?"},
    {
        "role": "assistant",
        "text": (
            "The left ventricle pumps blood through the systemic circulation, so it must generate "
            "greater pressure than the right ventricle. Thicker myocardium lets it produce that force "
            "with each contraction, while the right ventricle only needs to move blood through the "
            "nearby pulmonary circuit. Rotate the heart model and compare the two ventricular walls."
        ),
    },
]

SUGGESTED_QUESTIONS = [
    "How does blood leave the left ventricle?",
    "What is the difference between compact and spongy bone?",
    "Which organs sit in the abdominal cavity?",
    "How does a signal travel from brain to muscle?",
]


def _lesson(
    lesson_id: str,
    index: str,
    title: str,
    duration: str,
    difficulty: str,
    summary: str,
    concepts: list[str],
    body: str,
) -> dict:
    return {
        "id": lesson_id,
        "index": index,
        "title": title,
        "duration": duration,
        "difficulty": difficulty,
        "status": "active",
        "summary": summary,
        "concepts": concepts,
        "body": body,
    }


MODULES = [
    {
        "id": "heart",
        "title": "Heart",
        "description": "Explore chambers, valves and the two circulation loops on the heart model.",
        "category": "Organs",
        "difficulty": "Intermediate",
        "lesson_count": 4,
        "concepts": 12,
        "estimate": "1h 20m",
        "icon": "heart",
        "accent": "from-[oklch(0.85_0.07_250)] to-[oklch(0.9_0.05_215)]",
        "glb_url": "/heart2.glb",
        "isolate_nodes": [],
        "lessons": [
            _lesson(
                "orientation",
                "01",
                "Orient the heart",
                "16 min",
                "Beginner",
                "Base, apex, surfaces and the great vessels as they leave the organ.",
                ["Apex and base", "Anterior vs posterior", "Aorta and pulmonary trunk", "Anatomical position"],
                "Place the heart in anatomical position: apex pointing left and inferior, base facing the right shoulder. "
                "The anterior surface is dominated by the right ventricle; the left ventricle forms the apex. "
                "Follow the aorta and pulmonary trunk as they leave the base, then find the venae cavae entering the right atrium.",
            ),
            _lesson(
                "chambers",
                "02",
                "Chambers and valves",
                "22 min",
                "Intermediate",
                "Atria, ventricles and the four valves that keep flow one-way.",
                ["Right vs left atrium", "Ventricular walls", "AV valves", "Semilunar valves"],
                "Blood enters the right atrium, crosses the tricuspid valve into the right ventricle, then leaves through "
                "the pulmonary valve. Oxygenated blood returns to the left atrium, crosses the mitral valve, and is ejected "
                "through the aortic valve. Compare wall thickness: the left ventricle must drive systemic pressure.",
            ),
            _lesson(
                "circulation",
                "03",
                "Pulmonary and systemic loops",
                "20 min",
                "Intermediate",
                "How the two circuits share one pump without mixing deoxygenated and oxygenated blood.",
                ["Pulmonary circuit", "Systemic circuit", "Cardiac output", "Pressure gradients"],
                "The right heart is a low-pressure pump for the lungs; the left heart is a high-pressure pump for the body. "
                "Cardiac output is heart rate × stroke volume. Inspect the model while tracing a red blood cell from vena cava "
                "to aorta.",
            ),
            _lesson(
                "cycle",
                "04",
                "The cardiac cycle",
                "22 min",
                "Advanced",
                "Systole, diastole, valve timing and why the left wall is thicker.",
                ["Systole and diastole", "Valve timing", "Stroke volume", "Wall thickness"],
                "Ventricular systole closes the AV valves and opens the semilunar valves. Diastole reverses that sequence. "
                "The thicker left myocardium is an adaptation to afterload, not a second heart — both ventricles eject the same "
                "stroke volume in a healthy cycle.",
            ),
        ],
    },
    {
        "id": "skeleton",
        "title": "Skeleton",
        "description": "Walk the axial and appendicular skeleton on the full skeletal model.",
        "category": "Systems",
        "difficulty": "Beginner",
        "lesson_count": 4,
        "concepts": 14,
        "estimate": "1h 30m",
        "icon": "bone",
        "accent": "from-[oklch(0.9_0.05_180)] to-[oklch(0.93_0.04_250)]",
        "glb_url": "/skeleton.glb",
        "isolate_nodes": [],
        "lessons": [
            _lesson(
                "orientation",
                "01",
                "The skeleton as a frame",
                "18 min",
                "Beginner",
                "Support, protection, leverage and the two major divisions of the skeleton.",
                ["Support and protection", "Axial skeleton", "Appendicular skeleton", "Anatomical landmarks"],
                "The skeleton is a living organ system, not a static rack. Axial bones form the midline axis; appendicular bones "
                "are the limbs and their girdles. Orbit the model and separate skull, thorax, pelvis, and the four limbs.",
            ),
            _lesson(
                "axial",
                "02",
                "Skull, spine and thorax",
                "24 min",
                "Beginner",
                "Cranium, vertebral regions and the rib cage as a protective cylinder.",
                ["Cranium and mandible", "Cervical to sacral", "Ribs and sternum", "Vertebral canal"],
                "Count regions of the vertebral column: cervical, thoracic, lumbar, sacrum and coccyx. The thoracic cage "
                "protects heart and lungs. The skull encases the brain and presents foramina for cranial nerves.",
            ),
            _lesson(
                "appendicular",
                "03",
                "Girdles and limbs",
                "24 min",
                "Intermediate",
                "Pectoral and pelvic girdles, then the bones of arm, forearm, thigh and leg.",
                ["Scapula and clavicle", "Humerus to phalanges", "Pelvis", "Femur to phalanges"],
                "The pectoral girdle is mobile; the pelvic girdle is stable and weight-bearing. Follow one upper limb from "
                "clavicle to distal phalanx, then one lower limb from hip to toes, naming each major bone on the model.",
            ),
            _lesson(
                "tissue",
                "04",
                "Bone as tissue",
                "20 min",
                "Intermediate",
                "Compact bone, spongy bone, marrow and joints that allow motion.",
                ["Osteon", "Trabeculae", "Marrow", "Joints"],
                "Compact bone is organised into osteons; spongy bone uses trabeculae aligned to load. Marrow fills medullary "
                "spaces. Joints — fibrous, cartilaginous and synovial — determine how neighbouring bones move.",
            ),
        ],
    },
    {
        "id": "digestive-system",
        "title": "Digestive System",
        "description": "Follow the GI tract and accessory glands isolated from the viscera model.",
        "category": "Systems",
        "difficulty": "Intermediate",
        "lesson_count": 3,
        "concepts": 10,
        "estimate": "55m",
        "icon": "activity",
        "accent": "from-[oklch(0.89_0.06_230)] to-[oklch(0.93_0.04_195)]",
        "glb_url": "/visceralsystem.glb",
        "isolate_nodes": ["Digestive system.g"],
        "lessons": [
            _lesson(
                "orientation",
                "01",
                "The digestive canal",
                "18 min",
                "Beginner",
                "Mouth, oesophagus, stomach and intestines as a continuous tube.",
                ["Mouth and pharynx", "Stomach", "Small intestine", "Colon"],
                "Isolate the digestive system on the viscera model. Start at the mouth and tongue, follow the oesophagus "
                "into the stomach, then the duodenum, jejunum and colon. The canal is one tube with regional specialisation.",
            ),
            _lesson(
                "accessories",
                "02",
                "Liver, gallbladder and pancreas",
                "20 min",
                "Intermediate",
                "Accessory glands that dump bile and enzymes into the duodenum.",
                ["Liver lobes", "Gallbladder", "Bile duct", "Pancreas"],
                "The liver fills the right upper quadrant. The gallbladder sits on its visceral surface. Pancreatic and bile "
                "ducts meet near the duodenum. Rotate the isolated model until those three organs sit in their true packing.",
            ),
            _lesson(
                "flow",
                "03",
                "From ingestion to absorption",
                "18 min",
                "Intermediate",
                "Where mechanical work ends and nutrient uptake begins.",
                ["Gastric emptying", "Duodenum", "Jejunum", "Absorption"],
                "The stomach stores and mixes; the small intestine absorbs. Find the pylorus, then the duodenal loop wrapping "
                "the pancreas head. Most nutrient uptake happens in jejunum — the long coiled mass in the centre of the model.",
            ),
        ],
    },
    {
        "id": "respiratory-system",
        "title": "Respiratory System",
        "description": "Inspect lungs, trachea and bronchi isolated from the viscera model.",
        "category": "Systems",
        "difficulty": "Intermediate",
        "lesson_count": 3,
        "concepts": 9,
        "estimate": "50m",
        "icon": "lungs",
        "accent": "from-[oklch(0.9_0.05_200)] to-[oklch(0.93_0.04_230)]",
        "glb_url": "/visceralsystem.glb",
        "isolate_nodes": ["Respiratory system.g"],
        "lessons": [
            _lesson(
                "orientation",
                "01",
                "Upper airway to trachea",
                "16 min",
                "Beginner",
                "Nose, larynx and the tracheal tube that splits into bronchi.",
                ["Nasal cavity", "Larynx", "Trachea", "Main bronchi"],
                "Air enters the nose, crosses the larynx, then the trachea. On the isolated respiratory model, find the "
                "tracheal bifurcation and the left versus right main bronchus.",
            ),
            _lesson(
                "lungs",
                "02",
                "Lobes of the lungs",
                "18 min",
                "Intermediate",
                "Two lobes on the left, three on the right, each with a bronchial supply.",
                ["Left lung", "Right lung", "Oblique fissure", "Middle lobe"],
                "The right lung has superior, middle and inferior lobes. The left has superior and inferior, with a cardiac "
                "notch. Compare fissures and count lobes on the model.",
            ),
            _lesson(
                "tree",
                "03",
                "The bronchial tree",
                "16 min",
                "Advanced",
                "Lobar and segmental bronchi inside each lung.",
                ["Lobar bronchi", "Segmental bronchi", "Hilum", "Pleura"],
                "Follow a main bronchus into lobar then segmental branches. The hilum is where vessels and bronchi enter. "
                "Pleura wraps the lung — keep it in mind even when the isolated mesh emphasises airways and lobes.",
            ),
        ],
    },
    {
        "id": "urinary-system",
        "title": "Urinary System",
        "description": "Locate kidneys, ureters and bladder isolated from the viscera model.",
        "category": "Systems",
        "difficulty": "Beginner",
        "lesson_count": 3,
        "concepts": 8,
        "estimate": "45m",
        "icon": "droplets",
        "accent": "from-[oklch(0.9_0.05_250)] to-[oklch(0.93_0.04_210)]",
        "glb_url": "/visceralsystem.glb",
        "isolate_nodes": ["Urinary system.g"],
        "lessons": [
            _lesson(
                "orientation",
                "01",
                "The kidneys",
                "16 min",
                "Beginner",
                "Paired retroperitoneal filters on the posterior abdominal wall.",
                ["Left kidney", "Right kidney", "Hilum", "Poles"],
                "Both kidneys sit against the posterior wall. The right is often a little lower because of the liver. Find "
                "superior and inferior poles, then the hilum facing medially.",
            ),
            _lesson(
                "ureters",
                "02",
                "Ureters and pelvis",
                "14 min",
                "Beginner",
                "Renal pelvis collecting urine into a ureter on each side.",
                ["Renal pelvis", "Ureter", "Course", "Bladder entry"],
                "Urine leaves the sinus as the renal pelvis, then a ureter. Follow each ureter down the posterior abdomen "
                "toward the bladder on the isolated model.",
            ),
            _lesson(
                "bladder",
                "03",
                "Bladder and urethra",
                "14 min",
                "Intermediate",
                "A storage organ that empties through the urethra.",
                ["Apex", "Body", "Fundus", "Urethra"],
                "The bladder sits in the pelvis. Apex, body and fundus are surface regions on this mesh. The urethra is the "
                "exit — much shorter in this male specimen than a ureter.",
            ),
        ],
    },
    {
        "id": "endocrine-system",
        "title": "Endocrine System",
        "description": "Find pituitary, thyroid, parathyroids and adrenals in the viscera model.",
        "category": "Systems",
        "difficulty": "Advanced",
        "lesson_count": 3,
        "concepts": 8,
        "estimate": "50m",
        "icon": "flask",
        "accent": "from-[oklch(0.9_0.05_120)] to-[oklch(0.93_0.04_230)]",
        "glb_url": "/visceralsystem.glb",
        "isolate_nodes": ["Endocrine glands.g"],
        "lessons": [
            _lesson(
                "orientation",
                "01",
                "Pituitary and pineal",
                "16 min",
                "Intermediate",
                "Midline glands of the cranial cavity.",
                ["Adenohypophysis", "Neurohypophysis", "Pineal gland"],
                "The hypophysis sits in the sella. Adenohypophysis and neurohypophysis are two parts of one gland. The pineal "
                "is a small midline body further back — zoom in on the isolated endocrine mesh.",
            ),
            _lesson(
                "neck",
                "02",
                "Thyroid and parathyroids",
                "16 min",
                "Beginner",
                "A large neck gland with four small parathyroid partners.",
                ["Thyroid", "Superior parathyroids", "Inferior parathyroids"],
                "The thyroid wraps the upper trachea. Parathyroids are tiny and posterior. Isolate the group and compare scale "
                "— thyroid is obvious, parathyroids are easy to miss.",
            ),
            _lesson(
                "adrenals",
                "03",
                "Suprarenal glands",
                "14 min",
                "Intermediate",
                "A gland capping each kidney.",
                ["Left suprarenal", "Right suprarenal", "Kidney relationship"],
                "Each adrenal sits on the superior pole of a kidney. They are endocrine, not urinary — this isolated view "
                "makes that separation clear.",
            ),
        ],
    },
    {
        "id": "reproductive-system",
        "title": "Reproductive System",
        "description": "Trace male genitalia isolated from the viscera model.",
        "category": "Systems",
        "difficulty": "Intermediate",
        "lesson_count": 3,
        "concepts": 8,
        "estimate": "45m",
        "icon": "scan",
        "accent": "from-[oklch(0.9_0.05_290)] to-[oklch(0.93_0.04_225)]",
        "glb_url": "/visceralsystem.glb",
        "isolate_nodes": ["Genital systems.g"],
        "lessons": [
            _lesson(
                "orientation",
                "01",
                "Testis and epididymis",
                "16 min",
                "Beginner",
                "Where sperm are made and first stored.",
                ["Testis", "Epididymis", "Scrotal position"],
                "The testis is the gonad. The epididymis sits along its posterior border. On this specimen they hang below "
                "the pelvis — orbit until both sides are obvious.",
            ),
            _lesson(
                "ducts",
                "02",
                "Ductus deferens and glands",
                "16 min",
                "Intermediate",
                "The path sperm take, plus prostate and seminal gland.",
                ["Ductus deferens", "Seminal gland", "Ejaculatory duct", "Prostate"],
                "Follow the ductus deferens toward the prostate. Seminal glands sit posterior. The prostate surrounds the "
                "proximal urethra. This isolated group hides neighbouring gut so the path is easier to read.",
            ),
            _lesson(
                "external",
                "03",
                "External genitalia",
                "14 min",
                "Beginner",
                "Penis as modelled: corpora and glans.",
                ["Corpus cavernosum", "Corpus spongiosum", "Glans"],
                "Two cavernosa and a spongiosum form the shaft; the glans is the distal expansion of the spongiosum. Relate "
                "this mesh back to the urethra you saw in the urinary system.",
            ),
        ],
    },
    {
        "id": "nervous-system",
        "title": "Nervous System",
        "description": "Trace brain, cord and peripheral nerves on the nervous-system model.",
        "category": "Systems",
        "difficulty": "Advanced",
        "lesson_count": 4,
        "concepts": 14,
        "estimate": "1h 35m",
        "icon": "brain",
        "accent": "from-[oklch(0.87_0.06_265)] to-[oklch(0.92_0.04_210)]",
        "glb_url": "/nervous_system.glb",
        "isolate_nodes": [],
        "lessons": [
            _lesson(
                "orientation",
                "01",
                "CNS and PNS",
                "18 min",
                "Beginner",
                "Brain and spinal cord versus the nerves that leave them.",
                ["Central nervous system", "Peripheral nervous system", "Cranial nerves", "Spinal nerves"],
                "The CNS is brain plus spinal cord. Everything else — cranial nerves, spinal nerves, ganglia — is PNS. "
                "On the model, start at the brain, follow the cord, then pick one spinal nerve out into the limb.",
            ),
            _lesson(
                "brain",
                "02",
                "Brain regions",
                "24 min",
                "Intermediate",
                "Cerebrum, cerebellum and brainstem as functional territories.",
                ["Cerebral hemispheres", "Cerebellum", "Brainstem", "Cortical maps"],
                "The cerebrum is the large folded mass for higher function. The cerebellum sits posterior and inferior, tuning "
                "movement. The brainstem is the stalk that continues as spinal cord. Locate each on the model before naming lobes.",
            ),
            _lesson(
                "cord",
                "03",
                "Spinal cord and pathways",
                "22 min",
                "Intermediate",
                "Segmental organisation and how sensory and motor information travel.",
                ["Spinal segments", "Dorsal vs ventral roots", "White and grey matter", "Tracts"],
                "Each cord segment gives off a pair of spinal nerves. Dorsal roots are sensory; ventral roots are motor. "
                "White matter carries tracts up and down; grey matter is the local processing core.",
            ),
            _lesson(
                "autonomic",
                "04",
                "Autonomic control",
                "22 min",
                "Advanced",
                "Sympathetic and parasympathetic outflow to viscera.",
                ["Sympathetic chain", "Parasympathetic outflow", "Visceral motor", "Homeostasis"],
                "Somatic nerves drive skeletal muscle on command. Autonomic nerves adjust heart, gut, glands and vessels "
                "without conscious effort. Relate this lesson back to the heart and viscera models — the same organs, different control.",
            ),
        ],
    },
    {
        "id": "mitochondria",
        "title": "Mitochondria",
        "description": "Inspect membranes, cristae, matrix and mitochondrial DNA on the organelle model.",
        "category": "Cells",
        "difficulty": "Intermediate",
        "lesson_count": 4,
        "concepts": 12,
        "estimate": "1h 10m",
        "icon": "atom",
        "accent": "from-[oklch(0.88_0.08_75)] to-[oklch(0.93_0.05_40)]",
        "glb_url": "/mitochondria_-_cell_organelles.glb",
        "isolate_nodes": [],
        "lessons": [
            _lesson(
                "orientation",
                "01",
                "Meet the mitochondrion",
                "16 min",
                "Beginner",
                "Shape, outer membrane and why eukaryotic cells keep so many of these organelles.",
                ["Outer membrane", "Double membrane", "Energy organelle", "Number per cell"],
                "Orbit the model until the bean-shaped shell is clear. The outer membrane faces the cytosol and is relatively "
                "porous. Cells with high ATP demand — muscle, neurons — pack mitochondria densely. Hide neighbouring granules "
                "if they crowd the outline, then compare this cutaway with a whole-cell view later.",
            ),
            _lesson(
                "cristae",
                "02",
                "Cristae and inner membrane",
                "20 min",
                "Intermediate",
                "Why the inner membrane folds, and where the electron-transport chain sits.",
                ["Inner membrane", "Cristae", "Surface area", "Electron-transport chain"],
                "Select the cristae. Folding multiplies membrane area so more ATP synthase and respiratory complexes can fit. "
                "The inner membrane is far less leaky than the outer one — that tightness is what lets a proton gradient form. "
                "Rotate until a single fold stands away from the shell.",
            ),
            _lesson(
                "matrix",
                "03",
                "Matrix reactions",
                "18 min",
                "Intermediate",
                "The inner compartment where the citric-acid cycle runs.",
                ["Matrix", "Citric-acid cycle", "Enzymes", "Pyruvate oxidation"],
                "The matrix is the space enclosed by the inner membrane. Pyruvate, fatty acids and amino acids are oxidised here; "
                "NADH and FADH2 then feed the inner-membrane chain. Select the matrix and hide the shell briefly so the volume "
                "is obvious, then show the shell again to restore context.",
            ),
            _lesson(
                "genome",
                "04",
                "mtDNA and granules",
                "16 min",
                "Advanced",
                "Mitochondrial DNA loops and the dense granules stored in the matrix.",
                ["Mitochondrial DNA", "Granules", "Endosymbiosis", "Maternal inheritance"],
                "Find the DNA strands inside the matrix — circular genomes left from a bacterial ancestor. Granules store ions "
                "and proteins. Mitochondria encode only a handful of their own proteins; most subunits are imported from the "
                "nucleus. Ask the tutor to focus each DNA loop, then the granules.",
            ),
        ],
    },
    {
        "id": "plant-cell",
        "title": "Plant Cell",
        "description": "Compare wall, chloroplasts, vacuole and endomembrane organelles on the plant-cell model.",
        "category": "Cells",
        "difficulty": "Beginner",
        "lesson_count": 4,
        "concepts": 14,
        "estimate": "1h 15m",
        "icon": "leaf",
        "accent": "from-[oklch(0.88_0.08_145)] to-[oklch(0.93_0.04_110)]",
        "glb_url": "/plant_cell_-_cell_structure.glb",
        "isolate_nodes": [],
        "lessons": [
            _lesson(
                "orientation",
                "01",
                "Wall, membrane and layout",
                "18 min",
                "Beginner",
                "How a plant cell is boxed by a wall, then organised inside the cytoplasm.",
                ["Cell wall", "Plasma membrane", "Cytoplasm", "Plant vs animal"],
                "Start with the cell wall — the rigid outer box animal cells lack. The plasma membrane lines it. Cytoplasm fills "
                "the interior around organelles. Orbit until wall, cytoplasm and the large vacuole read as nested compartments, "
                "not a single blob.",
            ),
            _lesson(
                "energy",
                "02",
                "Chloroplasts and mitochondria",
                "20 min",
                "Beginner",
                "Photosynthesis and respiration as two energy organelles in the same cell.",
                ["Chloroplast", "Thylakoids", "Mitochondria", "ATP and sugars"],
                "Select a chloroplast: inner and outer regions mark the double membrane. Light reactions live in thylakoid "
                "membranes; the sugars they make are oxidised in mitochondria. A plant cell needs both. Hide the wall if it "
                "blocks the view, then show it again so you do not lose the cell boundary.",
            ),
            _lesson(
                "endomembrane",
                "03",
                "Nucleus and endomembrane",
                "22 min",
                "Intermediate",
                "Nucleus, ER, Golgi and how proteins move through the system.",
                ["Nucleus", "Rough ER", "Smooth ER", "Golgi apparatus"],
                "The nucleus holds the genome. Rough ER is studded with ribosomes and makes membrane and secreted proteins; "
                "smooth ER handles lipids. Vesicles carry cargo to the Golgi apparatus for sorting. Trace nucleus → rough ER → "
                "Golgi on the model before naming enzymes.",
            ),
            _lesson(
                "connections",
                "04",
                "Vacuole, peroxisomes and plasmodesmata",
                "16 min",
                "Intermediate",
                "Storage, detox and the channels that link neighbouring plant cells.",
                ["Vacuole", "Peroxisome", "Lysosome", "Plasmodesma"],
                "The central vacuole stores water and solutes and keeps turgor. Peroxisomes handle oxidative reactions; lysosomes "
                "digest. Plasmodesmata are cytoplasmic channels through the wall — select one and relate it to how plant tissues "
                "share signals without gap junctions.",
            ),
        ],
    },
    {
        "id": "animal-cell",
        "title": "Animal Cell",
        "description": "Tour membrane, nucleus, endomembrane system and energy organelles on the animal-cell model.",
        "category": "Cells",
        "difficulty": "Beginner",
        "lesson_count": 4,
        "concepts": 14,
        "estimate": "1h 20m",
        "icon": "microscope",
        "accent": "from-[oklch(0.88_0.06_250)] to-[oklch(0.93_0.04_200)]",
        "glb_url": "/animal_cell_2.0_-_annotated_in_english.glb",
        "isolate_nodes": [],
        "lessons": [
            _lesson(
                "orientation",
                "01",
                "Membrane and cytoplasm",
                "16 min",
                "Beginner",
                "An animal cell has a plasma membrane and cytosol, but no cellulose wall.",
                ["Plasma membrane", "Cytoplasm", "No cell wall", "Organelle crowding"],
                "Select the plasma membrane — the outer boundary. Cytoplasm fills the interior. Unlike the plant-cell module, "
                "there is no rigid wall, so shape is set by the cytoskeleton and junctions. Orbit the cutaway until membrane "
                "versus interior organelles are obvious.",
            ),
            _lesson(
                "nucleus",
                "02",
                "Nucleus and nucleolus",
                "20 min",
                "Beginner",
                "The nuclear envelope, the nucleoplasm and the nucleolus that assembles ribosomes.",
                ["Nucleus", "Nuclear envelope", "Nucleolus", "Chromatin"],
                "Find the nucleus, then the nucleolus inside it. The nuclear envelope is a double membrane with pores. rRNA is "
                "made in the nucleolus and shipped out to build ribosomes. Hide cytoplasm if the envelope is hard to see, then "
                "restore it so the nucleus stays in cellular context.",
            ),
            _lesson(
                "endomembrane",
                "03",
                "ER, Golgi and vesicles",
                "22 min",
                "Intermediate",
                "The endomembrane highway from synthesis to secretion.",
                ["Rough ER", "Smooth ER", "Golgi apparatus", "Vesicles"],
                "Rough ER makes proteins for membranes and export; smooth ER makes lipids. The Golgi stacks modify and sort "
                "cargo into secretory vesicles, endosomes and lysosomes. Click each compartment in order: rough ER, Golgi, "
                "then a vesicle. Ask the tutor to hide neighbours if the stack is crowded.",
            ),
            _lesson(
                "power",
                "04",
                "Energy, recycling and protein synthesis",
                "22 min",
                "Intermediate",
                "Mitochondria, lysosomes, peroxisomes, centrioles and ribosomes working together.",
                ["Mitochondrion", "Lysosome", "Peroxisome", "Ribosomes", "Centrosome"],
                "Mitochondria supply ATP. Lysosomes digest; peroxisomes detoxify. Ribosomes are the small dots that read mRNA — "
                "select Ribosomes to highlight the set. The centrosome and centrioles organise microtubules for mitosis. "
                "Compare this layout with the plant-cell module: same core organelles, no chloroplast or wall.",
            ),
        ],
    },
]


def get_module(module_id: str) -> dict | None:
    return next((item for item in MODULES if item["id"] == module_id), None)


def get_lesson(module_id: str, lesson_id: str) -> tuple[dict, dict] | None:
    module = get_module(module_id)
    if not module:
        return None
    lesson = next((item for item in module["lessons"] if item["id"] == lesson_id), None)
    if not lesson:
        return None
    return module, lesson


def module_summary(module: dict) -> dict:
    return {key: value for key, value in module.items() if key != "lessons"}
